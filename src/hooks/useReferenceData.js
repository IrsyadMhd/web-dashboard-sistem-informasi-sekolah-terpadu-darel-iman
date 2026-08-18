import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

async function getClasses(params = { per_page: 100 }) {
  const { data } = await api.get('/kelas', { params })
  return data
}

async function getTeachers(params = { per_page: 100 }) {
  const { data } = await api.get('/teachers', { params })
  return data
}

export function useDaftarKelas(params = { per_page: 100 }, options = {}) {
  return useQuery({
    queryKey: ['reference-data', 'classes', params],
    queryFn: () => getClasses(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  })
}

export function useDaftarGuru(params = { per_page: 100 }, options = {}) {
  return useQuery({
    queryKey: ['reference-data', 'teachers', params],
    queryFn: () => getTeachers(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  })
}
