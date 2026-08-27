import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../tailgrids/core/dropdown'
import { Eye, MenuMeatballs1, Pencil1, Trash1, ClockThree } from '@tailgrids/icons'
import { useAuthStore } from '../../stores/authStore'
import { hasAnyRole } from '../../auth/portalResolver'

/**
 * ActionDropdown - Canonical action menu for table rows and card items based on TailGrids DropdownMenu.
 */
export default function ActionDropdown({
  onView,
  onEdit,
  onDelete,
  onHistory,
  viewPermission,
  editPermission,
  deletePermission,
  historyPermission,
  extraItems = [],
  customActions = [],
  trigger,
}) {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || (user?.role ? [user.role] : [])
  const permissions = user?.permissions || []
  const isSuperAdmin = hasAnyRole(roles, ['Super Admin'])

  const checkPerm = (requiredPerm) => {
    if (!requiredPerm || isSuperAdmin) return true
    if (Array.isArray(requiredPerm)) {
      return requiredPerm.some((p) => permissions.includes(p))
    }
    return permissions.includes(requiredPerm)
  }

  const canView = onView && checkPerm(viewPermission)
  const canEdit = onEdit && checkPerm(editPermission)
  const canHistory = onHistory && checkPerm(historyPermission)
  const rawExtras = extraItems.length > 0 ? extraItems : customActions
  const filteredExtraItems = rawExtras.filter(
    (item) => !item.permission || checkPerm(item.permission)
  )
  const canDelete = onDelete && checkPerm(deletePermission)

  const hasAnyAction = canView || canEdit || canHistory || filteredExtraItems.length > 0 || canDelete

  const exec = (fn) => {
    if (typeof fn === 'function') {
      setTimeout(() => {
        fn()
      }, 10)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menu Aksi"
        className="flex size-10 items-center justify-center rounded-2xl bg-slate-100/90 text-slate-600 hover:bg-slate-500 hover:text-white dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-slate-500/30 cursor-pointer shadow-2xs"
      >
        {trigger || <MenuMeatballs1 className="size-5" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1.5 border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 min-w-36 shadow-lg rounded-xl">
        {canView && (
          <DropdownMenuItem
            onAction={() => exec(onView)}
            className="cursor-pointer font-medium text-xs text-slate-700 hover:text-emerald-700 dark:text-slate-200"
          >
            <Eye className="size-4 text-sky-500" />
            <span>Lihat Data</span>
          </DropdownMenuItem>
        )}
        {canEdit && (
          <DropdownMenuItem
            onAction={() => exec(onEdit)}
            className="cursor-pointer font-medium text-xs text-slate-700 hover:text-emerald-700 dark:text-slate-200"
          >
            <Pencil1 className="size-4 text-amber-500" />
            <span>Edit Data</span>
          </DropdownMenuItem>
        )}
        {canHistory && (
          <DropdownMenuItem
            onAction={() => exec(onHistory)}
            className="cursor-pointer font-medium text-xs text-slate-700 hover:text-emerald-700 dark:text-slate-200"
          >
            <ClockThree className="size-4 text-slate-400" />
            <span>Riwayat</span>
          </DropdownMenuItem>
        )}
        {filteredExtraItems.map((item, idx) => {
          const IconComp = item.icon
          const isDanger = item.isDanger || item.danger
          return (
            <DropdownMenuItem
              key={idx}
              onAction={() => exec(item.onClick)}
              className={`cursor-pointer font-medium text-xs text-slate-700 hover:text-emerald-700 dark:text-slate-200 ${
                isDanger ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700' : ''
              }`}
            >
              {typeof IconComp === 'function' || (typeof IconComp === 'object' && IconComp && IconComp.$$typeof) ? (
                <IconComp className={`size-4 ${isDanger ? 'text-rose-500' : 'text-slate-500'}`} />
              ) : (
                IconComp
              )}
              <span>{item.label}</span>
            </DropdownMenuItem>
          )
        })}
        {canDelete && (
          <>
            {(canView || canEdit || canHistory || filteredExtraItems.length > 0) && (
              <DropdownMenuSeparator className="-mx-1.5 my-1.5 border-slate-200 dark:border-slate-800" />
            )}
            <DropdownMenuItem
              onAction={() => exec(onDelete)}
              className="cursor-pointer font-medium text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <Trash1 className="size-4 text-rose-500" />
              <span>Hapus</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
