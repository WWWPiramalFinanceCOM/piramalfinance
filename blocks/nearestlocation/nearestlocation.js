import{fetchPlaceholders as d}from"../../scripts/aem.js";import{branchURLStr as l,selectBranchDetails as m}from"../../scripts/scripts.js";import{setLocationObj as h}from"../moredetailsaddress/moredetailsaddress.js";export function nearestLoction(s){const{storedata:a}=h;if(!a||a.length==0)return!1;let r="";const e=a[0].City;return a.forEach(t=>{const c=t.State,i=t.City,n=t["Location Code"],o=t.Location;r+=`
        <div class='card-box'>
        <h3 class='card-title'>${t.Location}</h3>
        <p class='card-address'>${t.Address}</p>
        <p class='card-gmail'> <span> <img src='/images/gmail.svg' alt='gmail-icon'/> </span> ${s.branchlocatorgmail}</p> 
        <a href="${l(o,i,c,"loans",n)}" id='more-details-btn'> ${s.moredetailtext} </a> 
        </div>`}),`<div class='cards-branches cards-branches-container mt-45 mb-40 mob-mb-45'>
            <div class='title'>
                 <h2 class="title-to-show"> Find all ${e} Branches here </h2>
            </div>
            <div class='cards-container'>
                <div class='cards-wrapper branch-list-wrapper'>
                    ${r}
                </div>
            </div>
        </div>`}export default async function p(s){const a=await d(),r=nearestLoction(a);r&&(s.innerHTML=r),m(s)}
