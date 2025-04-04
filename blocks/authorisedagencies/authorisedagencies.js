import{CFApiCall as u,targetObject as l}from"../../scripts/scripts.js";import{ctaClickInteraction as v}from"../../dl.js";export default async function y(t){const o=t.textContent.trim(),n=(await u(o)).data,e=g(n);L(t,e),f(t,e),l.isTab||l.isMobile?p(t,"",e.grouped,1):p(t,"",e.grouped,2)}function g(t){const o=t.reduce((n,e)=>{const a=e.Location.charAt(0).toUpperCase()+e.Location.slice(1).toLowerCase();return n[a]=n[a]||[],n[a].push(e),n},{}),i=Object.keys(o).sort((n,e)=>n.localeCompare(e,void 0,{sensitivity:"base"}));return{grouped:o,sortedCities:i}}function L(t,{grouped:o,sortedCities:i}){const n=i.map(e=>`
      <label>
        <input type="radio" value="${e}" name="branchlocation">
        <span>${e}</span>
      </label>
    `).join("");t.innerHTML=`
    <div class="select-container-wrapper">
      <div class="select-container">
        <label>Select Location</label>
        <input class="toggleCityContainer" readOnly value="Location">
      </div>
      <div class="cities-container" style="display:none;">
        <fieldset>
          <legend>locations</legend>
          ${n}
        </fieldset>
      </div>
    </div>
  `}function f(t,o){const i=t.querySelector(".select-container"),n=t.querySelector(".cities-container"),e=t.querySelector(".toggleCityContainer");let a;e.addEventListener("click",()=>{n.style.display=n.style.display==="none"?"block":"none",i.classList.toggle("open")}),n.addEventListener("change",s=>{const r=s.target.value;a=r,e.value=r,e.className="cityBlack",n.style.display="none",i.classList.remove("open");try{const c={};c.click_text=s.target.closest("label").querySelector("span").textContent.trim(),c.cta_position="Select Location",v(c)}catch(c){console.warn(c)}p(t,r,o.grouped)}),window.onscroll=()=>p(t,a,o.grouped)}function p(t,o,i,n){const e=t.querySelector(".card-container")||document.createElement("div");e.className="card-container",e.innerHTML="",t.appendChild(e);const a=o?{[o]:i[o]}:i;Object.keys(a).slice(0,n).forEach(s=>{a[s].forEach(r=>{const d=`
        <div class="card">
          <div>
            <p>Location</p>
            <p>${C(r.Location)}</p>
          </div>
          <div>
            <p>Agency Address</p>
            <p>${r["Agency Address"]}</p>
          </div>
          <div>
            <p>Vendor Name:</p>
            <p>${r["Vendor Name"]}</p>
          </div>
          <div>
            <p>Date of Agreement:</p>
            <p>${r["Date of Agreement"]}</p>
          </div>
          <div>
            <p>Date of Expiry:</p>
            <p>${r["Date of Expiry"]}</p>
          </div>
          <div>
            <p>Tenure:</p>
            <p>${r.Tenure}</p>
          </div>
          <div>
            <p>Agency Signatory:</p>
            <p>${r["Agency owner"]}</p>
          </div>
          <div>
            <p>Contact No.:</p>
            <p>${r["Contact No"]}</p>
          </div>
        </div>
      `;e.innerHTML+=d})})}function C(t){return t.split(" ").map(i=>{const n=i.toLowerCase();return n.charAt(0).toUpperCase()+n.slice(1)}).join(" ")}
