# Define the CMS evaluation criteria and shortlist research frame

Status: closed
Assignee: Codex
Parent: `docs/CMS Architecture Wayfinding.md`
Label: `wayfinder:grilling`

## Question

Which requirements, trade-offs, disqualifiers, and stakeholder-facing evidence
should govern evaluation of CMS candidates for ATF's first news-only release,
so subsequent product research produces a decision-ready shortlist rather than
an unranked feature comparison?

## Comments

- 2026-08-19: Claimed by Codex for a live decision session with the stakeholder.
- 2026-08-19, round 1: A custom `/cms` interface is not required; candidate
  systems may provide their own editorial interface. The CMS and ATF Org
  Backend are separate concepts. A lightweight custom CMS/general backend is a
  credible alternative if products are not good enough. The proposed hard
  disqualifiers were accepted. Evaluation priorities should favor the narrow
  ATF fit, control, simplicity, and broader-backend opportunity implied by
  these answers rather than the originally proposed ordering. Codex will
  prepare the comparison and recommendation for the decision owner, who will
  decide what to present to stakeholders.
- 2026-08-19, round 2: Compare three existing CMS products with a lightweight
  custom option from the outset. Prefer adoption when a product clears every
  disqualifier without substantial workarounds; choose custom only when its
  ownership cost buys materially better simplicity, control, or future backend
  value. Require the proposed launch article fields and core lifecycle; treat
  scheduling, tags, SEO overrides, and multiple authors as extras. Optimize for
  fewer than ten users and modest publishing volume. One capable developer must
  be able to operate the deployment through documented Docker Compose
  procedures. General-backend potential is a scored advantage, not a CMS gate.
- 2026-08-19, resolution: Candidate research will compare three viable existing
  CMS products with a narrowly scoped custom CMS/ATF Org Backend option. All
  options must pass the agreed self-hosting, licensing, REST API, authorization,
  editorial workflow, maintenance, and public-site availability gates. Viable
  options are then judged primarily on ATF workflow fit, editor usability,
  operational simplicity, three-year ownership cost, control, and extensibility;
  security, recovery, integration, resource use, and database preference provide
  additional differentiation. Evidence must come from authoritative product and
  project sources, with unknowns stated rather than guessed. Scores organize the
  evidence but do not mechanically choose the winner. Prefer a suitable existing
  CMS when it avoids ATF owning commodity functionality; recommend custom only
  for a substantial ATF-specific or broader-backend advantage.
