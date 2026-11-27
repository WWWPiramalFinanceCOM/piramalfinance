/*
 * LAS calculator ("Loan Against Securities Calculator") with two tabs:
 *   1. Eligible loan limit: pick an amount for each type of security, see the limit it gives
 *   2. Interest cost: pick an amount, a number of days and a rate, see the interest
 *
 * The page already contains everything as plain text: each tab's securities or inputs with a
 * starting value and a sample result. With JavaScript off that is what visitors see (both tabs,
 * one after the other). This script turns it into a working calculator: it adds amount boxes and
 * sliders, switches between the two tabs, and recalculates the result live.
 *
 * Rows of the block: 1 label, 2 heading, 3 intro,
 *   tab 1: 4 title, 5 inputs, 6 result, 7 button
 *   tab 2: 8 title, 9 inputs, 10 result, 11 button
 *   12 disclaimer, 13 note for visitors without JavaScript.
 */

const numberFormat = new Intl.NumberFormat('en-IN');
const formatNumber = (value) => numberFormat.format(Math.round(value));
const formatRupees = (value) => `₹${formatNumber(value)}`;
const sum = (numbers) => numbers.reduce((total, n) => total + n, 0);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const SLIDER_STEPS = 1000; // every slider moves from 0 to 1000

// Round to a tidy amount: nearest 1,000 under 10 lakh, 10,000 under 1 crore, else 1 lakh
function roundAmount(amount) {
  let step = 1_00_000;
  if (amount < 10_00_000) step = 1000;
  else if (amount < 1_00_00_000) step = 10_000;
  return Math.round(amount / step) * step;
}

/*
 * A "control" is one input: an amount box plus a slider. Its settings say how the slider position
 * maps to a value, and how the value is read from and shown in the box.
 */
function amountControl({
  min, max, rangeLeft, rangeRight, maxTyped,
}) {
  return {
    prefix: '₹',
    suffix: '',
    rangeLeft,
    rangeRight,
    // The slider is a curve, so small amounts are easy to pick and the top amount still fits
    fromPosition: (pos) => roundAmount(min + (max - min) * (pos / SLIDER_STEPS) ** 3),
    toPosition: (value) => {
      const share = clamp((value - min) / (max - min), 0, 1);
      return Math.round(SLIDER_STEPS * Math.cbrt(share));
    },
    fromText: (text) => Math.min(Number(text.replace(/\D/g, '')), maxTyped),
    toText: (value) => formatNumber(value),
  };
}

const daysControl = {
  prefix: '',
  suffix: 'days',
  rangeLeft: '1 day',
  rangeRight: '365 days',
  fromPosition: (pos) => Math.round(1 + (364 * pos) / SLIDER_STEPS),
  toPosition: (value) => Math.round((SLIDER_STEPS * (clamp(value, 1, 365) - 1)) / 364),
  fromText: (text) => clamp(Number(text.replace(/\D/g, '')) || 1, 1, 365),
  toText: (value) => String(value),
};

const rateControl = {
  prefix: '',
  suffix: '%',
  rangeLeft: '9.75%',
  rangeRight: '15%',
  fromPosition: (pos) => Math.round((9.75 + (5.25 * pos) / SLIDER_STEPS) * 20) / 20,
  toPosition: (value) => Math.round((SLIDER_STEPS * (clamp(value, 9.75, 15) - 9.75)) / 5.25),
  fromText: (text) => clamp(parseFloat(text.replace(/[^\d.]/g, '')) || 9.75, 9.75, 15),
  toText: (value) => String(Math.round(value * 100) / 100),
};

