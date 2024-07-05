import { currenyCommaSeperation } from "../../scripts/scripts.js";
import { resetCalculator } from "./resetCalculator.js";

/* document.addEventListener("DOMContentLoaded", function () {
  homeLoanCalcFunc();
}); */

export function homeLoanCalcFunc(currentSection) {

  var salariedDivs = currentSection.querySelectorAll(".onetab");
  var businessDivs = currentSection.querySelectorAll(".twotab");

  var salariedRadios = currentSection.querySelectorAll(".input_salary_checkbox");
  var businessRadios = currentSection.querySelectorAll(".input_business_checkbox");

  // just below heading tabs color changes and input click  code start
  salariedDivs.forEach(function (salariedDiv, index) {
    salariedDiv.addEventListener("click", function () {
      handleTabClick(salariedDiv, true, index);
    });
  });
  businessDivs.forEach(function (businessDiv, index) {
    businessDiv.addEventListener("click", function () {
      handleTabClick(businessDiv, false, index);
    });
  });

  function handleTabClick(tabDiv, isSalaried, index) {
    var backgroundDiv = tabDiv.closest(".home-loan-calculator-parent");
    var calculatorDiv = tabDiv.parentElement.closest(".home-loan-calculator-parent ").nextElementSibling;
    var radioInput = isSalaried ? salariedRadios[index] : businessRadios[index];
    var docRequiredBackground = currentSection.querySelector("#document-required-container");
    var docSalaries = currentSection.querySelectorAll(".cmp-text--doc-salary");
    var docBusinesses = currentSection.querySelectorAll(".cmp-text--doc-business");

    radioInput.checked = true;
    tabDiv.style.background = isSalaried ? "#fff7f4" : "#eef3ff";
    var otherTabDiv = isSalaried ? businessDivs[index] : salariedDivs[index];
    otherTabDiv.style.background = "#ffffff";

    calculatorDiv.style.background = isSalaried ? "#fff7f4" : "#eef3ff";
    backgroundDiv.style.background = isSalaried ? "-webkit-linear-gradient(right, #fff 50%, #fff7f4 50%)" : "-webkit-linear-gradient(right, #eef3ff 50%, #fff 50%)";
    if (docRequiredBackground) {
      docRequiredBackground.style.background = isSalaried ? "#fff7f4" : "#eef3ff";
    }
    if (docSalaries) {
      docSalaries.forEach((docSalary) => {
        docSalary.style.display = isSalaried ? "block" : "none";
      });

      docBusinesses.forEach((docBusiness) => {
        docBusiness.style.display = isSalaried ? "none" : "block";
      });
    }
  }

  // just below heading tabs color changes and input click  code end.

  // blueTabparent and redparent
  //  var bluetabParent = document.querySelector(".blue-tab");
  //  var lightredParent = document.querySelector(".light-red-tab");

  //     if (bluetabParent) {
  //         salariedDivs.forEach(function(salariedDiv, index) {
  //             salariedDiv.removeEventListener("click", function() {
  //                 handleTabClick(salariedDiv, true, index);
  //             });
  //         });
  //     }

  //     if (lightredParent) {
  //         businessDivs.forEach(function(businessDiv, index) {
  //             businessDiv.removeEventListener("click", function() {
  //                 handleTabClick(businessDiv, false, index);
  //             });
  //         });
  //     }

  // this for emi and elg calculator click

  const emiTabs = document.querySelectorAll(".tab-emi-calc");
  const elgTabs = document.querySelectorAll(".tab-eligibility-calc");
  const emiDivs = document.querySelectorAll(".emicalculator");
  const elgDivs = document.querySelectorAll(".eligibilitycalculator");
  const firstHead = document.querySelector(".first-head");
  const secondHead = document.querySelector(".second-head");
  const gstBtn = document.querySelector(".gst-third-tab");
  
  // Function to handle click on emi tabs
  function handleEmiTabClick(index) {
    // Activate emi tab and deactivate eligibility tab
    let isAlreadyActive = emiTabs[index].classList.contains("active");
    emiTabs[index].classList.add("active");
    elgTabs[index].classList.remove("active");

    // Show emi div and hide eligibility div
    emiDivs[index].style.display = "block";
    elgDivs[index].style.display = "none";

    if (isAlreadyActive == false) {
      resetCalculator(emiDivs[index]);
    }

    if (secondHead) {
      secondHead.style.display = "none";
      firstHead.style.display = "block";
    }
  }

  // Function to handle click on eligibility tabs
  function handleElgTabClick(index) {
    // Activate eligibility tab and deactivate emi tab
    let isAlreadyActive = elgTabs[index].classList.contains("active");

    elgTabs[index].classList.add("active");
    emiTabs[index].classList.remove("active");

    // Show eligibility div and hide emi div
    elgDivs[index].style.display = "block";
    emiDivs[index].style.display = "none";

    if (isAlreadyActive == false) {
      resetCalculator(elgDivs[index]);
    }

    if (secondHead) {
      firstHead.style.display = "none";
      secondHead.style.display = "block";
    }
  }

  function handleSalaryTabClickNone(index) {
    var salariedDivs = currentSection.querySelectorAll(".onetab");

    salariedDivs[index].style.display = "none";
  }
  function handleSalaryTabClickBlock(index) {
    var salariedDivs = currentSection.querySelectorAll(".onetab");

    salariedDivs[index].style.display = "block";
  }

  // Add event listeners to emi tabs
  if (emiTabs[0]) {
    emiTabs[0].addEventListener("click", function () {
      handleEmiTabClick(0);
      if (gstBtn) {
        gstBtn.classList.remove("active");
      }
    });
  }

  if (emiTabs[1]) {
    emiTabs[1].addEventListener("click", function () {
      handleEmiTabClick(1);

      // handleSalaryTabClickBlock(1);
    });
  }
  if (gstBtn) {
    gstBtn.addEventListener("click", function () {
      elgTabs[0].classList.remove("active");
      emiTabs[0].classList.remove("active");
      gstBtn.classList.add("active");
      elgDivs[0].style.display = "block";
      emiDivs[0].style.display = "none";
    });
  }
  // Add event listeners to eligibility tabs
  if (elgTabs[0]) {
    elgTabs[0].addEventListener("click", function () {
      handleElgTabClick(0);
      if (gstBtn) {
        gstBtn.classList.remove("active");
      }
      // handleSalaryTabClickNone(0);
    });
  }
  if (elgTabs[1]) {
    elgTabs[1].addEventListener("click", function () {
      handleElgTabClick(1);

      // handleSalaryTabClickNone(1);
    });
  }

  //  Slider linear gradient and slider value and input value code start
  var sliderValues = currentSection.querySelectorAll(".slider-value");

  sliderValues.forEach(function (sliderValue) {
    var sliderId = sliderValue.dataset.slider;
    var myRangeSlider = currentSection.querySelector("#"+sliderId);
    var calInput = myRangeSlider.dataset.calInput;

    sliderValue.value = formatIndianNumber(myRangeSlider.value);

    myRangeSlider.addEventListener("input", function () {
      updateInputValue();
      sliderValue.value = formatIndianNumber(myRangeSlider.value);
    });

    sliderValue.addEventListener("focusout", function () {
      var parsedValue = parseFloat(sliderValue.value.replaceAll(",", "")) || 0;
      var minValue = parseFloat(myRangeSlider.min);
      var maxValue = parseFloat(myRangeSlider.max);
      if (parsedValue < minValue) {
        parsedValue = minValue;
      }
      if (parsedValue > maxValue) {
        parsedValue = maxValue;
      }
      myRangeSlider.value = parsedValue;
      if (this.dataset.calInput === "roi") {
        sliderValue.value = parseFloat(parsedValue);
      } else {
        sliderValue.value = formatIndianNumber(parsedValue);
      }
      updateInputValue();

      sliderValue.dispatchEvent(new Event("change", { bubbles: true }));
    });

    function updateInputValue() {
      var valPercent = ((myRangeSlider.value - myRangeSlider.min) / (myRangeSlider.max - myRangeSlider.min)) * 100;
      myRangeSlider.style.background = `linear-gradient(90deg, #da4d34 ${valPercent}%, #dbd7d8 ${valPercent}%)`;
    }

    myRangeSlider.dispatchEvent(new Event("input"));

    function formatIndianNumber(value) {
      //  let newvalue = value.replace(/,/g, "");
      let val = value;
      return isNaN(Number(val)) ? 0 : currenyCommaSeperation(val);
    }

    sliderValue.addEventListener("input", function (number) {
      var inputValue = sliderValue.value;

      // Remove non-numeric characters except the decimal point
      var cleanedValue = inputValue.replace(/[^\d.]/g, "");
      let inputType = this.dataset.calInput;
      // not accept decimal point

      var parsedValue = cleanedValue;
      cleanedValue = String(cleanedValue);

      if (inputType === "roi") {
        parsedValue = parsedValue;
      } else if (inputType === "tenure") {
        parsedValue = cleanedValue.replace(/\./g, "").replaceAll(",", "");
      } else {
        parsedValue = formatIndianNumber(parsedValue);
      }

      sliderValue.value = parsedValue;
    });

    sliderValue.addEventListener("change", function (e) {
      var inputValue = sliderValue.value;

      // Remove non-numeric characters except the decimal point
      var cleanedValue = inputValue.replace(/[^\d.]/g, "");
      let inputType = this.dataset.calInput;
      // not accept decimal point

      var minValue = parseFloat(myRangeSlider.min);
      var maxValue = parseFloat(myRangeSlider.max);

      if (cleanedValue < minValue) {
        cleanedValue = minValue;
      }
      if (cleanedValue > maxValue) {
        cleanedValue = maxValue;
      }

      var parsedValue = String(cleanedValue);

      if (inputType === "roi") {
        parsedValue = parsedValue;
      } else if (inputType === "tenure") {
        parsedValue = parsedValue.replace(/\./g, "").replaceAll(",", "");
      } else {
        parsedValue = formatIndianNumber(parsedValue);
      }

      sliderValue.value = parsedValue;
      myRangeSlider.value = cleanedValue;
      updateInputValue();
    });
  });

  //  Slider linear gradient and slider value and input value code end
}
