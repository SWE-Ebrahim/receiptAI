-- ============================================
-- DELETE ALL DATA FROM DATABASE
-- ============================================
-- WARNING: This will permanently delete ALL data!
-- Tables and structure will remain intact.
-- ============================================

-- Delete in correct order (respecting foreign keys)
DELETE FROM receipt_items;
DELETE FROM receipts;
DELETE FROM categories;

-- Verify deletion
SELECT 'receipt_items' AS table_name, COUNT(*) AS row_count FROM receipt_items
UNION ALL
SELECT 'receipts', COUNT(*) FROM receipts
UNION ALL
SELECT 'categories', COUNT(*) FROM categories;

SELECT '✅ All data deleted successfully!' AS status;
