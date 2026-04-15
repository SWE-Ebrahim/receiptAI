-- ============================================
-- CLEAN START: Drop existing tables
-- ============================================
DROP TABLE IF EXISTS receipt_items CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#4F46E5',
  icon VARCHAR(50) DEFAULT 'receipt',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_category_name UNIQUE(user_id, name)
);

-- ============================================
-- TABLE 2: RECEIPTS
-- ============================================
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  category_id UUID,
  
  -- File information
  original_file_url TEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL,
  generated_pdf_url TEXT,
  
  -- Extracted receipt data
  merchant_name VARCHAR(255),
  receipt_date DATE,
  total_amount DECIMAL(10, 2),
  tax_amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'AED',
  payment_method VARCHAR(50),
  
  -- Raw OCR text
  raw_ocr_text TEXT,
  
  -- Processing status
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE 3: RECEIPT ITEMS
-- ============================================
CREATE TABLE receipt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL,
  item_name VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT '✅ All 3 tables created successfully!' AS status;

-- ============================================
-- ADD FOREIGN KEY RELATIONSHIPS
-- ============================================

-- Categories belongs to User
ALTER TABLE categories 
  ADD CONSTRAINT fk_categories_user 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Receipts belongs to User
ALTER TABLE receipts 
  ADD CONSTRAINT fk_receipts_user 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Receipts belongs to Category
ALTER TABLE receipts 
  ADD CONSTRAINT fk_receipts_category 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id) 
  ON DELETE SET NULL;

-- Receipt Items belongs to Receipt
ALTER TABLE receipt_items 
  ADD CONSTRAINT fk_receipt_items_receipt 
  FOREIGN KEY (receipt_id) 
  REFERENCES receipts(id) 
  ON DELETE CASCADE;

SELECT '✅ All foreign keys added successfully!' AS status;

-- ============================================
-- CREATE INDEXES (for faster queries)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_category_id ON receipts(category_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);

SELECT '✅ All indexes created successfully!' AS status;

-- ============================================
-- CREATE TRIGGER (auto-update updated_at)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_receipts_updated_at ON receipts;
CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

SELECT '✅ Trigger created successfully!' AS status;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

SELECT '✅ RLS enabled on all tables!' AS status;

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RECEIPTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own receipts" ON receipts;
CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own receipts" ON receipts;
CREATE POLICY "Users can insert own receipts"
  ON receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own receipts" ON receipts;
CREATE POLICY "Users can update own receipts"
  ON receipts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own receipts" ON receipts;
CREATE POLICY "Users can delete own receipts"
  ON receipts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RECEIPT ITEMS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own receipt items" ON receipt_items;
CREATE POLICY "Users can view own receipt items"
  ON receipt_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own receipt items" ON receipt_items;
CREATE POLICY "Users can insert own receipt items"
  ON receipt_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own receipt items" ON receipt_items;
CREATE POLICY "Users can update own receipt items"
  ON receipt_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own receipt items" ON receipt_items;
CREATE POLICY "Users can delete own receipt items"
  ON receipt_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND receipts.user_id = auth.uid()
    )
  );

SELECT '✅ All RLS policies created successfully!' AS status;

-- STEP 7: Create Storage Bucket
-- Click "Storage" (left sidebar)
-- Click "New bucket"
-- Name: receipts
-- Public bucket: ❌ UNCHECK
-- File size limit: 5242880
-- Click "Create bucket"

-- ============================================
-- STORAGE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can upload receipts" ON storage.objects;
CREATE POLICY "Users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Users can view own receipts" ON storage.objects;
CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own receipts" ON storage.objects;
CREATE POLICY "Users can update own receipts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;
CREATE POLICY "Users can delete own receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

SELECT '✅ Storage policies created successfully!' AS status;

-- Test 1: Check tables exist
SELECT 
  table_name,
  '✅ Exists' AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('categories', 'receipts', 'receipt_items')
ORDER BY table_name;

-- Test 2: Check receipt_date column exists
SELECT 
  column_name,
  data_type,
  '✅ Column exists' AS status
FROM information_schema.columns
WHERE table_name = 'receipts'
  AND column_name = 'receipt_date';

-- Test 3: Count indexes
SELECT 
  COUNT(*) AS total_indexes,
  '✅ Should be 6' AS expected
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

-- Test 4: Count policies
SELECT 
  COUNT(*) AS total_policies,
  '✅ Should be 12' AS expected
FROM pg_policies
WHERE schemaname = 'public';