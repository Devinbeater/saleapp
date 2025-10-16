/**
 * PostgreSQL Database Configuration
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Debug: Log connection config (without password)
console.log('📋 Database Configuration:');
console.log('   Host:', process.env.DB_HOST || 'localhost');
console.log('   Port:', process.env.DB_PORT || 5432);
console.log('   Database:', process.env.DB_NAME || 'daily_sheet_db');
console.log('   User:', process.env.DB_USER || 'postgres');
console.log('   Password:', process.env.DB_PASSWORD ? '***SET***' : '***NOT SET***');

// Create connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'daily_sheet_db',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Query result
 */
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

/**
 * Get a client from the pool for transactions
 * @returns {Promise} Database client
 */
const getClient = async () => {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);
    
    // Set a timeout to release client after 5 seconds
    const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5 seconds!');
    }, 5000);
    
    // Monkey patch the release method to clear timeout
    client.release = () => {
        clearTimeout(timeout);
        client.release = release;
        return release();
    };
    
    return client;
};

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
    try {
        const result = await query('SELECT NOW()');
        console.log('✅ Database connection successful:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

/**
 * Initialize database tables
 * @returns {Promise<boolean>}
 */
const initializeTables = async () => {
    const client = await getClient();
    
    try {
        await client.query('BEGIN');
        
        // Create daily_sheets table
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
        
        // Create transactions table
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE PAYMENT_MODE AS ENUM ('Cash', 'Online', 'QR', 'SWIPE', 'Debtors');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            
            DO $$ BEGIN
                CREATE TYPE ENTRY_TYPE AS ENUM ('Sale', 'Return', 'Salesman', 'Party');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                sheet_id INT REFERENCES daily_sheets(id) ON DELETE CASCADE,
                serial_number INT,
                entry_type ENTRY_TYPE NOT NULL,
                payment_mode PAYMENT_MODE NOT NULL,
                amount NUMERIC(12,2) NOT NULL,
                transaction_time TIME WITH TIME ZONE DEFAULT NOW(),
                description TEXT,
                party_name VARCHAR(255),
                bill_number VARCHAR(100),
                reference_id VARCHAR(255),
                is_return BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        
        // Create debtors table
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE DEBTOR_STATUS AS ENUM ('Pending', 'Partial Paid', 'Paid');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            
            CREATE TABLE IF NOT EXISTS debtors (
                id SERIAL PRIMARY KEY,
                sheet_id INT REFERENCES daily_sheets(id) ON DELETE CASCADE,
                transaction_id INT REFERENCES transactions(id) ON DELETE SET NULL,
                party_name VARCHAR(255) NOT NULL,
                original_bill_number VARCHAR(100),
                original_amount NUMERIC(12,2) NOT NULL,
                amount_due NUMERIC(12,2) NOT NULL,
                status DEBTOR_STATUS DEFAULT 'Pending' NOT NULL,
                due_date DATE,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        
        // Create collections table
        await client.query(`
            CREATE TABLE IF NOT EXISTS collections (
                id SERIAL PRIMARY KEY,
                sheet_id INT REFERENCES daily_sheets(id) ON DELETE CASCADE,
                debtor_id INT REFERENCES debtors(id) ON DELETE CASCADE,
                collected_amount NUMERIC(12,2) NOT NULL,
                collection_time TIME WITH TIME ZONE DEFAULT NOW(),
                collection_date DATE DEFAULT CURRENT_DATE,
                payment_mode PAYMENT_MODE NOT NULL,
                reference_id VARCHAR(255),
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        
        // Create expenses table
        await client.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                sheet_id INT REFERENCES daily_sheets(id) ON DELETE CASCADE,
                purpose TEXT NOT NULL,
                amount NUMERIC(12,2) NOT NULL,
                expense_time TIME WITH TIME ZONE DEFAULT NOW(),
                category VARCHAR(100),
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        
        // Create denominations table
        await client.query(`
            CREATE TABLE IF NOT EXISTS denominations (
                id SERIAL PRIMARY KEY,
                sheet_id INT REFERENCES daily_sheets(id) ON DELETE CASCADE,
                denomination_value INT NOT NULL,
                denomination_label VARCHAR(50),
                opening_pieces INT DEFAULT 0,
                closing_pieces INT DEFAULT 0,
                calculated_opening_amount NUMERIC(12,2) DEFAULT 0.00,
                calculated_closing_amount NUMERIC(12,2) DEFAULT 0.00,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(sheet_id, denomination_value)
            )
        `);
        
        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_daily_sheets_date ON daily_sheets(sheet_date);
            CREATE INDEX IF NOT EXISTS idx_transactions_sheet_id ON transactions(sheet_id);
            CREATE INDEX IF NOT EXISTS idx_debtors_sheet_id ON debtors(sheet_id);
            CREATE INDEX IF NOT EXISTS idx_collections_sheet_id ON collections(sheet_id);
            CREATE INDEX IF NOT EXISTS idx_expenses_sheet_id ON expenses(sheet_id);
            CREATE INDEX IF NOT EXISTS idx_denominations_sheet_id ON denominations(sheet_id);
        `);
        
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
