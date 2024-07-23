import { currenyCommaSeperation } from "../../scripts/scripts.js";
import { updatePartPayment } from "../partpaymentcalculator/partpaymentlogic.js";

function increaseDateByoneMonth(date) {
  // Create a new Date object based on the input date
  var newDate = new Date(date);

  // Increment the month by 1
  newDate.setMonth(newDate.getMonth() + 1);

  // Check if the new month starts from day 1
  if (newDate.getDate() !== 1) {
    // If not, set the day to 1
    newDate.setDate(1);
  }
  return newDate;
}

function convertDateStingToStandardFormat(string) {
  var dateParts = string.split("/");
  var formattedDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1], 16, 47, 54).toString();
  return formattedDate;
}

function monthsGap(date1, date2) {
  // Make sure date1 is before date2
  if (date1 > date2) {
    var temp = date1;
    date1 = date2;
    date2 = temp;
  }

  var months = (date2.getFullYear() - date1.getFullYear()) * 12;
  months += date2.getMonth() + (isMonth(date1, date2) ? 1 : 0) - date1.getMonth();

  return months;
}
function isMonth(date1, date2) {
  // Calculate the difference in milliseconds
  var difference_ms = Math.abs(date2 - date1);

  // Convert milliseconds to days
  var difference_days = Math.floor(difference_ms / (1000 * 60 * 60 * 24));
  console.log(difference_days);
  if (difference_days < 30) {
    return false;
  } else {
    return true;
  }
}

