/**
 * Search Unclaimed Dividend Block
 * Displays a search form and results table for unclaimed dividends
 */

// API Configuration

import { fetchPlaceholders } from "../../scripts/aem.js";

const placeholders = await fetchPlaceholders();

/**
 * Helper function to crea  te DOM elements
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
    sectionLabel: 'Refine Your Searcsh',
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

  // Get all rows from block - each row contains a field value in order matching model
  // Order: pageTitle, sectionLabel, yearLabel, folioLabel, searchButtonText, 
  //        colSrNo, colFolioNo, colWarrantNo, colNameAddress, colNoOfShares, colAmount, colMicrNo
  const rows = [...block.querySelectorAll(':scope > div')];

  // Map row index to field
  const fieldOrder = [
    'pageTitle',
    'sectionLabel',
    'yearLabel',
    'folioLabel',
    'searchButtonText',
    'colSrNo',
    'colFolioNo',
    'colWarrantNo',
    'colNameAddress',
    'colNoOfShares',
    'colAmount',
    'colMicrNo'
  ];

  rows.forEach((row, index) => {
    if (index < fieldOrder.length) {
      // Get the value from the row (may be in nested div or direct text)
      const cell = row.querySelector(':scope > div') || row;
      const value = cell.textContent?.trim();

      if (value) {
        const fieldName = fieldOrder[index];
        // Handle column fields
        if (fieldName.startsWith('col')) {
          const colKey = fieldName.replace('col', '').charAt(0).toLowerCase() + fieldName.replace('col', '').slice(1);
          defaults.columns[colKey] = value;
        } else {
          defaults[fieldName] = value;
        }
      }
    }
  });

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

  // Year dropdown field with section label as its label
  const yearField = createTag('div', { class: 'form-field year-field' });
  const yearFieldLabel = createTag('label', { for: 'year-select' }, content.sectionLabel);
  const yearSelectWrapper = createTag('div', { class: 'select-wrapper' });
  const yearSelect = createTag('select', {
    id: 'year-select',
    name: 'year',
    class: 'year-select'
  });

  // Add default option with year label as placeholder
  const defaultOption = createTag('option', { value: '', disabled: '', selected: '' }, content.yearLabel);
  yearSelect.appendChild(defaultOption);

  // Year options will be populated from API in decorate function

  yearSelectWrapper.appendChild(yearSelect);
  const yearError = createTag('span', { class: 'year-error', id: 'year-error' });
  yearField.appendChild(yearFieldLabel);
  yearField.appendChild(yearSelectWrapper);
  yearField.appendChild(yearError);

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
  const folioError = createTag('span', { class: 'folio-error', id: 'folio-error' });
  folioField.appendChild(folioLabel);
  folioField.appendChild(folioInput);
  folioField.appendChild(folioError);

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

// Pagination state
const PAGINATION_CONFIG = {
  itemsPerPage: 10,
  currentPage: 1,
  totalData: []
};

/**
 * Render table rows for current page
 * @param {array} data all data
 * @param {number} page current page number
 */
