import { fetchAPI, getProps } from '../../scripts/common.js';

const AEM_PUBLISH_DOMAIN = 'https://uatmarketing.piramalfinance.com';

/**
 * Resolve API/asset URL - on non-publish environments, prepend AEM publish domain
 */
function resolveUrl(url) {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  const { hostname } = window.location;
  const isNonPublish = hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname.endsWith('.adobeaemcloud.com')
    || hostname.endsWith('.hlx.page')
    || hostname.endsWith('.hlx.live');
  if (isNonPublish && url.startsWith('/content/')) {
    return `${AEM_PUBLISH_DOMAIN}${url}`;
  }
  return url;
}

/* ---- File type icons ---- */
const FILE_ICON_PDF = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="currentColor">
  <path d="M28.681 7.159c-0.694-0.947-1.662-2.053-2.724-3.116s-2.169-2.030-3.116-2.724c-1.612-1.182-2.393-1.319-2.841-1.319h-15.5c-1.378 0-2.5 1.121-2.5 2.5v27c0 1.378 1.122 2.5 2.5 2.5h23c1.378 0 2.5-1.122 2.5-2.5v-19.5c0-0.448-0.137-1.23-1.319-2.841zM24.543 5.457c0.959 0.959 1.712 1.825 2.268 2.543h-4.811v-4.811c0.718 0.556 1.584 1.309 2.543 2.268zM28 29.5c0 0.271-0.229 0.5-0.5 0.5h-23c-0.271 0-0.5-0.229-0.5-0.5v-27c0-0.271 0.229-0.5 0.5-0.5 0 0 15.499-0 15.5 0v7c0 0.552 0.448 1 1 1h7v19.5z"></path>
  <path d="M23 26h-14c-0.552 0-1-0.448-1-1s0.448-1 1-1h14c0.552 0 1 0.448 1 1s-0.448 1-1 1z"></path>
  <path d="M23 22h-14c-0.552 0-1-0.448-1-1s0.448-1 1-1h14c0.552 0 1 0.448 1 1s-0.448 1-1 1z"></path>
  <path d="M23 18h-14c-0.552 0-1-0.448-1-1s0.448-1 1-1h14c0.552 0 1 0.448 1 1s-0.448 1-1 1z"></path>
</svg>`;

const FILE_ICON_EXCEL = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
  <polyline points="14 2 14 8 20 8" fill="none" stroke="#fff" stroke-width="1"/>
  <text x="12" y="17" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">XLS</text>
</svg>`;

const FILE_ICON_WORD = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
  <polyline points="14 2 14 8 20 8" fill="none" stroke="#fff" stroke-width="1"/>
  <text x="12" y="17" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">DOC</text>
</svg>`;

const FILE_ICON_MP3 = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
</svg>`;

