# CMS Architecture Wayfinding

Status: Resumed September 16, 2026 at the Fetched-CMS release proof

## Destination

Produce a concise, presentation-like Markdown architecture brief for
stakeholder approval. Supported by linked evidence, it will record the selected
CMS, portable application and deployment topology, repository layout, security
boundaries, content delivery and preview behavior, persistence, migration
approach, principal trade-offs, and phased roadmap.

## Notes

- Production Launch and Demo Rehearsal are separate deployment pairs. Demo
  data, Media, users, and secrets do not transfer to production. The later
  [release guide](general-guides/prove-fetched-cms-release.md) supersedes this
  map's earlier assumption that there would be no separate demo.
- On September 16, 2026, the user confirmed that the temporary Demo Rehearsal
  has been shown to the team. The next task is release proof, followed by a
  side quest for team feedback. SEO-CMS planning follows those tasks.
- Current editing approval covers only README and this map. Ticket updates,
  application changes, and deployment changes require further user approval.
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
- The Backend CMS lives in this repository under the top-level
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

- Fetched-CMS manages News Articles only.
- More content types can be added later.
- The CMS should serve nontechnical editorial users.
- Admin and Editor roles enforce permissions at the API boundary.
- Drafts, Live Preview, and revisions are implemented. Scheduled publication
  and unpublication are outside the Fetched-CMS scope.

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
- Public News Slugs are locked for Editors after First Publication. An Admin
  change retains Previous News Slugs. Fetched-CMS resolves them through a
  client-side URL replacement; SEO-CMS adds permanent HTTP redirects.

### Approval and operational depth

- The architecture brief remains a stakeholder communication artifact, not a
  gate that delays the first live CMS deployment.
- Production-readiness precautions and private infrastructure configuration are
  owned by the stakeholder and are outside this ticket's decision scope.

## Open decision frontier

- [Define the CMS network and security boundary](../.scratch/cms-architecture/issues/05-define-cms-network-and-security-boundary.md)
  remains open. Reconcile its questions with the implemented public REST reads,
  native authentication, Admin and Editor access rules, explicit CORS and CSRF
  origins, private preview, and production Secure cookies before deciding what
  remains unresolved. This documentation update does not close that ticket.

## Not yet specified

- Which team-feedback changes to make after the release proof. The feedback
  itself has not yet been captured in this map.
- Whether First Admin recovery, credential rotation, or JWT lifecycle questions
  from the earlier frontier need decisions beyond Payload's native behavior.
  The implementation already bootstraps the first user as Admin and prevents
  deletion or demotion of the last Admin. It does not implement a separately
  immutable First Admin account or the earlier proposed credential seeding.
- The detailed SEO-CMS build and deployment process, reusing the existing news
  query mapping, presentation, Live Preview, and Previous News Slugs.
- Whether Google program and mobile-readiness requirements belong in SEO-CMS.
  The [discovery questionnaire](to-questionnaire-google-program-readiness.md)
  remains unanswered in the repository.

## Current repository facts

- The Public Site is a browser-rendered Vite, React, and TanStack Router app
  with one ATF V2 design. The former prototype switcher and theme contexts are
  gone. Multi-page routes require `VITE_HOMEPAGE_ONLY_MODE=false`.
- News uses browser-time Payload REST reads through `src/services/news.ts` on
  the homepage, News index, News Article routes, and Publications Newsroom panel.
- Individual News Articles use `/news/<slug>`, implemented in
  `src/routes/news_.$slug.tsx`. The six repository-owned News Articles are local
  seed data, not the public runtime source or an approved production dataset.
- `backend-cms/` contains Payload, PostgreSQL migrations, a Dockerfile, development
  and production Compose configuration, and safe seed and import workflows.
- The Public Site defaults to local port 3000 and the Backend CMS to port 3001.
- [Prove the Fetched-CMS release path](../.scratch/01-fetched-cms/issues/10-prove-the-fetched-cms-release-path.md)
  records completed local and automated proof on August 31. Its Public Site
  baseline was 139 passes and three existing assertion failures. These are
  recorded results, not checks rerun during the September 16 pre-flight.
- The same ticket records operator acceptance of the production Backend CMS.
  Its three deployed Demo Rehearsal checklist items remain open. The user's
  September 16 report confirms that the demo now exists, superseding the
  ticket's older statement that it had not been deployed.

## Resume point

Resume with [Prove the Fetched-CMS release path](../.scratch/01-fetched-cms/issues/10-prove-the-fetched-cms-release-path.md)
and the [release guide](general-guides/prove-fetched-cms-release.md). The user
identified this temporary demo pair:

- [Demo Backend CMS administration](https://cms-demo.africantechnologyforum.org/admin)
- [Demo Public Site](https://public-demo.africantechnologyforum.org/)

The remaining deployed proof covers HTTPS Public Delivery and Live Preview,
direct preview navigation with authenticated Media, and demo isolation with
non-indexable public output. Deployment existence alone does not satisfy those
checks. Record the deployed revisions and evidence before closing the release
ticket, after obtaining approval to update it.

After release proof, scope the team's demo feedback with the user and obtain
approval for the proposed changes. Then return to SEO-CMS planning.
