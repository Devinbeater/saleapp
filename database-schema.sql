-- Daily Register Database Schema
-- Run this script on your Render PostgreSQL database

-- Create sheets table
CREATE TABLE IF NOT EXISTS sheets (
    sheet_id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
    entry_id SERIAL PRIMARY KEY,
    sheet_id INTEGER REFERENCES sheets(sheet_id) ON DELETE CASCADE,
    section VARCHAR(50) NOT NULL,
    row_idx INTEGER NOT NULL,
    cell_key VARCHAR(100) NOT NULL,
    raw_value TEXT,
    calculated_value NUMERIC(15, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sheet_id, cell_key)
);

-- Create denominations table
CREATE TABLE IF NOT EXISTS denominations (
    denomination_id SERIAL PRIMARY KEY,
    sheet_id INTEGER REFERENCES sheets(sheet_id) ON DELETE CASCADE,
    denomination_value INTEGER NOT NULL,
    denomination_label VARCHAR(50),
    pieces INTEGER DEFAULT 0,
    calculated_amount NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sheet_id, denomination_value)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entries_sheet_id ON entries(sheet_id);
CREATE INDEX IF NOT EXISTS idx_entries_section ON entries(section);
CREATE INDEX IF NOT EXISTS idx_entries_cell_key ON entries(cell_key);
CREATE INDEX IF NOT EXISTS idx_denominations_sheet_id ON denominations(sheet_id);
CREATE INDEX IF NOT EXISTS idx_sheets_date ON sheets(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_sheets_updated_at BEFORE UPDATE ON sheets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_denominations_updated_at BEFORE UPDATE ON denominations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - remove if not needed)
-- INSERT INTO sheets (date, note) VALUES (CURRENT_DATE, 'Sample sheet for testing');

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show table structure
\d sheets
\d entries
\d denominations
