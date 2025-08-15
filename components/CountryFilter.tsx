'use client'

import { useEffect, useState } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { countries } from '@/lib/countries'

interface CountryFilterProps {
  selectedCountries: string[]
  onSelectionChange: (countries: string[]) => void
  visibleCountries?: string[]
}

export default function CountryFilter({ selectedCountries, onSelectionChange, visibleCountries }: CountryFilterProps) {
  const stays = useSupabaseStore((state) => state.stays)
  const [availableCountries, setAvailableCountries] = useState<string[]>([])

  useEffect(() => {
    // Use provided visibleCountries or fall back to all visited countries
    const countriesToShow = visibleCountries || [...new Set(stays.map(s => s.countryCode))]
    setAvailableCountries(countriesToShow)
  }, [stays, visibleCountries])

  const handleCountryToggle = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      onSelectionChange(selectedCountries.filter(c => c !== countryCode))
    } else {
      onSelectionChange([...selectedCountries, countryCode])
    }
  }

  const handleSelectAll = () => {
    onSelectionChange(availableCountries)
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  if (availableCountries.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">
            Filter by Country
            {visibleCountries && <span className="text-xs text-gray-500 ml-1">(Current View)</span>}
          </h2>
          <div className="flex items-center space-x-2">
            {selectedCountries.length > 0 && (
              <span className="text-xs text-gray-500">
                {selectedCountries.length} selected
              </span>
            )}
            <button
              onClick={handleSelectAll}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-600 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {availableCountries.map(countryCode => {
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
      </div>
    </div>
  )
}