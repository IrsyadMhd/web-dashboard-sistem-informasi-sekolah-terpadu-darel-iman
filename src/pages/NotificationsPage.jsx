import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCheck, Bell } from 'lucide-react'
import {
  useAksiPengumumanSekolah,
  useDaftarPengumumanSekolah,
} from '../hooks/useDashboardPemantauan'
import { reportService } from '../services/reportService'
import ConfirmDialog from '../components/app/ConfirmDialog'

export default function NotificationsPage() {
  const { data: daftarPengumuman } = useDaftarPengumumanSekolah({ per_page: 20 })
  const aksiPengumuman = useAksiPengumumanSekolah()
  const [notifications, setNotifications] = useState([])
  const [loadingNotif, setLoadingNotif] = useState(true)

  // Dialog Konfirmasi States
  const [pendingPengumuman, setPendingPengumuman] = useState(null)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadNotifications = useCallback(async () => {
    try {
      setLoadingNotif(true)
      const data = await reportService.notifications()
      setNotifications(data.data || data || [])
    } catch (_err) {
      // Abaikan jika belum ada notifikasi
    } finally {
      setLoadingNotif(false)
    }
  }, [])

  useEffect(() => { loadNotifications() }, [loadNotifications])

  const handleMarkRead = async (id) => {
    await reportService.markNotificationRead(id)
    loadNotifications()
  }

  const handleMarkAllRead = async () => {
    await reportService.markAllNotificationsRead()
    loadNotifications()
  }

  const formPengumuman = useForm({
    defaultValues: {
      judul_pengumuman: '',
      isi_pengumuman: '',
      target_peran: 'Semua',
      mulai_tampil: new Date().toISOString().slice(0, 10),
      selesai_tampil: '',
      prioritas: 1,
      status_aktif: true,
    },
  })

  const submitPengumuman = (values) => {
    const payload = {
      judul_pengumuman: values.judul_pengumuman,
      isi_pengumuman: values.isi_pengumuman,
      target_peran: [values.target_peran],
      mulai_tampil: values.mulai_tampil,
      selesai_tampil: values.selesai_tampil || null,
      prioritas: Number(values.prioritas),
      status_aktif: values.status_aktif,
      data_tambahan: { sumber: 'modul-notifikasi' },
    }
    setPendingPengumuman(payload)
    setShowSaveConfirm(true)
  }

  const handleConfirmSavePengumuman = async () => {
    if (!pendingPengumuman) return
    await aksiPengumuman.tambah.mutateAsync(pendingPengumuman)
    formPengumuman.reset({
      ...formPengumuman.getValues(),
      judul_pengumuman: '',
      isi_pengumuman: '',
    })
    setShowSaveConfirm(false)
  }

  const handleConfirmDeletePengumuman = async () => {
    if (!deleteTarget) return
    await aksiPengumuman.hapus.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="content-grid">
      {/* Seksi Notifikasi Sistem Pengguna */}
      <section className="panel wide">
        <div className="panel-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3><Bell size={20} style={{ display: 'inline', marginRight: 8 }} /> Notifikasi Sistem & Pemberitahuan</h3>
          <button type="button" className="topbar-action" onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Tandai Semua Dibaca
          </button>
        </div>
        <p className="modul-lead">Pemberitahuan aktivitas, presensi, dan sistem untuk akun Anda.</p>

        <div className="laporan-list" style={{ marginTop: 16 }}>
          {loadingNotif ? (
            <p>Memuat notifikasi...</p>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="laporan-item" style={{ background: n.is_read ? '#f8fafc' : '#eff6ff' }}>
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <small>{new Date(n.created_at).toLocaleString('id-ID')}</small>
                </div>
                {!n.is_read && (
                  <button type="button" className="aksi kecil" onClick={() => handleMarkRead(n.id)}>
                    Tandai Dibaca
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="subtle-text">Belum ada notifikasi baru untuk akun Anda.</p>
          )}
        </div>
      </section>

      {/* Seksi Pengumuman Sekolah */}
      <section className="panel modul-crud-page wide" style={{ marginTop: 24 }}>
        <h3>Manajemen Pengumuman Sekolah</h3>
        <p className="modul-lead">Kelola publikasi pengumuman sekolah yang akan tampil di dashboard pengguna.</p>

        <form className="form-grid" onSubmit={formPengumuman.handleSubmit(submitPengumuman)}>
          <input type="text" placeholder="Judul pengumuman" {...formPengumuman.register('judul_pengumuman', { required: true })} />
          <input type="text" placeholder="Isi ringkas" {...formPengumuman.register('isi_pengumuman', { required: true })} />
          <input type="text" placeholder="Target peran" {...formPengumuman.register('target_peran')} />
          <input type="date" {...formPengumuman.register('mulai_tampil', { required: true })} />
          <input type="date" {...formPengumuman.register('selesai_tampil')} />
          <input type="number" min="1" max="10" placeholder="Prioritas" {...formPengumuman.register('prioritas')} />
          <select {...formPengumuman.register('status_aktif')}>
            <option value={true}>Aktif</option>
            <option value={false}>Nonaktif</option>
          </select>
          <div className="form-actions">
            <button type="submit" className="aksi simpan">Simpan Pengumuman</button>
          </div>
        </form>

        <div className="table-wrap modul-table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Judul</th>
                <th>Mulai</th>
                <th>Selesai</th>
                <th>Prioritas</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(daftarPengumuman?.data || []).map((row) => (
                <tr key={row.id}>
                  <td>{row.judul_pengumuman}</td>
                  <td>{row.mulai_tampil}</td>
                  <td>{row.selesai_tampil || '-'}</td>
                  <td>{row.prioritas}</td>
                  <td>{row.status_aktif ? 'aktif' : 'nonaktif'}</td>
                  <td>
                    <button
                      type="button"
                      className="aksi kecil danger"
                      onClick={() => setDeleteTarget(row)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Konfirmasi Simpan Pengumuman */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSavePengumuman}
        isLoading={aksiPengumuman.tambah.isPending}
        action="create"
        title="Konfirmasi Simpan Pengumuman"
        message={`Apakah Anda yakin ingin mempublikasikan pengumuman "${pendingPengumuman?.judul_pengumuman}"?`}
      />

      {/* Konfirmasi Hapus Pengumuman */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeletePengumuman}
        isLoading={aksiPengumuman.hapus.isPending}
        action="delete"
        title="Konfirmasi Hapus Pengumuman"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${deleteTarget?.judul_pengumuman}"?`}
      />
    </div>
  )
}

