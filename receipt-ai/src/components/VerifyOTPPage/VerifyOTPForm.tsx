import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import OTPInput from './OTPInput'

interface VerifyOTPFormProps {
  onVerifySuccess?: () => void
}

const VerifyOTPForm = ({ onVerifySuccess }: VerifyOTPFormProps) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email') || ''
  
  const [otpCode, setOtpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    if (!email) {
      navigate('/signup')
    }
  }, [email, navigate])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleOTPComplete = (code: string) => {
    setOtpCode(code)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
      }

      setSuccess('Email verified successfully! Redirecting...')
      
      // Wait a moment then redirect or call callback
      setTimeout(() => {
        if (onVerifySuccess) {
          onVerifySuccess()
        } else {
          navigate('/login')
        }
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP')
      setOtpCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP')
      }

      setSuccess('New verification code sent!')
      setResendTimer(60) // 60 seconds cooldown
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_20px_40px_rgba(18,28,40,0.06)] space-y-6 border border-outline-variant/10">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-primary-container/20 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-3xl" data-icon="mark_email_unread">
              mark_email_unread
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-on-surface leading-tight tracking-tight">
            Verify Your Email
          </h2>
          <p className="text-on-surface-variant text-sm">
            We sent a 6-digit code to
          </p>
          <p className="text-primary font-semibold text-sm">
            {email}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4 block text-center">
              Enter Verification Code
            </label>
            <OTPInput length={6} onComplete={handleOTPComplete} />
          </div>

          {error && (
            <div className="bg-error-container/50 border border-error/30 rounded-lg p-3 text-center">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-primary-container/20 border border-primary/30 rounded-lg p-3 text-center">
              <p className="text-primary text-sm font-medium">{success}</p>
            </div>
          )}

          <button 
            className="tap-target w-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-base font-extrabold py-3.5 rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading || otpCode.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="text-center space-y-3">
          <p className="text-sm text-on-surface-variant">
            Didn't receive the code?{' '}
            <button 
              onClick={handleResendOTP}
              disabled={resendTimer > 0 || isLoading}
              className="text-primary font-black hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
            </button>
          </p>
          
          <p className="text-xs text-on-surface-variant/60">
            Check your spam folder if you don't see the email
          </p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-on-surface-variant/60 px-6 leading-relaxed max-w-sm mx-auto">
          The verification code will expire in 10 minutes.{' '}
          <a className="underline" href="/signup">
            Use a different email?
          </a>
        </p>
      </div>
    </div>
  )
}

export default VerifyOTPForm
