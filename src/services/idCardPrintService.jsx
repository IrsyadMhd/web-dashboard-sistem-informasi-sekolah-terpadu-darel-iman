import React from 'react'
import { createRoot } from 'react-dom/client'
import { QRCodeSVG } from 'qrcode.react'

const EMPLOYEE_TEMPLATES = {
  green: { primary: '#087557', dark: '#064e3b', accent: '#F6C143', soft: '#ecfdf5' },
  blue: { primary: '#2563eb', dark: '#1d4ed8', accent: '#93C5FD', soft: '#eff6ff' },
  purple: { primary: '#7e22ce', dark: '#581c87', accent: '#C4B5FD', soft: '#f5f3ff' },
  orange: { primary: '#f97316', dark: '#c2410c', accent: '#FDBA74', soft: '#fff7ed' },
}

const STUDENT_THEMES = {
  green: { primary: '#0E5C44', dark: '#064e3b', soft: '#ecfdf5', accent: '#F6C143' },
  blue: { primary: '#1D4ED8', dark: '#1e40af', soft: '#eff6ff', accent: '#93C5FD' },
  purple: { primary: '#6D28D9', dark: '#5b21b6', soft: '#f5f3ff', accent: '#C4B5FD' },
  orange: { primary: '#EA580C', dark: '#c2410c', soft: '#fff7ed', accent: '#FDBA74' },
  teal: { primary: '#0F766E', dark: '#115e59', soft: '#f0fdfa', accent: '#99F6E4' },
  navy: { primary: '#172554', dark: '#0f172a', soft: '#eff6ff', accent: '#60A5FA' },
}

function getOrCreateIframe() {
  let iframe = document.getElementById('id-card-print-iframe')
  if (iframe) {
    iframe.remove()
  }
  iframe = document.createElement('iframe')
  iframe.id = 'id-card-print-iframe'
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.visibility = 'hidden'
  iframe.style.zIndex = '-9999'
  document.body.appendChild(iframe)
  return iframe
}

function waitForAssets(doc) {
  return new Promise((resolve) => {
    const images = Array.from(doc.querySelectorAll('img'))
    const promises = images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve()
      }
      return new Promise((res) => {
        img.onload = res
        img.onerror = res
        setTimeout(res, 1200)
      })
    })

    const fontPromise = doc.fonts && doc.fonts.ready ? doc.fonts.ready.catch(() => {}) : Promise.resolve()

    Promise.all([...promises, fontPromise]).then(() => {
      setTimeout(resolve, 150)
    })
  })
}

function getPrintCSS(orientation, vars) {
  const isHoriz = orientation === 'horizontal'
  const width = isHoriz ? '85.60mm' : '53.98mm'
  const height = isHoriz ? '53.98mm' : '85.60mm'

  return `
    @page {
      size: ${width} ${height};
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: ${width} !important;
      height: ${height} !important;
      overflow: hidden !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    :root {
      --primary: ${vars.primary};
      --dark: ${vars.dark};
      --accent: ${vars.accent};
      --soft: ${vars.soft};
    }
    .print-card-root {
      position: relative;
      width: ${width};
      height: ${height};
      overflow: hidden;
      background: #ffffff;
      color: #0f172a;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .photo-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary);
      color: #ffffff;
      font-weight: 900;
      font-size: 4.2mm;
      letter-spacing: 0.05em;
    }
  `
}

/* ==========================================
   EMPLOYEE PRINT CARDS
   ========================================== */

