import{generateDetailedTeaserDOM as L}from"../detailed-teaser/detailed-teaser.js";import{generateTeaserDOM as u}from"../teaser/teaser.js";import{renderTeaserHTMLFactory as v}from"../teaserv2/teaserv2.js";const s={};s["detailed-teaser"]=L,s.teaserv2=v;export default function C(e){const o=e.children[0].innerText.trim(),c=e.children[1].innerText.trim()||"dp-none",h=e.closest(".section").querySelector(`#${o}`);e.classList.add(c),c==="active"&&h.classList.add("active");const i=document.createElement("div");i.classList.add("panel-container"),e.dataset.id=o.trim().replace(/ /g,"-");const g=Array.from(e.children).slice(2);e.children[0].remove(),e.children[1].remove(),[...g].forEach((r,T)=>{const[d,l,x,...m]=r.children,p=x.textContent.trim(),a=(p?p.split(","):[]).map(t=>t&&t.trim()).filter(t=>!!t);let f="teaser",n=null;a.forEach(t=>{s[t]&&(f=t,n=s[t])}),n=n?n([d,l,...m],a):u([d,l,...m],a),r.textContent="",r.classList.add(f,"block"),a.forEach(t=>r.classList.add(t.trim())),r.dataset.panel=`panel_${T}`,r.append(n),i.append(r)}),e.textContent="",e.append(i)}

