import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import { getCardLogoUrl } from '../utils/cardLogoHelper'

import StudentCardHorizontal from '../components/card-print/StudentCardHorizontal'
import StudentCardVertical from '../components/card-print/StudentCardVertical'
import StudentCardBackHorizontal from '../components/card-print/StudentCardBackHorizontal'
import StudentCardBackVertical from '../components/card-print/StudentCardBackVertical'

import EmployeeCardHorizontal from '../components/card-print/EmployeeCardHorizontal'
import EmployeeCardVertical from '../components/card-print/EmployeeCardVertical'
import EmployeeCardBackHorizontal from '../components/card-print/EmployeeCardBackHorizontal'
import EmployeeCardBackVertical from '../components/card-print/EmployeeCardBackVertical'

const STUDENT_THEMES = {
  green: { primary: '#004D32', dark: '#003822', soft: '#ecfdf5', accent: '#E5A93C' },
  blue: { primary: '#1D4ED8', dark: '#1e40af', soft: '#eff6ff', accent: '#93C5FD' },
  purple: { primary: '#6D28D9', dark: '#5b21b6', soft: '#f5f3ff', accent: '#C4B5FD' },
  orange: { primary: '#EA580C', dark: '#c2410c', soft: '#fff7ed', accent: '#FDBA74' },
  teal: { primary: '#0F766E', dark: '#115e59', soft: '#f0fdfa', accent: '#99F6E4' },
  navy: { primary: '#172554', dark: '#0f172a', soft: '#eff6ff', accent: '#60A5FA' },
}

let reactPrintRoot = null

function injectGlobalPrintStyles(orientation = 'horizontal') {
  let styleEl = document.getElementById('printable-id-card-global-style')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'printable-id-card-global-style'
    document.head.appendChild(styleEl)
  }
  const isHoriz = orientation === 'horizontal'
  const pageSize = isHoriz ? '85.6mm 54.0mm' : '54.0mm 85.6mm'
  styleEl.innerHTML = `
      #printable-id-card-root {
        display: none;
      }
      @media print {
        @page {
          size: ${pageSize};
          margin: 0;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body > *:not(#printable-id-card-root) {
          display: none !important;
        }
        #printable-id-card-root {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0 !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        #printable-id-card-root *, #printable-id-card-root *::before, #printable-id-card-root *::after {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .print-card-container {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          width: ${isHoriz ? '85.6mm' : '54.0mm'} !important;
          height: ${isHoriz ? '54.0mm' : '85.6mm'} !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }
        .print-card-box--horizontal {
          width: 85.6mm !important;
          height: 54.0mm !important;
          min-width: 85.6mm !important;
          min-height: 54.0mm !important;
          max-width: 85.6mm !important;
          max-height: 54.0mm !important;
          overflow: hidden !important;
          position: relative !important;
          display: block !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          border: none !important;
          border-radius: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-shadow: none !important;
        }
        .print-card-box--horizontal > article,
        .print-card-box--horizontal > div {
          width: 560px !important;
          height: 353px !important;
          min-width: 560px !important;
          min-height: 353px !important;
          max-width: none !important;
          max-height: none !important;
          transform: scale(0.577727) !important;
          transform-origin: top left !important;
          box-shadow: none !important;
        }
        .print-card-box--horizontal > article.employee-id-card,
        .print-card-box--horizontal > article.employee-id-card--horizontal {
          width: 540px !important;
          height: 340px !important;
          min-width: 540px !important;
          min-height: 340px !important;
          max-width: none !important;
          max-height: none !important;
          transform: scale(0.599074) !important;
          transform-origin: top left !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
        }
        .print-card-box--vertical {
          width: 54.0mm !important;
          height: 85.6mm !important;
          min-width: 54.0mm !important;
          min-height: 85.6mm !important;
          max-width: 54.0mm !important;
          max-height: 85.6mm !important;
          overflow: hidden !important;
          position: relative !important;
          display: block !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          border: none !important;
          border-radius: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-shadow: none !important;
        }
        .print-card-box--vertical > article,
        .print-card-box--vertical > div {
          width: 340px !important;
          height: 539px !important;
          min-width: 340px !important;
          min-height: 539px !important;
          max-width: none !important;
          max-height: none !important;
          transform: scale(0.60005) !important;
          transform-origin: top left !important;
          box-shadow: none !important;
        }
        .print-card-box--vertical > article.employee-id-card,
        .print-card-box--vertical > article.employee-id-card--vertical {
          width: 330px !important;
          height: 530px !important;
          min-width: 330px !important;
          min-height: 530px !important;
          max-width: none !important;
          max-height: none !important;
          transform: scale(0.61845) !important;
          transform-origin: top left !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
        }
        .print-page-break {
          page-break-after: always !important;
          break-after: page !important;
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }
      }
    `
}

