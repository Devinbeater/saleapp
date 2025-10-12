const request = require('supertest');
const express = require('express');
const sheetsRouter = require('../routes/sheets');
const entriesRouter = require('../routes/entries');
const denominationsRouter = require('../routes/denominations');
const reportsRouter = require('../routes/reports');

describe('Reports API', () => {
  let app;
  let testSheetId;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/sheets', sheetsRouter);
    app.use('/api/entries', entriesRouter);
    app.use('/api/denominations', denominationsRouter);
    app.use('/api/reports', reportsRouter);

    // Create a test sheet with data
    const sheetResponse = await request(app)
      .post('/api/sheets')
      .send({ date: '2024-01-24' });
    
    testSheetId = sheetResponse.body.sheetId;

    // Add test entries
    const entries = [
      {
        section: 'POS',
        row_idx: 0,
        cell_key: 'TOTAL_SALE',
        raw_value: '=SUM(POS_AMOUNT_0:POS_AMOUNT_24)',
        calculated_value: '1000',
        metadata: {}
      },
      {
        section: 'POS',
        row_idx: 0,
        cell_key: 'NET_AMOUNT',
        raw_value: '=TOTAL_SALE - SUM(DEBTOR_AMOUNT_0:DEBTOR_AMOUNT_24)',
        calculated_value: '800',
        metadata: {}
      },
      {
        section: 'POS',
        row_idx: 0,
        cell_key: 'POS_AMOUNT_0',
        raw_value: '500',
        calculated_value: '500',
        metadata: {}
      },
      {
        section: 'KQR',
        row_idx: 1,
        cell_key: 'KQR_AMOUNT_1',
        raw_value: '300',
        calculated_value: '300',
        metadata: {}
      }
    ];

    await request(app)
      .post('/api/entries')
      .send({ sheetId: testSheetId, entries });

    // Add test denominations
    const denominations = [
      {
        denomination_value: 500,
        denomination_label: '₹500',
        pieces: 2,
        calculated_amount: 1000
      },
      {
        denomination_value: 100,
        denomination_label: '₹100',
        pieces: 5,
        calculated_amount: 500
      },
      {
        denomination_value: 50,
        denomination_label: '₹50',
        pieces: 10,
        calculated_amount: 500
      }
    ];

    await request(app)
      .post('/api/denominations')
      .send({ sheetId: testSheetId, denominations });
  });

  describe('GET /api/reports/:sheetId', () => {
    it('should generate a complete report', async () => {
      const response = await request(app)
        .get(`/api/reports/${testSheetId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sheet');
      expect(response.body).toHaveProperty('entries');
      expect(response.body).toHaveProperty('denominations');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('generatedAt');
    });

    it('should include correct sheet information', async () => {
      const response = await request(app)
        .get(`/api/reports/${testSheetId}`);

      expect(response.body.sheet).toHaveProperty('id', testSheetId);
      expect(response.body.sheet).toHaveProperty('date', '2024-01-24');
      expect(response.body.sheet).toHaveProperty('note');
    });

    it('should include all entries', async () => {
      const response = await request(app)
        .get(`/api/reports/${testSheetId}`);

      expect(Array.isArray(response.body.entries)).toBe(true);
      expect(response.body.entries.length).toBeGreaterThan(0);
      
      // Check for specific entries
      const entryKeys = response.body.entries.map(e => e.cell_key);
      expect(entryKeys).toContain('TOTAL_SALE');
      expect(entryKeys).toContain('NET_AMOUNT');
      expect(entryKeys).toContain('POS_AMOUNT_0');
      expect(entryKeys).toContain('KQR_AMOUNT_1');
    });

    it('should include all denominations', async () => {
      const response = await request(app)
        .get(`/api/reports/${testSheetId}`);

      expect(Array.isArray(response.body.denominations)).toBe(true);
      expect(response.body.denominations.length).toBeGreaterThan(0);
      
      // Check for specific denominations
      const denominationValues = response.body.denominations.map(d => d.denomination_value);
      expect(denominationValues).toContain(500);
      expect(denominationValues).toContain(100);
      expect(denominationValues).toContain(50);
    });

    it('should calculate correct summary totals', async () => {
      const response = await request(app)
        .get(`/api/reports/${testSheetId}`);

      expect(response.body.summary).toHaveProperty('totalSale');
      expect(response.body.summary).toHaveProperty('netAmount');
      expect(response.body.summary).toHaveProperty('totalCash');

      // Check calculated values
      expect(response.body.summary.totalSale).toBe('1000');
      expect(response.body.summary.netAmount).toBe('800');
      expect(response.body.summary.totalCash).toBe('2000'); // 1000 + 500 + 500
    });

    it('should include generation timestamp', async () => {
      const response = await request(app)
        .get(`/api/reports/${testSheetId}`);

      expect(response.body.generatedAt).toBeDefined();
      expect(new Date(response.body.generatedAt)).toBeInstanceOf(Date);
    });

    it('should return 404 for non-existent sheet', async () => {
      const response = await request(app)
        .get('/api/reports/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle sheet with no data gracefully', async () => {
      // Create a new empty sheet
      const sheetResponse = await request(app)
        .post('/api/sheets')
        .send({ date: '2024-01-25' });

      const response = await request(app)
        .get(`/api/reports/${sheetResponse.body.sheetId}`);

      expect(response.status).toBe(200);
      expect(response.body.entries).toEqual([]);
      expect(response.body.denominations).toEqual([]);
      expect(response.body.summary.totalSale).toBe('0');
      expect(response.body.summary.netAmount).toBe('0');
      expect(response.body.summary.totalCash).toBe('0');
    });
  });
});
