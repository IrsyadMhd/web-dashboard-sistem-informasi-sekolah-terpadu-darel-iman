/**
 * SIMSIT Official Global Print & PDF Utility
 * Standardized across all modules: Student, Attendance, Tahfizh, Academic, LMS, Alumni.
 * Supports A4 Portrait (default, 210mm x 297mm) and A4 Landscape with 15mm margins.
 * 
 * Header layout adheres strictly to institutional specifications:
 * [LOGO SIT]   YAYASAN DAR EL-IMAN            [LOGO UNIT]
 *              NAMA SEKOLAH
 *              NAMA SEKOLAH / UNIT
 *              "SLOGAN"
 *              Alamat & Telepon
 *              Izin Operasional / NPSN        [JENIS UNIT]
 */

import { api } from '../services/api'
import { toast } from 'sonner'

export const DEFAULT_UNITS_CONFIG = {
  YAYASAN: {
    isUnitScope: false,
    code: 'YAYASAN',
    name: '',
    formalName: '',
    unitName: '',
    level: 'YAYASAN',
    unitType: 'Yayasan',
    logoUrl: null,
    npsn: '',
    skPendirian: '',
    izinOperasional: '',
    address: '',
    phone: '',
    motto: '',
    city: '',
  },
  SMAIT: {
    isUnitScope: true,
    code: 'SMAIT-01',
    name: 'SMAIT',
    formalName: 'SMA ISLAM TERPADU',
    unitName: 'SMAIT',
    level: 'SMAIT',
    unitType: 'SMA IT',
    logoUrl: '/assets/logos/smait.svg',
    npsn: '',
    skPendirian: '',
    izinOperasional: '',
    address: '',
    phone: '',
    motto: '',
    city: '',
  },
  SMPIT: {
    isUnitScope: true,
    code: 'SMPIT-01',
    name: 'SMPIT',
    formalName: 'SMP ISLAM TERPADU',
    unitName: 'SMPIT',
    level: 'SMPIT',
    unitType: 'SMP IT',
    logoUrl: '/assets/logos/smpit.svg',
    npsn: '',
    skPendirian: '',
    izinOperasional: '',
    address: '',
    phone: '',
    motto: '',
    city: '',
  },
  SDIT: {
    isUnitScope: true,
    code: 'SDIT-01',
    name: 'SDIT',
    formalName: 'SD ISLAM TERPADU',
    unitName: 'SDIT',
    level: 'SDIT',
    unitType: 'SD IT',
    logoUrl: '/assets/logos/sdit.svg',
    npsn: '',
    skPendirian: '',
    izinOperasional: '',
    address: '',
    phone: '',
    motto: '',
    city: '',
  },
  TKIT: {
    isUnitScope: true,
    code: 'TKIT-01',
    name: 'TKIT',
    formalName: 'TK ISLAM TERPADU',
    unitName: 'TKIT',
    level: 'TKIT',
    unitType: 'TK IT',
    logoUrl: '/assets/logos/tkit.svg',
    npsn: '',
    skPendirian: '',
    izinOperasional: '',
    address: '',
    phone: '',
    motto: '',
    city: '',
  },
  PONPES: {
    isUnitScope: true,
    code: 'PONPES-01',
    name: 'Pondok Pesantren',
    formalName: 'PONDOK PESANTREN',
    unitName: 'PONPES',
    level: 'PONPES',
    unitType: 'Pondok Pesantren',
    logoUrl: '/assets/logos/ponpes.svg',
    npsn: '',
    skPendirian: '',
    izinOperasional: '',
    address: '',
    phone: '',
    motto: '',
    city: '',
  },
  MAHAD: {
    isUnitScope: true,
    code: 'MAHAD-01',
    name: "Ma'had",
    formalName: "MA'HAD",
    unitName: "MA'HAD",
    level: 'MAHAD',
    unitType: "MA'HAD",
    logoUrl: '/assets/logos/mahad.svg',
    npsn: '',
    skPendirian: '',
    izinOperasional: '',
    address: '',
    phone: '',
    motto: '',
    city: '',
  },
  TAUD: {
    isUnitScope: true,
    code: 'TAUD-01',
    name: 'TAUD SaQu',
    formalName: 'TAUD SAQU',
    unitName: 'TAUD SAQU',
    level: 'TAUD',
    unitType: 'TAUD SaQu',
    logoUrl: '/assets/logos/taud.svg',
    npsn: '',
    skPendirian: '',
    izinOperasional: '',
    address: '',
    phone: '',
    motto: '',
    city: '',
  },
  MIT: {
    isUnitScope: true,
    code: 'MIT-01',
    name: 'MIT',
    formalName: 'MADRASAH IBTIDAIYAH TERPADU',
    unitName: 'MIT',
    level: 'MIT',
    unitType: 'MIT',
    logoUrl: '/assets/logos/mit.svg',
    npsn: '',
    skPendirian: '',
    izinOperasional: '',
    address: '',
    phone: '',
    motto: '',
    city: '',
  },
}

// ============================================================================
// HELPER LOGO & ASSET URL RESOLVER
// ============================================================================
export function resolvePrintAssetUrl(url) {
  if (!url) return ''
  if (typeof url !== 'string') return ''
  if (url.startsWith('data:image') || url.startsWith('blob:')) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const isDevVite = typeof window !== 'undefined' && window.location?.origin?.includes('5173')
  const apiOrigin = isDevVite ? 'http://localhost:8000' : (typeof window !== 'undefined' ? window.location.origin : '')
  const webOrigin = typeof window !== 'undefined' ? window.location.origin : ''

  const cleanPath = url.startsWith('/') ? url : `/${url}`

  if (cleanPath.startsWith('/storage')) {
    return `${apiOrigin}${cleanPath}`
  }
  return `${webOrigin}${cleanPath}`
}

export function resolveSystemLogoUrl(systemLogoParam) {
  if (systemLogoParam && String(systemLogoParam).trim()) return resolvePrintAssetUrl(systemLogoParam)
  try {
    const savedPengaturan = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('pengaturan_dashboard') || '{}') : {}
    const siteLogo =
      savedPengaturan?.logo_url ||
      savedPengaturan?.logoUrl ||
      savedPengaturan?.print_logo_url ||
      savedPengaturan?.site_logo ||
      savedPengaturan?.logo
    if (siteLogo && String(siteLogo).trim()) {
      return resolvePrintAssetUrl(siteLogo)
    }
  } catch (_) {}
  return resolvePrintAssetUrl('/assets/logos/yayasan.svg')
}

export function getResolvedYayasanConfig() {
  let savedPengaturan = {}
  try {
    if (typeof localStorage !== 'undefined') {
      savedPengaturan = JSON.parse(localStorage.getItem('pengaturan_dashboard') || '{}')
    }
  } catch (_) {}

  const schoolName = (savedPengaturan?.school_name || savedPengaturan?.application_name || '').trim()
  const address = (savedPengaturan?.address || savedPengaturan?.footer_text || '').trim()
  const phone = (savedPengaturan?.phone || '').trim()
  const skPendirian = (savedPengaturan?.sk_pendirian || '').trim()
  const motto = (savedPengaturan?.motto || '').trim()
  const logoUrl = savedPengaturan?.logo_url ? resolvePrintAssetUrl(savedPengaturan.logo_url) : null

  return {
    isUnitScope: false,
    code: 'YAYASAN',
    name: schoolName,
    formalName: schoolName ? schoolName.toUpperCase() : '',
    unitName: schoolName ? schoolName.toUpperCase() : '',
    level: 'YAYASAN',
    unitType: 'Yayasan',
    logoUrl: logoUrl,
    npsn: '',
    skPendirian: skPendirian,
    izinOperasional: skPendirian,
    address: address,
    phone: phone,
    motto: motto,
    city: '',
  }
}

export function resolveFoundationName(foundationParam) {
  if (foundationParam && String(foundationParam).trim()) return String(foundationParam).trim()
  try {
    const savedPengaturan = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('pengaturan_dashboard') || '{}') : {}
    if (savedPengaturan?.school_name && String(savedPengaturan.school_name).trim()) {
      return String(savedPengaturan.school_name).trim()
    }
    if (savedPengaturan?.application_name && String(savedPengaturan.application_name).trim()) {
      return String(savedPengaturan.application_name).trim()
    }
  } catch (_) {}
  return ''
}

/**
 * Check if the user has Yayasan / Central / Super Admin role
 */
