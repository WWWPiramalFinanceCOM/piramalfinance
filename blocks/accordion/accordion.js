import{fetchAPI as u}from"../../scripts/scripts.js";console.log("Accordian");export function generateAccordionDOM(e){const n=document.createElement("details"),o=document.createElement("summary");return n.append(o),Array.from(e.children).forEach(async(t,s)=>{if(s===0){const r=t;o.append(r||t.textContent.trim())}else{const r=t.innerText.trim(),c=r.includes(".json"),l=t.innerHTML.replace(/&lt;/g,"<").replace(/&gt;/g,">"),i=document.createElement("div");if(c){const a=await g(r),d=p(a);i.innerHTML=d}else i.innerHTML=l;n.append(i)}}),n}export default function m(e){const n=generateAccordionDOM(e);e.textContent="",e.append(n)}async function g(e){return await(await u("GET",e)).json()}function p(e){const n=e.data;let o="";return n.forEach(t=>{const s=t?.subtitle?`<span class="description">${t.subtitle}</span>`:"",r=t?.rowoneimg&&t?.rowtwoimg?`<td style="  text-align: right;"><img src="${t.rowoneimg}" alt=""></td>
    <td style=" text-align: right;"><img src="${t.rowtwoimg}" alt=""></td>`:"";o+=`<table class="${t.class} " cellpadding="1" cellspacing="0" border="1">
        <tbody>
            <tr>
                <th style="text-align: left;">${t.title}
                    ${s}
                </th>
                <th style=" text-align: right;">${t.rowoneheading}</th>
                <th style=" text-align: right;">${t.rowtwoheading}</th>
                ${r}
            </tr>
        </tbody>
      </table>`}),o}export function documentRequired(){if(document.querySelector(".documents-required-brown").querySelectorAll(".accordion.block").length>0){const e=document.querySelector(".documents-required-brown").querySelectorAll(".accordion.block")[1]?.querySelectorAll("div > ul");e.length>0&&(e[0].classList.add("cmp-text--doc-salary"),e[1]?.classList.add("cmp-text--doc-business"))}}
      
