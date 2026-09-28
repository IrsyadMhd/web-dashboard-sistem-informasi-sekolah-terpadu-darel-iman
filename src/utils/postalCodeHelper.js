/**
 * Indonesian Postal Code Helper & Database
 * Provides automatic postal code lookup by Kelurahan, Kecamatan, Kota/Kabupaten, & Provinsi.
 */

// ── 1. Comprehensive Regional Postal Codes ──────────────────────────
// Format: Key can be 'KOTA|KECAMATAN|KELURAHAN', 'KOTA|KECAMATAN', or base 'KOTA'
const KELURAHAN_POSTAL_MAP = {
  // ── PADANG ──
  // Padang Utara
  'padang|padang utara|air tawar barat': '25131',
  'padang|padang utara|air tawar timur': '25132',
  'padang|padang utara|ulak karang utara': '25133',
  'padang|padang utara|ulak karang selatan': '25134',
  'padang|padang utara|lolong belanti': '25136',
  'padang|padang utara|gunung pangilun': '25137',
  'padang|padang utara|alai parak kopi': '25139',
  'padang|padang utara': '25136',

  // Padang Barat
  'padang|padang barat|belakang tangsi': '25111',
  'padang|padang barat|kampung jao': '25112',
  'padang|padang barat|padang pasir': '25112',
  'padang|padang barat|flamboyan baru': '25114',
  'padang|padang barat|rimbo kaluang': '25114',
  'padang|padang barat|ujung gurun': '25114',
  'padang|padang barat|purus': '25115',
  'padang|padang barat|kampung pondok': '25117',
  'padang|padang barat|olo': '25117',
  'padang|padang barat|berok nipah': '25118',
  'padang|padang barat': '25114',

  // Padang Timur
  'padang|padang timur|sawahan': '25121',
  'padang|padang timur|sawahan timur': '25121',
  'padang|padang timur|simpang haru': '25123',
  'padang|padang timur|kubu parak karambie': '25123',
  'padang|padang timur|ganting parak gadang': '25124',
  'padang|padang timur|parak gadang timur': '25124',
  'padang|padang timur|kubu marapalam': '25125',
  'padang|padang timur|andalas': '25126',
  'padang|padang timur|jati': '25129',
  'padang|padang timur|jati baru': '25129',
  'padang|padang timur': '25129',

  // Padang Selatan
  'padang|padang selatan|alang laweh': '25211',
  'padang|padang selatan|pasa gadang': '25212',
  'padang|padang selatan|ranah parak rumbio': '25213',
  'padang|padang selatan|rawang': '25214',
  'padang|padang selatan|seberang padang': '25214',
  'padang|padang selatan|batang arau': '25215',
  'padang|padang selatan|seberang palinggam': '25215',
  'padang|padang selatan|bukit gado-gado': '25216',
  'padang|padang selatan|mata air': '25216',
  'padang|padang selatan|air manis': '25217',
  'padang|padang selatan|teluk bayur': '25217',
  'padang|padang selatan': '25214',

  // Koto Tangah
  'padang|koto tangah|lubuk buaya': '25171',
  'padang|koto tangah|batang kabung ganting': '25171',
  'padang|koto tangah|parupuk tabing': '25171',
  'padang|koto tangah|pasie nan tigo': '25172',
  'padang|koto tangah|koto pulai': '25172',
  'padang|koto tangah|koto panjang ikur koto': '25172',
  'padang|koto tangah|bungo pasang': '25173',
  'padang|koto tangah|dadok tunggul hitam': '25173',
  'padang|koto tangah|padang sarai': '25174',
  'padang|koto tangah|air pacah': '25175',
  'padang|koto tangah|balai gadang': '25175',
  'padang|koto tangah|lubuk minturun': '25175',
  'padang|koto tangah': '25171',

  // Kuranji
  'padang|kuranji|pasar ambacang': '25151',
  'padang|kuranji|anduring': '25152',
  'padang|kuranji|lubuk lintah': '25152',
  'padang|kuranji|ampang': '25153',
  'padang|kuranji|kalumbuk': '25154',
  'padang|kuranji|korong gadang': '25156',
  'padang|kuranji|kuranji': '25157',
  'padang|kuranji|gunung sarik': '25157',
  'padang|kuranji|sungai sapih': '25159',
  'padang|kuranji': '25157',

  // Pauh
  'padang|pauh|pisang': '25161',
  'padang|pauh|cupak tangah': '25162',
  'padang|pauh|kapalo koto': '25163',
  'padang|pauh|koto luar': '25164',
  'padang|pauh|binuang kampung dalam': '25164',
  'padang|pauh|lambung bukit': '25165',
  'padang|pauh|limau manis': '25166',
  'padang|pauh|limau manis selatan': '25166',
  'padang|pauh': '25162',

  // Lubuk Begalung
  'padang|lubuk begalung|gurun laweh nan xx': '25221',
  'padang|lubuk begalung|kampung baru nan xx': '25221',
  'padang|lubuk begalung|lubuk begalung nan xx': '25221',
  'padang|lubuk begalung|banuaran nan xx': '25222',
  'padang|lubuk begalung|koto baru nan xx': '25222',
  'padang|lubuk begalung|batung taba nan xx': '25223',
  'padang|lubuk begalung|parak laweh pulau air nan xx': '25223',
  'padang|lubuk begalung|kampung jua nan xx': '25224',
  'padang|lubuk begalung|tanah sirah piai nan xx': '25224',
  'padang|lubuk begalung|pampangan nan xx': '25225',
  'padang|lubuk begalung|pitameh tanjung saba nan xx': '25225',
  'padang|lubuk begalung|gates nan xx': '25226',
  'padang|lubuk begalung|pagambiran ampalu nan xx': '25226',
  'padang|lubuk begalung|cengkeh nan xx': '25227',
  'padang|lubuk begalung|tanjung aur nan xx': '25227',
  'padang|lubuk begalung': '25221',

  // Lubuk Kilangan
  'padang|lubuk kilangan|bandar buat': '25231',
  'padang|lubuk kilangan|tarantang': '25233',
  'padang|lubuk kilangan|padang besi': '25234',
  'padang|lubuk kilangan|batu gadang': '25235',
  'padang|lubuk kilangan|koto lalang': '25236',
  'padang|lubuk kilangan|indarung': '25237',
  'padang|lubuk kilangan': '25231',

  // Nanggalo
  'padang|nanggalo|surau gadang': '25146',
  'padang|nanggalo|kurao pagang': '25146',
  'padang|nanggalo|tabing banda gadang': '25144',
  'padang|nanggalo|kampung olo': '25143',
  'padang|nanggalo|kampung lapai': '25142',
  'padang|nanggalo': '25146',

  // Bungus Teluk Kabung
  'padang|bungus teluk kabung|bungus barat': '25241',
  'padang|bungus teluk kabung|bungus selatan': '25242',
  'padang|bungus teluk kabung|bungus timur': '25243',
  'padang|bungus teluk kabung|teluk kabung tengah': '25244',
  'padang|bungus teluk kabung|teluk kabung utara': '25244',
  'padang|bungus teluk kabung|teluk kabung selatan': '25245',
  'padang|bungus teluk kabung': '25241',

  // ── BUKITTINGGI ──
  'bukittinggi|guguk panjang|bukit cangang kayu ramang': '26115',
  'bukittinggi|guguk panjang|pakan kurai': '26116',
  'bukittinggi|guguk panjang|tarok dipo': '26117',
  'bukittinggi|guguk panjang|aur tajungkang tengah sawah': '26111',
  'bukittinggi|guguk panjang|benteng pasar atas': '26113',
  'bukittinggi|guguk panjang': '26116',

  'bukittinggi|mandiangin koto selayan|campago guguak bulek': '26121',
  'bukittinggi|mandiangin koto selayan|campago ipuh': '26122',
  'bukittinggi|mandiangin koto selayan|garegeh': '26123',
  'bukittinggi|mandiangin koto selayan|koto selayan': '26124',
  'bukittinggi|mandiangin koto selayan|kubu gulai bancah': '26125',
  'bukittinggi|mandiangin koto selayan|pulai anak air': '26127',
  'bukittinggi|mandiangin koto selayan|puhun pintu kabun': '26128',
  'bukittinggi|mandiangin koto selayan|puhun tembok': '26129',
  'bukittinggi|mandiangin koto selayan': '26125',

  'bukittinggi|aur birugo tigo baleh|aur kuning': '26131',
  'bukittinggi|aur birugo tigo baleh|belakang balok': '26136',
  'bukittinggi|aur birugo tigo baleh|birugo': '26133',
  'bukittinggi|aur birugo tigo baleh|kubu tanjung': '26134',
  'bukittinggi|aur birugo tigo baleh|ladang cakiah': '26138',
  'bukittinggi|aur birugo tigo baleh|sapiran': '26132',
  'bukittinggi|aur birugo tigo baleh|pariangan': '26137',
  'bukittinggi|aur birugo tigo baleh': '26131',

  // ── PAYAKUMBUH ──
  'payakumbuh|payakumbuh barat': '26225',
  'payakumbuh|payakumbuh timur': '26212',
  'payakumbuh|payakumbuh utara': '26218',
  'payakumbuh|payakumbuh selatan': '26231',
  'payakumbuh|lamposi tigo nagori': '26219',

  // ── PARIAMAN ──
  'pariaman|pariaman tengah': '25514',
  'pariaman|pariaman utara': '25511',
  'pariaman|pariaman selatan': '25512',
  'pariaman|pariaman timur': '25513',
  'pariaman|pariaman barat': '25514',

  // ── PADANG PANJANG ──
  'padang panjang|padang panjang barat': '27116',
  'padang panjang|padang panjang timur': '27126',

  // ── SOLOK ──
  'solok|lubuk sikarah': '27311',
  'solok|tanjung harapan': '27316',

  // ── SAWAHLUNTO ──
  'sawahlunto|lembah segar': '27411',
  'sawahlunto|barangin': '27422',
  'sawahlunto|silungkang': '27431',
  'sawahlunto|talawi': '27441',

  // ── AGAM ──
  'agam|lubuk basung': '26415',
  'agam|banuhampu': '26181',
  'agam|ampek angkek': '26191',
  'agam|canduang': '26192',
  'agam|baso': '26192',
  'agam|tilatang kamang': '26152',
  'agam|kamang magek': '26152',
  'agam|sungai pua': '26181',
  'agam|matur': '26471',
  'agam|tanjung raya': '26471',

  // ── TANAH DATAR ──
  'tanah datar|limo kaum': '27211',
  'tanah datar|tanjung emas': '27281',
  'tanah datar|sungai tarab': '27261',
  'tanah datar|batipuh': '27265',
  'tanah datar|pariangan': '27264',
  'tanah datar|rambatan': '27271',

  // ── PADANG PARIAMAN ──
  'padang pariaman|lubuk alung': '25584',
  'padang pariaman|batang anai': '25586',
  'padang pariaman|enam lingkung': '25585',
  'padang pariaman|2x11 enam lingkung': '25585',
  'padang pariaman|nan sabaris': '25571',
  'padang pariaman|sungai limau': '25561',
}

