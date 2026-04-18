/**
 * Enhanced Tesseract OCR Service
 *
 * Improvements over the original:
 * - Adaptive thresholding (vs fixed 128 threshold)
 * - Auto-upscaling for small/low-res images
 * - Deskewing (straightens tilted receipts)
 * - Contrast enhancement before binarization
 * - Confidence-based fallback flag
 */

import Tesseract from 'tesseract.js';

export interface ReceiptExtractionData {
  merchant: string;
  date: string;
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
  rawConfidence?: number; // 0–100 from Tesseract, used to trigger server fallback
  warnings?: Array<{ type: 'error' | 'warning' | 'info'; field: string; message: string }>;
}

// ─────────────────────────────────────────────
// IMAGE PREPROCESSING
// ─────────────────────────────────────────────

/**
 * Step 1: Upscale image if it's too small (Tesseract works best at ~300 DPI)
 */
function upscaleIfNeeded(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement
): void {
  const MIN_DIM = 1200; // minimum pixel dimension for good OCR
  const scale = img.width < MIN_DIM || img.height < MIN_DIM
    ? Math.max(MIN_DIM / img.width, MIN_DIM / img.height)
    : 1;

  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  // Use high-quality upscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

/**
 * Step 2: Convert to grayscale + enhance contrast (CLAHE-lite)
 */
function grayscaleAndEnhance(imageData: ImageData): void {
  const data = imageData.data;
  const len = data.length;

  // Pass 1: convert to grayscale and collect histogram
  const histogram = new Uint32Array(256);
  for (let i = 0; i < len; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = data[i + 1] = data[i + 2] = gray;
    histogram[gray]++;
  }

  // Build CDF for histogram equalization
  const totalPixels = len / 4;
  const cdf = new Uint8Array(256);
  let cumSum = 0;
  for (let v = 0; v < 256; v++) {
    cumSum += histogram[v];
    cdf[v] = Math.round((cumSum / totalPixels) * 255);
  }

  // Pass 2: apply equalization
  for (let i = 0; i < len; i += 4) {
    const eq = cdf[data[i]];
    data[i] = data[i + 1] = data[i + 2] = eq;
  }
}

/**
 * Step 3: Adaptive (local) thresholding — far better than fixed 128
 * Uses a sliding window mean to pick per-region thresholds.
 */
function adaptiveThreshold(imageData: ImageData, blockSize: number = 15, C: number = 10): void {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const half = Math.floor(blockSize / 2);

  // Build integral image for fast area sums
  const integral = new Float64Array((width + 1) * (height + 1));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = data[(y * width + x) * 4]; // already grayscale
      integral[(y + 1) * (width + 1) + (x + 1)] =
        px +
        integral[y * (width + 1) + (x + 1)] +
        integral[(y + 1) * (width + 1) + x] -
        integral[y * (width + 1) + x];
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - half);
      const y1 = Math.max(0, y - half);
      const x2 = Math.min(width - 1, x + half);
      const y2 = Math.min(height - 1, y + half);

      const count = (x2 - x1 + 1) * (y2 - y1 + 1);
      const sum =
        integral[(y2 + 1) * (width + 1) + (x2 + 1)] -
        integral[y1 * (width + 1) + (x2 + 1)] -
        integral[(y2 + 1) * (width + 1) + x1] +
        integral[y1 * (width + 1) + x1];

      const mean = sum / count;
      const idx = (y * width + x) * 4;
      const val = data[idx] < mean - C ? 0 : 255;
      data[idx] = data[idx + 1] = data[idx + 2] = val;
    }
  }
}

/**
 * Step 4: Deskew — detect dominant angle and rotate to straighten text
 * Uses a simplified Hough-like projection score approach.
 */
