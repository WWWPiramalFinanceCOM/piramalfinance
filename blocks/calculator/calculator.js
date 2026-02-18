export default async function decorate(block) {
  const isEligibility = block.classList.contains('eligibilitycalculator');
  const sliderPrefix = isEligibility ? 'el' : 'em';

  const parentEmi = document.createElement('div');
  parentEmi.classList.add('parent-emi');
  if (isEligibility) parentEmi.classList.add('parent-eligibility');
  parentEmi.id = 'emic';

  const inputDiv = document.createElement('div');
  inputDiv.classList.add('inputDiv');
  const outputDiv = document.createElement('div');
  outputDiv.classList.add('outputdiv');

  // firstRow children: [0]=tab name, [1]=heading, [2]=picture, [3]=output text, [4]=principal label, [5]=interest label
  const firstRow = block.children[0].children[0].children;

  // Handle image — firstRow[2] may contain a <picture> element or plain text URL
  const imgEl = firstRow[2]?.querySelector('img');
  const imgSrc = imgEl ? imgEl.src : (firstRow[2]?.textContent.trim() || '');

  Array.from(block.children).slice(1).forEach((r, ind) => {
    const columns = r.children[0].children;
    const sliderId = `${sliderPrefix}${ind + 1}`;
    const rupeeText = columns[3]?.textContent.trim() || '';
    const calInput = columns[0]?.textContent.trim() || '';
    const isYearsText = !rupeeText;
    let textValue = '';
    if (isYearsText) {
      if (calInput === 'tenure') textValue = 'Years';
      else if (calInput === 'roi') textValue = '%';
    }

    const dom = `
      <div class="loanamount">
        <div class="data">
          <label class="description">${columns[1]?.textContent.trim() || ''}</label>
          <!-- add class yearstext for displaying textvalue -->
          <div class="inputdivs ${isYearsText ? 'yearstext' : ''} ">
            <span class="rupee">${rupeeText}</span>
            <label for="calcemi-${ind}" aria-label="calculateemi" class="sr-only"></label>
            <input type="text" class="inputvalue slider-value" value="" id="calcemi-${ind}" data-slider="${sliderId}" data-cal-input="${calInput}">
            <span class="textvalue">${textValue}</span>
          </div>
        </div>
        <div class="rangediv">
          <label for="${sliderId}" aria-label="calculateemi" class="sr-only"></label>
          <input type="range" min="${columns[5]?.textContent.trim() || ''}" step="${columns[4]?.textContent.trim() || ''}" max="${columns[6]?.textContent.trim() || ''}" value="${columns[2]?.textContent.trim() || ''}" id="${sliderId}" class="range-slider__range" style="background: linear-gradient(90deg, rgb(218, 77, 52) 4.0404%, rgb(219, 215, 216) 4.0404%);">
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
        <img data-src="${imgSrc}" class="outputimg lozad" alt="calendar" src="${imgSrc}" data-loaded="true">
        <img data-src="${imgSrc}" class="outputimg2 lozad" alt="calendar" src="${imgSrc}" data-loaded="true">
        <p class="outputdes">
          ${firstRow[3]?.textContent.trim() || ''}
        </p>
        <div class="outputans" data-cal-result="resultAmt">₹34,438/-</div>
      </div>
      <div class="amountdiv">
        <div class="firstamout">
          <p>${firstRow[4]?.textContent.trim() || ''}</p>
          <p class="amount"><span>₹</span><span data-cal-result="principalAmt">25,00,000</span></p>
        </div>
        <div class="secondamount firstamout">
          <p>${firstRow[5]?.textContent.trim() || ''}</p>
          <p class="amount"><span>₹</span><span data-cal-result="interestAmt">16,32,560</span></p>
        </div>
      </div>
    </div>
  `;

  block.textContent = '';
  parentEmi.appendChild(inputDiv);
  parentEmi.appendChild(outputDiv);
  block.appendChild(parentEmi);
}