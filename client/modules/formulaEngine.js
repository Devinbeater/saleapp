/**
 * HyperFormula Integration Module
 * Handles spreadsheet calculations and formula processing
 */

class FormulaEngine {
    constructor() {
        this.hf = null;
        this.cellMapping = new Map(); // Maps UI cell_key to HyperFormula coordinates
        this.coordinateCounter = 0;
        this.sheetId = 'Sheet1';
        this.calculatedFields = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize HyperFormula instance
     */
    initialize() {
        try {
            // Check if HyperFormula is available
            if (typeof HyperFormula === 'undefined') {
                console.error('HyperFormula library not loaded');
                return false;
            }

            // Initialize HyperFormula with proper configuration
            this.hf = HyperFormula.buildEmpty({
                licenseKey: 'gpl-v3',
                useArrayArithmetic: true,
                useColumnIndex: true,
                useSheetNameIndex: true,
                precisionEpsilon: 1e-13,
                maxColumns: 1000,
                maxRows: 1000
            });

            // Add the main sheet
            this.hf.addSheet(this.sheetId);

            this.isInitialized = true;
            console.log('HyperFormula initialized successfully');
            
            // Set up event listeners
            this.setupEventListeners();
            
            return true;
        } catch (error) {
            console.error('Failed to initialize HyperFormula:', error);
            return false;
        }
    }

    /**
     * Set up HyperFormula event listeners
     */
    setupEventListeners() {
        if (!this.hf) return;

        // Listen for recalculation events
        this.hf.on('sheetValuesChanged', (changes) => {
            this.handleSheetValuesChanged(changes);
        });

        this.hf.on('sheetSizeChanged', (changes) => {
            console.log('Sheet size changed:', changes);
        });
    }

    /**
     * Map UI cell key to HyperFormula coordinate
     */
    mapCellKeyToCoordinate(cellKey) {
        if (this.cellMapping.has(cellKey)) {
            return this.cellMapping.get(cellKey);
        }

        // Generate new coordinate
        const row = Math.floor(this.coordinateCounter / 4); // 4 columns
        const col = this.coordinateCounter % 4;
        const coordinate = { row, col };
        
        this.cellMapping.set(cellKey, coordinate);
        this.coordinateCounter++;
        
        return coordinate;
    }

    /**
     * Update a cell with a value or formula
     */
    updateCell(cellKey, rawValue) {
        if (!this.hf || !this.isInitialized) {
            console.warn('HyperFormula not initialized');
            return null;
        }

        try {
            const coordinate = this.mapCellKeyToCoordinate(cellKey);
            const { row, col } = coordinate;

            let valueToSet;
            
            if (rawValue && rawValue.toString().startsWith('=')) {
                // It's a formula
                valueToSet = rawValue;
                this.hf.setCellContents({ sheet: this.sheetId, row, col }, [[valueToSet]]);
            } else {
                // It's a literal value
                const numericValue = parseFloat(rawValue) || 0;
                valueToSet = numericValue;
                this.hf.setCellContents({ sheet: this.sheetId, row, col }, [[valueToSet]]);
            }

            // Store the calculated field mapping for special cells
            if (cellKey === 'TOTAL_SALE' || cellKey === 'NET_AMOUNT') {
                this.calculatedFields.set(cellKey, { coordinate, rawValue });
            }

            return this.getCalculatedValue(cellKey);
        } catch (error) {
            console.error(`Error updating cell ${cellKey}:`, error);
            return null;
        }
    }

    /**
     * Get calculated value for a cell
     */
    getCalculatedValue(cellKey) {
        if (!this.hf || !this.isInitialized) {
            return null;
        }

        try {
            const coordinate = this.mapCellKeyToCoordinate(cellKey);
            const { row, col } = coordinate;

            const cellValue = this.hf.getCellValue({ sheet: this.sheetId, row, col });
            
            if (cellValue === undefined || cellValue === null) {
                return null;
            }

            // Convert to string for display
            return cellValue.toString();
        } catch (error) {
            console.error(`Error getting calculated value for ${cellKey}:`, error);
            return null;
        }
    }

    /**
     * Get raw formula for a cell
     */
    getCellFormula(cellKey) {
        if (!this.hf || !this.isInitialized) {
            return null;
        }

        try {
            const coordinate = this.mapCellKeyToCoordinate(cellKey);
            const { row, col } = coordinate;

            const formula = this.hf.getCellFormula({ sheet: this.sheetId, row, col });
            return formula;
        } catch (error) {
            console.error(`Error getting formula for ${cellKey}:`, error);
            return null;
        }
    }

    /**
     * Handle sheet values changed event
     */
    handleSheetValuesChanged(changes) {
        console.log('Sheet values changed:', changes);
        
        // Update UI with new calculated values
        for (const [cellKey, coordinate] of this.cellMapping) {
            const newValue = this.getCalculatedValue(cellKey);
            if (newValue !== null) {
                this.notifyCellValueChanged(cellKey, newValue);
            }
        }
    }

    /**
     * Notify that a cell value has changed (for UI updates)
     */
    notifyCellValueChanged(cellKey, newValue) {
        // Dispatch custom event for UI to listen to
        const event = new CustomEvent('cellValueChanged', {
            detail: { cellKey, newValue }
        });
        document.dispatchEvent(event);
    }

    /**
     * Set up calculated fields with default formulas
     */
    setupCalculatedFields() {
        // Set up TOTAL_SALE formula
        const totalSaleFormula = '=SUM(POS_AMOUNT_0:POS_AMOUNT_24) + SUM(KQR_AMOUNT_0:KQR_AMOUNT_24) + SUM(KSW_AMOUNT_0:KSW_AMOUNT_24)';
        this.updateCell('TOTAL_SALE', totalSaleFormula);

        // Set up NET_AMOUNT formula (can be customized)
        const netAmountFormula = '=TOTAL_SALE - SUM(DEBTOR_AMOUNT_0:DEBTOR_AMOUNT_24)';
        this.updateCell('NET_AMOUNT', netAmountFormula);
    }

    /**
     * Insert SUM formula for current column
     */
    insertSumFormula(cellKey, columnPrefix) {
        const startKey = `${columnPrefix}_AMOUNT_0`;
        const endKey = `${columnPrefix}_AMOUNT_24`;
        const sumFormula = `=SUM(${startKey}:${endKey})`;
        
        return this.updateCell(cellKey, sumFormula);
    }

    /**
     * Manually trigger recalculation
     */
    recalculate() {
        if (!this.hf || !this.isInitialized) {
            return false;
        }

        try {
            this.hf.rebuild();
            return true;
        } catch (error) {
            console.error('Error during recalculation:', error);
            return false;
        }
    }

    /**
     * Get all cell data for export
     */
    getAllCellData() {
        const cellData = {};
        
        for (const [cellKey, coordinate] of this.cellMapping) {
            const rawValue = this.getCellFormula(cellKey);
            const calculatedValue = this.getCalculatedValue(cellKey);
            
            cellData[cellKey] = {
                rawValue,
                calculatedValue,
                coordinate
            };
        }
        
        return cellData;
    }

    /**
     * Clear all data
     */
    clear() {
        if (this.hf && this.isInitialized) {
            this.hf.clearSheet(this.sheetId);
        }
        this.cellMapping.clear();
        this.calculatedFields.clear();
        this.coordinateCounter = 0;
    }

    /**
     * Load data from entries
     */
    loadFromEntries(entries) {
        if (!entries || !Array.isArray(entries)) {
            return;
        }

        entries.forEach(entry => {
            const { cell_key, raw_value } = entry;
            this.updateCell(cell_key, raw_value);
        });

        // Set up calculated fields after loading data
        this.setupCalculatedFields();
    }
}

// Create and export a singleton instance
const formulaEngine = new FormulaEngine();
window.formulaEngine = formulaEngine;
