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
        // Track entry types for POS entries
        this.entryTypes = {};
        // Track current POS input being edited
        this.currentPOSInput = null;
        // Opening cash and other values
        this.openingCash = 0;
        this.bharatpe = 0;
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

        // POS Entry Modal
        const closePOSModalBtn = document.getElementById('close-pos-modal');
        const cancelPOSBtn = document.getElementById('cancel-pos-entry');
        const confirmPOSBtn = document.getElementById('confirm-pos-entry');
        const posModal = document.getElementById('pos-entry-modal');

        if (closePOSModalBtn) {
            closePOSModalBtn.addEventListener('click', () => {
                this.closePOSModal();
            });
        }

        if (cancelPOSBtn) {
            cancelPOSBtn.addEventListener('click', () => {
                this.closePOSModal();
            });
        }

        if (confirmPOSBtn) {
            confirmPOSBtn.addEventListener('click', () => {
                this.confirmPOSEntry();
            });
        }

        if (posModal) {
            posModal.addEventListener('click', (event) => {
                if (event.target === posModal) {
                    this.closePOSModal();
                }
            });
        }

        // Opening Cash and BharatPE inputs
        const openingCashInput = document.getElementById('opening-cash');
        const bharatpeInput = document.getElementById('bharatpe');

        if (openingCashInput) {
            openingCashInput.addEventListener('input', () => {
                this.openingCash = parseFloat(openingCashInput.value) || 0;
                this.updateCalculations();
            });
        }

        if (bharatpeInput) {
            bharatpeInput.addEventListener('input', () => {
                this.bharatpe = parseFloat(bharatpeInput.value) || 0;
                this.updateCalculations();
                
                // Update modal handlers if available
                if (typeof modalHandlers !== 'undefined') {
                    modalHandlers.updateExpensesSummary();
                }
            });
        }

        // Window control buttons
        const minimizeBtn = document.getElementById('minimize-btn');
        const maximizeBtn = document.getElementById('maximize-btn');
        const closeBtn = document.getElementById('close-btn');

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                this.minimizeWindow();
            });
        }

        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
                this.toggleMaximize();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeWindow();
            });
        }
    }

    /**
     * Initialize the UI with current date
     */
    async initialize() {
        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            const themeToggle = document.getElementById('theme-toggle');
            const themeLabel = document.getElementById('theme-label');
            if (themeToggle) themeToggle.checked = true;
            if (themeLabel) themeLabel.textContent = 'Dark Mode';
        }
        
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

        // Clear existing data rows
        gridBody.innerHTML = '';

        // Calculate max rows needed (50 rows to cover all 4 POS sections)
        const maxRows = 50;
        
        for (let row = 0; row < maxRows; row++) {
            const tr = document.createElement('tr');
            tr.className = 'grid-row';
            tr.dataset.rowIndex = row;

            // POS Section: 4 groups (1-50, 51-100, 101-150, 151-200)
            for (let group = 0; group < 4; group++) {
                const srNo = row + 1 + (group * 50);
                
                // SR.NO cell (read-only)
                const srCell = document.createElement('td');
                srCell.className = 'grid-cell sr-no-cell';
                srCell.textContent = srNo;
                tr.appendChild(srCell);
                
                // AMOUNT cell
                const amountCell = document.createElement('td');
                amountCell.className = 'grid-cell';
                const amountInput = this.createInput('POS', row + (group * 50), 'AMOUNT');
                amountCell.appendChild(amountInput);
                tr.appendChild(amountCell);
            }

            // KOTAK QR Section (SR.NO, SALESMAN, AMOUNT)
            const kqrSrCell = document.createElement('td');
            kqrSrCell.className = 'grid-cell sr-no-cell';
            kqrSrCell.textContent = row + 1;
            tr.appendChild(kqrSrCell);
            
            const kqrSalesmanCell = document.createElement('td');
            kqrSalesmanCell.className = 'grid-cell';
            const kqrSalesmanInput = this.createInput('KQR', row, 'SALESMAN');
            kqrSalesmanCell.appendChild(kqrSalesmanInput);
            tr.appendChild(kqrSalesmanCell);
            
            const kqrAmountCell = document.createElement('td');
            kqrAmountCell.className = 'grid-cell';
            const kqrAmountInput = this.createInput('KQR', row, 'AMOUNT');
            kqrAmountCell.appendChild(kqrAmountInput);
            tr.appendChild(kqrAmountCell);

            // KOTAK SWIPE Section (SR.NO, SALESMAN, AMOUNT)
            const kswSrCell = document.createElement('td');
            kswSrCell.className = 'grid-cell sr-no-cell';
            kswSrCell.textContent = row + 1;
            tr.appendChild(kswSrCell);
            
            const kswSalesmanCell = document.createElement('td');
            kswSalesmanCell.className = 'grid-cell';
            const kswSalesmanInput = this.createInput('KSW', row, 'SALESMAN');
            kswSalesmanCell.appendChild(kswSalesmanInput);
            tr.appendChild(kswSalesmanCell);
            
            const kswAmountCell = document.createElement('td');
            kswAmountCell.className = 'grid-cell';
            const kswAmountInput = this.createInput('KSW', row, 'AMOUNT');
            kswAmountCell.appendChild(kswAmountInput);
            tr.appendChild(kswAmountCell);

            // DEBTORS Section (SR.NO, SALESMAN, PARTY, AMOUNT)
            const debtorSrCell = document.createElement('td');
            debtorSrCell.className = 'grid-cell sr-no-cell';
            debtorSrCell.textContent = row + 1;
            tr.appendChild(debtorSrCell);
            
            const debtorSalesmanCell = document.createElement('td');
            debtorSalesmanCell.className = 'grid-cell';
            const debtorSalesmanInput = this.createInput('DEBTOR', row, 'SALESMAN');
            debtorSalesmanCell.appendChild(debtorSalesmanInput);
            tr.appendChild(debtorSalesmanCell);
            
            const debtorPartyCell = document.createElement('td');
            debtorPartyCell.className = 'grid-cell';
            const debtorPartyInput = this.createInput('DEBTOR', row, 'PARTY');
            debtorPartyCell.appendChild(debtorPartyInput);
            tr.appendChild(debtorPartyCell);
            
            const debtorAmountCell = document.createElement('td');
            debtorAmountCell.className = 'grid-cell';
            const debtorAmountInput = this.createInput('DEBTOR', row, 'AMOUNT');
            debtorAmountCell.appendChild(debtorAmountInput);
            tr.appendChild(debtorAmountCell);

            gridBody.appendChild(tr);
        }
    }

    /**
     * Create an input element with event listeners
     */
    createInput(section, rowIndex, fieldType) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cell-input';
        input.dataset.cellKey = `${section}_${fieldType}_${rowIndex}`;
        input.dataset.section = section;
        input.dataset.rowIndex = rowIndex;
        input.dataset.fieldType = fieldType;
        input.placeholder = fieldType === 'AMOUNT' ? '0' : '';
        
        // Get value from sheetData if exists
        if (this.sheetData[section] && this.sheetData[section][rowIndex]) {
            input.value = this.sheetData[section][rowIndex][fieldType.toLowerCase()] || '';
        }
        
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

        return input;
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

        // Generate return table
        this.generateReturnTable();
    }

    /**
     * Generate return table
     */
    generateReturnTable() {
        const returnBody = document.getElementById('return-body');
        if (!returnBody) return;

        returnBody.innerHTML = '';

        // Create 5 return rows
        for (let i = 0; i < 5; i++) {
            const tr = document.createElement('tr');

            // SR. NO.
            const srTd = document.createElement('td');
            const srInput = document.createElement('input');
            srInput.type = 'text';
            srInput.dataset.returnField = 'srno';
            srInput.dataset.returnIndex = i;
            srTd.appendChild(srInput);
            tr.appendChild(srTd);

            // SALESMAN
            const salesmanTd = document.createElement('td');
            const salesmanInput = document.createElement('input');
            salesmanInput.type = 'text';
            salesmanInput.dataset.returnField = 'salesman';
            salesmanInput.dataset.returnIndex = i;
            salesmanTd.appendChild(salesmanInput);
            tr.appendChild(salesmanTd);

            // AMOUNT
            const amountTd = document.createElement('td');
            const amountInput = document.createElement('input');
            amountInput.type = 'number';
            amountInput.step = '0.01';
            amountInput.dataset.returnField = 'amount';
            amountInput.dataset.returnIndex = i;
            amountInput.addEventListener('input', () => {
                this.updateCalculations();
            });
            amountTd.appendChild(amountInput);
            tr.appendChild(amountTd);

            returnBody.appendChild(tr);
        }
    }

    /**
     * Handle cell input event (for auto-expansion)
     */
    handleCellInput(event) {
        const input = event.target;
        const section = input.dataset.section;
        const rowIndex = parseInt(input.dataset.rowIndex);
        const value = input.value;

        // Show POS entry modal for POS section when user starts typing
        if (section === 'POS' && value && !this.entryTypes[input.dataset.cellKey]) {
            this.currentPOSInput = input;
            this.showPOSModal();
            return;
        }

        // Update sheet data
        if (!this.sheetData[section][rowIndex]) {
            this.sheetData[section][rowIndex] = { value: '' };
        }
        this.sheetData[section][rowIndex].value = value;

        // Check if we need to expand rows
        this.checkAndExpandRows(section);
        
        // Update calculations
        this.updateCalculations();
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
        
        // Update theme label
        const themeLabel = document.getElementById('theme-label');
        if (themeLabel) {
            themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
        }
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

    /**
     * Show POS Entry Modal
     */
    showPOSModal() {
        const modal = document.getElementById('pos-entry-modal');
        if (modal) {
            modal.classList.add('show');
            // Reset to default selection
            const saleRadio = document.querySelector('input[name="pos-entry-type"][value="sale"]');
            if (saleRadio) {
                saleRadio.checked = true;
            }
        }
    }

    /**
     * Close POS Entry Modal
     */
    closePOSModal() {
        const modal = document.getElementById('pos-entry-modal');
        if (modal) {
            modal.classList.remove('show');
        }
        // Clear the current input if user cancels
        if (this.currentPOSInput) {
            this.currentPOSInput.value = '';
            this.currentPOSInput = null;
        }
    }

    /**
     * Confirm POS Entry
     */
    confirmPOSEntry() {
        if (!this.currentPOSInput) return;

        // Get selected entry type (radio button)
        const selectedType = document.querySelector('input[name="pos-entry-type"]:checked');
        
        // Get selected payment methods (checkboxes)
        const paymentMethods = [];
        document.querySelectorAll('input[name="payment-method"]:checked').forEach(checkbox => {
            paymentMethods.push(checkbox.value);
        });
        
        if (selectedType && paymentMethods.length > 0) {
            const entryType = selectedType.value;
            const cellKey = this.currentPOSInput.dataset.cellKey;
            
            // Store entry type and payment methods
            this.entryTypes[cellKey] = {
                type: entryType,
                paymentMethods: paymentMethods
            };
            
            // Add badges to input
            this.addEntryBadges(this.currentPOSInput, entryType, paymentMethods);
            
            // Update sheet data
            const section = this.currentPOSInput.dataset.section;
            const rowIndex = parseInt(this.currentPOSInput.dataset.rowIndex);
            const value = this.currentPOSInput.value;
            
            if (!this.sheetData[section][rowIndex]) {
                this.sheetData[section][rowIndex] = { 
                    value: '', 
                    entryType: entryType,
                    paymentMethods: paymentMethods 
                };
            } else {
                this.sheetData[section][rowIndex].entryType = entryType;
                this.sheetData[section][rowIndex].paymentMethods = paymentMethods;
            }
            this.sheetData[section][rowIndex].value = value;
            
            // Check if we need to expand rows
            this.checkAndExpandRows(section);
            
            // Update calculations
            this.updateCalculations();
        } else {
            alert('Please select at least one payment method');
            return;
        }
        
        // Close modal
        this.closePOSModal();
        this.currentPOSInput = null;
    }

    /**
     * Add entry type badges to input
     */
    addEntryBadges(input, entryType, paymentMethods) {
        // Remove existing badges if any
        const existingBadges = input.parentElement.querySelectorAll('.entry-badge');
        existingBadges.forEach(badge => badge.remove());
        
        // Make parent relative if not already
        input.parentElement.style.position = 'relative';
        
        // Create badge container
        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'badge-container';
        badgeContainer.style.position = 'absolute';
        badgeContainer.style.top = '2px';
        badgeContainer.style.right = '2px';
        badgeContainer.style.display = 'flex';
        badgeContainer.style.gap = '4px';
        badgeContainer.style.pointerEvents = 'none';
        
        // Create entry type badge
        const typeBadge = document.createElement('span');
        typeBadge.className = `entry-badge ${entryType}`;
        typeBadge.textContent = entryType.toUpperCase();
        badgeContainer.appendChild(typeBadge);
        
        // Create payment method badges
        paymentMethods.forEach(method => {
            const methodBadge = document.createElement('span');
            methodBadge.className = `entry-badge payment-${method}`;
            methodBadge.textContent = method === 'cash' ? '💵' : '💳';
            methodBadge.title = method.toUpperCase();
            badgeContainer.appendChild(methodBadge);
        });
        
        input.parentElement.appendChild(badgeContainer);
    }

    /**
     * Update all calculations
     */
    updateCalculations() {
        // Use the new calculations manager if available
        if (typeof calculationsManager !== 'undefined') {
            calculationsManager.updateAllDisplays();
        } else {
            // Fallback to old calculation method
            const posTotal = this.calculateSectionTotal('POS');
            const kqrTotal = this.calculateSectionTotal('KQR');
            const kswTotal = this.calculateSectionTotal('KSW');
            const debtorTotal = this.calculateSectionTotal('DEBTOR');
            
            const totalSale = posTotal;
            const debitCash = this.openingCash + totalSale;
            const denominationsTotal = this.calculateDenominationsTotal();
            const netAmount = debitCash - (kqrTotal + kswTotal + debtorTotal + this.bharatpe);
            const collection = denominationsTotal + kqrTotal + kswTotal + debtorTotal + this.bharatpe;
            const difference = debitCash - collection;
            
            this.updateElement('total-sale', this.formatCurrency(totalSale));
            this.updateElement('debit-cash', this.formatCurrency(debitCash));
            this.updateElement('net-amount', this.formatCurrency(netAmount));
            this.updateElement('swipe-total', this.formatCurrency(kswTotal));
            this.updateElement('debtors-total', this.formatCurrency(debtorTotal));
            this.updateElement('collection-total', this.formatCurrency(collection));
            this.updateElement('difference', this.formatCurrency(difference));
        }
    }

    /**
     * Calculate total for a section
     */
    calculateSectionTotal(section) {
        let total = 0;
        if (this.sheetData[section]) {
            this.sheetData[section].forEach(row => {
                const value = parseFloat(row.value) || 0;
                total += value;
            });
        }
        return total;
    }

    /**
     * Calculate denominations total
     */
    calculateDenominationsTotal() {
        let total = 0;
        this.denominations.forEach(denom => {
            const piecesInput = document.querySelector(`input[data-denom="${denom.value}"]`);
            if (piecesInput) {
                const pieces = parseInt(piecesInput.value) || 0;
                total += pieces * denom.value;
            }
        });
        return total;
    }

    /**
     * Update element text content
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Format currency
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(value);
    }

    /**
     * Minimize window
     */
    minimizeWindow() {
        // In a web app, we can simulate minimize by hiding the main content
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.style.display = 'none';
            this.showStatus('Window minimized (click maximize to restore)', 'info');
        }
    }

    /**
     * Toggle maximize window
     */
    toggleMaximize() {
        const body = document.body;
        const mainContainer = document.querySelector('.main-container');
        
        if (mainContainer) {
            mainContainer.style.display = 'flex';
        }
        
        if (body.classList.contains('maximized')) {
            body.classList.remove('maximized');
            body.style.width = '';
            body.style.height = '';
            this.showStatus('Window restored', 'info');
        } else {
            body.classList.add('maximized');
            body.style.width = '100vw';
            body.style.height = '100vh';
            this.showStatus('Window maximized', 'info');
        }
    }

    /**
     * Close window
     */
    closeWindow() {
        if (confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
            // In a web app, we can redirect or close the tab
            window.close();
            // If window.close() doesn't work (some browsers block it), show a message
            setTimeout(() => {
                this.showStatus('Please close the browser tab manually', 'warning');
            }, 100);
        }
    }
}

// Create and export a singleton instance
const uiManager = new UIManager();
window.uiManager = uiManager;
