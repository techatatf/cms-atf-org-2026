# 08 — Seed and import News Articles safely

**What to build:** Give developers repeatable local News Article fixtures and
give operators a guarded way to import a separately approved production
dataset without publishing the repository fixtures by accident.

**Blocked by:** 02 — Publish and read one News Article; 07 — Preserve Public
News Slugs

**Status:** ready-for-agent

- [ ] The six current hardcoded news fixtures can be loaded into a local Backend
  CMS with their existing identifiers preserved as initial Public News Slugs.
- [ ] Running the local seed again updates or skips its known records without
  creating duplicates.
- [ ] The public site no longer uses the hardcoded fixture array as its runtime
  news source.
- [ ] Production does not load the local fixtures during startup or migration.
- [ ] A production import accepts only an explicitly supplied approved dataset
  and preserves each approved legacy identifier as the initial Public News
  Slug.
- [ ] The production import refuses to overwrite an existing News Article
  unless the operator explicitly selects overwrite behavior.
- [ ] The import reports created, skipped, updated, and rejected records clearly
  enough for an operator to verify the result.
- [ ] Automated tests prove repeatability, duplicate prevention, slug
  preservation, and the overwrite safeguard.
