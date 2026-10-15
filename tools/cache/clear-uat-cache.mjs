/*
 * Clears the UAT cache (https://uatmarketing.piramalfinance.com) for this repo.
 *
 * UAT is served by AEM Edge Delivery from this repo's "main" branch, so purging the
 * AEM cache through the Admin API is enough: the UAT domain picks up the fresh copy.
 *
 * Run (Node 20+):
 *   node tools/cache/clear-uat-cache.mjs                     -> clears home, nav and footer
 *   node tools/cache/clear-uat-cache.mjs /home-loan /nav     -> clears only these pages/files
 *   node tools/cache/clear-uat-cache.mjs --code              -> also re-syncs all JS/CSS from main
 *
 * Optional: if the Admin API is ever locked down, set AEM_ADMIN_API_KEY and it is sent as a token.
 *
 * Note: visitors' browsers keep files for up to 2 hours (cache-control: max-age=7200).
 * Testers should hard refresh (Cmd+Shift+R) or use an incognito window after clearing.
 */

/* eslint-disable no-console */

const ADMIN_API = 'https://admin.hlx.page';
const SITE = 'WWWPiramalFinanceCOM/piramalfinance/main';
const UAT_ORIGIN = 'https://uatmarketing.piramalfinance.com';

// Shared pieces used on every page, cleared when no paths are given.
const DEFAULT_PATHS = ['/', '/nav', '/footer'];

// The UAT firewall blocks requests without a browser user agent (HTTP 406).
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const args = process.argv.slice(2);
const syncCode = args.includes('--code');
const givenPaths = args.filter((arg) => arg !== '--code');

// Accept "nav", "/nav" or a full UAT URL and turn them all into "/nav".
const paths = (givenPaths.length ? givenPaths : DEFAULT_PATHS).map((path) => {
  const cleanPath = path.replace(UAT_ORIGIN, '');
  return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
});

const headers = {};
if (process.env.AEM_ADMIN_API_KEY) {
  headers.Authorization = `token ${process.env.AEM_ADMIN_API_KEY}`;
}

// Calls the Admin API and returns true when it worked.
async function callAdmin(action, path) {
  const response = await fetch(`${ADMIN_API}/${action}/${SITE}${path}`, { method: 'POST', headers });
  const worked = response.ok;
  const error = response.headers.get('x-error') || '';
  console.log(`${worked ? 'OK  ' : 'FAIL'} ${action} ${path} (HTTP ${response.status}) ${error}`);
  return worked;
}

// Shows what UAT now serves, so you can see the new "last-modified" date.
async function checkUat(path) {
  try {
    const response = await fetch(`${UAT_ORIGIN}${path}`, { method: 'HEAD', headers: { 'User-Agent': BROWSER_UA } });
    console.log(`     UAT ${path} -> HTTP ${response.status}, last-modified: ${response.headers.get('last-modified')}`);
  } catch (e) {
    // Only informational: the firewall may block some networks (e.g. CI servers).
    console.log(`     UAT ${path} -> could not check (${e.message})`);
  }
}

let failures = 0;

if (syncCode) {
  // "/*" re-syncs every code file (JS, CSS, fonts...) from GitHub main and purges it.
  if (!await callAdmin('code', '/*')) failures += 1;
}

// One page at a time keeps the output easy to read.
// eslint-disable-next-line no-restricted-syntax
for (const path of paths) {
  // eslint-disable-next-line no-await-in-loop
  if (await callAdmin('cache', path)) {
    // eslint-disable-next-line no-await-in-loop
    await checkUat(path);
  } else {
    failures += 1;
  }
}

if (failures) {
  console.log(`\n${failures} request(s) failed.`);
  process.exit(1);
}
console.log('\nUAT cache cleared. Hard refresh the browser (Cmd+Shift+R) to see the change.');
