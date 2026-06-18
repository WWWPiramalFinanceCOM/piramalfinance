import { ctaClick, ctaClickInteraction, outboundClick } from '../../dl.js';
import { autoLinkLangPaths } from '../../scripts/aem.js';
import { targetObject } from '../../scripts/scripts.js';

export default function decorate(block) {
  const newDiv = createImageWithLink(block);

  if (newDiv) {
    block.innerHTML = '';
    block.appendChild(newDiv);

    if (
      document.querySelectorAll(
        '.download-piramal-wrapper,.contact-us-download-wrapper',
      ).length > 0
    ) {
      const desktopLinks = document.querySelectorAll(
        '.download-piramal-wrapper .image-href-desktop a, .contact-us-download-wrapper .image-href-desktop a',
      );

      const mobileLinks = document.querySelectorAll(
        '.download-piramal-wrapper .image-href-mobile a, .contact-us-download-wrapper .image-href-mobile a',
      );

      autoLinkLangPaths(desktopLinks);
      autoLinkLangPaths(mobileLinks);

      const anchorLinks = desktopLinks.length
        ? desktopLinks
        : mobileLinks;

      if (anchorLinks.length > 0) {
        anchorLinks[0].removeAttribute('href');
      }
    }

    aTagPreventDefault();
  }
}

function createImageWithLink(block) {
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  const blockDiv = document.createElement('div');
  blockDiv.innerHTML = block.innerHTML.trim();

  // Get all pictures
  const pictures = [...blockDiv.querySelectorAll('picture')];

  if (!pictures.length) {
    console.warn('Picture not found');
    return document.createElement('div');
  }

  // Desktop = first picture
  // Mobile = second picture (if available)
  const desktopPicture = pictures[0];
  const mobilePicture = pictures.length > 1
    ? pictures[1]
    : pictures[0];

  const blockPic = isMobile
    ? mobilePicture
    : desktopPicture;

  // Find first valid href
  const sourceAnchor = blockDiv.querySelector(
    'a[href]:not([href="javascript:void(0)"])',
  );

  const hrefElem = sourceAnchor?.getAttribute('href') || '';

  // Find non-empty text blocks
  const nonEmptyBlocks = [...block.children].filter(
    (child) => child.textContent.trim(),
  );

  const clickTextElement =
    nonEmptyBlocks.length >= 2
      ? nonEmptyBlocks[nonEmptyBlocks.length - 2]
      : null;

  const menuCategoryElement =
    nonEmptyBlocks.length >= 1
      ? nonEmptyBlocks[nonEmptyBlocks.length - 1]
      : null;

  const createHref = document.createElement('a');

  if (
    hrefElem
    && hrefElem !== '#'
    && hrefElem !== 'javascript:void(0)'
  ) {
    createHref.href = hrefElem;
    createHref.target = '_blank';
  } else {
    createHref.setAttribute('role', 'button');
  }

  let ariaLabel = 'Link';

  if (hrefElem.includes('play.google.com')) {
    ariaLabel = 'Get it on Google Play';
  } else if (
    hrefElem.includes('apple.com')
    || hrefElem.includes('apps.apple.com')
  ) {
    ariaLabel = 'Download on the App Store';
  } else if (clickTextElement?.textContent?.trim()) {
    ariaLabel = clickTextElement.textContent.trim();
  }

  createHref.setAttribute('aria-label', ariaLabel);
  createHref.setAttribute('tabindex', '0');
  createHref.classList.add('anchor-event-link');

  createHref.appendChild(blockPic.cloneNode(true));

  const createDiv = document.createElement('div');
  createDiv.classList.add(
    isMobile ? 'image-href-mobile' : 'image-href-desktop',
  );

  createDiv.appendChild(createHref);

  createDiv.addEventListener('click', (e) => {
    try {
      const clickText =
        clickTextElement?.textContent?.trim() || '';

      const menuCategory =
        menuCategoryElement?.textContent?.trim() || '';

      if (
        block.closest('.footer')
        && clickText
        && menuCategory
      ) {
        outboundClick(
          clickText,
          menuCategory,
          'footer',
          targetObject.pageName,
        );
      } else if (
        block.closest('.download-piramal-wrapper')
        && clickText
        && menuCategory
      ) {
        ctaClick(
          clickText,
          menuCategory,
          menuCategory,
          targetObject.pageName,
        );
      } else if (
        block.closest('.section.career-social-cards')
      ) {
        const anchor = e.target.closest('a');

        if (anchor?.href) {
          const data = {};

          const urlText = anchor.href.split('/')[2] || '';

          data.click_text = urlText
            .replace(/^www\./, '')
            .replace(/\.com$/, '');

          data.cta_position =
            e.target
              .closest('.section')
              ?.querySelector(
                '.wrapper-creation-container .default-content-wrapper p',
              )
              ?.textContent?.trim() || '';

          ctaClickInteraction(data);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  });

  return createDiv;
}

function aTagPreventDefault() {
  const anchorLinks = document.querySelectorAll('.anchor-event-link');

  anchorLinks.forEach((link) => {
    const href = link.getAttribute('href');

    if (
      !href
      || href === '#'
      || href === 'javascript:void(0)'
    ) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
      });
    }
  });
}