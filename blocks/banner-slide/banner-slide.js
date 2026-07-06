import { targetObject } from '../../scripts/scripts.js';

const AUTOPLAY_MS = 7000;
const initiated = new WeakSet();
const CTA_RE = /^(open|apply|click|track|submit|learn|read|view|get|start|continue|download|link|go|explore|see|find|check|know|register|sign)/i;
const HEADING_RE = /^H[1-6]$/;
const ZW_RE = /[\u200B-\u200D\uFEFF]/g;

/* --- Utility (inlined for perf) --- */

function escapeAttr(v) {
  return v ? v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
}

function isImageLike(v) {
  return v.includes('/content/dam/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(v);
}

function isHashLink(v) {
  const t = (v || '').trim();
  if (!t || t === '#') return true;
  try {
    const p = new URL(t, location.href);
    return p.origin === location.origin && (p.hash === '#' || p.href.endsWith('#'));
  } catch { return false; }
}

function isFormLabel(v) {
  const n = (v || '').trim().toLowerCase();
  return n === 'apply loan now' || n === 'apply now' || n === 'open form';
}

/* --- Parse --- */

function parseSlide(block) {
  let cells = block.querySelectorAll(':scope > div > div');
  if (!cells.length) cells = block.querySelectorAll(':scope > div');
  cells = Array.from(cells);

  let ci = 0;
  const contentCell = cells[ci++];

  // Skip orphaned heading-level cell
  if (cells[ci] && HEADING_RE.test((cells[ci].textContent || '').trim().toUpperCase()) && !cells[ci].children.length) ci++;

  const featureCell = cells[ci++];
  const bgCell = cells[ci++];
  const fgCell = cells[ci++];

  let title = '';
  let description = '';
  let shortDescription = '';
  let ctaHtml = '';

  if (contentCell) {
    const children = Array.from(contentCell.children);

    // Title
    const ti = children.findIndex((el) => HEADING_RE.test(el.tagName));
    if (ti !== -1) { title = children[ti].outerHTML; children.splice(ti, 1); }

    // Short description (UL)
    const ui = children.findIndex((el) => el.tagName === 'UL');
    if (ui !== -1) { shortDescription = children[ui].outerHTML; children.splice(ui, 1); }

    // CTAs (max 2, from bottom)
    const ctas = [];
    for (let i = children.length - 1; i >= 0 && ctas.length < 2; i--) {
      const el = children[i];
      if (el.classList.contains('button-container')) { ctas.unshift(el); children.pop(); continue; }
      if (el.tagName !== 'P') break;
      const txt = (el.textContent || '').replace(ZW_RE, '').trim();
      if (!txt && !el.querySelector('img,picture')) { children.pop(); continue; }
      // if (el.querySelector('u,a,sup') || isFormLabel(txt) || CTA_RE.test(txt)) { ctas.unshift(el); children.pop(); } else break;
      if (el.querySelector('u,a,sup')) { ctas.unshift(el); children.pop(); } else break;
    }

    // Build CTA HTML
    for (let i = 0; i < ctas.length; i++) {
      const el = ctas[i];
      const a = el.querySelector('a');
      const txt = (el.textContent || '').replace(ZW_RE, '').trim();
      if (!txt) continue;
      const form = (!a && el.querySelector('sup')) || (a && isHashLink(a.getAttribute('href'))) || isFormLabel(txt);
      const href = a ? a.getAttribute('href') : '#';
      const cls = i === 0 ? 'button primary' : 'button secondary';
      const wrap = i === 0 ? 'banner-slide-cta button-container' : 'banner-slide-cta banner-slide-cta2 button-container';
      ctaHtml += form
        ? `<div class="${wrap}"><button type="button" class="${cls}" data-cta-open-form="true">${txt}</button></div>`
        : `<div class="${wrap}"><a class="${cls}" href="${escapeAttr(href)}" data-cta-open-form="false">${txt}</a></div>`;
    }

    // Description = remaining children
    for (let i = 0; i < children.length; i++) description += children[i].outerHTML;
  }

  // Features
  const features = [];
  if (featureCell) {
    const fc = featureCell.children;
    for (let i = 0; i < fc.length; i++) {
      const el = fc[i];
      const pic = el.querySelector('picture') || (el.tagName === 'PICTURE' ? el : null);
      if (pic) {
        const next = fc[i + 1];
        let txt = '';
        if (next && next.tagName === 'P' && !next.querySelector('picture')) { txt = next.textContent.trim(); i++; }
        features.push({ icon: pic.outerHTML, text: txt });
      } else if (el.tagName === 'P' && el.textContent.trim()) {
        features.push({ icon: '', text: el.innerHTML });
      }
    }
  }

  // Backgrounds
  const bgPics = bgCell ? Array.from(bgCell.querySelectorAll('picture')).filter((p) => { const im = p.querySelector('img'); return im && im.src && !im.src.endsWith('/'); }) : [];
  const bgSrcs = [];
  if (bgCell) {
    bgCell.querySelectorAll('img').forEach((im) => { if (im.src && !im.src.endsWith('/')) bgSrcs.push(im.src); });
    bgCell.querySelectorAll('a').forEach((a) => { if (a.href && isImageLike(a.href)) bgSrcs.push(a.href); });
    const raw = bgCell.textContent?.trim();
    if (raw && isImageLike(raw)) bgSrcs.push(raw);
  }

  // Foregrounds
  const fgPics = fgCell ? Array.from(fgCell.querySelectorAll('picture')).filter((p) => { const im = p.querySelector('img'); return im && im.src && !im.src.endsWith('/'); }) : [];
  let videoUrl = '';
  if (fgCell) { const a = fgCell.querySelector('a'); if (a && !isImageLike(a.href)) videoUrl = a.href; }

  return { title, description, shortDescription, ctaHtml, features, bgPics, bgSrcs, fgPics, videoUrl };
}

/* --- Build slide HTML string (no DOM until final innerHTML) --- */

function buildBgHtml(bgPics, bgSrcs, isFirst) {
  if (bgPics[0]) return formatPicture(bgPics[0], bgPics[1], 'banner-slide-bg-img', isFirst);
  const desktop = (bgSrcs[0] || '').trim();
  const mobile = (bgSrcs[1] || '').trim();
  if (!desktop && !mobile) return '';
  const src = desktop || mobile;
  const srcEl = mobile && mobile !== desktop ? `<source media="(max-width:991px)" srcset="${escapeAttr(mobile)}">` : '';
  return `<picture>${srcEl}<img class="banner-slide-bg-img" src="${escapeAttr(src)}" alt="" loading="${isFirst ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${isFirst ? 'high' : 'low'}"></picture>`;
}

function formatPicture(dPic, mPic, imgClass, isFirst) {
  if (!dPic && !mPic) return '';
  const pic = (dPic || mPic).cloneNode(true);
  const img = pic.querySelector('img');
  if (img) {
    img.className = imgClass;
    img.loading = isFirst ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.setAttribute('fetchpriority', isFirst ? 'high' : 'low');
    if (imgClass === 'banner-slide-fg-img') { img.removeAttribute('width'); img.removeAttribute('height'); }
  }
  if (mPic && mPic !== dPic) {
    const mi = mPic.querySelector('img');
    if (mi?.src) {
      const s = document.createElement('source');
      s.setAttribute('media', '(max-width:991px)');
      s.setAttribute('srcset', mi.src);
      pic.insertBefore(s, pic.firstChild);
    }
  }
  return pic.outerHTML;
}

function buildSlideHtml(data, index, extraClasses) {
  const COLOR_KEYS = ['bg', 'eyebrow', 'description', 'cta1', 'cta2', 'ctabg1', 'ctabg2'];
  const styles = {};

  // Extract color values from classes
  for (let i = 0; i < extraClasses.length; i++) {
    const cls = extraClasses[i];
    const dash = cls.indexOf('-');
    if (dash < 1) continue;
    const key = cls.substring(0, dash);
    if (!COLOR_KEYS.includes(key)) continue;
    const val = cls.substring(dash + 1);
    styles[key] = /^\d+$/.test(val) ? '#' + String(parseInt(val, 10)).padStart(val.length, '0') : val;
  }

  const { title, description, shortDescription, ctaHtml, features, bgPics, bgSrcs, fgPics, videoUrl } = data;
  const isFirst = index === 0;

  // Slide classes
  const cls = ['banner-slide-slide'];
  if (isFirst) cls.push('is-active');
  if (bgPics.length || bgSrcs.length) cls.push('has-bg-media');
  for (let i = 0; i < extraClasses.length; i++) {
    const c = extraClasses[i];
    const dash = c.indexOf('-');
    if (dash < 1 || !COLOR_KEYS.includes(c.substring(0, dash))) cls.push(c);
  }

  // Inline styles
  const slideStyle = styles.bg ? ` style="background-color:${escapeAttr(styles.bg)};opacity:1"` : '';
  const titleColor = styles.eyebrow || '';
  const descColor = styles.description || (!title && styles.eyebrow ? styles.eyebrow : '');

  // Color-inject title HTML
  let tHtml = title;
  if (titleColor && title) {
    tHtml = title.replace(/<(h[1-6])([\s>])/gi, `<$1 style="color:${escapeAttr(titleColor)}"$2`);
  }

  // Color-inject description HTML
  let dHtml = description;
  if (descColor && description) {
    dHtml = description.replace(/<(p|h[1-6]|strong|b|em|span)([\s>])/gi, `<$1 style="color:${escapeAttr(descColor)}"$2`);
  }

  // CTA styles injection
  let cHtml = ctaHtml;
  if (styles.cta1 || styles.ctabg1) {
    const s = `${styles.cta1 ? `color:${styles.cta1};` : ''}${styles.ctabg1 ? `background-color:${styles.ctabg1};border-color:${styles.ctabg1}` : ''}`;
    cHtml = cHtml.replace('class="button primary"', `class="button primary" style="${escapeAttr(s)}"`);
  }
  if (styles.cta2 || styles.ctabg2) {
    const s = `${styles.cta2 ? `color:${styles.cta2};` : ''}${styles.ctabg2 ? `background-color:${styles.ctabg2};border-color:${styles.ctabg2}` : ''}`;
    cHtml = cHtml.replace('class="button secondary"', `class="button secondary" style="${escapeAttr(s)}"`);
  }

  // Media
  const bgHtml = buildBgHtml(bgPics, bgSrcs, isFirst);
  let fgHtml = formatPicture(fgPics[0], fgPics[1], 'banner-slide-fg-img', isFirst);
  if (videoUrl && !fgHtml) fgHtml = `<div class="banner-video-wrapper"><a href="${escapeAttr(videoUrl)}" class="banner-video-link button primary" target="_blank" rel="noopener">Watch Video</a></div>`;

  // Features
  let fHtml = '';
  if (features.length) {
    fHtml = '<div class="banner-slide-features" role="list" aria-label="Slide highlights">';
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      fHtml += `<div class="banner-slide-feature" role="listitem">${f.icon ? `<div class="banner-slide-feature-icon">${f.icon}</div>` : ''}${f.text ? `<span class="banner-slide-feature-text">${f.text}</span>` : ''}</div>`;
    }
    fHtml += '</div>';
  }

  // Title/desc wrappers with parent color
  const titleWrap = tHtml ? `<div class="banner-slide-title"${titleColor ? ` style="color:${escapeAttr(titleColor)}"` : ''}>${tHtml}</div>` : '';
  const descWrap = dHtml ? `<div class="banner-slide-description"${descColor ? ` style="color:${escapeAttr(descColor)}"` : ''}>${dHtml}</div>` : '';
  const actionsWrap = (cHtml || shortDescription) ? `<div class="banner-slide-actions">${cHtml}${shortDescription ? `<div class="banner-slide-short-description">${shortDescription}</div>` : ''}</div>` : '';

  return `<div class="${cls.join(' ')}" data-slide-index="${index}"${slideStyle}><div class="banner-slide-bg">${bgHtml}</div><div class="banner-slide-surface"><div class="banner-slide-content"><div class="banner-slide-copy">${titleWrap}${descWrap}${fHtml}${actionsWrap}</div><div class="banner-slide-media">${fgHtml}</div></div></div></div>`;
}

