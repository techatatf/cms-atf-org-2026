Status: ready-for-agent

# Record newsletter subscriptions through an application-owned analytics boundary

## Parent

[Newsletter Subscription PRD](../PRD.md)

## What to build

Use the `$implement` skill to make a confirmed subscription measurable, without making analytics a subscription requirement and without adding an analytics vendor to the application.

Introduce the application-owned analytics boundary: a small module exposing a typed event capture function that defaults to a safe no-op. `posthog-js` is deliberately **not** installed, no root provider is added, and no analytics network traffic leaves the browser. The separate PostHog integration plan later supplies a real client behind the interface this ticket establishes. That ordering is a settled decision recorded in the PRD — the PostHog plan's own Phase 1 is not a prerequisite for this work, and the plan carries a note saying so.

When the ATF email service confirms a subscription, the application emits exactly one `newsletter_subscribed` event carrying the page, the form type, and only the domain portion of the address. The subscriber's complete email address never appears in the payload. Nothing else emits this event: validation errors, backend failures, parse failures, network failures, and timeouts all produce no analytics event, so the success metric stays accurate.

Analytics is strictly downstream of the subscription. Capture happens after backend success, and a missing analytics implementation or an analytics call that throws must leave the visitor's outcome completely untouched — same success message, field still cleared, no error surfaced. Backend availability and analytics availability fail independently, so an analytics incident can never become a newsletter incident.

## User stories covered

26-30, 32, and 35.

## Acceptance criteria

- [ ] An application-owned analytics boundary exposes a typed event capture function and defaults to a safe no-op when no implementation is configured.
- [ ] `posthog-js` is not added as a dependency, no PostHog root provider is added, and the application sends no analytics network traffic.
- [ ] The newsletter form calls the boundary rather than any vendor client directly.
- [ ] A confirmed backend success emits exactly one `newsletter_subscribed` event.
- [ ] The event carries `page` set to `home`, `form_type` set to `newsletter`, and `email_domain` containing only the lowercased portion of the trimmed address following its single `@`.
- [ ] The event payload does not contain the complete email address.
- [ ] No event is emitted for a validation error, an HTTP failure, `success: false`, malformed JSON, an unexpected response shape, a network failure, or a timeout.
- [ ] Capture occurs after backend success, never before or instead of it.
- [ ] A missing analytics implementation leaves the success message, the cleared field, and the visible outcome unchanged.
- [ ] An analytics call that throws leaves the success message, the cleared field, and the visible outcome unchanged, and surfaces no error to the visitor.
- [ ] Tests verify exactly one event with the approved properties on confirmed success.
- [ ] Tests inspect the event payload to establish that the complete email address is absent.
- [ ] Tests verify that every failure path and every invalid submission emits no newsletter success event.
- [ ] Tests verify that a missing analytics implementation and a throwing analytics call each leave the successful visitor outcome unchanged.
- [ ] Tests assert the application's own analytics contract rather than any vendor SDK internals.
- [ ] Typechecking, the focused tests, the full test suite, and `$review` complete successfully.

## Implementation workflow

- Use `$implement`, including TDD at the agreed application-router seam, regular typechecking and focused test runs, the full test suite at the end, and `$review` after implementation.
- Do not start, stop, restart, or otherwise manage the development server. Assume the user manages a continuously running server, normally at `http://localhost:3000`.
- Do not commit. Leave the verified working tree uncommitted for the user.
- Report changed behavior, automated verification results, and any residual risks before handing off.

## Manual and visual verification

Because no analytics client is installed, there is nothing to observe in a vendor dashboard. Verification is about proving the newsletter still behaves correctly with the boundary in place.

Give the user these checks to perform against their managed server:

1. Submit with the field empty and with a malformed address. Confirm behavior is unchanged from the previous ticket.
2. Confirm the browser network panel shows no analytics requests at any point.
3. Confirm the browser console shows no analytics errors or warnings on page load or on submission.
4. Trigger a failure path as in the previous ticket and confirm the failure message and retained address are unchanged.
5. Only if the user deliberately chooses to create a real subscription, using an ATF-approved test address, confirm the success message and cleared field are unchanged from the previous ticket.

Do not run the server or restart commands on the user's behalf. If the user is satisfied, suggest this commit message:

`feat: record newsletter subscriptions in analytics`

## Blocked by

- [Issue 04: Wire the newsletter form to the live ATF email service](./done/04-live-email-service-integration.md)
