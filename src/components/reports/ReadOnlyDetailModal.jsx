import React from 'react'
import { X, ShieldCheck, Info } from 'lucide-react'

export function ReadOnlyDetailModal({ isOpen, onClose, title = 'Rincian Detail Data', data = null }) {
  if (!isOpen || !data) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex h-full max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-[#1B2433]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{title}</h3>
              <p className="text-[11px] text-slate-400">Mode Read-Only Pengurus Yayasan</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Detail Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {typeof data === 'object' && !Array.isArray(data) ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Object.entries(data).map(([key, val], idx) => {
                if (key === 'id' || key === 'is_guru') return null

                // Handle nested object tabs (e.g. Student detail tabs)
                if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                  return (
                    <div key={idx} className="sm:col-span-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                      <h4 className="font-bold text-xs uppercase text-[#0E5C44] dark:text-emerald-400 border-b border-slate-200 pb-1 dark:border-slate-800">
                        {key.replace(/_/g, ' ')}
                      </h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {Object.entries(val).map(([subK, subV], sIdx) => (
                          <div key={sIdx}>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase block">{subK.replace(/_/g, ' ')}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{typeof subV === 'object' ? JSON.stringify(subV) : (subV || '-')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 dark:border-slate-800/80 dark:bg-slate-900/20">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">{key.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{typeof val === 'object' ? JSON.stringify(val) : (val || '-')}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <pre className="rounded-xl bg-slate-50 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-200 font-mono text-[11px] overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>

        {/* Footer: ONLY Close Button */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info className="h-3.5 w-3.5" />
            <span>Data tidak dapat diubah dari role ini.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
