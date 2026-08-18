import React from 'react'
import { hasAnyRole } from '../../auth/portalResolver'
import { useAuthStore } from '../../stores/authStore'

export default function PermissionGuard({ any = [], children, fallback = null }) {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const permissions = user?.permissions || []

  const isSuperAdmin = hasAnyRole(roles, ['Super Admin'])
  const hasPermission = any.length === 0 || any.some((permission) => permissions.includes(permission))

  if (isSuperAdmin || hasPermission) {
    return children
  }

  return fallback
}
