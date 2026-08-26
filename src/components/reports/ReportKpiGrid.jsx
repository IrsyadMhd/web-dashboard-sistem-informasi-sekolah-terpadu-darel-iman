import React, { useState } from 'react'
import { ChevronRight, X, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/tailgrids/core/dialog'

export function ReportKpiGrid({ items = [], details = [] }) {
  const [activeKpi, setActiveKpi] = useState(null)
  const [modalSearch, setModalSearch] = useState('')

  if (!items || items.length === 0) return null

  const handleOpenKpiModal = (item) => {
    setActiveKpi(item)
    setModalSearch('')
  }

  const getFilteredData = (kpi) => {
    if (!kpi) return []
    const allDetails = Array.isArray(details) ? details : []
    const key = kpi.key || (kpi.title || '').toLowerCase()

    let filtered = []

    if (key === 'total_sdm' || key.includes('total_sdm') || key.includes('total sdm') || key === 'pegawai') {
      filtered = [...allDetails]
    } else if (key === 'guru_tetap' || key.includes('guru_tetap') || key.includes('guru tetap')) {
      filtered = allDetails.filter((e) => {
        const isGuru = e.is_guru === true || (e.jenis_sdm || '').toLowerCase().includes('guru')
        const isTetap = (e.status_kepegawaian || '').toLowerCase().includes('tetap') || (e.status_kepegawaian || '').toLowerCase().includes('pns')
        return isGuru && isTetap
      })
    } else if (key === 'guru' || key.includes('guru') || key.includes('pendidik')) {
      filtered = allDetails.filter(
        (e) => e.is_guru === true || (e.jenis_sdm || '').toLowerCase().includes('guru')
      )
    } else if (key === 'non_guru' || key.includes('non_guru') || key.includes('non-guru') || key.includes('tendik')) {
      filtered = allDetails.filter(
        (e) => e.is_guru === false || (e.jenis_sdm || '').toLowerCase().includes('non-guru') || (e.jenis_sdm || '').toLowerCase().includes('tendik')
      )
    } else if (key === 'aktif' || key.includes('aktif')) {
      filtered = allDetails.filter(
        (e) => (e.status || '').toLowerCase().includes('aktif') || (e.status || '').toLowerCase().includes('active')
      )
    } else if (key === 'laki_laki' || key.includes('laki')) {
      filtered = allDetails.filter((e) => {
        const g = (e.jenis_kelamin || '').toLowerCase()
        return g.startsWith('l') || g.startsWith('m')
      })
    } else if (key === 'perempuan' || key.includes('perempuan')) {
      filtered = allDetails.filter((e) => {
        const g = (e.jenis_kelamin || '').toLowerCase()
        return g.startsWith('p') || g.startsWith('f')
      })
    } else if (key === 'sdm_baru' || key.includes('baru')) {
      filtered = allDetails.filter(
        (e) =>
          e.is_baru === true ||
          (e.status_kepegawaian || '').toLowerCase().includes('baru') ||
          (e.tanggal_masuk || '').includes('2026')
      )
    } else {
      filtered = [...allDetails]
    }

    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.nama && item.nama.toLowerCase().includes(q)) ||
          (item.niy && item.niy.toLowerCase().includes(q)) ||
          (item.unit && item.unit.toLowerCase().includes(q)) ||
          (item.jabatan && item.jabatan.toLowerCase().includes(q)) ||
          (item.jenis_sdm && item.jenis_sdm.toLowerCase().includes(q))
      )
    }

    return filtered
  }

  const modalData = getFilteredData(activeKpi)

  return (
    <>
      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = item.icon

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => handleOpenKpiModal(item)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs transition-all hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-[#1B2433] dark:hover:border-emerald-600 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-emerald-700 dark:text-slate-400 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </span>
                  {Icon && (
                    <div className={`rounded-xl p-2.5 transition shrink-0 ${item.iconBg || 'bg-emerald-50 text-[#0E5C44] dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {typeof item.value === 'number' ? item.value.toLocaleString('id-ID') : (item.value || '0')}
                  </span>
                  {item.unit && <span className="text-xs font-semibold text-slate-500">{item.unit}</span>}
                </div>

                {item.subtext && (
                  <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {item.subtext}
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <span>Lihat Data</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* KPI Detail Modal */}
      {activeKpi && (
        <Dialog
          isOpen={true}
          onOpenChange={(open) => !open && setActiveKpi(null)}
          className="max-w-4xl"
          showCloseButton={false}
        >
          <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              {activeKpi.icon && (
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${activeKpi.iconBg || 'bg-emerald-50 text-emerald-600'}`}>
                  <activeKpi.icon className="h-5 w-5" />
                </div>
              )}
              <div>
                <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                  Detail Data {activeKpi.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Menampilkan rincian data pembentuk angka laporan ({typeof activeKpi.value === 'number' ? activeKpi.value.toLocaleString('id-ID') : activeKpi.value} {activeKpi.unit || 'SDM'})
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveKpi(null)}
              className="flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <DialogBody className="space-y-4 py-4 max-h-[72vh] overflow-y-auto">
            {/* Filter Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder={`Cari nama pegawai, NIP, unit, atau jabatan pada ${activeKpi.title}...`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
              />
            </div>

            {/* SDM Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1B2433]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-900/60">
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Pegawai & NIY</th>
                      <th className="py-2.5 px-3">Unit Pendidikan</th>
                      <th className="py-2.5 px-3">Jenis SDM</th>
                      <th className="py-2.5 px-3">Jabatan / Divisi</th>
                      <th className="py-2.5 px-3 text-center">Status Pegawai</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                    {modalData.length > 0 ? (
                      modalData.map((item, idx) => {
                        const isGuru = (item.jenis_sdm || '').toLowerCase().includes('guru')
                        return (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-[10px] shrink-0 ${isGuru ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
                                  {item.nama?.substring(0, 2).toUpperCase() || 'SD'}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">{item.nama}</span>
                                  <span className="font-mono text-[10px] text-slate-400 block">{item.niy || '-'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{item.unit || '-'}</td>
                            <td className="py-2.5 px-3">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isGuru ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
                                {item.jenis_sdm || 'Pegawai'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{item.jabatan || item.divisi_mapel || '-'}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {item.status_kepegawaian || 'Tetap'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${(item.status || '').toLowerCase() === 'aktif' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>
                                {item.status || 'Aktif'}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                          {modalSearch.trim()
                            ? `Tidak ada data pegawai yang sesuai dengan kata kunci "${modalSearch}".`
                            : 'Belum ada rincian data pegawai terdaftar untuk kategori ini pada dataset laporan.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveKpi(null)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-900 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-95"
            >
              <X className="h-4 w-4" />
              <span>Tutup Modal</span>
            </motion.button>
          </DialogFooter>
        </Dialog>
      )}
    </>
  )
}
