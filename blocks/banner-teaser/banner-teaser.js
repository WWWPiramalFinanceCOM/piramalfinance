import {
  applyLoanNow, bannerClick, ctaClick, ctaClickInteraction, readMoreInteraction,
} from '../../dl.js';
import { getMetadata } from '../../scripts/aem.js';
import { targetObject } from '../../scripts/scripts.js';
import { handleOpenFormOnClick } from '../applyloanform/applyloanforms.js';

export function decorateButtons(...buttons) {
  return buttons
    .filter(Boolean)
    .map((div) => {
      const a = div?.querySelector?.('a');
      if (a) {
        a.classList.add('button');
        if (a.parentElement.tagName === 'EM') a.classList.add('secondary');
        if (a.parentElement.tagName === 'STRONG') a.classList.add('primary');
        return a.outerHTML;
      }
      return '';
    })
    .join('');
}

function createAnchor(element) {
  const a = document.createElement('a');
  const link = element?.innerText?.trim() || '';
  a.setAttribute('aria-label', 'teaser link');
  a.setAttribute('tabindex', '0');
  if (link) {
    a.href = link;
  } else {
    a.setAttribute('role', 'button');
  }
  return a;
}

/** Safe accessor — returns a no-op DOM element when prop is missing */
function safe(el) {
  if (el) return el;
  const placeholder = document.createElement('div');
  return placeholder;
}

