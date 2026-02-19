import { prepareBlocks, extractContent } from './extract-content.js';
import { buildRadioParent, initRadioTabs } from './build-radio.js';
import { buildCalculatorParent, initCalculatorTabs } from './build-tabs.js';

/** Track sections already combined so it runs only once per section */
const combinedSections = new WeakSet();

/**
 * Combines all calculator blocks in a section into a single
 * calculator-parent wrapper with radio tabs, heading and CTA buttons.
 * Called by the first calculator block that gets decorated.
 */
function combineSection(section) {
  if (combinedSections.has(section)) return;
  combinedSections.add(section);

  const calcWrappers = [...section.querySelectorAll('.calculator-wrapper')];
  if (calcWrappers.length < 1) return;

  const blocks = calcWrappers.map((w) => w.querySelector('.calculator.block')).filter(Boolean);
  if (blocks.length < 1) return;

  const { heading, tabNames } = prepareBlocks(blocks);
  section.classList.add('homeloancalculator');
  const { radioItems, ctaItems, dcwToRemove } = extractContent(section);

  const radioParent = buildRadioParent(radioItems);
  const calcParent = buildCalculatorParent(heading, tabNames, ctaItems, blocks);

  calcWrappers.forEach((w) => w.remove());
  dcwToRemove.forEach((dcw) => dcw.remove());

  if (radioParent) section.insertBefore(radioParent, section.firstChild);
  section.appendChild(calcParent);

  const mobileDiv = document.createElement('div');
  mobileDiv.className = 'homepagemobiledesign';
  section.appendChild(mobileDiv);

  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = 'product type';
  hiddenInput.id = 'calculator-product-type';
  hiddenInput.value = 'hl';
  section.appendChild(hiddenInput);

  // Init tab & radio click handlers (elements already exist after assembly)
  initCalculatorTabs();
  initRadioTabs();
}

export default async function decorate(block) {
  // Combine section on first calculator block decoration
  const section = block.closest('.section.calculator-container');
  if (section) combineSection(section);

  const blockIndex = block.dataset.resetId?.replace('calid-', '') || '0';
  const tabName = block.children[0]?.children[0]?.children[0]?.textContent?.trim()?.toLowerCase() || '';
  const isEligibility = tabName.includes('eligibility');
  const sliderPrefix = `c${blockIndex}s`;

  const parentEmi = document.createElement('div');
  parentEmi.classList.add('parent-emi');
  if (isEligibility) parentEmi.classList.add('parent-eligibility');
  parentEmi.id = `emic-${blockIndex}`;

  const inputDiv = document.createElement('div');
  inputDiv.classList.add('inputDiv');
  const outputDiv = document.createElement('div');
  outputDiv.classList.add('outputdiv');

  const firstRow = block.children[0].children[0].children;

  const imgEl = firstRow[2]?.querySelector('img');
  const imgSrc = imgEl ? imgEl.src : (firstRow[2]?.textContent.trim() || '');

  Array.from(block.children).slice(1).forEach((r, ind) => {
    const columns = r.children[0].children;
    const sliderId = `${sliderPrefix}${ind + 1}`;
    const inputId = `calcemi-${blockIndex}-${ind}`;
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
          <div class="inputdivs ${isYearsText ? 'yearstext' : ''}">
            <span class="rupee">${rupeeText}</span>
            <label for="${inputId}" aria-label="calculateemi" class="sr-only"></label>
            <input type="text" class="inputvalue slider-value" value="" id="${inputId}" data-slider="${sliderId}" data-cal-input="${calInput}">
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
        <div class="outputans" data-cal-result="resultAmt">â‚¹34,438/-</div>
      </div>
      <div class="amountdiv">
        <div class="firstamout">
          <p>${firstRow[4]?.textContent.trim() || ''}</p>
          <p class="amount"><span>â‚¹</span><span data-cal-result="principalAmt">25,00,000</span></p>
        </div>
        <div class="secondamount firstamout">
          <p>${firstRow[5]?.textContent.trim() || ''}</p>
          <p class="amount"><span>â‚¹</span><span data-cal-result="interestAmt">16,32,560</span></p>
        </div>
      </div>
    </div>
  `;

  // Remove processed raw DOM children instead of wiping the block
  while (block.firstChild) block.removeChild(block.firstChild);

  parentEmi.appendChild(inputDiv);
  parentEmi.appendChild(outputDiv);
  block.appendChild(parentEmi);
}
