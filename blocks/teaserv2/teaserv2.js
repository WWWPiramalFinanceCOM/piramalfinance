import { ctaClick, ctaClickInteraction } from '../../dl.js';
import {
  autoLinkLangPath,
  loadCSS,
} from '../../scripts/aem.js';
import { targetObject } from '../../scripts/scripts.js';
import { loanProductsAnalytics } from './teaserv2-analytics.js';

// ================== PERFORMANCE OPTIMIZATIONS ==================
// 1. CSS loading cache - prevents re-loading CSS on every modal open
let cssLoaded = false;
const loadCalculatorCSS = async () => {
  if (cssLoaded) return;
  // Load production modal styles (homeloancalculatorv2) + calculator styles + minimal additions
  await Promise.all([
    loadCSS(`${window.hlx.codeBasePath}/blocks/calculator/calculator.css`),
    loadCSS(`${window.hlx.codeBasePath}/blocks/calculator-radio/calculator-radio.css`),
    loadCSS(`${window.hlx.codeBasePath}/blocks/calculator/home-calculator.css`),
    loadCSS(`${window.hlx.codeBasePath}/blocks/teaserv2/calculator-modal.css`),
  ]);
  cssLoaded = true;
};

// 2. Debounce utility - prevents excessive calculation during slider drag
const debounce = (fn, delay = 16) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// 3. Format number Indian style (hoisted for reuse)
const formatNum = (val) => {
  const cleaned = String(val).replace(/,/g, '');
  if (Number.isNaN(Number(cleaned))) return '0';
  return Number(cleaned).toLocaleString('en-IN');
};

// 4. Store cleanup functions to prevent memory leaks
let cleanupFns = [];
const addCleanup = (fn) => cleanupFns.push(fn);
const runCleanup = () => {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
};

/**
 * Opens the calculator block (authored on the page) as a modal
 * PERFORMANCE OPTIMIZED: CSS cached, debounced calculations, passive listeners
 * @param {string} title - Title to show in modal header
 */
