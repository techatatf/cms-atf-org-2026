# 06 — Browse published News Articles

**What to build:** Replace the public site's hardcoded runtime news on every
approved surface with ordered, filterable, and paginated published News
Articles from Payload while keeping each news region independent of CMS
failures.

**Blocked by:** 02 — Publish and read one News Article

**Status:** ready-for-agent

- [ ] Published list queries order News Articles by publication time from newest
  to oldest with a stable secondary order.
- [ ] The homepage shows one featured News Article and five newest non-featured
  News Articles.
- [ ] The News index loads twelve News Articles at a time, supports the approved
  category filters, and resets pagination when the category changes.
- [ ] The Publications Newsroom panel shows one featured News Article and three
  newest non-featured News Articles while other Publications content remains
  unchanged.
- [ ] Publishing a featured News Article clears the previous published featured
  flag. If none is featured, the newest published News Article fills that
  position.
- [ ] A successful empty collection shows `No news published yet.`, and an empty
  selected category shows `No updates in this category yet.`
- [ ] Initial failures show `News temporarily unavailable` and **Retry** without
  blocking the shared layout or unrelated content.
- [ ] A failed **Load more** request keeps prior pages visible and provides an
  inline retry for the failed page.
- [ ] Automated tests cover surface limits, ordering, categories, pagination,
  featured selection, empty results, timeouts, and retry behavior.
