'use client'

import { useState, useEffect, useRef } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { countries } from '@/lib/countries'

interface AddTravelModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface TravelForm {
  countryCode: string
  city: string
  year: string
  entryDate: string
  exitDate: string
  notes: string
}

interface CountrySearchState {
  query: string
  isOpen: boolean
  filteredCountries: typeof countries
}

export default function AddTravelModal({ isOpen, onClose, onSuccess }: AddTravelModalProps) {
  const [loading, setLoading] = useState(false)
  const { addStay } = useSupabaseStore()
  const countryInputRef = useRef<HTMLDivElement>(null)
  
  const [form, setForm] = useState<TravelForm>({
    countryCode: '',
    city: '',
    year: '',
    entryDate: '',
    exitDate: '',
    notes: ''
  })

  const [countrySearch, setCountrySearch] = useState<CountrySearchState>({
    query: '',
    isOpen: false,
    filteredCountries: countries.sort((a, b) => a.name.localeCompare(b.name))
  })

  // Filter countries based on search query
  const filterCountries = (query: string) => {
    if (!query.trim()) {
      return countries.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    return countries
      .filter(country => 
        country.name.toLowerCase().includes(query.toLowerCase()) ||
        country.code.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const handleCountrySearch = (query: string) => {
    const filtered = filterCountries(query)
    
    // Auto-select if there's an exact match
    const exactMatch = countries.find(c => 
      c.name.toLowerCase() === query.toLowerCase()
    )
    
    if (exactMatch) {
      console.log('Auto-selecting country:', exactMatch.name, exactMatch.code)
      setForm(prev => ({ ...prev, countryCode: exactMatch.code }))
    } else if (query.trim() === '') {
      // Only clear if query is completely empty
      setForm(prev => ({ ...prev, countryCode: '' }))
    }
    // Don't clear selection if partial match - let user keep typing
    
    setCountrySearch(prev => ({
      ...prev,
      query,
      filteredCountries: filtered,
      isOpen: query.length > 0 || filtered.length < 10 // Show dropdown if searching or few results
    }))
  }

  const selectCountry = (country: typeof countries[0]) => {
    setForm(prev => ({ ...prev, countryCode: country.code }))
    setCountrySearch(prev => ({
      ...prev,
      query: country.name,
      isOpen: false
    }))
  }

  const clearCountrySelection = () => {
    setForm(prev => ({ ...prev, countryCode: '' }))
    setCountrySearch(prev => ({
      ...prev,
      query: '',
      isOpen: false,
      filteredCountries: countries.sort((a, b) => a.name.localeCompare(b.name))
    }))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryInputRef.current && !countryInputRef.current.contains(event.target as Node)) {
        setCountrySearch(prev => ({ ...prev, isOpen: false }))
      }
    }

    if (countrySearch.isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [countrySearch.isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 Submit button clicked!')
    e.preventDefault()
    
    let countryCode = form.countryCode
    console.log('Initial countryCode:', countryCode)
    
    // If no country code but we have a search query, try to match it
    if (!countryCode && countrySearch.query) {
      const matchedCountry = countries.find(c => 
        c.name.toLowerCase() === countrySearch.query.toLowerCase()
      )
      if (matchedCountry) {
        countryCode = matchedCountry.code
        console.log('Matched country from query:', countryCode)
      }
    }
    
    if (!countryCode) {
      console.error('❌ No country code found!')
      alert('Please select a country first')
      return
    }
    
    console.log('✅ Starting submission with countryCode:', countryCode)
    setLoading(true)
    
    try {
      let entryDate = form.entryDate
      let exitDate = form.exitDate
      
      // 만약 연도만 입력했다면 해당 연도의 임의 날짜 생성
      if (form.year && !form.entryDate) {
        const yearNum = parseInt(form.year)
        if (!isNaN(yearNum)) {
          const randomMonth = Math.floor(Math.random() * 12) + 1
          const randomDay = Math.floor(Math.random() * 28) + 1
          entryDate = `${yearNum}-${randomMonth.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')}`
          
          // 7일 후를 exit date로
          const exit = new Date(entryDate)
          exit.setDate(exit.getDate() + 7)
          exitDate = exit.toISOString().split('T')[0]
        }
      }
      
      // 최소한 entryDate는 있어야 함
      if (!entryDate) {
        // 기본값으로 1년 전 사용
        const pastDate = new Date()
        pastDate.setFullYear(pastDate.getFullYear() - 1)
        entryDate = pastDate.toISOString().split('T')[0]
        
        const exit = new Date(entryDate)
        exit.setDate(exit.getDate() + 7)
        exitDate = exit.toISOString().split('T')[0]
      }

      console.log('📤 Calling addStay with:', {
        countryCode: countryCode,
        city: form.city || 'Unknown',
        entryDate: entryDate,
        exitDate: exitDate || undefined,
        visaType: 'Tourist',
        notes: form.notes || 'Added via travel history'
      })

      await addStay({
        id: crypto.randomUUID(),
        countryCode: countryCode,
        city: form.city || 'Unknown',
        entryDate: entryDate,
        exitDate: exitDate || undefined,
        visaType: 'Tourist',
        notes: form.notes || 'Added via travel history'
      })
      
      console.log('✅ Successfully added travel record!')
      
      // 폼 리셋
      setForm({
        countryCode: '',
        city: '',
        year: '',
        entryDate: '',
        exitDate: '',
        notes: ''
      })
      
      alert('Travel history added successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('❌ Failed to add travel record:', error)
      alert('Failed to add travel record: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const selectedCountry = form.countryCode ? countries.find(c => c.code === form.countryCode) : null
  
  // Force country selection when India is shown but not selected
  useEffect(() => {
    if (countrySearch.query === 'India' && !form.countryCode) {
      const indiaCountry = countries.find(c => c.name === 'India')
      if (indiaCountry) {
        console.log('Force selecting India')
        setForm(prev => ({ ...prev, countryCode: indiaCountry.code }))
      }
    }
  }, [countrySearch.query, form.countryCode])

  // Debug button state
  const isButtonDisabled = loading || !form.countryCode
  console.log('Button debug:', { 
    loading, 
    countryCode: form.countryCode, 
    isButtonDisabled,
    selectedCountryName: selectedCountry?.name,
    query: countrySearch.query 
  })

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                ✈️ Add Travel History
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Country Selection */}
              <div className="relative" ref={countryInputRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={countrySearch.query}
                    onChange={(e) => handleCountrySearch(e.target.value)}
                    onFocus={() => setCountrySearch(prev => ({ ...prev, isOpen: true }))}
                    placeholder="Type to search countries..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                  />
                  
                  {/* Clear button */}
                  {countrySearch.query && (
                    <button
                      type="button"
                      onClick={clearCountrySelection}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Dropdown */}
                  {countrySearch.isOpen && countrySearch.filteredCountries.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {countrySearch.filteredCountries.slice(0, 10).map(country => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => selectCountry(country)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center space-x-2"
                        >
                          <span className="text-lg">{country.flag}</span>
                          <span>{country.name}</span>
                          <span className="text-xs text-gray-400">({country.code})</span>
                        </button>
                      ))}
                      
                      {countrySearch.filteredCountries.length > 10 && (
                        <div className="px-3 py-2 text-xs text-gray-500 border-t">
                          Showing first 10 results. Type to narrow down...
                        </div>
                      )}
                      
                      {countrySearch.query && countrySearch.filteredCountries.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No countries found for "{countrySearch.query}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Selected country preview */}
                {selectedCountry && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{selectedCountry.flag}</span>
                        <span className="font-medium text-blue-900">{selectedCountry.name}</span>
                        <span className="text-sm text-blue-600">({selectedCountry.code})</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearCountrySelection}
                        className="text-blue-400 hover:text-blue-600 text-sm"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Manual fix button for India */}
                {countrySearch.query === 'India' && !form.countryCode && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">India not selected automatically</span>
                      <button
                        type="button"
                        onClick={() => {
                          const india = countries.find(c => c.name === 'India')
                          if (india) {
                            setForm(prev => ({ ...prev, countryCode: india.code }))
                          }
                        }}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                      >
                        Fix
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City (Optional)
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g., Seoul, Tokyo, Paris..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Date Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Year Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year (if you remember)
                  </label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="2023"
                    min="1980"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="text-center flex items-center justify-center text-gray-400 text-sm">
                  OR use exact dates below
                </div>
              </div>

              {/* Exact Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entry Date
                  </label>
                  <input
                    type="date"
                    value={form.entryDate}
                    onChange={(e) => setForm(prev => ({ ...prev, entryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exit Date
                  </label>
                  <input
                    type="date"
                    value={form.exitDate}
                    onChange={(e) => setForm(prev => ({ ...prev, exitDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any memories or details you want to remember..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>💡 Tip:</strong> Don't worry about exact dates! You can just enter the year, 
                  or leave it blank for a general "visited" record. Perfect for old travels where you 
                  don't remember the details.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex space-x-3 p-6 border-t bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={false}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                title={!form.countryCode ? "Please select a country first" : ""}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🗺️</span>
                    Add to My Travels
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}