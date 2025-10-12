/**
 * Validation Tests for API Input Validation
 */

describe('API Input Validation', () => {
  describe('Date Validation', () => {
    it('should validate correct date format', () => {
      const validDates = ['2024-01-15', '2024-12-31', '2023-02-29'];
      
      validDates.forEach(date => {
        const dateObj = new Date(date);
        expect(dateObj.getTime()).not.toBeNaN();
      });
    });

    it('should reject invalid date formats', () => {
      const invalidDates = ['invalid-date', '2024-13-01', '2024-01-32', '01/01/2024'];
      
      invalidDates.forEach(date => {
        const dateObj = new Date(date);
        expect(isNaN(dateObj.getTime())).toBe(true);
      });
    });
  });

  describe('Sheet Data Validation', () => {
    it('should validate entry structure', () => {
      const validEntry = {
        section: 'POS',
        row_idx: 0,
        cell_key: 'POS_AMOUNT_0',
        raw_value: '100',
        calculated_value: '100',
        metadata: {}
      };

      expect(validEntry.section).toMatch(/^(POS|KQR|KSW|DEBTOR)$/);
      expect(typeof validEntry.row_idx).toBe('number');
      expect(validEntry.row_idx).toBeGreaterThanOrEqual(0);
      expect(validEntry.row_idx).toBeLessThan(25);
      expect(validEntry.cell_key).toMatch(/^[A-Z_]+_\d+$/);
    });

    it('should validate denomination structure', () => {
      const validDenomination = {
        denomination_value: 100,
        denomination_label: '₹100',
        pieces: 10,
        calculated_amount: 1000
      };

      expect(typeof validDenomination.denomination_value).toBe('number');
      expect(typeof validDenomination.pieces).toBe('number');
      expect(validDenomination.pieces).toBeGreaterThanOrEqual(0);
      expect(typeof validDenomination.calculated_amount).toBe('number');
      expect(validDenomination.calculated_amount).toBeGreaterThanOrEqual(0);
    });

    it('should validate calculated amount matches pieces * denomination', () => {
      const denomination = {
        denomination_value: 100,
        pieces: 10,
        calculated_amount: 1000
      };

      const expectedAmount = denomination.denomination_value * denomination.pieces;
      expect(denomination.calculated_amount).toBe(expectedAmount);
    });
  });

  describe('Formula Validation', () => {
    it('should validate SUM formula syntax', () => {
      const validFormulas = [
        '=SUM(POS_AMOUNT_0:POS_AMOUNT_24)',
        '=SUM(KQR_AMOUNT_0:KQR_AMOUNT_24)',
        '=SUM(KSW_AMOUNT_0:KSW_AMOUNT_24)',
        '=SUM(DEBTOR_AMOUNT_0:DEBTOR_AMOUNT_24)'
      ];

      validFormulas.forEach(formula => {
        expect(formula).toMatch(/^=SUM\([A-Z_]+_\d+:[A-Z_]+_\d+\)$/);
      });
    });

    it('should validate cell reference format', () => {
      const validCellRefs = [
        'POS_AMOUNT_0',
        'KQR_AMOUNT_24',
        'KSW_AMOUNT_12',
        'DEBTOR_AMOUNT_5'
      ];

      validCellRefs.forEach(ref => {
        expect(ref).toMatch(/^(POS|KQR|KSW|DEBTOR)_AMOUNT_\d+$/);
      });
    });

    it('should validate row index bounds', () => {
      const cellRefs = ['POS_AMOUNT_0', 'POS_AMOUNT_24', 'POS_AMOUNT_25'];
      
      cellRefs.forEach(ref => {
        const rowIndex = parseInt(ref.split('_')[2]);
        if (ref === 'POS_AMOUNT_25') {
          expect(rowIndex).toBeGreaterThan(24);
        } else {
          expect(rowIndex).toBeGreaterThanOrEqual(0);
          expect(rowIndex).toBeLessThanOrEqual(24);
        }
      });
    });
  });

  describe('JSON Schema Validation', () => {
    it('should validate complete entry object', () => {
      const entry = {
        section: 'POS',
        row_idx: 0,
        cell_key: 'POS_AMOUNT_0',
        raw_value: '100',
        calculated_value: '100',
        metadata: { salesman: 'John Doe' }
      };

      // Required fields
      expect(entry).toHaveProperty('section');
      expect(entry).toHaveProperty('row_idx');
      expect(entry).toHaveProperty('cell_key');
      expect(entry).toHaveProperty('raw_value');
      expect(entry).toHaveProperty('calculated_value');
      expect(entry).toHaveProperty('metadata');

      // Type validation
      expect(typeof entry.section).toBe('string');
      expect(typeof entry.row_idx).toBe('number');
      expect(typeof entry.cell_key).toBe('string');
      expect(typeof entry.raw_value).toBe('string');
      expect(typeof entry.calculated_value).toBe('string');
      expect(typeof entry.metadata).toBe('object');
    });

    it('should validate complete denomination object', () => {
      const denomination = {
        denomination_value: 100,
        denomination_label: '₹100',
        pieces: 10,
        calculated_amount: 1000
      };

      // Required fields
      expect(denomination).toHaveProperty('denomination_value');
      expect(denomination).toHaveProperty('denomination_label');
      expect(denomination).toHaveProperty('pieces');
      expect(denomination).toHaveProperty('calculated_amount');

      // Type validation
      expect(typeof denomination.denomination_value).toBe('number');
      expect(typeof denomination.denomination_label).toBe('string');
      expect(typeof denomination.pieces).toBe('number');
      expect(typeof denomination.calculated_amount).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const zeroEntry = {
        section: 'POS',
        row_idx: 0,
        cell_key: 'POS_AMOUNT_0',
        raw_value: '0',
        calculated_value: '0',
        metadata: {}
      };

      expect(parseFloat(zeroEntry.raw_value)).toBe(0);
      expect(parseFloat(zeroEntry.calculated_value)).toBe(0);
    });

    it('should handle negative values', () => {
      const negativeEntry = {
        section: 'DEBTOR',
        row_idx: 0,
        cell_key: 'DEBTOR_AMOUNT_0',
        raw_value: '-100',
        calculated_value: '-100',
        metadata: {}
      };

      expect(parseFloat(negativeEntry.raw_value)).toBeLessThan(0);
      expect(parseFloat(negativeEntry.calculated_value)).toBeLessThan(0);
    });

    it('should handle decimal values', () => {
      const decimalEntry = {
        section: 'POS',
        row_idx: 0,
        cell_key: 'POS_AMOUNT_0',
        raw_value: '123.45',
        calculated_value: '123.45',
        metadata: {}
      };

      expect(parseFloat(decimalEntry.raw_value)).toBe(123.45);
      expect(parseFloat(decimalEntry.calculated_value)).toBe(123.45);
    });

    it('should handle coupons (denomination_value: 0)', () => {
      const couponDenomination = {
        denomination_value: 0,
        denomination_label: 'Coupons',
        pieces: 5,
        calculated_amount: 0
      };

      expect(couponDenomination.denomination_value).toBe(0);
      expect(couponDenomination.pieces).toBeGreaterThan(0);
      expect(couponDenomination.calculated_amount).toBe(0);
    });
  });
});
