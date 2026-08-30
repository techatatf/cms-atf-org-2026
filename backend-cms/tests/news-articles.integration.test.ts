import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import { REST_DELETE, REST_GET, REST_PATCH, REST_POST } from '@payloadcms/next/routes'
import { getPayload, type Payload } from 'payload'

import type { NewsArticle } from '../src/payload-types'
import config from '../src/payload.config'

const get = REST_GET(config)
const patch = REST_PATCH(config)
const post = REST_POST(config)
const remove = REST_DELETE(config)
const createdDocumentIDs: Array<number | string> = []
const createdMediaIDs: Array<number | string> = []
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

function apiRequest({
  body,
  method,
  path,
  token,
}: {
  body?: Record<string, unknown>
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST'
  path: string
  token?: string
}) {
  const [pathname] = path.split('?')
  const handler = {
    DELETE: remove,
    GET: get,
    PATCH: patch,
    POST: post,
  }[method]
  const headers = new Headers()

  if (token) {
    headers.set('Authorization', `JWT ${token}`)
  }

  if (body) {
    headers.set('Content-Type', 'application/json')
  }

  return handler(
    new Request(`http://localhost:3001/api/${path}`, {
      body: body ? JSON.stringify(body) : undefined,
      headers,
      method,
    }),
    {
      params: Promise.resolve({
        slug: pathname.split('/').filter(Boolean),
      }),
    },
  )
}

async function createAuthenticatedUser(role: 'admin' | 'editor') {
  const email = `${role}-${crypto.randomUUID()}@example.test`
  const password = 'role-access-test-password'
  const user = await payload.create({
    collection: 'users',
    data: { email, password, role },
    overrideAccess: true,
  })
  createdUserIDs.push(user.id)

  const login = await payload.login({
    collection: 'users',
    data: { email, password },
  })
  assert.ok(login.token)

  return {
    token: login.token,
    user,
  }
}

function untrackDocument(id: number | string) {
  const index = createdDocumentIDs.indexOf(id)

  if (index !== -1) {
    createdDocumentIDs.splice(index, 1)
  }
}

function uploadMedia({
  alt = 'Media access test image',
  filename,
  token,
}: {
  alt?: string
  filename: string
  token?: string
}) {
  const formData = new FormData()
  const onePixelPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  )
  formData.append(
    'file',
    new Blob([onePixelPng], { type: 'image/png' }),
    filename,
  )
  formData.append(
    '_payload',
    JSON.stringify({ alt }),
  )
  const headers = new Headers()

  if (token) {
    headers.set('Authorization', `JWT ${token}`)
  }

  return post(
    new Request('http://localhost:3001/api/media', {
      body: formData,
      headers,
      method: 'POST',
    }),
    {
      params: Promise.resolve({ slug: ['media'] }),
    },
  )
}

test('Media rejects blank alt text at the API boundary', async () => {
  const editor = await createAuthenticatedUser('editor')
  const response = await uploadMedia({
    alt: '   ',
    filename: `blank-alt-${crypto.randomUUID()}.png`,
    token: editor.token,
  })
  const result = await response.json()

  if (response.ok) {
    createdMediaIDs.push(result.doc.id)
  }

  assert.equal(response.status, 400)
  assert.equal(result.errors[0].data.errors[0].path, 'alt')
})

test('Media stores trimmed alt text at the API boundary', async () => {
  const editor = await createAuthenticatedUser('editor')
  const response = await uploadMedia({
    alt: '  Editors presenting workshop prototypes  ',
    filename: `trimmed-alt-${crypto.randomUUID()}.png`,
    token: editor.token,
  })
  const result = await response.json()

  assert.equal(response.status, 201)
  createdMediaIDs.push(result.doc.id)
  assert.equal(result.doc.alt, 'Editors presenting workshop prototypes')
})

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

    for (const id of createdMediaIDs) {
      await payload.delete({
        collection: 'media',
        id,
        overrideAccess: true,
      })
    }

    for (const id of createdUserIDs) {
      await payload.delete({
        collection: 'users',
        context: {
          skipLastAdminProtection: true,
        },
        id,
        overrideAccess: true,
      })
    }
  } finally {
    await payload.destroy()
  }
})

test('Payload opens the dedicated public-site News Article Live Preview route', async () => {
  const livePreview = payload.config.admin.livePreview
  const backendOrigin = new URL(
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  ).origin
  const siteOrigin = new URL(
    process.env.PAYLOAD_PUBLIC_SITE_ORIGIN || 'http://localhost:3000',
  ).origin
  const expectedOrigins = [siteOrigin, backendOrigin]
  const { cors, csrf } = payload.config

  assert.ok(livePreview)
  assert.deepEqual(livePreview.collections, ['news-articles'])
  assert.equal(typeof livePreview.url, 'function')
  assert.ok(Array.isArray(cors))
  assert.ok(Array.isArray(csrf))
  for (const origin of expectedOrigins) {
    assert.equal(cors.includes(origin), true)
    assert.equal(csrf.includes(origin), true)
  }
  assert.equal(cors.includes('*'), false)
  assert.equal(csrf.includes('*'), false)

  const generateURL = livePreview.url as (args: {
    data: Record<string, unknown>
  }) => Promise<string> | string
  const previewURL = await generateURL({ data: { id: 42 } })

  assert.equal(previewURL, `${siteOrigin}/preview/news/42`)
})

