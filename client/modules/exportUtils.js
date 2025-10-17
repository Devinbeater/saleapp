/**
 * Export Utilities Module for Daily Sheet Manager
 * Handles Excel, CSV, and PDF export functionality
 */

class ExportUtils {
    constructor() {
        this.isExporting = false;
    }

    /**
     * Export to CSV format
     */
    async exportToCSV() {
        if (this.isExporting) return;
        
        try {
            this.isExporting = true;
            uiManager.showStatus('Exporting CSV...', 'success');

            const data = this.collectExportData();
            const csvContent = this.generateCSV(data);
            
            const filename = `DailySheet_${uiManager.currentDate}.csv`;
            this.downloadFile(csvContent, filename, 'text/csv');
            
            uiManager.showStatus('CSV exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            uiManager.showStatus('Error exporting CSV', 'error');
        } finally {
            this.isExporting = false;
        }
    }

    /**
     * Export to Excel format
     */
    async exportToExcel() {
        if (this.isExporting) return;
        
        try {
            this.isExporting = true;
            uiManager.showStatus('Exporting Excel...', 'success');

            const data = this.collectExportData();
            const workbook = this.generateExcelWorkbook(data);
            
            const filename = `DailySheet_${uiManager.currentDate}.xlsx`;
            XLSX.writeFile(workbook, filename);
            
            uiManager.showStatus('Excel exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            uiManager.showStatus('Error exporting Excel', 'error');
        } finally {
            this.isExporting = false;
        }
    }

    /**
     * Export to PDF format
     */
    async exportToPDF() {
        if (this.isExporting) return;
        
        try {
            this.isExporting = true;
            uiManager.showStatus('Exporting PDF...', 'success');

            // Generate printable HTML
            const printHTML = this.generatePrintHTML();
            
            // Open print dialog
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printHTML);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            
            uiManager.showStatus('PDF generated successfully', 'success');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            uiManager.showStatus('Error exporting PDF', 'error');
        } finally {
            this.isExporting = false;
        }
    }

    /**
     * Generate printable report
     */
    generateReport() {
        try {
            const printHTML = this.generatePrintHTML();
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printHTML);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            
            uiManager.showStatus('Report generated successfully', 'success');
        } catch (error) {
            console.error('Error generating report:', error);
            uiManager.showStatus('Error generating report', 'error');
        }
    }

    /**
     * Collect data for export
     */
    collectExportData() {
        const data = {
            sheetInfo: {
                date: uiManager.currentDate,
                sheetId: uiManager.currentSheetId,
                generatedAt: new Date().toISOString()
            },
            entries: {},
            denominations: {},
            summary: {}
        };

        // Collect entries data
        const entryInputs = document.querySelectorAll('input[data-cell-key]');
        entryInputs.forEach(input => {
            const cellKey = input.dataset.cellKey;
            const section = input.dataset.section;
            const rowIndex = input.dataset.rowIndex;
            const fieldType = input.dataset.fieldType;
            const value = input.value.trim();
            
            if (value) {
                if (!data.entries[section]) {
                    data.entries[section] = {};
                }
                
                // Get entry type, payment methods, and transaction ref for POS entries
                let entryType = '';
                let paymentMethods = [];
                let transactionRef = '';
                
                if (section === 'POS' && fieldType === 'AMOUNT' && uiManager.entryTypes[cellKey]) {
                    const entryInfo = uiManager.entryTypes[cellKey];
                    entryType = entryInfo.type || '';
                    paymentMethods = entryInfo.paymentMethods || [];
                    transactionRef = entryInfo.transactionRef || '';
                }
                
                // Store entry data with row index as key
                if (!data.entries[section][`row_${rowIndex}`]) {
                    data.entries[section][`row_${rowIndex}`] = {};
                }
                
                data.entries[section][`row_${rowIndex}`][fieldType] = {
                    cellKey,
                    fieldType,
                    value,
                    calculatedValue: formulaEngine.getCalculatedValue(cellKey),
                    entryType,
                    paymentMethods,
                    transactionRef
                };
            }
        });

        // Collect denominations data
        const denominationInputs = document.querySelectorAll('input[data-denomination][data-field="pieces"]');
        denominationInputs.forEach(input => {
            const denomination = input.dataset.denomination;
            const pieces = parseInt(input.value) || 0;
            
            if (pieces > 0) {
                data.denominations[denomination] = {
                    pieces,
                    amount: denomination * pieces
                };
            }
        });

        // Collect summary data
        data.summary = {
            totalSale: document.getElementById('total-sale')?.textContent || '0',
            netAmount: document.getElementById('net-amount')?.textContent || '0',
            totalCash: document.getElementById('total-cash')?.textContent || '0'
        };

        // Collect Debtors data
        if (typeof debtorsManager !== 'undefined') {
            data.debtors = debtorsManager.debtors || [];
        }

        // Collect Collections data
        if (typeof collectionsManager !== 'undefined') {
            data.collections = collectionsManager.collections || [];
        }

        // Collect Expenses data
        if (typeof expensesManager !== 'undefined') {
            data.expenses = expensesManager.expenses || [];
        }

        return data;
    }

