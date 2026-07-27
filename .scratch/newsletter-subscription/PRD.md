Status: ready-for-agent

# Newsletter Subscription

## Problem Statement

ATF Org 2026 does not currently give visitors a way to subscribe to the African
Technology Forum newsletter. A newsletter experience already exists on the
official static ATF website, but its visual language, interaction states, email
service integration, and analytics behavior have not been carried into the new
application.

ATF needs to review and approve the newsletter experience before it is connected
to the live email service. Combining visual prototyping and live backend wiring
in one unreviewed step would make design feedback harder to isolate and could
allow an unfinished form to create real subscriptions.

The newsletter transport and PostHog serve different purposes. The ATF email
service creates the subscription; PostHog records a successful subscription
event afterward. A failure or absence of analytics must never prevent a visitor
from subscribing.

## Solution

Deliver the newsletter subscription experience in two gated phases.

The first phase will add a non-production UI prototype to the homepage. It will
adopt the official static ATF newsletter CTA's section composition, copy,
responsive form, validation, and feedback structure, rendered in ATF Org 2026's
own design language rather than the source's legacy styling. It will not make a
request to the live email service. ATF will review the prototype at mobile,
tablet, and desktop sizes and explicitly approve it before backend work begins.

After approval, the second phase will replace the prototype-only submission
behavior with the live ATF email service integration. The completed form will
validate and normalize the submitted address, prevent duplicate requests,
communicate submission progress and results accessibly, and preserve the
visitor's input when submission fails. A confirmed backend success will also
emit the approved newsletter analytics event through the application-owned
analytics boundary, which this phase introduces as an unimplemented no-op
pending the separate PostHog integration plan.

The primary automated acceptance seam will be the rendered application through
the existing TanStack Router, Vitest, and React Testing Library setup. Tests
will interact with the form as a visitor does and observe rendered outcomes,
network requests, and application-owned analytics events. Visual approval will
remain a human review gate because responsive appearance cannot be established
reliably through DOM assertions alone.

## User Stories

1. As a homepage visitor, I want to discover a prominent newsletter invitation, so that I know ATF offers ongoing updates.
2. As a visitor, I want the invitation to explain what the newsletter contains, so that I can decide whether it is relevant to me.
3. As a visitor, I want the newsletter CTA to feel recognizably connected to the official ATF experience, so that I trust the form.
4. As an ATF stakeholder, I want to review the newsletter UI before it reaches the live email service, so that design feedback cannot create accidental subscriptions.
5. As an ATF stakeholder, I want the prototype to reproduce the source CTA's composition and interaction states in ATF Org 2026's design language, so that I can judge the complete experience without inheriting the source's styling.
6. As an ATF stakeholder, I want a clear approval gate between prototyping and backend integration, so that implementation proceeds only after the design is accepted.
7. As a desktop visitor, I want the email field and Subscribe action presented together on one row, so that the form is compact and easy to scan.
8. As a mobile visitor, I want the field and Subscribe action to stack cleanly, so that neither control becomes cramped or overflows the viewport.
9. As a keyboard user, I want a visible focus treatment on every interactive control, so that I always know where keyboard input will go.
10. As a screen-reader user, I want the email field to have an accessible name rather than relying only on its placeholder, so that I understand what information is required.
11. As a screen-reader user, I want validation and submission results announced when they change, so that feedback is not communicated only through color.
12. As a visitor, I want to enter my email address without the form changing it while I type, so that I remain in control of the value.
13. As a visitor, I want leading and trailing whitespace ignored when I submit, so that an accidental space does not invalidate an otherwise usable address.
14. As a visitor, I want an empty submission to explain that an email address is required, so that I know how to continue.
15. As a visitor, I want a malformed address rejected before any request is sent, so that I can correct it immediately.
16. As a visitor reviewing the prototype, I want valid submission to remain disconnected from the live service, so that testing the design cannot subscribe me.
17. As a visitor using the approved live form, I want a clear submitting state after I press Subscribe, so that I know the request is in progress.
18. As a visitor, I want repeated submission prevented while the first request is pending, so that I do not create duplicate requests.
19. As a visitor, I want a confirmed subscription to display a clear success message, so that I know the request was accepted.
20. As a visitor, I want my email field cleared only after confirmed success, so that the completed state is unambiguous.
21. As a visitor, I want a rejected subscription to show the message supplied by the ATF email service when available, so that I receive the most relevant explanation.
22. As a visitor, I want a useful fallback message when the service rejects the request without an explanation, so that the form never fails silently.
23. As a visitor, I want a connection or malformed-response failure explained in plain language, so that I can retry later.
24. As a visitor, I want my email retained after a failed request, so that I do not need to type it again.
25. As a visitor, I want to edit the field after an error, so that stale feedback does not prevent another attempt.
26. As a visitor, I want the newsletter form to work when PostHog is disabled, blocked, or unavailable, so that analytics is never a subscription requirement.
27. As an ATF product stakeholder, I want a successful newsletter subscription recorded in analytics, so that I can measure newsletter conversion.
28. As a privacy-conscious subscriber, I want analytics to omit my complete email address, so that the measurement event does not unnecessarily expose personal information.
29. As an ATF product stakeholder, I want newsletter analytics to distinguish the homepage form from future subscription surfaces, so that conversion can be attributed correctly.
30. As an ATF product stakeholder, I want failed or invalid attempts excluded from the success metric, so that conversion reporting remains accurate.
31. As a maintainer, I want the email transport isolated from presentation, so that the backend contract can be tested and changed without redesigning the CTA.
32. As a maintainer, I want newsletter analytics sent through the application-owned analytics boundary, so that the form does not depend directly on PostHog SDK details.
33. As a maintainer, I want one rendered-application acceptance seam for the end-to-end form behavior, so that tests describe visitor outcomes rather than implementation structure.
34. As a site operator, I want preview and automated-test use to avoid the production email service, so that design review and CI do not create subscriptions.
35. As a site operator, I want backend availability and analytics availability to fail independently, so that an analytics incident does not become a newsletter incident.
36. As an ATF stakeholder, I want the approved prototype preserved when backend wiring begins, so that functional work does not unintentionally redesign the CTA.

