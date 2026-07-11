Status: ready-for-agent

# Complete the temporary responsive site shell

## Parent

[Homepage-Only Mode PRD](../PRD.md)

## What to build

Use the `$implement` skill to expand the tracer shell into the complete temporary homepage-only experience.

On desktop, expose simple About, Programs, Chapters, and News navigation buttons plus the Partner with Us action, with no dropdown hierarchy. On mobile, expose the same destinations through a compact and accessible menu. Complete the temporary footer with homepage section links, existing contact and social destinations, Privacy Policy, and Terms of Service. Add all required stable homepage anchors and ensure navigation works from both the homepage and legal pages.

## User stories covered

1-9, 11, 21-23, and 29.

## Acceptance criteria

- [ ] Desktop navigation contains About, Programs, Chapters, News, and Partner with Us without dropdowns.
- [ ] Destinations are `/#about`, `/#programs`, `/#chapters`, `/#news`, and `/#funder` respectively.
- [ ] The logo returns to the top of the homepage.
- [ ] Mobile navigation uses a compact menu control and exposes the same five destinations.
- [ ] The mobile menu is keyboard accessible, has an accessible name, closes predictably after navigation, and does not shift or overlap page content.
- [ ] Stable `#about`, `#programs`, `#chapters`, `#news`, `#funder`, and `#student` anchors exist and account for the fixed header.
- [ ] Navigation from Privacy Policy and Terms of Service returns to the requested homepage section.
- [ ] The temporary footer contains homepage section links, existing contact and social destinations, Privacy Policy, and Terms of Service.
- [ ] The temporary footer contains no link to a hidden route.
- [ ] The existing shell remains unchanged when homepage-only mode is explicitly disabled.
- [ ] Integration tests cover desktop navigation, mobile menu behavior, legal-page navigation, and disabled-mode restoration.
- [ ] Typechecking, the focused tests, the full test suite, and `$review` complete successfully.

## Implementation workflow

- Use `$implement`, including TDD at the agreed application-router seam, regular typechecking and focused test runs, the full test suite at the end, and `$review` after implementation.
- Do not start, stop, restart, or otherwise manage the development server. Assume the user manages a continuously running server, normally at `http://localhost:3000`.
- Do not commit. Leave the verified working tree uncommitted for the user.
- Report changed behavior, automated verification results, and any residual risks before handing off.

## Manual and visual verification

After automated verification, give the user these checks to perform against their managed server:

1. At a desktop width, open the homepage and confirm the five approved destinations are visible, no dropdowns remain, and the header does not overlap content.
2. Click each destination and confirm the correct section settles below the fixed header.
3. Open each legal page, use at least two section links, and confirm navigation returns to the intended homepage section.
4. At a narrow mobile width, open and close the menu, verify all five destinations fit, and confirm selecting one closes the menu and reaches the correct section.
5. Inspect the footer at desktop and mobile widths and confirm its links fit without overlap and expose no hidden route.
6. When the user chooses to run with `VITE_HOMEPAGE_ONLY_MODE=false`, confirm the original dropdown navbar and footer return unchanged.

Do not run the server or restart commands on the user's behalf. If the user is satisfied, suggest this commit message:

`feat: add responsive homepage-only site shell`

## Blocked by

- [Issue 01: Tracer bullet: activate homepage-only mode through one complete route](./done/01-tracer-bullet-homepage-only-mode.md)
