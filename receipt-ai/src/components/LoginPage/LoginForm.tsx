import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from './InputField'

interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => Promise<void>
  isLoading?: boolean
  error?: string
}

const LoginForm = ({ onSubmit, isLoading, error }: LoginFormProps) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit?.({ email, password })
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-[0_20px_40px_rgba(18,28,40,0.06)] space-y-6 border border-outline-variant/10">
        <div className="text-center lg:text-left space-y-2">
          <h2 className="text-2xl font-extrabold text-on-surface leading-tight tracking-tight">
            Welcome back!
          </h2>
          <p className="text-on-surface-variant text-sm">
            Sign in to continue managing your receipts.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <InputField 
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          {/* Password Field with Eye Icon */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">
              Password
            </label>
            <div className="relative">
              <input 
                className="tap-target w-full px-6 py-3.5 bg-surface-container-low rounded-full border-2 border-transparent focus:border-primary-container focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 transition-all text-sm pr-12"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end px-2">
            <button 
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button 
            className="tap-target w-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-base font-extrabold py-3.5 rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <a className="text-primary font-black hover:underline ml-1 inline-block py-1" href="/signup">
              Sign Up
            </a>
          </p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-on-surface-variant/60 px-6 leading-relaxed max-w-sm mx-auto">
          By signing in, you agree to our{' '}
          <a className="underline" href="#">Terms of Service</a>
          {' '}and{' '}
          <a className="underline" href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}

export default LoginForm
