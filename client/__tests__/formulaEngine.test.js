/**
 * Frontend Tests for Formula Engine
 * Tests HyperFormula integration and calculations
 */

// Mock HyperFormula
global.HyperFormula = {
  buildEmpty: jest.fn(() => ({
    addSheet: jest.fn(),
    setCellContents: jest.fn(),
    getCellValue: jest.fn(),
    getCellFormula: jest.fn(),
    on: jest.fn(),
    rebuild: jest.fn(),
    clearSheet: jest.fn()
  }))
};

// Mock DOM
const mockDocument = {
  addEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn()
};

global.document = mockDocument;

// Import the module after mocking
const { FormulaEngine } = require('../modules/formulaEngine');

describe('FormulaEngine', () => {
  let formulaEngine;
  let mockHyperFormula;

  beforeEach(() => {
    jest.clearAllMocks();
    formulaEngine = new FormulaEngine();
    mockHyperFormula = {
      addSheet: jest.fn(),
      setCellContents: jest.fn(),
      getCellValue: jest.fn(),
      getCellFormula: jest.fn(),
      on: jest.fn(),
      rebuild: jest.fn(),
      clearSheet: jest.fn()
    };
    
    HyperFormula.buildEmpty.mockReturnValue(mockHyperFormula);
  });

  describe('Initialization', () => {
    it('should initialize HyperFormula correctly', () => {
      const result = formulaEngine.initialize();
      
      expect(HyperFormula.buildEmpty).toHaveBeenCalledWith({
        licenseKey: 'gpl-v3',
        useArrayArithmetic: true,
        useColumnIndex: true
      });
      
      expect(mockHyperFormula.addSheet).toHaveBeenCalledWith('Sheet1');
      expect(mockHyperFormula.on).toHaveBeenCalledWith('sheetValuesChanged', expect.any(Function));
      expect(mockHyperFormula.on).toHaveBeenCalledWith('sheetSizeChanged', expect.any(Function));
      expect(result).toBe(true);
      expect(formulaEngine.isInitialized).toBe(true);
    });

    it('should handle initialization failure', () => {
      HyperFormula.buildEmpty.mockImplementation(() => {
        throw new Error('HyperFormula initialization failed');
      });

      const result = formulaEngine.initialize();
      
      expect(result).toBe(false);
      expect(formulaEngine.isInitialized).toBe(false);
    });
  });

  describe('Cell Mapping', () => {
    beforeEach(() => {
      formulaEngine.initialize();
    });

    it('should map cell keys to coordinates correctly', () => {
      const coordinate1 = formulaEngine.mapCellKeyToCoordinate('POS_AMOUNT_0');
      const coordinate2 = formulaEngine.mapCellKeyToCoordinate('KQR_AMOUNT_1');

      expect(coordinate1).toEqual({ row: 0, col: 0 });
      expect(coordinate2).toEqual({ row: 0, col: 1 });
      expect(formulaEngine.cellMapping.has('POS_AMOUNT_0')).toBe(true);
      expect(formulaEngine.cellMapping.has('KQR_AMOUNT_1')).toBe(true);
    });

    it('should reuse existing coordinates for same cell key', () => {
      const coordinate1 = formulaEngine.mapCellKeyToCoordinate('POS_AMOUNT_0');
      const coordinate2 = formulaEngine.mapCellKeyToCoordinate('POS_AMOUNT_0');

      expect(coordinate1).toEqual(coordinate2);
      expect(formulaEngine.cellMapping.size).toBe(1);
    });
  });

  describe('Cell Updates', () => {
    beforeEach(() => {
      formulaEngine.initialize();
    });

    it('should update cell with literal value', () => {
      mockHyperFormula.getCellValue.mockReturnValue(100);
      
      const result = formulaEngine.updateCell('POS_AMOUNT_0', '100');
      
      expect(mockHyperFormula.setCellContents).toHaveBeenCalledWith(
        { sheet: 'Sheet1', row: 0, col: 0 },
        [[100]]
      );
      expect(result).toBe('100');
    });

    it('should update cell with formula', () => {
      mockHyperFormula.getCellValue.mockReturnValue(200);
      
      const result = formulaEngine.updateCell('KQR_AMOUNT_1', '=POS_AMOUNT_0*2');
      
      expect(mockHyperFormula.setCellContents).toHaveBeenCalledWith(
        { sheet: 'Sheet1', row: 0, col: 1 },
        [['=POS_AMOUNT_0*2']]
      );
      expect(result).toBe('200');
    });

    it('should handle invalid values gracefully', () => {
      const result = formulaEngine.updateCell('POS_AMOUNT_0', 'invalid');
      
      expect(mockHyperFormula.setCellContents).toHaveBeenCalledWith(
        { sheet: 'Sheet1', row: 0, col: 0 },
        [[0]]
      );
      expect(result).toBe('0');
    });

    it('should return null when not initialized', () => {
      formulaEngine.isInitialized = false;
      
      const result = formulaEngine.updateCell('POS_AMOUNT_0', '100');
      
      expect(result).toBeNull();
      expect(mockHyperFormula.setCellContents).not.toHaveBeenCalled();
    });
  });

  describe('Calculated Values', () => {
    beforeEach(() => {
      formulaEngine.initialize();
    });

    it('should get calculated value for cell', () => {
      mockHyperFormula.getCellValue.mockReturnValue(150);
      
      const result = formulaEngine.getCalculatedValue('POS_AMOUNT_0');
      
      expect(mockHyperFormula.getCellValue).toHaveBeenCalledWith(
        { sheet: 'Sheet1', row: 0, col: 0 }
      );
      expect(result).toBe('150');
    });

    it('should return null for undefined values', () => {
      mockHyperFormula.getCellValue.mockReturnValue(undefined);
      
      const result = formulaEngine.getCalculatedValue('POS_AMOUNT_0');
      
      expect(result).toBeNull();
    });

    it('should return null when not initialized', () => {
      formulaEngine.isInitialized = false;
      
      const result = formulaEngine.getCalculatedValue('POS_AMOUNT_0');
      
      expect(result).toBeNull();
      expect(mockHyperFormula.getCellValue).not.toHaveBeenCalled();
    });
  });

  describe('Formula Retrieval', () => {
    beforeEach(() => {
      formulaEngine.initialize();
    });

    it('should get cell formula', () => {
      mockHyperFormula.getCellFormula.mockReturnValue('=SUM(POS_AMOUNT_0:POS_AMOUNT_24)');
      
      const result = formulaEngine.getCellFormula('TOTAL_SALE');
      
      expect(mockHyperFormula.getCellFormula).toHaveBeenCalledWith(
        { sheet: 'Sheet1', row: 0, col: 0 }
      );
      expect(result).toBe('=SUM(POS_AMOUNT_0:POS_AMOUNT_24)');
    });

    it('should return null when not initialized', () => {
      formulaEngine.isInitialized = false;
      
      const result = formulaEngine.getCellFormula('TOTAL_SALE');
      
      expect(result).toBeNull();
      expect(mockHyperFormula.getCellFormula).not.toHaveBeenCalled();
    });
  });

  describe('Calculated Fields', () => {
    beforeEach(() => {
      formulaEngine.initialize();
    });

    it('should set up calculated fields', () => {
      formulaEngine.setupCalculatedFields();
      
      expect(mockHyperFormula.setCellContents).toHaveBeenCalledWith(
        { sheet: 'Sheet1', row: 0, col: 0 },
        [['=SUM(POS_AMOUNT_0:POS_AMOUNT_24) + SUM(KQR_AMOUNT_0:KQR_AMOUNT_24) + SUM(KSW_AMOUNT_0:KSW_AMOUNT_24)']]
      );
      expect(mockHyperFormula.setCellContents).toHaveBeenCalledWith(
        { sheet: 'Sheet1', row: 0, col: 0 },
        [['=TOTAL_SALE - SUM(DEBTOR_AMOUNT_0:DEBTOR_AMOUNT_24)']]
      );
    });

    it('should insert SUM formula for column', () => {
      mockHyperFormula.getCellValue.mockReturnValue(500);
      
      const result = formulaEngine.insertSumFormula('POS_TOTAL', 'POS');
      
      expect(mockHyperFormula.setCellContents).toHaveBeenCalledWith(
        { sheet: 'Sheet1', row: 0, col: 0 },
        [['=SUM(POS_AMOUNT_0:POS_AMOUNT_24)']]
      );
      expect(result).toBe('500');
    });
  });

  describe('Recalculation', () => {
    beforeEach(() => {
      formulaEngine.initialize();
    });

    it('should trigger recalculation', () => {
      mockHyperFormula.rebuild.mockReturnValue(true);
      
      const result = formulaEngine.recalculate();
      
      expect(mockHyperFormula.rebuild).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle recalculation errors', () => {
      mockHyperFormula.rebuild.mockImplementation(() => {
        throw new Error('Recalculation failed');
      });
      
      const result = formulaEngine.recalculate();
      
      expect(result).toBe(false);
    });

    it('should return false when not initialized', () => {
      formulaEngine.isInitialized = false;
      
      const result = formulaEngine.recalculate();
      
      expect(result).toBe(false);
      expect(mockHyperFormula.rebuild).not.toHaveBeenCalled();
    });
  });

  describe('Data Management', () => {
    beforeEach(() => {
      formulaEngine.initialize();
    });

    it('should get all cell data for export', () => {
      formulaEngine.cellMapping.set('POS_AMOUNT_0', { row: 0, col: 0 });
      mockHyperFormula.getCellFormula.mockReturnValue('100');
      mockHyperFormula.getCellValue.mockReturnValue(100);
      
      const result = formulaEngine.getAllCellData();
      
      expect(result).toHaveProperty('POS_AMOUNT_0');
      expect(result.POS_AMOUNT_0).toEqual({
        rawValue: '100',
        calculatedValue: '100',
        coordinate: { row: 0, col: 0 }
      });
    });

    it('should clear all data', () => {
      formulaEngine.cellMapping.set('POS_AMOUNT_0', { row: 0, col: 0 });
      formulaEngine.calculatedFields.set('TOTAL_SALE', { coordinate: { row: 0, col: 0 } });
      
      formulaEngine.clear();
      
      expect(mockHyperFormula.clearSheet).toHaveBeenCalledWith('Sheet1');
      expect(formulaEngine.cellMapping.size).toBe(0);
      expect(formulaEngine.calculatedFields.size).toBe(0);
      expect(formulaEngine.coordinateCounter).toBe(0);
    });

    it('should load data from entries', () => {
      const entries = [
        { cell_key: 'POS_AMOUNT_0', raw_value: '100' },
        { cell_key: 'KQR_AMOUNT_1', raw_value: '=POS_AMOUNT_0*2' }
      ];
      
      formulaEngine.loadFromEntries(entries);
      
      expect(mockHyperFormula.setCellContents).toHaveBeenCalledWith(
        { sheet: 'Sheet1', row: 0, col: 0 },
        [[100]]
      );
      expect(mockHyperFormula.setCellContents).toHaveBeenCalledWith(
        { sheet: 'Sheet1', row: 0, col: 1 },
        [['=POS_AMOUNT_0*2']]
      );
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      formulaEngine.initialize();
    });

    it('should notify cell value changes', () => {
      const mockEvent = new Event('cellValueChanged');
      mockDocument.dispatchEvent = jest.fn();
      
      formulaEngine.notifyCellValueChanged('POS_AMOUNT_0', '150');
      
      expect(mockDocument.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cellValueChanged',
          detail: {
            cellKey: 'POS_AMOUNT_0',
            newValue: '150'
          }
        })
      );
    });
  });
});