async function openNewCalculatorModal(title) {
  try {
    // Clean up any previous modal listeners
    runCleanup();

    // Find the calculator section on the page (cached query)
    const calculatorSection = document.querySelector('.section[data-modal-calculator="true"]')
      || document.querySelector('.section.calculator-ssr')
      || document.querySelector('.calculator-wrapper.modal-calculator')?.closest('.section');

    if (!calculatorSection) {
      // eslint-disable-next-line no-console
      console.error('[teaserv2] openNewCalculatorModal: No calculator section found');
      return;
    }

    // eslint-disable-next-line no-console
    console.log('[teaserv2] openNewCalculatorModal: Found calculator section', calculatorSection.className);
    console.log('[teaserv2] Section has calctabs:', !!calculatorSection.querySelector('.calctabs'));
    console.log('[teaserv2] Section has commoncalculator:', !!calculatorSection.querySelector('.commoncalculator'));
    console.log('[teaserv2] Section has calculator-parent:', !!calculatorSection.querySelector('.calculator-parent'));

    // Load CSS only once (cached)
    await loadCalculatorCSS();

    // Create overlay backdrop - use existing .overlay class from styles.css
    let modalOverlay = document.querySelector('.overlay:not(.overlayDiv)');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.className = 'overlay';
      document.body.appendChild(modalOverlay);
    }
    modalOverlay.classList.remove('dp-none');

    // Create the overlayDiv structure (same as homepage)
    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'overlayDiv';

    // Create close button
    const closeBtn = document.createElement('div');
    closeBtn.className = 'close';
    closeBtn.innerHTML = `
      <button class="close-icon-btn" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#333" stroke-width="2" 
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;

    // Create cmp-container wrapper (homepage structure)
    const cmpContainer = document.createElement('div');
    cmpContainer.className = 'cmp-container';

    // Add title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'home-loan-title';
    titleDiv.innerHTML = `
      <div class="cmp-title">
        <h2 class="cmp-title__text">${title || 'EMI Calculator'}</h2>
      </div>
    `;
    cmpContainer.appendChild(titleDiv);

    // Clone the calculator content
    const calcClone = calculatorSection.cloneNode(true);

    // eslint-disable-next-line no-console
    console.log('[teaserv2] Clone created, checking structure:');
    console.log('[teaserv2] Clone has calctabs:', !!calcClone.querySelector('.calctabs'));
    console.log('[teaserv2] Clone has commoncalculator:', !!calcClone.querySelector('.commoncalculator'));
    console.log('[teaserv2] Clone has calculator-parent:', !!calcClone.querySelector('.calculator-parent'));
    console.log('[teaserv2] Clone calctabs children:', calcClone.querySelector('.calctabs')?.children?.length);
    
    // Debug: List all inputs with data-cal-input
    const allInputs = calcClone.querySelectorAll('[data-cal-input]');
    console.log('[teaserv2] Clone has', allInputs.length, 'inputs with data-cal-input');
    allInputs.forEach((inp, i) => {
      console.log(`[teaserv2] Input ${i}: type=${inp.dataset.calInput}, value=${inp.value}`);
    });

    // Clear ALL inline display:none styles to ensure everything is visible
    calcClone.style.cssText = '';
    calcClone.style.display = 'block';
    calcClone.style.visibility = 'visible';
    calcClone.removeAttribute('data-modal-calculator');
    calcClone.classList.add('homeloancalculator');

    // Clear inline display:none from all elements
    calcClone.querySelectorAll('[style*="display"]').forEach((el) => {
      if (el.style.display === 'none') {
        el.style.display = '';
      }
    });

    // Explicitly show calculator structural elements
    const showSelectors = [
      '.calculator-radio-wrapper',
      '.calculator-radio-wrapper > *',
      '.calculator-parent',
      '.calculator-parent-child',
      '.cp-child',
      '.calctabs',
      '.calctabs > *',
      '.commoncalculator',
      '.parent-emi',
      '.inputDiv',
      '.outputDiv',
      '.calculator-wrapper',
      '.calculator',
      '.tab-name-wrapper',
      '.default-content-wrapper',
    ];
    showSelectors.forEach((sel) => {
      calcClone.querySelectorAll(sel).forEach((el) => {
        el.style.display = '';
        el.style.visibility = 'visible';
      });
    });

    // Make first calculator block visible
    const firstCalc = calcClone.querySelector('.calctabs > .commoncalculator');
    if (firstCalc) {
      firstCalc.style.display = 'block';
    }

    // Fix duplicate IDs
    calcClone.querySelectorAll('[id]').forEach((el) => {
      el.id = `${el.id}-overlay`;
    });
    calcClone.querySelectorAll('[for]').forEach((el) => {
      const forVal = el.getAttribute('for');
      if (forVal) el.setAttribute('for', `${forVal}-overlay`);
    });
    calcClone.querySelectorAll('[data-slider]').forEach((el) => {
      el.dataset.slider = `${el.dataset.slider}-overlay`;
    });

    cmpContainer.appendChild(calcClone);
    overlayDiv.appendChild(closeBtn);
    overlayDiv.appendChild(cmpContainer);
    document.body.appendChild(overlayDiv);

    // Show the overlay
    overlayDiv.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Close handlers with cleanup
    const closeOverlay = () => {
      runCleanup(); // Clean up event listeners
      overlayDiv.classList.remove('show');
      modalOverlay.classList.add('dp-none');
      document.body.style.overflow = '';
      setTimeout(() => {
        overlayDiv.remove();
        modalOverlay.remove();
      }, 300);
    };

    // Use passive: true for better scroll performance where applicable
    closeBtn.addEventListener('click', closeOverlay);
    modalOverlay.addEventListener('click', closeOverlay);
    addCleanup(() => {
      closeBtn.removeEventListener('click', closeOverlay);
      modalOverlay.removeEventListener('click', closeOverlay);
    });

    // Initialize modal using requestAnimationFrame instead of setTimeout
    requestAnimationFrame(() => {
      try {
        // ========== CACHED DOM REFERENCES ==========
        // Use descendant selector (not direct child) to handle any wrapper structure
        const calcBlocks = calcClone.querySelectorAll('.calctabs .commoncalculator');
        const radioTabs = [...calcClone.querySelectorAll('.radiotab > li')];
        const sliderValues = calcClone.querySelectorAll('.slider-value');
        // Filter out hidden gst-third-tab (same as build-tabs.js)
        const calcTabs = calcClone.querySelectorAll('.headul .tab-common:not(.gst-third-tab)');
        const radiotabContainer = calcClone.querySelector('.radiotab');
        const radioBlock = calcClone.querySelector('.calculator-radio')
          || calcClone.querySelector('.home-loan-calculator-parent');
        const calculatorParent = calcClone.querySelector('.calculator-parent');

        // Constants (hoisted)
        const SALARIED_BG = 'rgb(255, 247, 244)';
        const BUSINESS_BG = 'rgb(238, 243, 255)';
        const WHITE = 'rgb(255, 255, 255)';

        // ========== DEBOUNCED CALCULATION FUNCTION ==========
        const triggerModalCalculation = debounce(() => {
          // eslint-disable-next-line no-console
          console.log('[teaserv2] triggerModalCalculation called');
          console.log('[teaserv2] calcBlocks length:', calcBlocks.length);
          
          // Find a visible calculator block, or fall back to any commoncalculator, or the clone itself
          let visibleCalc = calcClone.querySelector(
            '.commoncalculator:not([style*="display: none"])',
          );
          
          if (!visibleCalc && calcBlocks.length > 0) {
            visibleCalc = calcBlocks[0];
          }
          
          if (!visibleCalc) {
            visibleCalc = calcClone.querySelector('.commoncalculator');
          }
          
          // eslint-disable-next-line no-console
          console.log('[teaserv2] visibleCalc found:', !!visibleCalc);

          // FALLBACK: If no commoncalculator found, search in the entire clone
          // This handles cases where the block structure is different
          const searchRoot = visibleCalc || calcClone;

          // Use correct data-cal-input selectors
          let loanAmtInput = searchRoot.querySelector('[data-cal-input="loanamt"]');
          let tenureInput = searchRoot.querySelector('[data-cal-input="tenure"]');
          let roiInput = searchRoot.querySelector('[data-cal-input="roi"]');

          // POSITION-BASED FALLBACK: If loanamt not found, use position in .inputDiv
          // This handles authoring errors where loanamt is marked as tenure
          if (!loanAmtInput && searchRoot.querySelector('.inputDiv')) {
            const loanAmountDivs = searchRoot.querySelectorAll('.inputDiv .loanamount');
            // eslint-disable-next-line no-console
            console.log('[teaserv2] loanamt not found, using position fallback. Found', loanAmountDivs.length, 'loanamount divs');
            
            if (loanAmountDivs.length >= 3) {
              // Position 0 = loan amount, Position 1 = tenure, Position 2 = roi
              const posLoanAmtInput = loanAmountDivs[0]?.querySelector('input.slider-value');
              const posTenureInput = loanAmountDivs[1]?.querySelector('input.slider-value');
              const posRoiInput = loanAmountDivs[2]?.querySelector('input.slider-value');
              
              // eslint-disable-next-line no-console
              console.log('[teaserv2] Position-based inputs:',
                'loanAmt:', posLoanAmtInput?.value,
                'tenure:', posTenureInput?.value,
                'roi:', posRoiInput?.value
              );
              
              // Use position-based if they exist
              if (posLoanAmtInput) loanAmtInput = posLoanAmtInput;
              if (posTenureInput) tenureInput = posTenureInput;
              if (posRoiInput) roiInput = posRoiInput;
            }
          }

          // eslint-disable-next-line no-console
          console.log('[teaserv2] triggerModalCalculation: inputs found:', 
            'loanAmtEl:', !!loanAmtInput,
            'loanAmt:', loanAmtInput?.value, 
            'tenureEl:', !!tenureInput,
            'tenure:', tenureInput?.value, 
            'roiEl:', !!roiInput,
            'roi:', roiInput?.value
          );

          if (!loanAmtInput && !tenureInput && !roiInput) {
            // eslint-disable-next-line no-console
            console.error('[teaserv2] No calculator inputs found! Checking all inputs in clone...');
            const allInputs = calcClone.querySelectorAll('input');
            console.log('[teaserv2] Total inputs in clone:', allInputs.length);
            allInputs.forEach((inp, i) => {
              console.log(`[teaserv2] Input ${i}:`, inp.type, inp.className, inp.dataset?.calInput, '=', inp.value);
            });
            return;
          }

          const loanAmt = parseFloat((loanAmtInput?.value || '0').replace(/,/g, '')) || 0;
          const tenure = parseFloat((tenureInput?.value || '0').replace(/,/g, '')) || 0;
          const roi = parseFloat(roiInput?.value || '0') || 0;

          // eslint-disable-next-line no-console
          console.log('[teaserv2] triggerModalCalculation: parsed values:', 
            'loanAmt:', loanAmt, 
            'tenure:', tenure, 
            'roi:', roi
          );

          // EMI calculation: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
          const monthlyRate = roi / 12 / 100;
          const months = tenure * 12;
          let emi = 0;
          let totalInterest = 0;

          if (monthlyRate > 0 && months > 0 && loanAmt > 0) {
            const factor = (1 + monthlyRate) ** months;
            emi = Math.round((loanAmt * monthlyRate * factor) / (factor - 1));
            totalInterest = Math.round((emi * months) - loanAmt);
          } else {
            // eslint-disable-next-line no-console
            console.warn('[teaserv2] Calculation skipped: monthlyRate=', monthlyRate, 'months=', months, 'loanAmt=', loanAmt);
          }

          // eslint-disable-next-line no-console
          console.log('[teaserv2] triggerModalCalculation: result EMI:', emi, 'totalInterest:', totalInterest);

          // Use correct data-cal-result selectors - search in searchRoot first, then clone
          let emiOutput = searchRoot.querySelector('[data-cal-result="resultAmt"]');
          let principalOutput = searchRoot.querySelector('[data-cal-result="principalAmt"]');
          let interestOutput = searchRoot.querySelector('[data-cal-result="interestAmt"]');
          
          // Fallback to searching the entire clone
          if (!emiOutput) emiOutput = calcClone.querySelector('[data-cal-result="resultAmt"]');
          if (!principalOutput) principalOutput = calcClone.querySelector('[data-cal-result="principalAmt"]');
          if (!interestOutput) interestOutput = calcClone.querySelector('[data-cal-result="interestAmt"]');
          
          // eslint-disable-next-line no-console
          console.log('[teaserv2] Output elements found:', {
            emiOutput: !!emiOutput,
            principalOutput: !!principalOutput,
            interestOutput: !!interestOutput
          });
          
          const formatResult = (val) => Math.round(val).toLocaleString('en-IN');

          if (emiOutput) emiOutput.textContent = `₹${formatResult(emi)}/-`;
          if (principalOutput) principalOutput.textContent = formatResult(loanAmt);
          if (interestOutput) interestOutput.textContent = formatResult(totalInterest);
        }, 16); // 16ms = ~60fps

        // ========== INITIALIZE RADIO TABS ==========
        if (radioTabs.length > 0) {
          const radiotabUl = calcClone.querySelector('.radiotab');
          const calcParent = calculatorParent;

          const updateRadioBackgrounds = (selectedIdx) => {
            const selectedTab = radioTabs[selectedIdx];
            const selectedRadio = selectedTab?.querySelector('input[data-cal-foir]');
            const foirType = selectedRadio?.dataset.calFoir || 'salaried';
            const selectedBg = foirType === 'salaried' ? SALARIED_BG : BUSINESS_BG;

            // Check if only one tab is visible (business loan mode)
            const visibleTabs = radioTabs.filter((t) => t.style.display !== 'none');
            const isSingleTabMode = visibleTabs.length === 1;

            // Set individual tab backgrounds
            radioTabs.forEach((tab, idx) => {
              if (tab.style.display === 'none') {
                tab.style.background = WHITE;
                return;
              }
              const tabRadio = tab.querySelector('input[data-cal-foir]');
              const tabFoirType = tabRadio?.dataset.calFoir || 'salaried';
              if (idx === selectedIdx || isSingleTabMode) {
                tab.style.background = tabFoirType === 'salaried' ? SALARIED_BG : BUSINESS_BG;
              } else {
                tab.style.background = WHITE;
              }
            });

            // Clear radiotab ul background - gradient goes on parent block only
            if (radiotabUl) {
              radiotabUl.style.background = '';
            }

            // Set gradient on radioBlock parent
            if (radioBlock) {
              if (isSingleTabMode) {
                radioBlock.style.background = `-webkit-linear-gradient(right, ${selectedBg} 50%, ${WHITE} 50%)`;
              } else if (selectedIdx === 0) {
                radioBlock.style.background = `-webkit-linear-gradient(right, ${WHITE} 50%, ${selectedBg} 50%)`;
              } else {
                radioBlock.style.background = `-webkit-linear-gradient(right, ${selectedBg} 50%, ${WHITE} 50%)`;
              }
            }

            // Update calculator parent background
            if (calcParent) {
              calcParent.style.background = selectedBg;
            }
          };

          const activateRadioTab = (idx) => {
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
            updateRadioBackgrounds(idx);
          };

          // Set initial state
          activateRadioTab(0);

          // Click handlers for radio tabs
          radioTabs.forEach((tab, idx) => {
            tab.style.cursor = 'pointer';
            tab.addEventListener('click', () => {
              activateRadioTab(idx);
              // Trigger recalculation
              triggerModalCalculation();
            });
          });
        }

        // ========== INITIALIZE SLIDERS (using cached sliderValues) ==========
        // IMPORTANT: When cloning, range slider values are reset to HTML defaults.
        // We need to READ the text input values FIRST (which are correctly cloned),
        // then sync the range sliders TO the text inputs (not vice versa).
        sliderValues.forEach((sliderValue) => {
          const sliderId = sliderValue.dataset.slider;
          const myRangeSlider = calcClone.querySelector(`#${sliderId}`);
          if (!myRangeSlider) {
            // eslint-disable-next-line no-console
            console.warn('[teaserv2] Slider not found for ID:', sliderId);
            return;
          }

          // Update gradient using requestAnimationFrame for smooth updates
          const updateGradient = () => {
            const pct = ((myRangeSlider.value - myRangeSlider.min)
              / (myRangeSlider.max - myRangeSlider.min)) * 100;
            myRangeSlider.style.background = `linear-gradient(90deg, #da4d34 ${pct}%, #dbd7d8 ${pct}%)`;
          };

          // Read the EXISTING text input value (which was correctly cloned)
          // and sync the range slider TO it (not vice versa)
          const inputType = sliderValue.dataset.calInput;
          const existingValue = sliderValue.value;
          
          if (existingValue && existingValue !== '0') {
            // Parse the existing value and set the range slider
            const parsed = parseFloat(existingValue.replace(/,/g, '')) || 0;
            const min = parseFloat(myRangeSlider.min);
            const max = parseFloat(myRangeSlider.max);
            // Clamp to valid range
            const clamped = Math.max(min, Math.min(max, parsed));
            myRangeSlider.value = clamped;
            
            // Re-format the text input in case the value was out of range
            if (inputType === 'roi') {
              sliderValue.value = parseFloat(clamped);
            } else {
              sliderValue.value = formatNum(clamped);
            }
          } else {
            // No existing value - use range slider default
            if (inputType === 'roi') {
              sliderValue.value = parseFloat(myRangeSlider.value);
            } else {
              sliderValue.value = formatNum(myRangeSlider.value);
            }
          }
          updateGradient();

          // Range → Text sync with passive listener (better scroll performance)
          const rangeInputHandler = () => {
            updateGradient();
            if (inputType === 'roi') {
              sliderValue.value = parseFloat(myRangeSlider.value);
            } else {
              sliderValue.value = formatNum(myRangeSlider.value);
            }
            triggerModalCalculation();
          };
          myRangeSlider.addEventListener('input', rangeInputHandler, { passive: true });
          addCleanup(() => myRangeSlider.removeEventListener('input', rangeInputHandler));

          // Text → Range sync on blur
          const blurHandler = function onBlur() {
            let parsed = parseFloat(this.value.replace(/,/g, '')) || 0;
            const min = parseFloat(myRangeSlider.min);
            const max = parseFloat(myRangeSlider.max);
            if (parsed < min) parsed = min;
            if (parsed > max) parsed = max;
            myRangeSlider.value = parsed;

            if (this.dataset.calInput === 'roi') {
              this.value = parseFloat(parsed);
            } else {
              this.value = formatNum(parsed);
            }
            updateGradient();
            triggerModalCalculation();
          };
          sliderValue.addEventListener('focusout', blurHandler);
          addCleanup(() => sliderValue.removeEventListener('focusout', blurHandler));

          // Filter non-numeric on input
          const inputFilterHandler = function onInput() {
            const cleanedValue = this.value.replace(/[^\d.]/g, '');
            const type = this.dataset.calInput;
            if (type === 'roi') {
              this.value = cleanedValue;
            } else if (type === 'tenure') {
              this.value = cleanedValue.replace(/\./g, '').replace(/,/g, '');
            } else {
              this.value = formatNum(cleanedValue);
            }
          };
          sliderValue.addEventListener('input', inputFilterHandler);
          addCleanup(() => sliderValue.removeEventListener('input', inputFilterHandler));
        });

        // ========== LOAN TYPE TAB SWITCHING (using cached calcTabs) ==========
        const salaryTab = calcClone.querySelector('.radiotab > li:first-child')
          || calcClone.querySelector('#salaryTab-overlay')
          || calcClone.querySelector('[id*="salaryTab"]');
        const businessTab = calcClone.querySelector('.radiotab > li:last-child')
          || calcClone.querySelector('#businessTab-overlay')
          || calcClone.querySelector('[id*="businessTab"]');
        const salariedRadio = calcClone.querySelector('[data-cal-foir="salaried"]');
        const businessRadio = calcClone.querySelector('[data-cal-foir="biz"]');

        calcBlocks.forEach((b, i) => {
          if (i === 0) {
            // Show first calculator - add elgblock for eligibility CSS compatibility
            b.classList.add('elgblock');
            b.style.display = 'block';
          } else {
            b.classList.remove('elgblock');
            b.style.display = 'none';
          }
        });

        calcTabs.forEach((tab, idx) => {
          tab.style.cursor = 'pointer';
          const tabClickHandler = () => {
            calcTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            calcBlocks.forEach((b, i) => {
              if (i === idx) {
                // Show this calculator - add elgblock class for eligibility CSS compatibility
                b.classList.add('elgblock');
                b.style.display = 'block';
              } else {
                // Hide other calculators
                b.classList.remove('elgblock');
                b.style.display = 'none';
              }
            });

            // Hide/show radio tabs based on loan type
            const isBusinessLoan = tab.classList.contains('tab-eligibility-calc')
              || tab.textContent?.toLowerCase().includes('business');

            if (isBusinessLoan) {
              // Business Loan: hide Salaried, Business at 50%
              if (salaryTab) {
                salaryTab.style.display = 'none';
                salaryTab.style.background = WHITE;
                salaryTab.classList.remove('active');
              }
              if (businessTab) {
                businessTab.style.width = '50%';
                businessTab.style.borderRadius = '0px 12px 0px 0px';
                businessTab.style.background = BUSINESS_BG;
                businessTab.classList.add('active');
              }
              if (radiotabContainer) {
                radiotabContainer.style.background = '';
              }
              if (radioBlock) {
                radioBlock.style.background = `-webkit-linear-gradient(right, ${BUSINESS_BG} 50%, ${WHITE} 50%)`;
              }
              if (calculatorParent) {
                calculatorParent.style.background = BUSINESS_BG;
              }
              // Uncheck salaried, check business
              if (salariedRadio) {
                salariedRadio.checked = false;
                salariedRadio.removeAttribute('checked');
                const salParent = salariedRadio.closest('.salary-parent');
                if (salParent) salParent.classList.remove('is-checked');
              }
              if (businessRadio) {
                businessRadio.checked = true;
                businessRadio.setAttribute('checked', 'checked');
                const bizParent = businessRadio.closest('.salary-parent');
                if (bizParent) bizParent.classList.add('is-checked');
              }
            } else {
              // Home Loan: show both radios, select Salaried by default
              if (salaryTab) {
                salaryTab.style.display = '';
                salaryTab.style.width = '50%';
                salaryTab.style.background = SALARIED_BG;
                salaryTab.classList.add('active');
              }
              if (businessTab) {
                businessTab.style.width = '50%';
                businessTab.style.borderRadius = '12px 0 0 0';
                businessTab.style.background = WHITE;
                businessTab.classList.remove('active');
              }
              if (radiotabContainer) {
                radiotabContainer.style.background = '';
              }
              if (radioBlock) {
                radioBlock.style.background = `-webkit-linear-gradient(right, ${WHITE} 50%, ${SALARIED_BG} 50%)`;
              }
              if (calculatorParent) {
                calculatorParent.style.background = SALARIED_BG;
              }
              // Uncheck business, check salaried
              if (businessRadio) {
                businessRadio.checked = false;
                businessRadio.removeAttribute('checked');
                const bizParent = businessRadio.closest('.salary-parent');
                if (bizParent) bizParent.classList.remove('is-checked');
              }
              if (salariedRadio) {
                salariedRadio.checked = true;
                salariedRadio.setAttribute('checked', 'checked');
                const salParent = salariedRadio.closest('.salary-parent');
                if (salParent) salParent.classList.add('is-checked');
              }
            }

            triggerModalCalculation();
          };
          tab.addEventListener('click', tabClickHandler);
          addCleanup(() => tab.removeEventListener('click', tabClickHandler));
        });

        // Run initial calculation
        triggerModalCalculation();
      } catch (err) {
        // Silently handle init errors
      }
    });
  } catch (error) {
    // Silently handle errors
  }
}

