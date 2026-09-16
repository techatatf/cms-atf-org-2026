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

The external Demo Rehearsal pair is deployed. On September 16, the user
confirmed that the team had seen it, and read-only HTTP checks confirmed
availability, public API access, and the demo indexing header. The evidence
below does not yet prove the full browser workflow or deployment isolation.
The three unchecked items remain open.

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

### September 16, 2026: deployed HTTP evidence

The user confirmed that the temporary demo had been shown to the team and
approved recording these findings. Requests ran without authentication at
approximately 18:34 to 18:36 UTC. No deployment, content, or configuration changed.

| Request | Observed result |
| --- | --- |
| `HEAD https://cms-demo.africantechnologyforum.org/admin` | HTTP 200 over HTTPS. This proves endpoint availability, not authenticated administration. |
| `GET https://cms-demo.africantechnologyforum.org/api/health` | HTTP 200 with `{"status":"ok"}`. |
| `GET https://cms-demo.africantechnologyforum.org/api/news-articles?limit=1&depth=0` with the demo Public Site `Origin` header | HTTP 200, `totalDocs: 7`, and one returned News Article with `_status: published`, ID `7`, and slug `papa-yaw-joins-atf`. The response allowed the exact demo Public Site origin and credentials. Only one record was inspected. |
| `HEAD https://public-demo.africantechnologyforum.org/` | HTTP 200 with `X-Robots-Tag: noindex, nofollow`. |
| `HEAD https://public-demo.africantechnologyforum.org/news` | HTTP 200 with `X-Robots-Tag: noindex, nofollow`. |
| `HEAD https://public-demo.africantechnologyforum.org/news/papa-yaw-joins-atf` | HTTP 200 with `X-Robots-Tag: noindex, nofollow`. Article rendering was not checked. |
| `GET https://public-demo.africantechnologyforum.org/preview/news/7` | HTTP 200 with the Public Site HTML shell, script references, and `X-Robots-Tag: noindex, nofollow`. JavaScript and the authenticated preview handshake were not exercised. |
| `HEAD https://africantechnologyforum.org/`, following redirects | HTTP 308 to `https://www.africantechnologyforum.org/`, then HTTP 200. Neither response sent `X-Robots-Tag`. Page-level robots metadata was not inspected. |

These results establish HTTP availability and part of the indexing check.
They do not close any of the three combined acceptance items above. Builds,
automated tests, and the August 31 local proof were not rerun.

Remaining evidence before closure:

- Identify the deployed revisions of both the Demo Public Site and Backend
  CMS. Local HEAD alone does not identify either deployed revision.
- Observe published News Articles rendering in the demo browser and the
  authenticated Live Preview workflow across the two HTTPS origins.
- Verify that direct preview navigation boots the app and that authenticated
  Live Preview resolves and renders the News Article's Media relationship.
- Confirm separate demo data, Media, users, secrets, Compose project, and
  Vercel project. Record confirmation without secret values.
- Confirm the demo indexing configuration leaves the rendered site unchanged.

The ticket remains `ready-for-human`. The next browser check is an existing
News Article with a hero image in authenticated Live Preview. No browser session
or deployment inventory was available during these HTTP checks. Further ticket,
application, and deployment updates still require user approval.
