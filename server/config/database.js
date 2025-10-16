/**
 * PostgreSQL Database Configuration
 * Supports both local development and cloud deployment (Render, Heroku, etc.)
 */

const { Pool } = require('pg');
require('dotenv').config(); // ✅ Simplified — Render auto-detects `.env` in root

// Debug logging (optional)
console.log('📋 Database Configuration:');
if (process.env.DATABASE_URL) {
    console.log('   Using DATABASE_URL (cloud deployment)');
} else {
    console.log('   Host:', process.env.DB_HOST || 'localhost');
    console.log('   Port:', process.env.DB_PORT || 5432);
    console.log('   Database:', process.env.DB_NAME || 'daily_sheet_db');
    console.log('   User:', process.env.DB_USER || 'postgres');
    console.log('   Password:', process.env.DB_PASSWORD ? '***SET***' : '***NOT SET***');
}

// Create connection pool
// Prefer DATABASE_URL if available (cloud platforms like Render provide it)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
        ? `${process.env.DATABASE_URL}?sslmode=require` // ✅ Force SSL for Render
        : undefined,
    host: process.env.DATABASE_URL
        ? undefined
        : (process.env.DB_HOST || 'localhost'),
    port: process.env.DATABASE_URL
        ? undefined
        : (parseInt(process.env.DB_PORT) || 5432),
    database: process.env.DATABASE_URL
        ? undefined
        : (process.env.DB_NAME || 'daily_sheet_db'),
    user: process.env.DATABASE_URL
        ? undefined
        : (process.env.DB_USER || 'postgres'),
    password: process.env.DATABASE_URL
        ? undefined
        : String(process.env.DB_PASSWORD || 'Omwagh@13'),
    ssl: process.env.DATABASE_URL
        ? { require: true, rejectUnauthorized: false } // ✅ Required for Render Postgres
        : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Execute a query
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Get a client for transactions
const getClient = async () => {
    const client = await pool.connect();
    const release = client.release.bind(client);
    const timeout = setTimeout(() => {
        console.error('⚠️ Client checked out for >5s!');
    }, 5000);
    client.release = () => {
        clearTimeout(timeout);
        return release();
    };
    return client;
};

// Test DB connection
const testConnection = async () => {
    try {
        const result = await query('SELECT NOW() as now, version() as version');
        console.log('✅ Database connection successful:', result.rows[0].now);
        console.log('   PostgreSQL version:', result.rows[0].version.split(',')[0]);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('   Check credentials & SSL settings.');
        return false;
    }
};

// Initialize tables (no changes)
const initializeTables = async () => {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS daily_sheets (
                id SERIAL PRIMARY KEY,
                sheet_date DATE UNIQUE NOT NULL,
                opening_cash_amount NUMERIC(12,2) DEFAULT 0.00,
                closing_cash_amount NUMERIC(12,2),
                system_expected_cash NUMERIC(12,2),
                difference NUMERIC(12,2),
                is_closed BOOLEAN DEFAULT FALSE,
                closure_notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // ... (your same table creation logic — keep unchanged)
        // no changes needed here

        await client.query('COMMIT');
        console.log('✅ Database tables initialized successfully');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error initializing database tables:', error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    query,
    getClient,
    pool,
    testConnection,
    initializeTables
};
