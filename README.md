# Your Project's Title...
Your project's description...

## Environments
- Preview: https://main--piramalfinance--WWWPiramalFinanceCOM.aem.page/
- Live: https://main--piramalfinance--WWWPiramalFinanceCOM.aem.live/

## Installation

```sh
npm i
```

## Linting
`
```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `piramalfinance` directory in your favorite IDE and start coding :)

## Clearing the UAT cache

UAT (https://uatmarketing.piramalfinance.com) is served from this repo's `main` branch. The cache normally clears itself:

- **Content** (pages, nav, footer): **Publish** in AEM Universal Editor refreshes that page.
- **Code** (JS/CSS): merging into `main` syncs and refreshes the changed files.

If a page still looks old after publishing or merging, clear it manually.

### Option 1: GitHub Actions button (no setup)

1. Open the repo on GitHub and go to **Actions** -> **Clear UAT cache** -> **Run workflow**.
1. **Pages/files to clear**: space separated, e.g. `/home-loan /nav`. Leave empty for home, nav and footer.
1. **Also re-sync all JS/CSS code from main**: tick it when a code change is not showing.
1. Click **Run workflow**. A green tick means it worked; the log shows each page's latest `last-modified` date.

The workflow only runs when someone clicks the button (never on push). It does not publish or change content; it only makes AEM fetch a fresh copy.

### Option 2: From your machine (Node 20+)

```sh
node tools/cache/clear-uat-cache.mjs                     # home, nav and footer
node tools/cache/clear-uat-cache.mjs /home-loan /nav     # only these pages/files
node tools/cache/clear-uat-cache.mjs --code              # also re-sync all JS/CSS from main
```

### Notes

- Browsers keep files for up to 2 hours (`cache-control: max-age=7200`). After clearing, hard refresh (Cmd/Ctrl + Shift + R) or use an incognito window.
- If the AEM Admin API is ever locked down, add an `AEM_ADMIN_API_KEY` repo secret (Settings -> Secrets and variables -> Actions); the script and button send it automatically.
- UAT only. Production uses a separate repo.
