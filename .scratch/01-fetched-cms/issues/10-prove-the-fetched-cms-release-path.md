# 10 — Prove the Fetched-CMS release path

**What to build:** Prove that the completed Fetched-CMS release works as one
system for an Editor, an Admin, a visitor, and an operator before handing its
reusable foundation to SEO-CMS.

**Blocked by:** 03 — Enforce Admin and Editor workflows; 04 — Preview and restore
draft News Articles; 05 — Publish News Article images; 06 — Browse published
News Articles; 07 — Preserve Public News Slugs; 08 — Seed and import News
Articles safely; 09 — Run the Backend CMS in production; operator completion of
[Manually verify the production Backend CMS](../HANDOFF-09-manual-production-verification.md)

**Status:** ready-for-human

## Required manual gate

Do not continue this issue until the operator completes
[Manually verify the production Backend CMS](../HANDOFF-09-manual-production-verification.md)
with a disposable production configuration and records the result under
`## Comments`. Change the status to `ready-for-agent` only after every manual
check passes.

- [ ] A clean development start supports login, draft creation, Live Preview,
  publication, public listing, public article reading, and version restore.
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
