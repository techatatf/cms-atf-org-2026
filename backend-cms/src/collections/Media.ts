import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CollectionConfig } from 'payload'

import { isAdmin, isEditorialUser } from '../access/roles'

const directory = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: isEditorialUser,
    delete: isAdmin,
    read: () => true,
    update: isEditorialUser,
  },
  admin: {
    useAsTitle: 'filename',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      hooks: {
        beforeValidate: [
          ({ value }) =>
            typeof value === 'string' ? value.trim() : value,
        ],
      },
      validate: (value: unknown) =>
        typeof value === 'string' && value.trim().length > 0
          ? true
          : 'Alt text is required.',
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    staticDir: path.resolve(directory, '../../media'),
  },
}
