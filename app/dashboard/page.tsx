'use client'

import { useEffect, useState } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { countries } from '@/lib/countries'
import { calculateVisaStatus } from '@/lib/visa-calculator'
import { resolveAllOverlaps } from '@/lib/overlap-handler'
import { parseISO, isAfter, isBefore } from 'date-fns'
import { visaRules } from '@/lib/visa-rules'
import VisaCard from '@/components/VisaCard'
import AddStayModal from '@/components/AddStayModal'
import StaysList from '@/components/StaysList'
import StatsCards from '@/components/StatsCards'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import FeedbackModal from '@/components/FeedbackModal'
import AchievementsSummary from '@/components/AchievementsSummary'
import CollapsibleSection from '@/components/CollapsibleSection'

export default function DashboardPage() {
  const { stays, loadStays, migrateFromLocalStorage, loading, initialLoad } = useSupabaseStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
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
  // Filter out US for US passport holders (temporary fix until passport nationality is implemented)
  const visaStatuses = visitedCountries
    .filter(country => country.code !== 'US') // Skip US for US passport holders
    .map(country => 
      calculateVisaStatus(stays, country)
    )
    .filter(status => {
      // Filter out countries where visa has reset or is too old to be relevant
      const countryStays = stays.filter(s => s.countryCode === status.country.code)
      if (countryStays.length === 0) return false
      
      // Sort stays by entry date (newest first)
      const sortedStays = countryStays.sort((a, b) => 
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      )
      
      const mostRecentStay = sortedStays[0]
      const mostRecentExit = mostRecentStay.exitDate 
        ? parseISO(mostRecentStay.exitDate)
        : new Date() // If no exit date, they're still there
      
      // Check if the most recent stay is over a year old
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      if (isAfter(oneYearAgo, mostRecentExit)) {
        // Stay is over a year old, don't show the card
        return false
      }
      
      // For reset-type visas, check if the visa has reset
      const visaRule = visaRules[status.country.code]
      if (visaRule && visaRule.ruleType === 'reset') {
        // If they've exited and it's been more than 7 days, the visa has reset
        // (unless they're currently in the country)
        if (mostRecentStay.exitDate) {
          const daysSinceExit = Math.floor(
            (new Date().getTime() - mostRecentExit.getTime()) / (1000 * 60 * 60 * 24)
          )
          
          // If it's been more than 7 days since exit, visa has reset
          if (daysSinceExit > 7) {
            return false
          }
        }
      }
      
      // For rolling window visas, always show if within the period
      // The calculator already handles the rolling window logic
      
      return true
    })

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                {loading && (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mt-1 text-sm">Track your visa status across countries</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Stay
            </button>
          </div>
        </div>

        {loading || !initialLoad ? (
          // Loading skeleton
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Loading */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              
              {/* Visa Cards Loading */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Achievement Loading */}
              <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : visaStatuses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="max-w-sm mx-auto">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Journey</h3>
              <p className="text-gray-500 mb-6 text-sm">Add your first travel record to begin tracking visa days</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                Add your first stay
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overlap Warning */}
            {hasOverlaps() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-yellow-800">Date Overlap Detected</h3>
                      <p className="text-xs text-yellow-700 mt-0.5">
                        Multiple countries on same dates detected
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleResolveOverlaps}
                    className="px-3 py-1.5 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 whitespace-nowrap"
                  >
                    Fix Now
                  </button>
                </div>
              </div>
            )}

            {/* Main Grid Layout - IA Optimized */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Primary Content - Visa Status & Travel History (Mobile: full width, Tablet: full width, Desktop: 2/3) */}
              <div className="md:col-span-2 lg:col-span-2 space-y-4 lg:space-y-6">
                {/* Stats Cards - Compact */}
                <div>
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Stats</h2>
                  <StatsCards />
                </div>
                
                {/* Visa Status Cards - 2 column grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Visas</h2>
                    <span className="text-xs text-gray-400">
                      {visaStatuses.length} countries
                    </span>
                  </div>
                  
                  {visaStatuses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {visaStatuses.map((status) => (
                        <VisaCard key={status.country.code} status={status} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-500">No active visa tracking needed</p>
                    </div>
                  )}
                </div>
                
                {/* Recent Travels - Compact List */}
                <div>
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Travel History</h2>
                  <div className="bg-white rounded-lg shadow-sm">
                    <StaysList />
                  </div>
                </div>
              </div>
              
              {/* Secondary Content - Achievements & Actions (Mobile: full width, Tablet: stacked below, Desktop: 1/3 sidebar) */}
              <div className="md:col-span-2 lg:col-span-1 space-y-4 lg:space-y-6">
                {/* Achievements Summary - Compact & Collapsible */}
                <CollapsibleSection
                  title="Achievements"
                  storageKey="dashboard-achievements-collapsed"
                  defaultCollapsed={false}
                >
                  <div className="bg-white rounded-lg shadow-sm">
                    <AchievementsSummary compact={true} />
                  </div>
                </CollapsibleSection>
                
                {/* Disclaimer - Compact */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-amber-800 mb-1">Disclaimer</p>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Visa info is for reference only. Always verify with official sources before travel.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-xs font-medium text-gray-700 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => window.location.href = '/dashboard/calendar'}
                      className="w-full text-left px-3 py-2 bg-white rounded hover:bg-gray-50 text-sm flex items-center gap-2"
                    >
                      <span>📅</span> View Calendar
                    </button>
                    <button
                      onClick={() => window.location.href = '/dashboard/csv'}
                      className="w-full text-left px-3 py-2 bg-white rounded hover:bg-gray-50 text-sm flex items-center gap-2"
                    >
                      <span>📁</span> Import/Export CSV
                    </button>
                    <button
                      onClick={() => window.location.href = '/dashboard/sources'}
                      className="w-full text-left px-3 py-2 bg-white rounded hover:bg-gray-50 text-sm flex items-center gap-2"
                    >
                      <span>🔍</span> Visa Sources
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddModal && <AddStayModal onClose={() => setShowAddModal(false)} />}
        {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
        
        {/* Floating Feedback Button - Smaller */}
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="fixed bottom-4 right-4 bg-purple-600 text-white p-2.5 rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-110 group"
          title="Send Feedback"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="absolute -top-8 right-0 bg-purple-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Beta Feedback
          </span>
        </button>
      </div>
    </ProtectedRoute>
  )
}