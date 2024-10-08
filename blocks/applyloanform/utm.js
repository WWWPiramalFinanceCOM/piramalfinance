import { loanFormUTM } from './loanutm.js';

export function loanTypeDropdownSelect() {
  const loanTypeInput = document.querySelector('#form-loan-type');
  const loanTypeDrpParent = document.querySelector('.loan-form-drpdown');
  if (loanTypeDrpParent) {
    const loanOption = loanTypeDrpParent.querySelectorAll('.subpoints');
    const redirectionLonTypes = ['loan less than 5 lacs'];
    loanOption.forEach((option) => {
      option.addEventListener('click', () => {
        const optionTxt = option.textContent.trim();
        loanTypeInput.value = optionTxt;
        if (redirectionLonTypes.includes(optionTxt.toLocaleLowerCase())) {
          loanFormUTM();
        }
      });
    });
  }
}
