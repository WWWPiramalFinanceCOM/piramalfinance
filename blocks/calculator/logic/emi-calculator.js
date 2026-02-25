/**
 * emi-calculator.js
 * ──────────────────────────────────────────────
 * EMI calculation logic.
 *
 * Formula:
 *   EMI = (L × R × (1+R)^n) / ((1+R)^n − 1)
 *   Interest = EMI × n − L
 *
 *  Where L = loan amount, R = monthly ROI, n = monthly tenure.
 */

/**
 * @param {object} inputs
 * @param {number|string} inputs.loanAmt   — loan amount (₹)
 * @param {number|string} inputs.roi       — annual rate of interest (%)
 * @param {number|string} inputs.tenure    — tenure in years
 * @returns {{ result: number, interestAmt: number, principalAmt: number }}
 */
export function calculateEmi(inputs) {
  const L = Number(inputs.loanAmt) || 0;
  const n = (Number(inputs.tenure) || 0) * 12;          // monthly
  const R = ((Number(inputs.roi) || 0) * 0.01) / 12;    // monthly rate

  if (L <= 0 || n <= 0 || R <= 0) {
    return { result: 0, interestAmt: 0, principalAmt: L };
  }

  const pow = (1 + R) ** n;
  let emi = (L * R * pow) / (pow - 1);
  emi = Math.round(emi);

  const interestAmt = emi * n - L;

  return { result: emi, interestAmt, principalAmt: L };
}
