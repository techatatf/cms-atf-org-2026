# 09 — Run the Backend CMS in production

**What to build:** Let an operator build the checked-out Backend CMS release and
run Payload with PostgreSQL through the production Compose path, with persistent
data, health checks, and readiness blocked by failed migrations.

**Blocked by:** 01 — Run the Backend CMS locally; 02 — Publish and read one News
Article

**Status:** ready-for-agent

- [ ] The production image builds from the checked-out release through the
  documented Make command without requiring an external image registry.
- [ ] The production Compose application contains only Payload and PostgreSQL,
  uses no source mounts, and leaves the reverse proxy outside the stack.
- [ ] Only Payload is exposed to the host or ingress network, while PostgreSQL
  remains private.
- [ ] PostgreSQL data and Payload media use separate production volumes.
- [ ] The production override defines suitable Payload health checks and restart
  behavior.
- [ ] Backend CMS Make targets accept the production environment for build,
  start, stop, logs, down, and destroy operations.
- [ ] Production initialization runs every committed outstanding schema
  migration before Payload becomes ready or serves requests.
- [ ] A failed migration keeps Payload unready and prevents it from serving
  application requests.
- [ ] `stop` and `down` preserve production volumes, and `destroy` requires
  explicit confirmation before removing them.
- [ ] Smoke checks cover a successful production start and an intentionally
  failed migration.
