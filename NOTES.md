# Teaching Notes

- Keep lessons short and attach every concept to the ATF architecture decision.
- The learner already understands the basic headless-CMS relationship: Payload
  exposes content through an API and the public site consumes it.
- Do not present Vercel, Nginx Proxy Manager, or a path proxy as an application
  requirement. They may be production adapters only.
- Do not introduce new pre-production gates. Treat the first deployment as the
  Production Launch and accept that private readiness work is handled elsewhere.
- The next teaching/wayfinding step is choosing when the public site reads
  published REST data and what visitors see when the Backend CMS is unavailable.
