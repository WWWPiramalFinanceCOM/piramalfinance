/*
 * LAS intro.
 * The page already shows everything without this script (see las-intro.css). The script only
 * groups the rows so the text and the card can sit side by side on wide screens:
 *   rows 1-3 (label, heading, body) -> .las-intro-copy
 *   rows 4-5 (card label, steps)    -> .las-intro-card
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 5) return; // not fully authored yet, leave as is

  const copy = document.createElement('div');
  copy.className = 'las-intro-copy';
  rows.slice(0, 3).forEach((row) => copy.append(row));

  const card = document.createElement('div');
  card.className = 'las-intro-card';
  rows.slice(3).forEach((row) => card.append(row));

  block.append(copy, card);
  block.classList.add('las-intro-ready');
}
