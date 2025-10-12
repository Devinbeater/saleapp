const express = require('express');
const { query } = require('../db');

const router = express.Router();

// POST /api/denominations - Save or update multiple denomination records
router.post('/', async (req, res) => {
  try {
    const { sheetId, denominations } = req.body;

    if (!sheetId || !denominations || !Array.isArray(denominations)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Verify sheet exists
    const sheetCheck = await query('SELECT id FROM daily_sheets WHERE id = $1', [sheetId]);
    if (sheetCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    const results = [];
    
    // Process each denomination
    for (const denom of denominations) {
      const { denomination_value, denomination_label, pieces, calculated_amount } = denom;
      
      // Insert or update denomination
      const result = await query(`
        INSERT INTO denominations (sheet_id, denomination_value, denomination_label, pieces, calculated_amount)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (sheet_id, denomination_value)
        DO UPDATE SET
          denomination_label = EXCLUDED.denomination_label,
          pieces = EXCLUDED.pieces,
          calculated_amount = EXCLUDED.calculated_amount,
          updated_at = NOW()
        RETURNING id, denomination_value, pieces, calculated_amount
      `, [sheetId, denomination_value, denomination_label, pieces, calculated_amount]);
      
      results.push(result.rows[0]);
    }

    res.json({ 
      message: 'Denominations saved successfully',
      count: results.length,
      denominations: results
    });
  } catch (error) {
    console.error('Error saving denominations:', error);
    res.status(500).json({ error: 'Failed to save denominations' });
  }
});

// GET /api/denominations/:sheetId - Fetch all denominations for a given sheet ID
router.get('/:sheetId', async (req, res) => {
  try {
    const { sheetId } = req.params;

    const denominations = await query(
      'SELECT denomination_value, denomination_label, pieces, calculated_amount FROM denominations WHERE sheet_id = $1 ORDER BY denomination_value DESC',
      [sheetId]
    );

    res.json(denominations.rows);
  } catch (error) {
    console.error('Error fetching denominations:', error);
    res.status(500).json({ error: 'Failed to fetch denominations' });
  }
});

// DELETE /api/denominations/:sheetId - Delete all denominations for a sheet
router.delete('/:sheetId', async (req, res) => {
  try {
    const { sheetId } = req.params;

    const result = await query('DELETE FROM denominations WHERE sheet_id = $1', [sheetId]);

    res.json({ 
      message: 'Denominations deleted successfully',
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error deleting denominations:', error);
    res.status(500).json({ error: 'Failed to delete denominations' });
  }
});

module.exports = router;
