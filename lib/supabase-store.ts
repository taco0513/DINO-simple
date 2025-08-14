import { create } from 'zustand'
import { Stay } from './types'
import { supabase } from './supabase'
import { resolveStayOverlaps, resolveAllOverlaps } from './overlap-handler'

interface SupabaseStoreState {
  stays: Stay[]
  loading: boolean
  addStay: (stay: Omit<Stay, 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateStay: (id: string, stay: Partial<Stay>) => Promise<void>
  deleteStay: (id: string) => Promise<void>
  loadStays: () => Promise<void>
  migrateFromLocalStorage: () => Promise<void>
}

export const useSupabaseStore = create<SupabaseStoreState>((set, get) => ({
  stays: [],
  loading: false,
  
  addStay: async (stayData) => {
    try {
      set({ loading: true })
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const stay: Stay = {
        ...stayData,
        user_id: user.id,
      }

      // Resolve overlaps
      const currentStays = get().stays
      const resolvedStays = resolveStayOverlaps(currentStays, stay)
      const newStay = resolvedStays.find(s => s.id === stay.id)!

      // Insert into Supabase
      const { error } = await supabase
        .from('stays')
        .insert({
          id: newStay.id,
          user_id: user.id,
          country_code: newStay.countryCode,
          city: newStay.city,
          from_country_code: newStay.fromCountryCode,
          from_city: newStay.fromCity,
          entry_date: newStay.entryDate,
          exit_date: newStay.exitDate,
          visa_type: newStay.visaType || 'visa-free',
          notes: newStay.notes,
        })

      if (error) throw error

      // Update any other stays that were modified by overlap resolution
      const otherStays = resolvedStays.filter(s => s.id !== stay.id && currentStays.some(cs => cs.id === s.id))
      for (const modifiedStay of otherStays) {
        if (currentStays.find(cs => cs.id === modifiedStay.id && cs.exitDate !== modifiedStay.exitDate)) {
          await supabase
            .from('stays')
            .update({
              exit_date: modifiedStay.exitDate,
              from_country_code: modifiedStay.fromCountryCode,
              from_city: modifiedStay.fromCity,
            })
            .eq('id', modifiedStay.id)
        }
      }

      set({ stays: resolvedStays })
    } catch (error) {
      console.error('Error adding stay:', error)
    } finally {
      set({ loading: false })
    }
  },
  
  updateStay: async (id, updatedStay) => {
    try {
      set({ loading: true })
      
      const { error } = await supabase
        .from('stays')
        .update({
          country_code: updatedStay.countryCode,
          city: updatedStay.city,
          from_country_code: updatedStay.fromCountryCode,
          from_city: updatedStay.fromCity,
          entry_date: updatedStay.entryDate,
          exit_date: updatedStay.exitDate,
          visa_type: updatedStay.visaType,
          notes: updatedStay.notes,
        })
        .eq('id', id)

      if (error) throw error

      set(state => ({
        stays: state.stays.map(s => 
          s.id === id ? { ...s, ...updatedStay } : s
        )
      }))
    } catch (error) {
      console.error('Error updating stay:', error)
    } finally {
      set({ loading: false })
    }
  },
  
  deleteStay: async (id) => {
    try {
      set({ loading: true })
      
      const { error } = await supabase
        .from('stays')
        .delete()
        .eq('id', id)

      if (error) throw error

      set(state => ({
        stays: state.stays.filter(s => s.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting stay:', error)
    } finally {
      set({ loading: false })
    }
  },
  
  loadStays: async () => {
    try {
      set({ loading: true })
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('stays')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })

      if (error) throw error

      // Convert database format to Stay interface
      const stays: Stay[] = data?.map(row => ({
        id: row.id,
        user_id: row.user_id,
        countryCode: row.country_code,
        city: row.city,
        fromCountryCode: row.from_country_code,
        fromCity: row.from_city,
        entryDate: row.entry_date,
        exitDate: row.exit_date,
        visaType: row.visa_type,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })) || []

      // Remove duplicates based on same country, dates, and cities
      const uniqueStays = stays.filter((stay, index, self) => 
        index === self.findIndex((s) => 
          s.countryCode === stay.countryCode &&
          s.entryDate === stay.entryDate &&
          s.exitDate === stay.exitDate &&
          s.city === stay.city &&
          s.fromCountryCode === stay.fromCountryCode &&
          s.fromCity === stay.fromCity
        )
      )

      // Delete duplicates from database
      const duplicateIds = stays
        .filter((stay, index, self) => 
          index !== self.findIndex((s) => 
            s.countryCode === stay.countryCode &&
            s.entryDate === stay.entryDate &&
            s.exitDate === stay.exitDate &&
            s.city === stay.city &&
            s.fromCountryCode === stay.fromCountryCode &&
            s.fromCity === stay.fromCity
          )
        )
        .map(s => s.id)

      // Delete duplicates from Supabase
      if (duplicateIds.length > 0) {
        console.log(`Removing ${duplicateIds.length} duplicate entries`)
        for (const id of duplicateIds) {
          await supabase
            .from('stays')
            .delete()
            .eq('id', id)
        }
      }

      // Resolve any overlaps
      const resolvedStays = resolveAllOverlaps(uniqueStays)
      
      set({ stays: resolvedStays })
    } catch (error) {
      console.error('Error loading stays:', error)
    } finally {
      set({ loading: false })
    }
  },

  migrateFromLocalStorage: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if user already has data in Supabase
      const { data: existingStays } = await supabase
        .from('stays')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (existingStays && existingStays.length > 0) {
        // User already has data, don't migrate
        localStorage.removeItem('dino-stays')
        return
      }

      // Get data from localStorage
      const savedStays = localStorage.getItem('dino-stays')
      if (!savedStays) return

      const localStays: Stay[] = JSON.parse(savedStays)
      if (localStays.length === 0) return

      // Migrate each stay
      const staysToInsert = localStays.map(stay => ({
        id: stay.id,
        user_id: user.id,
        country_code: stay.countryCode,
        city: stay.city,
        from_country_code: stay.fromCountryCode,
        from_city: stay.fromCity,
        entry_date: stay.entryDate,
        exit_date: stay.exitDate,
        visa_type: stay.visaType || 'visa-free',
        notes: stay.notes,
      }))

      const { error } = await supabase
        .from('stays')
        .insert(staysToInsert)

      if (error) {
        console.error('Migration error:', error)
        return
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('dino-stays')
      
      // Reload stays from Supabase
      await get().loadStays()
      
      console.log(`Successfully migrated ${localStays.length} stays to Supabase`)
    } catch (error) {
      console.error('Error during migration:', error)
    }
  }
}))