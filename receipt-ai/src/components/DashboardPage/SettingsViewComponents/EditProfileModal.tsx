/**
 * Edit Profile Modal
 * 
 * Allows users to edit their name and password with OTP verification
 */
import { useState } from 'react';
import useToast from '../../../hooks/useToast';

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback to refresh parent component
}

const EditProfileModal = ({ isOpen, onClose, onSuccess }: EditProfileModalProps) => {
  const { success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState<'name' | 'password'>('name');
  
  // Load user data from localStorage
  const getUserData = () => {
    try {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        return user.name || user.display_name || user.username || user.email?.split('@')[0] || 'User';
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
    return 'User';
  };

  const getUserEmail = () => {
    try {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        return user.email || '';
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
    return '';
  };

  const [name, setName] = useState(getUserData());
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP verification states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      error('Please enter your name');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        error('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update name');
      }

      // Update localStorage with new name (sync both name and display_name)
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        user.name = name.trim();
        user.display_name = name.trim(); // Keep display_name in sync
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      success('Name updated successfully!');
      
      // Notify parent to refresh
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error updating name:', err);
      error(err.message || 'Failed to update name. Please try again.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    // Step 1: Send OTP to user's email
    await handleSendOTP();
  };

  const handleSendOTP = async () => {
    setIsSendingOTP(true);
    const email = getUserEmail();
    
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send OTP');
      }

      setOtpSent(true);
      info(`OTP sent to ${email}. Please check your email.`);
      
      // Show debug OTP in development mode
      if (result.debug_otp) {
        console.log('\n🔐 DEVELOPMENT MODE - OTP Code:', result.debug_otp);
        console.log('💡 Use this code to verify\n');
      }
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      error(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTPAndChangePassword = async () => {
    if (!otpCode) {
      error('Please enter the OTP code');
      return;
    }

    setIsVerifyingOTP(true);
    const email = getUserEmail();
    
    try {
      // Step 1: Verify OTP
      const verifyResponse = await fetch(`${API_BASE}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyResult.message || 'Invalid OTP');
      }

      // Step 2: Change password
      const changeResponse = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const changeResult = await changeResponse.json();

      if (!changeResponse.ok) {
        throw new Error(changeResult.message || 'Failed to change password');
      }

      success('Password changed successfully!');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpCode('');
      setOtpSent(false);
      onClose();
    } catch (err: any) {
      console.error('Error changing password:', err);
      error(err.message || 'Failed to change password. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20">
          <h2 className="text-xl font-semibold text-on-surface">Edit Profile</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant/20">
          <button
            onClick={() => setActiveTab('name')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'name'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface/60 hover:text-on-surface'
            }`}
          >
            Change Name
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface/60 hover:text-on-surface'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Forms */}
        <div className="p-6">
          {activeTab === 'name' ? (
            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface/80 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Save Name
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {!otpSent ? (
                // Step 1: Enter current and new password
                <>
                  <div>
                    <label className="block text-sm font-medium text-on-surface/80 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/60 hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface/80 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface/80 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 rounded-xl border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={!currentPassword || !newPassword || !confirmPassword}
                      className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send OTP
                    </button>
                  </div>
                </>
              ) : (
                // Step 2: Enter OTP
                <>
                  <div className="p-4 rounded-2xl bg-primary/10 border-l-4 border-primary">
                    <p className="text-sm text-on-surface">
                      <strong>OTP Sent!</strong> Please check your email for the verification code.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface/80 mb-2">
                      Enter OTP Code
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-on-surface text-center text-2xl tracking-widest font-mono"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                      }}
                      className="flex-1 px-4 py-3 rounded-xl border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyOTPAndChangePassword}
                      disabled={!otpCode || otpCode.length !== 6 || isVerifyingOTP}
                      className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isVerifyingOTP ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">progress_activity</span>
                          Verifying...
                        </>
                      ) : (
                        'Verify & Change'
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isSendingOTP}
                    className="w-full py-2 text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    {isSendingOTP ? 'Sending...' : 'Resend OTP'}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
