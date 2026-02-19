/**
 * Prepares calculator blocks by adding classes, data attributes,
 * and reading the heading & tab names from block metadata.
 * @param {Element[]} blocks - Array of calculator block elements
 * @returns {{ heading: string, tabNames: string[] }}
 */
export function prepareBlocks(blocks) {
  const firstMeta = blocks[0].children[0]?.children[0]?.children;
  const heading = firstMeta?.[1]?.textContent?.trim() || 'Calculate EMI & Check eligibility';

  const tabNames = [];
  blocks.forEach((blk, idx) => {
    const meta = blk.children[0]?.children[0]?.children;
    const tabName = meta?.[0]?.textContent?.trim() || `Calculator ${idx + 1}`;
    tabNames.push(tabName);
    blk.classList.add('commoncalculator');
    blk.dataset.resetId = `calid-${idx}`;
    if (tabName.toLowerCase().includes('eligibility')) {
      blk.classList.add('eligibilitycalculator');
    } else {
      blk.classList.add('emicalculator');
    }
  });

  return { heading, tabNames };
}

/**
 * Extracts radio items (icon + text) and CTA items (anchor links)
 * from default-content-wrapper divs inside the section.
 * @param {Element} section - The calculator section element
 * @returns {{ radioItems: Array, ctaItems: Array, dcwToRemove: Array }}
 */
export function extractContent(section) {
  const defaultContentWrappers = [...section.querySelectorAll('.default-content-wrapper')];
  const radioItems = [];
  const ctaItems = [];
  const dcwToRemove = [];

  defaultContentWrappers.forEach((dcw) => {
    const ul = dcw.querySelector('ul');
    if (!ul) return;
    const lis = [...ul.querySelectorAll(':scope > li')];
    const hasIcons = lis.some((li) => li.querySelector('.icon'));
    const hasLinks = lis.some((li) => li.querySelector('a'));

    if (hasIcons && !radioItems.length) {
      lis.forEach((li) => {
        const icon = li.querySelector('.icon img');
        const iconSrc = icon?.getAttribute('src') || '';
        const clone = li.cloneNode(true);
        const iconSpan = clone.querySelector('.icon');
        if (iconSpan) iconSpan.remove();
        const text = clone.textContent.trim();
        radioItems.push({ text, iconSrc });
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