function renderTablePage(data, page) {
  const tbody = document.getElementById('dividend-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  const startIndex = (page - 1) * PAGINATION_CONFIG.itemsPerPage;
  const endIndex = startIndex + PAGINATION_CONFIG.itemsPerPage;
  const pageData = data.slice(startIndex, endIndex);

  pageData.forEach((row, index) => {
    const tr = createTag('tr');
    // Serial number based on overall position (startIndex + index + 1)
    tr.appendChild(createTag('td', {}, (startIndex + index + 1).toString()));
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
 * Create pagination controls
 * @param {number} totalItems total number of items
 * @param {number} currentPage current page number
 */
function createPaginationControls(totalItems, currentPage) {
  const totalPages = Math.ceil(totalItems / PAGINATION_CONFIG.itemsPerPage);
  
  // Remove existing pagination
  const existingPagination = document.querySelector('.search-dividend-pagination');
  if (existingPagination) {
    existingPagination.remove();
  }

  // Don't show pagination if only one page
  if (totalPages <= 1) return;

  const paginationContainer = createTag('div', { class: 'search-dividend-pagination' });

  // Results info
  const startItem = (currentPage - 1) * PAGINATION_CONFIG.itemsPerPage + 1;
  const endItem = Math.min(currentPage * PAGINATION_CONFIG.itemsPerPage, totalItems);
  const resultsInfo = createTag('span', { class: 'pagination-info' }, 
    `Showing ${startItem}-${endItem} of ${totalItems} results`);
  paginationContainer.appendChild(resultsInfo);

  const controlsWrapper = createTag('div', { class: 'pagination-controls' });

  // Previous button
  const prevBtn = createTag('button', { 
    class: 'pagination-btn prev-btn'
  }, '&laquo; Prev');
  if (currentPage === 1) {
    prevBtn.disabled = true;
  }
  prevBtn.addEventListener('click', () => {
    if (PAGINATION_CONFIG.currentPage > 1) {
      PAGINATION_CONFIG.currentPage--;
      renderTablePage(PAGINATION_CONFIG.totalData, PAGINATION_CONFIG.currentPage);
      createPaginationControls(totalItems, PAGINATION_CONFIG.currentPage);
    }
  });
  controlsWrapper.appendChild(prevBtn);

  // Page numbers
  const pageNumbers = createTag('span', { class: 'page-numbers' });
  
  // Show max 5 page numbers
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = createTag('button', { 
      class: `page-btn ${i === currentPage ? 'active' : ''}`,
      'data-page': i
    }, i.toString());
    pageBtn.addEventListener('click', () => {
      PAGINATION_CONFIG.currentPage = i;
      renderTablePage(PAGINATION_CONFIG.totalData, i);
      createPaginationControls(totalItems, i);
    });
    pageNumbers.appendChild(pageBtn);
  }
  controlsWrapper.appendChild(pageNumbers);

  // Next button
  const nextBtn = createTag('button', { 
    class: 'pagination-btn next-btn'
  }, 'Next &raquo;');
  if (currentPage === totalPages) {
    nextBtn.disabled = true;
  }
  nextBtn.addEventListener('click', () => {
    if (PAGINATION_CONFIG.currentPage < totalPages) {
      PAGINATION_CONFIG.currentPage++;
      renderTablePage(PAGINATION_CONFIG.totalData, PAGINATION_CONFIG.currentPage);
      createPaginationControls(totalItems, PAGINATION_CONFIG.currentPage);
    }
  });
  controlsWrapper.appendChild(nextBtn);

  paginationContainer.appendChild(controlsWrapper);

  // Append after table container
  const tableContainer = document.querySelector('.search-dividend-table-container');
  if (tableContainer) {
    tableContainer.appendChild(paginationContainer);
  }
}

/**
 * Update table with search results
 * @param {object} result API response with {success, message, data}
 * @param {object} content authorable content for column order
 */
function updateTable(result, content) {
  const tbody = document.getElementById('dividend-table-body');
  const messageContainer = document.getElementById('dividend-message');

  // Remove existing pagination
  const existingPagination = document.querySelector('.search-dividend-pagination');
  if (existingPagination) {
    existingPagination.remove();
  }

  if (!tbody || !messageContainer) return;

  // Clear existing data
  tbody.innerHTML = '';
  messageContainer.innerHTML = '';
  messageContainer.className = 'search-dividend-message';

  // Reset pagination
  PAGINATION_CONFIG.currentPage = 1;
  PAGINATION_CONFIG.totalData = [];

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

  // Store data for pagination
  PAGINATION_CONFIG.totalData = data;

  // Render first page
  renderTablePage(data, 1);

  // Create pagination controls if needed
  createPaginationControls(data.length, 1);
}

/**
 * Get year options for dropdown (hardcoded to match production)
 * @returns {array} array of year options
 */
function getYearOptions() {
  // Hardcoded years matching production dropdown
  return [
    '2024-2025',
    '2023-2024',
    '2022-2023',
    '2021-2022',
    '2020-2021',
    '2019-2020',
    '2018-2019'
  ];
}

/**
 * Search for unclaimed dividends
 * @param {string} year selected year
 * @param {string} folioNo folio number or DP ID
 * @returns {Promise<object>} search results
 */
async function searchUnclaimedDividend(year, folioNo) {
  try {
 

    const formdata = new FormData();
    formdata.append("year", year);
    formdata.append("folioNo", folioNo);

    const requestOptions = {
      method: "POST",
      body: formdata
    };

    // const response = await fetch("/content/piramalfinance/api/search-unclaimed-dividend.json", requestOptions);
    const response = await fetch(placeholders.searchUnclaimedDividend, requestOptions);
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
    errors.push('Please Select Year');
  }

  // Folio number is required for search
  if (!folioId || folioId.trim().length === 0) {
    errors.push('Please Enter Folio No.');
  }

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
  const folioError = document.getElementById('folio-error');
  const yearError = document.getElementById('year-error');
  
  if (folioError) {
    const folioMsg = errors.find(e => e.toLowerCase().includes('folio'));
    folioError.textContent = folioMsg || '';
  }
  if (yearError) {
    const yearMsg = errors.find(e => e.toLowerCase().includes('year'));
    yearError.textContent = yearMsg || '';
  }
}

/**
 * Clear validation errors
 */
function clearValidationErrors() {
  const folioError = document.getElementById('folio-error');
  const yearError = document.getElementById('year-error');
  
  if (folioError) {
    folioError.textContent = '';
  }
  if (yearError) {
    yearError.textContent = '';
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

      // Clear previous errors
      clearValidationErrors();

      // Validate form
      const validation = validateForm(year, folioId);
      if (!validation.isValid) {
        showValidationErrors(validation.errors);
        return;
      }

      // Show loading state
      showLoading(true);
      const results = await searchUnclaimedDividend(year, folioId);
      
      // Update table with results
      updateTable(results, content);
      
      // Hide loading state
      showLoading(false);
    });
  }

  // Allow Enter key to trigger search
  if (folioInput) {
    folioInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchButton?.click();
      }
    });

    // Clear error when user starts typing
    folioInput.addEventListener('input', () => {
      clearValidationErrors();
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
export default function decorate(block) {
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

  // Populate year dropdown with hardcoded years (matching production)
  const years = getYearOptions();
  populateYearDropdown(years);
}