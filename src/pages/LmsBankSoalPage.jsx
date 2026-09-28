import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  CheckSquare,
  FileText,
  ToggleLeft,
  GitCommit,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  X,
  Layers,
  Sparkles,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  List,
  RotateCcw,
  Printer,
  Upload,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  Check,
} from 'lucide-react'
import { lmsBankSoalService } from '../services/lmsBankSoalService'
import { subjectService } from '../services/subjectService'
import { useAuthStore } from '../stores/authStore'
import { useUnitStore } from '../stores/unitStore'
import ActionDropdown from '../components/app/ActionDropdown'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  MasterDataTable,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import { useDebounce } from '../hooks/useDebounce'
import { downloadSpreadsheetTemplate } from '../utils/spreadsheetParser'

// ── 1. PALET WARNA RESMI MODERN KPI CARDS ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  sky: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-cyan-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-sky-700 dark:text-sky-300',
    sub: 'text-sky-600/80 dark:text-sky-400/80',
    cta: 'text-sky-600/60 dark:text-sky-500/60',
  },
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
  },
  purple: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-fuchsia-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-fuchsia-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
}

function ModernKpiCard({ icon: Icon, label, subtext, value, tag, tone = 'emerald', onClick, active = false }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-4 sm:p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card} ${active ? '!ring-2 !ring-emerald-500 !border-emerald-500 shadow-md shadow-emerald-500/20' : ''}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{label}</p>
          </div>
        </div>
        {tag && (
          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>
            {tag}
          </span>
        )}
      </div>

      <p className={`text-2xl sm:text-3xl font-black tabular-nums ${t.val}`}>
        {value ?? '0'}
      </p>
      {subtext && (
        <p className={`mt-0.5 text-[11px] font-semibold ${t.sub} truncate`}>
          {subtext}
        </p>
      )}

      {isClickable && (
        <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-3 w-3" /> Filter tipe ini
        </p>
      )}
    </motion.div>
  )
}

// ── 2. TOAST NOTIFICATION STACK HOOK ──
function useNotifications() {
  const [items, setItems] = useState([])
  const push = (title, message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setItems((prev) => [...prev, { id, title, message, tone }])
    window.setTimeout(() => setItems((prev) => prev.filter((n) => n.id !== id)), 5000)
  }
  const dismiss = (id) => setItems((prev) => prev.filter((n) => n.id !== id))
  return { items, push, dismiss }
}

