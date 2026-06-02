import { loanFormUTM } from './loanutm.js';

export function loanTypeDropdownSelect(container = document) {
  const root = container && typeof container.querySelector === 'function' ? container : document;
  const loanTypeDrpParent = root.querySelector('.loan-form-drpdown');
  if (loanTypeDrpParent) {
    const loanOption = loanTypeDrpParent.querySelectorAll('.subpoints');
    const redirectionLonTypes = ['loan less than 1 lacs'];
    loanOption.forEach((option) => {
      if (option.dataset.loanTypeListenerAttached === 'true') {
        return;
      }
      option.dataset.loanTypeListenerAttached = 'true';
      option.addEventListener('click', () => {
        const loanTypeInput = root.querySelector('#form-loan-type') || document.querySelector('#form-loan-type');
        if (!loanTypeInput) {
          return;
        }
        const optionTxt = option.textContent.trim();
        loanTypeInput.value = optionTxt;
        if (redirectionLonTypes.includes(optionTxt.toLocaleLowerCase())) {
          const checkURLText = {
            'loan less than 1 lacs': 'less-than-1lacs',
          };
          const makewebFormURL = checkURLText[optionTxt.toLocaleLowerCase()];
          loanFormUTM(makewebFormURL);
        }
      });
    });
  }
}


