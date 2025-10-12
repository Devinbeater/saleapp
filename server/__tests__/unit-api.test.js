/**
 * Unit Tests for API Routes (without database)
 * These tests mock the database layer to test API logic
 */

const request = require('supertest');
const express = require('express');

// Mock the database module
jest.mock('../db', () => ({
  query: jest.fn()
}));

const { query } = require('../db');
const sheetsRouter = require('../routes/sheets');
const entriesRouter = require('../routes/entries');
const denominationsRouter = require('../routes/denominations');
const reportsRouter = require('../routes/reports');

describe('API Unit Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    app.use('/api/sheets', sheetsRouter);
    app.use('/api/entries', entriesRouter);
    app.use('/api/denominations', denominationsRouter);
    app.use('/api/reports', reportsRouter);
  });

  describe('Sheets API Unit Tests', () => {
    describe('POST /api/sheets', () => {
      it('should create a new sheet for today', async () => {
        const mockSheetData = {
          rows: [{
            id: 1,
            sheet_date: '2024-01-15',
            sheet_note: null
          }]
        };

        query.mockResolvedValueOnce({ rows: [] }); // No existing sheet
        query.mockResolvedValueOnce(mockSheetData); // Created sheet

        const response = await request(app)
          .post('/api/sheets')
          .send({});

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('sheetId', 1);
        expect(response.body).toHaveProperty('date', '2024-01-15');
        expect(query).toHaveBeenCalledTimes(2);
      });

      it('should return existing sheet if found', async () => {
        const mockSheetData = {
          rows: [{
            id: 1,
            sheet_date: '2024-01-15',
            sheet_note: 'Test note'
          }]
        };

        query.mockResolvedValueOnce(mockSheetData); // Existing sheet found

        const response = await request(app)
          .post('/api/sheets')
          .send({ date: '2024-01-15' });

        expect(response.status).toBe(200);
        expect(response.body.sheetId).toBe(1);
        expect(response.body.note).toBe('Test note');
        expect(query).toHaveBeenCalledTimes(1);
      });

      it('should handle database errors gracefully', async () => {
        query.mockRejectedValueOnce(new Error('Database connection failed'));

        const response = await request(app)
          .post('/api/sheets')
          .send({});

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Failed to create or fetch sheet');
      });
    });

    describe('GET /api/sheets/:date', () => {
      it('should retrieve existing sheet by date', async () => {
        const mockSheetData = {
          rows: [{
            id: 1,
            sheet_date: '2024-01-15',
            sheet_note: 'Test note'
          }]
        };

        query.mockResolvedValueOnce(mockSheetData);

        const response = await request(app)
          .get('/api/sheets/2024-01-15');

        expect(response.status).toBe(200);
        expect(response.body.sheetId).toBe(1);
        expect(response.body.date).toBe('2024-01-15');
      });

      it('should return 404 for non-existent sheet', async () => {
        query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
          .get('/api/sheets/2024-01-15');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Sheet not found for the specified date');
      });
    });

    describe('PUT /api/sheets/:id', () => {
      it('should update sheet note', async () => {
        const mockUpdatedSheet = {
          rows: [{
            id: 1,
            sheet_date: '2024-01-15',
            sheet_note: 'Updated note'
          }]
        };

        query.mockResolvedValueOnce(mockUpdatedSheet);

        const response = await request(app)
          .put('/api/sheets/1')
          .send({ sheet_note: 'Updated note' });

        expect(response.status).toBe(200);
        expect(response.body.note).toBe('Updated note');
      });

      it('should return 404 for non-existent sheet ID', async () => {
        query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
          .put('/api/sheets/999')
          .send({ sheet_note: 'Updated note' });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Sheet not found');
      });
    });
  });

  describe('Entries API Unit Tests', () => {
    describe('POST /api/entries', () => {
      it('should save multiple entries', async () => {
        const entries = [
          {
            section: 'POS',
            row_idx: 0,
            cell_key: 'POS_AMOUNT_0',
            raw_value: '100',
            calculated_value: '100',
            metadata: {}
          }
        ];

        query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Sheet exists check
        query.mockResolvedValueOnce({ rows: [{ id: 1, cell_key: 'POS_AMOUNT_0' }] }); // Insert result

        const response = await request(app)
          .post('/api/entries')
          .send({ sheetId: 1, entries });

        expect(response.status).toBe(200);
        expect(response.body.count).toBe(1);
        expect(response.body.entries).toHaveLength(1);
      });

      it('should return 400 for invalid request data', async () => {
        const response = await request(app)
          .post('/api/entries')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid request data');
      });

      it('should return 404 for non-existent sheet', async () => {
        query.mockResolvedValueOnce({ rows: [] }); // Sheet doesn't exist

        const response = await request(app)
          .post('/api/entries')
          .send({ sheetId: 999, entries: [] });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Sheet not found');
      });
    });

    describe('GET /api/entries/:sheetId', () => {
      it('should retrieve all entries for a sheet', async () => {
        const mockEntries = [
          {
            section: 'POS',
            row_idx: 0,
            cell_key: 'POS_AMOUNT_0',
            raw_value: '100',
            calculated_value: '100',
            metadata: {}
          }
        ];

        query.mockResolvedValueOnce({ rows: mockEntries });

        const response = await request(app)
          .get('/api/entries/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockEntries);
      });
    });
  });

  describe('Denominations API Unit Tests', () => {
    describe('POST /api/denominations', () => {
      it('should save multiple denominations', async () => {
        const denominations = [
          {
            denomination_value: 100,
            denomination_label: '₹100',
            pieces: 10,
            calculated_amount: 1000
          }
        ];

        query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Sheet exists check
        query.mockResolvedValueOnce({ rows: [{ id: 1, denomination_value: 100 }] }); // Insert result

        const response = await request(app)
          .post('/api/denominations')
          .send({ sheetId: 1, denominations });

        expect(response.status).toBe(200);
        expect(response.body.count).toBe(1);
        expect(response.body.denominations).toHaveLength(1);
      });

      it('should handle coupons (denomination_value: 0)', async () => {
        const denominations = [
          {
            denomination_value: 0,
            denomination_label: 'Coupons',
            pieces: 5,
            calculated_amount: 0
          }
        ];

        query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Sheet exists check
        query.mockResolvedValueOnce({ rows: [{ id: 1, denomination_value: 0 }] }); // Insert result

        const response = await request(app)
          .post('/api/denominations')
          .send({ sheetId: 1, denominations });

        expect(response.status).toBe(200);
        expect(response.body.count).toBe(1);
      });
    });

    describe('GET /api/denominations/:sheetId', () => {
      it('should retrieve all denominations for a sheet', async () => {
        const mockDenominations = [
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
          }
        ];

        query.mockResolvedValueOnce({ rows: mockDenominations });

        const response = await request(app)
          .get('/api/denominations/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockDenominations);
        
        // Verify denominations are ordered by value (descending)
        expect(response.body[0].denomination_value).toBeGreaterThan(response.body[1].denomination_value);
      });
    });
  });

  describe('Reports API Unit Tests', () => {
    describe('GET /api/reports/:sheetId', () => {
      it('should generate a complete report', async () => {
        const mockSheet = {
          rows: [{
            id: 1,
            sheet_date: '2024-01-15',
            sheet_note: 'Test sheet'
          }]
        };

        const mockEntries = [
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
          }
        ];

        const mockDenominations = [
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
          }
        ];

        query.mockResolvedValueOnce(mockSheet); // Sheet query
        query.mockResolvedValueOnce({ rows: mockEntries }); // Entries query
        query.mockResolvedValueOnce({ rows: mockDenominations }); // Denominations query

        const response = await request(app)
          .get('/api/reports/1');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('sheet');
        expect(response.body).toHaveProperty('entries');
        expect(response.body).toHaveProperty('denominations');
        expect(response.body).toHaveProperty('summary');
        expect(response.body).toHaveProperty('generatedAt');

        // Check summary calculations
        expect(response.body.summary.totalSale).toBe('1000');
        expect(response.body.summary.netAmount).toBe('800');
        expect(response.body.summary.totalCash).toBe('1500'); // 1000 + 500
      });

      it('should return 404 for non-existent sheet', async () => {
        query.mockResolvedValueOnce({ rows: [] }); // Sheet not found

        const response = await request(app)
          .get('/api/reports/999');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Sheet not found');
      });
    });
  });
});
