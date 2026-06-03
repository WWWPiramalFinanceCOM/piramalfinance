/**
 * Prepares calculator blocks by adding classes, data attributes,
 * and reading the calculator name, heading & tab names from block metadata.
 *
 * Note: Empty text fields don't create DOM elements, so we can't rely on fixed indices.
 * We robustly find tabLabel and description by checking elements after productType/calcName.
 *
 * @param {Element[]} blocks - Array of calculator block elements
 * @returns {object}
 */
export function prepareBlocks(blocks) {
  const firstMeta = blocks[0].children[0]?.children[0]?.children;
  const firstMetaArray = Array.from(firstMeta || []);
  // [0] and [1] are always productType and calcName (dropdowns with defaults)
  const productType = (firstMetaArray[0]?.textContent?.trim() || 'hl').toLowerCase();

  const tabNames = [];
  const calcNames = [];
  const descriptions = []; // Store description for EACH calculator

  blocks.forEach((blk, idx) => {
    const meta = blk.children[0]?.children[0]?.children;
    const metaArray = Array.from(meta || []);
    const calcName = (metaArray[1]?.textContent?.trim() || '').toLowerCase();

    // Get tab name for this block - check if [2] is text (not image)
    let tabName = '';
    let blockDescription = '';
    const blockEl2 = metaArray[2];
    const blockEl3 = metaArray[3];
    const blockEl2HasImage = blockEl2?.querySelector?.('img') || blockEl2?.querySelector?.('picture');
    const blockEl3HasImage = blockEl3?.querySelector?.('img') || blockEl3?.querySelector?.('picture');
    
    // [2] = tabLabel (if text), [3] = description (if text)
    if (!blockEl2HasImage && blockEl2?.textContent?.trim()) {
      tabName = blockEl2.textContent.trim();
      // Check if [3] is description (text, not image)
      if (!blockEl3HasImage && blockEl3?.textContent?.trim()) {
        blockDescription = blockEl3.textContent.trim();
      }
    }

    tabNames.push(tabName);
    calcNames.push(calcName);
    descriptions.push(blockDescription);

    blk.classList.add('commoncalculator');
    blk.dataset.resetId = `calid-${idx}`;
    // Store description on the block for tab switching
    blk.dataset.calcDescription = blockDescription;
    
    // Add the calculator name as a class (e.g. emicalculator, gstcalculator)
    if (calcName) blk.classList.add(calcName);

    // Legacy compat: also add the emi/eligibility specific class
    if (calcName.includes('eligibility')) {
      blk.classList.add('eligibilitycalculator');
    } else if (calcName.includes('emi') || calcName.includes('homeloan')) {
      blk.classList.add('emicalculator');
    }
  });

  // Use first description as default (for backwards compatibility)
  const description = descriptions[0] || '';

  return {
    description, descriptions, tabNames, calcNames, productType,
  };
}

/**
 * Extracts CTA items (anchor links) from default-content-wrapper divs.
 * Radio items are now handled by the separate calculator-radio block.
 * @param {Element} section - The calculator section element
 * @returns {{ ctaItems: Array, dcwToRemove: Array }}
 */
export function extractContent(section) {
  const dcwList = [...section.querySelectorAll('.default-content-wrapper')];
  const ctaItems = [];
  const dcwToRemove = [];

  // Check if calculator-radio block exists in section
  const hasRadioBlock = section.querySelector('.calculator-radio');

  dcwList.forEach((dcw) => {
    const ul = dcw.querySelector('ul');
    if (!ul) return;
    const lis = [...ul.querySelectorAll(':scope > li')];
    const hasIcons = lis.some((li) => li.querySelector('.icon'));
    const hasLinks = lis.some((li) => li.querySelector('a'));

    // Skip icon lists if calculator-radio block handles them
    if (hasIcons && !hasRadioBlock) {
      // Legacy: remove icon DCW (radio handled elsewhere)
      dcwToRemove.push(dcw);
    } else if (hasLinks && !ctaItems.length) {
      lis.forEach((li) => {
        const a = li.querySelector('a');
        if (a) ctaItems.push(a);
      });
      dcwToRemove.push(dcw);
    }
  });

  return { ctaItems, dcwToRemove };
}
