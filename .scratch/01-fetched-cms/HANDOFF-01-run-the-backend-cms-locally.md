# Completion record: Run the Backend CMS locally

[Run the Backend CMS locally](issues/01-run-the-backend-cms-locally.md) was
completed on 2026-08-26. The approved scope and acceptance criteria remain in
that issue and the [Fetched-CMS PRD](PRD.md).

## Agreed decisions

- Complete the implementation in this effort. Do not create another planning
  map.
- Stop at the minimum native Payload Admin and `Users` authentication
  collection. Later tickets own News Articles, roles, seed data, and the Media
  collection.
- Use port `3001` for the Backend CMS.
- Keep PostgreSQL private in the default Compose configuration.
- Require developers who run `npm run dev` outside Compose to supply an
  external PostgreSQL `DATABASE_URI`.
- Require scripted checks and live Docker smoke checks before completion.

## Implementation

The fixed point was commit `dd3af47`. The current branch was `main`, which was
already two commits ahead of `origin/main` when work began.

The worktree has a Payload 3.88.0 and Next 16.3.0 application under
`backend-cms/`. Inspect the diff for the full file list. The main additions are
the shared and development Compose files, the development Dockerfile, the
minimum native Admin routes, the PostgreSQL adapter, generated Payload types,
and `tests/local-development.test.mjs`.

## Completion evidence

These checks passed:

```text
cd backend-cms && npm test
cd backend-cms && npm run typecheck
cd backend-cms && npm run build
make build
make start
```

The build produced the native Admin and Payload API routes. A request to
`http://localhost:3001/admin` returned HTTP 200 with the Payload dashboard.
Docker reported PostgreSQL as healthy with port `5432` available only inside
the Compose network. Docker created distinct `postgres_data` and
`payload_media` volumes.

The live persistence check inserted one marker row in PostgreSQL and one marker
file in the media volume. Both markers survived `make stop` followed by
`make start`. They also survived `make down` followed by `make start`. The
smoke-test table and file were removed after the check so Payload would not
pause at a schema data-loss prompt.

The direct-development check used a separate PostgreSQL 17 container published
only on `127.0.0.1:55432`. `npm run dev` used that database through
`DATABASE_URI`, and `http://localhost:3001/admin` returned HTTP 200. The direct
server and the temporary database container were stopped after the check.

`npm audit fix` replaced `monaco-editor@0.56.0` with `0.53.0`. This removed the
low finding and one moderate finding associated with DOMPurify. Five moderate
entries remain in Payload's `drizzle-kit` dependency chain. All five lead to
the same nested `esbuild@0.18.20` advisory, and npm reports no compatible fix.

These final checks passed:

```text
cd backend-cms && npm test
cd backend-cms && npm run typecheck
cd backend-cms && npm run build
make build
```

The repository-wide Vitest run completed with 113 passing tests and three
pre-existing public-site failures. Two failures assert older announcement
banner copy. One failure asserts an older What We Do link order. This ticket
does not change the affected files under `src/`.

The Compose services are stopped. The PostgreSQL and media volumes remain.

## Environment notes

The saved Docker Hub credential on this machine is expired. This session built
and pulled images anonymously with `DOCKER_CONFIG=/tmp/atf-docker-anonymous`.
The temporary config contains no saved credential.

The managed sandbox blocks child processes that Next starts during a build.
Inside the sandbox, Next reports an empty TypeScript `--showConfig` result.
Running the same `npm run build` with the approved elevated command succeeds.
Do not change the build script to work around that sandbox behavior.

The official blank scaffold used for reference remains at
`/tmp/atf-payload-scaffold-template-388`. It is not part of the worktree.

## Suggested skills

Call these skills in the next session:

- `implement` to finish the ticket and commit it.
- `tdd` for any additional checks at the approved Make, Compose, HTTP, or
  direct-development seams.
- `technical-writing` for the two README updates and the final issue note.
- `code-review` after all checks pass.
- `diagnosing-bugs` only if a new failure remains reproducible outside the
  known child-process sandbox restriction.