async function deskew(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Collect binary edge pixels
  const points: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      if (data[(y * width + x) * 4] === 0) { // black pixel
        points.push({ x, y });
      }
    }
  }

  if (points.length < 100) return; // not enough data to deskew

  // Test angles from -15° to +15°
  let bestAngle = 0;
  let bestScore = -Infinity;

  for (let angleDeg = -15; angleDeg <= 15; angleDeg += 0.5) {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Project points onto horizontal axis and score alignment
    const rowBuckets: Record<number, number> = {};
    for (const p of points) {
      const rotY = Math.round(-p.x * sin + p.y * cos);
      rowBuckets[rotY] = (rowBuckets[rotY] || 0) + 1;
    }

    // Score = variance of row counts (high variance = better alignment)
    const counts = Object.values(rowBuckets);
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((a, b) => a + (b - mean) ** 2, 0) / counts.length;

    if (variance > bestScore) {
      bestScore = variance;
      bestAngle = angleDeg;
    }
  }

  // Only rotate if angle is significant
  if (Math.abs(bestAngle) < 0.3) return;

  const rad = (bestAngle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  const newWidth = Math.round(canvas.width * cos + canvas.height * sin);
  const newHeight = Math.round(canvas.height * cos + canvas.width * sin);

  // Draw rotated image into a temp canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = newWidth;
  tempCanvas.height = newHeight;
  const tempCtx = tempCanvas.getContext('2d')!;

  tempCtx.fillStyle = '#ffffff';
  tempCtx.fillRect(0, 0, newWidth, newHeight);
  tempCtx.save();
  tempCtx.translate(newWidth / 2, newHeight / 2);
  tempCtx.rotate((bestAngle * Math.PI) / 180);
  tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  tempCtx.restore();

  // Replace original canvas content
  canvas.width = newWidth;
  canvas.height = newHeight;
  ctx.drawImage(tempCanvas, 0, 0);
}

/**
 * Full preprocessing pipeline:
 * upscale → grayscale+contrast → adaptive threshold → deskew
 */
