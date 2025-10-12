const request = require('supertest');
const express = require('express');
const sheetsRouter = require('../routes/sheets');
const entriesRouter = require('../routes/entries');

describe('Entries API', () => {
  let app;
  let testSheetId;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/sheets', sheetsRouter);
    app.use('/api/entries', entriesRouter);

    // Create a test sheet
    const sheetResponse = await request(app)
      .post('/api/sheets')
      .send({ date: '2024-01-20' });
    
    testSheetId = sheetResponse.body.sheetId;
  });

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
        },
        {
          section: 'KQR',
          row_idx: 1,
          cell_key: 'KQR_AMOUNT_1',
          raw_value: '=POS_AMOUNT_0*2',
          calculated_value: '200',
          metadata: {}
        }
      ];

      const response = await request(app)
        .post('/api/entries')
        .send({ sheetId: testSheetId, entries });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.entries).toHaveLength(2);
    });

    it('should update existing entries', async () => {
      // First, create an entry
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

      await request(app)
        .post('/api/entries')
        .send({ sheetId: testSheetId, entries });

      // Update the entry
      const updatedEntries = [
        {
          section: 'POS',
          row_idx: 0,
          cell_key: 'POS_AMOUNT_0',
          raw_value: '150',
          calculated_value: '150',
          metadata: { updated: true }
        }
      ];

      const response = await request(app)
        .post('/api/entries')
        .send({ sheetId: testSheetId, entries: updatedEntries });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
    });

    it('should return 400 for invalid request data', async () => {
      const response = await request(app)
        .post('/api/entries')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent sheet', async () => {
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

      const response = await request(app)
        .post('/api/entries')
        .send({ sheetId: 99999, entries });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/entries/:sheetId', () => {
    it('should retrieve all entries for a sheet', async () => {
      // Create some entries first
      const entries = [
        {
          section: 'POS',
          row_idx: 0,
          cell_key: 'POS_AMOUNT_0',
          raw_value: '100',
          calculated_value: '100',
          metadata: {}
        },
        {
          section: 'KQR',
          row_idx: 1,
          cell_key: 'KQR_AMOUNT_1',
          raw_value: '200',
          calculated_value: '200',
          metadata: {}
        }
      ];

      await request(app)
        .post('/api/entries')
        .send({ sheetId: testSheetId, entries });

      const response = await request(app)
        .get(`/api/entries/${testSheetId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for sheet with no entries', async () => {
      // Create a new sheet
      const sheetResponse = await request(app)
        .post('/api/sheets')
        .send({ date: '2024-01-21' });

      const response = await request(app)
        .get(`/api/entries/${sheetResponse.body.sheetId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('DELETE /api/entries/:sheetId', () => {
    it('should delete all entries for a sheet', async () => {
      // Create entries first
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

      await request(app)
        .post('/api/entries')
        .send({ sheetId: testSheetId, entries });

      const response = await request(app)
        .delete(`/api/entries/${testSheetId}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBeGreaterThan(0);

      // Verify entries are deleted
      const getResponse = await request(app)
        .get(`/api/entries/${testSheetId}`);

      expect(getResponse.body).toEqual([]);
    });
  });
});
