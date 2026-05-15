/**
 * Calculator Radio Block
 * Renders Salaried/Business radio tabs for the calculator section.
 * This block should be placed in the same section as the calculator block.
 */

/**
 * Checks if we're in AEM Universal Editor (author mode).
 * In author mode, we need to preserve the original DOM structure
 * so that child components remain editable.
 * @returns {boolean}
 */
function isEditorMode() {
  // Only check for actual Universal Editor iframe environment
  // NOT preview modes like localhost:3000 or .page/.live domains
  const url = window.location.href;

  // Actual author environment with editor canvas
  const isAuthorCanvas = url.includes('.adobeaemcloud.com') && url.includes('/ui#/');

  // Check if we're inside the Universal Editor iframe
  const isUEIframe = document.body.classList.contains('adobe-ue-edit')
    || document.documentElement.classList.contains('adobe-ue-edit');

  return isAuthorCanvas || isUEIframe;
}

/**
 * Extracts radio items from the block rows.
 * 
 * AEM Structure Note: All col1_ fields go into a single cell, so
 * we need to parse the cell's children individually to extract:
 * - Tab Label (first meaningful text)
 * - Tab Icon (image)
 * - FOIR Type (salaried/biz keyword)
 * - FOIR Value (number like 65, 80)
 * 
 * @param {Element} block - The calculator-radio block
 * @returns {Array<{text: string, iconSrc: string, iconAlt: string,
 *          foirType: string, foirValue: string}>}
 */
function extractRadioItems(block) {
  const radioItems = [];
  const rows = [...block.children];

  // eslint-disable-next-line no-console
  console.log('[calculator-radio] Total rows:', rows.length);

  rows.forEach((row, rowIdx) => {
    const cells = [...row.children];
    if (!cells || cells.length < 1) return;

    // Skip if this is a product type only row (single cell with hl/pl/bl/ubl)
    const firstCellFullText = cells[0]?.textContent?.trim()?.toLowerCase() || '';
    if (cells.length === 1 && ['hl', 'pl', 'bl', 'ubl'].includes(firstCellFullText)) {
      return;
    }

    // Parse each cell's content carefully
    let tabLabel = '';
    let iconSrc = '';
    let iconAlt = '';
    let foirType = '';
    let foirValue = '';

    cells.forEach((cell) => {
      // Look for image first
      const img = cell.querySelector('img') || cell.querySelector('picture img');
      if (img && !iconSrc) {
        iconSrc = img.getAttribute('src') || '';
        iconAlt = img.getAttribute('alt') || '';
      }

      // Parse text nodes and child elements separately
      const parseNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text) {
            const lower = text.toLowerCase();
            // Check if it's a FOIR type keyword
            if (lower === 'salaried' || lower === 'biz') {
              if (!foirType) foirType = lower;
            // Check if it's a numeric FOIR value
            } else if (/^\d+$/.test(text)) {
              if (!foirValue) foirValue = text;
            // Otherwise it's likely the tab label
            } else if (!tabLabel && text.length > 1) {
              // Avoid picking up single characters or alt text
              tabLabel = text;
            }
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Skip picture/img elements (we already extracted image)
          if (node.tagName === 'PICTURE' || node.tagName === 'IMG') return;
          // For other elements, check their direct text content
          // but don't recurse into images
          const directText = [...node.childNodes]
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent.trim())
            .join(' ')
            .trim();
          
          if (directText) {
            const lower = directText.toLowerCase();
            if (lower === 'salaried' || lower === 'biz') {
              if (!foirType) foirType = lower;
            } else if (/^\d+$/.test(directText)) {
              if (!foirValue) foirValue = directText;
            } else if (!tabLabel && directText.length > 1) {
              tabLabel = directText;
            }
          }
          // Recurse into children (but not images)
          [...node.childNodes].forEach(parseNode);
        }
      };

      [...cell.childNodes].forEach(parseNode);
    });

    // Derive FOIR type from tab label if not found explicitly
    if (!foirType && tabLabel) {
      const lowerLabel = tabLabel.toLowerCase();
      if (lowerLabel.includes('salaried') || lowerLabel.includes('salary')) {
        foirType = 'salaried';
      } else if (lowerLabel.includes('business') || lowerLabel.includes('self') || lowerLabel.includes('biz')) {
        foirType = 'biz';
      } else {
        foirType = radioItems.length === 0 ? 'salaried' : 'biz';
      }
    }

    // Default FOIR type based on position
    if (!foirType) {
      foirType = radioItems.length === 0 ? 'salaried' : 'biz';
    }

    // Default FOIR values (65 for salaried, 80 for business)
    if (!foirValue) {
      foirValue = foirType === 'salaried' ? '65' : '80';
    }

    // Default icon alt
    if (!iconAlt) {
      iconAlt = tabLabel || foirType;
    }

    // eslint-disable-next-line no-console
    console.log(`[calculator-radio] Row ${rowIdx}: label="${tabLabel}", foirType="${foirType}", foirValue="${foirValue}"`);

    if (tabLabel || iconSrc) {
      radioItems.push({
        text: tabLabel || (foirType === 'salaried' ? 'Salaried' : 'Self Employed'),
        iconSrc,
        iconAlt,
        foirType,
        foirValue,
      });
    }
  });

  return radioItems;
}

