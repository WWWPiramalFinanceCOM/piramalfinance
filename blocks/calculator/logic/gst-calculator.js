/**
 * gst-calculator.js
 * ──────────────────────────────────────────────
 * GST calculation logic — ported from
 * gstcalculator/gstcalculator.js.
 *
 * Buyer : totalPrice = netPrice × (1 + gstRate/100)
 * Seller: totalPrice = productionCost × (1 + profitRatio/100) × (1 + gstRate/100)
 */

/**
 * Buyer GST calculation.
 * @param {object} inputs
 * @param {number|string} inputs.netprice  — net price (₹)
 * @param {number|string} inputs.gstrate   — GST rate (%)
 * @returns {{ result: number }}
 */
export function calculateGstBuyer(inputs) {
  const netPrice = Number(inputs.netprice) || 0;
  const gstRate  = Number(inputs.gstrate) || 0;
  let value = netPrice * (1 + gstRate * 0.01);
  value = isNaN(value) ? 0 : Math.round(value);
  return { result: value };
}

/**
 * Seller GST calculation.
 * @param {object} inputs
 * @param {number|string} inputs.productioncost — production cost (₹)
 * @param {number|string} inputs.profitratio    — profit ratio (%)
 * @param {number|string} inputs.gstrate        — GST rate (%)
 * @returns {{ result: number }}
 */
export function calculateGstSeller(inputs) {
  const cost   = Number(inputs.productioncost) || 0;
  const profit = Number(inputs.profitratio) || 0;
  const gst    = Number(inputs.gstrate) || 0;
  let value = cost * (1 + profit * 0.01) * (1 + gst * 0.01);
  value = isNaN(value) ? 0 : Math.round(value);
  return { result: value };
}
