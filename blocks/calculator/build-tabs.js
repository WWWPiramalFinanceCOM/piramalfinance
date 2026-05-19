/**
 * Builds the calculator-parent wrapper with heading, tabs, CTA buttons,
 * and moves calculator blocks into the calctabs container.
 * @param {string} description - The Description field from authoring
 * @param {string[]} tabNames - Tab Label field from each calculator
 * @param {HTMLAnchorElement[]} ctaItems
 * @param {Element[]} blocks
 * @returns {HTMLElement}
 */
export function buildCalculatorParent(description, tabNames, ctaItems, blocks, isGstCalculator = false) {
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
    <div class="discalimer-details dp-none"></div>
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
 * Initializes calculator tab (EMI / Eligibility) switching.
 * When switching tabs it resets the target calculator to defaults
 * and triggers a recalculation via the workflow events.
 */
export function initCalculatorTabs() {
  const calcParent = document.querySelector('.calculator-parent');
  if (!calcParent) return;

  const tabs = [...calcParent.querySelectorAll('.headingtabs .tab-common:not(.gst-third-tab)')];
  const calcBlocks = [...calcParent.querySelectorAll('.calctabs .commoncalculator')];

  // IMPORTANT: If only one calculator exists and it's eligibility, make it visible
  // The CSS hides .eligibilitycalculator by default, so we need to add .elgblock
  if (calcBlocks.length === 1) {
    const singleCalc = calcBlocks[0];
    if (singleCalc.classList.contains('eligibilitycalculator')) {
      singleCalc.classList.add('elgblock');
      singleCalc.style.display = 'block';
    }
    return;
  }

  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabIndex = parseInt(tab.dataset.tabIndex || '0', 10);
      const wasActive = tab.classList.contains('active');

      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      calcBlocks.forEach((blk, idx) => {
        if (idx === 0) {
          blk.style.display = tabIndex === 0 ? '' : 'none';
        } else if (idx === tabIndex) {
          blk.classList.add('elgblock');
          blk.style.display = '';
        } else {
          blk.classList.remove('elgblock');
          blk.style.display = 'none';
        }
      });

      // Reset the now-visible block to defaults when switching
      if (!wasActive) {
        const targetBlock = calcBlocks[tabIndex] || calcBlocks[0];
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
        targetBlock.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
}
