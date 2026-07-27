Status: ready-for-agent

# Place the newsletter CTA section on the homepage in the ATF design language

## Parent

[Newsletter Subscription PRD](../PRD.md)

## What to build

Use the `$implement` skill to put the newsletter CTA on the homepage as its own section, rendered in ATF Org 2026's design language.

A visitor reaching the end of the homepage's editorial content finds a clearly distinct closing invitation to subscribe: a black band carrying a red diagonal accent panel and a red corner triangle, a `Newsletter` eyebrow, a red square icon plate holding a white mail glyph, the heading "Stay Connected", the supporting copy, an email field, and a Subscribe action. The field and action sit together on one row from the small breakpoint upward and stack cleanly below it. Keyboard users see a visible focus treatment on both controls, and screen-reader users get a real accessible name on the field rather than a placeholder.

This slice establishes placement, composition, and visual language only. The form accepts input and prevents native submission, but produces no validation or feedback yet — that is the next ticket. The field uses `type="email"`, and the form uses `noValidate` so browser constraint validation cannot introduce its own feedback before the application-owned validation lands. A persistent review marker identifies the section as non-live from the moment it exists, so the section is never misleading mid-development.

The section treatment reuses the geometry `PageHero` already establishes rather than inventing new visual language. It introduces no typeface, loads no webfont, and uses none of the source CTA's teal, gold, or orange.

## User stories covered

1-3, 7-10, 12, and 33.

## Acceptance criteria

- [ ] The newsletter CTA renders on the homepage after the main editorial content and immediately before the partners section.
- [ ] The section appears in both the normal application shell and homepage-only mode, and does not inherit the news section's homepage-only `hidden` treatment.
- [ ] The section exposes its own `newsletter` anchor and settles below the fixed header using the established homepage anchor treatment.
- [ ] The band is black with white text, carries a red diagonal accent panel following the established page-hero clip-path treatment, and carries a red corner triangle at the lower left.
- [ ] The eyebrow, icon plate, and heading sit on the black side; the field, action, and future feedback area sit over the red panel.
- [ ] The eyebrow reads `Newsletter` and uses the established triangle eyebrow treatment.
- [ ] The mail icon sits in a solid red square plate with a white glyph, matching the established page-hero icon treatment. It is not a circle and not gold.
- [ ] The heading is exposed as a heading whose accessible name is `Stay Connected`.
- [ ] The supporting copy reads exactly: `Subscribe for the latest research highlights, event invitations, and ecosystem news delivered straight to your inbox.`
- [ ] The email field has an accessible name that does not depend on its placeholder, while the placeholder remains visually present.
- [ ] The field uses `type="email"`, and the form uses `noValidate` so activating Subscribe cannot trigger native browser validation feedback.
- [ ] The Subscribe action is the existing opportunity button rendered as a submit control, not a bespoke button.
- [ ] The field and action are inline from the small breakpoint upward and stacked below it, with neither control overflowing a narrow viewport.
- [ ] The field value is controlled and is never transformed while the visitor types.
- [ ] Both controls show a visible focus treatment. Controls over the red panel use a white focus ring rather than the global red ring.
- [ ] The section is square-cornered throughout: no rounded field, action, or plate.
- [ ] A persistent review marker identifies the section as non-live, and is a single self-contained element that can later be deleted wholesale.
- [ ] Activating Subscribe does not navigate, reload, or issue any network request. Producing feedback is out of scope for this ticket.
- [ ] No typeface is added and no webfont is loaded over the network.
- [ ] Rendered-application tests cover the section's position relative to the news and partners sections, its presence in both application shells, and the semantic exposure of the heading, copy, field, and action.
- [ ] Typechecking, the focused tests, the full test suite, and `$review` complete successfully.

## Implementation workflow

- Use `$implement`, including TDD at the agreed application-router seam, regular typechecking and focused test runs, the full test suite at the end, and `$review` after implementation.
- Do not start, stop, restart, or otherwise manage the development server. Assume the user manages a continuously running server, normally at `http://localhost:3000`.
- Do not commit. Leave the verified working tree uncommitted for the user.
- Report changed behavior, automated verification results, and any residual risks before handing off.

## Manual and visual verification

After automated verification, give the user these checks to perform against their managed server:

1. Open `http://localhost:3000/` and scroll to the end of the editorial content. Confirm the newsletter CTA appears immediately before the partners section.
2. Confirm the section reads as native to the surrounding homepage: ATF red and black, Montserrat headings, square geometry, and the triangle vocabulary. Confirm no teal, gold, or orange appears anywhere in it.
3. At a narrow mobile viewport, confirm the field and action stack and neither overflows.
4. At a tablet and a desktop viewport, confirm the field and action share one row and align at the same height.
5. Tab through the section and confirm the field and the Subscribe action each show a clearly visible focus treatment against the red panel.
6. Open `http://localhost:3000/#newsletter` and confirm the section settles below the fixed header.
7. Press Subscribe and confirm the page does not reload or navigate.
8. Confirm the non-live review marker is visible.
9. When the user chooses to run with `VITE_HOMEPAGE_ONLY_MODE=false`, confirm the section still appears in the same position.

Do not run the server or restart commands on the user's behalf. If the user is satisfied, suggest this commit message:

`feat: add newsletter CTA section to homepage`

## Blocked by

None - can start immediately.