// One input row: name, optional note, amount box, slider and the range labels under it
function buildInput({ name, note }, control, id) {
  const row = document.createElement('div');
  row.className = 'las-calculator-input';
  row.innerHTML = `
    <div class="las-calculator-input-head">
      <div class="las-calculator-input-name">
        <span class="las-calculator-input-title"></span>
        <span class="las-calculator-input-ltv"></span>
      </div>
      <label class="las-calculator-amount">
        <span class="las-calculator-prefix" aria-hidden="true"></span>
        <input type="text" inputmode="decimal" autocomplete="off" id="${id}">
        <span class="las-calculator-suffix" aria-hidden="true"></span>
      </label>
    </div>
    <input type="range" class="las-calculator-slider" min="0" max="${SLIDER_STEPS}" step="1">
    <div class="las-calculator-range" aria-hidden="true"><span></span><span></span></div>`;

  row.querySelector('.las-calculator-input-title').textContent = name;
  row.querySelector('.las-calculator-input-ltv').textContent = note || '';
  if (control.suffix) row.querySelector('label').classList.add('las-calculator-amount-with-unit');
  row.querySelector('.las-calculator-prefix').textContent = control.prefix;
  row.querySelector('.las-calculator-suffix').textContent = control.suffix;
  row.querySelector('label').setAttribute('aria-label', `${name}${control.suffix ? `, in ${control.suffix}` : ', in rupees'}`);
  row.querySelector('.las-calculator-slider').setAttribute('aria-label', `${name}, slider`);
  const [left, right] = row.querySelectorAll('.las-calculator-range span');
  left.textContent = control.rangeLeft;
  right.textContent = control.rangeRight;
  return row;
}

/*
 * Wire the controls of one tab: show each value in its box and slider, and call update() when
 * any of them changes.
 * `items` are objects with a `value`; `controls` are the matching control settings.
 */
function connectControls(items, controls, list, idPrefix, update) {
  const connected = items.map((item, index) => {
    const element = buildInput(item, controls[index], `${idPrefix}-${index}`);
    list.append(element);
    return {
      item,
      control: controls[index],
      text: element.querySelector('.las-calculator-amount input'),
      slider: element.querySelector('.las-calculator-slider'),
    };
  });

  function show({
    item, control, text, slider,
  }, { skipText = false } = {}) {
    if (!skipText) text.value = control.toText(item.value);
    const position = control.toPosition(item.value);
    slider.value = position;
    slider.style.setProperty('--fill', `${(position / SLIDER_STEPS) * 100}%`);
    slider.setAttribute('aria-valuetext', `${control.prefix}${control.toText(item.value)} ${control.suffix}`.trim());
  }

  connected.forEach((entry) => {
    show(entry);
    entry.slider.addEventListener('input', () => {
      entry.item.value = entry.control.fromPosition(Number(entry.slider.value));
      show(entry);
      update();
    });
    entry.text.addEventListener('input', () => {
      entry.item.value = entry.control.fromText(entry.text.value);
      show(entry, { skipText: true }); // do not rewrite what the visitor is typing
      update();
    });
    entry.text.addEventListener('blur', () => show(entry)); // tidy it up (commas, limits) when leaving the box
  });
}

// Put rows [inputs, result, button] into a white card with a green panel, and return the card
function buildCard([inputsRow, resultRow, buttonRow]) {
  const card = document.createElement('div');
  card.className = 'las-calculator-card';
  const panel = document.createElement('div');
  panel.className = 'las-calculator-panel';
  panel.append(resultRow);
  if (buttonRow) panel.append(buttonRow); // the button may have been removed
  card.append(inputsRow, panel);

  const list = document.createElement('div');
  list.className = 'las-calculator-inputs';
  inputsRow.replaceChildren(list);
  return { card, list };
}

// Find the parts of the authored result: label, big number, list of amounts, note
function readResult(resultRow) {
  const cell = resultRow.firstElementChild;
  const paragraphs = [...cell.querySelectorAll(':scope > p')];
  const amounts = [...cell.querySelectorAll(':scope > ul > li em')];
  return { paragraphs, amounts, bigNumber: paragraphs[1]?.querySelector('strong') || paragraphs[1] };
}

