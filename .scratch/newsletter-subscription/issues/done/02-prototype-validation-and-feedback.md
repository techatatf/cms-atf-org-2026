Status: completed

# Complete the newsletter prototype's validation and feedback states

## Parent

[Newsletter Subscription PRD](../../PRD.md)

## What to build

Use the `$implement` skill to make the newsletter prototype fully reviewable by giving it every interaction state ATF needs to judge, while keeping it disconnected from the live email service.

A visitor who submits nothing is told an email address is required. A visitor who submits a malformed address is told to enter a valid one, before any request would be made. Surrounding whitespace is ignored so an accidental space does not invalidate a usable address. Feedback is announced to screen-reader users when it changes, and is distinguishable without relying on color. Editing the field clears stale feedback immediately, so a message never describes a value that is no longer present.

A valid submission in the prototype exercises the submitting and success treatments without contacting the ATF email service. The success treatment shows the real production success copy, because what ATF approves must be what ships — the non-live signalling stays in the separate review marker rather than being baked into hedged feedback copy. The prototype-only submission mechanic must be isolated enough to delete in one move and must not survive as a hidden fallback once the real transport lands.

The simulated pending operation lasts 750 milliseconds so the submitting treatment is observable during ordinary manual review. Automated tests control the delay with fake timers rather than waiting in real time, and the live integration removes the delay completely.

This slice completes the prototype. It also adds the two semantic feedback color tokens the design reference already specifies, which is the one sanctioned addition to the global token set in this feature.

## User stories covered

5, 11, 13-16, 25, and 34.

## Acceptance criteria

- [x] The semantic `--color-success` and `--color-error` tokens from the design reference are added. No existing brand color or typography token is modified, and no new brand color is introduced.
- [x] An empty submission displays `Email address is required`.
- [x] A malformed address displays `Please enter a valid email address`.
- [x] Validation applies the established basic email-shape rule to the trimmed value, so leading and trailing whitespace is ignored.
- [x] Validation feedback appears before any request would be issued.
- [x] Feedback is exposed through an accessible live status region and is announced when it changes.
- [x] Success and error are distinguishable without color, through text and a non-color cue, in addition to the semantic colors.
- [x] Feedback blocks are square and bordered, consistent with the established card treatment. They are not rounded and not pills.
- [x] The idle, submitting, success, and error treatments are all reachable by interacting with the form, so a reviewer can see each one. Empty and malformed submissions exercise validation variants of the error treatment rather than separate submission states.
- [x] The submitting treatment disables the action and changes its label to `Subscribing…`.
- [x] Changing the field value clears both success and error feedback on the first change, without requiring another submission.
- [x] A valid prototype submission issues no network request to the ATF email service.
- [x] The prototype success treatment displays the real production success copy rather than hedged preview copy.
- [x] The non-live review marker remains present and remains reachable independently of the feedback copy.
- [x] The prototype-only submission mechanic is isolated to one place and is trivially removable, with no hidden production fallback.
- [x] The simulated pending operation lasts 750 milliseconds, making the submitting treatment observable during manual review; automated tests use fake timers, and no real-time wait is added to the suite.
- [x] The approved section composition, colors, geometry, and copy from the previous ticket are unchanged.
- [x] Rendered-application tests cover the empty and malformed feedback paths, establish that native browser constraint validation does not preempt the application messages, verify the absence of any service call on a valid prototype submission, verify the presence of the review marker, and verify the clearing of stale feedback on the first field change.
- [x] Typechecking, the focused tests, the full test suite, and `$review` complete successfully.

## Implementation workflow

- Use `$implement`, including TDD at the agreed application-router seam, regular typechecking and focused test runs, the full test suite at the end, and `$review` after implementation.
- Do not start, stop, restart, or otherwise manage the development server. Assume the user manages a continuously running server, normally at `http://localhost:3000`.
- Do not commit. Leave the verified working tree uncommitted for the user.
- Report changed behavior, automated verification results, and any residual risks before handing off.

## Manual and visual verification

After automated verification, give the user these checks to perform against their managed server. This ticket produces the build ATF reviews, so the checks should be run at a narrow mobile, a tablet, and a desktop viewport:

1. Press Subscribe with the field empty and confirm the required-address message appears.
2. Enter `not-an-email` and submit. Confirm the invalid-address message appears.
3. Enter ` valid@example.com ` with surrounding spaces and submit. Confirm the spaces do not cause a validation failure.
4. Confirm the submitting treatment appears, with the action disabled and reading `Subscribing…`, followed by the success treatment.
5. Confirm the success message is the real production copy and that the non-live review marker is what identifies the section as a prototype.
6. Trigger a validation error with an empty or malformed value, then edit the field by one character. Confirm the message disappears immediately without submitting again.
7. Confirm success and error remain tellable apart with color ignored — squint, or view in grayscale.
8. Using a screen reader or the accessibility inspector, confirm feedback is announced when it changes.
9. Confirm no network request to the ATF email service appears in the browser network panel for any of the above.

Do not run the server or restart commands on the user's behalf. If the user is satisfied, suggest this commit message:

`feat: add newsletter prototype validation and feedback states`

## Blocked by

- [Issue 01: Place the newsletter CTA section on the homepage in the ATF design language](./01-newsletter-cta-section.md)

## Comments

### 2026-07-27 — Completed

Implemented all prototype validation and feedback states at the rendered-router seam, then completed an independent review/fix pass with no remaining blocker. Final verification passed: `git diff --check`, `npx tsc --noEmit`, `npm test -- src/router.test.tsx` (68 tests), `npm test` (91 tests), and `npm run build`. Source inspection also confirmed that no live newsletter endpoint or request was introduced; valid submissions use only the isolated 750 ms prototype substitute.
