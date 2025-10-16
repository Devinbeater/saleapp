# 🚀 POS Cash Management System - Implementation Roadmap

## 📊 Document Overview
This document provides a complete implementation guide for building the missing features of the POS Cash Management & Tracking System based on the SRS requirements.

---

## 🎯 Gap Analysis Summary

### ✅ Already Implemented (Current System)
- ✓ Spiritual Header (!! Shree Ganeshay Namha !!)
- ✓ Opening Cash Input (basic)
- ✓ POS Entry Modal (Sale/Return/Salesman/Party)
- ✓ Entry Type Badges (Color-coded)
- ✓ Basic Denominations Table
- ✓ Auto-calculations (Total Sale, Debit Cash, Net Amount)
- ✓ BharatPE Input
- ✓ Collection Display (basic)
- ✓ Difference Calculation with Red Highlight
- ✓ SWIPE Total
- ✓ DEBTORS Total
- ✓ Save/Export Functionality

### ❌ Missing Features (To Be Implemented)
- ✗ Serial Number Auto-generation (1-150)
- ✗ QR & Swipe blank serial logic
- ✗ Payment Mode Dropdown (Cash/Online/QR/Swipe/Debtors)
- ✗ Debtors Management Module (Names, Bills, Tracking)
- ✗ Debit Cash (Expense) Module
- ✗ Collection Module (Debtor Payment Recording)
- ✗ Opening Cash Denomination Breakdown
- ✗ Validation Rules & Alerts
- ✗ Day Closing Logic
- ✗ Multiple Report Types
- ✗ Debtor Payment Status Tracking

---

## 📋 Implementation Phases

### **PHASE 1: Core Transaction Management**

#### **1.1 Serial Number Auto-generation System**

**Requirement**: FR1 - System assigns Sr. No. 1–150 for all transactions

**Current State**: 
- No serial number tracking
- POS entries have no numbering system

**Implementation Flow**:
```
User enters POS amount
        ↓
Modal shows: Entry Type Selection
        ↓
User selects: Sale/Return/Salesman/Party
        ↓
System checks: Is it Cash-based?
        ↓
   YES         NO (QR/Swipe)
    ↓              ↓
Assign next   Leave blank
Sr. No.       (no number)
    ↓              ↓
Display in table
```

**Files to Create/Modify**:
- `client/modules/serialNumber.js` - ⭐ NEW MODULE
- `client/index.html` - Add Sr. No. column in table
- `client/modules/calculations.js` - Handle numbering rules

**Data Structure**:
```javascript
{
    serialNo: 1,              // Auto-incremented (1-150)
    date: '2025-10-16',
    entryType: 'Sale',
    paymentMode: 'Cash',
    amount: 500
}
```

**Validation Rules**:
```javascript
// Rule 1: Only Cash/Debtors get serial numbers
if (paymentMode === 'QR' || paymentMode === 'SWIPE') {
    serialNumber = ''; // Blank
} else {
    serialNumber = getNextSerial(); // 1-150
}

// Rule 2: Max 150 bills per day
if (currentSerial > 150) {
    alert('Maximum 150 bills reached for today!');
    return false;
}
```

---

#### **1.2 Payment Mode Dropdown System**

**Requirement**: FR2, FR3 - Support Cash, Online, QR, Swipe, Debtors with dropdown

**Current State**:
- Uses modal with 4 entry types (Sale/Return/Salesman/Party)
- No explicit payment mode selection
- Separate columns for QR, Swipe, Debtors

**Enhanced Modal Structure**:
```
┌─────────────────────────────────────┐
│ Enhanced Payment Mode System        │
├─────────────────────────────────────┤
│ Step 1: Entry Type                  │
│   ○ Sale / Return / Salesman        │
│                                     │
│ Step 2: Payment Mode ⭐ NEW         │
│   [Dropdown]                        │
│   • Cash                            │
│   • Online                          │
│   • QR                              │
│   • SWIPE                           │
│   • Debtors                         │
│                                     │
│ Step 3 (if Debtors): Party Details  │
│   Name: [_____________]             │
│   Bill No: [_____________]          │
└─────────────────────────────────────┘
```

**Files to Create/Modify**:
- `client/index.html` - Update modal structure
- `client/modules/ui.js` - Add payment mode logic
- `client/style.css` - Style dropdown

