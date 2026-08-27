import React, { useState, useEffect } from 'react'
import { FaTimes, FaCloudUploadAlt, FaArrowRight, FaArrowLeft, FaSave, FaCheckCircle, FaTrashAlt } from 'react-icons/fa'
import Swal from 'sweetalert2'
import { getProvinsiList, getKotaOptions, getKecamatanOptions, getKelurahanOptions, getBirthPlaceOptions } from './wilayahData'
import AddressMap from './AddressMap'
import { educationUnitService } from '../../services/educationUnitService'
import { kelasService } from '../../services/kelasService'
import { api } from '../../services/api'
import { useProvinsiList, useKotaOptions, useKecamatanOptions, useKelurahanOptions } from '../../hooks/useWilayah'
import PersonAvatar, { resolveAvatarUrl } from '../ui/PersonAvatar'

const defaultForm = () => ({
  foto_url: '', no_pendaftaran: '', nik: '', no_registrasi_akta_lahir: '', no_kk: '', nisn: '', full_name: '', birth_date: '', birth_place: '', gender: 'male', agama: 'Islam', email: '', anak_ke: '', jumlah_saudara: '', jumlah_saudara_tiri: '', berat_badan: '', tinggi_badan: '', riwayat_penyakit: '', kewarganegaraan: 'WNI', alamat_siswa: '', rt: '', rw: '', dusun: '', kelurahan: '', kecamatan: '', kode_pos: '', kota_kabupaten: '', provinsi: '', jenis_tempat_tinggal: '', jarak_tempuh_ke_sekolah: '', moda_transportasi: '', hobi: '', cita_cita: '', latitude: '', longitude: '',
  sekolah_asal: '', status_sekolah_asal: 'Negeri', kecamatan_sekolah_asal: '', kota_kab_sekolah_asal: '', nomor_hp_wa_sekolah_asal: '', nominal_spp: '', nominal_ortu_asuh: '', penerima_kps_pkh: 'tidak', apakah_punya_kip: 'tidak', apakah_layak_menerima_pip: 'tidak', alasan_menolak_pip: '',
  nik_ayah: '', nama_ayah: '', tempat_lahir_ayah: '', tgl_lahir_ayah: '', telfon_ayah: '', hp_ayah: '', pendidikan_terakhir_ayah: '', pekerjaan_ayah: '', instansi_pekerjaan_ayah: '', jabatan_pekerjaan_ayah: '', alamat_instansi_ayah: '', keahlian_ayah: '', penghasilan_ayah: '', alamat_ayah: '', nomor_wa_ayah: '', medsos_ayah: '',
  nik_ibu: '', nama_ibu: '', tempat_lahir_ibu: '', tgl_lahir_ibu: '', telfon_ibu: '', hp_ibu: '', pendidikan_terakhir_ibu: '', pekerjaan_ibu: '', instansi_pekerjaan_ibu: '', jabatan_pekerjaan_ibu: '', alamat_instansi_ibu: '', keahlian_ibu: '', penghasilan_ibu: '', alamat_ibu: '', nomor_wa_ibu: '', medsos_ibu: '',
  status_pernikahan_wali: '', tanggungan_anak_wali: '', nik_wali: '', nama_wali: '', tempat_lahir_wali: '', tgl_lahir_wali: '', telfon_wali: '', hp_wali: '', pendidikan_terakhir_wali: '', pekerjaan_wali: '', instansi_pekerjaan_wali: '', jabatan_pekerjaan_wali: '', alamat_instansi_wali: '', keahlian_wali: '', penghasilan_wali: '', alamat_wali: '', nomor_wa_wali: '', medsos_wali: '',
  unit_id: '', unit_pendidikan: '', nis_pembayaran: '', tahun_ajaran_masuk: '', kelas_id: '', tahun_ajaran_berjalan: '', status_siswa: 'aktif', status_orang_tua: 'Umum', niy_ortu_jika_pegawai: '', wali_kelas: '', niy_wali_kelas: '',
})

const toYesNo = (value) => {
  if (value === true || value === 1 || value === '1' || value === 'true' || value === 'ya') return 'ya'
  return 'tidak'
}

const toBoolean = (value) => toYesNo(value) === 'ya'

const formatRp = (val) => {
  if (val === null || val === undefined || val === '') return ''
  const digits = String(val).replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('id-ID') : ''
}

const cleanRp = (val) => {
  if (val === null || val === undefined || val === '') return ''
  return String(val).replace(/\D/g, '')
}

