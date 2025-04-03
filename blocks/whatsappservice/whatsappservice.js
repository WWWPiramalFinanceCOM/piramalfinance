import{onloadLoginCall as F}from"./login.js";import{otpPopupCall as S}from"./otppopup.js";const W=t=>t?.querySelector("img")?.getAttribute("src"),e=t=>t?.textContent.trim(),a=t=>W(t)||e(t);function q(t,s){return e(t)!=="true"?"":`
<div class="checkbox-field">
  <label class="cmp-form-options__field-label">
    <input class="cmp-form-options__field cmp-form-options__field--checkbox" name="tnc" value="tnc" type="checkbox">
    <span class="cmp-form-options__field-description">${s.innerHTML}</span>
  </label>
</div>`}function B(t,s,i,n){return`
<div class="input-field">
  <div class="cmp-form-text">
    <label for="form-text-1975602141">${e(t)}</label>
    <span class="inptContainer">
      <span class="countryCode">${e(s)}</span>
      <input class="cmp-form-text__text" data-cmp-hook-form-text="input" type="text" maxlength="10"
        id="form-text-1975602141" placeholder="${e(i)}" name="number" spellcheck="true">
    </span>
  </div>
  <div class="button desktopButton">
    <button type="button" id="button" class="cmp-button" disabled>
      <span class="cmp-button__text">${e(n)}</span>
    </button>
  </div>
</div>`}function E(t){const[s,i,n,o,c,r,p,d,m,v,...l]=t;return`
<div class="whats-app-service">
  <div class="front-image">${s.innerHTML}</div>
  <div class="description">${i.innerHTML}</div>
  <a href="${e(o)}" class="mobile-button">
    <button>${n.innerHTML}</button>
  </a>
  ${B(p,r,c,d)}
  ${q(v,m)}
</div>`}function G(t){const[s,i,n,o,c,r,p,d,m,v,l,u,g,b,f,x,h,$,T,_,y,w,C,L,H,M,k,A,I,z,N,P,D]=t;return`<div class="otppopup">
  <div class="applyloanform">
    <div class="loan-form-sub-parent">
      <div class="cmp-container">
        <div class="loan-form loan-form-sub-otp">
          <div class="cmp-container">
            <div class="loan-form-heading-parent ">
              <div class="cmp-container">
                <div class="image">
                  <img data-src="${a(l)}" src="${a(l)}"
                    class="cmp-image__image lozad" alt="${a(u)}">
                </div>
                <div class="image crossimage">
                  <img src="/images/close-icon.svg" class="cmp-image__image lozad" alt="close-icon">
                </div>
              </div>
            </div>
            <div class="loan-form-otp">
              <div class="loan-form-otp-parent">
                <img class="leftarrow lozad" src="/images/back-arrow.png" alt="arrow">
                <p class="otphead">${a(g)}</p>
                <div class="otpsubheadcontainer">
                  <p class="otpsubhead">${a(b)} <span class="otp-phone-num"
                      id="loan-form-otpnum">${a(f)}</span></p>
                  <p class="otp-change-num" id="otp-change-num">${a(x)}</p>
                </div>

                <p class="otpsubsubhead">${a(h)}</p>
                <div class="inputotp">
                  <input type="text" id="loan-form-otp-input" maxlength="4">
                  <div id="otp-digits"><span
                      class="changeableDigit">${a($)}</span>${a(T)}
                  </div>
                </div>
                <div class="wrongotpmessage">

                </div>
                <div class="resendtext">
                  <p>
                    ${a(_)}
                  </p>
                  <button type="button" id="loan-form-resend-otp">${a(y)}</button>
                  <span class="timer">${a(w)}</span>
                </div>

              </div>



            </div>

            <div class="successContainer">
              <img src="/images/close-icon.svg" class="closeImg" alt="close-img">
              <div class="imageContainer">
                <img src="${a(C)}" alt="${a(L)}">
              </div>
              <div class="textContainer">
                <div class="namasteText">
                  <p><span class="boldtext">${a(H)}"</span></p>

                </div>
                <div class="whatsappNumberContainer">
                  <div class="labelText">
                    <p>${a(M)}</p>

                  </div>
                  <div class="mobileNumber">
                    ${a(k)}
                  </div>
                </div>
              </div>
            </div>
            <div class="failedContainer">
              <img src="/images/close-icon.svg" class="closeImg" alt="close-img">
              <div class="imageContainer">
                <img src="${a(A)}" alt="${a(I)}">
              </div>
              <div class="textContainer">
                <div class="namasteText">
                  <p><span class="boldtext">${a(z)}</span></p>
                  <p><span class="greyboldtext">${a(N)}</span></p>

                </div>
              </div>
              <button class="failureTryAgain">${a(P)}</button>
            </div>
          </div>
        </div>
        <div class="loan-form-button-container  loan-form-otp-button-container">
          <button id="loan-from-otp-verify" class="cmp-container">
            <div class="btn-text"> ${a(D)} </div>
            <div class="loader"></div>
          </button>
        </div>
        <!-- <div class="pageloader">
                <img src="/content/dam/piramalfinance/support/whatsaap/piramal-loader.svg" alt="loader" class="loaderImage">
                <div class="mudra-rotator"></div>
                <span class="pageLoaderText"></span>
            </div> -->


        <div data-testid="mudra_loader" class="pageloader xl">
          <img src="/content/dam/piramalfinance/support/whatsaap/piramal-loader.svg" alt="loader" class="loaderImage">
          <div class="spinnerParent">
            <div class="spinner xl" data-testid="mudra_loader_spinner"></div>
          </div>
          <span class="pageLoaderText"></span>
        </div>
      </div>
    </div>

  </div>
</div>`}export default function O(t){const s=Array.from(t.children,o=>o.firstElementChild),i=E(s),n=G(s);t.innerHTML=i+n;try{F(t),S(t)}catch(o){console.warn("WhatsApp service initialization error:",o)}}
