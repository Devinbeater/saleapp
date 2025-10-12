# Daily Sheet Manager - Setup Instructions

## Quick Start Guide

Follow these steps to get the Daily Sheet Manager running on your system.

## Prerequisites

### 1. Install Node.js
- Download and install Node.js v18+ from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version` and `npm --version`

### 2. Install PostgreSQL
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: Use Homebrew: `brew install postgresql`
- **Linux**: Use package manager (e.g., `sudo apt install postgresql postgresql-contrib`)

### 3. Verify PostgreSQL Installation
```bash
psql --version
```

## Database Setup

### 1. Start PostgreSQL Service
```bash
# Windows (if installed as service)
# PostgreSQL should start automatically

# macOS with Homebrew
brew services start postgresql

# Linux
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User
```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database
CREATE DATABASE daily_sheet_db;

# Create user (optional, you can use postgres user)
CREATE USER daily_sheet_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE daily_sheet_db TO daily_sheet_user;

# Exit psql
\q
```

### 3. Run Database Schema
```bash
# Connect to the database
psql -U postgres -d daily_sheet_db

# Run the schema file
\i server/sql/create_tables.sql

# Verify tables were created
\dt

# Exit psql
\q
```

## Application Setup

### 1. Install Dependencies
```bash
# Navigate to server directory
cd server

# Install Node.js dependencies
npm install
```

### 2. Configure Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your database credentials
```

**Edit `.env` file:**
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/daily_sheet_db

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Start the Application
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 4. Access the Application
Open your browser and navigate to: `http://localhost:3000`

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
**Error**: `connection refused` or `database does not exist`

**Solutions**:
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database exists: `psql -U postgres -l`
- Verify connection string in `.env` file
- Check PostgreSQL port (default: 5432)

#### 2. Permission Denied
**Error**: `permission denied for database`

**Solutions**:
- Grant proper permissions to your user
- Use superuser (postgres) for initial setup
- Check PostgreSQL authentication configuration

#### 3. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::3000`

**Solutions**:
- Change port in `.env` file: `PORT=3001`
- Kill process using port: `lsof -ti:3000 | xargs kill -9`
- Use different port: `PORT=8080`

#### 4. HyperFormula License Error
**Error**: License key issues

**Solutions**:
- The application uses GPL v3 license for HyperFormula
- For commercial use, obtain proper license from HyperFormula
- Check browser console for specific license errors

### Database Troubleshooting

#### Reset Database
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS daily_sheet_db;"
psql -U postgres -c "CREATE DATABASE daily_sheet_db;"
psql -U postgres -d daily_sheet_db -f server/sql/create_tables.sql
```

#### Check Database Tables
```bash
# Connect to database
psql -U postgres -d daily_sheet_db

# List tables
\dt

# Check table structure
\d daily_sheets
\d entries
\d denominations

# Exit
\q
```

#### View Database Data
```bash
# Connect to database
psql -U postgres -d daily_sheet_db

# View sheets
SELECT * FROM daily_sheets;

# View entries
SELECT * FROM entries LIMIT 10;

# View denominations
SELECT * FROM denominations LIMIT 10;

# Exit
\q
```

## Development Tips

### 1. Enable Debug Logging
Add to `.env`:
```env
DEBUG=app:*
LOG_LEVEL=debug
```

### 2. Hot Reload Development
```bash
# Install nodemon globally
npm install -g nodemon

# Run with auto-restart
nodemon index.js
```

### 3. Database Management
```bash
# Backup database
pg_dump -U postgres daily_sheet_db > backup.sql

# Restore database
psql -U postgres daily_sheet_db < backup.sql
```

### 4. Browser Developer Tools
- Press F12 to open developer tools
- Check Console tab for JavaScript errors
- Check Network tab for API request issues
- Use Application tab to inspect localStorage

## Production Deployment

### 1. Environment Setup
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
```

### 2. Security Considerations
- Use environment variables for sensitive data
- Set up proper PostgreSQL user permissions
- Configure firewall rules
- Use HTTPS in production
- Regular database backups

### 3. Performance Optimization
- Enable PostgreSQL connection pooling
- Set up proper database indexes
- Configure reverse proxy (nginx/Apache)
- Use CDN for static assets

## Support

If you encounter issues:

1. **Check the logs**: Look at both browser console and server logs
2. **Verify prerequisites**: Ensure all required software is installed
3. **Test database connection**: Verify PostgreSQL is accessible
4. **Check environment variables**: Ensure `.env` file is configured correctly
5. **Review documentation**: Check README.md for additional information

## Next Steps

Once the application is running:

1. **Explore the interface**: Familiarize yourself with the layout
2. **Try data entry**: Enter some sample data in the spreadsheet
3. **Test formulas**: Try entering formulas starting with `=`
4. **Test keyboard shortcuts**: Press `Ctrl+/` to see available shortcuts
5. **Export data**: Try exporting to Excel or CSV format
6. **Change themes**: Toggle between dark and light themes

The application is now ready for use! 🎉
