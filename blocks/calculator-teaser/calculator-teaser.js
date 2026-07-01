/* eslint-disable no-nested-ternary, no-console, max-len */
import { createOptimizedPicture, loadCSS } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// ================== PERFORMANCE OPTIMIZATIONS & HELPERS ==================
let cssLoaded = false;
const loadCalculatorCSS = async () => {
  if (cssLoaded) return;
  await Promise.all([
    loadCSS(`${window.hlx.codeBasePath}/blocks/calculator/calculator.css`),
    loadCSS(`${window.hlx.codeBasePath}/blocks/calculator-radio/calculator-radio.css`),
    loadCSS(`${window.hlx.codeBasePath}/blocks/calculator/home-calculator.css`),
    loadCSS(`${window.hlx.codeBasePath}/blocks/calculator-teaser/calculator-modal.css`),
  ]);
  cssLoaded = true;
};

const formatNum = (val) => {
  const cleaned = String(val).replace(/,/g, '');
  if (Number.isNaN(Number(cleaned))) return '0';
  return Number(cleaned).toLocaleString('en-IN');
};

let cleanupFns = [];
const addCleanup = (fn) => cleanupFns.push(fn);
const runCleanup = () => {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
};
// =========================================================================

/**
 * Parse a card row.
 */
function parseCardRow(row) {
  const cell = row.children[0] || row;
  const children = [...cell.children];

  let picture = null;
  let imageAlt = '';
  children.forEach((el) => {
    if (!picture) {
      const pic = el.querySelector('picture') || (el.tagName === 'PICTURE' ? el : null);
      if (pic) {
        picture = pic;
        const img = pic.querySelector('img');
        imageAlt = img?.getAttribute('alt') || '';
      }
    }
  });

  const textEls = children.filter(
    (el) => !el.querySelector('picture')
            && el.tagName !== 'PICTURE'
            && el.textContent.trim(),
  );

  const heading = textEls[0]?.textContent?.trim() || '';
  const ctaText = textEls[1]?.textContent?.trim() || '';

  return {
    picture, imageAlt, heading, ctaText,
  };
}

/**
 * Build a teaser card DOM element.
 */
function buildCard(row, index) {
  const {
    picture, imageAlt, heading, ctaText,
  } = parseCardRow(row);

  const card = document.createElement('li');
  card.className = 'calculator-teaser-card';
  card.dataset.cardIndex = index;
  moveInstrumentation(row, card);

  const imgWrap = document.createElement('div');
  imgWrap.className = 'calculator-teaser-card-image';
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(
        img.src,
        imageAlt || img.alt,
        false,
        [{ width: '750' }],
      );
      moveInstrumentation(img, optimized.querySelector('img'));
      imgWrap.append(optimized);
    }
  }
  card.append(imgWrap);

  const body = document.createElement('div');
  body.className = 'calculator-teaser-card-body';

  if (heading) {
    const h3 = document.createElement('h3');
    h3.textContent = heading;
    body.append(h3);
  }

  if (ctaText) {
    const btn = document.createElement('a');
    btn.className = 'calculator-teaser-cta';
    btn.textContent = ctaText;
    btn.href = '#';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    body.append(btn);
  }

  card.append(body);
  return card;
}

/**
 * Create or reuse the slide-in modal panel.
 * REFACTORED TO MATCH OLD DOM STRUCTURE EXACTLY (image_ae16a1.png)
 */
