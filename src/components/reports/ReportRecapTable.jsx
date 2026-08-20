import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/tailgrids/core/card'
import { TableRoot, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/tailgrids/core/table'

export function ReportRecapTable({
  title = 'Rekapitulasi per Unit Pendidikan',
  description = 'Subtotal dan total per per-unit pendidikan di bawah yayasan.',
  columns = [],
  data = [],
  totalRow = null,
}) {
  if (!data || data.length === 0) return null

  return (
    <Card className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">{title}</CardTitle>
        {description && <CardDescription className="text-xs text-slate-500 dark:text-slate-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <TableRoot>
            <TableHeader className="bg-[#0E5C44] text-white dark:bg-[#0E5C44]/90">
              <TableRow>
                {columns.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className={`p-3 font-semibold text-white ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/60 dark:bg-[#111827]">
              {data.map((row, rIdx) => (
                <TableRow key={rIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  {columns.map((col, cIdx) => {
                    const rawVal = row[col.accessor]
                    const formatted = col.format ? col.format(rawVal, row) : (typeof rawVal === 'number' ? rawVal.toLocaleString('id-ID') : rawVal)

                    return (
                      <TableCell
                        key={cIdx}
                        className={`p-3 text-slate-700 dark:text-slate-300 font-medium ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                      >
                        {formatted ?? '-'}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}

              {totalRow && (
                <TableRow className="bg-emerald-50/80 font-bold text-slate-900 dark:bg-emerald-950/40 dark:text-white border-t-2 border-emerald-600">
                  {columns.map((col, cIdx) => {
                    const rawVal = totalRow[col.accessor]
                    const formatted = col.format ? col.format(rawVal, totalRow) : (typeof rawVal === 'number' ? rawVal.toLocaleString('id-ID') : rawVal)

                    return (
                      <TableCell
                        key={cIdx}
                        className={`p-3 font-bold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                      >
                        {formatted ?? '-'}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )}
            </TableBody>
          </TableRoot>
        </div>
      </CardContent>
    </Card>
  )
}

