export function getCalculatorInput(calculator, calType) {
  if (calculator == null) return;

  const incomeValue = calculator.querySelector('[data-cal-input=income]')?.value.replaceAll(',', '');
  const isBusinessTabActive = calculator.closest('.homeloancalculator').querySelector('.tab-eligibility-calc.active');
  const loanType = calculator.closest('.homeloancalculator').querySelector('[data-cal-foir]:checked').dataset.calFoir;
  let getIncome = loanType == 'biz' && !isBusinessTabActive ? incomeValue / 12 : incomeValue;

  const isCombineEmiEligibility = calculator.closest('.homeloancalculator').querySelector('.combined-emi-eligibility');
  if (isCombineEmiEligibility) {
    getIncome = loanType == 'biz' ? incomeValue / 12 : incomeValue;
  }

  const obj = {};
  obj.income = getIncome;
  obj.otherLoan = calculator.querySelector('[data-cal-input=otherloan]')?.value.replaceAll(',', '');
  obj.loanAmt = calculator.querySelector('[data-cal-input=loanamt]')?.value.replaceAll(',', '');
  obj.roi = calculator.querySelector('[data-cal-input=roi]')?.value;
  obj.tenure = calculator.querySelector('[data-cal-input=tenure]')?.value;
  obj.foir = calculator.closest('.homeloancalculator').querySelector('[data-cal-foir]:checked')?.value;
  if (!isCombineEmiEligibility && isBusinessTabActive && loanType == 'biz') obj.foir = 50;
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