function EmployeeCardPrintHorizontal({ employee, template = 'green', pengaturan = {}, formatDate, qrPayload }) {
  const t = EMPLOYEE_TEMPLATES[template] || EMPLOYEE_TEMPLATES.green
  const namaLengkap = `${employee.gelar_depan ? `${employee.gelar_depan} ` : ''}${employee.nama_lengkap || ''}${employee.gelar_belakang ? `, ${employee.gelar_belakang}` : ''}`
  const initials = (employee.nama_lengkap || 'PE').substring(0, 2).toUpperCase()
  const schoolName = pengaturan.school_name || 'YAYASAN DAR EL-IMAN'
  const appName = pengaturan.application_name || 'ISLAMIC SCHOOL'
  const formattedBirthDate = formatDate ? formatDate(employee.tanggal_lahir) : (employee.tanggal_lahir || '—')

  return (
    <div className="print-card-root" style={{ position: 'relative', width: '85.60mm', height: '53.98mm', background: '#fff' }}>
      {/* Pattern background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: '3mm 3mm' }} />

      {/* Top Wave */}
      <div style={{ position: 'absolute', bottom: '-22mm', left: '-8mm', width: '102mm', height: '35mm', borderTop: '0.8mm solid #f6c143', borderRadius: '50% 50% 0 0', background: `linear-gradient(120deg, ${t.primary}, ${t.dark})`, zIndex: 1 }} />

      {/* Brand Header */}
      <header style={{ position: 'absolute', top: '3mm', left: '4mm', display: 'flex', alignItems: 'center', gap: '2mm', zIndex: 2 }}>
        <div style={{ width: '8mm', height: '9mm', border: `0.4mm solid ${t.primary}`, borderRadius: '2mm', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: '#fff', overflow: 'hidden', padding: '0.4mm' }}>
          {pengaturan.logo_url ? (
            <img src={pengaturan.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <b style={{ color: t.primary, fontSize: '2mm', fontWeight: 900 }}>YDE</b>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ color: t.dark, fontSize: '2.6mm', fontWeight: 900, lineHeight: 1 }}>{schoolName}</strong>
          <small style={{ color: '#475569', fontSize: '1.4mm', fontWeight: 700, marginTop: '0.3mm' }}>{appName}</small>
          <em style={{ color: '#64748b', fontSize: '1.1mm', fontStyle: 'italic' }}>Berilmu, Berakhlak, Beramal</em>
        </div>
      </header>

      {/* Badge Top Right */}
      <span style={{ position: 'absolute', top: 0, right: 0, background: t.dark, color: '#fff', padding: '1.5mm 3.5mm', borderRadius: '0 0 0 3mm', fontSize: '1.4mm', fontWeight: 900, letterSpacing: '0.04em', zIndex: 2 }}>
        KARTU PEGAWAI
      </span>

      {/* Photo */}
      <div style={{ position: 'absolute', top: '15mm', left: '4.5mm', width: '19.5mm', height: '23mm', borderRadius: '2mm', border: '0.6mm solid #fff', boxShadow: '0 0.8mm 2mm rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 2, background: t.dark }}>
        {employee.foto ? (
          <img src={employee.foto} alt={namaLengkap} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
        ) : null}
        <div className="photo-fallback" style={{ display: employee.foto ? 'none' : 'flex' }}>{initials}</div>
      </div>

      {/* Identity */}
      <div style={{ position: 'absolute', top: '14.5mm', left: '26mm', width: '38mm', zIndex: 2 }}>
        <h3 style={{ fontSize: '2.4mm', fontWeight: 900, color: t.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{namaLengkap}</h3>
        <strong style={{ display: 'inline-block', marginTop: '0.6mm', background: t.dark, color: '#fff', padding: '0.4mm 2mm', borderRadius: '1.5mm', fontSize: '1.3mm', fontWeight: 800 }}>
          {employee.jabatan_name || 'Pegawai'}
        </strong>
      </div>

      {/* Metadata */}
      <dl style={{ position: 'absolute', top: '23mm', left: '26mm', width: '38mm', fontSize: '1.35mm', display: 'grid', gap: '0.7mm', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '14mm 1fr' }}>
          <dt style={{ color: t.primary, fontWeight: 800 }}>NIY</dt>
          <dd style={{ color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>: {employee.niy || '—'}</dd>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '14mm 1fr' }}>
          <dt style={{ color: t.primary, fontWeight: 800 }}>Unit Kerja</dt>
          <dd style={{ color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>: {employee.unit_name || '—'}</dd>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '14mm 1fr' }}>
          <dt style={{ color: t.primary, fontWeight: 800 }}>Tanggal Lahir</dt>
          <dd style={{ color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>: {formattedBirthDate}</dd>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '14mm 1fr' }}>
          <dt style={{ color: t.primary, fontWeight: 800 }}>Status</dt>
          <dd style={{ color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>: {employee.status_pegawai || employee.status || '—'}</dd>
        </div>
      </dl>

      {/* QR Code */}
      <div style={{ position: 'absolute', top: '15mm', right: '4mm', width: '16mm', textStyle: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
        <div style={{ background: '#fff', padding: '0.6mm', borderRadius: '1.5mm', border: `0.3mm solid ${t.primary}` }}>
          <QRCodeSVG value={qrPayload || employee.niy || employee.email || 'SIMSIT'} size={50} level="M" marginSize={2} bgColor="#ffffff" fgColor="#0f172a" />
        </div>
        <span style={{ fontSize: '0.9mm', fontWeight: 900, color: t.dark, marginTop: '0.6mm', letterSpacing: '0.02em' }}>SCAN UNTUK VERIFIKASI</span>
      </div>

      {/* Footer */}
      <footer style={{ position: 'absolute', bottom: 0, left: 0, width: '85.60mm', height: '6.8mm', background: `linear-gradient(100deg, ${t.primary}, ${t.dark})`, borderTop: '0.6mm solid #f6c143', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '0 4mm', color: '#fff', fontSize: '1.2mm', zIndex: 3 }}>
        <b style={{ fontWeight: 700, lineHeight: 1.1 }}>Generasi Beriman, Berilmu,<br />Berakhlak Mulia</b>
        <span style={{ borderLeft: '0.3mm solid rgba(255,255,255,0.4)', paddingLeft: '2mm', lineHeight: 1.1, textAlign: 'right' }}>TAHUN AJARAN<br />2025/2026</span>
      </footer>
    </div>
  )
}

function EmployeeCardPrintVertical({ employee, template = 'green', pengaturan = {}, formatDate, qrPayload }) {
  const t = EMPLOYEE_TEMPLATES[template] || EMPLOYEE_TEMPLATES.green
  const namaLengkap = `${employee.gelar_depan ? `${employee.gelar_depan} ` : ''}${employee.nama_lengkap || ''}${employee.gelar_belakang ? `, ${employee.gelar_belakang}` : ''}`
  const initials = (employee.nama_lengkap || 'PE').substring(0, 2).toUpperCase()
  const schoolName = pengaturan.school_name || 'YAYASAN DAR EL-IMAN'
  const appName = pengaturan.application_name || 'ISLAMIC SCHOOL'
  const formattedBirthDate = formatDate ? formatDate(employee.tanggal_lahir) : (employee.tanggal_lahir || '—')

  return (
    <div className="print-card-root" style={{ position: 'relative', width: '53.98mm', height: '85.60mm', background: '#fff' }}>
      {/* Pattern background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: '3mm 3mm' }} />

      {/* Top Wave */}
      <div style={{ position: 'absolute', top: 0, left: '-2.5mm', width: '59mm', height: '24mm', borderBottom: '0.8mm solid #f6c143', borderRadius: '0 0 48% 48%', background: `linear-gradient(125deg, ${t.dark}, ${t.primary})`, zIndex: 1 }} />

      {/* Brand Header */}
      <header style={{ position: 'absolute', top: '3mm', left: '3.5mm', right: '3.5mm', display: 'flex', alignItems: 'center', gap: '2mm', zIndex: 2, color: '#fff' }}>
        <div style={{ width: '8mm', height: '9mm', border: '0.4mm solid #fff', borderRadius: '1.8mm', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: '#fff', overflow: 'hidden', padding: '0.3mm', flexShrink: 0 }}>
          {pengaturan.logo_url ? (
            <img src={pengaturan.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <b style={{ color: t.primary, fontSize: '2mm', fontWeight: 900 }}>YDE</b>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <strong style={{ color: '#fff', fontSize: '2.5mm', fontWeight: 900, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{schoolName}</strong>
          <small style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.3mm', fontWeight: 700, marginTop: '0.3mm' }}>{appName}</small>
          <em style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1mm', fontStyle: 'italic' }}>Berilmu, Berakhlak, Beramal</em>
        </div>
      </header>

      {/* Photo */}
      <div style={{ position: 'absolute', top: '16.5mm', left: '50%', transform: 'translateX(-50%)', width: '20mm', height: '20mm', borderRadius: '50%', border: '0.8mm solid #fff', boxShadow: '0 1mm 2.5mm rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 3, background: t.dark }}>
        {employee.foto ? (
          <img src={employee.foto} alt={namaLengkap} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
        ) : null}
        <div className="photo-fallback" style={{ display: employee.foto ? 'none' : 'flex' }}>{initials}</div>
      </div>

      {/* Identity */}
      <div style={{ position: 'absolute', top: '38mm', left: '3mm', right: '3mm', textAlign: 'center', zIndex: 2 }}>
        <h3 style={{ fontSize: '2.3mm', fontWeight: 900, color: t.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1 }}>{namaLengkap}</h3>
        <strong style={{ display: 'inline-block', marginTop: '0.6mm', background: t.dark, color: '#fff', padding: '0.4mm 2.5mm', borderRadius: '1.5mm', fontSize: '1.3mm', fontWeight: 800 }}>
          {employee.jabatan_name || 'Pegawai'}
        </strong>
      </div>

      {/* Metadata */}
      <dl style={{ position: 'absolute', top: '46.5mm', left: '5mm', right: '5mm', fontSize: '1.35mm', display: 'grid', gap: '0.8mm', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '15mm 1fr' }}>
          <dt style={{ color: '#334155', fontWeight: 800 }}>NIY</dt>
          <dd style={{ color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>: {employee.niy || '—'}</dd>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '15mm 1fr' }}>
          <dt style={{ color: '#334155', fontWeight: 800 }}>Unit Kerja</dt>
          <dd style={{ color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>: {employee.unit_name || '—'}</dd>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '15mm 1fr' }}>
          <dt style={{ color: '#334155', fontWeight: 800 }}>Tgl Lahir</dt>
          <dd style={{ color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>: {formattedBirthDate}</dd>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '15mm 1fr' }}>
          <dt style={{ color: '#334155', fontWeight: 800 }}>Status</dt>
          <dd style={{ color: '#1e293b', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>: {employee.status_pegawai || employee.status || '—'}</dd>
        </div>
      </dl>

      {/* QR Code */}
      <div style={{ position: 'absolute', top: '60.5mm', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
        <div style={{ background: '#fff', padding: '0.5mm', borderRadius: '1.5mm', border: `0.3mm solid ${t.primary}` }}>
          <QRCodeSVG value={qrPayload || employee.niy || employee.email || 'SIMSIT'} size={48} level="M" marginSize={2} bgColor="#ffffff" fgColor="#0f172a" />
        </div>
        <span style={{ fontSize: '0.85mm', fontWeight: 900, color: '#fff', background: t.dark, padding: '0.3mm 1.8mm', borderRadius: '0.8mm', marginTop: '0.5mm', letterSpacing: '0.02em' }}>SCAN UNTUK VERIFIKASI</span>
      </div>

      {/* Footer */}
      <footer style={{ position: 'absolute', bottom: 0, left: 0, width: '53.98mm', height: '6.8mm', background: `linear-gradient(100deg, ${t.primary}, ${t.dark})`, borderTop: '0.6mm solid #f6c143', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '0 3mm', color: '#fff', fontSize: '1.1mm', zIndex: 3 }}>
        <b style={{ fontWeight: 700, lineHeight: 1.1 }}>Generasi Beriman, Berilmu,<br />Berakhlak Mulia</b>
        <span style={{ borderLeft: '0.3mm solid rgba(255,255,255,0.4)', paddingLeft: '1.5mm', lineHeight: 1.1, textAlign: 'right' }}>TAHUN AJARAN<br />2025/2026</span>
      </footer>
    </div>
  )
}

/* ==========================================
   STUDENT PRINT CARDS
   ========================================== */

function StudentCardPrintHorizontal({ data, config = {}, theme = {}, pengaturan = {}, qrToken = '', formatDate }) {
  const t = STUDENT_THEMES[config.templateColor] || theme || STUDENT_THEMES.green
  const primary = t.primary || '#0E5C44'
  const dark = t.dark || '#064e3b'
  const soft = t.soft || '#ecfdf5'
  const accent = t.accent || '#F6C143'

  const {
    showPhoto = true,
    showLogo = true,
    showQr = true,
    showNis = true,
    showNisn = true,
    showClass = true,
    showRombel = true,
    showUnit = true,
    showAcademicYear = false,
  } = config

  const sekolah = pengaturan?.school_name || pengaturan?.namaSekolah || 'YAYASAN DAR EL-IMAN'
  const logo = pengaturan?.logo_url || pengaturan?.logoUrl || ''
  const brandTitle = sekolah.replace(/^YAYASAN\s*/i, '').replace(/\s*-\s*/g, '-').trim()
  const formattedDateVal = formatDate ? formatDate(data.tanggalLahir) : (data.tanggalLahir || '-')
  const initials = (data.nama || 'S').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <div className="print-card-root" style={{ position: 'relative', width: '85.60mm', height: '53.98mm', background: '#fff' }}>
      {/* Pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.035, backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, backgroundSize: '3mm 3mm' }} />

      {/* Top right soft blob */}
      <div style={{ position: 'absolute', right: '-12mm', top: '-15mm', width: '35mm', height: '25mm', borderRadius: '50%', background: soft }} />

      {/* Brand Header */}
      <header style={{ position: 'absolute', top: '2.5mm', left: '3.5mm', display: 'flex', alignItems: 'center', gap: '1.8mm', zIndex: 2 }}>
        {showLogo && (
          <div style={{ width: '7.5mm', height: '8.5mm', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: dark, flexShrink: 0 }}>
            {logo ? <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <b style={{ fontSize: '2mm', fontWeight: 900, color: dark }}>DEI</b>}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <small style={{ fontSize: '1.1mm', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: primary }}>Yayasan</small>
          <strong style={{ fontSize: '2.4mm', fontWeight: 900, textTransform: 'uppercase', color: dark, lineHeight: 1 }}>{brandTitle}</strong>
          <small style={{ fontSize: '1mm', fontWeight: 600, color: '#94a3b8', marginTop: '0.2mm' }}>Islamic School</small>
        </div>
      </header>

      {/* Badge Top Right */}
      <span style={{ position: 'absolute', top: 0, right: 0, background: `linear-gradient(135deg, ${primary}, ${dark})`, color: '#fff', padding: '1.5mm 3.5mm', borderRadius: '0 0 0 3mm', fontSize: '1.4mm', fontWeight: 900, letterSpacing: '0.04em', zIndex: 2 }}>
        KARTU SISWA
      </span>

      {/* Photo & Unit */}
      {showPhoto && (
        <div style={{ position: 'absolute', top: '14mm', left: '4.5mm', width: '19.5mm', height: '23mm', borderRadius: '2mm', overflow: 'hidden', boxShadow: '0 0.5mm 1.5mm rgba(0,0,0,0.1)', background: dark, zIndex: 2 }}>
          {data.foto ? (
            <img src={data.foto} alt={data.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
          ) : null}
          <div className="photo-fallback" style={{ display: data.foto ? 'none' : 'flex' }}>{initials}</div>
        </div>
      )}

      {showUnit && (
        <span style={{ position: 'absolute', top: '38mm', left: '4.5mm', width: '19.5mm', background: primary, color: '#fff', textAlignment: 'center', borderRadius: '1mm', padding: '0.4mm 0', fontSize: '1.1mm', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center', zIndex: 2 }}>
          {data.unit}
        </span>
      )}

      {/* Identity & Metadata */}
      <div style={{ position: 'absolute', top: '14mm', left: showPhoto ? '26mm' : '4.5mm', right: showQr ? '23mm' : '4mm', zIndex: 2 }}>
        <small style={{ fontSize: '1.1mm', fontWeight: 600, color: '#64748b', display: 'block' }}>Nama</small>
        <h4 style={{ fontSize: '2.4mm', fontWeight: 900, textTransform: 'uppercase', color: '#020617', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '1.2mm' }}>{data.nama}</h4>

        <div style={{ fontSize: '1.3mm', display: 'grid', gap: '0.6mm' }}>
          {showNis && (
            <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>NIS</span>
              <span>:</span>
              <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.nis}</strong>
            </div>
          )}
          {showNisn && (
            <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>NISN</span>
              <span>:</span>
              <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.nisn}</strong>
            </div>
          )}
          {showClass && (
            <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>Kelas</span>
              <span>:</span>
              <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {data.kelas}{showRombel && data.rombel !== '-' ? ` / ${data.rombel}` : ''}
              </strong>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
            <span style={{ color: '#475569', fontWeight: 600 }}>Tgl Lahir</span>
            <span>:</span>
            <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formattedDateVal}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
            <span style={{ color: '#475569', fontWeight: 600 }}>Gol. Darah</span>
            <span>:</span>
            <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.golonganDarah}</strong>
          </div>
          {showAcademicYear && (
            <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>Tahun Ajaran</span>
              <span>:</span>
              <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.tahunAjaran}</strong>
            </div>
          )}
        </div>
      </div>

      {/* QR Code */}
      {showQr && (
        <div style={{ position: 'absolute', top: '15mm', right: '4mm', width: '16mm', background: '#fff', border: '0.3mm solid #cbd5e1', borderRadius: '1.8mm', padding: '0.8mm', textAlign: 'center', boxShadow: '0 0.5mm 1.5mm rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          {qrToken ? (
            <QRCodeSVG value={qrToken} size={46} level="M" marginSize={2} bgColor="#ffffff" fgColor="#0f172a" />
          ) : (
            <div style={{ width: '12mm', height: '12mm', background: '#f1f5f9', borderRadius: '1mm', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1mm', color: '#94a3b8' }}>QR</div>
          )}
          <b style={{ background: primary, color: '#fff', fontSize: '1mm', fontWeight: 900, borderRadius: '0.6mm', padding: '0.3mm 0', width: '100%', marginTop: '0.5mm', display: 'block' }}>ID CARD</b>
          <small style={{ fontSize: '0.8mm', color: '#64748b', marginTop: '0.3mm', display: 'block' }}>Scan verifikasi</small>
        </div>
      )}

      {/* Bottom Wave decoration */}
      <div style={{ position: 'absolute', bottom: '-15mm', left: '-5mm', width: '80mm', height: '22mm', background: `linear-gradient(115deg, ${dark}, ${primary})`, borderTop: `0.6mm solid ${accent}`, borderRadius: '50% 50% 0 0', zIndex: 1 }} />

      {/* Footer text */}
      <footer style={{ position: 'absolute', bottom: 0, left: 0, width: '85.60mm', height: '6.5mm', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '0 4mm', color: '#fff', fontSize: '1.1mm', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1mm' }}>
          <span style={{ fontWeight: 700, lineHeight: 1.1 }}>Sekolah Unggulan<br />Berbasis Al-Qur'an</span>
        </div>
        <p style={{ fontSize: '1mm', opacity: 0.9 }}>www.dareliman.sch.id</p>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.9mm', fontWeight: 700, textTransform: 'uppercase' }}>Kepala Sekolah</span>
        </div>
      </footer>
    </div>
  )
}

function StudentCardPrintVertical({ data, config = {}, theme = {}, pengaturan = {}, qrToken = '', formatDate }) {
  const t = STUDENT_THEMES[config.templateColor] || theme || STUDENT_THEMES.green
  const primary = t.primary || '#0E5C44'
  const dark = t.dark || '#064e3b'
  const accent = t.accent || '#F6C143'

  const {
    showPhoto = true,
    showLogo = true,
    showQr = true,
    showNis = true,
    showNisn = true,
    showClass = true,
    showRombel = true,
    showUnit = true,
    showAcademicYear = false,
    showMotto = true,
  } = config

  const sekolah = pengaturan?.school_name || pengaturan?.namaSekolah || 'YAYASAN DAR EL-IMAN'
  const logo = pengaturan?.logo_url || pengaturan?.logoUrl || ''
  const brandTitle = sekolah.replace(/^YAYASAN\s*/i, '').replace(/\s*-\s*/g, '-').trim()
  const formattedDateVal = formatDate ? formatDate(data.tanggalLahir) : (data.tanggalLahir || '-')
  const initials = (data.nama || 'S').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <div className="print-card-root" style={{ position: 'relative', width: '53.98mm', height: '85.60mm', background: '#fff', textAlign: 'center' }}>
      {/* Top Header Arc */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '53.98mm', height: '24mm', borderBottom: `0.6mm solid ${accent}`, borderRadius: '0 0 50% 50%', background: `linear-gradient(135deg, ${primary}, ${dark})`, zIndex: 1 }} />

      {/* Brand Header */}
      <header style={{ position: 'absolute', top: '3mm', left: '3.5mm', right: '3.5mm', display: 'flex', alignItems: 'center', gap: '1.8mm', zIndex: 2, color: '#fff', textAlign: 'left' }}>
        {showLogo && (
          <div style={{ width: '7mm', height: '7.5mm', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#fff', flexShrink: 0 }}>
            {logo ? <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <b style={{ fontSize: '2mm', fontWeight: 900, color: '#fff' }}>DEI</b>}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <small style={{ fontSize: '1mm', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.8)' }}>Yayasan</small>
          <strong style={{ fontSize: '2.2mm', fontWeight: 900, textTransform: 'uppercase', color: '#fff', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{brandTitle}</strong>
          <small style={{ fontSize: '0.9mm', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: '0.2mm' }}>Islamic School</small>
        </div>
      </header>

      {showMotto && (
        <p style={{ position: 'absolute', top: '13mm', right: '3.5mm', left: '3.5mm', fontSize: '1mm', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', textAlign: 'right', zIndex: 2, lineHeight: 1.1 }}>
          Berilmu, Berakhlak, Beramal
        </p>
      )}

      {/* Photo */}
      {showPhoto && (
        <div style={{ position: 'absolute', top: '15.5mm', left: '50%', transform: 'translateX(-50%)', width: '19mm', height: '19mm', borderRadius: '50%', border: '0.8mm solid #fff', boxShadow: '0 0.8mm 2mm rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 3, background: dark }}>
          {data.foto ? (
            <img src={data.foto} alt={data.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
          ) : null}
          <div className="photo-fallback" style={{ display: data.foto ? 'none' : 'flex' }}>{initials}</div>
        </div>
      )}

      {/* Identity & Unit */}
      <div style={{ position: 'absolute', top: showPhoto ? '35.5mm' : '26mm', left: '3mm', right: '3mm', textAlign: 'center', zIndex: 2 }}>
        <h4 style={{ fontSize: '2.3mm', fontWeight: 900, textTransform: 'uppercase', color: dark, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.nama}</h4>
        {showUnit && (
          <span style={{ display: 'inline-block', marginTop: '0.6mm', background: primary, color: '#fff', padding: '0.3mm 2mm', borderRadius: '1mm', fontSize: '1.2mm', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.unit}
          </span>
        )}

        {/* Metadata */}
        <div style={{ marginTop: '2mm', fontSize: '1.3mm', display: 'grid', gap: '0.6mm', textAlign: 'left' }}>
          {showNis && (
            <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>NIS</span>
              <span>:</span>
              <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.nis}</strong>
            </div>
          )}
          {showNisn && (
            <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>NISN</span>
              <span>:</span>
              <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.nisn}</strong>
            </div>
          )}
          {showClass && (
            <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>Kelas</span>
              <span>:</span>
              <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {data.kelas}{showRombel && data.rombel !== '-' ? ` / ${data.rombel}` : ''}
              </strong>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
            <span style={{ color: '#475569', fontWeight: 600 }}>Tgl Lahir</span>
            <span>:</span>
            <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formattedDateVal}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
            <span style={{ color: '#475569', fontWeight: 600 }}>Gol. Darah</span>
            <span>:</span>
            <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.golonganDarah}</strong>
          </div>
          {showAcademicYear && (
            <div style={{ display: 'grid', gridTemplateColumns: '13mm 1.5mm 1fr' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>Thn Ajaran</span>
              <span>:</span>
              <strong style={{ color: '#0f172a', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.tahunAjaran}</strong>
            </div>
          )}
        </div>
      </div>

      {/* QR Code */}
      {showQr && (
        <div style={{ position: 'absolute', top: '61mm', left: '50%', transform: 'translateX(-50%)', width: '15mm', background: '#fff', border: '0.3mm solid #cbd5e1', borderRadius: '1.8mm', padding: '0.6mm', textAlign: 'center', boxShadow: '0 0.5mm 1.5mm rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
          {qrToken ? (
            <QRCodeSVG value={qrToken} size={42} level="M" marginSize={2} bgColor="#ffffff" fgColor="#0f172a" />
          ) : (
            <div style={{ width: '11mm', height: '11mm', background: '#f1f5f9', borderRadius: '1mm', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1mm', color: '#94a3b8' }}>QR</div>
          )}
          <b style={{ background: primary, color: '#fff', fontSize: '0.9mm', fontWeight: 900, borderRadius: '0.6mm', padding: '0.2mm 0', width: '100%', marginTop: '0.4mm', display: 'block' }}>ID CARD</b>
          <small style={{ fontSize: '0.75mm', color: '#64748b', marginTop: '0.2mm', display: 'block' }}>Scan verifikasi</small>
        </div>
      )}

      {/* Footer */}
      <footer style={{ position: 'absolute', bottom: 0, left: 0, width: '53.98mm', height: '6.5mm', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '0 3mm', color: '#fff', fontSize: '1mm', zIndex: 3, background: `linear-gradient(115deg, ${dark}, ${primary})`, borderTop: `0.5mm solid ${accent}` }}>
        <span style={{ fontWeight: 700, lineHeight: 1.1, textAlign: 'left' }}>Sekolah Unggulan<br />Berbasis Al-Qur'an</span>
        <span style={{ borderLeft: '0.3mm solid rgba(255,255,255,0.4)', paddingLeft: '1.5mm', lineHeight: 1.1, textAlign: 'right' }}>TAHUN AJARAN<br />{data.tahunAjaran}</span>
      </footer>
    </div>
  )
}

/* ==========================================
   EXPORTED PRINT SERVICE FUNCTIONS
   ========================================== */

export function printEmployeeIdCard({ employee, orientation = 'horizontal', template = 'green', pengaturan = {}, formatDate, qrPayload }) {
  if (!employee) return

  const iframe = getOrCreateIframe()
  const doc = iframe.contentDocument || iframe.contentWindow.document
  const t = EMPLOYEE_TEMPLATES[template] || EMPLOYEE_TEMPLATES.green
  const css = getPrintCSS(orientation, t)

  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Cetak ID Card Pegawai</title>
      <style>${css}</style>
    </head>
    <body>
      <div id="print-root-container"></div>
    </body>
    </html>
  `)
  doc.close()

  const container = doc.getElementById('print-root-container')
  const root = createRoot(container)

  const component = orientation === 'horizontal' ? (
    <EmployeeCardPrintHorizontal
      employee={employee}
      template={template}
      pengaturan={pengaturan}
      formatDate={formatDate}
      qrPayload={qrPayload}
    />
  ) : (
    <EmployeeCardPrintVertical
      employee={employee}
      template={template}
      pengaturan={pengaturan}
      formatDate={formatDate}
      qrPayload={qrPayload}
    />
  )

  root.render(component)

  setTimeout(async () => {
    await waitForAssets(doc)
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
  }, 150)
}

export function printStudentIdCard({ data, config = {}, theme = {}, pengaturan = {}, qrToken = '', formatDate }) {
  if (!data) return

  const orientation = config.orientation || 'horizontal'
  const iframe = getOrCreateIframe()
  const doc = iframe.contentDocument || iframe.contentWindow.document
  const t = STUDENT_THEMES[config.templateColor] || theme || STUDENT_THEMES.green
  const css = getPrintCSS(orientation, t)

  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Cetak ID Card Siswa</title>
      <style>${css}</style>
    </head>
    <body>
      <div id="print-root-container"></div>
    </body>
    </html>
  `)
  doc.close()

  const container = doc.getElementById('print-root-container')
  const root = createRoot(container)

  const component = orientation === 'horizontal' ? (
    <StudentCardPrintHorizontal
      data={data}
      config={config}
      theme={t}
      pengaturan={pengaturan}
      qrToken={qrToken}
      formatDate={formatDate}
    />
  ) : (
    <StudentCardPrintVertical
      data={data}
      config={config}
      theme={t}
      pengaturan={pengaturan}
      qrToken={qrToken}
      formatDate={formatDate}
    />
  )

  root.render(component)

  setTimeout(async () => {
    await waitForAssets(doc)
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
  }, 150)
}
