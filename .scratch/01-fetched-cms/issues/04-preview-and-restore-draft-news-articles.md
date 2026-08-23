# 04 — Preview and restore draft News Articles

**What to build:** Let an Editor see draft changes immediately in Payload Live
Preview, using the same News Article presentation as the public route, and
restore an earlier version without exposing either draft publicly.

**Blocked by:** 02 — Publish and read one News Article; 03 — Enforce Admin and
Editor workflows

**Status:** ready-for-agent

- [ ] Payload opens a dedicated public-site News Article preview route inside
  the authenticated Admin Live Preview iframe.
- [ ] The preview updates from Payload's Live Preview messages without a general
  unauthenticated REST read of draft content.
- [ ] The public site accepts preview messages only from the configured Backend
  CMS origin.
- [ ] The preview route is absent from public navigation, is non-indexable, and
  reuses the published News Article presentation.
- [ ] Explicit local and production origin configuration supports separate
  Backend CMS and public-site origins without wildcard CORS or CSRF rules.
- [ ] Editors and Admins can restore an earlier version, and visitors continue
  to receive only the currently published version.
- [ ] Automated tests cover message-origin rejection, draft rendering, version
  restore, and public draft isolation.
