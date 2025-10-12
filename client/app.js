/**
 * Main Application Entry Point
 * Daily Sheet Manager v1.1.0
 */

class DailySheetManager {
    constructor() {
        this.isInitialized = false;
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing Daily Sheet Manager...');
            
            // Set initial theme
            this.applyTheme(this.currentTheme);
            
            // Initialize formula engine
            const formulaInitialized = formulaEngine.initialize();
            if (!formulaInitialized) {
                console.warn('HyperFormula initialization failed, continuing without advanced formulas');
                // Continue without throwing error - basic functionality should still work
            }
            
            // Initialize persistence system
            persistenceManager.initialize();
            
            // Initialize UI
            await uiManager.initialize();
            
            // Set up global error handling
            this.setupErrorHandling();
            
            // Set up service worker (if available)
            this.setupServiceWorker();
            
            this.isInitialized = true;
            console.log('Daily Sheet Manager initialized successfully');
            
            // Show welcome message for first-time users
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Apply theme
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // Update theme toggle state
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = theme === 'dark';
        }
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showErrorMessage('An unexpected error occurred. Please try again.');
            event.preventDefault();
        });

        // Handle general errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showErrorMessage('An error occurred. Please refresh the page if the issue persists.');
        });
    }

    /**
     * Setup service worker for offline functionality
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    /**
     * Show welcome message for first-time users
     */
    showWelcomeMessage() {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        
        if (!hasSeenWelcome) {
            setTimeout(() => {
                this.showInfoMessage(
                    'Welcome to Daily Sheet Manager! Press Ctrl+/ for keyboard shortcuts and help.',
                    5000
                );
                localStorage.setItem('hasSeenWelcome', 'true');
            }, 1000);
        }
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Show info message
     */
    showInfoMessage(message, duration = 3000) {
        this.showMessage(message, 'info', duration);
    }

    /**
     * Show message with toast notification
     */
    showMessage(message, type = 'info', duration = 3000) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getIconForType(type)}"></i>
                <span>${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

        // Add styles if not already added
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--spacing-2);
                    padding: var(--spacing-3);
                    box-shadow: var(--shadow-lg);
                    z-index: 10000;
                    max-width: 400px;
                    animation: slideIn 0.3s ease-out;
                }
                
                .toast-success {
                    border-left: 4px solid var(--success-color);
                }
                
                .toast-error {
                    border-left: 4px solid var(--error-color);
                }
                
                .toast-info {
                    border-left: 4px solid var(--primary-color);
                }
                
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                }
                
                .toast-close {
                    background: none;
                    border: none;
                    font-size: var(--font-size-lg);
                    cursor: pointer;
                    margin-left: auto;
                    color: var(--text-muted);
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        // Auto-remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    /**
     * Remove toast notification
     */
    removeToast(toast) {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Get icon for message type
     */
    getIconForType(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Check application health
     */
    async checkHealth() {
        try {
            const health = await apiClient.healthCheck();
            console.log('Application health check:', health);
            return true;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }

    /**
     * Get application statistics
     */
    getStats() {
        const stats = {
            initialized: this.isInitialized,
            currentDate: uiManager.currentDate,
            sheetId: uiManager.currentSheetId,
            theme: this.currentTheme,
            formulaEngineReady: formulaEngine.isInitialized,
            persistenceReady: persistenceManager !== null,
            keyboardShortcutsReady: keyboardShortcuts !== null,
            exportUtilsReady: exportUtils !== null,
            validationReady: validationManager !== null
        };

        return stats;
    }

    /**
     * Reset application state
     */
    reset() {
        try {
            // Clear formula engine
            formulaEngine.clear();
            
            // Clear UI
            uiManager.clearCurrentData();
            
            // Clear persistence
            persistenceManager.clearDraft(uiManager.currentDate);
            
            console.log('Application state reset');
            this.showSuccessMessage('Application reset successfully');
        } catch (error) {
            console.error('Error resetting application:', error);
            this.showErrorMessage('Error resetting application');
        }
    }

    /**
     * Export application data
     */
    async exportData() {
        try {
            const data = persistenceManager.exportSheetData();
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `dailysheet_backup_${uiManager.currentDate}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            this.showSuccessMessage('Data exported successfully');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showErrorMessage('Error exporting data');
        }
    }

    /**
     * Import application data
     */
    async importData(file) {
        try {
            const success = await exportUtils.importFromFile(file);
            if (success) {
                this.showSuccessMessage('Data imported successfully');
            } else {
                this.showErrorMessage('Failed to import data');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            this.showErrorMessage('Error importing data');
        }
    }
}

// Global application instance
let app;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new DailySheetManager();
    window.dailySheetManager = app;
});

// Export for global access
window.DailySheetManager = DailySheetManager;

// Add slideOut animation
const slideOutCSS = `
@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;

const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = slideOutCSS;
document.head.appendChild(slideOutStyle);
