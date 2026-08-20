import React, { useState, useEffect } from 'react'
import { Layers, Save, X, Lock, ShieldCheck, UserCheck, Calendar, Percent } from 'lucide-react'
import { OverlayWrapper, Backdrop } from '@/components/tailgrids/core/overlay'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
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
import { Badge } from '@/components/tailgrids/core/badge'

const DIVISI_OPTIONS = [
  { id: 'Divisi Al-Qur\'an / Tahfidz', name: 'Divisi Al-Qur\'an / Tahfidz' },
  { id: 'Divisi Kesiswaan & BPI', name: 'Divisi Kesiswaan & Bina Pribadi Islami (BPI)' },
  { id: 'Divisi Kurikulum / Akademik', name: 'Divisi Kurikulum / Akademik' },
  { id: 'Divisi Sarana & Prasarana', name: 'Divisi Sarana & Prasarana (Sarpras)' },
  { id: 'Divisi Keasramaan / Musyrif', name: 'Divisi Keasramaan / Musyrif' },
  { id: 'Divisi Bahasa', name: 'Divisi Bahasa (Arab & Inggris)' },
  { id: 'Tata Usaha', name: 'Tata Usaha & Administrasi' },
  { id: 'HRD & Kepegawaian', name: 'HRD & Kepegawaian' },
  { id: 'Keuangan', name: 'Keuangan & Syariah' },
]

const KATEGORI_SIT_OPTIONS = [
  { id: 'Target Program Harian/Mingguan', name: 'Target Program Harian / Mingguan' },
  { id: 'Pembiasaan Karakter Islami (Amal Yaumi)', name: 'Pembiasaan Karakter Islami (Amal Yaumi)' },
  { id: 'Integrasi Kurikulum & Rapor Diniyah', name: 'Integrasi Kurikulum & Rapor Diniyah' },
  { id: 'Pemeliharaan Aset & Logistik Sarpras', name: 'Pemeliharaan Aset & Logistik Sarpras' },
  { id: 'Kedisiplinan & Ketertiban', name: 'Kedisiplinan & Ketertiban' },
]

const UNIT_OPTIONS = [
  { id: 'SD IT', name: 'SD IT' },
  { id: 'SMP IT', name: 'SMP IT' },
  { id: 'SMA IT', name: 'SMA IT' },
  { id: 'Pondok Pesantren', name: 'Pondok Pesantren / Ponpes' },
  { id: 'TK IT', name: 'TK IT' },
]

const STATUS_OPTIONS = [
  { id: 'proses', name: 'Dalam Proses' },
  { id: 'tercapai', name: 'Tercapai (Sesuai Target)' },
  { id: 'terlambat', name: 'Terlambat (Perlu Tindak Lanjut)' },
  { id: 'belum_tercapai', name: 'Belum Tercapai' },
]

