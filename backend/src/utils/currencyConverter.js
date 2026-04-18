/**
 * Currency Conversion Utility
 * 
 * Converts various currencies to AED (UAE Dirham)
 * Uses fixed exchange rates for stability and offline support
 * 
 * All receipts are stored in AED in the database
 */

// Fixed exchange rates to AED (as of 2024)
// These rates are stable and won't change frequently
const EXCHANGE_RATES_TO_AED = {
  'AED': 1.0,           // UAE Dirham (base)
  'USD': 3.67,          // US Dollar
  'EUR': 3.98,          // Euro
  'GBP': 4.65,          // British Pound
  'SAR': 0.98,          // Saudi Riyal
  'QAR': 1.01,          // Qatari Riyal
  'KWD': 11.95,         // Kuwaiti Dinar
  'BHD': 9.73,          // Bahraini Dinar
  'OMR': 9.53,          // Omani Rial
  'JOD': 5.17,          // Jordanian Dinar
  'EGP': 0.12,          // Egyptian Pound
  'INR': 0.044,         // Indian Rupee
  'PKR': 0.013,         // Pakistani Rupee
  'BDT': 0.034,         // Bangladeshi Taka
  'LKR': 0.012,         // Sri Lankan Rupee
  'CNY': 0.51,          // Chinese Yuan
  'JPY': 0.024,         // Japanese Yen
  'KRW': 0.0027,        // South Korean Won
  'SGD': 2.74,          // Singapore Dollar
  'MYR': 0.82,          // Malaysian Ringgit
  'THB': 0.10,          // Thai Baht
  'IDR': 0.00023,       // Indonesian Rupiah
  'PHP': 0.065,         // Philippine Peso
  'VND': 0.00015,       // Vietnamese Dong
  'CAD': 2.71,          // Canadian Dollar
  'AUD': 2.40,          // Australian Dollar
  'NZD': 2.23,          // New Zealand Dollar
  'CHF': 4.18,          // Swiss Franc
  'SEK': 0.35,          // Swedish Krona
  'NOK': 0.34,          // Norwegian Krone
  'DKK': 0.53,          // Danish Krone
  'ZAR': 0.20,          // South African Rand
  'BRL': 0.73,          // Brazilian Real
  'MXN': 0.22,          // Mexican Peso
  'ARS': 0.0043,        // Argentine Peso
  'RUB': 0.040,         // Russian Ruble
  'TRY': 0.11,          // Turkish Lira
};

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  '$': ['USD', 'CAD', 'AUD', 'NZD'],
  '€': ['EUR'],
  '£': ['GBP'],
  'ر.س': ['SAR'],
  '﷼': ['SAR', 'IRR'],
  'د.إ': ['AED'],
  '₹': ['INR'],
  '¥': ['JPY', 'CNY'],
  '₩': ['KRW'],
  '฿': ['THB'],
  'Rp': ['IDR'],
  '₱': ['PHP'],
  '₫': ['VND'],
  'RM': ['MYR'],
  'S$': ['SGD'],
  'CHF': ['CHF'],
  'kr': ['SEK', 'NOK', 'DKK'],
  'R': ['ZAR'],
  'R$': ['BRL'],
  '₽': ['RUB'],
  '₺': ['TRY'],
};

/**
 * Detect currency from text/amount string
 * @param {string} text - Text containing amount with currency symbol/code
 * @returns {string|null} - Detected currency code or null
 */
function detectCurrency(text) {
  if (!text) return null;
  
  const upperText = text.toUpperCase();
  
  // Check for currency codes first (more reliable)
  for (const code of Object.keys(EXCHANGE_RATES_TO_AED)) {
    if (code !== 'AED' && upperText.includes(code)) {
      return code;
    }
  }
  
  // Check for currency symbols
  for (const [symbol, codes] of Object.entries(CURRENCY_SYMBOLS)) {
    if (text.includes(symbol)) {
      // Return the first/most common currency for this symbol
      return codes[0];
    }
  }
  
  return null;
}

/**
 * Convert amount from any currency to AED
 * @param {number} amount - Amount in original currency
 * @param {string} fromCurrency - Source currency code (e.g., 'USD')
 * @returns {object} - { convertedAmount, originalAmount, originalCurrency, rate }
 */
function convertToAED(amount, fromCurrency = 'AED') {
  const rate = EXCHANGE_RATES_TO_AED[fromCurrency.toUpperCase()] || 1.0;
  const convertedAmount = parseFloat((amount * rate).toFixed(2));
  
  return {
    convertedAmount,
    originalAmount: parseFloat(amount.toFixed(2)),
    originalCurrency: fromCurrency.toUpperCase(),
    rate,
    targetCurrency: 'AED'
  };
}

/**
 * Extract amount and detect currency from OCR text
 * @param {string} text - OCR extracted text
 * @returns {object} - { amount, currency, detected }
 */
function extractAmountWithCurrency(text) {
  if (!text) return { amount: 0, currency: 'AED', detected: false };
  
  // Patterns to match amounts with currency indicators
  const patterns = [
    // Currency code before amount: USD 100.00, EUR 50.00
    /(?:USD|EUR|GBP|SAR|AED|QAR|KWD|BHD|OMR|JOD|EGP|INR|PKR|CNY|JPY|KRW|SGD|MYR|THB|CAD|AUD|CHF)\s*([\d,]+\.\d{2})/i,
    
    // Currency symbol before amount: $100.00, €50.00, £30.00
    /[\$€£₹¥₩฿₱₫₺₽]\s*([\d,]+\.\d{2})/,
    
    // Arabic currency: ر.س 100.00, د.إ 50.00
    /(?:ر\.س|د\.إ|﷼)\s*([\d,]+\.\d{2})/,
    
    // Amount followed by currency code: 100.00 USD, 50.00 EUR
    /([\d,]+\.\d{2})\s*(?:USD|EUR|GBP|SAR|AED|QAR|KWD|BHD|OMR|JOD|EGP|INR|PKR|CNY|JPY|KRW|SGD|MYR|THB|CAD|AUD|CHF)/i,
    
    // Just amount (assume AED): 100.00
    /([\d,]+\.\d{2})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      
      if (!isNaN(amount) && amount > 0) {
        // Detect currency from the matched text
        const currency = detectCurrency(match[0]) || 'AED';
        
        return {
          amount,
          currency,
          detected: true
        };
      }
    }
  }
  
  return { amount: 0, currency: 'AED', detected: false };
}

/**
 * Get list of supported currencies
 * @returns {string[]} - Array of currency codes
 */
function getSupportedCurrencies() {
  return Object.keys(EXCHANGE_RATES_TO_AED);
}

/**
 * Format amount in AED with proper formatting
 * @param {number} amount - Amount in AED
 * @returns {string} - Formatted string (e.g., "AED 100.00")
 */
function formatAED(amount) {
  return `AED ${parseFloat(amount).toFixed(2)}`;
}

module.exports = {
  EXCHANGE_RATES_TO_AED,
  CURRENCY_SYMBOLS,
  detectCurrency,
  convertToAED,
  extractAmountWithCurrency,
  getSupportedCurrencies,
  formatAED,
};
