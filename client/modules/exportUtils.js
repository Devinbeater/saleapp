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
                
                // Get entry type and payment methods for POS entries
                let entryType = '';
                let paymentMethods = [];
                
                if (section === 'POS' && fieldType === 'AMOUNT' && uiManager.entryTypes[cellKey]) {
                    const entryInfo = uiManager.entryTypes[cellKey];
                    entryType = entryInfo.type || '';
                    paymentMethods = entryInfo.paymentMethods || [];
                }
                
                data.entries[section][`row_${rowIndex}`] = {
                    cellKey,
                    fieldType,
                    value,
                    calculatedValue: formulaEngine.getCalculatedValue(cellKey),
                    entryType,
                    paymentMethods
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
        rows.push(['Section', 'Row', 'Field', 'Cell Key', 'Value', 'Entry Type', 'Payment Method']);
        
        Object.entries(data.entries).forEach(([section, sectionData]) => {
            Object.entries(sectionData).forEach(([rowKey, entryData]) => {
                // Format payment methods
                const paymentMethods = entryData.paymentMethods && entryData.paymentMethods.length > 0
                    ? entryData.paymentMethods.join(', ')
                    : '';
                
                rows.push([
                    section,
                    rowKey.replace('row_', ''),
                    entryData.fieldType || 'AMOUNT',
                    entryData.cellKey,
                    entryData.value,
                    entryData.entryType || '',
                    paymentMethods
                ]);
            });
        });
        
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
            ['Section', 'Row', 'Field', 'Cell Key', 'Value', 'Entry Type', 'Payment Method']
        ];
        
        Object.entries(data.entries).forEach(([section, sectionData]) => {
            Object.entries(sectionData).forEach(([rowKey, entryData]) => {
                // Format payment methods
                const paymentMethods = entryData.paymentMethods && entryData.paymentMethods.length > 0
                    ? entryData.paymentMethods.join(', ')
                    : '';
                
                entriesData.push([
                    section,
                    rowKey.replace('row_', ''),
                    entryData.fieldType || 'AMOUNT',
                    entryData.cellKey,
                    entryData.value,
                    entryData.entryType || '',
                    paymentMethods
                ]);
            });
        });
        
        const entriesSheet = XLSX.utils.aoa_to_sheet(entriesData);
        XLSX.utils.book_append_sheet(workbook, entriesSheet, 'Entries');
        
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
                <th>Field</th>
                <th>Value</th>
                <th>Entry Type</th>
                <th>Payment Method</th>
            </tr>
        </thead>
        <tbody>
            ${this.generateEntriesTableRows(data.entries)}
        </tbody>
    </table>
    
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
            Object.entries(sectionData).forEach(([rowKey, entryData]) => {
                // Format payment methods
                let paymentMethodHTML = '-';
                if (entryData.paymentMethods && entryData.paymentMethods.length > 0) {
                    const methods = entryData.paymentMethods.map(m => {
                        if (m === 'cash') return '💵 Cash';
                        if (m === 'online') return '💳 Online';
                        return m;
                    });
                    paymentMethodHTML = `<span class="payment-method">${methods.join(', ')}</span>`;
                }
                
                // Format entry type with styling
                let entryTypeHTML = '-';
                if (entryData.entryType) {
                    const type = entryData.entryType.toLowerCase();
                    entryTypeHTML = `<span class="entry-type ${type}">${entryData.entryType.toUpperCase()}</span>`;
                }
                
                rows += `
                    <tr>
                        <td>${section}</td>
                        <td>${rowKey.replace('row_', '')}</td>
                        <td>${entryData.fieldType || 'AMOUNT'}</td>
                        <td><strong>${entryData.value}</strong></td>
                        <td>${entryTypeHTML}</td>
                        <td>${paymentMethodHTML}</td>
                    </tr>
                `;
            });
        });
        
        return rows;
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