/**
 * Gets the product type from the block's first row or data attribute.
 * @param {Element} block - The calculator-radio block
 * @returns {string}
 */
function getProductType(block) {
  // Check for data attribute first (set by AEM)
  const firstCell = block.querySelector(':scope > div > div');
  const productType = firstCell?.textContent?.trim()?.toLowerCase();
  if (productType && ['hl', 'pl', 'bl', 'ubl'].includes(productType)) {
    return productType;
  }
  return 'hl';
}

const TAB_NUM_NAMES = ['one', 'two', 'three', 'four', 'five'];

/**
 * Builds the radio tab HTML structure.
 * @param {Array} radioItems - Array of radio item objects
 * @returns {string}
 */
function buildRadioHTML(radioItems) {
  if (!radioItems.length) return '';

  let radioLiHTML = '';
  radioItems.forEach((item, idx) => {
    const { foirType, foirValue } = item;
    const liId = `${foirType}Tab`;
    const inputId = `${foirType}RadioInput`;
    const isChecked = idx === 0 ? ' checked="checked"' : '';
    const activeClass = idx === 0 ? ' active' : '';
    const numClass = TAB_NUM_NAMES[idx] ? `${TAB_NUM_NAMES[idx]}tab` : '';
    // Both tabs need firsttab base class, secondtab adds override styles
    const posClass = idx === 0 ? 'firsttab' : 'firsttab secondtab';
    const parentExtra = foirType === 'biz' ? ' business-parent' : '';
    const inputClass = foirType === 'salaried'
      ? 'input_salary_checkbox'
      : 'input_business_checkbox';
    const imgAlt = item.iconAlt || foirType;

    radioLiHTML += `
      <li id="${liId}" class="${posClass} ${numClass}${activeClass}" data-radio-index="${idx}">
        <div class="customecheck">
          <div class="salary-parent${parentExtra}">
            <input type="radio" id="${inputId}" name="employementStatus"
              class="${inputClass}" data-cal-foir="${foirType}" value="${foirValue}"${isChecked}>
            <label for="${inputId}">${item.text}</label>
            <div class="blackborder"><div class="black"></div></div>
          </div>
          <div class="customimage">
            <img data-src="${item.iconSrc}" class="customer lozad" alt="${imgAlt}"
              src="${item.iconSrc}" data-loaded="true">
          </div>
        </div>
      </li>`;
  });

  return `
    <div class="hlc-subparent">
      <ul class="radiotab">
        ${radioLiHTML}
      </ul>
    </div>`;
}

/**
 * Initializes radio tab click handling and sets initial active state.
 * Matches production calculator behavior for backgrounds and styling.
 * @param {Element} block - The calculator-radio block
 */
function initRadioTabs(block) {
  const section = block.closest('.section');
  if (!section) return;

  const radioTabs = [...block.querySelectorAll('.radiotab > li')];
  if (radioTabs.length === 0) return;

  // Background colors matching production
  const SALARIED_BG = 'rgb(255, 247, 244)'; // #fff7f4 - Coral/Orange tint
  const BUSINESS_BG = 'rgb(238, 243, 255)'; // #eef3ff - Blue tint
  const WHITE = 'rgb(255, 255, 255)';

  /**
   * Updates all backgrounds based on which tab is selected
   * @param {number} selectedIdx - The selected tab index (0 = salaried, 1 = business)
   */
  function updateBackgrounds(selectedIdx) {
    const isSalaried = selectedIdx === 0;

    // Update tab backgrounds
    radioTabs.forEach((tab, idx) => {
      if (idx === selectedIdx) {
        tab.style.background = isSalaried ? SALARIED_BG : BUSINESS_BG;
      } else {
        tab.style.background = WHITE;
      }
    });

    // Update gradient on the block (50/50 split)
    // When salaried: coral on left, white on right
    // When business: white on left, blue on right
    if (isSalaried) {
      block.style.background = `linear-gradient(to right, ${SALARIED_BG} 50%, ${WHITE} 50%)`;
    } else {
      block.style.background = `linear-gradient(to right, ${WHITE} 50%, ${BUSINESS_BG} 50%)`;
    }

    // Update calculator parent background - find it fresh each time
    const calculatorParent = section.querySelector('.calculator-parent');
    if (calculatorParent) {
      calculatorParent.style.background = isSalaried ? SALARIED_BG : BUSINESS_BG;
    }
  }

  /**
   * Sets a tab as active and updates all styling
   * @param {number} idx - Tab index to activate
   */
  function activateTab(idx) {
    radioTabs.forEach((tab, i) => {
      const radioInput = tab.querySelector('input[type="radio"]');
      const salaryParent = tab.querySelector('.salary-parent');
      if (i === idx) {
        tab.classList.add('active');
        if (salaryParent) salaryParent.classList.add('is-checked');
        if (radioInput) {
          radioInput.checked = true;
          radioInput.setAttribute('checked', 'checked');
        }
      } else {
        tab.classList.remove('active');
        if (salaryParent) salaryParent.classList.remove('is-checked');
        if (radioInput) {
          radioInput.checked = false;
          radioInput.removeAttribute('checked');
        }
      }
    });

    updateBackgrounds(idx);
  }

  // Set initial active state for first tab (salaried)
  activateTab(0);

  // Set up click handlers for all tabs
  radioTabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      activateTab(idx);

      // Trigger recalculation by dispatching change on the checked radio
      const radioInput = tab.querySelector('input[type="radio"]');
      if (radioInput) {
        radioInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Also trigger on visible calculator for immediate recalc
      const visibleCalc = section.querySelector('.commoncalculator:not([style*="display: none"])');
      if (visibleCalc) {
        const calcInput = visibleCalc.querySelector('input[type="range"]');
        if (calcInput) {
          calcInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });
  });
}

