# Handoff: debug Payload login over the LAN

Continue diagnosing why Payload Admin does not retain an authenticated user when
opened over the LAN. The local CMS ticket is implemented at commit `8c68628`,
and the current worktree contains uncommitted follow-up fixes. Do not discard or
rewrite those changes before inspecting them.

## Read first

- Original ticket: [Run the Backend CMS locally](issues/01-run-the-backend-cms-locally.md)
- Product requirements: [Fetched-CMS PRD](PRD.md)
- Local usage notes: [`backend-cms/README.md`](../../backend-cms/README.md)
- Current implementation: `git diff` from commit `8c68628`

## Unresolved symptom

The user can create an account and submit the login form. Payload logs a
successful `POST /api/users/login` with HTTP 200, then the browser requests
`/admin` and returns to `/admin/login`. In both a normal window and a private
window, `GET /api/users/me` returns HTTP 200 with:

```json
{"user":null,"message":"Account"}
```

The browser reports that it stores and sends a cookie, but Payload still treats
the request as anonymous. The user reports the same result after the latest
origin changes and a Payload container recreation.

Do not request, display, or record the user's email, password, JWT, cookie
value, Payload secret, database credentials, or session identifiers.

## Fixes already present in the worktree

Seven application files are modified but not committed:

- `backend-cms/next.config.ts` redirects `/` to `/admin` and derives
  `allowedDevOrigins` from `PAYLOAD_PUBLIC_SERVER_URL`.
- `backend-cms/compose.dev.yml` passes through `PAYLOAD_PUBLIC_SERVER_URL` and
  `PAYLOAD_ALLOWED_ORIGINS` instead of hard-coding the localhost URL.
- `backend-cms/src/payload.config.ts` derives `serverURL`, `cors`, and `csrf`
  from those environment variables.
- `backend-cms/.env.example` and `backend-cms/README.md` document the allowed
  origins and LAN setup.
- `backend-cms/tests/local-development.test.mjs` verifies Compose receives the
  configured LAN URL and allowed origins.
- `backend-cms/package.json` has a user-owned newline-only change. Preserve it
  unless the user explicitly asks to change it.

The ignored `backend-cms/.env` currently sets the safe-to-record public value
`PAYLOAD_PUBLIC_SERVER_URL=http://192.168.1.99:3001`. Do not inspect or expose
its secret values.

The root 404 and LAN white page are resolved by the current changes. `/` now
redirects to `/admin`, and Next serves the development chunks to the LAN host.
The authentication problem remains.

## Evidence collected

The original Compose file overrode the user's `.env` LAN URL with
`http://localhost:3001`. That mismatch mattered because Payload's installed
source handles cookie authentication as follows:

- `backend-cms/node_modules/payload/dist/auth/extractJWT.js` accepts a cookie
  on a request with an `Origin` header only when that origin is present in
  `config.csrf` or the CSRF list is empty.
- `backend-cms/node_modules/payload/dist/config/sanitize.js` adds a non-empty
  `config.serverURL` to `config.csrf`.
- `backend-cms/node_modules/payload/dist/auth/strategies/jwt.js` catches JWT,
  user lookup, and session lookup failures without surfacing their cause to the
  browser.

After the follow-up changes and container recreation, the running container
reported these public values:

```text
PAYLOAD_PUBLIC_SERVER_URL=http://192.168.1.99:3001
PAYLOAD_ALLOWED_ORIGINS=http://localhost:3001
```

The code adds both values to Payload's CORS and CSRF origin lists. Even so,
`/api/users/me` still reports a null user, so the initial origin mismatch was
real but did not fully explain the failure.

These checks passed after the follow-up changes:

```text
cd backend-cms && npm test
cd backend-cms && npm run typecheck
cd backend-cms && npm run build
```

The live root route returns a temporary redirect to `/admin`, `/admin` returns
HTTP 200, and the LAN JavaScript chunks return HTTP 200. At handoff time,
`make start` had PostgreSQL healthy and Payload ready. Verify current container
state instead of assuming it is unchanged.

## Resume here

1. Inspect `git status`, `git diff`, and the current Compose service state.
   Preserve all user-owned and uncommitted changes.
2. Reproduce one login with the user in a tight human-in-the-loop cycle. In the
   browser request for `/api/users/me`, establish whether the `Cookie` header
   specifically includes a `payload-token` cookie and record only the presence
   or absence of that cookie. Record the exact `Origin`, `Host`, and
   `Sec-Fetch-Site` header values; never record the cookie value.
3. Compare the observed origin with Payload's runtime `config.csrf` and
   `config.serverURL`, not only the process environment. Use temporary,
   explicitly tagged debug output if runtime inspection is required, and
   redact all authentication material.
4. If the cookie reaches `extractJWT`, isolate whether failure occurs during
   JWT verification, user lookup, or session lookup in the JWT strategy. Its
   broad catch currently hides those distinctions. Prefer a narrow regression
   test before changing behavior.
5. Remove any temporary instrumentation. Prove the fix by showing that
   `/api/users/me` returns a non-null user and that `/admin` stays logged in
   over `http://192.168.1.99:3001`.
6. Run the local tests, type check, build, and focused live LAN checks. Review
   the final diff before asking whether the user wants it committed.

## Completion criteria

- Login persists over the configured LAN URL.
- `/api/users/me` returns the authenticated user without exposing credentials
  or tokens during diagnosis.
- The root redirect and LAN Admin asset loading continue to work.
- Automated checks cover the final configuration or code fix.
- Temporary logging is removed, the user's newline-only `package.json` change
  is preserved, and no unrelated files are modified.

## Suggested skills

- `diagnosing-bugs` for the evidence-driven authentication diagnosis.
- `tdd` if a code or configuration fix is needed.
- `code-review` before committing the completed fix.
- `technical-writing` if the LAN instructions or this handoff change.
