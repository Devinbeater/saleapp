/**
 * Day Management Module
 * Handles day start, opening cash breakdown, and day closing logic
 */

class DayManagementManager {
    constructor() {
        this.currentDayData = null;
        this.isDayClosed = false;
        this.openingDenominations = {};
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Day start button
        const startDayBtn = document.getElementById('start-day-btn');
        if (startDayBtn) {
            startDayBtn.addEventListener('click', () => {
                this.openDayStartModal();
            });
        }

        // Day close button
        const closeDayBtn = document.getElementById('close-day-btn');
        if (closeDayBtn) {
            closeDayBtn.addEventListener('click', () => {
                this.openDayCloseModal();
            });
        }

        // Opening cash modal handlers
        this.setupOpeningCashModal();
        
        // Day closing modal handlers
        this.setupDayCloseModal();
    }

    /**
     * Setup Opening Cash Modal
     */
    setupOpeningCashModal() {
        const closeBtn = document.getElementById('close-opening-cash-modal');
        const cancelBtn = document.getElementById('cancel-opening-cash');
        const confirmBtn = document.getElementById('confirm-opening-cash');
        const modal = document.getElementById('opening-cash-modal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeOpeningCashModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeOpeningCashModal();
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.handleStartDay();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeOpeningCashModal();
                }
            });
        }

        // Add input listeners for denomination calculation
        this.setupDenominationInputs();
    }

    /**
     * Setup denomination inputs for auto-calculation
     */
    setupDenominationInputs() {
        const denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
        
        denominations.forEach(denom => {
            const input = document.getElementById(`opening-denom-${denom}`);
            if (input) {
                input.addEventListener('input', () => {
                    this.calculateOpeningTotal();
                });
            }
        });

        // Coins input
        const coinsInput = document.getElementById('opening-coins');
        if (coinsInput) {
            coinsInput.addEventListener('input', () => {
                this.calculateOpeningTotal();
            });
        }
    }

    /**
     * Calculate opening total from denominations
     */
    calculateOpeningTotal() {
        const denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
        let total = 0;

        denominations.forEach(denom => {
            const input = document.getElementById(`opening-denom-${denom}`);
            if (input) {
                const pieces = parseInt(input.value) || 0;
                const amount = pieces * denom;
                total += amount;

                // Update amount display
                const amountDisplay = document.getElementById(`opening-amount-${denom}`);
                if (amountDisplay) {
                    amountDisplay.textContent = amount.toFixed(2);
                }
            }
        });

        // Add coins
        const coinsInput = document.getElementById('opening-coins');
        if (coinsInput) {
            total += parseFloat(coinsInput.value) || 0;
        }

        // Update total display
        const totalDisplay = document.getElementById('opening-total-display');
        if (totalDisplay) {
            totalDisplay.textContent = `₹${total.toFixed(2)}`;
        }

        return total;
    }

    /**
     * Setup Day Close Modal
     */
    setupDayCloseModal() {
        const closeBtn = document.getElementById('close-day-close-modal');
        const cancelBtn = document.getElementById('cancel-day-close');
        const confirmBtn = document.getElementById('confirm-day-close');
        const modal = document.getElementById('day-close-modal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeDayCloseModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeDayCloseModal();
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.handleCloseDay();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeDayCloseModal();
                }
            });
        }
    }

    /**
     * Open Day Start Modal
     */
    openDayStartModal() {
        const modal = document.getElementById('opening-cash-modal');
        if (modal) {
            // Clear all inputs
            const denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
            denominations.forEach(denom => {
                const input = document.getElementById(`opening-denom-${denom}`);
                if (input) input.value = '';
                const amount = document.getElementById(`opening-amount-${denom}`);
                if (amount) amount.textContent = '0.00';
            });

            const coinsInput = document.getElementById('opening-coins');
            if (coinsInput) coinsInput.value = '';

            const totalDisplay = document.getElementById('opening-total-display');
            if (totalDisplay) totalDisplay.textContent = '₹0.00';

            modal.classList.add('show');
        }
    }

    /**
     * Close Opening Cash Modal
     */
    closeOpeningCashModal() {
        const modal = document.getElementById('opening-cash-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Handle Start Day
     */
    handleStartDay() {
        const total = this.calculateOpeningTotal();

        if (total <= 0) {
            alert('⚠️ Please enter opening cash denominations!');
            return;
        }

        // Save opening denominations
        const denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
        this.openingDenominations = {};

        denominations.forEach(denom => {
            const input = document.getElementById(`opening-denom-${denom}`);
            if (input) {
                this.openingDenominations[denom] = parseInt(input.value) || 0;
            }
        });

        const coinsInput = document.getElementById('opening-coins');
        if (coinsInput) {
            this.openingDenominations['coins'] = parseFloat(coinsInput.value) || 0;
        }

        // Update opening cash input
        const openingCashInput = document.getElementById('opening-cash');
        if (openingCashInput) {
            openingCashInput.value = total.toFixed(2);
            // Trigger input event to update calculations
            openingCashInput.dispatchEvent(new Event('input'));
        }

        // Save to localStorage
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('pos_opening_date', today);
        localStorage.setItem('pos_opening_denominations', JSON.stringify(this.openingDenominations));
        localStorage.setItem('pos_opening_total', total.toString());

        // Mark day as started
        this.isDayClosed = false;
        localStorage.setItem('pos_day_closed', 'false');

        // Close modal
        this.closeOpeningCashModal();

        // Show success
        this.showToast(`✅ Day started with opening cash: ₹${total.toFixed(2)}`, 'success');

        // Update UI
        this.updateDayStatus();
    }

    /**
     * Open Day Close Modal
     */
    openDayCloseModal() {
        const modal = document.getElementById('day-close-modal');
        if (modal) {
            // Run validation checks
            const validation = this.validateDayClosing();
            
            // Update checklist
            this.updateClosingChecklist(validation.checks);

            // Enable/disable confirm button
            const confirmBtn = document.getElementById('confirm-day-close');
            if (confirmBtn) {
                confirmBtn.disabled = !validation.canClose;
            }

            modal.classList.add('show');
        }
    }

    /**
     * Close Day Close Modal
     */
    closeDayCloseModal() {
        const modal = document.getElementById('day-close-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Validate day closing readiness
     */
    validateDayClosing() {
        const checks = [];
        let allPassed = true;

        // Check 1: Opening cash entered
        const openingCash = parseFloat(document.getElementById('opening-cash')?.value || 0);
        if (openingCash === 0) {
            checks.push({
                name: 'Opening Cash',
                passed: false,
                message: 'Opening cash not entered'
            });
            allPassed = false;
        } else {
            checks.push({
                name: 'Opening Cash',
                passed: true,
                message: `✓ ₹${openingCash.toFixed(2)}`
            });
        }

        // Check 2: Denominations counted
        const denomTotal = typeof calculationsManager !== 'undefined'
            ? calculationsManager.getDenominationTotal()
            : 0;
        
        if (denomTotal === 0) {
            checks.push({
                name: 'Denominations',
                passed: false,
                message: 'Please count and enter denominations'
            });
            allPassed = false;
        } else {
            checks.push({
                name: 'Denominations',
                passed: true,
                message: `✓ ₹${denomTotal.toFixed(2)}`
            });
        }

        // Check 3: Difference should be 0
        const difference = typeof calculationsManager !== 'undefined'
            ? calculationsManager.getDifference()
            : 0;
        
        if (Math.abs(difference) > 0.01) {
            checks.push({
                name: 'Cash Balance',
                passed: false,
                message: `Difference is ₹${difference.toFixed(2)}. Must be ₹0.00`
            });
            allPassed = false;
        } else {
            checks.push({
                name: 'Cash Balance',
                passed: true,
                message: '✓ Balanced'
            });
        }

        // Check 4: Pending debtors (informational only)
        const pendingCount = typeof debtorsManager !== 'undefined'
            ? debtorsManager.getPendingCount()
            : 0;
        
        checks.push({
            name: 'Pending Debtors',
            passed: true,
            message: pendingCount > 0 
                ? `${pendingCount} debtor(s) pending (OK to close)` 
                : '✓ No pending debtors'
        });

        return {
            canClose: allPassed,
            checks: checks
        };
    }

    /**
     * Update closing checklist display
     */
    updateClosingChecklist(checks) {
        const checklistContainer = document.getElementById('closing-checklist');
        if (!checklistContainer) return;

        checklistContainer.innerHTML = '';

        checks.forEach(check => {
            const item = document.createElement('div');
            item.className = `checklist-item ${check.passed ? 'passed' : 'failed'}`;
            item.innerHTML = `
                <i class="fas ${check.passed ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <div class="checklist-content">
                    <strong>${check.name}</strong>
                    <span>${check.message}</span>
                </div>
            `;
            checklistContainer.appendChild(item);
        });
    }

    /**
     * Handle Close Day
     */
    handleCloseDay() {
        // Final validation
        const validation = this.validateDayClosing();
        
        if (!validation.canClose) {
            alert('⚠️ Cannot close day. Please resolve all issues first.');
            return;
        }

        // Confirm
        const confirm = window.confirm(
            '⚠️ Are you sure you want to close the day?\n\n' +
            'This will:\n' +
            '• Lock all entries (cannot be edited)\n' +
            '• Archive today\'s data\n' +
            '• Generate closing report\n\n' +
            'This action cannot be undone!'
        );

        if (!confirm) return;

        // Archive data
        this.archiveDayData();

        // Mark day as closed
        this.isDayClosed = true;
        localStorage.setItem('pos_day_closed', 'true');
        localStorage.setItem('pos_closing_date', new Date().toISOString());

        // Lock UI
        this.lockAllInputs();

        // Close modal
        this.closeDayCloseModal();

        // Show success
        this.showToast('✅ Day closed successfully! Data archived.', 'success');

        // Update UI
        this.updateDayStatus();

        // Generate report (if reports module available)
        if (typeof reportsManager !== 'undefined') {
            setTimeout(() => {
                reportsManager.generateDayClosingReport();
            }, 500);
        }
    }

    /**
     * Archive day data
     */
    archiveDayData() {
        const today = new Date().toISOString().split('T')[0];
        
        // Collect all data
        const archiveData = {
            date: today,
            closedAt: new Date().toISOString(),
            openingCash: parseFloat(document.getElementById('opening-cash')?.value || 0),
            openingDenominations: this.openingDenominations,
            debtors: typeof debtorsManager !== 'undefined' ? debtorsManager.debtors : [],
            collections: typeof collectionsManager !== 'undefined' ? collectionsManager.collections : [],
            expenses: typeof expensesManager !== 'undefined' ? expensesManager.expenses : [],
            calculations: this.getCalculationsSummary(),
            denominations: this.getClosingDenominations()
        };

        // Get existing archives
        const archives = JSON.parse(localStorage.getItem('pos_archives') || '[]');
        
        // Add today's archive
        archives.push(archiveData);

        // Keep only last 30 days
        if (archives.length > 30) {
            archives.shift();
        }

        // Save archives
        localStorage.setItem('pos_archives', JSON.stringify(archives));
    }

    /**
     * Get calculations summary
     */
    getCalculationsSummary() {
        if (typeof calculationsManager === 'undefined') return {};

        return {
            totalSale: calculationsManager.getTotalSale(),
            debitCash: calculationsManager.getDebitCash(),
            availableCash: calculationsManager.getAvailableCash(),
            netAmount: calculationsManager.getNetAmount(),
            kotakQR: calculationsManager.getKotakQR(),
            kotakSwipe: calculationsManager.getKotakSwipe(),
            debtors: calculationsManager.getDebtors(),
            bharatPE: calculationsManager.getBharatPE(),
            totalCollection: calculationsManager.getTotalCollection(),
            difference: calculationsManager.getDifference()
        };
    }

    /**
     * Get closing denominations
     */
    getClosingDenominations() {
        const denominations = {};
        const denomValues = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

        denomValues.forEach(denom => {
            const input = document.querySelector(`input[data-denomination="${denom}"][data-field="pieces"]`);
            if (input) {
                denominations[denom] = parseInt(input.value) || 0;
            }
        });

        return denominations;
    }

    /**
     * Lock all inputs
     */
    lockAllInputs() {
        // Lock all input fields
        const inputs = document.querySelectorAll('input:not([readonly])');
        inputs.forEach(input => {
            input.setAttribute('readonly', 'true');
            input.style.pointerEvents = 'none';
            input.style.opacity = '0.6';
        });

        // Disable all buttons except view/export
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.id.includes('export') && 
                !button.id.includes('report') && 
                !button.id.includes('view')) {
                button.disabled = true;
                button.style.opacity = '0.5';
            }
        });

        // Show locked banner
        this.showLockedBanner();
    }

    /**
     * Show locked banner
     */
    showLockedBanner() {
        const banner = document.createElement('div');
        banner.className = 'day-locked-banner';
        banner.innerHTML = `
            <i class="fas fa-lock"></i>
            <span>Day Closed - All entries are locked</span>
            <button onclick="dayManager.startNewDay()" class="btn btn-primary btn-sm">
                <i class="fas fa-plus"></i> Start New Day
            </button>
        `;
        
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(banner);
        }
    }

    /**
     * Start new day
     */
    startNewDay() {
        const confirm = window.confirm(
            '🌅 Start a new day?\n\n' +
            'This will:\n' +
            '• Clear all current data\n' +
            '• Reset counters\n' +
            '• Unlock all inputs\n\n' +
            'Previous day data is safely archived.'
        );

        if (!confirm) return;

        // Clear current data
        this.resetForNewDay();

        // Remove locked banner
        const banner = document.querySelector('.day-locked-banner');
        if (banner) banner.remove();

        // Show opening cash modal
        this.openDayStartModal();
    }

    /**
     * Reset for new day
     */
    resetForNewDay() {
        // Clear localStorage (keep archives)
        const archives = localStorage.getItem('pos_archives');
        localStorage.clear();
        if (archives) {
            localStorage.setItem('pos_archives', archives);
        }

        // Reset managers
        if (typeof debtorsManager !== 'undefined') {
            debtorsManager.debtors = [];
            debtorsManager.nextId = 1;
            debtorsManager.save();
        }

        if (typeof collectionsManager !== 'undefined') {
            collectionsManager.collections = [];
            collectionsManager.nextId = 1;
            collectionsManager.save();
        }

        if (typeof expensesManager !== 'undefined') {
            expensesManager.expenses = [];
            expensesManager.nextId = 1;
            expensesManager.save();
        }

        if (typeof serialManager !== 'undefined') {
            serialManager.reset();
        }

        // Unlock inputs
        const inputs = document.querySelectorAll('input[readonly]');
        inputs.forEach(input => {
            input.removeAttribute('readonly');
            input.style.pointerEvents = '';
            input.style.opacity = '';
            input.value = '';
        });

        // Enable buttons
        const buttons = document.querySelectorAll('button:disabled');
        buttons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '';
        });

        // Reset UI
        if (typeof modalHandlers !== 'undefined') {
            modalHandlers.initializeLists();
        }

        if (typeof calculationsManager !== 'undefined') {
            calculationsManager.updateAllDisplays();
        }

        // Reset flags
        this.isDayClosed = false;
        this.openingDenominations = {};
        this.currentDayData = null;
    }

    /**
     * Update day status display
     */
    updateDayStatus() {
        const statusElement = document.getElementById('day-status');
        if (statusElement) {
            if (this.isDayClosed) {
                statusElement.innerHTML = '<i class="fas fa-lock"></i> Day Closed';
                statusElement.className = 'day-status closed';
            } else {
                const today = new Date().toLocaleDateString();
                statusElement.innerHTML = `<i class="fas fa-calendar-day"></i> ${today}`;
                statusElement.className = 'day-status open';
            }
        }
    }

    /**
     * Check if day is closed
     */
    checkDayStatus() {
        const dayClosed = localStorage.getItem('pos_day_closed') === 'true';
        const closingDate = localStorage.getItem('pos_closing_date');
        
        if (dayClosed && closingDate) {
            const closedDate = new Date(closingDate).toDateString();
            const today = new Date().toDateString();
            
            // If closed date is today, keep locked
            if (closedDate === today) {
                this.isDayClosed = true;
                this.lockAllInputs();
                this.updateDayStatus();
            } else {
                // New day, prompt to start
                this.promptNewDay();
            }
        }
    }

    /**
     * Prompt to start new day
     */
    promptNewDay() {
        const confirm = window.confirm(
            '🌅 New Day Detected!\n\n' +
            'Would you like to start a new day?'
        );

        if (confirm) {
            this.startNewDay();
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
            statusBar.textContent = message;
            statusBar.className = `status-bar ${type}`;
            
            setTimeout(() => {
                statusBar.className = 'status-bar';
                statusBar.innerHTML = '<i class="fas fa-check-circle"></i><span>All changes saved</span>';
            }, 5000);
        }
    }

    /**
     * Initialize on page load
     */
    initialize() {
        this.checkDayStatus();
        this.updateDayStatus();
    }
}

// Export singleton instance
const dayManager = new DayManagementManager();
