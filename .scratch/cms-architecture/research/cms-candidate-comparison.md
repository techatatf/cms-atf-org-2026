# ATF CMS candidate comparison

Research date: 2026-08-19

Purpose: evidence for **Select the CMS architecture from the evaluated options**, not the selection itself

## Decision brief

Three existing products clear the agreed gates without relying on an
unconfirmed organization-size exemption or a paid feature add-on:

1. **Payload CMS** — the strongest match for a code-owned, TypeScript-first
   headless CMS that may later grow into an ATF Org Backend.
2. **WordPress** — the strongest commodity publishing option and the least ATF
   code to own, at the cost of a WordPress-shaped API and a MySQL/MariaDB
   commitment.
3. **Drupal** — a complete, license-safe workflow and structured-content
   option, but probably more platform than a small news team needs.

The narrow custom baseline can match ATF exactly, but it starts behind all
three products on total ownership: ATF would own the editor, authentication,
authorization, preview, revision history, recovery behavior, migrations, and
security maintenance. Under the agreed adoption rule, custom is justified only
if broader ATF Org Backend requirements become concrete enough to repay that
cost. Building a CMS merely to publish news does not clear that bar.

No option can by itself guarantee the public-site availability gate. That gate
is met by the integration architecture: the Vercel site must retain a built or
cached news snapshot, or render a bounded empty state, rather than requiring a
successful live CMS request for every page render. This condition comes from
the [Wayfinding map](../../../docs/CMS%20Architecture%20Wayfinding.md) and
applies equally to every candidate.

## Evaluation frame

The [criteria decision](../issues/done/01-define-cms-evaluation-criteria.md) requires
self-hosting, acceptable licensing, a REST API, Admin/Editor authorization,
draft/preview/revision support, active maintenance, operation by one capable
developer through documented Docker Compose procedures, and public-site
survival during a backend outage. Scheduling, tags, SEO overrides, and multiple
authors are useful extras rather than gates.

The current repository establishes a migration baseline: stable `id` or slug,
title, excerpt, publication date, category, featured flag, and body content in
[`newsItems`](../../../src/lib/site-data.ts), while existing public URLs use
`/news/$articleId` in the
[article route](../../../src/routes/news.$articleId.tsx). The criteria ticket
refers to "proposed launch article fields" but does not record their exact
approved list, so this research does not silently promote the current code
shape into the final schema. All three products can represent the current
shape; the selection still needs to confirm the exact fields and preserve the
existing slugs during migration.

For the licensing gate, this comparison uses a conservative rule: all required
launch features must be usable in a self-hosted production deployment without
ATF first proving eligibility for a grant or buying a feature-specific license.
That avoids declaring a product viable on organization or budget facts not
present in the repository.

## Hard-gate result

