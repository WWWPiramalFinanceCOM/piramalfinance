import { targetObject } from '../../scripts/scripts.js';
import { body, createCarousle } from '../../scripts/common.js';
import { generateDetailedTeaserDOM } from '../detailed-teaser/detailed-teaser.js';
import { generateBannerTeaserDOM } from '../banner-teaser/banner-teaser.js';

const carouselContainerMapping = {
  'detailed-teaser': generateDetailedTeaserDOM,
  'ss-teaser': generateDetailedTeaserDOM,
};

// Lazy-created observer â€” only allocated when version needs it
let scrollObserver;
function getScrollObserver() {
  if (!scrollObserver) {
    scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const carouselButtons = entry.target.parentNode?.parentNode?.lastChild;
            if (!carouselButtons) return;
            carouselButtons.querySelectorAll(':scope button').forEach((b) => b.classList.remove('selected'));
            const btn = carouselButtons.querySelector(`:scope button[data-panel='${entry.target.dataset.panel}']`);
            if (btn) btn.classList.add('selected');
          }
        });
      },
      { threshold: 0.6, rootMargin: '500px 0px' },
    );
  }
  return scrollObserver;
}

/**
 * Safely extract children from panel with fallback for missing bannerImage fields.
 * Returns a normalized object so the rest of the code never sees undefined.
 */
function extractPanelData(panel) {
  const children = [...panel.children];
  const len = children.length;

  // With bannerImages: 2 + imagebg + image + classList + bgColor + gradient = 7+
  // Without: imagebg + image + classList + bgColor + gradient = 5
  const hasBannerImages = len >= 7;

  let bannerImagebg = null;
  let bannerImagebgMob = null;
  let imagebg;
  let image;
  let classList;
  let rest;

  if (hasBannerImages) {
    [bannerImagebg, bannerImagebgMob, imagebg, image, classList, ...rest] = children;
  } else {
    [imagebg, image, classList, ...rest] = children;
  }

  const bgColorCode = rest.length >= 2 ? rest[rest.length - 2]?.textContent?.trim() || '' : '';
  const bgLinearGradientColor = rest.length >= 1 ? rest[rest.length - 1]?.textContent?.trim() || '' : '';
  const classesText = classList?.textContent?.trim() || '';
  const classes = classesText ? classesText.split(',').map((c) => c.trim()).filter(Boolean) : [];

  return {
    bannerImagebg,
    bannerImagebgMob,
    imagebg,
    image,
    rest,
    classes,
    bgColorCode,
    bgLinearGradientColor,
  };
}

