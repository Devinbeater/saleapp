/**
 * Modal Handlers Module
 * Manages all modal interactions for Debtors, Collections, and Expenses
 */

class ModalHandlers {
    constructor() {
        this.currentDebtorId = null;
        this.initializeEventListeners();
    }

    /**
     * Initialize all modal event listeners
     */
    initializeEventListeners() {
        // Debtor Modal
        this.setupDebtorModal();
        
        // Collection Modal
        this.setupCollectionModal();
        
        // Expense Modal
        this.setupExpenseModal();
    }

    /**
     * Setup Debtor Modal handlers
     */
    setupDebtorModal() {
        const addDebtorBtn = document.getElementById('add-debtor-btn');
        const closeDebtorBtn = document.getElementById('close-debtor-modal');
        const cancelDebtorBtn = document.getElementById('cancel-debtor');
        const confirmDebtorBtn = document.getElementById('confirm-debtor');
        const debtorModal = document.getElementById('add-debtor-modal');

        if (addDebtorBtn) {
            addDebtorBtn.addEventListener('click', () => {
                this.openDebtorModal();
            });
        }

        if (closeDebtorBtn) {
            closeDebtorBtn.addEventListener('click', () => {
                this.closeDebtorModal();
            });
        }

        if (cancelDebtorBtn) {
            cancelDebtorBtn.addEventListener('click', () => {
                this.closeDebtorModal();
            });
        }

        if (confirmDebtorBtn) {
            confirmDebtorBtn.addEventListener('click', () => {
                this.handleAddDebtor();
            });
        }

        if (debtorModal) {
            debtorModal.addEventListener('click', (e) => {
                if (e.target === debtorModal) {
                    this.closeDebtorModal();
                }
            });
        }
    }

    /**
     * Setup Collection Modal handlers
     */
    setupCollectionModal() {
        const recordCollectionBtn = document.getElementById('record-collection-btn');
        const closeCollectionBtn = document.getElementById('close-collection-modal');
        const cancelCollectionBtn = document.getElementById('cancel-collection');
        const confirmCollectionBtn = document.getElementById('confirm-collection');
        const collectionModal = document.getElementById('collection-modal');
        const debtorSelect = document.getElementById('collection-debtor');

        if (recordCollectionBtn) {
            recordCollectionBtn.addEventListener('click', () => {
                this.openCollectionModal();
            });
        }

        if (closeCollectionBtn) {
            closeCollectionBtn.addEventListener('click', () => {
                this.closeCollectionModal();
            });
        }

        if (cancelCollectionBtn) {
            cancelCollectionBtn.addEventListener('click', () => {
                this.closeCollectionModal();
            });
        }

        if (confirmCollectionBtn) {
            confirmCollectionBtn.addEventListener('click', () => {
                this.handleRecordCollection();
            });
        }

        if (collectionModal) {
            collectionModal.addEventListener('click', (e) => {
                if (e.target === collectionModal) {
                    this.closeCollectionModal();
                }
            });
        }

        if (debtorSelect) {
            debtorSelect.addEventListener('change', (e) => {
                this.handleDebtorSelection(e.target.value);
            });
        }
    }