## Implementation Decisions

- The canonical feature name is **newsletter subscription**. The full homepage
  invitation is the **newsletter CTA**, and the external service that stores the
  subscription is the **ATF email service**.
- Delivery is divided into a UI prototype phase and a backend integration phase.
  Backend integration must not begin until ATF explicitly approves the
  prototype.
- **Decided.** The prototype will not be deployed to any hosted environment.
  Prototype review happens on the developer's locally running server only. The
  prototype must not make live newsletter requests.
- The newsletter CTA will appear near the end of the homepage, after the main
  editorial content and immediately before the final partners/footer sequence.
  It must appear consistently in both the normal application shell and
  homepage-only mode.
- **Decided.** The concrete insertion point is `src/components/site/HomePage.tsx`,
  between `<NewsSection />` and `<PartnersSection />`, inside the
  `HomepageOnlyModeContext.Provider`. Because the footer is rendered by
  `src/routes/__root.tsx` outside `HomePage`, this one insertion serves both
  shells and cannot be duplicated across them.
- **Decided.** The CTA is its own homepage section. It is not part of
  `NewsSection` and it must not inherit `NewsSection`'s homepage-only-mode
  `hidden` treatment. Homepage-only mode is required to show the newsletter CTA.
- **Decided.** The section carries its own anchor `id` and the established
  `homepageAnchorStyle` scroll-margin treatment, consistent with the other
  homepage anchors. No footer link to the anchor is added in this feature; the
  application-router test asserts an exact ordered list of homepage-only footer
  links, and changing the footer is out of scope.
- The reference implementation lives in the sibling repository
  `/home/rem/allProjects/00-atf/official_static_atf_web`:
  - `src/components/newsletter-form.tsx` — the form, validation, transport,
    response handling, and analytics capture
  - `src/app/page.tsx` lines 733–748 — the surrounding CTA section
  - `tailwind.config.ts` — the legacy `atf-teal #006B7D`, `atf-gold #F9A826`,
    `atf-orange #F75C2F` palette and the Poppins/Inter font stacks

  Read these files rather than reconstructing the source behavior from
  description. They are the authority on the request contract and the source
  copy.
