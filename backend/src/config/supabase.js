const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

// Service role client (for admin operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Anon client (for public operations)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
const testConnection = async () => {
  try {
    const { error } = await supabase.from('categories').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    return false;
  }
};

module.exports = { supabase, supabaseAdmin, testConnection };