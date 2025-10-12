const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/reports/:sheetId - Generate and return a full report
router.get('/:sheetId', async (req, res) => {
  const { sheetId } = req.params;

  try {
    // Get sheet information
    const sheetResult = await query(
      'SELECT id, sheet_date, sheet_note, created_at, updated_at FROM daily_sheets WHERE id = $1',
      [sheetId]
    );
    
    if (sheetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sheet not found' });
    }
    
    const sheet = sheetResult.rows[0];

    // Get all entries for this sheet
    const entriesResult = await query(
      `SELECT section, row_idx, cell_key, raw_value, calculated_value, metadata 
       FROM entries 
       WHERE sheet_id = $1 
       ORDER BY section, row_idx`,
      [sheetId]
    );
    const entries = entriesResult.rows;

    // Get all denominations for this sheet
    const denominationsResult = await query(
      `SELECT denomination_value, denomination_label, pieces, calculated_amount 
       FROM denominations 
       WHERE sheet_id = $1 
       ORDER BY denomination_value DESC`,
      [sheetId]
    );
    const denominations = denominationsResult.rows;

    // Calculate summary totals
    let totalSale = 0;
    let netAmount = 0;
    let totalCash = 0;

    // Calculate total sale from entries
    entries.forEach(entry => {
      if (entry.cell_key === 'TOTAL_SALE' && entry.calculated_value) {
        totalSale = parseFloat(entry.calculated_value) || 0;
      }
      if (entry.cell_key === 'NET_AMOUNT' && entry.calculated_value) {
        netAmount = parseFloat(entry.calculated_value) || 0;
      }
    });

    // Calculate total cash from denominations
    totalCash = denominations.reduce((sum, d) => sum + parseFloat(d.calculated_amount || 0), 0);

    // If totals are not found in entries, calculate from data
    if (totalSale === 0) {
      const posTotal = entries
        .filter(e => e.section === 'POS' && e.calculated_value)
        .reduce((sum, e) => sum + (parseFloat(e.calculated_value) || 0), 0);
      
      const kqrTotal = entries
        .filter(e => e.section === 'KQR' && e.calculated_value)
        .reduce((sum, e) => sum + (parseFloat(e.calculated_value) || 0), 0);
      
      const kswTotal = entries
        .filter(e => e.section === 'KSW' && e.calculated_value)
        .reduce((sum, e) => sum + (parseFloat(e.calculated_value) || 0), 0);
      
      totalSale = posTotal + kqrTotal + kswTotal;
    }

    if (netAmount === 0) {
      const debtorTotal = entries
        .filter(e => e.section === 'DEBTOR' && e.calculated_value)
        .reduce((sum, e) => sum + (parseFloat(e.calculated_value) || 0), 0);
      
      netAmount = totalSale - debtorTotal;
    }

    res.status(200).json({
      sheet: {
        id: sheet.id,
        date: sheet.sheet_date,
        note: sheet.sheet_note,
        createdAt: sheet.created_at,
        updatedAt: sheet.updated_at,
      },
      entries,
      denominations,
      summary: {
        totalSale: totalSale.toFixed(2),
        netAmount: netAmount.toFixed(2),
        totalCash: totalCash.toFixed(2),
        entryCount: entries.length,
        denominationCount: denominations.length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /api/reports/dates - Get all available dates with sheets
router.get('/dates/list', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        id,
        sheet_date,
        sheet_note,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM entries WHERE sheet_id = daily_sheets.id) as entry_count,
        (SELECT COUNT(*) FROM denominations WHERE sheet_id = daily_sheets.id) as denomination_count
       FROM daily_sheets 
       ORDER BY sheet_date DESC`,
      []
    );

    res.status(200).json({
      sheets: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching dates list:', error);
    res.status(500).json({ error: 'Failed to fetch dates list' });
  }
});

// GET /api/reports/range/:startDate/:endDate - Get reports for date range
router.get('/range/:startDate/:endDate', async (req, res) => {
  const { startDate, endDate } = req.params;

  try {
    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const result = await query(
      `SELECT 
        id,
        sheet_date,
        sheet_note,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM entries WHERE sheet_id = daily_sheets.id) as entry_count,
        (SELECT COUNT(*) FROM denominations WHERE sheet_id = daily_sheets.id) as denomination_count
       FROM daily_sheets 
       WHERE sheet_date >= $1 AND sheet_date <= $2
       ORDER BY sheet_date DESC`,
      [startDate, endDate]
    );

    res.status(200).json({
      sheets: result.rows,
      total: result.rows.length,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });
  } catch (error) {
    console.error('Error fetching date range reports:', error);
    res.status(500).json({ error: 'Failed to fetch date range reports' });
  }
});

// GET /api/reports/summary - Get summary statistics
router.get('/summary/overview', async (req, res) => {
  try {
    // Get total sheets count
    const sheetsCount = await query('SELECT COUNT(*) as count FROM daily_sheets');
    
    // Get date range
    const dateRange = await query(
      'SELECT MIN(sheet_date) as earliest, MAX(sheet_date) as latest FROM daily_sheets'
    );
    
    // Get total entries and denominations
    const entriesCount = await query('SELECT COUNT(*) as count FROM entries');
    const denominationsCount = await query('SELECT COUNT(*) as count FROM denominations');
    
    // Get recent activity (last 7 days)
    const recentActivity = await query(
      `SELECT 
        COUNT(*) as sheets_count,
        SUM((SELECT COUNT(*) FROM entries WHERE sheet_id = daily_sheets.id)) as entries_count,
        SUM((SELECT COUNT(*) FROM denominations WHERE sheet_id = daily_sheets.id)) as denominations_count
       FROM daily_sheets 
       WHERE created_at >= NOW() - INTERVAL '7 days'`
    );

    res.status(200).json({
      overview: {
        totalSheets: parseInt(sheetsCount.rows[0].count),
        totalEntries: parseInt(entriesCount.rows[0].count),
        totalDenominations: parseInt(denominationsCount.rows[0].count),
        dateRange: {
          earliest: dateRange.rows[0].earliest,
          latest: dateRange.rows[0].latest
        },
        recentActivity: {
          last7Days: {
            sheets: parseInt(recentActivity.rows[0].sheets_count) || 0,
            entries: parseInt(recentActivity.rows[0].entries_count) || 0,
            denominations: parseInt(recentActivity.rows[0].denominations_count) || 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching summary overview:', error);
    res.status(500).json({ error: 'Failed to fetch summary overview' });
  }
});

module.exports = router;