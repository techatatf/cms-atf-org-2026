# Fetched-CMS

Status: Approved for ticketing

Precedes: [SEO-CMS](../02-seo-cms/PRD.md)

## Goal

Prove the complete Payload publishing path with the smallest useful public-site
integration. Editors manage and preview News Articles in the Backend CMS. The
public site reads published News Articles from Payload through its public REST
API.

Fetched-CMS is the first phase of the target hybrid architecture. It is not a
separate CMS product or the final search architecture.

## Delivery boundary

Fetched-CMS replaces hardcoded news on these public-site surfaces:

- The homepage Newsroom section.
- The `/news` index.
- Each `/news/<slug>` article route.
- The Newsroom panel on the Publications page.

Articles, Research, and other Publications content remain outside the Backend
CMS in this phase.

The public Vite site and the Backend CMS must remain independently runnable in
local development and production. CMS content is optional to the public site.
A CMS failure must not prevent an unrelated page or the shared site layout from
rendering.

## News Article model

Payload manages one `News Articles` collection with drafts and versions. Each
News Article has these fields:

| Field | Rule |
| --- | --- |
| `title` | Required plain text. |
| `slug` | Required unique Public News Slug. Generate it from the title by default. |
| `excerpt` | Required plain text used by news lists and article introductions. |
| `body` | Required rich-text article body. |
| `publishedAt` | Required when the article is published. Use it for public ordering and display. |
| `category` | Required fixed choice: `Press`, `Programs`, `Research`, `Partnerships`, or `Chapters`. |
| `featured` | Boolean that selects the featured public article. |
| `heroImage` | Optional relationship to one Media document. |
| `_status` | Payload's draft or published state. |

Payload's document ID is internal. Public routes and links must use `slug`.

The slug must contain lowercase ASCII letters, digits, and single hyphens. It
must start and end with a letter or digit. Editors and Admins may change a slug
before the first publication.

The first publication locks the slug for Editors. An Admin may change a
published slug. Payload must then retain the old value as a Previous News Slug.
Current and previous slugs share one reserved namespace, so a slug can resolve
to only one News Article.

Payload must retain document versions and let Editors and Admins restore an
earlier version. Draft saves must not change the version visible through the
public REST API.

Only one published News Article may have `featured` set at a time. Publishing a
new featured article clears the flag from the previous featured article. If no
published article is featured, public surfaces use the newest published
article.

## Media model

Payload manages uploads in a Media collection. A News Article may refer to one
hero image. Image media requires non-empty alt text before the referring News
Article can be published.

Fetched-CMS loads published media from Payload URLs. If an image request fails,
the public site replaces only the image with a neutral placeholder. Available
article text remains visible.

PostgreSQL data and Payload media use separate persistent volumes.

## Users and access

Payload uses native authentication with `Admin` and `Editor` roles. Payload
access rules enforce permissions at the API boundary. Hiding a control in the
Admin interface is not an authorization rule.

| Actor | Permissions |
| --- | --- |
| Visitor | Read only published News Articles and public media without authentication. |
| Editor | Use the Payload Admin; create, edit, preview, publish, unpublish, and restore News Articles; upload media; delete a News Article that has never been published. |
| Admin | All Editor permissions; manage users; delete published News Articles; change a locked published slug. |

Unauthenticated REST requests must never return a draft or a newer unpublished
version of a published News Article. Every create, update, publish, unpublish,
delete, version-restore, and user-management operation requires authentication
and the relevant role.

The Payload Admin, its authentication routes, its authorized content routes,
the public REST reads, and public media are served from the Backend CMS origin
over HTTPS in production. PostgreSQL remains private to the Compose network.
The browser must not receive an API key or an administrative secret.

CORS and CSRF configuration must use explicit configured origins. Do not use a
wildcard origin. The configuration must support the deployed public-site origin
and the documented local-development origins.

## Live Preview

Editors and Admins preview draft changes through Payload Live Preview inside
the authenticated Payload Admin. The Admin loads a dedicated public-site
preview route in an iframe and sends the edited document through Payload's
Live Preview message protocol.

The public-site preview route must:

- Accept Live Preview messages only from the configured Backend CMS origin.
- Render draft data received from the authenticated Admin session.
- Avoid a general unauthenticated REST request for draft content.
- Remain outside public navigation and declare itself non-indexable.
- Use the same News Article presentation components as the published route.

The Backend CMS origin and the public-site preview origin remain configuration.
Live Preview must work on separate local ports and on separate production
origins.

## Public query contract

The public site uses one typed News Article query layer for every Fetched-CMS
surface. Keep the Backend CMS API origin in configuration so the integration
does not depend on Vercel, Nginx Proxy Manager, or a fixed hostname. SEO-CMS
must be able to reuse the query types and published-content mapping.

Every public query requests only published News Articles. List queries order
articles by `publishedAt` from newest to oldest and use a stable secondary
order when publication times match.

The public surfaces use these result sizes:

| Surface | Published content |
| --- | --- |
| Homepage Newsroom | One featured article and five newest non-featured articles. |
| News index | Twelve articles initially, followed by twelve per **Load more** action. |
| News Article route | One article resolved by its current or previous slug. |
| Publications Newsroom panel | One featured article and three newest non-featured articles. |

