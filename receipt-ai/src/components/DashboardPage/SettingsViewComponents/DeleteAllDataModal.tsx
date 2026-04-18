/**
 * Delete All Data Modal
 * 
 * Generates a PDF report of all user data, then deletes everything (receipts + categories)
 */
import { useState } from 'react';
import useToast from '../../../hooks/useToast';
import { scanApi } from '../../../services/scanApi';
import { generateReceiptPDF } from '../../../services/receiptsApi';

interface DeleteAllDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DeleteAllDataModal = ({ isOpen, onClose, onSuccess }: DeleteAllDataModalProps) => {
  const { success, error, info } = useToast();
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'confirm' | 'generating' | 'deleting' | 'complete'>('confirm');

  const handleDeleteAllData = async () => {
    if (confirmText !== 'DELETE ALL') {
      error('Please type DELETE ALL to confirm');
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        error('Authentication required. Please login again.');
        setIsProcessing(false);
        return;
      }

      // Step 1: Generate PDF Report
      setStep('generating');
      console.log('📊 Generating complete data report...');
      
      try {
        // Fetch all receipts
        const historyData = await scanApi.getHistory();
        console.log('📄 Fetched receipts for report:', historyData);
        
        if (historyData && historyData.length > 0) {
          // Generate PDF with all receipts
          // Create a professional HTML report that will be converted to PDF
          const reportHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Complete Data Report - ReceiptAI</title>
              <style>
                @page { 
                  size: A4; 
                  margin: 20mm; 
                  @bottom-center {
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 10pt;
                    color: #666;
                  }
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Segoe UI', Arial, sans-serif; 
                  padding: 0;
                  color: #1c1b1f;
                  line-height: 1.6;
                }
                .header {
                  text-align: center;
                  padding: 40px 20px 30px;
                  border-bottom: 4px solid #6750A4;
                  margin-bottom: 30px;
                }
                .logo {
                  font-size: 32px;
                  margin-bottom: 10px;
                }
                h1 { 
                  color: #6750A4; 
                  font-size: 28px;
                  margin-bottom: 8px;
                }
                .subtitle { 
                  color: #666; 
                  font-size: 14px;
                  margin-bottom: 5px;
                }
                .stats {
                  display: flex;
                  justify-content: space-around;
                  margin: 30px 0;
                  padding: 20px;
                  background: #f5f5f5;
                  border-radius: 12px;
                }
                .stat-item {
                  text-align: center;
                }
                .stat-value {
                  font-size: 24px;
                  font-weight: bold;
                  color: #6750A4;
                }
                .stat-label {
                  font-size: 12px;
                  color: #666;
                  margin-top: 5px;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-top: 30px;
                  page-break-inside: auto;
                }
                thead {
                  display: table-header-group;
                }
                tr {
                  page-break-inside: avoid;
                  page-break-after: auto;
                }
                th, td { 
                  padding: 12px 10px; 
                  text-align: left; 
                  border-bottom: 1px solid #ddd;
                  font-size: 13px;
                }
                th { 
                  background: #6750A4; 
                  color: white;
                  font-weight: 600;
                  text-transform: uppercase;
                  font-size: 11px;
                  letter-spacing: 0.5px;
                }
                tr:nth-child(even) {
                  background: #f9f9f9;
                }
                .total { 
                  font-size: 20px; 
                  font-weight: bold; 
                  color: #6750A4; 
                  margin-top: 30px;
                  padding: 20px;
                  background: #f5f5f5;
                  border-radius: 12px;
                  text-align: center;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 2px solid #ddd;
                  text-align: center;
                  color: #666;
                  font-size: 12px;
                }
                .category-badge {
                  display: inline-block;
                  padding: 4px 12px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 600;
                  background: #e8e8e8;
                  color: #333;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">🧾</div>
                <h1>Complete Data Report</h1>
                <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p class="subtitle">ReceiptAI - Your Personal Finance Tracker</p>
              </div>
              
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-value">${historyData.length}</div>
                  <div class="stat-label">Total Receipts</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">AED ${historyData.reduce((sum: number, r: any) => sum + (r.total_amount || 0), 0).toFixed(2)}</div>
                  <div class="stat-label">Total Amount</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">AED ${(historyData.reduce((sum: number, r: any) => sum + (r.total_amount || 0), 0) / Math.max(historyData.length, 1)).toFixed(2)}</div>
                  <div class="stat-label">Average per Receipt</div>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th style="width: 50px;">#</th>
                    <th>Merchant</th>
                    <th style="width: 120px;">Date</th>
                    <th style="width: 130px;">Category</th>
                    <th style="width: 120px; text-align: right;">Amount (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  ${historyData.map((r: any, i: number) => `
                    <tr>
                      <td>${i + 1}</td>
                      <td><strong>${r.merchant_name || 'Unknown'}</strong></td>
                      <td>${r.receipt_date ? new Date(r.receipt_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                      <td><span class="category-badge">${r.category || 'Uncategorized'}</span></td>
                      <td style="text-align: right; font-weight: 600;">${(r.total_amount || 0).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="total">
                Total Amount: AED ${historyData.reduce((sum: number, r: any) => sum + (r.total_amount || 0), 0).toFixed(2)}
              </div>
              
              <div class="footer">
                <p><strong>ReceiptAI</strong> - Smart Receipt Management</p>
                <p style="margin-top: 5px;">This report contains all your receipt data before deletion</p>
                <p style="margin-top: 5px; font-size: 11px; color: #999;">Generated automatically on ${new Date().toLocaleString()}</p>
              </div>
            </body>
            </html>
          `;

          // Create blob and open in new window for PDF printing
          const blob = new Blob([reportHtml], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const printWindow = window.open(url, '_blank');
          
          if (printWindow) {
            // Wait for content to load then trigger print
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print();
                // Clean up after print dialog closes
                setTimeout(() => {
                  URL.revokeObjectURL(url);
                }, 1000);
              }, 500);
            };
          } else {
            // Fallback: direct download
            const link = document.createElement('a');
            link.href = url;
            link.download = `receiptai-complete-data-${new Date().toISOString().split('T')[0]}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }

          console.log('✅ Report generated for PDF printing');
          info('✅ Report ready - Save as PDF from print dialog');
        } else {
          console.log('ℹ️ No receipts to report');
        }
      } catch (pdfError) {
        console.warn('PDF generation warning:', pdfError);
        // Continue with deletion even if PDF fails
      }

      // Step 2: Delete all receipts
      setStep('deleting');
      console.log('🗑️ Deleting all receipts...');
      await scanApi.deleteAllReceipts();

      // Step 3: Delete all custom categories
      console.log('🗑️ Deleting all custom categories...');
      const response = await fetch('http://localhost:5000/api/scan/categories', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete categories');
      }

      // Step 4: Complete
      setStep('complete');
      console.log('✅ All data deleted successfully');
      success('All data has been deleted and report downloaded');

      // Reset and close after delay
      setTimeout(() => {
        setConfirmText('');
        setStep('confirm');
        if (onSuccess) onSuccess();
        onClose();
        setIsProcessing(false);
      }, 2000);

    } catch (err: any) {
      console.error('Failed to delete all data:', err);
      error(err.message || 'Failed to delete all data');
      setIsProcessing(false);
      setStep('confirm');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isProcessing ? onClose : undefined} />

      {/* Modal */}
      <div className="relative bg-surface rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden">
        {/* Danger Header */}
        <div className="bg-gradient-to-br from-error to-error-container p-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4 animate-pulse">
            <span className="material-symbols-outlined text-white text-5xl">warning</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Delete All Data</h2>
          <p className="text-white/80 text-sm mt-2">This action cannot be undone</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {step === 'confirm' && (
            <>
              <p className="text-on-surface text-center font-medium">
                This will generate a complete PDF report of all your data, then permanently delete everything!
              </p>

              <div className="space-y-3">
                <div className="p-4 bg-primary-container/30 rounded-2xl border border-primary/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <div>
                      <p className="text-on-surface font-medium text-sm">Step 1: Generate Report</p>
                      <p className="text-on-surface/60 text-xs">Download complete data as PDF</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-error-container/30 rounded-2xl border border-error/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-error">delete_forever</span>
                    <div>
                      <p className="text-on-surface font-medium text-sm">Step 2: Delete Everything</p>
                      <p className="text-on-surface/60 text-xs">Remove all receipts and categories</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-on-surface">
                  Type <span className="font-bold text-error">DELETE ALL</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant focus:border-primary focus:outline-none text-on-surface"
                  placeholder="Type DELETE ALL here"
                />
              </div>
            </>
          )}

          {step === 'generating' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-on-surface font-medium">Generating your data report...</p>
              <p className="text-on-surface/60 text-sm">Creating PDF with all your receipts</p>
            </div>
          )}

          {step === 'deleting' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-error border-t-transparent rounded-full animate-spin" />
              <p className="text-on-surface font-medium">Deleting all data...</p>
              <p className="text-on-surface/60 text-sm">Removing receipts and categories</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-success text-4xl">check_circle</span>
              </div>
              <p className="text-on-surface font-medium">Data Deleted Successfully!</p>
              <p className="text-on-surface/60 text-sm">Your report has been downloaded</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {step === 'confirm' && (
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-surface-container text-on-surface font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAllData}
              disabled={confirmText !== 'DELETE ALL' || isProcessing}
              className={`flex-1 py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
                confirmText === 'DELETE ALL' && !isProcessing
                  ? 'bg-error text-on-error-container hover:bg-error/90'
                  : 'bg-error/30 text-on-surface/40 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-sm">delete_forever</span>
              Delete All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteAllDataModal;
