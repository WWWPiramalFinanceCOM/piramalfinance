/*
 * LAS cards.
 * Everything is already in the page HTML and styled by las-cards.css. This script only tells the
 * CSS
 * what each row is, by what it holds: a row before the heading is the label, a row after the
 * heading that is not the list is the intro. (The site wraps plain text in <p> once JavaScript
 * runs,
 * so the CSS cannot tell the label from the intro by itself.) Removing a row therefore does not
 * restyle the others.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const headingIndex = rows.findIndex((row) => row.querySelector('h2'));
  rows.forEach((row, index) => {
    if (row.querySelector('h2') || row.querySelector('ul')) return;
    row.classList.add(index < headingIndex ? 'las-cards-label' : 'las-cards-intro');
  });
  block.classList.add('las-cards-ready');
}
