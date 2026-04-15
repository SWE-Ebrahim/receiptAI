/**
 * Authentication Middleware
 * 
 * Protects routes by requiring valid authentication tokens
 * Verifies Supabase JWT tokens and attaches user data to requests
 * 
 * Usage:
 *   router.get('/protected', protect, handler);
 */

const { supabaseAdmin } = require('../config/supabase');

/**
 * Protect route middleware
 * Checks for valid Bearer token in Authorization header
 * Attaches verified user data to req.user
 */
exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login.'
      });
    }

    // Verify token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};