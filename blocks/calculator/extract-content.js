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
  
  // Disclaimer data - extracted from first block that has it
  let disclaimer = {
    title: '',
    para1: '',
    para2: '',
    para3: '',
    readMoreText: 'Read more',
    readLessText: 'Read less',
  };

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
    
    // Extract disclaimer from this block (use first one that has it)
    if (!disclaimer.title) {
      const blockDisclaimer = extractDisclaimer(blk);
      if (blockDisclaimer.title) {
        disclaimer = blockDisclaimer;
      }
    }
  });

  // Use first description as default (for backwards compatibility)
  const description = descriptions[0] || '';

  return {
    description, descriptions, tabNames, calcNames, productType, disclaimer,
  };
}

/**
 * Extracts disclaimer data from a calculator block.
 * Disclaimer fields appear after output-related fields in the first row.
 * @param {Element} block - Calculator block element
 * @returns {object} Disclaimer data object
 */
function extractDisclaimer(block) {
  const disclaimer = {
    title: '',
    para1: '',
    para2: '',
    para3: '',
    readMoreText: 'Read more',
    readLessText: 'Read less',
  };
  
  const meta = block.children[0]?.children[0]?.children;
  if (!meta) return disclaimer;
  
  const metaArray = Array.from(meta);
  
  // Collect all text elements (exclude images/pictures)
  const textElements = metaArray.filter((el) => {
    const hasImage = el.querySelector?.('img') || el.querySelector?.('picture');
    return !hasImage && el.textContent?.trim();
  });
  
  // Disclaimer fields are at the end of text elements
  // Order: ...other fields..., disclaimerTitle, disclaimerPara1, disclaimerPara2, disclaimerPara3, readMoreText, readLessText
  // Since we have variable number of fields before disclaimer, look for the pattern
  // The disclaimer title usually contains "Disclaimer" or similar keyword
  
  // Find disclaimer title by looking for text containing "disclaimer" (case-insensitive)
  // or if it's simply the 6th-to-last text element
  const len = textElements.length;
  
  // Look for explicit "Disclaimer" text, or use positional extraction
  let disclaimerStartIdx = -1;
  for (let i = 0; i < len; i++) {
    const text = textElements[i].textContent.trim().toLowerCase();
    if (text.includes('disclaimer')) {
      disclaimerStartIdx = i;
      break;
    }
  }
  
  // If found by keyword, extract from that position
  if (disclaimerStartIdx >= 0 && disclaimerStartIdx + 1 < len) {
    disclaimer.title = textElements[disclaimerStartIdx]?.textContent?.trim() || '';
    disclaimer.para1 = textElements[disclaimerStartIdx + 1]?.innerHTML?.trim() || textElements[disclaimerStartIdx + 1]?.textContent?.trim() || '';
    disclaimer.para2 = textElements[disclaimerStartIdx + 2]?.innerHTML?.trim() || textElements[disclaimerStartIdx + 2]?.textContent?.trim() || '';
    disclaimer.para3 = textElements[disclaimerStartIdx + 3]?.innerHTML?.trim() || textElements[disclaimerStartIdx + 3]?.textContent?.trim() || '';
    disclaimer.readMoreText = textElements[disclaimerStartIdx + 4]?.textContent?.trim() || 'Read more';
    disclaimer.readLessText = textElements[disclaimerStartIdx + 5]?.textContent?.trim() || 'Read less';
  }
  
  return disclaimer;
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
