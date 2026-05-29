function firstContent(cell) {
  return cell?.firstElementChild || cell;
}

function textOf(cell) {
  return firstContent(cell)?.textContent?.trim() || '';
}

function isImageLike(value = '') {
  return value.includes('/content/dam/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value);
}

function createPicture(src, alt = '') {
  if (!src) {
    return '';
  }

  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  picture.replaceChildren(img);
  return picture.outerHTML;
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

function hrefFromParagraph(paragraph) {
  if (!paragraph) {
    return '';
  }

  const anchor = paragraph.querySelector('a');
  if (anchor?.href) {
    return anchor.href;
  }

  const raw = paragraph.textContent?.trim() || '';
  if (isLikelyUrl(raw) || raw.startsWith('/content/dam/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(raw)) {
    return raw;
  }

  return '';
}

function isLikelyUrl(value = '') {
  const text = value.trim();
  return /^https?:\/\//i.test(text)
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

function imageSourceFromCell(cell) {
  const values = imageSources(cell);
  return values.length ? values[0] : '';
}

function isAuthorEnvironment() {
  const { hostname, pathname } = window.location;
  return hostname.includes('author') || pathname.includes('/editor.html/');
}

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
]);

function classTokens(value = '') {
  return value
    .replace(/[\n,]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

function extractPlacementClassesFromSlot(slot) {
  const tokens = classTokens(slot?.textContent || '');
  if (!tokens.length) {
    return [];
  }

  return tokens.every((token) => SLIDE_PLACEMENT_CLASSES.has(token)) ? tokens : [];
}

function collectSlidePlacementClasses(row, leftCell, rightCell, leftSlots) {
  const nodeClasses = [
    ...classTokens(row?.className || ''),
    ...classTokens(leftCell?.className || ''),
    ...classTokens(rightCell?.className || ''),
  ];

  // Dedicated authoring field: the last left-column field can contain only placement classes.
  const reservedPlacementClasses = extractPlacementClassesFromSlot(leftSlots[leftSlots.length - 1]);
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

  const iconValues = leftSlots
    .map((slot) => imageSourceFromCell(slot))
    .filter(Boolean)
    .slice(0, 3);

  const textValues = leftSlots
    .map((slot) => (slot.textContent || '').trim())
    .filter((text) => text && !isLikelyUrl(text) && !/^#[0-9a-f]{3,8}$/i.test(text));

  const items = iconValues.map((icon, index) => {
    const text = textValues[index] || '';
    return {
      text,
      icon: text ? createPicture(icon, text) : '',
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

function createSlide(row, index) {
  const [leftCell, rightCell] = [...row.children];
  const leftSlots = [...leftCell?.children || []];
  const leftParagraphs = [...leftCell?.querySelectorAll('p') || []];
  const placementClasses = collectSlidePlacementClasses(row, leftCell, rightCell, leftSlots);
  const slotMeta = leftSlots.map((slot, slotIndex) => {
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
    foreground,
  } = resolveImageAssets(rightSources);

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
  placementClasses.forEach((name) => slide.classList.add(name));
  slide.dataset.slideIndex = `${index}`;

  const bgColor = (leftSlots[13]?.textContent || leftParagraphs[13]?.textContent || textOf(leftCell)).match(/#[0-9a-f]{3,8}/i)?.[0];
  if (bgColor) {
    slide.style.setProperty('--banner-slider-bg-color', bgColor);
  }
  if (desktopBackground) {
    slide.style.setProperty('--banner-slider-bg-image', `url("${desktopBackground}")`);
  }
  if (mobileBackground) {
    slide.style.setProperty('--banner-slider-mobile-bg-image', `url("${mobileBackground}")`);
  }
  if (!bgColor && desktopBackground) {
    slide.classList.add('banner-slider-slide--bg-cover');
  }

  slide.innerHTML = `
    <div class="banner-slider-surface">
      <div class="banner-slider-content">
        <div class="banner-slider-copy">
          <div class="banner-slider-title">${titleHtml}</div>
          <div class="banner-slider-description">${descriptionHtml}</div>
          ${featureItems(featurePreparedSlots)}
          <div class="banner-slider-actions">
            ${ctaHref && ctaText ? `<div class="banner-slider-cta"><a class="button primary" href="${ctaHref}">${ctaText}</a></div>` : ''}
            ${shortDescriptionHtml ? `<div class="banner-slider-short-description">${shortDescriptionHtml}</div>` : ''}
          </div>
        </div>
        <div class="banner-slider-media">${foreground ? createPicture(foreground, '') : ''}</div>
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
  slides.forEach((slide) => {
    track.appendChild(slide);
  });

  block.textContent = '';
  block.classList.add('banner-slider', 'banner-slider--ready');
  stage.replaceChildren(track, dots);
  block.replaceChildren(stage);

  let activeIndex = 0;
  let timerId = null;
  let isPaused = false;

  const dotButtons = slides.map((_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'banner-slider-dot';
    button.setAttribute('aria-label', `Go to slide ${index + 1}`);
    button.addEventListener('click', () => {
      setActiveSlide(index);
      restartAutoplay();
    });
    dots.appendChild(button);
    return button;
  });

  function normalizeIndex(index) {
    return (index + slides.length) % slides.length;
  }

  function setActiveSlide(index) {
    activeIndex = normalizeIndex(index);

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === activeIndex);
      slide.setAttribute('aria-hidden', i === activeIndex ? 'false' : 'true');
    });

    dotButtons.forEach((button, i) => {
      const isActive = i === activeIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function stopAutoplay() {
    if (!timerId) {
      return;
    }

    window.clearInterval(timerId);
    timerId = null;
  }

  function startAutoplay() {
    if (slides.length <= 1 || timerId || isPaused) {
      return;
    }

    timerId = window.setInterval(() => {
      setActiveSlide(activeIndex + 1);
    }, 2800);
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

  setActiveSlide(0);
  startAutoplay();
}
