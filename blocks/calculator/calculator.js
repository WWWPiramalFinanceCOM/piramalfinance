import { prepareBlocks, extractContent } from './extract-content.js';
import { buildCalculatorParent, initCalculatorTabs } from './build-tabs.js';
import { workflowHomeLoanCalculation } from '../emiandeligiblitycalc/calhelpers.js';
import { currenyCommaSeperation } from '../../scripts/common.js';
import { CheckAprRate } from '../aprcalculator/aprcalculator.js';

/** Track sections already combined so it runs only once per section */
const combinedSections = new WeakSet();

/** Track sections that have already been fully initialised */
const initialisedSections = new WeakSet();

/**
 * Mapping from authored input names (first <p> in slider rows)
 * to the data-cal-input attribute values the existing calculator
 * logic expects.
 */
const INPUT_NAME_MAP = {
  loanamount: 'loanamt',
  loanamt: 'loanamt',
  loantenure: 'tenure',
  tenure: 'tenure',
  interestrate: 'roi',
  roi: 'roi',
  income: 'income',
  monthlyincome: 'income',
  grossannualincome: 'income',
  grossmonthlyincome: 'income',
  otherloan: 'otherloan',
  existingemi: 'otherloan',
  otherloanemi: 'otherloan',
  netprice: 'netprice',
  productioncost: 'productioncost',
  gstrate: 'gstrate',
  profitratio: 'profitratio',
  origincharges: 'origincharges',
  loanorigination: 'origincharges',
};

/**
 * Maps an authored input name to the correct data-cal-input value.
 */
function mapInputName(authoredName) {
  const key = (authoredName || '').toLowerCase().replace(/[\s_-]/g, '');
  return INPUT_NAME_MAP[key] || key;
}

/**
 * Currency symbols that appear as a prefix before the input value.
 * Everything else authored in the icon field is treated as a suffix.
 */
const CURRENCY_SYMBOLS = ['₹', '$', '€', '£', '¥'];

/**
 * Combines all calculator blocks in a section into a single
 * calculator-parent wrapper with heading and CTA buttons.
 * Radio tabs are handled by the separate calculator-radio block.
 */
function combineSection(section) {
  if (combinedSections.has(section)) return;
  combinedSections.add(section);

  const calcWrappers = [...section.querySelectorAll('.calculator-wrapper')];
  if (calcWrappers.length < 1) return;

  const blocks = calcWrappers.map((w) => w.querySelector('.calculator.block')).filter(Boolean);
  if (blocks.length < 1) return;

  const { heading, tabNames, productType } = prepareBlocks(blocks);
  section.classList.add('homeloancalculator');
  const { ctaItems, dcwToRemove } = extractContent(section);

  const calcParent = buildCalculatorParent(heading, tabNames, ctaItems, blocks);

  calcWrappers.forEach((w) => w.remove());
  dcwToRemove.forEach((dcw) => dcw.remove());

  section.appendChild(calcParent);

  // Check if calculator-radio block exists - if not, add a hidden fallback radio
  const hasRadioBlock = section.querySelector('.calculator-radio');
  if (!hasRadioBlock) {
    const fallbackRadio = document.createElement('input');
    fallbackRadio.type = 'radio';
    fallbackRadio.name = 'calculator-foir';
    fallbackRadio.className = 'input_salary_checkbox';
    fallbackRadio.dataset.calFoir = 'salaried';
    fallbackRadio.value = '65';
    fallbackRadio.checked = true;
    fallbackRadio.style.display = 'none';
    section.appendChild(fallbackRadio);
  }

  const mobileDiv = document.createElement('div');
  mobileDiv.className = 'homepagemobiledesign';
  section.appendChild(mobileDiv);

  // Only add product type if calculator-radio block hasn't already added it
  if (!section.querySelector('#calculator-product-type')) {
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'product type';
    hiddenInput.id = 'calculator-product-type';
    hiddenInput.value = productType;
    section.appendChild(hiddenInput);
  }

  initCalculatorTabs();
}

/**
 * Initialize slider event handlers for the calculator.
 * This is a clean implementation that ONLY handles sliders - 
 * radio tab handling is done by calculator-radio.js
 */
