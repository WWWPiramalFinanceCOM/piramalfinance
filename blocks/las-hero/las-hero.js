/*
 * LAS hero.
 * All the content is already in the page HTML and styled by las-hero.css.
 * This script only improves the layout: it puts the "check your limit" rows into a card.
 *
 * The card starts at the row that holds the card heading (the H2) and runs to the end of the block:
 * the heading, the text and the fallback button (see las-hero.css). Finding it by its heading means
 * the card still works if a row above it is removed.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const start = rows.findIndex((row) => row.querySelector('h2'));
  if (start < 0) return; // no card heading authored yet, leave the page as it is

  const card = document.createElement('div');
  card.className = 'las-hero-card';
  rows.slice(start).forEach((row) => card.append(row));
  block.append(card);

  // TODO (Day 5-6): mount the apply loan form inside the card, below the heading text,
  // and hide the fallback button once the form has loaded.

  block.classList.add('las-hero-ready');
}
