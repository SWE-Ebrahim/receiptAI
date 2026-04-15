-- ============================================
-- PENDING REGISTRATIONS TABLE
-- Stores OTP and user data BEFORE account creation
-- Accounts are ONLY created after OTP verification
-- ============================================

-- Drop existing table if exists
DROP TABLE IF EXISTS pending_registrations CASCADE;

-- Create pending registrations table
CREATE TABLE pending_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  otp VARCHAR(6) NOT NULL,
  otp_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Auto-delete after 24 hours
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create index for faster email lookup
CREATE INDEX idx_pending_registrations_email ON pending_registrations(email);

-- Create index for cleanup
CREATE INDEX idx_pending_registrations_expires ON pending_registrations(expires_at);

SELECT '✅ Pending registrations table created successfully!' AS status;

-- ============================================
-- AUTO-CLEANUP FUNCTION
-- Deletes expired pending registrations
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_registrations()
RETURNS void AS $$
BEGIN
  DELETE FROM pending_registrations
  WHERE expires_at < NOW();
  
  RAISE NOTICE 'Cleaned up expired pending registrations';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFY TABLE EXISTS
-- ============================================

SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'pending_registrations'
ORDER BY ordinal_position;

SELECT '✅ Setup complete! Table ready for secure OTP flow.' AS status;
