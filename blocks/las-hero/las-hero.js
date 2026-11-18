/*
 * LAS hero.
 * All the content is already in the page HTML and styled by las-hero.css.
 * This script only improves the layout: it puts the "check your limit" rows into a card.
 *
 * Row order (see las-hero.css): rows 9, 10 and 11 are the card heading, text and fallback button.
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 11) return; // not fully authored yet, leave the page as it is

  const card = document.createElement('div');
  card.className = 'las-hero-card';
  rows.slice(8).forEach((row) => card.append(row));
  block.append(card);

  // TODO (Day 5-6): mount the apply loan form inside the card, below the heading text,
  // and hide the fallback button once the form has loaded.

  block.classList.add('las-hero-ready');
}