const Input = ({ label, name, value, onChange, required = false, type = 'text', placeholder = '', isRupiah = false, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative flex items-center">
      {isRupiah && (
        <span className="absolute left-3 text-xs font-extrabold text-slate-500 select-none">Rp</span>
      )}
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        inputMode={isRupiah ? 'numeric' : undefined}
        className={`w-full rounded-xl border border-slate-200 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition ${
          isRupiah ? 'pl-9 pr-3.5' : 'px-3.5'
        }`}
        {...props}
      />
    </div>
  </div>
)

const Select = ({ label, name, value, onChange, required = false, options = [], ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <select
      name={name}
      value={value ?? ''}
      onChange={onChange}
      required={required}
      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
      {...props}
    >
      <option value="">-- Pilih --</option>
      {options.map(opt => typeof opt === 'string'
        ? <option key={opt} value={opt}>{opt}</option>
        : <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
  </div>
)



export default function StudentFormModal({ isOpen, onClose, initialData, onSubmit, classes, units }) {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState(defaultForm())
  const [isUploading, setIsUploading] = useState(false)

  const steps = [
    { number: 1, id: 'pribadi', title: 'Informasi Pribadi', desc: 'Identitas & Alamat Siswa' },
    { number: 2, id: 'pendidikan', title: 'Pendidikan & Bantuan', desc: 'Sekolah Asal & SPP/PIP' },
    { number: 3, id: 'ortu', title: 'Data Orang Tua', desc: 'Identitas Ayah & Ibu Kandung' },
    { number: 4, id: 'wali', title: 'Data Wali Siswa', desc: 'Wali (Opsional)' },
    { number: 5, id: 'akademik', title: 'Akademik & Status', desc: 'Unit, Kelas & Status' },
  ]

  useEffect(() => {
    if (isOpen) {
      setActiveStep(0)
      if (initialData) {
        const meta = initialData.raw?.metadata || {}
        const orangTua = meta.orang_tua || {}
        const parentRel = initialData.raw?.parent || {}

        const resolvedUnitId = String(
          initialData.raw?.unit_id ||
          initialData.raw?.education_unit_id ||
          initialData.raw?.education_unit?.id ||
          initialData.raw?.unit?.id ||
          initialData.unit_id ||
          meta.unit_id ||
          meta.akademik?.unit_id ||
          ''
        )

        const resolvedUnitName =
          initialData.unit ||
          meta.akademik?.unit_pendidikan ||
          meta.unit_pendidikan ||
          initialData.raw?.education_unit?.name ||
          initialData.raw?.education_unit?.code ||
          ''

        const resolvedKelasId = String(
          initialData.raw?.kelas_id ||
          initialData.raw?.class_id ||
          initialData.raw?.kelas?.id ||
          initialData.kelas_id ||
          meta.kelas_id ||
          meta.akademik?.kelas_id ||
          ''
        )

        setFormData({
          ...defaultForm(),
          ...meta,
          id: initialData.id,
          full_name: initialData.nama || initialData.full_name || '',
          gender: initialData.gender === 'Perempuan' ? 'female' : 'male',
          birth_place: initialData.tempatLahir || initialData.birth_place || '',
          birth_date: initialData.tanggalLahir || initialData.birth_date || '',
          foto_url: resolveAvatarUrl(initialData) || resolveAvatarUrl(initialData?.foto) || initialData.foto || meta.foto_url || meta.foto || meta.photo_url || meta.photo || meta.avatar || '',
          nisn: initialData.nisn || meta.nisn || '',
          nis: initialData.nis || '',
          alamat_siswa: initialData.alamat || meta.alamat_siswa || meta.alamat_ortu || '',
          kelas_id: resolvedKelasId,
          unit_id: resolvedUnitId,
          unit_pendidikan: resolvedUnitName,
          status_siswa: (initialData.status || initialData.status_siswa || 'aktif').toLowerCase(),
          nama_ayah: meta.nama_ayah || meta.ayah?.nama || orangTua.nama_ayah || parentRel.full_name || parentRel.name || '',
          nama_ibu: meta.nama_ibu || meta.ibu?.nama || orangTua.nama_ibu || '',
          nama_wali: meta.nama_wali || meta.wali?.nama || orangTua.nama_wali || '',
          hp_ayah: meta.hp_ayah || meta.ayah?.hp || orangTua.no_hp || parentRel.phone || parentRel.no_hp || '',
          hp_ibu: meta.hp_ibu || meta.ibu?.hp || orangTua.no_hp || '',
          hp_wali: meta.hp_wali || meta.wali?.hp || orangTua.no_hp || '',
          penerima_kps_pkh: toYesNo(meta.penerima_kps_pkh),
          apakah_punya_kip: toYesNo(meta.apakah_punya_kip),
          apakah_layak_menerima_pip: toYesNo(meta.apakah_layak_menerima_pip),
          nominal_spp: formatRp(meta.nominal_spp),
          nominal_ortu_asuh: formatRp(meta.nominal_ortu_asuh),
          penghasilan_ayah: formatRp(meta.penghasilan_ayah),
          penghasilan_ibu: formatRp(meta.penghasilan_ibu),
          penghasilan_wali: formatRp(meta.penghasilan_wali),
        })
      } else {
        setFormData(defaultForm())
      }
    }
  }, [isOpen, initialData])


  const handleChange = (e) => {
    const { name, value } = e.target
    let finalValue = value
    if (['nominal_spp', 'nominal_ortu_asuh', 'penghasilan_ayah', 'penghasilan_ibu', 'penghasilan_wali'].includes(name)) {
      const digits = String(value).replace(/\D/g, '')
      finalValue = digits ? Number(digits).toLocaleString('id-ID') : ''
    }

    if (name === 'unit_id') {
      const selectedUnitObj = activeUnits.find(u => {
        const val = typeof u === 'string' ? u : (u.id ?? u.unit_id ?? u.value ?? u.code ?? '')
        return String(val) === String(value)
      })
      const unitLabel = selectedUnitObj
        ? (typeof selectedUnitObj === 'string' ? selectedUnitObj : (selectedUnitObj.name || selectedUnitObj.nama || selectedUnitObj.code || value))
        : ''

      setFormData(prev => ({
        ...prev,
        unit_id: value,
        unit_pendidikan: unitLabel,
        kelas_id: '',
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
      ...(name === 'provinsi' ? { kota_kabupaten: '', kecamatan: '', kelurahan: '' } : {}),
      ...(name === 'kota_kabupaten' ? { kecamatan: '', kelurahan: '' } : {}),
      ...(name === 'kecamatan' ? { kelurahan: '' } : {}),
      ...(name === 'kota_kab_sekolah_asal' ? { kecamatan_sekolah_asal: '' } : {}),
    }))
  }

  const extractArray = (input) => {
    if (Array.isArray(input)) return input
    if (input && Array.isArray(input.data)) return input.data
    if (input && input.data && Array.isArray(input.data.data)) return input.data.data
    return []
  }

  const [internalUnits, setInternalUnits] = useState([])
  const [internalClasses, setInternalClasses] = useState([])

  useEffect(() => {
    let isMounted = true

    const loadMasterUnits = async () => {
      let combined = []

      const propUnits = extractArray(units)
      if (propUnits.length > 0) combined.push(...propUnits)

      // 1. Direct call to educationUnitService (tabel education_units)
      try {
        const res1 = await educationUnitService.getDaftar({ per_page: 200 })
        const list1 = extractArray(res1)
        if (list1.length > 0) combined.push(...list1)
      } catch (e) { /* quiet */ }

      // 2. Direct fallback call to /education-units API
      try {
        const res2 = await api.get('/education-units', { params: { per_page: 200 } })
        const list2 = extractArray(res2.data || res2)
        if (list2.length > 0) combined.push(...list2)
      } catch (e) { /* quiet */ }

      // 3. Fallback /foundation/units API
      try {
        const res3 = await api.get('/foundation/units')
        const list3 = extractArray(res3.data || res3)
        if (list3.length > 0) combined.push(...list3)
      } catch (e) { /* quiet */ }

      // 4. Fallback /master/jenis-unit/dropdown API
      try {
        const res4 = await api.get('/master/jenis-unit/dropdown')
        const list4 = extractArray(res4.data || res4)
        if (list4.length > 0) combined.push(...list4)
      } catch (e) { /* quiet */ }

      // 5. Fallback kelasService options API
      try {
        const optionsRes = await kelasService.getOptions()
        const list5 = extractArray(optionsRes?.units || optionsRes?.unit_pendidikan || optionsRes?.unit)
        if (list5.length > 0) combined.push(...list5)
      } catch (e) { /* quiet */ }

      if (!isMounted) return

      const uniqueUnits = []
      const seenKeys = new Set()
      for (const item of combined) {
        if (!item) continue
        const key = typeof item === 'string'
          ? item
          : String(item.id || item.unit_id || item.code || item.name || item.nama || JSON.stringify(item))
        if (!seenKeys.has(key)) {
          seenKeys.add(key)
          uniqueUnits.push(item)
        }
      }

      setInternalUnits(uniqueUnits)
    }

    const loadMasterClasses = async () => {
      const propClasses = extractArray(classes)
      if (propClasses.length > 0) {
        if (isMounted) setInternalClasses(propClasses)
        return
      }
      try {
        const res = await kelasService.getDaftar({ per_page: 200 })
        const list = extractArray(res)
        if (isMounted && list.length > 0) setInternalClasses(list)
      } catch (e) { /* quiet */ }
    }

    loadMasterUnits()
    loadMasterClasses()

    return () => { isMounted = false }
  }, [isOpen, units, classes])

  const { data: apiProvList = [] } = useProvinsiList()
  const { data: apiKotaList = [] } = useKotaOptions(formData.provinsi)
  const { data: apiKecList = [] } = useKecamatanOptions(formData.kota_kabupaten, formData.provinsi)
  const { data: apiKelList = [] } = useKelurahanOptions(formData.kecamatan, formData.kota_kabupaten, formData.provinsi)

  const { data: apiKotaSekolahList = [] } = useKotaOptions('')
  const { data: apiKecSekolahList = [] } = useKecamatanOptions(formData.kota_kab_sekolah_asal)

  const provList = apiProvList.length > 0 ? apiProvList : getProvinsiList()
  const kotaList = apiKotaList.length > 0 ? apiKotaList : getKotaOptions(formData.provinsi)
  const kecList = apiKecList.length > 0 ? apiKecList : getKecamatanOptions(formData.kota_kabupaten)
  const kelList = apiKelList.length > 0 ? apiKelList : getKelurahanOptions(formData.kecamatan)

  const kotaSekolahList = apiKotaSekolahList.length > 0 ? apiKotaSekolahList : getKotaOptions('')
  const kecSekolahList = apiKecSekolahList.length > 0 ? apiKecSekolahList : getKecamatanOptions(formData.kota_kab_sekolah_asal)

  const activeUnits = React.useMemo(() => {
    const combined = []
    const propUnits = extractArray(units)
    if (propUnits.length > 0) combined.push(...propUnits)
    if (internalUnits.length > 0) combined.push(...internalUnits)

    const uniqueUnits = []
    const seenKeys = new Set()
    for (const item of combined) {
      if (!item) continue
      const key = typeof item === 'string'
        ? item
        : String(item.id || item.unit_id || item.code || item.name || item.nama || JSON.stringify(item))
      if (!seenKeys.has(key)) {
        seenKeys.add(key)
        uniqueUnits.push(item)
      }
    }
    return uniqueUnits
  }, [units, internalUnits])

  useEffect(() => {
    if (!isOpen || activeUnits.length === 0) return

    setFormData(prev => {
      if (prev.unit_id) {
        const directMatch = activeUnits.find(u => {
          const val = typeof u === 'string' ? u : (u.id ?? u.unit_id ?? u.value ?? u.code ?? '')
          return String(val) === String(prev.unit_id)
        })
        if (directMatch) return prev
      }

      const target = String(prev.unit_id || prev.unit_pendidikan || '').trim().toLowerCase()
      if (!target) return prev

      const matchedUnit = activeUnits.find(u => {
        if (typeof u === 'string') return u.toLowerCase() === target
        const uId = String(u.id || u.unit_id || u.value || '').toLowerCase()
        const uCode = String(u.code || u.kode || '').toLowerCase()
        const uName = String(u.name || u.nama || u.nama_unit || u.unit_name || u.nama_pendidikan || '').toLowerCase()
        return (uId && uId === target) || (uCode && uCode === target) || (uName && uName === target)
      })

      if (matchedUnit) {
        const val = typeof matchedUnit === 'string' ? matchedUnit : (matchedUnit.id ?? matchedUnit.unit_id ?? matchedUnit.value ?? matchedUnit.code ?? '')
        const lbl = typeof matchedUnit === 'string' ? matchedUnit : (matchedUnit.name || matchedUnit.nama || matchedUnit.unit_name || matchedUnit.code || val)
        return {
          ...prev,
          unit_id: String(val),
          unit_pendidikan: lbl,
        }
      }

      return prev
    })
  }, [isOpen, activeUnits])

  const parsedClasses = extractArray(classes)
  const activeClasses = parsedClasses.length > 0 ? parsedClasses : internalClasses

  const unitOptions = activeUnits.map(u => {
    if (typeof u === 'string') return { value: u, label: u }
    const val = String(u.id ?? u.unit_id ?? u.value ?? u.code ?? '')
    const nameStr = u.name || u.nama || u.nama_unit || u.unit_name || u.nama_pendidikan || ''
    const codeStr = u.code || u.kode || ''

    let lbl = nameStr
    if (nameStr && codeStr && nameStr !== codeStr) {
      lbl = `${nameStr} (${codeStr})`
    } else if (!lbl) {
      lbl = codeStr || val || 'Unit Pendidikan'
    }

    return { value: val, label: lbl }
  })

  const classOptions = activeClasses
    .filter(k => {
      if (!formData.unit_id) return true
      const kUnitId = k.unit_pendidikan_id || k.unit_id || k.unit?.id
      return String(kUnitId) === String(formData.unit_id)
    })
    .map(k => {
      if (typeof k === 'string') return { value: k, label: k }
      const val = k.id ?? k.kelas_id ?? k.value ?? ''
      const lbl = typeof k.nama_kelas === 'object'
        ? (k.nama_kelas?.name || k.nama_kelas?.nama || '-')
        : (k.nama_kelas || k.name || k.nama || k.nama_lengkap || val || 'Kelas')
      return { value: val, label: lbl }
    })

  const handleMapLocationChange = (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
  }

  const handleMapAddressSelect = (geoData) => {
    setFormData(prev => {
      // 1. Match Provinsi
      let matchedProv = prev.provinsi
      if (geoData.provinsi) {
        const foundProv = provList.find(p => 
          p.toLowerCase().includes(geoData.provinsi.toLowerCase()) || 
          geoData.provinsi.toLowerCase().includes(p.toLowerCase())
        )
        if (foundProv) matchedProv = foundProv
      }

      // 2. Match Kota
      let matchedKota = prev.kota_kabupaten
      const availableKotas = getKotaOptions(matchedProv)
      if (geoData.kota) {
        const cleanGeoKota = geoData.kota.replace(/Kota|Kabupaten|Kab\./gi, '').trim()
        const foundKota = availableKotas.find(k => {
          const cleanK = k.replace(/Kota|Kabupaten|Kab\./gi, '').trim()
          return cleanK.toLowerCase().includes(cleanGeoKota.toLowerCase()) || cleanGeoKota.toLowerCase().includes(cleanK.toLowerCase())
        })
        if (foundKota) matchedKota = foundKota
      }

      // 3. Match Kecamatan (e.g. Nanggalo, Padang Barat, etc.)
      let matchedKec = prev.kecamatan
      const availableKecs = getKecamatanOptions(matchedKota)
      if (geoData.kecamatan) {
        const foundKec = availableKecs.find(kc => 
          kc.toLowerCase().includes(geoData.kecamatan.toLowerCase()) || 
          geoData.kecamatan.toLowerCase().includes(kc.toLowerCase())
        )
        if (foundKec) {
          matchedKec = foundKec
        } else if (geoData.kecamatan) {
          matchedKec = geoData.kecamatan
        }
      }

      // 4. Match Kelurahan
      let matchedKel = prev.kelurahan
      const availableKels = getKelurahanOptions(matchedKec)
      if (geoData.kelurahan) {
        const foundKel = availableKels.find(kl => 
          kl.toLowerCase().includes(geoData.kelurahan.toLowerCase()) || 
          geoData.kelurahan.toLowerCase().includes(kl.toLowerCase())
        )
        if (foundKel) {
          matchedKel = foundKel
        } else if (geoData.kelurahan) {
          matchedKel = geoData.kelurahan
        }
      }

      return {
        ...prev,
        latitude: geoData.lat,
        longitude: geoData.lng,
        alamat_siswa: geoData.road || geoData.displayName || prev.alamat_siswa,
        provinsi: matchedProv,
        kota_kabupaten: matchedKota,
        kecamatan: matchedKec,
        kelurahan: matchedKel,
        kode_pos: geoData.postcode || prev.kode_pos,
      }
    })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, foto_url: reader.result }))
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFoto = () => {
    setFormData(prev => ({ ...prev, foto_url: '' }))
  }

  const handleSave = (e) => {
    if (e) e.preventDefault()

    // Validasi NIK wajib 16 digit angka
    const validateNikField = (val, fieldLabel, stepIndex) => {
      const trimmed = String(val || '').trim()
      if (trimmed && (trimmed.length !== 16 || !/^\d{16}$/.test(trimmed))) {
        Swal.fire({
          title: 'Validasi NIK Gagal',
          html: `<p class="text-sm text-slate-600">Field <b>${fieldLabel}</b> harus terdiri dari <b>16 digit angka</b>.<br/><span class="text-xs text-rose-600 font-semibold mt-1 block">(Jumlah digit saat ini: ${trimmed.length} digit)</span></p>`,
          icon: 'warning',
          confirmButtonColor: '#0E5C44',
          confirmButtonText: 'Perbaiki Data',
        })
        if (stepIndex !== undefined) setActiveStep(stepIndex)
        return false
      }
      return true
    }

    if (!validateNikField(formData.nik, 'NIK Siswa', 0)) return
    if (!validateNikField(formData.nik_ayah, 'NIK Ayah', 2)) return
    if (!validateNikField(formData.nik_ibu, 'NIK Ibu', 2)) return
    if (!validateNikField(formData.nik_wali, 'NIK Wali', 3)) return

    const payload = {
      id: formData.id,
      nis: formData.nis,
      full_name: formData.full_name,
      gender: formData.gender,
      birth_place: formData.birth_place,
      birth_date: formData.birth_date,
      address: formData.alamat_siswa,
      unit_id: formData.unit_id || null,
      kelas_id: formData.kelas_id || null,
      is_active: formData.status_siswa === 'aktif',
      metadata: { ...formData }
    }
    delete payload.metadata.id
    delete payload.metadata.full_name
    delete payload.metadata.gender
    delete payload.metadata.birth_place
    delete payload.metadata.birth_date
    delete payload.metadata.kelas_id
    delete payload.metadata.unit_id
    delete payload.metadata.is_active
    delete payload.metadata.address
    payload.metadata.penerima_kps_pkh = toBoolean(formData.penerima_kps_pkh)
    payload.metadata.apakah_punya_kip = toBoolean(formData.apakah_punya_kip)
    payload.metadata.apakah_layak_menerima_pip = toBoolean(formData.apakah_layak_menerima_pip)
    payload.metadata.nominal_spp = cleanRp(formData.nominal_spp)
    payload.metadata.nominal_ortu_asuh = cleanRp(formData.nominal_ortu_asuh)
    payload.metadata.penghasilan_ayah = cleanRp(formData.penghasilan_ayah)
    payload.metadata.penghasilan_ibu = cleanRp(formData.penghasilan_ibu)
    payload.metadata.penghasilan_wali = cleanRp(formData.penghasilan_wali)
    payload.metadata.foto_url = formData.foto_url || ''
    payload.metadata.nama_ayah = formData.nama_ayah || ''
    payload.metadata.hp_ayah = formData.hp_ayah || ''
    payload.metadata.nama_ibu = formData.nama_ibu || ''
    payload.metadata.hp_ibu = formData.hp_ibu || ''
    payload.metadata.nama_wali = formData.nama_wali || ''
    payload.metadata.hp_wali = formData.hp_wali || ''
    payload.metadata.orang_tua = {
      ...(formData.orang_tua || {}),
      nama_ayah: formData.nama_ayah || '',
      nama_ibu: formData.nama_ibu || '',
      nama_wali: formData.nama_wali || '',
      no_hp: formData.hp_ayah || formData.hp_ibu || formData.hp_wali || '',
    }
    onSubmit(payload)
  }

  const getProps = (name) => ({
    value: formData[name] ?? '',
    onChange: handleChange,
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-4">
      <div className="my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* Modal Header — Clean Top with Title & Close (X) */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              {initialData ? 'Edit Siswa' : 'Tambah Siswa'}
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {initialData ? 'Perbarui informasi siswa melalui tahapan berikut.' : 'Lengkapi informasi siswa melalui tahapan berikut.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Horizontal stepper seperti modal master data */}
        <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
          <div className="grid grid-cols-5">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx
                const isCompleted = activeStep > idx
                return (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className="group relative flex min-w-0 items-center gap-2 pr-2 text-left"
                  >
                    {idx < steps.length - 1 && (
                      <span className={`absolute left-8 right-0 top-4 h-px ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    )}
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-800 text-white ring-4 ring-emerald-50'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      }`}
                    >
                      {isCompleted ? <FaCheckCircle className="text-sm" /> : step.number}
                    </div>
                    <span className={`relative z-10 hidden truncate bg-white pr-1 text-[10px] font-bold leading-tight lg:block ${isActive ? 'text-emerald-800' : 'text-slate-500'}`}>
                      {step.title}
                    </span>
                  </button>
                )
              })}
          </div>
        </div>

        {/* Form Content Area */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5 sm:p-6">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-slate-900">{steps[activeStep].title}</h3>
              <p className="mt-1 text-[11px] text-slate-500">{steps[activeStep].desc}. Pastikan data yang dimasukkan sudah benar.</p>
            </div>
            <form id="student-main-form" onSubmit={handleSave} className="space-y-6">

              {/* STEP 1: INFORMASI PRIBADI */}
              {activeStep === 0 && (
                <div className="space-y-6">
                  {/* Upload Foto Box - Sesuai UI Gambar */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Unggah Foto Siswa</label>
                    {formData.foto_url ? (
                      <div className="relative flex items-center gap-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40">
                        <PersonAvatar
                          src={formData.foto_url}
                          name={formData.full_name}
                          size="detail"
                          className="h-20 w-20 rounded-xl border-2 border-emerald-600 shadow shrink-0"
                        />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800">Foto Siswa Berhasil Diunggah</p>
                          <p className="text-[11px] text-slate-500">Guna untuk data Kartu Siswa & Administrasi</p>
                          <button
                            type="button"
                            onClick={handleRemoveFoto}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline pt-1"
                          >
                            <FaTrashAlt /> Hapus & Unggah Ulang
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:bg-emerald-50/30 hover:border-emerald-400 cursor-pointer transition">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#064e3b] mb-2 shadow-xs">
                          <FaCloudUploadAlt className="text-2xl" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {isUploading ? 'Mengunggah...' : 'Upload Foto Siswa'}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">PNG, JPG atau WEBP (maksimal 2MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Nama Lengkap Siswa" name="full_name" required placeholder="Contoh: Fathir Ahmad" {...getProps('full_name')} />
                    <Select label="Unit Pendidikan" name="unit_id" required options={unitOptions} {...getProps('unit_id')} />
                    <Input label="NIS" name="nis" required placeholder="Nomor Induk Siswa" {...getProps('nis')} />
                    <Input label="NISN" name="nisn" required placeholder="10 Digit NISN" {...getProps('nisn')} />
                    <Input label="NIK Siswa" name="nik" placeholder="16 Digit NIK" maxLength={16} {...getProps('nik')} />
                    <Input label="No Pendaftaran" name="no_pendaftaran" placeholder="PDK-2024-001" {...getProps('no_pendaftaran')} />
                    <Input label="No Kartu Keluarga (KK)" name="no_kk" placeholder="16 Digit No KK" maxLength={16} {...getProps('no_kk')} />
                    <Input label="No Registrasi Akta Lahir" name="no_registrasi_akta_lahir" placeholder="No Akta Lahir" {...getProps('no_registrasi_akta_lahir')} />
                    <Select label="Tempat Lahir" name="birth_place" options={getBirthPlaceOptions(formData.birth_place)} {...getProps('birth_place')} />
                    <Input label="Tanggal Lahir" name="birth_date" type="date" {...getProps('birth_date')} />
                    <Select label="Jenis Kelamin" name="gender" required options={[{label:'Laki-laki', value:'male'}, {label:'Perempuan', value:'female'}]} {...getProps('gender')} />
                    <Select label="Agama" name="agama" options={['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu']} {...getProps('agama')} />
                    <Input label="Email Siswa (Opsional)" name="email" type="email" placeholder="siswa@sekolah.sch.id" {...getProps('email')} />
                    <Select label="Kewarganegaraan" name="kewarganegaraan" options={['WNI','WNA']} {...getProps('kewarganegaraan')} />
                  </div>

                  <hr className="border-slate-100 my-4" />

                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Alamat & Tempat Tinggal</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Input label="Alamat Lengkap" name="alamat_siswa" placeholder="Jl. Khatib Sulaiman No. 10..." {...getProps('alamat_siswa')} />
                    </div>
                    <Select label="Provinsi" name="provinsi" options={provList} {...getProps('provinsi')} />
                    <Select label="Kota / Kabupaten" name="kota_kabupaten" options={kotaList.length > 0 ? kotaList : [formData.kota_kabupaten].filter(Boolean)} {...getProps('kota_kabupaten')} />
                    {kecList.length > 0 ? (
                      <Select label="Kecamatan" name="kecamatan" options={kecList} {...getProps('kecamatan')} />
                    ) : (
                      <Input label="Kecamatan" name="kecamatan" placeholder={formData.kota_kabupaten ? "Ketik kecamatan..." : "Pilih Kota/Kabupaten dulu"} {...getProps('kecamatan')} />
                    )}
                    {kelList.length > 0 ? (
                      <Select label="Kelurahan / Desa" name="kelurahan" options={kelList} {...getProps('kelurahan')} />
                    ) : (
                      <Input label="Kelurahan / Desa" name="kelurahan" placeholder={formData.kecamatan ? "Ketik kelurahan..." : "Pilih Kecamatan dulu"} {...getProps('kelurahan')} />
                    )}
                    <Input label="RT" name="rt" placeholder="001" {...getProps('rt')} />
                    <Input label="RW" name="rw" placeholder="002" {...getProps('rw')} />
                    <Input label="Kode Pos" name="kode_pos" placeholder="25114" {...getProps('kode_pos')} />
                    <Input label="Moda Transportasi" name="moda_transportasi" placeholder="Jalan Kaki / Sepeda / Bus" {...getProps('moda_transportasi')} />
                  </div>

                  <hr className="border-slate-100 my-4" />

                  {/* Peta Alamat Interaktif */}
                  <AddressMap
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationChange={handleMapLocationChange}
                    onAddressSelect={handleMapAddressSelect}
                  />
                </div>
              )}

              {/* STEP 2: PENDIDIKAN & BANTUAN */}
              {activeStep === 1 && (
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Riwayat Sekolah Asal</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Nama Sekolah Asal" name="sekolah_asal" placeholder="SD Negeri 01 Padang" {...getProps('sekolah_asal')} />
                    <Select label="Status Sekolah Asal" name="status_sekolah_asal" options={['Negeri', 'Swasta']} {...getProps('status_sekolah_asal')} />
                    <Select label="Kota / Kab Sekolah Asal" name="kota_kab_sekolah_asal" options={kotaSekolahList} {...getProps('kota_kab_sekolah_asal')} />
                    {kecSekolahList.length > 0 ? (
                      <Select label="Kecamatan Sekolah Asal" name="kecamatan_sekolah_asal" options={kecSekolahList} {...getProps('kecamatan_sekolah_asal')} />
                    ) : (
                      <Input label="Kecamatan Sekolah Asal" name="kecamatan_sekolah_asal" placeholder="Kecamatan" {...getProps('kecamatan_sekolah_asal')} />
                    )}
                    <Input label="No HP / WA Sekolah Asal" name="nomor_hp_wa_sekolah_asal" placeholder="08xx-xxxx-xxxx" {...getProps('nomor_hp_wa_sekolah_asal')} />
                  </div>

                  <hr className="border-slate-100 my-4" />

                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Administrasi Bantuan</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Nominal SPP" name="nominal_spp" isRupiah placeholder="500.000" {...getProps('nominal_spp')} />
                    <Input label="Nominal Bantuan Ortu Asuh" name="nominal_ortu_asuh" isRupiah placeholder="0" {...getProps('nominal_ortu_asuh')} />
                    <Select label="Penerima KPS / PKH" name="penerima_kps_pkh" options={['ya', 'tidak']} {...getProps('penerima_kps_pkh')} />
                    <Select label="Apakah Punya KIP?" name="apakah_punya_kip" options={['ya', 'tidak']} {...getProps('apakah_punya_kip')} />
                    <Select label="Apakah Layak Menerima PIP?" name="apakah_layak_menerima_pip" options={['ya', 'tidak']} {...getProps('apakah_layak_menerima_pip')} />
                    <div className="sm:col-span-2">
                      <Input label="Alasan Menolak PIP (Jika ada)" name="alasan_menolak_pip" placeholder="Ditolak / Sudah Mampu" {...getProps('alasan_menolak_pip')} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: DATA ORANG TUA */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-emerald-900 border-b border-emerald-100 pb-2">Ayah Kandung</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="NIK Ayah" name="nik_ayah" placeholder="16 Digit NIK Ayah" maxLength={16} {...getProps('nik_ayah')} />
                    <Input label="Nama Ayah Kandung" name="nama_ayah" placeholder="Nama Ayah" {...getProps('nama_ayah')} />
                    <Select label="Tempat Lahir Ayah" name="tempat_lahir_ayah" options={getBirthPlaceOptions(formData.tempat_lahir_ayah)} {...getProps('tempat_lahir_ayah')} />
                    <Input label="Tanggal Lahir Ayah" name="tgl_lahir_ayah" type="date" {...getProps('tgl_lahir_ayah')} />
                    <Input label="No HP / WA Ayah" name="hp_ayah" placeholder="08xx-xxxx-xxxx" {...getProps('hp_ayah')} />
                    <Select label="Pendidikan Terakhir Ayah" name="pendidikan_terakhir_ayah" options={['SD/MI','SMP/MTs','SMA/SMK/MA','D1/D2/D3','S1/D4','S2','S3','Tidak Sekolah']} {...getProps('pendidikan_terakhir_ayah')} />
                    <Input label="Pekerjaan Ayah" name="pekerjaan_ayah" placeholder="Wiraswasta / PNS / Guru" {...getProps('pekerjaan_ayah')} />
                    <Input label="Penghasilan Ayah" name="penghasilan_ayah" isRupiah placeholder="5.000.000" {...getProps('penghasilan_ayah')} />
                  </div>

                  <h4 className="text-xs font-bold text-emerald-900 border-b border-emerald-100 pb-2 pt-2">Ibu Kandung</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="NIK Ibu" name="nik_ibu" placeholder="16 Digit NIK Ibu" maxLength={16} {...getProps('nik_ibu')} />
                    <Input label="Nama Ibu Kandung" name="nama_ibu" placeholder="Nama Ibu" {...getProps('nama_ibu')} />
                    <Select label="Tempat Lahir Ibu" name="tempat_lahir_ibu" options={getBirthPlaceOptions(formData.tempat_lahir_ibu)} {...getProps('tempat_lahir_ibu')} />
                    <Input label="Tanggal Lahir Ibu" name="tgl_lahir_ibu" type="date" {...getProps('tgl_lahir_ibu')} />
                    <Input label="No HP / WA Ibu" name="hp_ibu" placeholder="08xx-xxxx-xxxx" {...getProps('hp_ibu')} />
                    <Select label="Pendidikan Terakhir Ibu" name="pendidikan_terakhir_ibu" options={['SD/MI','SMP/MTs','SMA/SMK/MA','D1/D2/D3','S1/D4','S2','S3','Tidak Sekolah']} {...getProps('pendidikan_terakhir_ibu')} />
                    <Input label="Pekerjaan Ibu" name="pekerjaan_ibu" placeholder="Ibu Rumah Tangga / PNS" {...getProps('pekerjaan_ibu')} />
                    <Input label="Penghasilan Ibu" name="penghasilan_ibu" isRupiah placeholder="0" {...getProps('penghasilan_ibu')} />
                  </div>
                </div>
              )}

              {/* STEP 4: DATA WALI */}
              {activeStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600">
                    Isi data di bawah ini hanya jika siswa tinggal bersama wali (selain ayah/ibu kandung).
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="NIK Wali" name="nik_wali" placeholder="16 Digit NIK Wali" maxLength={16} {...getProps('nik_wali')} />
                    <Input label="Nama Wali Siswa" name="nama_wali" placeholder="Nama Wali" {...getProps('nama_wali')} />
                    <Select label="Tempat Lahir Wali" name="tempat_lahir_wali" options={getBirthPlaceOptions(formData.tempat_lahir_wali)} {...getProps('tempat_lahir_wali')} />
                    <Input label="No HP / WA Wali" name="hp_wali" placeholder="08xx-xxxx-xxxx" {...getProps('hp_wali')} />
                    <Select label="Pendidikan Terakhir Wali" name="pendidikan_terakhir_wali" options={['SD/MI','SMP/MTs','SMA/SMK/MA','D1/D2/D3','S1/D4','S2','S3','Tidak Sekolah']} {...getProps('pendidikan_terakhir_wali')} />
                    <Input label="Pekerjaan Wali" name="pekerjaan_wali" placeholder="Pekerjaan Wali" {...getProps('pekerjaan_wali')} />
                    <Input label="Penghasilan Wali" name="penghasilan_wali" isRupiah placeholder="0" {...getProps('penghasilan_wali')} />
                    <div className="sm:col-span-2">
                      <Input label="Alamat Wali" name="alamat_wali" placeholder="Alamat lengkap wali..." {...getProps('alamat_wali')} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: AKADEMIK & STATUS */}
              {activeStep === 4 && (
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Penempatan Unit & Kelas</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select label="Unit Pendidikan" name="unit_id" required options={unitOptions} {...getProps('unit_id')} />
                    <Select label="Pilih Kelas" name="kelas_id" options={classOptions} {...getProps('kelas_id')} />
                    <Input label="NIS Pembayaran" name="nis_pembayaran" placeholder="NIS Pembayaran" {...getProps('nis_pembayaran')} />
                    <Input label="Tahun Ajaran Masuk" name="tahun_ajaran_masuk" placeholder="2024/2025" {...getProps('tahun_ajaran_masuk')} />
                    <Input label="Tahun Ajaran Berjalan" name="tahun_ajaran_berjalan" placeholder="2024/2025" {...getProps('tahun_ajaran_berjalan')} />
                    <Select label="Status Siswa" name="status_siswa" options={['aktif', 'lulus', 'mutasi', 'berhenti']} {...getProps('status_siswa')} />
                    <Select label="Status Orang Tua" name="status_orang_tua" options={['Umum', 'Pegawai']} {...getProps('status_orang_tua')} />
                    <Input label="NIY Ortu (Jika Pegawai)" name="niy_ortu_jika_pegawai" placeholder="NIY Pegawai" {...getProps('niy_ortu_jika_pegawai')} />
                  </div>
                </div>
              )}

            </form>
          </div>

        {/* Modal Footer — Standard Actions Matching UI Image */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </button>

          <div className="ml-auto flex items-center gap-2">
            {activeStep > 0 && (
              <button
                type="button"
                onClick={() => setActiveStep(prev => prev - 1)}
                className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FaArrowLeft className="text-xs" /> Kembali
              </button>
            )}

            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(prev => prev + 1)}
                className="flex h-10 items-center gap-2 rounded-lg bg-emerald-800 px-5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-900"
              >
                Selanjutnya <FaArrowRight className="text-xs" />
              </button>
            ) : (
              <button
                type="submit"
                form="student-main-form"
                className="flex h-10 items-center gap-2 rounded-lg bg-emerald-800 px-5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-900"
              >
                <FaSave /> Simpan Data
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