- **Decided.** The source CTA is the authority on *composition, copy, behavior,
  and responsive structure only*. Its visual styling is **rejected** and will
  not be reproduced. Specifically rejected:
  - the teal section, the gold icon, and the orange-to-gold gradient action
  - pill geometry on the field, the action, and the feedback treatments
  - the Poppins and Inter typefaces
- **Decided.** The CTA is rendered in ATF Org 2026's own design language. It uses
  the existing global tokens and primitives and introduces no new brand colors
  and no new typefaces:
  - Color comes from `--atf-red` / `--primary`, `--atf-black`, `--atf-ink`, the
    `--atf-gray-*` ramp, and white
  - Type comes from the existing `--font-display` (Montserrat) and `--font-body`
    stacks. No webfont is added; nothing in this application loads a font over
    the network and that must not change for this feature.
  - Geometry is square. The global base layer sets `border-radius: 0` and
    `letter-spacing: 0`, and the CTA follows it.
  - The section uses the opportunity-triangle vocabulary already in the
    codebase: the `.atf-eyebrow` triangle, `TriangleBullet`, the
    `.atf-opportunity-button` corner cut, and the clip-path accent geometry
    established by `PageHero`.
- **Decided.** The Subscribe action is the existing `OpportunityButton` with
  `type="submit"`. It is not a bespoke button. It already provides the corner
  cut, the Montserrat uppercase label, a native `disabled` attribute with the
  established disabled styling, and its own `:focus-visible` treatment.
- The composition inherited from the source and retained:
  - A distinct full-width section band closing the homepage's editorial content
  - A mail icon, the heading “Stay Connected”, and supporting copy explaining
    that subscribers receive research highlights, event invitations, and
    ecosystem news
  - An email field paired with a Subscribe action
  - A responsive stacked layout on small screens and an inline layout from the
    small breakpoint upward
  - Distinct success and error feedback treatments
- **Decided.** The approved section treatment is a black band carrying a red
  diagonal accent panel, built with the geometry `PageHero` already establishes
  in `src/components/site/Page.tsx`:
  - Black background with white text, as the outer band
  - A red clip-path panel on the right, following `PageHero`'s
    `polygon(36% 0, 100% 0, 100% 100%, 12% 100%)` treatment
  - A red corner triangle at the lower left, following `PageHero`'s
    `border-b-[48px] border-r-[48px]` treatment
  - Left-aligned, not centered: eyebrow, icon, and heading sit on the black
    side; the field, action, and feedback sit over the red panel

  Rationale: this reproduces the source's “distinct color block before the
  footer” intent while remaining unmistakably ATF, and it is the only homepage
  section using this geometry, so the closing CTA reads as a climax rather than
  as a third flat dark band alongside `ImpactSection` and `FunderSection`.
  Rejected alternatives: a plain dark `ContentBand`, a full-bleed red band, and
  any centered composition — every other homepage section is left-aligned and a
  lone centered section would read as foreign.
- **Decided.** The section carries an `.atf-eyebrow` reading `Newsletter`. Every
  ATF Org 2026 section opens with the triangle eyebrow; the source CTA has none,
  and omitting it here would be the most conspicuous break from the surrounding
  page.
- **Decided.** The heading text is `Stay Connected` and is rendered with
  `.atf-section-title`, which applies `text-transform: uppercase`. It therefore
  reads “STAY CONNECTED” while its accessible name remains “Stay Connected”, so
  tests and screen readers match the sentence-case string.
- **Decided.** The mail icon sits in a solid red square plate with a white glyph
  on the black side of the band, following `PageHero`'s
  `size-14 bg-primary text-white` icon treatment. Not a circle, and not gold.
- **Decided.** The email field is a plain rectangle: white fill, one-pixel
  border, no corner cut, and a minimum height matching `OpportunityButton`
  `size="lg"` so the field and action align when laid out inline. The corner cut
  is the action's signature and cutting both controls would be noisy.
- **Decided.** Controls sitting over the red panel take a **white** focus ring,
  not the global `--ring` red, which would be invisible against red. This mirrors
  `.atf-opportunity-button:focus-visible`, which already uses an inset white ring
  precisely so it survives any background.
