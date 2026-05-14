/**
 * Calculator Radio Block
 * Renders Salaried/Business radio tabs for the calculator section.
 * This block should be placed in the same section as the calculator block.
 */

/**
 * Extracts radio items from the block rows.
 * Row structure: Text | Image | ImageAlt | FoirType | FoirValue
 * @param {Element} block - The calculator-radio block
 * @returns {Array<{text: string, iconSrc: string, iconAlt: string,
 *          foirType: string, foirValue: string}>}
 */
function extractRadioItems(block) {
  const radioItems = [];
  const rows = [...block.children];

  // First row may contain product type
  rows.forEach((row, idx) => {
    const cells = row.children;
    if (!cells || cells.length < 2) return;

    // Check if this is a radio item row (has image in second cell)
    const img = cells[1]?.querySelector('img');
    if (!img) return;

    const text = cells[0]?.textContent?.trim() || '';
    const iconSrc = img.getAttribute('src') || '';
    const iconAlt = cells[2]?.textContent?.trim() || img.getAttribute('alt') || '';

    // FOIR type from cell 3 or derive from text
    let foirType = cells[3]?.textContent?.trim()?.toLowerCase() || '';
    if (!foirType) {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('salaried') || lowerText.includes('salary')) {
        foirType = 'salaried';
      } else if (lowerText.includes('business') || lowerText.includes('biz')) {
        foirType = 'biz';
      } else {
        foirType = idx === 0 ? 'salaried' : 'biz';
      }
    }

    // FOIR value from cell 4 or use defaults
    let foirValue = cells[4]?.textContent?.trim() || '';
    if (!foirValue) {
      foirValue = foirType === 'salaried' ? '65' : '80';
    }

    if (text) {
      radioItems.push({
        text, iconSrc, iconAlt, foirType, foirValue,
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
    const isChecked = idx === 0 ? ' checked' : '';
    const activeClass = idx === 0 ? ' active' : '';
    const numClass = TAB_NUM_NAMES[idx] ? `${TAB_NUM_NAMES[idx]}tab` : '';
    const posClasses = idx === 0 ? 'firsttab onetab' : 'firsttab secondtab twotab';
    const parentExtra = foirType === 'biz' ? ' business-parent' : '';
    const inputClass = foirType === 'salaried'
      ? 'input_salary_checkbox'
      : 'input_business_checkbox';
    const imgAlt = item.iconAlt || foirType;

    radioLiHTML += `
      <li id="${liId}" class="${posClasses} ${numClass}${activeClass}" data-radio-index="${idx}">
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
 * Initializes radio tab click handling.
 * @param {Element} block - The calculator-radio block
 */
function initRadioTabs(block) {
  const section = block.closest('.section');
  if (!section) return;

  const radioTabs = [...block.querySelectorAll('.radiotab > li')];
  if (radioTabs.length < 2) return;

  const calculatorParent = section.querySelector('.calculator-parent');

  radioTabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      const isSalaried = tab.querySelector('[data-cal-foir="salaried"]') !== null;
      const radioInput = tab.querySelector('input[type="radio"]');
      if (radioInput) radioInput.checked = true;

      radioTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      tab.style.background = isSalaried ? '#fff7f4' : '#eef3ff';
      radioTabs.forEach((otherTab, otherIdx) => {
        if (otherIdx !== idx) otherTab.style.background = '#ffffff';
      });

      if (calculatorParent) {
        calculatorParent.style.background = isSalaried ? '#fff7f4' : '#eef3ff';
      }

      block.style.background = isSalaried
        ? '-webkit-linear-gradient(right, #fff 50%, #fff7f4 50%)'
        : '-webkit-linear-gradient(right, #eef3ff 50%, #fff 50%)';

      // Trigger recalculation
      const visibleCalc = section.querySelector('.commoncalculator:not([style*="display: none"])');
      if (visibleCalc) {
        visibleCalc.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
}

export default async function decorate(block) {
  const section = block.closest('.section');
  const radioItems = extractRadioItems(block);
  const productType = getProductType(block);

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

    // Initialize click handlers
    initRadioTabs(block);
  }

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
}
