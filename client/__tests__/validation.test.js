/**
 * Frontend Tests for Validation Manager
 * Tests input validation and data integrity
 */

const { ValidationManager } = require('../modules/validation');

describe('ValidationManager', () => {
  let validationManager;

  beforeEach(() => {
    validationManager = new ValidationManager();
  });

  describe('Basic Input Validation', () => {
    it('should validate amount input correctly', () => {
      const validAmounts = ['100', '123.45', '-50', '0', '999999.99'];
      const invalidAmounts = ['abc', '12.345', '1,000', ''];

      validAmounts.forEach(amount => {
        const result = validationManager.validateInput(amount, 'amount');
        expect(result.isValid).toBe(true);
      });

      invalidAmounts.forEach(amount => {
        const result = validationManager.validateInput(amount, 'amount');
        expect(result.isValid).toBe(false);
      });
    });

    it('should validate pieces input correctly', () => {
      const validPieces = ['0', '1', '100', '999999'];
      const invalidPieces = ['-1', '1.5', 'abc', ''];

      validPieces.forEach(pieces => {
        const result = validationManager.validateInput(pieces, 'pieces');
        expect(result.isValid).toBe(true);
      });

      invalidPieces.forEach(pieces => {
        const result = validationManager.validateInput(pieces, 'pieces');
        expect(result.isValid).toBe(false);
      });
    });

    it('should validate formula input correctly', () => {
      const validFormulas = ['=SUM(A1:A10)', '=A1+B1', '=100*0.05'];
      const invalidFormulas = ['SUM(A1:A10)', 'A1+B1', ''];

      validFormulas.forEach(formula => {
        const result = validationManager.validateInput(formula, 'formula');
        expect(result.isValid).toBe(true);
      });

      invalidFormulas.forEach(formula => {
        const result = validationManager.validateInput(formula, 'formula');
        expect(result.isValid).toBe(false);
      });
    });

    it('should allow empty values', () => {
      const result = validationManager.validateInput('', 'amount');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Cell Input Validation', () => {
    it('should validate literal numeric values', () => {
      const validValues = ['100', '123.45', '0', '-50'];
      const invalidValues = ['abc', '12.345', '1,000'];

      validValues.forEach(value => {
        const result = validationManager.validateCellInput(value, 'POS_AMOUNT_0');
        expect(result.isValid).toBe(true);
      });

      invalidValues.forEach(value => {
        const result = validationManager.validateCellInput(value, 'POS_AMOUNT_0');
        expect(result.isValid).toBe(false);
      });
    });

    it('should validate formula inputs', () => {
      const validFormulas = [
        '=SUM(POS_AMOUNT_0:POS_AMOUNT_24)',
        '=POS_AMOUNT_0 + KQR_AMOUNT_0',
        '=TOTAL_SALE * 0.05'
      ];
      const invalidFormulas = [
        '=INVALID_FUNC(POS_AMOUNT_0)',
        '=SUM(POS_AMOUNT_0:POS_AMOUNT_999)',
        '=(POS_AMOUNT_0 + KQR_AMOUNT_0',
        '=POS_AMOUNT_INVALID'
      ];

      validFormulas.forEach(formula => {
        const result = validationManager.validateCellInput(formula, 'POS_AMOUNT_0');
        expect(result.isValid).toBe(true);
      });

      invalidFormulas.forEach(formula => {
        const result = validationManager.validateCellInput(formula, 'POS_AMOUNT_0');
        expect(result.isValid).toBe(false);
      });
    });

    it('should handle empty cell input', () => {
      const result = validationManager.validateCellInput('', 'POS_AMOUNT_0');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Formula Validation', () => {
    it('should validate balanced parentheses', () => {
      const balancedFormulas = [
        '=SUM(A1:A10)',
        '=IF(A1>0, A1*2, 0)',
        '=((A1+B1)*C1)'
      ];
      const unbalancedFormulas = [
        '=SUM(A1:A10',
        '=IF(A1>0, A1*2, 0',
        '=((A1+B1)*C1'
      ];

      balancedFormulas.forEach(formula => {
        const result = validationManager.validateFormula(formula, 'POS_AMOUNT_0');
        expect(result.isValid).toBe(true);
      });

      unbalancedFormulas.forEach(formula => {
        const result = validationManager.validateFormula(formula, 'POS_AMOUNT_0');
        expect(result.isValid).toBe(false);
      });
    });

    it('should validate function names', () => {
      const validFunctions = ['=SUM(A1:A10)', '=AVERAGE(B1:B10)', '=COUNT(C1:C10)'];
      const invalidFunctions = ['=INVALID_FUNC(A1:A10)', '=UNKNOWN(A1:A10)'];

      validFunctions.forEach(formula => {
        const result = validationManager.validateFormula(formula, 'POS_AMOUNT_0');
        expect(result.isValid).toBe(true);
      });

      invalidFunctions.forEach(formula => {
        const result = validationManager.validateFormula(formula, 'POS_AMOUNT_0');
        expect(result.isValid).toBe(false);
      });
    });

    it('should validate cell references', () => {
      const validReferences = [
        '=POS_AMOUNT_0',
        '=SUM(POS_AMOUNT_0:POS_AMOUNT_24)',
        '=KQR_AMOUNT_5 + KSW_AMOUNT_10'
      ];
      const invalidReferences = [
        '=INVALID_AMOUNT_0',
        '=POS_AMOUNT_999',
        '=UNKNOWN_SECTION_0'
      ];

      validReferences.forEach(formula => {
        const result = validationManager.validateFormula(formula, 'POS_AMOUNT_0');
        expect(result.isValid).toBe(true);
      });

      invalidReferences.forEach(formula => {
        const result = validationManager.validateFormula(formula, 'POS_AMOUNT_0');
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Denomination Validation', () => {
    it('should validate denomination input correctly', () => {
      const validInputs = [
        { value: '0', denomination: 100 },
        { value: '1', denomination: 500 },
        { value: '100', denomination: 50 },
        { value: '999999', denomination: 10 }
      ];
      const invalidInputs = [
        { value: '-1', denomination: 100 },
        { value: '1.5', denomination: 500 },
        { value: 'abc', denomination: 50 },
        { value: '1000000', denomination: 10 }
      ];

      validInputs.forEach(input => {
        const result = validationManager.validateDenominationInput(input.value, input.denomination);
        expect(result.isValid).toBe(true);
      });

      invalidInputs.forEach(input => {
        const result = validationManager.validateDenominationInput(input.value, input.denomination);
        expect(result.isValid).toBe(false);
      });
    });

    it('should allow empty denomination input', () => {
      const result = validationManager.validateDenominationInput('', 100);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Sheet Data Validation', () => {
    it('should validate complete sheet data', () => {
      const validEntries = [
        {
          section: 'POS',
          row_idx: 0,
          cell_key: 'POS_AMOUNT_0',
          raw_value: '100',
          calculated_value: '100',
          metadata: {}
        }
      ];

      const validDenominations = [
        {
          denomination_value: 100,
          denomination_label: '₹100',
          pieces: 10,
          calculated_amount: 1000
        }
      ];

      const result = validationManager.validateSheetData(validEntries, validDenominations);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid entries', () => {
      const invalidEntries = [
        {
          section: 'INVALID',
          row_idx: -1,
          cell_key: 'INVALID_KEY',
          raw_value: 'invalid',
          calculated_value: 'invalid',
          metadata: null
        }
      ];

      const result = validationManager.validateSheetData(invalidEntries, []);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid denominations', () => {
      const invalidDenominations = [
        {
          denomination_value: 'invalid',
          denomination_label: '₹100',
          pieces: -1,
          calculated_amount: -100
        }
      ];

      const result = validationManager.validateSheetData([], invalidDenominations);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Cell Reference Validation', () => {
    it('should validate cell references correctly', () => {
      const validReferences = [
        'POS_AMOUNT_0',
        'KQR_AMOUNT_24',
        'KSW_AMOUNT_12',
        'DEBTOR_AMOUNT_5'
      ];
      const invalidReferences = [
        'INVALID_AMOUNT_0',
        'POS_AMOUNT_999',
        'UNKNOWN_SECTION_0',
        'POS_AMOUNT_INVALID'
      ];

      validReferences.forEach(ref => {
        expect(validationManager.isValidCellReference(ref)).toBe(true);
      });

      invalidReferences.forEach(ref => {
        expect(validationManager.isValidCellReference(ref)).toBe(false);
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize input values', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'onclick="alert(\'xss\')"',
        '  spaced input  '
      ];
      const expectedOutputs = [
        '',
        '',
        '',
        'spaced input'
      ];

      maliciousInputs.forEach((input, index) => {
        const result = validationManager.sanitizeInput(input);
        expect(result).toBe(expectedOutputs[index]);
      });
    });

    it('should handle non-string inputs', () => {
      const nonStringInputs = [123, true, null, undefined, {}];

      nonStringInputs.forEach(input => {
        const result = validationManager.sanitizeInput(input);
        expect(result).toBe(input);
      });
    });
  });

  describe('Number Formatting', () => {
    it('should format numbers correctly', () => {
      const testCases = [
        { input: 123.456, decimals: 2, expected: '123.46' },
        { input: 100, decimals: 2, expected: '100.00' },
        { input: 0, decimals: 2, expected: '0.00' },
        { input: 'invalid', decimals: 2, expected: '0' }
      ];

      testCases.forEach(testCase => {
        const result = validationManager.formatNumber(testCase.input, testCase.decimals);
        expect(result).toBe(testCase.expected);
      });
    });
  });

  describe('Date Validation', () => {
    it('should validate dates correctly', () => {
      const validDates = [
        '2024-01-01',
        '2024-12-31',
        new Date().toISOString().split('T')[0]
      ];
      const invalidDates = [
        'invalid-date',
        '2024-13-01',
        '2024-01-32',
        '01/01/2024'
      ];

      validDates.forEach(date => {
        const result = validationManager.validateDate(date);
        expect(result.isValid).toBe(true);
      });

      invalidDates.forEach(date => {
        const result = validationManager.validateDate(date);
        expect(result.isValid).toBe(false);
      });
    });

    it('should reject dates too far in future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 35); // 35 days in future
      
      const result = validationManager.validateDate(futureDate.toISOString().split('T')[0]);
      expect(result.isValid).toBe(false);
    });

    it('should reject dates too far in past', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 2); // 2 years in past
      
      const result = validationManager.validateDate(pastDate.toISOString().split('T')[0]);
      expect(result.isValid).toBe(false);
    });
  });
});
