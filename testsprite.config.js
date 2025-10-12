/**
 * TestSprite Configuration for Daily Sheet Manager
 * Automated testing configuration for the complete application
 */

module.exports = {
  // Project information
  project: {
    name: "Daily Sheet Manager",
    version: "1.1.0",
    description: "Daily financial sheet management with spreadsheet functionality"
  },

  // Test environments
  environments: {
    development: {
      baseUrl: "http://localhost:3000",
      database: {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "daily_sheet_db",
        username: "postgres",
        password: "password"
      }
    },
    testing: {
      baseUrl: "http://localhost:3001",
      database: {
        type: "postgresql",
        host: "localhost",
        port: 5433,
        database: "test_daily_sheet_db",
        username: "test_user",
        password: "test_password"
      }
    }
  },

  // Test suites
  testSuites: {
    // Backend API Tests
    backend: {
      name: "Backend API Tests",
      description: "Test all backend API endpoints and database operations",
      tests: [
        {
          name: "Sheets API",
          description: "Test sheet creation, retrieval, and updates",
          endpoints: [
            "POST /api/sheets",
            "GET /api/sheets/:date",
            "PUT /api/sheets/:id"
          ],
          testCases: [
            "Create new sheet for today",
            "Create new sheet for specific date",
            "Return existing sheet if already exists",
            "Retrieve sheet by date",
            "Handle non-existent sheet",
            "Update sheet note",
            "Handle invalid sheet ID"
          ]
        },
        {
          name: "Entries API",
          description: "Test spreadsheet entry operations",
          endpoints: [
            "POST /api/entries",
            "GET /api/entries/:sheetId",
            "DELETE /api/entries/:sheetId"
          ],
          testCases: [
            "Save multiple entries",
            "Update existing entries",
            "Retrieve entries for sheet",
            "Delete all entries for sheet",
            "Handle invalid request data",
            "Handle non-existent sheet"
          ]
        },
        {
          name: "Denominations API",
          description: "Test cash denomination operations",
          endpoints: [
            "POST /api/denominations",
            "GET /api/denominations/:sheetId",
            "DELETE /api/denominations/:sheetId"
          ],
          testCases: [
            "Save multiple denominations",
            "Update existing denominations",
            "Handle coupons (denomination_value: 0)",
            "Retrieve denominations for sheet",
            "Delete all denominations for sheet",
            "Handle invalid request data"
          ]
        },
        {
          name: "Reports API",
          description: "Test report generation functionality",
          endpoints: [
            "GET /api/reports/:sheetId"
          ],
          testCases: [
            "Generate complete report",
            "Include correct sheet information",
            "Include all entries and denominations",
            "Calculate correct summary totals",
            "Include generation timestamp",
            "Handle non-existent sheet",
            "Handle sheet with no data"
          ]
        }
      ]
    },

    // Frontend Tests
    frontend: {
      name: "Frontend Tests",
      description: "Test frontend JavaScript modules and UI functionality",
      tests: [
        {
          name: "Formula Engine",
          description: "Test HyperFormula integration and calculations",
          modules: [
            "modules/formulaEngine.js"
          ],
          testCases: [
            "Initialize HyperFormula correctly",
            "Map cell keys to coordinates",
            "Update cells with literal values",
            "Update cells with formulas",
            "Get calculated values",
            "Handle formula validation",
            "Set up calculated fields",
            "Insert SUM formulas",
            "Trigger recalculation",
            "Export cell data",
            "Clear all data",
            "Load data from entries"
          ]
        },
        {
          name: "Validation Manager",
          description: "Test input validation and data integrity",
          modules: [
            "modules/validation.js"
          ],
          testCases: [
            "Validate amount inputs",
            "Validate pieces inputs",
            "Validate formula inputs",
            "Validate cell inputs",
            "Validate denomination inputs",
            "Validate sheet data",
            "Validate cell references",
            "Sanitize input values",
            "Format numbers correctly",
            "Validate dates",
            "Handle edge cases"
          ]
        },
        {
          name: "UI Manager",
          description: "Test UI interactions and DOM manipulation",
          modules: [
            "modules/ui.js"
          ],
          testCases: [
            "Generate spreadsheet grid",
            "Generate denominations table",
            "Handle cell blur events",
            "Handle cell focus events",
            "Handle keyboard navigation",
            "Update cell displays",
            "Handle denomination changes",
            "Update total cash",
            "Toggle theme",
            "Load sheet data",
            "Save sheet data",
            "Show status messages"
          ]
        },
        {
          name: "API Client",
          description: "Test API communication and error handling",
          modules: [
            "modules/api.js"
          ],
          testCases: [
            "Create or get sheet",
            "Get sheet by date",
            "Update sheet note",
            "Save entries",
            "Get entries",
            "Delete entries",
            "Save denominations",
            "Get denominations",
            "Delete denominations",
            "Generate report",
            "Handle API errors",
            "Handle network failures"
          ]
        },
        {
          name: "Persistence Manager",
          description: "Test data persistence and autosave functionality",
          modules: [
            "modules/persistence.js"
          ],
          testCases: [
            "Initialize persistence system",
            "Schedule autosave",
            "Save draft to localStorage",
            "Load draft from localStorage",
            "Save to backend",
            "Load sheet with priority",
            "Collect sheet state",
            "Handle state changes",
            "Clean up old drafts",
            "Export sheet data",
            "Import sheet data",
            "Clear current data"
          ]
        },
        {
          name: "Keyboard Shortcuts",
          description: "Test keyboard shortcuts and navigation",
          modules: [
            "modules/keyboardShortcuts.js"
          ],
          testCases: [
            "Initialize shortcuts",
            "Handle save shortcut (Ctrl+S)",
            "Handle export shortcut (Ctrl+Shift+S)",
            "Handle help shortcut (Ctrl+/)",
            "Handle SUM formula shortcut (Ctrl+=)",
            "Handle navigation shortcuts",
            "Handle tab navigation",
            "Handle escape key",
            "Show export options",
            "Toggle help modal"
          ]
        },
        {
          name: "Export Utils",
          description: "Test export functionality for Excel, CSV, and PDF",
          modules: [
            "modules/exportUtils.js"
          ],
          testCases: [
            "Export to CSV format",
            "Export to Excel format",
            "Export to PDF format",
            "Generate printable report",
            "Collect export data",
            "Generate CSV content",
            "Generate Excel workbook",
            "Generate print HTML",
            "Download files",
            "Import data from files",
            "Parse import data"
          ]
        }
      ]
    },

    // Integration Tests
    integration: {
      name: "Integration Tests",
      description: "Test complete workflows and end-to-end functionality",
      tests: [
        {
          name: "Complete Daily Sheet Workflow",
          description: "Test the complete daily sheet management workflow",
          testCases: [
            "Create new sheet for today",
            "Add sheet note",
            "Enter data in different sections (POS, KQR, KSW, DEBTOR)",
            "Add denominations with auto-calculation",
            "Generate complete report",
            "Verify data persistence",
            "Export to Excel/CSV/PDF",
            "Load previous date data"
          ]
        },
        {
          name: "Formula Calculations",
          description: "Test complex formula calculations and dependencies",
          testCases: [
            "Set up TOTAL_SALE formula",
            "Set up NET_AMOUNT formula",
            "Test formula dependencies",
            "Verify real-time calculations",
            "Test formula validation",
            "Handle calculation errors",
            "Test SUM formulas for columns"
          ]
        },
        {
          name: "Data Persistence",
          description: "Test data saving and loading across sessions",
          testCases: [
            "Auto-save to localStorage",
            "Manual save to backend",
            "Load from backend on startup",
            "Fallback to localStorage draft",
            "Handle concurrent saves",
            "Verify data integrity",
            "Test offline functionality"
          ]
        },
        {
          name: "Export and Import",
          description: "Test data export and import functionality",
          testCases: [
            "Export complete sheet to Excel",
            "Export complete sheet to CSV",
            "Generate printable PDF report",
            "Import data from Excel file",
            "Import data from CSV file",
            "Verify data accuracy after import",
            "Handle import errors gracefully"
          ]
        },
        {
          name: "User Experience",
          description: "Test user interface and interaction flows",
          testCases: [
            "Theme switching (dark/light)",
            "Keyboard shortcuts",
            "Help modal functionality",
            "Date navigation",
            "Cell navigation and editing",
            "Status notifications",
            "Error handling and user feedback"
          ]
        }
      ]
    },

    // Performance Tests
    performance: {
      name: "Performance Tests",
      description: "Test application performance and scalability",
      tests: [
        {
          name: "Load Testing",
          description: "Test application under various load conditions",
          testCases: [
            "Handle large number of entries (1000+)",
            "Handle multiple concurrent users",
            "Test database query performance",
            "Test frontend rendering performance",
            "Test formula calculation performance",
            "Test export performance with large datasets"
          ]
        },
        {
          name: "Memory Testing",
          description: "Test memory usage and potential leaks",
          testCases: [
            "Monitor memory usage during long sessions",
            "Test localStorage cleanup",
            "Test HyperFormula memory management",
            "Test event listener cleanup",
            "Test large dataset handling"
          ]
        }
      ]
    }
  },

  // Test execution settings
  execution: {
    parallel: true,
    timeout: 30000,
    retries: 2,
    bail: false,
    reporters: ["default", "html", "json"],
    coverage: {
      enabled: true,
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      }
    }
  },

  // Test data
  testData: {
    sampleEntries: [
      {
        section: "POS",
        row_idx: 0,
        cell_key: "POS_AMOUNT_0",
        raw_value: "1000",
        calculated_value: "1000",
        metadata: { salesman: "John Doe" }
      },
      {
        section: "KQR",
        row_idx: 0,
        cell_key: "KQR_AMOUNT_0",
        raw_value: "750",
        calculated_value: "750",
        metadata: {}
      },
      {
        section: "KSW",
        row_idx: 0,
        cell_key: "KSW_AMOUNT_0",
        raw_value: "250",
        calculated_value: "250",
        metadata: {}
      },
      {
        section: "DEBTOR",
        row_idx: 0,
        cell_key: "DEBTOR_AMOUNT_0",
        raw_value: "200",
        calculated_value: "200",
        metadata: { party: "ABC Corp" }
      }
    ],
    sampleDenominations: [
      { denomination_value: 500, denomination_label: "₹500", pieces: 4, calculated_amount: 2000 },
      { denomination_value: 200, denomination_label: "₹200", pieces: 1, calculated_amount: 200 },
      { denomination_value: 100, denomination_label: "₹100", pieces: 3, calculated_amount: 300 },
      { denomination_value: 50, denomination_label: "₹50", pieces: 4, calculated_amount: 200 },
      { denomination_value: 20, denomination_label: "₹20", pieces: 10, calculated_amount: 200 },
      { denomination_value: 10, denomination_label: "₹10", pieces: 5, calculated_amount: 50 },
      { denomination_value: 0, denomination_label: "Coupons", pieces: 15, calculated_amount: 0 }
    ],
    sampleFormulas: [
      "=SUM(POS_AMOUNT_0:POS_AMOUNT_24)",
      "=SUM(KQR_AMOUNT_0:KQR_AMOUNT_24)",
      "=SUM(KSW_AMOUNT_0:KSW_AMOUNT_24)",
      "=SUM(DEBTOR_AMOUNT_0:DEBTOR_AMOUNT_24)",
      "=TOTAL_SALE - SUM(DEBTOR_AMOUNT_0:DEBTOR_AMOUNT_24)",
      "=POS_AMOUNT_0 + KQR_AMOUNT_0 + KSW_AMOUNT_0"
    ]
  }
};
