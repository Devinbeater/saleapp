/**
 * Persistence Module for Daily Sheet Manager
 * Handles localStorage autosave and backend synchronization
 */

class PersistenceManager {
    constructor() {
        this.autosaveInterval = null;
        this.changeTimeout = null;
        this.lastSavedState = null;
        this.isAutoSaving = false;
        this.changeDetectionDelay = 2000; // 2 seconds
        this.forcedSaveInterval = 300000; // 5 minutes
    }

    /**
     * Initialize persistence system
     */
    initialize() {
        this.startAutoSave();
        this.startForcedSave();
        console.log('Persistence system initialized');
    }

    /**
     * Start autosave system
     */
    startAutoSave() {
        // Listen for changes
        document.addEventListener('cellValueChanged', () => {
            this.scheduleAutoSave();
        });

        // Listen for input changes
        document.addEventListener('input', (event) => {
            if (event.target.matches('input[data-cell-key], input[data-field="pieces"]')) {
                this.scheduleAutoSave();
            }
        });
    }

    /**
     * Start forced save interval
     */
    startForcedSave() {
        this.autosaveInterval = setInterval(() => {
            this.forcedAutoSave();
        }, this.forcedSaveInterval);
    }

    /**
     * Schedule autosave with debouncing
     */
    scheduleAutoSave() {
        clearTimeout(this.changeTimeout);
        this.changeTimeout = setTimeout(() => {
            this.performAutoSave();
        }, this.changeDetectionDelay);
    }

    /**
     * Perform autosave to localStorage
     */
    async performAutoSave() {
        if (this.isAutoSaving) return;

        try {
            this.isAutoSaving = true;
            const sheetState = this.collectSheetState();
            
            if (this.hasStateChanged(sheetState)) {
                await this.saveDraftToLocalStorage(sheetState);
                this.lastSavedState = JSON.stringify(sheetState);
                console.log('Autosaved to localStorage');
            }
        } catch (error) {
            console.error('Error during autosave:', error);
        } finally {
            this.isAutoSaving = false;
        }
    }

    /**
     * Forced autosave (every 5 minutes)
     */
    async forcedAutoSave() {
        await this.performAutoSave();
    }

    /**
     * Collect current sheet state
     */
    collectSheetState() {
        const state = {
            date: uiManager.currentDate,
            sheetId: uiManager.currentSheetId,
            entries: {},
            denominations: {},
            timestamp: Date.now()
        };

        // Collect entries
        const entryInputs = document.querySelectorAll('input[data-cell-key]');
        entryInputs.forEach(input => {
            const cellKey = input.dataset.cellKey;
            const value = input.value.trim();
            if (value) {
                state.entries[cellKey] = {
                    rawValue: value,
                    calculatedValue: formulaEngine.getCalculatedValue(cellKey)
                };
            }
        });

        // Collect denominations
        const denominationInputs = document.querySelectorAll('input[data-denomination][data-field="pieces"]');
        denominationInputs.forEach(input => {
            const denomination = input.dataset.denomination;
            const pieces = parseInt(input.value) || 0;
            if (pieces > 0) {
                state.denominations[denomination] = {
                    pieces,
                    amount: denomination * pieces
                };
            }
        });

        return state;
    }

    /**
     * Check if state has changed
     */
    hasStateChanged(newState) {
        const newStateString = JSON.stringify(newState);
        return newStateString !== this.lastSavedState;
    }

