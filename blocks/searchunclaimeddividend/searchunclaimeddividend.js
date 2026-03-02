/**
 * Search Unclaimed Dividend Block
 * Displays a search form and results table for unclaimed dividends
 */

// API Configuration
const API_CONFIG = {
  baseUrl: 'https://www.piramalenterprises.com',
  searchEndpoint: '/search-unclaimed-dividend',
  yearsEndpoint: '/GetReportFinancialYear',
  yearsId: 7
};

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
    sectionLabel: '',
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
  
  // Year options will be populated from API in decorate function
  
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
    class: 'search-dividend-btn',
    'data-original-text': content.searchButtonText
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
 * @param {object} result API response with {success, message, data}
 * @param {object} content authorable content for column order
 */
function updateTable(result, content) {
  const tbody = document.getElementById('dividend-table-body');
  const messageContainer = document.getElementById('dividend-message');
  
  if (!tbody || !messageContainer) return;
  
  // Clear existing data
  tbody.innerHTML = '';
  messageContainer.innerHTML = '';
  messageContainer.className = 'search-dividend-message';
  
  if (result === null) {
    // API error
    messageContainer.classList.add('error');
    messageContainer.textContent = 'An error occurred while fetching data. Please try again later.';
    return;
  }
  
  // Handle API response format
  if (!result.success) {
    // No results or error from API
    messageContainer.classList.add('no-results');
    messageContainer.textContent = result.message || 'No records found for the given search criteria.';
    return;
  }
  
  const data = result.data || [];
  
  if (data.length === 0) {
    // No results
    messageContainer.classList.add('no-results');
    messageContainer.textContent = 'No records found for the given search criteria.';
    return;
  }
  
  // Populate table with data
  // Map API field names to table columns based on actual API response:
  // { srNo, folioNo, warrantNo, name, shares, amount, micrNo }
  data.forEach((row) => {
    const tr = createTag('tr');
    tr.appendChild(createTag('td', {}, row.srNo || '-'));
    tr.appendChild(createTag('td', {}, row.folioNo || '-'));
    tr.appendChild(createTag('td', {}, row.warrantNo || '-'));
    tr.appendChild(createTag('td', {}, row.name || '-'));
    tr.appendChild(createTag('td', {}, row.shares || '0'));
    tr.appendChild(createTag('td', {}, row.amount || '0.00'));
    tr.appendChild(createTag('td', {}, row.micrNo || '-'));
    tbody.appendChild(tr);
  });
}

/**
 * Fetch year options from API
 * @returns {Promise<array>} array of year options
 */
async function fetchYearOptions() {
  try {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.yearsEndpoint}?id=${API_CONFIG.yearsId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle API response - extract year values
    if (Array.isArray(data)) {
      return data.map(item => item.year || item.Year || item.financialYear || item);
    }
    
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(item => item.year || item.Year || item.financialYear || item);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching year options:', error);
    // Fallback years if API fails
    return ['2024-2025', '2023-2024', '2022-2023', '2021-2022', '2020-2021', '2019-2020'];
  }
}

/**
 * Search for unclaimed dividends
 * @param {string} year selected year
 * @param {string} folioNo folio number or DP ID
 * @returns {Promise<object>} search results
 */
async function searchUnclaimedDividend(year, folioNo) {
  try {
    // Construct API URL with query parameters
    // Example: https://www.piramalenterprises.com/search-unclaimed-dividend?year=2017-2018&folioNo=1301760000239657
    const url = new URL(`${API_CONFIG.baseUrl}${API_CONFIG.searchEndpoint}`);
    url.searchParams.append('year', year);
    url.searchParams.append('folioNo', folioNo);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle different API response formats:
    // 1. { status: false, message: "Data Not found" } - no data
    // 2. { status: true, data: [...] } - success with data wrapper
    // 3. [...] - direct array response
    
    // Check for error/no data response
    if (result.status === false || result.status === 'false') {
      return { success: false, message: result.message || 'Data Not Found', data: [] };
    }
    
    // Handle direct array response
    if (Array.isArray(result)) {
      return { 
        success: result.length > 0, 
        message: result.length === 0 ? 'No records found for the given search criteria.' : '', 
        data: result 
      };
    }
    
    // Handle wrapped data response
    const data = result.data || result.Data || [];
    return { 
      success: Array.isArray(data) && data.length > 0, 
      message: '', 
      data: Array.isArray(data) ? data : [] 
    };
    
  } catch (error) {
    console.error('Search API error:', error);
    return { success: false, message: 'An error occurred while fetching data. Please try again later.', data: [] };
  }
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
    const originalText = button.dataset.originalText || 'Search';
    button.disabled = isLoading;
    if (isLoading) {
      button.classList.add('loading');
      button.innerHTML = 'Searching... <span class="btn-spinner"></span>';
    } else {
      button.classList.remove('loading');
      button.innerHTML = `${originalText} <span class="btn-arrow">&#8599;</span>`;
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
 * Populate year dropdown with options from API
 * @param {array} years year options
 */
function populateYearDropdown(years) {
  const yearSelect = document.getElementById('year-select');
  if (!yearSelect || !years || years.length === 0) return;
  
  // Clear existing options except the first placeholder
  const placeholder = yearSelect.querySelector('option[value=""]');
  yearSelect.innerHTML = '';
  if (placeholder) {
    yearSelect.appendChild(placeholder);
  } else {
    const defaultOption = createTag('option', { value: '' }, 'Select Year');
    yearSelect.appendChild(defaultOption);
  }
  
  // Add year options
  years.forEach(year => {
    const option = createTag('option', { value: year }, year);
    yearSelect.appendChild(option);
  });
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
  
  // Fetch year options from API and populate dropdown
  try {
    const years = await fetchYearOptions();
    populateYearDropdown(years);
  } catch (error) {
    console.error('Error fetching year options:', error);
  }
}
