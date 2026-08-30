# Backend CMS

The Backend CMS is a Payload application with native authentication and a
PostgreSQL database. It runs independently from the public Vite site on
`http://localhost:3001`. Run its Make commands from `backend-cms/`.

## Run with Docker Compose

Docker Compose is the expected local setup. Build and start Payload and
PostgreSQL:

```bash
cd backend-cms
make build
make start
```

Open `http://localhost:3001/admin`. The default development configuration
publishes Payload on port `3001` and keeps PostgreSQL private to the Compose
network. It allows browser requests from the public Vite site on
`http://localhost:3000` and the Backend CMS on `http://localhost:3001`. The
Payload Admin loads News Article Live Preview from
`http://localhost:3000/preview/news/<document-id>`.

To use a LAN address, copy `.env.example` to `.env`. Set
`PAYLOAD_PUBLIC_SERVER_URL` to the Backend CMS origin that you open in the
browser. Set `PAYLOAD_PUBLIC_SITE_ORIGIN` to the public Vite site origin.
Compose passes both values to Payload. List any additional allowed browser
origins in `PAYLOAD_ALLOWED_ORIGINS`, separated by commas. Use explicit origins.
Do not use `*`.

Run the remaining Make targets from `backend-cms/`:

```bash
make logs
make stop
make start
make down
```

`make stop` stops the containers. `make down` also removes the containers and
network. Both commands preserve the `postgres_data` and `payload_media` named
volumes.

To delete the local database and media data, confirm the destructive command:

```bash
make destroy CONFIRM=destroy
```

## Load News Articles

### Load the Local News Seed

Start the development application before you load the six repository fixtures.
Run this command from `backend-cms/`:

```bash
docker compose -f compose.yml -f compose.dev.yml exec payload npm run seed:news
```

The command publishes the fixtures for local public-site testing. A repeat run
skips matching News Articles. To replace their imported content, pass the
explicit overwrite flag:

```bash
docker compose -f compose.yml -f compose.dev.yml exec payload npm run seed:news -- --overwrite
```

`seed:news` refuses to run when `NODE_ENV` is `production`. Payload does not run
the Local News Seed during startup or migrations.

### Import an Approved News Dataset

Make the approved JSON file available inside the Payload runtime. Run the
import command in that runtime and supply the file path:

```bash
npm run import:news -- --file /path/to/approved-news.json
```

The file must contain a JSON array. Each record uses this shape:

```json
[
  {
    "legacyId": "existing-public-news-identifier",
    "title": "Imported News Article",
    "excerpt": "A short introduction for public news lists.",
    "body": [
      "The first article paragraph.",
      "The second article paragraph."
    ],
    "publishedAt": "2026-08-30T12:00:00.000Z",
    "category": "Press",
    "featured": false,
    "status": "published"
  }
]
```

`category` accepts `Press`, `Programs`, `Research`, `Partnerships`, or
`Chapters`. `status` is required and accepts `draft` or `published`. The
importer rejects a record with a missing or invalid field and continues with
the remaining records.

The importer uses `legacyId` as the initial Public News Slug. On later runs, it
matches that value against current and Previous News Slugs. The default import
skips a matching News Article. To update its imported fields and requested
status, select overwrite behavior:

```bash
npm run import:news -- --file /path/to/approved-news.json --overwrite
```

Overwrite keeps the Payload document ID, current Public News Slug, Previous
News Slugs, and First Publication. Every run lists each created, skipped,
updated, and rejected record, then prints totals for all four outcomes. The
command exits with a nonzero status when it rejects a record or cannot read the
dataset.

## Run Payload directly with npm

Use Node.js 20.9 or newer and an external PostgreSQL database for direct
development. The PostgreSQL service in the default Compose configuration is
not available on a host port.

1. Create the local environment file:

   ```bash
   cd backend-cms
   cp .env.example .env
   ```

2. Set `DATABASE_URI` in `.env` to a PostgreSQL database that your host can
   reach. Set `PAYLOAD_PUBLIC_SERVER_URL` to the URL that you open in the
   browser. Set `PAYLOAD_PUBLIC_SITE_ORIGIN` to the independently running public
   site origin. Replace the example `PAYLOAD_SECRET` with a long development
   secret.

3. Install the locked dependencies and start Payload:

   ```bash
   npm ci
   npm run dev
   ```

4. Open `http://localhost:3001/admin`.

Keep these values for local development only. In production, set
`PAYLOAD_PUBLIC_SERVER_URL` to the public Backend CMS origin and
`PAYLOAD_PUBLIC_SITE_ORIGIN` to the public-site origin. Set the public site's
`VITE_BACKEND_CMS_ORIGIN` to the same Backend CMS origin. Production deployment
also owns its database credentials, Payload secret, and Compose configuration.
