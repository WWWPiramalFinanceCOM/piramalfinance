import { prepareBlocks, extractContent } from './extract-content.js';
import { buildCalculatorParent, initCalculatorTabs } from './build-tabs.js';
import { workflowHomeLoanCalculation } from '../emiandeligiblitycalc/calhelpers.js';
import { currenyCommaSeperation } from '../../scripts/common.js';
import { CheckAprRate } from '../aprcalculator/aprcalculator.js';
import { updatePartPayment } from '../partpaymentcalculator/partpaymentlogic.js';

/** Track sections already combined so it runs only once per section */
const combinedSections = new WeakSet();

/** Track sections that have already been fully initialised */
const initialisedSections = new WeakSet();

/** Track if Part Payment date picker has been initialized */
let partPaymentDatePickerInitialized = false;

/** Part Payment state variables */
let partPaymentCount = 2;
const partPaymentData = {};
let firstLoanDatePicker = null;
let partPayment1DatePicker = null;

/** Store all datepicker instances */
const datePickerInstances = new Map();

/**
 * Convert date string to standard format
 */
function convertDateToStandard(dateStr) {
  const parts = dateStr.split('/');
  return new Date(parts[2], parts[0] - 1, parts[1]).toString();
}

/**
 * Increase date by one month
 */
function increaseByOneMonth(date) {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);
  if (newDate.getDate() !== 1) newDate.setDate(1);
  return newDate;
}

/**
 * Calculate months gap between two dates
 */
function monthsGap(d1, d2) {
  let date1 = d1;
  let date2 = d2;
  if (date1 > date2) [date1, date2] = [date2, date1];
  let months = (date2.getFullYear() - date1.getFullYear()) * 12;
  months += date2.getMonth() - date1.getMonth();
  return months;
}

/**
 * Format number with Indian comma separation
 */
function formatIndianNumber(value) {
  const val = parseFloat(String(value).replace(/,/g, '')) || 0;
  return val.toLocaleString('en-IN');
}

/**
 * Initialize slider functionality for part payment
 */
function initPartPaymentSliders(calcPanel) {
  const sliderValues = calcPanel.querySelectorAll('.partpaymentSection .slider-value');
  sliderValues.forEach((sliderValue) => {
    const sliderId = sliderValue.dataset.slider;
    const rangeSlider = calcPanel.querySelector(`#${sliderId}`);
    if (!rangeSlider) return;
    
    sliderValue.value = formatIndianNumber(rangeSlider.value);
    
    rangeSlider.addEventListener('input', () => {
      const valPercent = ((rangeSlider.value - rangeSlider.min) / (rangeSlider.max - rangeSlider.min)) * 100;
      rangeSlider.style.background = `linear-gradient(90deg, #da4d34 ${valPercent}%, #dbd7d8 ${valPercent}%)`;
      sliderValue.value = formatIndianNumber(rangeSlider.value);
    });
    
    sliderValue.addEventListener('change', () => {
      let parsedValue = parseFloat(sliderValue.value.replace(/,/g, '')) || 0;
      const min = parseFloat(rangeSlider.min);
      const max = parseFloat(rangeSlider.max);
      if (parsedValue < min) parsedValue = min;
      if (parsedValue > max) parsedValue = max;
      rangeSlider.value = parsedValue;
      sliderValue.value = formatIndianNumber(parsedValue);
      const valPercent = ((parsedValue - min) / (max - min)) * 100;
      rangeSlider.style.background = `linear-gradient(90deg, #da4d34 ${valPercent}%, #dbd7d8 ${valPercent}%)`;
    });
    
    sliderValue.addEventListener('input', function() {
      const cleaned = this.value.replace(/[^\d]/g, '');
      this.value = formatIndianNumber(cleaned);
    });
    
    // Trigger initial update
    rangeSlider.dispatchEvent(new Event('input'));
  });
}

/**
 * Trigger Part Payment calculation update
 * Collects all part payment data and calls the calculation function
 */
function triggerPartPaymentCalculation(calcPanel) {
  try {
    // Get EMI input values
    const loanAmtInput = calcPanel.querySelector('[data-cal-input="loanamt"]');
    const roiInput = calcPanel.querySelector('[data-cal-input="roi"]');
    const tenureInput = calcPanel.querySelector('[data-cal-input="tenure"]');
    
    if (!loanAmtInput || !roiInput || !tenureInput) {
      console.log('[calculator] EMI inputs not found for calculation');
      return;
    }
    
    const principal = loanAmtInput.value || '500000';
    const rate = roiInput.value || '18.99';
    const tenure = tenureInput.value || '5';
    
    // Collect all part payment data
    const partPayments = Object.values(partPaymentData).filter(p => p && p.monthDifference && p.partPayAmount);
    
    console.log('[calculator] Triggering calculation:', { principal, rate, tenure, partPayments });
    
    // Call the calculation function
    updatePartPayment(rate, principal, tenure, partPayments);
    
  } catch (error) {
    console.warn('[calculator] Part payment calculation error:', error);
  }
}

/**
 * Scroll to show latest part payment card
 */
function scrollPartPayment(calcPanel) {
  const boxCont = calcPanel.querySelector('.boxCont');
  const partpayments = calcPanel.querySelectorAll('.partpaymentCardContainer');
  if (partpayments.length > 3) {
    boxCont.classList.add('scrolladd');
    const last = partpayments[partpayments.length - 1];
    boxCont.scrollTo({ top: last.offsetTop, behavior: 'smooth' });
  } else if (boxCont?.classList.contains('scrolladd')) {
    boxCont.classList.remove('scrolladd');
  }
}

/**
 * Reset all part payments
 */
function resetAllPartPayments(calcPanel) {
  console.log('[calculator] Resetting all part payments');
  
  // Clear all part payment data
  Object.keys(partPaymentData).forEach(key => delete partPaymentData[key]);
  
  // Remove dynamically added cards
  calcPanel.querySelectorAll('.reset').forEach(el => {
    // Clear datepicker instance
    const input = el.querySelector('input[id^="partpayment"]');
    if (input) {
      const selector = '#' + input.id;
      if (datePickerInstances.has(selector)) {
        try {
          datePickerInstances.get(selector).destroy();
        } catch (e) {
          console.warn('[calculator] Error destroying datepicker:', e);
        }
        datePickerInstances.delete(selector);
      }
    }
    el.remove();
  });
  partPaymentCount = 2;
  
  // Reset first card
  const partPayment1 = calcPanel.querySelector('#partpayment1');
  if (partPayment1) {
    partPayment1.value = '';
    partPayment1.disabled = true;
  }
  
  const sliderInput = calcPanel.querySelector('.partpaymentCardContainer .slider-value');
  if (sliderInput) sliderInput.value = '0';
  
  const rangeInput = calcPanel.querySelector('.partpaymentCardContainer .range-slider__range');
  if (rangeInput) {
    rangeInput.value = rangeInput.min || '0';
    rangeInput.style.background = `linear-gradient(90deg, #da4d34 0%, #dbd7d8 0%)`;
  }
  
  // Disable add more button
  const addMoreBtn = calcPanel.querySelector('.add-more-part-payment-btn');
  if (addMoreBtn) addMoreBtn.classList.add('disabled');
  
  // Clear first loan date
  const firstLoan = calcPanel.querySelector('#firstLoan');
  if (firstLoan) firstLoan.value = '';
  
  // Clear data
  // Clear datepicker values (not destroy, just clear)
  if (firstLoanDatePicker) {
    try {
      firstLoanDatePicker.clear();
    } catch (e) {
      console.warn('[calculator] Error clearing first loan datepicker:', e);
    }
  }
  if (partPayment1DatePicker) {
    try {
      partPayment1DatePicker.clear();
    } catch (e) {
      console.warn('[calculator] Error clearing partpayment1 datepicker:', e);
    }
  }
  
  // Remove scroll
  const boxCont = calcPanel.querySelector('.boxCont');
  if (boxCont) boxCont.classList.remove('scrolladd');
  
  console.log('[calculator] Reset complete');
}

