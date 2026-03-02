/**
 * Search Unclaimed Dividend Block
 * Displays a search form and results table for unclaimed dividends
 */

// Mock data for development (to be replaced with API data)
const MOCK_YEARS = ['2024', '2023', '2022', '2021', '2020', '2019'];

const MOCK_DATA = [
  {
    srNo: 1,
    folioNo: 'ABC123456',
    warrantNo: 'W001234',
    nameAddress: 'John Doe, 123 Main Street, Mumbai 400001',
    noOfShares: 100,
    amount: 5000.00,
    micrNo: 'MICR001'
  },
  {
    srNo: 2,
    folioNo: 'DEF789012',
    warrantNo: 'W005678',
    nameAddress: 'Jane Smith, 456 Park Avenue, Delhi 110001',
    noOfShares: 250,
    amount: 12500.00,
    micrNo: 'MICR002'
  },
  {
    srNo: 3,
    folioNo: 'GHI345678',
    warrantNo: 'W009012',
    nameAddress: 'Rahul Kumar, 789 Lake View, Bangalore 560001',
    noOfShares: 75,
    amount: 3750.00,
    micrNo: 'MICR003'
  }
];

/**
 * Helper function to create DOM elements
 * @param {string} tag DOM element to be created
 * @param {object} attributes attributes to be added
 * @param {string|HTMLElement} html inner content
 */
function createTag(tag, attributes, html) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement || html instanceof SVGElement) {
      el.append(html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  return el;
}

/**
 * Parse authorable content from block
 * @param {HTMLElement} block 
 */
function parseAuthorableContent(block) {
  const defaults = {
    pageTitle: 'Search Unclaimed Dividends',
    sectionLabel: 'Refine Your Search',
    yearLabel: 'Select Year',
    folioLabel: 'Folio No./DP Id Client Id.',
    searchButtonText: 'Search',
    columns: {
      srNo: 'SR. NO.',
      folioNo: 'FOLIO NO./DP ID CLIENT ID.',
      warrantNo: 'WARRANT NO.',
      nameAddress: 'NAMES & ADDRESS OF THE SHAREHOLDER',
      noOfShares: 'NO. OF SHARES',
      amount: 'AMOUNT (RS.)',
      micrNo: 'MICR NO.'
    }
  };

  // Field mapping for model attributes
  const fieldMap = {
    'pagetitle': 'pageTitle',
    'page title': 'pageTitle',
    'sectionlabel': 'sectionLabel',
    'section label': 'sectionLabel',
    'yearlabel': 'yearLabel',
    'year label': 'yearLabel',
    'foliolabel': 'folioLabel',
    'folio label': 'folioLabel',
    'searchbuttontext': 'searchButtonText',
    'search button text': 'searchButtonText',
    'colsrno': 'columns.srNo',
    'col sr no': 'columns.srNo',
    'colfoliono': 'columns.folioNo',
    'col folio no': 'columns.folioNo',
    'colwarrantno': 'columns.warrantNo',
    'col warrant no': 'columns.warrantNo',
    'colnameaddress': 'columns.nameAddress',
    'col name address': 'columns.nameAddress',
    'colnoofshares': 'columns.noOfShares',
    'col no of shares': 'columns.noOfShares',
    'colamount': 'columns.amount',
    'col amount': 'columns.amount',
    'colmicrno': 'columns.micrNo',
    'col micr no': 'columns.micrNo'
  };

  // Helper to set nested property
  const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  };

  // Parse content from block if available
  const rows = [...block.querySelectorAll(':scope > div')];
  
  if (rows.length > 0) {
    rows.forEach((row) => {
      const cells = [...row.querySelectorAll(':scope > div')];
      if (cells.length >= 2) {
        const key = cells[0].textContent.trim().toLowerCase();
        const value = cells[1].textContent.trim();
        
        const mappedField = fieldMap[key];
        if (mappedField) {
          setNestedValue(defaults, mappedField, value);
        }
      }
    });
  }

  return defaults;
}

/**
 * Create the search form
 * @param {object} content authorable content
 */