**Enhanced Data Structure**:
```javascript
{
    serialNo: 1,
    date: '2025-10-16',
    entryType: 'Sale',
    paymentMode: 'Cash',      // ⭐ NEW
    amount: 500,
    partyName: null,          // ⭐ NEW (for Debtors)
    billNo: null              // ⭐ NEW (for Debtors)
}
```

---

### **PHASE 2: Debtors Management System**

#### **2.1 Debtors Module**

**Requirement**: FR3 - Track parties who pay later

**Current State**:
- Only has "Debtors" column in POS table
- No party name tracking
- No payment status management

**UI Design**:
```
┌──────────────────────────────────────────┐
│ DEBTORS MANAGEMENT PANEL                 │
├──────────────────────────────────────────┤
│                                          │
│ [Add New Debtor] [View All] [Pending]   │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Sr. │ Date  │ Party    │ Bill │ ₹  │  │
│ │ No. │       │ Name     │ No.  │    │  │
│ ├────────────────────────────────────┤  │
│ │ 1   │10/16  │ Sharma   │ B101 │500 │  │
│ │ 2   │10/16  │ Patel    │ B102 │750 │  │
│ │ 3   │10/16  │ Kumar    │ B103 │300 │  │
│ └────────────────────────────────────┘  │
│                                          │
│ Total Pending: ₹1,550.00                 │
│                                          │
│ [Collect Payment]                        │
└──────────────────────────────────────────┘
```

**Files to Create/Modify**:
- `client/modules/debtors.js` - ⭐ NEW MODULE
- `client/index.html` - Add debtors panel
- `client/modules/storage.js` - Add debtors storage

**Data Structure**:
```javascript
debtors = [
    {
        id: 1,
        serialNo: 5,
        date: '2025-10-16',
        partyName: 'Sharma Traders',
        billNo: 'B101',
        amount: 500,
        status: 'Pending',        // Pending/Paid
        collectedOn: null,
        collectionSerial: null
    }
]
```

**Flow**:
```
POS Entry with Payment Mode = 'Debtors'
        ↓
Prompt for Party Details:
   • Party Name
   • Bill Number (optional)
        ↓
Add to Debtors Array
        ↓
Show in Debtors Panel
        ↓
Display total pending amount
        ↓
When payment received:
        ↓
Mark as 'Paid'
        ↓
Move to Collection
```

---

#### **2.2 Collection Module**

**Requirement**: FR5 - Record payments received from Debtors

**Current State**:
- Only shows calculated collection total
- No interface to record debtor payments
- No link between debtors and collections

**UI Design**:
```
┌──────────────────────────────────────────┐
│ COLLECTION ENTRY                         │
├──────────────────────────────────────────┤
│                                          │
│ Select Debtor to Collect:                │
│ [Dropdown: Pending Debtors]              │
│                                          │
│ Party Name: Sharma Traders               │
│ Bill No: B101                            │
│ Pending Amount: ₹500.00                  │
│                                          │
│ Amount Collecting: [₹______]             │
│ Collection Date: [10/16/2025]            │
│ Payment Mode: [Cash ▼]                   │
│                                          │
│        [Cancel]    [Record Payment]      │
└──────────────────────────────────────────┘
```

**Files to Create/Modify**:
- `client/modules/collections.js` - ⭐ NEW MODULE
- `client/index.html` - Add collection interface
- `client/modules/calculations.js` - Update formulas

**Data Structure**:
```javascript
collections = [
    {
        id: 1,
        collectionDate: '2025-10-16',
        serialNo: 25,
        debtorId: 1,
        partyName: 'Sharma Traders',
        billNo: 'B101',
        amount: 500,
        paymentMode: 'Cash'
    }
]
```

**Calculation Updates**:
```javascript
// Current Collection Formula:
Collection = Denominations + KQR + KSW + Debtors + BharatPE

// ⭐ NEW Formula:
Total Sale = POS Entries + Collected Payments
Collection = Denominations + KQR + KSW + Debtors + BharatPE + Collections
```

---

### **PHASE 3: Expense Management**

#### **3.1 Debit Cash (Expense Module)**

**Requirement**: FR4 - Track shop expenses

**Current State**:
- No expense tracking
- No deduction from cash balance
- No expense categories