/**
 * Create new part payment card dynamically
 */
function createPartPaymentCard(calcPanel, count) {
  const boxCont = calcPanel.querySelector('.boxCont');
  const firstCard = calcPanel.querySelector('.partpaymentCardContainer');
  if (!boxCont || !firstCard) return;
  
  const rangeInput = firstCard.querySelector('.range-slider__range');
  const imagePath = firstCard.querySelector('.inputdivs.dt img')?.src || '/icons/calendar.svg';
  const minText = firstCard.querySelectorAll('.rangediv .values .text')[0]?.innerText || '0';
  const maxText = firstCard.querySelectorAll('.rangediv .values .text')[1]?.innerText || '20L';
  
  const ordinal = count === 1 ? '1st' : count === 2 ? '2nd' : count === 3 ? '3rd' : `${count}th`;
  const dateLabel = `Enter ${ordinal} part payment Date`;
  const amountLabel = `${ordinal} Part Payment amount (Rs.)`;
  
  const card = document.createElement('div');
  card.id = `partpaymentCardContainer${count}`;
  card.className = 'loanamount partPayment partpaymentCardContainer reset';
  card.innerHTML = `
    <div class="data">
      <label class="description">${dateLabel}</label>
      <div class="inputdivs dt">
        <input type="text" class="inputvalue" placeholder="DD/MM/YYYY" readonly id="partpayment${count}">
        <img src="${imagePath}" alt="calendar">
      </div>
    </div>
    <div class="loanamount">
      <div class="data">
        <label class="description">${amountLabel}</label>
        <div class="inputdivs">
          <span class="rupee">₹</span>
          <input type="text" class="inputvalue slider-value" value="0" data-slider="partPayment${count}">
          <span class="textvalue"></span>
        </div>
      </div>
      <div class="rangediv">
        <input type="range" min="${rangeInput?.min || 0}" max="${rangeInput?.max || 2000000}" value="0" 
          class="range-slider__range" id="partPayment${count}" 
          style="background: linear-gradient(90deg, rgb(218, 77, 52) 0%, rgb(219, 215, 216) 0%);">
        <div class="values">
          <span class="text">${minText}</span>
          <span class="text">${maxText}</span>
        </div>
      </div>
    </div>
  `;
  
  boxCont.appendChild(card);
  return card;
}

/**
 * Initialize Part Payment date picker and all functionality
 */