export async function preprocessImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return reject(new Error('Canvas context unavailable'));

    img.onload = async () => {
      try {
        // Step 1: Upscale
        upscaleIfNeeded(ctx, canvas, img);

        // Step 2: Grayscale + contrast enhancement
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        grayscaleAndEnhance(imageData);
        ctx.putImageData(imageData, 0, 0);

        // Step 3: Adaptive threshold
        const imageData2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
        adaptiveThreshold(imageData2, 21, 8);
        ctx.putImageData(imageData2, 0, 0);

        // Step 4: Deskew
        await deskew(canvas, ctx);

        canvas.toBlob((blob) => {
          if (blob) resolve(URL.createObjectURL(blob));
          else reject(new Error('Blob creation failed'));
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(imageFile);
  });
}

// ─────────────────────────────────────────────
// RECEIPT TEXT PARSING - INTELLIGENT ANALYSIS
// Strategy: Analyze structure → Classify sections → Extract with context
// ─────────────────────────────────────────────

type LineType = 'header' | 'merchant' | 'date' | 'time' | 'item' | 'subtotal' | 'tax' | 'total' | 'payment' | 'footer' | 'noise';

interface AnalyzedLine {
  text: string;
  type: LineType;
  confidence: number;
  index: number;
}

// Step 1: Classify each line's role in the receipt
function classifyLine(line: string, index: number, totalLines: number): { type: LineType; confidence: number } {
  const trimmed = line.trim();
  if (!trimmed) return { type: 'noise', confidence: 1.0 };
  
  const lower = trimmed.toLowerCase();
  
  // Header/Footer: generic receipt text at start/end
  if (index < 3 && /receipt|invoice|copy|original/i.test(lower)) {
    return { type: 'header', confidence: 0.9 };
  }
  if (index > totalLines - 4 && /thank|welcome|visit|again/i.test(lower)) {
    return { type: 'footer', confidence: 0.9 };
  }
  
  // Date patterns (high confidence)
  if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(trimmed)) {
    return { type: 'date', confidence: 0.95 };
  }
  if (/(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(lower)) {
    return { type: 'date', confidence: 0.9 };
  }
  
  // Time patterns
  if (/\d{1,2}:\d{2}(:\d{2})?\s*(am|pm|AM|PM)?/.test(trimmed)) {
    return { type: 'time', confidence: 0.9 };
  }
  
  // Total line (look for total keyword + amount)
  if (/\b(total|amount|balance|due|المجموع)\b/i.test(lower)) {
    if (/\d+\.\d{2}/.test(trimmed)) {
      return { type: 'total', confidence: 0.95 };
    }
  }
  
  // Subtotal
  if (/\b(subtotal|sub[- ]?total)\b/i.test(lower)) {
    return { type: 'subtotal', confidence: 0.9 };
  }
  
  // Tax/VAT
  if (/\b(tax|vat|gst|ضريبة)\b/i.test(lower)) {
    if (/\d+\.\d{2}/.test(trimmed)) {
      return { type: 'tax', confidence: 0.9 };
    }
  }
  
  // Payment method
  if (/\b(cash|card|credit|debit|visa|mastercard)\b/i.test(lower)) {
    return { type: 'payment', confidence: 0.85 };
  }
  
  // Item lines: look for price patterns at end or quantity × price
  if (/\d+\s*[×xX*]\s*\d+\.\d{2}/.test(trimmed)) {
    return { type: 'item', confidence: 0.9 };
  }
  if (/\d+\.\d{2}\s*$/.test(trimmed) && trimmed.length > 5) {
    return { type: 'item', confidence: 0.8 };
  }
  
  // Merchant name: early lines (0-5), text-only, reasonable length
  // Allow line 0 for merchant (often the store name)
  if (index >= 0 && index <= 5 && 
      trimmed.length >= 3 && 
      trimmed.length <= 60 &&
      !/\d/.test(trimmed) &&
      !isTotalLine(lower)) {
    return { type: 'merchant', confidence: index === 0 ? 0.9 : 0.8 };
  }
  
  return { type: 'noise', confidence: 0.3 };
}

function isTotalLine(line: string): boolean {
  const l = line.toLowerCase();
  return ['total','subtotal','sub-total','tax','vat','gst','amount','balance','due',
    'change','cash','card','payment','thank','welcome','receipt','invoice','order',
    'table','bill','مجموع','ضريبة'].some(k => l.includes(k));
}

function isDateStr(line: string): boolean {
  return /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(line) ||
    /(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(line) ||
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line);
}

function isAmountStr(line: string): boolean {
  return /\$?€?£?ر\.س?\s*[\d,]+\.\d{2}/.test(line);
}

function normalizeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch (_) {}
  return dateStr;
}

function extractMerchant(lines: string[]): string {
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i];
    if (isDateStr(line) || isAmountStr(line) || line.length < 2 || line.length > 60) continue;
    if (/^\d+$/.test(line) || /^[A-Z]{2,}\s+\d+$/.test(line)) continue;
    const cleaned = line.replace(/[^\w\s]/g, '').trim();
    if (cleaned.length >= 2 && !/^\d+$/.test(cleaned)) return cleaned.toUpperCase();
  }
  return 'Unknown Merchant';
}

function extractDate(lines: string[]): string {
  const patterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.]+(\d{1,2}),?\s+(\d{4})/i,
  ];
  for (const line of lines) {
    for (const pat of patterns) {
      const m = line.match(pat);
      if (m) return normalizeDate(m[0]);
    }
  }
  return new Date().toISOString().split('T')[0];
}

