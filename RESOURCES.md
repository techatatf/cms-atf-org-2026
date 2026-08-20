# Payload Publishing Resources

## Knowledge

- [Payload: REST API](https://payloadcms.com/docs/rest-api/overview)
  The generated HTTP interface for reading and changing collection documents.
  Use for endpoint shapes, queries, authentication operations, and custom APIs.
- [Payload: Drafts](https://payloadcms.com/docs/versions/drafts)
  The authoritative explanation of draft and published document state. Use for
  understanding what the Publish action changes and who may read drafts.
- [Payload: Access Control](https://payloadcms.com/docs/access-control/overview)
  Payload's server-side authorization model. Use when separating public reads
  of published content from protected editorial operations.
- [Payload: Live Preview](https://payloadcms.com/docs/live-preview)
  How the Admin Panel embeds and updates a separate frontend for preview. Use
  when designing editorial preview without exposing drafts publicly.
- [Payload: Hooks](https://payloadcms.com/docs/hooks/overview)
  Server-side events after content changes. Use if publishing should trigger a
  static-site build, cache purge, notification, or another side effect.
- [Payload: Production Deployment](https://payloadcms.com/docs/production/deployment)
  Official self-hosting, Docker, database, media, and production considerations.
- [Vercel: Using Monorepos](https://vercel.com/docs/monorepos)
  Explains per-project root directories. Use to verify that `backend-cms/` can
  coexist without becoming part of the public site's Vercel project.

## Wisdom (Communities)

- [Payload GitHub Discussions](https://github.com/payloadcms/payload/discussions)
  Project-maintainer and practitioner discussions. Use to validate unusual
  deployment, preview, or caching designs after the official docs are exhausted.
