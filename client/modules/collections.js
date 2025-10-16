/**
 * Collections Management Module
 * Handles debtor payment recording
 */

class CollectionsManager {
    constructor() {
        this.collections = [];
        this.nextId = 1;
    }

    /**
     * Record new collection
     * @param {object} data - Collection details
     * @returns {object} Created collection
     */
    addCollection(data) {
        const collection = {
            id: this.nextId++,
            collectionDate: data.date || new Date().toISOString().split('T')[0],
            serialNo: data.serialNo,
            debtorId: data.debtorId,
            partyName: data.partyName,
            salesman: data.salesman || '',
            billNo: data.billNo,
            amount: parseFloat(data.amount),
            paymentMode: data.paymentMode || 'Cash',
            notes: data.notes || ''
        };

        this.collections.push(collection);
        
        // Update debtor status if debtorsManager is available
        if (typeof debtorsManager !== 'undefined' && data.debtorId) {
            debtorsManager.markAsPaid(data.debtorId, {
                date: collection.collectionDate,
                serialNo: collection.serialNo
            });
        }

        this.save();
        return collection;
    }

    /**
     * Get collections for a specific date
     * @param {string} date - YYYY-MM-DD format
     * @returns {array}
     */
    getByDate(date) {
        return this.collections.filter(c => c.collectionDate === date);
    }

    /**
     * Get total collections for today
     * @returns {number}
     */
    getTodayTotal() {
        const today = new Date().toISOString().split('T')[0];
        return this.getByDate(today)
            .reduce((sum, c) => sum + c.amount, 0);
    }

    /**
     * Get count of collections for today
     * @returns {number}
     */
    getTodayCount() {
        const today = new Date().toISOString().split('T')[0];
        return this.getByDate(today).length;
    }

    /**
     * Get total collections (all time)
     * @returns {number}
     */
    getTotalCollections() {
        return this.collections
            .reduce((sum, c) => sum + c.amount, 0);
    }

    /**
     * Get collection by debtor
     * @param {number} debtorId
     * @returns {object|null}
     */
    getByDebtorId(debtorId) {
        return this.collections.find(c => c.debtorId === debtorId);
    }

    /**
     * Delete collection
     * @param {number} id
     * @returns {boolean}
     */
    delete(id) {
        const index = this.collections.findIndex(c => c.id === id);
        if (index !== -1) {
            this.collections.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Save to localStorage
     */
    save() {
        localStorage.setItem('pos_collections', JSON.stringify(this.collections));
        localStorage.setItem('pos_collections_nextId', this.nextId);
    }

    /**
     * Load from localStorage
     */
    load() {
        const saved = localStorage.getItem('pos_collections');
        if (saved) {
            this.collections = JSON.parse(saved);
        }
        const savedId = localStorage.getItem('pos_collections_nextId');
        if (savedId) {
            this.nextId = parseInt(savedId);
        }
    }

    /**
     * Export collections data
     * @returns {string} CSV format
     */
    exportCSV() {
        const headers = ['Collection Date', 'Serial', 'Party Name', 'Salesman', 'Bill No', 'Amount', 'Payment Mode'];
        const rows = this.collections.map(c => [
            c.collectionDate,
            c.serialNo,
            c.partyName,
            c.salesman,
            c.billNo,
            c.amount,
            c.paymentMode
        ]);
        
        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }
}

// Export singleton instance
const collectionsManager = new CollectionsManager();
collectionsManager.load();
