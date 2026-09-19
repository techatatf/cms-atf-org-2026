# 05 — Publish News Article images

**What to build:** Let an Editor attach an accessible hero image to a News
Article and let visitors see that image without making the article text depend
on successful media delivery.

**Blocked by:** 02 — Publish and read one News Article; 03 — Enforce Admin and
Editor workflows

**Status:** closed

- [x] Payload manages image uploads in a Media collection stored on the media
  volume.
- [x] A News Article can refer to one optional hero image.
- [x] An image requires non-empty alt text before the referring News Article can
  be published.
- [x] Published News Article responses provide the public media URL and alt text
  needed by public presentation components.
- [x] The public site replaces a failed image with a neutral accessible
  placeholder and keeps the available News Article text visible.
- [x] Draft preview renders the current hero image and alt text.
- [x] Automated tests cover media permissions, publication validation, response
  mapping, and the public failure placeholder.

## Comments

- 2026-08-30: Completed the accessible News Article hero-image path. The Media
  API trims alt text and rejects blank values. Publication also rejects selected
  legacy Media without alt text. Published queries and Live Preview populate the
  optional Media relationship, and the public query layer maps its URL and alt
  text. The shared News Article presentation renders the image in a 16:9 frame
  and replaces a failed request with an accessible `Image unavailable` panel
  without hiding article text.
- 2026-08-30: Verification passed with eleven Backend CMS integration scenarios
  against both the development database and a clean disposable database, seven
  Backend CMS structure tests, Backend CMS typechecking, generated Payload
  types, focused public query and route tests, both production builds, and HTTP
  200 smoke checks. The full public suite has 123 passing tests and the same
  three unrelated assertion failures recorded when the prerequisite tickets
  closed. The clean integration run left no database or Media artifacts.
