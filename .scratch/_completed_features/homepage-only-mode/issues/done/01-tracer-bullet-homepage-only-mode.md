Status: done

# Tracer bullet: activate homepage-only mode through one complete route

## Parent

[Homepage-Only Mode PRD](../../PRD.md)

## What to build

Use the `$implement` skill to establish one narrow, complete path through homepage-only mode.

Add the build-time `VITE_HOMEPAGE_ONLY_MODE` contract, defaulting to enabled unless its value is exactly `false`. When enabled, select an isolated temporary site shell, add a stable About homepage anchor, redirect direct visits to `/about` to `/#about` before About-page content renders, and keep the homepage, Privacy Policy, and Terms of Service accessible. The temporary shell only needs the logo, About navigation, and legal links in this tracer slice. When the flag is explicitly disabled, preserve the existing shell and `/about` route behavior.

This slice proves the complete flag-to-browser path before the remaining navigation and route families are added.

## User stories covered

4, 5, 13, 20-25, 27-30.

## Acceptance criteria

- [ ] A missing `VITE_HOMEPAGE_ONLY_MODE` value enables homepage-only mode.
- [ ] Only the exact value `false` disables homepage-only mode.
- [ ] Enabled mode renders an isolated temporary shell instead of the existing navbar and footer.
- [ ] The temporary logo returns to the top of the homepage and its About control targets `/#about`.
- [ ] The homepage exposes a stable `#about` anchor that is not obscured by the fixed header.
- [ ] A direct visit to `/about` redirects to `/#about` before About-page content renders.
- [ ] `/`, `/privacy-policy`, and `/terms-of-service` remain directly accessible in enabled mode.
- [ ] Both legal pages render inside the temporary shell.
- [ ] Explicitly disabled mode retains the existing shell and renders `/about` normally.
- [ ] Application-router integration tests cover both flag states and the tracer route.
- [ ] Typechecking, the focused tests, the full test suite, and `$review` complete successfully.

## Implementation workflow

- Use `$implement`, including TDD at the agreed application-router seam, regular typechecking and focused test runs, the full test suite at the end, and `$review` after implementation.
- Do not start, stop, restart, or otherwise manage the development server. Assume the user manages a continuously running server, normally at `http://localhost:3000`.
- Do not commit. Leave the verified working tree uncommitted for the user.
- Report changed behavior, automated verification results, and any residual risks before handing off.

## Manual and visual verification

After automated verification, give the user these checks to perform against their managed server:

1. With the flag omitted, open `http://localhost:3000/` and confirm the temporary shell appears.
2. Click About and confirm the URL becomes `/#about` and the About section is positioned below the fixed header.
3. Open `http://localhost:3000/about` directly and confirm it lands at `/#about` without showing About-page content.
4. Open `/privacy-policy` and `/terms-of-service` directly and confirm both render with the temporary shell.
5. When the user chooses to restart their managed server with `VITE_HOMEPAGE_ONLY_MODE=false`, confirm the existing navbar and footer return and `/about` renders normally.

Do not run the server or restart commands on the user's behalf. If the user is satisfied, suggest this commit message:

`feat: add homepage-only mode tracer bullet`

## Blocked by

None - can start immediately.
