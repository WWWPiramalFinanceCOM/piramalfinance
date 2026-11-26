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

  if (!targets.length) return;

  const setActive = (activeLink) => {
    links.forEach((link) => link.classList.toggle('is-active', link === activeLink));
    if (activeLink) showTab(activeLink);
  };
  setActive(links[0]);

  // The current section is the one whose heading is nearest above a line a little under the sticky
  // bars (the FAQ heading sits lower, inside its sticky card). At the very bottom of the page the
  // last section is current, because the final sections cannot scroll up to the line. This works
  // however many tabs there are and in any order.
  const section = block.closest('main > div') || block;
  let waiting = false;
  const updateActive = () => {
    waiting = false;
    const line = section.getBoundingClientRect().bottom + 140;
    const tops = targets.map((item) => item.target.getBoundingClientRect().top);
    let current = 0;
    let bestTop = -Infinity;
    tops.forEach((top, index) => {
      if (top <= line && top > bestTop) {
        bestTop = top;
        current = index;
      }
    });
    const pageEnd = document.documentElement.scrollHeight - 4;
    const atBottom = window.innerHeight + window.scrollY >= pageEnd;
    if (atBottom) current = tops.indexOf(Math.max(...tops));
    setActive(targets[current].link);
  };
  const onScroll = () => {
    if (waiting) return;
    waiting = true;
    window.requestAnimationFrame(updateActive);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateActive();
}
