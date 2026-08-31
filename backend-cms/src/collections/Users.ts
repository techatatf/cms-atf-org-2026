import {
  APIError,
  type CollectionConfig,
  type PayloadRequest,
} from 'payload'

import {
  editorialRoles,
  hasEditorialRole,
  isAdmin,
  isAdminOrSelf,
} from '../access/roles'

async function requireAnotherAdmin({
  id,
  req,
}: {
  id: number | string
  req: PayloadRequest
}) {
  if (req.context.skipLastAdminProtection) {
    return
  }

  const otherAdmins = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
    where: {
      and: [
        {
          role: {
            equals: 'admin',
          },
        },
        {
          id: {
            not_equals: id,
          },
        },
      ],
    },
  })

  if (otherAdmins.totalDocs === 0) {
    throw new APIError('The Backend CMS requires at least one Admin.', 400)
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req }) => hasEditorialRole(req, editorialRoles),
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelf,
    update: isAdmin,
  },
  admin: {
    hidden: ({ user }) =>
      !user || (user as { role?: unknown }).role !== 'admin',
    useAsTitle: 'email',
  },
  auth: {
    cookies: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: editorialRoles.map((role) => ({
        label: role === 'admin' ? 'Admin' : 'Editor',
        value: role,
      })),
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (
          operation === 'update' &&
          originalDoc.role === 'admin' &&
          data.role !== undefined &&
          data.role !== 'admin'
        ) {
          await requireAnotherAdmin({ id: originalDoc.id, req })
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const user = await req.payload.findByID({
          collection: 'users',
          id,
          overrideAccess: true,
          req,
        })

        if (user.role === 'admin') {
          await requireAnotherAdmin({ id, req })
        }
      },
    ],
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') {
          return data
        }

        const users = await req.payload.count({
          collection: 'users',
          overrideAccess: true,
          req,
        })

        if (users.totalDocs === 0) {
          return {
            ...data,
            role: 'admin',
          }
        }

        return data
      },
    ],
  },
}
