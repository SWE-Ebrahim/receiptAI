/**
 * Scan Controller
 *
 * Endpoints:
 *  POST /api/scan/image          - Upload receipt image (metadata only)
 *  POST /api/scan/ocr-fallback   - Server-side OCR via ocr.space (free tier)
 *  POST /api/scan/validate       - Validate extracted receipt data
 *  GET  /api/scan/categories     - Return available categories
 *
 * Server-side OCR is only called when client Tesseract confidence < 60%.
 * ocr.space free tier: 25,000 requests/month, no credit card needed.
 * Sign up at: https://ocr.space/ocrapi (get a free API key)
 * Add OCR_SPACE_API_KEY=your_key to your .env file.
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { extractAmountWithCurrency, convertToAED } = require('../utils/currencyConverter');

const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || 'helloworld'; // 'helloworld' is a public test key (limited)
const OCR_SPACE_URL = 'https://api.ocr.space/parse/image';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Parse raw OCR text into structured receipt data.
 * Same logic as client-side but running on the server.
 */
function parseReceiptText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract amount with currency detection
  const amountData = extractAmountWithCurrency(text);

  return {
    merchant: extractMerchant(lines),
    date: extractDate(lines),
    amount: amountData.amount,
    detectedCurrency: amountData.currency,
    tax: extractTax(lines),
    items: extractItems(lines),
    category: null, // categorization done client-side
  };
}

function isTotalLine(line) {
  const l = line.toLowerCase();
  return ['total','subtotal','tax','vat','gst','amount','balance','due',
    'change','cash','card','payment','thank','welcome','receipt',
    'invoice','order','table','bill','مجموع','ضريبة'].some(k => l.includes(k));
}

function isDate(line) {
  return /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(line) ||
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(line);
}

function isAmount(line) {
  return /\$?€?£?\s*[\d,]+\.\d{2}/.test(line);
}

function extractMerchant(lines) {
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i];
    if (isDate(line) || isAmount(line) || line.length < 2 || line.length > 60) continue;
    if (/^\d+$/.test(line)) continue;
    const cleaned = line.replace(/[^\w\s]/g, '').trim();
    if (cleaned.length >= 2 && !/^\d+$/.test(cleaned)) return cleaned.toUpperCase();
  }
  return 'Unknown Merchant';
}

function extractDate(lines) {
  const patterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\.]+(\d{1,2}),?\s+(\d{4})/i,
  ];
  for (const line of lines) {
    for (const pat of patterns) {
      const m = line.match(pat);
      if (m) {
        try {
          const d = new Date(m[0]);
          if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
        } catch (_) {}
        return m[0];
      }
    }
  }
  return new Date().toISOString().split('T')[0];
}

function extractAmount(lines) {
  const patterns = [
    /(?:total|amount|balance|due|المجموع)[:\s]*\$?€?£?ر\.س?([\d,]+\.\d{2})/i,
    /(?:SAR|USD|EUR|GBP|AED)\s*([\d,]+\.\d{2})/i,
    /([\d,]+\.\d{2})\s*(?:total|amount|due)?$/i,
  ];
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 15); i--) {
    for (const pat of patterns) {
      const m = lines[i].match(pat);
      if (m) {
        const v = parseFloat(m[1].replace(/,/g, ''));
        if (v > 0) return v;
      }
    }
  }
  // Fallback
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(/\$?€?£?ر\.س?\s*([\d,]+\.\d{2})/);
    if (m) {
      const v = parseFloat(m[1].replace(/,/g, ''));
      if (v > 10) return v;
    }
  }
  return 0;
}

function extractTax(lines) {
  for (const line of lines) {
    const m = line.match(/(?:tax|vat|gst|ضريبة)[:\s]*\$?€?£?ر\.س?([\d,]+\.\d{2})/i);
    if (m) return parseFloat(m[1].replace(/,/g, ''));
  }
  return null;
}

function extractItems(lines) {
  const items = [];
  for (const line of lines) {
    if (isTotalLine(line) || isDate(line) || line.length < 5) continue;
    const qm = line.match(/^(\d+)\s*[xX×]\s*(.+?)\s+\$?€?£?\s*([\d,]+\.\d{2})$/);
    if (qm) {
      items.push({ name: qm[2].trim(), quantity: parseInt(qm[1]), price: parseFloat(qm[3].replace(/,/g, '')) });
      continue;
    }
    const dm = line.match(/^(.+?)\s+\$?€?£?\s*([\d,]+\.\d{2})$/);
    if (dm && !isTotalLine(dm[1])) {
      items.push({ name: dm[1].trim(), quantity: 1, price: parseFloat(dm[2].replace(/,/g, '')) });
    }
  }
  return items;
}

function buildConfidence(parsed) {
  let conf = 0.75; // server OCR generally better baseline
  if (parsed.amount === 0) conf -= 0.2;
  if (parsed.merchant === 'Unknown Merchant') conf -= 0.15;
  return Math.max(0.2, Math.min(1.0, conf));
}

// ─────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────

/**
 * @desc    Upload receipt image (storage/metadata only, OCR done client-side)
 * @route   POST /api/scan/image
 */