    /**
     * Generate CSV content
     */
    generateCSV(data) {
        const rows = [];
        
        // Header
        rows.push(['Daily Sheet Report', data.sheetInfo.date]);
        rows.push(['Generated At', data.sheetInfo.generatedAt]);
        rows.push([]);
        
        // Summary
        rows.push(['SUMMARY']);
        rows.push(['Total Sale', data.summary.totalSale]);
        rows.push(['Net Amount', data.summary.netAmount]);
        rows.push(['Total Cash', data.summary.totalCash]);
        rows.push([]);
        
        // Entries
        rows.push(['ENTRIES']);
        rows.push(['Section', 'Row', 'SR.NO', 'Salesman', 'Party', 'Amount', 'Entry Type', 'Payment Method', 'Transaction Ref']);
        
        Object.entries(data.entries).forEach(([section, sectionData]) => {
            Object.entries(sectionData).forEach(([rowKey, rowData]) => {
                // rowData is now an object with fields (SRNO, SALESMAN, PARTY, AMOUNT)
                const srno = rowData.SRNO?.value || '';
                const salesman = rowData.SALESMAN?.value || '';
                const party = rowData.PARTY?.value || '';
                const amount = rowData.AMOUNT?.value || '';
                const entryType = rowData.AMOUNT?.entryType || '';
                const paymentMethods = rowData.AMOUNT?.paymentMethods && rowData.AMOUNT.paymentMethods.length > 0
                    ? rowData.AMOUNT.paymentMethods.join(', ')
                    : '';
                const transactionRef = rowData.AMOUNT?.transactionRef || '';
                
                // Only add row if there's any data
                if (srno || salesman || party || amount) {
                    rows.push([
                        section,
                        rowKey.replace('row_', ''),
                        srno,
                        salesman,
                        party,
                        amount,
                        entryType,
                        paymentMethods,
                        transactionRef
                    ]);
                }
            });
        });
        
        rows.push([]);
        
        // Debtors
        if (data.debtors && data.debtors.length > 0) {
            rows.push(['DEBTORS']);
            rows.push(['Party Name', 'Salesman', 'Bill No', 'Amount', 'Status', 'Date']);
            data.debtors.forEach(debtor => {
                rows.push([
                    debtor.partyName || '',
                    debtor.salesman || '',
                    debtor.billNo || '',
                    debtor.amount || 0,
                    debtor.status || 'Pending',
                    debtor.date || ''
                ]);
            });
            rows.push([]);
        }
        
        // Collections
        if (data.collections && data.collections.length > 0) {
            rows.push(['COLLECTIONS']);
            rows.push(['Party Name', 'Bill No', 'Amount', 'Payment Mode', 'Collection Date']);
            data.collections.forEach(collection => {
                rows.push([
                    collection.partyName || '',
                    collection.billNo || '',
                    collection.amount || 0,
                    collection.paymentMode || '',
                    collection.collectionDate || ''
                ]);
            });
            rows.push([]);
        }
        
        // Expenses
        if (data.expenses && data.expenses.length > 0) {
            rows.push(['EXPENSES']);
            rows.push(['Purpose', 'Category', 'Amount', 'Time', 'Date', 'Notes']);
            data.expenses.forEach(expense => {
                rows.push([
                    expense.purpose || '',
                    expense.category || '',
                    expense.amount || 0,
                    expense.time || '',
                    expense.date || '',
                    expense.notes || ''
                ]);
            });
            rows.push([]);
        }
        
        rows.push([]);
        
        // Denominations
        rows.push(['DENOMINATIONS']);
        rows.push(['Denomination', 'Pieces', 'Amount']);
        
        Object.entries(data.denominations).forEach(([denomination, denomData]) => {
            const label = denomination === '0' ? 'Coupons' : `₹${denomination}`;
            rows.push([
                label,
                denomData.pieces,
                denomData.amount
            ]);
        });
        
        // Convert to CSV string
        return rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    /**
     * Generate Excel workbook
     */
    generateExcelWorkbook(data) {
        const workbook = XLSX.utils.book_new();
        
        // Summary sheet
        const summaryData = [
            ['Daily Sheet Report'],
            ['Date', data.sheetInfo.date],
            ['Generated At', data.sheetInfo.generatedAt],
            [],
            ['SUMMARY'],
            ['Total Sale', data.summary.totalSale],
            ['Net Amount', data.summary.netAmount],
            ['Total Cash', data.summary.totalCash]
        ];
        
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        
        // Entries sheet
        const entriesData = [
            ['Section', 'Row', 'SR.NO', 'Salesman', 'Party', 'Amount', 'Entry Type', 'Payment Method', 'Transaction Ref']
        ];
        
        Object.entries(data.entries).forEach(([section, sectionData]) => {
            Object.entries(sectionData).forEach(([rowKey, rowData]) => {
                // rowData is now an object with fields (SRNO, SALESMAN, PARTY, AMOUNT)
                const srno = rowData.SRNO?.value || '';
                const salesman = rowData.SALESMAN?.value || '';
                const party = rowData.PARTY?.value || '';
                const amount = rowData.AMOUNT?.value || '';
                const entryType = rowData.AMOUNT?.entryType || '';
                const paymentMethods = rowData.AMOUNT?.paymentMethods && rowData.AMOUNT.paymentMethods.length > 0
                    ? rowData.AMOUNT.paymentMethods.join(', ')
                    : '';
                const transactionRef = rowData.AMOUNT?.transactionRef || '';
                
                // Only add row if there's any data
                if (srno || salesman || party || amount) {
                    entriesData.push([
                        section,
                        rowKey.replace('row_', ''),
                        srno,
                        salesman,
                        party,
                        amount,
                        entryType,
                        paymentMethods,
                        transactionRef
                    ]);
                }
            });
        });
        
        const entriesSheet = XLSX.utils.aoa_to_sheet(entriesData);
        XLSX.utils.book_append_sheet(workbook, entriesSheet, 'Entries');
        
        // Debtors sheet
        if (data.debtors && data.debtors.length > 0) {
            const debtorsData = [
                ['Party Name', 'Salesman', 'Bill No', 'Amount', 'Status', 'Date']
            ];
            data.debtors.forEach(debtor => {
                debtorsData.push([
                    debtor.partyName || '',
                    debtor.salesman || '',
                    debtor.billNo || '',
                    debtor.amount || 0,
                    debtor.status || 'Pending',
                    debtor.date || ''
                ]);
            });
            const debtorsSheet = XLSX.utils.aoa_to_sheet(debtorsData);
            XLSX.utils.book_append_sheet(workbook, debtorsSheet, 'Debtors');
        }
        
        // Collections sheet
        if (data.collections && data.collections.length > 0) {
            const collectionsData = [
                ['Party Name', 'Bill No', 'Amount', 'Payment Mode', 'Collection Date']
            ];
            data.collections.forEach(collection => {
                collectionsData.push([
                    collection.partyName || '',
                    collection.billNo || '',
                    collection.amount || 0,
                    collection.paymentMode || '',
                    collection.collectionDate || ''
                ]);
            });
            const collectionsSheet = XLSX.utils.aoa_to_sheet(collectionsData);
            XLSX.utils.book_append_sheet(workbook, collectionsSheet, 'Collections');
        }
        
        // Expenses sheet
        if (data.expenses && data.expenses.length > 0) {
            const expensesData = [
                ['Purpose', 'Category', 'Amount', 'Time', 'Date', 'Notes']
            ];
            data.expenses.forEach(expense => {
                expensesData.push([
                    expense.purpose || '',
                    expense.category || '',
                    expense.amount || 0,
                    expense.time || '',
                    expense.date || '',
                    expense.notes || ''
                ]);
            });
            const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
            XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');
        }
        
        // Denominations sheet
        const denominationsData = [
            ['Denomination', 'Pieces', 'Amount']
        ];
        
        Object.entries(data.denominations).forEach(([denomination, denomData]) => {
            const label = denomination === '0' ? 'Coupons' : `₹${denomination}`;
            denominationsData.push([
                label,
                denomData.pieces,
                denomData.amount
            ]);
        });
        
        const denominationsSheet = XLSX.utils.aoa_to_sheet(denominationsData);
        XLSX.utils.book_append_sheet(workbook, denominationsSheet, 'Denominations');
        
        return workbook;
    }

    /**
     * Generate printable HTML
     */
    generatePrintHTML() {
        const data = this.collectExportData();
        const currentDate = new Date().toLocaleDateString();
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Sheet Report - ${data.sheetInfo.date}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .summary {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .summary h3 {
            margin-top: 0;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .section-header {
            background-color: #e9e9e9;
            font-weight: bold;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .entry-type {
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
        }
        .entry-type.sale {
            background-color: #d1fae5;
            color: #065f46;
        }
        .entry-type.return {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .entry-type.salesman {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .entry-type.party {
            background-color: #fef3c7;
            color: #92400e;
        }
        .payment-method {
            font-size: 12px;
            color: #059669;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>DAILY SHEET REPORT</h1>
        <h2>Date: ${data.sheetInfo.date}</h2>
    </div>
    
    <div class="summary">
        <h3>SUMMARY</h3>
        <div class="summary-row">
            <span>Total Sale:</span>
            <span><strong>₹${data.summary.totalSale}</strong></span>
        </div>
        <div class="summary-row">
            <span>Net Amount:</span>
            <span><strong>₹${data.summary.netAmount}</strong></span>
        </div>
        <div class="summary-row">
            <span>Total Cash:</span>
            <span><strong>₹${data.summary.totalCash}</strong></span>
        </div>
    </div>
    
    <h3>ENTRIES</h3>
    <table>
        <thead>
            <tr>
                <th>Section</th>
                <th>Row</th>
                <th>SR.NO</th>
                <th>Salesman</th>
                <th>Party</th>
                <th>Amount</th>
                <th>Entry Type</th>
                <th>Payment Method</th>
                <th>Transaction Ref</th>
            </tr>
        </thead>
        <tbody>
            ${this.generateEntriesTableRows(data.entries)}
        </tbody>
    </table>
    
    ${this.generateDebtorsTable(data.debtors)}
    ${this.generateCollectionsTable(data.collections)}
    ${this.generateExpensesTable(data.expenses)}
    
    <h3>DENOMINATIONS</h3>
    <table>
        <thead>
            <tr>
                <th>Denomination</th>
                <th>Pieces</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${this.generateDenominationsTableRows(data.denominations)}
        </tbody>
    </table>
    
    <div class="footer">
        <p>Generated on ${currentDate} at ${new Date().toLocaleTimeString()}</p>
        <p>Daily Sheet Manager v1.1.0</p>
    </div>
</body>
</html>`;
    }

    /**
     * Generate entries table rows for print HTML
     */
    generateEntriesTableRows(entries) {
        let rows = '';
        
        Object.entries(entries).forEach(([section, sectionData]) => {
            Object.entries(sectionData).forEach(([rowKey, rowData]) => {
                // rowData is now an object with fields (SRNO, SALESMAN, PARTY, AMOUNT)
                const srno = rowData.SRNO?.value || '-';
                const salesman = rowData.SALESMAN?.value || '-';
                const party = rowData.PARTY?.value || '-';
                const amount = rowData.AMOUNT?.value || '-';
                const entryType = rowData.AMOUNT?.entryType || '';
                const paymentMethods = rowData.AMOUNT?.paymentMethods || [];
                const transactionRef = rowData.AMOUNT?.transactionRef || '';
                
                // Only add row if there's any data
                if (srno !== '-' || salesman !== '-' || party !== '-' || amount !== '-') {
                    // Format payment methods
                    let paymentMethodHTML = '-';
                    if (paymentMethods.length > 0) {
                        const methods = paymentMethods.map(m => {
                            if (m === 'cash') return '💵 Cash';
                            if (m === 'online') return '💳 Online';
                            return m;
                        });
                        paymentMethodHTML = `<span class="payment-method">${methods.join(', ')}</span>`;
                    }
                    
                    // Format entry type with styling
                    let entryTypeHTML = '-';
                    if (entryType) {
                        const type = entryType.toLowerCase();
                        entryTypeHTML = `<span class="entry-type ${type}">${entryType.toUpperCase()}</span>`;
                    }
                    
                    rows += `
                        <tr>
                            <td>${section}</td>
                            <td>${rowKey.replace('row_', '')}</td>
                            <td>${srno}</td>
                            <td>${salesman}</td>
                            <td>${party}</td>
                            <td><strong>${amount}</strong></td>
                            <td>${entryTypeHTML}</td>
                            <td>${paymentMethodHTML}</td>
                            <td>${transactionRef || '-'}</td>
                        </tr>
                    `;
                }
            });
        });
        
        return rows;
    }

    /**
     * Generate Debtors table for print HTML
     */
    generateDebtorsTable(debtors) {
        if (!debtors || debtors.length === 0) return '';
        
        let rows = '';
        debtors.forEach(debtor => {
            rows += `
                <tr>
                    <td>${debtor.partyName || '-'}</td>
                    <td>${debtor.salesman || '-'}</td>
                    <td>${debtor.billNo || '-'}</td>
                    <td><strong>₹${debtor.amount || 0}</strong></td>
                    <td><span class="entry-type ${debtor.status === 'Paid' ? 'sale' : 'return'}">${debtor.status || 'Pending'}</span></td>
                    <td>${debtor.date || '-'}</td>
                </tr>
            `;
        });
        
        return `
            <h3>DEBTORS</h3>
            <table>
                <thead>
                    <tr>
                        <th>Party Name</th>
                        <th>Salesman</th>
                        <th>Bill No</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    /**
     * Generate Collections table for print HTML
     */
    generateCollectionsTable(collections) {
        if (!collections || collections.length === 0) return '';
        
        let rows = '';
        collections.forEach(collection => {
            rows += `
                <tr>
                    <td>${collection.partyName || '-'}</td>
                    <td>${collection.billNo || '-'}</td>
                    <td><strong>₹${collection.amount || 0}</strong></td>
                    <td>${collection.paymentMode || '-'}</td>
                    <td>${collection.collectionDate || '-'}</td>
                </tr>
            `;
        });
        
        return `
            <h3>COLLECTIONS</h3>
            <table>
                <thead>
                    <tr>
                        <th>Party Name</th>
                        <th>Bill No</th>
                        <th>Amount</th>
                        <th>Payment Mode</th>
                        <th>Collection Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    /**
     * Generate Expenses table for print HTML
     */
    generateExpensesTable(expenses) {
        if (!expenses || expenses.length === 0) return '';
        
        let rows = '';
        expenses.forEach(expense => {
            rows += `
                <tr>
                    <td>${expense.purpose || '-'}</td>
                    <td>${expense.category || '-'}</td>
                    <td><strong>₹${expense.amount || 0}</strong></td>
                    <td>${expense.time || '-'}</td>
                    <td>${expense.date || '-'}</td>
                    <td>${expense.notes || '-'}</td>
                </tr>
            `;
        });
        
        return `
            <h3>EXPENSES</h3>
            <table>
                <thead>
                    <tr>
                        <th>Purpose</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Time</th>
                        <th>Date</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    /**
     * Generate denominations table rows for print HTML
     */
    generateDenominationsTableRows(denominations) {
        let rows = '';
        
        Object.entries(denominations).forEach(([denomination, denomData]) => {
            const label = denomination === '0' ? 'Coupons' : `₹${denomination}`;
            rows += `
                <tr>
                    <td>${label}</td>
                    <td>${denomData.pieces}</td>
                    <td>₹${denomData.amount}</td>
                </tr>
            `;
        });
        
        return rows;
    }

    /**
     * Download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        
        if (window.saveAs) {
            saveAs(blob, filename);
        } else {
            // Fallback for browsers without FileSaver.js
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Import data from file
     */
    async importFromFile(file) {
        try {
            const content = await this.readFileContent(file);
            const data = this.parseImportData(content, file.type);
            
            if (data) {
                const success = persistenceManager.importSheetData(data);
                return success;
            }
            
            return false;
        } catch (error) {
            console.error('Error importing file:', error);
            uiManager.showStatus('Error importing file', 'error');
            return false;
        }
    }

    /**
     * Read file content
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
            
            if (file.type === 'application/json') {
                reader.readAsText(file);
            } else if (file.type === 'text/csv') {
                reader.readAsText(file);
            } else if (file.type.includes('sheet') || file.name.endsWith('.xlsx')) {
                reader.readAsArrayBuffer(file);
            } else {
                reject(new Error('Unsupported file type'));
            }
        });
    }

    /**
     * Parse import data based on file type
     */
    parseImportData(content, mimeType) {
        try {
            if (mimeType === 'application/json') {
                return JSON.parse(content);
            } else if (mimeType === 'text/csv') {
                return this.parseCSV(content);
            } else if (mimeType.includes('sheet') || content instanceof ArrayBuffer) {
                return this.parseExcel(content);
            }
            
            throw new Error('Unsupported file type');
        } catch (error) {
            console.error('Error parsing import data:', error);
            return null;
        }
    }

    /**
     * Parse CSV content
     */
    parseCSV(content) {
        // Basic CSV parsing - can be enhanced
        const lines = content.split('\n');
        const data = {
            entries: {},
            denominations: {},
            summary: {}
        };
        
        // This is a simplified parser - in production, use a proper CSV library
        lines.forEach(line => {
            const cells = line.split(',').map(cell => cell.replace(/"/g, ''));
            // Parse based on expected format
        });
        
        return data;
    }

    /**
     * Parse Excel content
     */
    parseExcel(content) {
        try {
            const workbook = XLSX.read(content, { type: 'array' });
            const data = {
                entries: {},
                denominations: {},
                summary: {}
            };
            
            // Parse sheets
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // Process based on sheet name
                if (sheetName === 'Entries') {
                    // Process entries data
                } else if (sheetName === 'Denominations') {
                    // Process denominations data
                }
            });
            
            return data;
        } catch (error) {
            console.error('Error parsing Excel:', error);
            return null;
        }
    }
}

// Create and export a singleton instance
const exportUtils = new ExportUtils();
window.exportUtils = exportUtils;
