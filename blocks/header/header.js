/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
/* eslint-disable max-len */
import { headerInteraction, navlogin } from '../../dl.js';
import { autoLinkLangPath, decorateIcons, fetchPlaceholders, getMetadata, loadBlocks } from '../../scripts/aem.js';
import { decorateMain, targetObject } from '../../scripts/scripts.js';
import { body } from '../../scripts/common.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 1201px)');

/**
 *
 * @param {Element} navSection
 */
const wrapListUE = (navSection) => {
  const p = document.createElement('p');
  if (!window.isEditor) return;
  if (navSection.firstElementChild.tagName !== 'P') {
    p.append(...[...navSection.childNodes].filter((n) => n.tagName !== 'UL'));
    navSection.prepend(p);
  }
  navSection.querySelectorAll(':scope > ul > li:not(:has( > a))').forEach((subSection) => {
    const icon = subSection.firstChild;
    const text = subSection.firstChild.nextSibling;
    const p2 = document.createElement('p');
    if (subSection.childNodes.length === 3) {
      p2.append(icon, text);
      subSection.prepend(p2);
    } else if (
      subSection.lastElementChild
      && subSection.lastElementChild.tagName !== 'UL'
      && subSection.lastElementChild.tagName !== 'P'
    ) {
      p2.append(...subSection.childNodes);
      subSection.prepend(p2);
    } else if (subSection.lastElementChild && subSection.lastElementChild.tagName === 'UL') {
      p2.append(...[...subSection.childNodes].filter((n) => n.tagName !== 'UL'));
      subSection.prepend(p2);
    }
  });
  // }else{
  //   p.append(...subSection.childNodes);
  //   navSection.prepend(p2);
  // }
};

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
export function toggleAllNavSections(sections, expanded = false) {
  sections
    ?.querySelectorAll('.nav-sections .default-content-wrapper > ul > li')
    .forEach((section) => {
      // opening the mobile menu must not also open the Login dropdown (it has its own toggle)
      if (section.classList.contains('login-drop') && String(expanded) === 'true') return;
      // section.classList.toggle('active');
      section.setAttribute('aria-expanded', expanded);
    });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections?.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops?.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops?.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > :where(a,p)');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
    } while (menuItem);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  const placeholders = await fetchPlaceholders();
  const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';

  crumbs.unshift({ title: homePlaceholder, url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(
    document.querySelector('.nav-sections'),
    document.location.href,
  );

  const ol = document.createElement('ol');
  ol.append(
    ...crumbs.map((item) => {
      const li = document.createElement('li');
      if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
      if (item.url) {
        const a = document.createElement('a');
        a.href = item.url;
        a.textContent = item.title;
        li.append(a);
      } else {
        li.textContent = item.title;
      }
      return li;
    }),
  );

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * Shows a Login dropdown link as a title with a "Know more" line under it.
 * The whole row still links to the same page as before.
 * @param {Element} item The <li> holding a single link
 */
function showTitleWithKnowMore(item) {
  const link = item.querySelector(':scope > a');
  if (!link) return;
  const title = link.textContent.trim();
  link.dataset.trackText = title; // analytics keeps using the real title, not "Know more"
  link.setAttribute('aria-label', `${title} - Know more`);
  link.innerHTML = `<span class="login-item-title">${title}</span><span class="login-item-more">Know more</span>`;
}

/**
 * Moves the "Existing Customers" journey links out of Customer Support (or wherever
 * authored) into the Login dropdown. The "Existing Customers" label itself is dropped.
 * @param {Element} nav The nav element
 * @param {Element} loginNav The Login top-level list item
 */
function moveExistingCustomerLinks(nav, loginNav) {
  if (!loginNav) return;
  const isLabel = (li) => /^existing\s+customers?$/i.test(getDirectTextContent(li).replace(/\s+/g, ' ').trim());
  const source = [...nav.querySelectorAll('li')].find(
    (li) => !loginNav.contains(li) && li.querySelector(':scope > ul') && isLabel(li),
  );
  if (!source) return;
  let loginList = loginNav.querySelector(':scope > ul');
  if (!loginList) {
    loginList = document.createElement('ul');
    loginNav.append(loginList);
  }
  const items = [...source.querySelectorAll(':scope > ul > li')];
  items.forEach((item) => {
    showTitleWithKnowMore(item);
    loginList.append(item);
  });
  // drop the now-empty Existing Customers entry from its old location
  if (!source.querySelector(':scope > ul > li')) source.remove();
}

/**
 * Login: the button keeps its original behaviour (click on "Login" follows the Login link).
 * Desktop: hovering opens the dropdown of Existing Customers links.
 * Any device: the chevron next to Login toggles it (this is how touch devices open it).
 * @param {Element} loginNav The Login top-level list item
 * @param {Element} navSections The nav sections container
 * @param {Function} onClick Called on every Login click (suppresses hover analytics)
 */
function setupLoginDropdown(loginNav, navSections, onClick) {
  if (!loginNav) return;
  loginNav.addEventListener('click', () => {
    onClick();
    navlogin(targetObject.pageName);
  });
  if (!loginNav.querySelector(':scope > ul > li')) return;
  loginNav.classList.add('login-drop');

  const arrow = document.createElement('span');
  arrow.className = 'login-arrow';
  arrow.setAttribute('role', 'button');
  arrow.tabIndex = 0;
  arrow.setAttribute('aria-label', 'Show login options');
  arrow.setAttribute('aria-haspopup', 'true');
  arrow.setAttribute('aria-expanded', 'false');
  (loginNav.querySelector(':scope > p > a') || loginNav.querySelector(':scope > p') || loginNav).append(arrow);

  const setOpen = (open) => {
    if (isDesktop.matches && open) toggleAllNavSections(navSections); // collapse the other menus first
    loginNav.setAttribute('aria-expanded', open ? 'true' : 'false');
    arrow.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (isDesktop.matches) {
      // desktop dropdown dims the page like the other menus
      navSections.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.classList.toggle('modal-open', open);
    }
  };
  const isOpen = () => loginNav.getAttribute('aria-expanded') === 'true';

  arrow.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation(); // not a Login click: no navigation, no login analytics
    setOpen(!isOpen());
  });
  arrow.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      setOpen(!isOpen());
    }
  });
  loginNav.addEventListener('mouseenter', () => { if (isDesktop.matches) setOpen(true); });
  loginNav.addEventListener('mouseleave', () => { if (isDesktop.matches) setOpen(false); });
  document.addEventListener('click', (e) => {
    if (isOpen() && !loginNav.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && isOpen()) setOpen(false);
  });
  // leaving the desktop/mobile breakpoint resets the open state
  isDesktop.addEventListener('change', () => setOpen(false));
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.piramal.app.pchf';
const APP_STORE_URL = 'https://apps.apple.com/in/app/piramal-finance/id1570115348';

