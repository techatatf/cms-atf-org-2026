# 10 — Prove the Fetched-CMS release path

**What to build:** Prove that the completed Fetched-CMS release works as one
system for an Editor, an Admin, a visitor, and an operator before handing its
reusable foundation to SEO-CMS.

**Blocked by:** 03 — Enforce Admin and Editor workflows; 04 — Preview and restore
draft News Articles; 05 — Publish News Article images; 06 — Browse published
News Articles; 07 — Preserve Public News Slugs; 08 — Seed and import News
Articles safely; 09 — Run the Backend CMS in production

**Status:** ready-for-human

## Gap status

The repository work has closed these starting gaps:

- `vercel.json` supplies the Public Site SPA rewrite and adds
  `X-Robots-Tag: noindex, nofollow` only for the Demo Rehearsal host.
- Production-mode Editorial User cookies explicitly use `Secure`.
- The release guide covers the production and demo pairs, the Public Site's
  build-time `VITE_BACKEND_CMS_ORIGIN`, and every proof path below.
- The Demo Rehearsal wizard keeps its Backend CMS environment file outside the
  repository and uses a separate Compose project, host port, data, and Media.

The external Demo Rehearsal pair has not been deployed or proven. The three
unchecked items below are the remaining human handoff.

- [x] A clean development start supports login, draft creation, Live Preview,
  publication, public listing, public article reading, and version restore.
- [ ] The Demo Rehearsal proves Public Delivery and Live Preview across its
  same-site HTTPS Public Site and Backend CMS origins.
- [ ] Direct navigation to `/preview/news/<document-id>` loads the Public Site,
  and Live Preview populates authenticated Media relationships.
- [x] Production-mode Editorial User cookies use `Secure`.
- [ ] The Demo Rehearsal uses separate data, Media, users, and secrets, and its
  Public Site declares itself non-indexable without changing the rendered site.
- [x] The release proof covers the homepage, News index, current and previous
  News Article URLs, and the Publications Newsroom panel.
- [x] Visitor checks prove that drafts and protected operations remain
  inaccessible without the required role.
- [x] Outage checks prove the five-second timeout, manual retry, optional news
  regions, preserved shared layout, and lack of a last-known production
  snapshot.
- [x] Media checks prove alt-text enforcement and the image failure placeholder.
- [x] Restart checks prove that ordinary stops preserve PostgreSQL data and
  Payload media.
- [x] Production checks prove the checked-out-release build, successful
  migration startup, and failed-migration readiness gate.
- [x] The documented commands and required configuration are sufficient for a
  new developer or operator to repeat the verified paths.
- [x] The reusable News Article schema, query mapping, presentation components,
  Live Preview behavior, origin configuration, and Previous News Slugs are
  ready for SEO-CMS.

## Comments

- 2026-08-31: Claimed by Codex for repository gap closure, automated and local
  release verification, and a precise handoff for the external Demo Rehearsal.
- 2026-08-31: Repository and local release proof completed. Added the Vercel SPA
  rewrite and host-specific demo indexing header, production `Secure` cookies,
  configurable development port binding, a complete release guide, and the
  guarded `scripts/prove-fetched-cms-demo.sh` handoff. Verification passed with
  29 focused Public Site tests, 16 Backend CMS structure tests, 21 REST
  integration tests against a clean isolated stack, both production builds,
  Backend CMS typechecking, and both disposable production smoke scenarios.
  The production smoke now proves the real first-Admin `Set-Cookie`, successful
  migrations, PostgreSQL and Media persistence, and failed-migration readiness.
  The isolated local pair returned six published News Articles and HTTP 200 for
  the homepage, News index, News Article, Publications, and direct preview
  routes. The Public Site stayed available during the CMS outage, and all six
  articles survived both `stop` and `down`. The repeated seed skipped all six
  records. The full Public Site suite retained 139 passes and the same three
  unrelated assertion failures recorded by Issues 5 through 9. The disposable
  containers, volumes, network, image, and Vite process were removed; the
  accepted production Backend CMS remained healthy and untouched.
- 2026-08-31: Human handoff before closure: from the repository root, set
  `ENV_FILE=/secure/path/backend-cms-demo.env` and run
  `./scripts/prove-fetched-cms-demo.sh`. Complete the
  wizard against `https://public-demo.africantechnologyforum.org` and
  `https://cms-demo.africantechnologyforum.org`. Record the deployed commit,
  Public Delivery and Live Preview results, direct preview response, populated
  Media result, demo `X-Robots-Tag`, absence of that header on production, and
  confirmation of separate data, Media, users, secrets, Compose project, and
  Vercel project. Do not record credentials or cookies. Then check the three
  remaining items and close this issue.
- 2026-08-31: The operator accepted the production Backend CMS based on the
  running deployment and successful Public Delivery. This acceptance does not
  claim that every procedure in the retired manual handoff ran. Issue 10 retains
  the restart, migration, persistence, and destructive-protection checks that
  still require release-path proof.