export default function PemantauanDivisiFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  currentUserUnit = 'SD IT',
  isUnitRestricted = false,
}) {
  const isEditMode = Boolean(initialData?.id)

  const [formData, setFormData] = useState({
    unit_pendidikan: currentUserUnit,
    nama_divisi: 'Divisi Al-Qur\'an / Tahfidz',
    kategori_laporan: 'Target Program Harian/Mingguan',
    aspek_pemantauan: '',
    persentase_capaian: 80,
    status_pemantauan: 'proses',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    petugas_supervisi: '',
    catatan: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        unit_pendidikan: initialData.unit_pendidikan || currentUserUnit,
        nama_divisi: initialData.nama_divisi || 'Divisi Al-Qur\'an / Tahfidz',
        kategori_laporan: initialData.kategori_laporan || 'Target Program Harian/Mingguan',
        aspek_pemantauan: initialData.aspek_pemantauan || '',
        persentase_capaian: initialData.persentase_capaian !== undefined ? Number(initialData.persentase_capaian) : 80,
        status_pemantauan: initialData.status_pemantauan || 'proses',
        tanggal_pemantauan: initialData.tanggal_pemantauan
          ? new Date(initialData.tanggal_pemantauan).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        petugas_supervisi: initialData.petugas_supervisi || '',
        catatan: initialData.catatan || '',
      })
    } else {
      setFormData({
        unit_pendidikan: isUnitRestricted ? currentUserUnit : 'SD IT',
        nama_divisi: 'Divisi Al-Qur\'an / Tahfidz',
        kategori_laporan: 'Target Program Harian/Mingguan',
        aspek_pemantauan: '',
        persentase_capaian: 80,
        status_pemantauan: 'proses',
        tanggal_pemantauan: new Date().toISOString().split('T')[0],
        petugas_supervisi: '',
        catatan: '',
      })
    }
    setErrors({})
  }, [initialData, isOpen, currentUserUnit, isUnitRestricted])

  const validate = () => {
    const errs = {}
    if (!formData.unit_pendidikan?.trim()) errs.unit_pendidikan = 'Unit pendidikan wajib dipilih.'
    if (!formData.nama_divisi?.trim()) errs.nama_divisi = 'Nama divisi wajib dipilih.'
    if (!formData.aspek_pemantauan?.trim()) errs.aspek_pemantauan = 'Aspek pemantauan wajib diisi.'
    if (formData.persentase_capaian < 0 || formData.persentase_capaian > 100) {
      errs.persentase_capaian = 'Persentase harus di antara 0 - 100.'
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

  const capVal = Number(formData.persentase_capaian) || 0
  const progressBgClass = capVal >= 80 ? 'bg-emerald-500' : capVal >= 50 ? 'bg-amber-500' : 'bg-rose-500'

  return (
    <OverlayWrapper isOpen={isOpen}>
      <Backdrop onDismiss={onClose}>
        <Dialog showCloseButton={false} className="max-w-2xl w-full p-6 bg-white dark:bg-[#1B2433] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 relative">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              <span>Input & Monitoring Divisi SIT</span>
            </div>
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              {isEditMode ? 'Ubah Laporan Monitoring Divisi' : 'Input Data Monitoring Divisi Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Masukkan data riil capaian target program kerja, pembiasaan karakter, dan pengawasan divisi operasional.
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
            <DialogBody className="space-y-4 py-2 max-h-[72vh] overflow-y-auto pr-1">
              {/* Unit Pendidikan & Access Scope Notification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="unit_pendidikan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Unit Pendidikan <span className="text-rose-500">*</span>
                    </FieldLabel>
                    {isUnitRestricted ? (
                      <Badge color="warning" size="sm" prefixIcon={<Lock className="h-3 w-3" />}>
                        Unit Terkunci
                      </Badge>
                    ) : (
                      <Badge color="cyan" size="sm" prefixIcon={<ShieldCheck className="h-3 w-3" />}>
                        Semua Unit (Yayasan)
                      </Badge>
                    )}
                  </div>
                  {isUnitRestricted ? (
                    <div className="h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
                      <span>{formData.unit_pendidikan}</span>
                      <Lock className="h-4 w-4 text-amber-500" />
                    </div>
                  ) : (
                    <Select
                      value={formData.unit_pendidikan}
                      onChange={(val) => setFormData({ ...formData, unit_pendidikan: String(val) })}
                    >
                      <SelectTrigger className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <SelectValue placeholder="Pilih Unit..." />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
                        {UNIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.id} id={opt.id} className="text-xs font-semibold py-2">
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.unit_pendidikan && <p className="text-[11px] font-bold text-rose-500">{errors.unit_pendidikan}</p>}
                </div>

                {/* Tanggal Pemantauan */}
                <TextField className="space-y-1.5" isInvalid={Boolean(errors.tanggal_pemantauan)}>
                  <FieldLabel htmlFor="tanggal_pemantauan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Tanggal Laporan / Supervisi <span className="text-rose-500">*</span>
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

              {/* Nama Divisi & Kategori Laporan SIT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="nama_divisi" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Pilih Divisi yang Dilaporkan <span className="text-rose-500">*</span>
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

                <div className="space-y-1.5">
                  <FieldLabel htmlFor="kategori_laporan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Kategori Program SIT
                  </FieldLabel>
                  <Select
                    value={formData.kategori_laporan}
                    onChange={(val) => setFormData({ ...formData, kategori_laporan: String(val) })}
                  >
                    <SelectTrigger className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <SelectValue placeholder="Pilih Kategori..." />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
                      {KATEGORI_SIT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} id={opt.id} className="text-xs font-semibold py-2">
                          {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Aspek Pemantauan / Indikator Kerja */}
              <TextField className="space-y-1.5" isInvalid={Boolean(errors.aspek_pemantauan)}>
                <FieldLabel htmlFor="aspek_pemantauan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Aspek / Indikator Pemantauan <span className="text-rose-500">*</span>
                </FieldLabel>
                <Input
                  id="aspek_pemantauan"
                  type="text"
                  placeholder="Contoh: Progres Ziyadah & Murajaah Harian, Monitoring Amal Yaumi, Ketuntasan Silabus, Audit Sarpras"
                  value={formData.aspek_pemantauan}
                  onChange={(e) => setFormData({ ...formData, aspek_pemantauan: e.target.value })}
                  className="h-10 rounded-xl text-xs font-bold"
                />
                {errors.aspek_pemantauan ? (
                  <FieldError className="text-[11px] font-bold text-rose-500">{errors.aspek_pemantauan}</FieldError>
                ) : (
                  <FieldDescription className="text-[11px] text-slate-400">Tentukan indikator konkret atau program kerja divisi yang dilaporkan.</FieldDescription>
                )}
              </TextField>

              {/* Persentase Capaian & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField className="space-y-1.5" isInvalid={Boolean(errors.persentase_capaian)}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="persentase_capaian" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Persentase Capaian Target (%) <span className="text-rose-500">*</span>
                    </FieldLabel>
                    <span className={`text-xs font-extrabold ${capVal >= 80 ? 'text-emerald-600' : capVal >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {capVal}%
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
                  {/* Progress Bar Live Indicator */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className={`h-full rounded-full transition-all duration-300 ${progressBgClass}`} style={{ width: `${Math.min(Math.max(capVal, 0), 100)}%` }} />
                  </div>
                  {errors.persentase_capaian && <FieldError className="text-[11px] font-bold text-rose-500">{errors.persentase_capaian}</FieldError>}
                </TextField>

                <div className="space-y-1.5">
                  <FieldLabel htmlFor="status_pemantauan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Status Supervisi <span className="text-rose-500">*</span>
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

              {/* Petugas Supervisi */}
              <TextField className="space-y-1.5">
                <FieldLabel htmlFor="petugas_supervisi" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Petugas Supervisi / Penanggung Jawab Laporan
                </FieldLabel>
                <Input
                  id="petugas_supervisi"
                  type="text"
                  placeholder="Contoh: Ustadz Hamzah, S.Pd.I / Tim Pengawas Divisi"
                  value={formData.petugas_supervisi}
                  onChange={(e) => setFormData({ ...formData, petugas_supervisi: e.target.value })}
                  className="h-10 rounded-xl text-xs font-bold"
                />
              </TextField>

              {/* Catatan / Ringkasan Evaluasi */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="catatan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Catatan Pengawasan & Rekomendasi Tindak Lanjut
                </FieldLabel>
                <InputGroupTextarea
                  id="catatan"
                  rows={3}
                  placeholder="Tuliskan data riil di lapangan, kendala, atau rekomendasi perbaikan untuk Pimpinan / Kepala Sekolah / Yayasan..."
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
                {isEditMode ? 'Simpan Perubahan Laporan' : 'Simpan Monitoring Divisi'}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      </Backdrop>
    </OverlayWrapper>
  )
}
