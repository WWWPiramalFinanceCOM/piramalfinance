import{decorateButtons as m}from"../teaser/teaser.js";export function generateDetailedTeaserDOM(e,a){const[i,t,n,d,o,l,u]=e,r=i.querySelector("picture"),c=o.querySelector("picture");return t&&(t.classList.add("eyebrow"),[...t.children].forEach((s,v)=>{switch(v){case 0:s.classList.add(s.firstElementChild&&s.firstElementChild.tagName==="PICTURE"?"logo":"title");break;case 1:s.classList.add(s.previousElementSibling.classList.contains("eyebrow-title")?"subtitle":"title");break;case 2:s.classList.add("subtitle");break}})),document.createRange().createContextualFragment(`
    <div class='background'>${r?r.outerHTML:""}</div>
    <div class='foreground'>
      <div class='text'>
        ${t.outerHTML}
        <div class='title'>${n.innerHTML}</div>
        <div class='description'>${d.innerHTML}</div>
        <div class='cta'>${m(l,u)}</div>
      </div>
      <div class='spacer'>
        ${c?c.outerHTML:""}
      </div>
    </div>
  `)}export default function b(e){const a=[...e.children].map(t=>t.firstElementChild),i=generateDetailedTeaserDOM(a,e.classList);e.textContent="",e.append(i)}
