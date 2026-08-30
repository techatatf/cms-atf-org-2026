# CMS Architecture Wayfinding

Status: Active at the CMS network and security boundary

## Destination

Produce a concise, presentation-like Markdown architecture brief for
stakeholder approval. Supported by linked evidence, it will record the selected
CMS, portable application and deployment topology, repository layout, security
boundaries, content delivery and preview behavior, persistence, migration
approach, principal trade-offs, and phased roadmap.

## Notes

- The first Payload deployment is a Production Launch that immediately supplies
  the public ATF site. There is no separate Demo Deployment or promotion stage.
- The stakeholder has independently planned production-readiness precautions
  and private deployment configuration. This wayfinding effort must not invent
  extra pre-production gates or require disclosure of those private plans.
- The public site and Backend CMS must remain independently runnable and must
  not require Vercel or Nginx Proxy Manager as application dependencies.

## Decisions so far

- [Define the CMS evaluation criteria and shortlist research frame](../.scratch/cms-architecture/issues/done/01-define-cms-evaluation-criteria.md)
  — Compare three viable products with a narrow custom baseline using hard
  gates and an evidence-led, ATF-specific build-versus-adopt assessment.
- [Research CMS candidates and the custom-build baseline](../.scratch/cms-architecture/issues/done/02-research-cms-candidates.md)
  — Carry Payload and WordPress as the front-runners, Drupal as the viable
  workflow-heavy reference, and custom as the high-ownership build baseline.
- [Select the CMS architecture from the evaluated options](../.scratch/cms-architecture/issues/done/03-select-cms-architecture.md)
  — Adopt Payload with PostgreSQL as ATF's code-owned CMS foundation, using its
  native capabilities before adding custom behavior for concrete needs.
- [Define the Payload deployment and public-site boundary](../.scratch/cms-architecture/issues/done/04-define-payload-deployment-and-demo-boundary.md)
  — Use a portable two-service Compose application and phase public delivery
  through Fetched-CMS before SEO-CMS adds static HTML and copied media.

### Repository and hosting boundaries

- The public ATF site may remain hosted on Vercel, but the application must not
  depend on Vercel-specific behavior.
- The Backend CMS will live in this repository under the top-level
  `backend-cms/` directory. A separate repository is unnecessary unless a later
  non-Vercel constraint supplies a concrete reason to split it.
- `backend-cms/` is a self-contained Payload/Next.js full-stack application
  with its own package scripts, native Payload administration and
  authentication, content model, API, and deployment configuration.
- Local development runs the public site with `bun run dev`. The documented
  Backend CMS path uses Docker Compose to run both Payload and PostgreSQL with
  non-production data. Direct `npm run dev` remains supported but is not the
  expected setup path.
- Docker Compose is the documented path for both local development and
  production. The production application contains only Payload and PostgreSQL.
  A reverse proxy may route Payload but remains outside the application stack.
- `backend-cms/compose.yml` defines the shared services, networks, and volumes.
  `compose.dev.yml` adds local source mounts, hot reload, ports, and development
  settings. `compose.prod.yml` selects the production image, health checks, and
  restart policy without mounting source code.
- `backend-cms/Makefile` provides `start`, `stop`, `build`, `logs`, `down`, and
  `destroy` targets. Development is the default, and `ENV=prod` selects the
  production override. The `destroy` target requires confirmation before it
  removes PostgreSQL and media volumes.
- Production builds the Payload image from the checked-out release. Payload
  runs committed PostgreSQL migrations during initialization and does not
  become ready when a migration fails.
- PostgreSQL data and Payload media use separate persistent volumes. PostgreSQL
  remains private to the Compose network. Only Payload is exposed to the host
  or ingress network.
- ATF already has an Ubuntu VPS and prefers operating its own database rather
  than using managed PostgreSQL.
- Payload CMS with PostgreSQL is selected. The portable Compose topology is
  settled. Exact VPS ingress and private infrastructure settings remain outside
  the application boundary.

### Initial CMS scope

- The first CMS release will manage news articles only.
- More content types can be added later.
- The CMS should serve nontechnical editorial users.
- Initial access control should include at least Admin and Editor roles.
- The desired minimal editorial workflow includes drafts, preview, revisions,
  and optional scheduled publishing, subject to support in the selected CMS.

### Application and authentication boundary

- The **Backend CMS** is the Payload full-stack application, not a custom
  general-purpose backend and not a frontend embedded into the Vite app.
- Editors use Payload's native administration and authentication on the
  Backend CMS origin. The design does not proxy it beneath `atf.org/cms`.
- Payload exposes published CMS content through public REST endpoints on its
  own origin. The public site receives that origin through configuration.
