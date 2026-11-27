/*
 * LAS eligibility.
 * Everything is already in the page HTML and styled by las-eligibility.css. This script only tells
 * the CSS which row is the label: a plain-text row before the heading. (The site wraps plain
 * text in
 * <p> once JavaScript runs, so the CSS cannot tell it from other rows by itself.) The heading, the
 * button and the two cards are found by what they hold, so removing a row does not restyle the
 * others.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const headingIndex = rows.findIndex((row) => row.querySelector('h2'));
  rows.forEach((row, index) => {
    if (index < headingIndex && !row.querySelector('a, h3, ul')) {
      row.classList.add('las-eligibility-label');
    }
  });
  block.classList.add('las-eligibility-ready');
}
