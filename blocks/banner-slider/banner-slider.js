function firstContent(cell) {
  return cell?.firstElementChild || cell;
}

function textOf(cell) {
  return firstContent(cell)?.textContent?.trim() || '';
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
  picture.append(img);
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
      if (link?.href && (link.href.includes('/content/dam/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(link.href))) {
        values.push(link.href);
      }
    });

    const rawText = candidate.textContent?.trim();
    if (rawText && (rawText.startsWith('/content/dam/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(rawText))) {
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
  if (raw.startsWith('/content/dam/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(raw)) {
    return raw;
  }

  return '';
}

function featureItems(leftParagraphs) {
  if (!leftParagraphs?.length) {
    return '';
  }

  const slots = [
    { icon: 2, text: 3, alt: 4 },
    { icon: 5, text: 6, alt: 7 },
    { icon: 8, text: 9, alt: 10 },
  ];

  const items = slots.map((slot) => {
    const iconSrc = hrefFromParagraph(leftParagraphs[slot.icon]);
    const text = (leftParagraphs[slot.text]?.textContent || '').trim();
    const altText = (leftParagraphs[slot.alt]?.textContent || '').trim();

    return {
      text,
      icon: iconSrc ? createPicture(iconSrc, altText || text) : '',
    };
  }).filter((item) => item.text || item.icon);

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

function createSlide(row, index) {
  const [leftCell, rightCell] = [...row.children];
  const leftParagraphs = [...leftCell?.querySelectorAll('p') || []];

  const rightSources = imageSources(rightCell);
  const desktopBackground = rightSources[0] || '';
  const mobileBackground = rightSources[1] || desktopBackground;
  const foreground = rightSources[2] || '';

  const heading = leftCell?.querySelector('h1, h2, h3, h4, h5, h6');
  const titleText = (leftParagraphs[0]?.textContent || textOf(leftCell)).trim();
  const titleHtml = heading ? heading.outerHTML : `<h2>${titleText}</h2>`;

  const descriptionText = (leftParagraphs[1]?.textContent || '').trim();
  const descriptionHtml = descriptionText ? `<p>${descriptionText}</p>` : '';

  const ctaHref = hrefFromParagraph(leftParagraphs[11]);
  const ctaText = (leftParagraphs[12]?.textContent || '').trim() || 'Apply Now';
  const shortDescription = leftParagraphs[14];
  const shortDescriptionHtml = shortDescription?.textContent?.trim() ? shortDescription.outerHTML : '';

  const slide = document.createElement('div');
  slide.className = 'banner-slider-slide';
  slide.dataset.slideIndex = `${index}`;

  const bgColor = (leftParagraphs[13]?.textContent || textOf(leftCell)).match(/#[0-9a-f]{3,8}/i)?.[0];
  if (bgColor) {
    slide.style.setProperty('--banner-slider-bg-color', bgColor);
  }
  if (desktopBackground) {
    slide.style.setProperty('--banner-slider-bg-image', `url("${desktopBackground}")`);
  }
  if (mobileBackground) {
    slide.style.setProperty('--banner-slider-mobile-bg-image', `url("${mobileBackground}")`);
  }

  slide.innerHTML = `
    <div class="banner-slider-surface">
      <div class="banner-slider-content">
        <div class="banner-slider-copy">
          <div class="banner-slider-title">${titleHtml}</div>
          <div class="banner-slider-description">${descriptionHtml}</div>
          ${featureItems(leftParagraphs)}
          ${ctaHref ? `<div class="banner-slider-cta"><a class="button primary" href="${ctaHref}">${ctaText}</a></div>` : ''}
          ${shortDescriptionHtml ? `<div class="banner-slider-short-description">${shortDescriptionHtml}</div>` : ''}
        </div>
        <div class="banner-slider-media">${foreground ? createPicture(foreground, '') : ''}</div>
      </div>
    </div>
  `;

  return slide;
}

export default function decorate(block) {
  const rows = [...block.children].filter((row) => row.children.length >= 2);
  if (!rows.length) {
    return;
  }

  const stage = document.createElement('div');
  stage.className = 'banner-slider-stage';

  const dots = document.createElement('div');
  dots.className = 'banner-slider-dots';

  const slides = rows.map((row, index) => createSlide(row, index));
  slides.forEach((slide, idx) => {
    stage.append(slide);
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'banner-slider-dot';
    dot.dataset.slideIndex = `${idx}`;
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    dots.append(dot);
  });

  block.textContent = '';
  block.classList.add('banner-slider', 'banner-slider--ready');
  block.append(stage, dots);

  let active = 0;
  const autoPlayDelay = 25000;
  let autoPlayTimer;

  const activate = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      const on = idx === active;
      slide.classList.toggle('is-active', on);
      slide.setAttribute('aria-hidden', on ? 'false' : 'true');
    });

    [...dots.children].forEach((dot, idx) => {
      const on = idx === active;
      dot.classList.toggle('is-active', on);
      dot.setAttribute('aria-current', on ? 'true' : 'false');
    });
  };

  const startAutoPlay = () => {
    if (slides.length < 2 || autoPlayTimer) {
      return;
    }

    autoPlayTimer = window.setInterval(() => {
      if (!document.hidden) {
        activate(active + 1);
      }
    }, autoPlayDelay);
  };

  const stopAutoPlay = () => {
    if (!autoPlayTimer) {
      return;
    }

    window.clearInterval(autoPlayTimer);
    autoPlayTimer = undefined;
  };

  const resetAutoPlay = () => {
    stopAutoPlay();
    startAutoPlay();
  };

  dots.addEventListener('click', (event) => {
    const dot = event.target.closest('.banner-slider-dot');
    if (!dot) {
      return;
    }

    activate(Number.parseInt(dot.dataset.slideIndex, 10));
    resetAutoPlay();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  activate(0);
  startAutoPlay();
}