- **Decided.** The action's label changes to `Subscribing…` while a request is in
  flight, in addition to the native `disabled` attribute. A visible label change
  is a clearer progress signal than a styling change alone and gives the live
  region something to announce.
- **Decided.** The supporting copy is the source sentence verbatim: “Subscribe
  for the latest research highlights, event invitations, and ecosystem news
  delivered straight to your inbox.”
- **Decided.** The component is `NewsletterSection`, the anchor is
  `id="newsletter"`, and the section lives in `src/components/site/`. This
  follows the PRD's canonical vocabulary — “newsletter subscription” for the
  feature, “newsletter CTA” for the section — and the existing
  `NewsSection` / `PartnersSection` naming. `#newsletter` does not collide with
  the existing `#news` anchor.
- **Decided.** Success and error feedback adopt the semantic color tokens the
  design reference already specifies in
  `docs/design-ref/colors_and_type.css` — `--color-success: #16A34A` and
  `--color-error: #DC2626` — added to `src/styles.css`. This is adopting an
  existing design-reference decision, not inventing color. It is the one
  sanctioned addition to the global token set in this feature: no existing brand
  token changes, and no new brand color is introduced.
  Rationale: `src/styles.css` has no success token at all, and `--destructive`
  is a red close enough to `--primary` `#f90036` that an error styled with it
  would be indistinguishable from brand chrome. Non-color cues remain mandatory
  regardless; the tokens make the distinction faster to read, not load-bearing.
- **Decided.** Feedback blocks are square and bordered, consistent with
  `.atf-card`. They are not rounded and not pills.
- **Decided.** The email field's markup is written inline inside
  `NewsletterSection`. No shared `ui/input.tsx` or `ui/label.tsx` primitive is
  added. This is the application's first form, and a general primitive designed
  against a single use case would likely guess wrong; extraction waits until a
  second form exists. The Subscribe action is the already-shared
  `OpportunityButton`, so no button primitive is needed either.
- The source CTA is a visual reference, not permission to copy accessibility
  shortcomings. The prototype will add an accessible email label, keyboard
  focus visibility, semantic status feedback, and non-color error/success cues
  without changing the intended visual composition.
- The prototype will include the idle, submitting, success, and error visual
  treatments needed for review. Empty and malformed submissions are validation
  variants of the error treatment, not separate submission states. Prototype
  submission must be visibly identified as non-live and must not imply that a
  real subscription was created.
- **Decided.** The non-live identification is a separate, persistent review
  marker rendered on the section — not a rewrite of the feedback copy. The
  success and error treatments show the real production copy and the real
  visual treatment, so that what ATF approves is what ships. The review marker
  is a single self-contained element deleted wholesale at approval.
  Rationale: if the success state read “preview only, no subscription created”,
  the reviewer would never see the success treatment they are being asked to
  approve, and changing that copy at phase 2 would violate the rule that backend
  wiring must not redesign the approved CTA.
- Prototype-only mechanics must be simple to remove at approval. They must not
  survive as a hidden production fallback after the live integration is added.
- The prototype's simulated pending operation will last 750 milliseconds so the
  submitting treatment is observable during ordinary manual review. Automated
  tests will control this delay with fake timers rather than waiting in real
  time. The live integration removes this delay completely.
- The form will use a controlled email value and one explicit submission state
  at a time: idle, submitting, success, or error. Validation feedback is an
  error outcome associated with the current value.
- The field will use `type="email"` for the correct input semantics, while the
  form will use `noValidate` so native browser constraint validation cannot
  preempt the application-owned validation messages or live status region. The
  basic email-shape rule below is the single validation authority.
- Client validation will trim surrounding whitespace, reject an empty value,
  and apply the established basic email-shape rule before calling the ATF email
  service.
- **Decided.** The established basic email-shape rule is the source regex
  `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, applied to the trimmed value. It is reused
  verbatim rather than replaced with a stricter grammar. It guarantees exactly
  one `@`, which is what makes the analytics domain extraction below safe.
- The backend integration will call the existing ATF email service using an HTTP
  `POST` request with JSON content type and a payload containing one `email`
  property.
- The production endpoint is
  `https://atf-emails-buckket.up.railway.app/emails`. The spelling of
  `buckket` is part of the existing service hostname and must not be corrected
  accidentally.
