import { ctaClick, ctaClickInteraction } from '../../dl.js';
import {
  autoLinkLangPath,
  loadCSS,
} from '../../scripts/aem.js';
import { targetObject } from '../../scripts/scripts.js';
import { loanProductsAnalytics } from './teaserv2-analytics.js';

/**
 * Opens the calculator block (authored on the page) as a modal
 * Finds the calculator-wrapper section on the page and clones it into a modal
 * @param {string} title - Title to show in modal header
 */
async function openNewCalculatorModal(title) {
  try {
    // Find the calculator with modal-calculator class on the page
    // Only the one marked as 'modal-calculator' will be shown in modal
    const modalCalculatorBlock = document.querySelector('.calculator.block.modal-calculator');
    const calculatorSection = modalCalculatorBlock
      ? modalCalculatorBlock.closest('.section')
      : document.querySelector('.section.calculator-wrapper');
    if (!calculatorSection) {
      // eslint-disable-next-line no-console
      console.warn('No modal-calculator found. Add modal-calculator class to calculator block.');
      return;
    }

    // Load modal CSS
    await loadCSS(`${window.hlx.codeBasePath}/blocks/modal/modal.css`);

    // Clone the calculator content
    const calculatorClone = calculatorSection.cloneNode(true);
    calculatorClone.classList.remove('calculator-wrapper');
    calculatorClone.classList.add('calculator-modal-clone');

    // Create modal wrapper
    const calculatorWrapper = document.createElement('div');
    calculatorWrapper.className = 'calculator-modal-wrapper home-page-calculator-call-xf';
    calculatorWrapper.innerHTML = `
      <div class="calculator-modal-header">
        <h2>${title || 'Calculator'}</h2>
      </div>
      <div class="calculator-modal-body"></div>
    `;
    calculatorWrapper.querySelector('.calculator-modal-body').appendChild(calculatorClone);

    // Create modal dialog
    const dialog = document.createElement('dialog');
    dialog.className = 'new-calculator-dialog';
    const dialogContent = document.createElement('div');
    dialogContent.classList.add('modal-content');
    dialogContent.appendChild(calculatorWrapper);
    dialog.appendChild(dialogContent);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.type = 'button';
    closeButton.innerHTML = '<span class="close-icon">&times;</span>';
    closeButton.addEventListener('click', () => dialog.close());
    dialog.appendChild(closeButton);

    // Close on outside click
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom) {
        dialog.close();
      }
    });

    // Cleanup on close
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      dialog.remove();
    });

    // Show modal
    document.body.appendChild(dialog);
    dialog.showModal();
    document.body.classList.add('modal-open');

    // Re-initialize calculator functionality in the cloned modal
    setTimeout(async () => {
      try {
        const { homeLoanCalcFunc } = await import('../emiandeligiblitycalc/homeloancalculators.js');
        homeLoanCalcFunc(calculatorWrapper);
      } catch (initError) {
        console.warn('Calculator init error:', initError);
      }
    }, 100);
  } catch (error) {
    console.warn('Error opening calculator modal:', error);
  }
}

export default async function decorate(block) {
  const props = Array.from(block.children, (row) => row.firstElementChild);
  const renderTeaserHTML = renderTeaserHTMLFactory(props, block);
  block.innerHTML = '';
  block.append(renderTeaserHTML);
  loanProductsAnalytics(block);
  if (block.closest('.section.neeyat-banner')) {
    block.querySelector('a').target = '_blank';
  }

  // Analytics
  try {
    if (block.closest('.support-contact-us-wrapper')) {
      block.querySelector('a').getAttribute('href')
        && block.querySelector('a').addEventListener('click', (e) => {
          const data = {};
          data.click_text = e.target.textContent.trim();
          data.cta_position = 'Redirection';
          ctaClickInteraction(data);
        });
    }
  } catch (error) {
    console.warn(error);
  }
  if (block.closest('.calculator-section-wrapper')) {
    const bgImg = block.querySelector('a');
    const tryBTN = bgImg.querySelector('.button-container-text');
    const section = block.closest('.calculator-section-wrapper');
    const isNewCalculatorModal = section.classList.contains('new-calculator-modal');
    let isCurrentTarget;

    const cardTitle = block.querySelector('.title')?.textContent?.trim() || '';

    tryBTN.addEventListener('click', (e) => {
      isCurrentTarget = e.currentTarget.textContent.trim().toLowerCase();
      const title = e.target.closest('.calculator-section-wrapper').querySelector('.default-content-wrapper h2')?.innerText;
      const blockTitle = e.target.closest('.calculator-section-wrapper .block').querySelector('.title')?.innerText;
      const clicktext = e.target.closest('.calculator-section-wrapper ').querySelector('a .button-container-text')?.textContent.trim();
      ctaClick(clicktext, blockTitle, title, targetObject.pageName);

      // If new-calculator-modal class is present, open the authored calculator as modal
      if (isNewCalculatorModal) {
        e.preventDefault();
        e.stopPropagation();
        openNewCalculatorModal(blockTitle || cardTitle);
      }
    });

    bgImg.addEventListener('click', (e) => {
      // If new-calculator-modal class is present, open the authored calculator as modal
      if (isNewCalculatorModal) {
        e.preventDefault();
        e.stopPropagation();
        const blockTitle = block.querySelector('.title')?.textContent?.trim() || cardTitle;
        openNewCalculatorModal(blockTitle);
        return;
      }

      if (!(isCurrentTarget == 'try now')) {
        const title = e.target.closest('.calculator-section-wrapper').querySelector('.default-content-wrapper h2')?.innerText;
        const blockTitle = e.target.closest('.calculator-section-wrapper .block').querySelector('.title')?.innerText;
        const clicktext = e.target.closest('.calculator-section-wrapper ').querySelector('a .button-container-text')?.textContent.trim();
        ctaClick(clicktext, blockTitle, title, targetObject.pageName);
      }
    });
  }
}

