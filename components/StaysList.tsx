'use client'

import { useState } from 'react'
import { Stay } from '@/lib/types'
import { useSupabaseStore } from '@/lib/supabase-store'
import { countries } from '@/lib/countries'
import EditStayModal from './EditStayModal'
import { differenceInDays, parseISO } from 'date-fns'
import { findAirportByCode, isLikelyAirportCode } from '@/lib/airport-codes'

export default function StaysList() {
  const { stays, deleteStay } = useSupabaseStore()
  const [editingStay, setEditingStay] = useState<Stay | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this?')) {
      await deleteStay(id)
    }
  }

  // Helper function to format city display with airport code recognition
  const formatCityDisplay = (city: string | undefined): string => {
    if (!city) return ''
    
    // If it already has the format "City (CODE)", return as is but ensure CODE is uppercase
    if (city.includes('(') && city.includes(')')) {
      const match = city.match(/^(.+)\s\(([^)]+)\)$/)
      if (match && isLikelyAirportCode(match[2])) {
        return `${match[1]} (${match[2].toUpperCase()})`
      }
      return city
    }
    
    // Check if it's an airport code
    if (isLikelyAirportCode(city)) {
      const airport = findAirportByCode(city)
      if (airport) {
        return `${airport.city} (${city.toUpperCase()})`
      }
    }
    
    return city
  }

  // Get unique countries from stays
  const visitedCountries = [...new Set(stays.map(s => s.countryCode))]
    .map(code => countries.find(c => c.code === code))
    .filter((c): c is typeof countries[0] => c !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name))

  // Filter stays by selected country
  const filteredStays = selectedCountry 
    ? stays.filter(stay => stay.countryCode === selectedCountry)
    : stays

  const sortedStays = [...filteredStays].sort((a, b) => 
    new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  )

  // Pagination logic
  const totalPages = Math.ceil(sortedStays.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStays = sortedStays.slice(startIndex, endIndex)

  // Reset to page 1 when filter changes
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value)
    setCurrentPage(1)
  }

  if (stays.length === 0) return null

  return (
    <>
      {/* Country Filter */}
      {visitedCountries.length > 1 && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm text-gray-600 flex-shrink-0">Filter by country:</label>
          <div className="flex gap-2 flex-1">
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All countries ({stays.length} stays)</option>
              {visitedCountries.map(country => {
                const countryStayCount = stays.filter(s => s.countryCode === country.code).length
                return (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name} ({countryStayCount} {countryStayCount === 1 ? 'stay' : 'stays'})
                  </option>
                )
              })}
            </select>
            {selectedCountry && (
              <button
                onClick={() => handleCountryChange('')}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-100">
          {sortedStays.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No stays found for the selected country.
            </div>
          ) : (
            paginatedStays.map((stay) => {
              const country = countries.find(c => c.code === stay.countryCode)
              const fromCountry = stay.fromCountryCode ? countries.find(c => c.code === stay.fromCountryCode) : null
              
              const entryDate = new Date(stay.entryDate)
              const exitDate = stay.exitDate ? new Date(stay.exitDate) : null
              const today = new Date()
              today.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison
              entryDate.setHours(0, 0, 0, 0)
              if (exitDate) exitDate.setHours(0, 0, 0, 0)
              
              const isFutureTrip = entryDate > today
              const isCurrentlyStaying = entryDate <= today && (!exitDate || exitDate >= today)
              
              // Calculate duration
              let duration = 0
              let durationText = ''
              if (isFutureTrip) {
                // Future trip - can't calculate duration yet
                durationText = stay.exitDate ? `${differenceInDays(parseISO(stay.exitDate), parseISO(stay.entryDate)) + 1} days planned` : 'Duration TBD'
              } else if (isCurrentlyStaying) {
                // Currently staying
                duration = differenceInDays(today, parseISO(stay.entryDate)) + 1
                durationText = `Day ${duration} (ongoing)`
              } else if (stay.exitDate) {
                // Past trip with exit date
                duration = differenceInDays(parseISO(stay.exitDate), parseISO(stay.entryDate)) + 1
                durationText = `${duration} days`
              } else {
                // Past trip without exit date (shouldn't happen but handle it)
                durationText = 'No exit date recorded'
              }
              
              return (
                <div key={stay.id} className="p-4 md:p-5 hover:bg-gray-50 transition-colors">
                  {/* Mobile Layout (default) */}
                  <div className="md:hidden">
                    {/* Header with flag and status badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{country?.flag}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 leading-tight">
                            {country?.name}
                            {stay.city && (
                              <span className="text-gray-600 text-sm block mt-0.5">{formatCityDisplay(stay.city)}</span>
                            )}
                          </h3>
                        </div>
                      </div>
                      {/* Status Badge */}
                      {(isCurrentlyStaying || isFutureTrip) && (
                        <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full ${
                          isCurrentlyStaying 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isCurrentlyStaying ? 'Current' : 'Future'}
                        </span>
                      )}
                    </div>
                    
                    {/* Travel Details */}
                    <div className="space-y-1.5 mb-3 text-sm">
                      {fromCountry && (
                        <div className="flex items-center text-gray-500">
                          <span className="text-xs mr-1">From:</span>
                          <span className="text-base mr-1">{fromCountry.flag}</span>
                          <span className="truncate">
                            {fromCountry.name}
                            {stay.fromCity && <span> ({formatCityDisplay(stay.fromCity)})</span>}
                          </span>
                        </div>
                      )}
                      <div className="text-gray-600">
                        <div className="font-medium">
                          {stay.entryDate} ~ {stay.exitDate || 'Present'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {durationText}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingStay(stay)}
                        className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(stay.id)}
                        className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden md:flex md:items-center md:justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{country?.flag}</span>
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <p className="font-medium">
                            {country?.name}
                            {stay.city && <span className="text-gray-600"> ({formatCityDisplay(stay.city)})</span>}
                          </p>
                          {isCurrentlyStaying && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Currently staying
                            </span>
                          )}
                          {isFutureTrip && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              Future trip
                            </span>
                          )}
                        </div>
                        {fromCountry && (
                          <p className="text-xs text-gray-500 mt-1">
                            From: {fromCountry.flag} {fromCountry.name}
                            {stay.fromCity && <span> ({formatCityDisplay(stay.fromCity)})</span>}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          {stay.entryDate} ~ {stay.exitDate || 'Present'}
                          <span className="ml-2 text-xs text-gray-500">({durationText})</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <button
                        onClick={() => setEditingStay(stay)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(stay.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Showing info */}
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, sortedStays.length)} of {sortedStays.length} stays
              </div>
              
              {/* Page controls */}
              <div className="hidden sm:flex items-center gap-2">
                {/* Previous button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {/* Generate all page numbers to display */}
                  {(() => {
                    const pages: (number | string)[] = []
                    
                    if (totalPages <= 7) {
                      // Show all pages if total is 7 or less
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i)
                      }
                    } else {
                      // Always show first page
                      pages.push(1)
                      
                      // Add ellipsis if current page is far from start
                      if (currentPage > 3) {
                        pages.push('...')
                      }
                      
                      // Show pages around current page
                      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                        pages.push(i)
                      }
                      
                      // Add ellipsis if current page is far from end
                      if (currentPage < totalPages - 2) {
                        pages.push('...')
                      }
                      
                      // Always show last page
                      pages.push(totalPages)
                    }
                    
                    return pages.map((page, index) => {
                      if (page === '...') {
                        return <span key={`ellipsis-${index}`} className="px-1 text-gray-400">...</span>
                      }
                      
                      const pageNum = page as number
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                            pageNum === currentPage
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })
                  })()}
                </div>
                
                {/* Next button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
            
            {/* Mobile pagination - simplified */}
            <div className="sm:hidden mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-colors ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 border-gray-200' 
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-colors ${
                  currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400 border-gray-200' 
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {editingStay && (
        <EditStayModal
          stay={editingStay}
          onClose={() => setEditingStay(null)}
        />
      )}
    </>
  )
}