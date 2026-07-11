Status: ready-for-agent

# Remap visible hidden-page links to homepage sections

## Parent

[Homepage-Only Mode PRD](../PRD.md)

## What to build

Use the `$implement` skill to remove the remaining user-facing paths into redirects.

While homepage-only mode is enabled, make every visible homepage card, call to action, and other internal link that currently targets a hidden route lead directly to its approved semantic homepage section. Keep external URLs, email destinations, social links, and legal links unchanged. When the flag is explicitly disabled, preserve every existing subpage destination.

## User stories covered

10, 12, and 28.

## Acceptance criteria

- [ ] Every visible internal homepage link that currently targets a hidden route resolves directly to an approved homepage anchor in enabled mode.
- [ ] About and organization links resolve to `/#about`.
- [ ] Program overview links resolve to `/#programs`, consulting and partnership links resolve to `/#funder`, challenge links resolve to `/#student`, chapter and country links resolve to `/#chapters`, and publication or news links resolve to `/#news`.
- [ ] Users do not encounter a hidden-route redirect after selecting a visible internal link.
- [ ] External URLs, the external challenge application, email links, contact links, social links, Privacy Policy, and Terms of Service remain unchanged.
- [ ] Explicitly disabled mode preserves every existing internal subpage destination.
- [ ] Integration tests cover representative cards and calls to action from each destination family, unchanged external and legal links, and disabled-mode restoration.
- [ ] Typechecking, the focused tests, the full test suite, and `$review` complete successfully.

## Implementation workflow

- Use `$implement`, including TDD at the agreed application-router seam, regular typechecking and focused test runs, the full test suite at the end, and `$review` after implementation.
- Do not start, stop, restart, or otherwise manage the development server. Assume the user manages a continuously running server, normally at `http://localhost:3000`.
- Do not commit. Leave the verified working tree uncommitted for the user.
- Report changed behavior, automated verification results, and any residual risks before handing off.

## Manual and visual verification

After automated verification, give the user these checks to perform against their managed server:

1. On the homepage, click representative organization, program, consulting, challenge, chapter, country, publication, and news links.
2. Confirm each link goes directly to its semantic homepage anchor without briefly visiting a hidden route.
3. Confirm the target section settles below the fixed header and the browser Back action behaves normally.
4. Inspect or activate representative email, social, and external challenge links and confirm their destinations are unchanged.
5. Confirm Privacy Policy and Terms of Service still open their legal pages.
6. When the user chooses to run with `VITE_HOMEPAGE_ONLY_MODE=false`, confirm representative cards and calls to action recover their original subpage destinations.

Do not run the server or restart commands on the user's behalf. If the user is satisfied, suggest this commit message:

`feat: remap homepage links in homepage-only mode`

## Blocked by

- [Issue 02: Complete the temporary responsive site shell](./02-complete-responsive-site-shell.md)
