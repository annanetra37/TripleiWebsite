# Triple I — Website

A fast, SEO-friendly, multi-page marketing site for **Triple I** (100% AI-powered ESG reporting). Plain static HTML/CSS + a few KB of vanilla JS, served by a **zero-dependency Node server**. No build step, no framework, no `npm install`.

## Pages
| URL | File | Description |
|---|---|---|
| `/` | `public/index.html` | Home — hero, how it works, stats, benefits, industries, certifications, FAQ |
| `/industries` | `public/industries.html` | Sectors served + framework coverage |
| `/pricing` | `public/pricing.html` | Plans, comparison table, pricing FAQ |
| `/about` | `public/about.html` | Mission, trust, testimonials, hiring |
| `/blog` | `public/blog.html` | ESG guides index + newsletter |
| `/contact` | `public/contact.html` | Demo-request form |
| `/404` | `public/404.html` | Friendly not-found page |

## Run locally
```bash
cd site
node server.js          # → http://localhost:3000
```
That's it — Node 18+ only, no dependencies.

## Deploy to Railway
This folder is the deploy root. Three ways, pick one:

### A. Railway CLI (fastest)
```bash
npm i -g @railway/cli
railway login
cd site
railway init           # create/select a project
railway up             # deploys this directory
```
Railway detects `railway.json` / `nixpacks.toml`, runs `node server.js`, and injects `$PORT` (the server already reads it).

### B. GitHub → Railway
1. Push the **contents of this `site/` folder** to a repo (so `server.js` and `package.json` are at the repo root).
2. In Railway: **New Project → Deploy from GitHub repo** → pick the repo.
3. Railway auto-builds with Nixpacks and starts `node server.js`. Done.

### C. Docker
A `Dockerfile` is included. In Railway, set **Builder → Dockerfile** (or run `docker build -t triplei . && docker run -p 3000:3000 triplei`).

> **Note:** Railway expects the app at the repo root. If you deploy the whole design-system project, set the Railway **Root Directory** to `site/` in Settings → Service → Source.

## What makes it fast & SEO-friendly
- **True multi-page app** — every route is fully-rendered HTML. Crawlers and social cards see real content, not an empty `<div>`.
- **Per-page `<title>`, meta description, canonical, Open Graph & Twitter cards.**
- **JSON-LD structured data** — `Organization` on every page, `FAQPage` on the home page.
- **`sitemap.xml` + `robots.txt`** included.
- **One small CSS file, ~2KB JS, deferred.** Fonts preconnected; hero image `fetchpriority="high"`, everything else lazy-loaded.
- **Clean URLs** — the server maps `/pricing` → `pricing.html` automatically; internal links use `.html` so the site also works when opened as plain files.
- **Caching headers** — HTML revalidates, static assets cached a week.
- **Accessible** — semantic landmarks, focus rings, `prefers-reduced-motion` honored, mobile menu with `aria-expanded`.

## Images
All imagery is **self-hosted** under `public/assets/img/` — no third-party hotlinks, so the site renders fully offline and on Railway.

- **Icons & certification shields** are original brand-green pictograms / amber badge SVGs.
- **Product screenshots, the world map, and the About photos are placeholders** (wireframe panels and tinted gradients at the right aspect ratios). Drop the real exports in over the same filenames — `ecohub-flow.svg`, `ecohub-architecture.svg`, `world-map.svg`, `about-hero.svg`, `mission-1…4.svg` — or update the paths in `build/partials.js`.
- **Partner credibility logos** are text placeholders; replace with the official marks you're licensed to use.

## Editing content
Pages are generated from one source file: **`build/partials.js`** (content + layout). To change copy or structure, edit that file, then regenerate the HTML. The generator is plain Node-style string assembly; the design agent can re-run it, or you can adapt it into your own `node build.js`.

## Fonts
Uses **Plus Jakarta Sans** (Google Fonts) as a stand-in for the brand display face, which wasn't extractable from the live site. Swap the `<link>` in `build/partials.js` (the `layout()` head) for the licensed brand font when available.
