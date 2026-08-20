# Select the CMS architecture from the evaluated options

Status: closed
Assignee: Codex
Parent: `docs/CMS Architecture Wayfinding.md`
Label: `wayfinder:grilling`

## Question

Given the candidate research, which existing CMS or custom-build option should
ATF adopt, and what product boundary, principal trade-offs, and database
implications should the architecture specification carry forward?

## Comments

- 2026-08-19: Claimed by Codex for a live CMS architecture decision session
  with the stakeholder.
- 2026-08-19, round 1: WordPress is excluded by stakeholder preference. The
  active selection is therefore Payload CMS versus a custom ATF backend. No
  concrete non-CMS capability is currently known, although the stakeholder is
  increasingly inclined toward custom development. That inclination remains
  to be tested against the ownership it creates; it is not yet the selection.
- 2026-08-19, operational fact check: Payload, PostgreSQL, and local media can
  run under Docker Compose, but durable database and media state must live in
  persistent volumes or external object storage rather than disposable
  container layers. A volume provides persistence, not backup. A recoverable
  backup must capture PostgreSQL and media as one recovery point, keep an
  encrypted copy off the VPS, and be restore-tested. This storage and recovery
  obligation applies to both Payload and a custom backend.
- 2026-08-19, round 2: The stakeholder accepted local media in a dedicated
  persistent volume for the initial release, a mandatory encrypted off-site
  backup copy, and provisional recovery targets of at most 24 hours of data
  loss and restoration within four hours. The desired sequence is an initial
  deployed CMS demonstration, followed by an explicit stakeholder-approval
  checkpoint, then backup implementation as the next focused step. The
  pre-checkpoint deployment must remain disposable and contain no
  irreplaceable editorial data unless backup and recovery move earlier. A
  concise, presentation-like Markdown decision brief is required when the CMS
  architecture wayfinding effort concludes; it should summarize the route to
  the architecture, considered alternatives, trade-offs, and future phases.
- 2026-08-19, round 3: Payload CMS is selected over a custom backend, with
  PostgreSQL as its supported database. Payload will supply the initial CMS,
  native administration interface, authentication and authorization,
  revisions, and API foundation; custom routes or modules will be added only
  for concrete needs. The stakeholder accepted the staged vocabulary of Demo
  Deployment, Architecture Approval Checkpoint, Backup and Recovery Gate, and
  Production Launch, and accepted a concise Markdown stakeholder approval
  brief as the final wayfinding handoff artifact.
- 2026-08-19, round 4: The Demo Deployment will not gain an early minimal
  preservation backup when editors begin creating non-disposable content. At
  the Architecture Approval Checkpoint, editors will receive notice and writes
  will be frozen while a consistent PostgreSQL-and-media recovery set is
  captured off-site, the full backup process is established, and restoration
  is verified before editing reopens for Production Launch.
- 2026-08-19, resolution: ATF will adopt Payload CMS with PostgreSQL rather
  than build a custom CMS. Payload is the initial code-owned CMS foundation:
  its native administration interface, authentication and authorization,
  revisions, REST capabilities, and content modeling will be used before ATF
  adds custom routes or modules for concrete needs. This accepts Payload and
  Next.js upgrade/configuration ownership in exchange for avoiding ownership of
  commodity editorial and security behavior. The initial Compose deployment
  will externalize PostgreSQL and media into persistent storage. After the
  Architecture Approval Checkpoint, editing will be frozen while an encrypted
  off-site PostgreSQL-and-media recovery set, automated backup process, and
  verified clean restore establish the Backup and Recovery Gate. ATF knowingly
  accepts total loss of otherwise irreplaceable Demo Deployment content if its
  storage fails before that checkpoint. Production Launch follows the passed
  recovery gate. The final wayfinding handoff will be a concise,
  presentation-like Markdown architecture brief linking to detailed evidence.
- 2026-08-19: Unblocked by completion of [Research CMS candidates and the
  custom-build baseline](02-research-cms-candidates.md). Decision evidence is
  recorded in the linked [ATF CMS candidate comparison](../research/cms-candidate-comparison.md).
