/**
 * Receipt Controller
 * 
 * Handles receipt-related business logic:
 * - Fetching user receipts from Supabase
 * - Calculating weekly spending summaries
 * - Getting recent activity
 * - Processing uploaded receipts
 */

const { supabaseAdmin: supabase } = require('../config/supabase');
const { convertToAED } = require('../utils/currencyConverter');
const cache = require('../utils/cache');

/**
 * @desc    Get all receipts for authenticated user
 * @route   GET /api/receipts
 * @access  Private
 */
exports.getUserReceipts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Query receipts from Supabase
    const { data: receipts, error } = await supabase
      .from('receipts')
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching receipts:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch receipts'
      });
    }

    res.json({
      success: true,
      count: receipts.length,
      data: receipts
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get spending summary for a specific duration
 * @route   GET /api/receipts/spending-summary?duration=today|daily|weekly|monthly|all
 * @access  Private
 */
exports.getSpendingSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { duration = 'weekly', startDate: customStartDate, endDate: customEndDate } = req.query;

    // OPTIMIZED: Check cache first
    const cacheKey = `spending_summary:${userId}:${duration}:${customStartDate || ''}:${customEndDate || ''}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log(`💾 Cache hit for spending summary (${duration})`);
      return res.json({
        success: true,
        data: cachedData
      });
    }

    console.log(`📊 Fetching spending summary for duration: ${duration}`);

    // Calculate date ranges based on duration
    const now = new Date();
    let startDate, endDate;

    switch (duration) {
      case 'today':
        // Today only - use local date
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'daily': // This week (same as weekly)
      case 'weekly':
        // Start of current week (Monday) - use local date
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
        startDate.setHours(0, 0, 0, 0);
        endDate = now;
        break;

      case 'monthly':
        // Start of current month - use local date
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = now;
        break;

      case 'custom':
        // Custom date range - NO timezone conversion, use date string directly
        if (!customStartDate || !customEndDate) {
          return res.status(400).json({
            success: false,
            message: 'Custom duration requires startDate and endDate parameters'
          });
        }
        // Use date strings directly (YYYY-MM-DD format from date picker)
        // Database stores receipt_date as DATE type, so compare as strings
        startDate = customStartDate; // '2026-01-16'
        endDate = customEndDate;     // '2026-04-18'
        break;

      case 'all':
        // All time (no date filter)
        startDate = null;
        endDate = now;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid duration. Use: today, daily, weekly, monthly, custom, or all'
        });
    }

    console.log(`📅 Date range: ${startDate ? (typeof startDate === 'string' ? startDate : startDate.toISOString()) : 'All time'} to ${endDate ? (typeof endDate === 'string' ? endDate : endDate.toISOString()) : 'now'}`);

    // Build query
    let query = supabase
      .from('receipts')
      .select('total_amount, receipt_date, created_at')
      .eq('user_id', userId)
      .order('receipt_date', { ascending: true });

    // Add date filter - use receipt_date (transaction date) for accurate filtering
    if (startDate) {
      // For custom range, use string dates directly. For other durations, convert to date string.
      const startDateStr = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
      const endDateStr = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];
      
      console.log(`🔍 Filtering receipts between ${startDateStr} and ${endDateStr}`);
      query = query.gte('receipt_date', startDateStr);
      query = query.lte('receipt_date', endDateStr);
    }

    // Execute query
    const { data: receipts, error } = await query;

    if (error) {
      console.error('❌ Error fetching spending summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch spending summary',
        error: error.message
      });
    }

    console.log(`📊 Found ${receipts?.length || 0} receipts for ${duration}`);

    // Calculate total spending
    const totalSpending = receipts.reduce((sum, receipt) => {
      return sum + (parseFloat(receipt.total_amount) || 0);
    }, 0);

    // Calculate daily breakdown (7 days for visualization)
    const dailyBreakdown = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
    
    if (receipts.length > 0) {
      // For "today", just show today's amount in first slot
      if (duration === 'today') {
        dailyBreakdown[0] = totalSpending;
      } else {
        // Group by day of week using receipt_date (transaction date)
        receipts.forEach(receipt => {
          const date = new Date(receipt.receipt_date);
          const dayIndex = date.getDay();
          const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert to Mon=0, Sun=6
          dailyBreakdown[adjustedIndex] += parseFloat(receipt.total_amount) || 0;
        });
      }
    }

    // Calculate percentage change from previous period
    let percentageChange = 0;
    let previousTotal = 0;

    if (startDate && duration !== 'all') {
      // Calculate previous period for comparison
      let prevStartDate, prevEndDate;
      
      switch (duration) {
        case 'today':
          prevEndDate = new Date(typeof startDate === 'string' ? startDate + 'T00:00:00' : startDate);
          prevStartDate = new Date(prevEndDate);
          prevStartDate.setDate(prevStartDate.getDate() - 1);
          break;
        case 'daily':
        case 'weekly':
          prevEndDate = new Date(typeof startDate === 'string' ? startDate + 'T00:00:00' : startDate);
          prevStartDate = new Date(prevEndDate);
          prevStartDate.setDate(prevStartDate.getDate() - 7);
          break;
        case 'monthly':
          prevEndDate = new Date(typeof startDate === 'string' ? startDate + 'T00:00:00' : startDate);
          prevStartDate = new Date(prevEndDate);
          prevStartDate.setMonth(prevStartDate.getMonth() - 1);
          break;
        case 'custom':
          // For custom, compare with a period of the same length before the start date
          // Convert string dates to Date objects for calculation
          const startDateObj = new Date(typeof startDate === 'string' ? startDate + 'T00:00:00' : startDate);
          const endDateObj = new Date(typeof endDate === 'string' ? endDate + 'T23:59:59' : endDate);
          const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          prevEndDate = new Date(startDateObj);
          prevStartDate = new Date(prevEndDate);
          prevStartDate.setDate(prevStartDate.getDate() - diffDays);
          break;
      }

      if (prevStartDate) {
        const { data: prevReceipts } = await supabase
          .from('receipts')
          .select('total_amount')
          .eq('user_id', userId)
          .gte('receipt_date', prevStartDate.toISOString().split('T')[0])
          .lt('receipt_date', prevEndDate.toISOString().split('T')[0]);

        previousTotal = prevReceipts?.reduce((sum, receipt) => {
          return sum + (parseFloat(receipt.total_amount) || 0);
        }, 0) || 0;

        percentageChange = previousTotal > 0
          ? ((totalSpending - previousTotal) / previousTotal * 100)
          : 0;
      }
    }

    console.log(`✅ Spending summary calculated:`);
    console.log(`   Total: AED ${totalSpending.toFixed(2)}`);
    console.log(`   Receipts: ${receipts?.length || 0}`);
    console.log(`   Previous period: AED ${previousTotal.toFixed(2)}`);
    console.log(`   Change: ${percentageChange.toFixed(1)}%`);

    const responseData = {
      totalSpending,
      currency: 'AED',
      percentageChange: parseFloat(percentageChange.toFixed(1)),
      dailyBreakdown,
      receiptCount: receipts?.length || 0,
      duration
    };

    // OPTIMIZED: Cache the result for 5 minutes
    cache.set(cacheKey, responseData, 5 * 60 * 1000);

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get weekly spending summary (legacy)
 * @route   GET /api/receipts/weekly-summary
 * @access  Private
 */
exports.getWeeklySpending = async (req, res) => {
  try {
    const userId = req.user.id;

    // Calculate start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    // Get receipts for current week
    const { data: weeklyReceipts, error } = await supabase
      .from('receipts')
      .select('total_amount, receipt_date')
      .eq('user_id', userId)
      .gte('receipt_date', startOfWeek.toISOString().split('T')[0])
      .order('receipt_date', { ascending: true });

    if (error) {
      console.error('Error fetching weekly spending:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch weekly spending'
      });
    }

    // Calculate total spending
    const totalSpending = weeklyReceipts.reduce((sum, receipt) => {
      return sum + (parseFloat(receipt.total_amount) || 0);
    }, 0);

    // Calculate daily breakdown for chart
    const dailyBreakdown = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
    weeklyReceipts.forEach(receipt => {
      const date = new Date(receipt.receipt_date);
      const dayIndex = date.getDay();
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert to Mon=0, Sun=6
      dailyBreakdown[adjustedIndex] += parseFloat(receipt.total_amount) || 0;
    });

    // Calculate percentage change from last week (if we have data)
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const { data: lastWeekReceipts } = await supabase
      .from('receipts')
      .select('total_amount')
      .eq('user_id', userId)
      .gte('receipt_date', lastWeekStart.toISOString().split('T')[0])
      .lt('receipt_date', startOfWeek.toISOString().split('T')[0]);

    const lastWeekTotal = lastWeekReceipts?.reduce((sum, receipt) => {
      return sum + (parseFloat(receipt.total_amount) || 0);
    }, 0) || 0;

    const percentageChange = lastWeekTotal > 0 
      ? ((totalSpending - lastWeekTotal) / lastWeekTotal * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalSpending,
        currency: 'AED',
        percentageChange: parseFloat(percentageChange),
        dailyBreakdown,
        receiptCount: weeklyReceipts.length
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Get receipt history with duration filter
 * @route   GET /api/receipts/history?duration=today|weekly|monthly|all
 * @access  Private
 */
exports.getReceiptHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { duration = 'all' } = req.query;

    console.log(`📋 Fetching receipt history for duration: ${duration}`);

    // Calculate date range
    const now = new Date();
    let startDate = null;

    switch (duration) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all':
      default:
        // No date filter
        break;
    }

    // Build query - Note: Use category_id (UUID) not category (text)
    let query = supabase
      .from('receipts')
      .select(`
        id,
        merchant_name,
        total_amount,
        receipt_date,
        category_id,
        status,
        created_at,
        original_file_url,
        file_type,
        categories (
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('receipt_date', { ascending: false });

    if (startDate) {
      query = query.gte('receipt_date', startDate.toISOString().split('T')[0]);
    }

    const { data: receipts, error } = await query;

    if (error) {
      console.error('❌ Error fetching receipt history:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch receipt history',
        error: error.message
      });
    }

    console.log(`✅ Found ${receipts?.length || 0} receipts for history`);
    console.log('🔍 Sample receipt data:', JSON.stringify(receipts?.[0], null, 2));

    // Format response with category name
    const formattedReceipts = receipts?.map(receipt => ({
      ...receipt,
      category: receipt.categories?.name || null,
      categoryIcon: receipt.categories?.icon || 'receipt',
      categoryColor: receipt.categories?.color || null
    })) || [];

    res.json({
      success: true,
      count: formattedReceipts.length,
      data: formattedReceipts
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get category breakdown for duration
 * @route   GET /api/receipts/category-breakdown?duration=today|weekly|monthly|all
 * @access  Private
 */
exports.getCategoryBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;
    const { duration = 'all' } = req.query;

    console.log(`📊 Fetching category breakdown for duration: ${duration}`);

    // Calculate date range
    const now = new Date();
    let startDate = null;

    switch (duration) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all':
      default:
        break;
    }

    // OPTIMIZED: Use database-level aggregation instead of client-side loops
    // This reduces data transfer and server memory usage
    let query = supabase
      .from('receipts')
      .select(`
        categories (name),
        total_amount
      `)
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('receipt_date', startDate.toISOString().split('T')[0]);
    }

    const { data: receipts, error } = await query;

    if (error) {
      console.error('❌ Error fetching category breakdown:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch category breakdown',
        error: error.message
      });
    }

    // Aggregate in JavaScript (still needed for percentage calculation)
    // Note: Supabase doesn't support GROUP BY with JOINs easily, so we aggregate here
    // But we're now only transferring necessary fields (category name + amount)
    const categoryMap = {};
    let totalSpending = 0;

    receipts?.forEach(receipt => {
      const category = receipt.categories?.name || 'Other';
      const amount = parseFloat(receipt.total_amount) || 0;
      
      if (!categoryMap[category]) {
        categoryMap[category] = { name: category, amount: 0, count: 0 };
      }
      
      categoryMap[category].amount += amount;
      categoryMap[category].count += 1;
      totalSpending += amount;
    });

    // Convert to array and sort by amount
    const breakdown = Object.values(categoryMap)
      .map(cat => ({
        ...cat,
        percentage: totalSpending > 0 ? (cat.amount / totalSpending) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    const topCategory = breakdown.length > 0 ? breakdown[0] : null;

    console.log(`✅ Category breakdown calculated`);
    console.log(`   Total categories: ${breakdown.length}`);
    if (topCategory) {
      console.log(`   Top category: ${topCategory.name} (${topCategory.percentage.toFixed(1)}%)`);
    }

    res.json({
      success: true,
      data: {
        totalSpending,
        breakdown,
        topCategory
      }
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get recent activity (last 5 receipts)
 * @route   GET /api/receipts/recent-activity
 * @access  Private
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get 5 most recent receipts with category info
    const { data: receipts, error } = await supabase
      .from('receipts')
      .select(`
        id,
        merchant_name,
        total_amount,
        receipt_date,
        created_at,
        categories (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent activity:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activity'
      });
    }

    // Format the response
    const formattedReceipts = receipts.map(receipt => ({
      id: receipt.id,
      merchant: receipt.merchant_name || 'Unknown Merchant',
      amount: receipt.total_amount || 0,
      currency: 'AED',
      date: receipt.receipt_date || receipt.created_at,
      category: receipt.categories?.name || 'Uncategorized',
      categoryIcon: receipt.categories?.icon || 'receipt',
      categoryColor: receipt.categories?.color || 'bg-gray-500'
    }));

    res.json({
      success: true,
      count: formattedReceipts.length,
      data: formattedReceipts
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Upload and process a receipt
 * @route   POST /api/receipts/upload
 * @access  Private
 */
exports.uploadReceipt = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fileUrl,
      fileType,
      extractedData,
      items = [],
      tax = 0,
      category,
      notes = ''
    } = req.body;

    console.log('📥 Saving receipt for user:', userId);
    console.log('📊 Data:', {
      merchant: extractedData?.merchantName,
      date: extractedData?.date,
      amount: extractedData?.amount,
      detectedCurrency: extractedData?.detectedCurrency || 'AED',
      items: items.length,
      tax,
      category
    });
    
    // Validate category is provided
    if (!category || category.trim() === '') {
      console.error('❌ Category is required but not provided');
      return res.status(400).json({
        success: false,
        message: 'Category is required! Please select a category before saving.'
      });
    }
    
    // Convert amount to AED if different currency detected
    const originalAmount = extractedData?.amount || 0;
    const detectedCurrency = extractedData?.detectedCurrency || 'AED';
    
    let finalAmount = originalAmount;
    let currencyUsed = 'AED';
    
    if (detectedCurrency && detectedCurrency !== 'AED') {
      const conversion = convertToAED(originalAmount, detectedCurrency);
      finalAmount = conversion.convertedAmount;
      currencyUsed = 'AED'; // Always store as AED
      
      console.log(`💱 Currency conversion: ${originalAmount} ${detectedCurrency} → ${finalAmount} AED (rate: ${conversion.rate})`);
    }
    
    console.log(`💰 Final amount to save: ${finalAmount} AED`);
    
    // Step 1: Insert receipt into database (always in AED)
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert([{
        user_id: userId,
        original_file_url: fileUrl || '',
        file_type: fileType || 'unknown',
        merchant_name: extractedData?.merchantName || 'Unknown',
        receipt_date: extractedData?.date || new Date().toISOString().split('T')[0],
        total_amount: finalAmount,
        tax_amount: tax,
        category_id: category, // Category is now required and validated
        currency: currencyUsed, // Always 'AED'
        status: 'processed'
      }])
      .select()
      .single();

    if (receiptError) {
      console.error('❌ Error saving receipt:', receiptError);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save receipt to database';
      if (receiptError.code === '23502') {
        // NOT NULL constraint violation
        errorMessage = 'Category is required! Please select a category before saving.';
      } else if (receiptError.code === '23503') {
        // Foreign key constraint violation
        errorMessage = 'Invalid category selected. Please choose a valid category.';
      }
      
      return res.status(500).json({
        success: false,
        message: errorMessage,
        error: receiptError.message
      });
    }

    console.log('✅ Receipt saved! ID:', receipt.id);

    // OPTIMIZED: Invalidate cache for this user's spending summaries
    const cacheKeys = [
      `spending_summary:${userId}:today::`,
      `spending_summary:${userId}:weekly::`,
      `spending_summary:${userId}:monthly::`,
      `spending_summary:${userId}:all::`
    ];
    cacheKeys.forEach(key => cache.delete(key));
    console.log('🗑️ Cache invalidated for user spending summaries');

    // Step 2: Save items if any
    if (items.length > 0) {
      console.log(`📦 Saving ${items.length} items...`);
      
      const itemsToInsert = items.map(item => ({
        receipt_id: receipt.id,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('⚠️ Error saving items:', itemsError);
        // Don't fail the whole request, just log it
      } else {
        console.log('✅ Items saved successfully!');
      }
    }

    res.status(201).json({
      success: true,
      message: 'Receipt saved successfully',
      data: receipt
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update receipt details
 * @route   PUT /api/receipts/:id
 * @access  Private
 */
exports.updateReceipt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { merchant_name, receipt_date, total_amount, category_id, notes } = req.body;

    console.log(`✏️ Updating receipt ${id} for user ${userId}`);

    // Verify receipt belongs to user
    const { data: existingReceipt, error: fetchError } = await supabase
      .from('receipts')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingReceipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    if (existingReceipt.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this receipt'
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (merchant_name !== undefined) updateData.merchant_name = merchant_name;
    if (receipt_date !== undefined) updateData.receipt_date = receipt_date;
    if (total_amount !== undefined) updateData.total_amount = total_amount;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (notes !== undefined) updateData.notes = notes;

    // Update receipt
    const { data: updatedReceipt, error: updateError } = await supabase
      .from('receipts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating receipt:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update receipt',
        error: updateError.message
      });
    }

    console.log('✅ Receipt updated successfully');

    res.json({
      success: true,
      message: 'Receipt updated successfully',
      data: updatedReceipt
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * @desc    Delete receipt
 * @route   DELETE /api/receipts/:id
 * @access  Private
 */
exports.deleteReceipt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log(`🗑️ Deleting receipt ${id} for user ${userId}`);

    // Verify receipt belongs to user
    const { data: existingReceipt, error: fetchError } = await supabase
      .from('receipts')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingReceipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    if (existingReceipt.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this receipt'
      });
    }

    // Delete receipt items first (cascade should handle this, but being explicit)
    await supabase
      .from('receipt_items')
      .delete()
      .eq('receipt_id', id);

    // Delete receipt
    const { error: deleteError } = await supabase
      .from('receipts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Error deleting receipt:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete receipt',
        error: deleteError.message
      });
    }

    console.log('✅ Receipt deleted successfully');

    // OPTIMIZED: Invalidate cache for this user's spending summaries
    const cacheKeys = [
      `spending_summary:${userId}:today::`,
      `spending_summary:${userId}:weekly::`,
      `spending_summary:${userId}:monthly::`,
      `spending_summary:${userId}:all::`
    ];
    cacheKeys.forEach(key => cache.delete(key));

    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * @desc    Delete ALL receipts for authenticated user
 * @route   DELETE /api/receipts/delete-all
 * @access  Private
 */
exports.deleteAllReceipts = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`🗑️🗑️ Deleting ALL receipts for user ${userId}`);

    // Delete all receipt items first
    const { error: itemsError } = await supabase
      .from('receipt_items')
      .delete()
      .eq('receipt_id', 
        supabase.from('receipts').select('id').eq('user_id', userId)
      );

    if (itemsError) {
      console.error('❌ Error deleting receipt items:', itemsError);
    }

    // Delete all receipts
    const { data: deletedData, error: deleteError } = await supabase
      .from('receipts')
      .delete()
      .eq('user_id', userId)
      .select('id');

    if (deleteError) {
      console.error('❌ Error deleting receipts:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete receipts',
        error: deleteError.message
      });
    }

    const count = deletedData ? deletedData.length : 0;
    console.log(`✅ Deleted ${count} receipts for user ${userId}`);

    // OPTIMIZED: Invalidate all cache for this user
    const cacheKeys = [
      `spending_summary:${userId}:today::`,
      `spending_summary:${userId}:weekly::`,
      `spending_summary:${userId}:monthly::`,
      `spending_summary:${userId}:all::`
    ];
    cacheKeys.forEach(key => cache.delete(key));
    console.log('🗑️ All cache invalidated for user');

    res.json({
      success: true,
      message: `Successfully deleted ${count} receipts`,
      count: count
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * @desc    Export receipts as PDF
 * @route   POST /api/receipts/export-pdf
 * @access  Private
 */
exports.exportReceiptsPDF = async (req, res) => {
  try {
    const userId = req.user.id;
    const { transactions = [], duration = 'all' } = req.body;

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No transactions to export'
      });
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 0,
      bufferPages: true
    });

    // Set response headers for PDF download
    const filename = `ReceiptAI-Expense-Report-${duration}-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Helper functions
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 28.35; // 10mm in points
    const contentWidth = pageWidth - (margin * 2);

    // Colors
    const colors = {
      ink: '#0a1a14',
      teal: '#1a7a5e',
      tealLight: '#e8f5f0',
      muted: '#7a9a8e',
      rule: '#d4e4dc',
      bgRow: '#f6faf8',
      white: '#ffffff'
    };

    // Calculate totals
    const totalAmount = transactions.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
    const transactionCount = transactions.length;
    const averagePerReceipt = transactionCount > 0 ? totalAmount / transactionCount : 0;
    
    const largestExpense = transactions.reduce((max, tx) => 
      (tx.total_amount || 0) > (max.total_amount || 0) ? tx : max, transactions[0]);
    
    const categoryTotals = {};
    transactions.forEach(tx => {
      const cat = tx.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (tx.total_amount || 0);
    });
    
    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / totalAmount) * 100
      }));
    
    const topCategory = sortedCategories[0];

    // Format date range
    const formatDateRange = () => {
      const now = new Date();
      switch (duration) {
        case 'today':
          return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        case 'monthly':
          return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        case 'all':
          return 'All Time';
        default:
          return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    };

    const dateRange = formatDateRange();
    const generatedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    let yPos = margin;

    // HEADER
    const headerBottom = yPos + 12.75; // 4.5mm in points
    doc.strokeColor(colors.ink).lineWidth(1.8);
    doc.moveTo(margin, headerBottom).lineTo(pageWidth - margin, headerBottom).stroke();
    
    // Logo and brand (left side)
    doc.fillColor(colors.ink).fontSize(12).font('Helvetica-Bold');
    doc.text('ReceiptAI', margin, yPos + 3);
    
    // Title section (right side) - use proper right-alignment within margin bounds
    const rightSectionX = pageWidth - margin;
    doc.fontSize(14).fillColor(colors.ink).text('Expense Report', rightSectionX, yPos, { align: 'right', width: 200 });
    doc.fontSize(7).fillColor(colors.muted).text('AI-Powered Financial Summary · ReceiptAI', rightSectionX, yPos + 11, { align: 'right', width: 200 });
    
    yPos += 17.72; // 4.5mm spacing after header

    // INFO STRIP - 4 cards matching Report.html
    const infoGap = 7.09; // 2.5mm in points
    const infoBoxWidth = (contentWidth - (infoGap * 3)) / 4;
    const infoData = [
      { label: 'Report Period', value: dateRange },
      { label: 'Prepared For', value: req.user?.name || 'User' },
      { label: 'Generated', value: generatedDate },
      { label: 'Currency', value: 'AED (UAE Dirham)' }
    ];

    infoData.forEach((info, idx) => {
      const x = margin + (idx * (infoBoxWidth + infoGap));
      
      // Background
      doc.fillColor(colors.bgRow).roundedRect(x, yPos, infoBoxWidth, 28.35, 4.25).fill(); // 10mm height, 3px radius
      doc.strokeColor(colors.rule).lineWidth(0.71).roundedRect(x, yPos, infoBoxWidth, 28.35, 4.25).stroke(); // 1px border
      
      // Label
      doc.fillColor(colors.muted).fontSize(6).font('Helvetica-Bold');
      doc.text(info.label.toUpperCase(), x + 9.92, yPos + 2.83, { width: infoBoxWidth - 19.84 }); // 3.5mm padding
      
      // Value
      doc.fillColor(colors.ink).fontSize(8.5).text(info.value, x + 9.92, yPos + 11.34, { width: infoBoxWidth - 19.84 });
    });

    yPos += 17.72; // 4.5mm spacing

    // SUMMARY SECTION
    doc.fillColor(colors.muted).fontSize(6.5).font('Helvetica-Bold');
    doc.text('SUMMARY', margin, yPos);
    doc.strokeColor(colors.rule).lineWidth(1).moveTo(margin + 45, yPos + 3).lineTo(pageWidth - margin, yPos + 3).stroke();
    yPos += 9.92; // 2.5mm spacing

    const summaryGap = 7.09; // 2.5mm in points
    const summaryBoxWidth = (contentWidth - (summaryGap * 3)) / 4;
    
    // Total Spending (dark)
    doc.fillColor(colors.ink).roundedRect(margin, yPos, summaryBoxWidth, 39.69, 4.96).fill(); // 14mm height, 3.5px radius
    doc.fillColor('#6abfa0').fontSize(6).font('Helvetica-Bold').text('TOTAL SPENDING', margin + 9.92, yPos + 2.83, { width: summaryBoxWidth - 19.84 });
    doc.fillColor(colors.white).fontSize(14).text(`AED ${totalAmount.toFixed(2)}`, margin + 9.92, yPos + 11.34, { width: summaryBoxWidth - 19.84 });
    doc.fillColor('#6abfa0').fontSize(6.5).text(`${transactionCount} receipts scanned`, margin + 9.92, yPos + 25.51, { width: summaryBoxWidth - 19.84 });

    // Receipts Scanned (green)
    const x2 = margin + summaryBoxWidth + summaryGap;
    doc.fillColor(colors.tealLight).roundedRect(x2, yPos, summaryBoxWidth, 39.69, 4.96).fill();
    doc.strokeColor(colors.teal).lineWidth(1.06).roundedRect(x2, yPos, summaryBoxWidth, 39.69, 4.96).stroke(); // 1.5px border
    doc.fillColor(colors.teal).fontSize(6).font('Helvetica-Bold').text('RECEIPTS SCANNED', x2 + 9.92, yPos + 2.83, { width: summaryBoxWidth - 19.84 });
    doc.fontSize(14).text(`${transactionCount}`, x2 + 9.92, yPos + 11.34, { width: summaryBoxWidth - 19.84 });
    doc.fillColor(colors.muted).fontSize(6.5).text(`Avg. AED ${averagePerReceipt.toFixed(2)} / receipt`, x2 + 9.92, yPos + 25.51, { width: summaryBoxWidth - 19.84 });

    // Largest Expense
    const x3 = margin + (summaryBoxWidth + summaryGap) * 2;
    doc.fillColor(colors.white).roundedRect(x3, yPos, summaryBoxWidth, 39.69, 4.96).fill();
    doc.strokeColor(colors.rule).lineWidth(1.06).roundedRect(x3, yPos, summaryBoxWidth, 39.69, 4.96).stroke();
    doc.fillColor(colors.muted).fontSize(6).font('Helvetica-Bold').text('LARGEST EXPENSE', x3 + 9.92, yPos + 2.83, { width: summaryBoxWidth - 19.84 });
    doc.fillColor(colors.ink).fontSize(14).text(`AED ${(largestExpense?.total_amount || 0).toFixed(2)}`, x3 + 9.92, yPos + 11.34, { width: summaryBoxWidth - 19.84 });
    doc.fillColor(colors.muted).fontSize(6.5).text(largestExpense?.merchant_name || 'N/A', x3 + 9.92, yPos + 25.51, { width: summaryBoxWidth - 19.84 });

    // Top Category
    const x4 = margin + (summaryBoxWidth + summaryGap) * 3;
    doc.fillColor(colors.white).roundedRect(x4, yPos, summaryBoxWidth, 39.69, 4.96).fill();
    doc.strokeColor(colors.rule).lineWidth(1.06).roundedRect(x4, yPos, summaryBoxWidth, 39.69, 4.96).stroke();
    doc.fillColor(colors.muted).fontSize(6).font('Helvetica-Bold').text('TOP CATEGORY', x4 + 9.92, yPos + 2.83, { width: summaryBoxWidth - 19.84 });
    doc.fillColor(colors.ink).fontSize(14).text(topCategory?.name || 'N/A', x4 + 9.92, yPos + 11.34, { width: summaryBoxWidth - 19.84 });
    doc.fillColor(colors.muted).fontSize(6.5).text(`AED ${(topCategory?.amount || 0).toFixed(2)} · ${(topCategory?.percentage || 0).toFixed(1)}%`, x4 + 9.92, yPos + 25.51, { width: summaryBoxWidth - 19.84 });

    yPos += 17.72; // 4.5mm spacing

    // CATEGORIES SECTION
    doc.fillColor(colors.muted).fontSize(6.5).font('Helvetica-Bold');
    doc.text('SPENDING BY CATEGORY', margin, yPos);
    doc.strokeColor(colors.rule).lineWidth(1).moveTo(margin + 110, yPos + 3).lineTo(pageWidth - margin, yPos + 3).stroke();
    yPos += 9.92; // 2.5mm spacing

    const categoryColors = {
      'Food & Drink': '#1a7a5e',
      'Groceries': '#1a7a5e',
      'Transport': '#1a4f8a',
      'Shopping': '#8a4a1a',
      'Healthcare': '#8a1a4f',
      'Utilities': '#4a4a6a',
      'Entertainment': '#6a1a8a',
      'Other': '#4a4a6a'
    };

    sortedCategories.forEach(cat => {
      const color = categoryColors[cat.name] || '#4a4a6a';
      
      // Category name - 25mm width
      doc.fillColor(colors.ink).fontSize(7.5).font('Helvetica').text(cat.name, margin, yPos + 1.42, { width: 70.87 }); // 25mm = 70.87pt
      
      // Progress bar background - track fills remaining space
      const trackX = margin + 75.12; // After category name + gap
      const trackWidth = contentWidth - 75.12 - 70.87 - 22.68; // Subtract name, amount, percentage widths
      doc.fillColor(colors.rule).roundedRect(trackX, yPos + 2.83, trackWidth, 4.25, 2.13).fill(); // 5px height
      
      // Progress bar fill
      doc.fillColor(color).roundedRect(trackX, yPos + 2.83, trackWidth * (cat.percentage / 100), 4.25, 2.13).fill();
      
      // Amount - 17mm width, right aligned
      doc.fillColor(colors.ink).fontSize(7.5).font('Helvetica-Bold').text(`AED ${cat.amount.toFixed(2)}`, pageWidth - margin - 56.69 - 22.68, yPos + 1.42, { width: 48.19, align: 'right' }); // 17mm = 48.19pt
      
      // Percentage - 8mm width, right aligned
      doc.fillColor(colors.muted).fontSize(6.5).text(`${cat.percentage.toFixed(1)}%`, pageWidth - margin - 22.68, yPos + 1.42, { width: 22.68, align: 'right' }); // 8mm = 22.68pt
      
      yPos += 14.17; // 5mm spacing between rows
    });

    yPos += 5.67; // Additional spacing

    // TRANSACTIONS TABLE
    doc.fillColor(colors.muted).fontSize(6.5).font('Helvetica-Bold');
    doc.text('TRANSACTIONS', margin, yPos);
    doc.strokeColor(colors.rule).lineWidth(1).moveTo(margin + 75, yPos + 3).lineTo(pageWidth - margin, yPos + 3).stroke();
    yPos += 9.92; // 2.5mm spacing

    // Table header - match Report.html column widths
    const tableTop = yPos;
    const colWidths = [28.35, 65.2, 170.08, 102.05, 39.69, 96.38]; // Converted from percentages: 5%, 11%, 30%, 18%, 7%, 12%, 17%
    const headers = ['#', 'DATE', 'MERCHANT', 'CATEGORY', 'ITEMS', 'STATUS', 'AMOUNT (AED)'];
    
    doc.fillColor(colors.bgRow).rect(margin, yPos, contentWidth, 17).fill();
    doc.strokeColor(colors.ink).lineWidth(1.06).moveTo(margin, yPos).lineTo(pageWidth - margin, yPos).stroke();
    doc.strokeColor(colors.rule).lineWidth(0.71).moveTo(margin, yPos + 17).lineTo(pageWidth - margin, yPos + 17).stroke();
    
    let colX = margin;
    headers.forEach((header, idx) => {
      doc.fillColor(colors.muted).fontSize(6).font('Helvetica-Bold');
      const textAlign = idx === headers.length - 1 ? 'right' : 'left';
      doc.text(header, colX + 7.09, yPos + 5.67, { width: colWidths[idx] - 14.18, align: textAlign }); // 2.5mm padding
      colX += colWidths[idx];
    });
    
    yPos += 22.68; // Row height + padding

    // Table rows
    transactions.forEach((tx, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 56.69) { // 20mm from bottom
        doc.addPage();
        yPos = margin;
      }

      // Alternating row colors
      if (index % 2 === 0) {
        doc.fillColor(colors.bgRow).rect(margin, yPos, contentWidth, 19.84).fill(); // 7mm row height
      }

      colX = margin;
      
      // Number
      doc.fillColor(colors.muted).fontSize(7).font('Courier').text(String(index + 1).padStart(3, '0'), colX + 7.09, yPos + 5.67, { width: colWidths[0] - 14.18 });
      colX += colWidths[0];
      
      // Date
      const dateStr = new Date(tx.receipt_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      doc.fillColor(colors.ink).fontSize(8).font('Helvetica').text(dateStr, colX + 7.09, yPos + 5.67, { width: colWidths[1] - 14.18 });
      colX += colWidths[1];
      
      // Merchant
      doc.font('Helvetica-Bold').text(tx.merchant_name || 'Unknown', colX + 7.09, yPos + 5.67, { width: colWidths[2] - 14.18 });
      colX += colWidths[2];
      
      // Category badge
      const category = tx.category || 'Other';
      const badgeColor = categoryColors[category] || '#4a4a6a';
      doc.fillColor(badgeColor).fontSize(7).text(category, colX + 7.09, yPos + 5.67, { width: colWidths[3] - 14.18 });
      colX += colWidths[3];
      
      // Items count
      doc.fillColor(colors.ink).fontSize(8).text(tx.items_count || '1', colX + 7.09, yPos + 5.67, { width: colWidths[4] - 14.18 });
      colX += colWidths[4];
      
      // Status
      doc.fillColor(colors.teal).text(tx.status || 'Processed', colX + 7.09, yPos + 5.67, { width: colWidths[5] - 14.18 });
      colX += colWidths[5];
      
      // Amount - right aligned
      doc.fillColor(colors.ink).font('Helvetica-Bold').text((tx.total_amount || 0).toFixed(2), colX + 7.09, yPos + 5.67, { width: colWidths[6] - 14.18, align: 'right' });
      
      // Row separator
      doc.strokeColor(colors.rule).lineWidth(0.71).moveTo(margin, yPos + 19.84).lineTo(pageWidth - margin, yPos + 19.84).stroke();
      
      yPos += 19.84;
    });

    yPos += 14.17; // 5mm spacing

    // TOTALS BAR - 5 columns matching Report.html
    if (yPos > pageHeight - 56.69) {
      doc.addPage();
      yPos = margin;
    }

    doc.fillColor(colors.ink).roundedRect(margin, yPos, contentWidth, 35.43, 4.96).fill(); // 12.5mm height
    
    const totalColWidth = contentWidth / 5;
    const totals = [
      { label: 'SUBTOTAL', value: `AED ${(totalAmount * 0.95).toFixed(2)}` },
      { label: 'EST. VAT (5%)', value: `AED ${(totalAmount * 0.05).toFixed(2)}` },
      { label: 'RECEIPTS', value: `${transactionCount}` },
      { label: 'AVG / RECEIPT', value: `AED ${averagePerReceipt.toFixed(2)}` },
      { label: 'GRAND TOTAL', value: `AED ${totalAmount.toFixed(2)}`, accent: true }
    ];

    totals.forEach((total, idx) => {
      const x = margin + (idx * totalColWidth);
      doc.fillColor('#6abfa0').fontSize(6).font('Helvetica-Bold').text(total.label, x + 9.92, yPos + 2.83, { width: totalColWidth - 19.84 });
      doc.fillColor(total.accent ? '#5de8bc' : colors.white).fontSize(10).text(total.value, x + 9.92, yPos + 12.76, { width: totalColWidth - 19.84 });
      
      if (idx < totals.length - 1) {
        doc.strokeColor('#1e3028').lineWidth(0.71).moveTo(x + totalColWidth, yPos + 2.83).lineTo(x + totalColWidth, yPos + 32.6).stroke();
      }
    });

    yPos += 42.52; // 12mm spacing after totals bar

    // FOOTER - match Report.html positioning
    const footerY = pageHeight - 19.84; // 7mm from bottom
    doc.strokeColor(colors.rule).lineWidth(0.71).moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).stroke();
    
    doc.fillColor(colors.teal).fontSize(7).font('Helvetica-Bold').text('ReceiptAI', margin, footerY + 7.09);
    
    // AI badge
    const badgeWidth = 85;
    const badgeX = (pageWidth - badgeWidth) / 2;
    doc.fillColor(colors.ink).roundedRect(badgeX, footerY + 4.25, badgeWidth, 11.34, 5.67).fill();
    doc.fillColor(colors.white).fontSize(6).text('● AI-Generated Report', badgeX + 5.67, footerY + 7.09);
    
    doc.fillColor(colors.muted).fontSize(6.5).text('Page 1 of 1', pageWidth - margin - 42.52, footerY + 7.09);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
};
