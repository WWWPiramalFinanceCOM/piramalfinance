export default function p(n){const c=n.parentElement.closest(".section"),o=Array.from(c.children);let r=!1,t,e;e=document.createElement("div"),e.classList.add("wrapper-creation-container"),o.forEach((a,i)=>{t+1==i||r?(r=!0,e.append(a)):a.classList.contains("wrappercreation-wrapper")&&(t=i)}),n.innerHTML="",n.appendChild(e)}

