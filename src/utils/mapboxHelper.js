import { usePengaturanStore } from '../stores/pengaturanStore'
import { siteSettingService } from '../services/siteSettingService'

let cachedTokenPromise = null

/**
 * Mengambil token Mapbox secara dinamis dari database (via siteSettingService / usePengaturanStore).
 * Tidak di-hardcode dan tidak menggunakan file .env.
 */
export async function getMapboxToken() {
  // 1. Coba baca dari store state yang sudah tersimpan
  const storeToken = usePengaturanStore.getState().pengaturan?.mapbox_token
  if (storeToken && typeof storeToken === 'string' && storeToken.trim()) {
    return storeToken.trim()
  }

  // 2. Jika belum tersedia di store, fetch dari API /site-settings sekali
  if (!cachedTokenPromise) {
    cachedTokenPromise = siteSettingService
      .get()
      .then((res) => {
        const token = res?.mapbox_token || ''
        if (token) {
          usePengaturanStore.getState().previewPengaturan({ mapbox_token: token })
        }
        return token
      })
      .catch((err) => {
        console.warn('[MapboxHelper] Gagal mengambil token Mapbox dari database:', err)
        return ''
      })
      .finally(() => {
        cachedTokenPromise = null
      })
  }

  return cachedTokenPromise
}

/**
 * Generate Tile URL untuk Mapbox (dengan fallback ke OSM)
 */
export function getMapTileConfig(mapboxToken, style = 'streets-v12') {
  if (mapboxToken && mapboxToken.trim()) {
    return {
      url: `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/{z}/{x}/{y}?access_token=${mapboxToken.trim()}`,
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
      tileSize: 512,
      zoomOffset: -1,
    }
  }

  // Fallback ke OpenStreetMap publik
  return {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    tileSize: 256,
    zoomOffset: 0,
  }
}

/**
 * Forward Geocoding: Mencari koordinat berdasarkan query alamat.
 * Menggunakan Mapbox Geocoding v5 jika token tersedia, fallback ke Nominatim OSM.
 */
export async function searchAddressGeocoding(query, mapboxToken) {
  if (!query || !query.trim()) return null

  // 1. Prioritas: Mapbox Geocoding API
  if (mapboxToken && mapboxToken.trim()) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query.trim()
      )}.json?access_token=${mapboxToken.trim()}&country=id&types=address,poi,neighborhood,locality,district,place&language=id&limit=1`

      const res = await fetch(url)
      const data = await res.json()

      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const feat = data.features[0]
        const [lon, lat] = feat.center || []

        let road = ''
        let kelurahan = ''
        let kecamatan = ''
        let kota = ''
        let provinsi = ''
        let postcode = ''

        if (feat.place_type?.includes('address')) {
          road = feat.text || ''
          if (feat.address) road += ` No. ${feat.address}`
        }

        if (Array.isArray(feat.context)) {
          for (const ctx of feat.context) {
            const id = ctx.id || ''
            if (id.startsWith('postcode')) postcode = ctx.text || ''
            else if (id.startsWith('locality') || id.startsWith('neighborhood')) kelurahan = ctx.text || ''
            else if (id.startsWith('district')) kecamatan = ctx.text || ''
            else if (id.startsWith('place')) kota = ctx.text || ''
            else if (id.startsWith('region')) provinsi = ctx.text || ''
          }
        }

        return {
          lat: Number(lat),
          lng: Number(lon),
          displayName: feat.place_name || '',
          road: road || feat.text || '',
          province: provinsi,
          city: kota,
          district: kecamatan,
          subdistrict: kelurahan,
          postalCode: postcode,
          summary: feat.place_name || '',
          source: 'mapbox',
        }
      }
    } catch (err) {
      console.warn('[MapboxHelper] Search error, mencoba fallback OSM:', err)
    }
  }

  // 2. Fallback: OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&limit=1&countrycodes=id&addressdetails=1`

    const res = await fetch(url, { headers: { 'Accept-Language': 'id' } })
    const data = await res.json()

    if (Array.isArray(data) && data.length > 0) {
      const item = data[0]
      const addr = item.address || {}
      const road = addr.road || addr.pedestrian || addr.footway || addr.street || addr.path || ''
      const houseNumber = addr.house_number ? ` No. ${addr.house_number}` : ''
      const fullRoad = road ? `${road}${houseNumber}` : item.display_name?.split(',')[0] || ''

      const provinsi = addr.state || addr.province || addr.state_district || ''
      const kota = addr.city || addr.regency || addr.county || addr.municipality || addr.town || ''
      const kecamatan = addr.subdistrict || addr.city_district || addr.township || addr.district || ''
      const kelurahan = addr.village || addr.hamlet || addr.neighbourhood || addr.suburb || ''
      const postcode = addr.postcode || ''

      const summary = [fullRoad, kelurahan, kecamatan, kota, provinsi].filter(Boolean).join(', ')

      return {
        lat: Number(item.lat),
        lng: Number(item.lon),
        displayName: item.display_name || '',
        road: fullRoad,
        province: provinsi,
        city: kota,
        district: kecamatan,
        subdistrict: kelurahan,
        postalCode: postcode,
        summary: summary || item.display_name,
        source: 'nominatim',
      }
    }
  } catch (err) {
    console.error('[MapboxHelper] Fallback Nominatim search error:', err)
  }

  return null
}

