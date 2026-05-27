/**
 * Builds the calculator-parent wrapper with heading, tabs, CTA buttons,
 * and moves calculator blocks into the calctabs container.
 * @param {string} description - The Description field from authoring
 * @param {string[]} tabNames - Tab Label field from each calculator
 * @param {HTMLAnchorElement[]} ctaItems
 * @param {Element[]} blocks
 * @param {boolean} isGstCalculator - Whether this is a GST calculator
 * @param {object|null} disclaimer - Disclaimer data object or null
 * @returns {HTMLElement}
 */
export function buildCalculatorParent(description, tabNames, ctaItems, blocks, isGstCalculator = false, disclaimer = null) {
  // For GST: always show pill-button tabs even with single calculator
  // For EMI/Eligibility: only show tabs with multiple calculators
  const hasMultipleCalcs = blocks.length > 1;
  const showPillTabs = isGstCalculator || hasMultipleCalcs;

  let tabsLiHTML = '';
  if (showPillTabs) {
    tabNames.forEach((name, idx) => {
      const activeClass = idx === 0 ? ' active' : '';
      const tabClass = idx === 0 ? 'tab-emi-calc' : 'tab-eligibility-calc';
      tabsLiHTML += `<li class="${tabClass} tab-common${activeClass}" data-tab-index="${idx}"><p>${name || ''}</p></li>\n`;
    });
    if (hasMultipleCalcs) {
      tabsLiHTML += '<li class="tab-eligibility-calc tab-common gst-third-tab"><p></p></li>';
    }
  }

  // Get values (empty string if not authored - HTML structure always present)
  const tabLabel = tabNames[0] || '';
  const descriptionText = description || '';

  // Build heading HTML
  // Description comes FIRST (above), Tab Label/Tabs come SECOND (below)
  let headingHTML = '';
  if (!showPillTabs) {
    // Single non-GST calculator: Description above, Tab Label as styled heading below
    headingHTML = `<div class="mainheading">
          <p class="first-head">${descriptionText}</p>
          <p class="second-head calc-tab-label">${tabLabel}</p>
        </div>`;
  } else {
    // GST or multiple calculators: Description as heading above tabs
    headingHTML = `<div class="mainheading">
          <p class="first-head">${descriptionText}</p>
          <p class="second-head"></p>
        </div>`;
  }

  // Show tabs section for GST (always) or multiple calculators
  const tabsHTML = showPillTabs
    ? `<div class="headingtabs">
          <ul class="headul">
            ${tabsLiHTML}
          </ul>
        </div>`
    : '';

  const calcParent = document.createElement('div');
  calcParent.className = 'calculator-parent';
  calcParent.innerHTML = `
    <div class="calculator-parent-child">
      <div class="cp-child">
        ${headingHTML}
        ${tabsHTML}
        <div class="calctabs"></div>
      </div>
    </div>
  `;

  // CTA buttons
  if (ctaItems.length > 0) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const custButtons = document.createElement('div');
    custButtons.className = 'customerbuttons';
    ctaItems.forEach((serverAnchor, idx) => {
      // DWEB → MWEB URL rewriting for mobile (matches templatehtmlv2 behaviour)
      if (isMobile) {
        const href = serverAnchor.getAttribute('href');
        if (href) serverAnchor.setAttribute('href', href.replace('DWEB', 'MWEB'));
      }
      const btnText = serverAnchor.textContent.trim();
      serverAnchor.textContent = '';
      const btn = document.createElement('button');
      btn.className = idx > 0 ? 'expert orangeexpert' : 'expert';
      btn.textContent = btnText;
      serverAnchor.appendChild(btn);
      custButtons.appendChild(serverAnchor);
    });
    calcParent.querySelector('.cp-child').appendChild(custButtons);
  }

  // Move calculator blocks into calctabs
  const calctabs = calcParent.querySelector('.calctabs');
  blocks.forEach((blk) => calctabs.appendChild(blk));

  return calcParent;
}

/**
 * Builds the disclaimer section HTML.
 * @param {object} disclaimer - Disclaimer data object
 * @returns {HTMLElement|null} Disclaimer element or null
 */
export function buildDisclaimer(disclaimer) {
  if (!disclaimer) return null;
  
  const { title, para1, para2, readMoreText, readLessText } = disclaimer;
  
  // Only render if there's content
  if (!para1 && !para2) return null;
  
  const disclaimerDiv = document.createElement('div');
  disclaimerDiv.className = 'discalimer-details';
  
  // Build expandable content HTML (only if para2 exists)
  const expandableHTML = para2 
    ? `<div class="disclaimer-container dp-none">${para2}</div>` 
    : '';
  
  // Only show read more button if there's expandable content
  const readMoreHTML = para2 
    ? `<button class="read-more-discalimer-calc" data-read-more="${readMoreText}" data-read-less="${readLessText}">${readMoreText}</button>` 
    : '';
  
  disclaimerDiv.innerHTML = `
    <div class="discalimer-calc">
      <span class="title">${title}</span>
      <div class="discalimer-first-para">${para1}</div>
      ${expandableHTML}
      ${readMoreHTML}
    </div>
  `;
  
  return disclaimerDiv;
}

/**
 * Initializes the disclaimer read more/less toggle functionality.
 * @param {Element} section - The calculator section element
 */
