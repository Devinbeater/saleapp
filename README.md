# Daily Sheet Manager v1.1.0

A comprehensive daily financial sheet management application with spreadsheet functionality, built with vanilla JavaScript, Node.js, and PostgreSQL.

## Features

- **Golden Ratio Layout**: Modern, responsive design with optimal proportions
- **HyperFormula Integration**: Powerful spreadsheet calculations and formula support
- **Real-time Persistence**: Automatic localStorage backup and PostgreSQL storage
- **Export Capabilities**: Excel, CSV, and PDF export functionality
- **Keyboard Shortcuts**: Full keyboard navigation and shortcuts
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Data Validation**: Comprehensive input validation and error handling
- **Offline Support**: Works offline with localStorage fallback

## Tech Stack

### Frontend
- **HTML5, CSS3**: Semantic structure and styling
- **Vanilla JavaScript (ES6+)**: Core logic, DOM manipulation, event handling
- **HyperFormula**: Powerful spreadsheet calculation engine
- **SheetJS**: Excel import/export functionality
- **FileSaver.js**: File download capabilities

### Backend
- **Node.js (v18+)**: Runtime environment
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database for persistent storage
- **pg (node-postgres)**: PostgreSQL client for Node.js
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Installation

### Prerequisites
- Node.js v18 or higher
- PostgreSQL 12 or higher
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd daily-sheet-manager
   ```

2. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb daily_sheet_db
   
   # Run SQL setup script
   psql daily_sheet_db < sql/create_tables.sql
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Open in browser**
   Navigate to `http://localhost:3000`

## Usage

### Basic Operations

1. **Create/Open Sheet**: The application automatically creates or opens today's sheet
2. **Enter Data**: Click on cells to enter values or formulas (starting with `=`)
3. **Auto-save**: Changes are automatically saved to localStorage every 2 seconds
4. **Manual Save**: Press `Ctrl+S` to save to the backend database
5. **Export**: Use export buttons or `Ctrl+Shift+S` for export options

### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save sheet
- `Ctrl/Cmd + Shift + S`: Export options
- `Ctrl/Cmd + /`: Toggle help modal
- `Ctrl/Cmd + =`: Insert SUM formula
- `Shift + Enter`: Move to previous row
- `Enter`: Move to next row
- `Tab`: Move to next cell
- `Shift + Tab`: Move to previous cell
- `Ctrl/Cmd + P`: Generate report
- `Ctrl/Cmd + R`: Recalculate formulas
- `Escape`: Close modals/blur input

### Formula Examples

- `=SUM(POS_AMOUNT_0:POS_AMOUNT_24)` - Sum range
- `=POS_AMOUNT_0 + POS_AMOUNT_1` - Addition
- `=KQR_TOTAL * 0.05` - Percentage calculation

### Data Sections

- **POS**: Point of Sale transactions
- **KQR**: Kotak QR payments
- **KSW**: Kotak Swipe transactions
- **DEBTOR**: Debtor transactions

## API Endpoints

### Sheets
- `POST /api/sheets` - Create or get sheet for date
- `GET /api/sheets/:date` - Get sheet by date
- `PUT /api/sheets/:id` - Update sheet note

### Entries
- `POST /api/entries` - Save/update entries
- `GET /api/entries/:sheetId` - Get entries for sheet
- `DELETE /api/entries/:sheetId` - Delete all entries

### Denominations
- `POST /api/denominations` - Save/update denominations
- `GET /api/denominations/:sheetId` - Get denominations
- `DELETE /api/denominations/:sheetId` - Delete denominations

### Reports
- `GET /api/reports/:sheetId` - Generate full report

## Database Schema

### daily_sheets
- `id` (SERIAL PRIMARY KEY)
- `sheet_date` (DATE UNIQUE)
- `sheet_note` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### entries
- `id` (SERIAL PRIMARY KEY)
- `sheet_id` (INT REFERENCES daily_sheets)
- `section` (VARCHAR(50))
- `row_idx` (INT)
- `cell_key` (VARCHAR(100))
- `raw_value` (TEXT)
- `calculated_value` (TEXT)
- `metadata` (JSONB)

### denominations
- `id` (SERIAL PRIMARY KEY)
- `sheet_id` (INT REFERENCES daily_sheets)
- `denomination_value` (INT)
- `denomination_label` (VARCHAR(50))
- `pieces` (INT)
- `calculated_amount` (NUMERIC(12,2))

## Development

### Project Structure
```
daily-sheet-manager/
├── client/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── modules/
│       ├── api.js
│       ├── formulaEngine.js
│       ├── persistence.js
│       ├── ui.js
│       ├── keyboardShortcuts.js
│       ├── exportUtils.js
│       └── validation.js
├── server/
│   ├── index.js
│   ├── db.js
│   ├── package.json
│   └── routes/
│       ├── sheets.js
│       ├── entries.js
│       ├── denominations.js
│       └── reports.js
└── sql/
    └── create_tables.sql
```

### Adding New Features

1. **Frontend**: Add new modules in `client/modules/`
2. **Backend**: Add new routes in `server/routes/`
3. **Database**: Update schema in `sql/create_tables.sql`

### Testing

```bash
# Run backend tests (if implemented)
npm test

# Manual testing checklist
# - [ ] Data entry and formulas work correctly
# - [ ] Auto-save functionality
# - [ ] Export features
# - [ ] Keyboard shortcuts
# - [ ] Theme switching
# - [ ] Date navigation
```

## Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@host:port/db
   PORT=3000
   ```

2. **Build Process**
   ```bash
   npm install --production
   npm start
   ```

3. **Reverse Proxy** (Recommended)
   - Use nginx or Apache as reverse proxy
   - Configure SSL/TLS certificates
   - Set up proper security headers

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the GitHub issues
2. Review the documentation
3. Create a new issue with detailed information

## Changelog

### v1.1.0
- Initial release
- Core spreadsheet functionality
- HyperFormula integration
- Export capabilities
- Keyboard shortcuts
- Theme support
- Data persistence