/**
 * Fixes links that were pasted from the AEM author instance: a link to the nav page itself
 * (a heading, not a page) no longer goes anywhere, any other author link points to the same path on the live site.
 * @param {Element} root The nav element to clean
 */
function fixAuthorLinks(root) {
  root.querySelectorAll('a[href*="adobeaemcloud.com"]').forEach((link) => {
    const url = new URL(link.href);
    if (url.pathname.endsWith('/nav.html')) {
      // keep the link so it looks the same, but never leave the page
      link.setAttribute('href', '#');
      link.addEventListener('click', (event) => event.preventDefault());
    }
    else link.setAttribute('href', url.pathname + url.search);
  });
}

/**
 * Reshapes a copy of the desktop /nav list into the layout the mobile menu is styled for:
 *  - "Loan Products" also holds the standalone links (Branch Locator, Credit Report, Calculators)
 *  - a column without a heading becomes an "Other Products" accordion (or plain rows if it has 1-2 links)
 *  - the remaining sections (About us, Investors, Customer Support) sit in a second list inside Loan Products
 *  - the last item (Login) is dropped, it already sits in the header bar
 * @param {Element} menu The copied .default-content-wrapper
 */
function buildMobileMenu(menu) {
  const list = menu.querySelector(':scope > ul');
  if (!list) return;
  const items = [...list.children];
  items.pop(); // Login

  const hasHeading = (li) => li.querySelector(':scope > p, :scope > a');
  const hasSubmenu = (li) => li.querySelector(':scope > ul');
  const iconFor = { 'about us': 'about-us', 'credit report': 'credit-report', calculators: 'calculator' };
  const makeIcon = (name) => {
    const holder = document.createElement('div');
    holder.innerHTML = `<span class="icon icon-${name}"></span>`;
    decorateIcons(holder); // only the new icon, the others are already decorated
    return holder.firstElementChild;
  };
  const addIcon = (li) => {
    const row = li.querySelector(':scope > p');
    const name = iconFor[row?.textContent.replace(/free/i, '').trim().toLowerCase()];
    if (!name || row.querySelector('.icon')) return;
    const link = row.querySelector('a');
    if (link) row.insertBefore(makeIcon(name), link); else row.prepend(makeIcon(name));
  };
  // a row is a single link with its icon inside it (the style the mobile menu was built for)
  const styleAsRow = (row) => {
    const link = row?.querySelector(':scope > a');
    if (!link || row.querySelector('sup')) return;
    const icon = row.querySelector(':scope > .icon');
    if (icon) link.prepend(icon);
    row.classList.add('button-container');
    link.classList.add('button');
  };

  const firstSection = items.find(hasSubmenu); // Loan Products
  const productList = firstSection?.querySelector(':scope > ul');
  const firstSectionIndex = items.indexOf(firstSection);
  const otherList = document.createElement('ul');

  if (productList) {
    // a column with no heading: group many links, show few links as plain rows
    [...productList.children].filter((li) => !hasHeading(li) && hasSubmenu(li)).forEach((column) => {
      const links = [...column.querySelectorAll(':scope > ul > li')];
      if (links.length > 2) {
        const title = document.createElement('p');
        title.append(makeIcon('other-products'), 'Other Products');
        column.prepend(title);
      } else {
        links.forEach((li) => {
          const row = document.createElement('li');
          const p = document.createElement('p');
          p.append(...li.childNodes);
          styleAsRow(p);
          row.append(p);
          column.before(row);
        });
        column.remove();
      }
    });
  }

  // Home Loan / Business Loans: a heading row that opens a submenu
  productList?.querySelectorAll(':scope > li > p').forEach(styleAsRow);

  items.forEach((li, i) => {
    if (li === firstSection) return;
    addIcon(li);
    if (!hasSubmenu(li)) styleAsRow(li.querySelector(':scope > p'));
    // standalone links before the next section belong under Loan Products
    if (i > firstSectionIndex && !hasSubmenu(li) && !otherList.children.length && productList) productList.append(li);
    else otherList.append(li);
  });

  // mobile-only extras that are not authored in /nav (skipped once an author adds them)
  const hasLink = (part) => menu.querySelector(`a[href*="${part}"]`);
  if (productList && !hasLink('help.piramalfinance.com/company')) {
    const company = document.createElement('li');
    company.innerHTML = '<p><a href="https://help.piramalfinance.com/company" title="Company">Company</a></p>';
    styleAsRow(company.firstElementChild);
    productList.append(company);
  }

  // same shape as the old mobile menu: Loan Products holds the rows list, then the sections list
  firstSection?.append(otherList);
  list.replaceChildren(...(firstSection ? [firstSection] : []));

  // "Download Piramal Finance" app badges, shown as a second list under the sections
  if (!hasLink('play.google.com') && !hasLink('apps.apple.com')) {
    const downloadList = document.createElement('ul');
    downloadList.innerHTML = `<li>
      <p>Download Piramal Finance</p>
      <ul>
        <li><a href="${PLAY_STORE_URL}" title="Get it on Google Play"><img src="${window.hlx.codeBasePath}/images/playstore.webp" alt="Get it on Google Play" loading="lazy"></a></li>
        <li><a href="${APP_STORE_URL}" title="Download on the App Store"><img src="${window.hlx.codeBasePath}/images/appstore.webp" alt="Download on the App Store" loading="lazy"></a></li>
      </ul>
    </li>`;
    menu.append(downloadList);
  }

  // a deep heading that opens a submenu is plain text on mobile (tapping it opens the submenu)
  menu.querySelectorAll('li li li > p').forEach((row) => {
    const link = row.querySelector(':scope > a');
    if (link && row.nextElementSibling?.tagName === 'UL') link.replaceWith(...link.childNodes);
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const path = getMetadata('nav') || '/nav';
  if (path.endsWith('/nav')) {
    document.querySelector('header').classList.add('primary');
  }
  // const fragment = await loadFragment(path);
  const headerEl = block.parentElement;
  const inlined = headerEl.firstElementChild !== block;
  let fragment;

  if (inlined) {
    fragment = document.createElement('main');
    while (headerEl.firstElementChild && headerEl.firstElementChild !== block) {
      fragment.appendChild(headerEl.firstElementChild);
    }
    decorateMain(fragment);
    await loadBlocks(fragment);
  } else {
    fragment = await loadFragment(path);
  }
  block.classList.add('dp-none');
  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  if (path.includes('/neeyat/')) {
    block.classList.remove('header');
    block.classList.add('header-neeyat-nav');
    // return block;
  }

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const navtools = nav.querySelector('.nav-tools');

  const a = document.createElement('a');
  const image = navBrand.querySelector('picture');
  a.append(image);
  a.setAttribute('href', '/');
  navBrand.append(a);
  autoLinkLangPath(a);
  navBrand.replaceChild(a, navBrand.firstElementChild);
  let loginFlag = true;
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) fixAuthorLinks(navSections);
  // One menu for desktop and mobile: copy the authored /nav list before the desktop
  // code below changes it, and use the copy for the hamburger menu.
  const mobileMenuSource = navSections?.querySelector('.default-content-wrapper')?.cloneNode(true);
  if (navSections) {
    const topItems = navSections.querySelectorAll(':scope .default-content-wrapper > ul > li');
    const loginNav = topItems[topItems.length - 1];
    moveExistingCustomerLinks(nav, loginNav);
    if (loginNav?.querySelector('ul')) wrapListUE(loginNav);
    setupLoginDropdown(loginNav, navSections, () => { loginFlag = false; });
    navSections
      .querySelectorAll(':scope .default-content-wrapper > ul > li:has(ul)')
      .forEach((navSection) => {
        // Login has its own hover/click handling (setupLoginDropdown)
        if (navSection === loginNav) return;
        wrapListUE(navSection);
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('mouseenter', (e) => {
          // debugger;
          if (isDesktop.matches) {
            if (loginFlag) {
              try {
                let click_text = '';
                if (e.target.tagName == 'IMG' || e.target.querySelector('icon-language')) {
                  click_text = e.target.getAttribute('data-icon-name');
                } else {
                  click_text = e.target.textContent.trim();
                }
                const menu_category = e.target.closest('ul').closest('li')?.querySelector('p')?.innerText || '';
                targetObject.ctaPosition = 'Top Menu Bar';
                headerInteraction(click_text, menu_category, targetObject.ctaPosition, targetObject.pageName);
              } catch (error) {
                console.warn(error);
              }
            }
            loginFlag = true;
            // const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            if (navSection.classList.contains('nav-drop')) {
              // navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
              // navSections.setAttribute('aria-expanded', expanded ? 'false' : 'true');
              navSection.setAttribute('aria-expanded', 'true');
              navSections.setAttribute('aria-expanded', 'true');
              body.classList.add('modal-open');
              // if (expanded) {
              //   body.classList.remove('modal-open');
              // } else {
              //   body.classList.add('modal-open');
              // }
            }
            // else {
            //   body.classList.remove('modal-open');
            //   navSection.setAttribute('aria-expanded', 'false');
            //   navSections.setAttribute('aria-expanded', 'false');
            // }
          }
        });
        navSection.addEventListener('mouseleave', (e) => {
          if (isDesktop.matches) {
            if (loginFlag) {
              try {
                let click_text = '';
                if (e.target.tagName == 'IMG' || e.target.querySelector('icon-language')) {
                  click_text = e.target.getAttribute('data-icon-name');
                } else {
                  click_text = e.target.textContent.trim();
                }
                const menu_category = e.target.closest('ul').closest('li')?.querySelector('p')?.innerText || '';
                targetObject.ctaPosition = 'Top Menu Bar';
                headerInteraction(click_text, menu_category, targetObject.ctaPosition, targetObject.pageName);
              } catch (error) {
                console.warn(error);
              }
            }
            loginFlag = true;
            if (navSection.classList.contains('nav-drop')) {
              // navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
              // navSections.setAttribute('aria-expanded', expanded ? 'false' : 'true');
              navSection.setAttribute('aria-expanded', 'false');
              navSections.setAttribute('aria-expanded', 'false');
              body.classList.remove('modal-open');
            }
          }
        });
      });
    navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
      buttonContainer.classList.remove('button-container');
      buttonContainer.querySelector('.button').classList.remove('button');
    });
  }

  try {
    if (isDesktop.matches) {
      navSections
        .querySelectorAll(':scope .default-content-wrapper > ul >li:has(ul li)')
        .forEach((navSection) => {
          if (navSection?.querySelector(':scope >ul >li >ul >li')) {
            const ul = navSection.querySelector('ul');
            // const subul = ul.querySelectorAll(":scope >li");
            const liLenght = ul.children.length;
            if (liLenght < 5) {
              ul.style.gridTemplateColumns = `repeat(${liLenght}, minmax(0, 1fr))`;
            } else {
              ul.style.gridTemplateColumns = `repeat(4, minmax(0, 1fr))`;
            }
          }
        });
    }
  } catch (error) {
    console.log(error);
  }

  // Setup nested expandable items in desktop dropdown
  function setupNestedToggle(navSections) {
    if (!isDesktop.matches) return;

    // Find all third-level items that have nested ul (4th level)
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li > ul > li > ul > li:has(> ul)').forEach((nestedItem) => {
      // Add class for stylingse
      nestedItem.classList.add('nav-nested-toggle');
      nestedItem.setAttribute('aria-expanded', 'false');

      // Get the clickable element (p or a)
      const clickableEl = nestedItem.querySelector(':scope > p') || nestedItem.querySelector(':scope > a');
      if (clickableEl) {
        clickableEl.style.cursor = 'pointer';
        clickableEl.addEventListener('click', (e) => {
          // Prevent navigation if it's the toggle trigger
          if (nestedItem.querySelector(':scope > ul')) {
            e.preventDefault();
            e.stopPropagation();

            const isExpanded = nestedItem.getAttribute('aria-expanded') === 'true';
            // Collapse ALL other nested items across the entire dropdown (not just same column)
            const topLevelDropdown = nestedItem.closest('.nav-sections .default-content-wrapper > ul > li[aria-expanded="true"]');
            if (topLevelDropdown) {
              topLevelDropdown.querySelectorAll('.nav-nested-toggle[aria-expanded="true"]').forEach((item) => {
                if (item !== nestedItem) {
                  item.setAttribute('aria-expanded', 'false');
                }
              });
            }

            // Toggle current item
            nestedItem.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');

            try {
              const click_text = clickableEl.textContent.trim();
              const menu_category = nestedItem.closest('ul').closest('li')?.querySelector('p')?.textContent.trim() || '';
              targetObject.ctaPosition = 'Top Menu Bar';
              headerInteraction(click_text, menu_category, targetObject.ctaPosition, targetObject.pageName);
            } catch (error) {
              console.warn(error);
            }
          }
        });
      }
    });
  }

  // Initial setup for nested toggle
  setupNestedToggle(navSections);

  // Track clicks on leaf submenu links (e.g. "Construction Loan") that don't expand further
  navSections.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor || !anchor.closest('li.nav-drop')) return;
    const leafLi = anchor.closest('li');
    if (leafLi.querySelector(':scope > ul')) return; // handled by nested-toggle click instead
    try {
      const click_text = anchor.dataset.trackText || anchor.textContent.trim();
      const menu_category = leafLi.closest('ul')?.closest('li')?.querySelector('p')?.textContent.trim() || '';
      targetObject.ctaPosition = isDesktop.matches ? 'Top Menu Bar' : 'Hamburger';
      headerInteraction(click_text, menu_category, targetObject.ctaPosition, targetObject.pageName);
    } catch (error) {
      console.warn(error);
    }
  });

  // Re-setup nested toggle when nav section is expanded
  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li.nav-drop').forEach((navDrop) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'aria-expanded') {
          const expanded = navDrop.getAttribute('aria-expanded') === 'true';
          if (expanded) {
            // Reset nested toggles when dropdown opens
            navDrop.querySelectorAll('.nav-nested-toggle').forEach((item) => {
              item.setAttribute('aria-expanded', 'false');
            });
          }
        }
      });
    });
    observer.observe(navDrop, { attributes: true });
  });

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  let mobFragment = null;
  hamburger.addEventListener('click', async (e) => {
    if (!mobFragment) {
      // Use the /nav menu; only fall back to the old mobilenav page if /nav has no menu list
      let mobNav = mobileMenuSource;
      if (!mobNav) {
        mobFragment = await loadFragment(getMetadata('mobilenav'));
        mobNav = mobFragment.querySelector('.default-content-wrapper');
      } else {
        buildMobileMenu(mobNav); // /nav copy: reshape it for mobile
      }
      mobFragment = mobNav;
      // "Existing Customers" lives only under the Login dropdown, same as desktop
      mobNav.querySelectorAll('li').forEach((li) => {
        if (/^existing\s+customers?$/i.test(getDirectTextContent(li).replace(/\s+/g, ' ').trim())) li.remove();
      });
      mobNav.classList.add('desk-dp-none');
      navBrand.prepend(mobNav);
      // navSections.prepend(mobFragment.lastElementChild.lastElementChild);
      mobNav.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        wrapListUE(navSection);
      });

      // Function to setup nested expandable items recursively
      function setupMobileNestedToggle(parentEl) {
        // Find all li elements that have a ul child (at any level)
        parentEl.querySelectorAll('li:has(> ul)').forEach((liWithUl) => {
          const nestedUl = liWithUl.querySelector(':scope > ul');
          if (!nestedUl) return;

          // Mark as expandable
          nestedUl.setAttribute('aria-expanded', 'false');
          liWithUl.setAttribute('aria-expanded', 'false');

          // Add class to identify nested toggle items
          if (liWithUl.closest('ul > li > ul > li > ul')) {
            liWithUl.classList.add('mob-nested-toggle');
          }

          // Get the clickable element (p or a or direct text)
          let clickableEl = liWithUl.querySelector(':scope > p') || liWithUl.querySelector(':scope > a');

          if (clickableEl) {
            clickableEl.style.cursor = 'pointer';

            // Remove existing listeners to avoid duplicates
            const newClickableEl = clickableEl.cloneNode(true);
            clickableEl.parentNode.replaceChild(newClickableEl, clickableEl);
            clickableEl = newClickableEl;

            clickableEl.addEventListener('click', (evt) => {
              // evt.preventDefault();
              // evt.stopPropagation();
              if (evt.target.tagName === 'A') return;
              const expanded = nestedUl.getAttribute('aria-expanded') === 'true';

              // Calculate proper height including nested content
              if (!expanded) {
                // First set to auto to get the full height
                nestedUl.style.maxHeight = 'none';
                const fullHeight = nestedUl.scrollHeight;
                nestedUl.style.maxHeight = '0px';
                // Force reflow
                nestedUl.offsetHeight; // eslint-disable-line no-unused-expressions
                nestedUl.style.maxHeight = `${fullHeight}px`;
              } else {
                nestedUl.style.maxHeight = '0px';
              }

              nestedUl.setAttribute('aria-expanded', expanded ? 'false' : 'true');
              liWithUl.setAttribute('aria-expanded', expanded ? 'false' : 'true');
              clickableEl.classList.toggle('navlist-dropdown');

              // Update parent ul heights when nested items expand/collapse
              let parentUl = liWithUl.closest('ul');
              while (parentUl && parentUl.hasAttribute('aria-expanded')) {
                if (parentUl.getAttribute('aria-expanded') === 'true') {
                  parentUl.style.maxHeight = 'none';
                }
                parentUl = parentUl.parentElement?.closest('ul');
              }

              try {
                const click_text = clickableEl.textContent.trim();
                const menu_category = liWithUl.closest('ul')?.closest('li')?.querySelector('p')?.textContent.trim() || '';
                targetObject.ctaPosition = 'Hamburger';
                headerInteraction(click_text, menu_category, targetObject.ctaPosition, targetObject.pageName);
              } catch (error) {
                console.warn(error);
              }
            });
          }
        });
      }

      // Setup nested toggle for all levels in mobile nav
      setupMobileNestedToggle(mobNav);

      // Track clicks on leaf submenu links (e.g. "Construction Loan") in mobile nav
      mobNav.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (!anchor) return;
        const leafLi = anchor.closest('li');
        if (!leafLi || leafLi.querySelector(':scope > ul')) return; // handled by nested-toggle click instead
        try {
          const click_text = anchor.textContent.trim();
          const menu_category = leafLi.closest('ul')?.closest('li')?.querySelector('p')?.textContent.trim() || '';
          targetObject.ctaPosition = 'Hamburger';
          headerInteraction(click_text, menu_category, targetObject.ctaPosition, targetObject.pageName);
        } catch (error) {
          console.warn(error);
        }
      });
    }
    toggleMenu(nav, navSections);
  });
  nav.prepend(hamburger);

  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Intercept investor corner nav links to redirect to financial-reports with category
  // Path is dynamic — stored by the financial-results-report block in localStorage
  const categoryMap = {
    '/stakeholders/quarterly-results-pfl': 'quarterly-results',
    '/stakeholders/equity-investor-presentation': 'equity-investor-presentation',
    '/stakeholders/debt-investors-presentation': 'debt-investor-presentation',
    '/stakeholders/annual-reports': 'annual-reports',
  };
  nav.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    const matchedCategory = Object.keys(categoryMap).find((p) => href.includes(p));
    if (matchedCategory) {
      const financialResultsPath = localStorage.getItem('financial-reports-page');
      if (!financialResultsPath) return; // block page not yet visited, let default nav work
      e.preventDefault();
      const category = categoryMap[matchedCategory];
      sessionStorage.setItem('fr-selected-category', category);
      window.location.href = `${financialResultsPath}?category=${encodeURIComponent(category)}`;
    }
  });

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }
  const mobileSections = document.querySelector('.nav-sections .default-content-wrapper');
  const mobileLogo = a.cloneNode(true);
  mobileLogo.classList.add('mobile-logo');
  mobileSections?.prepend(mobileLogo);
  block.classList.remove('dp-none');


  try {
    if (getMetadata('category-type') === 'retails-finance') {
      navtools.querySelectorAll('li')[0].classList.add('active');
    } else {
      navtools.querySelectorAll('li')[1].classList.add('active');
    }
  } catch (error) {
    console.warn(error);
  }

}
