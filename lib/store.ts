import { create } from 'zustand'
import { Stay } from './types'
import { resolveStayOverlaps, resolveAllOverlaps } from './overlap-handler'

interface StoreState {
  stays: Stay[]
  addStay: (stay: Stay) => void
  updateStay: (id: string, stay: Partial<Stay>) => void
  deleteStay: (id: string) => void
  loadStays: () => void
}

export const useStore = create<StoreState>((set) => ({
  stays: [],
  
  addStay: (stay) => set((state) => {
    // 오버랩 해결 후 추가
    const resolvedStays = resolveStayOverlaps(state.stays, stay)
    return { stays: resolvedStays }
  }),
  
  updateStay: (id, updatedStay) => set((state) => ({
    stays: state.stays.map(s => s.id === id ? { ...s, ...updatedStay } : s)
  })),
  
  deleteStay: (id) => set((state) => ({
    stays: state.stays.filter(s => s.id !== id)
  })),
  
  loadStays: () => {
    // Load from localStorage
    const savedStays = localStorage.getItem('dino-stays')
    if (savedStays) {
      const stays: Stay[] = JSON.parse(savedStays)
      // Fix duplicate IDs by regenerating them if needed
      const seenIds = new Set<string>()
      const fixedStays = stays.map((stay) => {
        if (seenIds.has(stay.id)) {
          // Generate new unique ID for duplicate
          return {
            ...stay,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
        }
        seenIds.add(stay.id)
        return stay
      })
      
      // 모든 오버랩 해결
      const resolvedStays = resolveAllOverlaps(fixedStays)
      set({ stays: resolvedStays })
      
      // Save fixed data back to localStorage if we fixed any duplicates or overlaps
      if (resolvedStays.some((s, i) => s.id !== stays[i]?.id) || 
          resolvedStays.some(s => fixedStays.find(f => f.id === s.id && f.exitDate !== s.exitDate))) {
        localStorage.setItem('dino-stays', JSON.stringify(resolvedStays))
      }
    }
  }
}))