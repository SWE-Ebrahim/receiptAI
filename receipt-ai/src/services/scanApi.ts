/**
 * Scan API Service
 *
 * Flow:
 * 1. If PDF → pdfProcessor converts page to image blob
 * 2. Client runs enhanced Tesseract OCR (preprocessImage → Tesseract)
 * 3. If Tesseract rawConfidence < FALLBACK_THRESHOLD → send image to backend OCR fallback
 * 4. Backend uses ocr.space free API and returns better result
 * 5. Merge / pick best result and return to UI
 */

import { extractReceiptData } from './tesseractOcr';
import { extractPdfPages, type PdfPage } from './pdfProcessor';

// ─── Config ──────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const FALLBACK_THRESHOLD = 60; // rawConfidence below this triggers server fallback

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReceiptExtractionData {
  merchant: string;
  date: string; // Receipt date (YYYY-MM-DD)
  time?: string; // Receipt time (HH:mm) - optional
  amount: number;
  detectedCurrency?: string; // Currency detected from OCR (e.g., 'USD', 'EUR')
  tax?: number | null;
  items: Array<{ name: string; quantity: number; price: number }>;
  category?: string | null;
  confidence: {
    merchant: number;
    date: number;
    amount: number;
    overall: number;
  };
  qualityScore?: number;
  rawConfidence?: number;
  warnings?: ValidationError[];
  source?: 'tesseract' | 'server'; // which OCR produced this result
  generatedDate?: string; // When receipt was scanned (auto-set)
  generatedTime?: string; // When receipt was scanned (auto-set)
}

