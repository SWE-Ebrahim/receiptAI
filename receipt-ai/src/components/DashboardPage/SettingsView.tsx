/**
 * Settings View Component
 * 
 * Simplified settings with:
 * - Profile section (Edit name & password)
 * - Currency (AED only, fixed)
 * - Language (English only)
 * - Help Center modal with FAQ
 * - Privacy Policy PDF viewer
 * - About link to GitHub
 */
import { useState, useEffect } from 'react';
import EditProfileModal from './SettingsViewComponents/EditProfileModal';
import HelpCenterModal from './SettingsViewComponents/HelpCenterModal';
import PrivacyPolicyModal from './SettingsViewComponents/PrivacyPolicyModal';
import DeleteAllDataModal from './SettingsViewComponents/DeleteAllDataModal';
import useToast from '../../hooks/useToast';
import ToastContainer from '../Common/ToastContainer';

interface UserData {
  username?: string;
  display_name?: string;
  name?: string;
  email?: string;
}

const SettingsView = () => {
  const { toasts, success, error, info, warning, removeToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDeleteAllDataModalOpen, setIsDeleteAllDataModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        console.log('🔍 Loading user data for Settings:', user);
        setUserData(user);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
      error('Failed to load user data');
    }
  };

  // Get display name with fallback (prioritize name over username)
  const getDisplayName = (): string => {
    return userData.name || userData.display_name || userData.username || userData.email?.split('@')[0] || 'User';
  };

  // Get email with fallback
  const getEmail = (): string => {
    return userData.email || 'Not available';
  };

  const handleLogout = () => {
    // Clear auth token and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  };

  const handleNavigate = (page: string) => {
    // Navigate to different pages
    switch (page) {
      case 'help':
        setIsHelpModalOpen(true);
        break;
      case 'privacy':
        setIsPrivacyModalOpen(true);
        break;
      case 'about':
        window.open('https://github.com/SWE-Ebrahim/receiptAI', '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 px-6 pt-6 pb-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15">
        <h1 className="font-display text-2xl font-semibold text-on-surface">Settings</h1>
      </header>

      <div className="px-6 space-y-6">
        {/* Profile Section */}
        <section className="mt-6 p-6 rounded-[2rem] bg-gradient-to-br from-primary to-primary-container shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-4xl">person</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white capitalize">{getDisplayName()}</h2>
              <p className="text-sm text-white/80 mt-1">{getEmail()}</p>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="mt-3 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section>
          <h3 className="text-lg font-semibold text-on-surface mb-4">Account</h3>
          <div className="space-y-3">
            {/* Currency - Fixed to AED */}
            <div className="p-4 rounded-2xl bg-surface-container-low">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">payments</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-on-surface">Currency</h4>
                    <p className="text-xs text-on-surface/60 mt-0.5">AED (UAE Dirham) - Fixed</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Default</span>
              </div>
            </div>

            {/* Language - English Only */}
            <div className="p-4 rounded-2xl bg-surface-container-low">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">language</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-on-surface">Language</h4>
                    <p className="text-xs text-on-surface/60 mt-0.5">English (US)</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Active</span>
              </div>
            </div>
          </div>
        </section>

        {/* Data & Privacy */}
        <section>
          <h3 className="text-lg font-semibold text-on-surface mb-4">Data & Privacy</h3>
          <div className="space-y-3">
            <div 
              onClick={() => handleNavigate('privacy')}
              className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">security</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-on-surface">Privacy Policy</h4>
                    <p className="text-xs text-on-surface/60 mt-0.5">How we protect your data</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface/40">chevron_right</span>
              </div>
            </div>

            {/* Delete All Data Button */}
            <div 
              onClick={() => setIsDeleteAllDataModalOpen(true)}
              className="p-4 rounded-2xl bg-error-container/30 hover:bg-error-container/40 transition-all cursor-pointer border border-error/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-error flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">delete_forever</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-error">Delete All Data</h4>
                    <p className="text-xs text-error/60 mt-0.5">Download report & delete everything</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-error/40">chevron_right</span>
              </div>
            </div>
          </div>
        </section>

        {/* Support & About */}
        <section>
          <h3 className="text-lg font-semibold text-on-surface mb-4">Support</h3>
          <div className="space-y-3">
            <div 
              onClick={() => handleNavigate('help')}
              className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">help</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-on-surface">Help Center</h4>
                    <p className="text-xs text-on-surface/60 mt-0.5">FAQs and guides</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface/40">chevron_right</span>
              </div>
            </div>

            <div 
              onClick={() => handleNavigate('about')}
              className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">info</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-on-surface">About</h4>
                    <p className="text-xs text-on-surface/60 mt-0.5">Version 1.0.0</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface/40">chevron_right</span>
              </div>
            </div>
          </div>
        </section>

        {/* Logout Button */}
        <section className="pt-4 pb-8">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl bg-error-container text-error font-semibold hover:bg-error-container/80 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
          <p className="text-center text-xs text-on-surface/40 mt-4">
            © 2026 ReceiptAI. All rights reserved.
          </p>
        </section>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadUserData} // Refresh user data after successful update
      />

      {/* Help Center Modal */}
      <HelpCenterModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Delete All Data Modal */}
      <DeleteAllDataModal
        isOpen={isDeleteAllDataModalOpen}
        onClose={() => setIsDeleteAllDataModalOpen(false)}
        onSuccess={loadUserData}
        showToast={(message, type) => {
          if (type === 'success') success(message);
          else if (type === 'error') error(message);
          else if (type === 'info') info(message);
          else warning(message);
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default SettingsView
