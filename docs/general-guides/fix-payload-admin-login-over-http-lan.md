# Fix Payload Admin login over a plain HTTP LAN address

Use this guide when Payload Admin accepts a login at a URL such as
`http://192.168.1.99:3001`, but the browser immediately loses the authenticated
user. The usual symptom is a successful login followed by
`GET /api/users/me` returning `user: null`.

This repository includes a version-pinned fix for Payload 3.88.0. The steps
below explain how to identify the failure, apply the fix to an existing
development container, and verify its security checks.

## Inspect the authenticated follow-up request

Do not use the login response alone to diagnose this problem. A successful
login can set a valid cookie that Payload rejects on the next request.

1. Open the browser developer tools.
2. Select the **Network** panel.
3. Log in to Payload Admin.
4. Open the request to `GET /api/users/me`.
5. Record only whether the authentication cookie and these headers are present.

Never copy a cookie value, token, account identifier, or response user data
into an issue or diagnostic file. A safe record looks like this:

```text
COOKIE_PRESENT=y
ORIGIN_HEADER=absent
HOST_HEADER=192.168.1.99:3001
FETCH_SITE_HEADER=absent
REFERER_ORIGIN=http://192.168.1.99:3001
USER_IS_NULL=y
```

If the request includes the cookie but returns `user: null`, the browser sent
the cookie. Cookie storage and delivery are not the failing layer.

## Confirm the LAN origin configuration

Set `PAYLOAD_PUBLIC_SERVER_URL` to the exact origin that you open in the
browser. Include the scheme and port, but do not include a path.

For the example address, `backend-cms/.env` contains:

```dotenv
PAYLOAD_PUBLIC_SERVER_URL=http://192.168.1.99:3001
PAYLOAD_ALLOWED_ORIGINS=http://localhost:3001,http://192.168.1.99:3001
```

`backend-cms/src/payload.config.ts` adds these origins to both `cors` and
`csrf`. `backend-cms/next.config.ts` adds the public hostname to
`allowedDevOrigins`.

Restart Payload after you change the environment. Repeat the
`GET /api/users/me` check. Continue to the next section only when all these
conditions are true:

- The request contains `payload-token`.
- `Origin` is absent.
- `Sec-Fetch-Site` is absent.
- `Referer` has the configured LAN origin.
- The response contains `user: null`.

## Recognize the Payload 3.88.0 regression

Browsers can omit Fetch Metadata headers on plain HTTP requests to a
non-localhost address. The Fetch Metadata specification limits the headers to
potentially trustworthy URLs.

Payload 3.88.0 checks `Origin` and then `Sec-Fetch-Site` while extracting a JWT
from the cookie. When both headers are absent and `config.csrf` is non-empty,
Payload rejects the cookie before JWT verification. Correct CORS settings and
a valid JWT cannot repair a request that fails at this earlier check.

This behavior is tracked in
[Payload issue #17565](https://github.com/payloadcms/payload/issues/17565).
[Payload PR #17897](https://github.com/payloadcms/payload/pull/17897) adds a
referrer fallback. The restriction came from
[Payload PR #15751](https://github.com/payloadcms/payload/pull/15751), which
addressed
[CVE-2026-34749](https://github.com/payloadcms/payload/security/advisories/GHSA-p6mr-xf3r-ghq4).
The [Fetch Metadata specification](https://www.w3.org/TR/fetch-metadata/)
defines the browser behavior.

The useful shortcut is to inspect Payload's cookie extraction after you prove
that the browser sent the cookie. Do not spend more time changing cookie flags
or CORS values at that point.

## Use the repository patch

The repository patch is
[`backend-cms/patches/payload+3.88.0.patch`](../../backend-cms/patches/payload+3.88.0.patch).
It follows the upstream change. When both primary headers are absent, Payload
parses the `Referer` and accepts the cookie only if that origin already exists
in `config.csrf`.

The fallback rejects all these cases:

- The request has no `Referer`.
- The `Referer` is malformed.
- The `Referer` origin is not in `config.csrf`.
- `Sec-Fetch-Site` explicitly reports `cross-site`.

Do not replace the patch with an unconditional cookie fallback. Do not trust
the `Host` header by itself. Either change would weaken the CSRF protection that
caused this regression.

`patch-package` applies the patch from the `postinstall` script in
`backend-cms/package.json`. The Backend CMS Dockerfile copies `patches/` before
`npm ci`, so a clean image build applies the same patch.

To install dependencies outside Docker, run:

```bash
cd backend-cms
npm ci
```

`npm ci` must print this result:

```text
Applying patches...
payload@3.88.0 ✔
```

## Refresh an existing development container

The development stack stores `/app/node_modules` in a named volume. A rebuilt
image does not replace packages already stored in that volume.

Apply the patch inside the running Payload container, then restart only that
service:

```bash
cd backend-cms
docker compose -f compose.yml -f compose.dev.yml exec -T payload npm install
docker compose -f compose.yml -f compose.dev.yml restart payload
```

These commands preserve the PostgreSQL and media volumes. Do not run
`make destroy` for an authentication problem.

## Verify the fix

Run the automated checks:

```bash
cd backend-cms
npm test
npm run typecheck
npm run build
```

The tests in
[`backend-cms/tests/local-development.test.mjs`](../../backend-cms/tests/local-development.test.mjs)
use a synthetic token. They confirm that an allowed LAN referrer works without
`Origin` or `Sec-Fetch-Site`. They also confirm that missing, mismatched, and
explicitly cross-site evidence remains rejected.

Log in again from the LAN browser. The request state must now end with:

```text
COOKIE_PRESENT=y
ORIGIN_HEADER=absent
FETCH_SITE_HEADER=absent
USER_IS_NULL=n
```

Confirm that the browser remains on `/admin` and that `/api/users/me` returns
the authenticated user. Keep the user object and cookie value out of saved
diagnostics.

## Separate build failures from the login failure

Next.js 16.3.0 can lose the captured output from `tsc --showConfig` under
Node.js 24.20.0 even when TypeScript exits successfully. This repository sets
`experimental.useTypeScriptCli: false` in `backend-cms/next.config.ts` to use
the compiler API during the Next.js build. `npm run typecheck` still runs
`tsc --noEmit` directly.

A Docker credential error while pulling a base image is also separate from the
Payload login failure. Resolve the local Docker login before treating that
error as an application build failure.

## Remove the patch after a Payload upgrade

The patch filename pins it to Payload 3.88.0. After Payload releases the
referrer fallback, upgrade all Payload packages together. Then follow this
sequence:

1. Remove `backend-cms/patches/payload+3.88.0.patch`.
2. Remove the `postinstall` script and the `patch-package` development
   dependency if no other patches use them.
3. Remove the Dockerfile step that copies `patches/` if the directory is empty.
4. Run the automated checks.
5. Repeat the LAN browser test with absent `Origin` and `Sec-Fetch-Site`
   headers.

Keep the patch if the upgraded Payload version still fails either the allowed
referrer test or a security-negative test.
