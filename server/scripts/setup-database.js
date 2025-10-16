/**
 * Database Setup Script
 * Run this script to initialize the PostgreSQL database
 * 
 * Usage: node server/scripts/setup-database.js
 */

require('dotenv').config();
const db = require('../config/database');

async function setupDatabase() {
    console.log('🚀 Starting database setup...\n');
    
    try {
        // Test connection
        console.log('📡 Testing database connection...');
        const connected = await db.testConnection();
        
        if (!connected) {
            console.error('❌ Failed to connect to database');
            console.log('\n📝 Please check your .env file:');
            console.log('   DB_HOST=localhost');
            console.log('   DB_PORT=5432');
            console.log('   DB_NAME=daily_sheet_db');
            console.log('   DB_USER=postgres');
            console.log('   DB_PASSWORD=your_password');
            process.exit(1);
        }
        
        // Initialize tables
        console.log('\n📊 Creating database tables...');
        await db.initializeTables();
        
        console.log('\n✅ Database setup completed successfully!');
        console.log('\n📋 Created tables:');
        console.log('   ✓ daily_sheets');
        console.log('   ✓ transactions');
        console.log('   ✓ debtors');
        console.log('   ✓ collections');
        console.log('   ✓ expenses');
        console.log('   ✓ denominations');
        
        console.log('\n🎉 Your POS Cash Management System is ready to use!');
        
        // Close pool
        await db.pool.end();
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Database setup failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

// Run setup
setupDatabase();
