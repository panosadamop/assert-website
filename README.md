# assert.gr — website + CMS

Two Node.js apps in one repository:

| Folder | What | Tech | Port |
| --- | --- | --- | --- |
| `frontend/` | Public website (assert.gr) | Next.js 16 · React 19 · TypeScript | 3100 |
| `backend/` | CMS API + admin panel (`/admin`) | NestJS 11 · TypeScript | 4000 |

Content is stored as **flat-file JSON** (`backend/storage/data/*.json`) — no database server needed.
Uploaded media live in `backend/storage/uploads/`. Back up the `storage` folder and you have everything.

Brand: primary colour `#20282d`, accent `#3cc6e0` (both editable in the CMS), Ubuntu typeface (self-hosted), ASSERT logo.

---

## 1. Run it locally (Windows & macOS)

Requirement: **Node.js 20.9+** (LTS 22 recommended) — https://nodejs.org

| | Double-click | Or in a terminal |
| --- | --- | --- |
| **Windows** | `start-windows.bat` | `powershell -ExecutionPolicy Bypass -File .\start-windows.ps1` |
| **macOS** | `start-mac.command` (first time: right-click → Open) | `./start-mac.sh` |
| Any OS | — | `npm run setup` once, then `npm run dev` |

The first run installs dependencies and creates `backend/.env` and `frontend/.env` with random secrets.

- Website: http://localhost:3100
- Admin: http://localhost:4000/admin — log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env`
  (default `admin@assert.gr` / `Ι ψανν` — change it under **My account**)

Edits in the admin appear on the website immediately. Code changes reload automatically.

Other commands (from the project root):

```
npm run build      # build both apps
npm start          # run both apps in production mode locally
npm run package    # build + copy deployable files to ./release (for shared hosting)
```

## 2. The CMS

Admin panel at `/admin` on the CMS app:

- **Pages:** Home, About, Contact (hero, texts, stats, process steps, CTAs, form options)
- **Sectors / Products / Pages:** create, edit, publish/draft, reorder; Markdown text; repeatable feature lists
- **Media library:** drag & drop uploads (images, PDF, MP4), image picker in every image field
- **Messages:** contact-form submissions (optional webhook to Slack/Teams/Zapier via `CONTACT_WEBHOOK_URL`)
- **Site & SEO settings:** site URL, logo, colours, contact details, social profiles, default title/description,
  title template, keywords, default share image, locale, indexing on/off, extra robots.txt rules,
  Google/Bing/Yandex verification, organisation data for structured data, **redirects (301/302)**,
  Google Analytics 4 / Tag Manager / Plausible
- **Per-page SEO** on every page: meta title & description (with counters and a live Google preview),
  keywords, social image, canonical URL, noindex
- **Users** (admin / editor roles), **Backup & restore** (one JSON file), **Refresh site** button
- **Pages builder:** new pages get a header (eyebrow, intro, background image, two buttons) and **Sections**
  (text, text + image, image, feature list, numbered cards, steps, figures, all sectors, all products,
  contact form, call-to-action band) – reorder with the arrows
- **Menus:** header items (simple links or sector/product dropdowns), footer columns and bottom-bar links – reorder with the arrows
- **Languages:** Settings → Languages. The first language is the default (`/about`); others live under their
  code (`/el/about`). Every editor gets language tabs; empty translations fall back to the default language.
  **Interface texts** holds the fixed website texts (buttons, form labels, messages) for every language.
- **Social media buttons:** Settings → Contact & social (any network, any order; shown in the footer and on the contact page)
- **Cookie consent:** Settings → Cookies. Google Analytics / Tag Manager load only after consent; visitors can change
  their choice via "Cookie settings" in the footer.

Accessibility: the website targets **WCAG 2.1 AA** (keyboard-operable menus, focus management, skip link,
colour contrast ≥ 4.5:1, labelled forms, `lang` per language). Give informative images an alt text in the CMS.

Every save is validated against the content schema (`backend/src/content/schema.ts`), written atomically,
and the previous 20 versions of each file are kept in `storage/data/.backups/`.

## 3. SEO built into the website

- Next.js Metadata API: titles, descriptions, canonical URLs, Open Graph, Twitter cards, robots meta, verification tags
- `sitemap.xml` and `robots.txt` generated from CMS content and settings
- Auto-generated branded social images (`/og`) when no image is uploaded
- schema.org JSON-LD: Organization, WebSite, BreadcrumbList, Service (sectors), SoftwareApplication (products),
  AboutPage, ContactPage, ItemList
- `manifest.webmanifest`, favicons & Apple touch icon, `/llms.txt` summary for AI assistants
- Static pages with incremental regeneration (fast), on-demand refresh after every CMS edit
- Semantic HTML, skip link, keyboard-accessible menus, `prefers-reduced-motion` support, security headers

## 4. Deploy

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for step-by-step guides:

- **cPanel / Plesk / Virtualmin** (Node.js apps via Phusion Passenger) — option 1
- **Docker** (`docker compose up -d --build`) — option 2
- VPS with PM2 (`ecosystem.config.js`)

## Project layout

```
backend/            NestJS CMS
  src/              API (auth, content, media, JSON store)
  admin/            Admin panel (static, no build step)
  seed/             Default content copied on first start
  storage/          ← your data (created at runtime, git-ignored)
  app.js            Startup file (Passenger / npm start)
frontend/           Next.js website
  src/app/          Routes, sitemap, robots, OG images, API routes
  src/components/   UI components
  src/lib/          CMS client, SEO helpers
  server.js         Startup file (Passenger / npm start)
scripts/            setup / dev / start / package (cross-platform Node scripts)
docker-compose.yml  Docker option
```
