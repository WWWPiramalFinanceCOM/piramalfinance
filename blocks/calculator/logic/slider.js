/**
 * slider.js
 * ──────────────────────────────────────────────
 * Handles the bi‑directional sync between every
 * range‑slider and its paired text‑input, including
 * gradient fill, Indian‑number formatting, and
 * input‑filtering.  Ported from the existing
 * emiandeligiblitycalc/homeloancalculators.js slider
 * logic so the behaviour is identical.
 */
import { currenyCommaSeperation } from '../../../scripts/common.js';

/* ── helpers ─────────────────────────────────── */

function formatIndianNumber(value) {
  const val = String(value).replace(/,/g, '');
  return isNaN(Number(val)) ? '0' : currenyCommaSeperation(val);
}

function updateSliderGradient(rangeEl) {
  const pct =
    ((rangeEl.value - rangeEl.min) / (rangeEl.max - rangeEl.min)) * 100;
  rangeEl.style.background =
    `linear-gradient(90deg, #da4d34 ${pct}%, #dbd7d8 ${pct}%)`;
}

/* ── public API ──────────────────────────────── */

/**
 * Initialise every slider‑value / range pair found
 * inside `container`.
 * @param {HTMLElement} container — the scoping element
 *        (usually a .parent-emi or .commoncalculator)
 */
export function initSliders(container) {
  const sliderValues = container.querySelectorAll('.slider-value');

  sliderValues.forEach((sliderValue) => {
    const sliderId = sliderValue.dataset.slider;
    const myRangeSlider = container.querySelector(`#${sliderId}`);
    if (!myRangeSlider) return;

    /* set initial formatted value from range default */
    const inputType = sliderValue.dataset.calInput;
    if (inputType === 'roi') {
      sliderValue.value = parseFloat(myRangeSlider.value);
    } else {
      sliderValue.value = formatIndianNumber(myRangeSlider.value);
    }
    updateSliderGradient(myRangeSlider);

    /* ── range → text ──────────────────────────── */
    myRangeSlider.addEventListener('input', () => {
      updateSliderGradient(myRangeSlider);
      if (inputType === 'roi') {
        sliderValue.value = parseFloat(myRangeSlider.value);
      } else {
        sliderValue.value = formatIndianNumber(myRangeSlider.value);
      }
    });

    /* ── text focus‑out → clamp + sync range ───── */
    sliderValue.addEventListener('focusout', function onBlur() {
      let parsed =
        parseFloat(this.value.replace(/,/g, '')) || 0;
      const min = parseFloat(myRangeSlider.min);
      const max = parseFloat(myRangeSlider.max);
      if (parsed < min) parsed = min;
      if (parsed > max) parsed = max;
      myRangeSlider.value = parsed;

      if (this.dataset.calInput === 'roi') {
        this.value = parseFloat(parsed);
      } else {
        this.value = formatIndianNumber(parsed);
      }
      updateSliderGradient(myRangeSlider);

      /* bubble a change so the calculator workflow picks it up */
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });

    /* ── text input filter (strip non‑numeric) ─── */
    sliderValue.addEventListener('input', function onInput() {
      let cleanedValue = this.value.replace(/[^\d.]/g, '');
      const type = this.dataset.calInput;

      if (type === 'roi') {
        /* allow decimal */
        this.value = cleanedValue;
      } else if (type === 'tenure') {
        this.value = cleanedValue.replace(/\./g, '').replace(/,/g, '');
      } else {
        this.value = formatIndianNumber(cleanedValue);
      }
    });

    /* ── text change → clamp + sync range ──────── */
    sliderValue.addEventListener('change', function onChange() {
      let cleanedValue = parseFloat(this.value.replace(/[^\d.]/g, '')) || 0;
      const min = parseFloat(myRangeSlider.min);
      const max = parseFloat(myRangeSlider.max);
      if (cleanedValue < min) cleanedValue = min;
      if (cleanedValue > max) cleanedValue = max;

      const type = this.dataset.calInput;
      if (type === 'roi') {
        this.value = String(cleanedValue);
      } else if (type === 'tenure') {
        this.value = String(cleanedValue).replace(/\./g, '').replace(/,/g, '');
      } else {
        this.value = formatIndianNumber(cleanedValue);
      }
      myRangeSlider.value = cleanedValue;
      updateSliderGradient(myRangeSlider);
    });

    /* fire once so gradient is correct on load */
    myRangeSlider.dispatchEvent(new Event('input'));
  });
}