function initializeSliders(section) {
  const sliderValues = section.querySelectorAll('.slider-value');

  sliderValues.forEach((textInput) => {
    const sliderId = textInput.dataset.slider;
    if (!sliderId) return;

    const rangeSlider = section.querySelector(`#${sliderId}`);
    if (!rangeSlider) return;

    const calInput = rangeSlider.dataset.calInput || '';
    const isRoi = calInput === 'roi';

    // Format number with Indian comma separation
    function formatValue(value) {
      const val = Number(value);
      if (Number.isNaN(val)) return '0';
      return isRoi ? String(val) : currenyCommaSeperation(val);
    }

    // Update slider track gradient
    function updateGradient() {
      const min = parseFloat(rangeSlider.min) || 0;
      const max = parseFloat(rangeSlider.max) || 100;
      const val = parseFloat(rangeSlider.value) || 0;
      const percent = ((val - min) / (max - min)) * 100;
      rangeSlider.style.background = `linear-gradient(90deg, #da4d34 ${percent}%, #dbd7d8 ${percent}%)`;
    }

    // Trigger calculation for the calculator panel
    function triggerCalculation() {
      const calcPanel = rangeSlider.closest('.commoncalculator');
      if (calcPanel) {
        const calcType = calcPanel.classList.contains('eligibilitycalculator')
          ? 'eligibility' : 'emi';
        workflowHomeLoanCalculation(calcPanel, calcType);
      }
    }

    // Slider drag event - update text, gradient, and calculate
    rangeSlider.addEventListener('input', () => {
      textInput.value = formatValue(rangeSlider.value);
      updateGradient();
      triggerCalculation();
    });

    // Text input focus out - sync back to slider and calculate
    textInput.addEventListener('focusout', () => {
      let parsed = parseFloat(textInput.value.replace(/,/g, '')) || 0;
      const minVal = parseFloat(rangeSlider.min) || 0;
      const maxVal = parseFloat(rangeSlider.max) || 100;

      // Clamp to valid range
      if (parsed < minVal) parsed = minVal;
      if (parsed > maxVal) parsed = maxVal;

      rangeSlider.value = parsed;
      textInput.value = formatValue(parsed);
      updateGradient();
      triggerCalculation();
    });

    // Text input typing - allow only numbers and decimals for ROI
    textInput.addEventListener('input', () => {
      let cleaned = textInput.value.replace(/[^\d.]/g, '');
      if (!isRoi) {
        cleaned = cleaned.replace(/\./g, ''); // No decimals for non-ROI
      }
      textInput.value = cleaned;
    });

    // Initialize gradient on load
    updateGradient();
  });
}

/**
 * After all blocks in the section are decorated,
 * initialise sliders, store defaults, wire events, and run the first calculation.
 */
function initSection(section, retryCount = 0) {
  if (initialisedSections.has(section)) return;

  const calctabs = section.querySelector('.calctabs');
  if (!calctabs) return;
  const allBlocks = [...calctabs.querySelectorAll('.commoncalculator')];
  if (allBlocks.length === 0) return;
  const allReady = allBlocks.every((b) => b.querySelector('.parent-emi'));

  // Check if calculator-radio has created AND CHECKED a radio input
  // The :checked state is required for calculations to work
  const hasCheckedRadio = section.querySelector('[data-cal-foir]:checked');

  // If not ready, retry (up to 30 times = 3 seconds)
  if (!allReady || !hasCheckedRadio) {
    if (retryCount < 30) {
      setTimeout(() => initSection(section, retryCount + 1), 100);
    }
    return;
  }

  initialisedSections.add(section);

  // Initialize sliders with clean event handlers (no conflicts with calculator-radio)
  initializeSliders(section);

  // Store default slider values for reset (same as homeloancalculatorv2)
  const calDefaultValueObj = JSON.parse(sessionStorage.getItem('calDefaultValueObj') || '{}');
  allBlocks.forEach((cal) => {
    const resetId = cal.dataset.resetId;
    if (!resetId) return;
    calDefaultValueObj[resetId] = Object.fromEntries(
      [...cal.querySelectorAll('input[type=range]')].map((inp) => [inp.id, inp.value]),
    );
  });
  sessionStorage.setItem('calDefaultValueObj', JSON.stringify(calDefaultValueObj));

  // Wire calculation events using the existing logic
  wireExistingCalculationEvents(section);

  // Run initial calculation for all panels
  runInitialCalculation(section);
}

/* ── Calculator type detection ───────────────── */

function getCalcType(calcPanel) {
  if (calcPanel.classList.contains('gstcalculator') || calcPanel.classList.contains('gst')) return 'gst';
  if (calcPanel.classList.contains('aprcalculator') || calcPanel.classList.contains('apr')) return 'apr';
  if (calcPanel.classList.contains('eligibilitycalculator')) return 'eligibility';
  return 'emi';
}

/* ── Calculation runners using existing logic ── */

function runSingleCalculation(section, calcPanel) {
  if (!calcPanel) return;
  const calcType = getCalcType(calcPanel);

  if (calcType === 'emi' || calcType === 'eligibility') {
    // Use the existing proven pipeline from emiandeligiblitycalc
    workflowHomeLoanCalculation(calcPanel, calcType);
  } else if (calcType === 'gst') {
    runGstCalculation(section, calcPanel);
  } else if (calcType === 'apr') {
    runAprCalculation(calcPanel);
  }
}