function createSearchForm(content) {
  const formContainer = createTag('div', { class: 'search-dividend-form' });
  
  // Page Title
  const title = createTag('h2', { class: 'search-dividend-title' }, content.pageTitle);
  formContainer.appendChild(title);
  
  // Form wrapper
  const formWrapper = createTag('div', { class: 'search-dividend-form-wrapper' });
  
  // Year dropdown field
  const yearField = createTag('div', { class: 'form-field year-field' });
  const yearLabel = createTag('label', { for: 'year-select' }, content.sectionLabel);
  const yearSelectWrapper = createTag('div', { class: 'select-wrapper' });
  const yearSelect = createTag('select', { 
    id: 'year-select', 
    name: 'year',
    class: 'year-select'
  });
  
  // Add default option
  const defaultOption = createTag('option', { value: '', disabled: '', selected: '' }, content.yearLabel);
  yearSelect.appendChild(defaultOption);
  
  // Add year options (mock data - to be replaced with API)
  MOCK_YEARS.forEach(year => {
    const option = createTag('option', { value: year }, year);
    yearSelect.appendChild(option);
  });
  
  yearSelectWrapper.appendChild(yearSelect);
  yearField.appendChild(yearLabel);
  yearField.appendChild(yearSelectWrapper);
  
  // Folio input field
  const folioField = createTag('div', { class: 'form-field folio-field' });
  const folioLabel = createTag('label', { for: 'folio-input' }, content.folioLabel);
  const folioInput = createTag('input', { 
    type: 'text', 
    id: 'folio-input', 
    name: 'folio',
    class: 'folio-input',
    placeholder: `Enter ${content.folioLabel}`
  });
  folioField.appendChild(folioLabel);
  folioField.appendChild(folioInput);
  
  // Search button
  const buttonField = createTag('div', { class: 'form-field button-field' });
  const searchButton = createTag('button', { 
    type: 'button', 
    class: 'search-dividend-btn' 
  });
  searchButton.innerHTML = `${content.searchButtonText} <span class="btn-arrow">&#8599;</span>`;
  buttonField.appendChild(searchButton);
  
  formWrapper.appendChild(yearField);
  formWrapper.appendChild(folioField);
  formWrapper.appendChild(buttonField);
  formContainer.appendChild(formWrapper);
  
  return formContainer;
}

/**
 * Create the results table
 * @param {object} content authorable content
 * @param {array} data table data
 */
