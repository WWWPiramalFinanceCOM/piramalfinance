/*
 * LAS in-page tabs.
 * The links already work without this script. The script only highlights the tab
 * of the section that is currently on screen, and shares the height of the fixed site header.
 */
export default function decorate(block) {
  // The site header is fixed to the top of the screen, so sticky things (this bar, the FAQ card)
  // and anchor jumps must start below it. Measure it and share its height as --las-header-height.
  const header = document.querySelector('header');
  const setHeaderHeight = () => {
    const nav = document.querySelector('header .nav-wrapper') || header;
    const height = nav ? nav.offsetHeight : 0;
    document.documentElement.style.setProperty('--las-header-height', `${height}px`);
  };
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
  window.addEventListener('load', setHeaderHeight);
  // The header is added to the page by JavaScript a little later, so measure again when it appears
  if (header) {
    new MutationObserver(setHeaderHeight).observe(header, { childList: true, subtree: true });
  }

  const links = [...block.querySelectorAll('a[href^="#"]')];

  // Pair each link with the heading it points to (skip links whose target is missing)
  const targets = links
    .map((link) => ({ link, target: document.getElementById(link.getAttribute('href').slice(1)) }))
    .filter((item) => item.target);

  block.classList.add('las-tabs-ready');

  // With many tabs the bar scrolls sideways. A soft fade on the edge shows there is more to see
  const bar = block.querySelector('ul');
  const updateFade = () => {
    if (!bar) return;
    block.classList.toggle('las-tabs-more-left', bar.scrollLeft > 2);
    block.classList.toggle('las-tabs-more-right', bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 2);
  };
  if (bar) {
    bar.addEventListener('scroll', updateFade, { passive: true });
    window.addEventListener('resize', updateFade);
    updateFade();
  }

  // Scroll the bar (not the page) so the active tab is always visible
  const showTab = (link) => {
    const item = link.closest('li');
    if (!bar || !item) return;
    const pad = 24;
    if (item.offsetLeft < bar.scrollLeft + pad) {
      bar.scrollTo({ left: item.offsetLeft - pad, behavior: 'smooth' });
    } else if (item.offsetLeft + item.offsetWidth > bar.scrollLeft + bar.clientWidth - pad) {
      bar.scrollTo({ left: item.offsetLeft + item.offsetWidth - bar.clientWidth + pad, behavior: 'smooth' });
    }
  };

  if (!targets.length || !('IntersectionObserver' in window)) return;

  const setActive = (activeLink) => {
    links.forEach((link) => link.classList.toggle('is-active', link === activeLink));
    if (activeLink) showTab(activeLink);
  };
  setActive(links[0]);

  // A section counts as "current" while its heading is in the top part of the screen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActive(targets.find((item) => item.target === entry.target).link);
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  targets.forEach((item) => observer.observe(item.target));
}