- The transport will live behind one application-owned newsletter subscription
  function. UI components will not scatter endpoint URLs or raw request logic.
- The service response is expected to be JSON with a boolean `success` value and
  an optional string `message`.
- A successful subscription requires both a successful HTTP response and
  `success: true` in the parsed response.
- A non-successful HTTP response, `success: false`, malformed JSON, an
  unexpected response shape, and a network failure are all user-visible failure
  outcomes.
- The backend's message will be displayed when it is safe and usable. Stable
  application fallback copy will cover missing or unusable messages.
- **Decided.** A backend message is “safe and usable” when it is a string, is
  non-empty after trimming, and is at most 200 characters. Anything else falls
  back to application copy. React escapes interpolated text, so the risk being
  managed is an unbounded or junk payload reaching the visitor, not markup
  injection.
- **Decided.** The message catalog, reusing the source copy:

  | Outcome | Message |
  | --- | --- |
  | Empty value | `Email address is required` |
  | Malformed value | `Please enter a valid email address` |
  | HTTP success and `success: true`, usable backend message | the backend message |
  | HTTP success and `success: true`, no usable message | `Successfully subscribed to our newsletter!` |
  | HTTP failure or `success: false`, usable backend message | the backend message |
  | HTTP failure or `success: false`, no usable message | `Failed to subscribe. Please try again.` |
  | Malformed JSON, unexpected response shape, network failure, timeout | `Failed to subscribe. Please try again.` |

- **Decided.** The source's connection-specific copy — “An error occurred. Please
  check your connection and try again.” — is deliberately **not** carried over.
  Transport-level failures collapse into the single generic failure message so
  the form does not report which layer failed. Distinguishing “we could not
  reach the service” from “the service refused you” tells an attacker about
  infrastructure state for no visitor benefit. User story 23 is satisfied by the
  generic message, which is plain language and invites a retry.
- Submission will disable the action while a request is pending and prevent
  duplicate requests.
- **Decided.** The pending guard exists in two places, not one: the action
  carries the native `disabled` attribute, and the submit handler returns early
  while a request is in flight. The attribute alone is insufficient because a
  programmatic form submission bypasses the browser's implicit-submission
  blocking.
- **Decided.** The request is bounded by an `AbortController` timeout of 10
  seconds. A timeout is a failure outcome and uses the generic failure message.
  Without it a hung service leaves the form permanently in the submitting state
  with a permanently disabled action. The source implementation has no timeout;
  this is an intentional backend addition. The prototype puts the submitting
  treatment in front of ATF for approval, while the live integration supplies
  the ten-second timeout behavior behind that already-approved treatment.
- The submitted address will be trimmed. The full address will not be lowercased
  automatically. The domain used for analytics will be normalized separately.
- **Decided.** Analytics domain normalization is: take the portion after the
  single `@` of the trimmed address and lowercase it. Nothing further — no
  punycode conversion, no subdomain collapsing, no trailing-dot handling. The
  validation rule above guarantees the `@` count, so no defensive parsing is
  required.
- The field will be cleared only after confirmed backend success. It will retain
  the current value after validation, backend, parsing, or network errors.
- Changing the email after feedback will clear stale success or error state at a
  predictable point so the message cannot describe a value that is no longer
  present.
- **Decided.** That point is the first change to the field value. Editing clears
  both success and error feedback immediately, rather than deferring the clear
  to the next submission as the source does. A success message sitting beside a
  freshly typed address actively misinforms the visitor.
- Submission results will be exposed through an accessible live status region.
  The submitting state and disabled action will also be communicated
  semantically.
- PostHog installation, root initialization, route tracking, deployment
  configuration, and privacy rollout are governed by the separate PostHog
  integration plan.
- **Decided.** Newsletter backend integration does **not** wait on the PostHog
  integration plan. Phase 1 of that plan is not a prerequisite for any part of
  this feature. This decision is settled; do not re-open it.
