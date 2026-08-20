# SEO-CMS

Status: Planned after Fetched-CMS

Depends on: [Fetched-CMS](../01-fetched-cms/PRD.md)

## Goal

Complete the hybrid delivery architecture after Fetched-CMS proves the Payload
integration. Keep real-time private preview for editors, then publish complete
HTML pages for visitors and search engines.

SEO-CMS is the target delivery phase of the same Backend CMS. It is not a
second CMS product.

## Required outcomes

- Trigger a provider-neutral public-site build when Payload publishes relevant
  content.
- Fetch a consistent snapshot of published Payload content during the build.
- Copy media used by published pages into the static site output and make the
  generated pages refer to those copies.
- Prerender every indexable ATF route that needs meaningful initial HTML. This
  work includes the home page and is not limited to news article routes.
- Return each article's title, description, canonical URL, and body in the
  initial HTML response.
- Generate each published `/news/<slug>` route and preserve the Fetched-CMS URL
  policy.
- Keep the last successful public-site deployment available when the Backend
  CMS, its network connection, or its media service is unavailable.
- Keep Payload Live Preview separate from public delivery so editors can see
  draft changes without publishing or waiting for a site build.
- Publish public changes within a few minutes. The exact target depends on the
  selected build and deployment process.

## Whole-site search boundary

The current Vite entry document contains an empty `#app` element and relies on
React to create the page after JavaScript starts. SEO-CMS must replace that
output with meaningful initial HTML for every indexable public route. Fetching
Payload data during `vite build` is insufficient unless the build also
prerenders the routes.

The detailed search specification must cover page metadata, canonical URLs, a
sitemap, redirects for prior article slugs, and real not-found behavior. It must
also define which non-indexable routes can remain client-rendered.

## Reused foundation

SEO-CMS reuses the Payload content model, REST query layer, slug rules, preview
integration, error model, and environment configuration from Fetched-CMS. The
browser REST path can remain available for optional freshness, but static HTML
is the public baseline.

## Out of scope

- Replacing Payload's native administration interface.
- Replacing Payload with a separate SEO-specific CMS.
- Making Vercel or a production reverse proxy an application dependency.
- Requiring a live Backend CMS request for each public page view.
