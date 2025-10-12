/**
 * Validation Module for Daily Sheet Manager
 * Handles input validation and data integrity checks
 */

class ValidationManager {
    constructor() {
        this.validationRules = {
            amount: {
                pattern: /^-?\d+(\.\d{1,2})?$/,
                message: 'Please enter a valid amount (e.g., 123.45)'
            },
            pieces: {
                pattern: /^\d+$/,
                message: 'Please enter a valid number of pieces (positive integer)'
            },
            formula: {
                pattern: /^=.*$/,
                message: 'Formula must start with ='
            },
            cellKey: {
                pattern: /^[A-Z_]+_\d+$/,
                message: 'Invalid cell key format'
            }
        };
    }

    /**
     * Validate input value
     */
    validateInput(value, type, fieldName = '') {
        if (!value && value !== 0) {
            return { isValid: true, message: '' }; // Empty values are allowed
        }

        const rule = this.validationRules[type];
        if (!rule) {
            return { isValid: true, message: '' };
        }

        const isValid = rule.pattern.test(value.toString());
        const message = isValid ? '' : rule.message;

        return { isValid, message };
    }

    /**
     * Validate cell input
     */
    validateCellInput(value, cellKey) {
        if (!value || value.trim() === '') {
            return { isValid: true, message: '' };
        }

        const trimmedValue = value.trim();

        // Check if it's a formula
        if (trimmedValue.startsWith('=')) {
            return this.validateFormula(trimmedValue, cellKey);
        }

        // Check if it's a numeric value
        return this.validateNumericValue(trimmedValue, cellKey);
    }

