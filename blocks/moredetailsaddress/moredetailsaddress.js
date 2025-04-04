import{getMetadata as p}from"../../scripts/aem.js";import{CFApiCall as b}from"../../scripts/scripts.js";export const setLocationObj={getExcelData:null,geoInfo:{city:"",state:"",country:"",location:"",locationcode:""}};const O="AIzaSyDx1HwnCLjSSIm_gADqaYAZhSBh7hgcwTQ",L={};export default async function $(t){const e=Array.from(t.children,h=>h.firstElementChild),[n,o,s,a,r,i,l,d]=e,f=d.textContent.trim(),u=(await b(f))?.data;setLocationObj.getExcelData=sessionStorage.getItem("data")?JSON.parse(sessionStorage.getItem("data")):T(u),sessionStorage.getItem("data")||sessionStorage.setItem("data",JSON.stringify(setLocationObj.getExcelData)),i?.querySelector("picture > img")?.setAttribute("alt",l?.textContent?.trim()||"");const c=`
    <div class="address-wrapper">
      <div class="address-title">${n.innerHTML}</div>
      <div class="address-desktop">${o.innerHTML}</div>
      <div class="address-mobile">${s.innerHTML}</div>
      <div class="address-timing">${a.innerHTML}</div>
      <div class="address-info">${r.innerHTML}</div>
      <div class="address-img">${i.innerHTML}</div>
    </div>
  `;t.innerHTML=c,await v(),I()}async function v(){const t=location.href;if(t.split("/").pop().includes("loans-in")){const o=t.split("/").pop().split("-").pop(),a=Object.values(setLocationObj.getExcelData).flat().find(r=>r["Location Code"]==o);a&&(Object.assign(setLocationObj.geoInfo,{state:y(a.State),city:y(a.City),locationcode:a["Location Code"],location:a.Location}),Object.assign(setLocationObj,{lat:a.Latitude,lng:a.Longitude,address:a.Address,pincode:a.Pincode,pagecontent:a["On Page Content"]}))}x();const n=await M();if(n){setLocationObj.distance=A(setLocationObj.lat,setLocationObj.lng,n.lat,n.lng);let o=document.createElement("li");const s=document.querySelector(".address-info ul");setLocationObj.distance<=40?(o.innerText=`${setLocationObj.distance.toFixed()} Km away from your location`,s.append(o)):o.remove()}setLocationObj.storedata=D(setLocationObj.getExcelData[setLocationObj.geoInfo.state])}function M(){return new Promise(t=>{"geolocation"in navigator?navigator.geolocation.getCurrentPosition(e=>{L.lat=e.coords.latitude,L.lng=e.coords.longitude,t(L)},e=>{console.error("Error getting user location:",e),t(null)}):(console.error("Geolocation is not supported by this browser."),t(null))})}function x(){document.querySelector(".address-title h1").innerText=setLocationObj.geoInfo.location,document.querySelector(".address-desktop p").innerText=setLocationObj.address,document.querySelector(".address-mobile p").innerText=setLocationObj.address}function I(){const{city:t,location:e,locationcode:n,state:o}=setLocationObj.geoInfo,s=(C,w=!1)=>{const m=C.toLowerCase().replace(/\s+/g,"-");return w?m.charAt(0).toUpperCase()+m.slice(1):m},a=s(o),r=s(t),i=s(e.replace(/[()/]/g,"").trim()),l=s(o,!0),d=s(t,!0),f=e.charAt(0).toUpperCase()+e.slice(1),u='<span class="breadcrumb-separator"><svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9.00195L4.29293 5.70902C4.68182 5.32013 4.68182 4.68377 4.29293 4.29488L1 1.00195" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>',c=[`<a href="${p("primary-language-path")}/branch-locator/${a}">${l}</a>`];r==i?c.push(`<a href="${p("primary-language-path")}/branch-locator/${a}/${r}">${d}</a>`):r!==i&&(c.push(`<a href="${p("primary-language-path")}/branch-locator/${a}/${r}">${d}</a>`),c.push(`<a href="${p("primary-language-path")}/branch-locator/loans-in-${i}-${r}-${a}-${n}">${f}</a>`));const h=c.join(u);document.querySelector("body .breadcrumb nav").insertAdjacentHTML("beforeend",u+h)}function A(t,e,n,o){const a=g(n-t),r=g(o-e),i=Math.sin(a/2)*Math.sin(a/2)+Math.cos(g(t))*Math.cos(g(n))*Math.sin(r/2)*Math.sin(r/2);return 6371*(2*Math.atan2(Math.sqrt(i),Math.sqrt(1-i)))}function g(t){return t*(Math.PI/180)}function D(t){var e=t.filter(function(n){return n.City.toLowerCase()===setLocationObj.geoInfo.city.toLowerCase()});return e}function T(t){return t.reduce((e,n)=>{const o=n.State.charAt(0).toUpperCase()+n.State.slice(1).toLowerCase();return e[o]||(e[o]=[]),e[o].push(n),e},{})}function y(t){return t.charAt(0).toUpperCase()+t.slice(1).toLowerCase()}

  