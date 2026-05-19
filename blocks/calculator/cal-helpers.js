/**
 * Calculator Helpers - Standalone calculation functions
 * NO dependencies on old calculator blocks (aprcalculator, emiandeligiblitycalc, etc.)
 * Performance optimized with minimal DOM queries
 */

// ================== NUMBER FORMATTING ==================

/**
 * Format number with Indian comma separation (e.g., 12,34,567)
 * @param {number|string} value - Value to format
 * @returns {string} Formatted number string
 */
export function formatIndianNumber(value) {
  const num = parseFloat(String(value).replace(/,/g, '')) || 0;
  return num.toLocaleString('en-IN');
}

/**
 * Parse formatted number string to number
 * @param {string} value - Formatted string
 * @returns {number} Parsed number
 */
export function parseNumber(value) {
  return parseFloat(String(value).replace(/,/g, '')) || 0;
}

// ================== EMI CALCULATION ==================

/**
 * Calculate EMI using standard formula
 * EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} tenureYears - Loan tenure in years
 * @returns {object} { emi, totalInterest, totalPayment }
 */
export function calculateEMI(principal, annualRate, tenureYears) {
  const P = principal;
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;

  if (monthlyRate === 0 || months === 0 || P === 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0 };
  }

  const factor = (1 + monthlyRate) ** months;
  const emi = Math.round((P * monthlyRate * factor) / (factor - 1));
  const totalPayment = emi * months;
  const totalInterest = totalPayment - P;

  return {
    emi,
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    principalAmt: P,
    interestAmt: Math.round(totalInterest),
    result: emi,
  };
}

/**
 * Calculate loan eligibility based on income
 * @param {number} income - Monthly income
 * @param {number} otherLoan - Existing EMI obligations
 * @param {number} foir - Fixed Obligation to Income Ratio (%)
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} tenureYears - Loan tenure in years
 * @param {string} productType - 'hl' for home loan, 'bl' for business loan
 * @returns {object} { eligibleAmount }
 */
export function calculateEligibility(income, otherLoan, foir, annualRate, tenureYears, productType = 'hl') {
  const applicableFoir = foir / 100;
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;

  // Calculate eligible EMI based on product type
  let eligibleEMI;
  if (productType === 'hl') {
    // Home Loan: income * FOIR - other loan EMI
    eligibleEMI = income * applicableFoir - otherLoan;
  } else {
    // Business Loan: (income - other loan) * FOIR
    eligibleEMI = (income - otherLoan) * applicableFoir;
  }

  if (eligibleEMI <= 0 || monthlyRate === 0 || months === 0) {
    return { result: 0 };
  }

  // Calculate eligible loan amount from EMI
  // Formula: E * ((1 - (1 / (1 + R)^n)) / R)
  const eligibleAmount = Math.round(
    eligibleEMI * (1 - (1 / ((1 + monthlyRate) ** months))) / monthlyRate,
  );

  return { result: eligibleAmount };
}

// ================== APR CALCULATION ==================

/**
 * Calculate Annual Percentage Rate (APR) using Newton's method
 * @param {number} loanAmount - Loan amount
 * @param {number} loanOrigination - Origination/processing fees
 * @param {number} interestRate - Annual interest rate (%)
 * @param {number} tenureMonths - Loan tenure in months
 * @returns {string} APR percentage with 2 decimal places
 */
export function calculateAPR(loanAmount, loanOrigination, interestRate, tenureMonths) {
  const present = loanAmount - loanOrigination;
  const guess = 0.01;
  const future = 0;
  const type = 0;
  const ROI = interestRate / 100;
  const rateI = ROI / 12;
  const fv = 0;
  const pvif = (1 + rateI) ** tenureMonths;
  const pmt = (rateI / (pvif - 1)) * -(loanAmount * pvif + fv);
  const payment = pmt;

  const epsMax = 1e-10;
  const iterMax = 10;

  let y;
  let y0;
  let y1;
  let x0;
  let x1 = 0;
  let f = 0;
  let i = 0;
  let rate = guess;

  if (Math.abs(rate) < epsMax) {
    y = present * (1 + tenureMonths * rate) + payment * (1 + rate * type) * tenureMonths + future;
  } else {
    f = Math.exp(tenureMonths * Math.log(1 + rate));
    y = present * f + payment * (1 / rate + type) * (f - 1) + future;
  }

  y0 = present + payment * tenureMonths + future;
  y1 = present * f + payment * (1 / rate + type) * (f - 1) + future;
  i = x0 = 0;
  x1 = rate;

  while (Math.abs(y0 - y1) > epsMax && i < iterMax) {
    rate = (y1 * x0 - y0 * x1) / (y1 - y0);
    x0 = x1;
    x1 = rate;
    if (Math.abs(rate) < epsMax) {
      y = present * (1 + tenureMonths * rate) + payment * (1 + rate * type) * tenureMonths + future;
    } else {
      f = Math.exp(tenureMonths * Math.log(1 + rate));
      y = present * f + payment * (1 / rate + type) * (f - 1) + future;
    }
    y0 = y1;
    y1 = y;
    ++i;
  }

  const rate1 = rate * 100;
  let apr = rate1 * 12;
  apr = Number.isNaN(apr) ? 0 : apr;

  return apr.toFixed(2);
}

