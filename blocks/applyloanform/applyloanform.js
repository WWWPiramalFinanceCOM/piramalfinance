import { appplyLoanTemplate } from './applyloantemplate.js';
import { applyLoanFormClick } from './applyloanforms.js';
import { applyLoanPopper } from './applyloanpopper.js';
import { loanutmForm } from './loanutm.js';
import { stateMasterApi } from './statemasterapi.js';
import { validationJSFunc } from './validation.js';
import AirDatepicker from '../datepickerlib/datepickerlib.js';
import Popper from '../datepickerlib/popper.js';
import { buttonCLick } from './loanformapi.js';
import { CFApiCall, fetchAPI } from '../../scripts/common.js';

export default async function decorate(block) {
  const anchor = block.querySelector('a[href]');
  const cfURL = anchor ? anchor.getAttribute('href') : '/api/apply-form-loan.json';

  const cfRepsonse = await CFApiCall(cfURL);
  const repsonseData = cfRepsonse.data;
  const jsonResponseData = applyLoanFormJson(repsonseData);
  // const jsonResponseData = JSON.parse(repsonseData);



  block.innerHTML = appplyLoanTemplate(jsonResponseData);

  // Get main container for scoped queries (avoids document.querySelector in functions)
  const mainContainer = block.closest('main') || block.closest('body');

  try {
    // Robust deferred execution - works in both parallel and sequential loading
    // Uses RAF + retry mechanism to ensure sibling blocks are ready
    const initFormClick = () => {
      requestAnimationFrame(() => {
        const loanForm = mainContainer.querySelector('.loan-form-sub-parent');
        if (loanForm) {
          applyLoanFormClick(mainContainer);
        } else {
          // Retry once more if form not found (parallel loading case)
          setTimeout(() => applyLoanFormClick(mainContainer), 100);
        }
      });
    };
    initFormClick();

    applyLoanPopper();
    loanutmForm();
    stateMasterApi();
    validationJSFunc();
    buttonCLick();
  } catch (error) {
    console.warn(error);
  }
}

function applyLoanFormJson(data) {
  var mainObj = {};

  var loanCategories = {}; // Temporary storage for loan categories

  data.forEach(function (eachEle) {
    // Initialize an array for loan categories when fieldset is "array" and view is "options"
    if (eachEle.fieldset === "array" && eachEle.view === "options") {
      loanCategories[eachEle.name] = [];
    } else if (eachEle.fieldset === "array") {
      mainObj[eachEle.name] = [];
    } else {
      mainObj[eachEle.name] = eachEle.value;
    }

    // Populate loans under categories based on the view
    if (eachEle.view && loanCategories[eachEle.view]) {
      // Initialize the loan item if it doesn't exist yet
      let loanItem = loanCategories[eachEle.view][eachEle.id] || {};

      if (!loanItem.litext) {
        loanItem = {}; // Ensure loan item starts empty if not set yet
      }

      // Add loan details like litext, loantype, and loanname
      if (eachEle.fieldset === "") {
        loanItem[eachEle.name] = eachEle.value; // Add loan details (litext, loantype, loanname)
      }

      // Save the loan item back into the category
      loanCategories[eachEle.view][eachEle.id] = loanItem;
    }
  });

  // Now push categories into the mainObj.options array
  for (let category in loanCategories) {
    let obj = {};
    obj[category] = loanCategories[category]; // Assign the category's loan items
    mainObj.options.push(obj);
  }

  return mainObj; // Return the structured object
}
