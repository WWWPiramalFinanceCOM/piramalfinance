import{ctaClickInteraction as c}from"../../dl.js";import{fetchAPI as l,getProps as s,renderHelper as u}from"../../scripts/scripts.js";export default async function f(t){const[r]=s(t),e=await(await l("GET",r)).json(),a=u(e.data.sort((i,o)=>i.text<o.text?-1:i.text>o.text?1:0),`<div class="forName">
        <li><a href="{url}" title="{text}">{text}</a></li>    
    </div>`);t.innerHTML=`<ul>${a}</ul>`,d(t)}function d(t){t.querySelectorAll("li").forEach(r=>{r.addEventListener("click",n=>{const e={};e.click_text=n.target.textContent.trim(),e.cta_position=n.target.closest(".section").querySelector(".default-content-wrapper").querySelector("h1, h2, h3, h4, h5, h6").textContent.trim(),c(e)})})}

    