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

function featureItems(leftCell) {
  const content = firstContent(leftCell);
  if (!content) {
    return '';
  }

  const pictures = [...content.querySelectorAll('picture')].slice(0, 3);
  const textCandidates = [...content.querySelectorAll('p, span, div')]
    .map((el) => el.textContent?.trim() || '')
    .filter((value) => value && !/^#/.test(value) && !/^https?:\/\//i.test(value))
    .slice(1, 4);

  const items = textCandidates.map((text, idx) => ({
    text,
    icon: pictures[idx] ? pictures[idx].outerHTML : '',
  })).filter((item) => item.text);

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
  const [leftCell, rightCell] = [...row.children].map((child) => firstContent(child));

  const rightSources = imageSources(rightCell);
  const desktopBackground = rightSources[0] || '';
  const mobileBackground = rightSources[1] || desktopBackground;
  const foreground = rightSources[2] || '';

  const heading = leftCell?.querySelector('h1, h2, h3, h4, h5, h6');
  const titleHtml = heading ? heading.outerHTML : `<h2>${textOf(leftCell)}</h2>`;

  const paragraphs = [...leftCell?.querySelectorAll('p') || []];
  const description = paragraphs.find((p) => !p.querySelector('a'));

  const ctaLink = [...leftCell?.querySelectorAll('a') || []]
    .find((a) => !/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(a.getAttribute('href') || ''));

  const slide = document.createElement('div');
  slide.className = 'banner-slider-slide';
  slide.dataset.slideIndex = `${index}`;

  const bgColor = (textOf(leftCell).match(/#[0-9a-f]{3,8}/i) || [])[0];
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
          <div class="banner-slider-description">${description ? description.innerHTML : ''}</div>
          ${featureItems(leftCell)}
          ${ctaLink ? `<div class="banner-slider-cta"><a class="button primary" href="${ctaLink.getAttribute('href')}">${ctaLink.textContent?.trim() || 'Apply Now'}</a></div>` : ''}
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

  dots.addEventListener('click', (event) => {
    const dot = event.target.closest('.banner-slider-dot');
    if (!dot) {
      return;
    }
    activate(Number.parseInt(dot.dataset.slideIndex, 10));
  });

  activate(0);
}
