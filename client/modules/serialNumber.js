/**
 * Serial Number Management Module
 * Handles auto-generation and validation for POS entries
 */

class SerialNumberManager {
    constructor() {
        this.currentSerial = 0;
        this.maxSerials = 150;
        this.usedSerials = new Set();
        this.serialMapping = {}; // Maps row index to serial number
    }

    /**
     * Get next available serial number
     * @returns {number|null} Next serial or null if limit reached
     */
    getNextSerial() {
        if (this.currentSerial >= this.maxSerials) {
            alert(`⚠️ Maximum ${this.maxSerials} bills reached for today!`);
            return null;
        }
        this.currentSerial++;
        this.usedSerials.add(this.currentSerial);
        return this.currentSerial;
    }

    /**
     * Check if serial number should be assigned based on payment mode
     * @param {string} paymentMode - Payment mode type
     * @returns {boolean}
     */
    shouldAssignSerial(paymentMode) {
        const noSerialModes = ['QR', 'SWIPE', 'KOTAK QR', 'KOTAK SWIPE'];
        return !noSerialModes.includes(paymentMode);
    }

    /**
     * Assign serial based on payment mode
     * @param {string} paymentMode
     * @param {number} rowIndex
     * @returns {number|string}
     */
    assignSerial(paymentMode, rowIndex) {
        if (!this.shouldAssignSerial(paymentMode)) {
            return ''; // Blank for QR/Swipe
        }
        
        // Check if this row already has a serial
        if (this.serialMapping[rowIndex]) {
            return this.serialMapping[rowIndex];
        }
        
        const serial = this.getNextSerial();
        if (serial !== null) {
            this.serialMapping[rowIndex] = serial;
        }
        return serial || '';
    }

    /**
     * Get serial for a specific row
     * @param {number} rowIndex
     * @returns {number|string}
     */
    getSerial(rowIndex) {
        return this.serialMapping[rowIndex] || '';
    }

    /**
     * Remove serial assignment for a row
     * @param {number} rowIndex
     */
    removeSerial(rowIndex) {
        const serial = this.serialMapping[rowIndex];
        if (serial) {
            this.usedSerials.delete(serial);
            delete this.serialMapping[rowIndex];
        }
    }

    /**
     * Reset counter for new day
     */
    reset() {
        this.currentSerial = 0;
        this.usedSerials.clear();
        this.serialMapping = {};
    }

    /**
     * Get current usage stats
     * @returns {object}
     */
    getStats() {
        return {
            current: this.currentSerial,
            max: this.maxSerials,
            remaining: this.maxSerials - this.currentSerial,
            percentage: (this.currentSerial / this.maxSerials * 100).toFixed(1)
        };
    }

    /**
     * Load existing serials from saved data
     * @param {object} serialData - Saved serial mapping
     */
    loadSerials(serialData) {
        if (!serialData) return;
        
        this.serialMapping = serialData.mapping || {};
        this.currentSerial = serialData.current || 0;
        this.usedSerials = new Set(serialData.used || []);
    }

    /**
     * Export serial data for saving
     * @returns {object}
     */
    exportData() {
        return {
            mapping: this.serialMapping,
            current: this.currentSerial,
            used: Array.from(this.usedSerials)
        };
    }
}

// Export singleton instance
const serialManager = new SerialNumberManager();
