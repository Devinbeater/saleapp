const request = require('supertest');
const express = require('express');
const sheetsRouter = require('../routes/sheets');
const entriesRouter = require('../routes/entries');
const denominationsRouter = require('../routes/denominations');
const reportsRouter = require('../routes/reports');

describe('Integration Tests', () => {
  let app;
  let testSheetId;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sheets', sheetsRouter);
    app.use('/api/entries', entriesRouter);
    app.use('/api/denominations', denominationsRouter);
    app.use('/api/reports', reportsRouter);
  });

  describe('Complete Daily Sheet Workflow', () => {
    it('should handle complete daily sheet workflow', async () => {
      const testDate = '2024-01-26';

      // Step 1: Create a new sheet
      const sheetResponse = await request(app)
        .post('/api/sheets')
        .send({ date: testDate });

      expect(sheetResponse.status).toBe(200);
      testSheetId = sheetResponse.body.sheetId;

      // Step 2: Add sheet note
      const noteResponse = await request(app)
        .put(`/api/sheets/${testSheetId}`)
        .send({ sheet_note: 'Test daily sheet for integration testing' });

      expect(noteResponse.status).toBe(200);
      expect(noteResponse.body.note).toBe('Test daily sheet for integration testing');

      // Step 3: Add entries for different sections
      const entries = [
        {
          section: 'POS',
          row_idx: 0,
          cell_key: 'POS_AMOUNT_0',
          raw_value: '1000',
          calculated_value: '1000',
          metadata: { salesman: 'John Doe' }
        },
        {
          section: 'POS',
          row_idx: 1,
          cell_key: 'POS_AMOUNT_1',
          raw_value: '500',
          calculated_value: '500',
          metadata: { salesman: 'Jane Smith' }
        },
        {
          section: 'KQR',
          row_idx: 0,
          cell_key: 'KQR_AMOUNT_0',
          raw_value: '750',
          calculated_value: '750',
          metadata: {}
        },
        {
          section: 'KSW',
          row_idx: 0,
          cell_key: 'KSW_AMOUNT_0',
          raw_value: '250',
          calculated_value: '250',
          metadata: {}
        },
        {
          section: 'DEBTOR',
          row_idx: 0,
          cell_key: 'DEBTOR_AMOUNT_0',
          raw_value: '200',
          calculated_value: '200',
          metadata: { party: 'ABC Corp' }
        },
        {
          section: 'POS',
          row_idx: 0,
          cell_key: 'TOTAL_SALE',
          raw_value: '=SUM(POS_AMOUNT_0:POS_AMOUNT_24) + SUM(KQR_AMOUNT_0:KQR_AMOUNT_24) + SUM(KSW_AMOUNT_0:KSW_AMOUNT_24)',
          calculated_value: '2500',
          metadata: {}
        },
        {
          section: 'POS',
          row_idx: 0,
          cell_key: 'NET_AMOUNT',
          raw_value: '=TOTAL_SALE - SUM(DEBTOR_AMOUNT_0:DEBTOR_AMOUNT_24)',
          calculated_value: '2300',
          metadata: {}
        }
      ];

      const entriesResponse = await request(app)
        .post('/api/entries')
        .send({ sheetId: testSheetId, entries });

      expect(entriesResponse.status).toBe(200);
      expect(entriesResponse.body.count).toBe(7);

      // Step 4: Add denominations
      const denominations = [
        {
          denomination_value: 500,
          denomination_label: '₹500',
          pieces: 4,
          calculated_amount: 2000
        },
        {
          denomination_value: 200,
          denomination_label: '₹200',
          pieces: 1,
          calculated_amount: 200
        },
        {
          denomination_value: 100,
          denomination_label: '₹100',
          pieces: 3,
          calculated_amount: 300
        },
        {
          denomination_value: 50,
          denomination_label: '₹50',
          pieces: 4,
          calculated_amount: 200
        },
        {
          denomination_value: 20,
          denomination_label: '₹20',
          pieces: 10,
          calculated_amount: 200
        },
        {
          denomination_value: 10,
          denomination_label: '₹10',
          pieces: 5,
          calculated_amount: 50
        },
        {
          denomination_value: 0,
          denomination_label: 'Coupons',
          pieces: 15,
          calculated_amount: 0
        }
      ];

      const denominationsResponse = await request(app)
        .post('/api/denominations')
        .send({ sheetId: testSheetId, denominations });

      expect(denominationsResponse.status).toBe(200);
      expect(denominationsResponse.body.count).toBe(7);

      // Step 5: Generate complete report
      const reportResponse = await request(app)
        .get(`/api/reports/${testSheetId}`);

      expect(reportResponse.status).toBe(200);
      expect(reportResponse.body.sheet.id).toBe(testSheetId);
      expect(reportResponse.body.sheet.note).toBe('Test daily sheet for integration testing');
      expect(reportResponse.body.entries.length).toBe(7);
      expect(reportResponse.body.denominations.length).toBe(7);
      expect(reportResponse.body.summary.totalSale).toBe('2500');
      expect(reportResponse.body.summary.netAmount).toBe('2300');
      expect(reportResponse.body.summary.totalCash).toBe('2950'); // 2000 + 200 + 300 + 200 + 200 + 50 + 0

      // Step 6: Verify data persistence by retrieving individual components
      const retrievedEntries = await request(app)
        .get(`/api/entries/${testSheetId}`);

      const retrievedDenominations = await request(app)
        .get(`/api/denominations/${testSheetId}`);

      expect(retrievedEntries.status).toBe(200);
      expect(retrievedDenominations.status).toBe(200);
      expect(retrievedEntries.body.length).toBe(7);
      expect(retrievedDenominations.body.length).toBe(7);
    });

    it('should handle data updates and recalculations', async () => {
      const testDate = '2024-01-27';

      // Create sheet and initial data
      const sheetResponse = await request(app)
        .post('/api/sheets')
        .send({ date: testDate });

      const sheetId = sheetResponse.body.sheetId;

      // Add initial entries
      const initialEntries = [
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
        .send({ sheetId, entries: initialEntries });

      // Update the entry
      const updatedEntries = [
        {
          section: 'POS',
          row_idx: 0,
          cell_key: 'POS_AMOUNT_0',
          raw_value: '200',
          calculated_value: '200',
          metadata: { updated: true }
        }
      ];

      const updateResponse = await request(app)
        .post('/api/entries')
        .send({ sheetId, entries: updatedEntries });

      expect(updateResponse.status).toBe(200);

      // Verify the update
      const retrievedEntries = await request(app)
        .get(`/api/entries/${sheetId}`);

      const updatedEntry = retrievedEntries.body.find(e => e.cell_key === 'POS_AMOUNT_0');
      expect(updatedEntry.raw_value).toBe('200');
      expect(updatedEntry.calculated_value).toBe('200');
    });

    it('should handle concurrent operations', async () => {
      const testDate = '2024-01-28';

      // Create sheet
      const sheetResponse = await request(app)
        .post('/api/sheets')
        .send({ date: testDate });

      const sheetId = sheetResponse.body.sheetId;

      // Perform concurrent operations
      const promises = [
        request(app)
          .post('/api/entries')
          .send({
            sheetId,
            entries: [
              {
                section: 'POS',
                row_idx: 0,
                cell_key: 'POS_AMOUNT_0',
                raw_value: '100',
                calculated_value: '100',
                metadata: {}
              }
            ]
          }),
        request(app)
          .post('/api/denominations')
          .send({
            sheetId,
            denominations: [
              {
                denomination_value: 100,
                denomination_label: '₹100',
                pieces: 1,
                calculated_amount: 100
              }
            ]
          }),
        request(app)
          .put(`/api/sheets/${sheetId}`)
          .send({ sheet_note: 'Concurrent test sheet' })
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      // Verify all operations completed successfully
      const reportResponse = await request(app)
        .get(`/api/reports/${sheetId}`);

      expect(reportResponse.status).toBe(200);
      expect(reportResponse.body.sheet.note).toBe('Concurrent test sheet');
      expect(reportResponse.body.entries.length).toBe(1);
      expect(reportResponse.body.denominations.length).toBe(1);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database constraints gracefully', async () => {
      const testDate = '2024-01-29';

      // Create sheet
      const sheetResponse = await request(app)
        .post('/api/sheets')
        .send({ date: testDate });

      const sheetId = sheetResponse.body.sheetId;

      // Try to create duplicate sheet for same date
      const duplicateSheetResponse = await request(app)
        .post('/api/sheets')
        .send({ date: testDate });

      expect(duplicateSheetResponse.status).toBe(200);
      expect(duplicateSheetResponse.body.sheetId).toBe(sheetId);
    });

    it('should handle invalid data gracefully', async () => {
      const testDate = '2024-01-30';

      // Create sheet
      const sheetResponse = await request(app)
        .post('/api/sheets')
        .send({ date: testDate });

      const sheetId = sheetResponse.body.sheetId;

      // Try to add invalid entries
      const invalidEntriesResponse = await request(app)
        .post('/api/entries')
        .send({
          sheetId: 99999, // Non-existent sheet
          entries: [
            {
              section: 'INVALID',
              row_idx: -1,
              cell_key: 'INVALID_KEY',
              raw_value: null,
              calculated_value: undefined,
              metadata: null
            }
          ]
        });

      expect(invalidEntriesResponse.status).toBe(404);
    });
  });
});