- **Decided.** The newsletter backend phase itself introduces the
  application-owned analytics boundary: a small module exposing a typed event
  capture function, defaulting to a safe no-op, with `posthog-js` **not
  installed**. No PostHog dependency, no root provider, and no network traffic
  are added by this feature. The PostHog integration plan later supplies a real
  client behind the interface this feature establishes.
  Rationale: the newsletter event needs a boundary to call, while the PostHog
  plan sequences its own newsletter work after the newsletter backend exists.
  Introducing the interface here, unimplemented, breaks that ordering knot and
  lets the analytics contract be tested with zero vendor surface.
- When the application-owned analytics boundary is available, confirmed backend
  success will emit `newsletter_subscribed` with:
  - `page: "home"`
  - `form_type: "newsletter"`
  - `email_domain` containing only the normalized domain portion
- The analytics event will not contain the complete email address.
- Validation errors, prototype interactions, backend failures, parse failures,
  and network failures will not emit `newsletter_subscribed`.
- Analytics capture will occur after backend success. A missing analytics
  configuration or thrown analytics error must not change the successful
  subscription message or restore the cleared field.
- The approved prototype is the visual baseline for backend integration.
  Backend wiring must preserve the approved submitting behavior and replace only
  its simulated pending operation with the live request. It must not otherwise
  redesign the CTA without another review.

## Testing Decisions

- Tests will assert externally observable visitor behavior rather than component
  state, private helpers, Tailwind implementation details, PostHog SDK internals,
  or the internal structure of the newsletter transport.
- The primary automated seam is the full application rendered through the
  TanStack Router with React Testing Library. This is the highest existing seam
  that can verify homepage placement, form semantics, interaction, service
  outcomes, homepage-only behavior, and analytics effects together.
- The existing rendered homepage tests provide prior art for locating semantic
  regions and controls. The existing application-router tests provide prior art
  for exercising the homepage in both normal and homepage-only modes. Existing
  interactive component tests provide prior art for disabled native-button
  behavior.
- The prototype acceptance tests will verify:
  - The newsletter CTA is present on the homepage in its approved relative
    position
  - The heading, explanatory copy, accessible email field, and Subscribe action
    are exposed semantically
  - Empty and malformed values produce useful feedback
  - Valid prototype interaction never calls the live ATF email service
  - The review marker identifying the section as non-live is present, and is
    reachable independently of the feedback copy. Note that the prototype's
    success treatment deliberately shows the real production success message, so
    the assertion is on the presence of the marker, not on hedged feedback copy.
- Human visual review is a required test gate before backend implementation.
  Review will cover at least a narrow mobile viewport, a tablet-sized viewport,
  and a desktop viewport.
- Human review will assess section color, typography, icon treatment, copy,
  control geometry, spacing, focus appearance, feedback treatments, and the
  stacked/inline breakpoint behavior. The comparison baseline is the **rest of
  the ATF Org 2026 homepage**, not the official static CTA: the question is
  whether the section reads as native to the surrounding sections. The source
  CTA is consulted only for composition and copy.
- Human review happens on the developer's local server. The reviewer should
  exercise the idle, submitting, success, and error states at each viewport,
  including both empty and malformed validation variants of the error state,
  since several states are only reachable by interacting with the form.
- Approval must be recorded in the feature's issue history or comments before
  backend integration begins.
- Backend acceptance tests will replace the newsletter service at the application
  boundary with deterministic outcomes; they will not contact Railway.
- Focused transport tests will mock `fetch` beneath the application-owned
  newsletter service to verify the endpoint, HTTP method, headers, JSON payload,
  response parsing, and timeout behavior. The rendered-application tests will
  not reach through the mocked service boundary to assert those transport
  internals.
- Tests will verify that an empty or malformed address produces no service call.
- Tests will verify that a valid address is trimmed and sent once in the expected
  JSON contract.
- Tests will verify that a pending request disables repeat submission and
  communicates progress.
- Tests will verify that HTTP success plus `success: true` clears the field and
  displays the backend or fallback success message.
- Tests will verify that HTTP failure, `success: false`, malformed JSON,
  unexpected response data, and a rejected request each display an appropriate
  error and retain the entered address.
- Tests will verify that malformed JSON, an unexpected response shape, and a
  rejected request all display the single generic failure message, and that no
  transport-level failure produces connection-specific copy.
- Tests will verify that an unusable backend message — a non-string, an empty or
  whitespace-only string, or a string over the length limit — falls back to
  application copy on both the success and failure paths.