export function renderTeaserHTMLFactory(props, block) {
  const isDesktop = window.matchMedia('(min-width: 768px)');
  const isMobile = window.matchMedia('(max-width: 767px)');

  const [mainHref, bgImage, frontImage, title, description, mobileDescription, button, buttonHref, bgColor, teaserv2Attr, textwithinnerhtml, mobileImg] = props;

  const createElement = (tag, className, content) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content || '';
    return element;
  };

  const mainLink = mainHref?.textContent.trim() || '';
  const container = document.createElement('a');
  // container.href = mainLink ||  'javascript:void(0)';
  container.setAttribute('aria-label', 'teaser link');
  container.setAttribute('tabindex', '0');
  mainLink ? container.href = mainLink : container.setAttribute('role', 'button');

  let bgImageSrc = bgImage?.querySelector('picture > img')?.src || '';
  let mobileSrc = mobileImg?.querySelector('picture > img')?.src || '';
  const bgBannerColor = bgColor?.textContent.trim()?.src || '';
  const bgImageDiv = createElement('div', 'bg-image');

  if (block?.closest('.section').classList.contains('corporate-financing-banner-wrapper')) {
    if (isDesktop.matches) {
      bgImageSrc = bgImageSrc.split('?')[0];
    } else if (isMobile.matches) {
      mobileSrc = mobileSrc.split('?')[0];
    }
  }

  if (isDesktop.matches) {
    if (bgImageSrc) bgImageDiv.style.backgroundImage = `url(${bgImageSrc})`;
  } else if (isMobile.matches) {
    if (mobileSrc) bgImageDiv.style.backgroundImage = `url(${mobileSrc})`;
  }

  if (bgBannerColor) bgImageDiv.style.backgroundColor = bgBannerColor;

  const frontImagePic = frontImage?.querySelector('picture');
  const frontImageDiv = createElement('div', 'front-image');
  if (frontImagePic) frontImageDiv.append(frontImagePic);

  const titleDiv = createElement('div', 'title', title?.textContent.trim() || '');
  const descriptionDiv = createElement('div', 'description', description?.textContent.trim() || '');

  let newButtonTag = '';
  const buttonHrefAnchor = buttonHref?.querySelector('a') || '';
  if (buttonHrefAnchor) {
    buttonHrefAnchor.innerText = button?.textContent.trim() || '';
    newButtonTag = buttonHrefAnchor.outerHTML;
  } else if (button) {
    newButtonTag = createElement('div', 'button-container-text', button?.textContent.trim() || '');
  }

  const textwithDiv = document.createElement('div');
  textwithDiv.innerHTML = textwithinnerhtml?.innerHTML || '';
  textwithDiv.classList.add('rte-text-description');

  bgImageDiv.append(frontImageDiv, titleDiv, descriptionDiv, newButtonTag, textwithDiv);

  const teaserv2AttrGet = teaserv2Attr?.textContent?.trim() || '';
  teaserv2Attr.closest('.teaserv2-wrapper')?.setAttribute('data-teaserv2-xf', teaserv2AttrGet);

  if (container.tagName === 'A') {
    container.append(bgImageDiv);
    autoLinkLangPath(container);
  }

  /* if (container.tagName === "A" && container.href !== '') {
    container.append(bgImageDiv);
    return container;
  }else{
    return bgImageDiv;
  } */

  return container;
}