async function initPartPaymentDatePicker(calcPanel) {
  if (partPaymentDatePickerInitialized) return;
  
  console.log('[calculator] Initializing Part Payment...');
  
  try {
    // Load AirDatepicker CSS
    if (!document.querySelector('link[href*="datepickerlib.css"]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = '/blocks/datepickerlib/datepickerlib.css';
      document.head.appendChild(css);
      console.log('[calculator] Loaded datepicker CSS');
    }
    
    // Import libraries - these set window.AirDatepicker and window.Popper
    await import('../datepickerlib/datepickerlib.js');
    await import('../datepickerlib/popper.js');
    
    // Wait for globals to be set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get references to the now-global constructors
    const AirDatepicker = window.AirDatepicker;
    const Popper = window.Popper;
    
    console.log('[calculator] AirDatepicker:', typeof AirDatepicker);
    console.log('[calculator] Popper:', typeof Popper);
    
    if (!AirDatepicker) {
      console.error('[calculator] AirDatepicker not available after import');
      return;
    }
    
    const firstLoanInput = calcPanel.querySelector('#firstLoan');
    const partPayment1Input = calcPanel.querySelector('#partpayment1');
    const clearAllBtn = calcPanel.querySelector('.clearAllText');
    const addMoreBtn = calcPanel.querySelector('.add-more-part-payment-btn');
    const boxCont = calcPanel.querySelector('.boxCont');
    
    console.log('[calculator] Elements:', {
      firstLoanInput: !!firstLoanInput,
      partPayment1Input: !!partPayment1Input,
      clearAllBtn: !!clearAllBtn,
      addMoreBtn: !!addMoreBtn
    });
    
    if (!firstLoanInput) {
      console.error('[calculator] First loan input not found');
      return;
    }
    
    // Helper to create datepicker - use selector string like existing code
    const createDatePicker = (selector, minDate = '') => {
      console.log('[calculator] Creating datepicker for:', selector, 'minDate:', minDate);
      
      const options = {
        position({ $datepicker, $target, $pointer, done }) {
          if (Popper && Popper.createPopper) {
            const popper = Popper.createPopper($target, $datepicker, {
              placement: 'top',
              modifiers: [
                { name: 'flip', options: { fallbackPlacements: ['top', 'bottom'], padding: { top: 10 } } },
                { name: 'offset', options: { offset: [0, 10] } },
                { name: 'arrow', options: { element: $pointer } },
              ],
            });
            return function completeHide() {
              popper.destroy();
              done();
            };
          }
          return done;
        },
        autoClose: true,
        toggleSelected: false,
        locale: {
          days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
          months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          today: 'Today', clear: 'Clear', dateFormat: 'MM/dd/yyyy', firstDay: 0,
        },
        onSelect({ date, formattedDate }) {
          if (date) {
            console.log('[calculator] Date selected:', formattedDate);
            document.querySelector(selector).dispatchEvent(new Event('change', { bubbles: true }));
          }
        },
      };
      
      // Only add minDate if it's provided and valid
      if (minDate && minDate !== '') {
        options.minDate = minDate;
      }
      
      const picker = new AirDatepicker(selector, options);
      
      // Store instance
      datePickerInstances.set(selector, picker);
      document.querySelector(selector).classList.add('datepickerInit');
      
      console.log('[calculator] Datepicker created for:', selector);
      return picker;
    };
    
    // Helper to setup icon click handler
    const setupIconClick = (selector, picker) => {
      const input = document.querySelector(selector);
      const icon = input?.parentElement?.querySelector('img');
      if (icon && picker) {
        icon.style.cursor = 'pointer';
        icon.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!input.disabled) {
            console.log('[calculator] Icon clicked for:', selector);
            picker.show();
          }
        });
      }
      if (input) {
        input.style.cursor = 'pointer';
      }
    };
    
    // Initialize first loan date picker
    firstLoanDatePicker = createDatePicker('#firstLoan');
    setupIconClick('#firstLoan', firstLoanDatePicker);
    
    // First loan date change handler
    firstLoanInput.addEventListener('change', () => {
      console.log('[calculator] First loan date changed:', firstLoanInput.value);
      if (!firstLoanInput.value) return;
      
      // Enable part payment 1 input
      partPayment1Input.disabled = false;
      
      const minDate = increaseByOneMonth(convertDateToStandard(firstLoanInput.value));
      console.log('[calculator] Part payment minDate:', minDate);
      
      // Initialize or update part payment 1 date picker
      if (!partPayment1Input.classList.contains('datepickerInit')) {
        partPayment1DatePicker = createDatePicker('#partpayment1', minDate);
        setupIconClick('#partpayment1', partPayment1DatePicker);
      } else if (partPayment1DatePicker) {
        partPayment1DatePicker.update({ minDate });
      }
      
      // Reset part payment 1 values
      partPayment1Input.value = '';
      const sliderInput = calcPanel.querySelector('.partpaymentCardContainer .slider-value');
      if (sliderInput) sliderInput.value = '0';
      const rangeInput = calcPanel.querySelector('.partpaymentCardContainer .range-slider__range');
      if (rangeInput) {
        rangeInput.value = rangeInput.min;
        rangeInput.style.background = `linear-gradient(90deg, #da4d34 0%, #dbd7d8 0%)`;
      }
      
      // Remove dynamically added cards
      calcPanel.querySelectorAll('.reset').forEach(el => {
        const input = el.querySelector('input[id^="partpayment"]');
        if (input && datePickerInstances.has('#' + input.id)) {
          datePickerInstances.get('#' + input.id).destroy();
          datePickerInstances.delete('#' + input.id);
        }
        delete partPaymentData[el.id];
        el.remove();
      });
      partPaymentCount = 2;
      // Clear first card data as well
      Object.keys(partPaymentData).forEach(key => delete partPaymentData[key]);
      
      // Disable add more button
      addMoreBtn?.classList.add('disabled');
      
      // Update box data
      if (boxCont) boxCont.dataset.date = minDate;
      
      initPartPaymentSliders(calcPanel);
      
      // Update calculation with no part payments (reset state)
      triggerPartPaymentCalculation(calcPanel);
    });
    
    // Part payment card change handler
    const firstCard = calcPanel.querySelector('.partpaymentCardContainer');
    if (firstCard) {
      firstCard.addEventListener('change', () => {
        const dateInput = firstCard.querySelector('#partpayment1');
        const amountInput = firstCard.querySelector('.slider-value');
        
        if (dateInput?.value && amountInput?.value && amountInput.value !== '0') {
          // Enable add more button
          addMoreBtn?.classList.remove('disabled');
          
          // Store data
          const firstDate = firstLoanInput.value;
          const secondDate = dateInput.value;
          partPaymentData[firstCard.id] = {
            monthDifference: monthsGap(new Date(firstDate), new Date(secondDate)),
            partPayAmount: amountInput.value.replace(/,/g, '')
          };
          
          // Update box date
          if (boxCont) boxCont.dataset.date = convertDateToStandard(secondDate);
          
          // Trigger calculation
          triggerPartPaymentCalculation(calcPanel);
        }
      });
    }
    
    // Clear All button handler
    if (clearAllBtn) {
      clearAllBtn.style.cursor = 'pointer';
      console.log('[calculator] Setting up Clear All handler');
      clearAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('[calculator] Clear All clicked');
        resetAllPartPayments(calcPanel);
        initPartPaymentSliders(calcPanel);
        // Trigger calculation with empty part payments
        triggerPartPaymentCalculation(calcPanel);
      });
    }
    
    // Add More button handler
    if (addMoreBtn) {
      addMoreBtn.addEventListener('click', () => {
        console.log('[calculator] Add More clicked');
        addMoreBtn.classList.add('disabled');
        
        const card = createPartPaymentCard(calcPanel, partPaymentCount);
        if (!card) return;
        
        const minDate = increaseByOneMonth(boxCont.dataset.date);
        const newSelector = `#partpayment${partPaymentCount}`;
        
        // Initialize date picker for new card
        const newDatePicker = createDatePicker(newSelector, minDate);
        setupIconClick(newSelector, newDatePicker);
        
        // Card change handler
        card.addEventListener('change', () => {
          const dateInput = card.querySelector('input[id^="partpayment"]');
          const amountInput = card.querySelector('.slider-value');
          
          if (dateInput?.value && amountInput?.value && amountInput.value !== '0') {
            addMoreBtn.classList.remove('disabled');
            
            const firstDate = firstLoanInput.value;
            partPaymentData[card.id] = {
              monthDifference: monthsGap(new Date(firstDate), new Date(dateInput.value)),
              partPayAmount: amountInput.value.replace(/,/g, '')
            };
            
            boxCont.dataset.date = convertDateToStandard(dateInput.value);
            
            // Trigger calculation
            triggerPartPaymentCalculation(calcPanel);
          }
        });
        
        initPartPaymentSliders(calcPanel);
        partPaymentCount++;
        scrollPartPayment(calcPanel);
      });
    }
    
    // Listen for EMI slider changes to update part payment calculation
    const inputDiv = calcPanel.querySelector('.inputDiv');
    if (inputDiv) {
      inputDiv.addEventListener('change', (event) => {
        const target = event.target;
        // If EMI slider (loan amount, tenure, or interest rate) changed, update calculation
        if (target.dataset?.calInput === 'loanamt' || 
            target.dataset?.calInput === 'tenure' || 
            target.dataset?.calInput === 'roi') {
          triggerPartPaymentCalculation(calcPanel);
        }
      });
    }
    
    // Initialize sliders
    initPartPaymentSliders(calcPanel);
    
    // Initial calculation with default values
    triggerPartPaymentCalculation(calcPanel);
    
    partPaymentDatePickerInitialized = true;
    console.log('[calculator] Part Payment initialization complete');
    
  } catch (error) {
    console.error('[calculator] Failed to initialize Part Payment:', error);
  }
}

/**
 * Mapping from authored input names (first <p> in slider rows)
 * to the data-cal-input attribute values the existing calculator
 * logic expects.
 */
const INPUT_NAME_MAP = {
  loanamount: 'loanamt',
  loanamt: 'loanamt',
  loantenure: 'tenure',
  tenure: 'tenure',
  interestrate: 'roi',
  roi: 'roi',
  income: 'income',
  monthlyincome: 'income',
  grossannualincome: 'income',
  grossmonthlyincome: 'income',
  otherloan: 'otherloan',
  existingemi: 'otherloan',
  otherloanemi: 'otherloan',
  netprice: 'netprice',
  productioncost: 'productioncost',
  gstrate: 'gstrate',
  profitratio: 'profitratio',
  origincharges: 'origincharges',
  loanorigination: 'origincharges',
};

/**
 * Maps an authored input name to the correct data-cal-input value.
 */
