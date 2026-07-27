# PostHog Integration Plan

## Purpose

Add PostHog to the ATF Org 2026 application as a non-blocking analytics
capability. The integration should support product analytics across the site and
eventually record successful newsletter subscriptions, while remaining
independent from the newsletter delivery backend.

PostHog is not part of the newsletter submission path. The newsletter form will
submit to the ATF email service whether or not PostHog is configured, available,
or permitted to run.

## Current State

- ATF Org 2026 is a Vite, React, Tailwind, and TanStack Router application.
- The application does not currently depend on `posthog-js`.
- There is no analytics provider at the React root.
- There are no PostHog environment variables or ingestion routes.
- The source newsletter implementation in `official_static_atf_web` initializes
  PostHog globally and captures `newsletter_subscribed` only after the email API
  confirms success.
- The source implementation uses Next.js rewrites for `/ingest`; those rewrites
  cannot be copied directly into this Vite application.

## Desired Outcomes

1. PostHog initializes once at the application boundary when valid public
   configuration is present.
2. The application continues to render and function normally when PostHog is
   absent, blocked, or misconfigured.
3. Page views follow TanStack Router navigation rather than recording only the
   initial browser load.
4. Feature code records approved domain events through a small analytics
   interface instead of importing the PostHog client throughout the component
   tree.
5. Successful newsletter subscriptions can record the established
   `newsletter_subscribed` event without sending the subscriber's complete email
   address.
6. Local development, automated tests, preview builds, and production each have
   an explicit analytics behavior.
7. Analytics collection is documented and consistent with the site's privacy
   policy and consent requirements.

## Architecture

### Analytics Boundary

Create one application-owned analytics module that wraps the PostHog client.
The module will own:

- Configuration validation
- Client initialization
- Page-view capture
- Typed event names and properties
- Development and test behavior
- Safe no-op behavior when analytics is unavailable

Components should call this boundary rather than import `posthog-js` directly.
This keeps the product vocabulary stable if the analytics vendor or
configuration changes later.

### React Integration

Initialize the analytics client at the React application root and expose it to
the component tree through the supported PostHog provider. Initialization must
not block the initial render.

The application should not delay rendering while waiting for PostHog, and an
analytics initialization failure must not enter the application's error path.

### Route Tracking

Disable assumptions that only a full browser load constitutes a page view.
Subscribe to resolved TanStack Router location changes and emit one page-view
event per meaningful route transition, including the initial route.

The implementation must avoid duplicate page views caused by React Strict Mode,
provider remounts, or simultaneous automatic and manual capture.

### Event Contract

Begin with a deliberately small event catalog:

| Event | Trigger | Properties |
| --- | --- | --- |
| `$pageview` | Initial route and completed client-side navigation | Current URL and route context supported by PostHog |
| `newsletter_subscribed` | Newsletter backend confirms a successful subscription | `page`, `form_type`, and normalized `email_domain` |

The newsletter event must not include the complete email address. The domain
must be derived from the same trimmed, normalized address sent to the newsletter
backend.

Future events should be added to the central catalog rather than invented
ad hoc inside individual components.

## Configuration

Use Vite's public environment-variable convention:

- `VITE_POSTHOG_KEY`: public project key; analytics remains disabled when it is
  absent.
- `VITE_POSTHOG_HOST`: optional ingestion host or first-party proxy path.
- `VITE_POSTHOG_UI_HOST`: optional link target for PostHog tooling when needed.

Document the variables in an example environment file without committing real
keys.

The PostHog project key is intended to be public in a browser application, but
it must still be managed through deployment configuration so environments can
send to separate projects or remain disabled.

## Ingestion Strategy

Choose and document one production ingestion strategy before rollout:

1. **Direct EU ingestion:** configure the browser client to send directly to
   PostHog's EU ingestion endpoint. This is the simplest Vite-compatible option.
2. **First-party `/ingest` proxy:** configure the production hosting layer to
   proxy PostHog API and static asset requests, mirroring the source site. A
   Vite development proxy may reproduce this locally, but it does not create a
   production proxy by itself.

The first-party proxy is preferred if the hosting platform supports durable
rewrites and ATF wants parity with the source deployment. Direct ingestion is
the fallback when production rewrite ownership is unavailable.

The deployment configuration must be confirmed before selecting `/ingest`;
otherwise production analytics could silently point at an unhandled
application route.

## Privacy and Data Governance

Before production enablement:

- Confirm whether ATF requires opt-in consent before analytics initialization.
- Update the privacy policy to describe analytics collection and the PostHog
  processor where required.
- Decide whether anonymous profiles are sufficient.
- Keep autocapture, session recording, surveys, heatmaps, and exception capture
  disabled unless each capability is deliberately approved.
