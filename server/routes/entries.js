const express = require('express');
const { query } = require('../db');

const router = express.Router();

// POST /api/entries - Save or update multiple entries for a given sheet
router.post('/', async (req, res) => {
  try {
    const { sheetId, entries } = req.body;

    if (!sheetId || !entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Verify sheet exists
    const sheetCheck = await query('SELECT id FROM daily_sheets WHERE id = $1', [sheetId]);
    if (sheetCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    const results = [];
    
    // Process each entry
    for (const entry of entries) {
      const { section, row_idx, cell_key, raw_value, calculated_value, metadata } = entry;
      
      // Insert or update entry
      const result = await query(`
        INSERT INTO entries (sheet_id, section, row_idx, cell_key, raw_value, calculated_value, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (sheet_id, cell_key)
        DO UPDATE SET
          section = EXCLUDED.section,
          row_idx = EXCLUDED.row_idx,
          raw_value = EXCLUDED.raw_value,
          calculated_value = EXCLUDED.calculated_value,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
        RETURNING id, cell_key
      `, [sheetId, section, row_idx, cell_key, raw_value, calculated_value, JSON.stringify(metadata)]);
      
      results.push(result.rows[0]);
    }

    res.json({ 
      message: 'Entries saved successfully',
      count: results.length,
      entries: results
    });
  } catch (error) {
    console.error('Error saving entries:', error);
    res.status(500).json({ error: 'Failed to save entries' });
  }
});

// GET /api/entries/:sheetId - Fetch all entries for a given sheet ID
router.get('/:sheetId', async (req, res) => {
  try {
    const { sheetId } = req.params;

    const entries = await query(
      'SELECT section, row_idx, cell_key, raw_value, calculated_value, metadata FROM entries WHERE sheet_id = $1 ORDER BY section, row_idx',
      [sheetId]
    );

    res.json(entries.rows);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// DELETE /api/entries/:sheetId - Delete all entries for a sheet (useful for clearing data)
router.delete('/:sheetId', async (req, res) => {
  try {
    const { sheetId } = req.params;

    const result = await query('DELETE FROM entries WHERE sheet_id = $1', [sheetId]);

    res.json({ 
      message: 'Entries deleted successfully',
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error deleting entries:', error);
    res.status(500).json({ error: 'Failed to delete entries' });
  }
});

module.exports = router;
