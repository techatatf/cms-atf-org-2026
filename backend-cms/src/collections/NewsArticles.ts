import type { CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload'
import { slugField, ValidationError } from 'payload'

import {
  hasEditorialRole,
  isEditorialUser,
} from '../access/roles'
import type { NewsArticle } from '../payload-types'

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
    beforeChange: [validatePublishedHeroImage, clearPreviousPublishedFeature],
  },
  versions: {
    drafts: true,
  },
}
