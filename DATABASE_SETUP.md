# 🗄️ PostgreSQL Database Setup Guide

## ✅ Complete Implementation with Database

Your POS Cash Management System now includes **full PostgreSQL database integration** with light/dark theme toggle!

---

## 🎨 **New Features Added**

### **1. Light Mode Toggle** ✅
- Default: **Light Mode** (clean, bright interface)
- Toggle to **Dark Mode** (easy on eyes)
- Preference saved in localStorage
- Smooth transitions between themes

### **2. PostgreSQL Database Integration** ✅
- Full database schema implemented
- Connection pooling for performance
- Auto-initialization on startup
- Complete data persistence

---

## 📊 **Database Schema**

### **Tables Created:**

1. **daily_sheets** - Daily sheet metadata
2. **transactions** - POS transactions (Sale/Return/etc.)
3. **debtors** - Credit customers tracking
4. **collections** - Debtor payments
5. **expenses** - Daily expenses
6. **denominations** - Cash denominations

---

## 🚀 **Quick Setup (3 Steps)**

### **Step 1: Install PostgreSQL**

**Windows:**
```powershell
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**Verify Installation:**
```powershell
psql --version
```

### **Step 2: Create Database**

Open PostgreSQL command line (psql):
```sql
-- Create database
CREATE DATABASE daily_sheet_db;

-- Verify
\l
```

### **Step 3: Configure Environment**

Your `.env` file should have:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=daily_sheet_db
DB_USER=postgres
DB_PASSWORD=Omwagh@13
```

---

## 🔧 **Initialize Database**

### **Option 1: Automatic Setup (Recommended)**

Run the setup script:
```bash
node server/scripts/setup-database.js
```

**Expected Output:**
```
🚀 Starting database setup...

📡 Testing database connection...
✅ Database connection successful: 2025-10-16 20:30:00

📊 Creating database tables...
✅ Database tables initialized successfully
✅ Database ready

📋 Created tables:
   ✓ daily_sheets
   ✓ transactions
   ✓ debtors
   ✓ collections
   ✓ expenses
   ✓ denominations

🎉 Your POS Cash Management System is ready to use!
```

### **Option 2: Manual Setup**

Run the SQL script:
```bash
psql -U postgres -d daily_sheet_db -f server/sql/setup_postgres.sql
```

---

## 🎯 **Start the Application**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start Server**
```bash
npm start
```

**Expected Output:**
```
✅ Database connection successful: 2025-10-16 20:30:00
✅ Database tables initialized successfully
✅ Database ready
Server running on port 3000
Open http://localhost:3000 to view the application
```

### **3. Open Browser**
```
http://localhost:3000
```

---

## 🎨 **Using Light/Dark Mode**

### **Toggle Theme:**
1. Look for the toggle switch in the header
2. Click to switch between Light/Dark mode
3. Label updates: "Light Mode" ↔ "Dark Mode"
4. Preference saved automatically

### **Default Behavior:**
- First visit: **Light Mode**
- After toggle: Remembers your preference
- Persists across page refreshes

---

## 📊 **Database Features**

### **What's Stored in Database:**

✅ **Daily Sheets**
- Opening cash amount
- Closing cash amount
- System expected cash
- Difference
- Closure status

✅ **Transactions**
- Serial numbers (1-150)
- Entry types (Sale/Return/Salesman/Party)
- Payment modes (Cash/Online/QR/SWIPE/Debtors)
- Amounts and timestamps

✅ **Debtors**
- Party names
- Bill numbers
- Original amounts
- Amount due
- Status (Pending/Paid)

✅ **Collections**
- Debtor payments
- Collection dates
- Payment modes
- Reference IDs

✅ **Expenses**
- Purpose
- Amount
- Category
- Timestamps

✅ **Denominations**
- Opening pieces
- Closing pieces
- Calculated amounts

---

## 🔍 **Verify Database**

### **Check Tables:**
```sql
-- Connect to database
psql -U postgres -d daily_sheet_db

-- List all tables
\dt

-- Check daily_sheets
SELECT * FROM daily_sheets;

-- Check transactions
SELECT * FROM transactions;
```

