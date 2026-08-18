import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FaMapMarkerAlt, FaCrosshairs, FaSearchLocation, FaSpinner, FaCheckCircle } from 'react-icons/fa'

/**
 * AddressMap — Interactive map for address location selection using Leaflet CDN & OpenStreetMap Reverse Geocoding.
 * Automatically fetches Road Name, Province, City/Kabupaten, Kecamatan, and Kelurahan when pin is moved or clicked.
 */
export default function AddressMap({ latitude, longitude, onLocationChange, onAddressSelect }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [lastDetectedAddress, setLastDetectedAddress] = useState('')

  const defaultLat = latitude ? parseFloat(latitude) : -0.9471
  const defaultLng = longitude ? parseFloat(longitude) : 100.4172

  // Reverse Geocoding via Nominatim
  const performReverseGeocode = useCallback(async (lat, lng) => {
    onLocationChange?.(lat, lng)
    setIsGeocoding(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      if (data && data.address) {
        const addr = data.address
        const road = addr.road || addr.pedestrian || addr.footway || addr.path || addr.suburb || ''
        const houseNumber = addr.house_number ? ` No. ${addr.house_number}` : ''
        const fullRoadName = road ? `${road}${houseNumber}` : (data.display_name?.split(',')[0] || '')
        
        const provinsi = addr.state || ''
        const kota = addr.city || addr.town || addr.county || addr.city_district || addr.regency || ''
        const kecamatan = addr.subdistrict || addr.city_district || addr.suburb || ''
        const kelurahan = addr.village || addr.suburb || addr.neighbourhood || addr.quarter || ''
        const postcode = addr.postcode || ''

        const addressSummary = [fullRoadName, kelurahan, kecamatan, kota, provinsi].filter(Boolean).join(', ')
        setLastDetectedAddress(addressSummary)

        onAddressSelect?.({
          lat,
          lng,
          road: fullRoadName,
          provinsi,
          kota,
          kecamatan,
          kelurahan,
          postcode,
          displayName: data.display_name || ''
        })
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err)
    } finally {
      setIsGeocoding(false)
    }
  }, [onLocationChange, onAddressSelect])

  // Dynamically inject Leaflet CDN CSS & JS
  useEffect(() => {
    if (window.L) {
      setIsLoaded(true)
      return
    }

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id = 'leaflet-js'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => setIsLoaded(true)
      script.onerror = () => console.error('Failed to load Leaflet CDN')
      document.head.appendChild(script)
    } else {
      const script = document.getElementById('leaflet-js')
      const handleLoad = () => setIsLoaded(true)
      script.addEventListener('load', handleLoad)
      return () => script.removeEventListener('load', handleLoad)
    }
  }, [])

  // Initialize map when Leaflet is ready
  useEffect(() => {
    if (!isLoaded || !window.L || !mapRef.current || mapInstanceRef.current) return

    const L = window.L

    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const initialLat = !isNaN(defaultLat) ? defaultLat : -0.9471
    const initialLng = !isNaN(defaultLng) ? defaultLng : 100.4172

    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map)

    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      performReverseGeocode(pos.lat, pos.lng)
    })

    map.on('click', (e) => {
      marker.setLatLng(e.latlng)
      performReverseGeocode(e.latlng.lat, e.latlng.lng)
    })

    mapInstanceRef.current = map
    markerRef.current = marker

    setTimeout(() => map.invalidateSize(), 300)

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [isLoaded, performReverseGeocode])

  // Update marker when lat/lng props change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && latitude && longitude) {
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        markerRef.current.setLatLng([lat, lng])
        mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom())
      }
    }
  }, [latitude, longitude])

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung oleh browser Anda.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
          mapInstanceRef.current.setView([lat, lng], 16)
        }
        performReverseGeocode(lat, lng)
      },
      (err) => {
        alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan pada peramban Anda.')
        console.error('Geolocation error:', err)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [performReverseGeocode])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=id`
      )
      const data = await response.json()
      if (data && data.length > 0) {
        const parsedLat = parseFloat(data[0].lat)
        const parsedLng = parseFloat(data[0].lon)
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([parsedLat, parsedLng])
          mapInstanceRef.current.setView([parsedLat, parsedLng], 16)
        }
        performReverseGeocode(parsedLat, parsedLng)
      } else {
        alert('Lokasi tidak ditemukan. Silakan masukkan kata kunci lokasi lain.')
      }
    } catch (err) {
      console.error('Search error:', err)
      alert('Gagal mencari lokasi.')
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, performReverseGeocode])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          📍 Peta Alamat Interaktif (Klik/Geser Pin untuk Isi Otomatis Alamat)
        </label>
        {isGeocoding && (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 animate-pulse">
            <FaSpinner className="animate-spin text-xs" /> Mendeteksi Alamat...
          </span>
        )}
      </div>

      {/* Search Bar & Geolocation Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FaSearchLocation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            placeholder="Cari jalan / daerah, misal: Khatib Sulaiman Padang..."
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900 disabled:opacity-50 cursor-pointer"
        >
          {isSearching ? 'Mencari...' : 'Cari'}
        </button>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100 cursor-pointer"
          title="Gunakan lokasi saya saat ini"
        >
          <FaCrosshairs className="text-sm" />
        </button>
      </div>

      {/* Interactive Map Box */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
        {!isLoaded && (
          <div className="flex h-56 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              Memuat Peta Pilihan Alamat...
            </div>
          </div>
        )}
        <div
          ref={mapRef}
          className="h-56 w-full"
          style={{ display: isLoaded ? 'block' : 'none', zIndex: 0 }}
        />
      </div>

      {/* Last Detected Address Card */}
      {lastDetectedAddress && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
            <FaCheckCircle className="text-emerald-600" />
            <span>Alamat Terdeteksi dari Peta:</span>
          </div>
          <p className="text-slate-800 font-medium leading-relaxed pl-5">
            {lastDetectedAddress}
          </p>
        </div>
      )}

      {/* Selected Coordinates Badge */}
      {latitude && longitude && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
          <FaMapMarkerAlt className="text-xs text-emerald-700" />
          <span className="text-[11px] font-medium text-slate-600">
            Koordinat: <span className="font-bold text-slate-800">{parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}</span>
          </span>
        </div>
      )}

      <p className="text-[10px] text-slate-500">
        * Klik lokasi atau geser pin pada peta untuk mengisi otomatis Nama Jalan, Provinsi, Kota/Kabupaten, Kecamatan, dan Kelurahan ke dalam form.
      </p>
    </div>
  )
}
