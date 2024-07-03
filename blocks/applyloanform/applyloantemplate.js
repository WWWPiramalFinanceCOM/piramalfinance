export function appplyLoanTemplate() {
  const properties = {
    rupeeIcon: "https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/rupee-icon.svg",
    mainFormHeading: "Main Form Heading",
    crossOne: "https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/close-icon.svg",
    loanType: "Loan Type",
    loanTypePlaceholder: "Select Loan Type",
    loanAmount: "Loan Amount",
    fullNames: "Full Name",
    fullNamesPlaceholder: "Enter Full Name",
    mobileNumber: "Mobile Number",
    mobileNumberPlaceholder: "Enter Mobile Number",
    checkboxTitle: "Employment Type",
    firstCheckText: "Salaried",
    secondCheckText: "Business",
    monthlyIncome: "Monthly Income",
    datePicker: "Date of Birth",
    datePickerPlaceholder: "DD/MM/YYYY",
    state: "State",
    statePlaceholder: "Enter State",
    branch: "Branch",
    branchPlaceholder: "Enter Branch",
    checkboxText: "I agree to the ",
    checkboxAnchorText: "terms and conditions",
    checkboxAnchorTextLink: "http://example.com",
    verifyHead: "Verify Your Mobile Number",
    sucessFirstImg: "https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/loan-sucess.png",
    crossTwo: "https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/close-icon.svg",
    FirstLineText: "Your request has been submitted successfully!",
    SecondLineText: "Here is your QR code",
    sucessSecondImg: "https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/scanner.svg",
    MobileLineText: "Scan the QR code with your mobile app",
    scanImgOne: "https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/homepage/banner-images/playstore.png",
    scanImgTwo: "https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/homepage/banner-images/appstore.png",
    errorImage: "https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/loan-error.png",
    crossThree: "https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/close-icon.svg",
    errorhead: "Request Failed",
    errorSubhead: "There was an error processing your request.",
    RedBoxText: "Please try again later.",
    errorImage2: "https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/loan-error.png",
    crossFour: " https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/close-icon.svg",
    errorMessageOne: "Something went wrong",
    errorMessageTwo: "Please try again.",
    buttonOne: "Submit",
    buttonTwo: "Verify OTP",
    buttonThree: "Try Again",
    options: [
      {
        "Personal Loan": [
          { litext: "Loan less than 5 Lacs", loantype: "pl" },
          { litext: "Loan more than 5 Lacs", loantype: "pl" },
        ],
      },
      {
        "Housing Loan": [{ litext: "Home Loan", loantype: "hl" }],
      },
      {
        "Business Loan": [
          { litext: "Business Loan", loantype: "ubl" },
          { litext: "Loan against property", loantype: "msme" },
          { litext: "Secured business loan", loantype: "msme" },
        ],
      },
      {
        "Other Loans": [{ litext: "Pre-owned Car Loan", loantype: "ucl" }],
      },
    ],
  };

  function createLoanTypeDropDown() {
    let container = document.createElement("div");

    properties.options.forEach((category) => {
      let ul = document.createElement("ul");
      for (let [key, value] of Object.entries(category)) {
        let liCategory = document.createElement("li");
        liCategory.textContent = key;
        liCategory.setAttribute("data-get-input","form-loan-type");
        liCategory.classList.add("subpoints");
        ul.appendChild(liCategory);

        value.forEach((item) => {
          let liItem = document.createElement("li");
          liItem.textContent = item.litext;
          liItem.setAttribute("data-loan-type", item.loantype);
          liItem.setAttribute("data-get-input","form-loan-type");
          liItem.classList.add("subpoints");
          ul.appendChild(liItem);
        });
      }
      container.appendChild(ul);
    });

    return container.innerHTML;
  }

  let listofLoanTypes = createLoanTypeDropDown();

  const appplyLoanTemplate = `<div class="loan-form-sub-parent">
        <div class="cmp-container">
             <div class="loan-form">
                <div class="cmp-container">
                        <div class="loan-form-heading-parent ">
                            <div class="cmp-container">
                                <div class="image">
                                    <img data-src="${properties.rupeeIcon}" src="${properties.rupeeIcon}"
                                        class="cmp-image__image lozad"  alt="send">
                                </div>
                                <div class="text">
                                    <p>${properties.mainFormHeading}</p>
                                </div>
                                <div class="image crossimage">
                                    <img data-src="${properties.crossOne}" src="${properties.crossOne}"
                                        class="cmp-image__image lozad" alt="close-icon">
                                </div>
                            </div>
                        </div>
                        <div class="container">
                            <form  
                                id="loan-main-form" name="loan-main-form" class="cmp-form">
                                <div class="text">
                                    <div class="cmp-form-text">
                                        <label for="form-text">${properties.loanType}<span>*</span></label>
                                        <div class="cmp-form-text-parent multiselectoptions">
                                            <input class="cmp-form-text__text" type="text" id="form-loan-type"
                                                placeholder="${properties.loanTypePlaceholder}" readonly  autocomplete="off">
                                            <span class="arrowimage"><img class="lozad" src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/down-arrow.png"
                                                    data-src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/down-arrow.png" alt="arrowimage" src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/down-arrow.png">
                                            </span>
                                        </div>
                                        <div class="option-form-parent">
                                            <div class="option-form loan-form-drpdown">

                                               
                                                   ${listofLoanTypes}
                                                   
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="text">
                                    <div class="cmp-form-text">
                                        <label for="form-text">${properties.loanAmount}<span>*</span></label>
                                        <div class="cmp-form-text-parent">
                                            <span class="rupee">₹</span>
                                            <input class="cmp-form-text__text" type="text" data-value-type="money" id="form-loan-amount"  placeholder=""
                                            autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                                <div class="text">
                                    <div class="cmp-form-text">
                                        <label for="form-text">${properties.fullNames}<span>*</span></label>
                                        <div class="cmp-form-text-parent">
                                            <input class="cmp-form-text__text" id="form-customer-name" data-value-type="name"  type="text" placeholder="${properties.fullNamesPlaceholder}"
                                                autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                                <div class="text">
                                    <div class="cmp-form-text">
                                        <label for="form-text">${properties.mobileNumber}<span>*</span></label>
                                        <div class="cmp-form-text-parent">
                                            <input class="cmp-form-text__text" type="text" id="form-customer-no" maxlength="10" data-validation="isvalidNumber" data-isvalid="false"
                                                placeholder="${properties.mobileNumberPlaceholder}" name="contact" inputmode="numeric" autocomplete="off">
                                            <span class="loan-form-err invalid-no-msg">
                                                First digit should be 6 or 7 or 8 or 9.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="loan-form-checkbox">
                                    <fieldset class="cmp-form-options--radio">
                                        <legend class="cmp-form-options__legend">${properties.checkboxTitle}</legend>
                                        <div class="cmp-field-parent-parent">
                                            <div class="cmp-form-option-parent">
                                                <label for="radio-salary" id="radio-salary-id"
                                                    class="cmp-form-options__field-label">
                                                    <div class="cmp-form-input-parent">
                                                        <input class="cmp-form-options__field--radio" id="radio-salary"
                                                            name="emplyoment" checked type="radio">
                                                        <span
                                                            class="cmp-form-options__field-description">${properties.firstCheckText}</span>
                                                        <img id="" class="icon coloricon lozad"
                                                            data-src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/salaried-after-selected-icon.svg"
                                                            alt="salaried-after-selected-icon" src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/salaried-after-selected-icon.svg">
                                                        <img id="" class="icon blackicon lozad" src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/salaried-before-selected-icon.svg"
                                                            alt="salaried-before-selected-icon" data-src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/salaried-before-selected-icon.svg">
                                                    </div>
    
                                                        
        
                                                </label>
                                            </div>
                                            <div class="cmp-form-option-parent">
                                                <label for="radio-business" id="radio-business-id"
                                                    class="cmp-form-options__field-label">
                                                    <div class="cmp-form-input-parent">
                                                        <input class="cmp-form-options__field--radio"
                                                            id="radio-business" name="emplyoment" type="radio">
                                                        <span class="cmp-form-options__field-description">${properties.secondCheckText}</span>
                                                        <img id="" class="icon coloricon lozad" src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/business-loan-after-selected-icon.svg"
                                                            data-src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/business-loan-after-selected-icon.svg"
                                                            alt="business-loan-after-selected-icon">
                                                        <img id="" class="icon blackicon lozad" src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/business-loan-before-selcted-icon.svg"
                                                            data-src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/business-loan-before-selcted-icon.svg"
                                                            alt="business-loan-before-selcted-icon">
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                                <div class="text">
                                    <div class="cmp-form-text">
                                        <label for="form-text">${properties.monthlyIncome}<span>*</span></label>
                                        <div class="cmp-form-text-parent">
                                            <span class="rupee">₹</span>
                                            <input class="cmp-form-text__text" id="form-income" data-value-type="money"  type="text" placeholder="" name="text" autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                                <div class="text">
                                    <div class="cmp-form-text">
                                        <label for="form-text">${properties.datePicker}<span>*</span></label>
                                        <div class="cmp-form-text-parent" id="dob-container">
                                            <input class="cmp-form-text__text dobclass" type="text" placeholder="${properties.datePickerPlaceholder}"
                                                id="loan-form-dob" name="text" maxlength="10" autocomplete="off" data-value-type="date">
                                            <span class="arrowimage dobarrow" id="loan-form-cal-id"><img class="lozad" src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/calendar.png"
                                                data-src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/calendar.png" alt="dobarrow">
                                            </span>
    
                                            <span class="loan-form-err invalid-date-msg">
                                                Kindly enter proper date of birth
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="text">
                                    <div class="cmp-form-text">
                                        <label for="form-text">${properties.state}<span>*</span></label>
                                        <div class="cmp-form-text-parent stateparent laststate" id="stateparent">
                                            <input class="cmp-form-text__text" type="text" placeholder="${properties.statePlaceholder}"  autocomplete="off"
                                                id="form-state" name="text" >
                                            <span class="arrowimage laststate"><img class="lozad" src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/down-arrow.png"
                                                data-src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/down-arrow.png" alt="arrowimage"></span>
                                            <span class="loan-form-err">
                                                Enter Valid State
                                            </span>
                                        </div>
                                       
                                     </div>
                                </div>
                                
                                <div class="text">
                                    <div class="cmp-form-text">
                                        <label for="form-text">${properties.branch}<span>*</span></label>
                                        <div class="cmp-form-text-parent  branchparent" id="branchparent">
                                            <input class="cmp-form-text__text" type="text"
                                                placeholder="${properties.branchPlaceholder}" id="form-branch-city" name="text"  autocomplete="off">
                                            <span class="arrowimage laststate"><img class="lozad" src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/down-arrow.png"
                                                data-src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/down-arrow.png" alt="arrowimage"></span>
                                            <span class="loan-form-err">
                                                Enter Valid branch
                                            </span>
                                        </div>
                                        
                                        
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="cmp-form-checkbox">
    
                            <div class="checkspan">
                                <div class="checkspan-child">
                                    <label class="checkboxcontainer">
                                        <div class="circle"></div>
                                        <input class="checkvalue" type="checkbox"  id="loanformcheck">
                                        <span class="checkmark"></span>
                                        
                                    </label>
                                </div>
                                
                            </div>
                            <p class="checkboxtext">${properties.checkboxText}<a target="_blank" href="${properties.checkboxAnchorTextLink}" class="spantext"><span>${properties.checkboxAnchorText}</span></a></p>
                            
                        </div>
                        <div class="loan-form-otp">
                            
                            <div class="loan-form-otp-parent">
                                <img class="leftarrow lozad" src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/back-arrow.png" data-src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/back-arrow.png" alt="arrow">
                                <p class="otphead">${properties.verifyHead}</p>
                                <div class="otpsubheadcontainer">
                                    <p class="otpsubhead">Enter the 4 digit OTP sent to <span class="otp-phone-num" id="loan-form-otpnum">7845789658</span></p>
                                    <p class="otp-change-num" id="otp-change-num">Change</p>
                                </div>
                               
                                <p class="otpsubsubhead">4 Digit Code<code></code></p>
                                 <div class="inputotp">
                                    <input type="text" id="loan-form-otp-input" maxlength="4">
                                    <span id="otp-digits">0/4 Digits</span>
                                 </div>
                                 <div class="wrongotpmessage">
                                    Invalid Code Try Again
                                 </div>
                                 <div class="resendtext">
                                    <p>
                                        Didn’t receive code?
                                    </p>
                                    <button type="button" id="loan-form-resend-otp">Resend code</button>
                                    <span class="timer">00:30</span>
                            </div>
                           
                             </div>
    
                               
    
                        </div>
                        <div class="sucess-form">
                            <div class="sucess-form-parent">
                                <div class="cross">
                                    <img  class="loansucess lozad" src="${properties.sucessFirstImg}" data-src="${properties.sucessFirstImg}" alt="loan-sucess-img">
                                    <img class="crossimage lozad" data-src="${properties.crossTwo}" src="${properties.crossTwo}" alt="cross-img">
    
                                </div>
                                <p class="loan-request-text">${properties.FirstLineText}</p>
                                <p class="qrcode-text">${properties.SecondLineText}</p>
                                <div class="barcode-parent">
    
                                    <img class="barcode lozad" src="${properties.sucessSecondImg}" data-src="${properties.sucessSecondImg}" alt="barcode">
                                </div>
                                <div class="mobilescanner">
                                    <p class="mobilescannertext">${properties.MobileLineText}</p>
                                    <div class="mobilebuttons">
                                        <a href="#"><img data-src="${properties.scanImgOne}" src="${properties.scanImgOne}" alt="Play Store" class="first-img lozad"></a>
                                        <a href="#"><img data-src="${properties.scanImgTwo}" src="${properties.scanImgTwo}" alt="App Store" class="second-img lozad"></a>
                                        
                                    </div>
                                </div>
                               
    
                            </div>
                        </div>
                        <div class="loan-request-fail-form">
                               <div class="images">
                                   
    
                                        <img class="errorimage lozad" data-src="${properties.errorImage}" src="${properties.errorImage}" alt="error">
                                  
                                    
                                        <img class= "failformcross lozad" src="${properties.crossThree}" data-src="${properties.crossThree}" alt="cross">
                                
                               </div>
                               <p class="main-heading">${properties.errorhead}</p>
                               <p class="main-sub-heading">${properties.errorSubhead}</p>
                               <div class="redbox">
                                <img class= "alertimg lozad" src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/error-warning.svg" data-src="https://publish-p133703-e1305981.adobeaemcloud.com/content/dam/piramalfinance/product-page/home-loan/error-warning.svg" alt="error-warning">
                                
                                <P>${properties.RedBoxText}</P>
                               </div>
    
                        </div>
                        <div class="loan-sw-wrong">
                            <div class="images">
                                
    
                                <img class="errorimage lozad" src="${properties.errorImage2}" data-src="${properties.errorImage2}" alt="error">
                               
                                 
                                 <img class="failformcross sw-wrongcross lozad" src="${properties.crossFour}" data-src="${properties.crossFour}" alt="cross">
                             
                            </div>
                            <p class="main-heading">${properties.errorMessageOne}</p>
                            <p class="main-sub-heading">${properties.errorMessageTwo}</p>
                            
                        </div>
                </div>
                
              
              
                    
                
            </div>
            <div class="loan-form-button-container first-form-button">
                <button id="loan-form-button" class="cmp-container"> 
                    <div class="btn-text">${properties.buttonOne}</div>
                    <div class="loader loader-initialized"></div>
                </button>
            </div>
            <div class="loan-form-button-container  loan-form-otp-button-container">
                <button id="loan-from-otp-verify" class="cmp-container">
                    <div class="btn-text"> ${properties.buttonTwo}</div>
                    <div class="loader"></div>
                </button>
            </div> 
            <div class="sw-wrong-button-container">
                <button  class="cmp-container">${properties.buttonThree}
                </button>
            </div>
    
            <div class="option-form-parent" id="statecontainer"> 
                <div class="option-form">
                    <ul>
                    </ul>
                </div>
            </div>
            <div class="option-form-parent" id="branchcontainer">
                <div class="option-form">
                       <ul>
                            <li class="orangepoints">No options</li>
                       </ul>
                   </div> 
            </div> 
        </div>
    </div>`;

  return appplyLoanTemplate;
}

/* <!-- loan-form-sub-otp   loan-form-success  loan-form-request-fail  loan-form-something-wrong -->
<!-- btn-active loader-initialized --> */
