/**
 * Help Center Modal
 * 
 * Displays FAQ and help information for users
 */
import { useState } from 'react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpCenterModal = ({ isOpen, onClose }: HelpCenterModalProps) => {
  const [activeSection, setActiveSection] = useState<'faq' | 'details'>('faq');

  // Load user data from localStorage
  const getUserData = () => {
    try {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        return JSON.parse(storedUserData);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
    return {};
  };

  const userData = getUserData();
  const displayName = userData.username || userData.display_name || userData.name || userData.email?.split('@')[0] || 'User';
  const email = userData.email || 'Not available';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-on-surface">Help Center</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-on-surface/60">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant/20 px-6">
          <button
            onClick={() => setActiveSection('faq')}
            className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeSection === 'faq'
                ? 'text-primary border-primary'
                : 'text-on-surface/60 hover:text-on-surface border-transparent'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveSection('details')}
            className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeSection === 'details'
                ? 'text-primary border-primary'
                : 'text-on-surface/60 hover:text-on-surface border-transparent'
            }`}
          >
            My Details
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {activeSection === 'faq' ? (
            <div className="space-y-6">
              {/* Why This System Section */}
              <section>
                <h3 className="text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">lightbulb</span>
                  Why This System?
                </h3>
                <p className="text-sm text-on-surface/70 leading-relaxed">
                  ReceiptAI provides a free, secure, and intelligent way to manage your receipts. 
                  No app installation required - works directly in your mobile browser with offline support 
                  and automatic currency conversion to AED.
                </p>
              </section>

              {/* FAQ Section */}
              <section>
                <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">help</span>
                  Frequently Asked Questions
                </h3>
                
                <div className="space-y-4">
                  {/* Q1 */}
                  <div className="p-4 rounded-2xl bg-surface-container-low">
                    <h4 className="font-medium text-on-surface mb-2 flex items-start gap-2">
                      <span className="text-primary font-bold">Q:</span>
                      Is it really free?
                    </h4>
                    <p className="text-sm text-on-surface/70 ml-6">
                      Yes! All tools used have generous free tiers. You won't pay anything for personal use.
                    </p>
                  </div>

                  {/* Q2 */}
                  <div className="p-4 rounded-2xl bg-surface-container-low">
                    <h4 className="font-medium text-on-surface mb-2 flex items-start gap-2">
                      <span className="text-primary font-bold">Q:</span>
                      Do I need to install an app?
                    </h4>
                    <p className="text-sm text-on-surface/70 ml-6">
                      No! It works in your mobile browser. You can optionally "Add to Home Screen" for app-like experience.
                    </p>
                  </div>

                  {/* Q3 */}
                  <div className="p-4 rounded-2xl bg-surface-container-low">
                    <h4 className="font-medium text-on-surface mb-2 flex items-start gap-2">
                      <span className="text-primary font-bold">Q:</span>
                      What if the AI misreads my receipt?
                    </h4>
                    <p className="text-sm text-on-surface/70 ml-6">
                      You can review and edit all extracted data before saving. The AI gets better with good quality photos.
                    </p>
                  </div>

                  {/* Q4 */}
                  <div className="p-4 rounded-2xl bg-surface-container-low">
                    <h4 className="font-medium text-on-surface mb-2 flex items-start gap-2">
                      <span className="text-primary font-bold">Q:</span>
                      Can I use it offline?
                    </h4>
                    <p className="text-sm text-on-surface/70 ml-6">
                      Yes! Scan receipts offline, they'll sync when you're back online.
                    </p>
                  </div>

                  {/* Q5 */}
                  <div className="p-4 rounded-2xl bg-surface-container-low">
                    <h4 className="font-medium text-on-surface mb-2 flex items-start gap-2">
                      <span className="text-primary font-bold">Q:</span>
                      Is my data secure?
                    </h4>
                    <p className="text-sm text-on-surface/70 ml-6">
                      Absolutely. All data is encrypted, and only you can access your receipts.
                    </p>
                  </div>

                  {/* Q6 */}
                  <div className="p-4 rounded-2xl bg-surface-container-low">
                    <h4 className="font-medium text-on-surface mb-2 flex items-start gap-2">
                      <span className="text-primary font-bold">Q:</span>
                      What receipt formats are supported?
                    </h4>
                    <p className="text-sm text-on-surface/70 ml-6">
                      Photos (JPG, PNG) and PDFs. Works with printed and handwritten receipts (printed works better).
                    </p>
                  </div>

                  {/* Q7 */}
                  <div className="p-4 rounded-2xl bg-surface-container-low">
                    <h4 className="font-medium text-on-surface mb-2 flex items-start gap-2">
                      <span className="text-primary font-bold">Q:</span>
                      Can I export my data?
                    </h4>
                    <p className="text-sm text-on-surface/70 ml-6">
                      Yes! Download individual PDF reports. CSV export coming soon.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Details Section */}
              <section>
                <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Account Information
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-surface-container-low">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-on-surface/60">Name</span>
                      <span className="text-sm font-medium text-on-surface capitalize">{displayName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-on-surface/60">Email</span>
                      <span className="text-sm font-medium text-on-surface">{email}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-container-low">
                    <h4 className="font-medium text-on-surface mb-3">Account Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-on-surface/60">Verification</span>
                        <span className="px-3 py-1 rounded-full bg-success-container text-success text-xs font-medium">Verified</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-on-surface/60">Currency</span>
                        <span className="text-sm font-medium text-on-surface">AED (UAE Dirham)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-on-surface/60">Language</span>
                        <span className="text-sm font-medium text-on-surface">English (US)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <section>
                <h3 className="text-lg font-semibold text-on-surface mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all text-left flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">edit</span>
                    <span className="text-sm font-medium text-on-surface">Edit Profile</span>
                  </button>
                  <button className="w-full p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all text-left flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">lock</span>
                    <span className="text-sm font-medium text-on-surface">Change Password</span>
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-lowest">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterModal;
