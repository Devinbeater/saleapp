/**
 * Debtors Management Module
 * Handles party tracking and payment status
 */

class DebtorsManager {
    constructor() {
        this.debtors = [];
        this.nextId = 1;
    }

    /**
     * Add new debtor entry
     * @param {object} data - Debtor details
     * @returns {object} Created debtor
     */
    addDebtor(data) {
        const debtor = {
            id: this.nextId++,
            serialNo: data.serialNo,
            date: data.date || new Date().toISOString().split('T')[0],
            partyName: data.partyName,
            salesman: data.salesman || '',
            billNo: data.billNo || `B${String(this.nextId).padStart(4, '0')}`,
            amount: parseFloat(data.amount),
            status: 'Pending',
            collectedOn: null,
            collectionSerial: null,
            notes: data.notes || ''
        };

        this.debtors.push(debtor);
        this.save();
        return debtor;
    }

    /**
     * Get all pending debtors
     * @returns {array}
     */
    getPending() {
        return this.debtors.filter(d => d.status === 'Pending');
    }

    /**
     * Get all paid debtors
     * @returns {array}
     */
    getPaid() {
        return this.debtors.filter(d => d.status === 'Paid');
    }

    /**
     * Mark debtor as paid
     * @param {number} debtorId
     * @param {object} collectionData
     */
    markAsPaid(debtorId, collectionData) {
        const debtor = this.debtors.find(d => d.id === debtorId);
        if (debtor) {
            debtor.status = 'Paid';
            debtor.collectedOn = collectionData.date;
            debtor.collectionSerial = collectionData.serialNo;
            this.save();
        }
    }

    /**
     * Calculate total pending amount
     * @returns {number}
     */
    getTotalPending() {
        return this.getPending()
            .reduce((sum, d) => sum + d.amount, 0);
    }

    /**
     * Calculate total collected amount
     * @returns {number}
     */
    getTotalCollected() {
        return this.getPaid()
            .reduce((sum, d) => sum + d.amount, 0);
    }

    /**
     * Get count of pending debtors
     * @returns {number}
     */
    getPendingCount() {
        return this.getPending().length;
    }

    /**
     * Search debtors by name
     * @param {string} query
     * @returns {array}
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.debtors.filter(d => 
            d.partyName.toLowerCase().includes(lowerQuery) ||
            d.billNo.toLowerCase().includes(lowerQuery) ||
            d.salesman.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get debtor by ID
     * @param {number} id
     * @returns {object|null}
     */
    getById(id) {
        return this.debtors.find(d => d.id === id);
    }

    /**
     * Delete debtor (only if pending)
     * @param {number} id
     * @returns {boolean}
     */
    delete(id) {
        const index = this.debtors.findIndex(d => d.id === id);
        if (index !== -1 && this.debtors[index].status === 'Pending') {
            this.debtors.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Save to localStorage
     */
    save() {
        localStorage.setItem('pos_debtors', JSON.stringify(this.debtors));
        localStorage.setItem('pos_debtors_nextId', this.nextId);
    }

    /**
     * Load from localStorage
     */
    load() {
        const saved = localStorage.getItem('pos_debtors');
        if (saved) {
            this.debtors = JSON.parse(saved);
        }
        const savedId = localStorage.getItem('pos_debtors_nextId');
        if (savedId) {
            this.nextId = parseInt(savedId);
        }
    }

    /**
     * Export debtors data
     * @returns {string} CSV format
     */
    exportCSV() {
        const headers = ['Serial', 'Date', 'Party Name', 'Salesman', 'Bill No', 'Amount', 'Status', 'Collected On'];
        const rows = this.debtors.map(d => [
            d.serialNo,
            d.date,
            d.partyName,
            d.salesman,
            d.billNo,
            d.amount,
            d.status,
            d.collectedOn || '-'
        ]);
        
        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }

    /**
     * Get debtors for specific date
     * @param {string} date - YYYY-MM-DD format
     * @returns {array}
     */
    getByDate(date) {
        return this.debtors.filter(d => d.date === date);
    }
}

// Export singleton instance
const debtorsManager = new DebtorsManager();
debtorsManager.load();
