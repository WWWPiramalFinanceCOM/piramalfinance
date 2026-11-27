/*
 * LAS intro.
 * The page already shows everything without this script (see las-intro.css). The script groups the
 * rows so the text and the card can sit side by side on wide screens, and tells CSS what each
 * row is:
 *   rows before the heading                       -> label        (copy)
 *   rows after the heading                        -> body         (copy)
 *   a short plain-text row right before the steps -> card label   (card)
 *   the steps row                                 -> steps        (card)
 * The rows are found by what they hold, so removing a row does not break the grouping.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const headingIndex = rows.findIndex((row) => row.querySelector('h2'));
  const stepsIndex = rows.findIndex((row) => row.querySelector('ul'));
  if (stepsIndex < 0) {
    // No steps: show just the text. Empty rows and a short leftover card label are hidden
    const lastText = rows.map((row) => row.textContent.trim().length > 0).lastIndexOf(true);
    rows.forEach((row, index) => {
      const text = row.textContent.trim();
      const leftoverLabel = index === lastText && index > headingIndex + 1 && text.length < 40;
      if (!text || leftoverLabel) row.hidden = true;
      else if (index < headingIndex) row.className = 'las-intro-label';
      else if (index > headingIndex) row.className = 'las-intro-body';
    });
    return;
  }

  // The card label is the row right before the steps: after the heading, no list, and short text
  // (a short line, so it is not mistaken for the body when the body has been removed)
  const before = rows[stepsIndex - 1];
  const isCardLabel = before && stepsIndex - 1 > headingIndex
    && (stepsIndex - 1 > headingIndex + 1 || before.textContent.trim().length < 40);
  const cardStart = isCardLabel ? stepsIndex - 1 : stepsIndex;

  rows.forEach((row, index) => {
    if (index === headingIndex || index === stepsIndex) return;
    if (index === cardStart && isCardLabel) row.className = 'las-intro-cardlabel';
    else row.className = index < headingIndex ? 'las-intro-label' : 'las-intro-body';
  });

  const copy = document.createElement('div');
  copy.className = 'las-intro-copy';
  rows.slice(0, cardStart).forEach((row) => copy.append(row));

  const card = document.createElement('div');
  card.className = 'las-intro-card';
  rows.slice(cardStart).forEach((row) => card.append(row));

  block.append(copy, card);
  block.classList.add('las-intro-ready');
}
