import { applyLoanNow, bannerClick, ctaClick } from '../../dl.js';
import { targetObject } from '../../scripts/scripts.js';

function firstContent(cell) {
  return cell?.firstElementChild || cell;
}

function textOf(cell) {
  return firstContent(cell)?.textContent?.trim() || '';
}

function isImageLike(value = '') {
  return value.includes('/content/dam/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value);
}

function escapeAttribute(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function createBackgroundMedia(desktopSrc, mobileSrc, isInitiallyActive) {
  const desktop = (desktopSrc || '').trim();
  const mobile = (mobileSrc || '').trim();
  if (!desktop && !mobile) {
    return '';
  }

  const fallbackSrc = desktop || mobile;
  const sourceMarkup = mobile ? `<source media="(max-width: 991px)" srcset="${escapeAttribute(mobile)}">` : '';
  const loading = isInitiallyActive ? 'eager' : 'lazy';
  const fetchPriority = isInitiallyActive ? 'high' : 'low';

  return `
    <picture>
      ${sourceMarkup}
      <img class="banner-slider-bg-img" src="${escapeAttribute(fallbackSrc)}" alt="" loading="${loading}" decoding="async" fetchpriority="${fetchPriority}">
    </picture>
  `;
}

function imageSources(cell) {
  const values = [];
  const candidates = [cell, firstContent(cell)].filter(Boolean);

  candidates.forEach((candidate) => {
    const pics = candidate.tagName === 'PICTURE' ? [candidate] : [...candidate.querySelectorAll?.('picture') || []];
    pics.forEach((picture) => {
      const img = picture.querySelector('img');
      if (img?.src) {
        values.push(img.src);
      }
    });

    const imgs = candidate.tagName === 'IMG' ? [candidate] : [...candidate.querySelectorAll?.('img') || []];
    imgs.forEach((img) => {
      if (img?.src) {
        values.push(img.src);
      }
    });

    const links = candidate.tagName === 'A' ? [candidate] : [...candidate.querySelectorAll?.('a') || []];
    links.forEach((link) => {
      if (link?.href && isImageLike(link.href)) {
        values.push(link.href);
      }
    });

    const rawText = candidate.textContent?.trim();
    if (rawText && (rawText.startsWith('/content/dam/') || isImageLike(rawText))) {
      values.push(rawText);
    }
  });

  return [...new Set(values)];
}

function pictureElements(cell) {
  if (!cell) return [];
  const candidates = [cell, firstContent(cell)].filter(Boolean);
  const pictures = [];
  const seen = new Set();
  candidates.forEach((candidate) => {
    const pics = candidate.tagName === 'PICTURE' ? [candidate] : [...candidate.querySelectorAll?.('picture') || []];
    pics.forEach((picture) => {
      if (!seen.has(picture)) {
        seen.add(picture);
        pictures.push(picture);
      }
    });
  });
  return pictures;
}

function imageMarkupFromCell(cell) {
  // First try to find a <picture> element (preserves sources + alt)
  const pics = pictureElements(cell);
  if (pics.length) return pics[0].outerHTML;
  // Fallback: standalone <img> not inside a <picture> (common for SVGs)
  const candidates = [cell, firstContent(cell)].filter(Boolean);
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const img = candidate.tagName === 'IMG' ? candidate : candidate.querySelector?.('img');
    if (img?.src) {
      return `<picture>${img.outerHTML}</picture>`;
    }
  }
  // Fallback: <a href="image-path">text</a> (EDS renders DAM icon references this way)
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const link = candidate.tagName === 'A' ? candidate : candidate.querySelector?.('a');
    if (link?.href && isImageLike(link.href)) {
      const alt = (link.textContent || '').trim();
      return `<picture><img src="${link.href}" alt="${alt}" loading="lazy" decoding="async"></picture>`;
    }
  }
  return '';
}

function hrefFromParagraph(paragraph) {
  if (!paragraph) {
    return '';
  }

  const anchor = paragraph.querySelector('a');
  if (anchor?.href) {
    return anchor.href;
  }

  const raw = paragraph.textContent?.trim() || '';
  if (isLikelyUrl(raw) || isImageLike(raw)) {
    return raw;
  }

  return '';
}

