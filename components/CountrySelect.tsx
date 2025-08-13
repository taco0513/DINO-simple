'use client'

import { useState, useRef, useEffect } from 'react'
import { countries } from '@/lib/countries'

interface CountrySelectProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
}

export default function CountrySelect({ value, onChange, required, placeholder = "Select a country" }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const selectedCountry = countries.find(c => c.code === value)
  
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  )
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSelect = (countryCode: string) => {
    onChange(countryCode)
    setIsOpen(false)
    setSearch('')
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer bg-white"
      >
        {selectedCountry ? (
          <span>{selectedCountry.flag} {selectedCountry.name}</span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <div
                  key={country.code}
                  onClick={() => handleSelect(country.code)}
                  className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                    country.code === value ? 'bg-blue-50' : ''
                  }`}
                >
                  {country.flag} {country.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}