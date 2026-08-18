import { useEffect, useMemo, useState } from 'react'
import { UserRound } from 'lucide-react'

const sizeClassMap = {
  xs: 'h-7 w-7 text-[11px]',
  sm: 'h-8 w-8 text-[12px]',
  table: 'h-9 w-9 text-[12px]',
  card: 'h-14 w-14 text-[16px]',
  detail: 'h-16 w-16 text-[18px]',
  profile: 'h-32 w-32 text-[28px]',
}

function getInitials(name) {
  if (!name) return 'U'

  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function getFallbackTone(name) {
  const safeName = String(name || 'User')
  const code = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const tones = [
    'from-emerald-600 to-emerald-500',
    'from-sky-600 to-sky-500',
    'from-violet-600 to-violet-500',
    'from-amber-600 to-amber-500',
    'from-rose-600 to-rose-500',
    'from-cyan-600 to-cyan-500',
  ]

  return tones[code % tones.length]
}

export default function PersonAvatar({
  src,
  name,
  size = 'table',
  shape = 'circle',
  className = '',
  alt,
  showPreview = false,
}) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [src])

  const resolvedSrc = useMemo(() => {
    if (!src) return null
    if (typeof src !== 'string') return null
    const trimmed = src.trim()
    if (!trimmed) return null
    return trimmed
  }, [src])

  const isCircle = shape === 'circle'
  const wrapperClass = [
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-slate-200/80 bg-gradient-to-br text-white shadow-sm',
    isCircle ? 'rounded-full' : 'rounded-xl',
    sizeClassMap[size] || sizeClassMap.table,
    className,
  ].filter(Boolean).join(' ')

  const fallbackClass = [
    'flex h-full w-full items-center justify-center bg-gradient-to-br',
    getFallbackTone(name),
    'font-bold uppercase tracking-wide',
  ].filter(Boolean).join(' ')

  if (!resolvedSrc || imageFailed) {
    return (
      <span className={wrapperClass} title={name}>
        {resolvedSrc && imageFailed ? (
          <UserRound className="h-1/2 w-1/2 text-white/90" />
        ) : (
          <span className={fallbackClass}>{getInitials(name)}</span>
        )}
      </span>
    )
  }

  return (
    <span className={wrapperClass} title={name}>
      <img
        src={resolvedSrc}
        alt={alt || name || 'Avatar'}
        loading="eager"
        crossOrigin="anonymous"
        className="h-full w-full object-cover"
        onError={() => setImageFailed(true)}
      />
      {showPreview && (
        <span className="absolute inset-0 flex items-center justify-center bg-slate-900/30 opacity-0 transition hover:opacity-100">
          <UserRound className="h-5 w-5 text-white" />
        </span>
      )}
    </span>
  )
}
