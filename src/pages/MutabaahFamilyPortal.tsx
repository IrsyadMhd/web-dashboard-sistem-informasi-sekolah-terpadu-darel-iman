import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookHeart, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3,
  Edit3, History, MessageSquareText, Printer, RotateCcw, Search, ShieldCheck,
  Signature, UserRound, Users, X, XCircle, Zap,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { Download1 } from '@tailgrids/icons'
import { mutabaahService } from '../services/mutabaahService'
import MutabaahSubNav from '../components/mutabaah/MutabaahSubNav'
import {
  MasterDataPage,
  MasterStatCard,
  MasterStatsGrid,
  PrintOptionModal,
} from '../components/master-data'
import { Button } from '@/components/tailgrids/core/button'
import { useAuthStore } from '../stores/authStore'
import { downloadPdfTable, printCleanTable } from '../utils/printHelper'
import './MutabaahFamilyPortal.css'

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

type Mode = 'parent' | 'student'
const today = () => new Date().toLocaleDateString('en-CA')
const statusMeta: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  good: { label: 'Baik', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 },
  less: { label: 'Kurang', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', icon: Clock3 },
  not_done: { label: 'Belum', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', icon: XCircle },
  na: { label: 'N/A', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', icon: Clock3 },
}

export default function MutabaahFamilyPortal({ mode }: { mode: Mode }) {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const isStaff = roles.some((r: any) =>
    typeof r === 'string' && /admin|kepala sekolah|guru|musyrif|tata usaha|\btu\b/i.test(r)
  ) || roles.includes('Super Admin')

  const [date, setDate] = useState(today)
  const [studentId, setStudentId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [classId, setClassId] = useState('')
  const [search, setSearch] = useState('')
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)

  // Master options (units, classes) for staff filtering
  const optionsQuery = useQuery({
    queryKey: ['mutabaah-portal-options'],
    queryFn: () => mutabaahService.options(),
    enabled: isStaff,
  })

  // Children query
  const children = useQuery({
    queryKey: ['parent-mutabaah-children', unitId, classId, search],
    queryFn: () => mutabaahService.parentChildren({ unit_id: unitId, class_id: classId, search }),
    enabled: mode === 'parent' || isStaff,
  })

  useEffect(() => {
    if (!studentId && children.data?.[0]?.id) setStudentId(children.data[0].id)
  }, [children.data, studentId])

  const enabled = mode === 'student' || Boolean(studentId)
  const overview = useQuery({
    queryKey: ['family-mutabaah', mode, studentId, date],
    queryFn: () => (mode === 'parent' || isStaff ? mutabaahService.parentMutabaah(studentId, { date }) : mutabaahService.studentMutabaah({ date })),
    enabled,
    placeholderData: keepPreviousData,
  })

  const history = useQuery({
    queryKey: ['family-mutabaah-history', mode, studentId],
    queryFn: () => (mode === 'parent' || isStaff ? mutabaahService.parentHistory(studentId) : mutabaahService.studentMutabaahHistory()),
    enabled,
  })

  const data = overview.data

  const changeDay = (offset: number) => {
    const current = new Date(`${date}T12:00:00`)
    current.setDate(current.getDate() + offset)
    setDate(current.toLocaleDateString('en-CA'))
  }

  const sign = useMutation({
    mutationFn: ({ id, payload }: any) => mutabaahService.parentSignature(id, payload),
    onSuccess: (result) => {
      setSignatureOpen(false)
      queryClient.invalidateQueries({ queryKey: ['family-mutabaah'] })
      Swal.fire({ icon: 'success', title: 'Paraf tersimpan', text: result.message, timer: 1500, showConfirmButton: false })
    },
    onError: showError,
  })

  const updateNote = useMutation({
    mutationFn: ({ notes }: { notes: string }) => mutabaahService.finalizeStudent({ student_id: studentId, supervisor_notes: notes }),
    onSuccess: (result) => {
      setNoteOpen(false)
      queryClient.invalidateQueries({ queryKey: ['family-mutabaah'] })
      Swal.fire({ icon: 'success', title: 'Catatan tersimpan', text: result?.message || 'Catatan pembimbing berhasil diperbarui.', timer: 1500, showConfirmButton: false })
    },
    onError: showError,
  })

  const handlePrint = (type: 'clean' | 'pdf') => {
    setPrintModalOpen(false)
    const activeStudent = children.data?.find((c: any) => String(c.id) === String(studentId)) || data?.student
    const studentName = activeStudent?.name || 'Santri'

    const columns = [
      { key: 'category', label: 'Kategori' },
      { key: 'name', label: 'Nama Agenda' },
      { key: 'status_label', label: 'Status' },
      { key: 'notes', label: 'Catatan' },
    ]

    const rows = (data?.today?.details || []).map((item: any) => ({
      category: item.category || '-',
      name: item.name || '-',
      status_label: statusMeta[item.status_value]?.label || 'Belum',
      notes: item.notes || '-',
    }))

    const payload = {
      title: `Laporan Mutaba'ah - ${studentName}`,
      subtitle: `Tanggal: ${new Date(`${date}T12:00:00`).toLocaleDateString('id-ID', { dateStyle: 'full' })}`,
      headers: columns.map((c) => c.label),
      rows: rows.map((r: any) => columns.map((c) => String(r[c.key] || '-'))),
    }

    if (type === 'clean') {
      printCleanTable(payload)
    } else {
      downloadPdfTable({ ...payload, filename: `Mutabaah_${studentName}_${date}.pdf` })
    }
  }

  return (
    <MasterDataPage className="education-unit-page mutabaah-parent-monitoring-page" hideBreadcrumb>
      {/* 📊 KPI CARDS GRID */}
      <MasterStatsGrid>
        <MasterStatCard
          icon={Users}
          label="Total Santri Terhubung"
          value={children.data?.length || (data?.student ? 1 : 0)}
          description={isStaff ? 'Santri terpilih / binaan' : 'Anak terdaftar di portal'}
          variant="info"
          delay={40}
        />
        <MasterStatCard
          icon={CheckCircle2}
          label="Pencapaian Hari Ini"
          value={`${Math.round(data?.today?.score || 0)}%`}
          description="Capaian amalan ibadah harian"
          variant="success"
          delay={80}
        />
        <MasterStatCard
          icon={Signature}
          label="Status Paraf Ortu"
          value={data?.today?.signature ? 'Sudah Diparaf' : 'Menunggu Paraf'}
          description={data?.today?.signature ? `Jenis: ${data.today.signature.signature_status}` : 'Belum dikonfirmasi ortu'}
          variant={data?.today?.signature ? 'success' : 'warning'}
          delay={120}
        />
        <MasterStatCard
          icon={History}
          label="Riwayat Mutabaah"
          value={history.data?.rows?.data?.length || 0}
          description="Hari difinalisasi tersimpan"
          variant="info"
          delay={160}
        />
      </MasterStatsGrid>

      {/* 🧭 SUB NAV */}
      <MutabaahSubNav />

      {/* 🟢 MAIN WORKSPACE CARD (ANIMATED CONTAINER) */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] space-y-5"
      >
        {/* BARIS 1: TITLE & ACTION BUTTONS */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
              {isStaff ? 'Supervisi & Monitoring Sekolah (Kepala Sekolah / Musyrif / Admin / TU)' : 'Portal Monitoring Orang Tua'}
            </span>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Monitoring Mutaba’ah Yaumiyyah</h1>
            <p className="text-xs text-slate-400">
              {isStaff
                ? 'Pantau pembiasaan ibadah harian seluruh santri, cek status paraf orang tua, dan beri catatan supervisi pembimbing.'
                : 'Pantau pembiasaan ibadah harian santri, rekap mingguan/bulanan, dan berikan paraf persetujuan.'}
            </p>
          </div>

          {/* SOFT PASTEL SQUIRCLE ACTION BUTTONS WITH SPRING MICRO-ANIMATION & HOVER TOOLTIPS */}
          <div className="flex items-center gap-2">
            {/* PRINT BUTTON */}
            <div className="group relative inline-flex">
              <motion.button
                type="button"
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => setPrintModalOpen(true)}
                className="flex size-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 shadow-2xs cursor-pointer"
                title="Cetak Data"
                aria-label="Cetak Data"
              >
                <Printer className="size-5" />
              </motion.button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Cetak Data
              </div>
            </div>

            {/* EXPORT BUTTON */}
            <div className="group relative inline-flex">
              <motion.button
                type="button"
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => handlePrint('pdf')}
                className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 shadow-2xs cursor-pointer"
                title="Export PDF"
                aria-label="Export PDF"
              >
                <Download1 className="size-5" />
              </motion.button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Export PDF
              </div>
            </div>

            {/* MUSYRIF / STAFF NOTE ACTION BUTTON */}
            {isStaff && data?.today && (
              <div className="group relative inline-flex">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => setNoteOpen(true)}
                  className="flex size-10 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 hover:bg-cyan-600 hover:text-white dark:bg-cyan-950/60 dark:text-cyan-300 dark:hover:bg-cyan-600 dark:hover:text-white transition-colors duration-200 shadow-2xs cursor-pointer"
                  title="Catatan Pembimbing / Musyrif"
                  aria-label="Catatan Pembimbing / Musyrif"
                >
                  <Edit3 className="size-5" />
                </motion.button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  Edit Catatan Pembimbing
                </div>
              </div>
            )}

            {/* PARAF ACTION BUTTON */}
            {mode === 'parent' && data?.today && (
              <div className="group relative inline-flex">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => setSignatureOpen(true)}
                  className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 shadow-2xs cursor-pointer"
                  title="Beri Paraf Ortu"
                  aria-label="Beri Paraf Ortu"
                >
                  <Signature className="size-5" />
                </motion.button>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                  <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                  Beri Paraf Ortu
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* BARIS 2: CONTROLS & FILTERS */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[280px]">
            {/* UNIT FILTER */}
            {isStaff && optionsQuery.data?.units?.length > 0 && (
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
              >
                <option value="">Semua Unit</option>
                {optionsQuery.data.units.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}

            {/* INPUT PENCARIAN NAMA SANTRI / NIS */}
            {isStaff && (
              <div className="relative min-w-[180px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari Nama Santri / NIS..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            )}

            {/* SANTRI SELECT DROPDOWN */}
            <div className="flex-1 min-w-[200px] max-w-sm">
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
              >
                {!children.data?.length ? (
                  <option value="">{children.isLoading ? 'Memuat data santri...' : '-- Tidak Ada Data Santri --'}</option>
                ) : (
                  <option value="">-- Pilih Santri --</option>
                )}
                {children.data?.map((child: any) => (
                  <option key={child.id} value={child.id}>
                    {child.name} · Kelas {child.class_name || '-'} ({child.unit || '-'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => changeDay(-1)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                title="Hari Sebelumnya"
              >
                <ChevronLeft className="size-4" />
              </motion.button>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => changeDay(1)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                title="Hari Berikutnya"
              >
                <ChevronRight className="size-4" />
              </motion.button>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDate(today())
                setUnitId('')
                setClassId('')
                setSearch('')
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <RotateCcw className="size-3.5" /> Reset
            </motion.button>
          </div>
        </motion.div>

        {/* LOADING & ERROR STATES */}
        {(overview.isLoading || children.isLoading) && <PortalSkeleton />}
        {overview.isError && <ErrorState retry={() => overview.refetch()} />}

        {/* CONTENT WITH STAGGERED ITEM VARIANTS */}
        {!overview.isLoading && data && (
          <motion.div variants={containerVariants} className="space-y-5">
            {/* STUDENT SUMMARY HEADER CARD */}
            <motion.div variants={itemVariants}>
              <StudentSummary data={data} />
            </motion.div>

            {/* REKAP MINGGUAN & BULANAN GRID */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProgressCard title="Rekap Mingguan" data={data.weekly} />
              <ProgressCard title="Rekap Bulanan" data={data.monthly} />
            </motion.div>

            {/* AGENDA HARI INI */}
            {data.today ? (
              <>
                <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Agenda Mutabaah Hari Ini</h3>
                      <p className="text-xs text-slate-400">
                        {new Date(`${data.date}T12:00:00`).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                      </p>
                    </div>
                    <ProgressRing value={Number(data.today.score || 0)} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.today.details.map((item: any) => {
                      const meta = statusMeta[item.status_value] || statusMeta.na
                      const StatusIcon = meta.icon
                      return (
                        <motion.div
                          key={item.id}
                          whileHover={{ y: -2, scale: 1.02 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40"
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${meta.bg} ${meta.text}`}>
                            <StatusIcon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{item.category}</span>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</h4>
                            {item.notes && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.notes}</p>}
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.bg} ${meta.text}`}>
                            {meta.label}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>

                {/* CATATAN MUSYRIF / SUPERVISI */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                      <MessageSquareText className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">Catatan Pembimbing / Musyrif / Kepala Sekolah</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {data.today.notes || 'Belum ada catatan pembimbing untuk hari ini.'}
                      </p>
                    </div>
                  </div>
                  {isStaff && (
                    <Button variant="ghost" size="xs" onClick={() => setNoteOpen(true)}>
                      <Edit3 className="size-3.5 mr-1" /> Edit Catatan
                    </Button>
                  )}
                </motion.div>

                {/* PARAF ORANG TUA (STATUS & CONFIRMATION) */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 shrink-0">
                      <Signature className="size-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Paraf Persetujuan Orang Tua</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                        {data.today.signature
                          ? `Diparaf pada ${new Date(data.today.signature.signed_at).toLocaleString('id-ID')} · Status: ${data.today.signature.signature_status}`
                          : 'Menunggu konfirmasi dan paraf dari Orang Tua'}
                      </p>
                      {data.today.signature?.comment && (
                        <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium italic mt-1">
                          Pesan Ortu: "{data.today.signature.comment}"
                        </p>
                      )}
                    </div>
                  </div>

                  {mode === 'parent' && (
                    <Button variant="primary" size="sm" onClick={() => setSignatureOpen(true)}>
                      {data.today.signature ? 'Perbarui Paraf' : 'Beri Paraf Persetujuan'}
                    </Button>
                  )}
                </motion.div>
              </>
            ) : (
              <EmptyState />
            )}

            {/* RIWAYAT HARIAN TIMELINE */}
            <motion.div variants={itemVariants}>
              <HistoryTimeline rows={history.data?.rows?.data || []} />
            </motion.div>
          </motion.div>
        )}

        {/* MODAL PARAF ORANG TUA (WITH ANIMATE PRESENCE SPRING POPUP) */}
        <AnimatePresence>
          {signatureOpen && data?.today && (
            <SignatureSheet
              close={() => setSignatureOpen(false)}
              submit={(payload: any) => sign.mutate({ id: data.today.id, payload })}
              saving={sign.isPending}
            />
          )}
        </AnimatePresence>

        {/* MODAL CATATAN PEMBIMBING (WITH ANIMATE PRESENCE SPRING POPUP) */}
        <AnimatePresence>
          {noteOpen && data?.today && (
            <NoteSheet
              close={() => setNoteOpen(false)}
              initialNote={data.today.notes || ''}
              submit={(notes: string) => updateNote.mutate({ notes })}
              saving={updateNote.isPending}
            />
          )}
        </AnimatePresence>

        {/* MODAL CETAK DATA */}
        {printModalOpen && (
          <PrintOptionModal
            isOpen={printModalOpen}
            onClose={() => setPrintModalOpen(false)}
            onPrintClean={() => handlePrint('clean')}
            onDownloadPdf={() => handlePrint('pdf')}
          />
        )}
      </motion.section>
    </MasterDataPage>
  )
}

function StudentSummary({ data }: any) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433] flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3.5">
        {data.student.photo ? (
          <img src={data.student.photo} alt={data.student.name} className="h-12 w-12 rounded-2xl object-cover border border-slate-200" />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-sm dark:bg-emerald-950 dark:text-emerald-300">
            {data.student.name?.slice(0, 2)?.toUpperCase() || <UserRound className="size-6" />}
          </div>
        )}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profil Santri</span>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{data.student.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            NIS: {data.student.nis} · Kelas: {data.student.class_name || '-'} · Unit: {data.student.unit || '-'}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <ProgressRing value={Number(data.today?.score || 0)} />
      </div>
    </motion.div>
  )
}

function ProgressCard({ title, data }: any) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 mb-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{data.score}%</span>
      </div>
      <p className="text-[11px] text-slate-400 mb-3">{data.days} hari tercatat dalam periode</p>
      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <span>Baik</span>
          <p className="text-xs font-black mt-0.5">{data.good}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <span>Kurang</span>
          <p className="text-xs font-black mt-0.5">{data.less}</p>
        </div>
        <div className="rounded-xl bg-rose-50 p-2 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          <span>Belum</span>
          <p className="text-xs font-black mt-0.5">{data.not_done}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <span>N/A</span>
          <p className="text-xs font-black mt-0.5">{data.na}</p>
        </div>
      </div>
    </motion.div>
  )
}

function ProgressRing({ value }: { value: number }) {
  const rounded = Math.round(value)
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 px-3.5 py-2 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50">
      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{rounded}%</span>
      <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Skor Total</span>
    </div>
  )
}

function HistoryTimeline({ rows }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1B2433]">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">
        <History className="size-4 text-[#0E5C44] dark:text-emerald-400" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Riwayat Mutabaah Harian</h3>
      </div>
      <div className="space-y-2.5">
        {rows.map((row: any) => (
          <motion.div
            key={row.id}
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
          >
            <div className="flex items-center gap-3">
              <span className={`size-2.5 rounded-full ${row.parent_signed ? 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950' : 'bg-slate-300 dark:bg-slate-600'}`} />
              <div>
                <b className="block font-bold text-slate-800 dark:text-slate-200">
                  {new Date(row.activity_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </b>
                <p className="text-[10px] text-slate-400">
                  Baik {row.good_count} · Kurang {row.less_count} · Belum {row.not_done_count} · N/A {row.na_count}
                </p>
                {row.supervisor_notes && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 italic">"{row.supervisor_notes}"</p>
                )}
              </div>
            </div>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{row.score || 0}%</span>
          </motion.div>
        ))}
        {!rows.length && <p className="text-xs text-slate-400 text-center py-4">Belum ada riwayat mutabaah yang difinalisasi.</p>}
      </div>
    </div>
  )
}

function SignatureSheet({ close, submit, saving }: any) {
  const [status, setStatus] = useState('approved')
  const [comment, setComment] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Fade Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onMouseDown={close}
      />

      {/* Modal with Spring Physics Pop-up */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">
          <div>
            <span className="text-[10px] font-bold text-[#0E5C44] dark:text-emerald-400 uppercase tracking-wider">Konfirmasi Orang Tua</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Paraf Mutaba’ah Yaumiyyah</h3>
          </div>
          <button type="button" onClick={close} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submit({ signature_status: status, comment: comment || null, device_info: { platform: navigator.platform, app: 'SIMSIT Web' } }) }} className="space-y-4">
          <div className="space-y-2">
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${status === 'approved' ? 'border-[#0E5C44] bg-emerald-50/50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
              <input type="radio" value="approved" checked={status === 'approved'} onChange={(e) => setStatus(e.target.value)} className="mt-0.5 text-emerald-600 focus:ring-emerald-500" />
              <div>
                <b className="block text-xs text-slate-900 dark:text-white">Setujui & Beri Paraf</b>
                <small className="text-[10px] text-slate-400">Saya telah memeriksa hasil mutabaah harian anak.</small>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${status === 'clarification_requested' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
              <input type="radio" value="clarification_requested" checked={status === 'clarification_requested'} onChange={(e) => setStatus(e.target.value)} className="mt-0.5 text-amber-600 focus:ring-amber-500" />
              <div>
                <b className="block text-xs text-slate-900 dark:text-white">Minta Klarifikasi</b>
                <small className="text-[10px] text-slate-400">Memerlukan penjelaskan lebih lanjut dari pembimbing.</small>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${status === 'unable_to_verify' ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
              <input type="radio" value="unable_to_verify" checked={status === 'unable_to_verify'} onChange={(e) => setStatus(e.target.value)} className="mt-0.5 text-rose-600 focus:ring-rose-500" />
              <div>
                <b className="block text-xs text-slate-900 dark:text-white">Tidak Dapat Memverifikasi</b>
                <small className="text-[10px] text-slate-400">Data belum dapat saya pastikan kebenarannya.</small>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Tuliskan pesan untuk pembimbing..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button appearance="outline" size="sm" type="button" onClick={close}>Batal</Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Konfirmasi Paraf'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function NoteSheet({ close, initialNote, submit, saving }: any) {
  const [note, setNote] = useState(initialNote)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Fade Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onMouseDown={close}
      />

      {/* Modal with Spring Physics Pop-up */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">
          <div>
            <span className="text-[10px] font-bold text-[#0E5C44] dark:text-emerald-400 uppercase tracking-wider">Supervisi Sekolah</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Catatan Pembimbing / Musyrif</h3>
          </div>
          <button type="button" onClick={close} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submit(note) }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pesan / Evaluasi Musyrif untuk Santri & Orang Tua</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Tuliskan evaluasi amalan ibadah santri hari ini..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button appearance="outline" size="sm" type="button" onClick={close}>Batal</Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Catatan'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function PortalSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 w-full rounded-2xl bg-slate-100 dark:bg-slate-800" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 dark:border-slate-800 dark:bg-[#1B2433]">
      <BookHeart className="size-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada hasil hari ini</h3>
      <p className="text-[11px] text-slate-400 mt-0.5">Hasil mutabaah akan tampil setelah pembimbing/musyrif mencatat amalan santri.</p>
    </div>
  )
}

function ErrorState({ retry }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-rose-500 dark:border-slate-800 dark:bg-[#1B2433]">
      <XCircle className="size-8 mx-auto mb-2 text-rose-400" />
      <h3 className="text-xs font-bold">Data gagal dimuat</h3>
      <p className="text-[11px] text-slate-400 mt-0.5">Silakan periksa koneksi dan coba kembali.</p>
      <Button appearance="outline" size="sm" className="mt-3" onClick={retry}>Coba Lagi</Button>
    </div>
  )
}

function showError(error: any) {
  Swal.fire({ icon: 'error', title: 'Tidak dapat menyimpan', text: error?.response?.data?.message || 'Terjadi kesalahan.', confirmButtonColor: '#0E5C44' })
}
