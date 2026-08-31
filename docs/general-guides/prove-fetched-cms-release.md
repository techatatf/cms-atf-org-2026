# Prove the Fetched-CMS release

Use this guide to verify a checked-out Fetched-CMS release before work starts
on SEO-CMS. The proof has three parts: automated checks, a clean local workflow,
and a disposable Demo Rehearsal over HTTPS.

Do not use production data for the local workflow or the Demo Rehearsal.

## Keep each deployment pair isolated

Use these origins and Compose project names:

| Deployment | Public Site | Backend CMS | Compose project |
| --- | --- | --- | --- |
| Production Launch | `https://africantechnologyforum.org` | `https://cms.africantechnologyforum.org` | `atf-backend-cms-production` |
| Demo Rehearsal | `https://public-demo.africantechnologyforum.org` | `https://cms-demo.africantechnologyforum.org` | `atf-backend-cms-demo` |

Give each Backend CMS its own environment file, PostgreSQL password, Payload
secret, Admin and Editor accounts, PostgreSQL volume, and Media volume. Use a
separate Vercel project for each Public Site because
`VITE_BACKEND_CMS_ORIGIN` becomes part of the browser bundle at build time.

Never copy Demo Rehearsal data, Media, users, or secrets into the Production
Launch.

## Run the automated release checks

Install the locked dependencies before you start:

```bash
npm ci
npm --prefix backend-cms ci
```

Run the Public Site checks:

```bash
npm test
npm run build
```

Run the Backend CMS checks that do not need a running database:

```bash
npm --prefix backend-cms test
npm --prefix backend-cms run typecheck
npm --prefix backend-cms run build
```

Run the disposable production smoke checks on a Docker host:

```bash
npm --prefix backend-cms run test:production-smoke
```

The production smoke checks build the checked-out release. They prove successful
migration startup, database-aware readiness, `Secure` Editorial User cookies,
PostgreSQL and Media persistence across `stop` and `down`, and a failed-migration
readiness gate. The checks remove their temporary projects, images, and volumes.

## Prove a clean development workflow

Create the local configuration files:

```bash
cp .env.example .env
cp backend-cms/.env.example backend-cms/.env
```

Keep the default local origins unless another service already uses ports `3000`
or `3001`. To use isolated ports, set these values in `backend-cms/.env`:

```dotenv
PAYLOAD_DEV_BIND_ADDRESS=127.0.0.1
PAYLOAD_DEV_PORT=3301
PAYLOAD_PUBLIC_SERVER_URL=http://127.0.0.1:3301
PAYLOAD_PUBLIC_SITE_ORIGIN=http://127.0.0.1:3300
PAYLOAD_ALLOWED_ORIGINS=http://127.0.0.1:3300,http://127.0.0.1:3301
```

Set the matching Public Site value in `.env`:

```dotenv
VITE_BACKEND_CMS_ORIGIN=http://127.0.0.1:3301
```

Build and start the Backend CMS, then start the Public Site in a second
terminal. Add `-- --port 3300` to the Public Site command if you selected the
isolated ports above:

```bash
make -C backend-cms build
make -C backend-cms start
npm run dev
# Isolated Public Site alternative: npm run dev -- --port 3300
```

Open `http://localhost:3001/admin` and create the first Admin. Complete this
workflow with disposable content:

1. Create an Editor account as the Admin.
2. Sign in as the Editor.
3. Create a draft News Article with a hero image and non-empty alt text.
4. Open Live Preview and change the title, body, and image. Confirm that the
   preview updates before you save or publish.
5. Copy the preview iframe URL. Open
   `http://localhost:3000/preview/news/<document-id>` directly and confirm that
   the Public Site loads. Return to Live Preview and confirm that the populated
   Media relationship renders.
6. Publish the News Article. Confirm that it appears on the homepage, `/news`,
   `/news/<slug>`, and the Publications Newsroom panel.
7. Save a newer draft without publishing it. Open the public article in a
   private browser window and confirm that the published version remains.
8. Restore an earlier version in Payload. Confirm that the restored draft does
   not become public until you publish it.
9. Sign in as the Admin and change the published slug. Confirm that both the new
   URL and the Previous News Slug render the article. The old URL must replace
   the browser history entry with the current URL.

Run the REST integration checks against the running development PostgreSQL
service:

```bash
docker compose -f backend-cms/compose.yml -f backend-cms/compose.dev.yml \
  exec -T payload npm run test:integration
```

The integration checks create uniquely named records and remove them when the
run finishes.

## Check Visitor and failure behavior

Use a private browser window so that no Editorial User cookie is present.

1. Request a draft through the public REST API. Confirm that the response does
   not contain the draft.
2. Attempt to create, update, publish, restore, delete, and manage users without
   authentication. Confirm that Payload rejects each operation.
3. Stop the Backend CMS with `make -C backend-cms stop`.
4. Reload the homepage, `/news`, one News Article, and `/publications`.
5. Confirm that the shared layout and unrelated content remain visible.
6. Confirm that each affected news region waits no longer than five seconds,
   shows `News temporarily unavailable`, and does not retry automatically.
7. Select **Retry** once. Confirm that one new request starts.
8. Confirm that no bundled or last-known News Article replaces the failed data.
9. Start the Backend CMS with `make -C backend-cms start`, then select **Retry**.
   Confirm that the published content returns.
10. Block the hero-image request in browser developer tools. Confirm that
    `Image unavailable` replaces only the image and that the article text stays
    visible.

## Run the Demo Rehearsal

Run the checked-in wizard from the repository root:

```bash
ENV_FILE=/secure/path/backend-cms-demo.env \
  ./scripts/prove-fetched-cms-demo.sh
```

The wizard writes the Demo Rehearsal Backend CMS configuration to the selected
file, starts the isolated Compose project when you approve that step, and walks
you through the Vercel, DNS, reverse-proxy, HTTPS, workflow, and outage checks.
It does not change the Production Launch.

For the Demo Rehearsal Vercel project, use these settings:

| Setting | Value |
| --- | --- |
| Repository root | `.` |
| Build command | `npm run build` |
| Output directory | `dist` |
| `VITE_BACKEND_CMS_ORIGIN` | `https://cms-demo.africantechnologyforum.org` |
| `VITE_HOMEPAGE_ONLY_MODE` | `false` |

The checked-in `vercel.json` rewrites direct application routes to
`/index.html`. It also sends `X-Robots-Tag: noindex, nofollow` only when the
request host is `public-demo.africantechnologyforum.org`.

## Record the proof

Record the checked-out commit and the result of every command. Do not record
passwords, Payload secrets, session cookies, or database connection strings.

Add the following evidence to
`.scratch/01-fetched-cms/issues/10-prove-the-fetched-cms-release-path.md`:

- The Public Site and Backend CMS test counts and build results.
- The production smoke result, including the successful and failed-migration
  scenarios.
- The local Admin, Editor, Visitor, Live Preview, publication, restoration,
  Previous News Slug, outage, Media, and restart results.
- The deployed Demo Rehearsal commit and both origins.
- The HTTP result for direct `/preview/news/<document-id>` navigation.
- The Demo Rehearsal `X-Robots-Tag` value and proof that the Production Launch
  does not send that value.
- Confirmation that the Demo Rehearsal uses separate data, Media, users,
  secrets, and Vercel configuration.

Keep the issue open if any deployed check is missing. State the exact missing
access, command, URL, or observation so that the next operator can resume at
that check.
