const request = require('supertest');
const express = require('express');
const sheetsRouter = require('../routes/sheets');

describe('Sheets API', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sheets', sheetsRouter);
  });

  describe('POST /api/sheets', () => {
    it('should create a new sheet for today', async () => {
      const response = await request(app)
        .post('/api/sheets')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sheetId');
      expect(response.body).toHaveProperty('date');
      expect(response.body.date).toBe(new Date().toISOString().split('T')[0]);
    });

    it('should create a new sheet for specific date', async () => {
      const testDate = '2024-01-15';
      const response = await request(app)
        .post('/api/sheets')
        .send({ date: testDate });

      expect(response.status).toBe(200);
      expect(response.body.date).toBe(testDate);
      expect(response.body).toHaveProperty('sheetId');
    });

    it('should return existing sheet if already exists', async () => {
      const testDate = '2024-01-16';
      
      // Create first sheet
      const firstResponse = await request(app)
        .post('/api/sheets')
        .send({ date: testDate });

      // Try to create same sheet again
      const secondResponse = await request(app)
        .post('/api/sheets')
        .send({ date: testDate });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.sheetId).toBe(firstResponse.body.sheetId);
    });
  });

  describe('GET /api/sheets/:date', () => {
    it('should retrieve existing sheet by date', async () => {
      const testDate = '2024-01-17';
      
      // Create sheet first
      const createResponse = await request(app)
        .post('/api/sheets')
        .send({ date: testDate });

      // Retrieve sheet
      const getResponse = await request(app)
        .get(`/api/sheets/${testDate}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.sheetId).toBe(createResponse.body.sheetId);
      expect(getResponse.body.date).toBe(testDate);
    });

    it('should return 404 for non-existent sheet', async () => {
      const response = await request(app)
        .get('/api/sheets/2024-12-31');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid date format', async () => {
      const response = await request(app)
        .get('/api/sheets/invalid-date');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/sheets/:id', () => {
    it('should update sheet note', async () => {
      // Create sheet first
      const createResponse = await request(app)
        .post('/api/sheets')
        .send({ date: '2024-01-18' });

      const sheetId = createResponse.body.sheetId;
      const newNote = 'Updated test note';

      const response = await request(app)
        .put(`/api/sheets/${sheetId}`)
        .send({ sheet_note: newNote });

      expect(response.status).toBe(200);
      expect(response.body.note).toBe(newNote);
    });

    it('should return 404 for non-existent sheet ID', async () => {
      const response = await request(app)
        .put('/api/sheets/99999')
        .send({ sheet_note: 'Test note' });

      expect(response.status).toBe(404);
    });
  });
});
