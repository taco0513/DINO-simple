'use client'

import { useEffect, useState } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { countries } from '@/lib/countries'
import { calculateVisaStatus } from '@/lib/visa-calculator'
import { resolveAllOverlaps } from '@/lib/overlap-handler'
import { parseISO, isAfter, isBefore } from 'date-fns'
import VisaCard from '@/components/VisaCard'
import AddStayModal from '@/components/AddStayModal'
import StaysList from '@/components/StaysList'
import StatsCards from '@/components/StatsCards'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import UserMenu from '@/components/UserMenu'

export default function DashboardPage() {
  const { stays, loadStays, migrateFromLocalStorage, loading, initialLoad } = useSupabaseStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Run migration and loading in parallel for faster startup
      Promise.all([
        migrateFromLocalStorage(),
        loadStays()
      ])
    }
  }, [user, loadStays, migrateFromLocalStorage])

  // Detect overlaps
  const hasOverlaps = () => {
    const sortedStays = [...stays].sort((a, b) => 
      new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    )
    
    for (let i = 0; i < sortedStays.length; i++) {
      const current = sortedStays[i]
      const next = sortedStays[i + 1]
      
      if (next && !current.exitDate && current.countryCode !== next.countryCode) {
        const currentEntry = parseISO(current.entryDate)
        const nextEntry = parseISO(next.entryDate)
        if (isBefore(currentEntry, nextEntry)) {
          return true
        }
      }
    }
    return false
  }

  // Resolve overlaps
  const handleResolveOverlaps = async () => {
    const resolvedStays = resolveAllOverlaps(stays)
    
    // Update each modified stay in Supabase
    for (const stay of resolvedStays) {
      const originalStay = stays.find(s => s.id === stay.id)
      if (originalStay && originalStay.exitDate !== stay.exitDate) {
        await useSupabaseStore.getState().updateStay(stay.id, {
          exitDate: stay.exitDate,
          fromCountryCode: stay.fromCountryCode,
          fromCity: stay.fromCity
        })
      }
    }
    
    // Reload stays from database
    await loadStays()
  }

  // Get unique countries from stays
  const visitedCountries = [...new Set(stays.map(s => s.countryCode))]
    .map(code => countries.find(c => c.code === code))
    .filter((c): c is typeof countries[0] => c !== undefined)

  // Calculate visa status for each visited country
  const visaStatuses = visitedCountries.map(country => 
    calculateVisaStatus(stays, country)
  )

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8">
      {/* Modern Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Track your visa status across countries</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-initial bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm md:text-base shadow-sm transition-colors"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Stay Record
            </button>
            <UserMenu />
          </div>
        </div>
      </div>

      {loading || !initialLoad ? (
        // Loading skeleton - show this while loading OR if initial load hasn't completed
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </section>
          
          <div className="border-t border-gray-100"></div>
          
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Visa Status by Country</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : visaStatuses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No travel records yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add your first stay
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overlap Warning */}
          {hasOverlaps() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Date Overlap Detected</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      You have records showing stays in multiple countries simultaneously. Would you like to automatically resolve this?
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResolveOverlaps}
                  className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Resolve Overlaps
                </button>
              </div>
            </div>
          )}

          {/* Stats Section */}
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Overview</h2>
            <StatsCards />
          </section>
          
          {/* Divider */}
          <div className="border-t border-gray-100"></div>
          
          {/* Visa Status Section */}
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Visa Status by Country</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visaStatuses.map((status) => (
                <VisaCard key={status.country.code} status={status} />
              ))}
            </div>
          </section>
          
          {/* Divider */}
          <div className="border-t border-gray-100"></div>
          
          {/* Travel History Section */}
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Travel History</h2>
            <StaysList />
          </section>
        </div>
      )}

      {showAddModal && <AddStayModal onClose={() => setShowAddModal(false)} />}
      </div>
    </ProtectedRoute>
  )
}