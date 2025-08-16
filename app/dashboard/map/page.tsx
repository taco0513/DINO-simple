'use client'

import { useEffect, useState } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { countries } from '@/lib/countries'
import ProtectedRoute from '@/components/ProtectedRoute'
import GeoWorldMap from './components/GeoWorldMap'
import AddVisitModal from './components/AddVisitModal'
import AddTravelModal from './components/AddTravelModal'
import { getVisitedCitiesWithCoordinates } from '@/lib/city-coordinates'

export default function MapPage() {
  const { stays, loadStays, loading, initialLoad } = useSupabaseStore()
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Calculate visited countries (treating memory and exact stays the same)
  const visitedCountries = [...new Set(stays.map(s => s.countryCode))]
  const visitedCountryData = visitedCountries
    .map(code => countries.find(c => c.code === code))
    .filter((c): c is typeof countries[0] => c !== undefined)
  
  // Get visited cities with coordinates
  const visitedCities = getVisitedCitiesWithCoordinates(stays)
  
  // Statistics
  const totalCountries = visitedCountries.length
  const totalCities = [...new Set(stays.map(s => s.city).filter(c => c))].length
  
  const mostRecentStay = stays
    .filter(s => s.exitDate)
    .sort((a, b) => new Date(b.exitDate!).getTime() - new Date(a.exitDate!).getTime())[0]
  
  const mostRecentCountry = mostRecentStay 
    ? countries.find(c => c.code === mostRecentStay.countryCode)
    : null

  useEffect(() => {
    loadStays()
  }, [loadStays])

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Travel Map</h1>
              <p className="text-sm text-gray-600 mt-1">Explore the countries you've visited</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm shadow-sm transition-colors"
            >
              <span className="mr-2">✈️</span>
              <span>Add Travel History</span>
            </button>
          </div>
        </div>

        {loading || !initialLoad ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-200 rounded-lg h-40"></div>
              ))}
            </div>
          </div>
        ) : (
          /* Main Layout - Full Width Map with Bottom Sidebar */
          <div className="space-y-4 md:space-y-6">
            {/* Full Width Map Section */}
            <div className="w-full">
              {/* World Map - Full Width */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">World Travel Map</h2>
                </div>
                <div className="p-4" style={{ minHeight: '500px' }}>
                  <GeoWorldMap 
                    visitedCountries={visitedCountries}
                    visitedCities={visitedCities}
                    onCountryClick={(countryCode) => {
                      const country = countries.find(c => c.code === countryCode)
                      if (country) {
                        if (visitedCountries.includes(countryCode)) {
                          console.log(`Already visited: ${country.name}`)
                        } else {
                          setSelectedCountry(countryCode)
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Grid - Countries List, Stats, Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {/* Countries List - Simple & Compact */}
              <div className="bg-white rounded-lg shadow-sm xl:col-span-2">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Countries Visited</h2>
                  <span className="text-xs text-gray-400">{visitedCountryData.length} countries</span>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  {visitedCountryData.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-3xl mb-3 block">✈️</span>
                      <p className="text-sm text-gray-500">No travel records yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add your first stay to see your travel map</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {visitedCountryData
                        .sort((a, b) => {
                          const aVisits = stays.filter(s => s.countryCode === a.code).length
                          const bVisits = stays.filter(s => s.countryCode === b.code).length
                          return bVisits - aVisits
                        })
                        .map((country, index) => {
                          const countryStays = stays.filter(s => s.countryCode === country.code)
                          const cities = [...new Set(countryStays.map(s => s.city).filter(c => c))]
                          
                          return (
                            <div 
                              key={country.code}
                              className="flex items-center py-1 px-2 hover:bg-gray-50 rounded group"
                            >
                              <span className="text-xs text-gray-400 w-4 mr-2">{index + 1}.</span>
                              <span className="text-base mr-2">{country.flag}</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-900 truncate block">{country.name}</span>
                                <span className="text-xs text-gray-500">
                                  {countryStays.length} visit{countryStays.length > 1 ? 's' : ''}
                                  {cities.length > 0 && ` • ${cities.length} cit${cities.length > 1 ? 'ies' : 'y'}`}
                                </span>
                              </div>
                              <button
                                onClick={() => setSelectedCountry(country.code)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded"
                                title={`Add cities to ${country.name}`}
                              >
                                <svg className="w-4 h-4 text-gray-600 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats - Compact */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Stats</h2>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🌍</span>
                      <div>
                        <p className="text-xs text-gray-600">Countries</p>
                        <p className="text-lg font-bold text-gray-900">{totalCountries}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏙️</span>
                      <div>
                        <p className="text-xs text-gray-600">Cities</p>
                        <p className="text-lg font-bold text-gray-900">{totalCities}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏃‍♂️</span>
                      <div>
                        <p className="text-xs text-gray-600">Most Recent</p>
                        <p className="text-sm font-bold text-gray-900">
                          {mostRecentCountry ? `${mostRecentCountry.flag} ${mostRecentCountry.name}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Actions and Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Actions</h2>
                </div>
                <div className="p-4 space-y-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full text-left flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <span>✈️</span>
                      <span className="text-sm">Add Travel History</span>
                    </span>
                    <span className="text-gray-400">→</span>
                  </button>
                  <a
                    href="/dashboard"
                    className="w-full text-left flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <span>📊</span>
                      <span className="text-sm">View Dashboard</span>
                    </span>
                    <span className="text-gray-400">→</span>
                  </a>
                  <a
                    href="/dashboard/calendar"
                    className="w-full text-left flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <span>📅</span>
                      <span className="text-sm">View Calendar</span>
                    </span>
                    <span className="text-gray-400">→</span>
                  </a>
                </div>
              </div>

              {/* Travel Tips */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-3">Travel Tip</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Click on any unvisited country on the map to quickly add it to your travel history. 
                  Use Memory Mode to record places you visited years ago!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Unified Add Visit Modal */}
        <AddVisitModal
          isOpen={selectedCountry !== null}
          countryCode={selectedCountry}
          onClose={() => setSelectedCountry(null)}
          onSuccess={() => {
            // 성공 후 데이터 새로고침
            loadStays()
          }}
        />

        {/* Add Travel History Modal (for detailed entry) */}
        <AddTravelModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            // 성공 후 데이터 새로고침
            loadStays()
          }}
        />
      </div>
    </ProtectedRoute>
  )
}