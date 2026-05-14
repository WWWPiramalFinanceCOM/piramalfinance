/**
 * Prepares calculator blocks by adding classes, data attributes,
 * and reading the calculator name, heading & tab names from block metadata.
 *
 * First row structure:
 *   <p>0 = productType   (e.g. "hl", "pl", "bl")
 *   <p>1 = calculatorName (e.g. "emicalculator", "gstcalculator", "aprcalculator")
 *   <p>2 = tabName        (e.g. "EMI Calculator")
 *   <p>3 = heading        (only read from the first block)
 *   ...
 *
 * @param {Element[]} blocks - Array of calculator block elements
 * @returns {object}
 */
export function prepareBlocks(blocks) {
  const firstMeta = blocks[0].children[0]?.children[0]?.children;
  const productType = (firstMeta?.[0]?.textContent?.trim() || 'hl').toLowerCase();
  const heading = firstMeta?.[3]?.textContent?.trim()
    || 'Calculate EMI & Check eligibility';

  const tabNames = [];
  const calcNames = [];

  blocks.forEach((blk, idx) => {
    const meta = blk.children[0]?.children[0]?.children;
    const calcName = (meta?.[1]?.textContent?.trim() || '').toLowerCase();
    const tabName = meta?.[2]?.textContent?.trim() || `Calculator ${idx + 1}`;
    tabNames.push(tabName);
    calcNames.push(calcName);

    blk.classList.add('commoncalculator');
    blk.dataset.resetId = `calid-${idx}`;
    // Add the calculator name as a class (e.g. emicalculator, gstcalculator)
    if (calcName) blk.classList.add(calcName);

    // Legacy compat: also add the emi/eligibility specific class
    if (calcName.includes('eligibility')) {
      blk.classList.add('eligibilitycalculator');
    } else if (calcName.includes('emi') || calcName.includes('homeloan')) {
      blk.classList.add('emicalculator');
    }
  });

  return {
    heading, tabNames, calcNames, productType,
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
