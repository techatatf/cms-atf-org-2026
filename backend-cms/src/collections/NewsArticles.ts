import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  CollectionConfig,
  PayloadRequest,
  Where,
} from 'payload'
import { slugField, ValidationError } from 'payload'

import {
  hasEditorialRole,
  isEditorialUser,
} from '../access/roles'
import type { NewsArticle } from '../payload-types'

const publicNewsSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function previousNewsSlugValues(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((entry) => {
    if (
      typeof entry === 'object' &&
      entry !== null &&
      'slug' in entry &&
      typeof entry.slug === 'string'
    ) {
      return [entry.slug]
    }

    return []
  })
}

function storedPreviousNewsSlugs(slugs: string[]) {
  return slugs.map((slug) => ({ slug }))
}

function publicNewsSlugValidationError({
  id,
  message,
  req,
}: {
  id?: number | string
  message: string
  req: PayloadRequest
}) {
  return new ValidationError({
    collection: 'news-articles',
    errors: [{ message, path: 'slug' }],
    id,
    req,
  })
}

function databaseErrorHasCode(
  error: unknown,
  code: string,
  seen = new Set<unknown>(),
): boolean {
  if (typeof error !== 'object' || error === null || seen.has(error)) {
    return false
  }

  seen.add(error)

  if ('code' in error && error.code === code) {
    return true
  }

  return (
    ('cause' in error && databaseErrorHasCode(error.cause, code, seen)) ||
    ('errors' in error &&
      Array.isArray(error.errors) &&
      error.errors.some((nestedError) =>
        databaseErrorHasCode(nestedError, code, seen),
      ))
  )
}

const validateManualPublicNewsSlug: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  if (
    Object.hasOwn(data, 'slug') &&
    typeof data.slug === 'string' &&
    !publicNewsSlugPattern.test(data.slug)
  ) {
    throw new ValidationError({
      collection: 'news-articles',
      errors: [
        {
          message:
            'Use lowercase ASCII letters, digits, and single interior hyphens.',
          path: 'slug',
        },
      ],
      id: originalDoc?.id,
      req,
    })
  }

  return data
}

const preservePublicNewsSlug: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const previousSlugs =
    operation === 'create'
      ? []
      : previousNewsSlugValues(originalDoc?.previousSlugs)
  data.previousSlugs = storedPreviousNewsSlugs(previousSlugs)

  if (!originalDoc?.firstPublishedAt) {
    return data
  }

  const currentSlug = originalDoc.slug
  const requestedSlug =
    typeof data.slug === 'string' ? data.slug : currentSlug

  data.generateSlug = false
  data.slug = requestedSlug

  if (requestedSlug === currentSlug) {
    return data
  }

  if (!hasEditorialRole(req, ['admin'])) {
    throw new ValidationError({
      collection: 'news-articles',
      errors: [
        {
          message:
            'Only an Admin can change a Public News Slug after First Publication.',
          path: 'slug',
        },
      ],
      id: originalDoc.id,
      req,
    })
  }

  const retainedSlugs = previousSlugs.filter((slug) => slug !== requestedSlug)

  if (
    typeof currentSlug === 'string' &&
    !retainedSlugs.includes(currentSlug)
  ) {
    retainedSlugs.push(currentSlug)
  }

  data.previousSlugs = storedPreviousNewsSlugs(retainedSlugs)

  return data
}

const rejectReservedPublicNewsSlug: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (typeof data.slug !== 'string') {
    return data
  }

  if (req.context.isRestoringVersion) {
    return data
  }

  if (originalDoc?.id !== undefined && data.slug === originalDoc.slug) {
    return data
  }

  const articleCollision = await req.payload.find({
    collection: 'news-articles',
    depth: 0,
    draft: true,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      and: [
        {
          or: [
            {
              slug: {
                equals: data.slug,
              },
            },
            {
              'previousSlugs.slug': {
                equals: data.slug,
              },
            },
          ],
        },
        ...(originalDoc?.id === undefined
          ? []
          : [
              {
                id: {
                  not_equals: originalDoc.id,
                },
              },
            ]),
      ],
    },
  })

  if (articleCollision.docs.length > 0) {
    throw publicNewsSlugValidationError({
      id: originalDoc?.id,
      message: 'This Public News Slug is already reserved.',
      req,
    })
  }

  const reservationCollision = await req.payload.find({
    collection: 'news-slug-reservations',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      slug: {
        equals: data.slug,
      },
    },
  })
  const reservation = reservationCollision.docs[0]

  if (
    reservation &&
    relationshipID(reservation.newsArticle) !== originalDoc?.id
  ) {
    throw publicNewsSlugValidationError({
      id: originalDoc?.id,
      message: 'This Public News Slug is already reserved.',
      req,
    })
  }

  return data
}

const synchronizeNewsSlugReservations: CollectionAfterChangeHook = async ({
  doc,
  req,
}) => {
  const desiredSlugs = Array.from(
    new Set([
      ...(typeof doc.slug === 'string' ? [doc.slug] : []),
      ...previousNewsSlugValues(doc.previousSlugs),
    ]),
  )
  const existingReservations = await req.payload.find({
    collection: 'news-slug-reservations',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      newsArticle: {
        equals: doc.id,
      },
    },
  })
  const existingBySlug = new Map(
    existingReservations.docs.map((reservation) => [
      reservation.slug,
      reservation,
    ]),
  )

  for (const slug of desiredSlugs) {
    if (existingBySlug.has(slug)) {
      continue
    }

    try {
      await req.payload.create({
        collection: 'news-slug-reservations',
        data: {
          newsArticle: doc.id,
          slug,
        },
        overrideAccess: true,
        req,
      })
    } catch (error) {
      if (databaseErrorHasCode(error, '23505')) {
        throw publicNewsSlugValidationError({
          id: doc.id,
          message: 'This Public News Slug is already reserved.',
          req,
        })
      }

      throw error
    }
  }

  for (const reservation of existingReservations.docs) {
    if (!desiredSlugs.includes(reservation.slug)) {
      await req.payload.delete({
        collection: 'news-slug-reservations',
        id: reservation.id,
        overrideAccess: true,
        req,
      })
    }
  }

  return doc
}