function mapInputName(authoredName) {
  const key = (authoredName || '').toLowerCase().replace(/[\s_-]/g, '');
  return INPUT_NAME_MAP[key] || key;
}

/**
 * Currency symbols that appear as a prefix before the input value.
 * Everything else authored in the icon field is treated as a suffix.
 */
const CURRENCY_SYMBOLS = ['₹', '$', '€', '£', '¥'];

/**
 * Combines all calculator blocks in a section into a single
 * calculator-parent wrapper with heading and CTA buttons.
 * Radio tabs are handled by the separate calculator-radio block.
 */
function combineSection(section) {
  if (combinedSections.has(section)) return;
  combinedSections.add(section);

  const calcWrappers = [...section.querySelectorAll('.calculator-wrapper')];
  if (calcWrappers.length < 1) return;

  const blocks = calcWrappers.map((w) => w.querySelector('.calculator.block')).filter(Boolean);
  if (blocks.length < 1) return;

  const { description, tabNames, calcNames, productType } = prepareBlocks(blocks);
  section.classList.add('homeloancalculator');
  
  // Add gst-calculator class if any calculator is GST type (for pill-button tab styles)
  const hasGstCalc = calcNames.some((name) => name.includes('gst'));
  if (hasGstCalc) {
    section.classList.add('gst-calculator');
  }
  
  const { ctaItems, dcwToRemove } = extractContent(section);

  const calcParent = buildCalculatorParent(description, tabNames, ctaItems, blocks, hasGstCalc);

  calcWrappers.forEach((w) => w.remove());
  dcwToRemove.forEach((dcw) => dcw.remove());

  section.appendChild(calcParent);

  // Check if calculator-radio block exists - if not, add a hidden fallback radio
  const hasRadioBlock = section.querySelector('.calculator-radio');
  if (!hasRadioBlock) {
    const fallbackRadio = document.createElement('input');
    fallbackRadio.type = 'radio';
    fallbackRadio.name = 'calculator-foir';
    fallbackRadio.className = 'input_salary_checkbox';
    fallbackRadio.dataset.calFoir = 'salaried';
    fallbackRadio.value = '65';
    fallbackRadio.checked = true;
    fallbackRadio.style.display = 'none';
    section.appendChild(fallbackRadio);
  }

  const mobileDiv = document.createElement('div');
  mobileDiv.className = 'homepagemobiledesign';
  section.appendChild(mobileDiv);

  // Only add product type if calculator-radio block hasn't already added it
  if (!section.querySelector('#calculator-product-type')) {
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'product type';
    hiddenInput.id = 'calculator-product-type';
    hiddenInput.value = productType;
    section.appendChild(hiddenInput);
  }

  initCalculatorTabs();

  // Set initial calculator-parent background
  // GST calculators get white background, EMI/Eligibility use radio-based background
  if (hasGstCalc && calcParent) {
    calcParent.style.background = '#fff';
  } else {
    // First try :checked, then fallback to first radio with data-cal-foir
    let checkedRadio = section.querySelector('[data-cal-foir]:checked');
    if (!checkedRadio) {
      checkedRadio = section.querySelector('[data-cal-foir]');
    }
    if (checkedRadio && calcParent) {
      const foirType = (checkedRadio.dataset && checkedRadio.dataset.calFoir) || 'salaried';
      const SALARIED_BG = 'rgb(255, 247, 244)';
      const BUSINESS_BG = 'rgb(238, 243, 255)';
      calcParent.style.background = foirType === 'salaried' ? SALARIED_BG : BUSINESS_BG;
      // eslint-disable-next-line no-console
      console.log('[calculator] combineSection set background for foirType:', foirType);
    }
  }
}

/**
 * Initialize slider event handlers for the calculator.
 * This is a clean implementation that ONLY handles sliders - 
 * radio tab handling is done by calculator-radio.js
 */
function initializeSliders(section) {
  const sliderValues = section.querySelectorAll('.slider-value');
  const isGstCalculator = section.classList.contains('gst-calculator');

  sliderValues.forEach((textInput) => {
    const sliderId = textInput.dataset.slider;
    if (!sliderId) return;

    const rangeSlider = section.querySelector(`#${sliderId}`);
    if (!rangeSlider) return;

    const calInput = rangeSlider.dataset.calInput || '';
    const isRoi = calInput === 'roi';

    // Format number with Indian comma separation
    function formatValue(value) {
      const val = Number(value);
      if (Number.isNaN(val)) return '0';
      return isRoi ? String(val) : currenyCommaSeperation(val);
    }

    // Update slider track gradient
    function updateGradient() {
      const min = parseFloat(rangeSlider.min) || 0;
      const max = parseFloat(rangeSlider.max) || 100;
      const val = parseFloat(rangeSlider.value) || 0;
      const percent = ((val - min) / (max - min)) * 100;
      rangeSlider.style.background = `linear-gradient(90deg, #da4d34 ${percent}%, #dbd7d8 ${percent}%)`;
    }

    // Trigger calculation for the calculator panel
    function triggerCalculation() {
      const calcPanel = rangeSlider.closest('.commoncalculator');
      if (calcPanel) {
        const calcType = calcPanel.classList.contains('eligibilitycalculator')
          ? 'eligibility' : 'emi';
        workflowHomeLoanCalculation(calcPanel, calcType);
      }
    }

    // Trigger GST calculation
    function triggerGstCalculation() {
      const calcPanel = rangeSlider.closest('.commoncalculator');
      if (calcPanel) {
        runSingleCalculation(section, calcPanel);
      }
    }

    // Slider drag event - update text and gradient
    // For GST: DON'T calculate during drag (keep previous value visible)
    // For EMI/Eligibility: calculate immediately
    rangeSlider.addEventListener('input', () => {
      textInput.value = formatValue(rangeSlider.value);
      updateGradient();
      if (!isGstCalculator) {
        triggerCalculation();
      }
    });

    // Slider release event (change) - calculate for GST
    if (isGstCalculator) {
      rangeSlider.addEventListener('change', () => {
        triggerGstCalculation();
      });
    }

    // Text input focus out - sync back to slider and calculate
    textInput.addEventListener('focusout', () => {
      let parsed = parseFloat(textInput.value.replace(/,/g, '')) || 0;
      const minVal = parseFloat(rangeSlider.min) || 0;
      const maxVal = parseFloat(rangeSlider.max) || 100;

      // Clamp to valid range
      if (parsed < minVal) parsed = minVal;
      if (parsed > maxVal) parsed = maxVal;

      rangeSlider.value = parsed;
      textInput.value = formatValue(parsed);
      updateGradient();
      
      if (isGstCalculator) {
        triggerGstCalculation();
      } else {
        triggerCalculation();
      }
    });

    // Text input typing - allow only numbers and decimals for ROI
    textInput.addEventListener('input', () => {
      let cleaned = textInput.value.replace(/[^\d.]/g, '');
      if (!isRoi) {
        cleaned = cleaned.replace(/\./g, ''); // No decimals for non-ROI
      }
      textInput.value = cleaned;
    });

    // Initialize gradient on load
    updateGradient();
  });
}