**UI Design**:
```
┌──────────────────────────────────────────┐
│ DEBIT CASH (EXPENSES)                    │
├──────────────────────────────────────────┤
│                                          │
│ [+ Add Expense]                          │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Time  │ Purpose      │ Amount   │[×]│  │
│ ├────────────────────────────────────┤  │
│ │ 10:30 │ Vegetables   │ ₹200.00  │ × │  │
│ │ 12:00 │ Transport    │ ₹150.00  │ × │  │
│ │ 15:45 │ Stationary   │ ₹50.00   │ × │  │
│ └────────────────────────────────────┘  │
│                                          │
│ Total Expenses: ₹400.00                  │
│                                          │
│ ⚠️ Available Cash: ₹4,600.00             │
└──────────────────────────────────────────┘
```

**Flow**:
```
Click "Add Expense"
        ↓
Show expense form:
   • Purpose/Description
   • Amount
   • Time (auto)
        ↓
Validate: Amount <= Available Cash?
        ↓
    NO              YES
     ↓               ↓
Show alert:      Add expense
"Insufficient    to list
Cash!"              ↓
                Deduct from
                total cash
                    ↓
                Update Net Amount
                    ↓
                Highlight if negative
```

**Files to Create/Modify**:
- `client/modules/expenses.js` - ⭐ NEW MODULE
- `client/index.html` - Add expense panel
- `client/modules/calculations.js` - Update formulas

**Data Structure**:
```javascript
expenses = [
    {
        id: 1,
        date: '2025-10-16',
        time: '10:30',
        purpose: 'Vegetables',
        amount: 200,
        category: 'General'
    }
]
```

**Updated Calculations**:
```javascript
// Current Formula:
Net Amount = Debit Cash - (KQR + KSW + Debtors + BharatPE)

// ⭐ NEW Formula:
Available Cash = Debit Cash - Total Expenses
Net Amount = Available Cash - (KQR + KSW + Debtors + BharatPE)

// Alert Logic:
if (Available Cash < 0) {
    alert('⚠️ NEGATIVE BALANCE! Expenses exceed available cash.');
    highlightInRed();
}
```

---

### **PHASE 4: Opening Cash Enhancement**

#### **4.1 Opening Cash Denomination Breakdown**

**Requirement**: FR6 - Calculate opening cash via denomination

**Current State**: 
- Simple input field for opening cash
- No denomination breakdown at start

**UI Design**:
```
┌──────────────────────────────────────────┐
│ OPENING CASH (Day Start)                 │
├──────────────────────────────────────────┤
│                                          │
│ Enter Opening Denominations:             │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ ₹2000 × [__] pcs = ₹______         │  │
│ │ ₹500  × [__] pcs = ₹______         │  │
│ │ ₹200  × [__] pcs = ₹______         │  │
│ │ ₹100  × [__] pcs = ₹______         │  │
│ │ ₹50   × [__] pcs = ₹______         │  │
│ │ ₹20   × [__] pcs = ₹______         │  │
│ │ ₹10   × [__] pcs = ₹______         │  │
│ │ ₹5    × [__] pcs = ₹______         │  │
│ │ ₹2    × [__] pcs = ₹______         │  │
│ │ ₹1    × [__] pcs = ₹______         │  │
│ │ Coins:         = ₹______         │  │
│ └────────────────────────────────────┘  │
│                                          │
│ Total Opening Cash: ₹5,000.00            │
│                                          │
│ [Save & Start Day]                       │
└──────────────────────────────────────────┘
```

**Files to Modify**:
- `client/index.html` - Add opening denomination form
- `client/modules/ui.js` - Add day start logic
- `client/modules/storage.js` - Save opening data

---

### **PHASE 5: Validation & Reconciliation**

#### **5.1 Enhanced Difference Calculation**

**Requirement**: FR7, R2, R3, R4 - Accurate reconciliation logic

**Current Formula**:
```javascript
Difference = Debit Cash - Collection
```

**⭐ CORRECT Formula (as per SRS)**:
```javascript
Total Cash In Hand = Opening Cash + Total Sale - Total Expenses

Total Collections = Denomination Total + KQR + SWIPE + Debtors Paid + BharatPE

Difference = Total Cash In Hand - Total Collections
```

**Validation Rules**:
- Rule 1: QR & Swipe = No Serial Number
- Rule 2: Difference = 0 for perfect balance
- Rule 3: Positive Difference = Extra cash (recount needed)
- Rule 4: Negative Difference = Cash shortage (investigate)

