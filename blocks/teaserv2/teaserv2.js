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
      return;
    }

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
        const calcBlocks = calcClone.querySelectorAll('.calctabs > .commoncalculator');
        const radioTabs = [...calcClone.querySelectorAll('.radiotab > li')];
        const sliderValues = calcClone.querySelectorAll('.slider-value');
        const calcTabs = calcClone.querySelectorAll('.headul .tab-common');
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
          const visibleCalc = calcClone.querySelector(
            '.commoncalculator:not([style*="display: none"])',
          ) || calcBlocks[0];
          if (!visibleCalc) return;

          // Use correct data-cal-input selectors
          const loanAmtInput = visibleCalc.querySelector('[data-cal-input="loanamt"]');
          const tenureInput = visibleCalc.querySelector('[data-cal-input="tenure"]');
          const roiInput = visibleCalc.querySelector('[data-cal-input="roi"]');

          const loanAmt = parseFloat((loanAmtInput?.value || '0').replace(/,/g, '')) || 0;
          const tenure = parseFloat((tenureInput?.value || '0').replace(/,/g, '')) || 0;
          const roi = parseFloat(roiInput?.value || '0') || 0;

          // EMI calculation: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
          const monthlyRate = roi / 12 / 100;
          const months = tenure * 12;
          let emi = 0;
          let totalInterest = 0;

          if (monthlyRate > 0 && months > 0 && loanAmt > 0) {
            const factor = (1 + monthlyRate) ** months;
            emi = Math.round((loanAmt * monthlyRate * factor) / (factor - 1));
            totalInterest = Math.round((emi * months) - loanAmt);
          }

          // Use correct data-cal-result selectors
          const emiOutput = visibleCalc.querySelector('[data-cal-result="resultAmt"]');
          const principalOutput = visibleCalc.querySelector('[data-cal-result="principalAmt"]');
          const interestOutput = visibleCalc.querySelector('[data-cal-result="interestAmt"]');
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
        sliderValues.forEach((sliderValue) => {
          const sliderId = sliderValue.dataset.slider;
          const myRangeSlider = calcClone.querySelector(`#${sliderId}`);
          if (!myRangeSlider) return;

          // Update gradient using requestAnimationFrame for smooth updates
          const updateGradient = () => {
            const pct = ((myRangeSlider.value - myRangeSlider.min)
              / (myRangeSlider.max - myRangeSlider.min)) * 100;
            myRangeSlider.style.background = `linear-gradient(90deg, #da4d34 ${pct}%, #dbd7d8 ${pct}%)`;
          };

          // Set initial value
          const inputType = sliderValue.dataset.calInput;
          if (inputType === 'roi') {
            sliderValue.value = parseFloat(myRangeSlider.value);
          } else {
            sliderValue.value = formatNum(myRangeSlider.value);
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
          b.style.display = i === 0 ? 'block' : 'none';
        });

        calcTabs.forEach((tab, idx) => {
          tab.style.cursor = 'pointer';
          const tabClickHandler = () => {
            calcTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            calcBlocks.forEach((b, i) => {
              b.style.display = i === idx ? 'block' : 'none';
            });

            // Hide/show radio tabs based on loan type
            const isBusinessLoan = tab.classList.contains('tab-eligibility-calc')
              || tab.textContent?.toLowerCase().includes('business');

            if (isBusinessLoan) {
              // Business Loan: hide Salaried, Business at 50%
              if (salaryTab) {
                salaryTab.style.display = 'none';
                salaryTab.style.background = WHITE;
              }
              if (businessTab) {
                businessTab.style.width = '50%';
                businessTab.style.borderRadius = '0px 12px 0px 0px';
                businessTab.style.background = BUSINESS_BG;
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
              if (businessRadio) {
                businessRadio.checked = true;
                const bizParent = businessRadio.closest('.salary-parent');
                if (bizParent) bizParent.classList.add('is-checked');
              }
            } else {
              // Home Loan: show both radios
              if (salaryTab) {
                salaryTab.style.display = '';
                salaryTab.style.width = '50%';
                salaryTab.style.background = SALARIED_BG;
              }
              if (businessTab) {
                businessTab.style.width = '50%';
                businessTab.style.borderRadius = '12px 0 0 0';
                businessTab.style.background = WHITE;
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
              if (salariedRadio) {
                salariedRadio.checked = true;
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
