# CMS Architecture Wayfinding

Status: Paused after initial scoping on 2026-08-18

## Destination

Produce a decision-ready architecture specification for ATF's CMS, including
the selected CMS, deployment topology, repository layout, security boundaries,
backup and recovery policy, migration approach, and implementation roadmap.

This wayfinding effort is for planning and stakeholder approval. It does not
include the production implementation.

## Decisions so far

### Repository and hosting boundaries

- The public ATF site will remain hosted on Vercel.
- CMS deployment configuration and supporting backend material will live in
  this same repository, in a dedicated top-level folder.
- The exact folder name remains open. Current candidates are `Backend CMS` and
  `Backend CMS Deployment`.
- Docker Compose should be used for the self-hosted CMS services wherever it is
  practical. Vercel will continue to use its native build and deployment model.
- ATF already has an Ubuntu VPS and prefers operating its own database rather
  than using managed PostgreSQL.
- The VPS topology, database engine, and CMS product remain decisions to
  research. MySQL was discussed as one possible containerized database, not
  selected as a requirement.

### Initial CMS scope

- The first CMS release will manage news articles only.
- More content types can be added later.
- The CMS should serve nontechnical editorial users.
- Initial access control should include at least Admin and Editor roles.
- The desired minimal editorial workflow includes drafts, preview, revisions,
  and optional scheduled publishing, subject to support in the selected CMS.

### Proposed application and authentication shape

The following is the current working vision to present back and scrutinize when
wayfinding resumes. It has been recorded, but not yet approved as the final
architecture.

- The backend should be understood as the **ATF Org Backend**, not merely a CMS
  backend. Content management is its first capability, but the name should not
  unnecessarily constrain future backend responsibilities.
- The official ATF site should expose a `/cms` route containing a login screen
  and the authenticated editorial interface.
- The `/cms` interface would remain part of the Vercel-hosted site and
  communicate with the separately deployed ATF Org Backend through a REST API.
- The backend should have a bootstrap **First Admin**: the initial administrator
  established when a new backend deployment is instantiated.
- The First Admin must not be deletable. How its credentials are supplied,
  recovered, and rotated remains to be designed.
- The First Admin's initial values will be supplied through deployment
  environment variables in a `.env` file and seeded into the database when the
  ATF Org Backend is first instantiated. The `.env` file and its secret values
  must not be committed to source control or embedded in a container image.
- After bootstrap, every additional account must be created by an Admin. A new
  account has the Editor role by default.
- Admins may promote Editors to Admin and demote other Admins to Editor.
- Admins may delete other accounts, including other Admin accounts, but no
  account may delete the First Admin.
- Whether the First Admin can be demoted, disabled, renamed, or otherwise
  stripped of administrative access remains to be specified. The current
  settled invariant is only that the First Admin record cannot be deleted.
- Login should return a JSON Web Token (JWT), and the current preference is for
  that token to be the sole session mechanism. Token lifetime, refresh or
  re-authentication behavior, revocation, logout, storage, and theft mitigation
  remain open security decisions.
- Published CMS content should be readable through unauthenticated REST API
  routes so the public website does not need an API key to display it.
- Content creation, editing, publishing, deletion, and administrative actions
  should use authenticated and authorized REST API routes.
- The `/cms` frontend should hide and guard authenticated screens, but backend
  authorization is the security boundary: every protected operation must be
  rejected by the API when the caller lacks a valid token or required role.
- All communication must be encrypted in transit with HTTPS. HTTPS transport
  and endpoint authorization are separate protections; a route itself is not
  made secure merely by hiding or guarding it in the frontend.

### Public-site availability boundary

- The Vercel-hosted public site must remain available when the ATF Org Backend
  is unavailable because of maintenance, failure, or a network interruption.
- Every public-site component that consumes backend data must treat that data
  source as optional and handle timeouts, failed requests, and unavailable data
  without preventing the rest of the site from rendering.
- News is the only backend-managed content type in the first release.
- Any future backend-fed content that does not yet have a defined content model
  should render a neutral fallback such as "Data unavailable" or a later-agreed
  default rather than becoming a hard dependency of the public site.
- The exact news fallback remains to be designed. It may use cached or
  previously built content, an empty state, or an availability message, but a
  backend outage must not take down unrelated pages or shared site layout.

### Approval and operational depth

- CMS candidates and the recommended architecture must be presented for
  stakeholder approval before implementation proceeds deeply.
- Backup planning should begin small until the CMS is approved.
- The eventual design should still address database backups, off-site copies,
  media backups where applicable, retention, restoration, and recovery tests.
- A provisional recovery target of no more than 24 hours of content loss and
  restoration within four hours is acceptable for later evaluation; it is not
  yet a committed service level.

## Open decision frontier

- Define the CMS evaluation criteria and research a shortlist suitable for a
  Dockerized, self-hosted deployment and nontechnical news editors.
- Decide whether CMS selection or database preference should drive the choice
  between PostgreSQL, MySQL, and other supported stores.
- Decide how the Vercel-hosted site receives published content: build-time
  fetching with deploy hooks, runtime API access, or a hybrid approach.
- Decide the CMS network and security boundary, including whether its API and
  administration interface are publicly reachable.
- Decide whether the selected CMS can support the proposed custom `/cms` UI and
  REST-only ATF Org Backend cleanly, or whether this direction points toward a
  custom backend rather than an off-the-shelf CMS administration application.
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
- Decide whether public content should be fetched by a visitor's browser or by
  Vercel during builds/server-side execution, since that affects API exposure,
  caching, availability, and publishing behavior.
- Decide the monorepo folder name and internal Compose/configuration layout.
- Define the smallest credible backup approach for the stakeholder proposal;
  defer the full recovery policy until a CMS is approved.
- Define how existing hard-coded news content will be migrated and how article
  URLs will remain stable.
- Decide the news availability strategy—build-time snapshot, cache, stale data,
  or empty-state fallback—and the timeout/error behavior for optional backend
  consumers.

## Current repository facts

- The public site is a Vite, React, and TanStack Router application.
- News content is currently hard-coded in `src/lib/site-data.ts`.
- Individual news pages use the existing `/news/$articleId` route shape.
- No CMS, CMS API, database, Dockerfile, or Compose configuration currently
  exists in the repository.

## Resume point

Resume Wayfinder with the open decision frontier above. The next conversation
should sharpen the stakeholder approval artifact and CMS evaluation criteria
before CMS research begins.
