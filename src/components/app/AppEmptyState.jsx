import React from 'react'
import { EmptyState } from '../ui/empty-state'

/**
 * AppEmptyState - canonical empty state.
 * Wajib dipakai untuk mencegah halaman blank ketika data kosong.
 */
export default function AppEmptyState({ icon, title = 'Belum Ada Data', description, action, actionLabel, onAction, className = '' }) {
  return (
    <div className={className}>
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        action={action}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    </div>
  )
}