    /**
     * Save draft to localStorage
     */
    async saveDraftToLocalStorage(sheetState) {
        try {
            const key = this.getDraftKey(sheetState.date);
            const draftData = {
                ...sheetState,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem(key, JSON.stringify(draftData));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    /**
     * Load draft from localStorage
     */
    loadDraftFromLocalStorage(date) {
        try {
            const key = this.getDraftKey(date);
            const draftData = localStorage.getItem(key);
            
            if (draftData) {
                return JSON.parse(draftData);
            }
            return null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    /**
     * Get draft key for localStorage
     */
    getDraftKey(date) {
        return `dailysheet-${date}-draft`;
    }

    /**
     * Clear draft from localStorage
     */
    clearDraft(date) {
        try {
            const key = this.getDraftKey(date);
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error clearing draft:', error);
            return false;
        }
    }

    /**
     * Save to backend
     */
    async saveToBackend(sheetId, entries, denominations) {
        try {
            await Promise.all([
                apiClient.saveEntries(sheetId, entries),
                apiClient.saveDenominations(sheetId, denominations)
            ]);
            
            // Clear draft after successful backend save
            this.clearDraft(uiManager.currentDate);
            
            return true;
        } catch (error) {
            console.error('Error saving to backend:', error);
            throw error;
        }
    }

    /**
     * Load sheet with priority: Backend > localStorage draft > blank
     */
    async loadSheet(date) {
        try {
            // Try to get sheet from backend
            let sheet;
            try {
                sheet = await apiClient.getSheet(date);
            } catch (error) {
                // Sheet doesn't exist, create it
                sheet = await apiClient.createOrGetSheet(date);
            }

            // Load data from backend
            const [entries, denominations] = await Promise.all([
                apiClient.getEntries(sheet.sheetId).catch(() => []),
                apiClient.getDenominations(sheet.sheetId).catch(() => [])
            ]);

            // If no backend data, check for localStorage draft
            if (entries.length === 0 && denominations.length === 0) {
                const draft = this.loadDraftFromLocalStorage(date);
                if (draft) {
                    console.log('Loading from localStorage draft');
                    this.loadDraftData(draft);
                    return { sheet, isDraft: true };
                }
            }

            // Load backend data
            this.loadBackendData(entries, denominations);
            return { sheet, isDraft: false };

        } catch (error) {
            console.error('Error loading sheet:', error);
            throw error;
        }
    }

    /**
     * Load backend data
     */
    loadBackendData(entries, denominations) {
        // Load entries into formula engine
        formulaEngine.loadFromEntries(entries);

        // Load denominations into UI
        uiManager.loadDenominations(denominations);
    }

    /**
     * Load draft data
     */
    loadDraftData(draft) {
        // Load entries
        Object.entries(draft.entries).forEach(([cellKey, data]) => {
            formulaEngine.updateCell(cellKey, data.rawValue);
        });

        // Load denominations
        Object.entries(draft.denominations).forEach(([denomination, data]) => {
            const piecesInput = document.querySelector(`input[data-denomination="${denomination}"][data-field="pieces"]`);
            if (piecesInput) {
                piecesInput.value = data.pieces.toString();
            }
        });

        uiManager.updateTotalCash();
    }

    /**
     * Get all drafts from localStorage
     */
    getAllDrafts() {
        const drafts = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('dailysheet-') && key.endsWith('-draft')) {
                try {
                    const draftData = JSON.parse(localStorage.getItem(key));
                    drafts.push({
                        date: draftData.date,
                        savedAt: draftData.savedAt,
                        key: key
                    });
                } catch (error) {
                    console.error('Error parsing draft:', error);
                }
            }
        }
        
        return drafts.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    }

    /**
     * Clean up old drafts (older than 7 days)
     */
    cleanupOldDrafts() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const drafts = this.getAllDrafts();
        drafts.forEach(draft => {
            const draftDate = new Date(draft.savedAt);
            if (draftDate < sevenDaysAgo) {
                localStorage.removeItem(draft.key);
                console.log(`Cleaned up old draft: ${draft.date}`);
            }
        });
    }

    /**
     * Export sheet data
     */
    exportSheetData() {
        const sheetState = this.collectSheetState();
        return {
            ...sheetState,
            exportedAt: new Date().toISOString(),
            version: '1.1.0'
        };
    }

    /**
     * Import sheet data
     */
    importSheetData(data) {
        try {
            // Validate data structure
            if (!data.entries || !data.denominations) {
                throw new Error('Invalid data format');
            }

            // Clear current data
            this.clearCurrentData();

            // Load imported data
            Object.entries(data.entries).forEach(([cellKey, entryData]) => {
                formulaEngine.updateCell(cellKey, entryData.rawValue);
            });

            Object.entries(data.denominations).forEach(([denomination, denomData]) => {
                const piecesInput = document.querySelector(`input[data-denomination="${denomination}"][data-field="pieces"]`);
                if (piecesInput) {
                    piecesInput.value = denomData.pieces.toString();
                }
            });

            uiManager.updateTotalCash();
            uiManager.showStatus('Data imported successfully', 'success');

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            uiManager.showStatus('Error importing data', 'error');
            return false;
        }
    }

    /**
     * Clear current data
     */
    clearCurrentData() {
        // Clear formula engine
        formulaEngine.clear();

        // Clear input fields
        const inputs = document.querySelectorAll('input[data-cell-key], input[data-field="pieces"]');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('calculated', 'formula-cell');
        });

        // Clear calculated fields
        uiManager.updateCalculatedField('total-sale', '0');
        uiManager.updateCalculatedField('net-amount', '0');
        uiManager.updateTotalCash();
    }

    /**
     * Cleanup on page unload
     */
    cleanup() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
        }
        
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }

        // Perform final save
        this.performAutoSave();
    }
}

// Create and export a singleton instance
const persistenceManager = new PersistenceManager();
window.persistenceManager = persistenceManager;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    persistenceManager.cleanup();
});