- The REST API keeps an ordinary API path such as `/api`; it is not nested under
  a path shaped like `/cms/api`.
- Payload's native authentication, authorization, and session behavior are the
  starting point. Any First Admin or role customization must be designed as a
  Payload-specific extension rather than as a replacement authentication app.
- Published CMS content should be readable through unauthenticated REST API
  routes so the public website does not need an API key to display it.
- Content creation, editing, publishing, deletion, and administrative actions
  should use authenticated and authorized REST API routes.
- The native Payload admin may hide or guard screens, but backend authorization
  is the security boundary: every protected operation must be rejected by the
  API when the caller lacks valid authentication or the required role.
- All communication must be encrypted in transit with HTTPS. HTTPS transport
  and endpoint authorization are separate protections; a route itself is not
  made secure merely by hiding or guarding it in the frontend.

### Public-site availability boundary

- The Vercel-hosted public site must remain available when the Backend CMS
  is unavailable because of maintenance, failure, or a network interruption.
- Every public-site component that consumes backend data must treat that data
  source as optional and handle timeouts, failed requests, and unavailable data
  without preventing the rest of the site from rendering.
- News is the only backend-managed content type in the first release.
- Any future backend-fed content that does not yet have a defined content model
  should render a neutral fallback such as "Data unavailable" or a later-agreed
  default rather than becoming a hard dependency of the public site.
- Fetched-CMS shows "News temporarily unavailable" when a CMS request fails or
  times out. A successful response with no matching slug shows "Article not
  found." The first phase does not bundle a last-known news snapshot.
- Fetched-CMS stops a CMS request after five seconds. It does not retry in the
  background. The failure state offers a visible **Retry** action.
- Fetched-CMS loads media from Payload URLs and shows a neutral placeholder when
  an image fails. SEO-CMS copies published media into the static site output so
  the deployed pages do not depend on live Payload media.
- Delivery will proceed through two implementation phases of the same Backend
  CMS:
  - [Fetched-CMS](../.scratch/01-fetched-cms/PRD.md) first proves the complete
    publishing path with optional browser-time REST reads. It accepts that CMS
    content and article metadata may not appear in the initial HTML.
  - [SEO-CMS](../.scratch/02-seo-cms/PRD.md) adds a publish webhook, a
    provider-neutral content build, and meaningful initial HTML for all
    indexable public routes.
- Editors receive immediate private preview through Payload Live Preview. This
  preview path is separate from published delivery to ordinary visitors.
- Public changes may take a few minutes to appear after SEO-CMS triggers and
  completes a site build.
- Public article slugs remain stable after first publication. An intentional
  Admin change must retain the old slug as a permanent redirect.

### Approval and operational depth

- The architecture brief remains a stakeholder communication artifact, not a
  gate that delays the first live CMS deployment.
- Production-readiness precautions and private infrastructure configuration are
  owned by the stakeholder and are outside this ticket's decision scope.

## Open decision frontier

- [Define the CMS network and security boundary](../.scratch/cms-architecture/issues/05-define-cms-network-and-security-boundary.md)
  across the public REST API, native administration and authentication, editor
  preview, media, HTTPS termination, CORS, cookies, and Payload access rules.
- Define the First Admin bootstrap, credential injection, recovery, rotation,
  and non-deletion rules without placing credentials in source control or a
  container image.
- Complete the JWT threat model: token storage, expiry, refresh, revocation,
  logout, signing-key rotation, browser attack exposure, and role changes while
  a token remains valid.
- Specify idempotent First Admin seeding behavior for restarts and redeployments,
  safe password hashing, credential rotation and recovery, and the exact
  privileges that remain immutable on the First Admin account.
- Specify the public read endpoints and protected write/admin endpoints,
  including server-side Admin and Editor authorization rules.
- Specify how Fetched-CMS hands its content query layer and slug history to
  SEO-CMS without creating a second integration path.
- Define how existing hard-coded news content will be migrated and how article
  URLs will remain stable.

## Current repository facts

- The public site is a Vite, React, and TanStack Router application.
- News content is currently hard-coded in `src/lib/site-data.ts`.
- Individual news pages use the existing `/news/$articleId` route shape.
- No CMS, CMS API, database, Dockerfile, or Compose configuration currently
  exists in the repository.
- The root Vite development script already uses port 3000, so the independently
  running Backend CMS needs a different local port.

## Resume point

Resume Wayfinder with [Define the CMS network and security boundary](../.scratch/cms-architecture/issues/05-define-cms-network-and-security-boundary.md).
Begin by classifying the Backend CMS routes that must be public, editor-only,
or private before selecting CORS, cookie, proxy, and access-control rules.