export function generateBannerTeaserDOM(props, classes) {
  // Destructure with fallback — any missing prop becomes undefined, handled via safe()
  const [
    rawPictureBgContainer,
    rawPictureContainer,
    rawEyebrow,
    rawTitle,
    rawLongDescr,
    rawShortDescr,
    rawFirstCta,
    rawSecondCta,
    ...ctaAndTrailing
  ] = props || [];

  const pictureBgContainer = safe(rawPictureBgContainer);
  const pictureContainer = safe(rawPictureContainer);
  const eyebrow = safe(rawEyebrow);
  const title = safe(rawTitle);
  const longDescr = safe(rawLongDescr);
  const shortDescr = safe(rawShortDescr);
  const firstCta = safe(rawFirstCta);
  const secondCta = safe(rawSecondCta);

  /** Parse a grouped CTA cell (picture + paragraphs in one div). */
  function parseCtaGroup(cell) {
    const el = safe(cell);
    const pic = el.querySelector('picture');
    const anchor = el.querySelector('a') || createAnchor(el);
    if (pic) anchor.innerHTML = pic.outerHTML;
    const paragraphs = [...el.querySelectorAll(':scope > p')];
    const textP = paragraphs.find((p) => !p.querySelector('a') && !p.querySelector('picture'));
    return { anchor, text: textP?.textContent?.trim() || '' };
  }

  /** Parse old-format separate CTA cells (image, alt, url, text as 4 divs). */
  function parseOldCta(imgCell, urlCell, textCell) {
    const img = safe(imgCell);
    const url = safe(urlCell);
    const txt = safe(textCell);
    const anchor = url.querySelector('a') || createAnchor(url);
    anchor.innerHTML = img.innerHTML;
    return { anchor, text: txt.innerText || '' };
  }

  // Old format: 12 separate CTA cells + mobileBgImage + bgcolor + gradient = 15
  // New format: 3 grouped CTA cells + mobileBgImage + bgcolor + gradient = 6
  const isOldFormat = ctaAndTrailing.length > 8;
  let cta1;
  let cta2;
  let cta3;
  let mobileImage;
  if (isOldFormat) {
    const [
      rawCtaImg, , rawCtaUrl, rawImgTxt,
      rawCtaImg2, , rawCtaUrl2, rawImgTxt2,
      rawCtaImg3, , rawCtaUrl3, rawImgTxt3,
      rawMobImg,
    ] = ctaAndTrailing;
    cta1 = parseOldCta(rawCtaImg, rawCtaUrl, rawImgTxt);
    cta2 = parseOldCta(rawCtaImg2, rawCtaUrl2, rawImgTxt2);
    cta3 = parseOldCta(rawCtaImg3, rawCtaUrl3, rawImgTxt3);
    mobileImage = rawMobImg;
  } else {
    const [rawG1, rawG2, rawG3, rawMobImg] = ctaAndTrailing;
    cta1 = parseCtaGroup(rawG1);
    cta2 = parseCtaGroup(rawG2);
    cta3 = parseCtaGroup(rawG3);
    mobileImage = rawMobImg;
  }

  const bgPicture = pictureBgContainer.querySelector('picture');
  const picture = pictureContainer.querySelector('picture');

  let bgPictureStyle = '';
  const bgImgSrc = bgPicture?.querySelector('img')?.src;
  if (bgImgSrc) {
    const src = classes.includes('original-img') ? bgImgSrc.split('?')[0] : bgImgSrc;
    bgPictureStyle = ` style='background-image:url(${src})' `;
  }

  const mobileImgSrc = mobileImage?.querySelector?.('img')?.src;
  const mobileImageStyle = mobileImgSrc ? ` style='background-image:url(${mobileImgSrc})' ` : '';
  let bgImageAllow = bgPictureStyle;
  if (targetObject.isTab) {
    bgImageAllow = mobileImageStyle;
  }

  const teaserDOM = document.createRange().createContextualFragment(
    `
    <div class='background' ${bgImageAllow}'>
      <div class="front-picture">${picture ? picture.outerHTML : ''}</div>
      <div class='foreground'>
        <div class='text'>
          ${eyebrow.textContent.trim()
      ? `<div class='eyebrow'>${eyebrow.textContent.trim()}</div>`
      : ''
    }
          <div class='title'>${title.innerHTML}</div>
          <div class='long-description'>${longDescr.innerHTML}</div>
          <div class='short-description'>${shortDescr.innerHTML}</div>
          <div class='cta-image-wrapper'>
            <div class="img-with-text-wrap">
              <div class="cta-image">${cta1.anchor ? cta1.anchor.outerHTML : ''}</div>
              <p class="cta-text">${cta1.text}</p>
            </div>
            <div class="img-with-text-wrap">
              <div class="cta-image">${cta2.anchor ? cta2.anchor.outerHTML : ''}</div>
              <p class="cta-text">${cta2.text}</p>
            </div>
            <div class="img-with-text-wrap">
              <div class="cta-image">${cta3.anchor ? cta3.anchor.outerHTML : ''}</div>
              <p class="cta-text">${cta3.text}</p>
            </div>
          </div>
          <div class='cta'>${decorateButtons(rawFirstCta, rawSecondCta)}</div>
        </div>
        <div class='spacer'></div>
      </div>
  `,
  );

  // set the mobile background color
  const backgroundColor = [...classes].find((cls) => cls.startsWith('bg-'));
  if (backgroundColor) {
    teaserDOM
      .querySelector('.foreground')
      .style.setProperty(
        '--banner-teaser-background-color',
        `var(--${backgroundColor.substr(3)})`,
      );
  }

  teaserDOM?.querySelectorAll('a').forEach((el, index) => {
    el.addEventListener('click', function (e) {
      try {
        if (!e.target.closest('.calc-desktop-carousel-wrapper')) {
          if (!e.target.closest('.multi-calc-teaser-wrapper')) {
            if (index || e.target.closest('.cta')) {
              bannerClick(e.target.innerText, targetObject.pageName);
            }
          }
          if (e.target.closest('.multi-calc-teaser-wrapper')) {
            const click_text = e.target.textContent.trim();
            const cta_position = '';
            const cta_category = e.target.closest('.foreground').querySelector('.long-description').querySelector('p').textContent.trim();
            ctaClick(click_text, cta_category, cta_position, targetObject.pageName);
          }
          if (e.target.closest('.open-form-on-click')) {
            const formClickSection = e.target.closest('.open-form-on-click');
            handleOpenFormOnClick(formClickSection);
          }
        } else if (this.closest('.carousel-articles-wrapper')) {
          readMoreAnalytics(e);
        } else if (this.closest('.csr-committee-wrapper')) {
          csrfReportAnalytics(e);
        } else if (e.target.closest('.media-cards-wrapper')) {
          const data = {};
          data.click_text = e.target.closest('.long-description').querySelector('p').textContent.trim();
          data.cta_position = e.target.closest('.section').querySelector('.tab-name-wrapper .carousel-inner .active').textContent.trim();
          ctaClickInteraction(data);
        } else if (e.target.closest('.calc-desktop-carousel-wrapper')) {
          const data = {};
          data.click_text = e.target.closest('.text').querySelector('.long-description p').textContent.trim();
          data.cta_position = e.target.closest('.section').querySelector('.default-content-wrapper').textContent.trim();
          ctaClickInteraction(data);
        } else {
          applyLoanNow(
            `${eyebrow.textContent.trim()} ${title.textContent.trim()}`,
            targetObject.pageName,
            'banner',
            targetObject.pageName,
          );
        }
      } catch (error) {
        console.warn(error);
      }
    });
  });

  try {
    if (classes.includes('click-able')) {
      teaserDOM.children[0]?.addEventListener('click', function (e) {
        try {
          if (this.closest('.section.board-of-directors-wrapper')) {
            const data = {};
            data.click_text = this.querySelector('.title')?.textContent?.trim();
            data.cta_position = this.closest('.section')?.querySelector('.default-content-wrapper')?.querySelector('h1, h2, h3, h4, h5, h6')?.textContent?.trim();
            ctaClickInteraction(data);
          }
        } catch (error) {
          console.warn(error);
        }
        const ctaLink = firstCta?.innerText?.trim();
        if (ctaLink) location.href = getMetadata('lang-path') + ctaLink;
      });
    }
  } catch (error) {
    // intentionally empty
  }

  return teaserDOM;
}

export default function decorate(block) {
  const props = [...block.children].map((row) => row.firstElementChild);
  const teaserDOM = generateBannerTeaserDOM(props, block.classList);
  block.textContent = '';
  block.append(teaserDOM);
}

function readMoreAnalytics(e) {
  const data = {};
  data.article_name = e?.target.getAttribute('href').split('/').pop();
  data.cta_position = e?.target.closest('.section').querySelector('.default-content-wrapper').querySelector('h1, h2, h3, h4, h5, h6').textContent.trim();
  data.click_header = e?.target.textContent.trim();
  readMoreInteraction(data);
}

function csrfReportAnalytics(e) {
  const data = {};
  data.click_text = e.target.textContent.trim();
  data.cta_position = e.target.closest('.section').querySelector('.default-content-wrapper').querySelector('h1, h2, h3, h4, h5, h6').textContent.trim();
  ctaClickInteraction(data);
}
