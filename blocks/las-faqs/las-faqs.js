/*
 * LAS FAQs.
 * The page already shows every question and answer without this script (see las-faqs.css), so
 * with JavaScript off nothing is hidden. This script only turns each question + answer into an
 * open/close accordion: the question (Heading 3) goes inside a <summary>, the answer paragraphs
 * follow inside a <details>, and the first FAQ starts open. It also wraps the 4 heading rows in
 * one box (.las-faqs-card) so the blue card can stay in view while the questions scroll.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const cell = rows[4]?.firstElementChild; // row 5 holds the questions and answers
  if (!cell) return;

  const items = [];
  let current = null;

  // Walk the authored content: each Heading 3 starts a new FAQ, what follows is its answer
  [...cell.children].forEach((element) => {
    if (element.tagName === 'H3') {
      current = document.createElement('details');
      const summary = document.createElement('summary');
      summary.append(element); // keeps the heading (and its id) inside the summary
      current.append(summary);
      items.push(current);
    } else if (current) {
      current.append(element);
    }
  });

  if (!items.length) return; // nothing to build, leave the page as authored

  items[0].open = true;
  cell.replaceChildren(...items);

  // Put the 4 heading rows (label, heading, intro, button) in one box, so CSS can draw them as one
  // blue card and keep it in view (sticky) while the questions scroll, as in the design
  const card = document.createElement('div');
  card.className = 'las-faqs-card';
  card.append(...rows.slice(0, 4));
  block.prepend(card);

  block.classList.add('las-faqs-ready');
}
