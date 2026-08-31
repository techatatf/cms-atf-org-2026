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

If another service uses port `3001`, set `PAYLOAD_DEV_BIND_ADDRESS` and
`PAYLOAD_DEV_PORT` in `.env`. Keep `PAYLOAD_PUBLIC_SERVER_URL`,
`PAYLOAD_ALLOWED_ORIGINS`, and the Public Site's `VITE_BACKEND_CMS_ORIGIN`
aligned with the address that you open in the browser.

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

## Run in production

The production Compose application builds Payload from the checked-out release.
It runs Payload and PostgreSQL as the `atf-backend-cms-prod` project. The project
name keeps its volumes separate from local development.

Run these commands from the repository root:

1. Create the production environment file:

   ```bash
   cp backend-cms/.env.prod.example backend-cms/.env.prod
   chmod 600 backend-cms/.env.prod
   ```

2. Replace every example value in `.env.prod`. Keep `DATABASE_URI` aligned with
   `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`. URL-encode reserved
   characters in the database password inside `DATABASE_URI`.

3. Build and start the production application:

   ```bash
   make -C backend-cms build ENV=prod
   make -C backend-cms start ENV=prod
   make -C backend-cms logs ENV=prod
   ```

The default host binding is `127.0.0.1:3001`. Point the host reverse proxy at
that address. The reverse proxy stays outside this Compose application.
PostgreSQL has no host port.

The Payload container runs every outstanding migration before it starts the
Next server. The health check calls `/api/health`, which queries PostgreSQL. If
a migration fails, the restart policy retries the container. Payload does not
bind port `3001` or become healthy until all migrations succeed. Inspect the
error with `make -C backend-cms logs ENV=prod`.

To load production settings from another file, set `ENV_FILE` on every Make
command:

```bash
make -C backend-cms start ENV=prod ENV_FILE=/secure/path/backend-cms.env
```

Stop or remove the production containers without deleting their PostgreSQL and
media volumes:

```bash
make -C backend-cms stop ENV=prod
make -C backend-cms down ENV=prod
```

To delete both production volumes, confirm the destructive command:

```bash
make -C backend-cms destroy ENV=prod CONFIRM=destroy
```

### Create a schema migration

After you change the Payload schema, create a migration from `backend-cms/`:

```bash
npm run payload -- migrate:create describe_the_schema_change
```

Review and commit the generated TypeScript migration, its JSON snapshot, and
`src/migrations/index.ts`. Build a new production image from that commit.

### Run the production smoke checks

Run the smoke checks on a Docker host:

```bash
npm --prefix backend-cms run test:production-smoke
```

The checks build the production image and start temporary Compose projects.
One check verifies a successful migration and database-aware health response.
The other injects an intentional migration failure and verifies that Payload
stays unready and refuses requests. The checks remove their temporary
containers, volumes, and images when they finish.

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

## Prove a Fetched-CMS release

Use [Prove the Fetched-CMS release](../docs/general-guides/prove-fetched-cms-release.md)
for the complete release check. The guide keeps the Production Launch and Demo
Rehearsal isolated, defines the Public Site build-time configuration, and covers
the Admin, Editor, Visitor, Live Preview, outage, persistence, and migration
checks.
