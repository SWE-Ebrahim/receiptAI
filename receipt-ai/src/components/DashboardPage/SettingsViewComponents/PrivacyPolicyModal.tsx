/**
 * Privacy Policy Modal
 * 
 * Displays privacy policy in a clean, readable format similar to Help Center
 */

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal = ({ isOpen, onClose }: PrivacyPolicyModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-on-surface">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-on-surface/60">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="space-y-6">
            {/* Introduction */}
            <section>
              <div className="p-4 rounded-2xl bg-primary/10 border-l-4 border-primary mb-4">
                <p className="text-sm text-on-surface leading-relaxed">
                  <strong>Your Privacy Matters:</strong> ReceiptAI is committed to protecting your personal data and ensuring complete transparency about how we collect, use, and safeguard your information.
                </p>
              </div>
              <p className="text-xs text-on-surface/60 text-right">Last Updated: April 14, 2026</p>
            </section>

            {/* Section 1 */}
            <section>
              <h3 className="text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">database</span>
                1. Information We Collect
              </h3>
              
              <div className="space-y-3 ml-2">
                <div>
                  <h4 className="font-medium text-on-surface text-sm mb-2">1.1 Account Information</h4>
                  <ul className="space-y-1 text-sm text-on-surface/70">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Email address (for authentication)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Name (for personalization)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Password (encrypted and securely stored)
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-on-surface text-sm mb-2">1.2 Receipt Data</h4>
                  <ul className="space-y-1 text-sm text-on-surface/70">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Receipt images and PDFs you upload
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Extracted information (merchant name, date, amount, etc.)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Categories and tags you assign
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-on-surface text-sm mb-2">1.3 Usage Data</h4>
                  <ul className="space-y-1 text-sm text-on-surface/70">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Device information (browser type, operating system)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Access times and dates
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Features used within the application
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings</span>
                2. How We Use Your Information
              </h3>
              <p className="text-sm text-on-surface/70 mb-3">We use your information solely for the following purposes:</p>
              <ul className="space-y-2 text-sm text-on-surface/70 ml-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Service Delivery:</strong> To provide receipt scanning, storage, and organization features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Authentication:</strong> To verify your identity and secure your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Improvement:</strong> To enhance our AI accuracy and user experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Support:</strong> To respond to your inquiries and provide technical assistance</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">security</span>
                3. Data Storage & Security
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-surface-container-low">
                  <h4 className="font-medium text-on-surface text-sm mb-2">3.1 Encryption</h4>
                  <p className="text-sm text-on-surface/70">All data is encrypted both in transit (using HTTPS/TLS) and at rest (using industry-standard encryption algorithms).</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low">
                  <h4 className="font-medium text-on-surface text-sm mb-2">3.2 Access Control</h4>
                  <p className="text-sm text-on-surface/70">Only you can access your receipts and personal data. We implement strict access controls and authentication mechanisms.</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low">
                  <h4 className="font-medium text-on-surface text-sm mb-2">3.3 Storage Location</h4>
                  <p className="text-sm text-on-surface/70">Your data is stored on secure cloud servers with enterprise-grade security measures and regular backups.</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h3 className="text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">share</span>
                4. Data Sharing
              </h3>
              
              <div className="p-4 rounded-2xl bg-primary/10 border-l-4 border-primary mb-4">
                <p className="text-sm text-on-surface leading-relaxed">
                  <strong>We Do NOT Sell Your Data:</strong> ReceiptAI will never sell, rent, or share your personal information with third parties for marketing purposes.
                </p>
              </div>
              
              <p className="text-sm text-on-surface/70 mb-3">We may share data only in these limited circumstances:</p>
              <ul className="space-y-2 text-sm text-on-surface/70 ml-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Legal Requirements:</strong> When required by law or court order</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Service Providers:</strong> Trusted partners who help us operate (under strict confidentiality agreements)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Your Consent:</strong> When you explicitly give us permission</span>
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h3 className="text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                5. Your Rights
              </h3>
              <p className="text-sm text-on-surface/70 mb-3">You have the following rights regarding your personal data:</p>
              <ul className="space-y-2 text-sm text-on-surface/70 ml-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Access:</strong> Request a copy of your personal data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Correction:</strong> Update or correct inaccurate information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Deletion:</strong> Request deletion of your account and data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Export:</strong> Download your data in a portable format</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span><strong>Opt-out:</strong> Disable non-essential features</span>
                </li>
              </ul>
            </section>

            {/* Section 6-10 */}
            <section>
              <h3 className="text-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Additional Information
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-surface-container-low">
                  <h4 className="font-medium text-on-surface text-sm mb-2">6. Data Retention</h4>
                  <p className="text-sm text-on-surface/70">We retain your data for as long as your account is active. You can delete your account and all associated data at any time through the Settings page.</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low">
                  <h4 className="font-medium text-on-surface text-sm mb-2">7. Children's Privacy</h4>
                  <p className="text-sm text-on-surface/70">ReceiptAI is not intended for children under 13 years of age. We do not knowingly collect personal information from children.</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low">
                  <h4 className="font-medium text-on-surface text-sm mb-2">8. International Data Transfers</h4>
                  <p className="text-sm text-on-surface/70">Your data may be processed in countries outside your residence. We ensure appropriate safeguards are in place to protect your information.</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low">
                  <h4 className="font-medium text-on-surface text-sm mb-2">9. Changes to This Policy</h4>
                  <p className="text-sm text-on-surface/70">We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low">
                  <h4 className="font-medium text-on-surface text-sm mb-2">10. Contact Us</h4>
                  <p className="text-sm text-on-surface/70 mb-2">If you have questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
                  <ul className="space-y-1 text-sm text-on-surface/70 ml-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Email:</strong> swe.ebrahim@gmail.com</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>GitHub:</strong> github.com/SWE-Ebrahim/receiptAI</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
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

export default PrivacyPolicyModal;
