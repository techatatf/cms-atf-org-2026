# ATF Org 2026

This is the African Technology Forum website app. It is a Vite, React, Tailwind,
and TanStack Router codebase that is being repurposed from a prototype
comparison app into one production ATF website.

## Current State

The source code still contains the earlier prototype architecture: selectable
visual versions, theme context, feedback controls, and version-specific section
branches. Treat that as transitional implementation detail, not as the product
direction.

The foundations worth preserving during the V2 implementation are:

- Multi-page TanStack Router routing in `src/routes`
- Shared layout boundaries for navigation, route content, and footer
- Reusable React components and shadcn-style primitives
- Tailwind CSS and the existing Vite build
- Existing route URLs and page content defaults where they still fit ATF
- The current public asset model

The theme around those foundations is expected to change.

## Canonical Direction

The approved implementation direction lives in:

- `docs/Design Ref Implementation/PRD.md`
- `docs/Design Ref Implementation/Goal Prompt.md`
- `docs/design-ref/ATF Website v2.html`
- `docs/design-ref/README.md`
- `docs/design-ref/colors_and_type.css`

Source precedence for future agents:

1. The PRD and Goal Prompt define the implementation target and the obsolete
   prototype concepts to remove.
2. The design-reference files define ATF's V2 visual language, typography,
   palette, imagery, layout rhythm, and interaction cues.
3. The existing app code defines useful route structure and content defaults
   that can survive when they do not conflict with the PRD.
4. TanStack starter text and prototype-comparison assumptions are historical.

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
- `src/components/sections/` - Current homepage sections
- `src/components/ui/` - Shared UI primitives
- `src/contexts/` - Current transitional prototype contexts
- `src/lib/themes.ts` - Current transitional prototype theme definitions
- `public/atf-assets/` - Current production-facing ATF assets
- `docs/design-ref/` - Reference-only V2 design files and assets
- `docs/Design Ref Implementation/` - PRD and prompt for the V2 implementation

## Implementation Notes

The V2 reference is a single-page artifact. The production app should remain a
multi-page TanStack Router app and translate the V2 design system across the
existing routes.

Do not copy the reference HTML as one large static page. Do not add a new
selectable theme. Do not preserve the prototype switcher, feedback panel,
accent picker, version selector, or URL-based visual version behavior in the
final public site.
