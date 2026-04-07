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

/* ---- File type icons (minimal document + prominent label) ---- */
function createFileIcon(label, accentColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M8 4a2 2 0 012-2h12l10 10v22a2 2 0 01-2 2H10a2 2 0 01-2-2V4z" fill="#fff" stroke="#B0BEC5" stroke-width="1.2"/>
    <path d="M22 2v8a2 2 0 002 2h8" fill="#ECEFF1" stroke="#B0BEC5" stroke-width="1.2" stroke-linejoin="round"/>
    <rect x="12" y="16" width="10" height="1.2" rx=".6" fill="#CFD8DC"/>
    <rect x="12" y="19.5" width="7" height="1.2" rx=".6" fill="#CFD8DC"/>
    <rect x="6" y="26" width="20" height="10" rx="2" fill="${accentColor}"/>
    <text x="16" y="34" text-anchor="middle" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="7.5" font-weight="700" letter-spacing="0.5">${label}</text>
    <circle cx="30" cy="34" r="5.5" fill="${accentColor}" stroke="#fff" stroke-width="1.5"/>
    <path d="M30 31.5v3.5M28.2 33.5l1.8 1.8 1.8-1.8" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

const FILE_ICON_PDF = createFileIcon('PDF', '#D04423');
const FILE_ICON_EXCEL = createFileIcon('XLS', '#1D6F42');
const FILE_ICON_WORD = createFileIcon('DOC', '#2B579A');
const FILE_ICON_MP3 = createFileIcon('MP3', '#7F4CA8');
const FILE_ICON_MP4 = createFileIcon('MP4', '#7F4CA8');
const FILE_ICON_PPT = createFileIcon('PPT', '#D04423');

const FILE_TYPE_MAP = {
  pdf: { icon: FILE_ICON_PDF, label: 'PDF', cssClass: 'fr-file--pdf' },
  ppt: { icon: FILE_ICON_PPT, label: 'PPT', cssClass: 'fr-file--ppt' },
  pptx: { icon: FILE_ICON_PPT, label: 'PPT', cssClass: 'fr-file--ppt' },
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
  if (format.includes('presentation') || format.includes('powerpoint')) return FILE_TYPE_MAP.pptx;
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
    // Skip rows where no file exists for any quarter
    const hasAnyFile = QUARTERS.some(
      (q) => reportType.pdfs.some((p) => p.results && p.results.toUpperCase() === q),
    );
    if (!hasAnyFile) return;

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

  const isShowAll = state.yearIndex === 'all';

  // Company tabs
  const tabs = companies
    .map(
      (c, i) => `<button class="fr-tab${i === state.companyIndex ? ' fr-tab--active' : ''}" data-index="${i}" type="button">${c.name}</button>`,
    )
    .join('');

  // Year dropdown options — individual years first, "Show all" at bottom
  const yearOptions = [];
  if (category) {
    category.years.forEach((y) => {
      yearOptions.push({ value: y.year, label: `FY ${y.year}` });
    });
  }
  yearOptions.push({ value: 'all', label: 'Show all' });
  const selectedYear = isShowAll ? 'all' : (category?.years[state.yearIndex]?.year || '');

  // Category dropdown options
  const categoryOptions = company.categories.map((c) => ({
    value: c.slug,
    label: c.name,
  }));
  const selectedCategory = category ? category.slug : '';

  // Build table content: show all years or single year
  let tableContent = '';
  if (isShowAll && category) {
    category.years.forEach((yearData) => {
      tableContent += `<h3 class="fr-fy-heading">FY ${yearData.year}</h3>`;
      tableContent += buildTable(yearData);
    });
  } else {
    const yearData = category?.years[state.yearIndex] || category?.years[0];
    const fyHeading = yearData ? `FY ${yearData.year}` : '';
    tableContent = `<h3 class="fr-fy-heading">${fyHeading}</h3>`;
    tableContent += buildTable(yearData);
  }

  block.innerHTML = `
    <div class="fr-container">
      <div class="fr-tabs">${tabs}</div>
      <div class="fr-controls">
        ${createDropdown(yearOptions, selectedYear, 'fr-dropdown--year', 'Select Financial Year')}
        ${createDropdown(categoryOptions, selectedCategory, 'fr-dropdown--category', 'Select Report Category')}
      </div>
      ${tableContent}
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
        if (value === 'all') {
          const newState = { ...state, yearIndex: 'all' };
          renderUI(block, companies, newState);
        } else {
          const company = companies[state.companyIndex];
          const category = company.categories[state.categoryIndex];
          const yearIndex = category.years.findIndex((y) => y.year === value);
          const newState = { ...state, yearIndex: yearIndex >= 0 ? yearIndex : 0 };
          renderUI(block, companies, newState);
        }
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

    // Check sessionStorage for category passed from header nav
    let initialCompanyIndex = 0;
    let initialCategoryIndex = 0;
    const storedCategory = sessionStorage.getItem('fr-selected-category');
    if (storedCategory) {
      sessionStorage.removeItem('fr-selected-category');
      for (let ci = 0; ci < companies.length; ci += 1) {
        const catIdx = companies[ci].categories.findIndex(
          (c) => c.slug === storedCategory,
        );
        if (catIdx >= 0) {
          initialCompanyIndex = ci;
          initialCategoryIndex = catIdx;
          break;
        }
      }
    }

    const initialState = {
      companyIndex: initialCompanyIndex,
      categoryIndex: initialCategoryIndex,
      yearIndex: 0,
    };

    renderUI(block, companies, initialState);
  } catch (error) {
    console.error('Financial Results Revamp: Error loading data', error);
    block.innerHTML = '<div class="fr-error">Failed to load financial results.</div>';
  }
}
