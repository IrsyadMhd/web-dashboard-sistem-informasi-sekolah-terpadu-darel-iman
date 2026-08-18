import React from 'react'

export function ReportRecapTable({
  title = 'Rekapitulasi per Unit Pendidikan',
  description = 'Subtotal dan total per per-unit pendidikan di bawah yayasan.',
  columns = [],
  data = [],
  totalRow = null,
}) {
  if (!data || data.length === 0) return null

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-4">
      <div>
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{title}</h3>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0E5C44] text-white dark:bg-[#0E5C44]/90">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`p-3 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/60 dark:bg-[#111827]">
            {data.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                {columns.map((col, cIdx) => {
                  const rawVal = row[col.accessor]
                  const formatted = col.format ? col.format(rawVal, row) : (typeof rawVal === 'number' ? rawVal.toLocaleString('id-ID') : rawVal)

                  return (
                    <td key={cIdx} className={`p-3 text-slate-700 dark:text-slate-300 font-medium ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                      {formatted ?? '-'}
                    </td>
                  )
                })}
              </tr>
            ))}

            {totalRow && (
              <tr className="bg-emerald-50/80 font-bold text-slate-900 dark:bg-emerald-950/40 dark:text-white border-t-2 border-emerald-600">
                {columns.map((col, cIdx) => {
                  const rawVal = totalRow[col.accessor]
                  const formatted = col.format ? col.format(rawVal, totalRow) : (typeof rawVal === 'number' ? rawVal.toLocaleString('id-ID') : rawVal)

                  return (
                    <td key={cIdx} className={`p-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                      {formatted ?? '-'}
                    </td>
                  )
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
