# 04 — Preview and restore draft News Articles

**What to build:** Let an Editor see draft changes immediately in Payload Live
Preview, using the same News Article presentation as the public route, and
restore an earlier version without exposing either draft publicly.

**Blocked by:** 02 — Publish and read one News Article; 03 — Enforce Admin and
Editor workflows

**Status:** closed

- [x] Payload opens a dedicated public-site News Article preview route inside
  the authenticated Admin Live Preview iframe.
- [x] The preview updates from Payload's Live Preview messages without a general
  unauthenticated REST read of draft content.
- [x] The public site accepts preview messages only from the configured Backend
  CMS origin.
- [x] The preview route is absent from public navigation, is non-indexable, and
  reuses the published News Article presentation.
- [x] Explicit local and production origin configuration supports separate
  Backend CMS and public-site origins without wildcard CORS or CSRF rules.
- [x] Editors and Admins can restore an earlier version, and visitors continue
  to receive only the currently published version.
- [x] Automated tests cover message-origin rejection, draft rendering, version
  restore, and public draft isolation.

## Comments

- 2026-08-30: Completed News Article Live Preview at
  `/preview/news/<document-id>`. Payload Admin opens the route with a separately
  configured public-site origin. The route accepts Payload messages only from
  `VITE_BACKEND_CMS_ORIGIN`, sends authenticated population requests, renders
  the shared News Article presentation, stays outside public navigation, and
  declares `noindex, nofollow`. The preview remains available when the site's
  temporary homepage-only mode hides ordinary public routes.
- 2026-08-30: Verification passed with three focused Live Preview tests, 74
  combined preview and router tests, seven Backend CMS structure tests, eight
  REST integration scenarios, Backend CMS typechecking, both production
  builds, HTTP 200 checks for `/admin` and the built preview route, and a clean
  diff check. The full public suite has 122 passing tests and the same three
  unrelated assertion failures recorded when the publishing prerequisite
  closed.
