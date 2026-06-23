import { applyLoanNow, bannerClick, ctaClick } from '../../dl.js';
import { targetObject } from '../../scripts/scripts.js';

const AUTOPLAY_INTERVAL_MS = 7000;
const initialisedSections = new WeakSet();

function isAuthorEnvironment() {
  const { hostname, pathname } = window.location;
  return hostname.includes('author') || pathname.includes('/editor.html/');
}

function escapeAttr(value = '') {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isImageLike(value = '') {
  return value.includes('/content/dam/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value);
}

function isHashLink(value = '') {
  const text = value.trim();
  if (!text || text === '#') return true;
  try {
    const parsed = new URL(text, window.location.href);
    return parsed.origin === window.location.origin && (parsed.hash === '#' || parsed.href.endsWith('#'));
  } catch { return false; }
}

function isApplyLoanLabel(value = '') {
  const normalized = value.trim().toLowerCase();
  return normalized === 'apply loan now' || normalized === 'apply now' || normalized === 'open form';
}

function pictureElements(cell) {
  if (!cell) return [];
  return [...cell.querySelectorAll('picture')].filter((pic) => {
    const img = pic.querySelector('img');
    return img && img.src && img.src !== '' && !img.src.endsWith('/');
  });
}

function imageSources(cell) {
  if (!cell) return [];
  const values = [];
  [...cell.querySelectorAll('picture img, img')].forEach((img) => {
    if (img?.src && img.src !== '' && !img.src.endsWith('/')) values.push(img.src);
  });
  [...cell.querySelectorAll('a')].forEach((a) => {
    if (a.href && isImageLike(a.href)) values.push(a.href);
  });
  const raw = cell.textContent?.trim();
  if (raw && isImageLike(raw)) values.push(raw);
  return values;
}

/* --- Parse a single banner-slide block into slide data --- */

function parseSlide(block) {
  // 1. Bulletproof Cell Flattening
  // AEM can output 1x4 or 4x1 grids. This forces all data cells into a flat array.
  let cells = [...block.querySelectorAll(':scope > div > div')];
  if (cells.length === 0) {
    cells = [...block.querySelectorAll(':scope > div')];
  }

  let cellIndex = 0;
  const contentCell = cells[cellIndex++];

  let headingLevel = 'h2';
  // Safety check: if AEM orphaned the 'type' dropdown into its own cell
  if (cells[cellIndex] && /^h[1-6]$/i.test((cells[cellIndex].textContent || '').trim()) && cells[cellIndex].children.length === 0) {
    headingLevel = cells[cellIndex].textContent.trim().toLowerCase();
    cellIndex++;
  }

  const featureCell = cells[cellIndex++];
  const bgCell = cells[cellIndex++];
  const fgCell = cells[cellIndex++];

  let title = '';
  let description = '';
  let shortDescription = '';
  let ctaHtmlCombined = '';

  if (contentCell) {
    const children = [...contentCell.children];

    // Extract Title (Native AEM <h> tag generation)
    const titleNodeIndex = children.findIndex(el => /^h[1-6]$/i.test(el.tagName));
    if (titleNodeIndex !== -1) {
      title = children[titleNodeIndex].outerHTML;
      children.splice(titleNodeIndex, 1);
    }

    // Extract Short Description
    const ulIndex = children.findIndex(el => el.tagName.toLowerCase() === 'ul');
    if (ulIndex !== -1) {
      shortDescription = children[ulIndex].outerHTML;
      children.splice(ulIndex, 1);
    }

    // Extract CTAs (Bottom-Up)
    const ctas = [];
    for (let i = children.length - 1; i >= 0; i--) {
      if (ctas.length >= 2) break;
      const el = children[i];

      if (el.classList.contains('button-container')) {
        ctas.unshift(el);
        children.pop();
        continue;
      }

      if (el.tagName.toLowerCase() === 'p') {
        const text = (el.textContent || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

        if (text === '' && !el.querySelector('img') && !el.querySelector('picture')) {
          children.pop();
          continue;
        }

        // Broad button detection
        if (el.querySelector('u') || el.querySelector('a') || el.querySelector('sup') || isApplyLoanLabel(text) || /^(open|apply|click|track|submit|learn|read|view|get|start|continue|download|link|go|explore|see|find|check|know|register|sign)/i.test(text)) {
          ctas.unshift(el);
          children.pop();
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // Generate CTA Buttons
    ctas.forEach((ctaEl, index) => {
      const anchor = ctaEl.querySelector('a');
      const sup = ctaEl.querySelector('sup');
      const text = (ctaEl.textContent || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

      if (!text) return;

      const opensForm = (!anchor && sup) || (anchor && isHashLink(anchor.getAttribute('href'))) || isApplyLoanLabel(text);
      const href = anchor ? anchor.getAttribute('href') : '#';
      const btnClass = index === 0 ? 'button primary' : 'button secondary';
      const containerClass = index === 0 ? 'banner-slide-cta button-container' : 'banner-slide-cta banner-slide-cta2 button-container';

      if (opensForm) {
        ctaHtmlCombined += `<div class="${containerClass}"><button type="button" class="${btnClass}" data-cta-open-form="true">${text}</button></div>`;
      } else {
        ctaHtmlCombined += `<div class="${containerClass}"><a class="${btnClass}" href="${escapeAttr(href)}" data-cta-open-form="false">${text}</a></div>`;
      }
    });

    // Remaining Description
    children.forEach(el => description += el.outerHTML);
  }

  // Parse Features
  const features = [];
  if (featureCell) {
    const fChildren = [...featureCell.children];
    for (let i = 0; i < fChildren.length; i++) {
      const el = fChildren[i];
      const pic = el.querySelector?.('picture') || (el.tagName === 'PICTURE' ? el : null);
      if (pic) {
        const nextEl = fChildren[i + 1];
        let fText = '';
        if (nextEl && nextEl.tagName.toLowerCase() === 'p' && !nextEl.querySelector('picture')) {
          fText = nextEl.textContent.trim();
          i++;
        }
        features.push({ icon: pic.outerHTML, text: fText });
      } else if (el.tagName.toLowerCase() === 'p' && el.textContent.trim()) {
        // Text-only feature fallback
        features.push({ icon: '', text: el.innerHTML });
      }
    }
  }

  // Parse Backgrounds
  const desktopBgPicture = pictureElements(bgCell)[0] || null;
  const mobileBgPicture = pictureElements(bgCell)[1] || null;
  const desktopBackground = imageSources(bgCell)[0] || '';
  const mobileBackground = imageSources(bgCell)[1] || '';

  // Parse Foregrounds & Video
  const desktopFgPicture = pictureElements(fgCell)[0] || null;
  const mobileFgPicture = pictureElements(fgCell)[1] || null;

  let videoUrl = '';
  if (fgCell) {
    const a = fgCell.querySelector('a');
    if (a && !isImageLike(a.href)) videoUrl = a.href;
  }

  return {
    title, description, shortDescription, ctaHtmlCombined, features,
    desktopBgPicture, mobileBgPicture, desktopBackground, mobileBackground,
    desktopFgPicture, mobileFgPicture, videoUrl
  };
}

/* --- Build slide DOM --- */

function createBackgroundMedia(desktopSrc, mobileSrc, isFirst) {
  const desktop = (desktopSrc || '').trim();
  const mobile = (mobileSrc || '').trim();
  if (!desktop && !mobile) return '';
  const src = desktop || mobile;
  const sourceMarkup = mobile && mobile !== desktop ? `<source media="(max-width: 991px)" srcset="${escapeAttr(mobile)}">` : '';
  return `<picture>${sourceMarkup}<img class="banner-slide-bg-img" src="${escapeAttr(src)}" alt="" loading="${isFirst ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${isFirst ? 'high' : 'low'}"></picture>`;
}

function cloneAndFormatPicture(desktopPic, mobilePic, imgClass, isFirst) {
  if (!desktopPic && !mobilePic) return '';
  const pic = (desktopPic || mobilePic).cloneNode(true);
  const img = pic.querySelector('img');
  if (img) {
    img.className = imgClass;
    img.loading = isFirst ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.setAttribute('fetchpriority', isFirst ? 'high' : 'low');
    if (imgClass === 'banner-slide-fg-img') {
      img.removeAttribute('width');
      img.removeAttribute('height');
    }
  }
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

function buildSlide(data, index, extraClasses = []) {
  const {
    title, description, shortDescription, ctaHtmlCombined, features,
    desktopBgPicture, mobileBgPicture, desktopBackground, mobileBackground,
    desktopFgPicture, mobileFgPicture, videoUrl
  } = data;

  const slide = document.createElement('div');
  slide.className = `banner-slide-slide ${index === 0 ? 'is-active' : ''}`;
  if (desktopBgPicture || desktopBackground || mobileBackground) slide.classList.add('has-bg-media');
  extraClasses.forEach(cls => { if (cls) slide.classList.add(cls); });
  slide.dataset.slideIndex = `${index}`;

  const bgHtml = desktopBgPicture ? cloneAndFormatPicture(desktopBgPicture, mobileBgPicture, 'banner-slide-bg-img', index === 0) : createBackgroundMedia(desktopBackground, mobileBackground, index === 0);

  let fgHtml = desktopFgPicture ? cloneAndFormatPicture(desktopFgPicture, mobileFgPicture, 'banner-slide-fg-img', index === 0) : '';
  if (videoUrl && !fgHtml) {
    fgHtml = `<div class="banner-video-wrapper"><a href="${escapeAttr(videoUrl)}" class="banner-video-link button primary" target="_blank" rel="noopener">Watch Video</a></div>`;
  }

  const featuresHtml = features.length ? `<div class="banner-slide-features" role="list" aria-label="Slide highlights">${features.map(f => `<div class="banner-slide-feature" role="listitem">${f.icon ? `<div class="banner-slide-feature-icon">${f.icon}</div>` : ''}${f.text ? `<span class="banner-slide-feature-text">${f.text}</span>` : ''}</div>`).join('')}</div>` : '';

  slide.innerHTML = `
    <div class="banner-slide-bg">${bgHtml}</div>
    <div class="banner-slide-surface">
      <div class="banner-slide-content">
        <div class="banner-slide-copy">
          ${title ? `<div class="banner-slide-title">${title}</div>` : ''}
          ${description ? `<div class="banner-slide-description">${description}</div>` : ''}
          ${featuresHtml}
          ${(ctaHtmlCombined || shortDescription) ? `<div class="banner-slide-actions">${ctaHtmlCombined}${shortDescription ? `<div class="banner-slide-short-description">${shortDescription}</div>` : ''}</div>` : ''}
        </div>
        <div class="banner-slide-media">${fgHtml}</div>
      </div>
    </div>
  `;

  return slide;
}

/* --- Section-level slider initialization --- */

function initSectionSlider(section) {
  if (initialisedSections.has(section)) return;
  initialisedSections.add(section);

  const slideBlocks = [...section.querySelectorAll('.banner-slide.block')];
  if (slideBlocks.length < 1) return;

  const isAuthor = isAuthorEnvironment();
  const hasAutoRotate = section.classList.contains('auto-rotate');

  const container = document.createElement('div');
  container.className = 'banner-slide banner-slide--ready block';

  const stage = document.createElement('div');
  stage.className = 'banner-slide-stage';

  const track = document.createElement('div');
  track.className = 'banner-slide-track';

  const dots = document.createElement('div');
  dots.className = 'banner-slide-dots';

  const slides = slideBlocks.map((block, idx) => {
    const data = parseSlide(block);
    const blockClasses = [...block.classList].filter((cls) => cls !== 'banner-slide' && cls !== 'block');
    return buildSlide(data, idx, blockClasses);
  });

  slides.forEach((slide) => track.appendChild(slide));

  if (slides.length <= 1) dots.style.display = 'none';

  stage.appendChild(track);
  stage.appendChild(dots);
  container.appendChild(stage);

  slideBlocks.forEach((block) => {
    const wrapper = block.closest('.banner-slide-wrapper') || block;
    isAuthor ? wrapper.style.display = 'none' : wrapper.remove();
  });

  section.insertBefore(container, section.firstChild);

  let activeIndex = 0;
  let timerId = null;

  const dotButtons = slides.map((_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'banner-slide-dot';
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
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeIndex));
    dotButtons.forEach((button, i) => {
      button.classList.toggle('is-active', i === activeIndex);
      button.setAttribute('aria-current', i === activeIndex ? 'true' : 'false');
    });
  }

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = slides.indexOf(entry.target);
        if (idx >= 0) updateActiveDot(idx);
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
    if (!hasAutoRotate || slides.length <= 1 || timerId) return;
    timerId = window.setInterval(() => {
      if (document.body.style.overflowY === 'hidden') return;
      scrollToSlide((activeIndex + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);
  }

  function restartAutoplay() {
    if (!hasAutoRotate) return;
    stopAutoplay();
    startAutoplay();
  }

  document.addEventListener('visibilitychange', () => {
    if (!hasAutoRotate) return;
    document.hidden ? stopAutoplay() : startAutoplay();
  });

  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? scrollToSlide((activeIndex + 1) % slides.length) : scrollToSlide((activeIndex - 1 + slides.length) % slides.length);
      restartAutoplay();
    }
  }, { passive: true });

  updateActiveDot(0);
  if (hasAutoRotate) {
    startAutoplay();
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);
  }

  [...container.querySelectorAll('.banner-slide-cta .button.primary, .banner-slide-cta2 .button.secondary')].forEach((btn) => {
    btn.addEventListener('click', async (event) => {
      event.stopPropagation();
      const clickText = (btn.textContent || '').trim();
      const href = btn.getAttribute('href') ? btn.getAttribute('href').trim() : '#';
      const pageType = targetObject?.pageName || '';
      const shouldOpenLoanForm = btn.getAttribute('data-cta-open-form') === 'true' || isHashLink(href);

      if (shouldOpenLoanForm) {
        event.preventDefault();
        try {
          bannerClick(clickText || href, pageType);
          ctaClick(clickText || href, 'banner-slide', 'banner-slide', pageType);
          if (isApplyLoanLabel(clickText)) applyLoanNow('banner', pageType, 'banner-slide', pageType);
        } catch (err) { }

        try {
          const { onCLickApplyFormOpen, formOpen } = await import('../applyloanform/applyloanforms.js');
          const mainContainer = container.closest('main') || document.querySelector('main') || document.body;
          const loanFormNode = mainContainer.querySelector('.loan-form-sub-parent') || document.querySelector('.loan-form-sub-parent');
          const overlayNode = mainContainer.querySelector('.modal-overlay') || document.querySelector('.modal-overlay');
          const isLoanFormVisible = () => loanFormNode && window.getComputedStyle(loanFormNode).visibility !== 'hidden';

          let formOpened = false;
          if (typeof onCLickApplyFormOpen === 'function' && loanFormNode) {
            try { onCLickApplyFormOpen(event); formOpened = isLoanFormVisible(); } catch { }
          }
          if (!formOpened && typeof formOpen === 'function') {
            formOpen();
            formOpened = isLoanFormVisible();
          }
          if (!formOpened && loanFormNode) {
            if (overlayNode) { overlayNode.classList.add('overlay'); overlayNode.classList.remove('dp-none'); }
            if (window.matchMedia('(max-width: 1024px)').matches) loanFormNode.classList.add('loan-form--open');
            loanFormNode.style.visibility = 'visible';
            document.body.style.overflowY = 'hidden';
          }
        } catch (err) { console.warn('banner-slide: could not open loan form', err); }
        return;
      }

      try {
        bannerClick(clickText || href, pageType);
        ctaClick(clickText || href, 'banner-slide', 'banner-slide', pageType);
        if (isApplyLoanLabel(clickText)) applyLoanNow('banner', pageType, 'banner-slide', pageType);
      } catch (err) {
        console.log('error');
      }
    });
  });
}

export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;
  const allSlides = [...section.querySelectorAll('.banner-slide.block')];
  if (block === allSlides[allSlides.length - 1]) initSectionSlider(section);
}