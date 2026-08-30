# 03 — Enforce Admin and Editor workflows

**What to build:** Give editorial users the approved Admin and Editor workflows
through Payload's native authentication and Admin while enforcing the same
permissions on every API operation.

**Blocked by:** 02 — Publish and read one News Article

**Status:** closed

- [x] Authenticated users have either the Admin or Editor role, and only those
  roles can enter the Payload Admin.
- [x] Editors can create, edit, preview, publish, unpublish, and restore News
  Articles and can upload media.
- [x] Editors can delete a News Article only when it has never been published.
- [x] Admins can manage users, delete published News Articles, and perform every
  Editor operation.
- [x] Visitors have unauthenticated read access only to published News Articles
  and public media.
- [x] Protected REST operations reject missing authentication and insufficient
  roles even when called outside the Admin interface.
- [x] Automated API tests exercise the allowed and denied operations for a
  Visitor, an Editor, and an Admin.

## Comments

- 2026-08-30: Completed the Admin and Editor workflows at the Payload access
  boundary. Users now require one role. The first user becomes an Admin, only
  Admins manage users, and the CMS prevents deletion or demotion of the final
  Admin. Editors manage News Articles and Media metadata but cannot delete
  Media or any News Article after its First Publication. First Publication
  survives unpublication and version restoration. Visitors retain read access
  only to published News Articles and public Media.
- 2026-08-30: Verification passed with six Backend CMS structure tests, six REST
  integration scenarios against both the live development database and a clean
  disposable database, TypeScript checking, generated Payload types, a
  production build, and HTTP 200 smoke checks for `/admin` and the public News
  Articles endpoint. The existing development user was backfilled as Admin.
  The residue audit found no role-less users, test records, or missing First
  Publication values.
