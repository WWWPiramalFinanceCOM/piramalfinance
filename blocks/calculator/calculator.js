export default async function decorate(block) {
let inputDiv= document.createElement("div");
inputDiv.classList.add("inputdiv");
let outputDiv= document.createElement("div");
outputDiv.classList.add("outputdiv");
  const firstRow = block.children[0].children[0].children;
  const row = Array.from(block.children).slice(1).forEach((r, ind) => {
    let columns = r.children[0].children;
     let dom  = `
            <div class="loanamount" id="${columns[0]?.textContent.trim() || ''}">
            <div class="data">
                <label class="description">${columns[1]?.textContent.trim() || ''}</label>
                <!-- add class yearstext for   displaying textvalue -->
                <div class="inputdivs  ">
        
                    <span class="rupee">${columns[3]?.textContent.trim() || ''}</span>
        
                    <label for="calcemi-${ind}" aria-label="calculateemi" class="sr-only"></label>
                    <input type="text" class="inputvalue slider-value" value="${columns[2]?.textContent.trim() || ''}" id="calcemi-${ind}" data-slider="em${ind}" data-cal-input="${columns[0]?.textContent.trim() || ''}">
        
                    <span class="textvalue"></span>
        
                </div>
            </div>
            <div class="rangediv">
                <label for="em${ind}" aria-label="calculateemi" class="sr-only"></label>
                <input type="range" min="${columns[5]?.textContent.trim() || ''}" step="${columns[4]?.textContent.trim() || ''}" max="${columns[6]?.textContent.trim() || ''}" value="${columns[2]?.textContent.trim() || ''}" id="em1" class="range-slider__range" style="background: linear-gradient(90deg, rgb(218, 77, 52) 4.0404%, rgb(219, 215, 216) 4.0404%);">
                <div class="values">
                    <span class="text">${columns[7]?.textContent.trim() || ''}</span>
                    <span class="text">${columns[8]?.textContent.trim() || ''}</span>
                </div>
            </div>
        </div>  
      `;

    inputDiv.innerHTML += dom;
  });

  outputDiv.innerHTML = `
        <div class="output-parent">
                  <div class="mainoutput">
                      <img data-src="${firstRow[2]?.textContent.trim() || ''}" class="outputimg lozad" alt="calendar" src="${firstRow[2]?.textContent.trim() || ''}" data-loaded="true">
                      <img data-src="${firstRow[2]?.textContent.trim() || ''}" class="outputimg2 lozad" alt="calendar" src="${firstRow[2]?.textContent.trim() || ''}" data-loaded="true">
  
                      <p class="outputdes">
                         ${firstRow[3]?.textContent.trim() || ''}
                      </p>
                      <div class="outputans" data-cal-result="resultAmt">₹34,438/-</div>
  
                  </div>
  
                  <div class="amountdiv">
                        <div class="firstamout">
                            <p>${firstRow[4]?.textContent.trim() || ''}</p>
                            <p class="amount"><span>₹</span><span data-cal-result="principalAmt">25,00,000</span>
                            </p>
                        </div>
                        <div class="secondamount firstamout">
                            <p>${firstRow[5]?.textContent.trim() || ''}</p>
                            <p class="amount"><span>₹</span><span data-cal-result="interestAmt">16,32,560</span>
                            </p>
                        </div>
    </div>
  
              </div>
  `;
  block.textContent = '';
  block.appendChild(inputDiv);
  block.appendChild(outputDiv);
}