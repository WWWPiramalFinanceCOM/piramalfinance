/**
 * calculator-workflow.js
 * ──────────────────────────────────────────────
 * Central workflow — reads DOM inputs, picks the
 * correct calculation, and renders the result.
 *
 * This replaces the separate calhelpers / getcalculatordata /
 * renderemielical / renderhpcal files with a single pipeline
 * that supports all calculator types.
 */
import { currenyCommaSeperation } from '../../../scripts/common.js';
import { calculateEmi } from './emi-calculator.js';
import { calculateEligibility } from './eligibility-calculator.js';
import { calculateGstBuyer, calculateGstSeller } from './gst-calculator.js';
import { calculateApr } from './apr-calculator.js';

/* ── Read DOM → data object ──────────────────── */

/**
 * Read every `[data-cal-input]` inside a calculator panel
 * and return a plain object keyed by the cal‑input name.
 */
function readInputs(calcPanel) {
  const obj = {};
  calcPanel.querySelectorAll('[data-cal-input]').forEach((el) => {
    const key = el.dataset.calInput;
    obj[key] = (el.value || '').replace(/,/g, '');
  });
  return obj;
}

/**
 * Get the FOIR data from the checked radio in the section.
 */
function getFoirData(section) {
  const checked = section.querySelector('[data-cal-foir]:checked');
  return {
    foir: checked?.value || '65',
    loanType: checked?.dataset.calFoir || 'salaried',
  };
}

/**
 * Get the product‑type hidden input value.
 */
function getProductType(section) {
  const input = section.querySelector('#calculator-product-type');
  return input?.value || 'hl';
}

/* ── Detect calculator type from block classes ── */

function detectCalcType(block) {
  if (block.classList.contains('gst')) return 'gst';
  if (block.classList.contains('apr')) return 'apr';
  if (block.classList.contains('eligibilitycalculator')) return 'eligibility';
  return 'emi';
}

/* ── Determine if we are on buyer or seller tab (for GST) ── */

function isGstBuyerTab(section) {
  const activeTab = section.querySelector('.headul .tab-common.active');
  return activeTab?.classList.contains('tab-emi-calc');
}

/* ── Run the right calculation ───────────────── */

function compute(calcType, rawInputs, section) {
  switch (calcType) {
    case 'emi':
      return calculateEmi(rawInputs);

    case 'eligibility': {
      const { foir, loanType } = getFoirData(section);
      const productType = getProductType(section);

      // For biz + non-combined, convert annual income → monthly
      let income = Number(rawInputs.income) || 0;
      const isCombined = !!section.querySelector('.combined-emi-eligibility');
      if (!isCombined) {
        const isBusinessTabActive = section.querySelector('.tab-eligibility-calc.active');
        if (loanType === 'biz' && !isBusinessTabActive) income /= 12;
      } else if (loanType === 'biz') {
        income /= 12;
      }

      return calculateEligibility({
        ...rawInputs,
        income,
        foir,
        productType,
        loanType,
      });
    }

    case 'gst': {
      if (isGstBuyerTab(section)) {
        return calculateGstBuyer(rawInputs);
      }
      return calculateGstSeller(rawInputs);
    }

    case 'apr':
      return calculateApr(rawInputs);

    default:
      return { result: 0 };
  }
}

/* ── Render results back to the DOM ──────────── */

function renderResult(calcPanel, resultObj, calcType) {
  const resultEl    = calcPanel.querySelector('[data-cal-result=resultAmt]');
  const principalEl = calcPanel.querySelector('[data-cal-result=principalAmt]');
  const interestEl  = calcPanel.querySelector('[data-cal-result=interestAmt]');

  if (calcType === 'apr') {
    if (resultEl) resultEl.textContent = `${resultObj.result}%`;
    return;
  }

  const formatted = currenyCommaSeperation(resultObj.result ?? 0);

  if (resultEl) {
    resultEl.textContent = `₹${formatted}/-`;
  }
  if (principalEl && resultObj.principalAmt !== undefined) {
    principalEl.textContent = currenyCommaSeperation(resultObj.principalAmt);
  }
  if (interestEl && resultObj.interestAmt !== undefined) {
    interestEl.textContent = currenyCommaSeperation(resultObj.interestAmt);
  }
}

/* ── Public API: run one calculation cycle ───── */

/**
 * Execute the full calculate→render pipeline for a
 * single calculator panel.
 *
 * @param {HTMLElement} calcPanel — the .commoncalculator block
 * @param {string}      [forceType] — override auto‑detect
 */
export function runCalculation(calcPanel, forceType) {
  if (!calcPanel) return;
  const section  = calcPanel.closest('.homeloancalculator') || calcPanel.closest('.section');
  const calcType = forceType || detectCalcType(calcPanel);
  const rawInputs = readInputs(calcPanel);

  const resultObj = compute(calcType, rawInputs, section);
  if (resultObj) renderResult(calcPanel, resultObj, calcType);
}

/**
 * Wire the change / input events on a section so that
 * any slider or text‑input change automatically
 * re‑triggers the calculation.
 *
 * @param {HTMLElement} section — the .homeloancalculator section
 */
export function wireCalculationEvents(section) {
  if (!section || section.dataset.calcEventsWired) return;
  section.dataset.calcEventsWired = 'true';

  section.addEventListener('change', ({ target }) => {
    if (target.tagName !== 'INPUT') return;
    const calcPanel = target.closest('.commoncalculator');
    if (calcPanel) runCalculation(calcPanel);
  });

  // When salaried / business radio changes, recalculate visible panel
  const radioTabs = section.querySelectorAll('.radiotab > li');
  radioTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const visible = getVisibleCalculator(section);
      if (visible) runCalculation(visible);
    });
  });

  // When EMI / Eligibility tab changes, recalculate
  const headTabs = section.querySelectorAll('.headul .tab-common');
  headTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // small delay to let the tab‑switch CSS settle
      requestAnimationFrame(() => {
        const visible = getVisibleCalculator(section);
        if (visible) runCalculation(visible);
      });
    });
  });
}

/**
 * Return the currently visible commoncalculator inside a section.
 */
function getVisibleCalculator(section) {
  const calctabs = section.querySelector('.calctabs');
  if (!calctabs) return null;
  const all = [...calctabs.children];
  return all.find((el) => el.style.display !== 'none' && !el.hidden) || all[0];
}

/**
 * Initial calculation for every visible calculator in a section.
 */
export function initialCalculation(section) {
  const calctabs = section.querySelector('.calctabs');
  if (!calctabs) return;
  [...calctabs.children].forEach((panel) => {
    runCalculation(panel);
  });
}