/* --- Slider init --- */

function initSlider(section) {
  if (initiated.has(section)) return;
  initiated.add(section);

  const blocks = section.querySelectorAll('.banner-slide.block');
  if (!blocks.length) return;

  const isAuthor = location.hostname.includes('author') || location.pathname.includes('/editor.html/');
  const autoRotate = section.classList.contains('auto-rotate');
  const slideCount = blocks.length;

  // Parse all slides and build HTML string in one pass (no intermediate DOM)
  let trackHtml = '';
  for (let i = 0; i < slideCount; i++) {
    const data = parseSlide(blocks[i]);
    const cls = [];
    blocks[i].classList.forEach((c) => { if (c !== 'banner-slide' && c !== 'block') cls.push(c); });
    trackHtml += buildSlideHtml(data, i, cls);
  }

  // Single DOM insertion — minimal reflow
  const container = document.createElement('div');
  container.className = 'banner-slide banner-slide--ready block';
  container.innerHTML = `<div class="banner-slide-stage"><div class="banner-slide-track">${trackHtml}</div><div class="banner-slide-dots"${slideCount <= 1 ? ' style="display:none"' : ''}></div></div>`;

  // Remove old blocks
  blocks.forEach((b) => {
    const w = b.closest('.banner-slide-wrapper') || b;
    if (isAuthor) w.style.display = 'none'; else w.remove();
  });

  // Insert — triggers single layout
  section.insertBefore(container, section.firstChild);

  // Cache slide elements
  const track = container.querySelector('.banner-slide-track');
  const dotsEl = container.querySelector('.banner-slide-dots');
  const slides = track.children;
  let active = 0;
  let timer = null;

  // Build dots via innerHTML (faster than createElement loop)
  let dotsHtml = '';
  for (let i = 0; i < slideCount; i++) {
    dotsHtml += `<button type="button" class="banner-slide-dot${i === 0 ? ' is-active' : ''}" aria-label="Go to slide ${i + 1}" aria-current="${i === 0 ? 'true' : 'false'}"></button>`;
  }
  dotsEl.innerHTML = dotsHtml;
  const dots = dotsEl.children;

  function goTo(i) {
    const s = slides[i];
    if (s) track.scrollTo({ left: s.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }

  function setActive(i) {
    if (i === active) return;
    slides[active].classList.remove('is-active');
    dots[active].classList.remove('is-active');
    dots[active].setAttribute('aria-current', 'false');
    slides[i].classList.add('is-active');
    dots[i].classList.add('is-active');
    dots[i].setAttribute('aria-current', 'true');
    active = i;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function start() {
    if (!autoRotate || slideCount <= 1 || timer) return;
    timer = setInterval(() => {
      if (document.body.style.overflowY === 'hidden') return;
      goTo((active + 1) % slideCount);
    }, AUTOPLAY_MS);
  }
  function restart() { if (autoRotate) { stop(); start(); } }

  // Defer all interaction to next frame — unblock LCP paint
  requestAnimationFrame(() => {
    // IntersectionObserver — track active slide
    const obs = new IntersectionObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          const idx = Array.prototype.indexOf.call(slides, entries[i].target);
          if (idx >= 0) setActive(idx);
        }
      }
    }, { threshold: 0.6, root: track });
    for (let i = 0; i < slideCount; i++) obs.observe(slides[i]);

    // Event delegation for dots (single listener)
    dotsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.banner-slide-dot');
      if (!btn) return;
      const idx = Array.prototype.indexOf.call(dots, btn);
      if (idx >= 0) { goTo(idx); restart(); }
    });

    // Touch/swipe
    let tx = 0;
    track.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const d = tx - e.changedTouches[0].clientX;
      if (Math.abs(d) > 50) { goTo(d > 0 ? (active + 1) % slideCount : (active - 1 + slideCount) % slideCount); restart(); }
    }, { passive: true });

    // Autoplay
    if (autoRotate) {
      start();
      track.addEventListener('mouseenter', stop);
      track.addEventListener('mouseleave', start);
    }
    document.addEventListener('visibilitychange', () => { if (autoRotate) { document.hidden ? stop() : start(); } });

    // CTA — event delegation (single listener on container)
    container.addEventListener('click', async (e) => {
      const btn = e.target.closest('.banner-slide-cta .button.primary, .banner-slide-cta2 .button.secondary');
      if (!btn) return;
      e.stopPropagation();

      const text = btn.textContent.trim();
      const href = (btn.getAttribute('href') || '#').trim();
      const page = targetObject?.pageName || '';
      const openForm = btn.getAttribute('data-cta-open-form') === 'true' || isHashLink(href);

      // Lazy analytics
      let dl;
      try { dl = await import('../../dl.js'); } catch { dl = {}; }

      if (openForm) {
        e.preventDefault();
        try {
          dl.bannerClick?.(text || href, page);
          dl.ctaClick?.(text || href, 'banner-slide', 'banner-slide', page);
          if (isFormLabel(text)) dl.applyLoanNow?.('banner', page, 'banner-slide', page);
        } catch { }
        try {
          const form = await import('../applyloanform/applyloanforms.js');
          const main = container.closest('main') || document.querySelector('main') || document.body;
          const lf = main.querySelector('.loan-form-sub-parent') || document.querySelector('.loan-form-sub-parent');
          const ov = main.querySelector('.modal-overlay') || document.querySelector('.modal-overlay');
          const vis = () => lf && getComputedStyle(lf).visibility !== 'hidden';
          let ok = false;
          if (form.onCLickApplyFormOpen && lf) { try { form.onCLickApplyFormOpen(e); ok = vis(); } catch { } }
          if (!ok && form.formOpen) { form.formOpen(); ok = vis(); }
          if (!ok && lf) {
            if (ov) { ov.classList.add('overlay'); ov.classList.remove('dp-none'); }
            if (matchMedia('(max-width:1024px)').matches) lf.classList.add('loan-form--open');
            lf.style.visibility = 'visible';
            document.body.style.overflowY = 'hidden';
          }
        } catch (err) { console.warn('banner-slide: form error', err); }
        return;
      }

      try {
        dl.bannerClick?.(text || href, page);
        dl.ctaClick?.(text || href, 'banner-slide', 'banner-slide', page);
        if (isFormLabel(text)) dl.applyLoanNow?.('banner', page, 'banner-slide', page);
      } catch { }
    });
  });
}

export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;
  const all = section.querySelectorAll('.banner-slide.block');
  if (block === all[all.length - 1]) initSlider(section);
}