/* ---------- Tab 1: eligible loan limit ---------- */
function setupEligibility(group) {
  const [, inputsRow, resultRow] = group;
  const { paragraphs, amounts, bigNumber } = readResult(resultRow);

  // The authored list: <li><strong>Name</strong> LTV up to 80% <em>10,00,000</em></li>
  const securities = [];
  inputsRow.querySelectorAll('li').forEach((li) => {
    const name = li.querySelector('strong')?.textContent.trim();
    const copy = li.cloneNode(true);
    copy.querySelectorAll('strong, em').forEach((el) => el.remove());
    const note = copy.textContent.trim();
    const ltv = parseFloat(note.match(/(\d+(?:\.\d+)?)\s*%/)?.[1]);
    const start = Number((li.querySelector('em')?.textContent || '').replace(/\D/g, ''));
    if (name && ltv) {
      securities.push({
        name, note, ltv, value: Math.min(start, 10_00_00_000),
      });
    }
  });
  if (!securities.length || !bigNumber) return null; // authored differently than expected

  const { card, list } = buildCard([inputsRow, resultRow, group[3]]);
  resultRow.querySelector('ul')?.classList.add('las-calculator-split'); // coloured squares, as in the split bar

  // A split bar under the big number: one segment per security
  paragraphs[1].setAttribute('aria-live', 'polite');
  const bar = document.createElement('div');
  bar.className = 'las-calculator-bar';
  bar.setAttribute('aria-hidden', 'true');
  securities.forEach(() => bar.append(document.createElement('span')));
  paragraphs[1].after(bar);

  function update() {
    const eligible = securities.map((s) => (s.value * s.ltv) / 100);
    const limit = sum(eligible);
    bigNumber.textContent = formatRupees(limit);
    if (amounts[0]) amounts[0].textContent = formatRupees(sum(securities.map((s) => s.value)));
    eligible.forEach((value, index) => {
      if (amounts[index + 1]) amounts[index + 1].textContent = formatRupees(value);
      bar.children[index].style.width = limit ? `${(value / limit) * 100}%` : '0';
    });
  }

  const control = amountControl({
    min: 0, max: 10_00_00_000, maxTyped: 10_00_00_000, rangeLeft: '₹0', rangeRight: '₹10 Cr+',
  });
  connectControls(securities, securities.map(() => control), list, 'las-calculator-limit', update);
  update();
  return card;
}

/* ---------- Tab 2: interest cost ---------- */
function setupInterest(group) {
  const [, inputsRow, resultRow] = group;
  const { amounts, bigNumber } = readResult(resultRow);

  // The authored list has three inputs in this order: amount, days, rate.
  // Each one is: <li><strong>Name</strong> <em>5,00,000</em></li>
  const items = [...inputsRow.querySelectorAll('li')].map((li) => ({
    name: li.querySelector('strong')?.textContent.trim(),
    value: parseFloat((li.querySelector('em')?.textContent || '').replace(/[^\d.]/g, '')),
  }));
  const incomplete = items.length < 3 || items.some((i) => !i.name || Number.isNaN(i.value));
  if (incomplete || !bigNumber) return null;
  const [amount, days, rate] = items;

  const { card, list } = buildCard([inputsRow, resultRow, group[3]]);
  card.classList.add('las-calculator-card-interest'); // this tab has its own look (dark result panel)
  resultRow.firstElementChild.querySelector(':scope > p:nth-child(2)')?.setAttribute('aria-live', 'polite');

  function update() {
    const perYear = (amount.value * rate.value) / 100;
    bigNumber.textContent = formatRupees((perYear / 365) * days.value);
    if (amounts[0]) amounts[0].textContent = formatRupees(perYear / 365); // per day
    if (amounts[1]) amounts[1].textContent = formatRupees(perYear / 12); // average per month
    // amounts[2] (the principal line) is plain text and stays as authored
  }

  const controls = [
    amountControl({
      min: 50_000, max: 5_00_00_000, maxTyped: 100_00_00_000, rangeLeft: '₹50,000', rangeRight: '₹5 Cr+ (type any amount)',
    }),
    daysControl,
    rateControl,
  ];
  connectControls(items.slice(0, 3), controls, list, 'las-calculator-interest', update);
  update();
  return card;
}

