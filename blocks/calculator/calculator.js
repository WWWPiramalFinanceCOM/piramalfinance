
export default async function decorate(block) {
    if(window.location.href.includes('author')) return true;
  // Use block index from data-reset-id for unique IDs across N calculators
  const blockIndex = block.dataset.resetId?.replace('calid-', '') || '0';
  // Determine calculator type from authored content — firstRow[0] (e.g. "EMI Calculator", "Eligibility Calculator")
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

  // firstRow children: [0]=tab name, [1]=heading, [2]=picture, [3]=output text, [4]=principal label, [5]=interest label
  const firstRow = block.children[0].children[0].children;

  // Handle image — firstRow[2] may contain a <picture> element or plain text URL
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

    // Build slider row with createElement (no innerHTML)
    const loanamount = document.createElement('div');
    loanamount.className = 'loanamount';

    const data = document.createElement('div');
    data.className = 'data';

    const descLabel = document.createElement('label');
    descLabel.className = 'description';
    descLabel.textContent = columns[1]?.textContent.trim() || '';

    const inputdivs = document.createElement('div');
    inputdivs.className = `inputdivs${isYearsText ? ' yearstext' : ''}`;

    const rupeeSpan = document.createElement('span');
    rupeeSpan.className = 'rupee';
    rupeeSpan.textContent = rupeeText;

    const srLabel = document.createElement('label');
    srLabel.htmlFor = inputId;
    srLabel.setAttribute('aria-label', 'calculateemi');
    srLabel.className = 'sr-only';

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'inputvalue slider-value';
    textInput.value = '';
    textInput.id = inputId;
    textInput.dataset.slider = sliderId;
    textInput.dataset.calInput = calInput;

    const textvalueSpan = document.createElement('span');
    textvalueSpan.className = 'textvalue';
    textvalueSpan.textContent = textValue;

    inputdivs.appendChild(rupeeSpan);
    inputdivs.appendChild(srLabel);
    inputdivs.appendChild(textInput);
    inputdivs.appendChild(textvalueSpan);

    data.appendChild(descLabel);
    data.appendChild(inputdivs);

    const rangediv = document.createElement('div');
    rangediv.className = 'rangediv';

    const rangeSrLabel = document.createElement('label');
    rangeSrLabel.htmlFor = sliderId;
    rangeSrLabel.setAttribute('aria-label', 'calculateemi');
    rangeSrLabel.className = 'sr-only';

    const rangeInput = document.createElement('input');
    rangeInput.type = 'range';
    rangeInput.min = columns[5]?.textContent.trim() || '';
    rangeInput.step = columns[4]?.textContent.trim() || '';
    rangeInput.max = columns[6]?.textContent.trim() || '';
    rangeInput.value = columns[2]?.textContent.trim() || '';
    rangeInput.id = sliderId;
    rangeInput.className = 'range-slider__range';
    rangeInput.style.background = 'linear-gradient(90deg, rgb(218, 77, 52) 4.0404%, rgb(219, 215, 216) 4.0404%)';

    const valuesDiv = document.createElement('div');
    valuesDiv.className = 'values';
    const minSpan = document.createElement('span');
    minSpan.className = 'text';
    minSpan.textContent = columns[7]?.textContent.trim() || '';
    const maxSpan = document.createElement('span');
    maxSpan.className = 'text';
    maxSpan.textContent = columns[8]?.textContent.trim() || '';
    valuesDiv.appendChild(minSpan);
    valuesDiv.appendChild(maxSpan);

    rangediv.appendChild(rangeSrLabel);
    rangediv.appendChild(rangeInput);
    rangediv.appendChild(valuesDiv);

    loanamount.appendChild(data);
    loanamount.appendChild(rangediv);
    inputDiv.appendChild(loanamount);
  });

  // Build output section with createElement (no innerHTML)
  const outputParent = document.createElement('div');
  outputParent.className = 'output-parent';

  const mainoutput = document.createElement('div');
  mainoutput.className = 'mainoutput';

  const outputimg = document.createElement('img');
  outputimg.dataset.src = imgSrc;
  outputimg.className = 'outputimg lozad';
  outputimg.alt = 'calendar';
  outputimg.src = imgSrc;
  outputimg.dataset.loaded = 'true';

  const outputimg2 = document.createElement('img');
  outputimg2.dataset.src = imgSrc;
  outputimg2.className = 'outputimg2 lozad';
  outputimg2.alt = 'calendar';
  outputimg2.src = imgSrc;
  outputimg2.dataset.loaded = 'true';

  const outputdes = document.createElement('p');
  outputdes.className = 'outputdes';
  outputdes.textContent = firstRow[3]?.textContent.trim() || '';

  const outputans = document.createElement('div');
  outputans.className = 'outputans';
  outputans.dataset.calResult = 'resultAmt';
  outputans.textContent = '₹34,438/-';

  mainoutput.appendChild(outputimg);
  mainoutput.appendChild(outputimg2);
  mainoutput.appendChild(outputdes);
  mainoutput.appendChild(outputans);

  const amountdiv = document.createElement('div');
  amountdiv.className = 'amountdiv';

  const firstamout = document.createElement('div');
  firstamout.className = 'firstamout';
  const firstP = document.createElement('p');
  firstP.textContent = firstRow[4]?.textContent.trim() || '';
  const firstAmountP = document.createElement('p');
  firstAmountP.className = 'amount';
  const rupeeSymbol1 = document.createElement('span');
  rupeeSymbol1.textContent = '₹';
  const principalSpan = document.createElement('span');
  principalSpan.dataset.calResult = 'principalAmt';
  principalSpan.textContent = '25,00,000';
  firstAmountP.appendChild(rupeeSymbol1);
  firstAmountP.appendChild(principalSpan);
  firstamout.appendChild(firstP);
  firstamout.appendChild(firstAmountP);

  const secondamount = document.createElement('div');
  secondamount.className = 'secondamount firstamout';
  const secondP = document.createElement('p');
  secondP.textContent = firstRow[5]?.textContent.trim() || '';
  const secondAmountP = document.createElement('p');
  secondAmountP.className = 'amount';
  const rupeeSymbol2 = document.createElement('span');
  rupeeSymbol2.textContent = '₹';
  const interestSpan = document.createElement('span');
  interestSpan.dataset.calResult = 'interestAmt';
  interestSpan.textContent = '16,32,560';
  secondAmountP.appendChild(rupeeSymbol2);
  secondAmountP.appendChild(interestSpan);
  secondamount.appendChild(secondP);
  secondamount.appendChild(secondAmountP);

  amountdiv.appendChild(firstamout);
  amountdiv.appendChild(secondamount);

  outputParent.appendChild(mainoutput);
  outputParent.appendChild(amountdiv);
  outputDiv.appendChild(outputParent);

  block.textContent = '';
  parentEmi.appendChild(inputDiv);
  parentEmi.appendChild(outputDiv);
  block.appendChild(parentEmi);
}