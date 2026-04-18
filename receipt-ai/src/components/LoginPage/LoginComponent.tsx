/**
 * Login Component
 * 
 * Features:
 * - User authentication with email/password
 * - Auto-logout after 1 hour of inactivity
 * - Activity tracking (mouse, keyboard, scroll, touch)
 * - Error handling and loading states
 * - Secure token storage in localStorage
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import LoginForm from './LoginForm'
import Footer from './Footer'

const LoginComponent = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Auto-logout after 1 hour of inactivity
   * Resets timer on any user interaction (mouse, keyboard, scroll, touch)
   * Performance: Uses event delegation and proper cleanup to prevent memory leaks
   */
  useEffect(() => {
    const TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour in milliseconds
    let inactivityTimer: ReturnType<typeof setTimeout>

    // Debounced logout function to prevent multiple executions
    const performLogout = () => {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user_data')
      navigate('/login')
    }

    const resetTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(performLogout, TOKEN_EXPIRY)
    }

    // Start timer on component mount
    resetTimer()

    // Activity events that reset the timer
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    // Add event listeners with passive option for better scroll performance
    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true })
    })

    // Cleanup: Remove all event listeners and clear timer
    return () => {
      clearTimeout(inactivityTimer)
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [navigate])

  /**
   * Handle user login
   * Validates credentials, stores auth tokens, redirects to dashboard
   */
  const handleLogin = async (data: { email: string; password: string }) => {
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Login failed')
      }

      // Store authentication tokens securely
      localStorage.setItem('authToken', result.session.access_token)
      localStorage.setItem('user_data', JSON.stringify(result.user))

      // Redirect to dashboard on successful login
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col light">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-6xl w-full flex items-center justify-center">
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default LoginComponent
