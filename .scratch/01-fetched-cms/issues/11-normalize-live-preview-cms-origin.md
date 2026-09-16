# 11 — Normalize the Backend CMS origin for Live Preview

**What to build:** An Editorial User can see News Article changes in Live
Preview when the configured Backend CMS origin has a trailing slash. The
preview leaves its waiting state, renders the article and populated Media,
and continues to reject messages from other origins.

**Blocked by:** None. Can start immediately.

**Blocks:** Completion of
[Prove the Fetched-CMS release path](10-prove-the-fetched-cms-release-path.md).

**Status:** closed

**Assignee:** Codex

## Acceptance criteria

- [x] The Live Preview integration normalizes the configured Backend CMS URL
  to its origin before passing it to Payload's preview hook. Equivalent values
  with and without a trailing slash behave identically.
- [x] A regression test exercises the preview route with the real Payload hook
  and a valid CMS message. With a trailing slash in the configuration, the test
  fails before the fix and renders the article and populated hero image after
  the fix. Mock the population response rather than the hook.
- [x] The regression coverage verifies the canonical CMS request URL, included
  credentials, and relationship population. It also covers configuration
  without a trailing slash and the existing local-development default.
- [x] Messages from an untrusted origin remain rejected and do not initiate
  population requests. Do not replace exact origin validation with a wildcard
  or prefix check.
- [x] Focused Live Preview and public news tests, the Public Site build, and
  typechecking pass. Report any unrelated baseline failures separately.
- [x] Provide a deployment verification handoff that distinguishes the local
  regression result from the still-required authenticated Demo Rehearsal check.
  A passing local test does not close the release-proof ticket.

## Diagnosis and reproduction evidence

On September 16, 2026, the user reported that an image appeared on the public
News Article page, while the demo CMS Live Preview pane remained on
`Waiting for News Article preview`. The user reported that development preview
worked.

The deployed Public Site preview bundle contained the Backend CMS URL
`https://cms-demo.africantechnologyforum.org/`, including its trailing slash.
Payload's Live Preview message filter compares the configured server URL
exactly with the message's origin. Browser origins do not include that trailing
slash, so valid CMS messages fail the comparison.

An in-memory Node and JSDOM reproduction mounted the installed Payload
`useLivePreview` hook, supplied an initial document ID, and dispatched a valid
`payload-live-preview` message from the CMS origin. Its population response was
stubbed. No application files or deployment settings changed.

| Configuration and message | Observed result |
| --- | --- |
| CMS URL with trailing slash; message from the canonical CMS origin | Remained on the waiting message, with zero population requests. Reproduced twice. |
| Same input, with only the configured URL normalized to its origin | Returned the incoming article title and made one population request. |
| Normalized CMS origin; message from an untrusted origin | Remained on the waiting message, with zero population requests. |

The original assertion that the valid CMS message should render the incoming
article title failed with the deployed configuration. The controlled comparison
passed after normalization. This establishes a blocking origin mismatch, but
does not prove that the deployed authenticated workflow has no additional bugs.

Public article queries already construct request URLs through the URL API,
which explains why Public Delivery can work with the same configuration.

## Scope and deployment handoff

Keep the fix within the Public Site's Live Preview origin handling and its
regression coverage. Preserve the content model, access rules, cookie policy,
and public delivery behavior. No broad refactor is needed for this issue.

