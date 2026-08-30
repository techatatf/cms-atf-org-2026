# 07 — Preserve Public News Slugs

**What to build:** Keep each published News Article URL stable for Editors while
allowing an Admin to make a controlled slug change that preserves the old URL
for visitors and for the later SEO-CMS phase.

**Blocked by:** 02 — Publish and read one News Article; 03 — Enforce Admin and
Editor workflows

**Status:** closed

- [x] Public News Slugs accept only lowercase ASCII letters, digits, and single
  interior hyphens and remain unique.
- [x] Editors and Admins can change a Public News Slug before first publication.
- [x] First publication locks the Public News Slug for Editors.
- [x] An Admin can change a locked slug, and the former value is retained as a
  Previous News Slug.
- [x] Current and Previous News Slugs share one reserved namespace so no value
  can resolve to more than one News Article.
- [x] A visitor request for a Previous News Slug renders the published News
  Article and replaces the browser history entry with its current URL.
- [x] An unknown current or previous slug produces `Article not found.` only
  after Payload responds successfully.
- [x] The retained Previous News Slugs are available to SEO-CMS for later HTTP
  redirect generation.
- [x] Automated tests cover validation, locking, Admin override, namespace
  collisions, resolution, client history replacement, and not-found behavior.

## Comments

- 2026-08-30: Completed stable Public News Slugs across the Backend CMS and
  public site. Payload now validates the approved grammar, locks slugs for
  Editors after First Publication, lets an Admin retain and reuse the same News
  Article's Previous News Slugs, and enforces one transaction-safe namespace
  through internal unique reservations. Published REST reads expose Previous
  News Slugs for SEO-CMS.
- 2026-08-30: Public article reads now resolve current or previous values. A
  Previous News Slug renders the published News Article, replaces the browser
  history entry with the current URL, and avoids a duplicate CMS request.
  Unknown values retain the successful-response `Article not found.` behavior.
- 2026-08-30: Verification passed with sixteen Backend CMS REST integration
  tests against both the development database and a clean disposable database,
  thirteen focused public query and route tests, seven Backend CMS structure
  tests, generated Payload types, both typechecks, and both production builds.
  The full public suite has 137 passing tests and the same three unrelated UI
  assertion failures recorded when the prerequisite tickets closed.