/**
 * After all blocks in the section are decorated,
 * initialise sliders, store defaults, wire events, and run the first calculation.
 */
function initSection(section, retryCount = 0) {
  if (initialisedSections.has(section)) return;

  const calctabs = section.querySelector('.calctabs');
  if (!calctabs) return;
  const allBlocks = [...calctabs.querySelectorAll('.commoncalculator')];
  if (allBlocks.length === 0) return;
  const allReady = allBlocks.every((b) => b.querySelector('.parent-emi'));

  // GST/APR/Part Payment calculators don't need radio inputs - skip that check
  const isSpecialCalc = section.classList.contains('gst-calculator') ||
    allBlocks.some((b) => b.classList.contains('aprcalculator') || 
                         b.classList.contains('gstcalculatorbuyer') || 
                         b.classList.contains('gstcalculatorseller') ||
                         b.classList.contains('partpaymentcalculator'));
  
  // Check if calculator-radio has created AND CHECKED a radio input
  // Only required for EMI/Eligibility calculators
  const hasCheckedRadio = section.querySelector('[data-cal-foir]:checked');

  // If not ready, retry (up to 30 times = 3 seconds)
  // GST/APR/Part Payment calculators skip the radio check
  if (!allReady || (!isSpecialCalc && !hasCheckedRadio)) {
    if (retryCount < 30) {
      setTimeout(() => initSection(section, retryCount + 1), 100);
    }
    return;
  }

  initialisedSections.add(section);

  // Initialize sliders with clean event handlers (no conflicts with calculator-radio)
  initializeSliders(section);

  // Ensure eligibility calculator is visible if it's the only one
  const eligibilityCalc = section.querySelector('.eligibilitycalculator');
  const emiCalc = section.querySelector('.emicalculator');
  if (eligibilityCalc && !emiCalc) {
    eligibilityCalc.classList.add('elgblock');
    eligibilityCalc.style.display = 'block';
  }

  // Set calculator-parent background
  // GST/APR/Part Payment calculators get white background, EMI/Eligibility use radio-based background
  const calculatorParent = section.querySelector('.calculator-parent');
  if (isSpecialCalc && calculatorParent) {
    calculatorParent.style.background = '#fff';
  } else if (calculatorParent) {
    // First try :checked, then fallback to first radio with data-cal-foir
    let checkedRadioForBg = section.querySelector('[data-cal-foir]:checked');
    if (!checkedRadioForBg) {
      checkedRadioForBg = section.querySelector('[data-cal-foir]');
    }
    if (checkedRadioForBg) {
      const foirType = (checkedRadioForBg.dataset && checkedRadioForBg.dataset.calFoir) || 'salaried';
      const SALARIED_BG = 'rgb(255, 247, 244)';
      const BUSINESS_BG = 'rgb(238, 243, 255)';
      calculatorParent.style.background = foirType === 'salaried' ? SALARIED_BG : BUSINESS_BG;
      // eslint-disable-next-line no-console
      console.log('[calculator] initSection set background for foirType:', foirType);
    }
  }

  // Store default slider values for reset (same as homeloancalculatorv2)
  const calDefaultValueObj = JSON.parse(sessionStorage.getItem('calDefaultValueObj') || '{}');
  allBlocks.forEach((cal) => {
    const resetId = cal.dataset.resetId;
    if (!resetId) return;
    calDefaultValueObj[resetId] = Object.fromEntries(
      [...cal.querySelectorAll('input[type=range]')].map((inp) => [inp.id, inp.value]),
    );
  });
  sessionStorage.setItem('calDefaultValueObj', JSON.stringify(calDefaultValueObj));

  // Wire calculation events using the existing logic
  wireExistingCalculationEvents(section);

  // Run initial calculation for all panels
  runInitialCalculation(section);
}

/* ── Calculator type detection ───────────────── */

function getCalcType(calcPanel) {
  // GST calculator types include: gstcalculator, gstcalculatorbuyer, gstcalculatorseller
  if (calcPanel.classList.contains('gstcalculator') || 
      calcPanel.classList.contains('gstcalculatorbuyer') || 
      calcPanel.classList.contains('gstcalculatorseller') ||
      calcPanel.classList.contains('gst')) return 'gst';
  if (calcPanel.classList.contains('aprcalculator') || calcPanel.classList.contains('apr')) return 'apr';
  if (calcPanel.classList.contains('partpaymentcalculator')) return 'partpayment';
  if (calcPanel.classList.contains('eligibilitycalculator')) return 'eligibility';
  return 'emi';
}

/* ── Calculation runners using existing logic ── */

function runSingleCalculation(section, calcPanel) {
  if (!calcPanel) return;
  const calcType = getCalcType(calcPanel);

  if (calcType === 'emi' || calcType === 'eligibility') {
    // Use the existing proven pipeline from emiandeligiblitycalc
    workflowHomeLoanCalculation(calcPanel, calcType);
  } else if (calcType === 'gst') {
    runGstCalculation(section, calcPanel);
  } else if (calcType === 'apr') {
    runAprCalculation(calcPanel);
  } else if (calcType === 'partpayment') {
    runPartPaymentCalculation(section, calcPanel);
  }
}

function runGstCalculation(section, calcPanel) {
  const resultElement = calcPanel.querySelector('[data-cal-result=resultAmt]');
  if (!resultElement) return;

  // Detect Buyer vs Seller from the calculator block's class name (not tab position)
  // gstcalculatorbuyer uses Net Price formula
  // gstcalculatorseller uses Production Cost + Profit Ratio formula
  const isBuyer = calcPanel.classList.contains('gstcalculatorbuyer');

  let result = 0;
  const gstRate = Number(calcPanel.querySelector('[data-cal-input=gstrate]')?.value) || 0;

  if (isBuyer) {
    // Buyer formula: NetPrice * (1 + GSTRate/100)
    const netPrice = Number((calcPanel.querySelector('[data-cal-input=netprice]')?.value || '').replace(/,/g, '')) || 0;
    result = netPrice * (1 + gstRate * 0.01);
  } else {
    // Seller/Manufacturer formula: ProductionCost * (1 + ProfitRatio/100) * (1 + GSTRate/100)
    const productionCost = Number((calcPanel.querySelector('[data-cal-input=productioncost]')?.value || '').replace(/,/g, '')) || 0;
    const profitRatio = Number(calcPanel.querySelector('[data-cal-input=profitratio]')?.value) || 0;
    result = productionCost * (1 + profitRatio * 0.01) * (1 + gstRate * 0.01);
  }
  result = isNaN(result) ? 0 : Math.round(result);
  resultElement.textContent = `₹${currenyCommaSeperation(result)}/-`;
}

function runAprCalculation(calcPanel) {
  const resultElement = calcPanel.querySelector('[data-cal-result=resultAmt]');
  if (!resultElement) return;

  const loanAmt = Number((calcPanel.querySelector('[data-cal-input=loanamt]')?.value || '').replace(/,/g, '')) || 0;
  const originCharges = Number((calcPanel.querySelector('[data-cal-input=origincharges]')?.value || '').replace(/,/g, '')) || 0;
  const roi = Number(calcPanel.querySelector('[data-cal-input=roi]')?.value) || 0;
  const tenure = Number(calcPanel.querySelector('[data-cal-input=tenure]')?.value) || 0;

  const aprValue = CheckAprRate(loanAmt, originCharges, roi, tenure);
  resultElement.textContent = `${aprValue}%`;
}

