const express = require('express');
const { query } = require('../db');

const router = express.Router();

// POST /api/sheets - Create a new sheet for today's date or return existing
router.post('/', async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0]; // Default to today
    
    // Check if sheet already exists
    const existingSheet = await query(
      'SELECT id, sheet_date, sheet_note FROM daily_sheets WHERE sheet_date = $1',
      [targetDate]
    );

    if (existingSheet.rows.length > 0) {
      return res.json({
        sheetId: existingSheet.rows[0].id,
        date: existingSheet.rows[0].sheet_date,
        note: existingSheet.rows[0].sheet_note
      });
    }

    // Create new sheet
    const newSheet = await query(
      'INSERT INTO daily_sheets (sheet_date, sheet_note) VALUES ($1, $2) RETURNING id, sheet_date, sheet_note',
      [targetDate, null]
    );

    res.json({
      sheetId: newSheet.rows[0].id,
      date: newSheet.rows[0].sheet_date,
      note: newSheet.rows[0].sheet_note
    });
  } catch (error) {
    console.error('Error creating/fetching sheet:', error);
    res.status(500).json({ error: 'Failed to create or fetch sheet' });
  }
});

// GET /api/sheets/:date - Retrieve a specific sheet by date
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    const sheet = await query(
      'SELECT id, sheet_date, sheet_note FROM daily_sheets WHERE sheet_date = $1',
      [date]
    );

    if (sheet.rows.length === 0) {
      return res.status(404).json({ error: 'Sheet not found for the specified date' });
    }

    res.json({
      sheetId: sheet.rows[0].id,
      date: sheet.rows[0].sheet_date,
      note: sheet.rows[0].sheet_note
    });
  } catch (error) {
    console.error('Error fetching sheet:', error);
    res.status(500).json({ error: 'Failed to fetch sheet' });
  }
});

// PUT /api/sheets/:id - Update sheet note
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sheet_note } = req.body;
    
    const updatedSheet = await query(
      'UPDATE daily_sheets SET sheet_note = $1, updated_at = NOW() WHERE id = $2 RETURNING id, sheet_date, sheet_note',
      [sheet_note, id]
    );

    if (updatedSheet.rows.length === 0) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    res.json({
      sheetId: updatedSheet.rows[0].id,
      date: updatedSheet.rows[0].sheet_date,
      note: updatedSheet.rows[0].sheet_note
    });
  } catch (error) {
    console.error('Error updating sheet:', error);
    res.status(500).json({ error: 'Failed to update sheet' });
  }
});

module.exports = router;
