/**
 * API Client for Daily Sheet Manager
 * Handles all communication with the backend API
 */

class APIClient {
    constructor() {
        this.baseURL = '/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    /**
     * Generic HTTP request method
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.defaultHeaders,
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Sheets API
     */
    async createOrGetSheet(date = null) {
        const body = date ? { date } : {};
        return await this.request('/sheets', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async getSheet(date) {
        return await this.request(`/sheets/${date}`);
    }

    async updateSheetNote(sheetId, note) {
        return await this.request(`/sheets/${sheetId}`, {
            method: 'PUT',
            body: JSON.stringify({ sheet_note: note }),
        });
    }

    /**
     * Entries API
     */
    async saveEntries(sheetId, entries) {
        return await this.request('/entries', {
            method: 'POST',
            body: JSON.stringify({ sheetId, entries }),
        });
    }

    async getEntries(sheetId) {
        return await this.request(`/entries/${sheetId}`);
    }

    async deleteEntries(sheetId) {
        return await this.request(`/entries/${sheetId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Denominations API
     */
    async saveDenominations(sheetId, denominations) {
        return await this.request('/denominations', {
            method: 'POST',
            body: JSON.stringify({ sheetId, denominations }),
        });
    }

    async getDenominations(sheetId) {
        return await this.request(`/denominations/${sheetId}`);
    }

    async deleteDenominations(sheetId) {
        return await this.request(`/denominations/${sheetId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Reports API
     */
    async generateReport(sheetId) {
        return await this.request(`/reports/${sheetId}`);
    }

    /**
     * Health check
     */
    async healthCheck() {
        return await this.request('/health');
    }
}

// Create and export a singleton instance
const apiClient = new APIClient();
window.apiClient = apiClient;
