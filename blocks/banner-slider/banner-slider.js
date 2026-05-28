function getCellContent(cell) {
  return cell?.firstElementChild || cell;
}

function decorateButtons(...buttons) {
  return buttons
    .map((cell) => {
      const anchor = cell?.querySelector('a');
      if (!anchor) {
        return '';
      }

      anchor.classList.add('button');
      if (anchor.parentElement?.tagName === 'EM') {
        anchor.classList.add('secondary');
      }
      if (anchor.parentElement?.tagName === 'STRONG') {
        anchor.classList.add('primary');
      }

      return anchor.outerHTML;
    })
    .join('');
}

function getCellText(cell) {
  return getCellContent(cell)?.textContent?.trim() || '';
}

function getClasses(cell) {
  const classesText = getCellText(cell);
  return classesText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getClassWithPrefix(classes, prefix, fallback) {
  return classes.find((className) => className.startsWith(prefix)) || fallback;
}

function createPictureFromPath(path, alt = '') {
  if (!path) {
    return null;
  }

  const picture = document.createElement('picture');
  const image = document.createElement('img');
  image.src = path;
  image.alt = alt;
  image.loading = 'lazy';
  picture.append(image);
  return picture;
}

function extractPicture(cell, altText = '') {
  const content = getCellContent(cell);
  const candidates = [cell, content].filter(Boolean);

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];

    if (candidate.tagName === 'PICTURE') {
      return candidate.cloneNode(true);
    }

    if (candidate.tagName === 'IMG' && candidate.src) {
      return createPictureFromPath(candidate.src, altText || candidate.alt || '');
    }

    const picture = candidate.querySelector?.('picture');
    if (picture) {
      return picture.cloneNode(true);
    }

    const image = candidate.querySelector?.('img');
    if (image?.src) {
      return createPictureFromPath(image.src, altText || image.alt || '');
    }

    const link = candidate.querySelector?.('a');
    if (link?.href) {
      return createPictureFromPath(link.href, altText);
    }
  }

  const text = getCellText(cell);
  if (text.startsWith('/content/dam/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(text)) {
    return createPictureFromPath(text, altText);
  }

  return null;
}

function extractImagePath(cell) {
  const picture = extractPicture(cell);
  return picture?.querySelector('img')?.src || '';
}

function createCtaCell(typeCell, textCell, linkCell) {
  const cell = document.createElement('div');
  const buttonText = getCellText(textCell);
  if (!buttonText) {
    return cell;
  }

  const wrapperTag = getCellText(typeCell) === 'secondary' ? 'em' : 'strong';
  const href = getCellText(linkCell) || '#';
  cell.innerHTML = `<${wrapperTag}><a href="${href}">${buttonText}</a></${wrapperTag}>`;
  return cell;
}

function createFeatureMarkup(items) {
  if (!items.length) {
    return '';
  }

  return `
    <div class="banner-slider-features" role="list" aria-label="Slide highlights">
      ${items.map((item) => {
    const textMarkup = item.href
      ? `<a href="${item.href}" class="banner-slider-feature-text">${item.text}</a>`
      : `<span class="banner-slider-feature-text">${item.text}</span>`;
    return `
          <div class="banner-slider-feature" role="listitem">
            <div class="banner-slider-feature-icon">${item.iconMarkup || ''}</div>
            ${textMarkup}
          </div>
        `;
  }).join('')}
    </div>
  `;
}