After an approved Public Site rebuild and deployment, verify Live Preview in
the [Demo Backend CMS](https://cms-demo.africantechnologyforum.org/admin) with
the [Demo Public Site](https://public-demo.africantechnologyforum.org/). Confirm
that the pane leaves the waiting state, displays article changes, and populates
the hero image through the authenticated workflow. Record deployed revisions
and results in the release proof after approval to update that ticket.

Deployment verification remains outstanding:

1. After deployment approval, rebuild the Demo Public Site from a revision
   containing this fix. Set its build-time `VITE_BACKEND_CMS_ORIGIN` to
   `https://cms-demo.africantechnologyforum.org/` to verify the reported case.
   Record the actual deployed revisions of both applications.
2. Sign in to the Demo Backend CMS as an Editorial User. Open a News Article
   with a hero image and open Live Preview. Confirm that the waiting message
   disappears and that unsaved title and body changes render in the pane.
3. Confirm that the hero image renders. Inspect the population request and
   verify a successful authenticated request to
   `https://cms-demo.africantechnologyforum.org/api/news-articles/<document-id>`
   without a double slash before `api`. Record the result without cookie or
   credential values.
4. Open `/preview/news/<document-id>` directly on the Demo Public Site and
   complete the release guide's direct-navigation check. Confirm that the app
   boots, and distinguish that result from receiving Live Preview messages
   and populating authenticated Media.
5. After approval to update
   [Prove the Fetched-CMS release path](10-prove-the-fetched-cms-release-path.md),
   record the deployed revisions and observed results there. Keep its remaining
   release checks open until their required evidence exists.

## Comments

- 2026-09-16: The user requested this new issue instead of immediate
  implementation. Authorization covers issue creation only. Obtain approval
  before implementation or further updates, and before changing a deployment.
  The release-proof ticket remains open and unchanged by this ticket creation.
- 2026-09-16: The user approved the pre-flight recommendation: implement the
  preview-origin fix and regression coverage, run the required checks, and
  record results and the deployment handoff here. Claimed by Codex. Deployment
  and updates to the release-proof ticket remain outside this approval.

### September 16, 2026: resolution and local verification

The Public Site preview route now converts its configured Backend CMS URL to
`new URL(...).origin` before passing it to Payload's real `useLivePreview` hook.
The localhost default remains `http://localhost:3001`. Payload retains its exact
message-origin comparison and its credentialed population request.

The regression test reloads the route for three configurations: a URL with a
trailing slash, the same URL without the slash, and an unset value that uses the
local default. Each case sends a canonical browser origin and a News Article
whose hero image is a Media ID. Only the population response is mocked. Checks
cover the rendered title, body, populated image URL, canonical request URL,
included credentials, GET override header, population depth, and incoming Media
ID. Unrelated and lookalike origins produce no requests or draft rendering.

Verification results:

- Before the application fix, `npm test -- src/routes/-preview.news.test.tsx`
  reported one failure and four passes. Only the trailing-slash case failed,
  because the expected News Article heading never appeared.
- After the fix, the six-file command below reported 31 passes and one
  unrelated failure. All five preview tests passed, along with the news service,
  News Article route, News index, homepage, and Publications tests.
- The unrelated failure is
  `WhatWeDoLandingPage > expands the homepage What We Do section and links to its detail pages`
  in `src/components/site/SectionLandingPages.test.tsx:247`. The assertion expects
  Consulting, Challenge, Chapters; the component renders Challenge, Chapters,
  Consulting. Both that test and its component are unchanged, and the test
  imports the component directly without the preview route. This is separate
  from the Live Preview fix. The full-suite historical failure count was not
  reverified.
- `npm run build` passed both `vite build` and `tsc`.
- The initial `bun --bun run test` attempt produced no Vitest results and was
  interrupted. The completed test runs above used the documented npm path.

```bash
npm test -- src/routes/-preview.news.test.tsx src/services/news.test.ts 'src/routes/-news.$slug.test.tsx' src/routes/-news.index.test.tsx src/components/site/HomePage.test.tsx src/components/site/SectionLandingPages.test.tsx
npm run build
```

Closed for the completed local implementation, regression coverage, and
deployment handoff. No deployment or authenticated Demo Rehearsal ran in this
session. The local mock proves the request and response handling; it does not
prove deployed cookies, CMS access, or Media availability.
[Prove the Fetched-CMS release path](10-prove-the-fetched-cms-release-path.md)
remains open and was not edited by this implementation.
