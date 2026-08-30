# 06 — Browse published News Articles

**What to build:** Replace the public site's hardcoded runtime news on every
approved surface with ordered, filterable, and paginated published News
Articles from Payload while keeping each news region independent of CMS
failures.

**Blocked by:** 02 — Publish and read one News Article

**Status:** closed

- [x] Published list queries order News Articles by publication time from newest
  to oldest with a stable secondary order.
- [x] The homepage shows one featured News Article and five newest non-featured
  News Articles.
- [x] The News index loads twelve News Articles at a time, supports the approved
  category filters, and resets pagination when the category changes.
- [x] The Publications Newsroom panel shows one featured News Article and three
  newest non-featured News Articles while other Publications content remains
  unchanged.
- [x] Publishing a featured News Article clears the previous published featured
  flag. If none is featured, the newest published News Article fills that
  position.
- [x] A successful empty collection shows `No news published yet.`, and an empty
  selected category shows `No updates in this category yet.`
- [x] Initial failures show `News temporarily unavailable` and **Retry** without
  blocking the shared layout or unrelated content.
- [x] A failed **Load more** request keeps prior pages visible and provides an
  inline retry for the failed page.
- [x] Automated tests cover surface limits, ordering, categories, pagination,
  featured selection, empty results, timeouts, and retry behavior.

## Comments

- 2026-08-30: Replaced hardcoded runtime news on the homepage, News index, and
  Publications Newsroom with the shared typed Payload query layer. Published
  lists use `-publishedAt,slug`, the approved category model, surface-specific
  limits, and five-second request timeouts. The News index resets to page one on
  filter changes and preserves earlier pages when **Load more** fails. Each
  region now owns its loading, empty, failure, and manual retry states.
- 2026-08-30: Publishing a featured News Article now clears the prior published
  feature in the same request transaction. If the prior article has unpublished
  edits, the hook preserves that draft as the editor's latest revision while
  changing only the public version. When no feature exists, the newest published
  article fills the featured position.
- 2026-08-30: Verification passed with 22 focused public query and presentation
  tests, twelve REST integration scenarios against a disposable database, seven
  Backend CMS configuration tests, Backend CMS typechecking, and both production
  builds. The full public suite has 135 passing tests and the same three unrelated
  assertion failures recorded when Issue 5 closed. The disposable database was
  removed after the final integration run.
