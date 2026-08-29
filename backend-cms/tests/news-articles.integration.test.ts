import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import { REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import { getPayload, type Payload } from 'payload'

import type { NewsArticle } from '../src/payload-types'
import config from '../src/payload.config'

const get = REST_GET(config)
const patch = REST_PATCH(config)
const post = REST_POST(config)
const createdDocumentIDs: Array<number | string> = []
const createdUserIDs: Array<number | string> = []
let payload: Payload

const publishedBody: NewsArticle['body'] = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'The published article body.',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

function visitorRequest(path: string) {
  const [pathname] = path.split('?')

  return get(new Request(`http://localhost:3001/api/${path}`), {
    params: Promise.resolve({
      slug: pathname.split('/').filter(Boolean),
    }),
  })
}

function authenticatedRequest({
  body,
  method,
  path,
  token,
}: {
  body: Record<string, unknown>
  method: 'PATCH' | 'POST'
  path: string
  token: string
}) {
  const [pathname] = path.split('?')
  const handler = method === 'POST' ? post : patch

  return handler(
    new Request(`http://localhost:3001/api/${path}`, {
      body: JSON.stringify(body),
      headers: {
        Authorization: `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      method,
    }),
    {
      params: Promise.resolve({
        slug: pathname.split('/').filter(Boolean),
      }),
    },
  )
}

before(async () => {
  payload = await getPayload({ config })
})

after(async () => {
  try {
    for (const id of createdDocumentIDs) {
      await payload.delete({
        collection: 'news-articles',
        id,
        overrideAccess: true,
      })
    }

    for (const id of createdUserIDs) {
      await payload.delete({
        collection: 'users',
        id,
        overrideAccess: true,
      })
    }
  } finally {
    await payload.destroy()
  }
})

test('a visitor reads the published News Article but not its drafts', async () => {
  const draft = await payload.create({
    collection: 'news-articles',
    data: {
      body: publishedBody,
      category: 'Press',
      excerpt: 'The published excerpt.',
      featured: false,
      publishedAt: '2026-08-29T12:00:00.000Z',
      title: 'Publication Boundary Test',
    },
    draft: true,
    overrideAccess: true,
  })
  createdDocumentIDs.push(draft.id)

  const draftResponse = await visitorRequest(
    'news-articles?where[slug][equals]=publication-boundary-test&draft=true',
  )
  const draftResult = await draftResponse.json()

  assert.equal(draftResponse.status, 200)
  assert.equal(draftResult.totalDocs, 0)

  await payload.update({
    collection: 'news-articles',
    id: draft.id,
    data: {
      _status: 'published',
    },
    draft: false,
    overrideAccess: true,
  })

  const publishedResponse = await visitorRequest(
    'news-articles?where[slug][equals]=publication-boundary-test&limit=1',
  )
  const publishedResult = await publishedResponse.json()

  assert.equal(publishedResponse.status, 200)
  assert.equal(publishedResult.totalDocs, 1)
  assert.deepEqual(
    {
      body: publishedResult.docs[0].body,
      category: publishedResult.docs[0].category,
      excerpt: publishedResult.docs[0].excerpt,
      featured: publishedResult.docs[0].featured,
      heroImage: publishedResult.docs[0].heroImage,
      publishedAt: publishedResult.docs[0].publishedAt,
      slug: publishedResult.docs[0].slug,
      status: publishedResult.docs[0]._status,
      title: publishedResult.docs[0].title,
    },
    {
      body: publishedBody,
      category: 'Press',
      excerpt: 'The published excerpt.',
      featured: false,
      heroImage: null,
      publishedAt: '2026-08-29T12:00:00.000Z',
      slug: 'publication-boundary-test',
      status: 'published',
      title: 'Publication Boundary Test',
    },
  )

  await payload.update({
    collection: 'news-articles',
    id: draft.id,
    data: {
      excerpt: 'This newer excerpt remains a draft.',
      generateSlug: false,
      title: 'Publication Boundary Test Updated',
    },
    draft: true,
    overrideAccess: true,
  })

  const newerDraftResponse = await visitorRequest(
    'news-articles?where[slug][equals]=publication-boundary-test&draft=true&limit=1',
  )
  const newerDraftResult = await newerDraftResponse.json()

  assert.equal(newerDraftResponse.status, 200)
  assert.equal(newerDraftResult.totalDocs, 0)

  const stillPublishedResponse = await visitorRequest(
    'news-articles?where[slug][equals]=publication-boundary-test&limit=1',
  )
  const stillPublishedResult = await stillPublishedResponse.json()

  assert.equal(stillPublishedResponse.status, 200)
  assert.equal(stillPublishedResult.totalDocs, 1)
  assert.equal(stillPublishedResult.docs[0].title, 'Publication Boundary Test')
  assert.equal(stillPublishedResult.docs[0].excerpt, 'The published excerpt.')
})

test('an authenticated Admin creates and publishes a News Article through REST', async () => {
  const email = `news-article-admin-${Date.now()}@example.test`
  const password = 'news-article-test-password'
  const user = await payload.create({
    collection: 'users',
    data: { email, password },
    overrideAccess: true,
  })
  createdUserIDs.push(user.id)

  const login = await payload.login({
    collection: 'users',
    data: { email, password },
  })
  assert.ok(login.token)

  const draftResponse = await authenticatedRequest({
    body: {
      _status: 'draft',
      body: publishedBody,
      category: 'Chapters',
      excerpt: 'Created through the authenticated REST API.',
      featured: false,
      publishedAt: '2026-08-29T13:00:00.000Z',
      slug: 'admin-rest-publication',
      title: 'Admin REST Publication',
    },
    method: 'POST',
    path: 'news-articles?draft=true',
    token: login.token,
  })
  const draftResult = await draftResponse.json()

  assert.equal(draftResponse.status, 201)
  assert.equal(draftResult.doc._status, 'draft')
  createdDocumentIDs.push(draftResult.doc.id)

  const publishResponse = await authenticatedRequest({
    body: {
      _status: 'published',
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=false`,
    token: login.token,
  })

  assert.equal(publishResponse.status, 200)

  const visitorResponse = await visitorRequest(
    'news-articles?where[slug][equals]=admin-rest-publication&limit=1',
  )
  const visitorResult = await visitorResponse.json()

  assert.equal(visitorResponse.status, 200)
  assert.equal(visitorResult.totalDocs, 1)
  assert.equal(visitorResult.docs[0].title, 'Admin REST Publication')
  assert.equal(visitorResult.docs[0]._status, 'published')
})