function getOrCreatePrintRootContainer() {
  let container = document.getElementById('printable-id-card-root')
  if (!container) {
    container = document.createElement('div')
    container.id = 'printable-id-card-root'
    document.body.appendChild(container)
  }
  return container
}

export async function downloadStudentIdCard(options) {
  if (!options?.data) return
  const nameSlug = (options?.data?.nama || 'Siswa').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')
  const filename = `ID_Card_Siswa_${nameSlug}.png`
  const element = document.getElementById('printable-student-card')

  if (element) {
    try {
      const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 3 })
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
      return
    } catch (err) {
      console.warn('DOWNLOAD_CARD_IMAGE_FALLBACK:', err)
    }
  }

  // Fallback if canvas element not in DOM or failed
  printStudentIdCard(options)
}

export function printStudentIdCard({
  data,
  config = {},
  theme = {},
  pengaturan = {},
  qrToken = '',
  formatDate,
  printSides = 'both',
  frameStyle = 'standard',
  photoShape = 'rounded',
  showPattern = true,
  showWave = true,
  headerMotto = 'Berilmu, Berakhlak, Beramal',
  footerMotto = 'Sekolah Unggulan\nBerbasis Al-Qur\'an',
  backTitle = 'TATA TERTIB SISWA',
  backRules = '1. Kartu ini adalah kartu identitas resmi siswa Yayasan Dar el-Iman.\n2. Wajib dibawa & dikenakan selama jam KBM sekolah.\n3. Apabila menemukan kartu ini, harap mengembalikan ke piket sekolah.\n4. QR Code digunakan untuk absensi gerbang & verifikasi SIMSIT.',
  backAddress = 'Jl. Gajah Mada No. 28 Padang, Sumatera Barat\nTelp: (0751) 123456 | Website: dareliman.or.id',
  backShowQr = true,
}) {
  if (!data) return

  const orientation = config.orientation || 'horizontal'
  injectGlobalPrintStyles(orientation)
  const container = getOrCreatePrintRootContainer()
  if (!reactPrintRoot) {
    reactPrintRoot = createRoot(container)
  }

  const t = STUDENT_THEMES[config.templateColor] || theme || STUDENT_THEMES.navy || STUDENT_THEMES.green

  const cardBoxClass = orientation === 'horizontal' ? 'print-card-box--horizontal' : 'print-card-box--vertical'

  const commonProps = {
    data,
    config,
    theme: t,
    pengaturan,
    qrToken,
    formatDate,
    frameStyle,
    photoShape,
    showPattern,
    showWave,
    headerMotto,
    footerMotto,
    isPrint: true,
  }

  const backProps = {
    ...commonProps,
    backTitle,
    backRules,
    backAddress,
    backShowQr,
  }

  const frontComponent = orientation === 'horizontal' ? (
    <div className="print-card-container">
      <div className={cardBoxClass}>
        <StudentCardHorizontal {...commonProps} />
      </div>
    </div>
  ) : (
    <div className="print-card-container">
      <div className={cardBoxClass}>
        <StudentCardVertical {...commonProps} />
      </div>
    </div>
  )

  const backComponent = orientation === 'horizontal' ? (
    <div className="print-card-container">
      <div className={cardBoxClass}>
        <StudentCardBackHorizontal {...backProps} />
      </div>
    </div>
  ) : (
    <div className="print-card-container">
      <div className={cardBoxClass}>
        <StudentCardBackVertical {...backProps} />
      </div>
    </div>
  )

  let finalComponent = frontComponent
  if (printSides === 'back') {
    finalComponent = (
      <div className="w-full">
        {backComponent}
      </div>
    )
  } else if (printSides === 'both') {
    finalComponent = (
      <div className="w-full">
        <div className="print-page-break">{frontComponent}</div>
        <div>{backComponent}</div>
      </div>
    )
  } else {
    finalComponent = (
      <div className="w-full">
        {frontComponent}
      </div>
    )
  }

  const studentName = (data?.nama || 'Siswa').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')
  const originalTitle = document.title
  document.title = `ID_Card_Siswa_${studentName}`

  flushSync(() => {
    reactPrintRoot.render(finalComponent)
  })

  setTimeout(() => {
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }, 250)
}

