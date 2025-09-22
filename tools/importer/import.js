/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

import BlockBuilder from './BlockBuilder.js';
import sectionMaker from './utils/sectionMaker.js';

console.log(WebImporter);

export default {
  /**
         * Apply DOM operations to the provided document and return
         * the root element to be then transformed to Markdown.
         * @param {HTMLDocument} document The document
         * @param {string} url The url of the page imported
         * @param {string} html The raw html (the document is cleaned up during preprocessing)
         * @param {object} params Object containing some parameters given by the import process.
         * @returns {HTMLElement} The root element to be transformed
         */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    // attempt to remove non-content elements
    WebImporter.DOMUtils.remove(main, [
      'header',
      '.header',
      'footer',
      '.footer',
      'iframe',
      'noscript',
      'blockquote',
    ]);

    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    WebImporter.rules.convertIcons(main, document);

    const breadcrumbSection = document.createElement('hr');
    document.querySelector('.breadcrumb_wrapp').prepend(breadcrumbSection);
    const breadcrumb = new BlockBuilder({
      name: 'Breadcrumb',
      block: '.breadcrumb_wrapp',
      blockRows: [
        [() => false],
        [() => ''],
        [() => false],
        [() => ''],
        [(el) => [...el.querySelector('.breadcrumb').children].map((li) => {
          console.log('li.textContent', li.textContent.trim());
          return li.textContent.trim();
        }).join(',')],
        [(el) => {
          const anchors = [...el.querySelectorAll('.breadcrumb a')].map((a) => `${a.href}-b`).join('~');
          document.querySelector('.breadcrumb').remove();
          return anchors;
        }],
      ],
    }).cellMaker(main, document);

    const breadcrumbMetaDat = WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'rosewhite,page-container, breadcrumb-handle,multi-calculator-wrapper ,document-required-banner,breadcrumb-handle-mob,mb-70, mob-mb-40, 23'],
    ], document);
    breadcrumbSection.before(breadcrumbMetaDat);

    sectionMaker('h2', main, document);
    return main;
  },

  /**
         * Return a path that describes the document being transformed (file name, nesting...).
         * The path is then used to create the corresponding Word document.
         * @param {HTMLDocument} document The document
         * @param {string} url The url of the page imported
         * @param {string} html The raw html (the document is cleaned up during preprocessing)
         * @param {object} params Object containing some parameters given by the import process.
         * @return {string} The path
         */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    let p = new URL(url).pathname;
    if (p.endsWith('/')) {
      p = `${p}index`;
    }
    return decodeURIComponent(p)
      .toLowerCase()
      .replace(/\.html$/, '')
      .replace(/[^a-z0-9/]/gm, '-');
  },
};
