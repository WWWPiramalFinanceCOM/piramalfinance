function i(e,t={}){const n="aem-rum";i.baseURL=i.baseURL||new URL(window.RUM_BASE==null?"https://rum.hlx.page":window.RUM_BASE,window.location),i.defer=i.defer||[];const o=a=>{i[a]=i[a]||((...s)=>i.defer.push({fnname:a,args:s}))};i.drain=i.drain||((a,s)=>{i[a]=s,i.defer.filter(({fnname:r})=>a===r).forEach(({fnname:r,args:l})=>i[r](...l))}),i.always=i.always||[],i.always.on=(a,s)=>{i.always[a]=s},i.on=(a,s)=>{i.cases[a]=s},o("observe"),o("cwv");try{if(window.hlx=window.hlx||{},!window.hlx.rum){const c=new URLSearchParams(window.location.search).get("rum")==="on"?1:100,d=Array.from({length:75},(A,R)=>String.fromCharCode(48+R)).filter(A=>/\d|[A-Z]/i.test(A)).filter(()=>Math.random()*75>70).join(""),u=Math.random(),p=u*c<1,g=window.performance?window.performance.timeOrigin:Date.now(),P={full:()=>window.location.href,origin:()=>window.location.origin,path:()=>window.location.href.replace(/\?.*$/,"")},h=sessionStorage.getItem(n)?JSON.parse(sessionStorage.getItem(n)):{};h.pages=(h.pages?h.pages:0)+1+(Math.floor(Math.random()*20)-10),sessionStorage.setItem(n,JSON.stringify(h)),window.hlx.rum={weight:c,id:d,random:u,isSelected:p,firstReadTime:g,sampleRUM:i,sanitizeURL:P[window.hlx.RUM_MASK_URL||"path"],rumSessionStorage:h}}const{weight:a,id:s,firstReadTime:r}=window.hlx.rum;if(window.hlx&&window.hlx.rum&&window.hlx.rum.isSelected){const l=["weight","id","referer","checkpoint","t","source","target","cwv","CLS","FID","LCP","INP","TTFB"],c=(d=t)=>{const u=Math.round(window.performance?window.performance.now():Date.now()-r),p=JSON.stringify({weight:a,id:s,referer:window.hlx.rum.sanitizeURL(),checkpoint:e,t:u,...t},l),g=new URL(`.rum/${a}`,i.baseURL).href;navigator.sendBeacon(g,p),console.debug(`ping:${e}`,d)};i.cases=i.cases||{load:()=>i("pagesviewed",{source:window.hlx.rum.rumSessionStorage.pages})||!0,cwv:()=>i.cwv(t)||!0,lazy:()=>{const d=document.createElement("script");return d.src=new URL(".rum/@adobe/helix-rum-enhancer@^1/src/index.js",i.baseURL).href,document.head.appendChild(d),!0}},c(t),i.cases[e]&&i.cases[e]()}i.always[e]&&i.always[e](t)}catch{}}function b(){window.hlx=window.hlx||{},window.hlx.RUM_MASK_URL="full",window.hlx.codeBasePath="",window.hlx.lighthouse=new URLSearchParams(window.location.search).get("lighthouse")==="on";const e=document.querySelector('script[src$="/scripts/scripts.js"]');if(e)try{const t=new URL(e.src,window.location);t.host===window.location.host?[window.hlx.codeBasePath]=t.pathname.split("/scripts/scripts.js"):[window.hlx.codeBasePath]=t.href.split("/scripts/scripts.js")}catch(t){console.warn(t)}}function U(){b(),i("top"),window.addEventListener("load",()=>i("load")),window.addEventListener("unhandledrejection",e=>{i("error",{source:e.reason.sourceURL,target:e.reason.line})}),window.addEventListener("error",e=>{i("error",{source:e.filename,target:e.lineno})})}function m(e){return typeof e=="string"?e.toLowerCase().replace(/[^0-9a-z]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""):""}function y(e){return m(e).replace(/-([a-z])/g,t=>t[1].toUpperCase())}function N(e){const t={};return e.querySelectorAll(":scope > div").forEach(n=>{if(n.children){const o=[...n.children];if(o[1]){const a=o[1],s=m(o[0].textContent);let r="";if(a.querySelector("a")){const l=[...a.querySelectorAll("a")];l.length===1?r=l[0].href:r=l.map(c=>c.href)}else if(a.querySelector("img")){const l=[...a.querySelectorAll("img")];l.length===1?r=l[0].src:r=l.map(c=>c.src)}else if(a.querySelector("p")){const l=[...a.querySelectorAll("p")];l.length===1?r=l[0].textContent:r=l.map(c=>c.textContent)}else r=n.children[1].textContent;t[s]=r}}}),t}async function $(e){return new Promise((t,n)=>{if(document.querySelector(`head > link[href="${e}"]`))t();else{const o=document.createElement("link");o.rel="stylesheet",o.href=e,o.onload=t,o.onerror=n,document.head.append(o)}})}async function B(e,t){return new Promise((n,o)=>{if(document.querySelector(`head > script[src="${e}"]`))n();else{const a=document.createElement("script");if(a.src=e,t)for(const s in t)a.setAttribute(s,t[s]);a.onload=n,a.onerror=o,document.head.append(a)}})}function S(e,t=document){const n=e&&e.includes(":")?"property":"name";return[...t.head.querySelectorAll(`meta[${n}="${e}"]`)].map(a=>a.content).join(", ")||""}function q(e,t="",n=!1,o=[{media:"(min-width: 600px)",width:"2000"},{width:"750"}]){const a=new URL(e,window.location.href),s=document.createElement("picture"),{pathname:r}=a,l=r.substring(r.lastIndexOf(".")+1);return o.forEach(c=>{const d=document.createElement("source");c.media&&d.setAttribute("media",c.media),d.setAttribute("type","image/webp"),d.setAttribute("srcset",`${r}?width=${c.width}&format=webply&optimize=medium`),s.appendChild(d)}),o.forEach((c,d)=>{if(d<o.length-1){const u=document.createElement("source");c.media&&u.setAttribute("media",c.media),u.setAttribute("srcset",`${r}?width=${c.width}&format=${l}&optimize=medium`),s.appendChild(u)}else{const u=document.createElement("img");u.setAttribute("loading",n?"eager":"lazy"),u.setAttribute("alt",t),s.appendChild(u),u.setAttribute("src",`${r}?width=${c.width}&format=${l}&optimize=medium`)}}),s}function v(){const e=(o,a)=>{a.split(",").forEach(s=>{o.classList.add(m(s.trim()))})},t=S("template");t&&e(document.body,t);const n=S("theme");n&&e(document.body,n)}function C(e){const t=["P","PRE","UL","OL","PICTURE","TABLE","H1","H2","H3","H4","H5","H6"],n=o=>{const a=document.createElement("p");a.append(...o.childNodes),[...o.attributes].filter(({nodeName:s})=>s==="class"||s.startsWith("data-aue")||s.startsWith("data-richtext")).forEach(({nodeName:s,nodeValue:r})=>{a.setAttribute(s,r),o.removeAttribute(s)}),o.append(a)};e.querySelectorAll(":scope > div > div").forEach(o=>{o.hasChildNodes()&&(!!o.firstElementChild&&t.some(s=>o.firstElementChild.tagName===s)?o.firstElementChild.tagName==="PICTURE"&&(o.children.length>1||o.textContent.trim())&&n(o):n(o))})}function x(e){e.querySelectorAll("a").forEach(t=>{if(t.title=t.title||t.textContent,t.href!==t.textContent){const n=t.parentElement,o=t.parentElement.parentElement;t.querySelector("img")||(n.childNodes.length===1&&(n.tagName==="P"||n.tagName==="DIV")&&(t.className="button",n.classList.add("button-container")),n.childNodes.length===1&&n.tagName==="STRONG"&&o.childNodes.length===1&&o.tagName==="P"&&(t.className="button primary",o.classList.add("button-container")),n.childNodes.length===1&&n.tagName==="EM"&&o.childNodes.length===1&&o.tagName==="P"&&(t.className="button secondary",o.classList.add("button-container")))}})}function M(e,t="",n=""){const o=Array.from(e.classList).find(s=>s.startsWith("icon-")).substring(5),a=document.createElement("img");a.dataset.iconName=o,a.src=`${window.hlx.codeBasePath}${t}/icons/${o}.svg`,a.alt=n,a.loading="lazy",e.append(a)}function k(e,t=""){[...e.querySelectorAll("span.icon")].forEach(o=>{M(o,t)})}function z(e){e.querySelectorAll(":scope > div:not([data-section-status])").forEach(t=>{const n=[];let o=!1;[...t.children].forEach(s=>{if(s.tagName==="DIV"||!o){const r=document.createElement("div");n.push(r),o=s.tagName!=="DIV",o&&r.classList.add("default-content-wrapper")}n[n.length-1].append(s)}),n.forEach(s=>t.append(s)),t.classList.add("section"),t.dataset.sectionStatus="initialized",t.style.display="none";const a=t.querySelector("div.section-metadata");if(a){const s=N(a);Object.keys(s).forEach(r=>{r==="style"?s.style.split(",").filter(c=>c).map(c=>m(c.trim())).forEach(c=>t.classList.add(c)):t.dataset[y(r)]=s[r]}),a.parentNode.remove()}})}async function I(e="default"){return window.placeholders=window.placeholders||{},window.placeholders[e]||(window.placeholders[e]=new Promise(t=>{fetch(`${e==="default"?"":e}/api/placeholder.json`).then(n=>n.ok?n.json():{}).then(n=>{const o={};n.data.filter(a=>a.Key).forEach(a=>{o[y(a.Key)]=a.Text}),window.placeholders[e]=o,t(window.placeholders[e])}).catch(()=>{window.placeholders[e]={},t(window.placeholders[e])})})),window.placeholders[`${e}`]}function E(e){const t=[...e.querySelectorAll(":scope > div.section")];for(let n=0;n<t.length;n+=1){const o=t[n];if(o.dataset.sectionStatus!=="loaded")if(o.querySelector('.block[data-block-status="initialized"], .block[data-block-status="loading"]')){o.dataset.sectionStatus="loading";break}else o.dataset.sectionStatus="loaded",o.style.display=null}}function L(e,t){const n=Array.isArray(t)?t:[[t]],o=document.createElement("div");return o.classList.add(e),n.forEach(a=>{const s=document.createElement("div");a.forEach(r=>{const l=document.createElement("div");(r.elems?r.elems:[r]).forEach(d=>{d&&(typeof d=="string"?l.innerHTML+=d:l.appendChild(d))}),s.appendChild(l)}),o.appendChild(s)}),o}async function w(e){const t=e.dataset.blockStatus;if(t!=="loading"&&t!=="loaded"){e.dataset.blockStatus="loading";const{blockName:n}=e.dataset;try{const o=$(`${window.hlx.codeBasePath}/blocks/${n}/${n}.css`),a=new Promise(s=>{(async()=>{try{const r=await import(`${window.hlx.codeBasePath}/blocks/${n}/${n}.js`);r.default&&await r.default(e)}catch(r){console.warn(`failed to load module for ${n}`,r)}s()})()});await Promise.all([o,a])}catch(o){console.warn(`failed to load block ${n}`,o)}e.dataset.blockStatus="loaded"}return e}async function T(e){E(e);const t=[...e.querySelectorAll("div.block")];for(let n=0;n<t.length;n+=1)await w(t[n]),E(e)}function f(e){const t=e.classList[0];if(t&&!e.dataset.blockStatus){e.classList.add("block"),e.dataset.blockName=t,e.dataset.blockStatus="initialized",C(e),e.parentElement.classList.add(`${t}-wrapper`);const o=e.closest(".section");o&&o.classList.add(`${t}-container`),x(e)}}function j(e){e.querySelectorAll("div.section > div > div").forEach(f)}async function O(e){const t=L("header","");return e.append(t),f(t),w(t)}async function _(e){const t=L("footer","");return e.append(t),f(t),w(t)}async function H(e){const t=document.querySelector(".block");t&&e.includes(t.dataset.blockName)&&await w(t),document.body.style.display=null;const o=document.querySelector("main img");await new Promise(a=>{o&&!o.complete?(o.setAttribute("loading","eager"),o.addEventListener("load",a),o.addEventListener("error",a)):a()})}U();export{L as buildBlock,q as createOptimizedPicture,f as decorateBlock,j as decorateBlocks,x as decorateButtons,k as decorateIcons,z as decorateSections,v as decorateTemplateAndTheme,I as fetchPlaceholders,S as getMetadata,w as loadBlock,T as loadBlocks,$ as loadCSS,_ as loadFooter,O as loadHeader,B as loadScript,N as readBlockConfig,i as sampleRUM,b as setup,y as toCamelCase,m as toClassName,E as updateSectionsStatus,H as waitForLCP,C as wrapTextNodes};