function extractAmount(lines: string[]): { amount: number; currency: string } {
  const patterns = [
    // Currency code before amount: USD 100.00, EUR 50.00
    /(?:USD|EUR|GBP|SAR|AED|QAR|KWD|BHD|OMR|JOD|EGP|INR|PKR|CNY|JPY|KRW|SGD|MYR|THB|CAD|AUD|CHF)\s*([\d,]+\.\d{2})/i,
    
    // Currency symbol before amount: $100.00, €50.00, £30.00
    /[\$€£₹¥₩฿₱₫₺₽]\s*([\d,]+\.\d{2})/,
    
    // Arabic currency: ر.س 100.00, د.إ 50.00
    /(?:ر\.س|د\.إ|﷼)\s*([\d,]+\.\d{2})/,
    
    // Total with currency: total $100.00, amount EUR 50.00
    /(?:total|amount|balance|due|المجموع)[:\s]*[\$€£₹¥₩฿₱₫₺₽ر\.سد\.إ﷼]?([\d,]+\.\d{2})/i,
    
    // Amount followed by currency code: 100.00 USD, 50.00 EUR
    /([\d,]+\.\d{2})\s*(?:USD|EUR|GBP|SAR|AED|QAR|KWD|BHD|OMR|JOD|EGP|INR|PKR|CNY|JPY|KRW|SGD|MYR|THB|CAD|AUD|CHF)/i,
    
    // Just amount (assume AED): 100.00
    /([\d,]+\.\d{2})/,
  ];
  
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 15); i--) {
    for (const pat of patterns) {
      const m = lines[i].match(pat);
      if (m) {
        const v = parseFloat(m[1].replace(/,/g, ''));
        if (v > 0) {
          // Detect currency from the matched text
          const currency = detectCurrency(m[0]);
          return { amount: v, currency };
        }
      }
    }
  }
  
  // Fallback
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(/[\$€£₹¥₩฿₱₫₺₽ر\.سد\.إ﷼]?\s*([\d,]+\.\d{2})/);
    if (m) {
      const v = parseFloat(m[1].replace(/,/g, ''));
      if (v > 10) {
        const currency = detectCurrency(m[0]);
        return { amount: v, currency };
      }
    }
  }
  
  return { amount: 0, currency: 'AED' };
}

/**
 * Detect currency from text containing amount
 */
function detectCurrency(text: string): string {
  if (!text) return 'AED';
  
  const upperText = text.toUpperCase();
  
  // Check for currency codes
  const currencyCodes = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'EGP', 'INR', 'PKR', 'CNY', 'JPY', 'KRW', 'SGD', 'MYR', 'THB', 'CAD', 'AUD', 'CHF'];
  for (const code of currencyCodes) {
    if (upperText.includes(code)) {
      return code;
    }
  }
  
  // Check for currency symbols
  if (text.includes('$')) return 'USD';
  if (text.includes('€')) return 'EUR';
  if (text.includes('£')) return 'GBP';
  if (text.includes('₹')) return 'INR';
  if (text.includes('¥')) return 'JPY';
  if (text.includes('₩')) return 'KRW';
  if (text.includes('ر.س') || text.includes('﷼')) return 'SAR';
  if (text.includes('د.إ')) return 'AED';
  
  return 'AED'; // Default to AED
}

function extractTax(lines: string[]): number | null {
  for (const line of lines) {
    const m = line.match(/(?:tax|vat|gst|ضريبة)[:\s]*\$?€?£?ر\.س?([\d,]+\.\d{2})/i);
    if (m) return parseFloat(m[1].replace(/,/g, ''));
  }
  return null;
}

function extractItems(lines: string[]): Array<{ name: string; quantity: number; price: number }> {
  const items: Array<{ name: string; quantity: number; price: number }> = [];
  for (const line of lines) {
    if (isTotalLine(line) || isDateStr(line) || line.length < 5) continue;
    const qtyMatch = line.match(/^(\d+)\s*[xX×]\s*(.+?)\s+\$?€?£?ر\.س?\s*([\d,]+\.\d{2})$/);
    if (qtyMatch) {
      items.push({ name: qtyMatch[2].trim(), quantity: parseInt(qtyMatch[1]), price: parseFloat(qtyMatch[3].replace(/,/g, '')) });
      continue;
    }
    const descMatch = line.match(/^(.+?)\s+\$?€?£?ر\.س?\s*([\d,]+\.\d{2})$/);
    if (descMatch && !isTotalLine(descMatch[1]) && !isDateStr(descMatch[0])) {
      items.push({ name: descMatch[1].trim(), quantity: 1, price: parseFloat(descMatch[2].replace(/,/g, '')) });
    }
  }
  return items;
}