**Enhanced UI**:
```
┌──────────────────────────────────────┐
│ RECONCILIATION STATUS                │
├──────────────────────────────────────┤
│ Opening Cash:        ₹5,000.00       │
│ + Sales Today:       ₹8,500.00       │
│ - Expenses:          ₹400.00         │
│ ─────────────────────────────────    │
│ Cash Should Be:      ₹13,100.00      │
│                                      │
│ Physical Cash:       ₹13,100.00      │
│ + Digital (QR/Swipe):₹0.00           │
│ ─────────────────────────────────    │
│ Total Collection:    ₹13,100.00      │
│                                      │
│ ═══════════════════════════════════  │
│ ✅ DIFFERENCE:       ₹0.00           │
│    STATUS: BALANCED                  │
└──────────────────────────────────────┘
```

---

#### **5.2 Day Closing Validation**

**Requirement**: Non-functional - Restrict edit after closing

**UI Design**:
```
┌──────────────────────────────────────┐
│ DAY CLOSING CHECKLIST                │
├──────────────────────────────────────┤
│ Before closing, verify:              │
│                                      │
│ ☐ All POS entries recorded           │
│ ☐ Expenses entered                   │
│ ☐ Debtors list updated               │
│ ☐ Collections recorded               │
│ ☐ Denominations counted              │
│ ☐ Difference = ₹0.00                 │
│                                      │
│ Status: ⚠️ NOT READY                 │
│                                      │
│ [Close Day] (disabled)               │
└──────────────────────────────────────┘
```

**Flow**:
```
User clicks "Close Day"
        ↓
Run validation checks:
   1. Is Difference = 0?
   2. Any pending debtors?
   3. All fields filled?
        ↓
    Any Failed?
        ↓
   YES           NO
    ↓             ↓
Show errors   Show confirmation
    ↓             ↓
Block        User confirms
closing           ↓
            Lock all inputs
                  ↓
            Generate report
                  ↓
            Save final data
                  ↓
            Reset for new day
```

**Files to Create/Modify**:
- `client/modules/validation.js` - ⭐ NEW MODULE
- `client/modules/dayClose.js` - ⭐ NEW MODULE
- `client/modules/ui.js` - Add lock logic

---

### **PHASE 6: Reports Generation**

#### **6.1 Multiple Report Types**

**Requirement**: Section 3.4 - Various reports

**Report 1: Daily Summary**
```
═══════════════════════════════════════════
         DAILY SUMMARY REPORT
         Date: October 16, 2025
═══════════════════════════════════════════

OPENING
  Opening Cash:                 ₹5,000.00

SALES
  Cash Sales:                   ₹7,500.00
  Online:                       ₹800.00
  QR Payments:                  ₹500.00
  Swipe:                        ₹700.00
  Debtors (Credit):             ₹1,200.00
  ─────────────────────────────────────
  Total Sales:                  ₹10,700.00

EXPENSES
  Total Expenses:               ₹400.00

COLLECTIONS
  Debtor Payments:              ₹600.00

CLOSING
  Expected Cash:                ₹13,100.00
  Physical Cash:                ₹13,100.00
  Difference:                   ₹0.00 ✅

═══════════════════════════════════════════
```

**Report 2: Debtors Report**
```
═══════════════════════════════════════════
          DEBTORS REPORT
         Date: October 16, 2025
═══════════════════════════════════════════

PENDING PAYMENTS
Sr.  Party Name         Bill No    Amount
─────────────────────────────────────────
1    Sharma Traders    B101       ₹500.00
2    Patel & Co        B105       ₹700.00
                                  ─────────
Total Pending:                    ₹1,200.00

COLLECTED TODAY
Sr.  Party Name         Bill No    Amount
─────────────────────────────────────────
3    Kumar Store       B098       ₹600.00
                                  ─────────
Total Collected:                  ₹600.00

═══════════════════════════════════════════
```

**Report 3: Expense Report**
```
═══════════════════════════════════════════
          EXPENSE REPORT
         Date: October 16, 2025
═══════════════════════════════════════════

Time    Purpose              Amount
──────────────────────────────────────
10:30   Vegetables          ₹200.00
12:00   Transport           ₹150.00
15:45   Stationary          ₹50.00
                            ────────
Total Expenses:             ₹400.00

═══════════════════════════════════════════
```

