/**
 * Email Service - Nodemailer with Gmail SMTP
 * 
 * Sends OTP verification emails to users
 * Configuration:
 * - Uses Gmail SMTP for reliable email delivery
 * - Requires EMAIL_USER and EMAIL_PASS (App Password) in .env
 * - HTML formatted emails with professional design
 * 
 * Security Notes:
 * - Never log OTP codes in production
 * - Use environment variables for credentials
 * - Gmail App Password must be generated from Google Account settings
 */

const nodemailer = require('nodemailer');

// Create transporter using Gmail SMTP
// Performance: Connection is reused across requests (nodemailer handles pooling)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
    console.log('💡 Make sure to set EMAIL_USER and EMAIL_PASS in .env');
  } else {
    console.log('✅ Email server is ready to send OTP emails');
  }
});

// Send OTP email
exports.sendOTPEmail = async (to, otp) => {
  try {
    // Development logging only - never log OTP in production
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Sending OTP email to: ${to}`);
      console.log(`🔢 OTP Code: ${otp}`);
    }
    
    const mailOptions = {
      from: `receiptAI <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'receiptAI - Your 6-Digit Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #006c4a;">receiptAI</h2>
          <p>Hello,</p>
          <p>Thank you for signing up for receiptAI! Please use the following <strong>6-digit verification code</strong> to complete your registration:</p>
          
          <div style="background-color: #eef4ff; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; border: 2px solid #3fb687;">
            <h1 style="color: #006c4a; letter-spacing: 12px; margin: 0; font-size: 42px; font-weight: bold;">${otp}</h1>
          </div>
          
          <p style="color: #ba1a1a;"><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request this code, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #6B7280; font-size: 12px;">
            receiptAI - Smart Expense Tracker<br>
            This is an automated email, please do not reply.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ OTP email sent successfully to:', to);
    console.log('📬 Message ID:', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error: error.message };
  }
};