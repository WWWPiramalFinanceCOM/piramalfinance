/*
 * LAS steps.
 * Everything is already in the page HTML and styled by las-steps.css. This script only tells the
 * CSS
 * what each plain-text row is: a row before the heading is the label, a row after the heading that
 * is not a list or a link is the intro. (The site wraps plain text in <p> once JavaScript runs, so
 * the CSS cannot tell them apart by itself.) The rest is found by what it holds, so removing a row
 * does not restyle the others.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const headingIndex = rows.findIndex((row) => row.querySelector('h2'));
  rows.forEach((row, index) => {
    if (row.querySelector('h2, ul, a')) return;
    row.classList.add(index < headingIndex ? 'las-steps-label' : 'las-steps-intro');
  });
  block.classList.add('las-steps-ready');
}
