// Mock global objects and APIs
global.HyperFormula = {
  buildEmpty: jest.fn(() => ({
    addSheet: jest.fn(),
    setCellContents: jest.fn(),
    getCellValue: jest.fn(),
    getCellFormula: jest.fn(),
    on: jest.fn(),
    rebuild: jest.fn(),
    clearSheet: jest.fn()
  }))
};

global.XLSX = {
  writeFile: jest.fn(),
  read: jest.fn(),
  utils: {
    aoa_to_sheet: jest.fn(),
    sheet_to_json: jest.fn(),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn()
  }
};

global.saveAs = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: ''
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock DOM methods
document.addEventListener = jest.fn();
document.removeEventListener = jest.fn();
document.dispatchEvent = jest.fn();
document.querySelector = jest.fn();
document.querySelectorAll = jest.fn();
document.getElementById = jest.fn();
document.getElementsByClassName = jest.fn();
document.createElement = jest.fn(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  getElementById: jest.fn(),
  getElementsByClassName: jest.fn(),
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  insertBefore: jest.fn(),
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    toggle: jest.fn(),
    contains: jest.fn()
  },
  style: {},
  dataset: {},
  innerHTML: '',
  textContent: '',
  value: ''
}));

// Mock window methods
window.alert = jest.fn();
window.confirm = jest.fn();
window.prompt = jest.fn();
window.open = jest.fn();
window.print = jest.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
};

// Mock Blob
global.Blob = jest.fn(() => ({}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
