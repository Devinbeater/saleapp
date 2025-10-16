/**
 * Enhanced Calculations Module
 * Implements correct formulas as per SRS and cashier sheet image
 */

class CalculationsManager {
    constructor() {
        this.openingCash = 0;
        this.bharatpe = 0;
    }

    /**
     * Get opening cash
     * @returns {number}
     */
    getOpeningCash() {
        const input = document.getElementById('opening-cash');
        return parseFloat(input?.value || 0);
    }

    /**
     * Get total sale from POS entries
     * @returns {number}
     */
    getTotalSale() {
        let total = 0;
        const inputs = document.querySelectorAll('input[data-section="POS"][data-field-type="AMOUNT"]');
        inputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            if (value > 0) {
                total += value;
            }
        });
        return total;
    }

    /**
     * Get total expenses
     * @returns {number}
     */
    getTotalExpenses() {
        return typeof expensesManager !== 'undefined' ? expensesManager.getTotalExpenses() : 0;
    }

    /**
     * Get total collections
     * @returns {number}
     */
    getTotalCollections() {
        return typeof collectionsManager !== 'undefined' ? collectionsManager.getTodayTotal() : 0;
    }

    /**
     * Get collections count
     * @returns {number}
     */
    getCollectionsCount() {
        return typeof collectionsManager !== 'undefined' ? collectionsManager.getTodayCount() : 0;
    }

    /**
     * Calculate Debit Cash
     * Formula: Opening Cash + Total Sale
     * @returns {number}
     */
    getDebitCash() {
        return this.getOpeningCash() + this.getTotalSale();
    }

    /**
     * Calculate Available Cash (after expenses)
     * Formula: Debit Cash - Total Expenses
     * @returns {number}
     */
    getAvailableCash() {
        return this.getDebitCash() - this.getTotalExpenses();
    }

    /**
     * Get QR total
     * @returns {number}
     */
    getQR() {
        let total = 0;
        const inputs = document.querySelectorAll('input[data-section="KQR"][data-field-type="AMOUNT"]');
        inputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            if (value > 0) {
                total += value;
            }
        });
        return total;
    }

    /**
     * Get Swipe total
     * @returns {number}
     */
    getSwipe() {
        let total = 0;
        const inputs = document.querySelectorAll('input[data-section="KSW"][data-field-type="AMOUNT"]');
        inputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            if (value > 0) {
                total += value;
            }
        });
        return total;
    }

    /**
     * Get Swipe count
     * @returns {number}
     */
    getSwipeCount() {
        let count = 0;
        const inputs = document.querySelectorAll('input[data-section="KSW"][data-field-type="AMOUNT"]');
        inputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            if (value > 0) {
                count++;
            }
        });
        return count;
    }

    /**
     * Get Debtors total (pending)
     * @returns {number}
     */
    getDebtors() {
        let total = 0;
        const inputs = document.querySelectorAll('input[data-section="DEBTOR"][data-field-type="AMOUNT"]');
        inputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            if (value > 0) {
                total += value;
            }
        });
        return total;
    }

    /**
     * Get Debtors count
     * @returns {number}
     */
    getDebtorsCount() {
        let count = 0;
        const inputs = document.querySelectorAll('input[data-section="DEBTOR"][data-field-type="AMOUNT"]');
        inputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            if (value > 0) {
                count++;
            }
        });
        return count;
    }

    /**
     * Get Total QR Sale (sum of all QR amounts)
     * @returns {number}
     */
    getTotalQRSale() {
        return this.getQR();
    }

    /**
     * Get denomination total
     * @returns {number}
     */
    getDenominationTotal() {
        const totalElement = document.getElementById('total-cash');
        return parseFloat(totalElement?.textContent || 0);
    }

    /**
     * Calculate Net Amount
     * Formula: Debit Cash - (QR + Swipe + Debtors)
     * @returns {number}
     */
    getNetAmount() {
        const debitCash = this.getDebitCash();
        const qr = this.getQR();
        const swipe = this.getSwipe();
        const debtors = this.getDebtors();
        
        return debitCash - (qr + swipe + debtors);
    }

    /**
     * Calculate Total Collection
     * Formula: Denominations + QR + Swipe + Collections
     * @returns {number}
     */
    getTotalCollection() {
        const denominations = this.getDenominationTotal();
        const qr = this.getQR();
        const swipe = this.getSwipe();
        const collections = this.getTotalCollections();
        
        return denominations + qr + swipe + collections;
    }

    /**
     * Calculate Difference (CRITICAL FORMULA)
     * Formula: Net Amount - Denominations
     * @returns {number}
     */
    getDifference() {
        const netAmount = this.getNetAmount();
        const denominations = this.getDenominationTotal();
        return netAmount - denominations;
    }

    /**
     * Update all displays
     */
    updateAllDisplays() {
        // Total Sale
        const totalSale = this.getTotalSale();
        this.updateDisplay('total-sale', totalSale);

        // Debit Cash
        const debitCash = this.getDebitCash();
        this.updateDisplay('debit-cash', debitCash);

        // Net Amount
        const netAmount = this.getNetAmount();
        this.updateDisplay('net-amount', netAmount);

        // SWIPE (with count)
        const swipeTotal = this.getSwipe();
        const swipeCount = this.getSwipeCount();
        this.updateDisplay('swipe-total', swipeTotal, swipeCount);

        // DEBTORS (with count)
        const debtorsTotal = this.getDebtors();
        const debtorsCount = this.getDebtorsCount();
        this.updateDisplay('debtors-total', debtorsTotal, debtorsCount);

        // Total QR Sale
        const totalQRSale = this.getTotalQRSale();
        this.updateDisplay('total-qr-sale', totalQRSale);
        
        // Collection (with count)
        const collectionTotal = this.getTotalCollections();
        const collectionCount = this.getCollectionsCount();
        this.updateDisplay('collection-total', collectionTotal, collectionCount);

        // Difference (highlight if not zero)
        const difference = this.getDifference();
        this.updateDisplay('difference', difference);
        this.highlightDifference(difference);
    }

    /**
     * Update display element
     * @param {string} elementId
     * @param {number} value
     * @param {number} count - Optional count to display
     */
    updateDisplay(elementId, value, count = null) {
        const element = document.getElementById(elementId);
        if (element) {
            if (count !== null) {
                element.textContent = `${count} (${value.toFixed(2)})`;
            } else {
                element.textContent = value.toFixed(2);
            }
        }
    }

    /**
     * Highlight difference if not zero
     * @param {number} difference
     */
    highlightDifference(difference) {
        const element = document.getElementById('difference');
        if (element) {
            if (Math.abs(difference) > 0.01) {
                element.style.color = '#ef4444';
                element.style.fontWeight = 'bold';
            } else {
                element.style.color = '';
                element.style.fontWeight = '';
            }
        }
    }

    /**
     * Format currency
     * @param {number} value
     * @returns {string}
     */
    formatCurrency(value) {
        return `₹${value.toFixed(2)}`;
    }
}

// Export singleton instance
const calculationsManager = new CalculationsManager();
