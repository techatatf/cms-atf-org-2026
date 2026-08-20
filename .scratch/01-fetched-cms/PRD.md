# Fetched-CMS

Status: Planned first implementation phase

## Goal

Prove the complete Payload publishing path with the smallest useful public-site
integration. Editors manage and preview news in the Backend CMS. A visitor's
browser fetches published articles from Payload through its public REST API.

Fetched-CMS is the first phase of the target hybrid architecture. It is not a
separate CMS product or the final search architecture.

## Required outcomes

- Add the self-contained Payload application under `backend-cms/` with
  PostgreSQL, native administration, and native authentication.
- Model news articles with drafts, versions, preview, publication state, a
  unique public slug, and the content fields approved for migration.
- Let editors see draft changes immediately through an authenticated Payload
  Live Preview path.
- Fetch published news through unauthenticated REST requests in the visitor's
  browser.
- Treat CMS content as optional. Timeouts, failed requests, and unavailable
  data must not prevent unrelated pages or the shared site layout from
  rendering.
- If a CMS request fails or times out, show "News temporarily unavailable" in
  place of the affected news content.
- If Payload responds successfully but has no article for the requested slug,
  show "Article not found." Do not report a CMS outage as a missing article.
- Stop each CMS request after five seconds. Do not run an automatic retry loop.
  Show a visible **Retry** action after a request fails.
- Load published media from Payload URLs. If an image request fails, replace
  the image with a neutral placeholder without hiding available article text.
- Keep the public Vite site and the Backend CMS independently runnable in local
  development and production.
- Use Docker Compose as the documented way to run both Payload and PostgreSQL
  in local development and production.
- Use `backend-cms/compose.yml` for the shared service structure. Apply
  `compose.dev.yml` for local source mounts, hot reload, ports, and development
  settings. Apply `compose.prod.yml` for the production image, health checks,
  restart policy, and removal of source mounts.
- Build the production Payload image from the checked-out release with
  `make build ENV=prod`. Do not require an external image registry for the first
  release.
- Commit each PostgreSQL migration with the Payload source. Run outstanding
  production migrations during Payload initialization. If a migration fails,
  the Payload container must not become ready or serve requests.
- Provide Make targets for `start`, `stop`, `build`, `logs`, `down`, and
  `destroy` from both the repository root and `backend-cms/`. Default to the
  development Compose files and accept `ENV=prod` for production.
- Preserve persistent volumes for `stop` and `down`. Require explicit
  confirmation before `destroy` removes PostgreSQL and media volumes.
- Keep direct `npm run dev` support for developers who need it, but do not make
  direct execution the expected setup path.
- Limit the production Compose application to Payload and PostgreSQL. Keep the
  reverse proxy outside the application stack.
- Give PostgreSQL data and Payload media separate persistent volumes. Keep
  PostgreSQL private to the Compose network and expose only Payload to the host
  or ingress network.
- Keep the API origin in configuration so the integration does not depend on
  Vercel, Nginx Proxy Manager, or a fixed production hostname.

## URL policy

- Preserve the current `/news/<articleId>` values as the initial public slugs
  when existing articles move into Payload.
- Lock each slug after first publication by default.
- If an Admin changes a published slug, retain the previous slug and redirect
  it permanently to the current article URL.

## Accepted limitations

- News content does not need to appear in the initial HTML response during
  this phase.
- Article-specific titles, descriptions, canonical links, and body content may
  depend on client-side rendering.
- A successful publication can appear to public visitors within seconds, but
  the public experience still depends on a live CMS request for the newest
  content.
- During a CMS outage, Fetched-CMS does not provide a bundled or last-known news
  snapshot. SEO-CMS adds durable published output later.
- Published images can become unavailable when Payload or its media storage is
  unavailable.

## Foundation for SEO-CMS

Fetched-CMS must keep the content schema, public slugs, REST query layer, preview
behavior, and environment configuration reusable by
[SEO-CMS](../02-seo-cms/PRD.md). The second phase changes how the public site
delivers published content. It does not replace Payload or fork the content
model.

## Out of scope

- Prerendering all indexable public routes.
- Returning article content and metadata in the initial HTML response.
- Triggering a public-site build when an editor publishes content.
- Meeting the final technical SEO requirements.