function createResultsTable(content, data = []) {
  const tableContainer = createTag('div', { class: 'search-dividend-table-container' });
  const table = createTag('table', { class: 'search-dividend-table' });
  
  // Create table header
  const thead = createTag('thead');
  const headerRow = createTag('tr');
  
  const columns = content.columns;
  Object.values(columns).forEach(colName => {
    const th = createTag('th', {}, colName);
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create table body
  const tbody = createTag('tbody', { id: 'dividend-table-body' });
  
  if (data.length > 0) {
    data.forEach(row => {
      const tr = createTag('tr');
      tr.appendChild(createTag('td', {}, row.srNo.toString()));
      tr.appendChild(createTag('td', {}, row.folioNo));
      tr.appendChild(createTag('td', {}, row.warrantNo));
      tr.appendChild(createTag('td', {}, row.nameAddress));
      tr.appendChild(createTag('td', {}, row.noOfShares.toString()));
      tr.appendChild(createTag('td', {}, row.amount.toFixed(2)));
      tr.appendChild(createTag('td', {}, row.micrNo));
      tbody.appendChild(tr);
    });
  }
  
  table.appendChild(tbody);
  tableContainer.appendChild(table);
  
  // Message container for no results/errors
  const messageContainer = createTag('div', { 
    class: 'search-dividend-message', 
    id: 'dividend-message' 
  });
  tableContainer.appendChild(messageContainer);
  
  return tableContainer;
}

/**
 * Update table with search results
 * @param {array} data search results
 * @param {object} content authorable content for column order
 */
function updateTable(data, content) {
  const tbody = document.getElementById('dividend-table-body');
  const messageContainer = document.getElementById('dividend-message');
  
  if (!tbody || !messageContainer) return;
  
  // Clear existing data
  tbody.innerHTML = '';
  messageContainer.innerHTML = '';
  messageContainer.className = 'search-dividend-message';
  
  if (data === null) {
    // API error
    messageContainer.classList.add('error');
    messageContainer.textContent = 'An error occurred while fetching data. Please try again later.';
    return;
  }
  
  if (data.length === 0) {
    // No results
    messageContainer.classList.add('no-results');
    messageContainer.textContent = 'No records found for the given search criteria.';
    return;
  }
  
  // Populate table with data
  data.forEach(row => {
    const tr = createTag('tr');
    tr.appendChild(createTag('td', {}, row.srNo.toString()));
    tr.appendChild(createTag('td', {}, row.folioNo));
    tr.appendChild(createTag('td', {}, row.warrantNo));
    tr.appendChild(createTag('td', {}, row.nameAddress));
    tr.appendChild(createTag('td', {}, row.noOfShares.toString()));
    tr.appendChild(createTag('td', {}, row.amount.toFixed(2)));
    tr.appendChild(createTag('td', {}, row.micrNo));
    tbody.appendChild(tr);
  });
}

/**
 * Fetch year options from API
 * @returns {Promise<array>} array of year options
 */
async function fetchYearOptions() {
  // TODO: Replace with actual API call when available
  // const response = await fetch('/api/unclaimed-dividend/years');
  // return response.json();
  
  // Return mock data for now
  return Promise.resolve(MOCK_YEARS);
}

/**
 * Search for unclaimed dividends
 * @param {string} year selected year
 * @param {string} folioId folio number or DP ID
 * @returns {Promise<array>} search results
 */
async function searchUnclaimedDividend(year, folioId) {
  // TODO: Replace with actual API call when available
  // const response = await fetch(`/api/unclaimed-dividend/search?year=${year}&folioId=${folioId}`);
  // if (!response.ok) throw new Error('API request failed');
  // return response.json();
  
  // Mock search - filter by folioId if provided
  return new Promise((resolve) => {
    setTimeout(() => {
      if (folioId) {
        const filtered = MOCK_DATA.filter(item => 
          item.folioNo.toLowerCase().includes(folioId.toLowerCase())
        );
        resolve(filtered);
      } else {
        resolve(MOCK_DATA);
      }
    }, 500); // Simulate API delay
  });
}

/**
 * Validate form inputs
 * @param {string} year selected year
 * @param {string} folioId folio input
 * @returns {object} validation result
 */
function validateForm(year, folioId) {
  const errors = [];
  
  if (!year) {
    errors.push('Please select a year');
  }
  
  // Add additional folio validation if required
  // if (!folioId || folioId.trim().length < 3) {
  //   errors.push('Please enter a valid Folio No./DP Id Client Id');
  // }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Show loading state
 * @param {boolean} isLoading 
 */
function showLoading(isLoading) {
  const button = document.querySelector('.search-dividend-btn');
  const messageContainer = document.getElementById('dividend-message');
  
  if (button) {
    button.disabled = isLoading;
    if (isLoading) {
      button.classList.add('loading');
      button.innerHTML = 'Searching... <span class="btn-spinner"></span>';
    } else {
      button.classList.remove('loading');
      button.innerHTML = 'Search <span class="btn-arrow">&#8599;</span>';
    }
  }
  
  if (messageContainer && isLoading) {
    messageContainer.innerHTML = '';
    messageContainer.className = 'search-dividend-message';
  }
}

/**
 * Show validation errors
 * @param {array} errors validation error messages
 */
function showValidationErrors(errors) {
  const messageContainer = document.getElementById('dividend-message');
  if (messageContainer) {
    messageContainer.className = 'search-dividend-message error';
    messageContainer.innerHTML = errors.join('<br>');
  }
}

/**
 * Initialize search functionality
 * @param {object} content authorable content
 */
function initializeSearch(content) {
  const searchButton = document.querySelector('.search-dividend-btn');
  const yearSelect = document.getElementById('year-select');
  const folioInput = document.getElementById('folio-input');
  
  if (searchButton) {
    searchButton.addEventListener('click', async () => {
      const year = yearSelect?.value || '';
      const folioId = folioInput?.value?.trim() || '';
      
      // Validate form
      const validation = validateForm(year, folioId);
      if (!validation.isValid) {
        showValidationErrors(validation.errors);
        return;
      }
      
      // Show loading state
      showLoading(true);
      
      try {
        // Fetch data from API
        const results = await searchUnclaimedDividend(year, folioId);
        updateTable(results, content);
      } catch (error) {
        console.error('Search error:', error);
        updateTable(null, content); // Show error message
      } finally {
        showLoading(false);
      }
    });
  }
  
  // Allow Enter key to trigger search
  if (folioInput) {
    folioInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchButton?.click();
      }
    });
  }
}

/**
 * Main decorate function for the block
 * @param {HTMLElement} block 
 */
export default async function decorate(block) {
  // Parse authorable content from block
  const content = parseAuthorableContent(block);
  
  // Clear block content
  block.innerHTML = '';
  
  // Create and append search form
  const searchForm = createSearchForm(content);
  block.appendChild(searchForm);
  
  // Create and append results table
  const resultsTable = createResultsTable(content);
  block.appendChild(resultsTable);
  
  // Initialize search functionality
  initializeSearch(content);
  
  // Future: Fetch year options from API
  // try {
  //   const years = await fetchYearOptions();
  //   populateYearDropdown(years);
  // } catch (error) {
  //   console.error('Error fetching year options:', error);
  // }
}
