import { ctaClickInteraction, documentRequiredInteraction, faqInteraction } from "../../dl.js";
import { fetchPlaceholders } from "../../scripts/aem.js";
import { targetObject } from "../../scripts/scripts.js";
import { documentRequired, generateAccordionDOM } from "../accordion/accordion.js";

export default async function decorate(block) {

  const resp = await fetchPlaceholders();
  //console.log("placeholder resp :: ", resp);
  // each row is an accordion entry
  const accordions = [...block.children];

  // loop through all accordion blocks
  [...accordions].forEach((accordion) => {
    // generate the accordion
    const accordionDOM = generateAccordionDOM(accordion);
    // empty the content ,keep root element with UE instrumentation
    accordion.textContent = "";
    // add block classes
    accordion.classList.add("accordion", "block");
    accordion.append(accordionDOM);

    try {
      mediaLiClickAnalytics(accordionDOM);
    } catch (error) {
      console.warn(error);
    }
  });

  // use same styling as shade-box from /docs
  block.classList.add("shade-box");
  try {
    openFunctionFAQ(block);
    block.closest(".faq-view-more-logic") ? viewMoreLogicFAQ() : "";
    if(document.querySelector('.documents-required-brown')){
      documentRequired();
    }
  } catch (error) {
    console.error(error);
  }
}

function openFunctionFAQ(block) {
  const titles = block.querySelectorAll("details summary");

  titles.forEach(function (title) {
    title.addEventListener("click", function () {
      if (this.classList.contains('active')) {
        setTimeout(() => {
          this.closest("details").removeAttribute("open");
        });
        this.classList.remove("active");
      } else {
        titles.forEach(function (title) {
          title.closest("details").removeAttribute("open");
          title.classList.remove("active");
        });

         /*  FAQ Analytics Start */
          try {
            const dataAnalytics = {};
            if(title.closest(".documents-required-brown")){
              dataAnalytics.click_text = title.querySelector("h3").textContent.trim();
              documentRequiredInteraction(dataAnalytics)
            }
            else{
            dataAnalytics.click_text = title.textContent.trim();
            faqInteraction(dataAnalytics);
            }
          } catch (error) {
            console.warn(error);
          }
       /*  FAQ Analytics End */

        this.classList.toggle("active");
      }
    });
  });

}

function viewMoreLogicFAQ() {
  document.querySelectorAll(".faq-section-wrapper.faq-view-more-logic").forEach((each) => {
    const allFAQSection = each.querySelectorAll(".accordion.block");

    allFAQSection.forEach((eachFAQ, index) => {
      if (index == 5) {
        eachFAQ.classList.add("faq-blur");
      }
      eachFAQ.classList.toggle("dp-none", index > 5);
    });

    const buttonContainer = each.querySelector(".button-container");
    if (buttonContainer) {
      const buttonText = buttonContainer.querySelector("a").textContent.trim();
      buttonContainer.innerHTML = buttonText;
      viewMoreFAQ(each);
    }
  });
}
function viewMoreFAQ(eachs) {
  const faqButtonContainer = eachs.querySelector(".faq-section-wrapper .button-container");
  faqButtonContainer.addEventListener("click", function () {
    
    try {
      let data= {};
      data.click_text = this.textContent.trim();
      data.cta_position = this.closest('.section').querySelector('.default-content-wrapper').querySelector('h1, h2, h3, h4, h5, h6').textContent.trim();
      ctaClickInteraction(data);
    } catch (error) {
      console.warn(error);
    }

    const isViewMoreFAQ = this.textContent.toLowerCase() === "view more";
    this.innerText = isViewMoreFAQ ? "View Less" : "View More";

    eachs.querySelectorAll(".accordion.block").forEach((eachFAQ, index) => {
      if (index == 5) {
        var checkBlurClass = eachFAQ.classList.contains("faq-blur");
        checkBlurClass ? eachFAQ.classList.remove("faq-blur") : eachFAQ.classList.add("faq-blur");
      }
      eachFAQ.classList.toggle("dp-none", !isViewMoreFAQ && index > 5);
    });

  });
}

function mediaLiClickAnalytics(accordionDOM){
  accordionDOM.querySelectorAll('ul > li > a').forEach(function (eachHref) {
    eachHref.addEventListener('click', function(){
      let data= {};
      data.click_text = this.textContent.trim();
      data.cta_position = this.closest('.accordion').querySelector('summary').textContent.trim();
      ctaClickInteraction(data);
    });
  });
}
