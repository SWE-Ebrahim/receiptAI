-- ============================================
-- ADD receipt_time COLUMN TO RECEIPTS TABLE
-- ============================================

-- Add receipt_time column (TIME type - HH:mm format)
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS receipt_time TIME WITHOUT TIME ZONE;

-- Update existing records: set receipt_time to NULL (will be populated on next edit)
-- Or optionally set to current time from created_at for existing records
UPDATE receipts 
SET receipt_time = created_at::time 
WHERE receipt_time IS NULL AND created_at IS NOT NULL;

SELECT '✅ receipt_time column added successfully!' AS status;