const deleteNewsSlugReservations: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  await req.payload.delete({
    collection: 'news-slug-reservations',
    overrideAccess: true,
    req,
    where: {
      newsArticle: {
        equals: id,
      },
    },
  })
}

function relationshipID(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    (typeof value.id === 'number' || typeof value.id === 'string')
  ) {
    return value.id
  }

  return null
}

function newsArticleDraftData(article: NewsArticle) {
  const heroImageID = relationshipID(article.heroImage)

  return {
    _status: 'draft' as const,
    body: article.body,
    category: article.category,
    excerpt: article.excerpt,
    featured: article.featured,
    generateSlug: article.generateSlug,
    heroImage: typeof heroImageID === 'number' ? heroImageID : null,
    publishedAt: article.publishedAt,
    slug: article.slug,
    title: article.title,
  }
}

const validatePublishedHeroImage: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const status = data._status ?? originalDoc?._status

  if (status !== 'published') {
    return data
  }

  const heroImage = Object.hasOwn(data, 'heroImage')
    ? data.heroImage
    : originalDoc?.heroImage
  const id = relationshipID(heroImage)

  if (id === null) {
    return data
  }

  const media = await req.payload.findByID({
    collection: 'media',
    id,
    overrideAccess: true,
    req,
  })

  if (typeof media.alt !== 'string' || media.alt.trim().length === 0) {
    throw new ValidationError({
      collection: 'news-articles',
      errors: [
        {
          message: 'Add alt text to the selected Media before publishing.',
          path: 'heroImage',
        },
      ],
      id: originalDoc?.id,
      req,
    })
  }

  return data
}

const clearPreviousPublishedFeature: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const status = data._status ?? originalDoc?._status
  const featured = data.featured ?? originalDoc?.featured

  if (status !== 'published' || featured !== true) {
    return data
  }

  const where: Where = {
    and: [
      {
        _status: {
          equals: 'published' as const,
        },
      },
      {
        featured: {
          equals: true,
        },
      },
      ...(originalDoc?.id === undefined
        ? []
        : [
            {
              id: {
                not_equals: originalDoc.id,
              },
            },
          ]),
    ],
  }

  const previousPublishedFeatures = await req.payload.find({
    collection: 'news-articles',
    depth: 0,
    draft: false,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    req,
    where,
  })
  const previousDrafts: NewsArticle[] = []

  for (const { id } of previousPublishedFeatures.docs) {
    const latestArticle = await req.payload.findByID({
      collection: 'news-articles',
      depth: 0,
      draft: true,
      id,
      overrideAccess: true,
      req,
    })

    if (latestArticle._status === 'draft') {
      previousDrafts.push(latestArticle)
    }
  }

  await req.payload.update({
    collection: 'news-articles',
    data: {
      featured: false,
    },
    draft: false,
    overrideAccess: true,
    req,
    where,
  })

  for (const previousDraft of previousDrafts) {
    await req.payload.update({
      collection: 'news-articles',
      data: newsArticleDraftData(previousDraft),
      draft: true,
      id: previousDraft.id,
      overrideAccess: true,
      req,
    })
  }

  return data
}

export const NewsArticles: CollectionConfig = {
  slug: 'news-articles',
  access: {
    create: isEditorialUser,
    delete: ({ req }) => {
      if (hasEditorialRole(req, ['admin'])) {
        return true
      }

      if (!hasEditorialRole(req, ['editor'])) {
        return false
      }

      return {
        firstPublishedAt: {
          exists: false,
        },
      }
    },
    read: ({ req }) => {
      if (hasEditorialRole(req, ['admin', 'editor'])) {
        return true
      }

      return {
        _status: {
          equals: 'published',
        },
      }
    },
    readVersions: isEditorialUser,
    update: isEditorialUser,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'category', 'publishedAt', '_status'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      useAsSlug: 'title',
    }),
    {
      name: 'previousSlugs',
      type: 'array',
      admin: {
        readOnly: true,
      },
      defaultValue: [],
      fields: [
        {
          name: 'slug',
          type: 'text',
          index: true,
          required: true,
        },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      required: true,
    },
    {
      name: 'firstPublishedAt',
      type: 'date',
      admin: {
        hidden: true,
        readOnly: true,
      },
      hidden: true,
      hooks: {
        beforeChange: [
          ({ originalDoc, siblingData }) => {
            if (originalDoc.firstPublishedAt) {
              return originalDoc.firstPublishedAt
            }

            if (siblingData._status === 'published') {
              return new Date().toISOString()
            }

            return null
          },
        ],
      },
    },
    {
      name: 'category',
      type: 'select',
      options: ['Press', 'Programs', 'Research', 'Partnerships', 'Chapters'],
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
    {
      name: 'heroImage',
      type: 'relationship',
      relationTo: 'media',
    },
  ],
  hooks: {
    beforeChange: [
      validateManualPublicNewsSlug,
      preservePublicNewsSlug,
      rejectReservedPublicNewsSlug,
      validatePublishedHeroImage,
      clearPreviousPublishedFeature,
    ],
    afterChange: [synchronizeNewsSlugReservations],
    beforeDelete: [deleteNewsSlugReservations],
  },
  versions: {
    drafts: true,
  },
}
