const request = require('supertest');
const express = require('express');
const sheetsRouter = require('../routes/sheets');
const denominationsRouter = require('../routes/denominations');

describe('Denominations API', () => {
  let app;
  let testSheetId;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/sheets', sheetsRouter);
    app.use('/api/denominations', denominationsRouter);

    // Create a test sheet
    const sheetResponse = await request(app)
      .post('/api/sheets')
      .send({ date: '2024-01-22' });
    
    testSheetId = sheetResponse.body.sheetId;
  });

  describe('POST /api/denominations', () => {
    it('should save multiple denominations', async () => {
      const denominations = [
        {
          denomination_value: 500,
          denomination_label: '₹500',
          pieces: 10,
          calculated_amount: 5000
        },
        {
          denomination_value: 100,
          denomination_label: '₹100',
          pieces: 25,
          calculated_amount: 2500
        }
      ];

      const response = await request(app)
        .post('/api/denominations')
        .send({ sheetId: testSheetId, denominations });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.denominations).toHaveLength(2);
    });

    it('should update existing denominations', async () => {
      // First, create denominations
      const denominations = [
        {
          denomination_value: 500,
          denomination_label: '₹500',
          pieces: 10,
          calculated_amount: 5000
        }
      ];

      await request(app)
        .post('/api/denominations')
        .send({ sheetId: testSheetId, denominations });

      // Update the denomination
      const updatedDenominations = [
        {
          denomination_value: 500,
          denomination_label: '₹500',
          pieces: 15,
          calculated_amount: 7500
        }
      ];

      const response = await request(app)
        .post('/api/denominations')
        .send({ sheetId: testSheetId, denominations: updatedDenominations });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
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

      const response = await request(app)
        .post('/api/denominations')
        .send({ sheetId: testSheetId, denominations });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
    });

    it('should return 400 for invalid request data', async () => {
      const response = await request(app)
        .post('/api/denominations')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent sheet', async () => {
      const denominations = [
        {
          denomination_value: 100,
          denomination_label: '₹100',
          pieces: 10,
          calculated_amount: 1000
        }
      ];

      const response = await request(app)
        .post('/api/denominations')
        .send({ sheetId: 99999, denominations });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/denominations/:sheetId', () => {
    it('should retrieve all denominations for a sheet', async () => {
      // Create some denominations first
      const denominations = [
        {
          denomination_value: 200,
          denomination_label: '₹200',
          pieces: 5,
          calculated_amount: 1000
        },
        {
          denomination_value: 50,
          denomination_label: '₹50',
          pieces: 20,
          calculated_amount: 1000
        }
      ];

      await request(app)
        .post('/api/denominations')
        .send({ sheetId: testSheetId, denominations });

      const response = await request(app)
        .get(`/api/denominations/${testSheetId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Check that denominations are ordered by value (descending)
      const values = response.body.map(d => d.denomination_value);
      const sortedValues = [...values].sort((a, b) => b - a);
      expect(values).toEqual(sortedValues);
    });

    it('should return empty array for sheet with no denominations', async () => {
      // Create a new sheet
      const sheetResponse = await request(app)
        .post('/api/sheets')
        .send({ date: '2024-01-23' });

      const response = await request(app)
        .get(`/api/denominations/${sheetResponse.body.sheetId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('DELETE /api/denominations/:sheetId', () => {
    it('should delete all denominations for a sheet', async () => {
      // Create denominations first
      const denominations = [
        {
          denomination_value: 100,
          denomination_label: '₹100',
          pieces: 10,
          calculated_amount: 1000
        }
      ];

      await request(app)
        .post('/api/denominations')
        .send({ sheetId: testSheetId, denominations });

      const response = await request(app)
        .delete(`/api/denominations/${testSheetId}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBeGreaterThan(0);

      // Verify denominations are deleted
      const getResponse = await request(app)
        .get(`/api/denominations/${testSheetId}`);

      expect(getResponse.body).toEqual([]);
    });
  });
});