function autoCategorize(merchant: string, items: Array<{ name: string; quantity: number; price: number }>): string | null {
  const allText = merchant.toLowerCase() + ' ' + items.map(i => i.name.toLowerCase()).join(' ');
  const map: Record<string, string[]> = {
    food_drink: ['restaurant','cafe','coffee','starbucks','mcdonald','burger','pizza','kfc','subway','مطعم','قهوة'],
    groceries: ['grocery','supermarket','walmart','carrefour','lulu','بقالة','سوبرماركت'],
    transport: ['uber','lyft','taxi','gas','fuel','parking','metro','shell','bp','نقل','وقود'],
    shopping: ['amazon','mall','clothing','retail','zara','nike','adidas','تسوق'],
    utilities: ['electric','water','internet','phone','utility','كهرباء','ماء'],
    healthcare: ['pharmacy','doctor','hospital','medical','cvs','صيدلية','طبيب'],
    entertainment: ['movie','cinema','netflix','spotify','game','سينما','ترفيه'],
  };
  let best: string | null = null;
  let top = 0;
  for (const [cat, kws] of Object.entries(map)) {
    const score = kws.filter(k => allText.includes(k)).length;
    if (score > top) { top = score; best = cat; }
  }
  return best;
}

function generateWarnings(
  parsedData: { merchant: string; date: string; amount: number; tax: number | null; items: any[] },
  confidence: number
) {
  const warnings: Array<{ type: 'error' | 'warning' | 'info'; field: string; message: string }> = [];
  if (confidence < 0.5) warnings.push({ type: 'warning', field: 'overall', message: 'Very low confidence — please verify all fields' });
  else if (confidence < 0.7) warnings.push({ type: 'warning', field: 'overall', message: 'Low confidence — please review extracted data' });
  if (parsedData.amount === 0) warnings.push({ type: 'error', field: 'amount', message: 'Amount not detected — please enter manually' });
  if (parsedData.date === new Date().toISOString().split('T')[0]) warnings.push({ type: 'info', field: 'date', message: "Date not detected — using today's date" });
  if (parsedData.merchant === 'Unknown Merchant') warnings.push({ type: 'warning', field: 'merchant', message: 'Merchant name not detected clearly' });
  if (parsedData.items.length === 0) warnings.push({ type: 'info', field: 'items', message: 'No line items detected' });
  return warnings;
}

// ─────────────────────────────────────────────
// SMART EXTRACTION FUNCTIONS (use structural analysis)
// ─────────────────────────────────────────────

function extractMerchantSmart(analyzedLines: AnalyzedLine[]): string {
  console.log('🔍 Extracting merchant...');
  
  // Priority 1: First text-only line (usually the store name)
  for (const line of analyzedLines) {
    if (line.index <= 3 && 
        line.text.length >= 5 && 
        line.text.length <= 60 &&
        !/\d/.test(line.text) &&
        !isTotalLine(line.text.toLowerCase()) &&
        line.type !== 'date' &&
        line.type !== 'time') {
      const merchant = line.text.replace(/[^\w\s]/g, '').trim().toUpperCase();
      console.log(`  ✅ Found merchant: "${merchant}" (line ${line.index})`);
      return merchant;
    }
  }
  
  // Priority 2: Lines explicitly classified as merchant
  const merchantLines = analyzedLines.filter(l => l.type === 'merchant');
  if (merchantLines.length > 0) {
    const best = merchantLines[0];
    return best.text.replace(/[^\w\s]/g, '').trim().toUpperCase();
  }
  
  console.log('  ⚠️ No merchant found');
  return 'Unknown Merchant';
}