export async function downloadEmployeeIdCard(options) {
  const emp = options?.employee || options?.data
  if (!emp) return
  const nama = emp.nama_lengkap || emp.nama || 'Pegawai'
  const nameSlug = nama.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')
  const filename = `ID_Card_Pegawai_${nameSlug}.png`
  const element = document.getElementById('printable-employee-card')

  if (element) {
    try {
      const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 3 })
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
      return
    } catch (err) {
      console.warn('DOWNLOAD_CARD_IMAGE_FALLBACK:', err)
    }
  }

  // Fallback if canvas element not in DOM or failed
  printEmployeeIdCard(options)
}

export function printEmployeeIdCard({
  employee,
  data,
  orientation = 'horizontal',
  template = 'green',
  config = {},
  pengaturan = {},
  formatDate,
  qrPayload = '',
  layoutConfig = {},
  frameStyle = 'standard',
  photoShape = 'rounded',
  showPattern = true,
  showWave = true,
  headerMotto = 'Berilmu, Berakhlak, Beramal',
  footerMotto = 'Generasi Beriman, Berilmu,\nBerakhlak Mulia',
  printSides = 'both',
  backTitle = 'KETENTUAN KARTU PEGAWAI',
  backRules = '1. Kartu ini adalah milik resmi Yayasan Dar el-Iman.\n2. Wajib dibawa & dikenakan selama jam kerja.\n3. Apabila menemukan kartu ini, harap mengembalikan ke kantor yayasan.\n4. QR Code digunakan untuk absensi & verifikasi SIMSIT.',
  backAddress = 'Jl. Gajah Mada No. 28 Padang, Sumatera Barat\nTelp: (0751) 123456 | Website: dareliman.or.id',
  backShowQr = true,
}) {
  const empData = employee || data
  if (!empData) return

  const cardOrientation = orientation || config.orientation || 'horizontal'
  injectGlobalPrintStyles(cardOrientation)
  const container = getOrCreatePrintRootContainer()
  if (!reactPrintRoot) {
    reactPrintRoot = createRoot(container)
  }

  const cardBoxClass = cardOrientation === 'horizontal' ? 'print-card-box--horizontal' : 'print-card-box--vertical'

  const commonProps = {
    employee: empData,
    template,
    pengaturan,
    formatDate,
    qrPayload,
    layoutConfig,
    frameStyle,
    photoShape,
    showPattern,
    showWave,
    headerMotto,
    footerMotto,
    isPrint: true,
  }

  const backProps = {
    ...commonProps,
    backTitle,
    backRules,
    backAddress,
    backShowQr,
  }

  const frontComponent = cardOrientation === 'horizontal' ? (
    <div className="print-card-container">
      <div className={cardBoxClass}>
        <EmployeeCardHorizontal {...commonProps} />
      </div>
    </div>
  ) : (
    <div className="print-card-container">
      <div className={cardBoxClass}>
        <EmployeeCardVertical {...commonProps} />
      </div>
    </div>
  )

  const backComponent = cardOrientation === 'horizontal' ? (
    <div className="print-card-container">
      <div className={cardBoxClass}>
        <EmployeeCardBackHorizontal {...backProps} />
      </div>
    </div>
  ) : (
    <div className="print-card-container">
      <div className={cardBoxClass}>
        <EmployeeCardBackVertical {...backProps} />
      </div>
    </div>
  )

  let finalComponent = frontComponent
  if (printSides === 'back') {
    finalComponent = (
      <div className="w-full">
        {backComponent}
      </div>
    )
  } else if (printSides === 'both') {
    finalComponent = (
      <div className="w-full">
        <div className="print-page-break">{frontComponent}</div>
        <div>{backComponent}</div>
      </div>
    )
  } else {
    finalComponent = (
      <div className="w-full">
        {frontComponent}
      </div>
    )
  }

  const empName = (empData.nama_lengkap || empData.nama || 'Pegawai').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')
  const originalTitle = document.title
  document.title = `ID_Card_Pegawai_${empName}`

  flushSync(() => {
    reactPrintRoot.render(finalComponent)
  })

  setTimeout(() => {
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }, 250)
}
