# 🚀 POS Cash Management System - Quick Reference

## ✅ What's Working Now

### **Debtor Management**
```
Click "Add Debtor" → Fill form → Add
• Party Name (required)
• Amount (required)
• Salesman (optional)
• Bill Number (auto-generated)

Result: Debtor added to pending list
```

### **Collection Recording**
```
Click "Record Collection" → Select debtor → Record
• Choose from pending debtors
• Amount pre-filled
• Select payment mode
• Confirm payment

Result: Debtor marked as paid, collection recorded
```

### **Expense Tracking**
```
Click "Add Expense" → Fill form → Add
• Purpose (required)
• Amount (required)
• Category (dropdown)
• Notes (optional)

Result: Expense added, available cash updated
```

---

## 📊 Real-Time Displays

### **Cash Summary (Right Sidebar)**
- **Opening Cash**: Manual input
- **Total Sale**: Auto-calculated from POS
- **Debit Cash**: Opening + Total Sale
- **Net Amount**: Debit - (QR + Swipe + Debtors + BharatPE)
- **SWIPE**: Count (Amount) - e.g., 6 (7330)
- **DEBTORS**: Count (Amount) - e.g., 4 (14230)
- **COLLECTION**: Count (Amount) - e.g., 2 (16540)
- **Difference**: Red if ≠ 0

### **Debtors Section**
- **Pending**: Count badge
- **Total Amount**: Blue text
- **List**: Last 3 pending debtors

### **Collections Section**
- **List**: Last 3 collections today

### **Expenses Section**
- **Total Expenses**: Today's total
- **Available Cash**: Debit - Expenses (red if negative)
- **List**: Last 3 expenses today

---

## 🔢 Formulas

```javascript
Total Sale = Sum of POS entries

Debit Cash = Opening Cash + Total Sale

Available Cash = Debit Cash - Total Expenses

Net Amount = Debit Cash - (KQR + KSW + Debtors + BharatPE)

Collection = Denominations + KQR + KSW + BharatPE + Collections

Difference = Net Amount - Denominations
```

---

## 💾 Data Storage

All data saved to **localStorage**:
- `pos_debtors` - Debtors array
- `pos_collections` - Collections array
- `pos_expenses` - Expenses array
- Auto-saves on every change

---

## 🎨 UI Features

- ✅ Spiritual header "!! Shree Ganeshay Namha !!"
- ✅ Dark theme toggle
- ✅ Toast notifications
- ✅ Count badges
- ✅ Real-time updates
- ✅ Form validation
- ✅ Modal dialogs
- ✅ Responsive design

---

## ⚠️ Validation Rules

### **Debtors**
- Party name required
- Amount > 0
- Bill number auto-generated if empty

### **Collections**
- Debtor must be selected
- Amount > 0
- Amount ≤ pending amount

### **Expenses**
- Purpose required
- Amount > 0
- Warning if amount > available cash

---

## 🔑 Keyboard Shortcuts

- **Ctrl+S**: Save sheet
- **Ctrl+P**: Generate report
- **Ctrl+/**: Toggle help
- **Enter**: Next row
- **Tab**: Next cell
- **Esc**: Close modal

---

## 📱 Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (expected)
- ✅ Mobile browsers

---

## 🐛 Troubleshooting

### **Modal won't open**
- Check browser console for errors
- Ensure all scripts loaded

### **Data not saving**
- Check localStorage is enabled
- Clear browser cache if needed

### **Calculations wrong**
- Verify opening cash entered
- Check all POS entries
- Verify denominations counted

### **Toast not showing**
- Check status bar element exists
- Verify modalHandlers loaded

---

## 📞 Quick Help

**Add Debtor**: Sidebar → Debtors → Add Debtor  
**Record Collection**: Sidebar → Collections → Record Collection  
**Add Expense**: Sidebar → Expenses → Add Expense  
**View Data**: Check respective lists in sidebar  
**Update Calculations**: Automatic on any change  

---

## 🎯 Common Workflows

### **Daily Workflow**
```
1. Enter opening cash
2. Add POS entries throughout day
3. Add debtors as needed
4. Record collections when received
5. Add expenses as incurred
6. Count denominations at day end
7. Verify difference = 0
8. (Day closing - coming in Phase 4)
```

### **Debtor Workflow**
```
1. Customer buys on credit
2. Add debtor with party name & amount
3. Debtor appears in pending list
4. When customer pays:
5. Record collection
6. Debtor marked as paid
7. Collection added to today's total
```

### **Expense Workflow**
```
1. Shop expense occurs
2. Add expense with purpose & amount
3. Available cash reduces
4. If negative, warning shown
5. Expense appears in list
6. Total expenses updates
```

---

**Version**: Phase 3 Complete  
**Last Updated**: October 16, 2025  
**Status**: Fully Functional Core Features