exports.processReceiptImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { originalname: fileName, size: fileSize, path: imagePath } = req.file;

    try { fs.unlinkSync(imagePath); } catch (_) {}

    console.log('📸 Image upload acknowledged:', fileName);

    res.json({
      success: true,
      message: 'Image uploaded. OCR processing is done client-side.',
      data: { fileName, fileSize },
    });
  } catch (error) {
    if (req.file?.path) try { fs.unlinkSync(req.file.path); } catch (_) {}
    console.error('❌ Image upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};

/**
 * @desc    Server-side OCR fallback using ocr.space (triggered when Tesseract confidence < 60%)
 * @route   POST /api/scan/ocr-fallback
 * @access  Private
 *
 * Setup:
 *   1. Get a free API key from https://ocr.space/ocrapi
 *   2. Add OCR_SPACE_API_KEY=your_key to .env
 *   3. npm install node-fetch form-data
 */
exports.ocrFallback = async (req, res) => {
  let imagePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    imagePath = req.file.path;
    console.log('🖥️ Server OCR fallback triggered for:', req.file.originalname);

    // Read file as buffer for reliable upload
    const fileBuffer = fs.readFileSync(imagePath);

    // Build multipart form for ocr.space
    const form = new FormData();
    form.append('file', fileBuffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    form.append('apikey', OCR_SPACE_API_KEY);
    form.append('language', 'eng');
    form.append('isOverlayRequired', 'false');
    form.append('detectOrientation', 'true');
    form.append('scale', 'true');
    form.append('isTable', 'true');
    form.append('OCREngine', '2');

    console.log('📤 Sending request to ocr.space...');

    // Call ocr.space using fetch with form-data
    const ocrRes = await fetch(OCR_SPACE_URL, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form,
    });

    if (!ocrRes.ok) {
      throw new Error(`ocr.space returned HTTP ${ocrRes.status}`);
    }

    const ocrJson = await ocrRes.json();

    // Clean up uploaded file
    try { fs.unlinkSync(imagePath); } catch (_) {}
    imagePath = null;

    // Handle ocr.space error response
    if (ocrJson.IsErroredOnProcessing) {
      const errMsg = ocrJson.ErrorMessage?.[0] || 'ocr.space processing error';
      console.error('ocr.space error:', errMsg);
      return res.status(422).json({ success: false, message: errMsg });
    }

    // Extract raw text from all pages
    const rawText = (ocrJson.ParsedResults || [])
      .map(r => r.ParsedText || '')
      .join('\n');

    if (!rawText.trim()) {
      return res.status(422).json({ success: false, message: 'OCR returned no text — image may be too blurry' });
    }

    console.log('📄 Server OCR raw text:', rawText.substring(0, 200));

    // Parse into structured data
    const parsed = parseReceiptText(rawText);
    const conf = buildConfidence(parsed);

    const warnings = [];
    if (parsed.amount === 0) warnings.push({ type: 'error', field: 'amount', message: 'Amount not detected — enter manually' });
    if (parsed.merchant === 'Unknown Merchant') warnings.push({ type: 'warning', field: 'merchant', message: 'Merchant not detected clearly' });

    res.json({
      success: true,
      data: {
        ...parsed,
        confidence: { merchant: conf, date: conf, amount: conf, overall: conf },
        qualityScore: conf,
        source: 'server',
        warnings,
      },
    });
  } catch (error) {
    if (imagePath) try { fs.unlinkSync(imagePath); } catch (_) {}
    console.error('❌ Server OCR fallback error:', error);
    res.status(500).json({ success: false, message: 'Server OCR failed', error: error.message });
  }
};

/**
 * @desc    Validate extracted receipt data
 * @route   POST /api/scan/validate
 */
exports.validateImageData = async (req, res) => {
  try {
    const { merchant, date, amount, category } = req.body;
    const errors = [];
    const warnings = [];

    if (!merchant || merchant.trim().length < 2) {
      errors.push({ type: 'error', field: 'merchant', message: 'Merchant name required (min 2 chars)' });
    }
    if (!date) {
      errors.push({ type: 'error', field: 'date', message: 'Receipt date is required' });
    } else if (isNaN(new Date(date).getTime())) {
      errors.push({ type: 'error', field: 'date', message: 'Invalid date format' });
    }
    if (!amount || amount <= 0) {
      errors.push({ type: 'error', field: 'amount', message: 'Valid amount required (> 0)' });
    }
    if (!category || category === 'Other') {
      warnings.push({ type: 'warning', field: 'category', message: 'Category not specified — defaults to "Other"' });
    }

    res.json({ success: true, isValid: errors.length === 0, errors, warnings });
  } catch (error) {
    console.error('❌ Validation error:', error);
    res.status(500).json({ success: false, message: 'Validation failed', error: error.message });
  }
};

/**
 * @desc    Get available receipt categories for authenticated user
 * @route   GET /api/scan/categories
 * @access  Private
 */
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { supabaseAdmin: supabase } = require('../config/supabase');

    console.log('📂 Fetching categories for user:', userId);

    // Fetch user's custom categories from database
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, icon, color')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }

    console.log(`✅ Found ${categories?.length || 0} categories for user`);

    // If no custom categories, return default ones
    if (!categories || categories.length === 0) {
      console.log('ℹ️ No custom categories found, returning defaults');
      const defaultCategories = [
        { id: 'food_drink',    name: 'Food & Drink',   icon: 'restaurant',       color: '#FF6B6B' },
        { id: 'groceries',     name: 'Groceries',       icon: 'shopping_cart',    color: '#4ECDC4' },
        { id: 'transport',     name: 'Transport',       icon: 'directions_car',   color: '#45B7D1' },
        { id: 'shopping',      name: 'Shopping',        icon: 'shopping_bag',     color: '#96CEB4' },
        { id: 'utilities',     name: 'Utilities',       icon: 'home',             color: '#FFEAA7' },
        { id: 'healthcare',    name: 'Healthcare',      icon: 'medical_services', color: '#DDA0DD' },
        { id: 'entertainment', name: 'Entertainment',   icon: 'movie',            color: '#FFB6C1' },
        { id: 'other',         name: 'Other',           icon: 'category',         color: '#95A5A6' },
      ];
      return res.json({ success: true, data: defaultCategories });
    }

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('❌ Categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to get categories', error: error.message });
  }
};