function runGstCalculation(section, calcPanel) {
  const activeTab = section.querySelector('.headul .tab-common.active');
  const isBuyer = activeTab?.classList.contains('tab-emi-calc');
  const resultElement = calcPanel.querySelector('[data-cal-result=resultAmt]');
  if (!resultElement) return;

  let result = 0;
  if (isBuyer) {
    const netPrice = Number((calcPanel.querySelector('[data-cal-input=netprice]')?.value || '').replace(/,/g, '')) || 0;
    const gstRate = Number(calcPanel.querySelector('[data-cal-input=gstrate]')?.value) || 0;
    result = netPrice * (1 + gstRate * 0.01);
  } else {
    const productionCost = Number((calcPanel.querySelector('[data-cal-input=productioncost]')?.value || '').replace(/,/g, '')) || 0;
    const profitRatio = Number(calcPanel.querySelector('[data-cal-input=profitratio]')?.value) || 0;
    const gstRate = Number(calcPanel.querySelector('[data-cal-input=gstrate]')?.value) || 0;
    result = productionCost * (1 + profitRatio * 0.01) * (1 + gstRate * 0.01);
  }
  result = isNaN(result) ? 0 : Math.round(result);
  resultElement.textContent = `₹${currenyCommaSeperation(result)}/-`;
}

function runAprCalculation(calcPanel) {
  const resultElement = calcPanel.querySelector('[data-cal-result=resultAmt]');
  if (!resultElement) return;

  const loanAmt = Number((calcPanel.querySelector('[data-cal-input=loanamt]')?.value || '').replace(/,/g, '')) || 0;
  const originCharges = Number((calcPanel.querySelector('[data-cal-input=origincharges]')?.value || '').replace(/,/g, '')) || 0;
  const roi = Number(calcPanel.querySelector('[data-cal-input=roi]')?.value) || 0;
  const tenure = Number(calcPanel.querySelector('[data-cal-input=tenure]')?.value) || 0;

  const aprValue = CheckAprRate(loanAmt, originCharges, roi, tenure);
  resultElement.textContent = `${aprValue}%`;
}

/* ── Event wiring ────────────────────────────── */

function wireExistingCalculationEvents(section) {
  if (section.dataset.calcEventsWired) return;
  section.dataset.calcEventsWired = 'true';

  // Recalculate on change (text inputs + radio selection change)
  section.addEventListener('change', ({ target }) => {
    if (target.tagName !== 'INPUT') return;

    // Check if this is a radio input (FOIR selection change)
    // calculator-radio.js dispatches change event when radio is clicked
    if (target.type === 'radio' && target.dataset.calFoir) {
      const visible = getVisibleCalculator(section);
      if (visible) runSingleCalculation(section, visible);
      return;
    }

    // Regular calculator input
    const calcPanel = target.closest('.commoncalculator');
    if (calcPanel) runSingleCalculation(section, calcPanel);
  });

  // NOTE: Radio tab click handlers are in calculator-radio.js
  // DO NOT add duplicate click handlers here

  // EMI/Eligibility tab switching (headTabs)
  const headTabs = section.querySelectorAll('.headul .tab-common');
  headTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      requestAnimationFrame(() => {
        const visible = getVisibleCalculator(section);
        if (visible) runSingleCalculation(section, visible);
      });
    });
  });
}

function getVisibleCalculator(section) {
  const calctabs = section.querySelector('.calctabs');
  if (!calctabs) return null;
  const all = [...calctabs.children];
  return all.find((el) => el.style.display !== 'none' && !el.hidden) || all[0];
}

function runInitialCalculation(section) {
  const calctabs = section.querySelector('.calctabs');
  if (!calctabs) return;
  [...calctabs.querySelectorAll('.commoncalculator')].forEach((panel) => {
    runSingleCalculation(section, panel);
  });
}