/* ---------- The two tabs ---------- */
function buildTabs(block, titles, cards) {
  const tablist = document.createElement('div');
  tablist.className = 'las-calculator-tabs';
  tablist.setAttribute('role', 'tablist');

  const buttons = titles.map((title, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'las-calculator-tab';
    button.setAttribute('role', 'tab');
    button.id = `las-calculator-tab-${index}`;
    button.textContent = title;
    cards[index].setAttribute('role', 'tabpanel');
    cards[index].setAttribute('aria-labelledby', button.id);
    tablist.append(button);
    return button;
  });

  function select(selected) {
    block.dataset.tab = String(selected); // the card and tab bar look differs per tab
    buttons.forEach((button, index) => {
      const on = index === selected;
      button.setAttribute('aria-selected', String(on));
      button.tabIndex = on ? 0 : -1;
      cards[index].hidden = !on;
    });
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', (event) => {
      // Arrow keys move between the tabs
      const next = {
        ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: buttons.length - 1,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      const target = (next + buttons.length) % buttons.length;
      select(target);
      buttons[target].focus();
    });
  });

  select(0);
  return tablist;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Each tab is found by its result row (the only row with both a paragraph and a list). The inputs
  // are the row before it, the button the row after it, and the title the short plain-text row
  // before the inputs. A removed title or button is fine, and so is a removed label, intro or
  // disclaimer.
  const resultIndexes = rows.map((row, index) => (
    row.querySelector('ul') && row.querySelector('p') ? index : -1
  )).filter((index) => index >= 0).slice(0, 2);
  if (resultIndexes.length < 2 || resultIndexes[0] < 1) return; // not fully authored: leave as is

  const isTitle = (row) => {
    const text = row?.textContent.trim() || '';
    return text.length > 0 && text.length < 40 && !row.querySelector('h2, em, ul, a, strong');
  };
  const groups = resultIndexes.map((index) => [
    isTitle(rows[index - 2]) ? rows[index - 2] : null,
    rows[index - 1],
    rows[index],
    rows[index + 1]?.querySelector('a') ? rows[index + 1] : null,
  ]);

  // Remember where the first tab starts: building the tabs moves the rows into cards
  const firstTabRow = groups[0].find(Boolean);
  const firstTabIndex = rows.indexOf(firstTabRow);
  const placeholder = document.createElement('div');
  firstTabRow.before(placeholder);

  const built = [setupEligibility(groups[0]), setupInterest(groups[1])];

  // Only tabs that could be built become tabs. The rows of a tab that could not be built (for
  // example its inputs were left empty) are hidden, so no unstyled leftovers show on the page
  const tabs = built
    .map((card, index) => ({ card, titleRow: groups[index][0], index }))
    .filter(({ card }) => card);
  if (!tabs.length) return;
  groups.forEach((group, index) => {
    if (built[index]) return;
    group.forEach((row) => {
      if (row) row.hidden = true;
    });
  });

  // The label rows are before the heading, the intro rows between the heading and the first tab
  const headingIndex = rows.findIndex((row) => row.querySelector('h2'));
  rows.forEach((row, index) => {
    if (index >= firstTabIndex || row.querySelector('h2, a, ul')) return;
    row.classList.add(index < headingIndex ? 'las-calculator-label' : 'las-calculator-intro');
  });

  const titles = tabs.map(({ titleRow, index }) => titleRow?.textContent.trim() || `Tab ${index + 1}`);
  const tablist = buildTabs(block, titles, tabs.map(({ card }) => card));
  placeholder.replaceWith(tablist, ...tabs.map(({ card }) => card));
  tabs.forEach(({ titleRow }) => titleRow?.remove());

  // The two rows after the last tab: the disclaimer, then the note for visitors without JavaScript
  const lastTabRow = groups[1][3] || groups[1][2];
  const [disclaimer, note] = rows.slice(rows.indexOf(lastTabRow) + 1);
  disclaimer?.classList.add('las-calculator-disclaimer');
  note?.classList.add('las-calculator-note'); // hidden once the calculator works
  block.classList.add('las-calculator-ready');
}