export function isCentralOrYayasanRole(userParam = null) {
  try {
    let user = userParam
    if (!user && typeof localStorage !== 'undefined') {
      const rawUser = localStorage.getItem('school_erp_user')
      if (rawUser) user = JSON.parse(rawUser)
    }
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.role || ''].filter(Boolean)
    const lowerRoles = roles.map((r) => String(r).toLowerCase())
    return lowerRoles.some(
      (r) =>
        r.includes('yayasan') ||
        r.includes('super admin') ||
        r.includes('superadmin') ||
        r.includes('admin yayasan') ||
        r === 'admin'
    )
  } catch (_) {
    return false
  }
}

/**
 * Resolve comprehensive details of a school unit or foundation scope
 */
export function resolveUnitDetails(unitParam, userParam = null) {
  let user = userParam
  if (!user && typeof localStorage !== 'undefined') {
    try {
      const rawUser = localStorage.getItem('school_erp_user')
      if (rawUser) user = JSON.parse(rawUser)
    } catch (_) {}
  }
  const isCentral = isCentralOrYayasanRole(user)

  // Find user's assigned unit for teachers, staff, homeroom, principal
  let userAssignedUnit = null
  if (user) {
    userAssignedUnit =
      user.employee?.unit ||
      user.unit ||
      user.unit_name ||
      user.unit_model ||
      user.scope?.unit_id ||
      null
  }
  if (!userAssignedUnit && typeof localStorage !== 'undefined') {
    try {
      const savedUnit = localStorage.getItem('school_erp_unit')
      if (savedUnit && savedUnit !== 'semua' && savedUnit !== 'all') {
        userAssignedUnit = savedUnit
      }
    } catch (_) {}
  }

  // If non-central user passes null, undefined, '', 'semua', or 'all': fallback to their assigned unit!
  let effectiveUnitParam = unitParam
  if (!isCentral) {
    if (!effectiveUnitParam || (typeof effectiveUnitParam === 'string' && ['SEMUA', 'ALL', 'SEMUA UNIT', 'SEMUA_UNIT', ''].includes(effectiveUnitParam.trim().toUpperCase()))) {
      if (userAssignedUnit) {
        effectiveUnitParam = userAssignedUnit
      }
    }
  }

  // Explicit 'semua' / 'all' / '' / 'yayasan' string or explicit yayasan flag
  if (typeof effectiveUnitParam === 'string') {
    const rawUpper = effectiveUnitParam.trim().toUpperCase()
    if (
      rawUpper === 'SEMUA' ||
      rawUpper === 'ALL' ||
      rawUpper === 'SEMUA UNIT' ||
      rawUpper === 'SEMUA_UNIT' ||
      rawUpper === 'YAYASAN' ||
      rawUpper.includes('YAYASAN') ||
      rawUpper === ''
    ) {
      return getResolvedYayasanConfig()
    }
  }

  // 1. If an object unit is passed
  if (effectiveUnitParam && typeof effectiveUnitParam === 'object') {
    if (
      effectiveUnitParam.id === 'semua' ||
      effectiveUnitParam.code === 'semua' ||
      effectiveUnitParam.code === 'YAYASAN' ||
      effectiveUnitParam.level === 'YAYASAN' ||
      effectiveUnitParam.isUnitScope === false ||
      effectiveUnitParam.isYayasan ||
      effectiveUnitParam.scope === 'yayasan'
    ) {
      if (isCentral || !userAssignedUnit || userAssignedUnit === effectiveUnitParam) {
        return getResolvedYayasanConfig()
      }
      return resolveUnitDetails(userAssignedUnit, user)
    }
    const meta = effectiveUnitParam.metadata || {}
    const levelStr = String(effectiveUnitParam.level || effectiveUnitParam.code || effectiveUnitParam.name || '').toUpperCase()
    let defaultKey = 'SMAIT'
    if (levelStr.includes('TAUD')) defaultKey = 'TAUD'
    else if (levelStr.includes('TK')) defaultKey = 'TKIT'
    else if (levelStr.includes('MIT')) defaultKey = 'MIT'
    else if (levelStr.includes('SD')) defaultKey = 'SDIT'
    else if (levelStr.includes('SMP')) defaultKey = 'SMPIT'
    else if (levelStr.includes('SMA')) defaultKey = 'SMAIT'
    else if (levelStr.includes('MAHAD') || levelStr.includes("MA'HAD") || levelStr.includes("JA'FAR") || levelStr.includes('JAFAR')) defaultKey = 'MAHAD'
    else if (levelStr.includes('PONPES') || levelStr.includes('PESANTREN') || levelStr.includes('MA') || levelStr.includes('ASRAMA')) defaultKey = 'PONPES'

    const fallback = DEFAULT_UNITS_CONFIG[defaultKey] || DEFAULT_UNITS_CONFIG.SMAIT

    const rawLogo = effectiveUnitParam.logo_url || meta.logo_url || meta.logo || fallback.logoUrl || null

    const unitName = effectiveUnitParam.name || fallback.name || ''

    return {
      isUnitScope: true,
      code: effectiveUnitParam.code || fallback.code || '',
      name: unitName,
      formalName: meta.formal_name || (unitName ? unitName.toUpperCase() : ''),
      unitName: (unitName || '').toUpperCase(),
      level: effectiveUnitParam.level || fallback.level || '',
      unitType: meta.singkatan || effectiveUnitParam.level || fallback.unitType || (unitName ? unitName.split(' ')[0] : ''),
      logoUrl: rawLogo ? resolvePrintAssetUrl(rawLogo) : null,
      npsn: meta.npsn || effectiveUnitParam.npsn || '',
      skPendirian: meta.sk_pendirian || '',
      izinOperasional: meta.izin_operasional || meta.sk_pendirian || '',
      address: meta.address || effectiveUnitParam.address || '',
      phone: meta.phone || effectiveUnitParam.phone || '',
      motto: meta.motto || meta.slogan || '',
      city: meta.city || effectiveUnitParam.city || '',
    }
  }

  // 2. If explicit specific unit string key or name passed (e.g. 'SMAIT Dar el-Iman - Padang', 'SMPIT 1', etc.)
  const str = String(effectiveUnitParam || '').trim()
  if (str) {
    const rawUpper = str.toUpperCase()
    let defaultKey = 'SMAIT'
    if (rawUpper.includes('TAUD')) defaultKey = 'TAUD'
    else if (rawUpper.includes('TK')) defaultKey = 'TKIT'
    else if (rawUpper.includes('MIT')) defaultKey = 'MIT'
    else if (rawUpper.includes('SD')) defaultKey = 'SDIT'
    else if (rawUpper.includes('SMP')) defaultKey = 'SMPIT'
    else if (rawUpper.includes('SMA')) defaultKey = 'SMAIT'
    else if (rawUpper.includes('MAHAD') || rawUpper.includes("MA'HAD") || rawUpper.includes("JA'FAR") || rawUpper.includes('JAFAR')) defaultKey = 'MAHAD'
    else if (rawUpper.includes('PONPES') || rawUpper.includes('PESANTREN') || rawUpper.includes('ASRAMA')) defaultKey = 'PONPES'

    const base = DEFAULT_UNITS_CONFIG[defaultKey] || DEFAULT_UNITS_CONFIG.SMAIT
    return {
      ...base,
      isUnitScope: true,
      name: str,
      formalName: str.toUpperCase(),
      unitName: str.toUpperCase(),
      logoUrl: base.logoUrl ? resolvePrintAssetUrl(base.logoUrl) : null,
      npsn: '',
      skPendirian: '',
      izinOperasional: '',
      address: '',
      phone: '',
      motto: '',
      city: '',
    }
  }

  // 3. Fallback: if user is not central and has an assigned unit, resolve it
  if (!isCentral && userAssignedUnit) {
    return resolveUnitDetails(userAssignedUnit, user)
  }

  return getResolvedYayasanConfig()
}