test('a visitor reads the published News Article but not its drafts', async () => {
  const editor = await createAuthenticatedUser('editor')
  const mediaFilename = `published-hero-${crypto.randomUUID()}.png`
  const mediaResponse = await uploadMedia({
    alt: 'Participants presenting their workshop prototypes',
    filename: mediaFilename,
    token: editor.token,
  })
  const mediaResult = await mediaResponse.json()

  assert.equal(mediaResponse.status, 201)
  createdMediaIDs.push(mediaResult.doc.id)

  const draft = await payload.create({
    collection: 'news-articles',
    data: {
      body: publishedBody,
      category: 'Press',
      excerpt: 'The published excerpt.',
      featured: false,
      heroImage: mediaResult.doc.id,
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
      publishedAt: '2026-08-29T12:00:00.000Z',
      slug: 'publication-boundary-test',
      status: 'published',
      title: 'Publication Boundary Test',
    },
  )
  assert.equal(
    publishedResult.docs[0].heroImage.alt,
    'Participants presenting their workshop prototypes',
  )
  assert.equal(
    new URL(publishedResult.docs[0].heroImage.url).pathname,
    `/api/media/file/${mediaFilename}`,
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
  assert.equal('firstPublishedAt' in stillPublishedResult.docs[0], false)
})

test('a News Article cannot publish with legacy Media that has no alt text', async () => {
  const editor = await createAuthenticatedUser('editor')
  const mediaResponse = await uploadMedia({
    filename: `publication-alt-${crypto.randomUUID()}.png`,
    token: editor.token,
  })
  const mediaResult = await mediaResponse.json()

  assert.equal(mediaResponse.status, 201)
  createdMediaIDs.push(mediaResult.doc.id)

  await payload.db.updateOne({
    collection: 'media',
    data: { alt: null },
    id: mediaResult.doc.id,
  })

  const draft = await payload.create({
    collection: 'news-articles',
    data: {
      body: publishedBody,
      category: 'Press',
      excerpt: 'The article text must remain a valid draft.',
      featured: false,
      heroImage: mediaResult.doc.id,
      publishedAt: '2026-08-30T12:00:00.000Z',
      title: 'Publication Alt Validation',
    },
    draft: true,
    overrideAccess: true,
  })
  createdDocumentIDs.push(draft.id)

  const publishResponse = await apiRequest({
    body: { _status: 'published' },
    method: 'PATCH',
    path: `news-articles/${draft.id}?draft=false`,
    token: editor.token,
  })
  const publishResult = await publishResponse.json()

  assert.equal(publishResponse.status, 400)
  assert.equal(publishResult.errors[0].data.errors[0].path, 'heroImage')
})

test('an authenticated Admin creates and publishes a News Article through REST', async () => {
  const email = `news-article-admin-${Date.now()}@example.test`
  const password = 'news-article-test-password'
  const user = await payload.create({
    collection: 'users',
    data: { email, password, role: 'admin' },
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

test('the API enforces the Public News Slug grammar', async () => {
  const editor = await createAuthenticatedUser('editor')
  const invalidSlugs = [
    'Uppercase',
    'non-ascii-café',
    'under_score',
    '-leading-hyphen',
    'trailing-hyphen-',
    'repeated--hyphen',
  ]

  for (const slug of invalidSlugs) {
    const response = await apiRequest({
      body: {
        _status: 'draft',
        body: publishedBody,
        category: 'Press',
        excerpt: 'This draft has an invalid manual Public News Slug.',
        featured: false,
        publishedAt: '2026-08-30T14:30:00.000Z',
        slug,
        title: 'Invalid Public News Slug',
      },
      method: 'POST',
      path: 'news-articles?draft=true',
      token: editor.token,
    })
    const result = await response.json()

    if (response.ok) {
      createdDocumentIDs.push(result.doc.id)
    }

    assert.equal(response.status, 400, slug)
    assert.equal(result.errors[0].data.errors[0].path, 'slug')
  }

  const validSlug = `2026-valid-public-news-slug-${crypto.randomUUID()}`
  const validResponse = await apiRequest({
    body: {
      _status: 'draft',
      body: publishedBody,
      category: 'Press',
      excerpt: 'This draft has a valid manual Public News Slug.',
      featured: false,
      publishedAt: '2026-08-30T14:30:00.000Z',
      slug: validSlug,
      title: 'Valid Public News Slug',
    },
    method: 'POST',
    path: 'news-articles?draft=true',
    token: editor.token,
  })
  const validResult = await validResponse.json()

  if (validResponse.ok) {
    createdDocumentIDs.push(validResult.doc.id)
  }

  assert.equal(validResponse.status, 201)
  assert.equal(validResult.doc.slug, validSlug)
})

test('First Publication locks the Public News Slug for Editors while an Admin retains the previous value', async () => {
  const admin = await createAuthenticatedUser('admin')
  const editor = await createAuthenticatedUser('editor')
  const suffix = crypto.randomUUID()
  const initialSlug = `initial-public-news-slug-${suffix}`
  const prePublicationSlug = `pre-publication-news-slug-${suffix}`
  const adminPrePublicationSlug = `admin-pre-publication-news-slug-${suffix}`
  const adminSlug = `admin-public-news-slug-${suffix}`
  const draftResponse = await apiRequest({
    body: {
      _status: 'draft',
      body: publishedBody,
      category: 'Programs',
      excerpt: 'This draft exercises Public News Slug locking.',
      featured: false,
      publishedAt: '2026-08-30T14:45:00.000Z',
      slug: initialSlug,
      title: `Public News Slug locking ${suffix}`,
    },
    method: 'POST',
    path: 'news-articles?draft=true',
    token: editor.token,
  })
  const draftResult = await draftResponse.json()

  assert.equal(draftResponse.status, 201)
  createdDocumentIDs.push(draftResult.doc.id)

  const prePublicationResponse = await apiRequest({
    body: {
      generateSlug: false,
      slug: prePublicationSlug,
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=true`,
    token: editor.token,
  })
  const prePublicationResult = await prePublicationResponse.json()

  assert.equal(prePublicationResponse.status, 200)
  assert.equal(prePublicationResult.doc.slug, prePublicationSlug)
  assert.deepEqual(prePublicationResult.doc.previousSlugs, [])

  const adminPrePublicationResponse = await apiRequest({
    body: {
      generateSlug: false,
      slug: adminPrePublicationSlug,
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=true`,
    token: admin.token,
  })
  const adminPrePublicationResult = await adminPrePublicationResponse.json()

  assert.equal(adminPrePublicationResponse.status, 200)
  assert.equal(adminPrePublicationResult.doc.slug, adminPrePublicationSlug)
  assert.deepEqual(adminPrePublicationResult.doc.previousSlugs, [])

  const publishResponse = await apiRequest({
    body: { _status: 'published' },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=false`,
    token: editor.token,
  })
  assert.equal(publishResponse.status, 200)

  const editorChangeResponse = await apiRequest({
    body: {
      generateSlug: false,
      slug: `editor-public-news-slug-${suffix}`,
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=true`,
    token: editor.token,
  })
  const editorChangeResult = await editorChangeResponse.json()

  assert.equal(editorChangeResponse.status, 400)
  assert.equal(editorChangeResult.errors[0].data.errors[0].path, 'slug')

  const adminChangeResponse = await apiRequest({
    body: {
      generateSlug: false,
      slug: adminSlug,
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=false`,
    token: admin.token,
  })
  const adminChangeResult = await adminChangeResponse.json()

  assert.equal(adminChangeResponse.status, 200)
  assert.equal(adminChangeResult.doc.slug, adminSlug)
  assert.deepEqual(
    adminChangeResult.doc.previousSlugs.map(
      ({ slug }: { slug: string }) => slug,
    ),
    [adminPrePublicationSlug],
  )
})

test('Current and Previous News Slugs share one reserved namespace', async () => {
  const admin = await createAuthenticatedUser('admin')
  const editor = await createAuthenticatedUser('editor')
  const suffix = crypto.randomUUID()
  const firstSlug = `reserved-first-news-slug-${suffix}`
  const changedSlug = `reserved-changed-news-slug-${suffix}`
  const secondSlug = `reserved-second-news-slug-${suffix}`
  const createDraft = async (slug: string, title: string) => {
    const response = await apiRequest({
      body: {
        _status: 'draft',
        body: publishedBody,
        category: 'Research',
        excerpt: `${title} excerpt.`,
        featured: false,
        publishedAt: '2026-08-30T15:00:00.000Z',
        slug,
        title,
      },
      method: 'POST',
      path: 'news-articles?draft=true',
      token: editor.token,
    })
    const result = await response.json()

    assert.equal(response.status, 201)
    createdDocumentIDs.push(result.doc.id)

    return result.doc
  }
  const firstArticle = await createDraft(
    firstSlug,
    `First reserved namespace article ${suffix}`,
  )
  const secondArticle = await createDraft(
    secondSlug,
    `Second reserved namespace article ${suffix}`,
  )
  const publishResponse = await apiRequest({
    body: { _status: 'published' },
    method: 'PATCH',
    path: `news-articles/${firstArticle.id}?draft=false`,
    token: editor.token,
  })
  assert.equal(publishResponse.status, 200)

  const changeResponse = await apiRequest({
    body: { generateSlug: false, slug: changedSlug },
    method: 'PATCH',
    path: `news-articles/${firstArticle.id}?draft=false`,
    token: admin.token,
  })
  assert.equal(changeResponse.status, 200)

  for (const reservedSlug of [changedSlug, firstSlug]) {
    const collisionResponse = await apiRequest({
      body: { generateSlug: false, slug: reservedSlug },
      method: 'PATCH',
      path: `news-articles/${secondArticle.id}?draft=true`,
      token: editor.token,
    })
    const collisionResult = await collisionResponse.json()

    assert.equal(collisionResponse.status, 400, reservedSlug)
    assert.equal(collisionResult.errors[0].data.errors[0].path, 'slug')
  }

  const previousSlugResponse = await visitorRequest(
    `news-articles?where[or][0][slug][equals]=${firstSlug}&where[or][1][previousSlugs.slug][equals]=${firstSlug}&limit=1`,
  )
  const previousSlugResult = await previousSlugResponse.json()

  assert.equal(previousSlugResponse.status, 200)
  assert.equal(previousSlugResult.totalDocs, 1)
  assert.equal(previousSlugResult.docs[0].slug, changedSlug)
  assert.deepEqual(
    previousSlugResult.docs[0].previousSlugs.map(
      ({ slug }: { slug: string }) => slug,
    ),
    [firstSlug],
  )

  const restoreResponse = await apiRequest({
    body: { generateSlug: false, slug: firstSlug },
    method: 'PATCH',
    path: `news-articles/${firstArticle.id}?draft=false`,
    token: admin.token,
  })
  const restoreResult = await restoreResponse.json()

  assert.equal(restoreResponse.status, 200)
  assert.equal(restoreResult.doc.slug, firstSlug)
  assert.deepEqual(
    restoreResult.doc.previousSlugs.map(
      ({ slug }: { slug: string }) => slug,
    ),
    [changedSlug],
  )
})

test('Public News Slug locking survives version restoration', async () => {
  const admin = await createAuthenticatedUser('admin')
  const editor = await createAuthenticatedUser('editor')
  const suffix = crypto.randomUUID()
  const initialSlug = `version-initial-news-slug-${suffix}`
  const changedSlug = `version-changed-news-slug-${suffix}`
  const draftResponse = await apiRequest({
    body: {
      _status: 'draft',
      body: publishedBody,
      category: 'Chapters',
      excerpt: 'This draft exercises slug-aware version restoration.',
      featured: false,
      publishedAt: '2026-08-30T15:15:00.000Z',
      slug: initialSlug,
      title: `Slug-aware version restoration ${suffix}`,
    },
    method: 'POST',
    path: 'news-articles?draft=true',
    token: editor.token,
  })
  const draftResult = await draftResponse.json()

  assert.equal(draftResponse.status, 201)
  createdDocumentIDs.push(draftResult.doc.id)

  const publishResponse = await apiRequest({
    body: { _status: 'published' },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=false`,
    token: editor.token,
  })
  assert.equal(publishResponse.status, 200)

  const changeResponse = await apiRequest({
    body: { generateSlug: false, slug: changedSlug },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=false`,
    token: admin.token,
  })
  assert.equal(changeResponse.status, 200)

  const versionsResponse = await apiRequest({
    method: 'GET',
    path: `news-articles/versions?where[parent][equals]=${draftResult.doc.id}&limit=50`,
    token: admin.token,
  })
  const versionsResult = await versionsResponse.json()
  const initialSlugVersion = versionsResult.docs.find(
    (version: { version?: { slug?: string } }) =>
      version.version?.slug === initialSlug,
  )

  assert.equal(versionsResponse.status, 200)
  assert.ok(initialSlugVersion)

  const editorRestoreResponse = await apiRequest({
    method: 'POST',
    path: `news-articles/versions/${initialSlugVersion.id}?draft=true`,
    token: editor.token,
  })
  const editorRestoreResult = await editorRestoreResponse.json()

  assert.equal(editorRestoreResponse.status, 400)
  assert.equal(editorRestoreResult.errors[0].data.errors[0].path, 'slug')

  const adminRestoreResponse = await apiRequest({
    method: 'POST',
    path: `news-articles/versions/${initialSlugVersion.id}?draft=true`,
    token: admin.token,
  })
  const adminRestoreResult = await adminRestoreResponse.json()

  assert.equal(adminRestoreResponse.status, 200)
  assert.equal(adminRestoreResult.slug, initialSlug)
  assert.deepEqual(
    adminRestoreResult.previousSlugs.map(
      ({ slug }: { slug: string }) => slug,
    ),
    [changedSlug],
  )

  const editorChangeAfterRestoreResponse = await apiRequest({
    body: {
      generateSlug: false,
      slug: `version-editor-news-slug-${suffix}`,
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=true`,
    token: editor.token,
  })

  assert.equal(editorChangeAfterRestoreResponse.status, 400)
})

test('publishing a featured News Article clears the previous published feature', async () => {
  const editor = await createAuthenticatedUser('editor')
  const firstTitle = `First featured article ${crypto.randomUUID()}`
  const secondTitle = `Second featured article ${crypto.randomUUID()}`
  const createFeaturedDraft = async (title: string, publishedAt: string) => {
    const response = await apiRequest({
      body: {
        _status: 'draft',
        body: publishedBody,
        category: 'Programs',
        excerpt: `${title} excerpt.`,
        featured: true,
        publishedAt,
        title,
      },
      method: 'POST',
      path: 'news-articles?draft=true',
      token: editor.token,
    })
    const result = await response.json()

    assert.equal(response.status, 201)
    createdDocumentIDs.push(result.doc.id)

    return result.doc
  }
  const publish = (id: number | string) =>
    apiRequest({
      body: { _status: 'published' },
      method: 'PATCH',
      path: `news-articles/${id}?draft=false`,
      token: editor.token,
    })

  const firstDraft = await createFeaturedDraft(
    firstTitle,
    '2026-08-30T15:00:00.000Z',
  )
  const firstPublishResponse = await publish(firstDraft.id)
  assert.equal(firstPublishResponse.status, 200)

  const firstDraftTitle = `${firstTitle} with unpublished edits`
  const firstDraftResponse = await apiRequest({
    body: {
      _status: 'draft',
      title: firstDraftTitle,
    },
    method: 'PATCH',
    path: `news-articles/${firstDraft.id}?draft=true`,
    token: editor.token,
  })
  assert.equal(firstDraftResponse.status, 200)

  const secondDraft = await createFeaturedDraft(
    secondTitle,
    '2026-08-30T16:00:00.000Z',
  )
  const beforeSecondPublishResponse = await visitorRequest(
    `news-articles?where[slug][equals]=${firstDraft.slug}&limit=1`,
  )
  const beforeSecondPublishResult = await beforeSecondPublishResponse.json()

  assert.equal(beforeSecondPublishResult.docs[0].featured, true)

  const secondPublishResponse = await publish(secondDraft.id)
  assert.equal(secondPublishResponse.status, 200)

  const featuredResponse = await visitorRequest(
    'news-articles?where[featured][equals]=true&limit=10',
  )
  const featuredResult = await featuredResponse.json()

  assert.equal(featuredResponse.status, 200)
  assert.equal(featuredResult.totalDocs, 1)
  assert.equal(featuredResult.docs[0].id, secondDraft.id)

  const previousResponse = await visitorRequest(
    `news-articles?where[slug][equals]=${firstDraft.slug}&limit=1`,
  )
  const previousResult = await previousResponse.json()

  assert.equal(previousResponse.status, 200)
  assert.equal(previousResult.docs[0]._status, 'published')
  assert.equal(previousResult.docs[0].featured, false)
  assert.equal(previousResult.docs[0].title, firstTitle)

  const preservedDraftResponse = await apiRequest({
    method: 'GET',
    path: `news-articles/${firstDraft.id}?draft=true`,
    token: editor.token,
  })
  const preservedDraftResult = await preservedDraftResponse.json()

  assert.equal(preservedDraftResponse.status, 200)
  assert.equal(preservedDraftResult.title, firstDraftTitle)
  assert.equal(preservedDraftResult.featured, true)
})

test('an Admin manages users while an Editor and Visitor are denied through REST', async () => {
  const admin = await createAuthenticatedUser('admin')
  const editor = await createAuthenticatedUser('editor')

  const adminReadResponse = await apiRequest({
    method: 'GET',
    path: 'users?limit=1',
    token: admin.token,
  })
  assert.equal(adminReadResponse.status, 200)

  const editorSelfReadResponse = await apiRequest({
    method: 'GET',
    path: `users/${editor.user.id}`,
    token: editor.token,
  })
  assert.equal(editorSelfReadResponse.status, 200)

  const editorAdminReadResponse = await apiRequest({
    method: 'GET',
    path: `users/${admin.user.id}`,
    token: editor.token,
  })
  assert.ok(editorAdminReadResponse.status >= 400)

  const visitorCreateResponse = await apiRequest({
    body: {
      email: `visitor-created-${crypto.randomUUID()}@example.test`,
      password: 'visitor-created-password',
      role: 'editor',
    },
    method: 'POST',
    path: 'users',
  })
  assert.equal(visitorCreateResponse.status, 403)

  const editorCreateResponse = await apiRequest({
    body: {
      email: `editor-created-${crypto.randomUUID()}@example.test`,
      password: 'editor-created-password',
      role: 'editor',
    },
    method: 'POST',
    path: 'users',
    token: editor.token,
  })
  assert.equal(editorCreateResponse.status, 403)

  const adminCreateResponse = await apiRequest({
    body: {
      email: `admin-created-${crypto.randomUUID()}@example.test`,
      password: 'admin-created-password',
      role: 'editor',
    },
    method: 'POST',
    path: 'users',
    token: admin.token,
  })
  const adminCreateResult = await adminCreateResponse.json()

  assert.equal(adminCreateResponse.status, 201)
  assert.equal(adminCreateResult.doc.role, 'editor')
  createdUserIDs.push(adminCreateResult.doc.id)

  const missingRoleResponse = await apiRequest({
    body: {
      email: `missing-role-${crypto.randomUUID()}@example.test`,
      password: 'missing-role-password',
    },
    method: 'POST',
    path: 'users',
    token: admin.token,
  })
  assert.equal(missingRoleResponse.status, 400)

  const invalidRoleResponse = await apiRequest({
    body: {
      email: `invalid-role-${crypto.randomUUID()}@example.test`,
      password: 'invalid-role-password',
      role: 'owner',
    },
    method: 'POST',
    path: 'users',
    token: admin.token,
  })
  assert.equal(invalidRoleResponse.status, 400)

  const editorUpdateUserResponse = await apiRequest({
    body: {
      role: 'admin',
    },
    method: 'PATCH',
    path: `users/${adminCreateResult.doc.id}`,
    token: editor.token,
  })
  assert.ok(editorUpdateUserResponse.status >= 400)

  const adminUpdateUserResponse = await apiRequest({
    body: {
      role: 'admin',
    },
    method: 'PATCH',
    path: `users/${adminCreateResult.doc.id}`,
    token: admin.token,
  })
  const adminUpdateUserResult = await adminUpdateUserResponse.json()

  assert.equal(adminUpdateUserResponse.status, 200)
  assert.equal(adminUpdateUserResult.doc.role, 'admin')

  const editorDeleteUserResponse = await apiRequest({
    method: 'DELETE',
    path: `users/${adminCreateResult.doc.id}`,
    token: editor.token,
  })
  assert.ok(editorDeleteUserResponse.status >= 400)

  const adminDeleteUserResponse = await apiRequest({
    method: 'DELETE',
    path: `users/${adminCreateResult.doc.id}`,
    token: admin.token,
  })
  assert.equal(adminDeleteUserResponse.status, 200)
  const createdUserIndex = createdUserIDs.indexOf(adminCreateResult.doc.id)
  createdUserIDs.splice(createdUserIndex, 1)
})

test('an Editor deletes only never-published News Articles while an Admin deletes published ones', async () => {
  const admin = await createAuthenticatedUser('admin')
  const editor = await createAuthenticatedUser('editor')
  const articleTitle = `Editorial lifecycle ${crypto.randomUUID()}`
  const visitorCreateResponse = await apiRequest({
    body: {
      _status: 'draft',
      body: publishedBody,
      category: 'Programs',
      excerpt: 'A Visitor must not create this draft.',
      featured: false,
      publishedAt: '2026-08-30T11:30:00.000Z',
      title: `Visitor draft ${crypto.randomUUID()}`,
    },
    method: 'POST',
    path: 'news-articles?draft=true',
  })
  assert.ok(visitorCreateResponse.status >= 400)

  const draftResponse = await apiRequest({
    body: {
      _status: 'draft',
      body: publishedBody,
      category: 'Programs',
      excerpt: 'This draft exercises the editorial lifecycle.',
      featured: false,
      publishedAt: '2026-08-30T12:00:00.000Z',
      title: articleTitle,
    },
    method: 'POST',
    path: 'news-articles?draft=true',
    token: editor.token,
  })
  const draftResult = await draftResponse.json()

  assert.equal(draftResponse.status, 201)
  createdDocumentIDs.push(draftResult.doc.id)

  const editorDraftReadResponse = await apiRequest({
    method: 'GET',
    path: `news-articles/${draftResult.doc.id}?draft=true`,
    token: editor.token,
  })
  assert.equal(editorDraftReadResponse.status, 200)

  const visitorUpdateResponse = await apiRequest({
    body: {
      excerpt: 'A Visitor must not store this update.',
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=true`,
  })
  assert.ok(visitorUpdateResponse.status >= 400)

  const visitorDeleteResponse = await apiRequest({
    method: 'DELETE',
    path: `news-articles/${draftResult.doc.id}`,
  })
  assert.ok(visitorDeleteResponse.status >= 400)

  const publishResponse = await apiRequest({
    body: {
      _status: 'published',
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=false`,
    token: editor.token,
  })
  assert.equal(publishResponse.status, 200)

  const unpublishResponse = await apiRequest({
    body: {
      _status: 'draft',
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=false`,
    token: editor.token,
  })
  assert.equal(unpublishResponse.status, 200)

  const lifecycleVersionsResponse = await apiRequest({
    method: 'GET',
    path: `news-articles/versions?where[parent][equals]=${draftResult.doc.id}&limit=20`,
    token: editor.token,
  })
  const lifecycleVersionsResult = await lifecycleVersionsResponse.json()
  const prePublicationVersion = lifecycleVersionsResult.docs.find(
    (version: { version?: { _status?: string } }) =>
      version.version?._status === 'draft',
  )

  assert.equal(lifecycleVersionsResponse.status, 200)
  assert.ok(prePublicationVersion)

  const restorePrePublicationResponse = await apiRequest({
    method: 'POST',
    path: `news-articles/versions/${prePublicationVersion.id}?draft=true`,
    token: editor.token,
  })
  assert.equal(restorePrePublicationResponse.status, 200)

  const editorPublishedDeleteResponse = await apiRequest({
    method: 'DELETE',
    path: `news-articles/${draftResult.doc.id}`,
    token: editor.token,
  })

  if (editorPublishedDeleteResponse.ok) {
    untrackDocument(draftResult.doc.id)
  }

  assert.ok(editorPublishedDeleteResponse.status >= 400)

  const adminPublishedDeleteResponse = await apiRequest({
    method: 'DELETE',
    path: `news-articles/${draftResult.doc.id}`,
    token: admin.token,
  })
  assert.equal(adminPublishedDeleteResponse.status, 200)
  untrackDocument(draftResult.doc.id)

  const neverPublishedResponse = await apiRequest({
    body: {
      _status: 'draft',
      body: publishedBody,
      category: 'Programs',
      excerpt: 'This draft has never been published.',
      featured: false,
      publishedAt: '2026-08-30T12:30:00.000Z',
      title: `Never published ${crypto.randomUUID()}`,
    },
    method: 'POST',
    path: 'news-articles?draft=true',
    token: editor.token,
  })
  const neverPublishedResult = await neverPublishedResponse.json()

  assert.equal(neverPublishedResponse.status, 201)
  createdDocumentIDs.push(neverPublishedResult.doc.id)

  const editorDraftDeleteResponse = await apiRequest({
    method: 'DELETE',
    path: `news-articles/${neverPublishedResult.doc.id}`,
    token: editor.token,
  })
  assert.equal(editorDraftDeleteResponse.status, 200)
  untrackDocument(neverPublishedResult.doc.id)
})

test('an Editor reads and restores News Article versions while a Visitor is denied', async () => {
  const admin = await createAuthenticatedUser('admin')
  const editor = await createAuthenticatedUser('editor')
  const draftResponse = await apiRequest({
    body: {
      _status: 'draft',
      body: publishedBody,
      category: 'Research',
      excerpt: 'The original version.',
      featured: false,
      publishedAt: '2026-08-30T13:00:00.000Z',
      title: `Version restore ${crypto.randomUUID()}`,
    },
    method: 'POST',
    path: 'news-articles?draft=true',
    token: editor.token,
  })
  const draftResult = await draftResponse.json()

  assert.equal(draftResponse.status, 201)
  createdDocumentIDs.push(draftResult.doc.id)

  const updateResponse = await apiRequest({
    body: {
      excerpt: 'The changed version.',
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=true`,
    token: editor.token,
  })
  assert.equal(updateResponse.status, 200)

  const visitorVersionsResponse = await apiRequest({
    method: 'GET',
    path: `news-articles/versions?where[parent][equals]=${draftResult.doc.id}`,
  })
  assert.ok(visitorVersionsResponse.status >= 400)

  const editorVersionsResponse = await apiRequest({
    method: 'GET',
    path: `news-articles/versions?where[parent][equals]=${draftResult.doc.id}&limit=10`,
    token: editor.token,
  })
  const editorVersionsResult = await editorVersionsResponse.json()

  assert.equal(editorVersionsResponse.status, 200)
  const originalVersion = editorVersionsResult.docs.find(
    (version: { version?: { excerpt?: string } }) =>
      version.version?.excerpt === 'The original version.',
  )
  assert.ok(originalVersion)

  const visitorRestoreResponse = await apiRequest({
    method: 'POST',
    path: `news-articles/versions/${originalVersion.id}?draft=true`,
  })
  assert.ok(visitorRestoreResponse.status >= 400)

  const editorRestoreResponse = await apiRequest({
    method: 'POST',
    path: `news-articles/versions/${originalVersion.id}?draft=true`,
    token: editor.token,
  })
  const editorRestoreResult = await editorRestoreResponse.json()

  assert.equal(editorRestoreResponse.status, 200)
  assert.equal(editorRestoreResult.excerpt, 'The original version.')

  const changedVersion = editorVersionsResult.docs.find(
    (version: { version?: { excerpt?: string } }) =>
      version.version?.excerpt === 'The changed version.',
  )
  assert.ok(changedVersion)

  const adminRestoreResponse = await apiRequest({
    method: 'POST',
    path: `news-articles/versions/${changedVersion.id}?draft=true`,
    token: admin.token,
  })
  const adminRestoreResult = await adminRestoreResponse.json()

  assert.equal(adminRestoreResponse.status, 200)
  assert.equal(adminRestoreResult.excerpt, 'The changed version.')
})

test('restoring an earlier draft leaves the published News Article unchanged for Visitors', async () => {
  const editor = await createAuthenticatedUser('editor')
  const title = `Public restore boundary ${crypto.randomUUID()}`
  const draftResponse = await apiRequest({
    body: {
      _status: 'draft',
      body: publishedBody,
      category: 'Research',
      excerpt: 'The earlier private draft.',
      featured: false,
      publishedAt: '2026-08-30T14:00:00.000Z',
      title,
    },
    method: 'POST',
    path: 'news-articles?draft=true',
    token: editor.token,
  })
  const draftResult = await draftResponse.json()

  assert.equal(draftResponse.status, 201)
  createdDocumentIDs.push(draftResult.doc.id)

  const publishContentResponse = await apiRequest({
    body: {
      excerpt: 'The published version.',
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=true`,
    token: editor.token,
  })
  assert.equal(publishContentResponse.status, 200)

  const publishResponse = await apiRequest({
    body: {
      _status: 'published',
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=false`,
    token: editor.token,
  })
  assert.equal(publishResponse.status, 200)

  const newerDraftResponse = await apiRequest({
    body: {
      excerpt: 'The newest private draft.',
    },
    method: 'PATCH',
    path: `news-articles/${draftResult.doc.id}?draft=true`,
    token: editor.token,
  })
  assert.equal(newerDraftResponse.status, 200)

  const versionsResponse = await apiRequest({
    method: 'GET',
    path: `news-articles/versions?where[parent][equals]=${draftResult.doc.id}&limit=20`,
    token: editor.token,
  })
  const versionsResult = await versionsResponse.json()
  const earlierDraft = versionsResult.docs.find(
    (version: { version?: { excerpt?: string } }) =>
      version.version?.excerpt === 'The earlier private draft.',
  )

  assert.equal(versionsResponse.status, 200)
  assert.ok(earlierDraft)

  const restoreResponse = await apiRequest({
    method: 'POST',
    path: `news-articles/versions/${earlierDraft.id}?draft=true`,
    token: editor.token,
  })
  assert.equal(restoreResponse.status, 200)

  const editorDraftResponse = await apiRequest({
    method: 'GET',
    path: `news-articles/${draftResult.doc.id}?draft=true`,
    token: editor.token,
  })
  const editorDraftResult = await editorDraftResponse.json()

  assert.equal(editorDraftResponse.status, 200)
  assert.equal(editorDraftResult.excerpt, 'The earlier private draft.')

  const visitorDraftResponse = await visitorRequest(
    `news-articles?where[slug][equals]=${draftResult.doc.slug}&draft=true&limit=1`,
  )
  const visitorDraftResult = await visitorDraftResponse.json()

  assert.equal(visitorDraftResponse.status, 200)
  assert.equal(visitorDraftResult.totalDocs, 0)

  const visitorPublishedResponse = await visitorRequest(
    `news-articles?where[slug][equals]=${draftResult.doc.slug}&draft=false&limit=1`,
  )
  const visitorPublishedResult = await visitorPublishedResponse.json()

  assert.equal(visitorPublishedResponse.status, 200)
  assert.equal(visitorPublishedResult.totalDocs, 1)
  assert.equal(visitorPublishedResult.docs[0]._status, 'published')
  assert.equal(visitorPublishedResult.docs[0].excerpt, 'The published version.')
})

test('an Editor uploads and updates Media while only an Admin deletes it', async () => {
  const admin = await createAuthenticatedUser('admin')
  const editor = await createAuthenticatedUser('editor')

  const visitorUploadResponse = await uploadMedia({
    filename: `visitor-${crypto.randomUUID()}.png`,
  })
  assert.ok(visitorUploadResponse.status >= 400)

  const editorUploadResponse = await uploadMedia({
    filename: `editor-${crypto.randomUUID()}.png`,
    token: editor.token,
  })
  const editorUploadResult = await editorUploadResponse.json()

  assert.equal(editorUploadResponse.status, 201)
  createdMediaIDs.push(editorUploadResult.doc.id)

  const visitorReadResponse = await apiRequest({
    method: 'GET',
    path: `media/${editorUploadResult.doc.id}`,
  })
  assert.equal(visitorReadResponse.status, 200)

  const editorUpdateResponse = await apiRequest({
    body: {
      alt: 'Updated by an Editor',
    },
    method: 'PATCH',
    path: `media/${editorUploadResult.doc.id}`,
    token: editor.token,
  })
  assert.equal(editorUpdateResponse.status, 200)

  const visitorUpdateResponse = await apiRequest({
    body: {
      alt: 'Visitor update must not be stored',
    },
    method: 'PATCH',
    path: `media/${editorUploadResult.doc.id}`,
  })
  assert.ok(visitorUpdateResponse.status >= 400)

  const editorDeleteResponse = await apiRequest({
    method: 'DELETE',
    path: `media/${editorUploadResult.doc.id}`,
    token: editor.token,
  })

  if (editorDeleteResponse.ok) {
    const index = createdMediaIDs.indexOf(editorUploadResult.doc.id)
    createdMediaIDs.splice(index, 1)
  }

  assert.ok(editorDeleteResponse.status >= 400)

  const adminDeleteResponse = await apiRequest({
    method: 'DELETE',
    path: `media/${editorUploadResult.doc.id}`,
    token: admin.token,
  })
  assert.equal(adminDeleteResponse.status, 200)
  const index = createdMediaIDs.indexOf(editorUploadResult.doc.id)
  createdMediaIDs.splice(index, 1)

  const adminUploadResponse = await uploadMedia({
    filename: `admin-${crypto.randomUUID()}.png`,
    token: admin.token,
  })
  const adminUploadResult = await adminUploadResponse.json()

  assert.equal(adminUploadResponse.status, 201)
  createdMediaIDs.push(adminUploadResult.doc.id)

  const adminUpdateResponse = await apiRequest({
    body: {
      alt: 'Updated by an Admin',
    },
    method: 'PATCH',
    path: `media/${adminUploadResult.doc.id}`,
    token: admin.token,
  })
  assert.equal(adminUpdateResponse.status, 200)

  const adminCleanupResponse = await apiRequest({
    method: 'DELETE',
    path: `media/${adminUploadResult.doc.id}`,
    token: admin.token,
  })
  assert.equal(adminCleanupResponse.status, 200)
  const adminMediaIndex = createdMediaIDs.indexOf(adminUploadResult.doc.id)
  createdMediaIDs.splice(adminMediaIndex, 1)
})