export default async function decorate(block) {
  const section = block.closest('.section');
  const productType = getProductType(block);

  // In editor mode, preserve the original DOM structure for authoring
  // The Universal Editor needs the original structure to allow adding/editing children
  if (isEditorMode()) {
    // Add minimal styling for editor preview
    block.classList.add('calculator-radio-editor-mode');

    // Add product type hidden input to section if not already present
    if (section && !section.querySelector('#calculator-product-type')) {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'product type';
      hiddenInput.id = 'calculator-product-type';
      hiddenInput.value = productType;
      section.appendChild(hiddenInput);
    }

    // Add homeloancalculator class to section
    if (section) {
      section.classList.add('homeloancalculator');
    }

    // Don't replace innerHTML - let the editor manage the content
    return;
  }

  // Preview/Publish mode - transform to final radio tab UI
  // Add homeloancalculator class to section for production CSS compatibility
  if (section) {
    section.classList.add('homeloancalculator');
  }

  const radioItems = extractRadioItems(block);

  // If no radio items authored, create a hidden fallback
  if (radioItems.length === 0) {
    block.innerHTML = '';
    const fallbackRadio = document.createElement('input');
    fallbackRadio.type = 'radio';
    fallbackRadio.name = 'calculator-foir';
    fallbackRadio.className = 'input_salary_checkbox';
    fallbackRadio.dataset.calFoir = 'salaried';
    fallbackRadio.value = '65';
    fallbackRadio.checked = true;
    fallbackRadio.style.display = 'none';
    block.appendChild(fallbackRadio);
  } else {
    // Build radio tabs UI
    block.innerHTML = buildRadioHTML(radioItems);
    block.classList.add('home-loan-calculator-parent', 'combined-emi-eligibility');

    // CRITICAL: Ensure first radio is checked immediately after HTML insertion
    // The checked="checked" attribute should work, but we set the property explicitly
    const firstRadio = block.querySelector('input[type="radio"][data-cal-foir]');
    if (firstRadio) {
      firstRadio.checked = true;
    }

    // Set initial background (salaried = first tab is active)
    const SALARIED_BG = 'rgb(255, 247, 244)';
    const WHITE = 'rgb(255, 255, 255)';
    block.style.background = `linear-gradient(to right, ${SALARIED_BG} 50%, ${WHITE} 50%)`;

    // Initialize click handlers and set initial active state
    initRadioTabs(block);
  }

  // Wrap block in calculator-radio-wrapper div
  const wrapper = document.createElement('div');
  wrapper.className = 'calculator-radio-wrapper';
  block.parentNode.insertBefore(wrapper, block);
  wrapper.appendChild(block);

  // Add product type hidden input to section if not already present
  if (section && !section.querySelector('#calculator-product-type')) {
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'product type';
    hiddenInput.id = 'calculator-product-type';
    hiddenInput.value = productType;
    section.appendChild(hiddenInput);
  }

  // Add homeloancalculator class to section
  if (section) {
    section.classList.add('homeloancalculator');
  }

  // Set initial calculator-parent background (wait for calculator block to be ready)
  // Use longer delay and retry to ensure calculator is fully initialized
  function triggerInitialCalculation(attempt = 0) {
    const calculatorParent = section?.querySelector('.calculator-parent');
    const rangeInput = section?.querySelector('input[type="range"]');

    if (calculatorParent) {
      calculatorParent.style.background = 'rgb(255, 247, 244)'; // Salaried background
    }

    // Check if calculator is ready (has range inputs)
    if (rangeInput) {
      // Dispatch event to trigger calculator recalculation now that radio is ready
      const checkedRadio = section?.querySelector('[data-cal-foir]:checked');
      if (checkedRadio) {
        checkedRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      // Also trigger input event on a range slider to force recalculation
      rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (attempt < 10) {
      // Retry if calculator not ready yet
      setTimeout(() => triggerInitialCalculation(attempt + 1), 200);
    }
  }

  setTimeout(() => triggerInitialCalculation(), 200);
}