function extractDateSmart(analyzedLines: AnalyzedLine[]): string {
  // Priority 1: Lines explicitly classified as date
  const dateLines = analyzedLines.filter(l => l.type === 'date');
  if (dateLines.length > 0) {
    const rawDate = dateLines[0].text;
    // Extract just the date part if time is attached
    const dateOnly = rawDate.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
    if (dateOnly) {
      return normalizeDate(dateOnly[0]);
    }
    return normalizeDate(rawDate);
  }
  
  // Priority 2: Search all lines for date patterns
  const patterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
  ];
  
  for (const line of analyzedLines) {
    for (const pat of patterns) {
      const m = line.text.match(pat);
      if (m) return normalizeDate(m[0]);
    }
  }
  
  return new Date().toISOString().split('T')[0];
}

function extractAmountsSmart(analyzedLines: AnalyzedLine[]): { amount: number; tax: number | null; currency: string } {
  let amount = 0;
  let tax: number | null = null;
  let currency = 'AED';
  
  console.log('💰 Extracting amounts...');
  
  // Priority 1: Find explicitly labeled total line
  const totalLines = analyzedLines.filter(l => l.type === 'total');
  const taxLines = analyzedLines.filter(l => l.type === 'tax');
  
  console.log(`  Found ${totalLines.length} total lines, ${taxLines.length} tax lines`);
  
  // Extract tax
  for (const line of taxLines) {
    console.log(`  Tax line: "${line.text}"`);
    const m = line.text.match(/([\d,]+\.\d{2})/);
    if (m) {
      tax = parseFloat(m[1].replace(/,/g, ''));
      console.log(`  ✅ Tax: ${tax}`);
    }
  }
  
  // Extract total - get the LAST number from the total line
  if (totalLines.length > 0) {
    const lastTotal = totalLines[totalLines.length - 1];
    console.log(`  Total line: "${lastTotal.text}"`);
    
    // Detect currency from total line
    currency = detectCurrency(lastTotal.text);
    console.log(`  💱 Detected currency: ${currency}`);
    
    // Extract the last decimal number (usually the total amount)
    const allNumbers = lastTotal.text.match(/([\d,]+\.\d{2})/g);
    if (allNumbers && allNumbers.length > 0) {
      // Use the last number found (should be the total)
      amount = parseFloat(allNumbers[allNumbers.length - 1].replace(/,/g, ''));
      console.log(`  ✅ Total: ${amount} (from ${allNumbers.length} numbers)`);
      return { amount, tax, currency };
    }
  }
  
  // Priority 2: Search bottom 30% for largest amount
  console.log('  ⚠️ No total found, searching bottom section...');
  const bottomSection = analyzedLines.slice(Math.floor(analyzedLines.length * 0.7));
  const allAmounts: { value: number; line: AnalyzedLine }[] = [];
  
  for (const line of bottomSection) {
    const m = line.text.match(/([\d,]+\.\d{2})/);
    if (m) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (val > 0 && val < 10000) { // Reasonable receipt amount
        allAmounts.push({ value: val, line });
      }
    }
  }
  
  if (allAmounts.length > 0) {
    allAmounts.sort((a, b) => b.value - a.value);
    amount = allAmounts[0].value;
    currency = detectCurrency(allAmounts[0].line.text);
    console.log(`  ✅ Found amount: ${amount}, currency: ${currency}`);
  }
  
  return { amount, tax, currency };
}

