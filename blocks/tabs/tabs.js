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

  // Update aria-selected and tabindex for all tabs
  tabMenu.querySelectorAll('[role="tab"]').forEach((t) => {
    t.setAttribute('aria-selected', 'false');
    t.setAttribute('tabindex', '-1');
  });

  target.setAttribute('aria-selected', 'true');
  target.setAttribute('tabindex', '0');

  tabContent.querySelectorAll('[role="tabpanel"]').forEach((p) => p.classList.remove('active'));

  tabContent.parentNode.querySelector(`#${target.getAttribute('aria-controls')}`).classList.add('active');
}

// Fix WCAG 2.1.1: Keyboard navigation for tabs
function handleTabKeydown(e) {
  const tab = e.target;
  const tabList = tab.parentNode;
  const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
  const index = tabs.indexOf(tab);

  let newIndex;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    newIndex = (index + 1) % tabs.length;
    e.preventDefault();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    newIndex = (index - 1 + tabs.length) % tabs.length;
    e.preventDefault();
  } else if (e.key === 'Home') {
    newIndex = 0;
    e.preventDefault();
  } else if (e.key === 'End') {
    newIndex = tabs.length - 1;
    e.preventDefault();
  }

  if (newIndex !== undefined) {
    tabs[newIndex].focus();
    tabs[newIndex].click();
  }
}

function initTabs(block) {
  const tabs = block.querySelectorAll('[role="tab"]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', changeTabs);
    tab.addEventListener('keydown', handleTabKeydown);
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
      tabindex: i === 0 ? '0' : '-1',
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
}
