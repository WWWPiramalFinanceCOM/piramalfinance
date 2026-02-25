/**
 * eligibility-calculator.js
 * ──────────────────────────────────────────────
 * Eligibility calculation logic — ported from
 * emiandeligiblitycalc/bizemielical.js.
 *
 * Supports:
 *   • Home‑loan eligibility  (hl)
 *   • Business‑loan eligibility (bl / pl)
 */

/**
 * Home‑loan / default eligibility.
 *
 * eligibilityEmi (hl) = income × FOIR − otherLoan
 * eligibilityEmi (bl) = (income − otherLoan) × FOIR
 *
 * result = E × ((1 − 1/(1+R)^n ) / R)
 */
function homeLoanEligibility(inputs, R, n) {
  const income     = Number(inputs.income) || 0;
  const otherLoan  = Number(inputs.otherLoan) || 0;
  const foir       = (Number(inputs.foir) || 65) * 0.01;
  const productType = inputs.productType || 'hl';

  let eligibilityEmi;
  if (productType === 'hl') {
    eligibilityEmi = income * foir - otherLoan;
  } else {
    eligibilityEmi = (income - otherLoan) * foir;
  }

  if (eligibilityEmi <= 0) return { result: 0 };

  const result = Math.round(eligibilityEmi * (1 - 1 / (1 + R) ** n) / R);
  return { result };
}

/**
 * Personal‑loan / Business‑loan eligibility (pl).
 *
 * applicableAmount = (income − existingEMI) × 0.5
 * eligibleLoanAmount = applicableAmount × ((1 − 1/(1+R)^n) / R)
 */
function businessLoanEligibility(inputs, R, n) {
  const income    = Number(inputs.income) || 0;
  const otherLoan = Number(inputs.otherLoan) || 0;

  const applicable = (income - otherLoan) * 0.5;
  const pow = (1 + R) ** n;
  let result = (applicable * (1 - 1 / pow)) / R;
  result = Math.round(result);
  return { result: result <= 0 ? 0 : result };
}

/**
 * @param {object} inputs
 * @param {number|string} inputs.income      — monthly income (₹)
 * @param {number|string} inputs.otherLoan   — existing EMI (₹)
 * @param {number|string} inputs.roi         — annual ROI (%)
 * @param {number|string} inputs.tenure      — tenure in years
 * @param {number|string} inputs.foir        — FOIR value (e.g. 65)
 * @param {string}        inputs.productType — 'hl' | 'bl' | 'pl'
 * @param {string}        inputs.loanType    — 'salaried' | 'biz'
 * @returns {{ result: number }}
 */
export function calculateEligibility(inputs) {
  const n = (Number(inputs.tenure) || 0) * 12;
  const R = ((Number(inputs.roi) || 0) * 0.01) / 12;

  if (n <= 0 || R <= 0) return { result: 0 };

  const productType = inputs.productType || 'hl';
  if (productType === 'pl') {
    return businessLoanEligibility(inputs, R, n);
  }
  return homeLoanEligibility(inputs, R, n);
}
