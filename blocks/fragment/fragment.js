import{decorateMain as c}from"../../scripts/scripts.js";import{loadBlocks as a}from"../../scripts/aem.js";export async function loadFragment(t){if(t&&t.startsWith("/")){const r=await fetch(`${t}.plain.html`);if(r.ok){const e=document.createElement("main");e.innerHTML=await r.text();const n=(o,i)=>{e.querySelectorAll(`${o}[${i}^="./media_"]`).forEach(s=>{s[i]=new URL(s.getAttribute(i),new URL(t,window.location)).href})};return n("img","src"),n("source","srcset"),c(e),await a(e),e}}return null}export default async function l(t){const r=t.querySelector("a"),e=r?r.getAttribute("href"):t.textContent.trim(),n=await loadFragment(e);if(n){const o=n.querySelector(":scope .section");o&&(t.closest(".section").classList.add(...o.classList),t.closest(".fragment").replaceWith(...n.childNodes))}}
