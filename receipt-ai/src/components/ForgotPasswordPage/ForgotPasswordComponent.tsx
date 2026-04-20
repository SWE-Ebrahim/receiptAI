/**
 * Forgot Password Component
 * 
 * Features:
 * - 3-step password reset flow (Email → OTP → New Password)
 * - Email validation and OTP verification
 * - Secure password reset with strength validation
 * - Error handling and success messages
 * 
 * Security:
 * - OTP-based verification before allowing password change
 * - Password strength requirements enforced
 * - No sensitive data exposure in error messages
 */

import { useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import ForgotPasswordForm from './ForgotPasswordForm'

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPasswordComponent = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email')
  const [email, setEmail] = useState('')

  /**
   * Step 1: Send OTP to user's email
   */
  const handleSendOTP = async (emailValue: string) => {
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send OTP')
      }

      setEmail(emailValue)
      setStep('otp')
      setSuccess('OTP sent! Check your email.')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Step 2: Verify OTP code
   */
  const handleVerifyOTP = async (otpCode: string) => {
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Invalid OTP')
      }

      setStep('password')
      setSuccess('')
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Step 3: Reset password with new credentials
   */
  const handleResetPassword = async (newPassword: string, confirmPassword: string) => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password')
      }

      // Navigate to login after successful reset
      window.location.href = '/login'
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col light">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-6xl w-full flex items-center justify-center">
          <ForgotPasswordForm
            step={step}
            isLoading={isLoading}
            error={error}
            success={success}
            onSendOTP={handleSendOTP}
            onVerifyOTP={handleVerifyOTP}
            onResetPassword={handleResetPassword}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default ForgotPasswordComponent