function isLikelyUrl(value = '') {
  const text = value.trim();
  return /^https?:\/\//i.test(text)
    || text.startsWith('#')
    || text.startsWith('/')
    || text.includes('/content/dam/')
    || /^www\./i.test(text);
}

function normalizeHref(value = '') {
  const text = value.trim();
  if (!text) {
    return '';
  }

  if (/^www\./i.test(text)) {
    return `https://${text}`;
  }

  return text;
}

function isHashLink(value = '') {
  const text = value.trim();
  if (!text) {
    return false;
  }

  if (text === '#') {
    return true;
  }

  try {
    const parsed = new URL(text, window.location.href);
    // Keep behavior permissive for same-origin hash-only CTA links so local authored
    // URL normalization differences (e.g. trailing slash) do not block form opening.
    return parsed.origin === window.location.origin && (parsed.hash === '#' || parsed.href.endsWith('#'));
  } catch (error) {
    return false;
  }
}

function attachLoanFormCloseFallback(scope) {
  const formNode = scope?.querySelector('.loan-form-sub-parent') || document.querySelector('.loan-form-sub-parent');
  if (!formNode || formNode.dataset.bannerSliderCloseFallbackBound === 'true') {
    return;
  }

  const forceCloseForm = () => {
    const overlayNode = scope?.querySelector('.modal-overlay') || document.querySelector('.modal-overlay');
    formNode.classList.remove('loan-form--open');
    formNode.style.visibility = 'hidden';
    if (overlayNode) {
      overlayNode.classList.remove('overlay');
      overlayNode.classList.add('dp-none');
    }
    document.body.style.overflowY = 'auto';
  };

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (!event.target.closest('.crossimage, .failformcross, .crossimage img, .failformcross img')) {
      return;
    }

    // Let existing applyloanform close logic run first; fallback only if form is still open.
    window.setTimeout(() => {
      if (window.getComputedStyle(formNode).visibility !== 'hidden') {
        forceCloseForm();
      }
    }, 0);
  }, true);

  formNode.dataset.bannerSliderCloseFallbackBound = 'true';
}

function keepLeadFormDropdownsBelow(scope) {
  const formNode = scope?.querySelector('.loan-form-sub-parent') || document.querySelector('.loan-form-sub-parent');
  if (!formNode || formNode.dataset.bannerSliderDropdownBound === 'true') {
    return;
  }

  const pinBelow = (trigger, container) => {
    if (!trigger || !container) {
      return;
    }

    const offsetParent = container.offsetParent || formNode;
    const triggerRect = trigger.getBoundingClientRect();
    const parentRect = offsetParent.getBoundingClientRect();
    const top = Math.max(0, triggerRect.bottom - parentRect.top);
    const left = Math.max(0, triggerRect.left - parentRect.left);

    container.style.setProperty('position', 'absolute', 'important');
    container.style.setProperty('inset', 'auto', 'important');
    container.style.setProperty('bottom', 'auto', 'important');
    container.style.setProperty('left', `${left}px`, 'important');
    container.style.setProperty('right', 'auto', 'important');
    container.style.setProperty('top', `${top}px`, 'important');
    container.style.setProperty('transform', 'none', 'important');
    container.dataset.popperPlacement = 'bottom';
  };

  const bindBelowHandler = (triggerSelector, containerSelector) => {
    const trigger = formNode.querySelector(triggerSelector);
    const container = formNode.querySelector(containerSelector);
    if (!trigger || !container) {
      return;
    }

    trigger.addEventListener('click', () => {
      // Popper writes styles during/after click; enforce below placement in a few ticks.
      window.requestAnimationFrame(() => {
        pinBelow(trigger, container);
      });
      window.setTimeout(() => {
        pinBelow(trigger, container);
      }, 0);
      window.setTimeout(() => {
        pinBelow(trigger, container);
      }, 60);
    });
  };

  bindBelowHandler('#stateparent', '#statecontainer');
  bindBelowHandler('#branchparent', '#branchcontainer');
  formNode.dataset.bannerSliderDropdownBound = 'true';
}

