import{ctaClickInteraction as p}from"../../dl.js";import{getProps as v}from"../../scripts/scripts.js";export default function y(a){const[c,i,l,d,u,r,m,n]=v(a,{index:[3,7]});if(m==="secondary"){a.innerHTML=`
            <div class="richtext text boxContainer stakeholder-container popup-rich-text">
                <div  class="cmp-text">
                    <p>
                        <a href="${r}" target="_blank" rel="noopener noreferrer"> ${c}</a>
                    </p>
                </div>
            </div>    
        `;return}a.innerHTML=`
            <div class="richtext text boxContainer stakeholder-container popup-rich-text modal-cta">
                <div  class="cmp-text">
                    <p>${n.outerHTML.includes("picture")?n.outerHTML:c}</p>
                </div>
                <div class="stake-pop-up dp-none">
                    <div class="popup stake-document-popup">
                        <div class="text popupText">
                            <div class="cmp-text">
                                <div class="cpm-sub-text">
                                    <p><span class="title">${i}</span></p>
                                    <p><span class="description">${l}</span></p>
                                    <p class="cross-container">
                                        <img src="/content/dam/piramalfinance/company/about-us/partnership/close.png" alt="close">
                                    </p>
                                </div>
                                <div class="popup-parent-cont">
                                    <div class="popupContainer">
                                        ${d.innerHTML}
                                        <p>
                                            <span class="popupbutton">
                                                <a href="${r}"
                                                    target="_blank">
                                                    ${u}
                                                </a>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>    
    `,a.querySelectorAll(".offer-documents.block .modal-cta >.cmp-text").forEach(s=>{s.addEventListener("click",function(t){t.stopImmediatePropagation();try{const o={};o.click_text=this.querySelector("img").getAttribute("alt"),o.cta_position=t.target.closest(".section").querySelector(".default-content-wrapper").querySelector("h1, h2, h3, h4, h5, h6").textContent.trim(),p(o)}catch(o){console.warn(o)}t.target.closest(".cmp-text").classList.add("active");const e=t.target.closest(".popup-rich-text").querySelector(".stake-pop-up");e.classList.contains("dp-none")?(e.classList.add("dp-block"),document.body.style.overflow="hidden",e.classList.remove("dp-none"),document.querySelector(".modal-overlay").classList.add("overlay"),document.querySelector(".modal-overlay").classList.remove("dp-none")):(e.classList.add("dp-none"),e.classList.remove("dp-block"),document.body.removeChild(overlay),document.body.style.overflow="auto",document.querySelector(".modal-overlay").classList.remove("overlay"),document.querySelector(".modal-overlay").classList.add("dp-none")),t.stopPropagation(),t.target.classList.contains("cross-container")})}),document.querySelectorAll(".stake-pop-up .text.popupText .cmp-text .cross-container img").forEach(s=>{s.addEventListener("click",function(t){try{const e={};e.click_text=this.closest(".offer-documents-wrapper").querySelector(".stake-pop-up .stake-document-popup .cpm-sub-text p").textContent.trim(),e.cta_position=t.target.closest(".section").querySelector(".default-content-wrapper").querySelector("h1, h2, h3, h4, h5, h6").textContent.trim(),p(e)}catch(e){console.warn(e)}t.stopImmediatePropagation(),document.querySelector(".cmp-text.active")&&document.querySelector(".cmp-text.active").classList.remove("active"),t.target.closest(".stake-pop-up").classList.remove("dp-block"),t.target.closest(".stake-pop-up").classList.add("dp-none"),document.body.style.overflow="auto",document.querySelector(".modal-overlay").classList.remove("overlay"),document.querySelector(".modal-overlay").classList.add("dp-none")})})}
