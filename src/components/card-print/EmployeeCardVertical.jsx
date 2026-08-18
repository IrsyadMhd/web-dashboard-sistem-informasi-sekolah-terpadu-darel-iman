import { QRCodeSVG } from 'qrcode.react'

export default function EmployeeCardVertical({
  employee,
  template = 'green',
  pengaturan = {},
  formatDate,
  qrPayload,
  isPrint = false,
}) {
  if (!employee) return null

  const namaLengkap = `${employee.gelar_depan ? `${employee.gelar_depan} ` : ''}${employee.nama_lengkap || ''}${employee.gelar_belakang ? `, ${employee.gelar_belakang}` : ''}`
  const initials = (employee.nama_lengkap || 'PE').substring(0, 2).toUpperCase()
  const schoolName = pengaturan.school_name || 'YAYASAN DAR EL-IMAN'
  const appName = pengaturan.application_name || 'ISLAMIC SCHOOL'
  const formattedBirthDate = formatDate ? formatDate(employee.tanggal_lahir) : (employee.tanggal_lahir || '—')

  return (
    <article
      className={`employee-id-card employee-id-card--vertical employee-id-card--${template} ${
        isPrint ? 'employee-card-print-canvas--vertical' : ''
      }`}
    >
      <div className="employee-id-card__pattern" aria-hidden="true" />
      <div className="employee-id-card__top-wave" aria-hidden="true" />

      <header className="employee-id-card__brand">
        <span className="employee-id-card__logo">
          {pengaturan.logo_url ? (
            <img src={pengaturan.logo_url} alt={`Logo ${schoolName}`} />
          ) : (
            <b>{pengaturan.logo_text || 'YDE'}</b>
          )}
        </span>
        <strong>{schoolName}</strong>
        <small>{appName}</small>
        <em>Berilmu, Berakhlak, Beramal</em>
      </header>

      <div className="employee-id-card__photo">
        <span className="employee-id-card__photo-initials">{initials}</span>
        {employee.foto && (
          <img
            src={employee.foto}
            alt={namaLengkap}
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden'
            }}
          />
        )}
      </div>

      <div className="employee-id-card__identity">
        <h3>{namaLengkap}</h3>
        <strong>{employee.jabatan_name || 'Pegawai'}</strong>
      </div>

      <dl className="employee-id-card__meta">
        <div>
          <dt>NIY</dt>
          <dd>{employee.niy || '—'}</dd>
        </div>
        <div>
          <dt>Unit Kerja</dt>
          <dd>{employee.unit_name || '—'}</dd>
        </div>
        <div>
          <dt>Tanggal Lahir</dt>
          <dd>{formattedBirthDate}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{employee.status_pegawai || employee.status || '—'}</dd>
        </div>
      </dl>

      <div className="employee-id-card__qr">
        <QRCodeSVG
          value={qrPayload || employee.niy || employee.email || 'SIMSIT'}
          size={91}
          level="M"
          marginSize={4}
          bgColor="#ffffff"
          fgColor="#0f172a"
          title={`QR akses SIMSIT ${namaLengkap}`}
        />
        <span>SCAN UNTUK VERIFIKASI</span>
      </div>

      <footer>
        <b>
          Generasi Beriman, Berilmu,
          <br />
          Berakhlak Mulia
        </b>
        <span>
          TAHUN AJARAN
          <br />
          2025/2026
        </span>
      </footer>
    </article>
  )
}
