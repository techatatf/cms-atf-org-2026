# 05 — Publish News Article images

**What to build:** Let an Editor attach an accessible hero image to a News
Article and let visitors see that image without making the article text depend
on successful media delivery.

**Blocked by:** 02 — Publish and read one News Article; 03 — Enforce Admin and
Editor workflows

**Status:** ready-for-agent

- [ ] Payload manages image uploads in a Media collection stored on the media
  volume.
- [ ] A News Article can refer to one optional hero image.
- [ ] An image requires non-empty alt text before the referring News Article can
  be published.
- [ ] Published News Article responses provide the public media URL and alt text
  needed by public presentation components.
- [ ] The public site replaces a failed image with a neutral accessible
  placeholder and keeps the available News Article text visible.
- [ ] Draft preview renders the current hero image and alt text.
- [ ] Automated tests cover media permissions, publication validation, response
  mapping, and the public failure placeholder.