    /**
     * Validate formula
     */
    validateFormula(formula, cellKey) {
        try {
            // Basic formula validation
            if (!formula.startsWith('=')) {
                return { isValid: false, message: 'Formula must start with =' };
            }

            // Check for balanced parentheses
            const openParens = (formula.match(/\(/g) || []).length;
            const closeParens = (formula.match(/\)/g) || []).length;
            
            if (openParens !== closeParens) {
                return { isValid: false, message: 'Unbalanced parentheses in formula' };
            }

            // Check for valid function names
            const functionPattern = /[A-Z][A-Z0-9]*\(/g;
            const matches = formula.match(functionPattern);
            
            if (matches) {
                const validFunctions = ['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN', 'IF', 'AND', 'OR'];
                for (const match of matches) {
                    const functionName = match.slice(0, -1);
                    if (!validFunctions.includes(functionName)) {
                        return { 
                            isValid: false, 
                            message: `Unknown function: ${functionName}` 
                        };
                    }
                }
            }

            // Check for valid cell references
            const cellRefPattern = /[A-Z_]+_\d+/g;
            const cellRefs = formula.match(cellRefPattern);
            
            if (cellRefs) {
                for (const ref of cellRefs) {
                    if (!this.isValidCellReference(ref)) {
                        return { 
                            isValid: false, 
                            message: `Invalid cell reference: ${ref}` 
                        };
                    }
                }
            }

            return { isValid: true, message: '' };

        } catch (error) {
            return { 
                isValid: false, 
                message: 'Invalid formula syntax' 
            };
        }
    }

    /**
     * Validate numeric value
     */
    validateNumericValue(value, cellKey) {
        // Check if it's a valid number
        const numericValue = parseFloat(value);
        
        if (isNaN(numericValue)) {
            return { 
                isValid: false, 
                message: 'Please enter a valid number' 
            };
        }

        // Check for reasonable range
        if (Math.abs(numericValue) > 999999999) {
            return { 
                isValid: false, 
                message: 'Amount too large (max: 999,999,999)' 
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate denomination input
     */
    validateDenominationInput(value, denomination) {
        if (!value && value !== 0) {
            return { isValid: true, message: '' };
        }

        const numericValue = parseInt(value);
        
        if (isNaN(numericValue)) {
            return { 
                isValid: false, 
                message: 'Please enter a valid number' 
            };
        }

        if (numericValue < 0) {
            return { 
                isValid: false, 
                message: 'Number of pieces cannot be negative' 
            };
        }

        if (numericValue > 999999) {
            return { 
                isValid: false, 
                message: 'Number too large (max: 999,999)' 
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Check if cell reference is valid
     */
    isValidCellReference(cellRef) {
        const sections = ['POS', 'KQR', 'KSW', 'DEBTOR'];
        const parts = cellRef.split('_');
        
        if (parts.length < 2) {
            return false;
        }

        const section = parts[0];
        if (!sections.includes(section)) {
            return false;
        }

        const rowIndex = parseInt(parts[parts.length - 1]);
        if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= 25) {
            return false;
        }

        return true;
    }

    /**
     * Validate sheet data before save
     */
    validateSheetData(entries, denominations) {
        const errors = [];

        // Validate entries
        if (entries && Array.isArray(entries)) {
            entries.forEach((entry, index) => {
                const entryErrors = this.validateEntry(entry);
                if (entryErrors.length > 0) {
                    errors.push(`Entry ${index + 1}: ${entryErrors.join(', ')}`);
                }
            });
        }

        // Validate denominations
        if (denominations && Array.isArray(denominations)) {
            denominations.forEach((denom, index) => {
                const denomErrors = this.validateDenomination(denom);
                if (denomErrors.length > 0) {
                    errors.push(`Denomination ${index + 1}: ${denomErrors.join(', ')}`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate individual entry
     */
    validateEntry(entry) {
        const errors = [];

        if (!entry.section) {
            errors.push('Section is required');
        } else if (!['POS', 'KQR', 'KSW', 'DEBTOR'].includes(entry.section)) {
            errors.push('Invalid section');
        }

        if (typeof entry.row_idx !== 'number' || entry.row_idx < 0 || entry.row_idx >= 25) {
            errors.push('Invalid row index');
        }

        if (!entry.cell_key || !this.isValidCellReference(entry.cell_key)) {
            errors.push('Invalid cell key');
        }

        if (entry.raw_value) {
            const cellValidation = this.validateCellInput(entry.raw_value, entry.cell_key);
            if (!cellValidation.isValid) {
                errors.push(cellValidation.message);
            }
        }

        return errors;
    }

    /**
     * Validate individual denomination
     */
    validateDenomination(denom) {
        const errors = [];

        if (typeof denom.denomination_value !== 'number') {
            errors.push('Denomination value must be a number');
        }

        if (typeof denom.pieces !== 'number' || denom.pieces < 0) {
            errors.push('Pieces must be a non-negative number');
        }

        if (typeof denom.calculated_amount !== 'number' || denom.calculated_amount < 0) {
            errors.push('Calculated amount must be a non-negative number');
        }

        // Check if calculated amount matches pieces * denomination
        const expectedAmount = denom.denomination_value * denom.pieces;
        if (Math.abs(denom.calculated_amount - expectedAmount) > 0.01) {
            errors.push('Calculated amount does not match pieces × denomination');
        }

        return errors;
    }

    /**
     * Show validation error
     */
    showValidationError(element, message) {
        // Remove existing error
        this.clearValidationError(element);

        // Add error styling
        element.classList.add('validation-error');
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error-message';
        errorDiv.textContent = message;
        
        // Insert error message after element
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.clearValidationError(element);
        }, 5000);
    }

    /**
     * Clear validation error
     */
    clearValidationError(element) {
        element.classList.remove('validation-error');
        
        const errorMessage = element.parentNode.querySelector('.validation-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    /**
     * Validate and show real-time feedback
     */
    validateWithFeedback(element, value, type, fieldName = '') {
        const validation = this.validateInput(value, type, fieldName);
        
        if (!validation.isValid) {
            this.showValidationError(element, validation.message);
            return false;
        } else {
            this.clearValidationError(element);
            return true;
        }
    }

    /**
     * Sanitize input value
     */
    sanitizeInput(value) {
        if (typeof value !== 'string') {
            return value;
        }

        // Remove potentially dangerous characters
        return value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }

    /**
     * Format number for display
     */
    formatNumber(value, decimals = 2) {
        const num = parseFloat(value);
        if (isNaN(num)) {
            return '0';
        }
        
        return num.toFixed(decimals);
    }

    /**
     * Parse and validate date
     */
    validateDate(dateString) {
        if (!dateString) {
            return { isValid: false, message: 'Date is required' };
        }

        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return { isValid: false, message: 'Invalid date format' };
        }

        // Check if date is not too far in the future
        const today = new Date();
        const maxFutureDate = new Date();
        maxFutureDate.setDate(today.getDate() + 30);
        
        if (date > maxFutureDate) {
            return { isValid: false, message: 'Date cannot be more than 30 days in the future' };
        }

        // Check if date is not too far in the past
        const minPastDate = new Date();
        minPastDate.setFullYear(today.getFullYear() - 1);
        
        if (date < minPastDate) {
            return { isValid: false, message: 'Date cannot be more than 1 year in the past' };
        }

        return { isValid: true, message: '' };
    }
}

// Create and export a singleton instance
const validationManager = new ValidationManager();
window.validationManager = validationManager;

// Add CSS for validation errors
const validationCSS = `
.validation-error {
    border-color: var(--error-color) !important;
    box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1) !important;
}

.validation-error-message {
    color: var(--error-color);
    font-size: var(--font-size-xs);
    margin-top: var(--spacing-1);
    display: block;
}
`;

// Inject validation CSS
const style = document.createElement('style');
style.textContent = validationCSS;
document.head.appendChild(style);
