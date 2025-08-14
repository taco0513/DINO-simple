'use client'

import { useState } from 'react'
import { Stay } from '@/lib/types'
import { useSupabaseStore } from '@/lib/supabase-store'
import { countries } from '@/lib/countries'
import EditStayModal from './EditStayModal'
import { differenceInDays, parseISO } from 'date-fns'

export default function StaysList() {
  const { stays, deleteStay } = useSupabaseStore()
  const [editingStay, setEditingStay] = useState<Stay | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>('')

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this?')) {
      await deleteStay(id)
    }
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

  if (stays.length === 0) return null

  return (
    <>
      {/* Country Filter */}
      {visitedCountries.length > 1 && (
        <div className="mb-4 flex items-center space-x-2">
          <label className="text-sm text-gray-600">Filter by country:</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onClick={() => setSelectedCountry('')}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-100">
          {sortedStays.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No stays found for the selected country.
            </div>
          ) : (
            sortedStays.map((stay) => {
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
                <div key={stay.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{country?.flag}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {country?.name}
                          {stay.city && <span className="text-gray-600"> ({stay.city})</span>}
                          {isCurrentlyStaying && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Currently staying
                            </span>
                          )}
                          {isFutureTrip && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              Future trip
                            </span>
                          )}
                        </p>
                      </div>
                      {fromCountry && (
                        <p className="text-xs text-gray-500 mb-1">
                          From: {fromCountry.flag} {fromCountry.name}
                          {stay.fromCity && <span> ({stay.fromCity})</span>}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {stay.entryDate} ~ {stay.exitDate || 'Present'}
                        <span className="ml-2 text-xs text-gray-500">({durationText})</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingStay(stay)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(stay.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
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