// ── 2. Kota / Kabupaten Base Postal Codes (All Major Cities in Indonesia) ──
const KOTA_BASE_POSTAL_MAP = {
  // Sumatera Barat
  'padang': '25136',
  'bukittinggi': '26116',
  'payakumbuh': '26225',
  'pariaman': '25514',
  'padang panjang': '27116',
  'solok': '27311',
  'sawahlunto': '27411',
  'agam': '26415',
  'tanah datar': '27211',
  'padang pariaman': '25584',
  'pesisir selatan': '25611',
  'pasaman': '26311',
  'pasaman barat': '26566',
  'lima puluh kota': '26271',
  'sijunjung': '27511',
  'dharmasraya': '27612',
  'solok selatan': '27776',
  'kepulauan mentawai': '25392',

  // DKI Jakarta
  'jakarta pusat': '10110',
  'jakarta utara': '14110',
  'jakarta barat': '11220',
  'jakarta selatan': '12110',
  'jakarta timur': '13310',
  'kepulauan seribu': '14510',

  // Jawa Barat
  'bandung': '40111',
  'bekasi': '17111',
  'bogor': '16111',
  'depok': '16411',
  'cimahi': '40511',
  'cirebon': '45111',
  'sukabumi': '43111',
  'tasikmalaya': '46111',
  'banjar': '46311',

  // Banten
  'tangerang': '15111',
  'tangerang selatan': '15411',
  'serang': '42111',
  'cilegon': '42411',

  // Jawa Tengah & DIY
  'semarang': '50111',
  'surakarta': '57111',
  'solo': '57111',
  'magelang': '56111',
  'salatiga': '50711',
  'pekalongan': '51111',
  'tegal': '52111',
  'yogyakarta': '55111',
  'sleman': '55281',
  'bantul': '55711',

  // Jawa Timur
  'surabaya': '60111',
  'malang': '65111',
  'kediri': '64111',
  'blitar': '66111',
  'madiun': '63111',
  'probolinggo': '67211',
  'pasuruan': '67111',
  'batu': '65311',
  'sidoarjo': '61211',

  // Sumatera Utara, Riau, dll
  'medan': '20111',
  'pekanbaru': '28111',
  'dumai': '28811',
  'batam': '29411',
  'tanjung pinang': '29111',
  'palembang': '30111',
  'bandar lampung': '35111',
  'jambi': '36111',
  'bengkulu': '38111',
  'banda aceh': '23111',

  // Kalimantan, Bali, Sulawesi, dsb
  'denpasar': '80111',
  'pontianak': '78111',
  'banjarmasin': '70111',
  'samarinda': '75111',
  'balikpapan': '76111',
  'makassar': '90111',
  'manado': '95111',
  'mataram': '83111',
  'kupang': '85111',
  'jayapura': '99111',
  'ambon': '97111',
}