export function initDisclaimerToggle(section) {
  const readMoreBtn = section.querySelector('.read-more-discalimer-calc');
  if (!readMoreBtn) return;
  
  const disclaimerContainer = section.querySelector('.disclaimer-container');
  if (!disclaimerContainer) return;
  
  const readMoreText = readMoreBtn.dataset.readMore || 'Read more';
  const readLessText = readMoreBtn.dataset.readLess || 'Read less';
  
  readMoreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isExpanded = !disclaimerContainer.classList.contains('dp-none');
    
    if (isExpanded) {
      disclaimerContainer.classList.add('dp-none');
      readMoreBtn.textContent = readMoreText;
    } else {
      disclaimerContainer.classList.remove('dp-none');
      readMoreBtn.textContent = readLessText;
    }
  });
}

/**
 * Initializes calculator tab (EMI / Eligibility) switching.
 * When switching tabs it resets the target calculator to defaults
 * and triggers a recalculation via the workflow events.
 * @param {Element} section - Optional section element to scope the search
 */
export function initCalculatorTabs(section = null) {
  // Support both scoped (section) and global (document) search
  const root = section || document;
  const calcParent = root.querySelector('.calculator-parent');
  if (!calcParent) {
    // eslint-disable-next-line no-console
    console.warn('[calculator] initCalculatorTabs: No calculator-parent found in root:', root);
    return;
  }

  const headingtabs = calcParent.querySelector('.headingtabs');
  if (!headingtabs) {
    // eslint-disable-next-line no-console
    console.warn('[calculator] initCalculatorTabs: No .headingtabs found');
    return;
  }

  const tabs = [...headingtabs.querySelectorAll('.tab-common:not(.gst-third-tab)')];
  const calcBlocks = [...calcParent.querySelectorAll('.calctabs .commoncalculator')];

  if (!tabs.length) {
    // eslint-disable-next-line no-console
    console.warn('[calculator] initCalculatorTabs: No tabs found');
    return;
  }

  // IMPORTANT: If only one calculator exists and it's eligibility, make it visible
  // The CSS hides .eligibilitycalculator by default, so we need to add .elgblock
  if (calcBlocks.length === 1) {
    const singleCalc = calcBlocks[0];
    if (singleCalc.classList.contains('eligibilitycalculator')) {
      singleCalc.classList.add('elgblock');
      singleCalc.style.display = 'block';
    }
  }

  // Set initial state - first tab active, first calc visible
  if (calcBlocks.length > 0) {
    calcBlocks.forEach((blk, idx) => {
      if (idx === 0) {
        blk.classList.add('elgblock');
        blk.style.display = 'block';
      } else {
        blk.classList.remove('elgblock');
        blk.style.display = 'none';
      }
    });
  }

  /**
   * Handle tab switch
   * @param {number} tabIndex - Index of tab to activate
   */
  function switchToTab(tabIndex) {
    // Update tab active states
    tabs.forEach((t, i) => {
      if (i === tabIndex) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    // Show/hide calculator blocks
    calcBlocks.forEach((blk, idx) => {
      if (idx === tabIndex) {
        blk.classList.add('elgblock');
        blk.style.display = 'block';
        
        // Update description text based on active calculator's description
        const descriptionEl = calcParent.querySelector('.first-head');
        if (descriptionEl && blk.dataset.calcDescription) {
          descriptionEl.textContent = blk.dataset.calcDescription;
        }
      } else {
        blk.classList.remove('elgblock');
        blk.style.display = 'none';
      }
    });

    // Reset the now-visible block to defaults when switching
    if (calcBlocks[tabIndex]) {
      const targetBlock = calcBlocks[tabIndex];
      // Inline reset logic - no dependency on old calculator
      const calDefaultValueObj = JSON.parse(sessionStorage.getItem('calDefaultValueObj') || '{}');
      const calId = targetBlock.dataset.resetId;
      const calObj = calDefaultValueObj[calId] || {};
      Object.keys(calObj).forEach((id) => {
        const rangeInput = targetBlock.querySelector(`[id=${id}]`);
        if (rangeInput) {
          rangeInput.value = calObj[id];
          rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      // Dispatch change event on the block for calculation
      targetBlock.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Use EVENT DELEGATION on the headingtabs container for more reliable click handling
  // This is more robust than direct onclick handlers
  headingtabs.addEventListener('click', function(e) {
    // Find the clicked tab (could be the li or the p inside)
    const clickedTab = e.target.closest('.tab-common:not(.gst-third-tab)');
    if (!clickedTab) return;

    e.preventDefault();

    // Find the index of the clicked tab
    const tabIndex = tabs.indexOf(clickedTab);
    if (tabIndex === -1) {
      // Try using data-tab-index
      const dataIndex = clickedTab.dataset.tabIndex;
      if (dataIndex !== undefined) {
        switchToTab(parseInt(dataIndex, 10));
      }
      return;
    }

    switchToTab(tabIndex);
  });

  // Also set cursor style on tabs
  tabs.forEach((tab) => {
    tab.style.cursor = 'pointer';
    const pElement = tab.querySelector('p');
    if (pElement) {
      pElement.style.cursor = 'pointer';
    }
  });
}
