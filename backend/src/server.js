require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { testConnection } = require('./config/supabase');
const { scheduleCleanup } = require('./utils/fileCleanup');


const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Response compression (reduce payload size by 60-80%)
app.use(compression());

// Security headers
app.use(helmet());

// CORS (allow frontend to connect)
app.use(cors());

// Parse JSON bodies (increase limit for base64 images)
app.use(express.json({ limit: '50mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// HTTP request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================
// TEST ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'receiptAI backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Database connection test endpoint
app.get('/test-db', async (req, res) => {
  try {
    const { supabase } = require('./config/supabase');
    
    // Test 1: Check categories table
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    // Test 2: Check receipts table
    const { data: receipts, error: recError } = await supabase
      .from('receipts')
      .select('*')
      .limit(1);
    
    // Test 3: Check receipt_items table
    const { data: items, error: itemError } = await supabase
      .from('receipt_items')
      .select('*')
      .limit(1);
    
    if (catError || recError || itemError) {
      return res.status(500).json({
        status: 'ERROR',
        message: 'Database connection failed',
        errors: {
          categories: catError?.message,
          receipts: recError?.message,
          items: itemError?.message
        }
      });
    }
    
    res.json({
      status: 'SUCCESS',
      message: 'All database tables are accessible!',
      tables: {
        categories: '✅ Connected',
        receipts: '✅ Connected',
        receipt_items: '✅ Connected'
      },
      sample_data: {
        categories_count: categories?.length || 0,
        receipts_count: receipts?.length || 0,
        items_count: items?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database test failed',
      error: error.message
    });
  }
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const receiptRoutes = require('./routes/receiptRoutes');
app.use('/api/receipts', receiptRoutes);

const scanRoutes = require('./routes/scanRoutes');
app.use('/api/scan', scanRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);



// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Test database connection first
    console.log('\n🔌 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection!');
      process.exit(1);
    }
    
    // Start scheduled file cleanup
    scheduleCleanup();
    
    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n========================================');
      console.log('🚀 receiptAI Backend Server');
      console.log('========================================');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📡 Listening on all network interfaces (0.0.0.0)`);
      console.log(`🤖 AI Engine: OpenAI GPT-4o Vision`);
      console.log(`🔗 Local: http://localhost:${PORT}/health`);
      console.log(`🔗 Network: http://192.168.1.143:${PORT}/health`);
      console.log(`💾 DB test: http://localhost:${PORT}/test-db`);
      console.log('========================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

