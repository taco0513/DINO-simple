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
        className="w-full h-12 px-4 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white flex items-center justify-between"
      >
        <span>
          {selectedCountry ? (
            <span>{selectedCountry.flag} {selectedCountry.name}</span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-72 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search countries..."
              className="w-full h-10 px-3 text-16px border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-56">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <div
                  key={country.code}
                  onClick={() => handleSelect(country.code)}
                  className={`px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors min-h-[44px] flex items-center ${
                    country.code === value ? 'bg-blue-50 text-blue-900' : ''
                  }`}
                >
                  <span className="text-lg mr-3">{country.flag}</span>
                  <span className="text-16px">{country.name}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-gray-500 text-center">
                No countries found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}