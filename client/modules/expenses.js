/**
 * Expenses Management Module
 * Handles shop expense tracking (Debit Cash)
 */

class ExpensesManager {
    constructor() {
        this.expenses = [];
        this.nextId = 1;
    }

    /**
     * Add new expense
     * @param {object} data - Expense details
     * @returns {object|null} Created expense or null if validation fails
     */
    addExpense(data) {
        const amount = parseFloat(data.amount);

        const expense = {
            id: this.nextId++,
            date: data.date || new Date().toISOString().split('T')[0],
            time: data.time || new Date().toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            purpose: data.purpose,
            amount: amount,
            category: data.category || 'General',
            notes: data.notes || ''
        };

        this.expenses.push(expense);
        this.save();
        
        return expense;
    }

    /**
     * Get total expenses for today
     * @returns {number}
     */
    getTotalExpenses() {
        const today = new Date().toISOString().split('T')[0];
        return this.expenses
            .filter(e => e.date === today)
            .reduce((sum, e) => sum + e.amount, 0);
    }

    /**
     * Get expenses by date
     * @param {string} date - YYYY-MM-DD format
     * @returns {array}
     */
    getByDate(date) {
        return this.expenses.filter(e => e.date === date);
    }

    /**
     * Get expenses by category
     * @param {string} category
     * @returns {array}
     */
    getByCategory(category) {
        return this.expenses.filter(e => e.category === category);
    }

    /**
     * Delete expense
     * @param {number} id
     * @returns {boolean}
     */
    delete(id) {
        const index = this.expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            this.expenses.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Save to localStorage
     */
    save() {
        localStorage.setItem('pos_expenses', JSON.stringify(this.expenses));
        localStorage.setItem('pos_expenses_nextId', this.nextId);
    }

    /**
     * Load from localStorage
     */
    load() {
        const saved = localStorage.getItem('pos_expenses');
        if (saved) {
            this.expenses = JSON.parse(saved);
        }
        const savedId = localStorage.getItem('pos_expenses_nextId');
        if (savedId) {
            this.nextId = parseInt(savedId);
        }
    }

    /**
     * Export expenses data
     * @returns {string} CSV format
     */
    exportCSV() {
        const headers = ['Date', 'Time', 'Purpose', 'Category', 'Amount'];
        const rows = this.expenses.map(e => [
            e.date,
            e.time,
            e.purpose,
            e.category,
            e.amount
        ]);
        
        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }
}

// Export singleton instance
const expensesManager = new ExpensesManager();
expensesManager.load();
