import { fetchAPI } from "../../scripts/scripts.js";
import { homeLoanCalcFunc } from "../emiandeligiblitycalc/homeloancalculators.js";
import { onloadDatePickerCalls } from "./partpaymentdatepicker.js";

export let nextMonth;
export let firstElem, secondEle, parentContainer;
export let count = 2;
export let array = [];
export let partpaymentArra = {};
export let datepickerObjFirstLoan;
export let airDatePickerObj;
// Increase 1 month Function

export default async function decorate(block) {
  let cfURL = block.textContent.trim();

  const cfRepsonse = await CFApiCall(cfURL);
  const repsonseData = cfRepsonse.data[0].data;
  const jsonResponseData = JSON.parse(repsonseData);

  block.innerHTML = partPaymentCalHTML(jsonResponseData);

  let elgCalDiv, elgOverlay;

  try {
    elgCalDiv = document.querySelector(".home-page-calculator-call-xf");
    elgOverlay = elgCalDiv.querySelector(".cmp-container--caloverlay");

    const currentSection = document.querySelector(".home-page-calculator-call-xf");

    if (document.querySelector(".home-loan-calculator-parent").classList.contains("combined-emi-eligibility")) {
      document.querySelector(".home-loan-calculator-parent").classList.remove("combined-emi-eligibility");
      /* document.querySelector(".homeloancalculator").querySelector(".eligibilitycalculator") &&
        (document.querySelector(".homeloancalculator").querySelector(".eligibilitycalculator").style.display = "block"); */
    }

    homeLoanCalcFunc(currentSection);
    onloadDatePickerCalls();
    readMoreFucn(block);
  } catch (error) {
    console.warn(error);
  }
}

export async function CFApiCall(cfurl) {
  const response = await fetchAPI("GET", cfurl);
  const responseJson = await response.json();
  return responseJson;
}

function readMoreFucn(block) {
  document.querySelector(".discalimer-details").classList.remove("dp-none");
  if (block.querySelector(".discalimer-calc")) {
    const readMoreBtn = block.querySelector(".read-more-discalimer-calc");
    const discalimerContainer = block.querySelector(".disclaimer-container");
    readMoreBtn.addEventListener("click", (e) => {
      if (e.target.textContent.trim() == "Read more") {
        discalimerContainer.classList.remove("dp-none");
        readMoreBtn.textContent = "Read less";
      } else if (e.target.textContent.trim() == "Read less") {
        discalimerContainer.classList.add("dp-none");
        readMoreBtn.textContent = "Read more";
      }
    });
  }
}

