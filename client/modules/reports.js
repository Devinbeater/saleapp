/**
 * Reports Generation Module
 * Generates various reports for the POS system
 */

class ReportsManager {
    constructor() {
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        const generateReportBtn = document.getElementById('generate-report');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                this.showReportsMenu();
            });
        }
    }

    /**
     * Show reports menu
     */
    showReportsMenu() {
        const menu = `
            <div class="reports-menu-overlay" onclick="this.remove()">
                <div class="reports-menu" onclick="event.stopPropagation()">
                    <h3>Generate Report</h3>
                    <button class="report-option" onclick="reportsManager.generateDailySummary()">
                        <i class="fas fa-file-alt"></i>
                        <div>
                            <strong>Daily Summary</strong>
                            <span>Complete day overview</span>
                        </div>
                    </button>
                    <button class="report-option" onclick="reportsManager.generateDebtorsReport()">
                        <i class="fas fa-users"></i>
                        <div>
                            <strong>Debtors Report</strong>
                            <span>Pending & collected</span>
                        </div>
                    </button>
                    <button class="report-option" onclick="reportsManager.generateExpensesReport()">
                        <i class="fas fa-money-bill-wave"></i>
                        <div>
                            <strong>Expenses Report</strong>
                            <span>Today's expenses</span>
                        </div>
                    </button>
                    <button class="report-option" onclick="reportsManager.generateDayClosingReport()">
                        <i class="fas fa-moon"></i>
                        <div>
                            <strong>Day Closing Report</strong>
                            <span>Final reconciliation</span>
                        </div>
                    </button>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()" style="margin-top: 1rem;">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', menu);
    }

    /**
     * Generate Daily Summary Report
     */
    generateDailySummary() {
        const today = new Date().toLocaleDateString('en-IN');
        const openingCash = parseFloat(document.getElementById('opening-cash')?.value || 0);
        
        const report = `
═══════════════════════════════════════════
         DAILY SUMMARY REPORT
         Date: ${today}
═══════════════════════════════════════════

OPENING
  Opening Cash:                 ₹${openingCash.toFixed(2)}

SALES
  Total Sale:                   ₹${calculationsManager.getTotalSale().toFixed(2)}
  QR:                           ₹${calculationsManager.getQR().toFixed(2)}
  Swipe:                        ₹${calculationsManager.getSwipe().toFixed(2)}
  Debtors (Credit):             ₹${calculationsManager.getDebtors().toFixed(2)}

EXPENSES
  Total Expenses:               ₹${expensesManager.getTotalExpenses().toFixed(2)}

COLLECTIONS
  Debtor Payments:              ₹${collectionsManager.getTodayTotal().toFixed(2)}

CLOSING
  Debit Cash:                   ₹${calculationsManager.getDebitCash().toFixed(2)}
  Available Cash:               ₹${calculationsManager.getAvailableCash().toFixed(2)}
  Net Amount:                   ₹${calculationsManager.getNetAmount().toFixed(2)}
  Physical Cash:                ₹${calculationsManager.getDenominationTotal().toFixed(2)}
  Difference:                   ₹${calculationsManager.getDifference().toFixed(2)} ${Math.abs(calculationsManager.getDifference()) < 0.01 ? '✓' : '⚠️'}

═══════════════════════════════════════════
        `;
        
        this.displayReport('Daily Summary Report', report);
    }

    /**
     * Generate Debtors Report
     */
    generateDebtorsReport() {
        const today = new Date().toLocaleDateString('en-IN');
        const pending = debtorsManager.getPending();
        const paid = debtorsManager.getPaid();
        
        let report = `
═══════════════════════════════════════════
          DEBTORS REPORT
         Date: ${today}
═══════════════════════════════════════════

PENDING PAYMENTS
Sr.  Party Name              Bill No    Amount
─────────────────────────────────────────────
`;
        
        pending.forEach((d, i) => {
            report += `${String(i + 1).padEnd(4)} ${d.partyName.padEnd(24)} ${d.billNo.padEnd(10)} ₹${d.amount.toFixed(2)}\n`;
        });
        
        report += `                                          ─────────\n`;
        report += `Total Pending:                            ₹${debtorsManager.getTotalPending().toFixed(2)}\n\n`;
        
        report += `COLLECTED TODAY\n`;
        report += `Sr.  Party Name              Bill No    Amount\n`;
        report += `─────────────────────────────────────────────\n`;
        
        const todayCollections = collectionsManager.getByDate(new Date().toISOString().split('T')[0]);
        todayCollections.forEach((c, i) => {
            report += `${String(i + 1).padEnd(4)} ${c.partyName.padEnd(24)} ${c.billNo.padEnd(10)} ₹${c.amount.toFixed(2)}\n`;
        });
        
        report += `                                          ─────────\n`;
        report += `Total Collected:                          ₹${collectionsManager.getTodayTotal().toFixed(2)}\n\n`;
        report += `═══════════════════════════════════════════\n`;
        
        this.displayReport('Debtors Report', report);
    }

    /**
     * Generate Expenses Report
     */
    generateExpensesReport() {
        const today = new Date().toLocaleDateString('en-IN');
        const expenses = expensesManager.getByDate(new Date().toISOString().split('T')[0]);
        
        let report = `
═══════════════════════════════════════════
          EXPENSE REPORT
         Date: ${today}
═══════════════════════════════════════════

Time    Purpose                  Category      Amount
────────────────────────────────────────────────────
`;
        
        expenses.forEach(e => {
            report += `${e.time.padEnd(7)} ${e.purpose.padEnd(24)} ${e.category.padEnd(13)} ₹${e.amount.toFixed(2)}\n`;
        });
        
        report += `                                            ────────\n`;
        report += `Total Expenses:                             ₹${expensesManager.getTotalExpenses().toFixed(2)}\n\n`;
        report += `Available Cash:                             ₹${calculationsManager.getAvailableCash().toFixed(2)}\n\n`;
        report += `═══════════════════════════════════════════\n`;
        
        this.displayReport('Expense Report', report);
    }

    /**
     * Generate Day Closing Report
     */
    generateDayClosingReport() {
        const today = new Date().toLocaleDateString('en-IN');
        const openingCash = parseFloat(document.getElementById('opening-cash')?.value || 0);
        
        let report = `
═══════════════════════════════════════════
       DAY CLOSING REPORT
       Date: ${today}
═══════════════════════════════════════════

DENOMINATION BREAKDOWN
`;
        
        const denomValues = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
        let physicalCash = 0;
        
        denomValues.forEach(denom => {
            const input = document.querySelector(`input[data-denomination="${denom}"][data-field="pieces"]`);
            if (input) {
                const pieces = parseInt(input.value) || 0;
                const amount = pieces * denom;
                physicalCash += amount;
                if (pieces > 0) {
                    report += `₹${String(denom).padEnd(4)} × ${String(pieces).padStart(3)}  pcs  = ₹${amount.toFixed(2)}\n`;
                }
            }
        });
        
        report += `                          ──────────\n`;
        report += `Physical Cash:            ₹${physicalCash.toFixed(2)}\n\n`;
        
        report += `RECONCILIATION\n`;
        report += `Opening Cash:             ₹${openingCash.toFixed(2)}\n`;
        report += `Total Sale:               ₹${calculationsManager.getTotalSale().toFixed(2)}\n`;
        report += `Total Expenses:           ₹${expensesManager.getTotalExpenses().toFixed(2)}\n`;
        report += `Expected Cash:            ₹${calculationsManager.getAvailableCash().toFixed(2)}\n`;
        report += `Physical Cash:            ₹${physicalCash.toFixed(2)}\n`;
        report += `                          ──────────\n`;
        
        const diff = calculationsManager.getDifference();
        report += `Difference:               ₹${diff.toFixed(2)} ${Math.abs(diff) < 0.01 ? '✓' : '⚠️'}\n\n`;
        
        report += `STATUS: ${Math.abs(diff) < 0.01 ? 'BALANCED ✓' : 'MISMATCH ⚠️'}\n\n`;
        
        report += `Closed by: Admin\n`;
        report += `Time: ${new Date().toLocaleTimeString('en-IN')}\n\n`;
        report += `═══════════════════════════════════════════\n`;
        
        this.displayReport('Day Closing Report', report);
    }

    /**
     * Display report in modal
     */
    displayReport(title, content) {
        // Remove reports menu
        const menu = document.querySelector('.reports-menu-overlay');
        if (menu) menu.remove();
        
        const modal = `
            <div class="modal show" id="report-modal" onclick="if(event.target === this) this.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="document.getElementById('report-modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <pre class="report-content">${content}</pre>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="reportsManager.printReport()">
                                <i class="fas fa-print"></i> Print
                            </button>
                            <button class="btn btn-secondary" onclick="reportsManager.copyReport()">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                            <button class="btn btn-primary" onclick="document.getElementById('report-modal').remove()">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    }

    /**
     * Print report
     */
    printReport() {
        const content = document.querySelector('.report-content');
        if (content) {
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Report</title>');
            printWindow.document.write('<style>body{font-family:monospace;white-space:pre;padding:20px;}</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(content.textContent);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    }

    /**
     * Copy report to clipboard
     */
    copyReport() {
        const content = document.querySelector('.report-content');
        if (content) {
            navigator.clipboard.writeText(content.textContent).then(() => {
                alert('✓ Report copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }
    }
}

// Export singleton instance
const reportsManager = new ReportsManager();
