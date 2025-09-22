const mySection = [
  ['Section Metadata'],
  ['style', 'list-content-wrapper, three-col-table, fees-charges-wrapper, page-container, mb-70 mob-mb-40, list-content-wrapper, code-container'],
];

function sectionMaker(selector, main, document) {
  if (!main || !selector) return;

  const headings = main.querySelectorAll(selector);

  headings.forEach((element) => {
    const hr = document.createElement('hr');
    element.insertAdjacentElement('beforebegin', hr);

    const sectionTable = WebImporter.DOMUtils.createTable(mySection, document);
    element.insertAdjacentElement('afterend', sectionTable);
  });
}

export default sectionMaker;
