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
  // eslint-disable-next-line no-unused-vars
  const firstMetaArray = Array.from(firstMeta || []);
  // Product type comes from CSS class (classes field), not from content
  const validProductTypes = ['hl', 'pl', 'bl', 'ubl'];
  const productType = validProductTypes.find((t) => blocks[0].classList.contains(t)) || 'hl';

  // Valid calculator types (come from classes_type field as CSS classes)
  const validCalcTypes = ['emicalculator', 'eligibilitycalculator', 'aprcalculator', 'gstcalculatorbuyer', 'gstcalculatorseller', 'partpaymentcalculator'];

  const tabNames = [];
  const calcNames = [];
  const descriptions = []; // Store description for EACH calculator

  blocks.forEach((blk, idx) => {
    const meta = blk.children[0]?.children[0]?.children;
    const metaArray = Array.from(meta || []);
    // calcName comes from CSS class (classes_type field), not from content
    const calcName = validCalcTypes.find((t) => blk.classList.contains(t)) || '';

    // Since productType and calcName are both CSS classes,
    // content starts from [0]: tabLabel, [1]: description
    let tabName = '';
    let blockDescription = '';
    const blockEl0 = metaArray[0];
    const blockEl1 = metaArray[1];
    const blockEl0HasImage = blockEl0?.querySelector?.('img') || blockEl0?.querySelector?.('picture');
    const blockEl1HasImage = blockEl1?.querySelector?.('img') || blockEl1?.querySelector?.('picture');

    // [0] = tabLabel (if text), [1] = description (if text)
    if (!blockEl0HasImage && blockEl0?.textContent?.trim()) {
      tabName = blockEl0.textContent.trim();
      if (!blockEl1HasImage && blockEl1?.textContent?.trim()) {
        blockDescription = blockEl1.textContent.trim();
      }
    }

    tabNames.push(tabName);
    calcNames.push(calcName);
    descriptions.push(blockDescription);

    blk.classList.add('commoncalculator');
    blk.dataset.resetId = `calid-${idx}`;
    // Store description on the block for tab switching
    blk.dataset.calcDescription = blockDescription;

    // Add the calculator name as a class (already applied by xwalk via classes_type,
    // but ensure it's there for legacy compat)
    if (calcName && !blk.classList.contains(calcName)) blk.classList.add(calcName);

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
    } else if (!hasIcons && !hasLinks && !ctaItems.length) {
      // Text-only list items: create anchors with href="#" to open form
      lis.forEach((li) => {
        const text = li.textContent.trim();
        if (text) {
          const a = document.createElement('a');
          a.href = '#';
          a.textContent = text;
          ctaItems.push(a);
        }
      });
      dcwToRemove.push(dcw);
    }
  });

  return { ctaItems, dcwToRemove };
}
