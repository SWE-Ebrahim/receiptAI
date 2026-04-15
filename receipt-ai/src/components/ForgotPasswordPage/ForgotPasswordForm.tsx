import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface ForgotPasswordFormProps {
  step: 'email' | 'otp' | 'password'
  isLoading: boolean
  error: string
  success: string
  onSendOTP: (email: string) => Promise<void>
  onVerifyOTP: (otp: string) => Promise<void>
  onResetPassword: (newPassword: string, confirmPassword: string) => Promise<void>
}

const ForgotPasswordForm = ({ step, isLoading, error, success, onSendOTP, onVerifyOTP, onResetPassword }: ForgotPasswordFormProps) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault()
    onSendOTP(email)
  }

  const handleSubmitOTP = (e: React.FormEvent) => {
    e.preventDefault()
    onVerifyOTP(otp)
  }

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault()
    onResetPassword(newPassword, confirmPassword)
  }

  // Password requirements
  const hasMinLength = newPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_20px_40px_rgba(18,28,40,0.06)] space-y-6 border border-outline-variant/10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-on-surface leading-tight tracking-tight">
            {step === 'email' && 'Forgot Password?'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'password' && 'Reset Password'}
          </h2>
          <p className="text-on-surface-variant text-sm">
            {step === 'email' && 'Enter your email to receive a verification code'}
            {step === 'otp' && 'Enter the 6-digit code sent to your email'}
            {step === 'password' && 'Create a new secure password'}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-primary-container text-on-primary-container px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 'email' && (
          <form className="space-y-5" onSubmit={handleSubmitEmail}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">
                Email Address
              </label>
              <input 
                className="tap-target w-full px-6 py-3.5 bg-surface-container-low rounded-full border-2 border-transparent focus:border-primary-container focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 transition-all text-sm"
                placeholder="john@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button 
              className="tap-target w-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-base font-extrabold py-3.5 rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Sending...
                </span>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Input */}
        {step === 'otp' && (
          <form className="space-y-5" onSubmit={handleSubmitOTP}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">
                Verification Code
              </label>
              <input 
                className="tap-target w-full px-6 py-3.5 bg-surface-container-low rounded-full border-2 border-transparent focus:border-primary-container focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 transition-all text-center tracking-[12px] text-2xl font-bold"
                placeholder="000000"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <button 
              className="tap-target w-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-base font-extrabold py-3.5 rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Verifying...
                </span>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 'password' && (
          <form className="space-y-5" onSubmit={handleSubmitPassword}>
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">
                New Password
              </label>
              <div className="relative">
                <input 
                  className="tap-target w-full px-6 py-3.5 bg-surface-container-low rounded-full border-2 border-transparent focus:border-primary-container focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 transition-all text-sm pr-12"
                  placeholder="••••••••"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showNewPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="px-6 mt-2 space-y-1">
                <p className={`text-[10px] flex items-center gap-1 ${hasMinLength ? 'text-green-600' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-xs">{hasMinLength ? 'check_circle' : 'radio_button_unchecked'}</span>
                  At least 8 characters
                </p>
                <p className={`text-[10px] flex items-center gap-1 ${hasUppercase ? 'text-green-600' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-xs">{hasUppercase ? 'check_circle' : 'radio_button_unchecked'}</span>
                  One uppercase letter
                </p>
                <p className={`text-[10px] flex items-center gap-1 ${hasNumber ? 'text-green-600' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-xs">{hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
                  One number
                </p>
                <p className={`text-[10px] flex items-center gap-1 ${hasSpecial ? 'text-green-600' : 'text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-xs">{hasSpecial ? 'check_circle' : 'radio_button_unchecked'}</span>
                  One special character
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">
                Confirm Password
              </label>
              <div className="relative">
                <input 
                  className="tap-target w-full px-6 py-3.5 bg-surface-container-low rounded-full border-2 border-transparent focus:border-primary-container focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 transition-all text-sm pr-12"
                  placeholder="••••••••"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 ml-4">Passwords do not match</p>
              )}
            </div>

            <button 
              className="tap-target w-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-base font-extrabold py-3.5 rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading || newPassword !== confirmPassword || !hasMinLength || !hasUppercase || !hasNumber || !hasSpecial}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="pt-2 text-center">
          <button 
            className="text-sm text-primary font-semibold hover:underline"
            onClick={() => navigate('/login')}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
