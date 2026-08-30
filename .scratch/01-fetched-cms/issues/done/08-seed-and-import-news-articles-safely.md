# 08 — Seed and import News Articles safely

**What to build:** Give developers repeatable local News Article fixtures and
give operators a guarded way to import a separately approved production
dataset without publishing the repository fixtures by accident.

**Blocked by:** 02 — Publish and read one News Article; 07 — Preserve Public
News Slugs

**Status:** closed

- [x] The six current hardcoded news fixtures can be loaded into a local Backend
  CMS with their existing identifiers preserved as initial Public News Slugs.
- [x] Running the local seed again updates or skips its known records without
  creating duplicates.
- [x] The public site no longer uses the hardcoded fixture array as its runtime
  news source.
- [x] Production does not load the local fixtures during startup or migration.
- [x] A production import accepts only an explicitly supplied approved dataset
  and preserves each approved legacy identifier as the initial Public News
  Slug.
- [x] The production import refuses to overwrite an existing News Article
  unless the operator explicitly selects overwrite behavior.
- [x] The import reports created, skipped, updated, and rejected records clearly
  enough for an operator to verify the result.
- [x] Automated tests prove repeatability, duplicate prevention, slug
  preservation, and the overwrite safeguard.

## Comments

- 2026-08-30: Added an explicit Local News Seed command and a separate Approved
  News Dataset import command. The seed publishes the six repository fixtures,
  skips known records on repeat, supports explicit local overwrite, and refuses
  production. The importer requires `--file`, requires each record to declare
  `draft` or `published`, skips existing records by default, and updates them
  only with `--overwrite`.
- 2026-08-30: Import matching uses the current and Previous News Slug namespace.
  Overwrite keeps the Payload document ID, current and previous slugs, and First
  Publication. The command reports each created, skipped, updated, and rejected
  record and returns a nonzero status for rejections.
- 2026-08-30: Removed the hardcoded public-site `newsItems` array and documented
  both operator commands and the Approved News Dataset JSON contract. Ten fast
  Backend CMS tests, twenty-one PostgreSQL integration tests, both typechecks,
  and both production builds pass. The public suite has 137 passing tests and
  the same three unrelated assertion failures recorded by the prerequisite
  tickets.
