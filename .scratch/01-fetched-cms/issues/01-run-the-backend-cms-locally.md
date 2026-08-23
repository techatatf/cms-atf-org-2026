# 01 — Run the Backend CMS locally

**What to build:** Give developers one documented local path that starts the
Backend CMS and PostgreSQL, exposes the native Payload Admin on a port that does
not conflict with the public site, and preserves both database and media data
across ordinary stops.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] The default root and Backend CMS Make commands use the shared and
  development Compose configuration to start, stop, inspect, and remove the
  local services.
- [ ] Payload starts with PostgreSQL, and a developer can open the native Admin
  without starting the public Vite site.
- [ ] PostgreSQL is reachable by Payload but is not published to the host.
- [ ] PostgreSQL data and Payload media use separate persistent volumes.
- [ ] `stop` and `down` preserve both volumes, while `destroy` requires explicit
  confirmation before removing them.
- [ ] Direct Backend CMS development without Compose remains available through
  the package's development command and uses documented non-production
  settings.
- [ ] Automated or scripted checks validate the development Compose structure
  and the Make command wiring.