export default async function decorate(block) {
  const props = Array.from(block.children, (row) => row.firstElementChild);
  const renderTeaserHTML = renderTeaserHTMLFactory(props, block);
  block.innerHTML = '';
  block.append(renderTeaserHTML);
  loanProductsAnalytics(block);

  // Track if block is in calculator section
  const isInCalcSection = !!block.closest('.calculator-section-wrapper');

  if (block.closest('.section.neeyat-banner')) {
    block.querySelector('a').target = '_blank';
  }

  // Analytics
  try {
    if (block.closest('.support-contact-us-wrapper')) {
      block.querySelector('a').getAttribute('href')
        && block.querySelector('a').addEventListener('click', (e) => {
          const data = {};
          data.click_text = e.target.textContent.trim();
          data.cta_position = 'Redirection';
          ctaClickInteraction(data);
        });
    }
  } catch (error) {
    console.warn(error);
  }
  if (block.closest('.calculator-section-wrapper')) {
    const bgImg = block.querySelector('a');
    const tryBTN = bgImg?.querySelector('.button-container-text');
    const section = block.closest('.calculator-section-wrapper');
    const teaserWrapper = block.closest('.teaserv2-wrapper');
    
    // Check if modal should open:
    // 1. Section has new-calculator-modal class, OR
    // 2. teaserv2Attribute is set to new-calculator-modal, OR
    // 3. There's a calculator-ssr section on the page (auto-detect)
    const sectionHasModalClass = section.classList.contains('new-calculator-modal');
    const teaserAttr = teaserWrapper?.getAttribute('data-teaserv2-xf') || '';
    const teaserHasModalAttr = teaserAttr === 'new-calculator-modal';
    const hasCalculatorSsr = !!document.querySelector('.section.calculator-ssr');
    const isNewCalculatorModal = sectionHasModalClass || teaserHasModalAttr || hasCalculatorSsr;
    
    let isCurrentTarget;

    const cardTitle = block.querySelector('.title')?.textContent?.trim() || '';

    // Use event delegation for more reliable click handling
    block.addEventListener('click', (e) => {
      if (isNewCalculatorModal) {
        e.preventDefault();
        e.stopPropagation();
        const blockTitle = block.querySelector('.title')?.textContent?.trim() || cardTitle;
        openNewCalculatorModal(blockTitle);
        return;
      }
      
      // Analytics for non-modal clicks
      const isTryNowClick = e.target.closest('.button-container-text');
      if (isTryNowClick) {
        isCurrentTarget = 'try now';
      }
      const title = section.querySelector('.default-content-wrapper h2')?.innerText;
      const blockTitle = block.querySelector('.title')?.innerText;
      const clicktext = block.querySelector('.button-container-text')?.textContent?.trim();
      ctaClick(clicktext, blockTitle, title, targetObject.pageName);
    });

    // Keep existing handlers for backward compatibility
    if (tryBTN) {
      tryBTN.addEventListener('click', (e) => {
        isCurrentTarget = e.currentTarget.textContent.trim().toLowerCase();
        const title = e.target.closest('.calculator-section-wrapper').querySelector('.default-content-wrapper h2')?.innerText;
        const blockTitle = e.target.closest('.calculator-section-wrapper .block').querySelector('.title')?.innerText;
        const clicktext = e.target.closest('.calculator-section-wrapper ').querySelector('a .button-container-text')?.textContent.trim();
        ctaClick(clicktext, blockTitle, title, targetObject.pageName);

        // If new-calculator-modal is enabled, open the authored calculator as modal
        if (isNewCalculatorModal) {
          e.preventDefault();
          e.stopPropagation();
          openNewCalculatorModal(blockTitle || cardTitle);
        }
      });
    }

    if (bgImg) {
      bgImg.addEventListener('click', (e) => {
        // If new-calculator-modal is enabled, open the authored calculator as modal
        if (isNewCalculatorModal) {
          e.preventDefault();
          e.stopPropagation();
          const blockTitle = block.querySelector('.title')?.textContent?.trim() || cardTitle;
          openNewCalculatorModal(blockTitle);
          return;
        }

        if (!(isCurrentTarget == 'try now')) {
          const title = e.target.closest('.calculator-section-wrapper').querySelector('.default-content-wrapper h2')?.innerText;
          const blockTitle = e.target.closest('.calculator-section-wrapper .block').querySelector('.title')?.innerText;
          const clicktext = e.target.closest('.calculator-section-wrapper ').querySelector('a .button-container-text')?.textContent.trim();
          ctaClick(clicktext, blockTitle, title, targetObject.pageName);
        }
      });
    }
  }
}

