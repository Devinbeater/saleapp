/**
 * Enhanced Reports Generation Module
 * Generates comprehensive reports with ALL data from the page
 */

class EnhancedReportsManager {
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
                    <button class="report-option" onclick="reportsManager.generateCompleteDailyReport()">
                        <i class="fas fa-file-alt"></i>
                        <div>
                            <strong>Complete Daily Report</strong>
                            <span>All data with transactions</span>
                        </div>
                    </button>
                    <button class="report-option" onclick="reportsManager.generateDebtorsReport()">
                        <i class="fas fa-users"></i>
                        <div>
                            <strong>Debtors Report</strong>
                            <span>All pending & collected</span>
                        </div>
                    </button>
                    <button class="report-option" onclick="reportsManager.generateExpensesReport()">
                        <i class="fas fa-money-bill-wave"></i>
                        <div>
                            <strong>Expenses Report</strong>
                            <span>All expenses with details</span>
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
     * Get all POS transactions from the grid
     */
    getAllTransactions() {
        const transactions = [];
        const rows = document.querySelectorAll('#data-grid tbody tr');
        
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td input, td select');
            if (cells.length > 0) {
                const serialNo = cells[0]?.value || '';
                const pos = cells[1]?.value || '';
                const kotakQR = cells[2]?.value || '';
                const kotakSwipe = cells[3]?.value || '';
                const debtors = cells[4]?.value || '';
                const cash = cells[5]?.value || '';
                
                // Only include rows with data
                if (pos || kotakQR || kotakSwipe || debtors || cash) {
                    transactions.push({
                        serialNo: serialNo || (index + 1),
                        pos: parseFloat(pos) || 0,
                        kotakQR: parseFloat(kotakQR) || 0,
                        kotakSwipe: parseFloat(kotakSwipe) || 0,
                        debtors: parseFloat(debtors) || 0,
                        cash: parseFloat(cash) || 0
                    });
                }
            }
        });
        
        return transactions;
    }

    /**
     * Generate Complete Daily Report with ALL data
     */
    generateCompleteDailyReport() {
        const today = new Date().toLocaleDateString('en-IN');
        const openingCash = parseFloat(document.getElementById('opening-cash')?.value || 0);
        const transactions = this.getAllTransactions();
        
        let report = `
═══════════════════════════════════════════════════════════════
                    COMPLETE DAILY REPORT
                    Date: ${today}
═══════════════════════════════════════════════════════════════

!! Shree Ganeshay Namha !!

═══════════════════════════════════════════════════════════════
SECTION 1: OPENING CASH
═══════════════════════════════════════════════════════════════

Opening Cash:                                    ₹${openingCash.toFixed(2)}

`;

        // Add all transactions
        if (transactions.length > 0) {
            report += `
═══════════════════════════════════════════════════════════════
SECTION 2: TRANSACTIONS (${transactions.length} entries)
═══════════════════════════════════════════════════════════════

Sr.  POS        Kotak QR   Kotak Swipe  Debtors    Cash
───────────────────────────────────────────────────────────────
`;
            
            transactions.forEach(t => {
                report += `${String(t.serialNo).padEnd(4)} `;
                report += `${t.pos.toFixed(2).padStart(10)} `;
                report += `${t.kotakQR.toFixed(2).padStart(10)} `;
                report += `${t.kotakSwipe.toFixed(2).padStart(12)} `;
                report += `${t.debtors.toFixed(2).padStart(10)} `;
                report += `${t.cash.toFixed(2).padStart(10)}\n`;
            });
        }

        // Add debtors section
        const debtors = typeof debtorsManager !== 'undefined' ? debtorsManager.debtors : [];
        if (debtors.length > 0) {
            report += `
═══════════════════════════════════════════════════════════════
SECTION 3: DEBTORS (${debtors.length} entries)
═══════════════════════════════════════════════════════════════

Sr.  Party Name              Bill No    Amount      Status
───────────────────────────────────────────────────────────────
`;
            
            debtors.forEach((d, i) => {
                report += `${String(i + 1).padEnd(4)} `;
                report += `${d.partyName.padEnd(24)} `;
                report += `${d.billNo.padEnd(10)} `;
                report += `₹${d.amount.toFixed(2).padStart(10)} `;
                report += `${d.status}\n`;
            });
            
            const pending = debtors.filter(d => d.status === 'Pending');
            const paid = debtors.filter(d => d.status === 'Paid');
            const pendingTotal = pending.reduce((sum, d) => sum + d.amount, 0);
            const paidTotal = paid.reduce((sum, d) => sum + d.amount, 0);
            
            report += `───────────────────────────────────────────────────────────────\n`;
            report += `Pending: ${pending.length} (₹${pendingTotal.toFixed(2)})  |  Paid: ${paid.length} (₹${paidTotal.toFixed(2)})\n`;
        }

        // Add collections section
        const collections = typeof collectionsManager !== 'undefined' ? collectionsManager.collections : [];
        const todayCollections = collections.filter(c => c.collectionDate === new Date().toISOString().split('T')[0]);
        
        if (todayCollections.length > 0) {
            report += `
═══════════════════════════════════════════════════════════════
SECTION 4: COLLECTIONS (${todayCollections.length} entries)
═══════════════════════════════════════════════════════════════

Sr.  Party Name              Bill No    Amount      Payment Mode
───────────────────────────────────────────────────────────────
`;
            
            todayCollections.forEach((c, i) => {
                report += `${String(i + 1).padEnd(4)} `;
                report += `${c.partyName.padEnd(24)} `;
                report += `${c.billNo.padEnd(10)} `;
                report += `₹${c.amount.toFixed(2).padStart(10)} `;
                report += `${c.paymentMode}\n`;
            });
            
            const total = todayCollections.reduce((sum, c) => sum + c.amount, 0);
            report += `───────────────────────────────────────────────────────────────\n`;
            report += `Total Collections:                              ₹${total.toFixed(2)}\n`;
        }

        // Add expenses section
        const expenses = typeof expensesManager !== 'undefined' ? expensesManager.expenses : [];
        const todayExpenses = expenses.filter(e => e.date === new Date().toISOString().split('T')[0]);
        
        if (todayExpenses.length > 0) {
            report += `
═══════════════════════════════════════════════════════════════
SECTION 5: EXPENSES (${todayExpenses.length} entries)
═══════════════════════════════════════════════════════════════

Time    Purpose                      Category        Amount
───────────────────────────────────────────────────────────────
`;
            
            todayExpenses.forEach(e => {
                report += `${e.time.padEnd(7)} `;
                report += `${e.purpose.padEnd(28)} `;
                report += `${e.category.padEnd(15)} `;
                report += `₹${e.amount.toFixed(2).padStart(10)}\n`;
            });
            
            const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
            report += `───────────────────────────────────────────────────────────────\n`;
            report += `Total Expenses:                                 ₹${total.toFixed(2)}\n`;
        }

        // Add denominations section
        const denominations = this.getDenominations();
        if (denominations.length > 0) {
            report += `
═══════════════════════════════════════════════════════════════
SECTION 6: CASH DENOMINATIONS
═══════════════════════════════════════════════════════════════

Denomination    No. of Pcs    Amount
───────────────────────────────────────────────────────────────
`;
            
            denominations.forEach(d => {
                if (d.pieces > 0) {
                    report += `₹${String(d.value).padEnd(14)} `;
                    report += `${String(d.pieces).padStart(10)} `;
                    report += `₹${d.amount.toFixed(2).padStart(12)}\n`;
                }
            });
            
            const total = denominations.reduce((sum, d) => sum + d.amount, 0);
            report += `───────────────────────────────────────────────────────────────\n`;
            report += `Physical Cash Total:                            ₹${total.toFixed(2)}\n`;
        }

        // Add summary calculations
        report += `
═══════════════════════════════════════════════════════════════
SECTION 7: FINANCIAL SUMMARY
═══════════════════════════════════════════════════════════════

Opening Cash:                                    ₹${openingCash.toFixed(2)}
Total Sale:                                      ₹${calculationsManager.getTotalSale().toFixed(2)}
Debit Cash:                                      ₹${calculationsManager.getDebitCash().toFixed(2)}

Payment Breakdown:
  QR:                                            ₹${calculationsManager.getQR().toFixed(2)}
  Swipe:                                         ₹${calculationsManager.getSwipe().toFixed(2)}
  Debtors (Credit):                              ₹${calculationsManager.getDebtors().toFixed(2)}

Expenses:                                        ₹${expensesManager.getTotalExpenses().toFixed(2)}
Available Cash:                                  ₹${calculationsManager.getAvailableCash().toFixed(2)}

Net Amount:                                      ₹${calculationsManager.getNetAmount().toFixed(2)}
Physical Cash:                                   ₹${calculationsManager.getDenominationTotal().toFixed(2)}
───────────────────────────────────────────────────────────────
Difference:                                      ₹${calculationsManager.getDifference().toFixed(2)} ${Math.abs(calculationsManager.getDifference()) < 0.01 ? '✓' : '⚠️'}

${Math.abs(calculationsManager.getDifference()) < 0.01 ? 'STATUS: BALANCED ✓' : 'STATUS: MISMATCH ⚠️'}

═══════════════════════════════════════════════════════════════
Report Generated: ${new Date().toLocaleString('en-IN')}
═══════════════════════════════════════════════════════════════
        `;
        
        this.displayReport('Complete Daily Report', report);
    }

    /**
     * Get denominations from the table
     */
    getDenominations() {
        const denominations = [];
        const rows = document.querySelectorAll('#denominations-table tbody tr');
        
        rows.forEach(row => {
            const piecesInput = row.querySelector('input[data-field="pieces"]');
            const amountSpan = row.querySelector('span[data-field="amount"]');
            const denom = piecesInput?.getAttribute('data-denomination');
            
            if (denom && piecesInput) {
                const pieces = parseInt(piecesInput.value) || 0;
                const amount = parseFloat(amountSpan?.textContent) || 0;
                
                denominations.push({
                    value: parseInt(denom),
                    pieces: pieces,
                    amount: amount
                });
            }
        });
        
        return denominations.sort((a, b) => b.value - a.value);
    }

    /**
     * Generate Debtors Report (ALL debtors)
     */
    generateDebtorsReport() {
        const today = new Date().toLocaleDateString('en-IN');
        const debtors = typeof debtorsManager !== 'undefined' ? debtorsManager.debtors : [];
        const pending = debtors.filter(d => d.status === 'Pending');
        const paid = debtors.filter(d => d.status === 'Paid');
        
        let report = `
═══════════════════════════════════════════════════════════════
                    DEBTORS REPORT
                    Date: ${today}
═══════════════════════════════════════════════════════════════

PENDING PAYMENTS (${pending.length} entries)
Sr.  Party Name              Salesman  Bill No    Amount
───────────────────────────────────────────────────────────────
`;
        
        pending.forEach((d, i) => {
            report += `${String(i + 1).padEnd(4)} `;
            report += `${d.partyName.padEnd(24)} `;
            report += `${(d.salesman || 'N/A').padEnd(9)} `;
            report += `${d.billNo.padEnd(10)} `;
            report += `₹${d.amount.toFixed(2)}\n`;
        });
        
        const pendingTotal = pending.reduce((sum, d) => sum + d.amount, 0);
        report += `───────────────────────────────────────────────────────────────\n`;
        report += `Total Pending:                                  ₹${pendingTotal.toFixed(2)}\n\n`;
        
        report += `COLLECTED TODAY (${paid.length} entries)\n`;
        report += `Sr.  Party Name              Salesman  Bill No    Amount\n`;
        report += `───────────────────────────────────────────────────────────────\n`;
        
        paid.forEach((d, i) => {
            report += `${String(i + 1).padEnd(4)} `;
            report += `${d.partyName.padEnd(24)} `;
            report += `${(d.salesman || 'N/A').padEnd(9)} `;
            report += `${d.billNo.padEnd(10)} `;
            report += `₹${d.amount.toFixed(2)}\n`;
        });
        
        const paidTotal = paid.reduce((sum, d) => sum + d.amount, 0);
        report += `───────────────────────────────────────────────────────────────\n`;
        report += `Total Collected:                                ₹${paidTotal.toFixed(2)}\n\n`;
        
        report += `═══════════════════════════════════════════════════════════════\n`;
        report += `SUMMARY\n`;
        report += `Total Debtors: ${debtors.length}\n`;
        report += `Pending: ${pending.length} (₹${pendingTotal.toFixed(2)})\n`;
        report += `Collected: ${paid.length} (₹${paidTotal.toFixed(2)})\n`;
        report += `═══════════════════════════════════════════════════════════════\n`;
        
        this.displayReport('Debtors Report', report);
    }

    /**
     * Generate Expenses Report (ALL expenses)
     */
    generateExpensesReport() {
        const today = new Date().toLocaleDateString('en-IN');
        const expenses = typeof expensesManager !== 'undefined' ? expensesManager.expenses : [];
        const todayExpenses = expenses.filter(e => e.date === new Date().toISOString().split('T')[0]);
        
        let report = `
═══════════════════════════════════════════════════════════════
                    EXPENSE REPORT
                    Date: ${today}
═══════════════════════════════════════════════════════════════

ALL EXPENSES (${todayExpenses.length} entries)
Time    Purpose                      Category        Amount      Notes
───────────────────────────────────────────────────────────────────────
`;
        
        todayExpenses.forEach(e => {
            report += `${e.time.padEnd(7)} `;
            report += `${e.purpose.padEnd(28)} `;
            report += `${e.category.padEnd(15)} `;
            report += `₹${e.amount.toFixed(2).padStart(10)} `;
            report += `${e.notes || ''}\n`;
        });
        
        const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
        report += `───────────────────────────────────────────────────────────────────────\n`;
        report += `Total Expenses:                                 ₹${total.toFixed(2)}\n\n`;
        
        // Category breakdown
        const categories = {};
        todayExpenses.forEach(e => {
            if (!categories[e.category]) {
                categories[e.category] = 0;
            }
            categories[e.category] += e.amount;
        });
        
        if (Object.keys(categories).length > 0) {
            report += `CATEGORY BREAKDOWN\n`;
            report += `───────────────────────────────────────────────────────────────────────\n`;
            Object.entries(categories).forEach(([cat, amount]) => {
                report += `${cat.padEnd(30)} ₹${amount.toFixed(2)}\n`;
            });
        }
        
        report += `\n`;
        report += `Available Cash:                                 ₹${calculationsManager.getAvailableCash().toFixed(2)}\n`;
        report += `═══════════════════════════════════════════════════════════════════════\n`;
        
        this.displayReport('Expense Report', report);
    }

    /**
     * Generate Day Closing Report
     */
    generateDayClosingReport() {
        const today = new Date().toLocaleDateString('en-IN');
        const openingCash = parseFloat(document.getElementById('opening-cash')?.value || 0);
        const denominations = this.getDenominations();
        
        let report = `
═══════════════════════════════════════════════════════════════
                    DAY CLOSING REPORT
                    Date: ${today}
═══════════════════════════════════════════════════════════════

DENOMINATION BREAKDOWN
───────────────────────────────────────────────────────────────
`;
        
        let physicalCash = 0;
        denominations.forEach(d => {
            if (d.pieces > 0) {
                physicalCash += d.amount;
                report += `₹${String(d.value).padEnd(4)} × ${String(d.pieces).padStart(3)}  pcs  = ₹${d.amount.toFixed(2)}\n`;
            }
        });
        
        report += `───────────────────────────────────────────────────────────────\n`;
        report += `Physical Cash:                                  ₹${physicalCash.toFixed(2)}\n\n`;
        
        report += `RECONCILIATION\n`;
        report += `───────────────────────────────────────────────────────────────\n`;
        report += `Opening Cash:                                   ₹${openingCash.toFixed(2)}\n`;
        report += `Total Sale:                                     ₹${calculationsManager.getTotalSale().toFixed(2)}\n`;
        report += `Total Expenses:                                 ₹${expensesManager.getTotalExpenses().toFixed(2)}\n`;
        report += `Expected Cash:                                  ₹${calculationsManager.getAvailableCash().toFixed(2)}\n`;
        report += `Physical Cash:                                  ₹${physicalCash.toFixed(2)}\n`;
        report += `───────────────────────────────────────────────────────────────\n`;
        
        const diff = calculationsManager.getDifference();
        report += `Difference:                                     ₹${diff.toFixed(2)} ${Math.abs(diff) < 0.01 ? '✓' : '⚠️'}\n\n`;
        
        report += `STATUS: ${Math.abs(diff) < 0.01 ? 'BALANCED ✓' : 'MISMATCH ⚠️'}\n\n`;
        
        report += `Closed by: Admin\n`;
        report += `Time: ${new Date().toLocaleTimeString('en-IN')}\n\n`;
        report += `═══════════════════════════════════════════════════════════════\n`;
        
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
                <div class="modal-content modal-large" onclick="event.stopPropagation()">
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
                            <button class="btn btn-secondary" onclick="reportsManager.downloadReport('${title}')">
                                <i class="fas fa-download"></i> Download
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

    /**
     * Download report as text file
     */
    downloadReport(title) {
        const content = document.querySelector('.report-content');
        if (content) {
            const blob = new Blob([content.textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
}

// Export singleton instance
const reportsManager = new EnhancedReportsManager();
