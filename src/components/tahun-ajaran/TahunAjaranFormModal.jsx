import React, { useState, useEffect } from 'react'
import { CalendarDays, Calendar, CheckCircle2, FileText } from 'lucide-react'
import { MasterFormModal } from '../master-data'

export default function TahunAjaranFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const isEdit = Boolean(initialData?.id || initialData?.name)

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    keterangan: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          start_date: initialData.start_date || '',
          end_date: initialData.end_date || '',
          is_active: !!initialData.is_active,
          keterangan: initialData.keterangan || initialData.metadata?.keterangan || '',
        })
      } else {
        const currentYear = new Date().getFullYear()
        setFormData({
          name: `${currentYear}/${currentYear + 1}`,
          start_date: `${currentYear}-07-01`,
          end_date: `${currentYear + 1}-06-30`,
          is_active: false,
          keterangan: '',
        })
      }
      setErrors({})
    }
  }, [initialData, isOpen])

  const validate = () => {
    const errs = {}
    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Nama tahun ajaran wajib diisi.'
    }
    if (!formData.start_date) {
      errs.start_date = 'Tanggal mulai wajib diisi.'
    }
    if (!formData.end_date) {
      errs.end_date = 'Tanggal selesai wajib diisi.'
    }
    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      errs.end_date = 'Tanggal selesai harus setelah tanggal mulai.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(formData)
  }

  return (
    <MasterFormModal
      isOpen={isOpen}
      onClose={onClose}
      icon={CalendarDays}
      title={isEdit ? 'Edit Master Data Tahun Ajaran' : 'Tambah Master Data Tahun Ajaran'}
      description="Lengkapi nama periode ajaran, tanggal mulai & selesai, serta status keaktifan."
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            form="tahun-ajaran-form"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0E5C44] px-5 text-xs font-bold text-white shadow-md shadow-emerald-900/10 hover:bg-emerald-800 disabled:opacity-50 dark:bg-[#3FBF75] dark:text-slate-900 dark:hover:bg-emerald-400"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Tahun Ajaran'}</span>
          </button>
        </div>
      }
    >
      <form id="tahun-ajaran-form" onSubmit={handleSubmit} className="space-y-5 p-1">
        {/* GRUP 1: IDENTITAS PERIODE */}
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E5C44] dark:text-[#3FBF75]">
            <CalendarDays className="h-4 w-4" />
            <span>1. Identitas Tahun Ajaran</span>
          </h4>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
              Nama Tahun Ajaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: null })
              }}
              placeholder="Contoh: 2025/2026"
              className={`h-11 w-full rounded-xl border bg-white px-3.5 text-xs font-medium outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] dark:text-white ${
                errors.name ? 'border-rose-500' : 'border-slate-200'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.name}</p>
            )}
          </div>
        </div>

        {/* GRUP 2: JADWAL & PERIODE */}
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E5C44] dark:text-[#3FBF75]">
            <Calendar className="h-4 w-4" />
            <span>2. Rentang Kalender Akademik</span>
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                Tanggal Mulai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => {
                  setFormData({ ...formData, start_date: e.target.value })
                  if (errors.start_date) setErrors({ ...errors, start_date: null })
                }}
                className={`h-11 w-full rounded-xl border bg-white px-3.5 text-xs font-medium outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] dark:text-white ${
                  errors.start_date ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-800 dark:text-slate-100">
                Tanggal Selesai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => {
                  setFormData({ ...formData, end_date: e.target.value })
                  if (errors.end_date) setErrors({ ...errors, end_date: null })
                }}
                className={`h-11 w-full rounded-xl border bg-white px-3.5 text-xs font-medium outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] dark:text-white ${
                  errors.end_date ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.end_date}</p>
              )}
            </div>
          </div>
        </div>

        {/* GRUP 3: KETERANGAN & CATATAN */}
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E5C44] dark:text-[#3FBF75]">
            <FileText className="h-4 w-4" />
            <span>3. Catatan & Keterangan Tambahan</span>
          </h4>

          <div>
            <textarea
              rows={3}
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Catatan khusus atau keterangan periode ajaran ini..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs font-medium outline-none focus:border-emerald-700 dark:border-slate-700 dark:bg-[#111827] dark:text-white"
            />
          </div>
        </div>

        {/* GRUP 4: STATUS AKTIF */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 accent-[#0E5C44] focus:ring-[#0E5C44]"
            />
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white">
                Jadikan Periode Aktif Utama
              </span>
              <span className="block text-[11px] font-medium text-slate-400">
                Mengaktifkan periode ini akan menonaktifkan status tahun ajaran aktif sebelumnya di seluruh sistem.
              </span>
            </div>
          </label>
        </div>
      </form>
    </MasterFormModal>
  )
}
