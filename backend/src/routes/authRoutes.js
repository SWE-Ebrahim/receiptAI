/**
 * Authentication Routes
 * 
 * Defines all authentication-related endpoints:
 * - User registration with OTP verification
 * - Login/logout functionality
 * - Password reset flow
 * - User profile management
 * 
 * Security:
 * - Public routes: signup, login, password reset (no auth required)
 * - Protected routes: logout, get user (require valid token)
 */

const express = require('express');
const router = express.Router();
const {
  signup,
  verifyOTP,
  resendOTP,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);

module.exports = router;