// ================== PART PAYMENT CALCULATION ==================

/**
 * Calculate PMT (monthly payment)
 * @param {number} principal - Loan principal
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} tenureYears - Tenure in years
 * @returns {number} Monthly payment
 */
function calculatePMT(principal, annualRate, tenureYears) {
  const monthlyRate = annualRate / 100;
  const months = tenureYears * 12;
  const pmt = (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
  return Math.round(pmt);
}

/**
 * Calculate effective interest rate
 * @param {number} months - Number of months
 * @param {number} pmt - Monthly payment (negative)
 * @param {number} pv - Present value
 * @param {number} fv - Future value
 * @param {number} type - Payment type
 * @param {number} guess - Initial guess
 * @returns {number} Effective interest rate
 */
function calculateEffectiveRate(months, pmt, pv, fv = 0, type = 0, guess = 0.1) {
  const epsMax = 1e-10;
  const iterMax = 100;

  let rate = guess;
  for (let i = 0; i < iterMax; i++) {
    const f = (1 + rate) ** months;
    const y = pv * f + pmt * (1 / rate + type) * (f - 1) + fv;

    const df = months * (1 + rate) ** (months - 1);
    const dy = pv * df
      + pmt * ((-1 / (rate * rate)) * (f - 1) + (1 / rate + type) * df);

    const newRate = rate - y / dy;
    if (Math.abs(newRate - rate) < epsMax) {
      return newRate;
    }
    rate = newRate;
  }
  return rate;
}

/**
 * Calculate EIR (Effective Interest Rate)
 */
function calculateEIR(LT, EMIValue, totalSavings, LA) {
  if (EMIValue > 0 && LA > 0) {
    const effInt = calculateEffectiveRate(LT * 12, -EMIValue, +LA + totalSavings, 0, 0, 0.1);
    return (effInt * 1200).toFixed(2);
  }
  return 0;
}

/**
 * Display part payment results in DOM elements
 */
function displayPartPaymentResults(emi, effInt, totalSavings, monthCounter, totalPayment) {
  const principalEl = document.querySelector('[data-cal-result=principalAmt]');
  const interestEl = document.querySelector('[data-cal-result=interestAmt]');
  const amount1El = document.querySelector('.amount-1');
  const amount2El = document.querySelector('.amount-2');
  const amount3El = document.querySelector('.amount-3');

  if (principalEl) principalEl.innerText = formatIndianNumber(totalPayment || 0);
  if (interestEl) interestEl.innerText = formatIndianNumber(emi);
  if (amount1El) amount1El.innerText = `${Number(effInt).toFixed(2)}%`;
  if (amount2El) amount2El.innerText = formatIndianNumber(totalSavings);
  if (amount3El) amount3El.innerText = `${monthCounter} Months`;
}

/**
 * Update Part Payment Calculator - matches original function signature and behavior
 * Updates DOM elements directly like the original partpaymentlogic.js
 * @param {number} rateIn - Annual interest rate (%)
 * @param {string} principalOutstanding - Principal amount (formatted string)
 * @param {number} LT - Loan tenure in years
 * @param {Array} partPayments - Array of {monthDifference, partPayAmount}
 */
export function updatePartPayment(rateIn, principalOutstanding, LT, partPayments) {
  const unchangedPrincipalAmount = parseNumber(principalOutstanding);
  const rate = rateIn / 12;
  let monthCounter = 1;
  let interestAmtSum = 0;

  let principal = unchangedPrincipalAmount;
  const tenure = LT;
  const EMIValue = calculatePMT(principal, rateIn, tenure);

  if (!partPayments || partPayments.length === 0) {
    const interest = EMIValue * tenure * 12 - unchangedPrincipalAmount;
    const totalPayment = interest + unchangedPrincipalAmount;
    displayPartPaymentResults(EMIValue, rateIn, 0, 0, totalPayment);
    return;
  }

  for (let i = 0; i <= tenure * 12 - 1; i++) {
    let periodicPartPayment = 0;
    for (let p = 0; p < partPayments.length; p++) {
      if (partPayments[p].monthDifference === i + 1) {
        periodicPartPayment = parseNumber(partPayments[p].partPayAmount);
      }
    }
    const monthlyInterest = Math.round((rate / 100) * principal);
    const monthlyPrincipal = +EMIValue - +monthlyInterest + +periodicPartPayment;
    principal -= monthlyPrincipal;

    if (principal >= 0) {
      monthCounter += 1;
      interestAmtSum += monthlyInterest;
    }
  }

  const reductionInTenure = tenure * 12 - monthCounter;
  const totalInterest = EMIValue * 12 * tenure - unchangedPrincipalAmount;
  const totalSavings = totalInterest - interestAmtSum;
  const effInt = calculateEIR(tenure, EMIValue, totalSavings, unchangedPrincipalAmount);
  const totalPayment = interestAmtSum + unchangedPrincipalAmount;

  displayPartPaymentResults(EMIValue, effInt, totalSavings, reductionInTenure, totalPayment);
}

/**
 * Calculate part payment impact (pure function - returns values without DOM updates)
 * @param {number} annualRate - Annual interest rate (%)
 * @param {string} principalOutstanding - Principal amount (formatted)
 * @param {number} tenureYears - Tenure in years
 * @param {Array} partPayments - Array of {monthDifference, partPayAmount}
 * @returns {object} Part payment calculation results
 */
export function calculatePartPayment(annualRate, principalOutstanding, tenureYears, partPayments) {
  const principal = parseNumber(principalOutstanding);
  const rate = annualRate / 12;
  const emi = calculatePMT(principal, annualRate, tenureYears);

  if (!partPayments || partPayments.length === 0) {
    const totalInterest = emi * tenureYears * 12 - principal;
    const totalPayment = totalInterest + principal;
    return {
      emi,
      effectiveRate: annualRate,
      totalSavings: 0,
      tenureReduction: 0,
      totalPayment,
    };
  }

  let remainingPrincipal = principal;
  let monthCounter = 1;
  let totalInterestPaid = 0;

  for (let i = 0; i < tenureYears * 12; i++) {
    let periodicPartPayment = 0;
    for (const pp of partPayments) {
      if (pp.monthDifference === i + 1) {
        periodicPartPayment = parseNumber(pp.partPayAmount);
      }
    }

    const monthlyInterest = Math.round((rate / 100) * remainingPrincipal);
    const monthlyPrincipal = emi - monthlyInterest + periodicPartPayment;
    remainingPrincipal -= monthlyPrincipal;

    if (remainingPrincipal >= 0) {
      monthCounter++;
      totalInterestPaid += monthlyInterest;
    }
  }

  const tenureReduction = tenureYears * 12 - monthCounter;
  const originalInterest = emi * tenureYears * 12 - principal;
  const totalSavings = originalInterest - totalInterestPaid;

  // Calculate effective interest rate
  const effectiveRate = (calculateEffectiveRate(
    tenureYears * 12,
    -emi,
    principal + totalSavings,
    0,
    0,
    0.1,
  ) * 1200).toFixed(2);

  const totalPayment = totalInterestPaid + principal;

  return {
    emi,
    effectiveRate: parseFloat(effectiveRate),
    totalSavings: Math.round(totalSavings),
    tenureReduction,
    totalPayment: Math.round(totalPayment),
  };
}

// ================== INPUT EXTRACTION ==================

/**
 * Get calculator inputs from DOM elements
 * @param {Element} calculator - Calculator container element
 * @param {string} calType - 'emi' or 'eligibility'
 * @returns {object|null} Calculator input object
 */
export function getCalculatorInput(calculator, calType) {
  if (!calculator) {
    // eslint-disable-next-line no-console
    console.warn('[cal-helpers] getCalculatorInput: No calculator element provided');
    return null;
  }

  const section = calculator.closest('.homeloancalculator');
  if (!section) {
    // eslint-disable-next-line no-console
    console.warn('[cal-helpers] getCalculatorInput: No .homeloancalculator section found');
    return null;
  }

  // Get checked radio - try :checked first, then fall back to first radio
  let checkedRadio = section.querySelector('[data-cal-foir]:checked');
  if (!checkedRadio) {
    checkedRadio = section.querySelector('[data-cal-foir]');
    if (checkedRadio) {
      checkedRadio.checked = true;
    }
  }

  // For EMI calculations, radio is optional - use defaults if not found
  // Only eligibility requires FOIR from radio
  let loanType = 'salaried';
  let foir = 65;
  
  if (checkedRadio) {
    loanType = checkedRadio.dataset.calFoir || 'salaried';
    foir = parseFloat(checkedRadio.value) || 65;
  } else if (calType === 'eligibility') {
    // eslint-disable-next-line no-console
    console.warn('[cal-helpers] getCalculatorInput: No radio found for eligibility calc, using defaults');
  }

  const isBusinessTabActive = section.querySelector('.tab-eligibility-calc.active');
  const isCombineEmiEligibility = section.querySelector('.combined-emi-eligibility');

  // Parse income value
  const incomeStr = calculator.querySelector('[data-cal-input=income]')?.value || '0';
  let income = parseNumber(incomeStr);

  // Adjust income for business type
  if (loanType === 'biz' && !isBusinessTabActive && !isCombineEmiEligibility) {
    income = income / 12;
  } else if (loanType === 'biz' && isCombineEmiEligibility) {
    income = income / 12;
  }

  // Parse other values
  const otherLoan = parseNumber(calculator.querySelector('[data-cal-input=otherloan]')?.value);
  const loanAmt = parseNumber(calculator.querySelector('[data-cal-input=loanamt]')?.value);
  const roi = parseFloat(calculator.querySelector('[data-cal-input=roi]')?.value) || 0;
  const tenure = parseFloat(calculator.querySelector('[data-cal-input=tenure]')?.value) || 0;

  // Adjust FOIR for business tab
  if (!isCombineEmiEligibility && isBusinessTabActive && loanType === 'biz') {
    foir = 50;
  }

  // eslint-disable-next-line no-console
  console.log('[cal-helpers] getCalculatorInput:', {
    calType,
    loanAmt,
    roi,
    tenure,
    income,
    foir,
    loanType,
  });

  return {
    income,
    otherLoan,
    loanAmt,
    roi,
    tenure,
    foir,
    calType,
    loanType,
  };
}

// ================== RENDER RESULTS ==================

/**
 * Render calculation results to DOM
 * @param {Element} parentElement - Parent container
 * @param {object} resultObj - Result object with result, principalAmt, interestAmt
 */
export function renderData(parentElement, resultObj) {
  // eslint-disable-next-line no-console
  console.log('[cal-helpers] renderData called with:', resultObj);

  const resultAmt = parentElement.querySelector('[data-cal-result=resultAmt]');
  const principalAmt = parentElement.querySelector('[data-cal-result=principalAmt]');
  const interestAmt = parentElement.querySelector('[data-cal-result=interestAmt]');

  // eslint-disable-next-line no-console
  console.log('[cal-helpers] renderData: Found elements - resultAmt:', !!resultAmt, 'principalAmt:', !!principalAmt, 'interestAmt:', !!interestAmt);

  if (resultAmt) {
    resultAmt.textContent = `₹${formatIndianNumber(resultObj.result || 0)}/-`;
  }
  if (principalAmt) {
    principalAmt.textContent = formatIndianNumber(resultObj.principalAmt || 0);
  }
  if (interestAmt) {
    interestAmt.textContent = formatIndianNumber(resultObj.interestAmt || 0);
  }
}

// ================== MAIN CALCULATION WORKFLOW ==================

/**
 * Main calculation workflow - runs EMI or eligibility calculation
 * @param {Element} currentCalculator - Calculator container
 * @param {string} calType - 'emi' or 'eligibility'
 */
export function workflowHomeLoanCalculation(currentCalculator, calType) {
  // eslint-disable-next-line no-console
  console.log('[cal-helpers] workflowHomeLoanCalculation called, calType:', calType);
  
  const inputs = getCalculatorInput(currentCalculator, calType);
  if (!inputs) {
    // eslint-disable-next-line no-console
    console.warn('[cal-helpers] workflowHomeLoanCalculation: No inputs found');
    return;
  }

  let result;

  if (calType === 'emi') {
    result = calculateEMI(inputs.loanAmt, inputs.roi, inputs.tenure);
    // eslint-disable-next-line no-console
    console.log('[cal-helpers] EMI calculation result:', result);
  } else {
    // Get product type
    const productTypeEl = document.querySelector('#calculator-product-type');
    const productType = productTypeEl?.value || 'hl';
    result = calculateEligibility(
      inputs.income,
      inputs.otherLoan,
      inputs.foir,
      inputs.roi,
      inputs.tenure,
      productType,
    );
  }

  if (result) {
    renderData(currentCalculator, result);
  }
}

// Alias for backward compatibility
export const CheckAprRate = calculateAPR;