/* ── Part Payment Calculation ────────────────── */

/**
 * Calculate PMT (monthly payment) for a loan
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} tenureYears - Loan tenure in years
 * @returns {number} Monthly EMI
 */
function calculatePMT(principal, annualRate, tenureYears) {
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  if (monthlyRate === 0) return principal / totalMonths;
  const emi = (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -totalMonths);
  return Math.round(emi);
}

/**
 * Run Part Payment Calculator calculation
 * Uses slider values (loan amount, ROI, tenure) to calculate EMI and total payment
 */
function runPartPaymentCalculation(section, calcPanel) {
  // Get input values from sliders
  const loanAmt = Number((calcPanel.querySelector('[data-cal-input=loanamt]')?.value || '').replace(/,/g, '')) || 0;
  const roi = Number(calcPanel.querySelector('[data-cal-input=roi]')?.value) || 0;
  const tenure = Number(calcPanel.querySelector('[data-cal-input=tenure]')?.value) || 0;

  if (loanAmt === 0 || tenure === 0) return;

  // Calculate EMI
  const emi = calculatePMT(loanAmt, roi, tenure);
  const totalInterest = (emi * tenure * 12) - loanAmt;
  const totalPayment = loanAmt + totalInterest;

  // Update result elements
  const totalPaymentEl = calcPanel.querySelector('[data-cal-result=principalAmt]');
  const emiEl = calcPanel.querySelector('[data-cal-result=interestAmt]');
  const resultEl = calcPanel.querySelector('[data-cal-result=resultAmt]');

  if (totalPaymentEl) totalPaymentEl.textContent = currenyCommaSeperation(totalPayment);
  if (emiEl) emiEl.textContent = currenyCommaSeperation(emi);
  if (resultEl) resultEl.textContent = `₹${currenyCommaSeperation(emi)}/-`;

  // Update the three output metrics if they exist
  // amount-1: Net Effective ROI (same as input ROI for base calculation)
  // amount-2: Interest Savings (0 for base, calculated with part payments)
  // amount-3: Tenure Reduction (0 months for base, calculated with part payments)
  const roiOutput = calcPanel.querySelector('.amount-1');
  const savingsOutput = calcPanel.querySelector('.amount-2');
  const tenureOutput = calcPanel.querySelector('.amount-3');

  if (roiOutput) roiOutput.textContent = `${roi.toFixed(2)}%`;
  if (savingsOutput) savingsOutput.textContent = currenyCommaSeperation(0);
  if (tenureOutput) tenureOutput.textContent = '0 Months';
}

/* ── Event wiring ────────────────────────────── */

function wireExistingCalculationEvents(section) {
  if (section.dataset.calcEventsWired) return;
  section.dataset.calcEventsWired = 'true';

  // Recalculate on change (text inputs + radio selection change)
  section.addEventListener('change', ({ target }) => {
    if (target.tagName !== 'INPUT') return;

    // Check if this is a radio input (FOIR selection change)
    // calculator-radio.js dispatches change event when radio is clicked
    if (target.type === 'radio' && target.dataset.calFoir) {
      const visible = getVisibleCalculator(section);
      if (visible) runSingleCalculation(section, visible);
      return;
    }

    // Regular calculator input
    const calcPanel = target.closest('.commoncalculator');
    if (calcPanel) runSingleCalculation(section, calcPanel);
  });

  // NOTE: Radio tab click handlers are in calculator-radio.js
  // DO NOT add duplicate click handlers here

  // EMI/Eligibility tab switching (headTabs)
  const headTabs = section.querySelectorAll('.headul .tab-common');
  headTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      requestAnimationFrame(() => {
        const visible = getVisibleCalculator(section);
        if (visible) runSingleCalculation(section, visible);
      });
    });
  });
}

function getVisibleCalculator(section) {
  const calctabs = section.querySelector('.calctabs');
  if (!calctabs) return null;
  const all = [...calctabs.children];
  return all.find((el) => el.style.display !== 'none' && !el.hidden) || all[0];
}

function runInitialCalculation(section) {
  const calctabs = section.querySelector('.calctabs');
  if (!calctabs) return;
  [...calctabs.querySelectorAll('.commoncalculator')].forEach((panel) => {
    runSingleCalculation(section, panel);
  });
}

