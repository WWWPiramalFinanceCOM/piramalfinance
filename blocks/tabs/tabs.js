// import { createTag } from '../../scripts/scripts.js';

/**
 * Helper function to create DOM elements
 * @param {string} tag DOM element to be created
 * @param {array} attributes attributes to be added
 */
function createTag(tag, attributes, html) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement || html instanceof SVGElement) {
      el.append(html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  return el;
}

function changeTabs(e) {
  const { target } = e;
  const tabMenu = target.parentNode;
  const tabContent = tabMenu.nextElementSibling;

  tabMenu.querySelectorAll('[aria-selected="true"]').forEach((t) => t.setAttribute('aria-selected', false));

  target.setAttribute('aria-selected', true);

  tabContent.querySelectorAll('[role="tabpanel"]').forEach((p) => p.classList.remove('active'));

  tabContent.parentNode.querySelector(`#${target.getAttribute('aria-controls')}`).classList.add('active');
}

function initTabs(block) {
  const tabs = block.querySelectorAll('[role="tab"]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', changeTabs);
  });
}

let initCount = 0;
export default function decorate(block) {
  const tabList = createTag('div', { class: 'tab-list', role: 'tablist' });
  const tabContent = createTag('div', { class: 'tab-content' });

  const tabNames = [];
  const tabContents = [];
  // list of Universal Editor instrumented 'tab content' divs
  const tabInstrumentedDiv = [];

  [...block.children].forEach((child) => {
    // keep the div that has been instrumented for UE
    tabInstrumentedDiv.push(child);

    [...child.children].forEach((el, index) => {
      if (index === 0) {
        tabNames.push(el.textContent.trim());
      } else {
        tabContents.push(el.childNodes);
      }
    });
  });

  tabNames.forEach((name, i) => {
    const tabBtnAttributes = {
      role: 'tab',
      class: 'tab-title',
      id: `tab-${initCount}-${i}`,
      tabindex: i > 0 ? '0' : '-1',
      'aria-selected': i === 0 ? 'true' : 'false',
      'aria-controls': `tab-panel-${initCount}-${i}`,
      'aria-label': name,
      'data-tab-id': i,
    };

    const tabNameDiv = createTag('button', tabBtnAttributes);
    tabNameDiv.textContent = name;
    tabList.appendChild(tabNameDiv);
  });

  tabContents.forEach((content, i) => {
    const tabContentAttributes = {
      id: `tab-panel-${initCount}-${i}`,
      role: 'tabpanel',
      class: 'tabpanel',
      tabindex: '0',
      'aria-labelledby': `tab-${initCount}-${i}`,
    };

    // get the instrumented div
    const tabContentDiv = tabInstrumentedDiv[i];
    // add all additional attributes
    Object.entries(tabContentAttributes).forEach(([key, val]) => {
      tabContentDiv.setAttribute(key, val);
    });

    // default first tab is active
    if (i === 0) tabContentDiv.classList.add('active');
    tabContentDiv.replaceChildren(...Array.from(content));
    tabContent.appendChild(tabContentDiv);
  });

  // Replace the existing content with the new tab list and tab content
  block.innerHTML = ''; // Clear the existing content
  block.appendChild(tabList);
  block.appendChild(tabContent);

  initTabs(block);
  initCount += 1;

  // Add navigation arrows for shareholding-wrap section
  const section = block.closest('.section.shareholding-wrap');
  if (section) {
    addTabNavArrows(block);
  }
}

function addTabNavArrows(block) {
  const tabList = block.querySelector('.tab-list');
  if (!tabList) return;

  const wrapper = block.closest('.tabs-wrapper');
  if (!wrapper) return;

  // Create left arrow
  const prevArrow = createTag('button', {
    class: 'tab-nav-arrow prev',
    'aria-label': 'Previous tabs'
  });
  prevArrow.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;

  // Create right arrow
  const nextArrow = createTag('button', {
    class: 'tab-nav-arrow next next-highlight',
    'aria-label': 'Next tabs'
  });
  nextArrow.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>`;

  // Insert arrows into wrapper
  wrapper.insertBefore(prevArrow, wrapper.firstChild);
  wrapper.appendChild(nextArrow);

  // Scroll functionality
  const scrollAmount = 200;

  prevArrow.addEventListener('click', () => {
    tabList.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextArrow.addEventListener('click', () => {
    tabList.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Update arrow visibility based on scroll position
  function updateArrowVisibility() {
    const { scrollLeft, scrollWidth, clientWidth } = tabList;
    prevArrow.style.opacity = scrollLeft > 0 ? '1' : '0.5';
    nextArrow.classList.toggle('next-highlight', scrollLeft < scrollWidth - clientWidth - 10);
  }

  tabList.addEventListener('scroll', updateArrowVisibility);
  updateArrowVisibility();
}
