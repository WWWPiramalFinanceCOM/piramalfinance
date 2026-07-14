/**
 * Decorates the download-app block.
 *
 * Server renders 3 rows (one per column group):
 *   Row 0 (col2_): Desktop & mobile background images
 *   Row 1 (col1_): Desktop rich text + badge image/link pairs
 *   Row 2 (col3_): CTA link
 *
 * @param {Element} block The download-app block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const bgCell = rows[0]?.children[0];
  const contentCell = rows[1]?.children[0];
  const ctaCell = rows[2]?.children[0];

  // --- Background images from row 0 ---
  const bgPictures = bgCell ? [...bgCell.querySelectorAll('picture')] : [];
  const desktopBgPic = bgPictures[0] || null;
  const mobileBgPic = bgPictures[1] || null;

  // --- Desktop content + badges from row 1 ---
  const desktopTextNodes = [];
  const badgeData = [];

  if (contentCell) {
    const children = [...contentCell.children];
    let i = 0;

    // Collect richtext nodes until first picture
    while (i < children.length) {
      if (children[i].querySelector('picture')) break;
      desktopTextNodes.push(children[i]);
      i += 1;
    }

    // Remaining: badge picture + link pairs
    while (i < children.length) {
      const pic = children[i].querySelector('picture');
      if (pic) {
        const badge = { picture: pic, href: '#' };
        // Next sibling should be a <p> with <a> containing the link URL
        if (i + 1 < children.length) {
          const next = children[i + 1];
          const anchor = next.querySelector('a') || (next.tagName === 'A' ? next : null);
          if (anchor) {
            badge.href = anchor.getAttribute('href') || '#';
            i += 1;
          }
        }
        badgeData.push(badge);
      }
      i += 1;
    }
  }

  // --- CTA from row 2 ---
  let ctaLink = null;
  let mobileH4;
  let mobileP;
  if (ctaCell) {
    const anchor = ctaCell.querySelector('a');
    ctaCell.querySelector('a').remove();
    if (anchor && anchor.getAttribute('href')) {
      ctaLink = anchor;
    }
    mobileH4 = ctaCell.querySelector('h4');
    mobileP = ctaCell.querySelector('p');
  }

  // --- Rebuild DOM ---
  block.innerHTML = '';

  if (desktopBgPic) {
    const div = document.createElement('div');
    div.className = 'download-app-bg-desktop';
    div.appendChild(desktopBgPic);
    block.appendChild(div);
  }

  if (mobileBgPic) {
    const div = document.createElement('div');
    div.className = 'download-app-bg-mobile';
    div.appendChild(mobileBgPic);
    block.appendChild(div);
  }

  const content = document.createElement('div');
  content.className = 'download-app-content';

  if (desktopTextNodes.length) {
    const div = document.createElement('div');
    div.className = 'download-app-text-desktop';
    desktopTextNodes.forEach((n) => div.appendChild(n));
    content.appendChild(div);
  }

  if (badgeData.length) {
    const badges = document.createElement('div');
    badges.className = 'download-app-badges';
    badgeData.forEach((badge) => {
      const a = document.createElement('a');
      a.href = badge.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', badge.picture.querySelector('img')?.getAttribute('alt') || 'Download');
      a.appendChild(badge.picture);
      badges.appendChild(a);
    });
    content.appendChild(badges);
  }

  if (mobileH4) {
    const div = document.createElement('div');
    div.className = 'download-app-text-mobile';
    div.append(mobileH4, mobileP);
    content.appendChild(div);
  }

  if (ctaLink) {
    const div = document.createElement('div');
    div.className = 'download-app-cta';
    const a = document.createElement('a');
    a.href = ctaLink.getAttribute('href');
    a.textContent = ctaLink.textContent || 'Download Now';
    a.setAttribute('aria-label', ctaLink.textContent || 'Download Now');
    div.appendChild(a);
    content.appendChild(div);
  }

  block.appendChild(content);
}
console.log('Console fromdownload');
