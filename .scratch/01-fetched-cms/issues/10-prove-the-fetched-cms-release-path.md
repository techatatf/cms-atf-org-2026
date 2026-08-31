# 10 — Prove the Fetched-CMS release path

**What to build:** Prove that the completed Fetched-CMS release works as one
system for an Editor, an Admin, a visitor, and an operator before handing its
reusable foundation to SEO-CMS.

**Blocked by:** 03 — Enforce Admin and Editor workflows; 04 — Preview and restore
draft News Articles; 05 — Publish News Article images; 06 — Browse published
News Articles; 07 — Preserve Public News Slugs; 08 — Seed and import News
Articles safely; 09 — Run the Backend CMS in production

**Status:** ready-for-agent

## Known starting gaps

The production Backend CMS is accepted, but the separate deployment path still
has known gaps:

- Vercel returns `404` for a direct `/preview/news/<document-id>` request because
  the Public Site deployment has no SPA rewrite.
- Production-mode Editorial User cookies do not explicitly set `secure: true`.
- The disposable `public-demo.africantechnologyforum.org` and
  `cms-demo.africantechnologyforum.org` pair has not been deployed or proven.
- The Public Site deployment does not yet define how only `public-demo` sends
  `X-Robots-Tag: noindex, nofollow`.
- The deployment documentation does not yet cover the production and demo pairs
  or the Public Site build-time `VITE_BACKEND_CMS_ORIGIN` value.

- [ ] A clean development start supports login, draft creation, Live Preview,
  publication, public listing, public article reading, and version restore.
- [ ] The Demo Rehearsal proves Public Delivery and Live Preview across its
  same-site HTTPS Public Site and Backend CMS origins.
- [ ] Direct navigation to `/preview/news/<document-id>` loads the Public Site,
  and Live Preview populates authenticated Media relationships.
- [ ] Production-mode Editorial User cookies use `Secure`.
- [ ] The Demo Rehearsal uses separate data, Media, users, and secrets, and its
  Public Site declares itself non-indexable without changing the rendered site.
- [ ] The release proof covers the homepage, News index, current and previous
  News Article URLs, and the Publications Newsroom panel.
- [ ] Visitor checks prove that drafts and protected operations remain
  inaccessible without the required role.
- [ ] Outage checks prove the five-second timeout, manual retry, optional news
  regions, preserved shared layout, and lack of a last-known production
  snapshot.
- [ ] Media checks prove alt-text enforcement and the image failure placeholder.
- [ ] Restart checks prove that ordinary stops preserve PostgreSQL data and
  Payload media.
- [ ] Production checks prove the checked-out-release build, successful
  migration startup, and failed-migration readiness gate.
- [ ] The documented commands and required configuration are sufficient for a
  new developer or operator to repeat the verified paths.
- [ ] The reusable News Article schema, query mapping, presentation components,
  Live Preview behavior, origin configuration, and Previous News Slugs are
  ready for SEO-CMS.

## Comments

- 2026-08-31: The operator accepted the production Backend CMS based on the
  running deployment and successful Public Delivery. This acceptance does not
  claim that every procedure in the retired manual handoff ran. Issue 10 retains
  the restart, migration, persistence, and destructive-protection checks that
  still require release-path proof.
