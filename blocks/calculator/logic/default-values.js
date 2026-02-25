/**
 * default-values.js
 * ──────────────────────────────────────────────
 * Stores the initial range‑slider values into
 * sessionStorage so they can be restored later
 * (reset calculator). Ported from
 * emiandeligiblitycalc/calculatordefaultvalue.js
 * and resetCalculator.js.
 */

const STORAGE_KEY = 'calDefaultValueObj';

/**
 * Snapshot every range‑slider's default value inside the
 * given section and persist to sessionStorage.
 *
 * @param {HTMLElement} section — .homeloancalculator
 */
export function storeDefaultValues(section) {
  const existing = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');

  const calculators = section.querySelectorAll('.calctabs .commoncalculator');
  calculators.forEach((cal) => {
    const resetId = cal.dataset.resetId;
    if (!resetId) return;
    existing[resetId] = Object.fromEntries(
      [...cal.querySelectorAll('input[type=range]')].map((inp) => [inp.id, inp.value]),
    );
  });

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/**
 * Reset every range‑slider inside a calculator block
 * back to its stored default value and re‑fire the
 * input event so the text‑inputs + gradient update.
 *
 * @param {HTMLElement} calculator — a .commoncalculator element
 */
export function resetCalculator(calculator) {
  const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  const calId  = calculator.dataset.resetId;
  if (!calId || !stored[calId]) return;

  const calObj = stored[calId];
  Object.keys(calObj).forEach((id) => {
    const rangeInput = calculator.querySelector(`#${id}`);
    if (!rangeInput) return;
    rangeInput.value = calObj[id];
    rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