export default async function decorate(block) {
  const section = block.closest('.section.calculator-container') || block.closest('.section');
  if (section) combineSection(section);

  const blockIndex = block.dataset.resetId?.replace('calid-', '') || '0';

  // Read product type from <p>[0], calculator name from <p>[1] of first row
  const firstRowChildren = block.children[0]?.children[0]?.children;
  const calcName = (firstRowChildren?.[1]?.textContent?.trim() || '').toLowerCase();
  const isEligibility = calcName.includes('eligibility');
  const isPartPayment = calcName.includes('partpayment');
  const sliderPrefix = `c${blockIndex}s`;

  const parentEmi = document.createElement('div');
  parentEmi.classList.add('parent-emi');
  if (isEligibility) parentEmi.classList.add('parent-eligibility');
  parentEmi.id = `emic-${blockIndex}`;

  const inputDiv = document.createElement('div');
  inputDiv.classList.add('inputDiv');
  const outputDiv = document.createElement('div');
  outputDiv.classList.add('outputdiv');

  const firstRow = firstRowChildren;
  // Find elements robustly - empty fields don't create DOM elements, so we can't rely on fixed indices
  // Convert to array for easier manipulation
  const firstRowArray = Array.from(firstRow || []);
  
  // For Part Payment Calculator, find multiple images and their labels
  // Structure: productType, calcName, tabLabel, description, output1Image, output1Label, output2Image, output2Label, output3Image, output3Label, ...
  let partPaymentImages = [];
  let partPaymentLabels = [];
  
  if (isPartPayment) {
    // Collect all images and text elements for Part Payment
    let currentImages = [];
    let currentTexts = [];
    
    firstRowArray.forEach((el, idx) => {
      // Skip first 2 elements (productType, calcName)
      if (idx < 2) return;
      
      const img = el.querySelector?.('img') || el.querySelector?.('picture img') || (el.tagName === 'IMG' ? el : null);
      if (img) {
        currentImages.push(img.src || '');
      } else if (el.textContent?.trim()) {
        currentTexts.push(el.textContent.trim());
      }
    });
    
    partPaymentImages = currentImages;
    partPaymentLabels = currentTexts;
  }
  
  // Find the first image element (contains picture or img) - for non-Part Payment calculators
  let imgEl = null;
  let imageIndex = -1;
  for (let i = 0; i < firstRowArray.length; i++) {
    const el = firstRowArray[i];
    const img = el.querySelector?.('img') || (el.tagName === 'IMG' ? el : null);
    if (img) {
      imgEl = img;
      imageIndex = i;
      break;
    }
  }
  const imgSrc = imgEl?.src || '';
  
  // Text elements after the image: imageAlt, imageLabel, principalLabel, interestLabel
  // Get text elements that come after the image (or all text elements if no image)
  const textElementsAfterImage = imageIndex >= 0 
    ? firstRowArray.slice(imageIndex + 1).filter(el => el.textContent?.trim())
    : firstRowArray.slice(2).filter(el => el.textContent?.trim() && !el.querySelector('img')); // Skip productType[0], calcName[1]
  
  // Order: imageAlt[0], imageLabel[1], principalLabel[2], interestLabel[3]
  const imageAlt = textElementsAfterImage[0]?.textContent?.trim() || 'Calculator';
  const imageLabel = textElementsAfterImage[1]?.textContent?.trim() || '';
  const principalLabel = textElementsAfterImage[2]?.textContent?.trim() || '';
  const interestLabel = textElementsAfterImage[3]?.textContent?.trim() || '';
  const hasAmountBreakdown = principalLabel || interestLabel;

  // Build slider rows from remaining children (skip radio item rows)
  let sliderIndex = 0;
  Array.from(block.children).slice(1).forEach((r) => {
    // Skip rows marked as radio items
    if (r.dataset.radioItem === 'true') return;

    const columns = r.children[0]?.children;
    if (!columns || columns.length < 3) return; // Skip malformed rows

    const sliderId = `${sliderPrefix}${sliderIndex + 1}`;
    const inputId = `calcemi-${blockIndex}-${sliderIndex}`;

    // columns[0] = authored input name → map to correct data-cal-input
    const authoredName = columns[0]?.textContent.trim() || '';
    const calInput = mapInputName(authoredName);

    // columns[2] = default value
    const defaultValue = columns[2]?.textContent.trim() || '0';
    // Format default value for display (Indian number format for currency)
    const isRoi = calInput === 'roi';
    const formattedDefault = isRoi ? defaultValue : currenyCommaSeperation(Number(defaultValue) || 0);

    // columns[3] = authored icon (₹, $, %, Years, etc.)
    const iconText = columns[3]?.textContent.trim() || '';
    const isPrefix = CURRENCY_SYMBOLS.includes(iconText);
    const prefixText = isPrefix ? iconText : '';
    const suffixText = isPrefix ? '' : iconText;
    const isYearsText = !isPrefix;

    // Calculate initial slider fill percentage
    const minVal = Number(columns[5]?.textContent.trim()) || 0;
    const maxVal = Number(columns[6]?.textContent.trim()) || 100;
    const defVal = Number(defaultValue) || 0;
    const fillPercent = ((defVal - minVal) / (maxVal - minVal)) * 100;

    const dom = `
      <div class="loanamount">
        <div class="data">
          <label class="description">${columns[1]?.textContent.trim() || ''}</label>
          <div class="inputdivs ${isYearsText ? 'yearstext' : ''}">
            <span class="rupee">${prefixText}</span>
            <label for="${inputId}" aria-label="calculateemi" class="sr-only"></label>
            <input type="text" class="inputvalue slider-value" value="${formattedDefault}" id="${inputId}" data-slider="${sliderId}" data-cal-input="${calInput}">
            <span class="textvalue">${suffixText}</span>
          </div>
        </div>
        <div class="rangediv">
          <label for="${sliderId}" aria-label="calculateemi" class="sr-only"></label>
          <input type="range" min="${columns[5]?.textContent.trim() || ''}" step="${columns[4]?.textContent.trim() || ''}" max="${columns[6]?.textContent.trim() || ''}" value="${defaultValue}" id="${sliderId}" data-cal-input="${calInput}" class="range-slider__range" style="background: linear-gradient(90deg, rgb(218, 77, 52) ${fillPercent}%, rgb(219, 215, 216) ${fillPercent}%);">
          <div class="values">
            <span class="text">${columns[7]?.textContent.trim() || ''}</span>
            <span class="text">${columns[8]?.textContent.trim() || ''}</span>
          </div>
        </div>
      </div>
    `;
    inputDiv.innerHTML += dom;
    sliderIndex += 1;
  });

  // Build output image HTML only if image exists - use authored alt text
  const outputImgHTML = imgSrc
    ? `<img data-src="${imgSrc}" class="outputimg lozad" alt="${imageAlt}" src="${imgSrc}" data-loaded="true">
        <img data-src="${imgSrc}" class="outputimg2 lozad" alt="${imageAlt}" src="${imgSrc}" data-loaded="true">`
    : '';

  // Part Payment Calculator has special three-metric output layout
  if (isPartPayment) {
    // Part Payment field extraction from authored content
    // Container structure in component-models.json (sibling containers, text flattens in order):
    //   Output 1 Container: [2] output1ImageAlt, [3] output1Label
    //   Output 2 Container: [4] output2ImageAlt, [5] output2Label
    //   Output 3 Container: [6] output3ImageAlt, [7] output3Label
    //   Summary Labels Container: [8] totalPaymentsLabel, [9] emiLabel
    //   First Loan Date Container: [10] firstLoanDateLabel, [11] datePlaceholder, [12] datePickerIconAlt
    //   Repayment Schedule Container: [13] repaymentScheduleTitle, [14] clearAllText
    //   Part Payment Card Container: [15] partPaymentDateLabel, [16] partPaymentAmountLabel,
    //       [17] partPaymentMinValue, [18] partPaymentMaxValue, [19] partPaymentMaxLabel
    //   Add More Container: [20] addMoreIconAlt, [21] addMoreText
    // Images: [0] output1, [1] output2, [2] output3, [3] datePickerIcon, [4] addMoreIcon
    
    const output1Img = partPaymentImages[0] || '';
    const output2Img = partPaymentImages[1] || '';
    const output3Img = partPaymentImages[2] || '';
    const datePickerIcon = partPaymentImages[3] || '';
    const addMoreIcon = partPaymentImages[4] || '';
    
    const output1Alt = partPaymentLabels[2] || 'ROI Icon';
    const metric1Label = partPaymentLabels[3] || 'Net Effective ROI';
    const output2Alt = partPaymentLabels[4] || 'Savings Icon';
    const metric2Label = partPaymentLabels[5] || 'You will save Interest of';
    const output3Alt = partPaymentLabels[6] || 'Calendar Icon';
    const metric3Label = partPaymentLabels[7] || 'Reduction in Tenure by';
    const totalPaymentsLabel = partPaymentLabels[8] || 'Total Payments';
    const emiLabelText = partPaymentLabels[9] || 'EMI';
    
    // First Loan EMI Date settings
    const firstLoanDateLabel = partPaymentLabels[10] || 'First Loan EMI Date';
    const datePlaceholder = partPaymentLabels[11] || 'MM/DD/YYYY';
    const datePickerIconAlt = partPaymentLabels[12] || 'Calendar';
    
    // Repayment Schedule settings
    const repaymentScheduleTitle = partPaymentLabels[13] || 'Repayment Schedule';
    const clearAllText = partPaymentLabels[14] || 'Clear All';
    
    // Part Payment Card (sibling container)
    const partPaymentDateLabel = partPaymentLabels[15] || 'Enter 1st part payment Date';
    const partPaymentAmountLabel = partPaymentLabels[16] || '1st Part Payment amount (Rs.)';
    const partPaymentMinValue = partPaymentLabels[17] || '0';
    const partPaymentMaxValue = partPaymentLabels[18] || '2000000';
    const partPaymentMaxLabel = partPaymentLabels[19] || '20L';
    
    // Add More button
    const addMoreIconAlt = partPaymentLabels[20] || 'Add';
    const addMoreText = partPaymentLabels[21] || 'Add More Part Payment';
    
    // Add Part Payment Section to inputDiv (CSS expects it here)
    inputDiv.innerHTML += `
      <div class="partpaymentSection">
        <div class="loanamount partPayment">
          <div class="data">
            <label class="description">${firstLoanDateLabel}</label>
            <div class="inputdivs">
              <input type="text" class="inputvalue" placeholder="${datePlaceholder}" id="firstLoan" readonly>
              ${datePickerIcon ? `<img data-src="${datePickerIcon}" src="${datePickerIcon}" alt="${datePickerIconAlt}" class="lozad">` : `<img src="/icons/calendar.svg" alt="calendar">`}
            </div>
          </div>
        </div>
        <div class="paymentInputContainer">
          <div class="loanamount clearAll">
            <div class="data">
              <label class="description">${repaymentScheduleTitle}</label>
              <div class="clearAllText">${clearAllText}</div>
            </div>
          </div>
          <div class="boxCont" data-date="scds">
            <div class="loanamount partPayment partpaymentCardContainer" id="partpaymentCardContainer1">
              <div class="data">
                <label class="description">${partPaymentDateLabel}</label>
                <div class="inputdivs dt">
                  <input type="text" class="inputvalue" placeholder="${datePlaceholder}" readonly id="partpayment1" disabled>
                  ${datePickerIcon ? `<img data-src="${datePickerIcon}" src="${datePickerIcon}" alt="${datePickerIconAlt}" class="lozad">` : `<img src="/icons/calendar.svg" alt="calendar">`}
                </div>
              </div>
              <div class="loanamount">
                <div class="data">
                  <label class="description">${partPaymentAmountLabel}</label>
                  <div class="inputdivs">
                    <span class="rupee">₹</span>
                    <input type="text" class="inputvalue slider-value" value="0" data-slider="partPayment1">
                    <span class="textvalue"></span>
                  </div>
                </div>
                <div class="rangediv">
                  <input type="range" min="${partPaymentMinValue}" step="10000" max="${partPaymentMaxValue}" value="0" id="partPayment1" class="range-slider__range" style="background: linear-gradient(90deg, rgb(218, 77, 52) 0%, rgb(219, 215, 216) 0%);">
                  <div class="values">
                    <span class="text">${partPaymentMinValue}</span>
                    <span class="text">${partPaymentMaxLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="add-more-part-payment-btn disabled">
          ${addMoreIcon ? `<img data-src="${addMoreIcon}" src="${addMoreIcon}" alt="${addMoreIconAlt}" class="lozad">` : `<img src="/icons/plus-orange.svg" alt="add">`}
          <span class="addMorePartPayment">${addMoreText}</span>
        </div>
      </div>
    `;
    
    // Output section with three metrics only (partpaymentSection is in inputDiv)
    outputDiv.innerHTML = `
      <div class="output-parent">
        <div class="mainoutput partPaymentMainOutPut">
          <div class="parpaymentmainoutputcontainer">
            <div class="text-and-img">
              ${output1Img ? `<img data-src="${output1Img}" class="outputimg lozad" alt="${output1Alt}" src="${output1Img}" data-loaded="true">` : ''}
              <div class="amountContainer">
                <p class="outputdes desc-1">${metric1Label}</p>
                <div class="outputans" data-cal-result="resultAmt"><span class="outputans"></span><span class="amount-1">0%</span></div>
              </div>
            </div>
          </div>
          <div class="parpaymentmainoutputcontainer">
            <div class="text-and-img">
              ${output2Img ? `<img data-src="${output2Img}" class="outputimg lozad" alt="${output2Alt}" src="${output2Img}" data-loaded="true">` : ''}
              <div class="amountContainer">
                <p class="outputdes desc-2">${metric2Label}</p>
                <div class="outputans" data-cal-result="resultAmt"><span class="outputans">₹</span><span class="amount-2">0</span></div>
              </div>
            </div>
          </div>
          <div class="parpaymentmainoutputcontainer">
            <div class="text-and-img">
              ${output3Img ? `<img data-src="${output3Img}" class="outputimg lozad" alt="${output3Alt}" src="${output3Img}" data-loaded="true">` : ''}
              <div class="amountContainer">
                <p class="outputdes desc-3">${metric3Label}</p>
                <div class="outputans" data-cal-result="resultAmt"><span class="outputans"></span><span class="amount-3">0 Months</span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="amountdiv">
          <div class="firstamout">
            <p>${totalPaymentsLabel}</p>
            <p class="amount"><span>₹</span><span data-cal-result="principalAmt">0</span></p>
          </div>
          <div class="secondamount firstamout">
            <p>${emiLabelText}</p>
            <p class="amount"><span>₹</span><span data-cal-result="interestAmt">0</span></p>
          </div>
        </div>
      </div>
    `;
  } else {
    // Standard EMI/Eligibility/GST/APR output layout
    // imageLabel shows above EMI result (e.g. "Your home loan EMI is a")
    outputDiv.innerHTML = `
      <div class="output-parent">
        <div class="mainoutput">
          ${outputImgHTML}
          <p class="outputdes">
            ${imageLabel}
          </p>
          <div class="outputans" data-cal-result="resultAmt">₹0/-</div>
        </div>
        ${hasAmountBreakdown ? `<div class="amountdiv">
          <div class="firstamout">
            <p>${principalLabel}</p>
            <p class="amount"><span>₹</span><span data-cal-result="principalAmt">0</span></p>
          </div>
          <div class="secondamount firstamout">
            <p>${interestLabel}</p>
            <p class="amount"><span>₹</span><span data-cal-result="interestAmt">0</span></p>
          </div>
        </div>` : ''}
      </div>
    `;
  }

  // Hide original authored children instead of removing them
  // so the Universal Editor can still track and edit them
  [...block.children].forEach((child) => {
    child.style.display = 'none';
    child.classList.add('author-source');
  });

  parentEmi.appendChild(inputDiv);
  parentEmi.appendChild(outputDiv);
  block.appendChild(parentEmi);

  // Initialize Part Payment date picker if this is a Part Payment Calculator
  if (isPartPayment) {
    // Reset the initialized flag for this new instance
    partPaymentDatePickerInitialized = false;
    partPaymentCount = 2;
    
    // Use setTimeout to ensure DOM is fully rendered, then await the async initialization
    setTimeout(async () => {
      try {
        await initPartPaymentDatePicker(block);
      } catch (err) {
        console.error('[calculator] Part Payment init error:', err);
      }
    }, 200);
  }

  if (section) initSection(section);
}
