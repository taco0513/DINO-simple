'use client'

import { useEffect, useState } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { countries } from '@/lib/countries'
import ProtectedRoute from '@/components/ProtectedRoute'
import GeoWorldMap from './components/GeoWorldMap'
import QuickVisitModal from './components/QuickVisitModal'
import AddTravelModal from './components/AddTravelModal'

export default function MapPage() {
  const { stays, loadStays, loading, initialLoad } = useSupabaseStore()
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  
  // 방문한 국가들 계산
  const visitedCountries = [...new Set(stays.map(s => s.countryCode))]
  const visitedCountryData = visitedCountries
    .map(code => countries.find(c => c.code === code))
    .filter((c): c is typeof countries[0] => c !== undefined)
  
  // 통계 계산
  const totalCountries = visitedCountries.length
  const totalDays = stays.reduce((total, stay) => {
    if (!stay.exitDate) return total
    const entryDate = new Date(stay.entryDate)
    const exitDate = new Date(stay.exitDate)
    const days = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
    return total + Math.max(1, days)
  }, 0)
  
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
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Travel Map</h1>
              <p className="text-gray-600">Explore the countries you've visited</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-md"
            >
              <span className="text-lg">✈️</span>
              <span>Add Travel History</span>
            </button>
          </div>
        </div>

        {loading || !initialLoad ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
              ))}
            </div>
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Countries Visited</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCountries}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Days</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDays}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🏃‍♂️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Most Recent</p>
                    <p className="text-lg font-bold text-gray-900">
                      {mostRecentCountry ? `${mostRecentCountry.flag} ${mostRecentCountry.name}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* World Map */}
            <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col" style={{ minHeight: '500px' }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">World Travel Map</h2>
              <div className="flex-1">
                <GeoWorldMap 
                  visitedCountries={visitedCountries}
                  onCountryClick={(countryCode) => {
                    const country = countries.find(c => c.code === countryCode)
                    if (country) {
                      if (visitedCountries.includes(countryCode)) {
                        // 이미 방문한 국가 - 나중에 상세 정보 표시 가능
                        console.log(`Already visited: ${country.name}`)
                      } else {
                        // 미방문 국가 - 빠른 방문 표시 모달 열기
                        setSelectedCountry(countryCode)
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Countries Grid */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Countries You've Visited</h2>
              
              {visitedCountryData.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">✈️</span>
                  <p className="text-gray-500">No travel records yet</p>
                  <p className="text-sm text-gray-400 mt-2">Add your first stay to see your travel map</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {visitedCountryData
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((country) => {
                      const countryStays = stays.filter(s => s.countryCode === country.code)
                      const countryDays = countryStays.reduce((total, stay) => {
                        if (!stay.exitDate) return total
                        const entryDate = new Date(stay.entryDate)
                        const exitDate = new Date(stay.exitDate)
                        const days = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
                        return total + Math.max(1, days)
                      }, 0)

                      return (
                        <div 
                          key={country.code}
                          className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-lg p-4 text-center transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-1"
                          title={`${country.name}: ${countryDays} days in ${countryStays.length} visit${countryStays.length > 1 ? 's' : ''}`}
                        >
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                            {country.flag}
                          </div>
                          <p className="font-semibold text-sm text-gray-900 mb-1 truncate">
                            {country.name}
                          </p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-blue-700">
                              {countryDays} day{countryDays > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-500">
                              {countryStays.length} visit{countryStays.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Progress Indicators */}
            {visitedCountryData.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Countries Explored</span>
                      <span className="text-sm text-gray-600">{totalCountries}/195</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((totalCountries / 195) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((totalCountries / 195) * 100).toFixed(1)}% of the world
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Travel Experience</span>
                      <span className="text-sm text-gray-600">{totalDays} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((totalDays / 365) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(totalDays / 365).toFixed(1)} year{totalDays >= 365 ? 's' : ''} of travel
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick Visit Modal */}
        <QuickVisitModal
          isOpen={selectedCountry !== null}
          countryCode={selectedCountry}
          onClose={() => setSelectedCountry(null)}
          onSuccess={() => {
            // 성공 후 데이터 새로고침
            loadStays()
          }}
        />

        {/* Add Travel History Modal */}
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