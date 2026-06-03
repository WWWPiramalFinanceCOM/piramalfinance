export function getCalculatorInput(calculator, calType) {
  if (calculator == null) return null;

  const section = calculator.closest('.homeloancalculator');
  if (!section) return null;

  // Get checked radio - try :checked first, then fall back to first radio
  let checkedRadio = section.querySelector('[data-cal-foir]:checked');
  if (!checkedRadio) {
    // Fallback: get first radio and ensure it's checked
    checkedRadio = section.querySelector('[data-cal-foir]');
    if (checkedRadio) {
      checkedRadio.checked = true;
    }
  }
  if (!checkedRadio) return null;

  // Parse income value as number
  const incomeStr = calculator.querySelector('[data-cal-input=income]')?.value || '0';
  const incomeValue = Number(incomeStr.replace(/,/g, '')) || 0;

  const isBusinessTabActive = section.querySelector('.tab-eligibility-calc.active');
  const loanType = checkedRadio.dataset.calFoir || 'salaried';
  let getIncome = loanType === 'biz' && !isBusinessTabActive ? incomeValue / 12 : incomeValue;

  const isCombineEmiEligibility = section.querySelector('.combined-emi-eligibility');
  if (isCombineEmiEligibility) {
    getIncome = loanType === 'biz' ? incomeValue / 12 : incomeValue;
  }

  // Parse all values as numbers
  const otherLoanStr = calculator.querySelector('[data-cal-input=otherloan]')?.value || '0';
  const loanAmtStr = calculator.querySelector('[data-cal-input=loanamt]')?.value || '0';
  const roiStr = calculator.querySelector('[data-cal-input=roi]')?.value || '0';
  const tenureStr = calculator.querySelector('[data-cal-input=tenure]')?.value || '0';

  const obj = {};
  obj.income = getIncome;
  obj.otherLoan = Number(otherLoanStr.replace(/,/g, '')) || 0;
  obj.loanAmt = Number(loanAmtStr.replace(/,/g, '')) || 0;
  obj.roi = Number(roiStr) || 0;
  obj.tenure = Number(tenureStr) || 0;
  obj.foir = Number(checkedRadio.value) || 65;
  if (!isCombineEmiEligibility && isBusinessTabActive && loanType === 'biz') obj.foir = 50;
  obj.calType = calType;

  changeLoanAmtLabel(calculator, calType, loanType);
  return obj;
}

let previousLoanAmtLabel;
function changeLoanAmtLabel(calculator, calType, loanType) {
  const incomeInput = calculator.querySelector('[data-cal-input=income]');
  if (incomeInput == null) return;

  const loanAmtLabel = incomeInput.closest('.loanamount').querySelector('label');

  if (loanAmtLabel && loanType) {
    if (previousLoanAmtLabel == null) { previousLoanAmtLabel = loanAmtLabel.textContent.trim(); }
    if (calType == 'eligibility' && loanType == 'biz') {
      loanAmtLabel.textContent = ' Gross Annual Income (Rs.)';
    } else if (calType == 'eligibility' && loanType == 'salaried') {
      loanAmtLabel.textContent = previousLoanAmtLabel;
    }
  }
}
