# 02 — Publish and read one News Article

**What to build:** Let an Admin create a draft News Article, publish it, and see
the same published content on its public route. This is the first complete path
from Payload and PostgreSQL through the public REST API to the visitor's
browser.

**Blocked by:** 01 — Run the Backend CMS locally

**Status:** ready-for-agent

- [ ] The News Articles collection contains the approved title, Public News
  Slug, excerpt, rich-text body, publication time, category, featured state,
  optional hero image, and publication-state fields.
- [ ] Drafts and versions are enabled, and saving a newer draft does not change
  the published REST result.
- [ ] An unauthenticated visitor can read a published News Article but cannot
  read a draft or a newer unpublished version.
- [ ] The public site maps the Payload REST response into one typed News Article
  model and renders the rich-text body on the current Public News Slug route.
- [ ] The public route keeps the shared layout visible during loading and
  distinguishes success, `Article not found.`, and
  `News temporarily unavailable`.
- [ ] Each REST request stops after five seconds, performs no automatic retry,
  and offers a visible **Retry** action after failure.
- [ ] Automated tests cover the publication boundary, response mapping, route
  states, timeout, and manual retry.
