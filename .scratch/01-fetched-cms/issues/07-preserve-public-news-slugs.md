# 07 — Preserve Public News Slugs

**What to build:** Keep each published News Article URL stable for Editors while
allowing an Admin to make a controlled slug change that preserves the old URL
for visitors and for the later SEO-CMS phase.

**Blocked by:** 02 — Publish and read one News Article; 03 — Enforce Admin and
Editor workflows

**Status:** ready-for-agent

- [ ] Public News Slugs accept only lowercase ASCII letters, digits, and single
  interior hyphens and remain unique.
- [ ] Editors and Admins can change a Public News Slug before first publication.
- [ ] First publication locks the Public News Slug for Editors.
- [ ] An Admin can change a locked slug, and the former value is retained as a
  Previous News Slug.
- [ ] Current and Previous News Slugs share one reserved namespace so no value
  can resolve to more than one News Article.
- [ ] A visitor request for a Previous News Slug renders the published News
  Article and replaces the browser history entry with its current URL.
- [ ] An unknown current or previous slug produces `Article not found.` only
  after Payload responds successfully.
- [ ] The retained Previous News Slugs are available to SEO-CMS for later HTTP
  redirect generation.
- [ ] Automated tests cover validation, locking, Admin override, namespace
  collisions, resolution, client history replacement, and not-found behavior.
