import{createElement as x}from"../../scripts/scripts.js";import{HOME as H,RIGHTARROW as T}from"../../scripts/constants.js";import{getMetadata as b}from"../../scripts/aem.js";const M=async e=>{const t=await fetch(e);if(t.ok){const a=document.createElement("div");return a.innerHTML=await t.text(),a.querySelector('[name="page-name"]')?.getAttribute("content")}return""},y=async(e,t)=>{const a=[];let i=t;window.location.host.includes("author")||(i<=4?i=1:i-=3);const c=e.replace(/^\/|\/$/g,"").split("/");let n="";for(let r=0;r<=c.length-2;r+=1){n=`${n}/${c[r]}`;let o=`${window.location.origin}${n}`;if(window.location.host.includes("author")&&(o=`${window.location.origin}${n}.html`),r>=i-1){const m=await M(o);m&&a.push({pathVal:n,name:m,url:o})}}return a},w=e=>{const t=document.createElement("a");return t.href=e.url,e.name!=="HomePage"?t.innerText=e.name:(t.title=e.label,t.innerHTML=H),t};export default async function E(e){const[t,a,i,c,n,r]=e.children,o=t?.textContent.trim()||"false",m=i?.textContent.trim()||"false";let u=a?.textContent.trim()||1;const f=c?.textContent.trim()||"black",L=b("breadcrumblevel"),d=x("nav","",{"aria-label":"Breadcrumb"});if(n.innerText?.trim()&&r.innerText?.trim()){const l=[],g=r.innerText.trim().replace(/~/g,"/").split(",");return n.innerText.trim().split(",").forEach((s,h)=>{l.push(`<a href="${g[h]}">${s}</a>`)}),$(l),e.innerHTML="",e.classList.add(f),d.innerHTML=l.join(`<span class="breadcrumb-separator">${T}</span>`),e.append(d),e}if(L!==""&&(u=L),e.innerHTML="",e.classList.add(f),o==="true")return;let p=[];u=="hidehome"?u="":p=[w({path:"",name:"HomePage",url:window.location.origin,label:"Home"}).outerHTML],window.setTimeout(async()=>{const l=window.location.pathname;if((await y(l,u)).forEach(s=>p.push(w(s).outerHTML)),m==="false"){const s=document.createElement("a");s.href=window.location.href;const h=b("page-name");s.innerText=h.replace(" | Pricefx",""),p.push(s.outerHTML)}d.innerHTML=p.join(`<span class="breadcrumb-separator">${T}</span>`),e.append(d)},0)}function $(e){const t=[],a=document.createElement("div");if(a.innerHTML=e.join(""),Array.from(a.querySelectorAll("a")).some(r=>!!r.getAttribute("href").includes("/branch-locator")))return;a.querySelectorAll("a").forEach((r,o)=>{t.push({"@type":"ListItem",position:o+1,name:r.textContent,item:location.origin+r.getAttribute("href")})});let c={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:t};const n=document.createElement("script");n.type="application/ld+json",n.innerHTML=JSON.stringify(c),document.head.append(n)}

