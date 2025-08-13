'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { countries } from '@/lib/countries'

interface CountryFilterProps {
  selectedCountries: string[]
  onSelectionChange: (countries: string[]) => void
}

export default function CountryFilter({ selectedCountries, onSelectionChange }: CountryFilterProps) {
  const stays = useStore((state) => state.stays)
  const [visitedCountries, setVisitedCountries] = useState<string[]>([])

  useEffect(() => {
    // Get unique countries from stays
    const uniqueCountries = [...new Set(stays.map(s => s.countryCode))]
    setVisitedCountries(uniqueCountries)
  }, [stays])

  const handleCountryToggle = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      onSelectionChange(selectedCountries.filter(c => c !== countryCode))
    } else {
      onSelectionChange([...selectedCountries, countryCode])
    }
  }

  const handleSelectAll = () => {
    onSelectionChange(visitedCountries)
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  if (visitedCountries.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Filter by Country</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleClearAll}
            className="text-xs text-gray-600 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {visitedCountries.map(countryCode => {
          const country = countries.find(c => c.code === countryCode)
          const isSelected = selectedCountries.includes(countryCode)
          
          if (!country) return null
          
          return (
            <button
              key={countryCode}
              onClick={() => handleCountryToggle(countryCode)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isSelected 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}
              `}
            >
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </button>
          )
        })}
      </div>

      {selectedCountries.length > 0 && (
        <div className="mt-3 text-xs text-gray-600">
          Showing {selectedCountries.length} of {visitedCountries.length} countries
        </div>
      )}
    </div>
  )
}