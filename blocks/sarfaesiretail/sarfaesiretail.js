import{CFApiCall as f,targetObject as a}from"../../scripts/scripts.js";export default async function u(t){const n=t.textContent.trim(),e=(await f(n)).data;let r=0;e.length<60?r=e.length:r=60,a.isTab||a.isMobile?o(t,e,20):o(t,e,r);let i=!1;window.onscroll=()=>{i||(o(t,e),i=!0)}}function o(t,n,l){let e="",r="",i=[];n.slice(0,l).forEach(function(c,s){s||(i=L(c),e=p(i)),r+=d(c,i)}),t.innerHTML=`<table> ${e+r} <table>`}function d(t,n){return`<tr>${n.map(function(e){var r=t[e];return t[e+" URL"]?`<td><a target="_blank" href="${t[e+" URL"]}">${r}</a></td>`:`<td>${r}</td>`}).join("")}</tr>`}function p(t){return`
            <tr>
                ${t.map(n=>`<th>${n}</th>`).join("")}
            </tr>
        `}function L(t){return Object.keys(t).filter(n=>!n.includes("URL")||Object.keys(t).includes(n+" URL"))}

        