function extractImageSources(cell) {
  const sources = [];
  const candidates = [cell, getCellContent(cell)].filter(Boolean);

  candidates.forEach((candidate) => {
    const pictures = candidate.tagName === 'PICTURE' ? [candidate] : [...candidate.querySelectorAll?.('picture') || []];
    pictures.forEach((picture) => {
      const img = picture.querySelector('img');
      if (img?.src) {
        sources.push(img.src);
      }
    });

    const images = candidate.tagName === 'IMG' ? [candidate] : [...candidate.querySelectorAll?.('img') || []];
    images.forEach((img) => {
      if (img?.src) {
        sources.push(img.src);
      }
    });

    const links = candidate.tagName === 'A' ? [candidate] : [...candidate.querySelectorAll?.('a') || []];
    links.forEach((link) => {
      if (link?.href && (link.href.includes('/content/dam/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(link.href))) {
        sources.push(link.href);
      }
    });

    const text = candidate.textContent?.trim();
    if (text && (text.startsWith('/content/dam/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(text))) {
      sources.push(text);
    }
  });

  return [...new Set(sources)];
}

function parseCompactContent(cell) {
  const content = getCellContent(cell);
  if (!content) {
    return {
      eyebrowHtml: '',
      titleHtml: '',
      descriptionHtml: '',
      buttonsMarkup: '',
      titleTag: '',
      featureTexts: [],
    };
  }

  const titleElement = content.querySelector('h1, h2, h3, h4, h5, h6');
  const titleTag = titleElement?.tagName?.toLowerCase() || '';
  const titleHtml = titleElement ? titleElement.outerHTML : '';

  const eyebrowElement = content.querySelector('.eyebrow');
  const eyebrowHtml = eyebrowElement ? eyebrowElement.innerHTML : '';

  const featureTexts = [...content.querySelectorAll('li')]
    .map((item) => item.textContent?.trim() || '')
    .filter(Boolean)
    .slice(0, 3);

  const paragraphs = [...content.querySelectorAll('p')]
    .filter((paragraph) => !paragraph.classList.contains('eyebrow'));
  const descriptionParagraph = paragraphs.find((paragraph) => !paragraph.querySelector('a'));
  const descriptionHtml = descriptionParagraph ? descriptionParagraph.innerHTML : '';

  const anchors = [...content.querySelectorAll('a')].slice(0, 2);
  const buttonsMarkup = anchors.map((anchor, index) => {
    const clone = anchor.cloneNode(true);
    clone.classList.add('button');

    const parentTag = anchor.parentElement?.tagName;
    if (parentTag === 'EM') {
      clone.classList.add('secondary');
    } else if (parentTag === 'STRONG') {
      clone.classList.add('primary');
    } else if (index === 0) {
      clone.classList.add('primary');
    } else {
      clone.classList.add('secondary');
    }

    return clone.outerHTML;
  }).join('');

  return {
    eyebrowHtml,
    titleHtml,
    descriptionHtml,
    buttonsMarkup,
    titleTag,
    featureTexts,
  };
}

function createFeatureItems(cells) {
  const startIndex = 18;
  const items = [];

  for (let i = 0; i < 3; i += 1) {
    const iconCell = cells[startIndex + (i * 4)];
    const iconAltCell = cells[startIndex + (i * 4) + 1];
    const textCell = cells[startIndex + (i * 4) + 2];
    const linkCell = cells[startIndex + (i * 4) + 3];

    const text = getCellText(textCell);
    const href = getCellText(linkCell);
    const icon = extractPicture(iconCell, getCellText(iconAltCell));

    if (text || icon) {
      items.push({
        text,
        href,
        iconMarkup: icon ? icon.outerHTML : '',
      });
    }
  }

  return createFeatureMarkup(items);
}

function createSlideFromCompactSchema(panel, index, cells) {
  const classesCell = cells[0];
  const mediaCell = cells[1];
  const contentCell = cells[2];

  const classes = getClasses(classesCell);
  const mediaSources = extractImageSources(mediaCell);
  const desktopBackground = mediaSources[0] || '';
  const foregroundImage = mediaSources[1] || '';
  const mobileBackground = mediaSources[2] || desktopBackground;

  const {
    eyebrowHtml,
    titleHtml,
    descriptionHtml,
    buttonsMarkup,
    titleTag,
    featureTexts,
  } = parseCompactContent(contentCell);

  const features = featureTexts.map((text, featureIndex) => {
    const iconSrc = mediaSources[3 + featureIndex];
    return {
      text,
      href: '',
      iconMarkup: iconSrc ? createPictureFromPath(iconSrc, text)?.outerHTML || '' : '',
    };
  });

  panel.textContent = '';
  panel.className = 'banner-slider-slide';
  panel.dataset.slideIndex = `${index}`;
  panel.dataset.titleType = titleTag;
  panel.dataset.backgroundImageAlt = '';
  panel.dataset.mobileBackgroundImageAlt = '';

  classes.forEach((className) => panel.classList.add(className));
  if (!classes.some((className) => className === 'image-left' || className === 'image-right')) {
    panel.classList.add('image-right');
  }
  if (!classes.some((className) => className === 'content-left' || className === 'content-center')) {
    panel.classList.add('content-left');
  }
  if (!classes.includes('light') && !classes.includes('dark')) {
    panel.classList.add('light');
  }

  panel.classList.add(getClassWithPrefix(classes, 'title-pos-', 'title-pos-left'));
  panel.classList.add(getClassWithPrefix(classes, 'cta-pos-', 'cta-pos-flow'));

  if (desktopBackground) {
    panel.style.setProperty('--banner-slider-bg-image', `url("${desktopBackground}")`);
  }
  if (mobileBackground) {
    panel.style.setProperty('--banner-slider-mobile-bg-image', `url("${mobileBackground}")`);
  }

  panel.innerHTML = `
    <div class="banner-slider-surface">
      <div class="banner-slider-content">
        <div class="banner-slider-copy">
          ${eyebrowHtml ? `<div class="banner-slider-eyebrow">${eyebrowHtml}</div>` : ''}
          <div class="banner-slider-title">${titleHtml}</div>
          <div class="banner-slider-description">${descriptionHtml}</div>
          ${createFeatureMarkup(features)}
          ${buttonsMarkup ? `<div class="banner-slider-cta">${buttonsMarkup}</div>` : ''}
        </div>
        <div class="banner-slider-media">${foregroundImage ? createPictureFromPath(foregroundImage, '')?.outerHTML || '' : ''}</div>
      </div>
    </div>
  `;

  return panel;
}

function createSlide(panel, index) {
  const cells = [...panel.children].map((child) => getCellContent(child));
  const isCompactSchema = cells.length === 3 && /(?:banner-slider-slide|light|dark|content-|image-|title-pos-|cta-pos-|btn-)/i.test(getCellText(cells[0]));
  if (isCompactSchema) {
    return createSlideFromCompactSchema(panel, index, cells);
  }

  const hasExtendedSchema = cells.length >= 18;

  const backgroundImage = cells[0];
  const backgroundImageAlt = hasExtendedSchema ? cells[1] : null;
  const foregroundImage = hasExtendedSchema ? cells[2] : cells[1];
  const foregroundImageAlt = hasExtendedSchema ? cells[3] : null;
  const classesCell = hasExtendedSchema ? cells[4] : cells[2];
  const eyebrow = hasExtendedSchema ? cells[5] : cells[3];
  const title = hasExtendedSchema ? cells[6] : cells[4];
  const titleType = hasExtendedSchema ? cells[7] : null;
  const description = hasExtendedSchema ? cells[8] : cells[5];

  const primaryCtaType = hasExtendedSchema ? cells[9] : null;
  const primaryCtaText = hasExtendedSchema ? cells[10] : null;
  const primaryCtaLink = hasExtendedSchema ? cells[11] : null;
  const secondaryCtaType = hasExtendedSchema ? cells[12] : null;
  const secondaryCtaText = hasExtendedSchema ? cells[13] : null;
  const secondaryCtaLink = hasExtendedSchema ? cells[14] : null;

  const legacyPrimaryCta = hasExtendedSchema ? null : cells[6];
  const legacySecondaryCta = hasExtendedSchema ? null : cells[7];
  const mobileBackgroundImage = hasExtendedSchema ? cells[15] : cells[8];
  const mobileBackgroundImageAlt = hasExtendedSchema ? cells[16] : null;
  const backgroundColor = hasExtendedSchema ? cells[17] : cells[9];

  const classes = getClasses(classesCell);
  const desktopBackground = extractImagePath(backgroundImage);
  const mobileBackground = extractImagePath(mobileBackgroundImage) || desktopBackground;
  const foregroundPicture = extractPicture(foregroundImage, getCellText(foregroundImageAlt));

  const buttonsMarkup = hasExtendedSchema
    ? decorateButtons(
      createCtaCell(primaryCtaType, primaryCtaText, primaryCtaLink),
      createCtaCell(secondaryCtaType, secondaryCtaText, secondaryCtaLink),
    )
    : decorateButtons(legacyPrimaryCta, legacySecondaryCta);
  const featuresMarkup = hasExtendedSchema ? createFeatureItems(cells) : '';

  panel.textContent = '';
  panel.className = 'banner-slider-slide';
  panel.dataset.slideIndex = `${index}`;
  panel.dataset.titleType = getCellText(titleType);
  panel.dataset.backgroundImageAlt = getCellText(backgroundImageAlt);
  panel.dataset.mobileBackgroundImageAlt = getCellText(mobileBackgroundImageAlt);

  classes.forEach((className) => panel.classList.add(className));
  if (!classes.some((className) => className === 'image-left' || className === 'image-right')) {
    panel.classList.add('image-right');
  }
  if (!classes.some((className) => className === 'content-left' || className === 'content-center')) {
    panel.classList.add('content-left');
  }
  if (!classes.includes('light') && !classes.includes('dark')) {
    panel.classList.add('light');
  }

  panel.classList.add(getClassWithPrefix(classes, 'title-pos-', 'title-pos-left'));
  panel.classList.add(getClassWithPrefix(classes, 'cta-pos-', 'cta-pos-flow'));

  if (desktopBackground) {
    panel.style.setProperty('--banner-slider-bg-image', `url("${desktopBackground}")`);
  }
  if (mobileBackground) {
    panel.style.setProperty('--banner-slider-mobile-bg-image', `url("${mobileBackground}")`);
  }

  const colorValue = getCellText(backgroundColor);
  if (colorValue) {
    panel.style.setProperty('--banner-slider-bg-color', colorValue);
  }

  panel.innerHTML = `
    <div class="banner-slider-surface">
      <div class="banner-slider-content">
        <div class="banner-slider-copy">
          ${getCellText(eyebrow) ? `<div class="banner-slider-eyebrow">${eyebrow.innerHTML}</div>` : ''}
          <div class="banner-slider-title">${title?.innerHTML || ''}</div>
          <div class="banner-slider-description">${description?.innerHTML || ''}</div>
          ${featuresMarkup}
          ${buttonsMarkup ? `<div class="banner-slider-cta">${buttonsMarkup}</div>` : ''}
        </div>
        <div class="banner-slider-media">${foregroundPicture ? foregroundPicture.outerHTML : ''}</div>
      </div>
    </div>
  `;

  return panel;
}

export default function decorate(block) {
  const originalMarkup = block.innerHTML;
  try {
    const blockRows = [...block.children];
    const firstSlideRowIndex = blockRows.findIndex((row) => row.children.length > 1);
    const controlsEndIndex = firstSlideRowIndex > -1 ? firstSlideRowIndex : blockRows.length;
    const controlRows = blockRows.slice(0, controlsEndIndex);
    const panels = blockRows.slice(controlsEndIndex);

    const controlValues = controlRows.map((row) => getCellText(row)).filter(Boolean);
    const rotateSetting = controlValues.find((value) => /^rotate-(on|off)$/i.test(value));
    const delaySetting = controlValues.find((value) => /^\d+$/.test(value));

    const rotateValue = (rotateSetting || 'rotate-on').toLowerCase();
    const shouldRotate = rotateValue !== 'rotate-off';
    const parsedDelay = Number.parseInt(delaySetting || '7000', 10);
    const autoplayDelay = Number.isFinite(parsedDelay) && parsedDelay >= 1500 ? parsedDelay : 7000;

    const stage = document.createElement('div');
    stage.className = 'banner-slider-stage';

    const dots = document.createElement('div');
    dots.className = 'banner-slider-dots';

    block.textContent = '';
    block.classList.add('banner-slider--ready');

    const slideElements = [];
    panels.forEach((panel, index) => {
      try {
        const slide = createSlide(panel, index);
        if (!slide) {
          return;
        }

        stage.append(slide);
        slideElements.push(slide);

        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'banner-slider-dot';
        dot.setAttribute('aria-label', `Go to slide ${slideElements.length}`);
        dot.dataset.slideIndex = `${slideElements.length - 1}`;
        dots.append(dot);
      } catch (error) {
        console.warn('Skipping invalid banner slider row', error);
      }
    });

    const controls = document.createElement('div');
    controls.className = 'banner-slider-controls';
    controls.append(dots);
    block.append(stage, controls);

    if (!slideElements.length) {
      block.innerHTML = originalMarkup;
      block.classList.remove('banner-slider--ready');
      return;
    }

    let activeIndex = 0;
    let autoplayTimer = null;

    const setActiveSlide = (index) => {
      activeIndex = (index + slideElements.length) % slideElements.length;

      slideElements.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      [...dots.children].forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };

    const restartAutoplay = () => {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }

      if (shouldRotate && slideElements.length > 1) {
        autoplayTimer = window.setInterval(() => {
          setActiveSlide(activeIndex + 1);
        }, autoplayDelay);
      }
    };

    dots.addEventListener('click', (event) => {
      const dot = event.target.closest('.banner-slider-dot');
      if (!dot) {
        return;
      }
      setActiveSlide(Number.parseInt(dot.dataset.slideIndex, 10));
      restartAutoplay();
    });

    setActiveSlide(0);
    restartAutoplay();
  } catch (error) {
    block.innerHTML = originalMarkup;
    block.classList.remove('banner-slider--ready');
    console.warn('banner-slider decoration failed', error);
  }
}
