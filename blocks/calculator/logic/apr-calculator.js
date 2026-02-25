/**
 * apr-calculator.js
 * ──────────────────────────────────────────────
 * APR (Annual Percentage Rate) calculation — ported
 * from aprcalculator/aprcalculator.js.
 *
 * Uses Newton's / Secant method to iteratively solve
 * for the effective rate that satisfies the present‑value
 * equation adjusted for origination charges.
 */

/**
 * @param {object} inputs
 * @param {number|string} inputs.loanamt        — loan amount (₹)
 * @param {number|string} inputs.origincharges  — origination / processing charges (₹)
 * @param {number|string} inputs.roi            — annual rate of interest (%)
 * @param {number|string} inputs.tenure         — tenure in months
 * @returns {{ result: string }}  — APR as a percentage string, e.g. "12.45"
 */
export function calculateApr(inputs) {
  const LA = Number(inputs.loanamt) || 0;
  const LO = Number(inputs.origincharges) || 0;
  const IR = Number(inputs.roi) || 0;
  const LT = Number(inputs.tenure) || 0;

  if (LA <= 0 || LT <= 0) return { result: '0.00' };

  const present = LA - LO;
  const guess   = 0.01;
  const future  = 0;
  const type    = 0;
  const ROI     = IR / 100;
  const rateI   = ROI / 12;
  const pvif    = (1 + rateI) ** LT;
  const pmt     = (rateI / (pvif - 1)) * -(LA * pvif + future);

  // Set maximum epsilon for end of iteration
  const epsMax  = 1e-10;
  const iterMax = 10;

  let y; let y0; let y1; let x0; let x1 = 0; let f = 0; let i = 0;
  let rate = guess;

  if (Math.abs(rate) < epsMax) {
    y = present * (1 + LT * rate) + pmt * (1 + rate * type) * LT + future;
  } else {
    f = Math.exp(LT * Math.log(1 + rate));
    y = present * f + pmt * (1 / rate + type) * (f - 1) + future;
  }
  y0 = present + pmt * LT + future;
  y1 = present * f + pmt * (1 / rate + type) * (f - 1) + future;
  i = 0; x0 = 0; x1 = rate;

  while (Math.abs(y0 - y1) > epsMax && i < iterMax) {
    rate = (y1 * x0 - y0 * x1) / (y1 - y0);
    x0 = x1;
    x1 = rate;
    if (Math.abs(rate) < epsMax) {
      y = present * (1 + LT * rate) + pmt * (1 + rate * type) * LT + future;
    } else {
      f = Math.exp(LT * Math.log(1 + rate));
      y = present * f + pmt * (1 / rate + type) * (f - 1) + future;
    }
    y0 = y1;
    y1 = y;
    ++i;
  }

  let apr = rate * 100 * 12;
  apr = isNaN(apr) ? 0 : apr;

  return { result: apr.toFixed(2) };
}