| Gate | Payload CMS | WordPress | Drupal |
| --- | --- | --- | --- |
| Self-host and license | **Pass.** MIT-licensed and explicitly free to self-host. [License](https://github.com/payloadcms/payload/blob/main/LICENSE.md), [self-host terms](https://payloadcms.com/get-started) | **Pass.** GPLv2-or-later; a Docker Official Image includes a Compose example. [License](https://wordpress.org/about/license/), [Docker image](https://hub.docker.com/_/wordpress/) | **Pass.** GPLv2-or-later; a Docker Official Image includes a Compose example with PostgreSQL. [License](https://www.drupal.org/about/licensing), [Docker image](https://hub.docker.com/_/drupal/) |
| Structured REST and public reads | **Pass by configuration.** Collections receive CRUD REST endpoints; access rules can expose only published documents anonymously. [REST API](https://payloadcms.com/docs/rest-api/overview), [draft access example](https://payloadcms.com/docs/versions/drafts) | **Pass.** Core REST exposes public posts anonymously and protects private/write contexts; the post schema covers the launch model except the ATF-specific featured flag, which can be registered as REST-visible metadata. [REST overview](https://developer.wordpress.org/rest-api/), [post schema](https://developer.wordpress.org/rest-api/reference/posts/), [custom REST metadata](https://developer.wordpress.org/rest-api/extending-the-rest-api/modifying-responses/) | **Pass by configuration.** Core JSON:API provides RESTful CRUD for content entities and respects Drupal entity and field access; the anonymous role can receive only the published-content permissions it needs. [JSON:API](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module), [security behavior](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/security-considerations), [roles and permissions](https://www.drupal.org/docs/user_guide/en/user-concept.html) |
| Admin/Editor authorization | **Pass with small, versioned configuration.** An auth collection can carry roles, Admin Panel access, and operation-level rules; official examples distinguish super-admin and editor. [Admin RBAC](https://payloadcms.com/docs/admin/overview), [access control](https://payloadcms.com/docs/access-control/overview) | **Pass in core.** Administrator and Editor are predefined; Editor can publish and manage other users' posts. The REST API applies the same authentication restrictions. [Roles](https://wordpress.org/documentation/article/roles-and-capabilities/), [REST authentication](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/) | **Pass in core.** Permissions are grouped into configurable roles, including an administrator and a content-editor pattern; JSON:API reuses those controls. [Roles](https://www.drupal.org/docs/user_guide/en/user-concept.html), [JSON:API security](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/security-considerations) |
| Draft, preview, revisions | **Pass.** Versioning stores history and diffs, drafts preserve a published version, and the Admin Panel can link to a frontend preview. [Versions](https://payloadcms.com/docs/versions/overview), [drafts](https://payloadcms.com/docs/versions/drafts), [preview](https://payloadcms.com/docs/admin/preview) | **Pass in core.** Posts support draft, pending, future, and published states; the editor supports preview, revisions, restore, and scheduled publication. [post states](https://developer.wordpress.org/rest-api/reference/posts/), [revisions](https://wordpress.org/documentation/article/revisions/), [editor preview and scheduling](https://wordpress.org/documentation/article/page-post-settings-sidebar/) | **Pass in core.** Content Moderation keeps the published revision live while a separate draft is reviewed; workflow transitions can be restricted by role, and content types support preview and revision creation. [Content Moderation](https://www.drupal.org/docs/8/core/modules/content-moderation/overview), [workflow states](https://www.drupal.org/docs/8/core/modules/workflows/overview), [preview/revision settings](https://www.drupal.org/docs/user_guide/en/structure-content-type.html) |
| Maintained and operable | **Pass, with more application ownership than the packaged CMSs.** Official production docs cover a Docker build, self-hosting, storage, and database concerns; the project publishes frequent releases and security advisories. The documented Compose example is development-oriented, so ATF must own the production Compose/runbook. [deployment](https://payloadcms.com/docs/production/deployment), [releases](https://github.com/payloadcms/payload/releases), [security advisories](https://github.com/payloadcms/payload/security) | **Pass.** The official image documents Compose and persistent volumes; WordPress publishes maintenance/security releases and has a defined security team. ATF must pin and regularly update core and any extensions. [Docker image](https://hub.docker.com/_/wordpress/), [releases](https://wordpress.org/news/category/releases/), [security process](https://wordpress.org/about/security/) | **Pass, but operationally heaviest.** The official image documents Compose, persistent application paths, and PostgreSQL; Drupal has a predictable release policy and coordinated security releases. [Docker image](https://hub.docker.com/_/drupal/), [release policy](https://www.drupal.org/about/core/policies/core-release-cycles/release-process-overview), [current releases](https://www.drupal.org/project/drupal/releases) |
| Public site survives CMS outage | **Pass only with ATF snapshot/cache/fallback design.** | **Pass only with ATF snapshot/cache/fallback design.** | **Pass only with ATF snapshot/cache/fallback design.** |

The provisional JWT-only and custom `/cms` ideas are not product gates. The
criteria decision explicitly allows a product's own editorial interface, and
the map has not approved JWT storage, refresh, revocation, or logout behavior.
Payload supports JWTs and HTTP-only cookies
([authentication](https://payloadcms.com/docs/authentication/overview));
WordPress and Drupal normally secure their own administration interfaces using
their native sessions. Replacing mature admin authentication solely to match a
provisional shape would add risk without improving the news outcome.

## Decision-relevant comparison

The ratings below are reasoned judgments from the cited capabilities, not
benchmarks or mechanical scores.

| Priority | Payload CMS | WordPress | Drupal | Narrow custom baseline |
| --- | --- | --- | --- | --- |
| News workflow fit | **High.** Model and workflow are concise configuration. | **High.** Posts are the native use case. | **High technically, oversized organizationally.** | **Exact after it is built.** |
| Nontechnical editor fit | **Promising.** Purpose-built Admin Panel; verify with ATF editors. | **Strongest prior evidence.** Mature post editor and native lifecycle; still verify the actual headless preview. | **Capable but denser.** Workflow is strong; administration exposes more concepts than the launch needs. | **Unknown.** ATF must design, build, and usability-test it. |
| Integration shape | **Best typed/headless fit.** Field names map directly to JSON keys, and rich text is stored as JSON. [fields](https://payloadcms.com/docs/fields/overview), [rich text](https://payloadcms.com/docs/fields/rich-text) | **Usable but adapter-shaped.** Core REST is stable, but content is WordPress-shaped and rich text is rendered HTML; the featured flag needs a small registered field. | **Structured but verbose.** JSON:API exposes entity/bundle/relationship conventions that the Vite app should hide behind an adapter. | **Exact REST contract**, but ATF owns its stability and migrations. |
| Database choice | **PostgreSQL preferred for ATF.** It is officially supported through Drizzle with migration tooling. [PostgreSQL](https://payloadcms.com/docs/database/postgres), [migrations](https://payloadcms.com/docs/database/migrations) | **MySQL or MariaDB only in the supported baseline.** [requirements](https://wordpress.org/about/requirements/) | **PostgreSQL or MySQL.** The official image documents both and gives a PostgreSQL Compose example. [Docker image](https://hub.docker.com/_/drupal/) | **PostgreSQL is the natural baseline**, but ATF owns schema and migration tooling. |
| Operational simplicity | **Medium.** One Node/Next service plus database, migrations, and optional media storage; ATF owns the app image. | **Medium-high for a packaged CMS.** Official images and update tooling are mature; PHP application files, database, uploads, and extension updates still need a runbook. | **Lowest for this small scope.** Composer/core updates, persisted site files, modules, and configuration add operational surface. | **Simple topology, largest code burden.** A service plus PostgreSQL is easy to draw but not cheap to make safe. |
| Control and broader backend value | **High.** Configuration is TypeScript, access control is code, and the product is also an application framework. | **Low-medium.** Excellent editorial control; a poor default boundary for unrelated ATF backend capabilities. | **Medium-high.** Highly extensible entity model, but extension follows Drupal/PHP conventions. | **Highest.** Every boundary is ATF-owned; value exists only if non-CMS capabilities are real and near-term. |
| Likely three-year ownership | **Medium.** No license fee; moderate initial configuration and continuing Node/Next/Payload upgrade work. | **Lowest or low-medium.** No license fee and little CMS code, offset by patch discipline and the headless adapter/preview integration. | **Medium-high.** No license fee, but the broad platform and upgrade surface are disproportionate to one content type and fewer than ten users. | **Highest.** No vendor fee, but all feature, security, accessibility, editor, and migration work is internal engineering. |

No authoritative apples-to-apples resource benchmark was found, so this
research does not invent CPU/RAM numbers. A one-article local deployment would
be needed if the VPS has a hard memory ceiling. For the expected volume,
operational complexity and update discipline are more decision-relevant than
unmeasured throughput.

## Implementation implications

- **Payload:** ATF owns a small framework application—production image,
  access-control configuration, migrations, preview bridge, tests, and updates.
- **WordPress:** ATF should keep the installation deliberately small and treat
  it only as the CMS; the site needs an API adapter and secure headless preview.
- **Drupal:** ATF gains the strongest packaged workflow but also the broadest
  configuration, Composer, persisted-files, and API-adapter burden.

### Narrow custom CMS / ATF Org Backend baseline

The fair custom baseline is not a general platform. It contains only:

- PostgreSQL-backed articles with the current fields and stable slugs;
- public, read-only REST endpoints that return published content;
- authenticated Admin/Editor CRUD with server-side authorization;
- draft/published state, revision creation/restoration, and secure preview;
- the agreed First Admin bootstrap invariant;
- a small editorial UI, migrations, backups, audit-relevant logs, tests, and a
  production Compose/runbook.

Scheduling, SEO overrides, tags, multiple authors, unrelated member systems,
and other speculative backend features stay outside the baseline.

Even this narrow service owns difficult commodity security behavior. OWASP's
current verification standard requires documented session lifetime,
termination, reauthentication, and backend token validation—not merely issuing
a JWT ([ASVS session management](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x16-V7-Session-Management.md)). Password storage, recovery, role changes,
CSRF/XSS exposure, account disablement, and authorization tests remain ATF's
responsibility. This is why custom has the highest three-year cost even though
its deployment diagram is small.

## Products not placed in the unconditional three

- **Directus 12** is technically attractive, but its current MSCL licensing and
  feature tiers require facts ATF has not recorded. Full free access depends on
  an Open Innovation Grant for organizations under both $5M annual revenue and
  50 employees; the unregistered Core tier is capped at three users, and custom
  access policies are not included. [license change](https://directus.com/resources/directus-v12-license-change),
  [grant criteria](https://directus.com/oig),
  [pricing/features](https://directus.com/pricing?previewmode=true). If ATF
  confirms eligibility and is willing to depend on a registration key,
  Directus deserves reconsideration and could replace Drupal in a final
  shortlist.
- **Strapi Community** passes self-hosting, MIT licensing, REST, RBAC, and
  draft/publish, but its official plan matrix reserves Live Preview and Content
  History for the paid Growth plan. That means Community does not pass ATF's
  preview-and-revisions gate as stated. [license](https://github.com/strapi/strapi/blob/develop/LICENSE),
  [plan matrix](https://strapi.io/pricing-cms?showAll=true). Paid Strapi can be
  reconsidered if stakeholders explicitly accept its recurring per-project and
  per-seat cost.
- **Ghost** otherwise fits news publishing well, but the literal public-read
  gate says the public site must not need an API key. Ghost's official Content
  API documentation requires a key on read requests, even though that key is
  safe to expose in a browser, so Ghost does not pass the gate as written.
  [Content API authentication](https://docs.ghost.org/content-api/)

## What remains genuinely unknown

Product documentation establishes capability, not ATF usability or local
operability. The selection conversation should not pretend otherwise:

- **Editor reaction:** one ATF editor should perform create, preview, publish,
  revise, restore, and category assignment in the leading interfaces.
- **Exact-site preview:** every decoupled option needs an authenticated bridge
  to show unpublished content in the Vite site. Payload has the most direct
  documented hook, but none is proven in this repository.
- **Content wire format:** choose deliberately between Payload's structured
  rich-text JSON, WordPress's rendered HTML, and Drupal's formatted-text/entity
  representation; this determines frontend rendering and migration work.
- **Final article schema:** the current hard-coded shape is known, but the
  exact approved launch field list is not recorded in the criteria resolution.
- **First Admin fit:** the non-deletion invariant and recovery/rotation behavior
  still need product-specific design; passing general Admin/Editor RBAC does not
  settle that requirement.
- **Broader backend demand:** unless at least one non-CMS capability has a
  defined near-term owner and requirement, it should not be used to justify a
  custom build.
- **VPS fit and recovery:** resource use, database/media backup size, and the
  provisional 24-hour RPO/four-hour RTO require a deployed smoke test and a
  restore exercise after selection.

## Selection posture supported by the evidence

Carry **Payload and WordPress** into the stakeholder decision as the two serious
front-runners. Keep **Drupal** as the technically viable, workflow-heavy
reference rather than the presumptive choice. Keep **custom** as the explicit
build baseline, not as a fourth product with assumed future benefits.

- Prefer **Payload** when typed API control, PostgreSQL, and credible broader
  backend work outweigh owning a small framework application.
- Prefer **WordPress** when news publishing is the real boundary and minimizing
  custom CMS functionality outweighs API purity and database preference.
- Prefer **Drupal** only if stakeholders surface near-term structured-content
  or moderation needs that justify its operational breadth.
- Prefer **custom** only after naming concrete ATF-specific backend capabilities
  that Payload cannot support cleanly and that materially repay the security
  and editor-platform ownership.
