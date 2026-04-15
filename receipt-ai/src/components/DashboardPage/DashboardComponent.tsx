/**
 * Dashboard Component
 * 
 * Features:
 * - Authentication check with auto-redirect if not logged in
 * - User information display (email, user ID)
 * - Session status indicators
 * - Manual logout functionality
 * - Placeholder for future dashboard features
 * 
 * Security:
 * - Validates auth tokens on mount
 * - Redirects to login if authentication is missing
 * - Clears sensitive data on logout
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DashboardComponent = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)

  /**
   * Check authentication status on component mount
   * Redirects to login if user is not authenticated
   */
  useEffect(() => {
    // Retrieve authentication data from localStorage
    const userData = localStorage.getItem('user_data')
    const authToken = localStorage.getItem('auth_token')

    if (!userData || !authToken) {
      // Not authenticated - redirect to login page
      navigate('/login')
      return
    }

    // Parse and set user data for display
    setUser(JSON.parse(userData))
  }, [navigate])

  /**
   * Handle user logout
   * Clears authentication data and redirects to login page
   */
  const handleLogout = () => {
    // Remove sensitive authentication data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    
    // Redirect to login page
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Header */}
      <header className="bg-surface-container-low border-b border-outline-variant/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
            <h1 className="text-xl font-bold text-on-surface">receiptAI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-on-surface-variant">
              <span className="font-medium">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-error-container text-on-error-container rounded-lg hover:brightness-110 transition-all text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-surface-container-lowest rounded-2xl shadow-lg p-8 border border-outline-variant/10">
          {/* Success Banner */}
          <div className="bg-primary-container text-on-primary-container px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
            <div>
              <h2 className="text-lg font-bold">Login Successful!</h2>
              <p className="text-sm opacity-90">You are now logged into your dashboard.</p>
            </div>
          </div>

          {/* User Info Card */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">Welcome to Your Dashboard</h3>
              <p className="text-on-surface-variant">This is a placeholder dashboard to verify your login is working correctly.</p>
            </div>

            {/* User Details */}
            <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
              <h4 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                User Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
                  <p className="text-sm text-on-surface font-medium">{user.email}</p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">User ID</label>
                  <p className="text-sm text-on-surface font-mono text-xs break-all">{user.id}</p>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">verified_user</span>
                <div>
                  <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase">Status</p>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">Authenticated</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">schedule</span>
                <div>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">Session</p>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Active (1h timeout)</p>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">dashboard</span>
                <div>
                  <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">Page</p>
                  <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">Dashboard</p>
                </div>
              </div>
            </div>

            {/* Features Coming Soon */}
            <div className="bg-surface-container-low rounded-xl p-6 border-2 border-dashed border-outline-variant/30">
              <div className="text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50">construction</span>
                <h4 className="text-lg font-semibold text-on-surface">Dashboard Features Coming Soon</h4>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                  This is a placeholder to verify your authentication is working. Full dashboard features will be implemented next.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-medium text-on-surface-variant">📊 Analytics</span>
                  <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-medium text-on-surface-variant">🧾 Receipts</span>
                  <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-medium text-on-surface-variant">💰 Expenses</span>
                  <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-medium text-on-surface-variant">📈 Reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-outline-variant/10 bg-surface">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-on-surface-variant/60">
            © 2024 receiptAI - Dashboard Placeholder
          </p>
        </div>
      </footer>
    </div>
  )
}

export default DashboardComponent
