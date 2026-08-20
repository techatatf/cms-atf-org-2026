# Define the CMS network and security boundary

Status: ready-for-human
Parent: `docs/CMS Architecture Wayfinding.md`
Label: `wayfinder:grilling`

## Question

Which Payload administration, authentication, public-content, preview, and
media routes should be reachable from the internet? Which controls must protect
each route across the reverse proxy, CORS policy, Payload access rules, cookies,
and HTTPS termination?

## Comments

- 2026-08-20: Unblocked by completion of [Define the Payload deployment and
  public-site boundary](done/04-define-payload-deployment-and-demo-boundary.md).
  The Backend CMS has a separate public origin. PostgreSQL remains private to
  its Compose network, and only Payload reaches the host or ingress network.
