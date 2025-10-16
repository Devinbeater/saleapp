/**
 * Quick Database Connection Test
 * Run: node test-db-connection.js
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Testing Database Connection...\n');

// Show configuration (without password)
console.log('📋 Configuration:');
if (process.env.DATABASE_URL) {
    console.log('   Mode: Cloud (using DATABASE_URL)');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '***SET***' : '***NOT SET***');
} else {
    console.log('   Mode: Local (using individual variables)');
    console.log('   DB_HOST:', process.env.DB_HOST || 'localhost');
    console.log('   DB_PORT:', process.env.DB_PORT || '5432');
    console.log('   DB_NAME:', process.env.DB_NAME || 'daily_sheet_db');
    console.log('   DB_USER:', process.env.DB_USER || 'postgres');
    console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? `***SET*** (length: ${process.env.DB_PASSWORD.length})` : '***NOT SET***');
}
console.log('');

// Create pool (supports both local and cloud)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
        ? `${process.env.DATABASE_URL}?sslmode=require`
        : undefined,
    host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
    port: process.env.DATABASE_URL ? undefined : (parseInt(process.env.DB_PORT) || 5432),
    database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'daily_sheet_db'),
    user: process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'postgres'),
    password: process.env.DATABASE_URL ? undefined : String(process.env.DB_PASSWORD || ''),
    ssl: process.env.DATABASE_URL ? { require: true, rejectUnauthorized: false } : false,
});

// Test query
pool.query('SELECT NOW() as current_time, version() as pg_version', (err, res) => {
    if (err) {
        console.error('❌ Connection FAILED:');
        console.error('   Error:', err.message);
        console.error('');
        console.error('💡 Possible fixes:');
        console.error('   1. Check PostgreSQL is running');
        console.error('   2. Verify .env file exists in root directory');
        console.error('   3. Check DB_PASSWORD has no quotes or extra spaces');
        console.error('   4. Ensure database "daily_sheet_db" exists');
        console.error('');
        console.error('📝 Your .env should look like:');
        console.error('   DB_HOST=localhost');
        console.error('   DB_PORT=5432');
        console.error('   DB_NAME=daily_sheet_db');
        console.error('   DB_USER=postgres');
        console.error('   DB_PASSWORD=YourPasswordHere');
    } else {
        console.log('✅ Connection SUCCESSFUL!');
        console.log('');
        console.log('📊 Database Info:');
        console.log('   Current Time:', res.rows[0].current_time);
        console.log('   PostgreSQL Version:', res.rows[0].pg_version.split(',')[0]);
        console.log('');
        console.log('🎉 Your database is ready to use!');
        console.log('   Run: npm start');
    }
    
    pool.end();
    process.exit(err ? 1 : 0);
});
