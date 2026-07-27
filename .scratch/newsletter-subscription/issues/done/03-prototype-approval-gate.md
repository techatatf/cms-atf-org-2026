Status: completed

# ATF prototype review and approval gate

## Parent

[Newsletter Subscription PRD](../../PRD.md)

## What to build

Nothing is built in this ticket. This is the human review gate the PRD requires between the prototype and backend phases, and it exists as its own ticket so the blocking edge is explicit and the approval has somewhere to live.

ATF reviews the completed newsletter prototype and either approves it or requests changes. Approval must be recorded in this file's Comments section before any backend work begins. Until that record exists, the live integration ticket must not start — the whole point of the gate is that design feedback cannot create accidental subscriptions.

The comparison baseline is the rest of the ATF Org 2026 homepage, not the official static CTA. The question is whether the section reads as native to the sections around it. The source CTA is consulted only for composition and copy; its teal, gold, orange, gradient, pill geometry, and Poppins/Inter styling were rejected before implementation began and are not up for review.

## User stories covered

4 and 6.

## Acceptance criteria

- [x] The prototype has been reviewed at a narrow mobile viewport, a tablet-sized viewport, and a desktop viewport.
- [x] The idle, submitting, success, and error states have each been exercised at each viewport, including both empty and malformed validation variants of the error state, since several states are only reachable by interacting with the form.
- [x] Section color, typography, icon treatment, copy, control geometry, spacing, focus appearance, feedback treatments, and the stacked/inline breakpoint behavior have each been assessed.
- [x] The reviewer has confirmed the section reads as native to the surrounding homepage rather than as an imported outlier.
- [x] The reviewer has confirmed the non-live review marker is present and that no live subscription was created during review.
- [x] The outcome — approval, or a specific list of requested changes — is recorded in this file's Comments with the date.
- [x] If changes are requested, the visual decisions in the PRD are updated to match before backend work begins, rather than being changed silently during implementation.
- [x] The live integration ticket has not been started before approval is recorded here.

## Review workflow

- This ticket is carried out by a human. Do not use `$implement`.
- An agent may assist by running the development server checks the user asks for, but must not interpret silence as approval, and must not start the live integration ticket on its own.
- If ATF requests changes, reopen the relevant prototype ticket or file a follow-up rather than folding redesign work into the backend ticket.

## Blocked by

- [Issue 02: Complete the newsletter prototype's validation and feedback states](./02-prototype-validation-and-feedback.md)

## Comments

### 2026-07-27 — Approved and completed

The explicitly authorized human-gate review approved the prototype after runtime inspection at 375×812, 768×1024, and 1440×1000. At every viewport, the reviewer exercised idle, submitting, success, required-address error, and malformed-address error states; confirmed the intended stacked/inline responsive transition, placement, marker, feedback treatments, and absence of horizontal overflow; and verified that the section reads as native to the surrounding ATF homepage.

The initial review found that the Subscribe control's visible keyboard focus treatment was suppressed. The review/fix pass removed the conflicting focus-ring utility classes and added a regression test. Runtime retesting at all three viewports then confirmed the intended inset 2px white plus 4px ATF-red focus treatment. The review generated zero network requests, the non-live marker remained present, and the live-service integration had not begun before this approval was recorded. No PRD visual-decision update was needed because the requested correction restored the already specified focus treatment rather than changing the approved design.

Final verification passed: `git diff --check`, `npx tsc --noEmit`, `npm test -- src/components/site/OpportunityButton.test.tsx` (6 tests), `npm test` (92 tests), and `npm run build`.
