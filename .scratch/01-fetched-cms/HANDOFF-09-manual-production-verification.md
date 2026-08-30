# Manually verify the production Backend CMS

Status: Pending human verification

Commit `f3636ec` completed [Run the Backend CMS in production](issues/done/09-run-the-backend-cms-in-production.md).
Complete this check before you start [Prove the Fetched-CMS release path](issues/10-prove-the-fetched-cms-release-path.md).

Use a disposable production configuration. Do not use live data.

## Configure and start production

```bash
cp backend-cms/.env.prod.example backend-cms/.env.prod
chmod 600 backend-cms/.env.prod
```

Open `backend-cms/.env.prod` in your usual file-editing app. Replace the example
database password and Payload secret with long random values. Change the three
`example.org` settings to the local URLs used for this disposable check:

```dotenv
PAYLOAD_PUBLIC_SERVER_URL=http://127.0.0.1:3001
PAYLOAD_PUBLIC_SITE_ORIGIN=http://127.0.0.1:3000
PAYLOAD_ALLOWED_ORIGINS=http://127.0.0.1:3001,http://127.0.0.1:3000
```

Keep the password in `DATABASE_URI` identical to `POSTGRES_PASSWORD`. Then run:

```bash
make -C backend-cms build ENV=prod
make -C backend-cms start ENV=prod
make -C backend-cms logs ENV=prod
```

Stop following the logs with `Ctrl-C` after Payload becomes ready.

## Check the running application

- Open `http://127.0.0.1:3001/admin`.
- Run `curl --fail http://127.0.0.1:3001/api/health`. Expect `{"status":"ok"}`.
- Inspect the merged Compose configuration:

  ```bash
  docker compose --env-file backend-cms/.env.prod \
    -f backend-cms/compose.yml -f backend-cms/compose.prod.yml config
  ```

Confirm that the configuration has only Payload and PostgreSQL. Only Payload
must publish a host port. PostgreSQL must have no host port, and Payload must
have no source bind mount.

## Check persistence

Create a News Article and upload Media in the Payload Admin. Confirm that both
records survive each sequence:

```bash
make -C backend-cms stop ENV=prod
make -C backend-cms start ENV=prod

make -C backend-cms down ENV=prod
make -C backend-cms start ENV=prod
```

## Run the checks

```bash
npm --prefix backend-cms test
npm --prefix backend-cms run typecheck
npm --prefix backend-cms run test:production-smoke
```

The production smoke checks use temporary Docker projects. They cover a
successful migration, preserved database and media data, and an intentional
migration failure that keeps Payload unready.

## Check destructive protection

```bash
make -C backend-cms destroy ENV=prod
```

The command must refuse to delete the volumes without `CONFIRM=destroy`. Do not
add confirmation unless you intend to delete the disposable database and Media.

## Record the result

Add a dated comment to [Prove the Fetched-CMS release path](issues/10-prove-the-fetched-cms-release-path.md).
Record whether each section passed. Include the failed command and relevant log
lines if a check fails. Change its status to `ready-for-agent` only after every
section passes.

## Suggested skills

- Call `diagnosing-bugs` if any command or expected behavior fails.
- Call `technical-writing` when you record the verification result.
- Call `wayfinder` after the manual gate passes and work resumes on the release proof.
