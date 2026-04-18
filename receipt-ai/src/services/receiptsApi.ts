/**
 * Receipts API Service
 *
 * Handles all receipt-related API calls:
 * - Fetch weekly spending summary
 * - Fetch recent activity
 * - Upload receipts
 */

import { apiGet, apiPost } from "../services/api";
import html2pdf from "html2pdf.js";

export interface WeeklySpendingData {
  totalSpending: number;
  currency: string;
  percentageChange: number;
  dailyBreakdown: number[];
  receiptCount: number;
}

export interface RecentActivityItem {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
}

/**
 * Get spending summary for a specific duration
 */
export const getSpendingSummary = async (
  duration: string,
  startDate?: string,
  endDate?: string,
): Promise<WeeklySpendingData> => {
  try {
    let url = `/receipts/spending-summary?duration=${duration}`;

    // Add custom date range parameters if provided
    if (duration === "custom" && startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await apiGet(url);

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch spending summary");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching spending summary:", error);
    throw error;
  }
};

/**
 * Get weekly spending summary (legacy, for backward compatibility)
 */
export const getWeeklySpending = async (): Promise<WeeklySpendingData> => {
  return getSpendingSummary("weekly");
};

/**
 * Get receipt history with duration filter
 */
export const getReceiptHistory = async (duration: string): Promise<any[]> => {
  try {
    const response = await apiGet(`/receipts/history?duration=${duration}`);

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch receipt history");
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching receipt history:", error);
    throw error;
  }
};

/**
 * Get category breakdown for duration
 */
export const getCategoryBreakdown = async (duration: string): Promise<any> => {
  try {
    const response = await apiGet(
      `/receipts/category-breakdown?duration=${duration}`,
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch category breakdown");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching category breakdown:", error);
    throw error;
  }
};

/**
 * Get recent activity (last 5 receipts)
 */
export const getRecentActivity = async (): Promise<RecentActivityItem[]> => {
  try {
    const response = await apiGet("/receipts/recent-activity");

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch recent activity");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw error;
  }
};

/**
 * Upload a receipt
 */
export const uploadReceipt = async (data: {
  fileUrl: string;
  fileType: string;
  extractedData?: {
    merchantName?: string;
    date?: string;
    amount?: number;
  };
}) => {
  try {
    const response = await apiPost("/receipts/upload", data);

    if (!response.success) {
      throw new Error(response.message || "Failed to upload receipt");
    }

    return response.data;
  } catch (error) {
    console.error("Error uploading receipt:", error);
    throw error;
  }
};

/**
 * Update receipt details
 */
export const updateReceipt = async (
  id: string,
  data: {
    merchant_name?: string;
    receipt_date?: string;
    total_amount?: number;
    category_id?: string;
    notes?: string;
  },
) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`http://localhost:5000/api/receipts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update receipt");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to update receipt");
    }

    return result.data;
  } catch (error) {
    console.error("Error updating receipt:", error);
    throw error;
  }
};

/**
 * Delete receipt
 */
export const deleteReceipt = async (id: string) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`http://localhost:5000/api/receipts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete receipt");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete receipt");
    }

    return result;
  } catch (error) {
    console.error("Error deleting receipt:", error);
    throw error;
  }
};

/**
 * Export transactions as HTML report (Professional A4 format)
 */