### **View Schema:**
```sql
-- Describe table structure
\d daily_sheets
\d transactions
\d debtors
```

---

## 🛠️ **Troubleshooting**

### **Problem: Connection Failed**

**Check PostgreSQL is running:**
```powershell
# Windows
Get-Service postgresql*

# Start if stopped
Start-Service postgresql-x64-14
```

**Verify credentials:**
```sql
-- Test login
psql -U postgres -d daily_sheet_db
```

### **Problem: Database doesn't exist**

**Create it:**
```sql
CREATE DATABASE daily_sheet_db;
```

### **Problem: Permission denied**

**Grant permissions:**
```sql
GRANT ALL PRIVILEGES ON DATABASE daily_sheet_db TO postgres;
```

### **Problem: Port already in use**

**Change port in .env:**
```env
PORT=3001
```

---

## 📝 **Database Configuration**

### **Connection Pool Settings:**
```javascript
{
    host: 'localhost',
    port: 5432,
    database: 'daily_sheet_db',
    user: 'postgres',
    password: 'Omwagh@13',
    max: 20,                    // Max connections
    idleTimeoutMillis: 30000,   // 30 seconds
    connectionTimeoutMillis: 2000 // 2 seconds
}
```

### **Environment Variables:**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=daily_sheet_db
DB_USER=postgres
DB_PASSWORD=Omwagh@13
```

---

## 🎯 **Testing Database Connection**

### **Test Script:**
```javascript
// test-db.js
require('dotenv').config();
const db = require('./server/config/database');

async function test() {
    const result = await db.query('SELECT NOW()');
    console.log('✅ Connected:', result.rows[0]);
    await db.pool.end();
}

test();
```

**Run:**
```bash
node test-db.js
```

---

## 📊 **Database Indexes**

For optimal performance, these indexes are created:

```sql
CREATE INDEX idx_daily_sheets_date ON daily_sheets(sheet_date);
CREATE INDEX idx_transactions_sheet_id ON transactions(sheet_id);
CREATE INDEX idx_transactions_serial_number ON transactions(serial_number);
CREATE INDEX idx_debtors_sheet_id ON debtors(sheet_id);
CREATE INDEX idx_debtors_status ON debtors(status);
CREATE INDEX idx_collections_sheet_id ON collections(sheet_id);
CREATE INDEX idx_expenses_sheet_id ON expenses(sheet_id);
CREATE INDEX idx_denominations_sheet_id ON denominations(sheet_id);
```

---

## 🔐 **Security Notes**

1. **Never commit .env file** - Already in .gitignore
2. **Use strong passwords** - Change default password
3. **Limit database access** - Only from localhost in production
4. **Regular backups** - Use pg_dump

### **Backup Database:**
```bash
pg_dump -U postgres daily_sheet_db > backup.sql
```

### **Restore Database:**
```bash
psql -U postgres daily_sheet_db < backup.sql
```

---

## 📈 **Performance Tips**

1. **Connection Pooling** - Already configured (max 20)
2. **Indexes** - Already created on key columns
3. **Prepared Statements** - Use parameterized queries
4. **Regular Maintenance** - Run VACUUM periodically

```sql
-- Optimize database
VACUUM ANALYZE;
```

---

## ✅ **Verification Checklist**

- [ ] PostgreSQL installed and running
- [ ] Database `daily_sheet_db` created
- [ ] `.env` file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Database setup script run successfully
- [ ] Server starts without errors
- [ ] Application opens in browser
- [ ] Light/Dark mode toggle works
- [ ] Can add debtors/expenses/collections

---

## 🎉 **You're All Set!**

Your POS Cash Management System now has:

✅ **Full PostgreSQL database integration**  
✅ **Light/Dark mode toggle**  
✅ **Complete data persistence**  
✅ **Professional database schema**  
✅ **Automatic table creation**  
✅ **Connection pooling**  
✅ **Error handling**  

**Start using:** `npm start` → Open `http://localhost:3000`

---

**Last Updated**: October 16, 2025  
**Status**: ✅ Database Integration Complete  
**Theme**: ✅ Light/Dark Mode Added
