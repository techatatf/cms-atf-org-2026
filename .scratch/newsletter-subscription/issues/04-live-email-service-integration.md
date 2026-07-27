Status: ready-for-agent

# Wire the newsletter form to the live ATF email service

## Parent

[Newsletter Subscription PRD](../PRD.md)

## What to build

Use the `$implement` skill to replace the prototype's simulated submission with the real ATF email service, so a visitor who subscribes actually subscribes.

After pressing Subscribe, a visitor sees a clear submitting state and cannot create a duplicate request while the first is pending. A confirmed subscription shows a success message and clears the field. A rejected subscription shows the explanation the email service supplied when that explanation is usable, and stable application copy when it is not. Any transport-level problem — a refused connection, a malformed response, an unexpected response shape, or a request that takes too long — shows a single generic failure message; the form never reports which layer failed, because distinguishing "we could not reach the service" from "the service refused you" tells an attacker about infrastructure state for no visitor benefit. Every failure retains the entered address so the visitor does not retype it, and editing the field after a failure clears the stale message.

The endpoint and the request live behind one application-owned newsletter subscription function, so no component holds a URL or raw request logic and the backend contract can be tested and changed without touching the CTA.

This ticket also removes the prototype scaffolding: the simulated submission mechanic and the non-live review marker both go away entirely, with no hidden fallback left behind. It preserves the approved submitting behavior and replaces only its simulated pending operation with the live request. It must not otherwise change the approved visual composition; anything further needs another review.

**Read the reference implementation before starting.** The PRD records where it lives in the sibling static-site repository. It is the authority on the request contract and the source copy; do not reconstruct either from description.

## User stories covered

17-24, 31, 34, and 36.

## Acceptance criteria

- [ ] One application-owned newsletter subscription function owns the endpoint and the request. No component contains an endpoint URL or raw request logic.
- [ ] The request is an HTTP `POST` with JSON content type and a payload containing one `email` property holding the trimmed address.
- [ ] The endpoint hostname is reproduced exactly as recorded in the PRD, including its existing misspelling, which must not be corrected.
- [ ] A successful subscription requires both a successful HTTP response and `success: true` in the parsed body.
- [ ] A backend message is displayed when it is a string, is non-empty after trimming, and is at most 200 characters. Anything else falls back to application copy.
- [ ] A confirmed success with no usable backend message displays `Successfully subscribed to our newsletter!`.
- [ ] An HTTP failure or `success: false` with no usable backend message displays `Failed to subscribe. Please try again.`
- [ ] Malformed JSON, an unexpected response shape, a rejected request, and a timeout all display `Failed to subscribe. Please try again.` No connection-specific copy appears anywhere.
- [ ] The request is bounded by a ten-second abort timeout. A timeout is a failure outcome that re-enables the action and retains the entered address.
- [ ] While a request is pending, the action carries the native disabled attribute and the submit handler also returns early, so a programmatic submission cannot start a second request.
- [ ] The submitting state is communicated semantically as well as visually.
- [ ] The field is cleared only after a confirmed success, and retains its value after validation, backend, parsing, network, and timeout failures.
- [ ] Editing the field after any outcome clears stale feedback on the first change.
- [ ] The prototype-only submission mechanic and the non-live review marker are removed completely, with no hidden production fallback remaining.
- [ ] The approved section composition, colors, geometry, and copy are otherwise unchanged.
- [ ] Rendered-application tests replace the newsletter service at the application boundary with deterministic outcomes and never contact the live service.
- [ ] Tests verify that an empty or malformed address produces no service call.
- [ ] Rendered-application tests verify that a valid address is trimmed and passed to the newsletter service exactly once.
- [ ] Focused transport tests mock `fetch` beneath the newsletter service and verify the exact endpoint, HTTP `POST` method, JSON content type, one-property JSON payload, response parsing, and ten-second abort behavior without contacting the live service.
- [ ] Tests verify that a pending request prevents a repeat submission and communicates progress.
- [ ] Tests verify that HTTP success plus `success: true` clears the field and displays the backend or fallback success message.
- [ ] Tests verify that HTTP failure, `success: false`, malformed JSON, unexpected response data, a rejected request, and a timeout each display the appropriate message and retain the entered address.
- [ ] Tests verify that an unusable backend message — a non-string, an empty or whitespace-only string, or an over-length string — falls back to application copy on both the success and failure paths.
- [ ] Typechecking, the focused tests, the full test suite, and `$review` complete successfully.

## Implementation workflow

- Use `$implement`, including TDD at the agreed application-router seam, regular typechecking and focused test runs, the full test suite at the end, and `$review` after implementation.
- Do not start, stop, restart, or otherwise manage the development server. Assume the user manages a continuously running server, normally at `http://localhost:3000`.
- Do not commit. Leave the verified working tree uncommitted for the user.
- Report changed behavior, automated verification results, and any residual risks before handing off.

## Manual and visual verification

**From this ticket onward, submitting a valid address on the development server creates a real subscription.** The prototype's protection is gone by design. The checks below therefore avoid valid addresses. Tell the user this explicitly before handing off, and do not submit a valid address on their behalf.

Give the user these checks to perform against their managed server:

1. Submit with the field empty, then with `not-an-email`. Confirm the validation messages still appear and that the browser network panel shows no request in either case.
2. Confirm the non-live review marker is gone.
3. With the browser network panel set to offline or blocking the service host, submit a syntactically valid but disposable address. Confirm the generic failure message appears, the action re-enables, and the address is still in the field.
4. Confirm no message anywhere mentions connections, hosts, or transport specifics.
5. Edit the field by one character and confirm the failure message clears immediately.
6. Confirm the section's appearance, including its submitting state, is unchanged from the approved prototype.
7. Only if the user deliberately chooses to create a real subscription, using an ATF-approved test address, confirm the success message appears and the field clears.

Do not run the server or restart commands on the user's behalf. If the user is satisfied, suggest this commit message:

`feat: wire newsletter form to ATF email service`

## Blocked by

- [Issue 03: ATF prototype review and approval gate](./done/03-prototype-approval-gate.md)