function passidandinitairdatepicker(id, date) {
  let obj = new AirDatepicker(id, {
    position({ $datepicker, $target, $pointer, done }) {
      let popper = Popper.createPopper($target, $datepicker, {
        placement: "top",
        modifiers: [
          {
            name: "flip",
            options: {
              fallbackPlacements: ["top", "bottom"],
              padding: {
                top: 10,
              },
              "z-index": 200,
            },
          },
          {
            name: "offset",
            options: {
              offset: [0, 10],
            },
          },
          {
            name: "arrow",
            options: {
              element: $pointer,
            },
          },
        ],
      });
      return function completeHide() {
        popper.destroy();
        done();
      };
    },
    onSelect({ date, formattedDate, datepicker }) {
      if (date) {
        document.querySelector(id).dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    // position:'top left',
    autoClose: true,
    minDate: id == "#firstLoan" ? "" : date,
    toggleSelected: false,

    locale: {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      today: "Today",
      clear: "Clear",
      dateFormat: "MM/dd/yyyy",
      firstDay: 0,
    },
  });
  document.querySelector(id).classList.add("datepickerInit");
  return obj;
}

function scrollPartPayment() {
  let boxCont = document.querySelector(".boxCont");
  let partpayments = document.querySelectorAll(".partPayment");
  if (partpayments.length > 3) {
    boxCont.classList.add("scrolladd");
    const lastPartPayment = partpayments[partpayments.length - 1];
    const scrollTopPosition = lastPartPayment.offsetTop;
    boxCont.scrollTo({ top: scrollTopPosition, behavior: "smooth" });
    //   lastPartPayment.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    if (boxCont.classList.contains("scrolladd")) {
      boxCont.classList.remove("scrolladd");
    }
  }
}

function checkEventTrueOrFalse(firstElem, secondEle, parentContainer) {
  let isTrue;
  let arr = [firstElem, secondEle];
  let firstPaymentDate = document.querySelector("#firstLoan").value;
  parentContainer.addEventListener("change", function (params) {
    isTrue = arr.every((input) => (input.value == 0 ? false : true));
    if (isTrue) {
      parentContainer.parentElement.parentElement.parentElement.children[2].classList.remove("disabled");

      let secondDate = parentContainer.children[0].children[1].children[0].value;
      let partpaymentAmount = parentContainer.children[1].children[1].children[0].value;

      partpaymentArra[this.id] = { monthDifference: monthsGap(new Date(firstPaymentDate), new Date(secondDate)), partPayAmount: partpaymentAmount };
      let principal_outstanding = document.querySelector("[data-cal-input=loanamt]").value;
      let rate = document.querySelector("[data-cal-input=roi]").value;

      if (params.target.classList.contains("slider-value") || params.target.classList.contains("range-slider__range")) {
        array = Object.values(partpaymentArra);
        var LT = document.querySelector("[data-cal-input=tenure]").value;
        updatePartPayment(rate, principal_outstanding, LT, array);
      } else {
        if (this.nextElementSibling) {
          const parent = this.parentNode;
          let child = this.nextElementSibling;
          while (child) {
            delete partpaymentArra[child.id];
            const nextChild = child.nextElementSibling;
            parent.removeChild(child);
            child = nextChild;
          }
          count = parent.children.length + 1;
        }
        array = Object.values(partpaymentArra);
        var LT = document.querySelector("[data-cal-input=tenure]").value;
        updatePartPayment(rate, principal_outstanding, LT, array);
      }
      scrollPartPayment();

      // array = Object.values(partpaymentArra);
      // var LT = document.querySelector("[data-cal-input=tenure]").value;
      // updatePartPayment(rate, principal_outstanding, LT, array);

      document.querySelector(".boxCont").dataset.date = convertDateStingToStandardFormat(parentContainer.children[0].children[1].children[0].value);
    }
  });
}

function resetAll() {
  document.querySelectorAll(".reset").forEach(function (ele) {
    ele.remove();
    delete partpaymentArra[ele.id];
  });
  count = 2;

  document.querySelector("#partpayment1").value = "";
  document.querySelector("#partpayment1").disabled = true;
  // document.querySelector('#partpayment1').parentElement.classList.add('disabled');
  document.querySelector(".partpaymentCardContainer .loanamount .data .inputdivs input").value = "0";
  document.querySelector(".partpaymentCardContainer .loanamount .rangediv input").value = "0";

  document.querySelector(".add-more-part-payment-btn").classList.add("disabled");
  document.querySelector("#firstLoan").value = "";
  delete partpaymentArra["partpaymentCardContainer1"];
  let principal_outstanding = document.querySelector("[data-cal-input=loanamt]").value;
  let rate = document.querySelector("[data-cal-input=roi]").value;
  array = Object.values(partpaymentArra);
  var LT = document.querySelector("[data-cal-input=tenure]").value;
  updatePartPayment(rate, principal_outstanding, LT, array);
}

function updateParentStyles() {
  const input = document.querySelector("#partpayment1");

  if (input && input.disabled) {
    const parent = input.parentElement;
    if (parent) {
      parent.classList.add("disabled-parent");
    }
  } else {
    const parent = input.parentElement;
    if (parent) {
      parent.classList.remove("disabled-parent");
    }
  }
}

// Call the function initially to set styles

function sliderInit() {
  //  Slider linear gradient and slider value and input value code start
  var sliderValues = document.querySelectorAll(".slider-value");

  sliderValues.forEach(function (sliderValue) {
    var sliderId = sliderValue.dataset.slider;
    var myRangeSlider = document.getElementById(sliderId);

    sliderValue.value = formatIndianNumber(myRangeSlider.value);

    myRangeSlider.addEventListener("input", function () {
      updateInputValue();

      sliderValue.value = formatIndianNumber(myRangeSlider.value);
    });

    sliderValue.addEventListener("change", function () {
      var parsedValue = parseFloat(sliderValue.value.replace(/,/g, ""), 10);
      myRangeSlider.value = parsedValue;
      updateInputValue();
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
      // var parsedValue = parseInt(sliderValue.value.replace(/,/g, ''));

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

      //   });
    });

    sliderValue.addEventListener("change", function () {
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
        sliderValue.value = parseFloat(parsedValue).toFixed(2);
      } else {
        sliderValue.value = formatIndianNumber(parsedValue);
      }
      updateInputValue();
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
        sliderValue.value = parseFloat(parsedValue).toFixed(2);
      } else {
        sliderValue.value = formatIndianNumber(parsedValue);
      }
      updateInputValue();

      sliderValue.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
}

export function onloadDatePickerCalls() {
  updateParentStyles();

  datepickerObjFirstLoan = passidandinitairdatepicker("#firstLoan", new Date());

  let firstLoan = document.querySelector("#firstLoan");
  let seleVal;
  firstLoan.addEventListener("change", function (event) {
    document.querySelector("#partpayment1").disabled = true;
    // document.querySelector('#partpayment1').parentElement.classList.add('disabled');
    document.querySelector(".add-more-part-payment-btn").classList.add("disabled");

    document.querySelector("#partpayment1").disabled = false;
    // document.querySelector('#partpayment1').parentElement.classList.remove('disabled');
    seleVal = convertDateStingToStandardFormat(document.querySelector("#firstLoan").value);
    if (document.querySelector("#partpayment1").classList.contains("datepickerInit")) {
      airDatePickerObj.update({ minDate: increaseDateByoneMonth(seleVal) });
    } else {
      airDatePickerObj = passidandinitairdatepicker("#partpayment1", increaseDateByoneMonth(seleVal));
    }
    document.querySelector("#partpayment1").value = "";
    document.querySelector(".partpaymentCardContainer .loanamount .data .inputdivs input").value = "0";
    document.querySelector(".partpaymentCardContainer .loanamount .rangediv input").value = "0";
    sliderInit();
    document.querySelectorAll(".reset").forEach(function (ele) {
      ele.remove();
      delete partpaymentArra[ele.id];
    });
    delete partpaymentArra["partpaymentCardContainer1"];
    document.querySelector(".boxCont").dataset.date = increaseDateByoneMonth(seleVal);
    let principal_outstanding = document.querySelector("[data-cal-input=loanamt]").value;
    let rate = document.querySelector("[data-cal-input=roi]").value;

    var LT = document.querySelector("[data-cal-input=tenure]").value;
    array = Object.values(partpaymentArra);
    updateParentStyles(rate, principal_outstanding, LT, array);
    updateParentStyles();
  });

  let arr = [document.querySelector("#partpayment1"), document.querySelector(".partpaymentCardContainer .loanamount .data .inputdivs input")];
  document.querySelectorAll(".partpaymentCardContainer").forEach(function (ele) {
    ele.addEventListener("change", function (params) {
      let isTrue = arr.every((input) => (input.value == 0 ? false : true));
      if (isTrue) {
        document.querySelector(".partpaymentCardContainer").parentElement.parentElement.parentElement.children[2].classList.remove("disabled");
        document.querySelector(".boxCont").dataset.date = convertDateStingToStandardFormat(document.querySelector("#partpayment1").value);
        let firstDate = document.querySelector("#firstLoan").value;
        let secondDate = document.querySelector("#partpayment1").value;
        let partpaymentAmount = this.children[1].children[0].children[1].children[1].value;
        partpaymentArra[this.id] = { monthDifference: monthsGap(new Date(firstDate), new Date(secondDate)), partPayAmount: partpaymentAmount };
        let principal_outstanding = document.querySelector("[data-cal-input=loanamt]").value;
        let rate = document.querySelector("[data-cal-input=roi]").value;

        var LT = document.querySelector("[data-cal-input=tenure]").value;
        if (params.target.classList.contains("slider-value") || params.target.classList.contains("range-slider__range")) {
          array = Object.values(partpaymentArra);
          var LT = document.querySelector("[data-cal-input=tenure]").value;
          updateParentStyles(rate, principal_outstanding, LT, array);
        } else {
          if (this.nextElementSibling) {
            const parent = this.parentNode;
            let child = this.nextElementSibling;
            while (child) {
              delete partpaymentArra[child.id];
              const nextChild = child.nextElementSibling;
              parent.removeChild(child);
              child = nextChild;
            }
            count = parent.children.length + 1;
          }
          array = Object.values(partpaymentArra);
          updateParentStyles(rate, principal_outstanding, LT, array);
        }
      }
    });
  });

  document.querySelector(".add-more-part-payment-btn").addEventListener("click", function () {
    document.querySelector(".partpaymentCardContainer").parentElement.parentElement.parentElement.children[2].classList.add("disabled");
    let min = document.querySelector(".partpaymentCardContainer .loanamount .rangediv input").min;
    let max = document.querySelector(".partpaymentCardContainer .loanamount .rangediv input").max;
    let value = document.querySelector(".partpaymentCardContainer .loanamount .rangediv input").value;
    let imagePath = document.querySelector(".inputdivs.dt img").src;
    let minText = document.querySelectorAll(".partpaymentCardContainer .loanamount .rangediv .values .text")[0].innerText;
    let maxText = document.querySelectorAll(".partpaymentCardContainer .loanamount .rangediv .values .text")[1].innerText;

    let amountTextCount;

    if (count == 1) {
      amountTextCount = count + "st";
    } else if (count == 2) {
      amountTextCount = count + "nd";
    } else if (count == 3) {
      amountTextCount = count + "rd";
    } else if (count > 3) {
      amountTextCount = count + "th";
    }

    let text = "Enter " + amountTextCount + " part payment Date";
    let amountText = amountTextCount + " Part Payment amount (Rs.)";
    let ele = document.querySelector(".boxCont");
    let element = document.createElement("div");
    element.setAttribute("id", "partpaymentCardContainer" + count);
    element.classList.add("loanamount", "partPayment", "partpaymentCardContainer", "resetClass" + count, "reset");
    var htmlString =
      '<div class="data">' +
      '<label class="description">' +
      text +
      "</label>" +
      '<div class="inputdivs dt">' +
      '<input type="text" class="inputvalue " placeholder="DD/MM/YYYY" readonly id="partpayment' +
      count +
      '">' +
      '<img src="' +
      imagePath +
      '" alt="image">' +
      "</div>" +
      "</div>" +
      '<div class="loanamount">' +
      '<div class="data">' +
      '<label class="description">' +
      amountText +
      "</label>" +
      '<div class="inputdivs ">' +
      '<span class="rupee">₹</span>' +
      '<input type="text" class="inputvalue  slider-value" value="" data-slider="partPayment' +
      count +
      '" id="partPaymentInput' +
      count +
      '">' +
      '<span class="textvalue"></span>' +
      "</div>" +
      "</div>" +
      '<div class="rangediv">' +
      '<input type="range" min="' +
      min +
      '" max="' +
      max +
      '" value="' +
      0 +
      '" ' +
      'class="range-slider__range" id="partPayment' +
      count +
      '"' +
      'style="background: linear-gradient(90deg, rgb(218, 77, 52) 4.0404%, rgb(219, 215, 216) 4.0404%);">' +
      '<div class="values">' +
      '<span class="text">' +
      minText +
      "</span>" +
      '<span class="text">' +
      maxText +
      "</span>" +
      "</div>" +
      "</div>" +
      "</div>";

    element.innerHTML = htmlString;
    ele.append(element);
    parentContainer = document.querySelector(".resetClass" + count);
    firstElem = document.querySelector("#partPaymentInput" + count);
    secondEle = document.querySelector("#partpayment" + count);
    passidandinitairdatepicker("#partpayment" + count, increaseDateByoneMonth(document.querySelector(".boxCont").dataset.date));

    // addDatePicker(document.querySelector('#partPayment'+count),new Date());
    sliderInit();
    count = count + 1;

    checkEventTrueOrFalse(firstElem, secondEle, parentContainer);
    scrollPartPayment();
  });
  sliderInit();
  let principal_outstanding = document.querySelector("[data-cal-input=loanamt]").value;
  let rate = document.querySelector("[data-cal-input=roi]").value;
  var LT = document.querySelector("[data-cal-input=tenure]").value;
  updatePartPayment(rate, principal_outstanding, LT, []);

  document.querySelector(".emicalculator .inputDiv").addEventListener("change", function (event) {
    let target = event.target;
    // let isDesiredElement = target.matches("[data-cal-input=loanamt], [data-cal-input=roi], [data-cal-input=tenure]");

    // if (isDesiredElement) {
    let principal_outstanding = document.querySelector("[data-cal-input=loanamt]").value;
    let rate = document.querySelector("[data-cal-input=roi]").value;
    var LT = document.querySelector("[data-cal-input=tenure]").value;
    updatePartPayment(rate, principal_outstanding, LT, array);
    // }
  });

  document.querySelector(".clearAllText").addEventListener("click", function () {
    resetAll();
    sliderInit();
    datepickerObjFirstLoan.clear();
    airDatePickerObj.clear();
    updateParentStyles();
    let boxCont = document.querySelector(".boxCont");
    boxCont.classList.remove("scrolladd");
  });
}
