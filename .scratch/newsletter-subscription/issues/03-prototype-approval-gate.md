Status: ready-for-human

# ATF prototype review and approval gate

## Parent

[Newsletter Subscription PRD](../PRD.md)

## What to build

Nothing is built in this ticket. This is the human review gate the PRD requires between the prototype and backend phases, and it exists as its own ticket so the blocking edge is explicit and the approval has somewhere to live.

ATF reviews the completed newsletter prototype and either approves it or requests changes. Approval must be recorded in this file's Comments section before any backend work begins. Until that record exists, the live integration ticket must not start — the whole point of the gate is that design feedback cannot create accidental subscriptions.

The comparison baseline is the rest of the ATF Org 2026 homepage, not the official static CTA. The question is whether the section reads as native to the sections around it. The source CTA is consulted only for composition and copy; its teal, gold, orange, gradient, pill geometry, and Poppins/Inter styling were rejected before implementation began and are not up for review.

## User stories covered

4 and 6.

## Acceptance criteria

- [ ] The prototype has been reviewed at a narrow mobile viewport, a tablet-sized viewport, and a desktop viewport.
- [ ] The idle, submitting, success, and error states have each been exercised at each viewport, including both empty and malformed validation variants of the error state, since several states are only reachable by interacting with the form.
- [ ] Section color, typography, icon treatment, copy, control geometry, spacing, focus appearance, feedback treatments, and the stacked/inline breakpoint behavior have each been assessed.
- [ ] The reviewer has confirmed the section reads as native to the surrounding homepage rather than as an imported outlier.
- [ ] The reviewer has confirmed the non-live review marker is present and that no live subscription was created during review.
- [ ] The outcome — approval, or a specific list of requested changes — is recorded in this file's Comments with the date.
- [ ] If changes are requested, the visual decisions in the PRD are updated to match before backend work begins, rather than being changed silently during implementation.
- [ ] The live integration ticket has not been started before approval is recorded here.

## Review workflow

- This ticket is carried out by a human. Do not use `$implement`.
- An agent may assist by running the development server checks the user asks for, but must not interpret silence as approval, and must not start the live integration ticket on its own.
- If ATF requests changes, reopen the relevant prototype ticket or file a follow-up rather than folding redesign work into the backend ticket.

## Blocked by

- [Issue 02: Complete the newsletter prototype's validation and feedback states](./done/02-prototype-validation-and-feedback.md)

## Comments

_Approval or requested changes are recorded here._
