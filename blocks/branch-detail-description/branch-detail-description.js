import{intertextLinkingInteraction as p}from"../../dl.js";import{setLocationObj as d}from"../moredetailsaddress/moredetailsaddress.js";export default function u(e){const{pagecontent:t,geoInfo:{location:c}}=d;if(!t)return!1;const s=t.split(" ").slice(0,14).join(" "),r=t.split(" ").slice(14,90).join(" "),i=t.split(" ").slice(90).join(" ");e.innerHTML=`
        <div class="branch-description-wrapper">
            <h2 class="branch-heading">About Piramal Finance ${c} Branch</h2>
            <p>
                <span class="branch-description-content">
                    <strong>${s}</strong>${r}
                    <span class='dp-none'>${i}</span>
                </span>
                <button class="button-container">Read More</button>
            </p>
        </div>
    `;const o=e.querySelector(".button-container"),a=e.querySelector(".branch-description-content");o.addEventListener("click",l=>{try{const n={};n.click_text=l.target.textContent.trim().toLowerCase(),p(n)}catch(n){console.warn(n)}a.querySelector(".dp-none").classList.remove("dp-none"),o.classList="dp-none"})}
