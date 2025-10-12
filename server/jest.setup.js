const { PostgreSqlContainer } = require('@testcontainers/postgresql');
const { Pool } = require('pg');

let postgresContainer;
let testPool;

beforeAll(async () => {
  // Start PostgreSQL container
  postgresContainer = await new PostgreSqlContainer()
    .withDatabase('test_daily_sheet_db')
    .withUsername('test_user')
    .withPassword('test_password')
    .start();

  // Set test database URL
  process.env.DATABASE_URL = postgresContainer.getConnectionUri();
  
  // Create test database connection
  testPool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  // Create tables for testing
  await createTestTables();
}, 60000);

afterAll(async () => {
  if (testPool) {
    await testPool.end();
  }
  if (postgresContainer) {
    await postgresContainer.stop();
  }
}, 30000);

beforeEach(async () => {
  // Clean up data before each test
  await cleanupTestData();
});

async function createTestTables() {
  const client = await testPool.connect();
  try {
    // Create daily_sheets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_sheets (
        id SERIAL PRIMARY KEY,
        sheet_date DATE UNIQUE NOT NULL,
        sheet_note TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create entries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        sheet_id INT REFERENCES daily_sheets(id) ON DELETE CASCADE,
        section VARCHAR(50) NOT NULL,
        row_idx INT NOT NULL,
        cell_key VARCHAR(100) NOT NULL,
        raw_value TEXT,
        calculated_value TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(sheet_id, cell_key)
      )
    `);

    // Create denominations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS denominations (
        id SERIAL PRIMARY KEY,
        sheet_id INT REFERENCES daily_sheets(id) ON DELETE CASCADE,
        denomination_value INT NOT NULL,
        denomination_label VARCHAR(50),
        pieces INT DEFAULT 0,
        calculated_amount NUMERIC(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(sheet_id, denomination_value)
      )
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_entries_sheet_id ON entries(sheet_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_entries_cell_key ON entries(cell_key)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_denominations_sheet_id ON denominations(sheet_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_daily_sheets_date ON daily_sheets(sheet_date)');

  } finally {
    client.release();
  }
}

async function cleanupTestData() {
  const client = await testPool.connect();
  try {
    await client.query('DELETE FROM entries');
    await client.query('DELETE FROM denominations');
    await client.query('DELETE FROM daily_sheets');
  } finally {
    client.release();
  }
}

// Export test utilities
global.testPool = testPool;
global.testDatabaseUrl = process.env.DATABASE_URL;