function getOrCreateModal() {
  let overlay = document.querySelector('.overlay');
  let modal = document.querySelector('.overlayDiv.calc-teaser-modal');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'overlay dp-none';
    document.body.appendChild(overlay);
  }

  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'overlayDiv';
    modal.innerHTML = `
      <div class="close">
        <button class="close-icon-btn" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="cmp-container">
        <div class="home-loan-title">
          <div class="cmp-title">
            <h2 class="cmp-title__text calc-teaser-modal-title"></h2>
          </div>
        </div>
        <!-- Cloned calculator will be appended directly here -->
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => {
      runCleanup(); // Clean up calculator listeners
      overlay.classList.add('dp-none');
      modal.classList.remove('show');
      document.body.style.overflow = '';
    };

    modal.querySelector('.close-icon-btn').addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) close();
    });
  }

  return { overlay, modal };
}

/**
 * Open the calculator modal with the hidden calculator section content.
 */
async function openCalculatorModal(calcSection, title) {
  runCleanup(); // Ensure clean state

  const { overlay, modal } = getOrCreateModal();
  const cmpContainer = modal.querySelector('.cmp-container');
  const modalTitle = modal.querySelector('.calc-teaser-modal-title');

  if (modalTitle) modalTitle.textContent = title || '';

  // Remove previously cloned calculators to avoid duplicates inside cmp-container
  const existingCalc = cmpContainer.querySelector('.homeloancalculator');
  if (existingCalc) existingCalc.remove();

  // Load necessary CSS before opening
  await loadCalculatorCSS();

  const calcClone = calcSection.cloneNode(true);

  // Clear inline display:none styles
  calcClone.style.cssText = '';
  calcClone.style.display = 'block';
  calcClone.style.visibility = 'visible';
  calcClone.removeAttribute('data-modal-calculator');
  calcClone.classList.add('homeloancalculator');

  calcClone.querySelectorAll('[style*="display"]').forEach((el) => {
    if (el.style.display === 'none' && !el.classList.contains('author-source')) {
      el.style.display = '';
    }
  });

  // Explicitly show structural elements
  const showSelectors = [
    '.calculator-radio-wrapper', '.calculator-radio-wrapper > *',
    '.calculator-parent', '.calculator-parent-child', '.cp-child',
    '.calctabs', '.calctabs > *', '.commoncalculator', '.parent-emi',
    '.inputDiv', '.outputDiv', '.calculator-wrapper', '.calculator',
    '.tab-name-wrapper', '.default-content-wrapper',
  ];
  showSelectors.forEach((sel) => {
    calcClone.querySelectorAll(sel).forEach((el) => {
      el.style.display = '';
      el.style.visibility = 'visible';
    });
  });

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

  // Restore product-type hidden input ID for workflow compatibility
  const productTypeInput = calcClone.querySelector('#calculator-product-type-overlay');
  if (productTypeInput) productTypeInput.id = 'calculator-product-type';

  // Append clone directly into cmp-container (matching old structure)
  cmpContainer.append(calcClone);

  // Show the modal using old CSS classes
  overlay.classList.remove('dp-none');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';

  // ================= CALCULATOR INITIALIZATION LOGIC =================
  // Use the calculator's own workflow for correct calculation (EMI, Eligibility, GST, APR)
  requestAnimationFrame(async () => {
    try {
      const { workflowHomeLoanCalculation } = await import('../calculator/cal-helpers.js');

      const calcBlocks = calcClone.querySelectorAll('.calctabs .commoncalculator');
      const radioTabs = [...calcClone.querySelectorAll('.radiotab > li')];
      const sliderValues = calcClone.querySelectorAll('.slider-value');
      const calcTabs = calcClone.querySelectorAll('.headul .tab-common:not(.gst-third-tab)');
      const radiotabContainer = calcClone.querySelector('.radiotab');
      const radioBlock = calcClone.querySelector('.calculator-radio') || calcClone.querySelector('.home-loan-calculator-parent');
      const calculatorParent = calcClone.querySelector('.calculator-parent');

      const SALARIED_BG = 'rgb(255, 247, 244)';
      const BUSINESS_BG = 'rgb(238, 243, 255)';
      const WHITE = 'rgb(255, 255, 255)';

      // Use the same calculation function the main calculator uses
      const triggerModalCalculation = () => {
        let visibleCalc = calcClone.querySelector('.commoncalculator:not([style*="display: none"])');
        if (!visibleCalc && calcBlocks.length > 0) [visibleCalc] = calcBlocks;
        if (!visibleCalc) visibleCalc = calcClone.querySelector('.commoncalculator');
        if (visibleCalc) {
          const calcType = visibleCalc.classList.contains('eligibilitycalculator')
            ? 'eligibility' : 'emi';
          workflowHomeLoanCalculation(visibleCalc, calcType);
        }
      };

      // Initialize Radio Tabs
      if (radioTabs.length > 0) {
        const updateRadioBackgrounds = (selectedIdx) => {
          const selectedTab = radioTabs[selectedIdx];
          const selectedRadio = selectedTab?.querySelector('input[data-cal-foir]');
          const foirType = selectedRadio?.dataset.calFoir || 'salaried';
          const selectedBg = foirType === 'salaried' ? SALARIED_BG : BUSINESS_BG;

          const visibleTabs = radioTabs.filter((t) => t.style.display !== 'none');
          const isSingleTabMode = visibleTabs.length === 1;

          radioTabs.forEach((tab, idx) => {
            if (tab.style.display === 'none') {
              tab.style.background = WHITE;
              return;
            }
            const tabRadio = tab.querySelector('input[data-cal-foir]');
            const tabFoirType = tabRadio?.dataset.calFoir || 'salaried';
            tab.style.background = (idx === selectedIdx || isSingleTabMode)
              ? (tabFoirType === 'salaried' ? SALARIED_BG : BUSINESS_BG) : WHITE;
          });

          if (radiotabContainer) radiotabContainer.style.background = '';
          if (radioBlock) {
            if (isSingleTabMode) radioBlock.style.background = `-webkit-linear-gradient(right, ${selectedBg} 50%, ${WHITE} 50%)`;
            else if (selectedIdx === 0) radioBlock.style.background = `-webkit-linear-gradient(right, ${WHITE} 50%, ${selectedBg} 50%)`;
            else radioBlock.style.background = `-webkit-linear-gradient(right, ${selectedBg} 50%, ${WHITE} 50%)`;
          }
          if (calculatorParent) calculatorParent.style.background = selectedBg;
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

        activateRadioTab(0);

        radioTabs.forEach((tab, idx) => {
          tab.style.cursor = 'pointer';
          tab.addEventListener('click', () => {
            activateRadioTab(idx);
            triggerModalCalculation();
          });
        });
      }

      // Initialize Sliders
      sliderValues.forEach((sliderValue) => {
        const sliderId = sliderValue.dataset.slider;
        const myRangeSlider = calcClone.querySelector(`#${sliderId}`);
        if (!myRangeSlider) return;

        const updateGradient = () => {
          const pct = ((myRangeSlider.value - myRangeSlider.min) / (myRangeSlider.max - myRangeSlider.min)) * 100;
          myRangeSlider.style.background = `linear-gradient(90deg, #da4d34 ${pct}%, #dbd7d8 ${pct}%)`;
        };

        const inputType = sliderValue.dataset.calInput;
        const existingValue = sliderValue.value;

        if (existingValue && existingValue !== '0') {
          const parsed = parseFloat(existingValue.replace(/,/g, '')) || 0;
          const min = parseFloat(myRangeSlider.min);
          const max = parseFloat(myRangeSlider.max);
          const clamped = Math.max(min, Math.min(max, parsed));
          myRangeSlider.value = clamped;

          sliderValue.value = inputType === 'roi' ? parseFloat(clamped) : formatNum(clamped);
        } else {
          sliderValue.value = inputType === 'roi' ? parseFloat(myRangeSlider.value) : formatNum(myRangeSlider.value);
        }
        updateGradient();

        const rangeInputHandler = () => {
          updateGradient();
          sliderValue.value = inputType === 'roi' ? parseFloat(myRangeSlider.value) : formatNum(myRangeSlider.value);
          triggerModalCalculation();
        };
        myRangeSlider.addEventListener('input', rangeInputHandler, { passive: true });
        addCleanup(() => myRangeSlider.removeEventListener('input', rangeInputHandler));

        const blurHandler = function onBlur() {
          let parsed = parseFloat(this.value.replace(/,/g, '')) || 0;
          const min = parseFloat(myRangeSlider.min);
          const max = parseFloat(myRangeSlider.max);
          if (parsed < min) parsed = min;
          if (parsed > max) parsed = max;
          myRangeSlider.value = parsed;

          this.value = this.dataset.calInput === 'roi' ? parseFloat(parsed) : formatNum(parsed);
          updateGradient();
          triggerModalCalculation();
        };
        sliderValue.addEventListener('focusout', blurHandler);
        addCleanup(() => sliderValue.removeEventListener('focusout', blurHandler));

        const inputFilterHandler = function onInput() {
          const cleanedValue = this.value.replace(/[^\d.]/g, '');
          const type = this.dataset.calInput;
          if (type === 'roi') this.value = cleanedValue;
          else if (type === 'tenure') this.value = cleanedValue.replace(/\./g, '').replace(/,/g, '');
          else this.value = formatNum(cleanedValue);
        };
        sliderValue.addEventListener('input', inputFilterHandler);
        addCleanup(() => sliderValue.removeEventListener('input', inputFilterHandler));
      });

      // Loan Type Tab Switching
      const salaryTab = calcClone.querySelector('.radiotab > li:first-child') || calcClone.querySelector('[id*="salaryTab"]');
      const businessTab = calcClone.querySelector('.radiotab > li:last-child') || calcClone.querySelector('[id*="businessTab"]');
      const salariedRadio = calcClone.querySelector('[data-cal-foir="salaried"]');
      const businessRadio = calcClone.querySelector('[data-cal-foir="biz"]');

      calcBlocks.forEach((b, i) => {
        if (i === 0) {
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
              b.classList.add('elgblock');
              b.style.display = 'block';
            } else {
              b.classList.remove('elgblock');
              b.style.display = 'none';
            }
          });

          const isBusinessLoan = tab.classList.contains('tab-eligibility-calc') || tab.textContent?.toLowerCase().includes('business');

          if (isBusinessLoan) {
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
            if (radiotabContainer) radiotabContainer.style.background = '';
            if (radioBlock) radioBlock.style.background = `-webkit-linear-gradient(right, ${BUSINESS_BG} 50%, ${WHITE} 50%)`;
            if (calculatorParent) calculatorParent.style.background = BUSINESS_BG;

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
            if (radiotabContainer) radiotabContainer.style.background = '';
            if (radioBlock) radioBlock.style.background = `-webkit-linear-gradient(right, ${WHITE} 50%, ${SALARIED_BG} 50%)`;
            if (calculatorParent) calculatorParent.style.background = SALARIED_BG;

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

      // Wire CTA buttons: # links open loan form, real links navigate
      calcClone.querySelectorAll('.customerbuttons a, .customerbuttons button').forEach((el) => {
        const anchor = el.closest('a') || el;
        const href = (anchor.getAttribute?.('href') || '').trim();
        const isFormTrigger = !href || href === '#';

        if (isFormTrigger) {
          anchor.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
              const { onCLickApplyFormOpen, formOpen } = await import('../applyloanform/applyloanforms.js');
              const mainContainer = document.querySelector('main') || document.body;
              const loanFormNode = mainContainer.querySelector('.loan-form-sub-parent') || document.querySelector('.loan-form-sub-parent');
              const overlayNode = mainContainer.querySelector('.modal-overlay') || document.querySelector('.modal-overlay');

              let formOpened = false;
              if (typeof onCLickApplyFormOpen === 'function' && loanFormNode) {
                try {
                  onCLickApplyFormOpen(e);
                  formOpened = window.getComputedStyle(loanFormNode).visibility !== 'hidden';
                } catch { /* ignore */ }
              }
              if (!formOpened && typeof formOpen === 'function') {
                formOpen();
                formOpened = loanFormNode && window.getComputedStyle(loanFormNode).visibility !== 'hidden';
              }
              if (!formOpened && loanFormNode) {
                if (overlayNode) {
                  overlayNode.classList.add('overlay');
                  overlayNode.classList.remove('dp-none');
                }
                if (window.matchMedia('(max-width: 1024px)').matches) {
                  loanFormNode.classList.add('loan-form--open');
                }
                loanFormNode.style.visibility = 'visible';
                document.body.style.overflowY = 'hidden';
              }
            } catch (err) {
              console.warn('Calculator modal CTA: could not open loan form', err);
            }
          });
        } else {
          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = href;
          });
        }
      });

      // Run initial calculation using the same function as main calculator
      triggerModalCalculation();
    } catch (err) {
      console.error('[teaserv2] Error initializing calculator:', err);
    }
  });
}

