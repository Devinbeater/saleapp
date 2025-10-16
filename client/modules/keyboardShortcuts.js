/**
 * Keyboard Shortcuts Module for Daily Sheet Manager
 * Handles all keyboard shortcuts and navigation
 */

class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.isHelpModalOpen = false;
        this.currentFocusedCell = null;
        this.initializeShortcuts();
        this.setupEventListeners();
    }

    /**
     * Initialize keyboard shortcuts
     */
    initializeShortcuts() {
        // Save sheet
        this.addShortcut(['ctrl+s', 'meta+s'], () => {
            this.saveSheet();
        });

        // Export options
        this.addShortcut(['ctrl+shift+s', 'meta+shift+s'], () => {
            this.showExportOptions();
        });

        // Toggle help
        this.addShortcut(['ctrl+slash', 'meta+slash'], () => {
            this.toggleHelpModal();
        });

        // Insert SUM formula
        this.addShortcut(['ctrl+equals', 'meta+equals'], () => {
            this.insertSumFormula();
        });

        // Previous row
        this.addShortcut(['shift+enter'], (event) => {
            this.moveToPreviousRow(event);
        });

        // Next row
        this.addShortcut(['enter'], (event) => {
            this.moveToNextRow(event);
        });

        // Generate report
        this.addShortcut(['ctrl+p', 'meta+p'], () => {
            this.generateReport();
        });

        // Recalculate
        this.addShortcut(['ctrl+r', 'meta+r'], () => {
            this.recalculate();
        });

        // Escape to close modals
        this.addShortcut(['escape'], () => {
            this.handleEscape();
        });

        // Tab navigation
        this.addShortcut(['tab'], (event) => {
            this.handleTab(event);
        });

        // Shift+Tab for reverse navigation
        this.addShortcut(['shift+tab'], (event) => {
            this.handleShiftTab(event);
        });

        // Excel-like shortcuts
        // Copy (Ctrl+C)
        this.addShortcut(['ctrl+c', 'meta+c'], (event) => {
            this.copyCell(event);
        });

        // Cut (Ctrl+X)
        this.addShortcut(['ctrl+x', 'meta+x'], (event) => {
            this.cutCell(event);
        });

        // Paste (Ctrl+V)
        this.addShortcut(['ctrl+v', 'meta+v'], (event) => {
            this.pasteCell(event);
        });

        // Undo (Ctrl+Z)
        this.addShortcut(['ctrl+z', 'meta+z'], (event) => {
            this.undo(event);
        });

        // Redo (Ctrl+Y)
        this.addShortcut(['ctrl+y', 'meta+y'], (event) => {
            this.redo(event);
        });

        // Delete cell content (Delete key)
        this.addShortcut(['delete'], (event) => {
            this.deleteCellContent(event);
        });

        // F2 to edit cell
        this.addShortcut(['f2'], (event) => {
            this.editCell(event);
        });

        // Arrow keys navigation
        this.addShortcut(['arrowup'], (event) => {
            this.moveUp(event);
        });

        this.addShortcut(['arrowdown'], (event) => {
            this.moveDown(event);
        });

        this.addShortcut(['arrowleft'], (event) => {
            this.moveLeft(event);
        });

        this.addShortcut(['arrowright'], (event) => {
            this.moveRight(event);
        });

        // Ctrl+Home (go to first cell)
        this.addShortcut(['ctrl+home', 'meta+home'], (event) => {
            this.goToFirstCell(event);
        });

        // Ctrl+End (go to last cell)
        this.addShortcut(['ctrl+end', 'meta+end'], (event) => {
            this.goToLastCell(event);
        });

        // Ctrl+A (select all)
        this.addShortcut(['ctrl+a', 'meta+a'], (event) => {
            this.selectAll(event);
        });
    }

    /**
     * Add a keyboard shortcut
     */
    addShortcut(keys, handler) {
        keys.forEach(key => {
            this.shortcuts.set(key, handler);
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.handleKeydown(event);
        });

        document.addEventListener('keyup', (event) => {
            this.handleKeyup(event);
        });

        // Track focused cell
        document.addEventListener('focusin', (event) => {
            if (event.target.matches('input[data-cell-key]')) {
                this.currentFocusedCell = event.target;
            }
        });

        document.addEventListener('focusout', (event) => {
            if (event.target === this.currentFocusedCell) {
                this.currentFocusedCell = null;
            }
        });
    }

    /**
     * Handle keydown events
     */
    handleKeydown(event) {
        // Don't interfere with input fields unless it's a special key
        if (this.isInputField(event.target) && !this.isSpecialKey(event)) {
            return;
        }

        const key = this.getKeyCombo(event);
        const handler = this.shortcuts.get(key);

        if (handler) {
            event.preventDefault();
            event.stopPropagation();
            handler(event);
        }
    }

    /**
     * Handle keyup events
     */
    handleKeyup(event) {
        // Handle any keyup-specific logic here
    }

    /**
     * Get key combination string
     */
    getKeyCombo(event) {
        const parts = [];
        
        if (event.ctrlKey) parts.push('ctrl');
        if (event.metaKey) parts.push('meta');
        if (event.shiftKey) parts.push('shift');
        if (event.altKey) parts.push('alt');
        
        const key = event.key.toLowerCase();
        
        // Handle special keys
        switch (key) {
            case '/':
                return parts.concat(['slash']).join('+');
            case '=':
                return parts.concat(['equals']).join('+');
            case ' ':
                return parts.concat(['space']).join('+');
            default:
                return parts.concat([key]).join('+');
        }
    }

    /**
     * Check if target is an input field
     */
    isInputField(target) {
        return target.matches('input, textarea, [contenteditable]');
    }

    /**
     * Check if it's a special key that should work in input fields
     */
    isSpecialKey(event) {
        const specialKeys = ['escape', 'tab', 'enter'];
        return specialKeys.includes(event.key.toLowerCase());
    }

    /**
     * Save sheet
     */
    async saveSheet() {
        try {
            await uiManager.saveSheet();
            uiManager.showStatus('Sheet saved successfully', 'success');
        } catch (error) {
            console.error('Error saving sheet:', error);
            uiManager.showStatus('Error saving sheet', 'error');
        }
    }

    /**
     * Show export options
     */
    showExportOptions() {
        // Create export options modal
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Export Options</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="export-options">
                        <button class="btn btn-primary" id="export-csv-shortcut">
                            <i class="fas fa-file-csv"></i> Export CSV
                        </button>
                        <button class="btn btn-primary" id="export-excel-shortcut">
                            <i class="fas fa-file-excel"></i> Export Excel
                        </button>
                        <button class="btn btn-primary" id="export-pdf-shortcut">
                            <i class="fas fa-file-pdf"></i> Export PDF
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#export-csv-shortcut').addEventListener('click', () => {
            if (window.exportUtils) {
                window.exportUtils.exportToCSV();
            }
            document.body.removeChild(modal);
        });

        modal.querySelector('#export-excel-shortcut').addEventListener('click', () => {
            if (window.exportUtils) {
                window.exportUtils.exportToExcel();
            }
            document.body.removeChild(modal);
        });

        modal.querySelector('#export-pdf-shortcut').addEventListener('click', () => {
            if (window.exportUtils) {
                window.exportUtils.exportToPDF();
            }
            document.body.removeChild(modal);
        });

        // Close on outside click
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * Toggle help modal
     */
    toggleHelpModal() {
        if (this.isHelpModalOpen) {
            uiManager.closeHelpModal();
            this.isHelpModalOpen = false;
        } else {
            uiManager.openHelpModal();
            this.isHelpModalOpen = true;
        }
    }

    /**
     * Insert SUM formula
     */
    insertSumFormula() {
        if (!this.currentFocusedCell) {
            uiManager.showStatus('Please select a cell first', 'warning');
            return;
        }

        const cellKey = this.currentFocusedCell.dataset.cellKey;
        const section = this.currentFocusedCell.dataset.section;
        
        if (section) {
            const sumFormula = `=SUM(${section}_AMOUNT_0:${section}_AMOUNT_24)`;
            this.currentFocusedCell.value = sumFormula;
            this.currentFocusedCell.dispatchEvent(new Event('blur'));
        }
    }

    /**
     * Move to previous row
     */
    moveToPreviousRow(event) {
        if (!this.currentFocusedCell) return;

        const currentRow = parseInt(this.currentFocusedCell.dataset.rowIndex);
        const section = this.currentFocusedCell.dataset.section;
        const prevRow = Math.max(0, currentRow - 1);
        
        const prevCell = document.querySelector(`input[data-section="${section}"][data-row-index="${prevRow}"]`);
        if (prevCell) {
            prevCell.focus();
        }
    }

    /**
     * Move to next row
     */
    moveToNextRow(event) {
        if (!this.currentFocusedCell) return;

        const currentRow = parseInt(this.currentFocusedCell.dataset.rowIndex);
        const section = this.currentFocusedCell.dataset.section;
        const nextRow = currentRow + 1;
        
        if (nextRow < 25) { // Max rows
            const nextCell = document.querySelector(`input[data-section="${section}"][data-row-index="${nextRow}"]`);
            if (nextCell) {
                nextCell.focus();
            }
        }
    }

    /**
     * Generate report
     */
    generateReport() {
        if (window.exportUtils) {
            window.exportUtils.generateReport();
        }
    }

    /**
     * Recalculate formulas
     */
    recalculate() {
        const success = formulaEngine.recalculate();
        if (success) {
            uiManager.showStatus('Formulas recalculated', 'success');
        } else {
            uiManager.showStatus('Error recalculating formulas', 'error');
        }
    }

    /**
     * Handle escape key
     */
    handleEscape() {
        // Close help modal
        if (this.isHelpModalOpen) {
            uiManager.closeHelpModal();
            this.isHelpModalOpen = false;
            return;
        }

        // Close any other modals
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });

        // Blur current input
        if (this.currentFocusedCell) {
            this.currentFocusedCell.blur();
        }
    }

    /**
     * Handle tab navigation
     */
    handleTab(event) {
        if (!this.currentFocusedCell) return;

        const currentRow = parseInt(this.currentFocusedCell.dataset.rowIndex);
        const currentSection = this.currentFocusedCell.dataset.section;
        const sections = ['POS', 'KQR', 'KSW', 'DEBTOR'];
        const currentSectionIndex = sections.indexOf(currentSection);
        
        let nextSectionIndex = currentSectionIndex + 1;
        let nextRow = currentRow;
        
        if (nextSectionIndex >= sections.length) {
            nextSectionIndex = 0;
            nextRow++;
        }
        
        if (nextRow < 25) {
            const nextSection = sections[nextSectionIndex];
            const nextCell = document.querySelector(`input[data-section="${nextSection}"][data-row-index="${nextRow}"]`);
            if (nextCell) {
                nextCell.focus();
            }
        }
    }

    /**
     * Handle shift+tab navigation
     */
    handleShiftTab(event) {
        if (!this.currentFocusedCell) return;

        const currentRow = parseInt(this.currentFocusedCell.dataset.rowIndex);
        const currentSection = this.currentFocusedCell.dataset.section;
        const sections = ['POS', 'KQR', 'KSW', 'DEBTOR'];
        const currentSectionIndex = sections.indexOf(currentSection);
        
        let prevSectionIndex = currentSectionIndex - 1;
        let prevRow = currentRow;
        
        if (prevSectionIndex < 0) {
            prevSectionIndex = sections.length - 1;
            prevRow--;
        }
        
        if (prevRow >= 0) {
            const prevSection = sections[prevSectionIndex];
            const prevCell = document.querySelector(`input[data-section="${prevSection}"][data-row-index="${prevRow}"]`);
            if (prevCell) {
                prevCell.focus();
            }
        }
    }

    /**
     * Get help text for shortcuts
     */
    getShortcutsHelp() {
        return [
            { key: 'Ctrl/Cmd + S', description: 'Save sheet' },
            { key: 'Ctrl/Cmd + Shift + S', description: 'Export options' },
            { key: 'Ctrl/Cmd + /', description: 'Toggle help' },
            { key: 'Ctrl/Cmd + =', description: 'Insert SUM formula' },
            { key: 'Shift + Enter', description: 'Previous row' },
            { key: 'Enter', description: 'Next row' },
            { key: 'Tab', description: 'Next cell' },
            { key: 'Shift + Tab', description: 'Previous cell' },
            { key: 'Ctrl/Cmd + P', description: 'Generate report' },
            { key: 'Ctrl/Cmd + R', description: 'Recalculate' },
            { key: 'Escape', description: 'Close modals/blur input' }
        ];
    }

    /**
     * Enable/disable shortcuts
     */
    setShortcutsEnabled(enabled) {
        if (enabled) {
            document.addEventListener('keydown', this.handleKeydown);
        } else {
            document.removeEventListener('keydown', this.handleKeydown);
        }
    }

    // Excel-like functionality implementations
    
    /**
     * Copy cell content
     */
    copyCell(event) {
        if (!this.currentFocusedCell) return;
        const value = this.currentFocusedCell.value;
        navigator.clipboard.writeText(value).then(() => {
            uiManager.showStatus('Copied to clipboard', 'success');
        });
    }

    /**
     * Cut cell content
     */
    cutCell(event) {
        if (!this.currentFocusedCell) return;
        const value = this.currentFocusedCell.value;
        navigator.clipboard.writeText(value).then(() => {
            this.currentFocusedCell.value = '';
            this.currentFocusedCell.dispatchEvent(new Event('input'));
            uiManager.showStatus('Cut to clipboard', 'success');
        });
    }

    /**
     * Paste cell content
     */
    pasteCell(event) {
        if (!this.currentFocusedCell) return;
        navigator.clipboard.readText().then(text => {
            this.currentFocusedCell.value = text;
            this.currentFocusedCell.dispatchEvent(new Event('input'));
            uiManager.showStatus('Pasted from clipboard', 'success');
        });
    }

    /**
     * Undo (placeholder - would need undo/redo stack)
     */
    undo(event) {
        uiManager.showStatus('Undo not yet implemented', 'warning');
    }

    /**
     * Redo (placeholder - would need undo/redo stack)
     */
    redo(event) {
        uiManager.showStatus('Redo not yet implemented', 'warning');
    }

    /**
     * Delete cell content
     */
    deleteCellContent(event) {
        if (!this.currentFocusedCell) return;
        this.currentFocusedCell.value = '';
        this.currentFocusedCell.dispatchEvent(new Event('input'));
    }

    /**
     * Edit cell (F2)
     */
    editCell(event) {
        if (!this.currentFocusedCell) {
            const firstInput = document.querySelector('input[data-cell-key]');
            if (firstInput) firstInput.focus();
        } else {
            this.currentFocusedCell.select();
        }
    }

    /**
     * Move up
     */
    moveUp(event) {
        if (!this.currentFocusedCell) return;
        event.preventDefault();
        const currentRow = parseInt(this.currentFocusedCell.dataset.rowIndex);
        if (currentRow > 0) {
            const section = this.currentFocusedCell.dataset.section;
            const fieldType = this.currentFocusedCell.dataset.fieldType;
            const prevCell = document.querySelector(
                `input[data-section="${section}"][data-row-index="${currentRow - 1}"][data-field-type="${fieldType}"]`
            );
            if (prevCell) prevCell.focus();
        }
    }

    /**
     * Move down
     */
    moveDown(event) {
        if (!this.currentFocusedCell) return;
        event.preventDefault();
        const currentRow = parseInt(this.currentFocusedCell.dataset.rowIndex);
        const section = this.currentFocusedCell.dataset.section;
        const fieldType = this.currentFocusedCell.dataset.fieldType;
        const nextCell = document.querySelector(
            `input[data-section="${section}"][data-row-index="${currentRow + 1}"][data-field-type="${fieldType}"]`
        );
        if (nextCell) nextCell.focus();
    }

    /**
     * Move left
     */
    moveLeft(event) {
        if (!this.currentFocusedCell) return;
        event.preventDefault();
        const allInputs = Array.from(document.querySelectorAll('input[data-cell-key]'));
        const currentIndex = allInputs.indexOf(this.currentFocusedCell);
        if (currentIndex > 0) {
            allInputs[currentIndex - 1].focus();
        }
    }

    /**
     * Move right
     */
    moveRight(event) {
        if (!this.currentFocusedCell) return;
        event.preventDefault();
        const allInputs = Array.from(document.querySelectorAll('input[data-cell-key]'));
        const currentIndex = allInputs.indexOf(this.currentFocusedCell);
        if (currentIndex < allInputs.length - 1) {
            allInputs[currentIndex + 1].focus();
        }
    }

    /**
     * Go to first cell
     */
    goToFirstCell(event) {
        event.preventDefault();
        const firstInput = document.querySelector('input[data-cell-key]');
        if (firstInput) firstInput.focus();
    }

    /**
     * Go to last cell
     */
    goToLastCell(event) {
        event.preventDefault();
        const allInputs = document.querySelectorAll('input[data-cell-key]');
        if (allInputs.length > 0) {
            allInputs[allInputs.length - 1].focus();
        }
    }

    /**
     * Select all (select all text in current cell)
     */
    selectAll(event) {
        if (!this.currentFocusedCell) return;
        event.preventDefault();
        this.currentFocusedCell.select();
    }
}

// Create and export a singleton instance
const keyboardShortcuts = new KeyboardShortcuts();
window.keyboardShortcuts = keyboardShortcuts;
