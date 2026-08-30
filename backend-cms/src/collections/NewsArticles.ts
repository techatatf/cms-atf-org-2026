import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import {
  hasEditorialRole,
  isEditorialUser,
} from '../access/roles'

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
  versions: {
    drafts: true,
  },
}
