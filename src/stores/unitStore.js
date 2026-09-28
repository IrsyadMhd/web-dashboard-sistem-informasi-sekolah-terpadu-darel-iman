import { create } from 'zustand'

function bacaUnitTersimpan() {
  const unit = localStorage.getItem('school_erp_unit')
  return unit && typeof unit === 'string' ? unit : 'semua'
}

export const useUnitStore = create((set) => ({
  activeUnit: bacaUnitTersimpan(),
  setActiveUnit: (activeUnit) => {
    if (activeUnit) {
      localStorage.setItem('school_erp_unit', activeUnit)
    } else {
      localStorage.removeItem('school_erp_unit')
    }
    set({ activeUnit })
  },
  resetUnit: () => {
    localStorage.removeItem('school_erp_unit')
    set({ activeUnit: 'semua' })
  },
}))

export const dashboardUnits = []