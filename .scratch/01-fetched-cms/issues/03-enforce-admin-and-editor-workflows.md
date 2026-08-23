# 03 — Enforce Admin and Editor workflows

**What to build:** Give editorial users the approved Admin and Editor workflows
through Payload's native authentication and Admin while enforcing the same
permissions on every API operation.

**Blocked by:** 02 — Publish and read one News Article

**Status:** ready-for-agent

- [ ] Authenticated users have either the Admin or Editor role, and only those
  roles can enter the Payload Admin.
- [ ] Editors can create, edit, preview, publish, unpublish, and restore News
  Articles and can upload media.
- [ ] Editors can delete a News Article only when it has never been published.
- [ ] Admins can manage users, delete published News Articles, and perform every
  Editor operation.
- [ ] Visitors have unauthenticated read access only to published News Articles
  and public media.
- [ ] Protected REST operations reject missing authentication and insufficient
  roles even when called outside the Admin interface.
- [ ] Automated API tests exercise the allowed and denied operations for a
  Visitor, an Editor, and an Admin.
