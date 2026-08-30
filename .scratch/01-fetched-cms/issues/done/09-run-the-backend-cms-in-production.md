# 09 — Run the Backend CMS in production

**What to build:** Let an operator build the checked-out Backend CMS release and
run Payload with PostgreSQL through the production Compose path, with persistent
data, health checks, and readiness blocked by failed migrations.

**Blocked by:** 01 — Run the Backend CMS locally; 02 — Publish and read one News
Article

**Status:** closed

- [x] The production image builds from the checked-out release through the
  documented Make command without requiring an external image registry.
- [x] The production Compose application contains only Payload and PostgreSQL,
  uses no source mounts, and leaves the reverse proxy outside the stack.
- [x] Only Payload is exposed to the host or ingress network, while PostgreSQL
  remains private.
- [x] PostgreSQL data and Payload media use separate production volumes.
- [x] The production override defines suitable Payload health checks and restart
  behavior.
- [x] Backend CMS Make targets accept the production environment for build,
  start, stop, logs, down, and destroy operations.
- [x] Production initialization runs every committed outstanding schema
  migration before Payload becomes ready or serves requests.
- [x] A failed migration keeps Payload unready and prevents it from serving
  application requests.
- [x] `stop` and `down` preserve production volumes, and `destroy` requires
  explicit confirmation before removing them.
- [x] Smoke checks cover a successful production start and an intentionally
  failed migration.

## Comments

- 2026-08-30: Completed the production Compose path. The checked-out release
  builds through `make -C backend-cms build ENV=prod`. Payload runs the
  committed baseline migration before Next starts and reports database-aware
  readiness at `/api/health`. The production project exposes only Payload,
  keeps PostgreSQL private, uses separate database and media volumes, and
  preserves both markers across `stop` and `down`. The failure smoke check ran
  an intentional migration error twice under the restart policy. Payload never
  became healthy or accepted a request. Fifteen focused Backend CMS tests, 21
  integration tests, Backend CMS typechecking, the public production build,
  and both production smoke checks pass. The public suite has 137 passing tests
  and the same three unrelated assertion failures recorded by earlier tickets.
  The smoke checks removed their temporary containers, volumes, and images.