export function renderTeaserHTMLFactory(props, block) {
  const isDesktop = window.matchMedia('(min-width: 768px)');
  const isMobile = window.matchMedia('(max-width: 767px)');

  const [mainHref, bgImage, frontImage, title, description, mobileDescription, button, buttonHref, bgColor, teaserv2Attr, textwithinnerhtml, mobileImg] = props;

  const createElement = (tag, className, content) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content || '';
    return element;
  };

  const mainLink = mainHref?.textContent.trim() || '';
  const container = document.createElement('a');
  // container.href = mainLink ||  'javascript:void(0)';
  container.setAttribute('aria-label', 'teaser link');
  container.setAttribute('tabindex', '0');
  mainLink ? container.href = mainLink : container.setAttribute('role', 'button');

  let bgImageSrc = bgImage?.querySelector('picture > img')?.src || '';
  let mobileSrc = mobileImg?.querySelector('picture > img')?.src || '';
  const bgBannerColor = bgColor?.textContent.trim()?.src || '';
  const bgImageDiv = createElement('div', 'bg-image');

  if (block?.closest('.section').classList.contains('corporate-financing-banner-wrapper')) {
    if (isDesktop.matches) {
      bgImageSrc = bgImageSrc.split('?')[0];
    } else if (isMobile.matches) {
      mobileSrc = mobileSrc.split('?')[0];
    }
  }

  if (isDesktop.matches) {
    if (bgImageSrc) bgImageDiv.style.backgroundImage = `url(${bgImageSrc})`;
  } else if (isMobile.matches) {
    if (mobileSrc) bgImageDiv.style.backgroundImage = `url(${mobileSrc})`;
  }

  if (bgBannerColor) bgImageDiv.style.backgroundColor = bgBannerColor;

  const frontImagePic = frontImage?.querySelector('picture');
  const frontImageDiv = createElement('div', 'front-image');
  if (frontImagePic) frontImageDiv.append(frontImagePic);

  const titleDiv = createElement('div', 'title', title?.textContent.trim() || '');
  const descriptionDiv = createElement('div', 'description', description?.textContent.trim() || '');

  let newButtonTag = '';
  const buttonHrefAnchor = buttonHref?.querySelector('a') || '';
  if (buttonHrefAnchor) {
    buttonHrefAnchor.innerText = button?.textContent.trim() || '';
    newButtonTag = buttonHrefAnchor.outerHTML;
  } else if (button) {
    newButtonTag = createElement('div', 'button-container-text', button?.textContent.trim() || '');
  }

  const textwithDiv = document.createElement('div');
  textwithDiv.innerHTML = textwithinnerhtml?.innerHTML || '';
  textwithDiv.classList.add('rte-text-description');

  bgImageDiv.append(frontImageDiv, titleDiv, descriptionDiv, newButtonTag, textwithDiv);

  const teaserv2AttrGet = teaserv2Attr?.textContent?.trim() || '';
  teaserv2Attr.closest('.teaserv2-wrapper')?.setAttribute('data-teaserv2-xf', teaserv2AttrGet);

  if (container.tagName === 'A') {
    container.append(bgImageDiv);
    autoLinkLangPath(container);
  }

  /* if (container.tagName === "A" && container.href !== '') {
    container.append(bgImageDiv);
    return container;
  }else{
    return bgImageDiv;
  } */

  return container;
}
