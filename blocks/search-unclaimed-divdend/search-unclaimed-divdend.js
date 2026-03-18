/**
 * Search Unclaimed Dividend Block
 * Displays a search form and results table for unclaimed dividends
 */



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
  yearField.appendChild(yearFieldLabel);
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
 * Get year options for dropdown (hardcoded to match production)
 * @returns {array} array of year options
 */
function getYearOptions() {
  // Hardcoded years matching production dropdown
  return [
    '2023-2024',
    '2022-2023',
    '2021-2022',
    '2020-2021',
    '2019-2020',
    '2018-2019',
    '2017-2018'
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