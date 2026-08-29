import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

const authenticated = ({ req }: { req: { user: unknown } }) => Boolean(req.user)

export const NewsArticles: CollectionConfig = {
  slug: 'news-articles',
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req }) => {
      if (req.user) {
        return true
      }

      return {
        _status: {
          equals: 'published',
        },
      }
    },
    update: authenticated,
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
