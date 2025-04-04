import{ctaClick as g,ctaClickInteraction as S,keyFeaturesInteraction as h}from"../../dl.js";import"../../scripts/aem.js";import{decoratePlaceholder as q,targetObject as w}from"../../scripts/scripts.js";export default async function x(e){e.innerHTML=await q(e);const i=[...e.children].map(r=>r),s=_(i),t=document.createElement("div");t.innerHTML=s,e.innerHTML="",e.append(t);try{featureDropDownClick(e),I(e),e.closest(".home-loans-products-wrapper.view-more-less-js")&&$(e)}catch(r){console.warn(r)}}function _(e){let[i,s,t,r,n,a,c,o,u,p,m,y,l,f,d,v]=e;i=i?.textContent?.trim()||"",s=s?.querySelector("div > div")||"",t=t?.querySelector("div > picture > img")?.src||"",r=r?.textContent.trim()||"",n=n?.querySelector("div > picture > img")?.src||"",a=a?.textContent?.trim()||"",c=c?.textContent?.trim()||"",o=o?.textContent?.trim()||"",u=u?.querySelector("div > picture > img")?.src||"",p=p?.querySelector("div > picture > img")?.src||"",y=y?.querySelector("div > div")||"",f=f?.querySelector("div > div")||"",v=v?.querySelector("div > div")||"",m=m?.querySelector("div > picture > img")?.src||"",l=l?.querySelector("div > picture > img")?.src||"",d=d?.querySelector("div > picture > img")?.src||"";const k=o?` 
    <div class="keyfeature-container">
        <div class="keyfeatures-info">
            <p class="heading">${o}</p>
            <img data-src="${u}" alt="plusicon"
                class="plusicon lozad" src="${u}"
                data-loaded="true" style="display: block;">
            <img data-src="${p}" alt="minusicon"
                class="minusicon lozad" style="display: none;"
                src="${p}" data-loaded="true">
            <div class="keyfeatures" style="display: none;">
                <div class="feature" id="hideshow">
                    <img data-src="${m}" alt="cost"
                        class="lozad" src="${m}"
                        data-loaded="true">
                    <div class="feature-details">
                        ${y.outerHTML}
                    </div>
                </div>
    
                <div class="feature" id="hideshow">
                ${l?`<img data-src="${l}" alt="Interest" class="lozad" src="${l}" data-loaded="true">`:""}
                    <div class="feature-details">
                        ${f.outerHTML}
                    </div>
                </div>
    
                <div class="feature" id="hideshow">
                ${d?`<img data-src="${d}" alt="Interest" class="lozad" src="${d}" data-loaded="true">`:""}
                    <div class="feature-details">
                    ${v.outerHTML}
                    </div>
                </div>
            </div>
        </div>
    </div>`:"";return`<div class="homeloanteaser teaser">
    <div id="" class="cmp-teaser">
        <a class="cmp-teaser__link" href="${i}">
            <div class="cmp-teaser__content">
                ${s.outerHTML}
            </div>
            <div class="cmp-teaser__image">
                <div data-cmp-is="image"
                    data-cmp-filereference="${t}" data-cmp-hook-image="imageV3" class="cmp-image" itemscope=""
                    itemtype="">
                    <img loading="lazy" class="cmp-image__image" itemprop="contentUrl" alt="${r}" src="${t}">
                </div>
            </div>
        </a>
        <a href="${c}" class="redirectionbutton">
        <img
                data-src="${n}" class="lozad"
                src="${n}" data-loaded="true" alt="${a}">
        </a>
       ${k}
    </div>
</div>`}export function featureDropDownClick(e){e.querySelectorAll(".keyfeatures-info .heading").forEach(s=>{s.addEventListener("click",function(t){t.stopImmediatePropagation();const r=this.closest(".wrapper-creation-container"),n=r.querySelectorAll(".keyfeatures-info .keyfeatures"),a={};a.click_text=t.target.closest(".keyfeatures-wrapper")?.querySelector(".cmp-teaser__content p")?.textContent.trim(),a.cta_position=t.target.closest(".section")?.querySelector(".default-content-wrapper")?.textContent.trim(),h(a);try{const c="",o=a.cta_position;g(a.click_text,o,c,w.pageName)}catch(c){console.log(c)}n.forEach(c=>{c.style.display==="none"?(c.style.display="block",r.querySelectorAll(".plusicon").forEach(o=>{o.style.display="none"}),r.querySelectorAll(".minusicon").forEach(o=>{o.style.display="block"})):(c.style.display="none",r.querySelectorAll(".plusicon").forEach(o=>{o.style.display="block"}),r.querySelectorAll(".minusicon").forEach(o=>{o.style.display="none"}))})})})}function $(e){const i=e.closest(".home-loans-products-wrapper.view-more-less-js"),s=i?.querySelector(".wrappercreation-wrapper");(s?.querySelectorAll(".keyfeatures-wrapper")).forEach((n,a)=>{n.classList.toggle("dp-none",a>2)});const r=s.querySelector(".button-container");if(r){const n=r?.textContent.trim();r.innerHTML=n,C(i)}}function C(e){const i=e.querySelector(".wrappercreation-wrapper .button-container");!e.dataset.clickAdded&&i.addEventListener("click",function(){try{const t={};t.click_text=this.textContent.trim(),t.cta_position=this.closest(".section").querySelector(".default-content-wrapper").querySelector("h1, h2, h3, h4, h5, h6").textContent.trim(),S(t)}catch(t){console.warn(t)}const s=this.textContent.toLowerCase()==="view more";e.querySelectorAll(".keyfeatures-wrapper").forEach((t,r)=>{t.classList.toggle("dp-none",!s&&r>2)}),s?(this.innerText="View Less",this.classList.add("up-arrow")):(this.innerText="View More",this.classList.remove("up-arrow"),L(e))}),e.dataset.clickAdded||(e.dataset.clickAdded=!0)}function L(e){window.matchMedia("(max-width: 767px)").matches?window.scroll({top:e.offsetTop-100,left:0,behavior:"smooth"}):window.matchMedia("(max-width: 1024px)").matches?window.scroll({top:e.offsetTop-140,left:0,behavior:"smooth"}):window.scroll({top:e.offsetTop-180,left:0,behavior:"smooth"})}function I(e){const i=[],s=e.querySelector(".cmp-teaser__link"),t=e.querySelector(".redirectionbutton");i.push(s),i.push(t),i.forEach(r=>{r.addEventListener("click",n=>{const a={};a.click_text=n.target.closest(".cmp-teaser")?.querySelector(".cmp-teaser__content p")?.textContent.trim(),a.cta_position=n.target.closest(".section")?.querySelector(".default-content-wrapper strong")?.textContent.trim()||n.target.closest(".section")?.querySelector(".default-content-wrapper")?.textContent.trim(),h(a);try{const c="",o=a.cta_position;g(a.click_text,o,c,w.pageName)}catch(c){console.log(c)}})})}
