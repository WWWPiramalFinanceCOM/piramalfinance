import{renderCalculatorData as u}from"../emiandeligiblitycalc/renderhpcal.js";import{homeLoanCalcFunc as m}from"../emiandeligiblitycalc/homeloancalculators.js";import{CalcHTM as d}from"../emiandeligiblitycalc/templatehtml1.js";import{firstTabActive as y}from"../emiandeligiblitycalc/commonfile.js";import{calculatorFlatStrLogic as p,CFApiCall as f,targetObject as c}from"../../scripts/scripts.js";let r,i,n,C;export default async function g(t){const a=t.textContent.trim(),l=(await f(a)).data,e=p(l);t.innerHTML=d(e);try{i=document.querySelector(".home-page-calculator-call-xf .eligibilitycalculator-wrapper"),n=i.querySelector(".cmp-container--caloverlay"),eligibilityCalculatorCallXf()}catch(s){console.warn(s)}}export function eligibilityCalculatorCallXf(){document.querySelectorAll("[data-teaserv2-xf='homepage-eligibility-calculator-call-xf']")&&document.querySelectorAll("[data-teaserv2-xf='homepage-eligibility-calculator-call-xf']").forEach(t=>{t.addEventListener("click",function(a){a.stopImmediatePropagation();const o=this.getAttribute("data-teaserv2-xf"),l=document.querySelector(".home-page-calculator-call-xf"),e=document.querySelector(".home-page-calculator-call-xf .eligibilitycalculator-wrapper");l.querySelector(".eligibilitycalculator-wrapper").querySelector(".overlayDiv").classList.add("show"),o=="homepage-eligibility-calculator-call-xf"&&(c.calculatorType="Eligibility Calculator",l.classList.remove("dp-none"),document.querySelector(".modal-overlay").classList.add("overlay"),document.querySelector(".modal-overlay").classList.remove("dp-none"),r="eligibility",n.classList.add("show"),document.body.style.overflow="hidden",m(e),u(e,r),y(e)),c.model=e})})}