function isApplyLoanLabel(value = '') {
  const normalized = value.trim().toLowerCase();
  return normalized === 'apply loan now' || normalized === 'apply now';
}

function isTokenValue(value = '') {
  const text = value.trim();
  return !text || isLikelyUrl(text) || /^#[0-9a-f]{3,8}$/i.test(text);
}

function normalizeForCompare(value = '') {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function contentHtml(cell) {
  if (!cell) {
    return '';
  }

  // If the cell itself is a block element (heading, p, ul, etc.), use its outerHTML
  // so the tag is preserved (e.g. <h2>Quick &amp; Hassle-Free</h2>).
  const tag = (cell.tagName || '').toLowerCase();
  const isBlockElement = /^(h[1-6]|p|ul|ol|div|blockquote)$/.test(tag);
  if (isBlockElement) {
    return cell.outerHTML?.trim() || '';
  }

  const markup = cell.innerHTML?.trim() || '';
  // For wrapper cells, preserve authored richtext markup (p/heading/strong/links) as-is.
  if (/<[^>]+>/.test(markup)) {
    return markup;
  }

  return '';
}

function imageHrefFromParagraph(paragraph) {
  const href = hrefFromParagraph(paragraph);
  return isImageLike(href) ? href : '';
}

function isAuthorEnvironment() {
  const { hostname, pathname } = window.location;
  return hostname.includes('author') || pathname.includes('/editor.html/');
}

const AUTOPLAY_INTERVAL_MS = 7000;

const SLIDE_PLACEMENT_CLASSES = new Set([
  'btn-pos-top-far-left',
  'btn-pos-top-left',
  'btn-pos-top-mid-left',
  'btn-pos-top-center',
  'btn-pos-top-mid-right',
  'btn-pos-top-right',
  'btn-pos-middle-far-left',
  'btn-pos-middle-left',
  'btn-pos-middle-mid-left',
  'btn-pos-middle-center',
  'btn-pos-middle-mid-right',
  'btn-pos-middle-right',
  'btn-pos-bottom-far-left',
  'btn-pos-bottom-left',
  'btn-pos-bottom-mid-left',
  'btn-pos-bottom-center',
  'btn-pos-bottom-mid-right',
  'btn-pos-bottom-right',
  // Legacy aliases retained for existing authored slides.
  'btn-pos-top',
  'btn-pos-bottom',
  'btn-pos-left',
  'btn-pos-right',
  'content-pos-top-left',
  'content-pos-top-center',
  'content-pos-top-right',
  'content-pos-left',
  'content-pos-right',
  'content-pos-top',
  'media-pos-left',
  'media-pos-right',
  'fg-sm',
  'fg-md',
  'fg-lg',
  'fg-full',
  'copy-w-50',
  'copy-w-70',
  'text-green',
  'green-text',
]);

const PLACEMENT_LABEL_TO_CLASS = {
  'top far left': 'btn-pos-top-far-left',
  'top left': 'btn-pos-top-left',
  'top mid left': 'btn-pos-top-mid-left',
  'top center': 'btn-pos-top-center',
  'top mid right': 'btn-pos-top-mid-right',
  'top right': 'btn-pos-top-right',
  'middle far left': 'btn-pos-middle-far-left',
  'middle left': 'btn-pos-middle-left',
  'middle mid left': 'btn-pos-middle-mid-left',
  'middle center': 'btn-pos-middle-center',
  'middle mid right': 'btn-pos-middle-mid-right',
  'middle right': 'btn-pos-middle-right',
  'bottom far left': 'btn-pos-bottom-far-left',
  'bottom left': 'btn-pos-bottom-left',
  'bottom mid left': 'btn-pos-bottom-mid-left',
  'bottom center': 'btn-pos-bottom-center',
  'bottom mid right': 'btn-pos-bottom-mid-right',
  'bottom right': 'btn-pos-bottom-right',
  'content top left': 'content-pos-top-left',
  'content top center': 'content-pos-top-center',
  'content top right': 'content-pos-top-right',
  'content left': 'content-pos-left',
  'content right': 'content-pos-right',
  'content top': 'content-pos-top',
  'media left': 'media-pos-left',
  'media right': 'media-pos-right',
  'fg small': 'fg-sm',
  'fg medium': 'fg-md',
  'fg large': 'fg-lg',
  'fg full': 'fg-full',
  'copy narrow': 'copy-w-50',
  'copy wide': 'copy-w-70',
  'text green': 'text-green',
  'green text': 'green-text',
};

function classTokens(value = '') {
  return value
    .replace(/[\n,]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

function extractPlacementClassesFromSlot(slot) {
  const rawValue = (slot?.textContent || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const mappedClass = PLACEMENT_LABEL_TO_CLASS[rawValue];
  if (mappedClass && SLIDE_PLACEMENT_CLASSES.has(mappedClass)) {
    return [mappedClass];
  }

  const tokens = classTokens(slot?.textContent || '');
  if (!tokens.length) {
    return [];
  }

  return tokens.every((token) => SLIDE_PLACEMENT_CLASSES.has(token)) ? tokens : [];
}

function reservedPlacementSlots(leftSlots) {
  const reservedSlots = [];
  for (let index = leftSlots.length - 1; index >= 0; index -= 1) {
    const slot = leftSlots[index];
    if (extractPlacementClassesFromSlot(slot).length === 0) {
      break;
    }

    reservedSlots.unshift(slot);
  }

  if (reservedSlots.length > 0) {
    return reservedSlots;
  }

  const legacySlot = leftSlots[leftSlots.length - 1];
  return extractPlacementClassesFromSlot(legacySlot).length > 0 ? [legacySlot] : [];
}

function slotIsReservedPlacement(slot, reservedSlots) {
  return reservedSlots.includes(slot);
}

function collectSlidePlacementClasses(row, leftCell, rightCell, leftSlots) {
  const nodeClasses = [
    ...classTokens(row?.className || ''),
    ...classTokens(leftCell?.className || ''),
    ...classTokens(rightCell?.className || ''),
  ];

  const reservedSlots = reservedPlacementSlots(leftSlots);
  const reservedPlacementClasses = reservedSlots.flatMap((slot) => extractPlacementClassesFromSlot(slot));
  const fallbackTokenClasses = reservedPlacementClasses.length
    ? []
    : leftSlots.flatMap((slot) => extractPlacementClassesFromSlot(slot));
  const allCandidates = [...nodeClasses, ...reservedPlacementClasses, ...fallbackTokenClasses];

  return [...new Set(allCandidates.filter((name) => SLIDE_PLACEMENT_CLASSES.has(name)))];
}

function featureItems(leftSlots) {
  if (!leftSlots?.length) {
    return '';
  }

  const iconMarkups = leftSlots
    .map((slot) => imageMarkupFromCell(slot))
    .filter(Boolean)
    .slice(0, 3);

  const textValues = leftSlots
    .map((slot) => (slot.textContent || '').trim())
    .filter((text) => text && !isLikelyUrl(text) && !/^#[0-9a-f]{3,8}$/i.test(text));

  const items = iconMarkups.map((markup, index) => {
    const text = textValues[index] || '';
    return {
      text,
      icon: text ? markup : '',
    };
  }).filter((item) => item.text && item.icon);

  if (!items.length) {
    return '';
  }

  return `
    <div class="banner-slider-features" role="list" aria-label="Slide highlights">
      ${items.map((item) => `
        <div class="banner-slider-feature" role="listitem">
          <div class="banner-slider-feature-icon">${item.icon}</div>
          <span class="banner-slider-feature-text">${item.text}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function resolveImageAssets(rightSources) {
  if (!rightSources.length) {
    return {
      desktopBackground: '',
      mobileBackground: '',
      foreground: '',
    };
  }

  // Support compact authoring: if only one image is supplied, treat it as foreground.
  if (rightSources.length === 1) {
    return {
      desktopBackground: '',
      mobileBackground: '',
      foreground: rightSources[0],
    };
  }

  if (rightSources.length >= 3) {
    return {
      desktopBackground: rightSources[0],
      mobileBackground: rightSources[1] || rightSources[0],
      foreground: rightSources[2] || '',
    };
  }

  return {
    desktopBackground: rightSources[0],
    mobileBackground: rightSources[0],
    foreground: rightSources[1],
  };
}

function resolvePictureElements(rightCell) {
  const pics = pictureElements(rightCell);
  if (!pics.length) {
    return { desktopBgPicture: null, mobileBgPicture: null, foregroundPicture: null };
  }
  if (pics.length === 1) {
    return { desktopBgPicture: null, mobileBgPicture: null, foregroundPicture: pics[0] };
  }
  if (pics.length >= 3) {
    return { desktopBgPicture: pics[0], mobileBgPicture: pics[1] || pics[0], foregroundPicture: pics[2] || null };
  }
  return { desktopBgPicture: pics[0], mobileBgPicture: pics[0], foregroundPicture: pics[1] || null };
}

function foregroundPictureHtml(picture, slideIndex) {
  const clone = picture.cloneNode(true);
  const img = clone.querySelector('img');
  if (img) {
    img.className = 'banner-slider-fg-img';
    img.removeAttribute('width');
    img.removeAttribute('height');
    img.loading = slideIndex === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    if (slideIndex === 0) {
      img.setAttribute('fetchpriority', 'high');
    } else {
      img.setAttribute('fetchpriority', 'low');
    }
  }
  return clone.outerHTML;
}

function backgroundPictureHtml(desktopPic, mobilePic, slideIndex) {
  if (!desktopPic && !mobilePic) return '';
  const pic = (desktopPic || mobilePic).cloneNode(true);
  const img = pic.querySelector('img');
  if (img) {
    img.className = 'banner-slider-bg-img';
    img.loading = slideIndex === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.setAttribute('fetchpriority', slideIndex === 0 ? 'high' : 'low');
  }
  // If we have a separate mothenbile picture, add its source for mobile breakpoint
  if (mobilePic && mobilePic !== desktopPic) {
    const mobileImg = mobilePic.querySelector('img');
    if (mobileImg?.src) {
      const mobileSource = document.createElement('source');
      mobileSource.setAttribute('media', '(max-width: 991px)');
      mobileSource.setAttribute('srcset', mobileImg.src);
      pic.insertBefore(mobileSource, pic.firstChild);
    }
  }
  return pic.outerHTML;
}

function createSlide(row, index) {
  const [leftCell, rightCell] = [...row.children];
  const leftSlots = [...leftCell?.children || []];
  const leftParagraphs = [...leftCell?.querySelectorAll('p') || []];
  const reservedSlots = reservedPlacementSlots(leftSlots);
  const placementClasses = collectSlidePlacementClasses(row, leftCell, rightCell, leftSlots);
  const slotMeta = leftSlots.filter((slot) => !slotIsReservedPlacement(slot, reservedSlots)).map((slot, slotIndex) => {
    const text = (slot.textContent || '').trim();
    const href = hrefFromParagraph(slot);
    return {
      slot,
      slotIndex,
      text,
      href,
      imageHref: imageHrefFromParagraph(slot),
      isHex: /^#[0-9a-f]{3,8}$/i.test(text),
      // isUrl = true only when the slot's visible text IS a raw URL (e.g. pasted CTA link).
      // Slots that merely contain an <a> link (like short description) must NOT be flagged.
      isUrl: isLikelyUrl(text),
    };
  });

  const rightSources = imageSources(rightCell);
  const {
    desktopBackground,
    mobileBackground,
  } = resolveImageAssets(rightSources);
  const { desktopBgPicture, mobileBgPicture, foregroundPicture } = resolvePictureElements(rightCell);
  const hasBackgroundMedia = !!(desktopBgPicture || desktopBackground || mobileBackground);

  const titleCell = leftSlots[0] || null;
  const descriptionCell = leftSlots[1] || null;

  const titleTextRaw = (titleCell?.textContent || leftParagraphs[0]?.textContent || textOf(leftCell)).trim();
  const titleText = isTokenValue(titleTextRaw) ? '' : titleTextRaw;
  // If the description cell has an authored heading, the title is a kicker label (p).
  // Otherwise the title IS the main heading (h2).
  // If the description cell itself IS a heading, or contains a heading in its innerHTML,
  // the title acts as a small kicker label. Otherwise title IS the main heading.
  const descriptionHasHeading = /^h[1-6]$/i.test(descriptionCell?.tagName || '')
    || /<h[1-6][\s>]/i.test(descriptionCell?.innerHTML || '');
  const titleHtml = titleText
    ? (descriptionHasHeading ? `<p class="banner-slider-kicker">${titleText}</p>` : `<h2>${titleText}</h2>`)
    : '';

  const descriptionTextRaw = (descriptionCell?.textContent || leftParagraphs[1]?.textContent || '').trim();
  const descriptionHtmlRaw = contentHtml(descriptionCell);
  const titleCompare = normalizeForCompare(titleTextRaw);
  const descriptionCompare = normalizeForCompare(descriptionTextRaw);
  const descriptionText = (isTokenValue(descriptionTextRaw) || (titleCompare && titleCompare === descriptionCompare)) ? '' : descriptionTextRaw;
  const descriptionHtml = descriptionText
    ? (descriptionHtmlRaw || `<p>${descriptionText}</p>`)
    : '';

  const inlineCtaAnchor = [...leftCell?.querySelectorAll('a') || []]
    .find((anchor) => anchor?.href && !isImageLike(anchor.href));

  const ctaLinkSlot = slotMeta.find((item) => item.href && item.isUrl && !isImageLike(item.href));
  const ctaHref = normalizeHref(ctaLinkSlot?.href || inlineCtaAnchor?.href || '');
  const ctaTextSlot = ctaLinkSlot
    ? slotMeta.slice(ctaLinkSlot.slotIndex + 1).find((item) => item.text && !item.isHex && !item.isUrl && !item.imageHref)
    : null;
  const ctaText = (ctaTextSlot?.text || '').trim();
  const ctaOpensLoanForm = isHashLink(ctaHref);

  // Short description is the first non-hex/non-url/non-image text slot after the CTA text slot.
  // Empty fields are omitted from the DOM so we cannot use a fixed index.
  const shortDescriptionSlot = ctaTextSlot
    ? slotMeta.slice(ctaTextSlot.slotIndex + 1).find((item) => item.text && !item.isHex && !item.isUrl && !item.imageHref)?.slot
    : null;
  const shortDescriptionText = shortDescriptionSlot?.textContent?.trim() || '';
  const shortDescriptionHtml = shortDescriptionText ? shortDescriptionSlot.outerHTML : '';

  // Build feature texts from authored values after excluding non-feature content.
  const exclusionList = [
    titleTextRaw,
    descriptionTextRaw,
    ctaText,
    shortDescriptionText,
  ].map((text) => (text || '').replace(/\s+/g, ' ').trim().toLowerCase()).filter(Boolean);

  const featureLeftSlots = [...leftSlots];
  featureLeftSlots.forEach((slot) => {
    if (slotIsReservedPlacement(slot, reservedSlots)) {
      slot.dataset.featureIgnore = 'true';
      return;
    }

    const raw = (slot.textContent || '').trim();
    const placementClasses = extractPlacementClassesFromSlot(slot);
    const isPlacementOnlyToken = placementClasses.length > 0;
    if (isPlacementOnlyToken) {
      slot.dataset.featureIgnore = 'true';
      return;
    }

    const normalized = raw.replace(/\s+/g, ' ').trim().toLowerCase();
    if (normalized && exclusionList.includes(normalized)) {
      slot.dataset.featureIgnore = 'true';
    }
  });

  const featurePreparedSlots = featureLeftSlots.map((slot) => {
    if (slot.dataset.featureIgnore === 'true') {
      const clone = slot.cloneNode(true);
      clone.textContent = '';
      return clone;
    }
    return slot;
  });

  const slide = document.createElement('div');
  slide.className = 'banner-slider-slide';
  if (ctaOpensLoanForm) {
    slide.classList.add('open-form-on-click');
  }
  if (hasBackgroundMedia) {
    slide.classList.add('has-bg-media');
  }
  placementClasses.forEach((name) => slide.classList.add(name));
  slide.dataset.slideIndex = `${index}`;

  // Keep background color resilient to authored field order changes.
  const bgColorSlot = ctaTextSlot
    ? slotMeta.slice(ctaTextSlot.slotIndex + 1).find((item) => item.isHex)
    : slotMeta.find((item) => item.isHex);
  const bgColor = bgColorSlot?.text.match(/#[0-9a-f]{3,8}/i)?.[0];
  if (bgColor) {
    slide.dataset.bgColor = bgColor;
  }
  if (bgColor && hasBackgroundMedia) {
    slide.classList.add('banner-slider-slide--bg-color-image');
  }
  if (!bgColor && (desktopBgPicture || desktopBackground)) {
    slide.classList.add('banner-slider-slide--bg-cover');
  }

  slide.innerHTML = `
    <div class="banner-slider-bg">
      ${desktopBgPicture ? backgroundPictureHtml(desktopBgPicture, mobileBgPicture, index) : createBackgroundMedia(desktopBackground, mobileBackground, index === 0)}
    </div>
    <div class="banner-slider-surface">
      <div class="banner-slider-content">
        <div class="banner-slider-copy">
          <div class="banner-slider-title">${titleHtml}</div>
          <div class="banner-slider-description">${descriptionHtml}</div>
          ${featureItems(featurePreparedSlots)}
          <div class="banner-slider-actions">
            ${ctaHref && ctaText ? `<div class="banner-slider-cta button-container"><a class="button primary" href="${ctaHref}" data-cta-open-form="${ctaOpensLoanForm ? 'true' : 'false'}">${ctaText}</a></div>` : ''}
            ${shortDescriptionHtml ? `<div class="banner-slider-short-description">${shortDescriptionHtml}</div>` : ''}
          </div>
        </div>
        <div class="banner-slider-media">${foregroundPicture ? foregroundPictureHtml(foregroundPicture, index) : ''}</div>
      </div>
    </div>
  `;

  return slide;
}

export default function decorate(block) {
  if (isAuthorEnvironment()) {
    return;
  }

  const rows = [...block.children].filter((row) => row.children.length >= 2);
  if (!rows.length) {
    return;
  }

  const stage = document.createElement('div');
  stage.className = 'banner-slider-stage';

  const track = document.createElement('div');
  track.className = 'banner-slider-track';

  const dots = document.createElement('div');
  dots.className = 'banner-slider-dots';

  const slides = rows.map((row, index) => createSlide(row, index));
  if (slides.length <= 1) {
    dots.style.display = 'none';
  }
  slides.forEach((slide) => {
    track.appendChild(slide);
  });

  const bgColorRules = slides
    .map((slide) => {
      const slideIndex = slide.dataset.slideIndex;
      const bgColor = slide.dataset.bgColor;
      if (!slideIndex || !bgColor) {
        return '';
      }

      return `.banner-slider.block .banner-slider-slide[data-slide-index="${slideIndex}"] .banner-slider-bg { background-color: ${bgColor}; }`;
    })
    .filter(Boolean)
    .join('\n');

  const bgColorStyle = document.createElement('style');
  bgColorStyle.className = 'banner-slider-bg-colors';
  if (bgColorRules) {
    bgColorStyle.textContent = bgColorRules;
  }

  block.textContent = '';
  block.classList.add('banner-slider', 'banner-slider--ready');
  stage.replaceChildren(track, dots);
  block.replaceChildren(stage, bgColorStyle);

  const ctaAnchors = [...block.querySelectorAll('.banner-slider-cta .button.primary')];
  ctaAnchors.forEach((anchor) => {
    anchor.addEventListener('click', async (event) => {
      event.stopPropagation();

      const clickText = (anchor.textContent || '').trim();
      const href = (anchor.getAttribute('href') || '').trim();
      const ctaCategory = 'banner-slider';
      const ctaPosition = 'banner-slider';
      const pageType = targetObject?.pageName || '';
      const shouldOpenLoanForm = isHashLink(href);

      if (shouldOpenLoanForm) {
        event.preventDefault();

        try {
          bannerClick(clickText || href, pageType);
          ctaClick(clickText || href, ctaCategory, ctaPosition, pageType);
          if (isApplyLoanLabel(clickText)) {
            applyLoanNow('banner', pageType, ctaPosition, pageType);
          }
        } catch (error) {
          console.warn(error);
        }

        try {
          const { onCLickApplyFormOpen, formOpen } = await import('../applyloanform/applyloanforms.js');
          const mainContainer = block.closest('main') || document.querySelector('main') || document.body;
          const loanFormNode = mainContainer.querySelector('.loan-form-sub-parent') || document.querySelector('.loan-form-sub-parent');
          const overlayNode = mainContainer.querySelector('.modal-overlay') || document.querySelector('.modal-overlay');
          const isLoanFormVisible = () => {
            if (!loanFormNode) {
              return false;
            }

            return window.getComputedStyle(loanFormNode).visibility !== 'hidden';
          };

          let formOpened = false;
          if (typeof onCLickApplyFormOpen === 'function' && mainContainer.querySelector('.loan-form-sub-parent')) {
            try {
              onCLickApplyFormOpen(event);
              formOpened = isLoanFormVisible();
            } catch (error) {
              console.warn(error);
            }
          }

          if (!formOpened && typeof formOpen === 'function') {
            formOpen();
            formOpened = isLoanFormVisible();
          }

          // Local/test pages can miss .modal-overlay wiring, which causes formOpen() to no-op.
          // Fallback mirrors minimal open-state classes/styles so CTA still opens the form.
          if (!formOpened && loanFormNode) {
            if (overlayNode) {
              overlayNode.classList.add('overlay');
              overlayNode.classList.remove('dp-none');
            }

            if (window.matchMedia('(max-width: 1024px)').matches) {
              loanFormNode.classList.add('loan-form--open');
            }

            loanFormNode.style.visibility = 'visible';
            document.body.style.overflowY = 'hidden';
          }

          attachLoanFormCloseFallback(mainContainer);
          keepLeadFormDropdownsBelow(mainContainer);
        } catch (error) {
          console.warn(error);
        }
        return;
      }

      try {
        bannerClick(clickText || href, pageType);
        ctaClick(clickText || href, ctaCategory, ctaPosition, pageType);
        if ((clickText || '').trim().toLowerCase() === 'apply loan now') {
          applyLoanNow('banner', pageType, ctaPosition, pageType);
        }
      } catch (error) {
        console.warn(error);
      }
    });
  });

  let activeIndex = 0;
  let timerId = null;
  let isPaused = false;

  const dotButtons = slides.map((_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'banner-slider-dot';
    button.setAttribute('aria-label', `Go to slide ${index + 1}`);
    button.addEventListener('click', () => {
      scrollToSlide(index);
      restartAutoplay();
    });
    dots.appendChild(button);
    return button;
  });

  function scrollToSlide(index) {
    const slide = slides[index];
    if (!slide) return;
    track.scrollTo({ top: 0, left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }

  function updateActiveDot(index) {
    activeIndex = index;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeIndex);
    });
    dotButtons.forEach((button, i) => {
      const isActive = i === activeIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  // IntersectionObserver to detect which slide is visible (same as old carousel)
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = slides.indexOf(entry.target);
        if (idx >= 0) {
          updateActiveDot(idx);
        }
      }
    });
  }, { threshold: 0.6, root: track });

  slides.forEach((slide) => slideObserver.observe(slide));

  function stopAutoplay() {
    if (!timerId) return;
    window.clearInterval(timerId);
    timerId = null;
  }

  function startAutoplay() {
    if (slides.length <= 1 || timerId || isPaused) return;
    timerId = window.setInterval(() => {
      if (document.body.style.overflowY === 'hidden') return;
      const nextIndex = (activeIndex + 1) % slides.length;
      scrollToSlide(nextIndex);
    }, AUTOPLAY_INTERVAL_MS);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  stage.addEventListener('mouseenter', () => {
    isPaused = true;
    stopAutoplay();
  });

  stage.addEventListener('mouseleave', () => {
    isPaused = false;
    startAutoplay();
  });

  document.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
    if (isPaused) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // Initialize
  updateActiveDot(0);
  startAutoplay();
}