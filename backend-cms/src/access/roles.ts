import type { Access, PayloadRequest } from 'payload'

export const editorialRoles = ['admin', 'editor'] as const

export type EditorialRole = (typeof editorialRoles)[number]

type EditorialUser = {
  id?: number | string
  role?: unknown
}

export function hasEditorialRole(
  req: PayloadRequest,
  roles: readonly EditorialRole[],
) {
  const user = req.user as EditorialUser | null

  return Boolean(user && roles.includes(user.role as EditorialRole))
}

export const isAdmin: Access = ({ req }) =>
  hasEditorialRole(req, ['admin'])

export const isEditorialUser: Access = ({ req }) =>
  hasEditorialRole(req, editorialRoles)

export const isAdminOrSelf: Access = ({ req }) => {
  if (hasEditorialRole(req, ['admin'])) {
    return true
  }

  const user = req.user as EditorialUser | null

  if (!user?.id || !hasEditorialRole(req, ['editor'])) {
    return false
  }

  return {
    id: {
      equals: user.id,
    },
  }
}
