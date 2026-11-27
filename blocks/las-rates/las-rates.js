/*
 * LAS rates.
 * Everything is already in the page HTML and styled by las-rates.css. This script only tells the
 * CSS
 * what each row is, by what it holds: a row before the heading is the label, a row after the
 * heading without a list is the banner. The tables are the rows with a list. (The site wraps plain
 * text in <p> once JavaScript runs, so the CSS cannot tell the label from the banner by itself.)
 * Removing a row therefore does not restyle the others.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const headingIndex = rows.findIndex((row) => row.querySelector('h2'));
  rows.forEach((row, index) => {
    if (row.querySelector('h2') || row.querySelector('ul')) return;
    row.classList.add(index < headingIndex ? 'las-rates-label' : 'las-rates-banner');
  });
  block.classList.add('las-rates-ready');
}