- Tests will verify that a request exceeding the timeout leaves the error state,
  re-enables the action, and retains the entered address.
- Tests will verify that editing the field clears both success and error
  feedback on the first change, without requiring another submission.
- Tests will verify that confirmed backend success emits exactly one
  `newsletter_subscribed` event with the approved homepage, form type, and
  normalized email-domain properties.
- Tests will verify that invalid submissions and every backend failure path emit
  no newsletter success event.
- Tests will verify that a missing analytics implementation and a thrown
  analytics call do not alter the successful visitor outcome.
- Tests will inspect the event payload to establish that the complete email
  address is absent.
- Tests will exercise the CTA in homepage-only mode as well as the normal
  homepage shell so placement does not depend on one footer implementation.
- Live production verification will use an ATF-approved test address only after
  backend wiring and deployment configuration are approved. Automated tests and
  ordinary visual previews must never create live subscriptions.

## Out of Scope

- Beginning backend integration before explicit prototype approval
- Sending live email-service requests from the UI prototype, automated tests, or
  ordinary design previews
- Replacing, redesigning, or administering the ATF email service
- Changing the email service's request or response schema
- Importing historical subscribers
- Sending newsletter campaigns or building newsletter authoring tools
- Adding unsubscribe, preference-center, double-opt-in, or email-verification
  workflows not already provided by the email service
- Porting the separate expandable subscription experience from the official
  static website's Google Support page
- Deploying the prototype to any hosted environment
- Installing `posthog-js`, adding a PostHog root provider, or sending any
  analytics network traffic
- Installing and configuring the PostHog foundation, route analytics, consent
  system, dashboards, funnels, session recording, or autocapture
- Capturing raw email addresses or form contents in analytics
- Adding analytics events for validation errors or failed subscription attempts
- Changing any existing ATF Org 2026 brand color or typography token. The single
  sanctioned addition is the pair of semantic feedback tokens
  `--color-success` / `--color-error` taken from
  `docs/design-ref/colors_and_type.css`; no existing token is modified and no new
  brand color is introduced.
- Reproducing the source CTA's teal, gold, or orange colors, its gradient
  action, or its pill geometry
- Adding a typeface or loading any webfont over the network
- Adding shared form primitives to `src/components/ui/`
- Changing repository-wide test infrastructure: no vitest config file, no test
  setup file, and no `@testing-library/jest-dom`. New tests follow the existing
  per-file `/** @vitest-environment jsdom */` convention with plain DOM
  assertions.
- Adding a newsletter link to either shared footer or to the navigation
- Redesigning the homepage, partners section, shared footers, or application
  shells beyond inserting the approved newsletter CTA

## Further Notes

- The newsletter UI and newsletter transport are deliberately separate delivery
  concerns. Visual approval completes the prototype phase but does not authorize
  a live backend request until the feature proceeds to its second phase.
- The official static ATF implementation currently performs the Railway request
  before PostHog capture. This ordering is retained because analytics records
  the outcome; it does not create the subscription.
- The target application has two possible shared footer paths. Keeping the CTA
  inside homepage content avoids duplicating it across layout shells.
- The existing source form has no pending state or duplicate-submit protection.
  Those states are included in the prototype for approval because they are
  necessary for a dependable live form and materially affect the interaction.
- The source form uses placeholder-only labeling. The prototype will preserve
  the visible appearance while adding a non-visible accessible label.
- Production ingestion for PostHog must not be assumed from Vite development
  proxy behavior. That concern remains in the separate PostHog integration plan.
- ATF reviewed and **rejected the legacy teal/orange/gold treatment before
  implementation began**, so the “what if ATF rejects it” contingency that
  earlier versions of this PRD carried no longer applies. The CTA is an ATF Org
  2026 section from the start. Prototype review is therefore a review of the
  ATF-native design, not a source-parity diff.
