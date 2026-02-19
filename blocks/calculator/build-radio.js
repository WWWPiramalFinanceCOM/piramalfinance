const TAB_NUM_NAMES = ['one', 'two', 'three', 'four', 'five'];

const FOIR_DEFAULTS = {
  salaried: { foir: 'salaried', value: '65' },
  business: { foir: 'biz', value: '80' },
};

/**
 * Builds the radio tab parent element (Salaried / Business)
 * from authored radio items extracted from default-content-wrapper.
 * @param {Array<{text: string, iconSrc: string}>} radioItems
 * @returns {HTMLElement|null}
 */
export function buildRadioParent(radioItems) {
  if (!radioItems.length) return null;

  const radioParent = document.createElement('div');
  radioParent.className = 'home-loan-calculator-parent combined-emi-eligibility';

  let radioLiHTML = '';
  radioItems.forEach((item, idx) => {
    const key = item.text.replace(/^I'm\s*(doing\s*)?/i, '').trim().toLowerCase();
    const foirData = FOIR_DEFAULTS[key] || { foir: key, value: '65' };
    const liId = `${key}Tab`;
    const inputId = `${key}RadioInput`;
    const isChecked = idx === 0 ? ' checked' : '';
    const activeClass = idx === 0 ? ' active' : '';
    const numClass = TAB_NUM_NAMES[idx] ? `${TAB_NUM_NAMES[idx]}tab` : '';
    const posClasses = idx === 0 ? 'firsttab' : 'firsttab secondtab';
    const parentExtra = idx > 0 ? ' business-parent' : '';
    const inputClass = idx === 0 ? 'input_salary_checkbox' : 'input_business_checkbox';

    radioLiHTML += `
      <li id="${liId}" class="${posClasses} ${numClass}${activeClass}" data-radio-index="${idx}">
        <div class="customecheck">
          <div class="salary-parent${parentExtra}">
            <input type="radio" id="${inputId}" name="employementStatus"
              class="${inputClass}" data-cal-foir="${foirData.foir}" value="${foirData.value}"${isChecked}>
            <label for="${inputId}">${item.text}</label>
            <div class="blackborder"><div class="black"></div></div>
          </div>
          <div class="customimage">
            <img data-src="${item.iconSrc}" class="customer lozad" alt="${key}"
              src="${item.iconSrc}" data-loaded="true">
          </div>
        </div>
      </li>`;
  });

  radioParent.innerHTML = `
    <div class="hlc-subparent">
      <ul class="radiotab">
        ${radioLiHTML}
      </ul>
    </div>`;

  return radioParent;
}

/**
 * Initializes radio tab (Salaried/Business) click handling.
 */
export function initRadioTabs() {
  const calcSections = document.querySelectorAll('.homeloancalculator');
  calcSections.forEach((section) => {
    const radioParent = section.querySelector('.home-loan-calculator-parent');
    if (!radioParent) return;

    const radioTabs = [...radioParent.querySelectorAll('.radiotab > li')];
    if (radioTabs.length < 2) return;

    const calculatorParent = section.querySelector('.calculator-parent');

    radioTabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        const isSalaried = idx === 0;
        const radioInput = tab.querySelector('input[type="radio"]');
        if (radioInput) radioInput.checked = true;

        radioTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        tab.style.background = isSalaried ? '#fff7f4' : '#eef3ff';
        radioTabs.forEach((otherTab, otherIdx) => {
          if (otherIdx !== idx) otherTab.style.background = '#ffffff';
        });

        if (calculatorParent) {
          calculatorParent.style.background = isSalaried ? '#fff7f4' : '#eef3ff';
        }

        radioParent.style.background = isSalaried
          ? '-webkit-linear-gradient(right, #fff 50%, #fff7f4 50%)'
          : '-webkit-linear-gradient(right, #eef3ff 50%, #fff 50%)';
      });
    });
  });
}
