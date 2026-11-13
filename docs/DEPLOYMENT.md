# Deployment guide

The site runs as **two Node.js apps**. The recommended domains are:

| App | Domain | Startup file | Folder |
| --- | --- | --- | --- |
| Website (Next.js) | `assert.gr` | `server.js` | `frontend/` |
| CMS + admin (NestJS) | `cms.assert.gr` | `app.js` | `backend/` |

Requirements: Node.js **20.9 or newer** (22 LTS recommended), ~1 GB RAM for building the website.

### Environment variables

**CMS (`backend/.env`)** — copy from `backend/.env.example`

| Variable | Production example |
| --- | --- |
| `PUBLIC_URL` | `https://cms.assert.gr` |
| `FRONTEND_URL` | `https://assert.gr` |
| `JWT_SECRET` | long random string |
| `REVALIDATE_SECRET` | long random string (**same** as the website) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | first admin account (only used when no users exist) |
| `DATA_DIR` / `UPLOADS_DIR` | default `./storage/...` – keep outside `public_html` |

**Website (`frontend/.env`)** — copy from `frontend/.env.example`

| Variable | Production example |
| --- | --- |
| `API_URL` | `https://cms.assert.gr` (or `http://127.0.0.1:<cms port>` on the same server) |
| `SITE_URL` | `https://assert.gr` |
| `REVALIDATE_SECRET` | same value as in the CMS |

Generate secrets with `openssl rand -hex 32` (or any password generator).
After the first login, set **Site & SEO settings → Public site URL** to `https://assert.gr`.

---

## Option 1 – cPanel (Setup Node.js App)

1. **Prepare the files.** On your computer run `npm run package`. This builds both apps into
   `release/assert-cms` and `release/assert-web` (recommended: shared hosting often lacks the memory
   to build Next.js). Alternatively upload the `backend` and `frontend` folders and build on the server.
2. **Upload** each folder outside `public_html`, e.g. `/home/USER/assert-cms` and `/home/USER/assert-web`
   (File Manager → upload zip → Extract, or SFTP/Git).
3. **Create the subdomain** `cms.assert.gr` (Domains → Create).
4. **CMS app:** *Software → Setup Node.js App → Create Application*
   - Node.js version: 22 (or 20.9+) · Application mode: Production
   - Application root: `assert-cms` · Application URL: `cms.assert.gr` · Startup file: `app.js`
   - Add the environment variables from the table above (or create `.env` in the folder)
   - **Create** → **Run NPM Install**
   - If you uploaded source instead of a release: open *Terminal*, paste the "Enter to the virtual
     environment" command shown on the app page, then run `npm run build`
   - **Restart** and open `https://cms.assert.gr/admin`
5. **Website app:** create a second application
   - Application root: `assert-web` · Application URL: `assert.gr` · Startup file: `server.js`
   - Environment variables from the table · **Run NPM Install** · (build with `npm run build` if needed) · **Restart**
6. Enable SSL for both domains (*SSL/TLS Status → Run AutoSSL*).
7. In the admin click **Refresh site** once.

> Passenger may start several processes per app. For instant updates after CMS edits, keep the
> website app at **one process** (ask your host, or set `PassengerMaxPool 1` / “Max instances 1”).
> Otherwise changes still appear within 5 minutes (`CMS_REVALIDATE_SECONDS`).

## Option 1 – Plesk (Node.js extension)

1. Install the **Node.js** extension (Extensions catalogue) if missing.
2. Create the subdomain `cms.assert.gr`. Upload `assert-cms` into its folder (e.g. `/cms.assert.gr`)
   and `assert-web` into the main domain folder (e.g. `/httpdocs/../assert-web` or `/httpdocs`).
3. For each domain: *Node.js* → **Enable Node.js**
   - Node.js version: 22 · Package manager: npm · Application mode: production
   - Document root: the app folder (for the website use `.../assert-web/public`) · Application root: the app folder
   - Application startup file: `app.js` (CMS) / `server.js` (website)
   - Custom environment variables: from the tables above
   - **NPM install** → (if source upload: *Run script* `build`) → **Restart App**
4. Enable *Let's Encrypt* SSL for both domains.

## Option 1 – Virtualmin

Virtualmin servers usually have root/SSH access, so the simplest robust setup is **PM2 + Apache/Nginx proxy**:

```bash
# as the virtual server user, in its home directory
git clone <repo> assert && cd assert          # or upload the files
npm run setup                                 # installs deps, creates .env files – then edit them
npm run build
npm i -g pm2
pm2 start ecosystem.config.js && pm2 save
pm2 startup                                   # run the printed command as root so apps restart on boot
```

Then for each virtual server (*Server Configuration → Website Options / Proxy Paths*):
proxy `/` of `assert.gr` to `http://127.0.0.1:3000` and `/` of `cms.assert.gr` to `http://127.0.0.1:4000`
(see `docker/nginx.conf.example` for the Nginx equivalent). Request Let's Encrypt certificates in
*Server Configuration → SSL Certificate*.

If your Virtualmin has Phusion Passenger enabled, you can instead follow the cPanel steps (startup files
`app.js` / `server.js`).

## Option 2 – Docker

```bash
cp .env.docker.example .env      # edit SITE_URL, CMS_PUBLIC_URL, secrets, admin password
docker compose up -d --build
```

- Website: `http://SERVER:3000` · Admin: `http://SERVER:4000/admin`
- Data and uploads are stored in `./docker-data` on the host — back up this folder.
- Put a reverse proxy with TLS in front (Nginx example in `docker/nginx.conf.example`, or Traefik/Caddy).
- Update: `git pull && docker compose up -d --build`.
- Logs: `docker compose logs -f`.

The website image is built without the CMS running; it fills itself with content when the CMS starts
(the CMS triggers a refresh 5 seconds after boot).

---

## Backups

Everything is in the CMS `storage` folder (`docker-data` with Docker):

- `storage/data/*.json` – content, settings, messages, users (hashed passwords)
- `storage/data/.backups/` – the last 20 versions of each file
- `storage/uploads/` – media

You can also download a JSON backup from **Admin → Backup & restore**.

## Updating content structure

Fields shown in the admin come from `backend/src/content/schema.ts`. Add a field there, rebuild the CMS,
and use it in the matching page under `frontend/src/app/`.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Website shows “Something went wrong” | The website cannot reach the CMS: check `API_URL` and that the CMS app is running (`/api/health`). |
| Edits do not show on the site | `REVALIDATE_SECRET` must match in both apps; `FRONTEND_URL` must be the public website URL. Click **Refresh site** in the admin. |
| Admin login fails after deploy | Users are created only once. Delete `storage/data/users.json` to recreate the first admin from `.env`. |
| `next build` killed on shared hosting | Build locally with `npm run package` and upload the `release` folders. |
| Uploads fail | Max 15 MB per file; increase the proxy limit (`client_max_body_size` in Nginx). |