/**
 * Reverse Geocoding: Mendapatkan detail alamat berdasarkan koordinat lat, lng.
 * Menggunakan Mapbox Geocoding v5 jika token tersedia, fallback ke Nominatim OSM.
 */
export async function reverseGeocodeCoords(lat, lng, mapboxToken) {
  if (!lat || !lng) return null

  // 1. Prioritas: Mapbox Reverse Geocoding API
  if (mapboxToken && mapboxToken.trim()) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken.trim()}&language=id&limit=1`
      const res = await fetch(url)
      const data = await res.json()

      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const feat = data.features[0]

        let road = ''
        let kelurahan = ''
        let kecamatan = ''
        let kota = ''
        let provinsi = ''
        let postcode = ''

        if (feat.place_type?.includes('address')) {
          road = feat.text || ''
          if (feat.address) road += ` No. ${feat.address}`
        }

        if (Array.isArray(feat.context)) {
          for (const ctx of feat.context) {
            const id = ctx.id || ''
            if (id.startsWith('postcode')) postcode = ctx.text || ''
            else if (id.startsWith('locality') || id.startsWith('neighborhood')) kelurahan = ctx.text || ''
            else if (id.startsWith('district')) kecamatan = ctx.text || ''
            else if (id.startsWith('place')) kota = ctx.text || ''
            else if (id.startsWith('region')) provinsi = ctx.text || ''
          }
        }

        return {
          lat: Number(lat),
          lng: Number(lng),
          displayName: feat.place_name || '',
          road: road || feat.text || '',
          province: provinsi,
          city: kota,
          district: kecamatan,
          subdistrict: kelurahan,
          postalCode: postcode,
          summary: feat.place_name || '',
          source: 'mapbox',
        }
      }
    } catch (err) {
      console.warn('[MapboxHelper] Reverse geocode error, mencoba fallback OSM:', err)
    }
  }

  // 2. Fallback: OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    const res = await fetch(url, { headers: { 'Accept-Language': 'id' } })
    const data = await res.json()

    if (data && data.address) {
      const addr = data.address
      const road = addr.road || addr.pedestrian || addr.footway || addr.street || addr.path || ''
      const houseNumber = addr.house_number ? ` No. ${addr.house_number}` : ''
      const fullRoad = road ? `${road}${houseNumber}` : data.display_name?.split(',')[0] || ''

      const provinsi = addr.state || addr.province || addr.state_district || ''
      const kota = addr.city || addr.regency || addr.county || addr.municipality || addr.town || ''
      const kecamatan = addr.subdistrict || addr.city_district || addr.township || addr.district || ''
      const kelurahan = addr.village || addr.hamlet || addr.neighbourhood || addr.suburb || ''
      const postcode = addr.postcode || ''

      const summary = [fullRoad, kelurahan, kecamatan, kota, provinsi].filter(Boolean).join(', ')

      return {
        lat: Number(lat),
        lng: Number(lng),
        displayName: data.display_name || '',
        road: fullRoad,
        province: provinsi,
        city: kota,
        district: kecamatan,
        subdistrict: kelurahan,
        postalCode: postcode,
        summary: summary || data.display_name,
        source: 'nominatim',
      }
    }
  } catch (err) {
    console.error('[MapboxHelper] Fallback Nominatim reverse geocode error:', err)
  }

  return null
}
