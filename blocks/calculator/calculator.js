export default async function decorate(block) {
  // Check if this block is already processed as part of a tab group
  if (block.dataset.tabProcessed === 'true') {
    return;
  }

  // Find the parent wrapper and check for sibling calculator blocks
  const wrapper = block.closest('.calculator-wrapper');
  const section = wrapper?.parentElement;
  const allWrappers = section ? [...section.querySelectorAll('.calculator-wrapper')] : [wrapper];
  
  // If this is not the first calculator in the section, skip (it will be handled by the first one)
  const isFirstCalculator = allWrappers[0]?.querySelector('.calculator') === block;
  if (!isFirstCalculator) {
    block.dataset.tabProcessed = 'true';
    wrapper.style.display = 'none';
    return;
  }

  // Collect all calculator blocks data
  const calculatorsData = [];
  
  allWrappers.forEach((calcWrapper, calcIndex) => {
    const calcBlock = calcWrapper.querySelector('.calculator');
    if (!calcBlock) return;
    
    calcBlock.dataset.tabProcessed = 'true';
    const rows = [...calcBlock.children];
    
    // Extract data from first row (header info)
    const headerRow = rows[0]?.querySelector('div');
    const paragraphs = headerRow ? [...headerRow.querySelectorAll('p')] : [];
    
    const tabTitle = paragraphs[0]?.textContent?.trim() || `Calculator ${calcIndex + 1}`;
    const subTitle = paragraphs[1]?.textContent?.trim() || '';
    const emiImage = paragraphs[2]?.querySelector('picture')?.outerHTML || '';
    const emiLabel = paragraphs[3]?.textContent?.trim() || 'Your home loan EMI is';
    const principalLabel = paragraphs[4]?.textContent?.trim() || 'Principal amount';
    const interestLabel = paragraphs[5]?.textContent?.trim() || 'Interest amount';

    // Extract slider data from remaining rows
    const sliders = [];
    for (let i = 1; i < rows.length; i++) {
      const sliderRow = rows[i]?.querySelector('div');
      const sliderParagraphs = sliderRow ? [...sliderRow.querySelectorAll('p')] : [];
      if (sliderParagraphs.length >= 7) {
        const sliderId = sliderParagraphs[0]?.textContent?.trim() || '';
        const sliderLabel = sliderParagraphs[1]?.textContent?.trim() || '';
        
        // Determine unit and suffix based on slider type
        let unit = '';
        let suffix = '';
        if (sliderId.toLowerCase().includes('amount') || sliderId.toLowerCase().includes('loan') && !sliderId.toLowerCase().includes('tenure')) {
          unit = '₹';
        } else if (sliderId.toLowerCase().includes('tenure') || sliderId.toLowerCase().includes('year')) {
          suffix = 'Years';
        } else if (sliderId.toLowerCase().includes('rate') || sliderId.toLowerCase().includes('interest')) {
          suffix = '%';
        }
        
        sliders.push({
          id: `${sliderId}-${calcIndex}`,
          label: sliderLabel,
          defaultValue: sliderParagraphs[2]?.textContent?.trim() || '0',
          min: sliderParagraphs[3]?.textContent?.trim() || '0',
          max: sliderParagraphs[4]?.textContent?.trim() || '100',
          minLabel: sliderParagraphs[5]?.textContent?.trim() || '',
          maxLabel: sliderParagraphs[6]?.textContent?.trim() || '',
          unit,
          suffix,
        });
      }
    }

    calculatorsData.push({
      tabTitle,
      subTitle,
      emiImage,
      emiLabel,
      principalLabel,
      interestLabel,
      sliders,
    });
    
    // Hide other wrappers
    if (calcIndex > 0) {
      calcWrapper.style.display = 'none';
    }
  });

  // Get subtitle from first calculator
  const subTitle = calculatorsData[0]?.subTitle || '';

  // Helper function to format numbers with Indian numbering system
  function formatNumber(value, type) {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (type.toLowerCase().includes('rate') || type.toLowerCase().includes('interest')) {
      return num.toFixed(num % 1 === 0 ? 0 : 2);
    }
    return num.toLocaleString('en-IN');
  }

  // Helper function to calculate fill percentage
  function calculateFillPercent(value, min, max) {
    const val = parseFloat(value);
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    if (isNaN(val) || isNaN(minVal) || isNaN(maxVal) || maxVal === minVal) return 0;
    return ((val - minVal) / (maxVal - minVal)) * 100;
  }

  // Build tabs HTML
  const tabsHTML = calculatorsData.map((calc, index) => `
    <button class="calculator-tab ${index === 0 ? 'active' : ''}" data-tab="${index}">${calc.tabTitle}</button>
  `).join('');

  // Build tab content HTML
  const tabContentsHTML = calculatorsData.map((calc, index) => `
    <div class="calculator-tab-content ${index === 0 ? 'active' : ''}" data-tab-content="${index}">
      <div class="calculator-content">
        <div class="calculator-left">
          ${calc.sliders.map((slider) => `
            <div class="slider-group" data-slider-id="${slider.id}">
              <div class="slider-header">
                <label class="slider-label">${slider.label}</label>
                <div class="slider-value-display">
                  ${slider.unit ? `<span class="slider-unit">${slider.unit}</span>` : ''}
                  <input type="text" class="slider-input" id="${slider.id}-input" value="${formatNumber(slider.defaultValue, slider.id)}" data-raw-value="${slider.defaultValue}">
                  ${slider.suffix ? `<span class="slider-suffix">${slider.suffix}</span>` : ''}
                </div>
              </div>
              <div class="slider-container">
                <input type="range" class="slider-range" id="${slider.id}" 
                  min="${slider.min}" max="${slider.max}" value="${slider.defaultValue}" 
                  step="${slider.id.toLowerCase().includes('rate') || slider.id.toLowerCase().includes('interest') ? '0.01' : '1'}">
                <div class="slider-track">
                  <div class="slider-track-fill" style="width: ${calculateFillPercent(slider.defaultValue, slider.min, slider.max)}%"></div>
                </div>
              </div>
              <div class="slider-range-labels">
                <span class="slider-min">${slider.minLabel}</span>
                <span class="slider-max">${slider.maxLabel}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="calculator-right">
          <div class="emi-result-card">
            <div class="emi-icon">
              ${calc.emiImage}
            </div>
            <p class="emi-result-label">${calc.emiLabel}</p>
            <p class="emi-result-value">₹<span id="emi-amount-${index}">34,438</span>/-</p>
            
            <div class="emi-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">${calc.principalLabel}</span>
                <span class="breakdown-value">₹ <span id="principal-amount-${index}">25,00,000</span></span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">${calc.interestLabel}</span>
                <span class="breakdown-value">₹ <span id="interest-amount-${index}">16,32,560</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Build the calculator HTML
  block.innerHTML = `
    <div class="calculator-main">
      <p class="calculator-subtitle">${subTitle}</p>
      <div class="calculator-tabs">
        ${tabsHTML}
      </div>
      ${tabContentsHTML}
    </div>
  `;

  // Store all sliders config for event handlers
  const allSliders = calculatorsData.flatMap(calc => calc.sliders);

  // Add event listeners for tabs
  const tabs = block.querySelectorAll('.calculator-tab');
  const tabContents = block.querySelectorAll('.calculator-tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabIndex = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.dataset.tabContent === tabIndex) {
          content.classList.add('active');
        }
      });
    });
  });

  // Add event listeners for sliders
  const sliderInputs = block.querySelectorAll('.slider-range');
  sliderInputs.forEach(slider => {
    slider.addEventListener('input', (e) => {
      const sliderId = e.target.id;
      const value = e.target.value;
      const inputField = block.querySelector(`#${sliderId}-input`);
      const trackFill = e.target.closest('.slider-container').querySelector('.slider-track-fill');
      
      // Update input display
      const sliderConfig = allSliders.find(s => s.id === sliderId);
      if (inputField && sliderConfig) {
        inputField.value = formatNumber(value, sliderId);
        inputField.dataset.rawValue = value;
      }
      
      // Update track fill
      if (trackFill && sliderConfig) {
        const percent = calculateFillPercent(value, sliderConfig.min, sliderConfig.max);
        trackFill.style.width = `${percent}%`;
      }
    });
  });

  // Add event listeners for input fields
  const textInputs = block.querySelectorAll('.slider-input');
  textInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const sliderId = e.target.id.replace('-input', '');
      const slider = block.querySelector(`#${sliderId}`);
      const sliderConfig = allSliders.find(s => s.id === sliderId);
      
      if (slider && sliderConfig) {
        let value = parseFloat(e.target.value.replace(/,/g, ''));
        
        // Clamp value within range
        value = Math.max(parseFloat(sliderConfig.min), Math.min(parseFloat(sliderConfig.max), value));
        
        slider.value = value;
        e.target.value = formatNumber(value, sliderId);
        e.target.dataset.rawValue = value;
        
        // Update track fill
        const trackFill = slider.closest('.slider-container').querySelector('.slider-track-fill');
        if (trackFill) {
          const percent = calculateFillPercent(value, sliderConfig.min, sliderConfig.max);
          trackFill.style.width = `${percent}%`;
        }
      }
    });
  });
}