const FILE_ICON_MP4 = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
</svg>`;

const FILE_TYPE_MAP = {
  pdf: { icon: FILE_ICON_PDF, label: 'PDF', cssClass: 'fr-file--pdf' },
  xls: { icon: FILE_ICON_EXCEL, label: 'Excel', cssClass: 'fr-file--excel' },
  xlsx: { icon: FILE_ICON_EXCEL, label: 'Excel', cssClass: 'fr-file--excel' },
  csv: { icon: FILE_ICON_EXCEL, label: 'CSV', cssClass: 'fr-file--excel' },
  doc: { icon: FILE_ICON_WORD, label: 'Word', cssClass: 'fr-file--word' },
  docx: { icon: FILE_ICON_WORD, label: 'Word', cssClass: 'fr-file--word' },
  mp3: { icon: FILE_ICON_MP3, label: 'MP3', cssClass: 'fr-file--audio' },
  mp4: { icon: FILE_ICON_MP4, label: 'MP4', cssClass: 'fr-file--video' },
};

const DEFAULT_FILE_TYPE = { icon: FILE_ICON_PDF, label: 'File', cssClass: 'fr-file--pdf' };

/**
 * Detect file type from path or dc:format
 */
function getFileType(file) {
  const format = (file['dc:format'] || '').toLowerCase();
  if (format.includes('pdf')) return FILE_TYPE_MAP.pdf;
  if (format.includes('excel') || format.includes('spreadsheet')) return FILE_TYPE_MAP.xlsx;
  if (format.includes('word') || format.includes('document')) return FILE_TYPE_MAP.docx;
  if (format.includes('audio') || format.includes('mp3')) return FILE_TYPE_MAP.mp3;
  if (format.includes('video') || format.includes('mp4')) return FILE_TYPE_MAP.mp4;

  const ext = (file.path || file.name || '').split('.').pop().toLowerCase();
  return FILE_TYPE_MAP[ext] || DEFAULT_FILE_TYPE;
}

const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

/**
 * Formats a slug like "piramal-finance-limited" to "Piramal Finance Limited"
 */
function formatSlug(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Parse the deeply nested API response into a flat usable structure.
 * Returns: { companies: [ { name, slug, categories: [ { name, slug, years: [ { year, reportTypes: [ { name, slug, pdfs: [...] } ] } ] } ] } ] }
 */
function parseAPIData(data) {
  const selectorKey = Object.keys(data)[0];
  const companiesRaw = data[selectorKey];
  const companies = [];

  companiesRaw.forEach((companyObj) => {
    const companySlug = Object.keys(companyObj)[0];
    const companyData = companyObj[companySlug];
    const company = {
      name: formatSlug(companySlug),
      slug: companySlug,
      categories: [],
    };

    companyData.forEach((categoryObj) => {
      const categorySlug = Object.keys(categoryObj)[0];
      const categoryData = categoryObj[categorySlug];
      const category = {
        name: formatSlug(categorySlug),
        slug: categorySlug,
        years: [],
      };

      categoryData.forEach((yearObj) => {
        const yearKey = Object.keys(yearObj)[0];
        const yearData = yearObj[yearKey];
        const yearEntry = {
          year: yearKey,
          reportTypes: [],
        };

        // yearData is an array of report type objects
        if (Array.isArray(yearData)) {
          yearData.forEach((reportTypeObj) => {
            const reportTypeSlug = Object.keys(reportTypeObj)[0];
            const reportTypeItems = reportTypeObj[reportTypeSlug];

            // Check if items are actual PDF objects or nested further
            if (Array.isArray(reportTypeItems) && reportTypeItems.length > 0) {
              const firstItem = reportTypeItems[0];
              // If item has 'path' key, it's a PDF object
              if (firstItem.path) {
                yearEntry.reportTypes.push({
                  name: formatSlug(reportTypeSlug),
                  slug: reportTypeSlug,
                  pdfs: reportTypeItems.filter((pdf) => pdf['is-hide'] !== 'true'),
                });
              } else {
                // Nested further (e.g., q1 -> pdf objects)
                const nestedPdfs = [];
                reportTypeItems.forEach((nestedObj) => {
                  Object.keys(nestedObj).forEach((nestedKey) => {
                    const items = nestedObj[nestedKey];
                    if (Array.isArray(items)) {
                      items.forEach((pdf) => {
                        if (pdf.path && pdf['is-hide'] !== 'true') {
                          // Map the nested key to quarter if applicable
                          const quarter = nestedKey.toUpperCase();
                          nestedPdfs.push({ ...pdf, results: pdf.results || quarter });
                        }
                      });
                    }
                  });
                });
                if (nestedPdfs.length > 0) {
                  yearEntry.reportTypes.push({
                    name: formatSlug(reportTypeSlug),
                    slug: reportTypeSlug,
                    pdfs: nestedPdfs,
                  });
                }
              }
            }
          });
        }

        category.years.push(yearEntry);
      });

      // Sort years descending
      category.years.sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));
      company.categories.push(category);
    });

    companies.push(company);
  });

  return companies;
}

/**
 * Check whether the year data contains quarterly (Q1-Q4) structure.
 * Returns true if ANY pdf across all report types has a `results` field.
 */
function isQuarterlyData(yearData) {
  return yearData.reportTypes.some((rt) => rt.pdfs.some((p) => p.results));
}

/**
 * Build a simple two-column table for non-quarterly categories
 * (e.g. Debt Equity Presentation, Annual Reports – no Q1/Q2/Q3/Q4 columns).
 */
function buildSimpleTable(yearData) {
  let rows = '';
  yearData.reportTypes.forEach((reportType) => {
    reportType.pdfs.forEach((file) => {
      const title = file['dc:title'] || reportType.name;
      const fileType = getFileType(file);
      const resolvedPath = resolveUrl(file.path);
      rows += `<tr class="fr-table-row">
        <td class="fr-table-cell fr-table-cell--name">${title}</td>
        <td class="fr-table-cell fr-table-cell--has-file ${fileType.cssClass}">
          <a href="${resolvedPath}" target="_blank" rel="noopener noreferrer" title="${title} (${fileType.label})" aria-label="Open ${title} ${fileType.label}">
            ${fileType.icon}
          </a>
        </td>
      </tr>`;
    });
  });

  return `<div class="fr-table-wrapper">
    <table class="fr-table fr-table--simple">
      <thead>
        <tr class="fr-table-header">
          <th class="fr-table-th fr-table-th--name">Reports</th>
          <th class="fr-table-th fr-table-th--download">Download</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>`;
}

/**
 * Build the table for a specific company + category + year
 */
function buildTable(yearData) {
  if (!yearData || !yearData.reportTypes || yearData.reportTypes.length === 0) {
    return '<div class="fr-no-data">No data available for this selection.</div>';
  }

  // Non-quarterly categories: use simple two-column layout
  if (!isQuarterlyData(yearData)) {
    return buildSimpleTable(yearData);
  }

  let rows = '';
  yearData.reportTypes.forEach((reportType) => {
    const cells = QUARTERS.map((q) => {
      const file = reportType.pdfs.find(
        (p) => p.results && p.results.toUpperCase() === q,
      );
      if (file) {
        const title = file['dc:title'] || reportType.name;
        const fileType = getFileType(file);
        const resolvedPath = resolveUrl(file.path);
        return `<td class="fr-table-cell fr-table-cell--has-file ${fileType.cssClass}">
          <a href="${resolvedPath}" target="_blank" rel="noopener noreferrer" title="${title} (${fileType.label})" aria-label="Open ${reportType.name} ${q} ${fileType.label}">
            ${fileType.icon}
          </a>
        </td>`;
      }
      return '<td class="fr-table-cell fr-table-cell--empty"><span class="fr-dash">&ndash;</span></td>';
    }).join('');

    rows += `<tr class="fr-table-row">
      <td class="fr-table-cell fr-table-cell--name">${reportType.name}</td>
      ${cells}
    </tr>`;
  });

  return `<div class="fr-table-wrapper">
    <table class="fr-table">
      <thead>
        <tr class="fr-table-header">
          <th class="fr-table-th fr-table-th--name">Reports</th>
          ${QUARTERS.map((q) => `<th class="fr-table-th fr-table-th--quarter">${q}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>`;
}

/**
 * Create a custom select dropdown
 */
function createDropdown(options, selectedValue, className, labelPrefix) {
  const selectedLabel = options.find((o) => o.value === selectedValue)?.label || '';
  const optionItems = options
    .map(
      (o) => `<li class="fr-dropdown-item${o.value === selectedValue ? ' fr-dropdown-item--active' : ''}" data-value="${o.value}">${o.label}</li>`,
    )
    .join('');

  return `<div class="fr-dropdown ${className}" role="listbox" aria-label="${labelPrefix}">
    <button class="fr-dropdown-trigger" type="button" aria-expanded="false" aria-haspopup="listbox">
      <span class="fr-dropdown-value">${selectedLabel}</span>
      ${CHEVRON_DOWN}
    </button>
    <ul class="fr-dropdown-menu">${optionItems}</ul>
  </div>`;
}

function renderUI(block, companies, state) {
  const company = companies[state.companyIndex];
  const category = company.categories[state.categoryIndex] || company.categories[0];
  const yearData = category?.years[state.yearIndex] || category?.years[0];

  // Company tabs
  const tabs = companies
    .map(
      (c, i) => `<button class="fr-tab${i === state.companyIndex ? ' fr-tab--active' : ''}" data-index="${i}" type="button">${c.name}</button>`,
    )
    .join('');

  // Year dropdown options
  const yearOptions = category
    ? category.years.map((y) => ({ value: y.year, label: `FY ${y.year}` }))
    : [];
  const selectedYear = yearData ? yearData.year : '';

  // Category dropdown options
  const categoryOptions = company.categories.map((c) => ({
    value: c.slug,
    label: c.name,
  }));
  const selectedCategory = category ? category.slug : '';

  // FY heading
  const fyHeading = yearData ? `FY ${yearData.year}` : '';

  // Table
  const table = buildTable(yearData);

  block.innerHTML = `
    <div class="fr-container">
      <div class="fr-tabs">${tabs}</div>
      <div class="fr-controls">
        ${createDropdown(yearOptions, selectedYear, 'fr-dropdown--year', 'Select Financial Year')}
        ${createDropdown(categoryOptions, selectedCategory, 'fr-dropdown--category', 'Select Report Category')}
      </div>
      <h3 class="fr-fy-heading">${fyHeading}</h3>
      ${table}
    </div>
  `;

  // Bind events
  bindEvents(block, companies, state);
}

function bindEvents(block, companies, state) {
  // Tab clicks
  block.querySelectorAll('.fr-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const newState = {
        companyIndex: parseInt(tab.dataset.index, 10),
        categoryIndex: 0,
        yearIndex: 0,
      };
      renderUI(block, companies, newState);
    });
  });

  // Dropdown toggling
  block.querySelectorAll('.fr-dropdown-trigger').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = trigger.closest('.fr-dropdown');
      const isOpen = dropdown.classList.contains('fr-dropdown--open');

      // Close all dropdowns
      block.querySelectorAll('.fr-dropdown').forEach((d) => {
        d.classList.remove('fr-dropdown--open');
        d.querySelector('.fr-dropdown-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        dropdown.classList.add('fr-dropdown--open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Dropdown item selection
  block.querySelectorAll('.fr-dropdown-item').forEach((item) => {
    item.addEventListener('click', () => {
      const dropdown = item.closest('.fr-dropdown');
      const value = item.dataset.value;

      if (dropdown.classList.contains('fr-dropdown--year')) {
        const company = companies[state.companyIndex];
        const category = company.categories[state.categoryIndex];
        const yearIndex = category.years.findIndex((y) => y.year === value);
        const newState = { ...state, yearIndex: yearIndex >= 0 ? yearIndex : 0 };
        renderUI(block, companies, newState);
      } else if (dropdown.classList.contains('fr-dropdown--category')) {
        const company = companies[state.companyIndex];
        const categoryIndex = company.categories.findIndex((c) => c.slug === value);
        const newState = {
          ...state,
          categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
          yearIndex: 0,
        };
        renderUI(block, companies, newState);
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    block.querySelectorAll('.fr-dropdown').forEach((d) => {
      d.classList.remove('fr-dropdown--open');
      d.querySelector('.fr-dropdown-trigger').setAttribute('aria-expanded', 'false');
    });
  });
}

export default async function decorate(block) {
  const props = getProps(block);
  const [rawUrl] = props;
  const url = resolveUrl(rawUrl);
  block.innerHTML = '<div class="fr-loader">Loading...</div>';

  if (!url) {
    block.innerHTML = '<div class="fr-error">API URL is required.</div>';
    return;
  }

  try {
    const resp = await fetchAPI('GET', url);
    const data = await resp.json();
    const companies = parseAPIData(data);

    if (!companies.length) {
      block.innerHTML = '<div class="fr-error">No financial results data found.</div>';
      return;
    }

    const initialState = {
      companyIndex: 0,
      categoryIndex: 0,
      yearIndex: 0,
    };

    renderUI(block, companies, initialState);
  } catch (error) {
    console.error('Financial Results Revamp: Error loading data', error);
    block.innerHTML = '<div class="fr-error">Failed to load financial results.</div>';
  }
}