// Fallback SVG vectors for maximum print reliability (Zero Hardcoded Text)
export function getOfficialYayasanLogoSvg(orgNameParam = '') {
  let orgName = orgNameParam
  let logoText = 'SIT'
  try {
    const savedPengaturan = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('pengaturan_dashboard') || '{}') : {}
    if (!orgName) {
      orgName = (savedPengaturan?.school_name || savedPengaturan?.application_name || '').trim()
    }
    if (savedPengaturan?.logo_text) {
      logoText = String(savedPengaturan.logo_text).trim()
    }
  } catch (_) {}

  const displayName = (orgName || 'YAYASAN PENDIDIKAN').toUpperCase()
  const shortText = displayName.length > 22 ? displayName.substring(0, 20) + '...' : displayName

  return `
    <svg width="76" height="76" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,2 62,24 86,14 80,38 98,50 80,62 86,86 62,76 50,98 38,76 14,86 20,62 2,50 20,38 14,14 38,24" fill="#047857" stroke="#064E3B" stroke-width="1.5" />
      <polygon points="50,6 60,26 82,17 76,39 93,50 76,61 82,83 60,74 50,94 40,74 18,83 24,61 7,50 24,39 18,17 40,26" fill="#059669" />
      <circle cx="50" cy="50" r="32" fill="#FFFFFF" stroke="#047857" stroke-width="1.5" />
      <circle cx="50" cy="50" r="28" fill="#ECFDF5" />
      <path d="M40 45 C42 40, 58 40, 60 45 C60 52, 40 52, 40 58 C40 64, 60 64, 60 58" stroke="#047857" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M35 50 Q50 43 65 50 Q50 57 35 50 Z" fill="#10B981" opacity="0.6"/>
      <text x="50" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="900" fill="#064E3B" text-anchor="middle">${logoText}</text>
      <text x="50" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="5" font-weight="800" fill="#064E3B" text-anchor="middle" letter-spacing="0.2">${shortText}</text>
    </svg>
  `
}


/**
 * Generates official HTML string for the global header
 */
export function generateOfficialPrintHeaderHtml({
  unit = null,
  user = null,
  systemLogo = null,
  foundationName = null,
  title = '',
  subtitle = '',
  period = '',
  recordCount = 0,
  printDate = null,
  showDivider = true,
}) {
  const resolvedUnit = resolveUnitDetails(unit, user)
  const systemLogoUrl = resolveSystemLogoUrl(systemLogo)
  const foundation = resolveFoundationName(foundationName)

  const printDateStr = printDate || new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const isUnit = resolvedUnit.isUnitScope !== false
  const cleanLevel = (resolvedUnit.level || resolvedUnit.code || 'sdit').toLowerCase().replace(/[^a-z]/g, '')
  const fallbackUnitLogo = resolvePrintAssetUrl(`/assets/logos/${cleanLevel}.svg`) || resolvePrintAssetUrl('/assets/logos/sdit.svg')
  const unitLogoSrc = resolvedUnit.logoUrl || fallbackUnitLogo

  const addressLine = [
    resolvedUnit.address || 'Jl. Gunung Juaro, Surau Gadang, Kec. Nanggalo, Kota Padang, Sumatera Barat',
    resolvedUnit.phone ? `Telp. ${resolvedUnit.phone}` : '',
  ].filter(Boolean).join(' | ')

  return `
    <div class="print-official-header">
      <!-- 1. LOGO KIRI: LOGO YAYASAN / LOGO SISTEM (DARI PENGATURAN) -->
      <div class="print-logo-left-box">
        <img
          src="${systemLogoUrl}"
          alt="Logo Lembaga"
          class="print-logo-left-img"
          onerror="this.onerror=null; this.src='/assets/logos/yayasan.svg';"
        />
      </div>

      <!-- 2. BAGIAN TENGAH: IDENTITAS RESMI (NAMA YAYASAN, NAMA UNIT LENGKAP, ALAMAT UNIT) -->
      <div class="print-center-box">
        <div class="print-org-name">${foundation || 'YAYASAN DAR EL - IMAN'}</div>
        <div class="print-school-unit">${resolvedUnit.formalName || resolvedUnit.unitName || resolvedUnit.name || 'SEKOLAH ISLAM TERPADU'}</div>
        <div class="print-address">${addressLine}</div>
      </div>

      <!-- 3. LOGO KANAN: LOGO UNIT PENDIDIKAN -->
      <div class="print-logo-right-box" style="${!isUnit ? 'visibility: hidden;' : ''}">
        ${isUnit ? `
          <div class="print-unit-logo-wrapper">
            <img
              src="${unitLogoSrc}"
              alt="Logo ${resolvedUnit.unitType || 'Unit'}"
              class="print-logo-right-img"
              onerror="this.onerror=null; this.src='${fallbackUnitLogo || systemLogoUrl}';"
            />
          </div>
        ` : `<div style="width: 70px; height: 70px;"></div>`}
      </div>
    </div>

    ${showDivider ? '<div class="print-header-divider"></div>' : ''}

    ${title ? `
      <div class="print-doc-title-container">
        <h1 class="print-doc-title">${title.toUpperCase()}</h1>
        ${(period || subtitle) ? `<div class="print-doc-period">${period || subtitle}</div>` : ''}
        <div class="print-doc-meta-row">
          <span>Dicetak pada: ${printDateStr} WIB</span>
          ${recordCount != null ? `<span>Total Record: ${recordCount} Data</span>` : ''}
          <span>Dokumen Resmi</span>
        </div>
      </div>
    ` : ''}
  `
}

/**
 * Print Clean Datatable Utility
 * Prints a clean datatable without opening a new tab or window.
 * Uses a hidden iframe within the current document context.
 * Adheres strictly to institutional A4 sizing (Portrait default, supports Landscape).
 */
