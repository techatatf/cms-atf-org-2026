# 02 — Publish and read one News Article

**What to build:** Let an Admin create a draft News Article, publish it, and see
the same published content on its public route. This is the first complete path
from Payload and PostgreSQL through the public REST API to the visitor's
browser.

**Blocked by:** 01 — Run the Backend CMS locally

**Status:** closed

- [x] The News Articles collection contains the approved title, Public News
  Slug, excerpt, rich-text body, publication time, category, featured state,
  optional hero image, and publication-state fields.
- [x] Drafts and versions are enabled, and saving a newer draft does not change
  the published REST result.
- [x] An unauthenticated visitor can read a published News Article but cannot
  read a draft or a newer unpublished version.
- [x] The public site maps the Payload REST response into one typed News Article
  model and renders the rich-text body on the current Public News Slug route.
- [x] The public route keeps the shared layout visible during loading and
  distinguishes success, `Article not found.`, and
  `News temporarily unavailable`.
- [x] Each REST request stops after five seconds, performs no automatic retry,
  and offers a visible **Retry** action after failure.
- [x] Automated tests cover the publication boundary, response mapping, route
  states, timeout, and manual retry.

## Comments

- 2026-08-29: Completed the first authenticated Payload-to-browser publishing
  path. The Backend CMS has the News Articles collection, draft isolation,
  public REST access, and a minimal Media relationship. The public site now
  queries by Public News Slug, maps one typed model, renders Payload rich text,
  and handles loading, not-found, failure, timeout, and manual retry states.
  Both production builds, both typechecks, six Backend CMS structure tests,
  two live REST integration tests, and six focused public tests pass. The full
  public suite has 119 passing tests and the same three pre-existing assertion
  failures recorded when the prerequisite ticket closed.
