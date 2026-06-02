import { footerInteraction } from '../../dl.js';
import { getMetadata } from '../../scripts/aem.js';
import { targetObject } from '../../scripts/scripts.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);

  // Fix WCAG 1.3.1: Convert section titles from p to h2 for proper heading structure
  // Convert "Follow us on" and other footer section titles to headings
  block.querySelectorAll('.footer-follow-us-wrapper .default-content-wrapper > p:first-child').forEach((p) => {
    const h2 = document.createElement('h2');
    h2.className = p.className;
    h2.innerHTML = p.innerHTML;
    Array.from(p.attributes).forEach((attr) => {
      h2.setAttribute(attr.name, attr.value);
    });
    p.parentNode.replaceChild(h2, p);
  });

  // Convert footer-section-second column headers to h2 for accessibility
  block.querySelectorAll('.footer-section-second .columns > div > div > ul > li > p:first-child').forEach((p) => {
    // Only convert if it's a section header (has sibling ul)
    const siblingUl = p.nextElementSibling;
    if (siblingUl && siblingUl.tagName === 'UL') {
      const h2 = document.createElement('h2');
      h2.className = p.className;
      h2.innerHTML = p.innerHTML;
      Array.from(p.attributes).forEach((attr) => {
        h2.setAttribute(attr.name, attr.value);
      });
      p.parentNode.replaceChild(h2, p);
    }
  });
  
  // Fix WCAG 1.3.1: Remove unnecessary list semantics from footer section headings
  // The outer <ul> in footer-section-second wraps columns, not actual list content
  block.querySelectorAll('.footer-section-second .columns > div > div > ul').forEach((ul) => {
    // Add role="presentation" to outer UL (layout container, not semantic list)
    ul.setAttribute('role', 'presentation');
    // Direct child LIs are also presentational
    ul.querySelectorAll(':scope > li').forEach((li) => {
      li.setAttribute('role', 'presentation');
    });
  });

  try {
    block.querySelectorAll('li,p,h2').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.footer-section-first') || e.target.closest('.footer-section-second')) {
          // console.log("click_text :: ", e.target.innerText);
          // console.log("menu_category :: ", e.target.closest("ul")?.closest("li")?.querySelector("p")?.innerText);
          try {
            const click_text = e.target.innerText;
            const menu_category = e.target.closest('ul')?.closest('li')?.querySelector(':is(p, h2)')?.innerText;
            footerInteraction(click_text, menu_category, null, targetObject.pageName);
          } catch (error) {
            console.warn(error);
          }
        }
        if (e.target.href.includes('/modals/')) {
          return false;
        }
        e.stopPropagation();
      });
    });

    if (block.closest('body')?.querySelector('.mobile-sticky-button')) {
      block.querySelector('.footer-last-wrapper').classList.add('padding-bottom-footer');
    }
  } catch (error) {
    console.warn(error);
  }
}