/**
 * Block entry point.
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const configRow = rows[0];
  const configCells = [...configRow.children[0].children];
  const sectionHeading = configCells[0]?.textContent?.trim() || '';
  const sectionDesc = configCells[1]?.textContent?.trim() || '';

  const header = document.createElement('div');
  header.className = 'calculator-teaser-header';

  if (sectionHeading) {
    const h2 = document.createElement('h2');
    h2.textContent = sectionHeading;
    header.append(h2);
  }

  if (sectionDesc) {
    const p = document.createElement('p');
    p.textContent = sectionDesc;
    header.append(p);
  }

  const ul = document.createElement('ul');
  ul.className = 'calculator-teaser-cards';

  const cardRows = rows.slice(1);
  cardRows.forEach((row, idx) => {
    ul.append(buildCard(row, idx));
  });

  block.replaceChildren(header, ul);

  ul.querySelectorAll('.calculator-teaser-card').forEach((card) => {
    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const hiddenCalcSections = [
        ...document.querySelectorAll('[data-modal-calculator="true"]'),
      ];
      const idx = parseInt(card.dataset.cardIndex, 10);
      const calcSection = hiddenCalcSections[idx];
      if (!calcSection) return;

      const cardTitle = card.querySelector('h3')?.textContent || '';
      openCalculatorModal(calcSection, cardTitle);
    };

    card.addEventListener('click', handler);
    card.style.cursor = 'pointer';
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler(e);
      }
    });
  });
}
