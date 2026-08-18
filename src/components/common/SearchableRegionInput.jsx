import React, { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { MapPin, ChevronDown, X, Check } from 'lucide-react'

export function SearchableRegionInput({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Cari...',
  isLoading = false,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const containerRef = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  const filtered = useMemo(() => {
    if (!options || !Array.isArray(options)) return []
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((item) => String(item).toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    onChange(val)
    if (!isOpen) setIsOpen(true)
  }

  const handleSelect = (item) => {
    setQuery(item)
    onChange(item)
    setIsOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setQuery('')
    onChange('')
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={handleInputChange}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-14 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50"
        />
        <div className="absolute right-3 flex items-center gap-1">
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0E5C44] border-t-transparent" />
          ) : (
            <>
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                  aria-label="Hapus input"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen((p) => !p)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-[#1B2433]">
          {isLoading ? (
            <div className="px-3 py-2.5 text-center text-xs text-slate-400">Memuat data wilayah...</div>
          ) : filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = String(item).toLowerCase() === String(value).toLowerCase()
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{item}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#0E5C44] dark:text-emerald-400" />}
                </button>
              )
            })
          ) : (
            <div className="px-3 py-2.5 text-center text-xs text-slate-400">
              Tidak ada pilihan persis. Teks di atas akan disimpan secara langsung.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

SearchableRegionInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
}

export default SearchableRegionInput
