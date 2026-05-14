/**
 * Checks if a row is a radio item row based on content pattern.
 * Radio rows have: Text, Image, ImageAlt, FoirType (salaried/biz), FoirValue
 * @param {Element} row - A row element from the block
 * @returns {boolean}
 */
function isRadioItemRow(row) {
  const cells = row.children;
  if (cells.length < 2) return false;

  // Check if second cell has an image (radio items have image in col1)
  const hasImage = cells[1]?.querySelector('img, picture');

  // Check if there's a FOIR type indicator (salaried/biz) in the text content
  const allText = row.textContent.toLowerCase();
  const hasFoirType = allText.includes('salaried')
    || allText.includes('biz')
    || allText.includes('business');

  // Radio rows typically have 4-5 cells, slider rows have 9+ cells
  const cellCount = cells.length;
  const isRadioStructure = cellCount >= 2 && cellCount <= 6;

  return hasImage && (hasFoirType || isRadioStructure);
}

/**
 * Extracts authored radio items from a calculator block.
 * Radio item rows have: Text, Image, ImageAlt, FoirType, FoirValue
 * @param {Element} block - The calculator block element
 * @returns {Array}
 */
function extractAuthoredRadioItems(block) {
  const radioItems = [];
  const rows = [...block.children];

  // Skip first row (metadata) and check remaining rows
  rows.slice(1).forEach((row) => {
    if (!isRadioItemRow(row)) return;

    const cells = row.children;
    const text = cells[0]?.textContent?.trim() || '';
    const img = cells[1]?.querySelector('img');
    const iconSrc = img?.getAttribute('src') || '';
    const iconAlt = cells[2]?.textContent?.trim() || img?.getAttribute('alt') || '';

    // FOIR type can be in cell 3 or derived from text
    let foirType = cells[3]?.textContent?.trim()?.toLowerCase() || '';
    if (!foirType) {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('salaried') || lowerText.includes('salary')) {
        foirType = 'salaried';
      } else if (lowerText.includes('business') || lowerText.includes('biz')) {
        foirType = 'biz';
      }
    }

    // FOIR value in cell 4 or use defaults
    let foirValue = cells[4]?.textContent?.trim() || '';
    if (!foirValue) {
      foirValue = foirType === 'salaried' ? '65' : '80';
    }

    if (text && iconSrc) {
      radioItems.push({
        text, iconSrc, iconAlt, foirType, foirValue,
      });
      row.dataset.radioItem = 'true';
    }
  });

  return radioItems;
}

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
  const authoredRadioItems = [];

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

    // Extract authored radio items from this block
    const radioItems = extractAuthoredRadioItems(blk);
    authoredRadioItems.push(...radioItems);
  });

  return {
    heading, tabNames, calcNames, productType, authoredRadioItems,
  };
}

/**
 * Extracts radio items (icon + text) and CTA items (anchor links)
 * from default-content-wrapper divs inside the section.
 * If authoredRadioItems are provided, they take precedence.
 * @param {Element} section - The calculator section element
 * @param {Array} [authoredRadioItems=[]] - Pre-extracted radio items from authoring
 * @returns {{ radioItems: Array, ctaItems: Array, dcwToRemove: Array }}
 */
export function extractContent(section, authoredRadioItems = []) {
  const dcwList = [...section.querySelectorAll('.default-content-wrapper')];
  const radioItems = [];
  const ctaItems = [];
  const dcwToRemove = [];

  // Use authored radio items if available
  if (authoredRadioItems.length > 0) {
    radioItems.push(...authoredRadioItems);
  }

  dcwList.forEach((dcw) => {
    const ul = dcw.querySelector('ul');
    if (!ul) return;
    const lis = [...ul.querySelectorAll(':scope > li')];
    const hasIcons = lis.some((li) => li.querySelector('.icon'));
    const hasLinks = lis.some((li) => li.querySelector('a'));

    // Only extract radio items from DCW if none were authored
    if (hasIcons && !radioItems.length) {
      lis.forEach((li) => {
        const icon = li.querySelector('.icon img');
        const iconSrc = icon?.getAttribute('src') || '';
        const iconAlt = icon?.getAttribute('alt') || '';
        const clone = li.cloneNode(true);
        const iconSpan = clone.querySelector('.icon');
        if (iconSpan) iconSpan.remove();
        const text = clone.textContent.trim();

        // Derive FOIR type and value from text for legacy content
        let foirType = '';
        let foirValue = '';
        const lowerText = text.toLowerCase();
        if (lowerText.includes('salaried') || lowerText.includes('salary')) {
          foirType = 'salaried';
          foirValue = '65';
        } else if (lowerText.includes('business') || lowerText.includes('biz')) {
          foirType = 'biz';
          foirValue = '80';
        }

        radioItems.push({
          text, iconSrc, iconAlt, foirType, foirValue,
        });
      });
      dcwToRemove.push(dcw);
    } else if (hasLinks && !ctaItems.length) {
      lis.forEach((li) => {
        const a = li.querySelector('a');
        if (a) ctaItems.push(a);
      });
      dcwToRemove.push(dcw);
    }
  });

  return { radioItems, ctaItems, dcwToRemove };
}
