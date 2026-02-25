/**
 * Builds the calculator-parent wrapper with heading, tabs, CTA buttons,
 * and moves calculator blocks into the calctabs container.
 * @param {string} heading
 * @param {string[]} tabNames
 * @param {HTMLAnchorElement[]} ctaItems
 * @param {Element[]} blocks
 * @returns {HTMLElement}
 */
export function buildCalculatorParent(heading, tabNames, ctaItems, blocks) {
  let tabsLiHTML = '';
  tabNames.forEach((name, idx) => {
    const activeClass = idx === 0 ? ' active' : '';
    const tabClass = idx === 0 ? 'tab-emi-calc' : 'tab-eligibility-calc';
    tabsLiHTML += `<li class="${tabClass} tab-common${activeClass}" data-tab-index="${idx}"><p>${name}</p></li>\n`;
  });
  tabsLiHTML += '<li class="tab-eligibility-calc tab-common gst-third-tab"><p></p></li>';

  const calcParent = document.createElement('div');
  calcParent.className = 'calculator-parent';
  calcParent.innerHTML = `
    <div class="calculator-parent-child">
      <div class="cp-child">
        <div class="mainheading">
          <p class="first-head">${heading}</p>
          <p class="second-head"></p>
        </div>
        <div class="headingtabs">
          <ul class="headul">
            ${tabsLiHTML}
          </ul>
        </div>
        <div class="calctabs"></div>
      </div>
    </div>
    <div class="discalimer-details dp-none"></div>
  `;

  // CTA buttons
  if (ctaItems.length > 0) {
    const custButtons = document.createElement('div');
    custButtons.className = 'customerbuttons';
    ctaItems.forEach((serverAnchor, idx) => {
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

  if (calcBlocks.length <= 1 || !tabs.length) return;

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
        try {
          // Lazy‑import resetCalculator from the existing legacy module
          import('../emiandeligiblitycalc/resetCalculator.js').then(({ resetCalculator }) => {
            resetCalculator(targetBlock);
            // Fire a change event so the workflow picks up the reset values
            targetBlock.dispatchEvent(new Event('change', { bubbles: true }));
          });
        } catch (_) { /* noop if module not found */ }
      }
    });
  });
}
