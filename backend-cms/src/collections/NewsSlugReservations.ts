import type { CollectionConfig } from 'payload'

const denyExternalAccess = () => false

export const NewsSlugReservations: CollectionConfig = {
  slug: 'news-slug-reservations',
  access: {
    create: denyExternalAccess,
    delete: denyExternalAccess,
    read: denyExternalAccess,
    update: denyExternalAccess,
  },
  admin: {
    hidden: true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'newsArticle',
      type: 'relationship',
      index: true,
      relationTo: 'news-articles',
      required: true,
    },
  ],
  timestamps: false,
}
