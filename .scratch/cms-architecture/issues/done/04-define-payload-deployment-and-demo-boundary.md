# Define the Payload deployment and public-site boundary

Status: closed
Assignee: Codex
Parent: `docs/CMS Architecture Wayfinding.md`
Label: `wayfinder:grilling`

## Question

How should the selected Payload CMS be arranged as an independently runnable
Backend CMS alongside the public ATF site, including its repository and local
development boundaries, public REST API, administration surface, article and
media persistence, preview and published-content delivery, and portable
production topology?

## Comments

- 2026-08-19: Unblocked by completion of [Select the CMS architecture from the
  evaluated options](03-select-cms-architecture.md). Payload with PostgreSQL is
  selected; this ticket must define its concrete deployment and demo boundary
  without reopening the product choice.
- 2026-08-19, round 1: The stakeholder corrected the lifecycle premise. There
  is no Demo Deployment or later promotion step: the first deployed Payload
  environment is a Production Launch and supplies the public ATF site
  immediately. Production-readiness precautions and private configuration are
  already planned by the stakeholder and must not become extra gates in this
  architecture session.
- 2026-08-19, round 1: The repository boundary is a top-level `backend-cms/`
  directory. It will be a self-contained Payload/Next.js full-stack application
  using Payload's native administration, authentication, content management,
  and public REST API. The existing Vite application remains independently
  runnable and learns the CMS origin through configuration.
- 2026-08-19, round 1: Vercel and Nginx Proxy Manager may host or route the
  deployed applications, but neither is an application dependency. Local
  development must work with `bun run dev` at the repository root and
  `cd backend-cms && npm run dev` in another terminal, using separate ports and
  non-production data. The Backend CMS will need a non-conflicting local port
  because the current public-site script already uses port 3000.
- 2026-08-19, round 1: The stakeholder rejected proxying Payload underneath
  `atf.org/cms` and rejected an API path shaped like `/cms/api`. The intended
  shape is a separately addressed Backend CMS origin whose native admin and
  public REST routes are consumed directly; exact production hostnames and
  ingress configuration are deployment concerns rather than app requirements.
- 2026-08-19, repository fact: A second repository is not required for Vercel
  compatibility. Vercel builds the configured project root, and nested apps are
  deployed as separate projects only when separately configured. Keeping
  `backend-cms/` in this repository therefore remains viable.
- 2026-08-19, learning checkpoint: The stakeholder's baseline model is sound:
  Payload stores CMS documents and exposes them through an API that the public
  site consumes. The unresolved distinction is when the public site reads that
  API at browser runtime, during a static build, through a server runtime, or
  through a hybrid. The ticket remains open until publishing, preview,
  availability fallback, media delivery, and portable production service
  boundaries are selected after the Payload publishing lesson.
- 2026-08-20, round 2: The stakeholder selected a phased hybrid delivery
  strategy. [Fetched-CMS](../../01-fetched-cms/PRD.md) is the first
  implementation phase. It fetches published news through optional browser-time
  REST requests and accepts that the initial HTML does not yet meet the final
  search requirements. [SEO-CMS](../../02-seo-cms/PRD.md) follows it with a
  publish webhook, provider-neutral content build, and prerendered initial HTML
  across indexable ATF routes. Both phases use the same Payload application,
  schema, query layer, and public URL policy.
- 2026-08-20, round 2: Editors need immediate private preview, while public
  publication may take a few minutes once SEO-CMS introduces triggered builds.
  Search-ready initial HTML is required in SEO-CMS but does not block
  Fetched-CMS. Published slugs remain stable by default. An intentional Admin
  change must preserve the old slug as a permanent redirect.
- 2026-08-20, round 2: The ticket remains open for the exact Fetched-CMS news
  fallback, request timeout behavior, media delivery and outage behavior, and
  portable Payload, PostgreSQL, and media service topology.
- 2026-08-20, round 3: If a Fetched-CMS request fails or times out, the affected
  public component shows "News temporarily unavailable." The rest of the site
  remains usable. If Payload responds successfully but has no matching article,
  the article route shows "Article not found." Fetched-CMS does not bundle a
  last-known news snapshot. The ticket remains open for retry behavior, media
  delivery during an outage, and the portable production service topology.
- 2026-08-20, round 4: Each Fetched-CMS request stops after five seconds. The
  public site does not retry in the background and offers a visible **Retry**
  action after failure. Fetched-CMS loads media from Payload URLs and replaces
  failed images with a neutral placeholder. SEO-CMS copies published media into
  its static output so the public deployment remains independent of live
  Payload media. The ticket remains open for the portable local and production
  service topology.
- 2026-08-20, round 5: Docker Compose is the documented way to run Payload and
  PostgreSQL in both local development and production. Developers may run
  Payload directly with `npm run dev`, but project documentation treats that as
  a secondary path. The production Compose application contains only Payload
  and PostgreSQL. PostgreSQL data and Payload media use separate persistent
  volumes. PostgreSQL remains private to the Compose network. Only Payload is
  exposed to the host or ingress network, and the reverse proxy remains outside
  the application stack. The ticket remains open for the Compose file layout
  and the Payload development container behavior.
- 2026-08-20, round 6: The shared `backend-cms/compose.yml` defines services,
  networks, and volumes. `compose.dev.yml` adds source mounts, hot reload, local
  ports, and development settings. `compose.prod.yml` selects the production
  image, health checks, and restart policy without source mounts.
  `backend-cms/Makefile` exposes `start`, `stop`, `build`, `logs`, `down`, and
  `destroy`. It defaults to development and accepts `ENV=prod`. The `destroy`
  target requires explicit confirmation because it removes PostgreSQL and media
  volumes. The ticket remains open for production image and migration behavior.
- 2026-08-20, round 7: Production builds the Payload image from the checked-out
  release with `make -C backend-cms build ENV=prod`. The first release does not
  require an external image registry. Payload runs committed PostgreSQL
  migrations during production initialization. If a migration fails, the
  container must not become ready or serve requests.
- 2026-08-20, resolution: The Backend CMS is a self-contained Payload and
  PostgreSQL application under `backend-cms/`. Docker Compose is the documented
  path for development and production, with a shared file and separate
  development and production overrides. The production stack contains only
  Payload and PostgreSQL. It uses separate persistent volumes for PostgreSQL
  and media, keeps PostgreSQL private, and leaves the reverse proxy outside the
  application. Fetched-CMS first delivers published content and media through
  optional browser-time REST requests with bounded failure states. SEO-CMS then
  adds publish-triggered prerendering and copies media into the static site.
  Payload Live Preview remains the immediate private editor path. Stable slugs,
  explicit redirects, checked-out-release image builds, fail-closed startup
  migrations, and the documented Make targets complete the portable deployment
  boundary.
