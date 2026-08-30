import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { slugField, ValidationError } from 'payload'

import {
  hasEditorialRole,
  isEditorialUser,
} from '../access/roles'

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
    beforeChange: [validatePublishedHeroImage],
  },
  versions: {
    drafts: true,
  },
}
