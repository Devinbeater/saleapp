/**
 * UI Module for Daily Sheet Manager
 * Handles DOM manipulation and UI updates
 */

class UIManager {
    constructor() {
        this.currentSheetId = null;
        this.currentDate = new Date().toISOString().split('T')[0];
        this.gridRows = 25; // Initial number of rows per section
        this.minSpareRows = 3; // Always keep at least 3 empty rows at the bottom
        this.denominations = [
            { value: 500, label: '₹500' },
            { value: 200, label: '₹200' },
            { value: 100, label: '₹100' },
            { value: 50, label: '₹50' },
            { value: 20, label: '₹20' },
            { value: 10, label: '₹10' },
            { value: 5, label: '₹5' },
            { value: 2, label: '₹2' },
            { value: 1, label: '₹1' },
            { value: 0, label: 'Coupons' }
        ];
        // Track data for each section
        this.sheetData = {
            POS: [],
            KQR: [],
            KSW: [],
            DEBTOR: []
        };
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Listen for cell value changes from formula engine
        document.addEventListener('cellValueChanged', (event) => {
            this.updateCellDisplay(event.detail.cellKey, event.detail.newValue);
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                this.toggleTheme();
            });
        }

        // Date input changes
        const sheetDateInput = document.getElementById('sheet-date');
        if (sheetDateInput) {
            sheetDateInput.addEventListener('change', (event) => {
                this.handleDateChange(event.target.value);
            });
        }

        // Load date functionality
        const loadDateBtn = document.getElementById('load-date-btn');
        if (loadDateBtn) {
            loadDateBtn.addEventListener('click', () => {
                this.loadPreviousDate();
            });
        }