export const exportTransactionsPDF = async (
  transactions: any[],
  duration: string = "all",
) => {
  if (!transactions || transactions.length === 0) {
    console.warn("No transactions to export");
    return;
  }

  try {
    // =========================
    // CALCULATIONS (UNCHANGED)
    // =========================
    const totalAmount = transactions.reduce(
      (sum, tx) => sum + (tx.total_amount || 0),
      0,
    );

    const transactionCount = transactions.length;

    const averagePerReceipt =
      transactionCount > 0 ? totalAmount / transactionCount : 0;

    const largestExpense = transactions.reduce(
      (max, tx) =>
        (tx.total_amount || 0) > (max.total_amount || 0) ? tx : max,
      transactions[0],
    );

    const categoryTotals: Record<string, number> = {};
    transactions.forEach((tx) => {
      const cat = tx.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (tx.total_amount || 0);
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / totalAmount) * 100,
      }));

    const topCategory = sortedCategories[0];

    // =========================
    // DATE FORMATTING
    // =========================
    const formatDateRange = () => {
      const now = new Date();
      switch (duration) {
        case "today":
          return now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        case "weekly":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return `${weekAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
        case "monthly":
          return now.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
        case "all":
          return "All Time";
        default:
          return now.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
      }
    };

    const dateRange = formatDateRange();
    const generatedDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // =========================
    // CATEGORY COLORS
    // =========================
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

    // =========================
    // HTML WITH EXACT Report.html STYLING
    // =========================
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>receiptAI — Expense Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink:     #0a1a14;
      --teal:    #1a7a5e;
      --teal-lt: #e8f5f0;
      --muted:   #7a9a8e;
      --rule:    #d4e4dc;
      --bg-row:  #f6faf8;
      --white:   #ffffff;
    }

    html { font-size: 9pt; }

    body {
      font-family: 'DM Sans', 'Segoe UI', sans-serif;
      background: var(--white);
      color: var(--ink);
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 9mm 10mm 18mm;
      position: relative;
      background: white;
    }

    /* HEADER */
    .hd {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 4.5mm;
      border-bottom: 1.8px solid var(--ink);
      margin-bottom: 4.5mm;
    }

    .hd-logo { display: flex; align-items: center; gap: 6px; }

    .hd-icon {
      width: 26px; height: 26px;
      background: var(--ink);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
    }

    .hd-icon svg { width: 15px; height: 15px; fill: var(--white); }

    .hd-brand { font-size: 12pt; font-weight: 800; letter-spacing: -0.4px; }

    .hd-right { text-align: right; }

    .hd-title { font-size: 14pt; font-weight: 800; letter-spacing: -0.5px; line-height: 1; }

    .hd-sub { font-size: 7pt; color: var(--muted); margin-top: 2px; }

    /* INFO STRIP */
    .info-strip { display: flex; gap: 2.5mm; margin-bottom: 4.5mm; }

    .ic {
      flex: 1;
      padding: 3mm 3.5mm;
      background: var(--bg-row);
      border-radius: 6px;
      border: 1px solid var(--rule);
    }

    .ic-l {
      font-size: 6pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: var(--muted);
      margin-bottom: 1px;
    }

    .ic-v { font-size: 8.5pt; font-weight: 700; }

    /* SUMMARY */
    .summary { display: flex; gap: 2.5mm; margin-bottom: 4.5mm; }

    .sb {
      flex: 1;
      padding: 3.5mm;
      border-radius: 7px;
      border: 1.5px solid var(--rule);
    }

    .sb.dark { background: var(--ink); border-color: var(--ink); }
    .sb.green { background: var(--teal-lt); border-color: var(--teal); }

    .sb-l {
      font-size: 6pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: var(--muted);
      margin-bottom: 2px;
    }

    .sb.dark .sb-l { color: #6abfa0; }
    .sb.green .sb-l { color: var(--teal); }

    .sb-v { font-size: 14pt; font-weight: 800; letter-spacing: -0.5px; line-height: 1; }
    .sb.dark .sb-v { color: var(--white); }
    .sb.green .sb-v { color: var(--teal); }

    .sb-n { font-size: 6.5pt; color: var(--muted); margin-top: 2px; }
    .sb.dark .sb-n { color: #6abfa0; }

    /* SECTION HEADING */
    .sh {
      font-size: 6.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2.5mm;
    }

    .sh::after { content: ''; flex: 1; height: 1px; background: var(--rule); }

    /* CATEGORY BARS */
    .cats { margin-bottom: 4.5mm; }

    .cr { display: flex; align-items: center; gap: 2.5mm; margin-bottom: 1.8mm; }

    .cr-name {
      width: 25mm;
      font-size: 7.5pt;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cr-track {
      flex: 1;
      height: 5px;
      background: var(--rule);
      border-radius: 99px;
      overflow: hidden;
    }

    .cr-fill { height: 100%; border-radius: 99px; }

    .cr-amt { width: 17mm; text-align: right; font-size: 7.5pt; font-weight: 700; }
    .cr-pct { width: 8mm; text-align: right; font-size: 6.5pt; color: var(--muted); }

    /* TABLE */
    .tbl-wrap { margin-bottom: 4.5mm; }

    table { width: 100%; border-collapse: collapse; }

    thead th {
      font-size: 6pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: var(--muted);
      padding: 2mm 2.5mm;
      text-align: left;
      background: var(--bg-row);
      border-top: 1.5px solid var(--ink);
      border-bottom: 1px solid var(--rule);
    }

    thead th:last-child { text-align: right; }

    tbody td {
      font-size: 8pt;
      padding: 2mm 2.5mm;
      border-bottom: 1px solid var(--rule);
      vertical-align: middle;
    }

    tbody tr:last-child td { border-bottom: none; }
    tbody tr:nth-child(even) td { background: var(--bg-row); }
    tbody td:last-child { text-align: right; font-weight: 700; }

    .num { font-family: 'DM Mono', monospace; font-size: 7pt; color: var(--muted); }

    .badge {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 99px;
      font-size: 6.5pt;
      font-weight: 600;
      border: 1px solid;
    }

    .b-food      { color: #1a7a5e; border-color: #a8ddd0; background: #e8f5f0; }
    .b-transport { color: #1a4f8a; border-color: #a8c4f0; background: #e8f0fc; }
    .b-shopping  { color: #8a4a1a; border-color: #f0c4a8; background: #fcf0e8; }
    .b-health    { color: #8a1a4f; border-color: #f0a8c4; background: #fce8f0; }
    .b-other     { color: #4a4a6a; border-color: #c4c4e0; background: #f0f0fc; }
    .b-done      { color: #1a7a5e; border-color: #a8ddd0; background: #e8f5f0; }

    /* TOTALS BAR */
    .totals-bar {
      display: flex;
      background: var(--ink);
      border-radius: 7px;
      overflow: hidden;
      margin-bottom: 4mm;
    }

    .tc {
      flex: 1;
      padding: 3mm 3.5mm;
      border-right: 1px solid #1e3028;
    }

    .tc:last-child { border-right: none; }

    .tc-l {
      font-size: 6pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: #6abfa0;
      margin-bottom: 2px;
    }

    .tc-v { font-size: 10pt; font-weight: 800; color: var(--white); letter-spacing: -0.3px; }
    .tc.accent .tc-v { color: #5de8bc; }

    /* FOOTER */
    .foot {
      position: absolute;
      bottom: 7mm; left: 10mm; right: 10mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 2.5mm;
      border-top: 1px solid var(--rule);
    }

    .foot-brand { font-size: 7pt; font-weight: 800; color: var(--teal); }

    .foot-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: var(--ink);
      color: var(--white);
      border-radius: 99px;
      padding: 1px 6px;
      font-size: 6pt;
      font-weight: 700;
    }

    .foot-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--teal); }
    .foot-pg { font-size: 6.5pt; color: var(--muted); }

    @media print {
      @page {
        size: A4;
        margin: 0;
      }
      
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .page {
        margin: 0;
        padding: 9mm 10mm 18mm;
        width: 210mm;
        min-height: 297mm;
      }
    }
    
    /* Mobile optimizations */
    @media screen and (max-width: 768px) {
      .page {
        padding: 5mm 5mm 10mm;
      }
      
      .hd-title { font-size: 12pt; }
      .hd-sub { font-size: 6pt; }
      
      .info-strip {
        flex-direction: column;
        gap: 1.5mm;
      }
      
      .summary {
        flex-direction: column;
        gap: 1.5mm;
      }
      
      .cr-name { width: 20mm; font-size: 7pt; }
      .cr-amt { width: 15mm; font-size: 7pt; }
      .cr-pct { width: 7mm; font-size: 6pt; }
      
      table { font-size: 7pt; }
      thead th { padding: 1.5mm 2mm; font-size: 5.5pt; }
      tbody td { padding: 1.5mm 2mm; font-size: 7pt; }
      
      .totals-bar {
        flex-wrap: wrap;
      }
      
      .tc {
        flex: 1 1 45%;
        border-right: none;
        border-bottom: 1px solid #1e3028;
      }
      
      .foot {
        position: relative;
        bottom: auto;
        left: auto;
        right: auto;
        margin-top: 5mm;
      }
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
      <span class="hd-brand">receiptAI</span>
    </div>
    <div class="hd-right">
      <div class="hd-title">Expense Report</div>
      <div class="hd-sub">AI-Powered Financial Summary &nbsp;·&nbsp; receiptAI</div>
    </div>
  </div>

  <!-- INFO STRIP -->
  <div class="info-strip">
    <div class="ic"><div class="ic-l">Report Period</div><div class="ic-v">${dateRange}</div></div>
    <div class="ic"><div class="ic-l">Generated</div><div class="ic-v">${generatedDate}</div></div>
    <div class="ic"><div class="ic-l">Currency</div><div class="ic-v">AED (UAE Dirham)</div></div>
  </div>

  <!-- SUMMARY -->
  <div class="sh">Summary</div>
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
    <div class="sb">
      <div class="sb-l">Top Category</div>
      <div class="sb-v">${topCategory?.name || 'N/A'}</div>
      <div class="sb-n">AED ${(topCategory?.amount || 0).toFixed(2)} · ${(topCategory?.percentage || 0).toFixed(1)}%</div>
    </div>
  </div>

  <!-- CATEGORIES -->
  <div class="sh">Spending by Category</div>
  <div class="cats">
    ${sortedCategories.map(c => {
      const color = categoryColors[c.name] || '#4a4a6a';
      return `
    <div class="cr">
      <div class="cr-name">${c.name}</div>
      <div class="cr-track"><div class="cr-fill" style="width:${c.percentage.toFixed(1)}%;background:${color}"></div></div>
      <div class="cr-amt">AED ${c.amount.toFixed(2)}</div><div class="cr-pct">${c.percentage.toFixed(1)}%</div>
    </div>`;
    }).join('\n')}
  </div>

  <!-- TRANSACTIONS -->
  <div class="sh">Transactions</div>
  <div class="tbl-wrap">
    <table>
      <thead>
        <tr>
          <th style="width:5%">#</th>
          <th style="width:11%">Date</th>
          <th style="width:30%">Merchant</th>
          <th style="width:18%">Category</th>
          <th style="width:7%">Items</th>
          <th style="width:12%">Status</th>
          <th style="width:17%">Amount (AED)</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.map((tx, i) => {
          const dateStr = new Date(tx.receipt_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
          const cat = tx.category || 'Other';
          const badgeMap: Record<string, string> = {
            'Food': 'b-food',
            'Transport': 'b-transport',
            'Shopping': 'b-shopping',
            'Healthcare': 'b-health',
            'Other': 'b-other'
          };
          const badgeClass = badgeMap[cat] || 'b-other';
          
          return `
        <tr>
          <td><span class="num">${String(i + 1).padStart(3, '0')}</span></td>
          <td>${dateStr}</td>
          <td><strong>${tx.merchant_name || 'Unknown'}</strong></td>
          <td><span class="badge ${badgeClass}">${cat}</span></td>
          <td>${tx.items_count || 1}</td>
          <td><span class="badge b-done">${tx.status || 'Processed'}</span></td>
          <td>${(tx.total_amount || 0).toFixed(2)}</td>
        </tr>`;
        }).join('\n')}
      </tbody>
    </table>
  </div>

  <!-- TOTALS -->
  <div class="totals-bar">
    <div class="tc"><div class="tc-l">Subtotal</div><div class="tc-v">AED ${(totalAmount * 0.95).toFixed(2)}</div></div>
    <div class="tc"><div class="tc-l">Est. VAT (5%)</div><div class="tc-v">AED ${(totalAmount * 0.05).toFixed(2)}</div></div>
    <div class="tc"><div class="tc-l">Receipts</div><div class="tc-v">${transactionCount}</div></div>
    <div class="tc"><div class="tc-l">Avg / Receipt</div><div class="tc-v">AED ${averagePerReceipt.toFixed(2)}</div></div>
    <div class="tc accent"><div class="tc-l">Grand Total</div><div class="tc-v">AED ${totalAmount.toFixed(2)}</div></div>
  </div>

  <!-- FOOTER -->
  <div class="foot">
    <div class="foot-brand">receiptAI</div>
    <span class="foot-badge"><span class="foot-dot"></span> AI-Generated Report</span>
    <div class="foot-pg">Page 1 of 1</div>
  </div>

</div>
</body>
</html>`;

    // Open in new window for printing/saving as PDF
    // This works on both desktop and mobile browsers
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to fully load before triggering print
      printWindow.onload = () => {
        setTimeout(() => {
          try {
            printWindow.print();
          } catch (printError) {
            console.warn('Auto-print failed, user can manually print:', printError);
          }
        }, 800); // Slightly longer delay for mobile devices
      };
      
      console.log('✅ Report opened - use browser Print/Share to save as PDF');
    } else {
      // Fallback: Create downloadable HTML file if popup is blocked
      console.warn('⚠️ Popup blocked, falling back to HTML download');
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const today = new Date().toISOString().split("T")[0];
      const durationLabel =
        {
          today: "today",
          weekly: "this-week",
          monthly: "this-month",
          all: "all-time",
        }[duration] || "report";
      
      link.download = `ReceiptAI-Expense-Report-${durationLabel}-${today}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      console.log('✅ HTML report downloaded - open it and use Print to save as PDF');
    }
  } catch (error) {
    console.error("❌ Failed to export PDF:", error);
    throw error;
  }
};

/**
 * Export transactions as Image (PNG) - Optimized for Mobile (iOS/Android)
 */
export const exportTransactionsAsImage = async (
  transactions: any[],
  duration: string = "all",
) => {
  if (!transactions || transactions.length === 0) {
    console.warn("No transactions to export");
    return;
  }

  try {
    // Import html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;

    // =========================
    // CALCULATIONS (Same as PDF export)
    // =========================
    const totalAmount = transactions.reduce(
      (sum, tx) => sum + (tx.total_amount || 0),
      0,
    );

    const transactionCount = transactions.length;
    const averagePerReceipt =
      transactionCount > 0 ? totalAmount / transactionCount : 0;

    const largestExpense = transactions.reduce(
      (max, tx) =>
        (tx.total_amount || 0) > (max.total_amount || 0) ? tx : max,
      transactions[0],
    );

    const categoryTotals: Record<string, number> = {};
    transactions.forEach((tx) => {
      const cat = tx.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (tx.total_amount || 0);
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / totalAmount) * 100,
      }));

    const topCategory = sortedCategories[0];

    // =========================
    // DATE FORMATTING
    // =========================
    const formatDateRange = () => {
      const now = new Date();
      switch (duration) {
        case "today":
          return now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        case "weekly":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return `${weekAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
        case "monthly":
          return now.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
        case "all":
          return "All Time";
        default:
          return now.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
      }
    };

    const dateRange = formatDateRange();
    const generatedDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // =========================
    // CATEGORY COLORS
    // =========================
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

    // =========================
    // HTML CONTENT (Optimized for image capture)
    // =========================
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --ink: #0a1a14; --teal: #1a7a5e; --teal-lt: #e8f5f0; --muted: #7a9a8e;
      --rule: #d4e4dc; --bg-row: #f6faf8; --white: #ffffff;
    }
    html { font-size: 9pt; }
    body { font-family: 'DM Sans', 'Segoe UI', sans-serif; background: var(--white); color: var(--ink); line-height: 1.45; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 9mm 10mm 18mm; position: relative; background: white; }
    .hd { display: flex; align-items: center; justify-content: space-between; padding-bottom: 4.5mm; border-bottom: 1.8px solid var(--ink); margin-bottom: 4.5mm; }
    .hd-logo { display: flex; align-items: center; gap: 6px; }
    .hd-icon { width: 26px; height: 26px; background: var(--ink); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
    .hd-icon svg { width: 15px; height: 15px; fill: var(--white); }
    .hd-brand { font-size: 12pt; font-weight: 800; letter-spacing: -0.4px; }
    .hd-right { text-align: right; }
    .hd-title { font-size: 14pt; font-weight: 800; letter-spacing: -0.5px; line-height: 1; }
    .hd-sub { font-size: 7pt; color: var(--muted); margin-top: 2px; }
    .info-strip { display: flex; gap: 2.5mm; margin-bottom: 4.5mm; }
    .ic { flex: 1; padding: 3mm 3.5mm; background: var(--bg-row); border-radius: 6px; border: 1px solid var(--rule); }
    .ic-l { font-size: 6pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); margin-bottom: 1px; }
    .ic-v { font-size: 8.5pt; font-weight: 700; }
    .summary { display: flex; gap: 2.5mm; margin-bottom: 4.5mm; }
    .sb { flex: 1; padding: 3.5mm; border-radius: 7px; border: 1.5px solid var(--rule); }
    .sb.dark { background: var(--ink); border-color: var(--ink); }
    .sb.green { background: var(--teal-lt); border-color: var(--teal); }
    .sb-l { font-size: 6pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); margin-bottom: 2px; }
    .sb.dark .sb-l { color: #6abfa0; }
    .sb.green .sb-l { color: var(--teal); }
    .sb-v { font-size: 14pt; font-weight: 800; letter-spacing: -0.5px; line-height: 1; }
    .sb.dark .sb-v { color: var(--white); }
    .sb.green .sb-v { color: var(--teal); }
    .sb-n { font-size: 6.5pt; color: var(--muted); margin-top: 2px; }
    .sb.dark .sb-n { color: #6abfa0; }
    .sh { font-size: 6.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 4px; margin-bottom: 2.5mm; }
    .sh::after { content: ''; flex: 1; height: 1px; background: var(--rule); }
    .cats { margin-bottom: 4.5mm; }
    .cr { display: flex; align-items: center; gap: 2.5mm; margin-bottom: 1.8mm; }
    .cr-name { width: 25mm; font-size: 7.5pt; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cr-track { flex: 1; height: 5px; background: var(--rule); border-radius: 99px; overflow: hidden; }
    .cr-fill { height: 100%; border-radius: 99px; }
    .cr-amt { width: 17mm; text-align: right; font-size: 7.5pt; font-weight: 700; }
    .cr-pct { width: 8mm; text-align: right; font-size: 6.5pt; color: var(--muted); }
    .tbl-wrap { margin-bottom: 4.5mm; }
    table { width: 100%; border-collapse: collapse; }
    thead th { font-size: 6pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); padding: 2mm 2.5mm; text-align: left; background: var(--bg-row); border-top: 1.5px solid var(--ink); border-bottom: 1px solid var(--rule); }
    thead th:last-child { text-align: right; }
    tbody td { font-size: 8pt; padding: 2mm 2.5mm; border-bottom: 1px solid var(--rule); vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:nth-child(even) td { background: var(--bg-row); }
    tbody td:last-child { text-align: right; font-weight: 700; }
    .num { font-family: 'DM Mono', monospace; font-size: 7pt; color: var(--muted); }
    .badge { display: inline-block; padding: 1px 5px; border-radius: 99px; font-size: 6.5pt; font-weight: 600; border: 1px solid; }
    .b-food { color: #1a7a5e; border-color: #a8ddd0; background: #e8f5f0; }
    .b-transport { color: #1a4f8a; border-color: #a8c4f0; background: #e8f0fc; }
    .b-shopping { color: #8a4a1a; border-color: #f0c4a8; background: #fcf0e8; }
    .b-health { color: #8a1a4f; border-color: #f0a8c4; background: #fce8f0; }
    .b-other { color: #4a4a6a; border-color: #c4c4e0; background: #f0f0fc; }
    .b-done { color: #1a7a5e; border-color: #a8ddd0; background: #e8f5f0; }
    .totals-bar { display: flex; background: var(--ink); border-radius: 7px; overflow: hidden; margin-bottom: 4mm; }
    .tc { flex: 1; padding: 3mm 3.5mm; border-right: 1px solid #1e3028; }
    .tc:last-child { border-right: none; }
    .tc-l { font-size: 6pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: #6abfa0; margin-bottom: 2px; }
    .tc-v { font-size: 10pt; font-weight: 800; color: var(--white); letter-spacing: -0.3px; }
    .tc.accent .tc-v { color: #5de8bc; }
    .foot { position: absolute; bottom: 7mm; left: 10mm; right: 10mm; display: flex; align-items: center; justify-content: space-between; padding-top: 2.5mm; border-top: 1px solid var(--rule); }
    .foot-brand { font-size: 7pt; font-weight: 800; color: var(--teal); }
    .foot-badge { display: inline-flex; align-items: center; gap: 3px; background: var(--ink); color: var(--white); border-radius: 99px; padding: 1px 6px; font-size: 6pt; font-weight: 700; }
    .foot-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--teal); }
    .foot-pg { font-size: 6.5pt; color: var(--muted); }
  </style>
</head>
<body>
<div class="page">
  <div class="hd">
    <div class="hd-logo"><div class="hd-icon"><svg viewBox="0 0 24 24"><path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3a3 3 0 003 3h12a3 3 0 003-3V2l-1.5 1.5zM19 19a1 1 0 01-2 0v-1H6V6h13v13zm-7-9h-3V8h3v2zm5 0h-3V8h3v2zm-5 4h-3v-2h3v2zm5 0h-3v-2h3v2z"/></svg></div><span class="hd-brand">receiptAI</span></div>
    <div class="hd-right"><div class="hd-title">Expense Report</div><div class="hd-sub">AI-Powered Financial Summary · receiptAI</div></div>
  </div>
  <div class="info-strip">
    <div class="ic"><div class="ic-l">Report Period</div><div class="ic-v">${dateRange}</div></div>
    <div class="ic"><div class="ic-l">Generated</div><div class="ic-v">${generatedDate}</div></div>
    <div class="ic"><div class="ic-l">Currency</div><div class="ic-v">AED (UAE Dirham)</div></div>
  </div>
  <div class="sh">Summary</div>
  <div class="summary">
    <div class="sb dark"><div class="sb-l">Total Spending</div><div class="sb-v">AED ${totalAmount.toFixed(2)}</div><div class="sb-n">${transactionCount} receipts scanned</div></div>
    <div class="sb green"><div class="sb-l">Receipts Scanned</div><div class="sb-v">${transactionCount}</div><div class="sb-n">Avg. AED ${averagePerReceipt.toFixed(2)} / receipt</div></div>
    <div class="sb"><div class="sb-l">Largest Expense</div><div class="sb-v">AED ${(largestExpense?.total_amount || 0).toFixed(2)}</div><div class="sb-n">${largestExpense?.merchant_name || 'N/A'}</div></div>
    <div class="sb"><div class="sb-l">Top Category</div><div class="sb-v">${topCategory?.name || 'N/A'}</div><div class="sb-n">AED ${(topCategory?.amount || 0).toFixed(2)} · ${(topCategory?.percentage || 0).toFixed(1)}%</div></div>
  </div>
  <div class="sh">Spending by Category</div>
  <div class="cats">
    ${sortedCategories.map(c => {
      const color = categoryColors[c.name] || '#4a4a6a';
      return `<div class="cr"><div class="cr-name">${c.name}</div><div class="cr-track"><div class="cr-fill" style="width:${c.percentage.toFixed(1)}%;background:${color}"></div></div><div class="cr-amt">AED ${c.amount.toFixed(2)}</div><div class="cr-pct">${c.percentage.toFixed(1)}%</div></div>`;
    }).join('\n')}
  </div>
  <div class="sh">Transactions</div>
  <div class="tbl-wrap">
    <table>
      <thead><tr><th style="width:5%">#</th><th style="width:11%">Date</th><th style="width:30%">Merchant</th><th style="width:18%">Category</th><th style="width:7%">Items</th><th style="width:12%">Status</th><th style="width:17%">Amount (AED)</th></tr></thead>
      <tbody>
        ${transactions.map((tx, i) => {
          const dateStr = new Date(tx.receipt_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
          const cat = tx.category || 'Other';
          const badgeMap: Record<string, string> = { 'Food': 'b-food', 'Transport': 'b-transport', 'Shopping': 'b-shopping', 'Healthcare': 'b-health', 'Other': 'b-other' };
          const badgeClass = badgeMap[cat] || 'b-other';
          return `<tr><td><span class="num">${String(i + 1).padStart(3, '0')}</span></td><td>${dateStr}</td><td><strong>${tx.merchant_name || 'Unknown'}</strong></td><td><span class="badge ${badgeClass}">${cat}</span></td><td>${tx.items_count || 1}</td><td><span class="badge b-done">${tx.status || 'Processed'}</span></td><td>${(tx.total_amount || 0).toFixed(2)}</td></tr>`;
        }).join('\n')}
      </tbody>
    </table>
  </div>
  <div class="totals-bar">
    <div class="tc"><div class="tc-l">Subtotal</div><div class="tc-v">AED ${(totalAmount * 0.95).toFixed(2)}</div></div>
    <div class="tc"><div class="tc-l">Est. VAT (5%)</div><div class="tc-v">AED ${(totalAmount * 0.05).toFixed(2)}</div></div>
    <div class="tc"><div class="tc-l">Receipts</div><div class="tc-v">${transactionCount}</div></div>
    <div class="tc"><div class="tc-l">Avg / Receipt</div><div class="tc-v">AED ${averagePerReceipt.toFixed(2)}</div></div>
    <div class="tc accent"><div class="tc-l">Grand Total</div><div class="tc-v">AED ${totalAmount.toFixed(2)}</div></div>
  </div>
  <div class="foot">
    <div class="foot-brand">receiptAI</div>
    <span class="foot-badge"><span class="foot-dot"></span> AI-Generated Report</span>
    <div class="foot-pg">Page 1 of 1</div>
  </div>
</div>
</body>
</html>`;

    // Create container for rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px'; // 210mm at 96dpi
    container.style.background = '#ffffff';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    // Wait for fonts and content to render
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2, // High quality (2x)
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    // Convert canvas to PNG blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const today = new Date().toISOString().split("T")[0];
        const durationLabel =
          {
            today: "today",
            weekly: "this-week",
            monthly: "this-month",
            all: "all-time",
          }[duration] || "report";
        
        link.download = `ReceiptAI-Expense-Report-${durationLabel}-${today}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
        
        console.log(`✅ Image report downloaded: ReceiptAI-Expense-Report-${durationLabel}-${today}.png`);
      }
    }, 'image/png', 1.0);

    // Clean up container
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  } catch (error) {
    console.error("❌ Failed to export as image:", error);
    throw error;
  }
};

/**
 * Generate and download receipt as PDF (Enhanced - No headers/margins)
 */
export const generateReceiptPDF = (receipt:any) => {
  if (!receipt) {
    console.error("No receipt data provided");
    return;
  }

  // ─── FORMATTERS ───
  const fmt = new Intl.NumberFormat("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const dateFmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const d = new Date(receipt.receipt_date || Date.now());
  const g = new Date(receipt.created_at || Date.now());

  const formattedDate = dateFmt.format(d);
  const formattedTime = timeFmt.format(d);
  const genDate = dateFmt.format(g);
  const genTime = g.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // ─── ENHANCED TEMPLATE ───
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receipt — ${receipt.merchant_name || "Transaction"}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }

        :root {
          --ink: #0a1a14;
          --ink-soft: #1e3a2f;
          --teal: #1a7a5e;
          --teal-glow: #e8f5f0;
          --muted: #6b8a7e;
          --rule: #d4e4dc;
          --rule-light: #edf5f1;
          --paper: #ffffff;
          --paper-warm: #fafcfb;
        }

        body {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #e8ede9;
          color: var(--ink);
          line-height: 1.5;
          display: flex;
          justify-content: center;
          padding: 40px 16px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          min-height: 100vh;
        }

        /* ─── Receipt Container ─── */
        .receipt {
          background: var(--paper);
          width: 100%;
          max-width: 420px;
          position: relative;
          box-shadow: 
            0 1px 1px rgba(10,26,20,0.02),
            0 4px 8px rgba(10,26,20,0.04),
            0 12px 24px rgba(10,26,20,0.06),
            0 24px 48px rgba(10,26,20,0.08);
          border-radius: 2px;
        }

        /* Torn edge effect top & bottom */
        .receipt::before,
        .receipt::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 8px;
          background-image: radial-gradient(circle at 8px 8px, transparent 8px, var(--paper) 9px);
          background-size: 16px 16px;
          background-position: top center;
          background-repeat: repeat-x;
        }

        .receipt::before {
          top: -8px;
          transform: rotate(180deg);
        }

        .receipt::after {
          bottom: -8px;
        }

        .receipt-inner {
          padding: 36px 32px 40px;
          position: relative;
          background: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 31px,
              rgba(212,228,220,0.15) 31px,
              rgba(212,228,220,0.15) 32px
            );
        }

        /* ─── Header ─── */
        .header {
          text-align: center;
          margin-bottom: 28px;
          position: relative;
        }

        .brand-mark {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--ink) 0%, var(--ink-soft) 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 4px 12px rgba(10,26,20,0.15);
          position: relative;
          overflow: hidden;
        }

        .brand-mark::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 100%);
        }

        .brand-mark svg {
          width: 24px;
          height: 24px;
          fill: white;
          position: relative;
          z-index: 1;
        }

        .merchant-name {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.6px;
          margin-bottom: 4px;
          line-height: 1.2;
        }

        .merchant-meta {
          font-size: 11px;
          color: var(--muted);
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .receipt-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 4px 12px;
          background: var(--teal-glow);
          border: 1px solid rgba(26,122,94,0.15);
          border-radius: 99px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--teal);
        }

        .receipt-label::before {
          content: '';
          width: 5px;
          height: 5px;
          background: var(--teal);
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(26,122,94,0.2);
        }

        /* ─── Amount Hero ─── */
        .amount-hero {
          text-align: center;
          padding: 28px 0;
          margin: 0 -32px;
          background: linear-gradient(180deg, var(--paper-warm) 0%, transparent 100%);
          border-top: 1.5px dashed var(--rule);
          border-bottom: 1.5px dashed var(--rule);
          position: relative;
        }

        .amount-hero::before,
        .amount-hero::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 12px;
          background: #e8ede9;
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
        }

        .amount-hero::before { left: -6px; }
        .amount-hero::after { right: -6px; }

        .amount-label {
          font-size: 10px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .amount-value {
          font-family: 'DM Mono', monospace;
          font-size: 42px;
          font-weight: 500;
          letter-spacing: -2px;
          line-height: 1;
          color: var(--ink);
          text-shadow: 0 2px 4px rgba(10,26,20,0.04);
        }

        .amount-currency {
          font-size: 20px;
          vertical-align: super;
          color: var(--muted);
          margin-right: 4px;
          font-weight: 400;
          letter-spacing: -0.5px;
        }

        /* ─── Details Grid ─── */
        .details {
          margin-top: 24px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 10px 0;
          font-size: 13px;
          position: relative;
        }

        .detail-row:not(:last-child)::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: repeating-linear-gradient(
            90deg,
            var(--rule) 0px,
            var(--rule) 4px,
            transparent 4px,
            transparent 8px
          );
        }

        .detail-label {
          color: var(--muted);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-label svg {
          width: 14px;
          height: 14px;
          opacity: 0.5;
        }

        .detail-value {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: var(--ink-soft);
          text-align: right;
        }

        .detail-value.text {
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 13px;
          text-transform: capitalize;
        }

        /* ─── Status Badge ─── */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          background: var(--teal-glow);
          border: 1px solid rgba(26,122,94,0.2);
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--teal);
        }

        .badge::before {
          content: '';
          width: 4px;
          height: 4px;
          background: var(--teal);
          border-radius: 50%;
        }

        /* ─── Divider ─── */
        .zigzag {
          height: 8px;
          margin: 24px 0;
          background: linear-gradient(135deg, var(--paper) 25%, transparent 25%) -8px 0,
                      linear-gradient(225deg, var(--paper) 25%, transparent 25%) -8px 0,
                      linear-gradient(315deg, var(--paper) 25%, transparent 25%),
                      linear-gradient(45deg, var(--paper) 25%, transparent 25%);
          background-size: 16px 16px;
          background-color: var(--rule);
          opacity: 0.6;
          border: none;
        }

        /* ─── Totals ─── */
        .totals {
          background: var(--paper-warm);
          border: 1px solid var(--rule-light);
          border-radius: 10px;
          padding: 16px;
          margin-top: 4px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          padding: 6px 0;
          color: var(--muted);
        }

        .total-row.grand {
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1.5px solid var(--rule);
          color: var(--ink);
          font-weight: 700;
          font-size: 14px;
        }

        .total-row.grand .total-val {
          font-family: 'DM Mono', monospace;
          font-size: 16px;
          letter-spacing: -0.5px;
        }

        /* ─── Metadata ─── */
        .meta {
          margin-top: 24px;
          padding: 20px;
          background: linear-gradient(135deg, var(--paper-warm) 0%, #f6faf8 100%);
          border-radius: 10px;
          border: 1px solid var(--rule-light);
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          padding: 5px 0;
          color: var(--muted);
        }

        .meta-key {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .meta-val {
          font-family: 'DM Mono', monospace;
          color: var(--ink-soft);
        }

        /* ─── Footer ─── */
        .footer {
          margin-top: 32px;
          text-align: center;
          padding-top: 24px;
          border-top: 1.5px dashed var(--rule);
        }

        .footer-brand {
          font-size: 11px;
          font-weight: 800;
          color: var(--teal);
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .footer-tag {
          font-size: 9px;
          color: var(--muted);
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .barcode {
          font-family: 'DM Mono', monospace;
          font-size: 28px;
          letter-spacing: 2px;
          color: var(--ink);
          opacity: 0.25;
          margin-bottom: 16px;
          user-select: none;
        }

        /* ─── Print ─── */
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .receipt {
            box-shadow: none;
            max-width: 100%;
          }
          .receipt::before,
          .receipt::after {
            display: none;
          }
          .receipt-inner {
            background: white;
          }
        }

        @page {
          margin: 0;
          size: auto;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="receipt-inner">

          <!-- HEADER -->
          <div class="header">
            <div class="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div class="merchant-name">${receipt.merchant_name || "Unknown Merchant"}</div>
            <div class="merchant-meta">Official Transaction Record</div>
            <div class="receipt-label">Digital Receipt</div>
          </div>

          <!-- AMOUNT -->
          <div class="amount-hero">
            <div class="amount-label">Total Amount</div>
            <div class="amount-value">
              <span class="amount-currency">AED</span>${fmt.format(receipt.total_amount || 0)}
            </div>
          </div>

          <!-- DETAILS -->
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Date
              </span>
              <span class="detail-value text">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Time
              </span>
              <span class="detail-value text">${formattedTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Status
              </span>
              <span class="detail-value text">
                <span class="badge">${receipt.status || "Completed"}</span>
              </span>
            </div>
            ${receipt.category ? `
            <div class="detail-row">
              <span class="detail-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                Category
              </span>
              <span class="detail-value text">${receipt.category}</span>
            </div>
            ` : ''}
            ${receipt.payment_method ? `
            <div class="detail-row">
              <span class="detail-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Payment
              </span>
              <span class="detail-value text">${receipt.payment_method}</span>
            </div>
            ` : ''}
          </div>

          <hr class="zigzag">

          <!-- TOTALS BREAKDOWN -->
          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span class="total-val">AED ${fmt.format((receipt.total_amount || 0) - (receipt.tax_amount || 0))}</span>
            </div>
            ${receipt.tax_amount ? `
            <div class="total-row">
              <span>VAT (5%)</span>
              <span class="total-val">AED ${fmt.format(receipt.tax_amount)}</span>
            </div>
            ` : ''}
            ${receipt.discount ? `
            <div class="total-row" style="color: var(--teal);">
              <span>Discount</span>
              <span class="total-val">- AED ${fmt.format(receipt.discount)}</span>
            </div>
            ` : ''}
            <div class="total-row grand">
              <span>Total</span>
              <span class="total-val">AED ${fmt.format(receipt.total_amount || 0)}</span>
            </div>
          </div>

          <!-- METADATA -->
          <div class="meta">
            <div class="meta-row">
              <span class="meta-key">Receipt ID</span>
              <span class="meta-val">${receipt.id || "N/A"}</span>
            </div>
            <div class="meta-row">
              <span class="meta-key">Generated</span>
              <span class="meta-val">${genDate} · ${genTime}</span>
            </div>
            <div class="meta-row">
              <span class="meta-key">Source</span>
              <span class="meta-val">${(receipt.file_type || "digital").toUpperCase()}</span>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <div class="barcode">||| ||| || ||| ||| || |||</div>
            <div class="footer-brand">receiptAI</div>
            <div class="footer-tag">AI-Powered Expense Tracking</div>
          </div>

        </div>
      </div>

      <script>
        window.addEventListener('load', () => {
          setTimeout(() => window.print(), 400);
        });
      </script>
    </body>
    </html>
  `;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(htmlContent);
    w.document.close();
    console.log("✅ Receipt rendered");
  } else {
    console.error("Popup blocked — unable to open receipt");
  }
};
