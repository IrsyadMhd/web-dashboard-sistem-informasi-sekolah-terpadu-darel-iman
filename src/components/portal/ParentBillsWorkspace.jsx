import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Calendar,
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  Receipt,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react'
import { Card } from '../tailgrids/core/card'
import { Badge } from '../tailgrids/core/badge'
import { Button } from '../tailgrids/core/button'
import AppTabs from '../app/AppTabs'
import { printCleanTable, resolveFoundationName } from '../../utils/printHelper'
import { usePengaturanStore } from '../../stores/pengaturanStore'

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(val || 0)
  )

const formatDate = (val) => {
  if (!val) return '-'
  try {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(val))
  } catch {
    return val
  }
}

export default function ParentBillsWorkspace({ bills = [], loading = false, student }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [activeReceipt, setActiveReceipt] = useState(null)
  const [copiedVa, setCopiedVa] = useState(false)
  const pengaturan = usePengaturanStore((state) => state.pengaturan)
  const foundationName = resolveFoundationName(pengaturan)

  const studentMeta = student?.metadata || {}
  const studentName = student?.nama_lengkap || student?.full_name || student?.name || 'Ananda'
  const studentNis = student?.nis || studentMeta.nis || ''
  const bsiPrefix = pengaturan?.bsi_va_prefix || '9023'
  const studentVa = studentMeta.no_va || studentMeta.nis_pembayaran || student?.no_va || (studentNis ? `${bsiPrefix}${String(studentNis).replace(/\D/g, '')}` : '')

  const handleCopyVa = () => {
    if (!studentVa) return
    navigator.clipboard.writeText(studentVa)
    setCopiedVa(true)
    setTimeout(() => setCopiedVa(false), 2000)
  }

  const safeBills = useMemo(() => (Array.isArray(bills) ? bills : []), [bills])

  const stats = useMemo(() => {
    let totalNominal = 0
    let paidNominal = 0
    let unpaidNominal = 0
    let totalCount = safeBills.length
    let paidCount = 0
    let unpaidCount = 0

    safeBills.forEach((b) => {
      const amount = Number(b.amount || 0)
      totalNominal += amount

      const isPaid = String(b.status).toUpperCase() === 'PAID'
      if (isPaid) {
        paidNominal += amount
        paidCount++
      } else {
        unpaidNominal += amount
        unpaidCount++
      }
    })

    return { totalNominal, paidNominal, unpaidNominal, totalCount, paidCount, unpaidCount }
  }, [safeBills])

  const filteredBills = useMemo(() => {
    return safeBills.filter((b) => {
      const status = String(b.status || 'UNPAID').toUpperCase()
      const title = String(b.title || '').toLowerCase()
      const category = String(b.fee_category?.name || b.feeCategory?.name || '').toLowerCase()
      const isOverdue = status === 'UNPAID' && b.due_date && new Date(b.due_date) < new Date()

      let statusMatch = true
      if (filter === 'unpaid') statusMatch = status === 'UNPAID' && !isOverdue
      if (filter === 'paid') statusMatch = status === 'PAID'
      if (filter === 'overdue') statusMatch = isOverdue

      const searchMatch = !search || title.includes(search.toLowerCase()) || category.includes(search.toLowerCase())

      return statusMatch && searchMatch
    })
  }, [safeBills, filter, search])

  const printReceipt = (bill, payment) => {
    setActiveReceipt({ bill, payment })
    const activePayment = payment || {}
    const studentName = bill?.student?.nama_lengkap || bill?.student?.full_name || bill?.student?.name || '-'
    const unitName = bill?.student?.unit?.nama_unit || bill?.student?.unit?.name || resolveFoundationName()
    printCleanTable({
      title: 'BUKTI PEMBAYARAN & KUITANSI RESMI (SPP)',
      subtitle: `No. Kuitansi: ${activePayment.invoice_number || 'INV-OFFICIAL'} | Tanggal: ${activePayment.paid_at ? new Date(activePayment.paid_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' })}`,
      headers: ['Uraian Tagihan', 'Nama Siswa', 'NIS', 'Kelas', 'Metode Pembayaran', 'Jumlah Diterima', 'Status'],
      rows: [[
        bill?.title || 'Pembayaran Tagihan SPP',
        studentName,
        bill?.student?.nis || '-',
        bill?.student?.kelas?.nama_kelas || bill?.student?.class_name || '-',
        activePayment.payment_method || 'Tunai / Transfer',
        formatRupiah(activePayment.paid_amount || bill?.amount || 0),
        'LUNAS - TERVERIFIKASI KASIR',
      ]],
      unit: unitName,
      orientation: 'portrait',
      customFooter: `
        <div style="display:flex; justify-content:space-between; margin-top:35px; font-size:9pt; text-align:center;">
          <div>
            <p style="margin:0 0 45px 0;">Penyetor / Orang Tua Siswa</p>
            <p style="margin:0; font-weight:bold;">(${studentName !== '-' ? studentName : 'Orang Tua / Wali Santri'})</p>
          </div>
          <div>
            <p style="margin:0 0 45px 0;">Kasir / Bagian Keuangan</p>
            <p style="margin:0; font-weight:bold;">(${activePayment.metadata?.cashier_name || 'Petugas Keuangan'})</p>
          </div>
        </div>
      `,
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. HERO KPI STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden rounded-[20px] border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-5 shadow-xs dark:border-emerald-500/30 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Kewajiban</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{formatRupiah(stats.totalNominal)}</h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {stats.totalCount} tagihan terdaftar
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden rounded-[20px] border border-blue-500/25 bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-transparent p-5 shadow-xs dark:border-blue-500/30 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sudah Dilunasi</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-blue-600 dark:text-blue-400">{formatRupiah(stats.paidNominal)}</h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {stats.paidCount} tagihan lunas
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden rounded-[20px] border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-5 shadow-xs dark:border-amber-500/30 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sisa Belum Lunas</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black text-amber-600 dark:text-amber-400">{formatRupiah(stats.unpaidNominal)}</h3>
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {stats.unpaidCount} tagihan menunggu pembayaran
            </p>
          </div>
        </Card>
      </div>

      {/* 2. INFORMASI PEMBAYARAN RESMI & VIRTUAL ACCOUNT BSI ANANDA */}
      <div className="grid grid-cols-1 gap-4">
        {/* Virtual Account BSI Khusus Ananda */}
        <Card className="rounded-[22px] border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white p-4.5 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/30">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                    Bank Syariah Indonesia (BSI)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                    <Sparkles className="h-3 w-3" />
                    VA Otomatis
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1">
                  Virtual Account Ananda: {studentName}
                </h4>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="rounded-xl border border-emerald-300 bg-white px-3 py-1.5 font-mono text-sm sm:text-base font-extrabold text-emerald-800 shadow-inner dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-300">
                    {studentVa || 'Belum Dibuat'}
                  </div>
                  {studentVa && (
                    <button
                      type="button"
                      onClick={handleCopyVa}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-sm active:scale-95"
                    >
                      {copiedVa ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-200" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin VA</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dapat dibayarkan melalui <b>BSI Mobile</b>, <b>ATM BSI</b>, atau <b>Transfer Antar Bank</b> (Pilih Bank BSI / Kode Bank <b>451</b>). Tagihan langsung terverifikasi otomatis.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. TOOLBAR & FILTER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AppTabs
          tabs={[
            { id: 'all', label: 'Semua Tagihan' },
            { id: 'unpaid', label: 'Belum Lunas' },
            { id: 'paid', label: 'Lunas' },
            { id: 'overdue', label: 'Jatuh Tempo' },
          ]}
          activeTab={filter}
          onChange={setFilter}
          ariaLabel="Filter status tagihan"
          size="sm"
        />

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jenis tagihan..."
            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      {/* 4. LIST TAGIHAN & KUITANSI */}
      <div className="space-y-3">
        {filteredBills.map((b) => {
          const status = String(b.status || 'UNPAID').toUpperCase()
          const isPaid = status === 'PAID'
          const isOverdue = !isPaid && b.due_date && new Date(b.due_date) < new Date()
          const categoryName = b.fee_category?.name || b.feeCategory?.name || 'Biaya Sekolah'
          const payments = Array.isArray(b.payments) ? b.payments : []

          return (
            <motion.div key={b.id} whileHover={{ y: -1 }}>
              <Card className="rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge color="cyan" size="sm" className="font-bold">
                        {categoryName}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        Jatuh Tempo: {formatDate(b.due_date)}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{b.title}</h3>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-white">{formatRupiah(b.amount)}</p>
                    <div className="mt-1 flex justify-end">
                      {isPaid ? (
                        <Badge color="success" size="sm" className="font-extrabold">
                          LUNAS
                        </Badge>
                      ) : isOverdue ? (
                        <Badge color="error" size="sm" className="font-extrabold">
                          TERLAMBAT
                        </Badge>
                      ) : (
                        <Badge color="warning" size="sm" className="font-extrabold">
                          BELUM LUNAS
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIWAYAT PELUNASAN / KUITANSI */}
                {payments.length > 0 && (
                  <div className="mt-4 rounded-xl bg-slate-50/70 p-3.5 dark:bg-slate-800/40">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Riwayat Pembayaran & Kuitansi:</p>
                    <div className="mt-2 space-y-2">
                      {payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-2.5 text-xs shadow-2xs dark:bg-slate-900"
                        >
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-emerald-600" />
                            <div>
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                {p.invoice_number || 'INV-OFFICIAL'}
                              </span>
                              <span className="ml-2 text-[11px] text-slate-400">
                                ({p.payment_method || 'TRANSFER'}) • {formatDate(p.paid_at || p.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-700 dark:text-emerald-300">
                              {formatRupiah(p.paid_amount || b.amount)}
                            </span>
                            <Button
                              type="button"
                              size="xs"
                              variant="ghost"
                              onClick={() => printReceipt(b, p)}
                              className="cursor-pointer gap-1 text-[11px] text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              Kuitansi
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )
        })}

        {!filteredBills.length && (
          <Card className="rounded-[20px] border border-dashed border-slate-300 p-16 text-center text-xs text-slate-400 dark:border-slate-700">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            Tidak ada data tagihan yang sesuai kriteria pencarian.
          </Card>
        )}
      </div>

      {/* 5. PRINT RECEIPT TEMPLATE (HIDDEN ON SCREEN, VISIBLE ON PRINT) */}
      {activeReceipt && (
        <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-8">
          <div className="max-w-xl mx-auto border-2 border-slate-800 p-6 rounded-lg text-slate-900">
            <div className="text-center border-b-2 border-slate-800 pb-4">
              <h2 className="text-lg font-black uppercase tracking-wider">{foundationName}</h2>
              <p className="text-xs">Sistem Manajemen Sekolah Terpadu — Bukti Pelunasan Resmi (Kuitansi)</p>
            </div>
            <div className="mt-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span>No. Kuitansi:</span>
                <span className="font-mono font-bold">{activeReceipt.payment.invoice_number || 'INV-OFFICIAL'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal Bayar:</span>
                <span>{formatDate(activeReceipt.payment.paid_at || activeReceipt.payment.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Nama Siswa:</span>
                <span className="font-bold">{student?.name || student?.full_name || 'Siswa'}</span>
              </div>
              <div className="flex justify-between">
                <span>Kelas:</span>
                <span>{student?.class_name || student?.kelas?.name || '-'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-2 font-bold">
                <span>Uraian:</span>
                <span>{activeReceipt.bill.title}</span>
              </div>
              <div className="flex justify-between text-base font-black text-emerald-800 pt-2">
                <span>Jumlah Diterima:</span>
                <span>{formatRupiah(activeReceipt.payment.paid_amount || activeReceipt.bill.amount)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Status:</span>
                <span className="font-bold uppercase text-emerald-700">LUNAS - TERVERIFIKASI SISTEM</span>
              </div>
            </div>
            <div className="mt-8 flex justify-between text-center text-xs">
              <div>
                <p>Orang Tua / Penyetor</p>
                <div className="h-12"></div>
                <p className="font-bold">({student?.parent_name || 'Wali Murid'})</p>
              </div>
              <div>
                <p>Bendahara / Petugas TU</p>
                <div className="h-12"></div>
                <p className="font-bold">(Tata Usaha Keuangan)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
