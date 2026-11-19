/*
 * LAS in-page tabs.
 * The links already work without this script. The script only highlights the tab
 * of the section that is currently on screen.
 */
export default function decorate(block) {
  const links = [...block.querySelectorAll('a[href^="#"]')];

  // Pair each link with the heading it points to (skip links whose target is missing)
  const targets = links
    .map((link) => ({ link, target: document.getElementById(link.getAttribute('href').slice(1)) }))
    .filter((item) => item.target);

  block.classList.add('las-tabs-ready');
  if (!targets.length || !('IntersectionObserver' in window)) return;

  const setActive = (activeLink) => {
    links.forEach((link) => link.classList.toggle('is-active', link === activeLink));
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