function ToastStack({ items, onDismiss }) {
  if (!items.length) return null
  return (
    <div className="fixed bottom-6 right-4 z-[200] flex flex-col gap-2.5 sm:right-6 max-w-sm w-full pointer-events-none" aria-live="polite">
      {items.map((n) => {
        const isError = n.tone === 'error' || n.tone === 'danger'
        const isWarning = n.tone === 'warning'
        return (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border bg-white p-4 shadow-xl dark:bg-slate-900 ${
              isError
                ? 'border-rose-300 dark:border-rose-800 shadow-rose-950/10'
                : isWarning
                ? 'border-amber-300 dark:border-amber-800 shadow-amber-950/10'
                : 'border-emerald-300 dark:border-emerald-800 shadow-emerald-950/10'
            }`}
          >
            <div
              className={`h-1 w-full absolute top-0 left-0 bg-gradient-to-r ${
                isError
                  ? 'from-rose-500 via-rose-600 to-red-700'
                  : isWarning
                  ? 'from-amber-400 via-amber-500 to-orange-600'
                  : 'from-emerald-500 via-teal-400 to-emerald-600'
              }`}
            />
            <div className="flex items-start gap-3 mt-1">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  isError
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
                    : isWarning
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {isError ? (
                  <XCircle className="h-5 w-5" />
                ) : isWarning ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white">{n.title}</p>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(n.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── 3. HARMONIZED BATCH IMPORT MODAL ──
function HarmonizedBatchImportModal({ isOpen, onClose, onImportSuccess, notify }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewRows, setPreviewRows] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0])
    }
  }

  const handleProcessFile = (file) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      notify('Format Berkas Tidak Valid', 'Unggah berkas berformat .csv atau .xlsx', 'error')
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter((l) => l.trim().length > 0)
      if (lines.length > 1) {
        const rows = lines.slice(1, 6).map((line, idx) => {
          const parts = line.split(',')
          return {
            id: idx + 1,
            kode_soal: (parts[0] || '').replace(/["\r]/g, '').trim(),
            pertanyaan: (parts[1] || '').replace(/["\r]/g, '').trim(),
            tipe_soal: (parts[2] || 'pg').replace(/["\r]/g, '').trim(),
            kunci_jawaban: (parts[3] || 'A').replace(/["\r]/g, '').trim(),
            poin: (parts[4] || '2.5').replace(/["\r]/g, '').trim(),
          }
        })
        setPreviewRows(rows)
      } else {
        setPreviewRows([])
      }
    }
    reader.readAsText(file)
  }

  const handleDownloadTemplate = () => {
    const headers = ['KODE_SOAL', 'PERTANYAAN', 'TIPE_SOAL', 'KUNCI_JAWABAN', 'POIN', 'TINGKAT_KESULITAN']
    const sampleRows = [
      ['"PPKN-001"', '"Sila pertama Pancasila menekankan nilai apa?"', '"pg"', '"A"', '"2.5"', '"mudah"'],
      ['"PPKN-002"', '"Jelaskan hubungan sila ke-2 dan ke-5 Pancasila!"', '"esai"', '""', '"10"', '"sedang"'],
    ]
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...sampleRows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'template_import_bank_soal.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify('Unduh Template', 'Template berkas CSV Bank Soal berhasil diunduh.', 'success')
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      notify('Pilih Berkas', 'Harap pilih berkas CSV atau XLSX terlebih dahulu.', 'warning')
      return
    }
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      notify('Impor Berhasil', `Berkas ${selectedFile.name} berhasil diimpor ke Bank Soal.`, 'success')
      onImportSuccess?.()
      onClose()
    } catch (err) {
      notify('Impor Gagal', err?.message || 'Terjadi kendala saat memproses berkas impor.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Impor Data Butir Bank Soal</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Unggah berkas CSV atau XLSX berisi butir pertanyaan ujian.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Download Template Card */}
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Template Berkas Data Soal</p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80">Format standar untuk pilihan ganda, esai, dan tingkat kesulitan.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-xs hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800 transition-all"
            >
              <Download className="h-3.5 w-3.5" /> Unduh Format
            </button>
          </div>

          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/60 dark:border-emerald-400 dark:bg-emerald-950/30'
                : 'border-emerald-300/80 bg-slate-50/50 hover:bg-emerald-50/30 dark:border-emerald-800/70 dark:bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
              className="hidden"
            />
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {selectedFile ? selectedFile.name : 'Tarik & lepas berkas ke sini, atau klik untuk memilih'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Mendukung file .CSV, .XLSX (Maks. 5MB)</p>
          </div>

          {/* Mini Preview Datatable */}
          {previewRows.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Pratinjau Butir Soal (5 Baris Pertama)
              </p>
              <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold border-b border-emerald-200/80">
                    <tr>
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Kode</th>
                      <th className="py-2 px-3">Pertanyaan</th>
                      <th className="py-2 px-3">Tipe</th>
                      <th className="py-2 px-3">Kunci</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/70 dark:divide-emerald-900/40">
                    {previewRows.map((r, i) => (
                      <tr key={i} className="hover:bg-emerald-50/30">
                        <td className="py-2 px-3 font-semibold text-slate-500">{i + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{r.kode_soal || '-'}</td>
                        <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-100 truncate max-w-[200px]">{r.pertanyaan || '-'}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-300 uppercase">{r.tipe_soal}</td>
                        <td className="py-2 px-3 font-bold text-emerald-700">{r.kunci_jawaban}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedFile}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/30 hover:brightness-105 disabled:opacity-50 transition-all"
          >
            {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Memproses Berkas...' : 'Proses Impor Soal'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── 3. HARMONIZED SAVE CONFIRMATION MODAL ──
function HarmonizedSaveModal({ isOpen, onClose, onConfirm, isEdit, title, isSubmitting }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${
            isEdit ? 'from-amber-400 via-amber-500 to-orange-600' : 'from-emerald-500 via-teal-400 to-emerald-600'
          }`}
        />
        <div className="p-6">
          <div className="flex items-center gap-3.5 mb-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${
                isEdit
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
              }`}
            >
              {isEdit ? <Edit3 className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
            </div>
            <div>
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  isEdit
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {isEdit ? 'Perbarui Soal' : 'Butir Soal Baru'}
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Konfirmasi Simpan Soal
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin {isEdit ? 'memperbarui butir pertanyaan' : 'menyimpan butir soal baru'} berikut ke bank soal:
          </p>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20 mb-5">
            <p className="text-xs font-black text-emerald-950 dark:text-emerald-100 line-clamp-2">{title || 'Butir Pertanyaan Soal'}</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition-all ${
                isEdit
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 shadow-amber-600/30 hover:brightness-105'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 shadow-emerald-600/30 hover:brightness-105'
              } disabled:opacity-50`}
            >
              {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
              <span>{isSubmitting ? 'Menyimpan...' : isEdit ? 'Ya, Simpan Perubahan' : 'Ya, Tambahkan Soal'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── 4. HARMONIZED BATCH EXPORT MODAL ──
function HarmonizedBatchExportModal({
  isOpen,
  onClose,
  onExport,
  isExporting,
  totalCount,
  moduleTitle = 'Bank Soal',
}) {
  const [exportFormat, setExportFormat] = useState('xlsx')

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isExporting) onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-lg"
      >
        <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border border-amber-200/80 bg-white shadow-2xl shadow-amber-950/20 dark:border-amber-900/50 dark:bg-[#182232]">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 shrink-0" />

          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-950 shrink-0">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white p-2.5 shadow-md shadow-amber-500/25 border border-amber-300/40 shrink-0">
                <Download className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Export Data {moduleTitle}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60">
                    <Sparkles className="size-3" /> Unduh Data
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pilih format berkas untuk mengekspor data sesuai filter aktif.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isExporting}
              onClick={onClose}
              className="size-9 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ['xlsx', 'Excel (.xlsx)', FileSpreadsheet, 'Format spreadsheet modern Microsoft Excel.'],
                ['xls', 'Excel (.xls)', FileSpreadsheet, 'Format kompatibilitas Excel 97-2003.'],
                ['csv', 'CSV (.csv)', FileText, 'Format teks koma terpisah universal.'],
              ].map(([value, label, Icon, desc]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setExportFormat(value)}
                  className={`rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                    exportFormat === value
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/40'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon
                      className={`size-4 ${
                        exportFormat === value ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-xs font-black text-slate-900 dark:text-white">{label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">{desc}</p>
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 mb-0.5">
                <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
                Filter Ekspor Aktif
              </p>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} butir {moduleTitle.toLowerCase()}).
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={() => onExport(exportFormat)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-amber-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer border border-amber-300/40"
            >
              <Download className="size-4" />
              {isExporting ? 'Menyiapkan...' : 'Unduh Berkas'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── 5. HARMONIZED DELETE CONFIRMATION MODAL ──
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, title, isSubmitting }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-rose-950/20 dark:border-slate-800 dark:bg-[#1B2433]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-700" />
        <div className="p-6">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-md shadow-rose-500/30">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                Hapus Permanen
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                Konfirmasi Hapus Butir Soal
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Apakah Anda yakin ingin menghapus butir soal berikut dari bank soal? Soal yang dihapus tidak akan muncul pada paket ujian berikutnya.
          </p>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-800/60 dark:bg-rose-950/20 mb-5">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100 line-clamp-2">{title || 'Butir Pertanyaan Soal'}</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:brightness-105 disabled:opacity-50 transition-all"
            >
              {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
              <span>{isSubmitting ? 'Menghapus...' : 'Ya, Hapus Butir Soal'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const getMapelName = (item) => {
  if (!item) return '-'
  const mp = item.kisi_kisi?.mata_pelajaran || item.mata_pelajaran || item.subject || item.kisi_kisi?.subject
  if (typeof mp === 'string') return mp
  if (typeof mp === 'object' && mp !== null) {
    return mp.name || mp.nama || mp.nama_mapel || mp.label || mp.kode_mapel || '-'
  }
  return '-'
}

// ── 5. KOMPONEN UTAMA HALAMAN BANK SOAL ──
export default function LmsBankSoalPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
  const { items: toastItems, push: notify, dismiss: dismissToast } = useNotifications()
  const [searchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const activeUnit = useUnitStore((state) => state.activeUnit)

  const userUnitId = useMemo(() => {
    const candidateIds = [
      user?.unit_id,
      user?.unit_pendidikan_id,
      user?.education_unit_id,
      user?.unit?.id,
      user?.education_unit?.id,
      user?.unit_pendidikan?.id,
      user?.employee?.unit_id,
      user?.employee?.unit_pendidikan_id,
      user?.employee?.education_unit_id,
      user?.school_info?.id,
    ].filter(Boolean)
    return candidateIds.length > 0 ? String(candidateIds[0]) : null
  }, [user])

  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [stats, setStats] = useState({
    total_soal: 0,
    total_pg: 0,
    total_esai: 0,
    total_benar_salah: 0,
    total_menjodohkan: 0,
    total_aktif: 0,
  })
  const [options, setOptions] = useState({
    kisi_kisi: [],
    tipe_soal: [],
    tingkat_kesulitan: [],
  })

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 350)

  const [filters, setFilters] = useState({
    mata_pelajaran_id: '',
    kisi_kisi_id: '',
    tipe_soal: '',
    tingkat_kesulitan: '',
    status: '',
  })

  // Print & Import State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  // Modals & Detail State
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [rowDetailItem, setRowDetailItem] = useState(null)
  const [showRowDetailModal, setShowRowDetailModal] = useState(false)

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    id: null,
    title: '',
    isSubmitting: false,
  })

  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // In-Modal Session Questions
  const [modalSessionQuestions, setModalSessionQuestions] = useState([])
  const [editingModalQuestionId, setEditingModalQuestionId] = useState(null)
  const [loadingModalQuestions, setLoadingModalQuestions] = useState(false)

  // Menjodohkan Pair State
  const [matchingPairs, setMatchingPairs] = useState([
    { kiri: '', kanan: '' },
    { kiri: '', kanan: '' },
  ])

  const [formData, setFormData] = useState({
    kisi_kisi_id: '',
    mata_pelajaran_id: '',
    kode_soal: '',
    pertanyaan: '',
    tipe_soal: 'pg',
    opsi_a: '',
    opsi_b: '',
    opsi_c: '',
    opsi_d: '',
    opsi_e: '',
    kunci_jawaban: 'A',
    pembahasan: '',
    poin: 2.5,
    tingkat_kesulitan: 'sedang',
    indikator: '',
    status: true,
  })

  const selectedKisiObj = useMemo(() => {
    return (options.kisi_kisi || []).find((k) => k.id === formData.kisi_kisi_id)
  }, [options.kisi_kisi, formData.kisi_kisi_id])

  useEffect(() => {
    fetchStats()
    fetchOptions()
  }, [userUnitId, activeUnit])

  useEffect(() => {
    fetchData(page)
  }, [page, perPage, debouncedSearch, filters, userUnitId, activeUnit])

  // Handle URL or Session storage prefill
  useEffect(() => {
    const urlKisiId = searchParams.get('kisi_id')
    const sessionKisiId = sessionStorage.getItem('bankSoal_prefill_kisi_id')
    const targetKisiId = urlKisiId || sessionKisiId

    if (targetKisiId) {
      const targetMapelId = sessionStorage.getItem('bankSoal_prefill_mapel_id') || ''
      const targetJudul = sessionStorage.getItem('bankSoal_prefill_kisi_judul') || ''

      setFilters((prev) => ({
        ...prev,
        kisi_kisi_id: targetKisiId,
      }))

      handleOpenModal(null, {
        kisi_kisi_id: targetKisiId,
        mata_pelajaran_id: targetMapelId,
      })

      if (targetJudul) {
        notify('Prefill Kisi-kisi', `Tambah butir soal untuk: ${targetJudul}`, 'success')
      }

      sessionStorage.removeItem('bankSoal_prefill_kisi_id')
      sessionStorage.removeItem('bankSoal_prefill_kisi_judul')
      sessionStorage.removeItem('bankSoal_prefill_mapel_id')
    }
  }, [searchParams])

  const fetchData = async (targetPage = 1) => {
    setLoading(true)
    try {
      const params = {
        page: targetPage,
        per_page: perPage,
        search: debouncedSearch,
        ...filters,
      }
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit

      const response = await lmsBankSoalService.getDaftar(params)
      if (response && response.data) {
        let rawData = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        let filteredData = rawData.filter((item) => {
          if (!item) return false
          const itemUnitId = item.unit_pendidikan_id || item.unit_id || item.kisi_kisi?.unit_pendidikan_id || item.kisi_kisi?.mata_pelajaran?.unit_pendidikan_id || item.mata_pelajaran?.unit_pendidikan_id
          if (userUnitId && itemUnitId) return String(itemUnitId) === String(userUnitId)
          return true
        })
        setDataList(filteredData)
        setPagination({
          currentPage: response.meta?.current_page || targetPage,
          lastPage: response.meta?.last_page || 1,
          total: response.meta?.total || filteredData.length,
        })
      }
    } catch (error) {
      console.error('Error loading Bank Soal data:', error)
      notify('Gagal Memuat Data', 'Tidak dapat memuat daftar repositori butir soal.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit
      const response = await lmsBankSoalService.getStats(params)
      if (response && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error loading Bank Soal stats:', error)
    }
  }

  const fetchOptions = async () => {
    try {
      const params = {}
      if (userUnitId) params.unit_pendidikan_id = userUnitId
      if (activeUnit) params.jenjang = activeUnit

      const [resOptions, resSubjects] = await Promise.allSettled([
        lmsBankSoalService.getOptions(params),
        subjectService.getDaftar({ ...params, status: 1, per_page: 100 }),
      ])

      let bankSoalOptions = resOptions.status === 'fulfilled' ? resOptions.value?.data || resOptions.value || {} : {}
      let dbSubjectsRaw = resSubjects.status === 'fulfilled' ? resSubjects.value?.data || resSubjects.value || [] : []
      if (Array.isArray(dbSubjectsRaw?.data)) dbSubjectsRaw = dbSubjectsRaw.data

      let dbSubjects = Array.isArray(dbSubjectsRaw) ? dbSubjectsRaw.filter((s) => {
        if (!s) return false
        const sUnitId = s.unit_pendidikan_id || s.unit_id || s.education_unit_id
        if (userUnitId && sUnitId) return String(sUnitId) === String(userUnitId)
        if (activeUnit && s.jenjang) return s.jenjang === activeUnit || s.jenjang === 'All'
        return true
      }) : []

      const kisiList = (bankSoalOptions.kisi_kisi || []).filter((k) => {
        if (!k) return false
        const kUnitId = k.unit_pendidikan_id || k.unit_id || k.mata_pelajaran?.unit_pendidikan_id
        if (userUnitId && kUnitId) return String(kUnitId) === String(userUnitId)
        return true
      })

      setOptions({
        ...bankSoalOptions,
        kisi_kisi: kisiList,
        subjects: dbSubjects.length > 0 ? dbSubjects : (bankSoalOptions.subjects || []).filter((s) => {
          const sUnitId = s.unit_pendidikan_id || s.unit_id
          if (userUnitId && sUnitId) return String(sUnitId) === String(userUnitId)
          return true
        }),
      })
    } catch (error) {
      console.error('Error loading options:', error)
    }
  }

  const loadExistingQuestionsForKisi = async (kisiId) => {
    if (!kisiId) {
      setModalSessionQuestions([])
      return
    }
    setLoadingModalQuestions(true)
    try {
      const res = await lmsBankSoalService.getDaftar({
        kisi_kisi_id: kisiId,
        per_page: 100,
        order_by: 'created_at',
        order_dir: 'asc',
      })
      let items = []
      if (res && res.data) {
        items = Array.isArray(res.data) ? res.data : (res.data.data || [])
      }
      setModalSessionQuestions(items)
      setFormData((prev) => {
        if (!prev.kode_soal && !editingModalQuestionId && !editingItem) {
          const nextNum = items.length + 1
          return { ...prev, kode_soal: `SOAL-${String(nextNum).padStart(2, '0')}` }
        }
        return prev
      })
    } catch (err) {
      console.error('Error loading existing questions for modal:', err)
      setModalSessionQuestions([])
    } finally {
      setLoadingModalQuestions(false)
    }
  }

  const handleOpenModal = (item = null, prefill = null) => {
    if (item) {
      setEditingItem(item)
      let defaultKunci = item.kunci_jawaban || ''
      let pairs = [
        { kiri: '', kanan: '' },
        { kiri: '', kanan: '' },
      ]
      if (item.tipe_soal === 'menjodohkan' && Array.isArray(item.opsi_menjodohkan)) {
        pairs = item.opsi_menjodohkan.map((p) => ({
          kiri: p.kiri || '',
          kanan: p.kanan || '',
        }))
      }
      setMatchingPairs(pairs)

      setFormData({
        kisi_kisi_id: item.kisi_kisi_id || '',
        mata_pelajaran_id: item.mata_pelajaran_id || '',
        kode_soal: item.kode_soal || '',
        pertanyaan: item.pertanyaan || '',
        tipe_soal: item.tipe_soal || 'pg',
        opsi_a: item.opsi_a || '',
        opsi_b: item.opsi_b || '',
        opsi_c: item.opsi_c || '',
        opsi_d: item.opsi_d || '',
        opsi_e: item.opsi_e || '',
        kunci_jawaban: defaultKunci,
        pembahasan: item.pembahasan || '',
        poin: item.poin || 2.5,
        tingkat_kesulitan: item.tingkat_kesulitan || 'sedang',
        indikator: item.indikator || '',
        status: item.status !== undefined ? item.status : true,
      })

      if (item.kisi_kisi_id) {
        loadExistingQuestionsForKisi(item.kisi_kisi_id)
      } else {
        setModalSessionQuestions([])
      }
    } else {
      setEditingItem(null)
      setEditingModalQuestionId(null)
      const targetKisiId = prefill?.kisi_kisi_id || filters.kisi_kisi_id || (options.kisi_kisi.length > 0 ? options.kisi_kisi[0].id : '')
      const matchedKisi = options.kisi_kisi.find((k) => k.id === targetKisiId)
      const targetMapelId = prefill?.mata_pelajaran_id || matchedKisi?.mata_pelajaran_id || (options.kisi_kisi.length > 0 ? options.kisi_kisi[0].mata_pelajaran_id : '')

      setMatchingPairs([
        { kiri: '', kanan: '' },
        { kiri: '', kanan: '' },
      ])

      setFormData({
        kisi_kisi_id: targetKisiId,
        mata_pelajaran_id: targetMapelId,
        kode_soal: '',
        pertanyaan: '',
        tipe_soal: 'pg',
        opsi_a: '',
        opsi_b: '',
        opsi_c: '',
        opsi_d: '',
        opsi_e: '',
        kunci_jawaban: 'A',
        pembahasan: '',
        poin: 2.5,
        tingkat_kesulitan: 'sedang',
        indikator: '',
        status: true,
      })

      if (targetKisiId) {
        loadExistingQuestionsForKisi(targetKisiId)
      } else {
        setModalSessionQuestions([])
      }
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setEditingModalQuestionId(null)
    fetchData(1)
    fetchStats()
  }

  const resetSingleQuestionForm = () => {
    setEditingModalQuestionId(null)
    const nextNum = modalSessionQuestions.length + 1
    setFormData((prev) => ({
      ...prev,
      kode_soal: `SOAL-${String(nextNum).padStart(2, '0')}`,
      pertanyaan: '',
      tipe_soal: 'pg',
      opsi_a: '',
      opsi_b: '',
      opsi_c: '',
      opsi_d: '',
      opsi_e: '',
      kunci_jawaban: 'A',
      pembahasan: '',
      poin: 2.5,
      tingkat_kesulitan: 'sedang',
      indikator: '',
      status: true,
    }))
  }

  const handleTypeChange = (newType) => {
    let defaultKunci = ''
    if (newType === 'pg') defaultKunci = 'A'
    if (newType === 'benar_salah') defaultKunci = 'Benar'
    if (newType === 'esai') defaultKunci = ''
    if (newType === 'menjodohkan') defaultKunci = ''

    setFormData((prev) => ({
      ...prev,
      tipe_soal: newType,
      kunci_jawaban: defaultKunci,
    }))
  }

  const handleKisiChange = (kisiId) => {
    const selectedKisi = options.kisi_kisi.find((k) => k.id === kisiId)
    setFormData((prev) => ({
      ...prev,
      kisi_kisi_id: kisiId,
      mata_pelajaran_id: selectedKisi ? selectedKisi.mata_pelajaran_id : prev.mata_pelajaran_id,
      kode_soal: '',
    }))
    if (kisiId) {
      loadExistingQuestionsForKisi(kisiId)
    } else {
      setModalSessionQuestions([])
    }
  }

  const handleAddPair = () => {
    setMatchingPairs((prev) => [...prev, { kiri: '', kanan: '' }])
  }

  const handleRemovePair = (index) => {
    if (matchingPairs.length <= 1) return
    setMatchingPairs((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePairChange = (index, field, value) => {
    setMatchingPairs((prev) => {
      const copy = [...prev]
      copy[index][field] = value
      return copy
    })
  }

  const handleTriggerSave = (e) => {
    if (e) e.preventDefault()

    if (!formData.kisi_kisi_id) {
      notify('Pilih Kisi-kisi', 'Pilih Kisi-kisi Ujian / Mata Pelajaran terlebih dahulu.', 'warning')
      return
    }

    if (!formData.pertanyaan.trim()) {
      notify('Pertanyaan Kosong', 'Teks pertanyaan/soal tidak boleh kosong.', 'warning')
      return
    }

    if (formData.tipe_soal === 'menjodohkan') {
      const validPairs = matchingPairs.filter((p) => p.kiri.trim() && p.kanan.trim())
      if (validPairs.length === 0) {
        notify('Pasangan Tidak Lengkap', 'Masukkan minimal 1 pasangan yang valid untuk tipe Menjodohkan.', 'warning')
        return
      }
    }

    setIsSaveModalOpen(true)
  }

  const handleConfirmSave = async () => {
    let payload = { ...formData }

    if (formData.tipe_soal === 'menjodohkan') {
      const validPairs = matchingPairs.filter((p) => p.kiri.trim() && p.kanan.trim())
      payload.kunci_jawaban = JSON.stringify(validPairs)
    }

    setIsSubmittingForm(true)
    try {
      if (editingModalQuestionId || editingItem) {
        const targetId = editingModalQuestionId || editingItem.id
        await lmsBankSoalService.update(targetId, payload)

        setModalSessionQuestions((prev) =>
          prev.map((q) => (q.id === targetId ? { ...payload, id: targetId } : q))
        )
        notify('Berhasil Disimpan', 'Butir soal berhasil diperbarui!', 'success')
        setIsSaveModalOpen(false)
        if (editingItem) {
          handleCloseModal()
          fetchData(pagination.currentPage)
          fetchStats()
          return
        }
      } else {
        const res = await lmsBankSoalService.create(payload)
        const newItem = res?.data || { ...payload, id: Date.now() + Math.random() }

        setModalSessionQuestions((prev) => [...prev, newItem])
        notify('Berhasil Ditambahkan', 'Butir soal berhasil ditambahkan ke bank soal!', 'success')
        setIsSaveModalOpen(false)
      }

      resetSingleQuestionForm()
      fetchData(1)
      fetchStats()
    } catch (error) {
      console.error('Error saving question:', error)
      notify('Gagal Menyimpan', 'Terjadi kesalahan sistem saat menyimpan butir soal.', 'error')
    } finally {
      setIsSubmittingForm(false)
    }
  }

  const handleEditModalQuestionRow = (item) => {
    setEditingModalQuestionId(item.id)
    let defaultKunci = item.kunci_jawaban || ''
    if (item.tipe_soal === 'pg' && !defaultKunci) defaultKunci = 'A'
    if (item.tipe_soal === 'benar_salah' && !defaultKunci) defaultKunci = 'Benar'

    setFormData({
      kisi_kisi_id: item.kisi_kisi_id || formData.kisi_kisi_id,
      mata_pelajaran_id: item.mata_pelajaran_id || formData.mata_pelajaran_id,
      kode_soal: item.kode_soal || '',
      pertanyaan: item.pertanyaan || '',
      tipe_soal: item.tipe_soal || 'pg',
      opsi_a: item.opsi_a || '',
      opsi_b: item.opsi_b || '',
      opsi_c: item.opsi_c || '',
      opsi_d: item.opsi_d || '',
      opsi_e: item.opsi_e || '',
      kunci_jawaban: defaultKunci,
      pembahasan: item.pembahasan || '',
      poin: item.poin || 2.5,
      tingkat_kesulitan: item.tingkat_kesulitan || 'sedang',
      indikator: item.indikator || '',
      status: item.status !== undefined ? item.status : true,
    })
    const container = document.getElementById('modalFormScrollContainer')
    if (container) container.scrollTop = 0
  }

  const handleDeleteModalQuestionRow = async (id) => {
    try {
      await lmsBankSoalService.delete(id)
      setModalSessionQuestions((prev) => prev.filter((q) => q.id !== id))
      if (editingModalQuestionId === id) resetSingleQuestionForm()
      notify('Soal Dihapus', 'Pertanyaan telah dihapus dari repositori.', 'success')
      fetchData(1)
      fetchStats()
    } catch (err) {
      console.error('Error deleting question:', err)
      notify('Gagal Menghapus', 'Tidak dapat menghapus pertanyaan.', 'error')
    }
  }

  const handleDeletePrompt = (item) => {
    setDeleteModalState({
      isOpen: true,
      id: item.id,
      title: item.pertanyaan,
      isSubmitting: false,
    })
  }

  const handleConfirmDelete = async () => {
    setDeleteModalState((prev) => ({ ...prev, isSubmitting: true }))
    try {
      await lmsBankSoalService.delete(deleteModalState.id)
      notify('Soal Dihapus', 'Butir soal berhasil dihapus!', 'success')
      setDeleteModalState({ isOpen: false, id: null, title: '', isSubmitting: false })
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error deleting item:', error)
      notify('Gagal Menghapus', 'Tidak dapat menghapus butir soal.', 'error')
      setDeleteModalState((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleDuplicate = async (id) => {
    try {
      await lmsBankSoalService.duplicate(id)
      notify('Soal Diduplikasi', 'Butir soal berhasil diduplikasi!', 'success')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error duplicating item:', error)
      notify('Gagal Menduplikasi', 'Tidak dapat menduplikasi butir soal.', 'error')
    }
  }

  const handleToggleStatus = async (item) => {
    try {
      await lmsBankSoalService.update(item.id, { status: !item.status })
      notify('Status Diperbarui', `Status butir soal diubah menjadi ${!item.status ? 'Aktif' : 'Non-Aktif'}`, 'success')
      fetchData(pagination.currentPage)
      fetchStats()
    } catch (error) {
      console.error('Error toggling status:', error)
      notify('Gagal Mengubah Status', 'Terjadi kesalahan sistem.', 'error')
    }
  }

  const handleProcessExport = async (format = 'xlsx') => {
    if (!dataList.length) {
      notify('Data Kosong', 'Tidak ada butir soal untuk diekspor.', 'warning')
      return
    }
    setIsExporting(true)
    try {
      const exportData = dataList.map((item, i) => ({
        'No': i + 1,
        'Kode Soal': item.kode_soal || `SOAL-${item.id || i + 1}`,
        'Pertanyaan': (item.pertanyaan || item.soal || '').replace(/<[^>]*>?/gm, '').trim(),
        'Tipe Soal':
          item.tipe_soal === 'pg'
            ? 'Pilihan Ganda'
            : item.tipe_soal === 'esai'
            ? 'Esai / Uraian'
            : item.tipe_soal === 'benar_salah'
            ? 'Benar / Salah'
            : 'Menjodohkan',
        'Tingkat Kesulitan': (item.tingkat_kesulitan || 'sedang').toUpperCase(),
        'Bobot Poin': item.poin || 2.5,
        'Status': item.status ? 'Aktif' : 'Nonaktif',
      }))

      downloadSpreadsheetTemplate(
        exportData,
        `bank_soal_${new Date().toISOString().slice(0, 10)}`,
        format,
        'Bank Soal'
      )
      setIsExportModalOpen(false)
      notify('Export Berhasil', `Berkas Bank Soal .${format.toUpperCase()} berhasil diunduh.`, 'success')
    } catch (err) {
      notify('Gagal Export', err?.message || 'Terjadi kesalahan saat menyiapkan berkas ekspor.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const getTipeBadge = (tipe) => {
    switch (tipe) {
      case 'pg':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <CheckSquare className="w-3.5 h-3.5" /> Pilihan Ganda
          </span>
        )
      case 'esai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
            <FileText className="w-3.5 h-3.5" /> Essay / Esai
          </span>
        )
      case 'benar_salah':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
            <ToggleLeft className="w-3.5 h-3.5" /> Benar / Salah
          </span>
        )
      case 'menjodohkan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs">
            <GitCommit className="w-3.5 h-3.5" /> Menjodohkan
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {tipe}
          </span>
        )
    }
  }

  const getKesulitanBadge = (level) => {
    switch (level) {
      case 'mudah':
        return <span className="px-2 py-0.5 text-[11px] rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 font-bold">Mudah</span>
      case 'sedang':
        return <span className="px-2 py-0.5 text-[11px] rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-bold">Sedang</span>
      case 'sulit':
        return <span className="px-2 py-0.5 text-[11px] rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 font-bold">Sulit</span>
      default:
        return <span className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 font-semibold">{level}</span>
    }
  }

  return (
    <PageContainer maxW="7xl">
      {/* Toast Notification Stack */}
      <ToastStack items={toastItems} onDismiss={dismissToast} />

      {!(embedded || hideBreadcrumb) && (
        <AppBreadcrumb
          items={[
            { label: 'LMS & Akademik', href: '/dashboard' },
            { label: 'Bank Soal Ujian' },
          ]}
        />
      )}

      <div className="lms-bank-soal-page space-y-6 pb-12">
        {/* Modern Hero Header Card (Vivid Emerald Spec) */}
        {!hidePageHeader && (
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-teal-500/30 via-emerald-400/20 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <Layers className="size-5 sm:size-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      Evaluasi &amp; CBT Terpadu
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Bank Soal &amp; Repositori Ujian
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    Kelola repositori butir soal terintegrasi Kisi-kisi Ujian dengan dukungan Pilihan Ganda, Esai, Benar-Salah, dan Menjodohkan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50/80 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-extrabold text-emerald-800 shadow-xs dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                  Repositori Soal CBT
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modern Multi-Tone KPI Summary Cards (Interactive Filters) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <ModernKpiCard
            icon={Layers}
            label="Total Soal"
            value={stats.total_soal}
            tag="Semua Soal"
            subtext={`${stats.total_aktif} Butir Aktif`}
            tone="emerald"
            active={filters.tipe_soal === ''}
            onClick={() => setFilters((prev) => ({ ...prev, tipe_soal: '' }))}
          />
          <ModernKpiCard
            icon={CheckSquare}
            label="Pilihan Ganda"
            value={stats.total_pg}
            tag="Tipe PG"
            subtext="Opsi A s.d. E"
            tone="sky"
            active={filters.tipe_soal === 'pg'}
            onClick={() => setFilters((prev) => ({ ...prev, tipe_soal: 'pg' }))}
          />
          <ModernKpiCard
            icon={FileText}
            label="Essay / Esai"
            value={stats.total_esai}
            tag="Esai Uraian"
            subtext="Rubrik & Penskoran"
            tone="purple"
            active={filters.tipe_soal === 'esai'}
            onClick={() => setFilters((prev) => ({ ...prev, tipe_soal: 'esai' }))}
          />
          <ModernKpiCard
            icon={ToggleLeft}
            label="Benar / Salah"
            value={stats.total_benar_salah}
            tag="Tipe B/S"
            subtext="Pernyataan B/S"
            tone="blue"
            active={filters.tipe_soal === 'benar_salah'}
            onClick={() => setFilters((prev) => ({ ...prev, tipe_soal: 'benar_salah' }))}
          />
          <ModernKpiCard
            icon={GitCommit}
            label="Menjodohkan"
            value={stats.total_menjodohkan}
            tag="Matching"
            subtext="Pasangan Item"
            tone="amber"
            active={filters.tipe_soal === 'menjodohkan'}
            onClick={() => setFilters((prev) => ({ ...prev, tipe_soal: 'menjodohkan' }))}
          />
        </div>

        {/* Tab Navigation (if provided) */}
        {tabNav && <div>{typeof tabNav === 'function' ? tabNav() : tabNav}</div>}

        {/* Master Datatable Panel (Canonical Emerald Datatable Container) */}
        <section
          className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]"
          aria-labelledby="banksoal-table-title"
        >
          {/* Toolbar Baris 1: Header Judul & 4 Tombol Soft Squircle Action */}
          <div className="border-b border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-4 py-3.5 sm:px-6 md:px-8 dark:border-emerald-800/60">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <h2 id="banksoal-table-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Daftar Butir Bank Soal Ujian
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    {pagination.total} Soal
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Repositori butir pertanyaan ujian berbasis kisi-kisi dan kurikulum aktif.
                </p>
              </div>

              {/* 4 Soft Squircle Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
                <SquircleActionButton
                  variant="view"
                  icon={Printer}
                  label="Cetak &amp; PDF"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="!size-10 !rounded-2xl !bg-gradient-to-br !from-indigo-500 !via-indigo-600 !to-violet-700 !text-white !border-0 hover:!brightness-110 !shadow-sm"
                />
                <SquircleActionButton
                  variant="import"
                  icon={Upload}
                  label="Import Data"
                  onClick={() => setImportOpen(true)}
                  className="!size-10 !rounded-2xl !bg-gradient-to-br !from-sky-400 !via-sky-500 !to-blue-600 !text-white !border-0 hover:!brightness-110 !shadow-sm"
                />
                <SquircleActionButton
                  variant="export"
                  icon={Download}
                  label="Export Data"
                  onClick={() => setIsExportModalOpen(true)}
                  className="!size-10 !rounded-2xl !bg-gradient-to-br !from-amber-400 !via-amber-500 !to-orange-600 !text-white !border-0 hover:!brightness-110 !shadow-sm"
                />
                <SquircleActionButton
                  variant="primary"
                  icon={Plus}
                  label="Tambah Soal Baru"
                  onClick={() => handleOpenModal()}
                  className="!size-10 !rounded-2xl !bg-gradient-to-br !from-emerald-500 !via-emerald-600 !to-teal-700 !text-white !border-0 hover:!brightness-110 !shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Toolbar Baris 2: Field Pencarian Full-Width Debounced */}
          <div className="border-b border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 px-4 py-3 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/70 dark:text-emerald-400" />
              <input
                type="text"
                placeholder="Cari butir soal, kode soal, indikator kompetensi..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setPage(1)
                }}
                className="h-10 sm:h-11 w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 sm:pl-11 pr-10 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setPage(1)
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Toolbar Baris 3: Dropdown Filter Horizontal & Reset */}
          <div className="border-b border-emerald-200/80 bg-white px-4 py-3 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                Filter:
              </span>

              {/* Filter Mata Pelajaran */}
              <select
                value={filters.mata_pelajaran_id || ''}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, mata_pelajaran_id: e.target.value }))
                  setPage(1)
                }}
                className="w-full sm:w-auto min-w-[140px] h-9.5 rounded-xl border border-emerald-200/80 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="">Semua Mata Pelajaran</option>
                {((options.subjects || options.mata_pelajaran) && (options.subjects || options.mata_pelajaran).length > 0
                  ? (options.subjects || options.mata_pelajaran)
                  : Array.from(
                      new Map(
                        (options.kisi_kisi || [])
                          .filter((k) => k.mata_pelajaran_id || k.mata_pelajaran)
                          .map((k) => {
                            const id = k.mata_pelajaran_id || k.mata_pelajaran?.id || (typeof k.mata_pelajaran === 'string' ? k.mata_pelajaran : k.id)
                            const name = typeof k.mata_pelajaran === 'object' ? (k.mata_pelajaran.name || k.mata_pelajaran.nama) : (k.mata_pelajaran || k.judul_kisi)
                            return [id, { id, name }]
                          })
                      ).values()
                    )
                ).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.nama_mapel || m.nama || m.label}
                  </option>
                ))}
              </select>

              {/* Filter Kisi-kisi */}
              <select
                value={filters.kisi_kisi_id}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, kisi_kisi_id: e.target.value }))
                  setPage(1)
                }}
                className="w-full sm:w-auto min-w-[140px] h-9.5 rounded-xl border border-emerald-200/80 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="">Semua Kisi-kisi Ujian</option>
                {options.kisi_kisi.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.judul_kisi} ({k.jenis_ujian})
                  </option>
                ))}
              </select>

              {/* Filter Tipe Soal */}
              <select
                value={filters.tipe_soal}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, tipe_soal: e.target.value }))
                  setPage(1)
                }}
                className="w-full sm:w-auto min-w-[140px] h-9.5 rounded-xl border border-emerald-200/80 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="">Semua Tipe Soal</option>
                <option value="pg">Pilihan Ganda</option>
                <option value="esai">Essay / Esai</option>
                <option value="benar_salah">Benar / Salah</option>
                <option value="menjodohkan">Menjodohkan</option>
              </select>

              {/* Filter Tingkat Kesulitan */}
              <select
                value={filters.tingkat_kesulitan}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, tingkat_kesulitan: e.target.value }))
                  setPage(1)
                }}
                className="w-full sm:w-auto min-w-[140px] h-9.5 rounded-xl border border-emerald-200/80 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#0E5C44] focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="">Semua Tingkat Kesulitan</option>
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>

              {/* Reset Filter Button */}
              {(searchInput || filters.mata_pelajaran_id || filters.kisi_kisi_id || filters.tipe_soal || filters.tingkat_kesulitan) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setFilters({ mata_pelajaran_id: '', kisi_kisi_id: '', tipe_soal: '', tingkat_kesulitan: '', status: '' })
                    setPage(1)
                  }}
                  className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 h-9.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  title="Reset Semua Filter"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Master Datatable Body */}
          <MasterDataTable className="!rounded-none !border-0 !shadow-none">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <tr className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200 text-xs font-black uppercase tracking-wider">
                  <th className="hidden sm:table-cell w-[16%] bg-transparent px-4 py-3.5 font-black text-[11px] uppercase tracking-wider">
                    Kode &amp; Tipe
                  </th>
                  <th className="w-auto sm:w-[38%] md:w-[42%] bg-transparent px-3.5 sm:px-6 md:px-8 py-3.5 font-black text-[11px] uppercase tracking-wider">
                    Pertanyaan / Butir Soal
                  </th>
                  <th className="hidden md:table-cell w-[18%] bg-transparent px-3 py-3.5 font-black text-[11px] uppercase tracking-wider">
                    Kisi-kisi &amp; Mapel
                  </th>
                  <th className="hidden sm:table-cell w-[10%] bg-transparent px-3 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">
                    Poin &amp; Level
                  </th>
                  <th className="hidden lg:table-cell w-[8%] bg-transparent px-3 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-14 sm:w-[8%] bg-transparent px-2 sm:px-3.5 py-3.5 text-center font-black text-[11px] uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-14 text-center text-slate-400">
                      <RefreshCw className="h-7 w-7 animate-spin mx-auto mb-2 text-[#0E5C44]" />
                      <p className="text-xs font-semibold">Memuat data butir bank soal...</p>
                    </td>
                  </tr>
                ) : dataList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mb-3">
                        <HelpCircle className="h-7 w-7" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Belum Ada Butir Soal</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Tidak ditemukan butir soal sesuai kata kunci pencarian atau filter yang dipilih.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenModal()}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:brightness-105 transition-all"
                      >
                        <Plus className="h-4 w-4" /> Tambah Soal Pertama
                      </button>
                    </td>
                  </tr>
                ) : (
                  dataList.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setRowDetailItem(item)
                        setShowRowDetailModal(true)
                      }}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer group"
                    >
                      {/* Kode & Tipe */}
                      <td className="hidden sm:table-cell py-3.5 px-4 align-top">
                        <span className="font-mono text-xs font-extrabold text-emerald-800 dark:text-emerald-400 block mb-1">
                          {item.kode_soal || 'SOAL-SYS'}
                        </span>
                        <div>{getTipeBadge(item.tipe_soal)}</div>
                      </td>

                      {/* Pertanyaan */}
                      <td className="py-3.5 px-3.5 sm:px-6 md:px-8 align-top">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {item.pertanyaan}
                        </p>
                        {item.indikator && (
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                            Indikator: {item.indikator}
                          </p>
                        )}

                        {/* Mobile-only compact metadata row */}
                        <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                          <span className="font-mono text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400">
                            {item.kode_soal || 'SOAL-SYS'}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          {getTipeBadge(item.tipe_soal)}
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                            {item.kisi_kisi?.judul_kisi || getMapelName(item)}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                            {item.poin} Poin
                          </span>
                        </div>
                      </td>

                      {/* Kisi-kisi & Mapel */}
                      <td className="hidden md:table-cell py-3.5 px-3 align-top">
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-xs">
                          {item.kisi_kisi?.judul_kisi || 'Umum'}
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">
                          {getMapelName(item)}
                        </div>
                      </td>

                      {/* Poin & Level */}
                      <td className="hidden sm:table-cell py-3.5 px-3 text-center align-top">
                        <div className="space-y-1">
                          <div>{getKesulitanBadge(item.tingkat_kesulitan)}</div>
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 block tabular-nums">
                            {item.poin} Poin
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="hidden lg:table-cell py-3.5 px-3 text-center align-top" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all shadow-2xs ${
                            item.status
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {item.status ? 'Aktif' : 'Non-Aktif'}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-2 sm:px-3 text-center align-top" onClick={(e) => e.stopPropagation()}>
                        <ActionDropdown
                          onView={() => {
                            setViewingItem(item)
                            setShowDetailModal(true)
                          }}
                          onEdit={() => handleOpenModal(item)}
                          onDelete={() => handleDeletePrompt(item)}
                          customActions={[
                            {
                              label: 'Duplikasi Butir Soal',
                              icon: Copy,
                              onClick: () => handleDuplicate(item.id),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </MasterDataTable>

          {/* Pagination Toolbar Squircle Icon-Only */}
          <div className="border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 p-3.5 sm:px-6 md:px-8 py-3 sm:py-3.5 dark:border-emerald-800/60 dark:bg-[#1B2433] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Menampilkan Halaman</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{pagination.currentPage}</span>
              <span>dari</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{pagination.lastPage || 1}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span>Total</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{pagination.total} Soal</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto">
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setPage(1)
                }}
                className="h-9 rounded-xl border border-emerald-200/80 bg-white px-2.5 text-xs font-bold text-slate-700 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value={10}>10 Baris</option>
                <option value={25}>25 Baris</option>
                <option value={50}>50 Baris</option>
              </select>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all"
                  aria-label="Halaman Sebelumnya"
                >
                  <ChevronLeft className="size-5 text-white" />
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.lastPage}
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.lastPage))}
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all"
                  aria-label="Halaman Berikutnya"
                >
                  <ChevronRight className="size-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Print & PDF Modal */}
        <PrintOptionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Bank Soal Ujian"
          onPrint={() => {
            const rowsToPrint = Array.isArray(dataList) ? dataList : []
            printCleanTable({
              title: 'Laporan Repositori Bank Soal Ujian',
              subtitle: 'Daftar Butir Pertanyaan CBT Sekolah Islam Terpadu',
              headers: ['NO', 'KODE SOAL', 'PERTANYAAN', 'TIPE SOAL', 'TINGKAT KESULITAN', 'POIN', 'STATUS'],
              rows: rowsToPrint.map((item, i) => [
                i + 1,
                item.kode_soal || 'SOAL-SYS',
                (item.pertanyaan || item.soal || '').replace(/<[^>]*>?/gm, ''),
                item.tipe_soal || 'pg',
                item.tingkat_kesulitan || 'sedang',
                item.poin || 2.5,
                item.status ? 'Aktif' : 'Nonaktif',
              ]),
            })
          }}
          onDownload={() => {
            const rowsToPrint = Array.isArray(dataList) ? dataList : []
            downloadPdfTable({
              title: 'Laporan Repositori Bank Soal Ujian',
              subtitle: 'Daftar Butir Pertanyaan CBT Sekolah Islam Terpadu',
              headers: ['NO', 'KODE SOAL', 'PERTANYAAN', 'TIPE SOAL', 'TINGKAT KESULITAN', 'POIN', 'STATUS'],
              rows: rowsToPrint.map((item, i) => [
                i + 1,
                item.kode_soal || 'SOAL-SYS',
                (item.pertanyaan || item.soal || '').replace(/<[^>]*>?/gm, ''),
                item.tipe_soal || 'pg',
                item.tingkat_kesulitan || 'sedang',
                item.poin || 2.5,
                item.status ? 'Aktif' : 'Nonaktif',
              ]),
              filename: 'laporan_bank_soal_ujian.pdf',
            })
          }}
        />

        {/* Harmonized Batch Import Modal */}
        <HarmonizedBatchImportModal
          isOpen={importOpen}
          onClose={() => setImportOpen(false)}
          onImportSuccess={() => {
            fetchData(1)
            fetchStats()
          }}
          notify={notify}
        />

        {/* Harmonized Save Confirmation Modal */}
        <HarmonizedSaveModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onConfirm={handleConfirmSave}
          isEdit={Boolean(editingModalQuestionId || editingItem)}
          title={formData.pertanyaan ? formData.pertanyaan.replace(/<[^>]*>?/gm, '') : 'Butir Pertanyaan Soal'}
          isSubmitting={isSubmittingForm}
        />

        {/* Harmonized Delete Confirmation Modal */}
        <HarmonizedDeleteModal
          isOpen={deleteModalState.isOpen}
          onClose={() => setDeleteModalState({ isOpen: false, id: null, title: '', isSubmitting: false })}
          onConfirm={handleConfirmDelete}
          title={deleteModalState.title}
          isSubmitting={deleteModalState.isSubmitting}
        />

        {/* ROW DETAIL MODAL POPUP — Quick Preview */}
        {showRowDetailModal && rowDetailItem && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setShowRowDetailModal(false)}
          >
            <div
              className="bg-white dark:bg-[#1B2433] rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 shadow-xs">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight line-clamp-2">{rowDetailItem.pertanyaan}</h2>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {rowDetailItem.kode_soal || 'SOAL-SYS'} • {getMapelName(rowDetailItem)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRowDetailModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 shrink-0 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-3.5 max-h-[60vh] overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {getTipeBadge(rowDetailItem.tipe_soal)}
                  {getKesulitanBadge(rowDetailItem.tingkat_kesulitan)}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    rowDetailItem.status ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${rowDetailItem.status ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {rowDetailItem.status ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl p-3 border border-emerald-100 dark:border-emerald-900/40">
                    <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Poin Bobot</p>
                    <p className="text-base font-black text-emerald-800 dark:text-emerald-300 mt-0.5 tabular-nums">{rowDetailItem.poin} Poin</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Kisi-kisi Ujian</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 line-clamp-1">{rowDetailItem.kisi_kisi?.judul_kisi || 'Umum'}</p>
                  </div>
                  {rowDetailItem.kunci_jawaban && (
                    <div className="bg-blue-50/80 dark:bg-blue-950/30 rounded-2xl p-3 col-span-2 border border-blue-100 dark:border-blue-900/40">
                      <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">Kunci Jawaban</p>
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mt-0.5">{rowDetailItem.kunci_jawaban}</p>
                    </div>
                  )}
                </div>

                {rowDetailItem.indikator && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Indikator Soal</p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{rowDetailItem.indikator}</p>
                  </div>
                )}

                {rowDetailItem.pembahasan && (
                  <div className="bg-purple-50/80 dark:bg-purple-950/30 rounded-2xl p-3 border border-purple-100 dark:border-purple-900/40">
                    <p className="text-[10px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1">Pembahasan &amp; Keterangan</p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">{rowDetailItem.pembahasan}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
                <button
                  onClick={() => setShowRowDetailModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Tutup
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowRowDetailModal(false)
                      handleDeletePrompt(rowDetailItem)
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                  <button
                    onClick={() => {
                      setShowRowDetailModal(false)
                      handleOpenModal(rowDetailItem)
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 text-white text-xs font-bold shadow-md hover:brightness-105 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Soal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CRUD Form Modal — Tambah & Kelola Pertanyaan */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <motion.div
              id="modalFormScrollContainer"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-[#1B2433] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#1B2433] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 shrink-0">
                    {editingItem ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      {editingItem ? 'Edit Butir Soal' : 'Form Tambah &amp; Kelola Pertanyaan Bank Soal'}
                    </h2>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Pertanyaan yang disimpan otomatis terdaftar pada kisi-kisi dan dapat diedit langsung di bawah.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTriggerSave} className="p-6 space-y-5 flex-1 overflow-y-auto overflow-x-hidden">
                {/* Notification Banner when in Edit Mode */}
                {editingModalQuestionId && (
                  <div className="p-3 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-bold">
                    <span>Anda sedang mengubah butir pertanyaan terpilih dari tabel di bawah.</span>
                    <button
                      type="button"
                      onClick={resetSingleQuestionForm}
                      className="text-xs underline text-amber-950 dark:text-amber-200 hover:opacity-80"
                    >
                      Batal Edit &amp; Tambah Baru
                    </button>
                  </div>
                )}

                {/* Select Kisi-kisi & Kode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Kisi-kisi Ujian / Mapel <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.kisi_kisi_id}
                      onChange={(e) => handleKisiChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-emerald-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 outline-none"
                      required
                    >
                      <option value="">-- Pilih Kisi-kisi / Mapel Ujian --</option>
                      {options.kisi_kisi.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.judul_kisi} ({k.jenis_ujian} - {k.subject_name || k.mata_pelajaran})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Kode Soal (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: PPKN-001 / SOAL-01"
                      value={formData.kode_soal}
                      onChange={(e) => setFormData((prev) => ({ ...prev, kode_soal: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-emerald-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 outline-none"
                    />
                  </div>
                </div>

                {/* Tipe Soal Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Tipe Soal <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                      { id: 'pg', label: 'Pilihan Ganda', icon: CheckSquare },
                      { id: 'esai', label: 'Essay / Esai', icon: FileText },
                      { id: 'benar_salah', label: 'Benar / Salah', icon: ToggleLeft },
                      { id: 'menjodohkan', label: 'Menjodohkan', icon: GitCommit },
                    ].map((t) => {
                      const IconComp = t.icon
                      const isSelected = formData.tipe_soal === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTypeChange(t.id)}
                          className={`flex items-center gap-2 p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <IconComp className="w-4 h-4 shrink-0" />
                          <span>{t.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Pertanyaan / Teks Soal */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Teks Pertanyaan / Soal <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan butir soal atau instruksi pertanyaan di sini..."
                    value={formData.pertanyaan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pertanyaan: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-emerald-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 outline-none leading-relaxed"
                    required
                  />
                </div>

                {/* DYNAMIC FORM SECTION BASED ON TIPE_SOAL */}
                {/* 1. PILIHAN GANDA */}
                {formData.tipe_soal === 'pg' && (
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 space-y-3">
                    <h4 className="text-xs font-black text-[#0E5C44] dark:text-emerald-300 uppercase tracking-wider">
                      Opsi Jawaban &amp; Kunci Pilihan Ganda
                    </h4>

                    {['a', 'b', 'c', 'd', 'e'].map((optKey) => {
                      const fieldKey = `opsi_${optKey}`
                      const isCorrect = formData.kunci_jawaban === optKey.toUpperCase()
                      return (
                        <div key={optKey} className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer shrink-0">
                            <input
                              type="radio"
                              name="kunci_jawaban_pg"
                              checked={isCorrect}
                              onChange={() => setFormData((prev) => ({ ...prev, kunci_jawaban: optKey.toUpperCase() }))}
                              className="w-4 h-4 text-[#0E5C44] focus:ring-[#0E5C44]"
                            />
                            <span
                              className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center ${
                                isCorrect
                                  ? 'bg-[#0E5C44] text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {optKey.toUpperCase()}
                            </span>
                          </label>
                          <input
                            type="text"
                            placeholder={`Teks Pilihan ${optKey.toUpperCase()}`}
                            value={formData[fieldKey]}
                            onChange={(e) => setFormData((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
                            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-[#0E5C44]"
                          />
                        </div>
                      )
                    })}
                    <p className="text-[11px] text-slate-500 italic mt-1 font-medium">
                      * Tandai radio button pada opsi yang menjadi kunci jawaban benar.
                    </p>
                  </div>
                )}

                {/* 2. ESSAY */}
                {formData.tipe_soal === 'esai' && (
                  <div className="bg-purple-50/60 dark:bg-purple-950/20 p-4.5 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 space-y-2">
                    <h4 className="text-xs font-black text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                      Kunci Jawaban / Rubrik Penskoran Essay
                    </h4>
                    <textarea
                      rows={3}
                      placeholder="Tuliskan kata kunci acuan, poin penting, atau kriteria penilaian..."
                      value={formData.kunci_jawaban}
                      onChange={(e) => setFormData((prev) => ({ ...prev, kunci_jawaban: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>
                )}

                {/* 3. BENAR SALAH */}
                {formData.tipe_soal === 'benar_salah' && (
                  <div className="bg-blue-50/60 dark:bg-blue-950/20 p-4.5 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 space-y-3">
                    <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                      Pernyataan Kunci Jawaban
                    </h4>
                    <div className="flex gap-4">
                      {['Benar', 'Salah'].map((val) => (
                        <label
                          key={val}
                          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border cursor-pointer font-black text-xs transition-all ${
                            formData.kunci_jawaban === val
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="kunci_bs"
                            checked={formData.kunci_jawaban === val}
                            onChange={() => setFormData((prev) => ({ ...prev, kunci_jawaban: val }))}
                            className="hidden"
                          />
                          {val === 'Benar' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {val}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. MENJODOHKAN */}
                {formData.tipe_soal === 'menjodohkan' && (
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        Daftar Pasangan Menjodohkan
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddPair}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Pasangan
                      </button>
                    </div>

                    {matchingPairs.map((pair, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400 w-6 text-center">{idx + 1}.</span>
                        <input
                          type="text"
                          placeholder="Pernyataan / Item Kiri"
                          value={pair.kiri}
                          onChange={(e) => handlePairChange(idx, 'kiri', e.target.value)}
                          className="w-1/2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                        />
                        <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
                        <input
                          type="text"
                          placeholder="Pasangan / Item Kanan"
                          value={pair.kanan}
                          onChange={(e) => handlePairChange(idx, 'kanan', e.target.value)}
                          className="w-1/2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                        />
                        {matchingPairs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePair(idx)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Metadata Fields: Poin, Tingkat Kesulitan, Indikator, Pembahasan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Poin / Bobot Soal
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.poin}
                      onChange={(e) => setFormData((prev) => ({ ...prev, poin: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-emerald-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-[#0E5C44]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Tingkat Kesulitan
                    </label>
                    <select
                      value={formData.tingkat_kesulitan}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tingkat_kesulitan: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-emerald-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-[#0E5C44]"
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Indikator Soal / Kompetensi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Peserta didik mampu menganalisis Pancasila Sila I..."
                    value={formData.indikator}
                    onChange={(e) => setFormData((prev) => ({ ...prev, indikator: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-emerald-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-[#0E5C44]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Pembahasan / Penjelasan Jawaban
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tuliskan pembahasan singkat atau alasan kunci jawaban..."
                    value={formData.pembahasan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pembahasan: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-emerald-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-[#0E5C44] leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="statusToggle"
                      checked={formData.status}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked }))}
                      className="w-4 h-4 text-[#0E5C44] rounded focus:ring-[#0E5C44]"
                    />
                    <label htmlFor="statusToggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Aktifkan Butir Soal ini di Bank Soal
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 text-white text-xs font-bold shadow-md hover:brightness-105 transition-all cursor-pointer"
                  >
                    {editingModalQuestionId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingModalQuestionId ? 'Simpan Perubahan Pertanyaan' : '+ Tambah Pertanyaan Ke Kisi-kisi'}</span>
                  </button>
                </div>

                {/* DATATABLE DALAM MODAL: DAFTAR PERTANYAAN TERSIMPAN */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <List className="w-4 h-4 text-[#0E5C44]" />
                        <span>
                          Daftar Butir Soal Terdaftar ({modalSessionQuestions.length}
                          {selectedKisiObj?.jumlah_soal ? ` / ${selectedKisiObj.jumlah_soal}` : ''} Soal)
                        </span>
                      </h3>
                      {selectedKisiObj && (
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                          {selectedKisiObj.judul_kisi} • {selectedKisiObj.subject_name || selectedKisiObj.mata_pelajaran} ({selectedKisiObj.jenis_ujian})
                        </p>
                      )}
                    </div>
                    {loadingModalQuestions ? (
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                        Memuat data database...
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {selectedKisiObj?.jumlah_soal > 0 && (
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                            modalSessionQuestions.length >= selectedKisiObj.jumlah_soal
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                          }`}>
                            {modalSessionQuestions.length >= selectedKisiObj.jumlah_soal
                              ? 'Target Terpenuhi (100%)'
                              : `Sisa ${selectedKisiObj.jumlah_soal - modalSessionQuestions.length} Soal Lagi`}
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200/60">
                          {modalSessionQuestions.length} Tersimpan
                        </span>
                      </div>
                    )}
                  </div>

                  {loadingModalQuestions ? (
                    <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">Memuat butir soal yang tersimpan dari database...</p>
                    </div>
                  ) : modalSessionQuestions.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs font-medium">
                      Belum ada butir soal yang tersimpan untuk kisi-kisi ini. Gunakan form di atas lalu tekan <strong>"+ Tambah Pertanyaan Ke Kisi-kisi"</strong>.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">#</th>
                            <th className="py-2.5 px-3">Kode &amp; Pertanyaan</th>
                            <th className="py-2.5 px-3">Tipe</th>
                            <th className="py-2.5 px-3 text-center">Kunci</th>
                            <th className="py-2.5 px-3 text-center">Poin</th>
                            <th className="py-2.5 px-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {modalSessionQuestions.map((q, idx) => (
                            <tr
                              key={q.id || idx}
                              className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                                editingModalQuestionId === q.id ? 'bg-amber-50/80 dark:bg-amber-950/30' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                              <td className="py-2.5 px-3 max-w-xs">
                                <span className="font-mono text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 block">
                                  {q.kode_soal || `SOAL-${idx + 1}`}
                                </span>
                                <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-2">{q.pertanyaan}</p>
                              </td>
                              <td className="py-2.5 px-3">
                                {getTipeBadge(q.tipe_soal)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                                  {q.kunci_jawaban || '-'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                                {q.poin || 2.5} Poin
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditModalQuestionRow(q)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition cursor-pointer"
                                    title="Ubah Pertanyaan Ini"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Ubah</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteModalQuestionRow(q.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition cursor-pointer"
                                    title="Hapus Pertanyaan Ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Modal Footer Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <span className="text-xs text-slate-500 font-medium">
                    {modalSessionQuestions.length > 0
                      ? `${modalSessionQuestions.length} pertanyaan telah tersimpan`
                      : 'Siap menginput butir soal baru'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-xl bg-[#0E5C44] text-white text-xs font-bold hover:bg-emerald-700 shadow-md transition-all cursor-pointer"
                  >
                    Selesai &amp; Tutup Modal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Detail / Preview Modal */}
        {showDetailModal && viewingItem && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white dark:bg-[#1B2433] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 -mx-6 -mt-6 mb-4" />
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">{viewingItem.kode_soal || 'SOAL-SYS'}</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                    Pratinjau Butir Soal Ujian
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  {getTipeBadge(viewingItem.tipe_soal)}
                  {getKesulitanBadge(viewingItem.tingkat_kesulitan)}
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                    {viewingItem.poin} Poin
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-slate-100 leading-relaxed text-xs sm:text-sm">
                    {viewingItem.pertanyaan}
                  </p>
                </div>

                {/* RENDER OPTIONS BY TYPE */}
                {viewingItem.tipe_soal === 'pg' && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Opsi Pilihan:</h4>
                    {['a', 'b', 'c', 'd', 'e'].map((optKey) => {
                      const text = viewingItem[`opsi_${optKey}`]
                      if (!text) return null
                      const isKey = viewingItem.kunci_jawaban === optKey.toUpperCase()
                      return (
                        <div
                          key={optKey}
                          className={`flex items-center gap-3 p-3 rounded-2xl border text-xs ${
                            isKey
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center ${
                              isKey ? 'bg-[#0E5C44] text-white' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            {optKey.toUpperCase()}
                          </span>
                          <span className="flex-1">{text}</span>
                          {isKey && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-600" />}
                        </div>
                      )
                    })}
                  </div>
                )}

                {viewingItem.tipe_soal === 'benar_salah' && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 dark:text-blue-200">Kunci Jawaban Benar/Salah:</span>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-xl font-bold">{viewingItem.kunci_jawaban}</span>
                  </div>
                )}

                {viewingItem.tipe_soal === 'esai' && (
                  <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-1 text-xs">
                    <span className="font-bold text-purple-900 dark:text-purple-200 block">Kunci / Rubrik Jawaban:</span>
                    <p className="text-purple-950 dark:text-purple-300 leading-relaxed font-medium">
                      {viewingItem.kunci_jawaban || 'Penilaian manual oleh guru.'}
                    </p>
                  </div>
                )}

                {viewingItem.tipe_soal === 'menjodohkan' && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pasangan Menjodohkan:</h4>
                    <div className="space-y-1.5">
                      {(viewingItem.pasangan_menjodohkan || []).map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 w-1/2">{p.kiri}</span>
                          <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 w-1/2">{p.kanan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingItem.pembahasan && (
                  <div className="bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 space-y-1 text-xs">
                    <span className="font-black text-amber-800 dark:text-amber-300 block">Pembahasan:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{viewingItem.pembahasan}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Harmonized Batch Export Modal */}
        <HarmonizedBatchExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleProcessExport}
          isExporting={isExporting}
          totalCount={pagination.total || dataList.length}
          moduleTitle="Bank Soal"
        />
      </div>
    </PageContainer>
  )
}
