# ATF Org 2026

This is the African Technology Forum website app. The Public Site uses Vite,
React, Tailwind, and TanStack Router. The independently runnable Backend CMS
uses Payload and PostgreSQL.

## Current State

The Public Site implements one ATF V2 design. The earlier prototype switcher,
theme contexts, and feedback controls have been removed. Shared site components
live in `src/components/site/`, with navigation and footer in
`src/components/layout/`.

Multi-page routes are implemented. Set `VITE_HOMEPAGE_ONLY_MODE=false` to expose
them; homepage-only mode remains the default when that value is absent.

Fetched-CMS is implemented for News Articles, including Admin and Editor roles,
drafts, Live Preview, revisions, Media, stable public slugs, and safe imports.
The Public Site fetches published news in the browser and handles CMS failures
without blocking the shared layout. Initial HTML with published content and
metadata remains planned in [SEO-CMS](.scratch/02-seo-cms/PRD.md).

As of September 16, 2026, the next task is
[Prove the Fetched-CMS release path](.scratch/01-fetched-cms/issues/10-prove-the-fetched-cms-release-path.md).
The August 31 handoff records completed local and automated proof, but deployed
HTTPS checks remain open. That handoff records 139 passing Public Site tests
and three existing assertion failures; these results have not been rerun.
The temporary demo has since been shown to the team:

- [Demo Backend CMS administration](https://cms-demo.africantechnologyforum.org/admin)
- [Demo Public Site](https://public-demo.africantechnologyforum.org/)

The agreed order is release proof, then a side quest for the team's demo
feedback, before returning to SEO-CMS planning. See the
[CMS architecture map](docs/CMS%20Architecture%20Wayfinding.md) for the resume point.

## Canonical Direction

The approved V2 design direction is documented in:

- `docs/Design Ref Implementation/PRD.md`
- `docs/Design Ref Implementation/Goal Prompt.md`
- `docs/design-ref/ATF Website v2.html`
- `docs/design-ref/README.md`
- `docs/design-ref/colors_and_type.css`

Source precedence for future agents:

1. The PRD and Goal Prompt define the V2 design target. Their descriptions of
   the earlier prototype are historical, not a current implementation inventory.
2. The design-reference files define ATF's V2 visual language, typography,
   palette, imagery, layout rhythm, and interaction cues.
3. The existing app code defines the implemented route structure and components.
4. TanStack starter text and prototype-comparison assumptions are historical.

CMS scope and delivery phases are defined by the
[Fetched-CMS PRD](.scratch/01-fetched-cms/PRD.md) and
[SEO-CMS PRD](.scratch/02-seo-cms/PRD.md).

## Commands

```bash
bun install
bun --bun run dev
bun --bun run build
bun --bun run test
```

The npm scripts are also standard package scripts, so `npm run build` and
`npm run test` invoke the same project commands if npm is the active package
manager.

## Backend CMS

The Payload Backend CMS runs independently from the public site on port `3001`.
Docker Compose starts Payload and its private PostgreSQL service:

```bash
make -C backend-cms build
make -C backend-cms start
make -C backend-cms logs
make -C backend-cms stop
make -C backend-cms down
```

`stop` and `down` preserve the PostgreSQL and media volumes. Read the
[Backend CMS guide](backend-cms/README.md) for direct npm development and the
confirmed command required to delete local data.

To read published News Articles from the local Backend CMS, create the public
site environment file before you start Vite:

```bash
cp .env.example .env
```

The example enables the multi-page routes and sets `VITE_BACKEND_CMS_ORIGIN`
to `http://localhost:3001`. The public preview route accepts Payload Live
Preview messages only from that exact origin. The Backend CMS loads the matching
preview route from `PAYLOAD_PUBLIC_SITE_ORIGIN`, which defaults to
`http://localhost:3000` in the development Compose configuration.

Before handing the CMS foundation to SEO-CMS, follow
[Prove the Fetched-CMS release](docs/general-guides/prove-fetched-cms-release.md).
The guide covers the automated gates, the clean local editorial workflow, the
Production Launch and Demo Rehearsal configuration pairs, and the deployed HTTPS
checks.

## Running with pm2

To keep the dev server running in the background, manage it with
[pm2](https://pm2.keymetrics.io/). The instance is named after the repo
(`atf-org-2026`), so every command targets it by that name. pm2 launches the
`dev` npm script (`vite --port 3000 --host`), so dependencies must already be
installed (`npm install`).

```bash
pm2 start npm --name atf-org-2026 -- run dev   # Start the dev server
pm2 stop atf-org-2026                          # Stop it (keeps it in pm2's list)
pm2 restart atf-org-2026                       # Restart it
pm2 logs atf-org-2026                          # Tail vite output
pm2 status                                     # List processes and their state
pm2 delete atf-org-2026                        # Remove it from pm2 entirely
```

`stop` leaves a stopped entry in `pm2 status`, so `pm2 start atf-org-2026`
restarts it without re-specifying the command. `delete` removes the entry
completely, so the next launch needs the full
`pm2 start npm --name atf-org-2026 -- run dev` line again.

## Project Structure

- `src/routes/` - TanStack Router file-based routes
- `src/components/layout/` - Shared navigation and footer
- `src/components/site/` - ATF page components and news presentation
- `src/components/ui/` - Shared UI primitives
- `src/services/news.ts` - Published News Article queries and response mapping
- `backend-cms/` - Payload application, PostgreSQL migrations, and Compose setup
- `.scratch/` - Local Markdown PRDs and implementation tickets
- `public/atf-assets/` - Current production-facing ATF assets
- `docs/design-ref/` - Reference-only V2 design files and assets
- `docs/Design Ref Implementation/` - PRD and prompt for the V2 implementation

## Implementation Notes

The V2 reference is a single-page artifact. The production app should remain a
multi-page TanStack Router app and translate the V2 design system across the
existing routes.

Do not copy the reference HTML as one large static page. Do not add a new
selectable theme. Do not reintroduce the prototype switcher, feedback panel,
accent picker, version selector, or URL-based visual version behavior in the
final public site.
