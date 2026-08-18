import { useQuery } from '@tanstack/react-query'
import { wilayahService } from '../services/wilayahService'

const STALE_TIME_24H = 24 * 60 * 60 * 1000 // 24 hours

export function useProvinsiList() {
  return useQuery({
    queryKey: ['wilayah', 'provinsi'],
    queryFn: () => wilayahService.getProvinsi(),
    staleTime: STALE_TIME_24H,
    gcTime: STALE_TIME_24H,
  })
}

export function useKotaOptions(provinsi) {
  return useQuery({
    queryKey: ['wilayah', 'kota', provinsi || 'all'],
    queryFn: () => wilayahService.getKota(provinsi),
    staleTime: STALE_TIME_24H,
    gcTime: STALE_TIME_24H,
  })
}

export function useKecamatanOptions(kota, provinsi) {
  return useQuery({
    queryKey: ['wilayah', 'kecamatan', provinsi || 'all', kota || 'all'],
    queryFn: () => wilayahService.getKecamatan(kota, provinsi),
    staleTime: STALE_TIME_24H,
    gcTime: STALE_TIME_24H,
    enabled: Boolean(kota),
  })
}

export function useKelurahanOptions(kecamatan, kota, provinsi) {
  return useQuery({
    queryKey: ['wilayah', 'kelurahan', provinsi || 'all', kota || 'all', kecamatan || 'all'],
    queryFn: () => wilayahService.getKelurahan(kecamatan, kota, provinsi),
    staleTime: STALE_TIME_24H,
    gcTime: STALE_TIME_24H,
    enabled: Boolean(kecamatan),
  })
}
