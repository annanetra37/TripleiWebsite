# Railway deployment — Triple I website

One service. No database, no Redis, no extra add-ons.

## 1. Create the service

1. Railway → **New Project → Deploy from GitHub repo** → pick the repo that contains the `site/` folder.
2. If the repo root is not `site/`, open **Settings → Root Directory** and set it to `site`.
3. Build/start: nothing to configure. `package.json` has `"start": "node server.js"`, and the server is zero-dependency (no `npm install` needed). `nixpacks.toml` / `Dockerfile` in the folder already cover the build.
4. Railway injects `PORT`; the server reads it automatically.

## 2. Add a volume (required for visitor analytics)

Without a volume, visitor data is wiped on every redeploy.

- Service → **Variables / Volumes → New Volume**
- Mount path: `/data`
- Then set the variable `DATA_DIR=/data` (below)

## 3. Environment variables

Service → **Variables**:

| Variable | Value | Why |
|---|---|---|
| `RESEND_API_KEY` | your Resend key (`re_…`) | sends every form submission by email |
| `MAIL_TO` | `meghrikayityan@gmail.com` | where submissions arrive |
| `MAIL_FROM` | `Triple I Website <website@zontik.am>` | must be a verified Resend domain |
| `ADMIN_USER` | `admin` (or anything) | login for `/visitors` |
| `ADMIN_PASS` | a long random password | **required** — without it `/visitors` returns 503 |
| `DATA_DIR` | `/data` | analytics storage on the volume |

`PORT` is provided by Railway — do not set it.

Notes:
- Never commit these values. `site/.env.example` lists the names only.
- Rotate the Resend key if it has been shared in chat or email.

## 4. Resend setup (one-time, outside Railway)

1. Resend → **Domains → Add domain** → `zontik.am`.
2. Add the DNS records Resend gives you (SPF/DKIM) at your DNS provider; wait for **Verified**.
3. Keep `MAIL_FROM` on that domain (`website@zontik.am`). Sending from an unverified domain fails.

## 5. Custom domain

Service → **Settings → Networking → Custom Domain** → add `triplei.io` (and `www`), then create the CNAME Railway shows at your DNS provider. Railway issues the TLS certificate automatically.

## 6. After the first deploy — check these

- `https://<your-domain>/` loads, and clean URLs work (`/pricing`, `/about`, `/careers`).
- Submit the contact form → email arrives at `MAIL_TO`. If not, check **Deploy Logs** for `submit failed:`.
- Submit the careers form with a PDF → the CV arrives as an attachment (limit ~9 MB per submission).
- Visit `/visitors` → browser asks for username/password (`ADMIN_USER` / `ADMIN_PASS`).
- Browse a couple of pages in a normal tab, then reload `/visitors` → events appear.

## 7. Endpoints (for reference)

| Route | Purpose |
|---|---|
| `POST /api/submit` | all forms (contact, demo, newsletter, CV) → Resend |
| `POST /api/track` | visitor events from `assets/track.js` |
| `GET /visitors` | private dashboard (Basic auth) |
| `GET /api/visitors.json` | dashboard data (Basic auth) |
| `GET /api/visitors.csv` | full CSV export for Excel (Basic auth) |

`/visitors` and `/api/*` are blocked in `robots.txt` and served with `noindex`.

## 8. Legal note

The analytics store IP addresses and first-party visitor IDs — personal data under GDPR. Before serious EU traffic, add a line about this first-party logging to the privacy policy and consider a consent banner.
