import{applyLoanNow as j,bannerClick as B,ctaClick as F,ctaClickInteraction as l,readMoreInteraction as G}from"../../dl.js";import{targetObject as n,handleOpenFormOnClick as W}from"../../scripts/scripts.js";export function decorateButtons(...r){return r.map(e=>{const a=e.querySelector("a");return a?(a.classList.add("button"),a.parentElement.tagName==="EM"&&a.classList.add("secondary"),a.parentElement.tagName==="STRONG"&&a.classList.add("primary"),a.outerHTML):""}).join("")}function y(r){const e=document.createElement("a");return e.href=r.innerText.trim(),e}export function generateTeaserDOM(r,e){document.createElement("a").classList.add("null-dom");const[d,$,m,x,v,u,S,I,H,Q,C,_,A,V,q,E,D,X,T,N,w]=r,o=d.querySelector("picture"),L=$.querySelector("picture"),O=u.textContent.trim()!=="",p=C.querySelector("a")||y(C),g=q.querySelector("a")||y(q),h=T.querySelector("a")||y(T);p.innerHTML=H.innerHTML,g.innerHTML=A.innerHTML,h.innerHTML=D.innerHTML;let f;[...e].includes("original-img")?f=o?.querySelector("img")?.src&&o?.querySelector("img").src?` style='background-image:url(${o?.querySelector("img").src.split("?")[0]})' `:"":f=o?.querySelector("img")?.src&&o?.querySelector("img").src?` style='background-image:url(${o?.querySelector("img").src})' `:"";const P=w?.querySelector("img")?.src?` style='background-image:url(${w?.querySelector("img")?.src})' `:"";let k=f;n.isTab&&(k=P);const s=document.createRange().createContextualFragment(`
    <div class='background' ${k}'>
      <div class="front-picture">${L?L.outerHTML:""}</div>
      <div class='foreground'>
        <div class='text'>
          ${m.textContent.trim()!==""?`<div class='eyebrow'>${m.textContent.trim()}</div>`:""}
          <div class='title'>${x.innerHTML}</div>
          <div class='long-description'>${v.innerHTML}</div>
          <!-- <div class='short-description'>${O?u.innerHTML:v.innerHTML}</div>-->
          <div class='short-description'>${u.innerHTML}</div>
          <div class='cta-image-wrapper'>
            <div class="img-with-text-wrap">
              <div class="cta-image">${p?p.outerHTML:""}</div>
              <p class="cta-text">${_.innerText}</p>
            </div>
            <div class="img-with-text-wrap">
              <div class="cta-image">${g?g.outerHTML:""}</div>
              <p class="cta-text">${E.innerText}</p>
            </div>
            <div class="img-with-text-wrap">
              <div class="cta-image">${h?h.outerHTML:""}</div>
              <p class="cta-text">${N.innerText}</p>
            </div>
          </div>
          <div class='cta'>${decorateButtons(S,I)}</div>
        </div>
        <div class='spacer'></div>
      </div>
  `),M=[...e].find(i=>i.startsWith("bg-"));M&&s.querySelector(".foreground").style.setProperty("--teaser-background-color",`var(--${M.substr(3)})`),s?.querySelectorAll("a").forEach((i,b)=>{i.addEventListener("click",function(t){try{if(t.target.closest(".calc-desktop-carousel-wrapper"))if(this.closest(".carousel-articles-wrapper"))J(t);else if(this.closest(".csr-committee-wrapper"))K(t);else if(t.target.closest(".media-cards-wrapper")){const c={};c.click_text=t.target.closest(".long-description").querySelector("p").textContent.trim(),c.cta_position=t.target.closest(".section").querySelector(".tab-name-wrapper .carousel-inner .active").textContent.trim(),l(c)}else if(t.target.closest(".calc-desktop-carousel-wrapper")){const c={};c.click_text=t.target.closest(".text").querySelector(".long-description p").textContent.trim(),c.cta_position=t.target.closest(".section").querySelector(".default-content-wrapper").textContent.trim(),l(c)}else j(`${m.textContent.trim()} ${x.textContent.trim()}`,n.pageName,"banner",n.pageName);else{if(t.target.closest(".multi-calc-teaser-wrapper")||(b||t.target.closest(".cta"))&&B(t.target.innerText,n.pageName),t.target.closest(".multi-calc-teaser-wrapper")){const c=t.target.textContent.trim(),R="",U=t.target.closest(".foreground").querySelector(".long-description").querySelector("p").textContent.trim();F(c,U,R,n.pageName)}if(t.target.closest(".open-form-on-click")){const c=t.target.closest(".open-form-on-click");W(c)}}}catch(c){console.warn(c)}})});try{[...e]?.includes("click-able")&&s.children[0].addEventListener("click",function(b){try{if(this.closest(".section.board-of-directors-wrapper")){const t={};t.click_text=this.querySelector(".title").textContent.trim(),t.cta_position=this.closest(".section").querySelector(".default-content-wrapper").querySelector("h1, h2, h3, h4, h5, h6").textContent.trim(),l(t)}}catch(t){console.warn(t)}location.href=S.innerText})}catch{}return s}export default function z(r){const e=[...r.children].map(d=>d.firstElementChild),a=generateTeaserDOM(e,r.classList);r.textContent="",r.append(a)}function J(r){const e={};e.article_name=r?.target.getAttribute("href").split("/").pop(),e.cta_position=r?.target.closest(".section").querySelector(".default-content-wrapper").querySelector("h1, h2, h3, h4, h5, h6").textContent.trim(),e.click_header=r?.target.textContent.trim(),G(e)}function K(r){const e={};e.click_text=r.target.textContent.trim(),e.cta_position=r.target.closest(".section").querySelector(".default-content-wrapper").querySelector("h1, h2, h3, h4, h5, h6").textContent.trim(),l(e)}