    /**
     * Setup Expense Modal handlers
     */
    setupExpenseModal() {
        const addExpenseBtn = document.getElementById('add-expense-btn');
        const closeExpenseBtn = document.getElementById('close-expense-modal');
        const cancelExpenseBtn = document.getElementById('cancel-expense');
        const confirmExpenseBtn = document.getElementById('confirm-expense');
        const expenseModal = document.getElementById('expense-modal');

        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                this.openExpenseModal();
            });
        }

        if (closeExpenseBtn) {
            closeExpenseBtn.addEventListener('click', () => {
                this.closeExpenseModal();
            });
        }

        if (cancelExpenseBtn) {
            cancelExpenseBtn.addEventListener('click', () => {
                this.closeExpenseModal();
            });
        }

        if (confirmExpenseBtn) {
            confirmExpenseBtn.addEventListener('click', () => {
                this.handleAddExpense();
            });
        }

        if (expenseModal) {
            expenseModal.addEventListener('click', (e) => {
                if (e.target === expenseModal) {
                    this.closeExpenseModal();
                }
            });
        }
    }

    /**
     * Open Debtor Modal
     */
    openDebtorModal() {
        const modal = document.getElementById('add-debtor-modal');
        if (modal) {
            // Clear form
            document.getElementById('debtor-party-name').value = '';
            document.getElementById('debtor-salesman').value = '';
            document.getElementById('debtor-bill-no').value = '';
            document.getElementById('debtor-amount').value = '';
            document.getElementById('debtor-notes').value = '';
            
            modal.classList.add('show');
        }
    }

    /**
     * Close Debtor Modal
     */
    closeDebtorModal() {
        const modal = document.getElementById('add-debtor-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Handle Add Debtor
     */
    handleAddDebtor() {
        const partyName = document.getElementById('debtor-party-name').value.trim();
        const salesman = document.getElementById('debtor-salesman').value.trim();
        const billNo = document.getElementById('debtor-bill-no').value.trim();
        const amount = parseFloat(document.getElementById('debtor-amount').value);
        const notes = document.getElementById('debtor-notes').value.trim();

        // Validation
        if (!partyName) {
            alert('⚠️ Party name is required!');
            return;
        }

        if (!amount || amount <= 0) {
            alert('⚠️ Please enter a valid amount!');
            return;
        }

        // Get serial number
        const serialNo = typeof serialManager !== 'undefined' 
            ? serialManager.getNextSerial() 
            : null;

        // Add debtor
        const debtor = debtorsManager.addDebtor({
            serialNo: serialNo,
            partyName: partyName,
            salesman: salesman,
            billNo: billNo,
            amount: amount,
            notes: notes
        });

        // Update UI
        this.refreshDebtorsList();
        this.updateDebtorsSummary();
        
        // Update calculations
        if (typeof calculationsManager !== 'undefined') {
            calculationsManager.updateAllDisplays();
        }

        // Close modal
        this.closeDebtorModal();

        // Show success message
        this.showToast(`✅ Debtor added: ${partyName} - ₹${amount.toFixed(2)}`, 'success');
    }

    /**
     * Open Collection Modal
     */
    openCollectionModal() {
        const modal = document.getElementById('collection-modal');
        if (modal) {
            // Populate pending debtors dropdown
            this.populatePendingDebtors();
            
            // Clear form
            document.getElementById('collection-debtor').value = '';
            document.getElementById('collection-amount').value = '';
            document.getElementById('collection-payment-mode').value = 'Cash';
            document.getElementById('collection-debtor-details').style.display = 'none';
            
            modal.classList.add('show');
        }
    }

    /**
     * Close Collection Modal
     */
    closeCollectionModal() {
        const modal = document.getElementById('collection-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Populate pending debtors dropdown
     */
    populatePendingDebtors() {
        const select = document.getElementById('collection-debtor');
        if (!select) return;

        // Clear existing options except first
        select.innerHTML = '<option value="">-- Select Pending Debtor --</option>';

        // Get pending debtors
        const pendingDebtors = debtorsManager.getPending();

        pendingDebtors.forEach(debtor => {
            const option = document.createElement('option');
            option.value = debtor.id;
            option.textContent = `${debtor.partyName} - ₹${debtor.amount.toFixed(2)} (${debtor.billNo})`;
            select.appendChild(option);
        });
    }

    /**
     * Handle debtor selection in collection modal
     */
    handleDebtorSelection(debtorId) {
        const detailsDiv = document.getElementById('collection-debtor-details');
        
        if (!debtorId) {
            detailsDiv.style.display = 'none';
            return;
        }

        const debtor = debtorsManager.getById(parseInt(debtorId));
        if (!debtor) return;

        // Show details
        document.getElementById('collection-party-name').textContent = debtor.partyName;
        document.getElementById('collection-bill-no').textContent = debtor.billNo;
        document.getElementById('collection-pending-amount').textContent = `₹${debtor.amount.toFixed(2)}`;
        document.getElementById('collection-amount').value = debtor.amount.toFixed(2);
        
        detailsDiv.style.display = 'block';
        this.currentDebtorId = debtor.id;
    }

    /**
     * Handle Record Collection
     */
    handleRecordCollection() {
        const debtorId = parseInt(document.getElementById('collection-debtor').value);
        const amount = parseFloat(document.getElementById('collection-amount').value);
        const paymentMode = document.getElementById('collection-payment-mode').value;

        // Validation
        if (!debtorId) {
            alert('⚠️ Please select a debtor!');
            return;
        }

        if (!amount || amount <= 0) {
            alert('⚠️ Please enter a valid amount!');
            return;
        }

        const debtor = debtorsManager.getById(debtorId);
        if (!debtor) {
            alert('⚠️ Debtor not found!');
            return;
        }

        if (amount > debtor.amount) {
            alert(`⚠️ Amount exceeds pending amount of ₹${debtor.amount.toFixed(2)}!`);
            return;
        }

        // Get serial number for collection
        const serialNo = typeof serialManager !== 'undefined' 
            ? serialManager.getNextSerial() 
            : null;

        // Record collection
        const collection = collectionsManager.addCollection({
            debtorId: debtorId,
            partyName: debtor.partyName,
            salesman: debtor.salesman,
            billNo: debtor.billNo,
            amount: amount,
            paymentMode: paymentMode,
            serialNo: serialNo
        });

        // Update UI
        this.refreshCollectionsList();
        this.refreshDebtorsList();
        this.updateDebtorsSummary();
        
        // Update calculations
        if (typeof calculationsManager !== 'undefined') {
            calculationsManager.updateAllDisplays();
        }

        // Close modal
        this.closeCollectionModal();

        // Show success message
        this.showToast(`✅ Collection recorded: ${debtor.partyName} - ₹${amount.toFixed(2)}`, 'success');
    }

    /**
     * Open Expense Modal
     */
    openExpenseModal() {
        const modal = document.getElementById('expense-modal');
        if (modal) {
            // Update available cash display
            const availableCash = typeof calculationsManager !== 'undefined'
                ? calculationsManager.getAvailableCash()
                : 0;
            
            document.getElementById('modal-available-cash').textContent = `₹${availableCash.toFixed(2)}`;
            
            // Clear form
            document.getElementById('expense-purpose').value = '';
            document.getElementById('expense-amount').value = '';
            document.getElementById('expense-category').value = 'General';
            document.getElementById('expense-notes').value = '';
            
            modal.classList.add('show');
        }
    }

    /**
     * Close Expense Modal
     */
    closeExpenseModal() {
        const modal = document.getElementById('expense-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Handle Add Expense
     */
    handleAddExpense() {
        const purpose = document.getElementById('expense-purpose').value.trim();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const notes = document.getElementById('expense-notes').value.trim();

        // Validation
        if (!purpose) {
            alert('⚠️ Purpose is required!');
            return;
        }

        if (!amount || amount <= 0) {
            alert('⚠️ Please enter a valid amount!');
            return;
        }

        // Check available cash
        const availableCash = typeof calculationsManager !== 'undefined'
            ? calculationsManager.getAvailableCash()
            : 0;

        if (amount > availableCash) {
            const confirm = window.confirm(
                `⚠️ Warning: Expense amount (₹${amount.toFixed(2)}) exceeds available cash (₹${availableCash.toFixed(2)}).\n\n` +
                `This will result in negative balance. Continue anyway?`
            );
            if (!confirm) return;
        }

        // Add expense
        const expense = expensesManager.addExpense({
            purpose: purpose,
            amount: amount,
            category: category,
            notes: notes
        });

        if (expense) {
            // Update UI
            this.refreshExpensesList();
            this.updateExpensesSummary();
            
            // Update calculations
            if (typeof calculationsManager !== 'undefined') {
                calculationsManager.updateAllDisplays();
            }

            // Close modal
            this.closeExpenseModal();

            // Show success message
            this.showToast(`✅ Expense added: ${purpose} - ₹${amount.toFixed(2)}`, 'success');
        }
    }

    /**
     * Refresh Debtors List
     */
    refreshDebtorsList() {
        const listContainer = document.getElementById('debtors-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        const pendingDebtors = debtorsManager.getPending();

        if (pendingDebtors.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 1rem;">No pending debtors</p>';
            return;
        }

        // Show only last 3 debtors
        const recentDebtors = pendingDebtors.slice(-3).reverse();

        recentDebtors.forEach(debtor => {
            const item = document.createElement('div');
            item.className = 'debtor-item';
            item.innerHTML = `
                <div class="item-header">
                    <span class="item-title">${debtor.partyName}</span>
                    <span class="item-amount">₹${debtor.amount.toFixed(2)}</span>
                </div>
                <div class="item-details">
                    <span>Bill: ${debtor.billNo}</span>
                    ${debtor.salesman ? `<span>Salesman: ${debtor.salesman}</span>` : ''}
                    <span>Date: ${new Date(debtor.date).toLocaleDateString()}</span>
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    /**
     * Refresh Collections List
     */
    refreshCollectionsList() {
        const listContainer = document.getElementById('collections-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        const today = new Date().toISOString().split('T')[0];
        const todayCollections = collectionsManager.getByDate(today);

        if (todayCollections.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 1rem;">No collections today</p>';
            return;
        }

        // Show only last 3 collections
        const recentCollections = todayCollections.slice(-3).reverse();

        recentCollections.forEach(collection => {
            const item = document.createElement('div');
            item.className = 'collection-item';
            item.innerHTML = `
                <div class="item-header">
                    <span class="item-title">${collection.partyName}</span>
                    <span class="item-amount">₹${collection.amount.toFixed(2)}</span>
                </div>
                <div class="item-details">
                    <span>Bill: ${collection.billNo}</span>
                    <span>Mode: ${collection.paymentMode}</span>
                    ${collection.salesman ? `<span>Salesman: ${collection.salesman}</span>` : ''}
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    /**
     * Refresh Expenses List
     */
    refreshExpensesList() {
        const listContainer = document.getElementById('expenses-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        const today = new Date().toISOString().split('T')[0];
        const todayExpenses = expensesManager.getByDate(today);

        if (todayExpenses.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 1rem;">No expenses today</p>';
            return;
        }

        // Show only last 3 expenses
        const recentExpenses = todayExpenses.slice(-3).reverse();

        recentExpenses.forEach(expense => {
            const item = document.createElement('div');
            item.className = 'expense-item';
            item.innerHTML = `
                <div class="item-header">
                    <span class="item-title">${expense.purpose}</span>
                    <span class="item-amount">₹${expense.amount.toFixed(2)}</span>
                </div>
                <div class="item-details">
                    <span>${expense.time} | ${expense.category}</span>
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    /**
     * Update Debtors Summary
     */
    updateDebtorsSummary() {
        const countElement = document.getElementById('pending-debtors-count');
        const amountElement = document.getElementById('pending-debtors-amount');

        if (countElement) {
            countElement.textContent = debtorsManager.getPendingCount();
        }

        if (amountElement) {
            amountElement.textContent = `₹${debtorsManager.getTotalPending().toFixed(2)}`;
        }
    }

    /**
     * Update Expenses Summary
     */
    updateExpensesSummary() {
        const totalElement = document.getElementById('total-expenses-display');
        const availableElement = document.getElementById('available-cash-display');

        if (totalElement) {
            totalElement.textContent = `₹${expensesManager.getTotalExpenses().toFixed(2)}`;
        }

        if (availableElement && typeof calculationsManager !== 'undefined') {
            const availableCash = calculationsManager.getAvailableCash();
            availableElement.textContent = `₹${availableCash.toFixed(2)}`;
            
            // Highlight if negative
            if (availableCash < 0) {
                availableElement.style.color = '#ef4444';
                availableElement.style.fontWeight = 'bold';
            } else {
                availableElement.style.color = '';
                availableElement.style.fontWeight = '';
            }
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const statusBar = document.getElementById('status-bar');
        if (statusBar) {
            statusBar.textContent = message;
            statusBar.className = `status-bar ${type}`;
            
            setTimeout(() => {
                statusBar.className = 'status-bar';
                statusBar.innerHTML = '<i class="fas fa-check-circle"></i><span>All changes saved</span>';
            }, 3000);
        }
    }

    /**
     * Initialize all lists on page load
     */
    initializeLists() {
        this.refreshDebtorsList();
        this.refreshCollectionsList();
        this.refreshExpensesList();
        this.updateDebtorsSummary();
        this.updateExpensesSummary();
    }
}

// Export singleton instance
const modalHandlers = new ModalHandlers();
