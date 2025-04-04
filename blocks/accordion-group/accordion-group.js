import{ctaClick as u,ctaClickInteraction as a,documentRequiredInteraction as f,faqInteraction as m}from"../../dl.js";import{fetchPlaceholders as d}from"../../scripts/aem.js";import{targetObject as p}from"../../scripts/scripts.js";import{documentRequired as q,generateAccordionDOM as h}from"../accordion/accordion.js";const l=[];export default async function y(o){const n=await d();[...[...o.children]].forEach(t=>{const c=h(t);if(t.textContent="",t.classList.add("accordion","block"),t.append(c),t.closest(".section.faq-section-wrapper")){let r=t?.querySelector("summary >div >p")?.textContent?.trim()||"",s=(t?.querySelector("details >div")?.textContent?.trim()||"")?.replace(/\s+/g," ")?.trim()?.replace(/\n/g," ")||"";l.push({"@type":"Question",name:r,acceptedAnswer:{"@type":"Answer",text:s}})}try{C(c)}catch(r){console.warn(r)}}),o.closest(".section.faq-section-wrapper")&&L(l),o.classList.add("shade-box");try{x(o),o.closest(".faq-view-more-logic")&&w(),document.querySelector(".documents-required-brown")&&q()}catch(t){console.error(t)}}function x(o){const n=o.querySelectorAll("details summary");n.forEach(e=>{e.addEventListener("click",function(t){if(this.classList.contains("active"))setTimeout(()=>{this.closest("details").removeAttribute("open")}),this.classList.remove("active");else{n.forEach(c=>{c.closest("details").removeAttribute("open"),c.classList.remove("active")});try{const c={};if(e.closest(".documents-required-brown")){c.click_text=e.querySelector("h3").textContent.trim(),f(c);const r=e.querySelector("h3").textContent.trim(),i="",s=e.closest(".section").querySelector(".default-content-wrapper").querySelector("h1, h2, h3, h4, h5, h6").textContent.trim();u(r,s,i,p.pageName)}else c.click_text=e.textContent.trim(),m(c)}catch(c){console.warn(c)}this.classList.toggle("active")}})})}function w(){document.querySelectorAll(".faq-section-wrapper.faq-view-more-logic").forEach(o=>{o.querySelectorAll(".accordion.block").forEach((t,c)=>{c==5&&t.classList.add("faq-blur"),t.classList.toggle("dp-none",c>5)});const e=o.querySelector(".button-container");if(e){const t=e.querySelector("a").textContent.trim();e.innerHTML=t,S(o)}})}function S(o){o.querySelector(".faq-section-wrapper .button-container").addEventListener("click",function(){try{const t={};t.click_text=this.textContent.trim(),t.cta_position=this.closest(".section").querySelector(".default-content-wrapper").querySelector("h1, h2, h3, h4, h5, h6").textContent.trim(),a(t)}catch(t){console.warn(t)}const e=this.textContent.toLowerCase()==="view more";this.innerText=e?"View Less":"View More",o.querySelectorAll(".accordion.block").forEach((t,c)=>{c==5&&(t.classList.contains("faq-blur")?t.classList.remove("faq-blur"):t.classList.add("faq-blur")),t.classList.toggle("dp-none",!e&&c>5)})})}function C(o){o.querySelectorAll("ul > li > a").forEach(n=>{n.addEventListener("click",function(){const e={};e.click_text=this.textContent.trim(),e.cta_position=this.closest(".accordion").querySelector("summary").textContent.trim(),a(e)})})}function L(o){let n={"@context":"https://schema.org","@type":"FAQPage",mainEntity:o};const e=document.createElement("script");e.type="application/ld+json",e.innerHTML=JSON.stringify(n)||"",document.head.append(e)}
