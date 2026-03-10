# Go‑Live Checklist (AEM Edge Delivery Services)

Use this as the cutover runbook for launching an EDS site on a custom domain.

## Project inputs (fill these in)

- **Repository**: `sp-gdc-mobility-eds`
- **Owner/org**: `seejanj` (update if different)
- **Branch to launch**: `main` (the Git branch that will serve production). Use a release branch like `release/2026-03` only if your org’s go-live process requires freezing production to a specific branch.
- **Default EDS live URL (origin)**: `https://main--sp-gdc-mobility-eds--seejanj.aem.live/`
- **Default EDS preview URL**: `https://main--sp-gdc-mobility-eds--seejanj.aem.page/`
- **Production domain (canonical)**: `https://________/`
- **Secondary domains** (www/apex/regionals): `________`
- **DNS provider**: `________`
- **CDN mode**: Adobe Managed CDN / Customer Managed CDN (pick one)
- **Analytics** (Adobe Analytics / GA4 / other): `________`
- **Monitoring** (RUM / uptime / logs): `________`
- **Rollback owner + comms channel**: `________`

## Pre go‑live (days–weeks before)

- **Code & content readiness**
  - Confirm all critical templates/blocks are implemented and published.
  - Validate authoring source in `fstab.yaml` points to the correct production content location.
  - Validate nav/footer, SEO metadata, and page titles for top pages.
  - Confirm `404.html` exists and behaves as expected.

- **Environment verification**
  - Smoke test on preview (`.aem.page`) and live origin (`.aem.live`) for:
    - Home, top landing pages, key flows, forms, search (if any), and downloads.
    - Mobile + desktop breakpoints.
    - Localization (if any).

- **Performance / quality gates**
  - Lighthouse (mobile) for top templates: LCP/CLS/INP within your target.
  - Accessibility: spot-check against WCAG 2.2 AA for key templates.
  - Cross-browser: latest Chrome/Safari/Edge + iOS Safari.

- **SEO**
  - Decide canonical domain (apex vs www) and enforce a single canonical.
  - Verify:
    - `robots` directives (no accidental `noindex` on prod)
    - `hreflang` (if applicable)
    - metadata (title/description/OG/Twitter)
  - Plan redirects for:
    - old site → new site
    - non-canonical host → canonical host
    - http → https

- **Security**
  - Confirm no secrets in repo/content.
  - If using Adobe Managed CDN advanced rules, plan and deploy `cdn.yaml` via Edge Delivery config pipeline (if needed).
  - If you must restrict origin (`*.aem.live`) access, set up Site Authentication and CDN origin headers (only if required).

## DNS & domain cutover plan (day of go‑live)

### 1) DNS preparation

- **Lower TTL** for the records you’ll change (e.g., to 60–300s) 24 hours before cutover.
- **Choose the target** you will point your custom domain to:
  - Typical EDS live origin target: `main--sp-gdc-mobility-eds--seejanj.aem.live`

### 2) Point the domain to EDS

Pick the option that matches your DNS constraints:

- **`www` host** (recommended when possible)
  - Create/Update **CNAME**:
    - `www` → `main--sp-gdc-mobility-eds--seejanj.aem.live`
- **Apex/root domain** (depends on DNS provider support)
  - Use **ALIAS/ANAME** (or provider-specific “CNAME flattening”) to:
    - `@` → `main--sp-gdc-mobility-eds--seejanj.aem.live`
  - If your provider does not support this for apex, use apex → www redirect at DNS/CDN level.

### 3) Validate DNS propagation

- `dig` / `nslookup` checks for both `www` and apex (as applicable)
- Confirm TLS certificate issuance/validity once traffic resolves over HTTPS.

### 4) Canonicalization + redirects

- Enforce one canonical host (e.g., `www`) and redirect other hosts to it.
- Ensure old URL redirect map is ready (see “Redirects” under content migration).

## Content migration runbook (repeatable steps)

### A) Inventory & mapping

- Export a URL inventory from the legacy site:
  - URL
  - template type
  - traffic (top pages)
  - owner
  - status (migrated/QA’d)
- Create a mapping sheet:
  - **Old URL** → **New URL**
  - Redirect type (301/302)
  - Notes (content moved/merged/removed)

### B) Migrate content

- For each page:
  - Copy content into the EDS authoring source (doc-based authoring), matching your block structure.
  - Add/update metadata (title, description, og:image, canonical, robots, etc.).
  - Ensure images are optimized and referenced correctly.
  - Validate page in preview (`.aem.page`), then validate on live origin (`.aem.live`).

### C) Migrate media & downloads

- Identify legacy assets (images, PDFs) and their URLs.
- Move to the approved asset location and confirm:
  - correct MIME types
  - caching behavior
  - no mixed-content issues

### D) Redirects

- Build a redirect list from the mapping sheet:
  - old → new (301)
  - vanity URLs
  - removed content → closest replacement (or 404 if intentionally removed)
- Validate redirects in a staging rehearsal before go-live.

### E) Freeze window (recommended)

- Set a content freeze on legacy authoring during final migration.
- Run a final delta pass for changes during freeze.

## Go‑live validation (first 30–90 minutes)

- **DNS**: correct resolution for all intended hosts.
- **HTTPS**: valid cert; no TLS errors.
- **Critical paths**:
  - Homepage
  - Top landing pages
  - Forms / lead capture
  - Search (if any)
  - Downloads
- **Redirects**:
  - non-canonical → canonical
  - old URLs → new URLs
- **SEO**:
  - `robots` correct
  - canonical tags correct
  - sitemap reachable (if used)
- **Performance**:
  - quick Lighthouse spot-check
  - verify RUM beacon ingestion (if enabled)
- **Analytics**:
  - pageview events and key conversions firing in prod

## Post go‑live (24–72 hours)

- Monitor:
  - 404s and redirect misses
  - Core Web Vitals
  - uptime and error rates
  - analytics anomalies
- Iterate:
  - add redirects for missed legacy URLs
  - fix broken internal links
  - adjust caching / headers if needed
- Restore DNS TTL to normal values.

## Rollback plan (keep this explicit)

- **Rollback trigger**: `________`
- **Rollback action**:
  - Revert DNS records to previous target (or switch CDN origin back)
  - Announce in comms channel
- **Rollback owner**: `________`

