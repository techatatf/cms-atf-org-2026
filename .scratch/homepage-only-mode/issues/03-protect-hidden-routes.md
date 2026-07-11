Status: ready-for-agent

# Protect every hidden route in homepage-only mode

## Parent

[Homepage-Only Mode PRD](../PRD.md)

## What to build

Use the `$implement` skill to expand the tracer redirect into the complete fail-closed route policy.

While homepage-only mode is enabled, allow direct access only to the homepage, Privacy Policy, and Terms of Service. Redirect every known hidden route family to its approved semantic homepage anchor before hidden content renders. Redirect any future or unrecognized non-legal route to the homepage. Preserve every current route when the flag is explicitly disabled.

## User stories covered

13-20 and 30.

## Acceptance criteria

- [ ] `/who-we-are`, `/about`, and `/team` redirect to `/#about`.
- [ ] `/what-we-do` redirects to `/#programs`.
- [ ] `/consulting` redirects to `/#funder`.
- [ ] `/challenge` redirects to `/#student`.
- [ ] `/chapters`, `/where-we-work`, and every `/countries/*` route redirect to `/#chapters`.
- [ ] `/publications`, `/articles`, `/research`, `/library`, `/news`, and every `/news/*` route redirect to `/#news`.
- [ ] Any future or unrecognized non-legal route redirects to `/` while the mode is enabled.
- [ ] The homepage, Privacy Policy, and Terms of Service remain directly accessible.
- [ ] Hidden route content does not render or flash before redirection.
- [ ] Query strings or malformed dynamic identifiers cannot bypass the route policy.
- [ ] Explicitly disabled mode preserves direct access to all existing routes.
- [ ] Application-router integration tests cover every redirect family, both dynamic route families, the fallback, the allowlist, and disabled mode.
- [ ] Typechecking, the focused tests, the full test suite, and `$review` complete successfully.

## Implementation workflow

- Use `$implement`, including TDD at the agreed application-router seam, regular typechecking and focused test runs, the full test suite at the end, and `$review` after implementation.
- Do not start, stop, restart, or otherwise manage the development server. Assume the user manages a continuously running server, normally at `http://localhost:3000`.
- Do not commit. Leave the verified working tree uncommitted for the user.
- Report changed behavior, automated verification results, and any residual risks before handing off.

## Manual and visual verification

After automated verification, give the user a representative direct-navigation checklist against their managed server:

1. Open `/team`, `/what-we-do`, `/consulting`, and `/challenge`; confirm each lands at its approved homepage anchor.
2. Open `/where-we-work` and `/countries/ghana`; confirm both land at `/#chapters`.
3. Open `/publications`, `/research`, `/news`, and `/news/manual-check`; confirm each lands at `/#news`.
4. Open an unrecognized path such as `/homepage-only-manual-check`; confirm it returns to `/`.
5. Confirm no hidden page content flashes during any redirect.
6. Recheck `/privacy-policy` and `/terms-of-service` and confirm they remain accessible.
7. When the user chooses to run with `VITE_HOMEPAGE_ONLY_MODE=false`, confirm representative subpages render instead of redirecting.

Do not run the server or restart commands on the user's behalf. If the user is satisfied, suggest this commit message:

`feat: redirect hidden routes in homepage-only mode`

## Blocked by

- [Issue 01: Tracer bullet: activate homepage-only mode through one complete route](./done/01-tracer-bullet-homepage-only-mode.md)
- [Issue 02: Complete the temporary responsive site shell](./02-complete-responsive-site-shell.md)
