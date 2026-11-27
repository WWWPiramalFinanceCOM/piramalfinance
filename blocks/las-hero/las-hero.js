/*
 * LAS hero.
 * All the content is already in the page HTML and styled by las-hero.css. This script improves the
 * layout in two ways:
 *  - it gives every row a class for what it is (found from what the row holds, not from its
 *    row number), so removing a row does not restyle the others;
 *  - it puts the "check your limit" rows into a card. The card starts at the row that holds the
 *    card heading (the H2) and runs to the end of the block.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const titleIndex = rows.findIndex((row) => row.querySelector('h1'));
  const cardStart = rows.findIndex((row) => row.querySelector('h2'));

  let links = 0;
  rows.forEach((row, index) => {
    let role;
    if (index === titleIndex) role = 'title';
    else if (cardStart >= 0 && index >= cardStart) {
      if (row.querySelector('h2')) role = 'cardheading';
      else role = row.querySelector('a') ? 'cardbutton' : 'cardtext';
    } else if (row.querySelector('ul')) {
      if (row.querySelector('strong')) role = 'stats';
      else role = index < titleIndex ? 'breadcrumb' : 'highlights';
    } else if (row.querySelector('a')) {
      links += 1;
      role = links === 1 ? 'primary' : 'secondary';
    } else role = index < titleIndex ? 'tag' : 'intro';
    row.classList.add(`las-hero-r-${role}`);
  });
  block.classList.add('las-hero-roles');

  if (cardStart < 0) return; // no card heading authored yet, leave the page as it is
  const card = document.createElement('div');
  card.className = 'las-hero-card';
  rows.slice(cardStart).forEach((row) => card.append(row));
  block.append(card);

  // TODO (Day 5-6): mount the apply loan form inside the card, below the heading text,
  // and hide the fallback button once the form has loaded.

  block.classList.add('las-hero-ready');
}