- Do not capture form values, complete email addresses, or other direct personal
  information.
- Define separate development and production projects, or disable capture in
  local development, to prevent test traffic from polluting production data.
- Configure retention and data residency in the PostHog project rather than
  relying only on client settings.

## Delivery Phases

### Phase 1: Foundation

1. Add `posthog-js` through the repository's active package manager and commit
   the corresponding lockfile update.
2. Add documented Vite environment variables.
3. Introduce the application-owned analytics boundary.
4. Add the root provider with safe disabled behavior.
5. Keep advanced collection capabilities disabled.

**Ordering note (decided 2026-07-24).** This phase is *not* a prerequisite for the
newsletter subscription feature. The newsletter backend phase introduces the
analytics boundary interface itself — step 3 above — with `posthog-js`
uninstalled and the boundary defaulting to a safe no-op. When this phase runs, it
should expect the interface to already exist and should implement a real client
behind it rather than designing a new one. See
`.scratch/newsletter-subscription/PRD.md`.

### Phase 2: Navigation Analytics

1. Connect page-view capture to TanStack Router navigation.
2. Confirm the initial route records exactly one page view.
3. Confirm client-side navigation records exactly one additional page view.
4. Verify Strict Mode does not duplicate events.

### Phase 3: Newsletter Event

This phase begins only after the newsletter UI prototype is approved and the
newsletter backend is wired in.

By the time this phase runs, the newsletter feature will already emit
`newsletter_subscribed` through the application-owned boundary, and the event's
properties and suppression rules will already be covered by tests. What remains
here is confirming the event reaches a real PostHog project once a client is
installed behind the boundary — not defining the event.

1. Capture `newsletter_subscribed` only after the backend returns a confirmed
   success.
2. Preserve subscription behavior when analytics is disabled or capture throws.
3. Include only the approved `page`, `form_type`, and `email_domain`
   properties.
4. Do not capture validation failures, backend failures, or raw form values
   unless a later analytics requirement explicitly defines those events.

### Phase 4: Production Rollout

1. Configure the production project key and ingestion host.
2. Apply the selected production proxy configuration when applicable.
3. Verify events in PostHog's live event view using a non-production test
   subscription process approved by ATF.
4. Validate privacy-policy and consent behavior.
5. Monitor browser errors, blocked requests, duplicate page views, and event
   volume after release.

## Testing Plan

Test observable application behavior at the highest practical seams:

- Render the application with analytics configuration absent and verify normal
  navigation and newsletter behavior.
- Render with a mocked analytics boundary and verify one initial page view and
  one event for each completed client-side navigation.
- Submit the newsletter form against a mocked backend response and verify the
  subscription event occurs only after confirmed success.
- Verify validation errors, backend errors, and thrown analytics calls do not
  produce a success event or break the user experience.
- Verify event properties exclude the complete email address.

Avoid tests that assert PostHog SDK internals. The integration contract is
whether the ATF application emits the correct domain event at the correct user-
visible transition.

## Operational Verification

- Confirm development builds do not send unintended production traffic.
- Confirm the configured ingestion URL returns successful browser requests.
- Confirm page-view events contain the expected route URL.
- Confirm newsletter events contain the expected page, form type, and email
  domain.
- Confirm common content blockers do not affect navigation or form submission.
- Confirm a missing key produces no console error and no analytics requests.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Copying Next.js rewrites into Vite creates a development-only proxy | Treat production proxying as a hosting decision and verify it independently |
| Strict Mode or automatic capture duplicates page views | Use one manual route-aware capture path and test exact event counts |
| Analytics failure interferes with subscription | Capture only after backend success and isolate errors at the analytics boundary |
| Personal information is captured accidentally | Use an allow-listed event schema and exclude raw email values |
| Test traffic pollutes production | Disable local capture or use a separate PostHog project |
| New events drift in naming or payload | Maintain a central typed event catalog |

## Completion Criteria

- PostHog can be enabled through documented deployment configuration.
- The application behaves normally with analytics disabled.
- Initial loads and client-side navigations produce one page view each.
- The approved newsletter success event is available for the later backend
  integration.
- No approved event contains the subscriber's complete email address.
- Privacy and production ingestion decisions are documented and verified.
- Automated tests cover the application-owned analytics contract rather than
  PostHog implementation details.

## Out of Scope

- Building or approving the newsletter UI prototype
- Wiring the newsletter form to the email backend
- Migrating historical PostHog data
- Creating dashboards, funnels, cohorts, or alerts
- Enabling session recording, autocapture, surveys, feature flags, or heatmaps
- Defining analytics events for unrelated site features
