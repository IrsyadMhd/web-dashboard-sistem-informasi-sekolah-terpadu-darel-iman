import React, { useState, useEffect } from 'react'
import { Layers, Save, X } from 'lucide-react'
import { OverlayWrapper, Backdrop } from '@/components/tailgrids/core/overlay'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/tailgrids/core/dialog'
import { Button } from '@/components/tailgrids/core/button'
import { TextField } from '@/components/tailgrids/core/text-field'
import { FieldLabel, FieldDescription, FieldError } from '@/components/tailgrids/core/field'
import { Input } from '@/components/tailgrids/core/input'
import { InputGroupTextarea } from '@/components/tailgrids/core/input-group'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/tailgrids/core/select'

const DIVISI_OPTIONS = [
  { id: 'Divisi Pendidikan', name: 'Divisi Pendidikan' },
  { id: 'Divisi Kurikulum', name: 'Divisi Kurikulum' },
  { id: 'Divisi Kesiswaan', name: 'Divisi Kesiswaan' },
  { id: 'Divisi Tahfizh', name: 'Divisi Tahfizh' },
  { id: 'Divisi Bahasa', name: 'Divisi Bahasa' },
  { id: 'Tata Usaha', name: 'Tata Usaha' },
  { id: 'HRD & Kepegawaian', name: 'HRD & Kepegawaian' },
  { id: 'Keuangan', name: 'Keuangan' },
  { id: 'Sarana & Prasarana', name: 'Sarana & Prasarana' },
  { id: 'Keasramaan / Musyrif', name: 'Keasramaan / Musyrif' },
]

const STATUS_OPTIONS = [
  { id: 'proses', name: 'Dalam Proses' },
  { id: 'tercapai', name: 'Tercapai (Sesuai Target)' },
  { id: 'terlambat', name: 'Terlambat' },
  { id: 'belum_tercapai', name: 'Belum Tercapai' },
]