- Relevant state of the target codebase, verified 2026-07-24, because several of
  these are load-bearing for the estimate:
  - This is the application's **first form**. There is no `<form>`, `<input>`, or
    `onSubmit` anywhere in `src/`, and `src/components/ui/` contains no `input`,
    `label`, or `button` primitive. `textarea.tsx` exists with no importers.
  - There is **no analytics module** and `posthog-js` is not a dependency.
  - There is **no vitest config file and no test setup file**. Every test file
    declares `/** @vitest-environment jsdom */` itself, imports vitest globals
    explicitly, and uses plain DOM assertions. `@testing-library/jest-dom` is
    not installed.
  - `NewsSection` is rendered but given a `hidden` class in homepage-only mode,
    so it is not unmounted. The newsletter CTA's DOM position relative to
    `PartnersSection` is therefore identical in both modes.
  - `--destructive` exists as a token but is a red closely resembling
    `--primary` `#f90036`. There is **no success color token** in
    `src/styles.css`. `docs/design-ref/colors_and_type.css` does define
    `--color-success: #16A34A` and `--color-error: #DC2626`, but the application
    has never imported them.

## Comments

- Testing seam confirmed by the user: exercise the newsletter through the
  rendered application using the existing Vitest, React Testing Library, and
  TanStack Router setup, with a human responsive visual-review gate between the
  prototype and backend phases.

### 2026-07-24 — PRD review, decisions taken

Every item below was raised as an open question and answered by the user in
review. They are recorded here and folded into the sections above so that a
later session with no memory of that conversation does not re-litigate them.
Each is marked **Decided** at its point of use.

1. **Prototype hosting.** Local only, never deployed. Visible in homepage-only
   mode.
2. **Non-live marker.** A separate, deletable review marker on the section. Real
   feedback copy and real treatments stay intact so ATF approves what ships.
3. **PostHog ordering.** PostHog plan Phase 1 is *not* a prerequisite. The
   newsletter backend phase introduces the analytics boundary itself, with
   `posthog-js` uninstalled and the boundary defaulting to a no-op. Settled — do
   not re-open.
4. **Visual language.** The source's teal/gold/orange, gradient action, pill
   geometry, and Poppins/Inter are rejected. The CTA is built in the existing
   ATF Org 2026 language — red/black/gray/white, Montserrat and the existing
   body stack, square geometry, opportunity-triangle vocabulary, and the
   existing `OpportunityButton`. No new colors, no new typefaces, no webfonts.
   - **Section treatment:** black band + red diagonal clip-path panel + red
     corner triangle, reusing `PageHero`'s geometry. Left-aligned. Rejected:
     plain dark band, full-bleed red, and any centered composition.
   - **Feedback color:** adopt `--color-success #16A34A` and
     `--color-error #DC2626` from `docs/design-ref/colors_and_type.css`. The one
     sanctioned global token addition, because the app has no success token and
     `--destructive` is indistinguishable from brand red.
   - **Form markup:** written inline in `NewsletterSection`. No shared
     `ui/input.tsx` or `ui/label.tsx` primitive; extraction waits for a second
     form.
   - **Details:** `Newsletter` eyebrow added; heading is `Stay Connected` shown
     uppercase by `.atf-section-title`; red square icon plate with a white
     glyph per `PageHero`; square field with no corner cut, height matched to
     `OpportunityButton size="lg"`; white focus ring for controls over the red
     panel; action label becomes `Subscribing…` while pending; supporting copy
     kept verbatim from the source.
5. **Stale feedback.** Cleared on the first change to the field.
6. **Backend message safety.** String, non-empty after trim, at most 200
   characters; otherwise application fallback copy.
7. **Copy.** Source strings retained, except that the connection-specific
   message is dropped: transport failures collapse into one generic failure
   message so the form does not disclose which layer failed.
8. **Analytics domain.** Portion after the single `@`, lowercased. Nothing more.
9. **Request timeout.** `AbortController` at 10 seconds, treated as a failure
   outcome. An intentional addition over the source.
10. **Section identity.** `NewsletterSection` with anchor `id="newsletter"`, not
    part of `NewsSection`, and shown in homepage-only mode.
11. **Test infrastructure.** Unchanged. No vitest config file, no setup file, no
    `@testing-library/jest-dom`. New tests follow the existing per-file
    `/** @vitest-environment jsdom */` convention with plain DOM assertions, so
    this feature does not fork the repository's test style.

Issue decomposition will be done with the `/to-tickets` skill.