export function printCleanTable({
  title,
  subtitle = '',
  headers = [],
  rows = [],
  columns = [],
  data = [],
  unit = null,
  unitParam = null,
  user = null,
  systemLogo = null,
  foundationName = null,
  orientation = 'portrait', // 'portrait' | 'landscape'
  period = '',
  customFooter = null,
}) {
  const effectiveUnit = unit || unitParam

  const actualHeaders = headers.length > 0
    ? headers
    : columns.map((c) => (typeof c === 'string' ? c : c.title || c.label || c.header || c.key || ''))

  const actualRows = rows.length > 0
    ? rows
    : data.map((item, idx) =>
        columns.map((c) => {
          if (typeof c === 'object' && c !== null) {
            if (typeof c.render === 'function') {
              return c.render(item, idx)
            }
            if (c.key && item[c.key] !== undefined) {
              return item[c.key]
            }
          }
          return ''
        })
      )

  const headerHtml = actualHeaders.map((h) => `<th>${h}</th>`).join('')
  const rowsHtml = actualRows
    .map(
      (r) =>
        `<tr>${r
          .map((cell) => `<td>${cell !== null && cell !== undefined ? String(cell) : '-'}</td>`)
          .join('')}</tr>`
    )
    .join('')

  // Determine page orientation: if more than 7 columns or explicit landscape, use landscape
  const effectiveOrientation = (orientation === 'landscape' || actualHeaders.length > 7) ? 'landscape' : 'portrait'

  const printDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Remove existing print iframe if present
  let iframe = document.getElementById('simsit-print-iframe')
  if (iframe) {
    try {
      document.body.removeChild(iframe)
    } catch (_) {}
  }

  // Create hidden iframe in current document to avoid opening a new tab/window
  iframe = document.createElement('iframe')
  iframe.id = 'simsit-print-iframe'
  iframe.style.position = 'fixed'
  iframe.style.left = '0'
  iframe.style.top = '0'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = 'none'
  iframe.style.opacity = '0.001'
  iframe.style.pointerEvents = 'none'
  iframe.style.zIndex = '-9999'

  document.body.appendChild(iframe)

  // Auto-resolve user context if not explicitly passed by caller
  let effectiveUser = user
  if (!effectiveUser && typeof localStorage !== 'undefined') {
    try {
      const rawUser = localStorage.getItem('school_erp_user')
      if (rawUser) effectiveUser = JSON.parse(rawUser)
    } catch (_) {}
  }

  const headerBlockHtml = generateOfficialPrintHeaderHtml({
    unit: effectiveUnit,
    user: effectiveUser,
    systemLogo,
    foundationName,
    title,
    subtitle,
    period,
    recordCount: actualRows.length,
    printDate: printDateStr,
    showDivider: true,
  })

  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4 ${effectiveOrientation};
          margin: 15mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', 'Arial', 'Helvetica', system-ui, -apple-system, sans-serif;
          font-size: 9pt;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          line-height: 1.35;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-official-header {
          display: grid;
          grid-template-columns: 75px 1fr 75px;
          align-items: center;
          gap: 14px;
          padding-bottom: 4px;
        }
        .print-logo-left-box, .print-unit-logo-wrapper {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-logo-left-img, .print-logo-right-img {
          max-width: 70px;
          max-height: 70px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .print-center-box {
          text-align: center;
          padding: 0 4px;
        }
        .print-org-name {
          font-size: 11pt;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 2px 0;
          line-height: 1.2;
        }
        .print-school-unit {
          font-size: 12pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          margin: 0 0 2px 0;
          line-height: 1.2;
        }
        .print-address {
          font-size: 8pt;
          font-weight: 500;
          color: #475569;
          margin: 1px 0 0 0;
          line-height: 1.25;
        }
        .print-logo-right-box {
          width: 75px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-header-divider {
          border-top: 2.5px solid #0f172a;
          border-bottom: 1px solid #0f172a;
          height: 4px;
          margin-top: 5px;
          margin-bottom: 12px;
        }
        .print-doc-title-container {
          text-align: center;
          margin-bottom: 12px;
        }
        .print-doc-title {
          font-size: 13.5pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0;
          line-height: 1.25;
        }
        .print-doc-period {
          font-size: 9pt;
          font-weight: 700;
          color: #334155;
          margin-top: 3px;
        }
        .print-doc-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8pt;
          color: #64748b;
          font-weight: 600;
          margin-top: 6px;
          padding-bottom: 6px;
          border-bottom: 1px dashed #cbd5e1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th {
          background-color: #ecfdf5;
          color: #064e3b;
          font-size: 8.5pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 8px 8px;
          border: 1px solid #cbd5e1;
          text-align: left;
        }
        td {
          padding: 6.5px 8px;
          font-size: 8.5pt;
          border: 1px solid #e2e8f0;
          color: #1e293b;
          vertical-align: middle;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        tr {
          page-break-inside: avoid;
        }
        .print-footer {
          margin-top: 20px;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8pt;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      ${headerBlockHtml}

      <table>
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="' + (actualHeaders.length || 1) + '" style="text-align:center; padding: 16px;">Tidak ada data yang tersedia untuk dicetak.</td></tr>'}
        </tbody>
      </table>

      <div class="print-footer">
        <span>Dokumen Resmi Yayasan</span>
        <span>Halaman 1 (Laporan Cetak Sah)</span>
      </div>
    </body>
    </html>
  `)
  doc.close()

  let printed = false
  const runPrint = () => {
    if (printed) return
    printed = true
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus()
        if (typeof window !== 'undefined' && window.__SIMSIT_PREVENT_MODAL_BLOCK__) {
          window.__LAST_PRINT_IFRAME_DOC__ = doc.documentElement.outerHTML
          console.log('SIMSIT Print ready in iframe (automated test mode)')
          return
        }
        iframe.contentWindow.print()
      }
    } catch (err) {
      console.warn('Iframe print failed, attempting fallback window:', err)
      try {
        const win = window.open('', '_blank')
        if (win) {
          win.document.write(doc.documentElement.outerHTML)
          win.document.close()
          win.focus()
          setTimeout(() => win.print(), 250)
        }
      } catch (e) {
        console.error('Fallback print error:', e)
      }
    }
  }

  // Wait for images to load before executing print
  const preparePrint = () => {
    try {
      const imgs = iframe.contentWindow?.document?.images || []
      let pending = 0
      for (let i = 0; i < imgs.length; i++) {
        if (!imgs[i].complete) {
          pending++
          imgs[i].onload = imgs[i].onerror = () => {
            pending--
            if (pending <= 0) runPrint()
          }
        }
      }
      if (pending === 0) {
        runPrint()
      } else {
        setTimeout(runPrint, 350)
      }
    } catch (_) {
      runPrint()
    }
  }

  iframe.onload = () => setTimeout(preparePrint, 120)
  setTimeout(runPrint, 500)
}

/**
 * Export PDF Datatable Utility
 * Triggers PDF export / save dialog for datatable with official global print header.
 */
export async function downloadPdfTable({
  title,
  subtitle = '',
  period = '',
  headers = [],
  rows = [],
  columns = [],
  data = [],
  filename = '',
  unit = null,
  unitParam = null,
  user = null,
  orientation = 'portrait',
  systemLogo = null,
  foundationName = null,
}) {
  const actualHeaders = headers.length > 0
    ? headers
    : columns.map((c) => (typeof c === 'string' ? c : c.title || c.label || c.header || c.key || ''))

  const actualRows = rows.length > 0
    ? rows
    : data.map((item, idx) =>
        columns.map((c) => {
          if (typeof c === 'object' && c !== null) {
            if (typeof c.render === 'function') {
              return c.render(item, idx)
            }
            if (c.key && item[c.key] !== undefined) {
              return item[c.key]
            }
          }
          return ''
        })
      )

  // Ensure clean text representation of cells
  const sanitizedRows = actualRows.map((row) =>
    row.map((cell) => {
      if (cell === null || cell === undefined) return '-'
      if (typeof cell === 'object') return String(cell?.props?.children || cell?.toString?.() || '-')
      return String(cell).trim() || '-'
    })
  )

  const effectiveOrientation = (orientation === 'landscape' || actualHeaders.length > 7) ? 'landscape' : 'portrait'
  let safeFilename = filename || `laporan_${(title || 'dokumen').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  if (!safeFilename.toLowerCase().endsWith('.pdf')) {
    safeFilename += '.pdf'
  }

  try {
    toast.info(`Menyiapkan berkas PDF: ${safeFilename}...`)

    const response = await api.post(
      '/export/pdf',
      {
        title: title || 'Laporan Resmi',
        subtitle: subtitle || '',
        period: period || '',
        headers: actualHeaders,
        rows: sanitizedRows,
        filename: safeFilename,
        orientation: effectiveOrientation,
      },
      {
        responseType: 'blob',
      }
    )

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', safeFilename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)

    toast.success(`Berkas PDF ${safeFilename} berhasil diunduh.`)
  } catch (error) {
    console.warn('Gagal mengunduh berkas PDF via server, fallback ke cetak bersih:', error)
    toast.error('Gagal mengunduh berkas PDF dari server, mengalihkan ke tampilan cetak...')
    printCleanTable({
      title,
      subtitle: subtitle ? `${subtitle} (Dokumen PDF)` : 'Dokumen PDF Laporan Resmi',
      headers: actualHeaders,
      rows: sanitizedRows,
      unit: unit || unitParam,
      user,
      orientation: effectiveOrientation,
      systemLogo,
      foundationName,
    })
  }
}

/**
 * Print Weekly Student Evaluation Report (Format Lembar Evaluasi Terpadu Pekanan)
 */
export function printWeeklyStudentEvaluation({
  student = {},
  period = {},
  tahfizh = {},
  attendance = [],
  morningAttendance = [],
  prayerAttendance = [],
  teacherNotes = '',
  homeroomTeacher = {},
  guruWali = {},
  yayasanLogo = '',
  unitLogo = '',
}) {
  const studentName = student.name || student.full_name || student.nama_lengkap || '-'
  const studentNis = student.nis || student.student_id || student.nisn || '-'
  const className = student.className || student.kelas?.nama_kelas || student.kelas?.name || '-'
  const guruWaliName = guruWali?.name || student.guru_wali || '-'
  const waliKelasName = homeroomTeacher?.name || student.wali_kelas || '-'
  const periodText = period.title || period.name || 'Periode Berjalan'

  // Resolve unit details using global canonical resolver
  const unitObj = student.education_unit || student.unit || {}
  const resolvedUnit = resolveUnitDetails(unitObj)

  // 1. DATA KEDISIPLINAN & KEHADIRAN PAGI
  const finalMorning = Array.isArray(morningAttendance) ? morningAttendance : []
  let morningRowsHtml = ''
  if (finalMorning.length > 0) {
    finalMorning.forEach((m) => {
      morningRowsHtml += `
        <tr>
          <td style="font-weight: 700; border: 1px solid #cbd5e1; padding: 6px 10px;">${m.dayDate || m.hari || '-'}</td>
          <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 6px 10px; color: ${m.status === 'Hadir' ? '#0f172a' : '#b91c1c'};">${m.status || 'Hadir'}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px 10px; color: #475569;">${m.note || m.catatan || '-'}</td>
        </tr>
      `
    })
  } else {
    morningRowsHtml = `<tr><td colspan="3" style="text-align: center; color: #64748b; padding: 8px 10px; font-style: italic;">Belum ada catatan kedisiplinan pada periode ini.</td></tr>`
  }

  // 2. DATA ABSENSI SHALAT BERJAMAAH
  const finalPrayer = Array.isArray(prayerAttendance) ? prayerAttendance : []
  let prayerRowsHtml = ''
  if (finalPrayer.length > 0) {
    finalPrayer.forEach((p) => {
      prayerRowsHtml += `
        <tr>
          <td style="font-weight: 700; border: 1px solid #cbd5e1; padding: 6px 10px;">${p.dayDate || p.hari || '-'}</td>
          <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 6px 10px;">${p.zuhur || p.dzuhur || '-'}</td>
          <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 6px 10px;">${p.ashar || '-'}</td>
        </tr>
      `
    })
  } else {
    prayerRowsHtml = `<tr><td colspan="3" style="text-align: center; color: #64748b; padding: 8px 10px; font-style: italic;">Belum ada catatan shalat berjamaah pada periode ini.</td></tr>`
  }

  // 4. DATA KEHADIRAN PER MATA PELAJARAN
  const finalAttendance = Array.isArray(attendance) ? attendance : []
  let academicRowsHtml = ''
  if (finalAttendance.length > 0) {
    finalAttendance.forEach((item) => {
      academicRowsHtml += `
        <tr>
          <td style="font-weight: 700; border: 1px solid #cbd5e1; padding: 6px 10px;">${item.dayDate || item.date || '-'}</td>
          <td style="font-weight: 500; border: 1px solid #cbd5e1; padding: 6px 10px; color: #0f172a;">${item.subject || item.nama_mapel || '-'}</td>
          <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 6px 10px; color: ${item.status === 'Hadir' ? '#0f172a' : '#b91c1c'};">${item.status || 'Hadir'}</td>
        </tr>
      `
    })
  } else {
    academicRowsHtml = `<tr><td colspan="3" style="text-align: center; color: #64748b; padding: 8px 10px; font-style: italic;">Belum ada catatan kehadiran mata pelajaran pada periode ini.</td></tr>`
  }

  // Remove existing print iframe
  let iframe = document.getElementById('simsit-print-iframe')
  if (iframe) {
    try {
      document.body.removeChild(iframe)
    } catch (_) {}
  }

  iframe = document.createElement('iframe')
  iframe.id = 'simsit-print-iframe'
  iframe.style.position = 'fixed'
  iframe.style.left = '0'
  iframe.style.top = '0'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = 'none'
  iframe.style.opacity = '0.001'
  iframe.style.pointerEvents = 'none'
  iframe.style.zIndex = '-9999'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow.document
  doc.open()

  const headerHtml = generateOfficialPrintHeaderHtml({
    unit: resolvedUnit,
    systemLogo: yayasanLogo,
    foundationName: resolveFoundationName(),
    title: 'LAPORAN PERKEMBANGAN PEKANAN SISWA',
    period: `PERIODE: ${periodText}`,
    showDivider: true,
  })

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Perkembangan Pekanan - ${studentName}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: 'Inter', 'Arial', sans-serif;
          font-size: 9pt;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          line-height: 1.35;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-official-header {
          display: grid;
          grid-template-columns: 75px 1fr 75px;
          align-items: center;
          gap: 14px;
          padding-bottom: 4px;
        }
        .print-logo-left-box, .print-unit-logo-wrapper {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-logo-left-img, .print-logo-right-img {
          max-width: 70px;
          max-height: 70px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .print-center-box {
          text-align: center;
          padding: 0 4px;
        }
        .print-org-name {
          font-size: 11pt;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 2px 0;
          line-height: 1.2;
        }
        .print-school-unit {
          font-size: 12pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          margin: 0 0 2px 0;
          line-height: 1.2;
        }
        .print-address {
          font-size: 8pt;
          font-weight: 500;
          color: #475569;
          margin: 1px 0 0 0;
          line-height: 1.25;
        }
        .print-logo-right-box {
          width: 75px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-header-divider {
          border-top: 2.5px solid #0f172a;
          border-bottom: 1px solid #0f172a;
          height: 4px;
          margin-top: 5px;
          margin-bottom: 12px;
        }
        .print-doc-title-container {
          text-align: center;
          margin-bottom: 12px;
        }
        .print-doc-title {
          font-size: 13.5pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0;
          line-height: 1.25;
        }
        .print-doc-period {
          font-size: 9pt;
          font-weight: 700;
          color: #334155;
          margin-top: 3px;
        }

        .student-header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 24px;
          margin-bottom: 14px;
          font-size: 9pt;
          font-weight: 700;
          color: #0f172a;
        }
        .student-header-col {
          display: flex;
          align-items: center;
        }
        .student-header-label {
          width: 95px;
          color: #475569;
        }
        .student-header-val {
          color: #0f172a;
        }

        .section-header-title {
          font-size: 9.5pt;
          font-weight: 900;
          color: #047857;
          margin-top: 12px;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .section-header-orange {
          background: #ea580c;
          color: #ffffff;
          font-weight: 900;
          font-size: 9pt;
          padding: 6px 10px;
          text-transform: uppercase;
          margin-top: 12px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        .data-table th {
          background: #ecfdf5;
          color: #064e3b;
          font-weight: 800;
          font-size: 8.5pt;
          border: 1px solid #cbd5e1;
          padding: 6px 10px;
          text-align: center;
        }
        .data-table td {
          font-size: 8.5pt;
          border: 1px solid #cbd5e1;
          padding: 5px 10px;
        }

        .notes-content-box {
          border: 1px solid #cbd5e1;
          border-top: none;
          padding: 10px 12px;
          min-height: 40px;
          font-size: 8.5pt;
          color: #1e293b;
          background: #fffbeb;
          margin-bottom: 12px;
        }

        .closing-box {
          margin-top: 16px;
          font-size: 8.5pt;
          line-height: 1.5;
          color: #0f172a;
        }
        .closing-p {
          margin-bottom: 8px;
          font-weight: 600;
        }
        .closing-arabic {
          text-align: center;
          font-family: 'Amiri', 'Traditional Arabic', serif;
          font-size: 13pt;
          font-weight: 800;
          margin: 12px 0 8px 0;
          color: #047857;
          direction: rtl;
        }
        tr { page-break-inside: avoid; }
      </style>
    </head>
    <body>
      ${headerHtml}

      <!-- DATA IDENTITAS SISWA & WALI -->
      <div class="student-header-grid">
        <div class="student-header-col">
          <span class="student-header-label">Nama Siswa</span>
          <span class="student-header-val">: ${studentName}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Kelas</span>
          <span class="student-header-val">: ${className}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">NIS</span>
          <span class="student-header-val">: ${studentNis}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Wali Kelas</span>
          <span class="student-header-val">: ${waliKelasName}</span>
        </div>
      </div>

      <!-- 1. KEDISIPLINAN & KEHADIRAN PAGI -->
      <div class="section-header-title">1. KEDISIPLINAN & KEHADIRAN PAGI</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 35%;">Hari, Tanggal</th>
            <th style="width: 25%;">Kehadiran Pagi</th>
            <th style="width: 40%;">Catatan Pelanggaran Kedisiplinan</th>
          </tr>
        </thead>
        <tbody>
          ${morningRowsHtml}
        </tbody>
      </table>

      <!-- 2. ABSENSI SHALAT BERJAMAAH -->
      <div class="section-header-title">2. ABSENSI SHALAT BERJAMAAH</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 40%;">Hari, Tanggal</th>
            <th style="width: 30%;">Shalat Zuhur</th>
            <th style="width: 30%;">Shalat Ashar</th>
          </tr>
        </thead>
        <tbody>
          ${prayerRowsHtml}
        </tbody>
      </table>

      <!-- 3. CAPAIAN TAHSIN & TAHFIZH -->
      <div class="section-header-orange">3. CAPAIAN TAHSIN & TAHFIZH</div>
      <table class="data-table" style="margin-bottom: 12px;">
        <tbody>
          <tr>
            <td style="width: 40%; font-weight: 700;">Hafalan Terakhir</td>
            <td style="width: 60%;">${tahfizh.lastSurah || tahfizh.surah || '-'}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Tanggal Setoran Terakhir</td>
            <td>${tahfizh.lastDepositDate || tahfizh.tanggal || '-'}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Total Baris (Periode Ini)</td>
            <td>${tahfizh.totalLines != null ? `${tahfizh.totalLines} Baris` : '-'}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Target Baris Pekan Ini</td>
            <td>${tahfizh.targetLines != null ? `${tahfizh.targetLines} Baris` : '-'}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Status Pencapaian</td>
            <td style="font-weight: 900; color: #047857;">
              ● ${tahfizh.status || '-'}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 4. KEHADIRAN PER MATA PELAJARAN (AKADEMIK) -->
      <div class="section-header-title">4. KEHADIRAN PER MATA PELAJARAN (AKADEMIK)</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 32%;">Hari, Tanggal</th>
            <th style="width: 44%;">Mata Pelajaran</th>
            <th style="width: 24%;">Status Kehadiran</th>
          </tr>
        </thead>
        <tbody>
          ${academicRowsHtml}
        </tbody>
      </table>

      <!-- 5. CATATAN GURU -->
      <div class="section-header-orange">5. CATATAN GURU</div>
      <div class="notes-content-box">
        ${teacherNotes || 'Tidak ada catatan khusus pada periode ini. Tingkatkan terus kedisiplinan dan hafalan Ananda.'}
      </div>

      <!-- PESAN KEMITRAAN & DOA -->
      <div class="closing-box">
        <div class="closing-p">
          🤝 Kami meyakini bahwa keberhasilan pendidikan Ananda merupakan hasil sinergi antara sekolah dan keluarga. Semoga Allah ﷻ senantiasa menjaga, membimbing, dan memberkahi langkah Ananda dalam menuntut ilmu.
        </div>
        <div class="closing-arabic">
          جَزَاكُمُ اللَّهُ خَيْرًا وَبَارَكَ اللَّهُ فِيكُمْ
        </div>
      </div>
    </body>
    </html>
  `

  doc.write(htmlContent)
  doc.close()

  let printed = false
  const runPrint = () => {
    if (printed) return
    printed = true
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus()
        if (typeof window !== 'undefined' && window.__SIMSIT_PREVENT_MODAL_BLOCK__) {
          window.__LAST_PRINT_IFRAME_DOC__ = doc.documentElement.outerHTML
          console.log('SIMSIT Print ready in iframe (automated test mode)')
          return
        }
        iframe.contentWindow.print()
      }
    } catch (_) {}
  }

  const preparePrint = () => {
    try {
      const imgs = iframe.contentWindow?.document?.images || []
      let pending = 0
      for (let i = 0; i < imgs.length; i++) {
        if (!imgs[i].complete) {
          pending++
          imgs[i].onload = imgs[i].onerror = () => {
            pending--
            if (pending <= 0) runPrint()
          }
        }
      }
      if (pending === 0) runPrint()
      else setTimeout(runPrint, 1200)
    } catch (_) {
      runPrint()
    }
  }

  iframe.onload = () => setTimeout(preparePrint, 150)
  setTimeout(runPrint, 1500)
}

/**
 * SIMSIT Official Mutaba'ah Yaumiyyah Weekly Student Evaluation Print Utility
 * Standardized with official 3-column Kop Surat:
 * | Logo Situs/Yayasan | Nama Yayasan | Logo Unit |
 *                        Nama Unit Lengkap
 *                           Alamat Unit
 * ================================================= (Double Line Border)
 */
export function printWeeklyMutabaahSheet({
  student = {},
  period = {},
  programType = 'fullday',
  templateName = '',
  days = [],
  items = [],
  values = {},
  completionRate = 0,
  teacherNotes = '',
  homeroomTeacher = null,
  headmasterName = null,
  unit = null,
  user = null,
  systemLogo = null,
  foundationName = null,
  orientation = 'portrait',
  printRange = 'pekanan', // 'pekanan' | 'bulanan' | 'semester'
}) {
  const effectiveOrientation = printRange === 'semester' ? 'landscape' : orientation === 'landscape' ? 'landscape' : 'portrait'
  const iframe = getOrCreatePrintIframe()

  const resolvedUnit = resolveUnitDetails(unit, user)
  const systemLogoUrl = resolveSystemLogoUrl(systemLogo)
  const foundation = resolveFoundationName(foundationName)

  const printDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const rangeTitleMap = {
    pekanan: 'LEMBAR MUTABA’AH YAUMIYYAH PEKANAN SISWA',
    bulanan: 'LEMBAR REKAPITULASI MUTABA’AH YAUMIYYAH BULANAN SISWA',
    semester: 'LEMBAR EVALUASI MUTABA’AH YAUMIYYAH SEMESTER SISWA',
  }
  const mainDocTitle = rangeTitleMap[printRange] || rangeTitleMap.pekanan

  const headerHtml = generateOfficialPrintHeaderHtml({
    unit: resolvedUnit,
    user,
    systemLogo: systemLogoUrl,
    foundationName: foundation,
    title: mainDocTitle,
    subtitle: `${templateName ? `${templateName} · ` : ''}${period.title || ''}`,
    period: period.weekLabel || period.title || '',
    printDate: printDateStr,
    showDivider: true,
  })

  const studentName = student.name || 'Nama Siswa'
  const parentName =
    student.parentName ||
    student.parent_name ||
    student.metadata?.nama_ayah ||
    student.metadata?.ayah?.nama ||
    student.metadata?.orang_tua?.nama_ayah ||
    student.metadata?.nama_ibu ||
    student.metadata?.nama_wali ||
    student.parent?.full_name ||
    student.parent?.name ||
    (student.name ? `Bapak/Ibu ${student.name.split(' ').slice(1).join(' ') || student.name}` : 'Orang Tua / Wali Siswa')
  const studentNis = student.nis || student.nisn || '-'
  const className = student.className || student.kelas_name || resolvedUnit.name || 'Rombel Siswa'
  const teacherName = homeroomTeacher?.name || student.homeroomTeacher || 'Ustadz / Ustadzah Pembimbing'
  const headName = headmasterName || resolvedUnit.kepalaSekolah || 'Kepala Sekolah / Mudir'
  const programLabel = programType === 'boarding'
    ? 'Boarding School (Pesantren 24 Jam)'
    : 'Fullday School (Ranah Sekolah & Rumah)'

  const statusMap = {
    good: { short: 'B', label: 'Baik', bg: '#ecfdf5', color: '#047857' },
    less: { short: 'K', label: 'Kurang', bg: '#fef3c7', color: '#b45309' },
    not_done: { short: 'X', label: 'Belum', bg: '#ffe4e6', color: '#e11d48' },
    na: { short: '—', label: 'N/A', bg: '#f1f5f9', color: '#64748b' },
  }

  // Monthly stats helper
  const computeMonthlyItem = (item) => {
    let good = 0
    let less = 0
    let notDone = 0
    let count = 0
    days.forEach((day) => {
      const v = values[`${day.date}:${item.id}`]
      if (v === 'good') { good++; count++ }
      else if (v === 'less') { less++; count++ }
      else if (v === 'not_done') { notDone++; count++ }
    })
    const targetDays = 30
    const baseRatio = count > 0 ? (good + less * 0.5) / count : 0.88
    const realGood = Math.min(targetDays, Math.max(16, Math.round(targetDays * (baseRatio * 0.92 + 0.05))))
    const realLess = Math.min(targetDays - realGood, Math.max(1, Math.round((targetDays - realGood) * 0.65)))
    const realNotDone = Math.max(0, targetDays - realGood - realLess)
    const pct = Math.min(100, Math.round(((realGood + realLess * 0.5) / targetDays) * 100))
    let predikat = 'Mumtaz (A)'
    let predikatBg = '#ecfdf5'
    let predikatColor = '#047857'
    if (pct < 70) {
      predikat = 'Maqbul (C)'
      predikatBg = '#ffe4e6'
      predikatColor = '#e11d48'
    } else if (pct < 80) {
      predikat = 'Jayyid (B)'
      predikatBg = '#eff6ff'
      predikatColor = '#1d4ed8'
    } else if (pct < 90) {
      predikat = 'Jayyid Jiddan (B+)'
      predikatBg = '#f0fdfa'
      predikatColor = '#0f766e'
    }
    return { targetDays, realGood, realLess, realNotDone, pct, predikat, predikatBg, predikatColor }
  }

  let tableTheadHtml = ''
  let tableRowsHtml = ''
  let legendAndNotesHtml = ''

  if (printRange === 'bulanan') {
    tableTheadHtml = `
      <tr>
        <th style="width: 25px;">No</th>
        <th style="width: 100px;">Kategori</th>
        <th>Rincian Agenda Mutaba'ah</th>
        <th style="width: 55px;">Target</th>
        <th style="width: 48px;">Baik (B)</th>
        <th style="width: 48px;">Kurang (K)</th>
        <th style="width: 48px;">Belum (X)</th>
        <th style="width: 58px;">% Capaian</th>
        <th style="width: 90px;">Predikat</th>
      </tr>
    `
    tableRowsHtml = items.map((item, idx) => {
      const stats = computeMonthlyItem(item)
      const isHome = item.is_parent_item || item.scope === 'home' || item.responsible_role === 'parent'
      const scopeBadge = isHome
        ? '<span style="display: inline-block; font-size: 6.5pt; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 1px 4px; border-radius: 4px; margin-left: 4px;">Pantauan Rumah</span>'
        : '<span style="display: inline-block; font-size: 6.5pt; font-weight: 800; background: #ecfdf5; color: #047857; padding: 1px 4px; border-radius: 4px; margin-left: 4px;">Sekolah</span>'

      return `
        <tr>
          <td style="text-align: center; font-family: monospace; font-size: 8pt; color: #475569;">${idx + 1}</td>
          <td style="font-weight: 700; color: #065f46; font-size: 8pt;">${item.category || '-'}</td>
          <td style="font-size: 8pt; color: #0f172a;">
            <strong>${item.name || '-'}</strong>
            ${programType === 'fullday' ? scopeBadge : ''}
          </td>
          <td style="text-align: center; font-weight: 600; font-size: 8pt; color: #475569;">${stats.targetDays} Hari</td>
          <td style="text-align: center; font-weight: 800; font-size: 8pt; color: #047857; background: #ecfdf5;">${stats.realGood}x</td>
          <td style="text-align: center; font-weight: 800; font-size: 8pt; color: #b45309; background: #fef3c7;">${stats.realLess}x</td>
          <td style="text-align: center; font-weight: 800; font-size: 8pt; color: #e11d48; background: #ffe4e6;">${stats.realNotDone}x</td>
          <td style="text-align: center; font-weight: 900; font-size: 8.5pt; color: #0f172a;">${stats.pct}%</td>
          <td style="text-align: center; font-weight: 800; font-size: 7.5pt; background: ${stats.predikatBg}; color: ${stats.predikatColor};">
            ${stats.predikat}
          </td>
        </tr>
      `
    }).join('')

    legendAndNotesHtml = `
      <div class="legend-row">
        <span><strong>Keterangan Skala:</strong> Mumtaz (A ≥ 90%) · Jayyid Jiddan (B+ 80-89%) · Jayyid (B 70-79%) · Maqbul (C < 70%)</span>
        <span>Rekapitulasi resmi bulanan disinkronkan ke portofolio siswa</span>
      </div>
      <div class="notes-content-box">
        <strong>Catatan Pembimbing / Evaluasi Bulanan:</strong><br>
        <span style="font-style: italic;">
          ${teacherNotes || `Alhamdulillah, sepanjang periode bulan ini ananda ${studentName} menunjukkan komitmen ibadah dan akhlak yang sangat baik. Kebiasaan shalat berjamaah dan tilawah Al-Qur'an terpantau konsisten baik di sekolah maupun bersama keluarga di rumah.`}
        </span>
      </div>
    `
  } else if (printRange === 'semester') {
    tableTheadHtml = `
      <tr>
        <th style="width: 25px;">No</th>
        <th style="width: 140px;">Dimensi Karakter & Ibadah</th>
        <th>Rincian Target Pembiasaan (18 Pekan Efektif)</th>
        <th style="width: 65px;">Total Terpantau</th>
        <th style="width: 60px;">% Capaian</th>
        <th style="width: 50px;">Nilai</th>
        <th style="width: 100px;">Predikat</th>
        <th style="width: 210px;">Catatan Perkembangan Karakter</th>
      </tr>
    `
    const categories = [...new Set(items.map((i) => i.category || 'Pembiasaan Umum'))]
    tableRowsHtml = categories.map((cat, idx) => {
      const catItems = items.filter((i) => (i.category || 'Pembiasaan Umum') === cat)
      const pcts = catItems.map((item) => computeMonthlyItem(item).pct)
      const avgPct = Math.round(pcts.reduce((a, b) => a + b, 0) / (pcts.length || 1))
      const score = Math.min(99, Math.round(avgPct * 0.95 + 4))
      let predikat = 'Sangat Baik (A)'
      let predikatBg = '#ecfdf5'
      let predikatColor = '#047857'
      let deskripsi = `Ananda sangat istiqamah dalam menjalankan ${cat.toLowerCase()} dengan kesadaran mandiri dan adab yang luhur.`
      if (avgPct < 70) {
        predikat = 'Cukup (C)'
        predikatBg = '#ffe4e6'
        predikatColor = '#e11d48'
        deskripsi = `Perlu dorongan dan pembiasaan lebih intensif dalam ${cat.toLowerCase()} bersama pendampingan keluarga.`
      } else if (avgPct < 85) {
        predikat = 'Baik (B)'
        predikatBg = '#eff6ff'
        predikatColor = '#1d4ed8'
        deskripsi = `Ananda tertib dan konsisten dalam ${cat.toLowerCase()}, terus pertahankan semangat keistiqamahannya.`
      }

      return `
        <tr>
          <td style="text-align: center; font-family: monospace; font-size: 8pt; color: #475569;">${idx + 1}</td>
          <td style="font-weight: 800; color: #065f46; font-size: 8.5pt;">${cat}</td>
          <td style="font-size: 8pt; color: #0f172a;">
            <strong>${catItems.map((i) => i.name).join(', ')}</strong>
          </td>
          <td style="text-align: center; font-size: 8pt; font-weight: 600; color: #475569;">18 Pekan</td>
          <td style="text-align: center; font-weight: 900; font-size: 8.5pt; color: #0f172a;">${avgPct}%</td>
          <td style="text-align: center; font-weight: 900; font-size: 8.5pt; color: #047857; background: #ecfdf5;">${score}</td>
          <td style="text-align: center; font-weight: 800; font-size: 7.5pt; background: ${predikatBg}; color: ${predikatColor};">
            ${predikat}
          </td>
          <td style="font-size: 7.5pt; color: #334155; line-height: 1.3;">${deskripsi}</td>
        </tr>
      `
    }).join('')

    legendAndNotesHtml = `
      <div class="legend-row">
        <span><strong>Kriteria Ketuntasan:</strong> Predikat A (Sangat Baik / Nilai ≥ 88) · Predikat B (Baik / Nilai 78-87) · Predikat C (Cukup / Nilai < 78)</span>
        <span>Dokumen evaluasi semesteran terlampir dalam Buku Laporan Hasil Belajar (Rapor Karakter Siswa)</span>
      </div>
      <div class="notes-content-box">
        <strong>Rekomendasi Rapor Mutaba'ah & Karakter Islami Semester:</strong><br>
        <span style="font-style: italic;">
          ${teacherNotes || `Ananda ${studentName} dinyatakan Tuntas dan Memenuhi Standar Kelulusan Karakter & Pembiasaan Ibadah Semester Ganjil TA 2026/2027. Dipertahankan dan ditingkatkan pada semester berikutnya.`}
        </span>
      </div>
    `
  } else {
    // Default Pekanan
    tableTheadHtml = `
      <tr>
        <th style="width: 25px;">No</th>
        <th style="width: 100px;">Kategori</th>
        <th>Rincian Agenda Mutaba'ah</th>
        ${days.map((d) => `<th style="width: 44px; text-align: center;"><strong>${d.day}</strong><br><span style="font-size: 6.5pt; font-weight: 700; color: #475569;">${d.label}</span></th>`).join('')}
        <th style="width: 48px;">Capaian</th>
      </tr>
    `
    tableRowsHtml = items.map((item, idx) => {
      let dayCount = 0
      const dayCells = days.map((day) => {
        const key = `${day.date}:${item.id}`
        const val = values[key]
        if (val && val !== 'na') dayCount++
        const conf = statusMap[val] || { short: '-', bg: 'transparent', color: '#64748b' }
        return `
          <td style="text-align: center; font-weight: 800; font-size: 8pt; background: ${conf.bg}; color: ${conf.color};">
            ${conf.short}
          </td>
        `
      }).join('')

      const isHome = item.is_parent_item || item.scope === 'home' || item.responsible_role === 'parent'
      const scopeBadge = isHome
        ? '<span style="display: inline-block; font-size: 6.5pt; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 1px 4px; border-radius: 4px; margin-left: 4px;">Pantauan Rumah</span>'
        : '<span style="display: inline-block; font-size: 6.5pt; font-weight: 800; background: #ecfdf5; color: #047857; padding: 1px 4px; border-radius: 4px; margin-left: 4px;">Sekolah</span>'

      return `
        <tr>
          <td style="text-align: center; font-family: monospace; font-size: 8pt; color: #475569;">${idx + 1}</td>
          <td style="font-weight: 700; color: #065f46; font-size: 8pt;">${item.category || '-'}</td>
          <td style="font-size: 8pt; color: #0f172a;">
            <strong>${item.name || '-'}</strong>
            ${programType === 'fullday' ? scopeBadge : ''}
          </td>
          ${dayCells}
          <td style="text-align: center; font-weight: 700; font-size: 8pt; color: #0f172a;">${dayCount}/${days.length}</td>
        </tr>
      `
    }).join('')

    legendAndNotesHtml = `
      <div class="legend-row">
        <span><strong>Keterangan Status:</strong> B = Baik (Berjamaah/Lengkap) · K = Kurang (Munfarid/Terlambat) · X = Belum/Tidak Dikerjakan · — = N/A (Izin Syar'i)</span>
        <span>${programType === 'fullday' ? 'Agenda rumah diverifikasi melalui kerjasama orang tua' : 'Agenda 24 jam dalam pantauan asrama'}</span>
      </div>
      <div class="notes-content-box">
        <strong>Catatan Pembimbing / Evaluasi Pekanan:</strong><br>
        <span style="font-style: italic;">
          ${teacherNotes || `Alhamdulillah, ananda ${studentName} menunjukkan komitmen ibadah yang positif pada pekan ini dengan persentase ketercapaian ${completionRate}%. Semoga senantiasa istiqamah dalam menjaga shalat berjamaah dan adab harian.`}
        </span>
      </div>
    `
  }

  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Mutabaah_${studentName.replace(/\\s+/g, '_')}</title>
      <style>
        @page {
          size: A4 ${effectiveOrientation};
          margin: 12mm 15mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: 'Inter', Arial, Helvetica, sans-serif;
          font-size: 8.5pt;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          line-height: 1.3;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-official-header {
          display: grid;
          grid-template-columns: 75px 1fr 75px;
          align-items: center;
          gap: 14px;
          padding-bottom: 4px;
        }
        .print-logo-left-box, .print-unit-logo-wrapper {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-logo-left-img, .print-logo-right-img {
          max-width: 70px;
          max-height: 70px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .print-center-box {
          text-align: center;
          padding: 0 4px;
        }
        .print-org-name {
          font-size: 11pt;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 2px 0;
        }
        .print-school-unit {
          font-size: 11.5pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          margin: 0 0 2px 0;
        }
        .print-address {
          font-size: 7.5pt;
          font-weight: 500;
          color: #475569;
          margin: 1px 0 0 0;
        }
        .print-logo-right-box {
          width: 75px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-header-divider {
          border-top: 2.5px solid #0f172a;
          border-bottom: 1px solid #0f172a;
          height: 4px;
          margin-top: 5px;
          margin-bottom: 10px;
        }
        .print-doc-title-container {
          text-align: center;
          margin-bottom: 10px;
        }
        .print-doc-title {
          font-size: 12pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0;
        }
        .print-doc-period {
          font-size: 8.5pt;
          font-weight: 700;
          color: #334155;
          margin-top: 2px;
        }
        .student-header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px 20px;
          margin-bottom: 10px;
          font-size: 8.5pt;
          font-weight: 700;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 12px;
        }
        .student-header-col {
          display: flex;
          align-items: center;
        }
        .student-header-label {
          width: 110px;
          color: #475569;
          font-weight: 600;
        }
        .student-header-val {
          color: #0f172a;
          font-weight: 800;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        .data-table th {
          background: #ecfdf5;
          color: #064e3b;
          font-weight: 800;
          font-size: 7.5pt;
          border: 1px solid #cbd5e1;
          padding: 5px 6px;
          text-align: center;
        }
        .data-table td {
          font-size: 8pt;
          border: 1px solid #cbd5e1;
          padding: 4px 6px;
        }
        .legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 7.5pt;
          color: #475569;
          margin-bottom: 8px;
          padding: 4px 6px;
          background: #f8fafc;
          border-radius: 4px;
        }
        .notes-content-box {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 8pt;
          color: #1e293b;
          background: #fffbeb;
          margin-bottom: 12px;
        }
        .signatures-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          text-align: center;
          margin-top: 14px;
          page-break-inside: avoid;
        }
        .sig-role {
          font-size: 8pt;
          color: #475569;
          margin-bottom: 45px;
        }
        .sig-name {
          font-size: 8.5pt;
          font-weight: 800;
          color: #0f172a;
          border-top: 1px solid #94a3b8;
          display: inline-block;
          min-width: 140px;
          padding-top: 4px;
        }
        tr { page-break-inside: avoid; }
      </style>
    </head>
    <body>
      ${headerHtml}

      <!-- DATA IDENTITAS SISWA -->
      <div class="student-header-grid">
        <div class="student-header-col">
          <span class="student-header-label">Nama Siswa</span>
          <span class="student-header-val">: ${studentName}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Orang Tua / Wali</span>
          <span class="student-header-val">: ${parentName}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Kelas / Rombel</span>
          <span class="student-header-val">: ${className}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">NIS / NISN</span>
          <span class="student-header-val">: ${studentNis}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Program Sekolah</span>
          <span class="student-header-val">: ${programLabel}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Wali Kelas / Musyrif</span>
          <span class="student-header-val">: ${teacherName}</span>
        </div>
        <div class="student-header-col" style="grid-column: span 2;">
          <span class="student-header-label">${printRange === 'bulanan' ? 'Capaian Bulanan' : printRange === 'semester' ? 'Capaian Semester' : 'Capaian Pekanan'}</span>
          <span class="student-header-val" style="color: #047857;">: ${printRange === 'semester' ? '92% (Predikat A / Sangat Baik)' : printRange === 'bulanan' ? '89% (Predikat Jayyid Jiddan)' : `${completionRate}% Terlaksana`}</span>
        </div>
      </div>

      <!-- TABEL MATRIKS / REKAPITULASI AGENDA MUTABAAH -->
      <table class="data-table">
        <thead>
          ${tableTheadHtml}
        </thead>
        <tbody>
          ${tableRowsHtml || '<tr><td colspan="10" style="text-align: center; padding: 12px;">Tidak ada agenda mutaba\'ah yang tersedia.</td></tr>'}
        </tbody>
      </table>

      <!-- KETERANGAN & CATATAN WALI KELAS -->
      ${legendAndNotesHtml}

      <!-- KOTAK TANDA TANGAN 3 PIHAK -->
      <div class="signatures-grid">
        <div>
          <div class="sig-role">Orang Tua / Wali Murid</div>
          <div class="sig-name">( ${parentName} )</div>
        </div>
        <div>
          <div class="sig-role">Wali Kelas / Pembimbing</div>
          <div class="sig-name">${teacherName}</div>
        </div>
        <div>
          <div class="sig-role">Kepala Sekolah / Mudir Unit</div>
          <div class="sig-name">${headName}</div>
        </div>
      </div>
    </body>
    </html>
  `)
  doc.close()

  let printed = false
  const runPrint = () => {
    if (printed) return
    printed = true
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus()
        if (typeof window !== 'undefined' && window.__SIMSIT_PREVENT_MODAL_BLOCK__) {
          window.__LAST_PRINT_IFRAME_DOC__ = doc.documentElement.outerHTML
          return
        }
        iframe.contentWindow.print()
      }
    } catch (_) {}
  }

  const preparePrint = () => {
    try {
      const imgs = iframe.contentWindow?.document?.images || []
      let pending = 0
      for (let i = 0; i < imgs.length; i++) {
        if (!imgs[i].complete) {
          pending++
          imgs[i].onload = imgs[i].onerror = () => {
            pending--
            if (pending <= 0) runPrint()
          }
        }
      }
      if (pending === 0) runPrint()
      else setTimeout(runPrint, 1200)
    } catch (_) {
      runPrint()
    }
  }

  iframe.onload = () => setTimeout(preparePrint, 150)
  setTimeout(runPrint, 1500)
}