export default function PemantauanDivisiFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const isEditMode = Boolean(initialData?.id)

  const [formData, setFormData] = useState({
    nama_divisi: 'Divisi Pendidikan',
    aspek_pemantauan: '',
    persentase_capaian: 80,
    status_pemantauan: 'proses',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    catatan: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_divisi: initialData.nama_divisi || 'Divisi Pendidikan',
        aspek_pemantauan: initialData.aspek_pemantauan || '',
        persentase_capaian: initialData.persentase_capaian !== undefined ? Number(initialData.persentase_capaian) : 80,
        status_pemantauan: initialData.status_pemantauan || 'proses',
        tanggal_pemantauan: initialData.tanggal_pemantauan
          ? new Date(initialData.tanggal_pemantauan).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        catatan: initialData.catatan || '',
      })
    } else {
      setFormData({
        nama_divisi: 'Divisi Pendidikan',
        aspek_pemantauan: '',
        persentase_capaian: 80,
        status_pemantauan: 'proses',
        tanggal_pemantauan: new Date().toISOString().split('T')[0],
        catatan: '',
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  const validate = () => {
    const errs = {}
    if (!formData.nama_divisi?.trim()) errs.nama_divisi = 'Nama divisi wajib diisi.'
    if (!formData.aspek_pemantauan?.trim()) errs.aspek_pemantauan = 'Aspek pemantauan wajib diisi.'
    if (formData.persentase_capaian < 0 || formData.persentase_capaian > 100) {
      errs.persentase_capaian = 'Persentase harus berada di rentang 0 - 100.'
    }
    if (!formData.tanggal_pemantauan) errs.tanggal_pemantauan = 'Tanggal pemantauan wajib diisi.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      ...formData,
      persentase_capaian: Number(formData.persentase_capaian),
    })
  }

  if (!isOpen) return null

  return (
    <OverlayWrapper isOpen={isOpen}>
      <Backdrop onDismiss={onClose}>
        <Dialog showCloseButton={false} className="max-w-xl w-full p-6 bg-white dark:bg-[#1B2433] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 relative">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              <span>Input Monitoring Divisi</span>
            </div>
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              {isEditMode ? 'Ubah Data Pemantauan Divisi' : 'Tambah Pemantauan Divisi Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Isi formulir hasil supervisi dan monitoring kinerja divisi pendidikan / unit kerja sekolah.
            </DialogDescription>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Tutup Modal"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 my-2">
            <DialogBody className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
              {/* Nama Divisi & Tanggal Pemantauan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="nama_divisi" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Nama Divisi <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <Select
                    value={formData.nama_divisi}
                    onChange={(val) => setFormData({ ...formData, nama_divisi: String(val) })}
                  >
                    <SelectTrigger className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <SelectValue placeholder="Pilih Divisi..." />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
                      {DIVISI_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} id={opt.id} className="text-xs font-semibold py-2">
                          {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.nama_divisi && <p className="text-[11px] font-bold text-rose-500">{errors.nama_divisi}</p>}
                </div>

                <TextField className="space-y-1.5" isInvalid={Boolean(errors.tanggal_pemantauan)}>
                  <FieldLabel htmlFor="tanggal_pemantauan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Tanggal Pemantauan <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <Input
                    id="tanggal_pemantauan"
                    type="date"
                    value={formData.tanggal_pemantauan}
                    onChange={(e) => setFormData({ ...formData, tanggal_pemantauan: e.target.value })}
                    className="h-10 rounded-xl text-xs font-bold"
                  />
                  {errors.tanggal_pemantauan && <FieldError className="text-[11px] font-bold text-rose-500">{errors.tanggal_pemantauan}</FieldError>}
                </TextField>
              </div>

              {/* Aspek Pemantauan */}
              <TextField className="space-y-1.5" isInvalid={Boolean(errors.aspek_pemantauan)}>
                <FieldLabel htmlFor="aspek_pemantauan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Aspek Pemantauan <span className="text-rose-500">*</span>
                </FieldLabel>
                <Input
                  id="aspek_pemantauan"
                  type="text"
                  placeholder="Contoh: Kepatuhan Silabus & Modul Ajar, Presensi Guru, Target Hafalan"
                  value={formData.aspek_pemantauan}
                  onChange={(e) => setFormData({ ...formData, aspek_pemantauan: e.target.value })}
                  className="h-10 rounded-xl text-xs font-bold"
                />
                {errors.aspek_pemantauan ? (
                  <FieldError className="text-[11px] font-bold text-rose-500">{errors.aspek_pemantauan}</FieldError>
                ) : (
                  <FieldDescription className="text-[11px] text-slate-400">Tentukan indikator atau aspek utama yang diawasi.</FieldDescription>
                )}
              </TextField>

              {/* Persentase Capaian & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField className="space-y-1.5" isInvalid={Boolean(errors.persentase_capaian)}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="persentase_capaian" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Persentase Capaian (%) <span className="text-rose-500">*</span>
                    </FieldLabel>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formData.persentase_capaian}%
                    </span>
                  </div>
                  <Input
                    id="persentase_capaian"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.persentase_capaian}
                    onChange={(e) => setFormData({ ...formData, persentase_capaian: e.target.value })}
                    className="h-10 rounded-xl text-xs font-bold"
                  />
                  {errors.persentase_capaian && <FieldError className="text-[11px] font-bold text-rose-500">{errors.persentase_capaian}</FieldError>}
                </TextField>

                <div className="space-y-1.5">
                  <FieldLabel htmlFor="status_pemantauan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Status Pemantauan <span className="text-rose-500">*</span>
                  </FieldLabel>
                  <Select
                    value={formData.status_pemantauan}
                    onChange={(val) => setFormData({ ...formData, status_pemantauan: String(val) })}
                  >
                    <SelectTrigger className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <SelectValue placeholder="Pilih Status..." />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} id={opt.id} className="text-xs font-semibold py-2">
                          {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Catatan / Ringkasan Evaluasi */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="catatan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Catatan & Evaluasi Supervisi
                </FieldLabel>
                <InputGroupTextarea
                  id="catatan"
                  rows={3}
                  placeholder="Tuliskan catatan hasil pemantauan, kendala, atau rekomendasi perbaikan..."
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
            </DialogBody>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                appearance="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="cursor-pointer font-bold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                appearance="fill"
                size="sm"
                pending={isSubmitting}
                className="cursor-pointer font-bold"
              >
                <Save className="h-4 w-4 mr-1.5" />
                {isEditMode ? 'Simpan Perubahan' : 'Tambah Pemantauan'}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      </Backdrop>
    </OverlayWrapper>
  )
}