export default async function decorate(block) {
  const section = block.closest('.section.calculator-container') || block.closest('.section');
  if (section) combineSection(section);

  const blockIndex = block.dataset.resetId?.replace('calid-', '') || '0';

  // Read product type from <p>[0], calculator name from <p>[1] of first row
  const firstRowChildren = block.children[0]?.children[0]?.children;
  const calcName = (firstRowChildren?.[1]?.textContent?.trim() || '').toLowerCase();
  const isEligibility = calcName.includes('eligibility');
  const sliderPrefix = `c${blockIndex}s`;

  const parentEmi = document.createElement('div');
  parentEmi.classList.add('parent-emi');
  if (isEligibility) parentEmi.classList.add('parent-eligibility');
  parentEmi.id = `emic-${blockIndex}`;

  const inputDiv = document.createElement('div');
  inputDiv.classList.add('inputDiv');
  const outputDiv = document.createElement('div');
  outputDiv.classList.add('outputdiv');

  const firstRow = firstRowChildren;
  const imgEl = firstRow[4]?.querySelector('img');
  const imgSrc = imgEl ? imgEl.src : (firstRow[4]?.textContent.trim() || '');

  // Build slider rows from remaining children (skip radio item rows)
  let sliderIndex = 0;
  Array.from(block.children).slice(1).forEach((r) => {
    // Skip rows marked as radio items
    if (r.dataset.radioItem === 'true') return;

    const columns = r.children[0]?.children;
    if (!columns || columns.length < 3) return; // Skip malformed rows

    const sliderId = `${sliderPrefix}${sliderIndex + 1}`;
    const inputId = `calcemi-${blockIndex}-${sliderIndex}`;

    // columns[0] = authored input name → map to correct data-cal-input
    const authoredName = columns[0]?.textContent.trim() || '';
    const calInput = mapInputName(authoredName);

    // columns[2] = default value
    const defaultValue = columns[2]?.textContent.trim() || '0';
    // Format default value for display (Indian number format for currency)
    const isRoi = calInput === 'roi';
    const formattedDefault = isRoi ? defaultValue : currenyCommaSeperation(Number(defaultValue) || 0);

    // columns[3] = authored icon (₹, $, %, Years, etc.)
    const iconText = columns[3]?.textContent.trim() || '';
    const isPrefix = CURRENCY_SYMBOLS.includes(iconText);
    const prefixText = isPrefix ? iconText : '';
    const suffixText = isPrefix ? '' : iconText;
    const isYearsText = !isPrefix;

    // Calculate initial slider fill percentage
    const minVal = Number(columns[5]?.textContent.trim()) || 0;
    const maxVal = Number(columns[6]?.textContent.trim()) || 100;
    const defVal = Number(defaultValue) || 0;
    const fillPercent = ((defVal - minVal) / (maxVal - minVal)) * 100;

    const dom = `
      <div class="loanamount">
        <div class="data">
          <label class="description">${columns[1]?.textContent.trim() || ''}</label>
          <div class="inputdivs ${isYearsText ? 'yearstext' : ''}">
            <span class="rupee">${prefixText}</span>
            <label for="${inputId}" aria-label="calculateemi" class="sr-only"></label>
            <input type="text" class="inputvalue slider-value" value="${formattedDefault}" id="${inputId}" data-slider="${sliderId}" data-cal-input="${calInput}">
            <span class="textvalue">${suffixText}</span>
          </div>
        </div>
        <div class="rangediv">
          <label for="${sliderId}" aria-label="calculateemi" class="sr-only"></label>
          <input type="range" min="${columns[5]?.textContent.trim() || ''}" step="${columns[4]?.textContent.trim() || ''}" max="${columns[6]?.textContent.trim() || ''}" value="${defaultValue}" id="${sliderId}" data-cal-input="${calInput}" class="range-slider__range" style="background: linear-gradient(90deg, rgb(218, 77, 52) ${fillPercent}%, rgb(219, 215, 216) ${fillPercent}%);">
          <div class="values">
            <span class="text">${columns[7]?.textContent.trim() || ''}</span>
            <span class="text">${columns[8]?.textContent.trim() || ''}</span>
          </div>
        </div>
      </div>
    `;
    inputDiv.innerHTML += dom;
    sliderIndex += 1;
  });

  const principalLabel = firstRow[6]?.textContent.trim() || '';
  const interestLabel = firstRow[7]?.textContent.trim() || '';
  const hasAmountBreakdown = principalLabel || interestLabel;

  outputDiv.innerHTML = `
    <div class="output-parent">
      <div class="mainoutput">
        <img data-src="${imgSrc}" class="outputimg lozad" alt="calendar" src="${imgSrc}" data-loaded="true">
        <img data-src="${imgSrc}" class="outputimg2 lozad" alt="calendar" src="${imgSrc}" data-loaded="true">
        <p class="outputdes">
          ${firstRow[5]?.textContent.trim() || ''}
        </p>
        <div class="outputans" data-cal-result="resultAmt">₹0/-</div>
      </div>
      ${hasAmountBreakdown ? `<div class="amountdiv">
        <div class="firstamout">
          <p>${principalLabel}</p>
          <p class="amount"><span>₹</span><span data-cal-result="principalAmt">0</span></p>
        </div>
        <div class="secondamount firstamout">
          <p>${interestLabel}</p>
          <p class="amount"><span>₹</span><span data-cal-result="interestAmt">0</span></p>
        </div>
      </div>` : ''}
    </div>
  `;

  // Hide original authored children instead of removing them
  // so the Universal Editor can still track and edit them
  [...block.children].forEach((child) => {
    child.style.display = 'none';
    child.classList.add('author-source');
  });

  parentEmi.appendChild(inputDiv);
  parentEmi.appendChild(outputDiv);
  block.appendChild(parentEmi);

  if (section) initSection(section);
}
