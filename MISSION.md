# Mission: Payload publishing for ATF.org

## Why

Choose a simple, provider-independent boundary between the public Vite site and
the Payload Backend CMS so ATF can publish real content confidently without
accidentally coupling the applications to Vercel or a particular reverse proxy.

## Success looks like

- Explain what Payload changes when an editor saves, previews, or publishes.
- Compare browser-runtime, build-time, server-runtime, and hybrid content reads.
- Select publishing and outage behavior that fits ATF's public site.
- Run the public site and Backend CMS independently with local development data.

## Constraints

- The public site remains a simple Vite application.
- `backend-cms/` is a self-contained Payload full-stack application.
- Payload's native administration and authentication are used.
- Published content is exposed through a public REST API.
- The applications must not require Vercel or Nginx Proxy Manager to function.
- The first live deployment is treated as Production Launch; private readiness
  plans are outside the teaching scope.

## Out of scope

- Replacing Payload's native administration interface.
- Provider-specific ingress configuration.
- Auditing undisclosed production-readiness precautions.
- Implementing the CMS while the publishing model remains undecided.