        // Save button
        const saveBtn = document.getElementById('save-sheet');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSheet();
            });
        }

        // Export buttons
        const exportCsvBtn = document.getElementById('export-csv');
        const exportPdfBtn = document.getElementById('export-pdf');
        const generateReportBtn = document.getElementById('generate-report');

        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => {
                this.exportToCSV();
            });
        }

        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                this.exportToPDF();
            });
        }

        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }

        // Help modal
        const closeHelpBtn = document.getElementById('close-help');
        const helpModal = document.getElementById('help-modal');
        
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', () => {
                this.closeHelpModal();
            });
        }

        if (helpModal) {
            helpModal.addEventListener('click', (event) => {
                if (event.target === helpModal) {
                    this.closeHelpModal();
                }
            });
        }
    }

    /**
     * Initialize the UI with current date
     */
    async initialize() {
        // Set current date
        const sheetDateInput = document.getElementById('sheet-date');
        if (sheetDateInput) {
            sheetDateInput.value = this.currentDate;
        }

        // Generate grid
        this.generateGrid();

        // Generate denominations table
        this.generateDenominationsTable();

        // Load today's sheet
        await this.loadTodaySheet();
    }

    /**
     * Generate the main spreadsheet grid
     */
    generateGrid() {
        const gridBody = document.getElementById('grid-body');
        if (!gridBody) return;

        gridBody.innerHTML = '';

        const sections = ['POS', 'KQR', 'KSW', 'DEBTOR'];
        
        // Initialize sheet data with empty rows
        sections.forEach(section => {
            if (!this.sheetData[section] || this.sheetData[section].length === 0) {
                this.sheetData[section] = Array.from({ length: this.gridRows }, () => ({ value: '' }));
            }
        });
        
        // Render rows based on sheetData
        this.renderAllRows();

        // Add total rows
        this.addTotalRows(gridBody);
    }

    /**
     * Render all rows dynamically
     */
    renderAllRows() {
        const gridBody = document.getElementById('grid-body');
        if (!gridBody) return;

        // Clear existing data rows (keep total rows)
        const dataRows = gridBody.querySelectorAll('.grid-row:not(.total-row)');
        dataRows.forEach(row => row.remove());

        const sections = ['POS', 'KQR', 'KSW', 'DEBTOR'];
        const maxRows = Math.max(...sections.map(s => this.sheetData[s].length));
        
        for (let row = 0; row < maxRows; row++) {
            const tr = document.createElement('tr');
            tr.className = 'grid-row';
            tr.dataset.rowIndex = row;

            sections.forEach(section => {
                const td = document.createElement('td');
                td.className = 'grid-cell';
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'cell-input';
                input.dataset.cellKey = `${section}_AMOUNT_${row}`;
                input.dataset.section = section;
                input.dataset.rowIndex = row;
                input.placeholder = '0';
                input.value = this.sheetData[section][row]?.value || '';
                
                // Add event listeners
                input.addEventListener('input', (event) => {
                    this.handleCellInput(event);
                });
                
                input.addEventListener('blur', (event) => {
                    this.handleCellBlur(event);
                });
                
                input.addEventListener('keydown', (event) => {
                    this.handleCellKeydown(event);
                });

                input.addEventListener('focus', (event) => {
                    this.handleCellFocus(event);
                });

                td.appendChild(input);
                tr.appendChild(td);
            });

            gridBody.appendChild(tr);
        }
    }

    /**
     * Add total rows for each section
     */
    addTotalRows(gridBody) {
        const sections = ['POS', 'KQR', 'KSW', 'DEBTOR'];
        
        sections.forEach(section => {
            const tr = document.createElement('tr');
            tr.className = 'grid-row total-row';
            tr.dataset.section = section;

            sections.forEach((colSection, colIndex) => {
                const td = document.createElement('td');
                td.className = 'grid-cell total-cell';
                
                if (colSection === section) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.dataset.cellKey = `${section}_TOTAL`;
                    input.dataset.isTotal = 'true';
                    input.readOnly = true;
                    input.className = 'calculated';
                    input.placeholder = '0';
                    
                    td.appendChild(input);
                }
                
                tr.appendChild(td);
            });

            gridBody.appendChild(tr);
        });
    }

    /**
     * Generate denominations table
     */
    generateDenominationsTable() {
        const denominationsBody = document.getElementById('denominations-body');
        if (!denominationsBody) return;

        denominationsBody.innerHTML = '';

        this.denominations.forEach(denom => {
            const tr = document.createElement('tr');
            tr.dataset.denomination = denom.value;

            // Denomination label
            const labelTd = document.createElement('td');
            labelTd.textContent = denom.label;
            tr.appendChild(labelTd);

            // Pieces input
            const piecesTd = document.createElement('td');
            const piecesInput = document.createElement('input');
            piecesInput.type = 'number';
            piecesInput.min = '0';
            piecesInput.dataset.denomination = denom.value;
            piecesInput.dataset.field = 'pieces';
            piecesInput.addEventListener('input', (event) => {
                this.handleDenominationChange(event);
            });
            piecesTd.appendChild(piecesInput);
            tr.appendChild(piecesTd);

            // Amount display
            const amountTd = document.createElement('td');
            const amountInput = document.createElement('input');
            amountInput.type = 'text';
            amountInput.readOnly = true;
            amountInput.className = 'calculated';
            amountInput.dataset.denomination = denom.value;
            amountInput.dataset.field = 'amount';
            amountTd.appendChild(amountInput);
            tr.appendChild(amountTd);

            denominationsBody.appendChild(tr);
        });
    }

    /**
     * Handle cell input event (for auto-expansion)
     */
    handleCellInput(event) {
        const input = event.target;
        const section = input.dataset.section;
        const rowIndex = parseInt(input.dataset.rowIndex);
        const value = input.value;

        // Update sheet data
        if (!this.sheetData[section][rowIndex]) {
            this.sheetData[section][rowIndex] = { value: '' };
        }
        this.sheetData[section][rowIndex].value = value;

        // Check if we need to expand rows
        this.checkAndExpandRows(section);
    }

    /**
     * Check if we need to add more rows and expand if necessary
     */
    checkAndExpandRows(section) {
        const data = this.sheetData[section];
        
        // Count empty rows at the end
        let emptyRowsAtEnd = 0;
        for (let i = data.length - 1; i >= 0; i--) {
            if (!data[i].value || data[i].value.trim() === '') {
                emptyRowsAtEnd++;
            } else {
                break;
            }
        }

        // If we have fewer than minSpareRows empty rows, add more
        if (emptyRowsAtEnd < this.minSpareRows) {
            const rowsToAdd = this.minSpareRows - emptyRowsAtEnd;
            for (let i = 0; i < rowsToAdd; i++) {
                this.sheetData[section].push({ value: '' });
            }
            
            // Re-render the grid
            this.renderAllRows();
            
            // Restore total rows if they were removed
            const gridBody = document.getElementById('grid-body');
            if (gridBody && !gridBody.querySelector('.total-row')) {
                this.addTotalRows(gridBody);
            }
        }
    }

    /**
     * Handle cell blur event
     */
    handleCellBlur(event) {
        const input = event.target;
        const cellKey = input.dataset.cellKey;
        const rawValue = input.value.trim();

        if (rawValue) {
            // Update formula engine
            const calculatedValue = formulaEngine.updateCell(cellKey, rawValue);
            
            if (calculatedValue !== null) {
                input.value = calculatedValue;
                input.classList.add('calculated');
                
                if (rawValue.startsWith('=')) {
                    input.classList.add('formula-cell');
                }
            }
        }

        // Hide formula overlay
        this.hideFormulaOverlay();
    }

    /**
     * Handle cell keydown event
     */
    handleCellKeydown(event) {
        const input = event.target;
        const cellKey = input.dataset.cellKey;

        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                this.moveToNextRow(input);
                break;
            case 'Tab':
                event.preventDefault();
                this.moveToNextCell(input);
                break;
            case 'Escape':
                input.blur();
                break;
        }
    }

    /**
     * Handle cell focus event
     */
    handleCellFocus(event) {
        const input = event.target;
        const cellKey = input.dataset.cellKey;
        
        // Show raw value/formula when focused
        const formula = formulaEngine.getCellFormula(cellKey);
        if (formula) {
            input.value = formula;
            this.showFormulaOverlay(formula);
        }
    }

    /**
     * Move to next row in same column
     */
    moveToNextRow(input) {
        const currentRow = parseInt(input.dataset.rowIndex);
        const section = input.dataset.section;
        const nextRow = currentRow + 1;
        
        // Auto-expand if needed before moving
        this.checkAndExpandRows(section);
        
        const nextCell = document.querySelector(`input[data-section="${section}"][data-row-index="${nextRow}"]`);
        if (nextCell) {
            nextCell.focus();
        }
    }

    /**
     * Move to next cell
     */
    moveToNextCell(input) {
        const currentRow = parseInt(input.dataset.rowIndex);
        const currentSection = input.dataset.section;
        const sections = ['POS', 'KQR', 'KSW', 'DEBTOR'];
        const currentSectionIndex = sections.indexOf(currentSection);
        
        let nextSectionIndex = currentSectionIndex + 1;
        let nextRow = currentRow;
        
        if (nextSectionIndex >= sections.length) {
            nextSectionIndex = 0;
            nextRow++;
        }
        
        const nextSection = sections[nextSectionIndex];
        
        // Auto-expand if needed before moving
        this.checkAndExpandRows(nextSection);
        
        const nextCell = document.querySelector(`input[data-section="${nextSection}"][data-row-index="${nextRow}"]`);
        if (nextCell) {
            nextCell.focus();
        }
    }

    /**
     * Show formula overlay
     */
    showFormulaOverlay(formula) {
        const overlay = document.getElementById('formula-overlay');
        const formulaText = document.getElementById('formula-text');
        
        if (overlay && formulaText) {
            formulaText.textContent = formula;
            overlay.classList.add('show');
        }
    }

    /**
     * Hide formula overlay
     */
    hideFormulaOverlay() {
        const overlay = document.getElementById('formula-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    /**
     * Update cell display
     */
    updateCellDisplay(cellKey, newValue) {
        const input = document.querySelector(`input[data-cell-key="${cellKey}"]`);
        if (input && !input.matches(':focus')) {
            input.value = newValue || '0';
            input.classList.add('calculated');
        }

        // Update calculated fields in sidebar
        if (cellKey === 'TOTAL_SALE') {
            this.updateCalculatedField('total-sale', newValue);
        } else if (cellKey === 'NET_AMOUNT') {
            this.updateCalculatedField('net-amount', newValue);
        }
    }

    /**
     * Update calculated field display
     */
    updateCalculatedField(fieldId, value) {
        const element = document.getElementById(fieldId);
        if (element) {
            element.textContent = value || '0';
        }
    }

    /**
     * Handle denomination change
     */
    handleDenominationChange(event) {
        const input = event.target;
        const denomination = parseInt(input.dataset.denomination);
        const pieces = parseInt(input.value) || 0;
        
        // Calculate amount
        const amount = denomination * pieces;
        
        // Update amount display
        const amountInput = document.querySelector(`input[data-denomination="${denomination}"][data-field="amount"]`);
        if (amountInput) {
            amountInput.value = amount.toString();
        }
        
        // Update total cash
        this.updateTotalCash();
    }

    /**
     * Update total cash display
     */
    updateTotalCash() {
        let totalCash = 0;
        
        const amountInputs = document.querySelectorAll('input[data-field="amount"]');
        amountInputs.forEach(input => {
            const amount = parseFloat(input.value) || 0;
            totalCash += amount;
        });
        
        const totalCashElement = document.getElementById('total-cash');
        if (totalCashElement) {
            totalCashElement.textContent = totalCash.toString();
        }
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    /**
     * Load today's sheet
     */
    async loadTodaySheet() {
        try {
            const sheet = await apiClient.createOrGetSheet();
            this.currentSheetId = sheet.sheetId;
            this.currentDate = sheet.date;
            
            // Load existing data
            await this.loadSheetData();
            
            this.showStatus('Sheet loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading today\'s sheet:', error);
            this.showStatus('Error loading sheet', 'error');
        }
    }

    /**
     * Load sheet data
     */
    async loadSheetData() {
        if (!this.currentSheetId) return;

        try {
            // Load entries
            const entries = await apiClient.getEntries(this.currentSheetId);
            
            // Populate sheetData from entries
            this.populateSheetDataFromEntries(entries);
            
            // Load into formula engine
            formulaEngine.loadFromEntries(entries);

            // Load denominations
            const denominations = await apiClient.getDenominations(this.currentSheetId);
            this.loadDenominations(denominations);

        } catch (error) {
            console.error('Error loading sheet data:', error);
        }
    }

    /**
     * Populate sheet data from entries
     */
    populateSheetDataFromEntries(entries) {
        const sections = ['POS', 'KQR', 'KSW', 'DEBTOR'];
        
        // Reset sheet data
        sections.forEach(section => {
            this.sheetData[section] = [];
        });

        // Find max row index for each section
        const maxRowIndex = {};
        sections.forEach(section => {
            maxRowIndex[section] = 0;
        });

        entries.forEach(entry => {
            const section = entry.section;
            const rowIdx = entry.row_idx || 0;
            
            if (sections.includes(section)) {
                maxRowIndex[section] = Math.max(maxRowIndex[section], rowIdx);
            }
        });

        // Initialize arrays with proper size
        sections.forEach(section => {
            const size = Math.max(maxRowIndex[section] + 1, this.gridRows);
            this.sheetData[section] = Array.from({ length: size }, () => ({ value: '' }));
        });

        // Populate with actual data
        entries.forEach(entry => {
            const section = entry.section;
            const rowIdx = entry.row_idx || 0;
            
            if (sections.includes(section) && this.sheetData[section][rowIdx]) {
                this.sheetData[section][rowIdx].value = entry.raw_value || '';
            }
        });

        // Ensure minimum spare rows
        sections.forEach(section => {
            this.checkAndExpandRows(section);
        });

        // Re-render the grid
        this.renderAllRows();
    }

    /**
     * Load denominations data
     */
    loadDenominations(denominations) {
        denominations.forEach(denom => {
            const piecesInput = document.querySelector(`input[data-denomination="${denom.denomination_value}"][data-field="pieces"]`);
            if (piecesInput) {
                piecesInput.value = denom.pieces.toString();
            }
            
            const amountInput = document.querySelector(`input[data-denomination="${denom.denomination_value}"][data-field="amount"]`);
            if (amountInput) {
                amountInput.value = denom.calculated_amount.toString();
            }
        });
        
        this.updateTotalCash();
    }

    /**
     * Save sheet
     */
    async saveSheet() {
        if (!this.currentSheetId) return;

        try {
            // Collect entries data
            const entries = this.collectEntriesData();
            
            // Collect denominations data
            const denominations = this.collectDenominationsData();

            // Save to backend
            await Promise.all([
                apiClient.saveEntries(this.currentSheetId, entries),
                apiClient.saveDenominations(this.currentSheetId, denominations)
            ]);

            this.showStatus('Sheet saved successfully', 'success');
        } catch (error) {
            console.error('Error saving sheet:', error);
            this.showStatus('Error saving sheet', 'error');
        }
    }

    /**
     * Collect entries data
     */
    collectEntriesData() {
        const entries = [];
        const sections = ['POS', 'KQR', 'KSW', 'DEBTOR'];
        
        sections.forEach(section => {
            this.sheetData[section].forEach((row, rowIndex) => {
                const rawValue = row.value?.trim();
                
                if (rawValue) {
                    const cellKey = `${section}_AMOUNT_${rowIndex}`;
                    const calculatedValue = formulaEngine.getCalculatedValue(cellKey);
                    
                    entries.push({
                        section,
                        row_idx: rowIndex,
                        cell_key: cellKey,
                        raw_value: rawValue,
                        calculated_value: calculatedValue,
                        metadata: {}
                    });
                }
            });
        });
        
        return entries;
    }

    /**
     * Collect denominations data
     */
    collectDenominationsData() {
        const denominations = [];
        
        this.denominations.forEach(denom => {
            const piecesInput = document.querySelector(`input[data-denomination="${denom.value}"][data-field="pieces"]`);
            const amountInput = document.querySelector(`input[data-denomination="${denom.value}"][data-field="amount"]`);
            
            if (piecesInput) {
                const pieces = parseInt(piecesInput.value) || 0;
                const amount = parseFloat(amountInput?.value) || 0;
                
                denominations.push({
                    denomination_value: denom.value,
                    denomination_label: denom.label,
                    pieces,
                    calculated_amount: amount
                });
            }
        });
        
        return denominations;
    }

    /**
     * Show status message
     */
    showStatus(message, type = 'success') {
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
            statusBar.textContent = message;
            statusBar.className = `status-bar ${type}`;
            
            setTimeout(() => {
                statusBar.className = 'status-bar';
                statusBar.innerHTML = '<i class="fas fa-check-circle"></i><span>All changes saved</span>';
            }, 3000);
        }
    }

    /**
     * Export methods (to be implemented in exportUtils.js)
     */
    exportToCSV() {
        if (window.exportUtils) {
            window.exportUtils.exportToCSV();
        }
    }

    exportToPDF() {
        if (window.exportUtils) {
            window.exportUtils.exportToPDF();
        }
    }

    generateReport() {
        if (window.exportUtils) {
            window.exportUtils.generateReport();
        }
    }

    /**
     * Help modal methods
     */
    openHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Load previous date
     */
    async loadPreviousDate() {
        const loadDateInput = document.getElementById('load-date');
        if (!loadDateInput || !loadDateInput.value) {
            this.showStatus('Please select a date to load', 'warning');
            return;
        }

        const selectedDate = loadDateInput.value;
        
        try {
            const sheet = await apiClient.getSheet(selectedDate);
            this.currentSheetId = sheet.sheetId;
            this.currentDate = sheet.date;
            
            // Update date display
            const sheetDateInput = document.getElementById('sheet-date');
            if (sheetDateInput) {
                sheetDateInput.value = this.currentDate;
            }
            
            // Load data
            await this.loadSheetData();
            
            this.showStatus(`Loaded sheet for ${selectedDate}`, 'success');
        } catch (error) {
            console.error('Error loading previous date:', error);
            this.showStatus('Error loading sheet for selected date', 'error');
        }
    }

    /**
     * Handle date change
     */
    handleDateChange(newDate) {
        this.currentDate = newDate;
    }

    /**
     * Clear current data and reset grid
     */
    clearCurrentData() {
        const sections = ['POS', 'KQR', 'KSW', 'DEBTOR'];
        sections.forEach(section => {
            this.sheetData[section] = Array.from({ length: this.gridRows }, () => ({ value: '' }));
        });
        this.renderAllRows();
    }
}

// Create and export a singleton instance
const uiManager = new UIManager();
window.uiManager = uiManager;
