/*
 * LAS interest.
 * Everything is already in the page HTML and styled by las-interest.css. This script only tells the
 * CSS what each row is, by what it holds: a row before the heading is the label, a row after the
 * heading with no list and no sub-heading is the intro. The steps and the two example rows are
 * found by their lists and the example heading. (The site wraps plain text in <p> once JavaScript
 * runs, so the CSS cannot tell the label from the intro by itself.) Removing a row therefore does
 * not restyle the others.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const headingIndex = rows.findIndex((row) => row.querySelector('h2'));
  rows.forEach((row, index) => {
    if (row.querySelector('h2, h3, ul')) return;
    row.classList.add(index < headingIndex ? 'las-interest-label' : 'las-interest-intro');
  });
  block.classList.add('las-interest-ready');
}
