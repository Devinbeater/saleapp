-- Create database (run this manually first)
-- CREATE DATABASE daily_sheet_db;

-- Connect to the database and create tables
\c daily_sheet_db;

-- Daily sheets table
CREATE TABLE IF NOT EXISTS daily_sheets (
    id SERIAL PRIMARY KEY,
    sheet_date DATE UNIQUE NOT NULL,
    sheet_note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Entries table for spreadsheet data
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
);

-- Denominations table for cash denominations
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
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entries_sheet_id ON entries(sheet_id);
CREATE INDEX IF NOT EXISTS idx_entries_cell_key ON entries(cell_key);
CREATE INDEX IF NOT EXISTS idx_denominations_sheet_id ON denominations(sheet_id);
CREATE INDEX IF NOT EXISTS idx_daily_sheets_date ON daily_sheets(sheet_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_daily_sheets_updated_at BEFORE UPDATE ON daily_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_denominations_updated_at BEFORE UPDATE ON denominations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