function extractItemsSmart(analyzedLines: AnalyzedLine[]): Array<{ name: string; quantity: number; price: number }> {
  const items: Array<{ name: string; quantity: number; price: number }> = [];
  
  console.log('🛒 Extracting items...');
  
  // Only extract from lines between items section (after header, before totals)
  const itemLines = analyzedLines.filter(l => 
    (l.type === 'item' || 
     (l.type === 'noise' && l.text.length > 3 && /\d+\.\d{2}/.test(l.text))) &&
    l.index > 3 // Skip header lines
  );
  
  console.log(`  Found ${itemLines.length} potential item lines`);
  
  for (const line of itemLines) {
    const text = line.text.trim();
    
    // Pattern 1: "Milk 1 5.50" or "Apples 13 6.20" (name qty price)
    const match1 = text.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s+([\d,]+\.\d{2})$/);
    if (match1) {
      const name = match1[1].trim();
      const qty = parseFloat(match1[2]);
      const price = parseFloat(match1[3].replace(/,/g, ''));
      if (name.length > 1 && price > 0 && !isTotalLine(name.toLowerCase())) {
        console.log(`  ✅ Item: "${name}" qty=${qty} price=${price}`);
        items.push({ name, quantity: Math.round(qty * 10) / 10, price });
        continue;
      }
    }
    
    // Pattern 2: "Bread 2.00" (name price, qty=1)
    const match2 = text.match(/^(.+?)\s+([\d,]+\.\d{2})$/);
    if (match2) {
      const name = match2[1].trim();
      const price = parseFloat(match2[2].replace(/,/g, ''));
      if (name.length > 2 && price > 0 && !isTotalLine(name.toLowerCase())) {
        console.log(`  ✅ Item: "${name}" price=${price}`);
        items.push({ name, quantity: 1, price });
        continue;
      }
    }
    
    console.log(`  ⚠️ Skipped: "${text}"`);
  }
  
  console.log(`📦 Total items: ${items.length}`);
  return items;
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────

export const extractReceiptData = async (
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<ReceiptExtractionData> => {
  console.log('🔍 Starting enhanced OCR pipeline...');

  let processedUrl: string | null = null;

  try {
    console.log('🎨 Preprocessing: upscale → contrast → adaptive threshold → deskew...');
    processedUrl = await preprocessImage(imageFile);

    console.log('📝 Running Tesseract (eng+ara)...');
    // Use default bundled worker from node_modules (no CDN required)
    const result = await Tesseract.recognize(processedUrl, 'eng+ara', {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          const p = Math.round(m.progress * 100);
          console.log(`OCR: ${p}%`);
          onProgress?.(p);
        }
      },
    });

    URL.revokeObjectURL(processedUrl);
    processedUrl = null;

    const rawText = result.data.text;
    const rawConfidence = result.data.confidence; // 0–100
    console.log(`📄 Raw confidence: ${rawConfidence}%`);
    console.log('📄 Text preview:', rawText.substring(0, 200));

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    
    console.log(`📊 Analyzing receipt structure (${lines.length} lines)...`);
    
    // Step 1: Classify each line
    const analyzedLines = lines.map((line, index) => {
      const { type, confidence } = classifyLine(line, index, lines.length);
      return { text: line, type, confidence, index };
    });
    
    // Log structure analysis
    console.log('📋 Receipt Structure:');
    analyzedLines.filter(l => l.type !== 'noise').forEach(l => {
      console.log(`  [${l.type.padEnd(10)}] Line ${l.index}: ${l.text.substring(0, 40)}`);
    });
    
    // Step 2: Extract data using structural context
    const merchant = extractMerchantSmart(analyzedLines);
    const date = extractDateSmart(analyzedLines);
    const { amount, tax, currency } = extractAmountsSmart(analyzedLines);
    const items = extractItemsSmart(analyzedLines);
    const category = autoCategorize(merchant, items);

    // Adjusted 0–1 confidence
    let conf = rawConfidence / 100;
    if (amount === 0) conf -= 0.2;
    if (merchant === 'Unknown Merchant') conf -= 0.15;
    conf = Math.max(0.1, Math.min(1.0, conf));

    const warnings = generateWarnings({ merchant, date, amount, tax, items }, conf);

    return {
      merchant,
      date,
      amount,
      detectedCurrency: currency,
      tax,
      items,
      category,
      confidence: { merchant: conf, date: conf, amount: conf, overall: conf },
      qualityScore: conf,
      rawConfidence, // raw 0–100, used by scanApi to decide server fallback
      warnings,
    };
  } catch (err) {
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    throw new Error(`OCR failed: ${err instanceof Error ? err.message : String(err)}`);
  }
};
