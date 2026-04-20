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
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const DeleteAllDataModal = ({ isOpen, onClose, onSuccess, showToast }: DeleteAllDataModalProps) => {
  // Use passed showToast function if available, otherwise use local toast
  const localToast = useToast();
  const notify = showToast || ((message: string, type: any) => {
    // Fallback to local toast if showToast not provided
    if (type === 'success') localToast.success(message);
    else if (type === 'error') localToast.error(message);
    else if (type === 'info') localToast.info(message);
    else localToast.warning(message);
  });
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'confirm' | 'generating' | 'deleting' | 'complete'>('confirm');

  const handleDeleteAllData = async () => {
    if (confirmText !== 'DELETE ALL') {
      notify('Please type DELETE ALL to confirm', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        notify('Authentication required. Please login again.', 'error');
        setIsProcessing(false);
        return;
      }

      // Step 1: Check if there's any data to delete
      setStep('generating');
      console.log('📊 Checking for data to delete...');
      
      try {
        // Fetch all receipts
        const historyData = await scanApi.getHistory();
        console.log('📄 Fetched receipts:', historyData);
        
        // Check if user has any data
        if (!historyData || historyData.length === 0) {
          console.log('ℹ️ No receipts found');
          notify('You don\'t have any records to delete', 'info');
          setIsProcessing(false);
          setStep('confirm');
          return;
        }
        
        console.log(`✅ Found ${historyData.length} receipts to delete`);
        
        // Generate PDF with all receipts using professional styling
        const totalAmount = historyData.reduce((sum: number, r: any) => sum + (r.total_amount || 0), 0);
        const transactionCount = historyData.length;
        const averagePerReceipt = transactionCount > 0 ? totalAmount / transactionCount : 0;
        
        const largestExpense = historyData.reduce(
          (max: any, tx: any) => (tx.total_amount || 0) > (max.total_amount || 0) ? tx : max,
          historyData[0]
        );
        
        const categoryTotals: Record<string, number> = {};
        historyData.forEach((tx: any) => {
          const cat = tx.category || "Other";
          categoryTotals[cat] = (categoryTotals[cat] || 0) + (tx.total_amount || 0);
        });
        
        const sortedCategories = Object.entries(categoryTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([name, amount]) => ({
            name,
            amount,
            percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
          }));
        
        const topCategory = sortedCategories[0];
        const generatedDate = new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        
        const categoryColors: Record<string, string> = {
          "Food & Drink": "#1a7a5e",
          Groceries: "#1a7a5e",
          Transport: "#1a4f8a",
          Shopping: "#8a4a1a",
          Healthcare: "#8a1a4f",
          Utilities: "#4a4a6a",
          Entertainment: "#6a1a8a",
          Other: "#4a4a6a",
        };
        
        const getCategoryColor = (category: string) => {
          return categoryColors[category] || "#4a4a6a";
        };
        
        const getCategoryBadgeClass = (category: string) => {
          const cat = category.toLowerCase();
          if (cat.includes('food') || cat.includes('grocer') || cat.includes('drink')) return 'b-food';
          if (cat.includes('transport') || cat.includes('taxi') || cat.includes('metro')) return 'b-transport';
          if (cat.includes('shop') || cat.includes('market') || cat.includes('store')) return 'b-shopping';
          if (cat.includes('health') || cat.includes('medical')) return 'b-health';
          return 'b-other';
        };

          const reportHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>Complete Data Report - receiptAI</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                  --ink:      #0c1a12;
                  --teal:     #00b47d;
                  --teal-dk:  #007a55;
                  --teal-lt:  #e0f7ef;
                  --teal-mid: #b2ecd8;
                  --muted:    #6b8c7d;
                  --rule:     #daeee6;
                  --bg-row:   #f4fbf8;
                  --bg-card:  #f9fdfc;
                  --white:    #ffffff;
                  --accent:   #00e59b;
                  --gold:     #c9952a;
                  --gold-lt:  #fdf4e3;
                }

                @page {
                  size: A4;
                  margin: 0;
                  @bottom-center {
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 7pt;
                    color: #6b8c7d;
                    font-family: 'Sora', sans-serif;
                  }
                }

                html { font-size: 9pt; }

                body {
                  font-family: 'Sora', 'Segoe UI', sans-serif;
                  background: var(--white);
                  color: var(--ink);
                  line-height: 1.5;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }

                .page {
                  width: 210mm;
                  min-height: 297mm;
                  margin: 0 auto;
                  padding: 10mm 12mm 22mm;
                  position: relative;
                  background: white;
                }

                /* HEADER */
                .hd {
                  display: flex;
                  align-items: flex-start;
                  justify-content: space-between;
                  padding-bottom: 5mm;
                  margin-bottom: 5mm;
                  position: relative;
                }
                .hd::after {
                  content: '';
                  position: absolute;
                  bottom: 0; left: 0; right: 0;
                  height: 2px;
                  background: linear-gradient(90deg, var(--ink) 0%, var(--teal) 60%, transparent 100%);
                }
                .hd-logo { display: flex; align-items: center; gap: 7px; }
                .hd-icon {
                  width: 28px; height: 28px;
                  background: var(--ink);
                  border-radius: 7px;
                  display: flex; align-items: center; justify-content: center;
                  position: relative;
                  overflow: hidden;
                }
                .hd-icon::before {
                  content: '';
                  position: absolute;
                  top: -4px; right: -4px;
                  width: 12px; height: 12px;
                  background: var(--teal);
                  border-radius: 50%;
                }
                .hd-icon svg { width: 15px; height: 15px; fill: var(--white); position: relative; z-index: 1; }
                .hd-brand { font-size: 13pt; font-weight: 800; letter-spacing: -0.6px; color: var(--ink); }
                .hd-brand span { color: var(--teal); }
                .hd-right { text-align: right; }
                .hd-title { font-size: 15pt; font-weight: 800; letter-spacing: -0.7px; line-height: 1; color: var(--ink); }
                .hd-sub { font-size: 6.5pt; color: var(--muted); margin-top: 3px; font-weight: 500; letter-spacing: 0.3px; }
                .hd-badge {
                  display: inline-flex; align-items: center; gap: 3px;
                  margin-top: 4px;
                  background: var(--teal-lt); color: var(--teal-dk);
                  border: 1px solid var(--teal-mid);
                  border-radius: 99px; padding: 1.5px 7px;
                  font-size: 5.5pt; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
                }
                .hd-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--teal); display: inline-block; }

                /* INFO STRIP */
                .info-strip { display: flex; gap: 2.5mm; margin-bottom: 4.5mm; }
                .ic {
                  flex: 1; padding: 2.5mm 3mm;
                  background: var(--bg-card); border-radius: 6px;
                  border: 1px solid var(--rule); position: relative; overflow: hidden;
                }
                .ic::before {
                  content: ''; position: absolute;
                  top: 0; left: 0; width: 2px; height: 100%;
                  background: var(--teal);
                }
                .ic-l { font-size: 5.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); margin-bottom: 1px; }
                .ic-v { font-size: 8.5pt; font-weight: 700; color: var(--ink); }

                /* SUMMARY */
                .summary { display: flex; gap: 2.5mm; margin-bottom: 5mm; }
                .sb {
                  flex: 1; padding: 3.5mm 4mm;
                  border-radius: 8px; border: 1.5px solid var(--rule);
                  background: var(--bg-card); position: relative; overflow: hidden;
                }
                .sb::after {
                  content: ''; position: absolute;
                  bottom: 0; left: 0; right: 0; height: 2px;
                  border-radius: 0 0 8px 8px; background: var(--rule);
                }
                .sb.dark { background: var(--ink); border-color: var(--ink); }
                .sb.dark::after { background: var(--teal); }
                .sb.green { background: var(--teal-lt); border-color: var(--teal-mid); }
                .sb.green::after { background: var(--teal-dk); }
                .sb.gold { background: var(--gold-lt); border-color: #f0d8a0; }
                .sb.gold::after { background: var(--gold); }
                .sb-l { font-size: 5.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); margin-bottom: 2px; }
                .sb.dark .sb-l  { color: #5ecfa8; }
                .sb.green .sb-l { color: var(--teal-dk); }
                .sb.gold .sb-l  { color: var(--gold); }
                .sb-v { font-size: 13pt; font-weight: 800; letter-spacing: -0.6px; line-height: 1.1; color: var(--ink); }
                .sb.dark .sb-v  { color: var(--white); }
                .sb.green .sb-v { color: var(--teal-dk); }
                .sb.gold .sb-v  { color: var(--gold); }
                .sb-n { font-size: 6pt; color: var(--muted); margin-top: 2px; font-weight: 500; }
                .sb.dark .sb-n  { color: #5ecfa8; }
                .sb.green .sb-n { color: var(--teal-dk); }
                .sb.gold .sb-n  { color: var(--gold); opacity: 0.8; }

                /* SECTION HEADING */
                .sh {
                  font-size: 6pt; font-weight: 800; text-transform: uppercase;
                  letter-spacing: 1.2px; color: var(--muted);
                  display: flex; align-items: center; gap: 5px; margin-bottom: 3mm;
                }
                .sh-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--teal); flex-shrink: 0; display: inline-block; }
                .sh::after { content: ''; flex: 1; height: 1px; background: var(--rule); }

                /* CATEGORY BARS */
                .cats { margin-bottom: 5mm; }
                .cr { display: flex; align-items: center; gap: 2.5mm; margin-bottom: 2mm; }
                .cr-name { width: 26mm; font-size: 7.5pt; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ink); }
                .cr-track { flex: 1; height: 6px; background: var(--rule); border-radius: 99px; overflow: hidden; }
                .cr-fill { height: 100%; border-radius: 99px; }
                .cr-amt { width: 18mm; text-align: right; font-size: 7.5pt; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--ink); }
                .cr-pct { width: 9mm; text-align: right; font-size: 6.5pt; color: var(--muted); font-family: 'JetBrains Mono', monospace; }

                /* TABLE */
                .tbl-wrap { margin-bottom: 4.5mm; }
                table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
                thead { display: table-header-group; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead tr { background: var(--ink); }
                thead th {
                  font-size: 5.5pt; font-weight: 700; text-transform: uppercase;
                  letter-spacing: 0.8px; color: rgba(255,255,255,0.6);
                  padding: 2.5mm 2.5mm; text-align: left;
                }
                thead th:first-child { border-radius: 6px 0 0 0; padding-left: 3mm; }
                thead th:last-child  { border-radius: 0 6px 0 0; text-align: right; padding-right: 3mm; }
                tbody td {
                  font-size: 8pt; padding: 2.2mm 2.5mm;
                  border-bottom: 1px solid var(--rule);
                  vertical-align: middle; color: var(--ink);
                }
                tbody td:first-child { padding-left: 3mm; }
                tbody td:last-child  { text-align: right; font-weight: 700; padding-right: 3mm; font-family: 'JetBrains Mono', monospace; font-size: 7.5pt; }
                tbody tr:nth-child(even) td { background: var(--bg-row); }
                tbody tr:last-child td { border-bottom: none; }
                .num { font-family: 'JetBrains Mono', monospace; font-size: 6.5pt; color: var(--muted); font-weight: 500; }

                /* BADGES */
                .badge {
                  display: inline-block; padding: 1.5px 6px; border-radius: 99px;
                  font-size: 6pt; font-weight: 700; border: 1px solid; letter-spacing: 0.3px;
                }
                .b-food      { color: #1a7a5e; border-color: #a8ddd0; background: #e8f5f0; }
                .b-transport { color: #1a4f8a; border-color: #a8c4f0; background: #e8f0fc; }
                .b-shopping  { color: #8a4a1a; border-color: #f0c4a8; background: #fcf0e8; }
                .b-health    { color: #8a1a4f; border-color: #f0a8c4; background: #fce8f0; }
                .b-other     { color: #4a4a6a; border-color: #c4c4e0; background: #f0f0fc; }

                /* TOTALS BAR */
                .totals-bar {
                  display: flex; background: var(--ink); border-radius: 8px;
                  overflow: hidden; margin-bottom: 4.5mm;
                  border: 1px solid rgba(0,180,125,0.15);
                }
                .tc { flex: 1; padding: 3.5mm 3.5mm; border-right: 1px solid rgba(255,255,255,0.06); }
                .tc:last-child { border-right: none; }
                .tc-l { font-size: 5.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
                .tc-v { font-size: 10pt; font-weight: 800; color: var(--white); letter-spacing: -0.3px; font-family: 'JetBrains Mono', monospace; }
                .tc.accent .tc-l { color: var(--teal); }
                .tc.accent .tc-v { color: var(--accent); font-size: 11pt; }

                /* FOOTER */
                .foot {
                  position: absolute; bottom: 7mm; left: 12mm; right: 12mm;
                  display: flex; align-items: center; justify-content: space-between;
                  padding-top: 3mm; border-top: 1px solid var(--rule);
                }
                .foot-brand { font-size: 7.5pt; font-weight: 800; color: var(--teal-dk); letter-spacing: -0.3px; }
                .foot-brand span { color: var(--teal); }
                .foot-badge {
                  display: inline-flex; align-items: center; gap: 3px;
                  background: var(--ink); color: var(--white);
                  border-radius: 99px; padding: 2px 8px;
                  font-size: 5.5pt; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase;
                }
                .foot-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--teal); display: inline-block; }
                .foot-pg { font-size: 6.5pt; color: var(--muted); font-family: 'JetBrains Mono', monospace; }

                @media print {
                  @page { size: A4; margin: 0; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  .page { margin: 0; padding: 10mm 12mm 22mm; width: 210mm; min-height: 297mm; }
                }
              </style>
            </head>
            <body>
            <div class="page">

              <!-- HEADER -->
              <div class="hd">
                <div class="hd-logo">
                  <div class="hd-icon">
                    <svg viewBox="0 0 24 24"><path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3a3 3 0 003 3h12a3 3 0 003-3V2l-1.5 1.5zM19 19a1 1 0 01-2 0v-1H6V6h13v13zm-7-9h-3V8h3v2zm5 0h-3V8h3v2zm-5 4h-3v-2h3v2zm5 0h-3v-2h3v2z"/></svg>
                  </div>
                  <span class="hd-brand">receipt<span>AI</span></span>
                </div>
                <div class="hd-right">
                  <div class="hd-title">Complete Data Report</div>
                  <div class="hd-sub">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div class="hd-badge"><span class="hd-dot"></span> AI-Generated</div>
                </div>
              </div>

              <!-- INFO STRIP -->
              <div class="info-strip">
                <div class="ic"><div class="ic-l">Report Period</div><div class="ic-v">All Time</div></div>
                <div class="ic"><div class="ic-l">Generated</div><div class="ic-v">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
                <div class="ic"><div class="ic-l">Currency</div><div class="ic-v">AED (UAE Dirham)</div></div>
              </div>

              <!-- SUMMARY -->
              <div class="sh"><span class="sh-dot"></span>Summary</div>
              <div class="summary">
                <div class="sb dark">
                  <div class="sb-l">Total Spending</div>
                  <div class="sb-v">AED ${totalAmount.toFixed(2)}</div>
                  <div class="sb-n">${transactionCount} receipts scanned</div>
                </div>
                <div class="sb green">
                  <div class="sb-l">Receipts Scanned</div>
                  <div class="sb-v">${transactionCount}</div>
                  <div class="sb-n">Avg. AED ${averagePerReceipt.toFixed(2)} / receipt</div>
                </div>
                <div class="sb">
                  <div class="sb-l">Largest Expense</div>
                  <div class="sb-v">AED ${(largestExpense?.total_amount || 0).toFixed(2)}</div>
                  <div class="sb-n">${largestExpense?.merchant_name || 'N/A'}</div>
                </div>
                <div class="sb gold">
                  <div class="sb-l">Top Category</div>
                  <div class="sb-v">${topCategory?.name || 'N/A'}</div>
                  <div class="sb-n">AED ${(topCategory?.amount || 0).toFixed(2)} · ${(topCategory?.percentage || 0).toFixed(1)}%</div>
                </div>
              </div>

              <!-- CATEGORIES -->
              <div class="sh"><span class="sh-dot"></span>Spending by Category</div>
              <div class="cats">
                ${sortedCategories.map(cat => `
                  <div class="cr">
                    <div class="cr-name">${cat.name}</div>
                    <div class="cr-track"><div class="cr-fill" style="width:${cat.percentage.toFixed(1)}%;background:${getCategoryColor(cat.name)}"></div></div>
                    <div class="cr-amt">AED ${cat.amount.toFixed(2)}</div>
                    <div class="cr-pct">${cat.percentage.toFixed(1)}%</div>
                  </div>
                `).join('')}
              </div>

              <!-- TRANSACTIONS -->
              <div class="sh"><span class="sh-dot"></span>Transactions</div>
              <div class="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style="width:5%">#</th>
                      <th style="width:30%">Merchant</th>
                      <th style="width:13%">Date</th>
                      <th style="width:18%">Category</th>
                      <th style="width:17%; text-align:right; padding-right:3mm;">Amount (AED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${historyData.map((r: any, i: number) => `
                      <tr>
                        <td><span class="num">${String(i + 1).padStart(3, '0')}</span></td>
                        <td><strong>${r.merchant_name || 'Unknown'}</strong></td>
                        <td>${r.receipt_date ? new Date(r.receipt_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                        <td><span class="badge ${getCategoryBadgeClass(r.category || '')}">${r.category || 'Uncategorized'}</span></td>
                        <td>${(r.total_amount || 0).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- TOTALS BAR -->
              <div class="totals-bar">
                <div class="tc"><div class="tc-l">Subtotal</div><div class="tc-v">AED ${(totalAmount / 1.05).toFixed(2)}</div></div>
                <div class="tc"><div class="tc-l">Est. VAT (5%)</div><div class="tc-v">AED ${(totalAmount - totalAmount / 1.05).toFixed(2)}</div></div>
                <div class="tc"><div class="tc-l">Receipts</div><div class="tc-v">${transactionCount}</div></div>
                <div class="tc"><div class="tc-l">Avg / Receipt</div><div class="tc-v">AED ${averagePerReceipt.toFixed(2)}</div></div>
                <div class="tc accent"><div class="tc-l">Grand Total</div><div class="tc-v">AED ${totalAmount.toFixed(2)}</div></div>
              </div>

              <!-- FOOTER -->
              <div class="foot">
                <div class="foot-brand">receipt<span>AI</span></div>
                <span class="foot-badge"><span class="foot-dot"></span> Data Export Before Deletion</span>
                <div class="foot-pg">${new Date().toLocaleString()}</div>
              </div>

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
          notify('✅ Report ready - Save as PDF from print dialog', 'info');
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
      const response = await fetch('http://localhost:5000/api/categories/all', {
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
      notify('All data has been deleted and report downloaded', 'success');

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
      notify(err.message || 'Failed to delete all data', 'error');
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