/**
 * Normalizes region name string (lowercased, trimmed, strips common prefixes)
 */
function cleanRegion(name) {
  return (name || '')
    .toLowerCase()
    .replace(/^(kota|kab\.|kabupaten|kec\.|kecamatan|kel\.|kelurahan|desa)\s+/i, '')
    .trim()
}

/**
 * Resolves a 5-digit postal code for a given region hierarchy.
 * @param {string} kelurahan
 * @param {string} kecamatan
 * @param {string} kota
 * @param {string} provinsi
 * @returns {string|null} 5-digit postal code or null if unresolved
 */
export function getPostalCode(kelurahan, kecamatan, kota, provinsi) {
  const cKel = cleanRegion(kelurahan)
  const cKec = cleanRegion(kecamatan)
  const cKota = cleanRegion(kota)

  // 1. Try full match: kota|kecamatan|kelurahan
  if (cKota && cKec && cKel) {
    const key1 = `${cKota}|${cKec}|${cKel}`
    if (KELURAHAN_POSTAL_MAP[key1]) return KELURAHAN_POSTAL_MAP[key1]
  }

  // 2. Try partial match: kota|kelurahan
  if (cKota && cKel) {
    for (const [k, v] of Object.entries(KELURAHAN_POSTAL_MAP)) {
      if (k.startsWith(`${cKota}|`) && k.endsWith(`|${cKel}`)) {
        return v
      }
    }
  }

  // 3. Try match: kota|kecamatan
  if (cKota && cKec) {
    const key3 = `${cKota}|${cKec}`
    if (KELURAHAN_POSTAL_MAP[key3]) return KELURAHAN_POSTAL_MAP[key3]
  }

  // 4. Try any kelurahan match across map
  if (cKel) {
    for (const [k, v] of Object.entries(KELURAHAN_POSTAL_MAP)) {
      if (k.endsWith(`|${cKel}`)) {
        return v
      }
    }
  }

  // 5. Try any kecamatan match across map
  if (cKec) {
    for (const [k, v] of Object.entries(KELURAHAN_POSTAL_MAP)) {
      if (k.endsWith(`|${cKec}`) || k === cKec) {
        return v
      }
    }
  }

  // 6. Fallback to Kota Base Postal Code
  if (cKota && KOTA_BASE_POSTAL_MAP[cKota]) {
    return KOTA_BASE_POSTAL_MAP[cKota]
  }

  // 7. Check partial kota matches in KOTA_BASE_POSTAL_MAP
  if (cKota) {
    for (const [k, v] of Object.entries(KOTA_BASE_POSTAL_MAP)) {
      if (cKota.includes(k) || k.includes(cKota)) {
        return v
      }
    }
  }

  return null
}

/**
 * Transforms a list of kelurahan names into option objects with label, value, and postalCode.
 * @param {Array<string|object>} rawKelList
 * @param {string} kecamatan
 * @param {string} kota
 * @param {string} provinsi
 * @returns {Array<{label: string, value: string, postalCode: string}>}
 */
export function enrichKelurahanWithPostal(rawKelList = [], kecamatan, kota, provinsi) {
  if (!Array.isArray(rawKelList)) return []
  return rawKelList.map((item) => {
    const name = typeof item === 'object' && item !== null ? item.nama || item.name || item.value : String(item)
    const postal = getPostalCode(name, kecamatan, kota, provinsi) || ''
    return {
      label: postal ? `${name} (${postal})` : name,
      value: name,
      postalCode: postal,
    }
  })
}
