import{ctaClickInteraction as g}from"../../dl.js";import{fetchAPI as C,getProps as S,renderHelper as v}from"../../scripts/scripts.js";export default async function E(o){const s=S(o),[c,u,d]=s;o.innerHTML="";try{let A=function(t){o.querySelectorAll(".subAccordianBox").forEach(e=>{t.target.parentElement.classList.contains("active")||(e.classList.remove("active"),e.querySelectorAll(".subAccordianContent,.grey-border").forEach(r=>{r.style.display="none"}))});const a=t.target.parentNode,l=getSiblings(a);a.classList.toggle("active"),l.forEach(e=>{e.classList.remove("active")}),a.querySelectorAll(".subAccordianContent").forEach(e=>{const r=window.getComputedStyle(e);e.parentElement.style.display=r.getPropertyValue("display")==="none"?"block":"none",e.style.display=r.getPropertyValue("display")==="none"?"block":"none"}),l.forEach(e=>{const r=e.querySelector(".subAccordianContent");window.getComputedStyle(r).getPropertyValue("display")==="block"&&(r.style.display="none")});try{const e={};e.click_text=t.target.textContent.trim(),e.cta_position=t.target.closest(".section").querySelector(".default-content-wrapper").querySelector("h1, h2, h3, h4, h5, h6").textContent.trim(),g(e)}catch(e){console.warn(e)}};const p=(await(await C("GET",c)).json()).result[0];let f;d==="ascending"?f=Object.keys(p).sort((t,a)=>t-a):f=Object.keys(p).sort((t,a)=>a-t);const y=["January","February","March","April","May","June","July","August","September","October","November","December"];f.forEach(t=>{const a=p[t][0];let l;d==="ascending"?l=Object.keys(a).sort((e,r)=>y.indexOf(e)-y.indexOf(r)):l=Object.keys(a).sort((e,r)=>y.indexOf(r)-y.indexOf(e));let b="";l.forEach(e=>{const r=a[e].sort((h,m)=>new Date(m.pdfDate)-new Date(h.pdfDate));b+=`  
                                <div class="subAccordianContent" style="display: nona;">
                                    <div class="publicDisclosuresWrap">
                                        <div class="innersubAccordianContent">
                                            <a href="javascript:;" class="innersubAccordianTitle">${e}</a>
                                            <div class="publicDisclosuresWrap innerSubAccordianData" style="display: none;" >
                                                <ul> ${v(r,`
                                                    <div class="forName">    
                                                        <li data-date="{pdfDate}">
                                                            <a href="{PdfPath}" data-category="{Pdf_Category}" target="_blank">
                                                                <span class="created-date">{Created_Date}</span>
                                                                {Title}</a>
                                                        </li>
                                                    </div>
                                                    `)} 
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `}),o.innerHTML+=`
                        <section class="accordianpdf-section">
                            <div class="container boxContainer">
                                <div class="accordianContent">
                                    <div class="accordianBox">
                                        <div class="subAccordianWrap">
                                            <div class="subAccordianBox">
                                                <a href="javascript:;" class="subAccordianTitle"
                                                    data-accordianpdf-folderpath="/content/dam/piramalfinance/pdf/stakeholder/financial-reports/2024"
                                                    data-accordianpdf-folderdepth="2">${t}</a>
                                                    <div class="grey-border" style="display: none;">
                                                ${b}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    `}),o.querySelectorAll(".subAccordianContent").forEach(t=>{t.style.display="none"}),o.querySelectorAll(".subAccordianTitle").forEach(t=>{t.addEventListener("click",A)}),o.querySelectorAll(".innersubAccordianTitle").forEach(t=>{t.addEventListener("click",handleInnerAccordionClick)})}catch(n){console.error(n)}}export function handleInnerAccordionClick(o){const s=o.target.parentNode;s.closest(".grey-border").querySelectorAll(".subAccordianContent").forEach(n=>{o.target.closest(".subAccordianContent")===n||(n.querySelectorAll(".innersubAccordianContent").forEach(i=>{i.classList.remove("active")}),n.querySelectorAll(".innerSubAccordianData").forEach(i=>{i.style.display="none"}))});const c=getSiblings(s);s.classList.toggle("active"),c.forEach(n=>{n.classList.remove("active")});const u=s.querySelector(".innerSubAccordianData"),d=window.getComputedStyle(u);u.style.display=d.getPropertyValue("display")==="none"?"block":"none",c.forEach(n=>{const i=n.querySelector(".innerSubAccordianData");window.getComputedStyle(i).getPropertyValue("display")==="block"&&(i.style.display="none")});try{const n={};n.click_text=o.target.textContent.trim(),n.cta_position=o.target.closest(".section").querySelector(".default-content-wrapper").querySelector("h1, h2, h3, h4, h5, h6").textContent.trim(),g(n)}catch(n){console.warn(n)}}export function getSiblings(o){const s=[];let c=o.parentNode.firstChild;for(;c;c=c.nextSibling)c.nodeType===1&&c!==o&&s.push(c);return s}
