# Deploying blakegrosskopf.com

The site is a standard static Astro build (`npm run build` → `dist/`), so any static host
works. Below are the two free options from the brief. **Recommended: Cloudflare Pages** —
it's the least fuss, has the fastest global edge, and builds on every push.

> **Important:** this `site/` folder currently lives inside your **private** security
> vault repo. Do **not** publish the vault. Put the site in its **own public repo** first
> (Step 0). That repo contains only the website — no vault notes, no tooling, no secrets.

---

## Step 0 — Put the site in its own public repo

From `B:\sec-research-lab-vault\site`:

```bash
# use the full path to gh on this machine, or add it to PATH
GH="/c/Program Files/GitHub CLI/gh.exe"

git init
git add .
git commit -m "blakegrosskopf.com — initial site"
"$GH" repo create blakegrosskopf-site --public --source=. --remote=origin --push
```

That creates `github.com/grosskopfblake-dev/blakegrosskopf-site` and pushes `main`.
(`.gitignore` already excludes `node_modules/`, `dist/`, `.astro/`.)

---

## Option A — Cloudflare Pages (recommended)

1. Go to **dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the `blakegrosskopf-site` repo.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - (Root directory: leave as `/` — the repo root *is* the site.)
4. **Save and Deploy.** You get a `*.pages.dev` URL in ~1 minute.
5. **Custom domain:** Pages project → **Custom domains → Set up a domain** →
   `blakegrosskopf.com` (and add `www` too). If your DNS is on Cloudflare, it wires the
   records automatically. If not, add the CNAME records Cloudflare shows you at your
   registrar. HTTPS is automatic.

Delete `.github/workflows/deploy.yml` if you go this route — Cloudflare does the building.

---

## Option B — GitHub Pages

The workflow at `.github/workflows/deploy.yml` is ready.

1. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` (Step 0 already did). The **Deploy to GitHub Pages** action builds and
   publishes automatically; watch it under the repo's **Actions** tab.
3. **Custom domain:** Settings → Pages → **Custom domain** → `blakegrosskopf.com` → Save.
   GitHub writes a `CNAME` file to the deployment for you. Then at your DNS registrar:
   - Apex `blakegrosskopf.com`: four `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153` (and/or `AAAA` records per GitHub's docs).
   - `www`: a `CNAME` → `grosskopfblake-dev.github.io`.
   - Enable **Enforce HTTPS** once the cert provisions.

---

## Pointing blakegrosskopf.com (summary)

| Host | Cloudflare Pages | GitHub Pages |
|---|---|---|
| Apex `@` | CNAME/flattening to `*.pages.dev` (auto if DNS on Cloudflare) | 4× `A` records to GitHub IPs |
| `www` | CNAME to `*.pages.dev` | CNAME to `grosskopfblake-dev.github.io` |
| HTTPS | automatic | enable "Enforce HTTPS" |

DNS changes take minutes to a few hours to propagate. After it's live, re-check the
canonical URL and Open Graph preview (the `site` value in `astro.config.mjs` is already
`https://blakegrosskopf.com`).

---

## Before the first public deploy

- [ ] Site is in its **own public repo**, not the vault.
- [ ] `okta-oie-credential-oracle` repo is **public** (the Okta case study links it).
- [ ] Drop a real OG image at `public/og.png` if you want richer social cards (an SVG OG
      is in place; some scrapers prefer PNG). Then set `image` defaults in `Base.astro`.
- [ ] Add `public/blake-grosskopf-resume.pdf` to enable the résumé download.
