/*
 * Rebuilds /sitemap-index.xml (the list of per-language sitemaps) from helix-sitemap.yaml.
 *
 * The per-language sitemaps themselves are built by AEM Edge Delivery on every publish.
 * This script only keeps the root list in sync, so nobody edits sitemap-index.xml by hand.
 *
 * Run: node tools/sitemap/generate-sitemap-index.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

// STAGE (UAT) host only.
const SITE_ORIGIN = 'https://uatmarketing.piramalfinance.com';

// Each language in helix-sitemap.yaml has a line like "destination: /en/sitemap-index.xml".
const config = readFileSync('helix-sitemap.yaml', 'utf8');
const destinations = [...config.matchAll(/^\s*destination:\s*(\S+)/gm)].map((match) => match[1]);

if (destinations.length === 0) {
  throw new Error('No "destination" entries found in helix-sitemap.yaml');
}

const entries = destinations
  .map((path) => `  <sitemap>\n    <loc>${SITE_ORIGIN}${path}</loc>\n  </sitemap>`)
  .join('\n');

writeFileSync('sitemap-index.xml', `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`);

// eslint-disable-next-line no-console
console.log(`sitemap-index.xml updated with ${destinations.length} sitemaps`);
