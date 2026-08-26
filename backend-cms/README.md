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
network.

To use a LAN address, copy `.env.example` to `.env`. Set
`PAYLOAD_PUBLIC_SERVER_URL` to the URL that you open in the browser. Compose
passes the value to both Next and Payload. List any other allowed browser
origins in `PAYLOAD_ALLOWED_ORIGINS`, separated by commas.

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
   browser. Replace the example `PAYLOAD_SECRET` with a long development secret.

3. Install the locked dependencies and start Payload:

   ```bash
   npm ci
   npm run dev
   ```

4. Open `http://localhost:3001/admin`.

Keep these values for local development only. Production deployment owns its
database credentials, Payload secret, public URL, and Compose configuration.
