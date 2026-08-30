# Backend CMS

The Backend CMS is a Payload application with native authentication and a
PostgreSQL database. It runs independently from the public Vite site on
`http://localhost:3001`.

## Run with Docker Compose

Docker Compose is the expected local setup. From the repository root, build and
start Payload and PostgreSQL:

```bash
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

Run the same Make targets from either the repository root or `backend-cms/`:

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
