# 🔧 Troubleshooting Guide

## ❌ Error: "client password must be a string"

### **Problem:**
```
Database query error: Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

### **Cause:**
The database password is not being read correctly from the `.env` file.

### **Solutions:**

#### **Solution 1: Check .env File Format**

Your `.env` file should look like this:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=daily_sheet_db
DB_USER=postgres
DB_PASSWORD=Omwagh@13
```

**Important:**
- ✅ No quotes around the password
- ✅ No spaces before or after `=`
- ✅ Password on same line as `DB_PASSWORD=`

#### **Solution 2: Escape Special Characters**

If your password contains special characters like `@`, you have two options:

**Option A: Use quotes in .env**
```env
DB_PASSWORD="Omwagh@13"
```

**Option B: URL encode special characters**
```env
DB_PASSWORD=Omwagh%4013
```
(where `%40` is the URL-encoded `@`)

#### **Solution 3: Verify .env Location**

Make sure `.env` file is in the **root directory**:
```
d:\New folder\New folder (2)\.env
```

NOT in:
- `server/.env` ❌
- `client/.env` ❌

#### **Solution 4: Check File Encoding**

The `.env` file should be saved as **UTF-8** without BOM.

In VS Code:
1. Open `.env` file
2. Look at bottom right corner
3. Should say "UTF-8"
4. If not, click it and select "UTF-8"

#### **Solution 5: Restart Server**

After changing `.env`:
```bash
# Stop server (Ctrl+C)
# Start again
npm start
```

---

## ✅ **Quick Fix Steps**

1. **Stop the server** (Ctrl+C)

2. **Edit `.env` file:**
```env
DB_PASSWORD=Omwagh@13
```

3. **Verify no extra spaces:**
```env
DB_HOST=localhost          ✅ Correct
DB_HOST = localhost        ❌ Wrong (spaces)
DB_HOST= localhost         ❌ Wrong (space after =)
```

4. **Save the file**

5. **Restart server:**
```bash
npm start
```

6. **Check output:**
```
📋 Database Configuration:
   Host: localhost
   Port: 5432
   Database: daily_sheet_db
   User: postgres
   Password: ***SET***        ← Should say SET, not NOT SET
```

---

## 🔍 **Verify Database Connection**

### **Test PostgreSQL is Running:**

**Windows:**
```powershell
# Check service status
Get-Service postgresql*

# Should show "Running"
```

**If not running:**
```powershell
Start-Service postgresql-x64-14
```

### **Test Login Manually:**
```bash
psql -U postgres -d daily_sheet_db
```

**If this works**, your credentials are correct!

---

## 📝 **Common Issues**

### **Issue 1: Password Not Set**
```
Password: ***NOT SET***
```

**Fix:** Add `DB_PASSWORD=YourPassword` to `.env`

### **Issue 2: Wrong Database Name**
```
database "daily_sheet_db" does not exist
```

**Fix:** Create database:
```sql
CREATE DATABASE daily_sheet_db;
```

### **Issue 3: Wrong User/Password**
```
password authentication failed for user "postgres"
```

**Fix:** 
1. Reset PostgreSQL password
2. Update `.env` with correct password

### **Issue 4: PostgreSQL Not Running**
```
connect ECONNREFUSED 127.0.0.1:5432
```

**Fix:** Start PostgreSQL service

---

## 🎯 **Expected Successful Output**

When everything works, you should see:

```
📋 Database Configuration:
   Host: localhost
   Port: 5432
   Database: daily_sheet_db
   User: postgres
   Password: ***SET***

✅ Database connection successful: 2025-10-16T15:05:26.189Z
✅ Database tables initialized successfully
✅ Database ready
Server running on port 3000
Open http://localhost:3000 to view the application
```

---

## 🔧 **Advanced Debugging**

### **Check Environment Variables:**

Add this to `server/index.js` temporarily:
```javascript
console.log('Environment check:');
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD?.length);
console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);
```

### **Test Connection Directly:**

Create `test-connection.js`:
```javascript
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'daily_sheet_db',
    user: 'postgres',
    password: 'Omwagh@13', // Hardcoded for testing
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error:', err.message);
    } else {
        console.log('✅ Success:', res.rows[0]);
    }
    pool.end();
});
```

Run:
```bash
node test-connection.js
```

If this works, the issue is with `.env` loading.

---

## 📞 **Still Having Issues?**

### **Check These:**

1. ✅ PostgreSQL installed and running
2. ✅ Database `daily_sheet_db` exists
3. ✅ `.env` file in root directory
4. ✅ No quotes around password in `.env`
5. ✅ No extra spaces in `.env`
6. ✅ File saved as UTF-8
7. ✅ Server restarted after changes

### **Get More Info:**

Run with debug logging:
```bash
DEBUG=* npm start
```

---

## ✅ **Solution Summary**

**Most Common Fix:**

1. Edit `.env`:
```env
DB_PASSWORD=Omwagh@13
```

2. No quotes, no spaces

3. Save file

4. Restart server:
```bash
npm start
```

**Should work!** 🎉