export default function decorate(block) {
  const isDesktop = window.matchMedia('(min-width: 900px)').matches;

  try {
    if (window.location.pathname === '/personal-loan' && window.location.search && block.closest('.camp-btn')) {
      const a = block.querySelector('a');
      const mobA = document.querySelectorAll('.camp-btn')[1]?.querySelector('a');
      const url = new URL(a.href);
      a.href = url.origin + url.pathname + window.location.search;
      if (mobA) mobA.href = url.origin + url.pathname + window.location.search;
    }
  } catch (error) {
    console.warn(error);
  }

  // the panels container
  const panelContainer = document.createElement('div');
  panelContainer.classList.add('panel-container', 'carousel-inner');
  panelContainer.id = 'carouselInner';

  // the buttons container
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');

  const slideNavButtons = document.createElement('div');
  slideNavButtons.classList.add('carousel-navigation-buttons');
  slideNavButtons.innerHTML = `
    <button type="button" class="slide-prev glider-prev" aria-label="Previous Slide">${block.children[0]?.outerHTML || '<'}</button>
    <button type="button" class="slide-next glider-next" aria-label="Next Slide">${block.children[1]?.outerHTML || '>'}</button>
  `;

  const carouselshowtype = block.children[2]?.innerText?.trim() || 'primary';
  const rotatetype = block.children[3]?.innerText?.trim() || 'rotate-off';
  const version = block.children[4]?.innerText?.trim() || 'One';
  const configData = block.children[5]?.innerText?.trim() || '';

  const isOldversion = targetObject.isMobile || version === 'One';
  const isrotate = rotatetype === 'rotate-on';
  block.classList.add(carouselshowtype, version);

  // get all children elements
  const panels = Array.from(block.children).slice(6);

  // build panels into a fragment to minimise reflows â€” single DOM write at the end
  const fragment = document.createDocumentFragment();

  panels.forEach((panel, i) => {
    const {
      bannerImagebg,
      bannerImagebgMob,
      imagebg,
      image,
      rest,
      classes,
      bgColorCode,
      bgLinearGradientColor,
    } = extractPanelData(panel);

    let blockType = 'banner-teaser';
    let generateOtherComponent = null;

    classes.forEach((className) => {
      if (carouselContainerMapping[className]) {
        blockType = className;
        generateOtherComponent = carouselContainerMapping[className];
      }
    });

    // Guard: imagebg/image might be undefined if HTML is malformed
    const teaserProps = [imagebg, image, ...rest].filter(Boolean);
    generateOtherComponent = generateOtherComponent
      ? generateOtherComponent(teaserProps, classes)
      : generateBannerTeaserDOM(teaserProps, classes);

    panel.textContent = '';
    panel.classList.add(blockType, 'block', 'carousel-item');
    classes.forEach((c) => panel.classList.add(c));
    panel.dataset.panel = `panel_${i}`;
    panel.append(generateOtherComponent);

    // Use <picture>/<img> element instead of CSS background-image for better LCP
    const bgSource = isDesktop ? bannerImagebg : bannerImagebgMob;
    const bgPicture = bgSource?.querySelector?.('picture');
    if (bgPicture) {
      const bgImg = bgPicture.querySelector('img');
      if (bgImg) {
        bgImg.classList.add('panel-bg-img');
        if (i === 0) {
          bgImg.fetchPriority = 'high';
          bgImg.loading = 'eager';
        } else {
          bgImg.loading = 'lazy';
        }
      }
      bgPicture.classList.add('panel-bg-picture');
      panel.prepend(bgPicture);
    }

    if (bgColorCode) panel.style.backgroundColor = bgColorCode;
    if (bgLinearGradientColor) panel.style.backgroundImage = bgLinearGradientColor;
    fragment.append(panel);

    if (panels.length > 1) {
      const button = document.createElement('button');
      button.title = `Slide ${i + 1}`;
      button.dataset.panel = `panel_${i}`;
      panel.classList.forEach((panelclass) => {
        if (!['banner-teaser', 'block', 'carousel-item'].includes(panelclass)) {
          button.classList.add(panelclass);
        }
      });
      if (!i) button.classList.add('selected');

      if (version !== 'Glider' && isOldversion) {
        getScrollObserver().observe(panel);
      }

      button.addEventListener('click', () => {
        panelContainer.scrollTo({ top: 0, left: panel.offsetLeft - panel.parentNode.offsetLeft, behavior: 'smooth' });
      });
      buttonContainer.append(button);
    }
  });

  // Single DOM write â€” append all panels at once
  panelContainer.append(fragment);
  block.textContent = '';
  block.append(panelContainer);
  block.append(slideNavButtons);

  const slidePrev = block.querySelector('.slide-prev');
  const slideNext = block.querySelector('.slide-next');

  if (version === 'Glider') {
    let configJson;
    try { configJson = JSON.parse(configData); } catch { configJson = {}; }
    configJson.arrows = { prev: slidePrev, next: slideNext };
    configJson.dots = buttonContainer;

    block.append(buttonContainer);
    const gliderObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          new Glider(panelContainer, configJson);
          gliderObserver.disconnect();
        }
      });
    });
    gliderObserver.observe(block);
  } else if (isOldversion) {
    function activePanelContainer(panel) {
      panelContainer.scrollTo({ top: 0, left: panel.offsetLeft - panel.parentNode.offsetLeft, behavior: 'smooth' });
    }

    function slidePrevEventHandler() {
      const actviveBtn = buttonContainer.querySelector('.selected');
      if (!actviveBtn) return;
      const activePanel = block.querySelector(`[data-panel=${actviveBtn.dataset.panel}]`);
      if (!activePanel) return;
      const panel = activePanel.previousElementSibling;
      if (panel) activePanelContainer(panel);
    }

    function slideNextEventHandler() {
      const actviveBtn = buttonContainer.querySelector('.selected');
      if (!actviveBtn) return;
      const activePanel = block.querySelector(`[data-panel=${actviveBtn.dataset.panel}]`);
      if (!activePanel) return;
      if (isrotate) {
        const panel = activePanel.nextElementSibling || block.querySelector('[data-panel]');
        if (panel) activePanelContainer(panel);
      } else {
        const panel = activePanel.nextElementSibling;
        if (panel) activePanelContainer(panel);
      }
    }

    slidePrev?.addEventListener('click', slidePrevEventHandler);
    slideNext?.addEventListener('click', slideNextEventHandler);

    if (buttonContainer.children.length) {
      block.append(buttonContainer);
      if (isrotate) {
        setInterval(() => {
          if (body.style.overflowY !== 'hidden') {
            slideNextEventHandler();
          }
        }, 7000);
      }
    }
  } else if (buttonContainer.children.length) {
    block.append(buttonContainer);
    createCarousle(block, slidePrev, slideNext);
  }
}
