-- =====================================================
-- PERFORMANCE OPTIMIZATION: Database Indexes
-- =====================================================
-- These indexes will significantly improve query performance
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Index for receipts by user and creation date (most common query)
CREATE INDEX IF NOT EXISTS idx_receipts_user_created 
ON receipts(user_id, created_at DESC);

-- 2. Index for receipts by user and receipt date (for spending summaries)
CREATE INDEX IF NOT EXISTS idx_receipts_user_receipt_date 
ON receipts(user_id, receipt_date DESC);

-- 3. Index for category lookups
CREATE INDEX IF NOT EXISTS idx_receipts_category 
ON receipts(category_id);

-- 4. Index for pending registrations by email (faster signup checks)
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email 
ON pending_registrations(email);

-- 5. Index for categories by user (faster category loading)
CREATE INDEX IF NOT EXISTS idx_categories_user 
ON categories(user_id);

-- 6. Composite index for spending summary queries (user + date range)
CREATE INDEX IF NOT EXISTS idx_receipts_user_date_amount 
ON receipts(user_id, receipt_date, total_amount);

-- =====================================================
-- Verify indexes were created
-- =====================================================
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('receipts', 'categories', 'pending_registrations')
ORDER BY tablename, indexname;
