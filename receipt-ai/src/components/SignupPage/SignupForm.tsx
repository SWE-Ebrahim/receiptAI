import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from './InputField'

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SignupFormProps {
  onSubmit?: (data: { name: string; email: string; password: string }) => void
}

const SignupForm = ({ onSubmit }: SignupFormProps) => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    // Simple password strength calculation
    let strength = 0
    if (value.length >= 8) strength++
    if (/[A-Z]/.test(value)) strength++
    if (/[0-9]/.test(value)) strength++
    if (/[^A-Za-z0-9]/.test(value)) strength++
    setPasswordStrength(strength)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Email validation - STRICT: Only allow real email providers
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    // Check for common email typos
    const emailDomain = email.split('@')[1]?.toLowerCase()
    const allowedDomains = [
      'gmail.com', 'googlemail.com',
      'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
      'yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.in', 'yahoo.co.jp',
      'icloud.com', 'me.com', 'mac.com',
      'protonmail.com', 'proton.me', 'pm.me',
      'aol.com',
      'zoho.com',
      'yandex.com', 'yandex.ru',
      'mail.com',
      'gmx.com', 'gmx.net', 'gmx.at', 'gmx.ch',
    ]

    const commonTypos: Record<string, string> = {
      'gail.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gnail.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'coldmail.com': 'gmail.com',
      'hotail.com': 'hotmail.com',
      'hotmal.com': 'hotmail.com',
      'hotmial.com': 'hotmail.com',
      'hotmil.com': 'hotmail.com',
      'outllok.com': 'outlook.com',
      'outlok.com': 'outlook.com',
      'outloo.com': 'outlook.com',
      'outlook.co': 'outlook.com',
      'yaho.com': 'yahoo.com',
      'yhaoo.com': 'yahoo.com',
      'yaoo.com': 'yahoo.com',
      'ycpoo.com': 'yahoo.com',
      'protonmal.com': 'protonmail.com',
    }

    if (commonTypos[emailDomain]) {
      setError(`Did you mean ${emailDomain.includes('hotail') ? 'hotmail.com' : commonTypos[emailDomain]}? Please check your email for typos.`)
      setIsLoading(false)
      return
    }

    // STRICT: Only allow whitelisted domains
    if (!allowedDomains.includes(emailDomain)) {
      setError('Please use a valid email from: Gmail, Outlook, Hotmail, Yahoo, iCloud, ProtonMail, AOL, or Zoho.')
      setIsLoading(false)
      return
    }

    // Client-side password validation
    const passwordErrors = []
    if (password.length < 8) {
      passwordErrors.push('Password must be at least 8 characters')
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('Password must contain at least one uppercase letter')
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push('Password must contain at least one number')
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      passwordErrors.push('Password must contain at least one special character')
    }

    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '))
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed')
      }

      // Show OTP in development mode
      if (data.debug_otp) {
        console.log('\n🔐 DEVELOPMENT MODE - OTP Code:', data.debug_otp);
        console.log('💡 Use this code to verify your email\n');
        alert(`DEVELOPMENT MODE\n\nYour OTP code is: ${data.debug_otp}\n\nUse this code on the verification page.`);
      }

      // Check if user needs verification
      if (data.requiresVerification) {
        // User exists but not verified, redirect to OTP page
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
      } else {
        // New user, redirect to OTP verification page with email
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-10">
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_20px_40px_rgba(18,28,40,0.06)] space-y-6 border border-outline-variant/10">
        <div className="text-center lg:text-left space-y-2">
          <h2 className="text-2xl font-extrabold text-on-surface leading-tight tracking-tight">
            Join thousands of smart spenders today.
          </h2>
          <p className="text-on-surface-variant text-sm">
            Start your 14-day free trial. No credit card required.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <InputField 
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <InputField 
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <InputField 
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            showStrength={true}
            strengthLevel={passwordStrength}
            helperText="Minimum 8 characters with one special symbol."
          />

          <button 
            className="tap-target w-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-base font-extrabold py-3.5 rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create My Account'}
          </button>

          {error && (
            <div className="bg-error-container/50 border border-error/30 rounded-lg p-3 text-center">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}
        </form>

        <div className="pt-2 text-center">
          <p className="text-sm text-on-surface-variant">
            Already have an account?{' '}
            <a className="text-primary font-black hover:underline ml-1 inline-block py-1" href="/login">
              Log In
            </a>
          </p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-on-surface-variant/60 px-6 leading-relaxed max-w-sm mx-auto">
          By signing up, you agree to our{' '}
          <a className="underline" href="#">Terms of Service</a>
          {' '}and{' '}
          <a className="underline" href="#">Privacy Policy</a>.{' '}
          Your data is secured with AES-256 encryption.
        </p>
      </div>
    </div>
  )
}

export default SignupForm