**Files to Create**:
- `client/modules/reports.js` - ⭐ NEW MODULE
- `client/modules/pdf.js` - Export functionality
- `client/templates/reports.html` - Print templates

---

## 📊 Complete System Flow

```
╔══════════════════════════════════════════════════════════╗
║                    DAY START                             ║
╚══════════════════════════════════════════════════════════╝
                           ↓
┌──────────────────────────────────────────────────────────┐
│ 1. Enter Opening Cash (via denomination breakdown)      │
└──────────────────────────────────────────────────────────┘
                           ↓
╔══════════════════════════════════════════════════════════╗
║                  TRANSACTION ENTRY                       ║
╚══════════════════════════════════════════════════════════╝
                           ↓
         ┌─────────────────┴─────────────────┐
         ↓                                   ↓
┌─────────────────┐                 ┌─────────────────┐
│  POS Entry      │                 │  Expense Entry  │
│  • Amount       │                 │  • Purpose      │
│  • Entry Type   │                 │  • Amount       │
│  • Payment Mode │                 │  • Time         │
│  • Serial Auto  │                 └─────────────────┘
└─────────────────┘                          ↓
         ↓                                   ↓
    Is Debtor?                         Deduct from
         ↓                             Available Cash
    YES      NO
     ↓        ↓
Add to    Process
Debtors   normally
List
         ↓
╔══════════════════════════════════════════════════════════╗
║                     COLLECTIONS                          ║
╚══════════════════════════════════════════════════════════╝
                           ↓
           Select pending debtor
                           ↓
           Record payment details
                           ↓
        Update debtor status to 'Paid'
                           ↓
        Add to daily total + collection list
                           ↓
╔══════════════════════════════════════════════════════════╗
║                    DAY END                               ║
╚══════════════════════════════════════════════════════════╝
                           ↓
┌──────────────────────────────────────────────────────────┐
│ 1. Count physical cash (denomination)                   │
│ 2. System calculates expected cash                      │
│ 3. Compare: Expected vs Physical                        │
│ 4. Check Difference = 0?                                │
└──────────────────────────────────────────────────────────┘
                           ↓
                   Difference = 0?
                           ↓
                    YES        NO
                     ↓          ↓
              ✅ Balanced   ⚠️ Mismatch
                     ↓          ↓
              Close Day   Investigate
                     ↓          & Fix
         Lock all entries      ↓
                     ↓     Recount
         Generate reports
                     ↓
         Archive data
                     ↓
         Reset for next day
```

---

## 🗂️ File Structure

```
project-root/
│
├── client/
│   ├── index.html                    ✏️ (Modify)
│   ├── style.css                     ✏️ (Modify)
│   │
│   ├── modules/
│   │   ├── ui.js                     ✏️ (Modify)
│   │   ├── calculations.js           ✏️ (Modify)
│   │   ├── storage.js                ✏️ (Modify)
│   │   │
│   │   ├── serialNumber.js           ⭐ NEW
│   │   ├── paymentMode.js            ⭐ NEW
│   │   ├── debtors.js                ⭐ NEW
│   │   ├── collections.js            ⭐ NEW
│   │   ├── expenses.js               ⭐ NEW
│   │   ├── validation.js             ⭐ NEW
│   │   ├── dayClose.js               ⭐ NEW
│   │   ├── reports.js                ⭐ NEW
│   │   └── pdf.js                    ⭐ NEW
│   │
│   └── templates/
│       ├── debtorModal.html          ⭐ NEW
│       ├── collectionModal.html      ⭐ NEW
│       ├── expenseModal.html         ⭐ NEW
│       └── reports.html              ⭐ NEW
│
└── server/
    └── (existing files)
```

---

## ✅ Implementation Checklist

### Phase 1: Core Transaction Management
- [ ] Serial number auto-generation (1-150)
- [ ] Blank serial for QR/Swipe
- [ ] Payment mode dropdown integration
- [ ] Update POS table with Sr. No. column

### Phase 2: Debtors Management
- [ ] Create debtors.js module
- [ ] Build debtors panel UI
- [ ] Add party name & bill number fields
- [ ] Implement debtor list display
- [ ] Add search/filter functionality
- [ ] Create status badges (Pending/Paid)
- [ ] Integrate with POS entry flow
- [ ] Calculate total pending amount
- [ ] Export debtors list functionality