Category filters use the fixed category choices from the News Article model.
Changing a filter resets News index pagination. If a selected category has no
results, show `No updates in this category yet.`

If Payload succeeds but has no published News Articles, keep the affected news
region visible and show `No news published yet.`

If Payload succeeds but cannot resolve an article's current or previous slug,
show `Article not found.` This is a content result, not a CMS outage.

If a request resolves a Previous News Slug, replace the browser history entry
with the current `/news/<slug>` URL and render the article. Fetched-CMS does not
promise an HTTP permanent redirect. SEO-CMS uses the stored Previous News Slugs
to generate permanent redirects.

## Loading and failure behavior

Each CMS HTTP request has a five-second timeout. Do not run an automatic retry
loop.

While the initial article data is loading, keep the shared layout visible and
show a non-error loading state in the affected news region.

If an initial article-data request fails or times out, show
`News temporarily unavailable` in place of the affected news content. Include a
visible **Retry** action that starts a new request.

If a **Load more** request fails or times out, keep the articles that have
already loaded. Show the failure and **Retry** action beside the failed page.

An image failure does not change the article-data state. Replace the image with
the neutral placeholder and keep the available text.

Fetched-CMS must not serve a bundled or last-known production snapshot during a
CMS outage.

## Existing content and local seed data

The six hardcoded `newsItems` in the current public site are development
fixtures. Use them as local seed data, then remove them as the public site's
runtime news source.

Do not import those fixtures into production by default. A production content
import requires an explicitly approved dataset. For each approved legacy News
Article, preserve its existing `id` value as the initial Public News Slug.

The local seed and production import must be safe to run again without creating
duplicates. The production import must not overwrite an existing News Article
unless the operator explicitly selects that behavior.

## Application and Compose boundary

Add the self-contained Payload application under `backend-cms/` with
PostgreSQL, the native Payload Admin, and native authentication.

Use Docker Compose as the documented way to run Payload and PostgreSQL in local
development and production:

- `backend-cms/compose.yml` defines the shared services, network, and volumes.
- `backend-cms/compose.dev.yml` adds source mounts, hot reload, host ports, and
  development settings.
- `backend-cms/compose.prod.yml` selects the production image, health checks,
  and restart policy without source mounts.

Build the production Payload image from the checked-out release with
`make -C backend-cms build ENV=prod`. The first release does not require an
external image registry.

Commit each PostgreSQL schema migration with the Payload source. Run outstanding
production migrations during Payload initialization. If a migration fails, the
Payload container must not become ready or serve requests.

Provide Make targets for `start`, `stop`, `build`, `logs`, `down`, and `destroy`
in `backend-cms/`. Development is the default. Accept `ENV=prod` for production.
Preserve persistent volumes for `stop` and `down`. Require explicit confirmation
before `destroy` removes the PostgreSQL and media volumes.

Keep direct `npm run dev` support for developers who need it. Docker Compose
remains the expected setup path.

The production Compose application contains only Payload and PostgreSQL. Keep
the reverse proxy outside the application stack. Expose only Payload to the
host or ingress network.

## Verification

Automated tests must verify:

- The Visitor, Editor, and Admin access rules through the API boundary.
- Draft isolation, version restore, publication, unpublication, and featured
  article selection.
- Slug validation, locking, reservation, previous-slug resolution, and Admin
  overrides.
- Public query mapping, ordering, filtering, pagination, timeout, empty,
  not-found, retry, and partial **Load more** failure behavior.
- Live Preview origin validation and draft rendering.
- Media alt-text validation and the public image placeholder.
- The local seed and production import safeguards.

The delivery must also include smoke checks for the documented development and
production Compose commands. A production smoke check must prove that a failed
migration prevents Payload readiness.

## Accepted limitations

- News content does not need to appear in the initial HTML response during this
  phase.
- Article-specific titles, descriptions, canonical links, and body content may
  depend on client-side rendering.
- A successful publication can appear to public visitors within seconds, but
  the public experience still depends on a live CMS request for the newest
  content.
- During a CMS outage, Fetched-CMS does not provide a bundled or last-known news
  snapshot. SEO-CMS adds durable published output later.
- Published images can become unavailable when Payload or its media storage is
  unavailable.
- A Previous News Slug changes the browser URL on the client. SEO-CMS adds the
  HTTP permanent redirect.

## Foundation for SEO-CMS

Fetched-CMS keeps the content schema, current and previous slugs, REST query
layer, preview behavior, environment configuration, and public presentation
components reusable by [SEO-CMS](../02-seo-cms/PRD.md). The second phase changes
how the public site delivers published content. It does not replace Payload or
fork the content model.

## Out of scope

- Prerendering indexable public routes.
- Returning article content and metadata in the initial HTML response.
- Triggering a public-site build when an Editor or Admin publishes content.
- Meeting the final technical SEO requirements.
- Generating HTTP redirects for Previous News Slugs.
- Managing Articles, Research, or other Publications content in Payload.
- Scheduled publication and unpublication.
- Replacing Payload's native administration interface.