export interface ValidationError {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface PdfProcessProgress {
  stage: 'converting' | 'ocr' | 'fallback' | 'done';
  currentPage: number;
  totalPages: number;
  ocrProgress?: number; // 0-100
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Send an image File to the backend OCR fallback endpoint.
 * Backend calls ocr.space and returns parsed receipt data.
 */
async function serverOcrFallback(imageFile: File): Promise<ReceiptExtractionData | null> {
  try {
    const formData = new FormData();
    formData.append('receipt', imageFile);

    const res = await fetch(`${API_BASE}/scan/ocr-fallback`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });

    if (!res.ok) {
      console.warn(`Server OCR fallback returned ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (!json.success || !json.data) return null;

    return { ...json.data, source: 'server' as const };
  } catch (err) {
    console.warn('Server OCR fallback failed (network/parse error):', err);
    return null;
  }
}

/**
 * Run Tesseract on an image file, then optionally trigger server fallback.
 */
async function runOcr(
  imageFile: File,
  onProgress?: (p: number) => void,
  onFallback?: () => void
): Promise<ReceiptExtractionData> {
  // Client-side Tesseract
  const tesseractResult = await extractReceiptData(imageFile, onProgress);
  const resultWithSource: ReceiptExtractionData = {
    ...tesseractResult,
    source: 'tesseract' as const,
  };

  const rawConf = tesseractResult.rawConfidence ?? 0;
  console.log(`Tesseract rawConfidence: ${rawConf}%`);

  // If confidence is good enough, return Tesseract result directly
  if (rawConf >= FALLBACK_THRESHOLD) {
    return resultWithSource;
  }

  // Low confidence → try server fallback
  console.log(`⚠️ Low confidence (${rawConf}%) — triggering server OCR fallback...`);
  onFallback?.();

  const serverResult = await serverOcrFallback(imageFile);

  if (!serverResult) {
    console.log('Server fallback unavailable, using Tesseract result');
    // Add a warning about low confidence
    tesseractResult.warnings = [
      ...(tesseractResult.warnings ?? []),
      {
        type: 'warning',
        field: 'overall',
        message: `Low OCR confidence (${rawConf}%). Server fallback unavailable — please verify all fields.`,
      },
    ];
    return tesseractResult;
  }

  // Server result came back — merge: prefer server data but keep Tesseract items if server has none
  return {
    ...serverResult,
    items: serverResult.items?.length ? serverResult.items : tesseractResult.items,
    warnings: [
      ...(serverResult.warnings ?? []),
      {
        type: 'info',
        field: 'overall',
        message: 'Enhanced with server OCR (low initial confidence)',
      },
    ],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const scanApi = {
  /**
   * Process a receipt image (JPEG/PNG).
   * Runs Tesseract → server fallback if confidence is low.
   */
  uploadImage: async (
    imageFile: File,
    onProgress?: (p: number) => void,
    onFallback?: () => void
  ): Promise<ReceiptExtractionData> => {
    return runOcr(imageFile, onProgress, onFallback);
  },

  /**
   * Process a PDF receipt.
   * Converts pages to images via pdfjs-dist, then runs OCR on each page.
   * Returns an array (one result per page processed).
   */
  uploadPDF: async (
    pdfFile: File,
    options?: {
      maxPages?: number;
      specificPages?: number[];
      onProgress?: (p: PdfProcessProgress) => void;
      onFallback?: () => void;
    }
  ): Promise<ReceiptExtractionData[]> => {
    const { maxPages = 3, specificPages, onProgress, onFallback } = options ?? {};

    // Step 1: Convert PDF pages to images
    console.log('📄 Converting PDF pages to images...');
    onProgress?.({ stage: 'converting', currentPage: 0, totalPages: 0 });

    const pages: PdfPage[] = await extractPdfPages(pdfFile, {
      maxPages,
      pages: specificPages,
      scale: 2.5,
      quality: 0.95,
      onProgress: (current: number, total: number) => {
        onProgress?.({ stage: 'converting', currentPage: current, totalPages: total });
      },
    });

    // Step 2: Run OCR on each page
    const results: ReceiptExtractionData[] = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      console.log(`🔍 OCR on page ${page.pageNumber}/${page.totalPages}...`);

      onProgress?.({
        stage: 'ocr',
        currentPage: i + 1,
        totalPages: pages.length,
        ocrProgress: 0,
      });

      const result = await runOcr(
        page.blob,
        (ocrProgress) => {
          onProgress?.({
            stage: 'ocr',
            currentPage: i + 1,
            totalPages: pages.length,
            ocrProgress,
          });
        },
        () => {
          onProgress?.({ stage: 'fallback', currentPage: i + 1, totalPages: pages.length });
          onFallback?.();
        }
      );

      results.push(result);
    }

    onProgress?.({ stage: 'done', currentPage: pages.length, totalPages: pages.length });
    return results;
  },

  /**
   * Process a single PDF page (most common case for receipts).
   */
  uploadPDFFirstPage: async (
    pdfFile: File,
    onProgress?: (p: PdfProcessProgress) => void,
    onFallback?: () => void
  ): Promise<ReceiptExtractionData> => {
    const results = await scanApi.uploadPDF(pdfFile, {
      maxPages: 1,
      onProgress,
      onFallback,
    });
    if (!results[0]) throw new Error('No pages could be processed');
    return results[0];
  },

  /**
   * Client-side validation of extracted data.
   */
  validateData: async (
    data: Partial<ReceiptExtractionData>
  ): Promise<{ isValid: boolean; errors: ValidationError[]; warnings: ValidationError[] }> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!data.merchant || data.merchant.trim().length < 2) {
      errors.push({ type: 'error', field: 'merchant', message: 'Merchant name is required (min 2 chars)' });
    }
    if (!data.date) {
      errors.push({ type: 'error', field: 'date', message: 'Receipt date is required' });
    } else if (isNaN(new Date(data.date).getTime())) {
      errors.push({ type: 'error', field: 'date', message: 'Invalid date format' });
    }
    if (!data.amount || data.amount <= 0) {
      errors.push({ type: 'error', field: 'amount', message: 'Valid amount required (> 0)' });
    }
    if (!data.category) {
      warnings.push({ type: 'warning', field: 'category', message: 'Category not specified' });
    }

    return { isValid: errors.length === 0, errors, warnings };
  },

  /**
   * Get available categories (backend with local fallback).
   */
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await fetch(`${API_BASE}/scan/categories`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data ?? getDefaultCategories();
    } catch {
      return getDefaultCategories();
    }
  },

  /**
   * Get all receipts (history)
   */
  getHistory: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/receipts/history?duration=all`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const data = json.data ?? [];
      console.log('📊 History data received:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch history:', error);
      return [];
    }
  },

  /**
   * Delete all receipts for current user
   */
  deleteAllReceipts: async (): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/receipts/delete-all`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to delete receipts`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Failed to delete receipts');
      }
      return json.data;
    } catch (error) {
      console.error('❌ Delete all receipts error:', error);
      throw error;
    }
  },

  /**
   * Save receipt to database
   */
  saveReceipt: async (data: {
    fileUrl: string;
    fileType: string;
    extractedData: {
      merchantName?: string;
      date?: string;
      amount?: number;
    };
    items?: Array<{ name: string; quantity: number; price: number }>;
    tax?: number;
    category?: string;
    notes?: string;
  }): Promise<any> => {
    try {
      console.log('💾 Sending receipt to backend:', data);
      
      const res = await fetch(`${API_BASE}/receipts/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to save receipt`);
      }

      const json = await res.json();
      
      if (!json.success) {
        throw new Error(json.message || 'Failed to save receipt');
      }

      console.log('✅ Receipt saved to database:', json.data);
      return json.data;
    } catch (error) {
      console.error('❌ Save receipt error:', error);
      throw error;
    }
  },
};

function getDefaultCategories(): Category[] {
  return [
    { id: 'food_drink',     name: 'Food & Drink',   icon: 'restaurant',       color: '#FF6B6B' },
    { id: 'groceries',      name: 'Groceries',       icon: 'shopping_cart',    color: '#4ECDC4' },
    { id: 'transport',      name: 'Transport',       icon: 'directions_car',   color: '#45B7D1' },
    { id: 'shopping',       name: 'Shopping',        icon: 'shopping_bag',     color: '#96CEB4' },
    { id: 'utilities',      name: 'Utilities',       icon: 'home',             color: '#FFEAA7' },
    { id: 'healthcare',     name: 'Healthcare',      icon: 'medical_services', color: '#DDA0DD' },
    { id: 'entertainment',  name: 'Entertainment',   icon: 'movie',            color: '#FFB6C1' },
    { id: 'other',          name: 'Other',           icon: 'category',         color: '#95A5A6' },
  ];
}
