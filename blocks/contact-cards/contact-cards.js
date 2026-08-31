import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const ICON_NAMES = ['phone', 'mail', 'whatsapp', 'clock', 'location'];

/** Plain-text label of a cell, ignoring any link href that renders as text. */
function cellLabel(cell) {
  if (!cell) return '';
  const plain = [...cell.children].find(
    (el) => el.tagName !== 'A' && !el.querySelector('a') && el.textContent.trim(),
  );
  if (plain) return plain.textContent.trim();
  const anchor = cell.querySelector('a');
  return (anchor ? anchor.textContent : cell.textContent).trim();
}

/**
 * Read a card row into a flat data object.
 *
 * Each `colN_` field group is its own table cell, so the cells are stable:
 *   0 icon | 1 title | 2 value line | 3 notes | 4 CTA | 5 QR image
 */
function readCard(row) {
  let cells = [...row.children];
  if (cells.length === 1 && cells[0].children.length) cells = [...cells[0].children];
  const [iconC, titleC, valueC, notesC, ctaC, qrC] = cells;

  // col3: value + suffix are the plain lines in order; the link is the <a>.
  const lines = valueC
    ? [...valueC.children].filter((el) => el.tagName === 'P' && el.textContent.trim())
    : [];
  const valueText = lines[0]?.textContent.trim() || (lines.length ? '' : (valueC?.textContent || '').trim());
  const valueSuffix = lines[1]?.textContent.trim() || '';

  return {
    icon: (iconC?.textContent || '').trim().toLowerCase(),
    iconPicture: iconC?.querySelector('picture') || null,
    title: (titleC?.textContent || '').trim(),
    valueText,
    valueSuffix,
    valueHref: valueC?.querySelector('a')?.getAttribute('href') || '',
    notes: notesC && notesC.textContent.trim() ? notesC : null,
    qrPicture: qrC?.querySelector('picture') || null,
    ctaText: cellLabel(ctaC),
    ctaHref: ctaC?.querySelector('a')?.getAttribute('href') || '',
  };
}

/** Derive a tel:/mailto: href from the value when the author left the link blank. */
function autoHref(text) {
  if (!text) return '';
  if (text.includes('@')) return `mailto:${text}`;
  const digits = text.replace(/[^\d+]/g, '');
  if (digits.replace(/\D/g, '').length >= 6) return `tel:${digits}`;
  return '';
}

function optimisedFrom(picture, widths) {
  const img = picture.querySelector('img');
  const optimised = createOptimizedPicture(img.src, img.alt || '', false, widths);
  moveInstrumentation(img, optimised.querySelector('img'));
  return optimised;
}

function buildIcon(data) {
  const wrap = document.createElement('div');
  wrap.className = 'contact-card-icon';
  if (data.iconPicture) {
    wrap.append(optimisedFrom(data.iconPicture, [{ width: '96' }]));
  } else if (ICON_NAMES.includes(data.icon)) {
    const span = document.createElement('span');
    span.className = `icon icon-${data.icon}`;
    wrap.append(span);
  }
  return wrap;
}

function buildValue(data) {
  if (!data.valueText && !data.valueSuffix) return null;
  const p = document.createElement('p');
  p.className = 'contact-card-value';

  if (data.valueText) {
    const href = data.valueHref || autoHref(data.valueText);
    const node = document.createElement(href ? 'a' : 'span');
    if (href) node.href = href;
    else node.className = 'contact-card-value-text';
    node.textContent = data.valueText;
    p.append(node);
  }

  if (data.valueSuffix) {
    const suffix = document.createElement('span');
    suffix.className = 'contact-card-value-suffix';
    suffix.textContent = data.valueText ? ` ${data.valueSuffix}` : data.valueSuffix;
    p.append(suffix);
  }
  return p;
}

function buildCta(data) {
  if (!data.ctaText) return null;
  const a = document.createElement('a');
  a.className = 'contact-card-cta';
  a.textContent = data.ctaText;
  if (data.ctaHref) a.href = data.ctaHref;
  return a;
}

function buildCard(row) {
  const data = readCard(row);
  const li = document.createElement('li');
  li.className = 'contact-card';
  moveInstrumentation(row, li);

  li.append(buildIcon(data));

  const content = document.createElement('div');
  content.className = 'contact-card-content';

  if (data.title) {
    const h3 = document.createElement('h3');
    h3.className = 'contact-card-title';
    h3.textContent = data.title;
    content.append(h3);
  }

  const value = buildValue(data);
  if (value) content.append(value);

  if (data.notes && data.notes.textContent.trim()) {
    const notes = document.createElement('div');
    notes.className = 'contact-card-notes';
    while (data.notes.firstChild) notes.append(data.notes.firstChild);
    content.append(notes);
  }

  const cta = buildCta(data);
  if (cta) content.append(cta);

  li.append(content);

  if (data.qrPicture) {
    const qr = document.createElement('div');
    qr.className = 'contact-card-qr';
    qr.append(optimisedFrom(data.qrPicture, [{ width: '240' }]));
    li.append(qr);
  }

  return li;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const ul = document.createElement('ul');
  ul.className = 'contact-cards-list';
  rows.forEach((row) => ul.append(buildCard(row)));

  block.textContent = '';
  block.append(ul);

  decorateIcons(block);
}
