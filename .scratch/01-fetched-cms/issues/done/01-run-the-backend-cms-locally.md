# 01 — Run the Backend CMS locally

**What to build:** Give developers one documented local path that starts the
Backend CMS and PostgreSQL, exposes the native Payload Admin on a port that does
not conflict with the public site, and preserves both database and media data
across ordinary stops.

**Blocked by:** None — can start immediately

**Status:** closed

- [x] The default Backend CMS Make commands use the shared and development
  Compose configuration to start, stop, inspect, and remove the local services.
- [x] Payload starts with PostgreSQL, and a developer can open the native Admin
  without starting the public Vite site.
- [x] PostgreSQL is reachable by Payload but is not published to the host.
- [x] PostgreSQL data and Payload media use separate persistent volumes.
- [x] `stop` and `down` preserve both volumes, while `destroy` requires explicit
  confirmation before removing them.
- [x] Direct Backend CMS development without Compose remains available through
  the package's development command and uses documented non-production
  settings.
- [x] Automated or scripted checks validate the development Compose structure
  and the Make command wiring.

## Comments

- 2026-08-24: Partial implementation is ready for another agent. Continue from
  [the session handoff](../HANDOFF-01-run-the-backend-cms-locally.md). Both
  containers are stopped after the session wrote persistence markers. Do not
  run `destroy` before completing the restart and `down` checks.
- 2026-08-26: Completed the implementation and both live persistence checks.
  The database row and media file survived `stop`, `down`, and both restarts.
  Direct `npm run dev` returned HTTP 200 for the native Admin with a separate
  developer-supplied PostgreSQL connection. The focused tests, typecheck,
  Backend CMS build, and Docker image build pass. The repository-wide suite has
  113 passing tests and three pre-existing public-site assertion failures. See
  the [completion record](../HANDOFF-01-run-the-backend-cms-locally.md) for the
  commands, dependency audit result, and cleanup state.