### Phase 3: Collections Module
- [ ] Create collections.js module
- [ ] Build collection entry form
- [ ] Link collections to debtors
- [ ] Implement payment recording logic
- [ ] Update debtor status on payment
- [ ] Add collection to daily total
- [ ] Generate collection serial numbers
- [ ] Display collections history
- [ ] Calculate total collections

### Phase 4: Expense Management
- [ ] Create expenses.js module
- [ ] Build expense entry form
- [ ] Add purpose/description field
- [ ] Implement expense list display
- [ ] Auto-deduct from available cash
- [ ] Validate against available balance
- [ ] Show negative balance alerts
- [ ] Calculate total expenses
- [ ] Delete/edit expense entries

### Phase 5: Opening Cash Enhancement
- [ ] Build denomination breakdown form
- [ ] Add all note values (₹2000 to ₹1)
- [ ] Auto-calculate opening total
- [ ] Save opening denomination data
- [ ] Display opening balance in summary
- [ ] Integrate with day start flow

### Phase 6: Enhanced Calculations
- [ ] Update Total Sale formula
- [ ] Update Debit Cash formula
- [ ] Update Available Cash calculation
- [ ] Update Net Amount formula
- [ ] Update Collection formula
- [ ] Fix Difference calculation (per SRS)
- [ ] Add expense deduction logic
- [ ] Add collection addition logic
- [ ] Real-time calculation updates

### Phase 7: Validation & Rules
- [ ] Create validation.js module
- [ ] Implement QR/Swipe blank serial rule
- [ ] Validate max 150 bills per day
- [ ] Check difference = 0 rule
- [ ] Validate expense <= available cash
- [ ] Add reconciliation warnings
- [ ] Implement error messages
- [ ] Add form field validations

### Phase 8: Day Closing Logic
- [ ] Create dayClose.js module
- [ ] Build day closing checklist
- [ ] Implement validation checks
- [ ] Lock entries after closing
- [ ] Generate closing report
- [ ] Archive daily data
- [ ] Reset counters for new day
- [ ] Suggest next opening cash

### Phase 9: Reports System
- [ ] Create reports.js module
- [ ] Build Daily Summary Report
- [ ] Build Debtors Report
- [ ] Build Expense Report
- [ ] Build Day Closing Report
- [ ] Add print functionality
- [ ] Add PDF export
- [ ] Add Excel export
- [ ] Style report templates

### Phase 10: UI/UX Enhancements
- [ ] Update sidebar layout
- [ ] Add debtors panel section
- [ ] Add expenses panel section
- [ ] Add collections panel section
- [ ] Improve modal designs
- [ ] Add loading indicators
- [ ] Add success/error toasts
- [ ] Improve mobile responsiveness

### Phase 11: Data Management
- [ ] Implement auto-save (30 sec)
- [ ] Add manual save button
- [ ] Create data backup system
- [ ] Implement data archiving
- [ ] Add import/export features
- [ ] Handle unsaved changes warning
- [ ] Add data recovery option

### Phase 12: Testing & Validation
- [ ] Test serial number generation
- [ ] Test payment mode flows
- [ ] Test debtor management
- [ ] Test collection recording
- [ ] Test expense tracking
- [ ] Test all calculations
- [ ] Test day closing
- [ ] Test report generation
- [ ] Test with 150+ entries
- [ ] Cross-browser testing

---

## 🎯 Priority Order

### **HIGH PRIORITY** (Core Functionality)
1. Serial Number System
2. Payment Mode Dropdown
3. Debtors Management
4. Collections Module
5. Expense Tracking
6. Enhanced Calculations

### **MEDIUM PRIORITY** (Essential Features)
7. Opening Cash Denomination
8. Validation Rules
9. Day Closing Logic
10. Reports Generation

### **LOW PRIORITY** (Enhancements)
11. UI/UX Improvements
12. Advanced Data Management
13. Additional Export Options

---

## 📝 Notes

- All new modules should follow the existing code structure
- Maintain localStorage for data persistence
- Ensure mobile responsiveness
- Add proper error handling
- Include loading states for async operations
- Follow existing naming conventions
- Add comments for complex logic
- Test each feature thoroughly before moving to next phase

---

**Document Version**: 1.0  
**Last Updated**: October 16, 2025  
**Status**: Ready for Implementation
