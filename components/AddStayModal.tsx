'use client'

import { useState, useEffect } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import CountrySelect from './CountrySelect'
import { findAirportByCode, isLikelyAirportCode, getAirportDisplay } from '@/lib/airport-codes'
import { generateApproximateDates, durationOptions } from '@/lib/memory-utils'
import toast from 'react-hot-toast'

interface AddStayModalProps {
  onClose: () => void
}

export default function AddStayModal({ onClose }: AddStayModalProps) {
  const { addStay } = useSupabaseStore()
  const [isMemoryMode, setIsMemoryMode] = useState(false)
  const [formData, setFormData] = useState({
    countryCode: '',
    city: '',
    fromCountryCode: '',
    fromCity: '',
    entryDate: '',
    exitDate: '',
    visaType: 'visa-free',
    notes: '',
  })
  const [memoryData, setMemoryData] = useState({
    year: new Date().getFullYear().toString(),
    month: '',
    approximateDuration: 7,
    highlights: ''
  })
  const [cityDisplay, setCityDisplay] = useState('')
  const [fromCityDisplay, setFromCityDisplay] = useState('')

  // Handle airport code recognition for "To" city
  useEffect(() => {
    if (isLikelyAirportCode(formData.city)) {
      const airport = findAirportByCode(formData.city)
      if (airport) {
        setCityDisplay(getAirportDisplay(airport))
        // Auto-select country if airport code is recognized
        if (formData.countryCode === '') {
          setFormData(prev => ({ ...prev, countryCode: airport.countryCode }))
        }
      } else {
        setCityDisplay('')
      }
    } else {
      setCityDisplay('')
    }
  }, [formData.city])

  // Handle airport code recognition for "From" city
  useEffect(() => {
    if (isLikelyAirportCode(formData.fromCity)) {
      const airport = findAirportByCode(formData.fromCity)
      if (airport) {
        setFromCityDisplay(getAirportDisplay(airport))
        // Auto-select country if airport code is recognized
        if (formData.fromCountryCode === '') {
          setFormData(prev => ({ ...prev, fromCountryCode: airport.countryCode }))
        }
      } else {
        setFromCityDisplay('')
      }
    } else {
      setFromCityDisplay('')
    }
  }, [formData.fromCity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Handle memory mode date generation
    let entryDate = formData.entryDate
    let exitDate = formData.exitDate
    let dateAccuracy: 'exact' | 'month' | 'year' = 'exact'
    
    if (isMemoryMode) {
      const dates = generateApproximateDates({
        year: parseInt(memoryData.year),
        month: memoryData.month ? parseInt(memoryData.month) : undefined,
        approximateDuration: memoryData.approximateDuration
      })
      entryDate = dates.entryDate
      exitDate = dates.exitDate
      dateAccuracy = memoryData.month ? 'month' : 'year'
    }
    
    // Process city fields - if it's an airport code, save the city name
    let processedCity = formData.city
    let processedFromCity = formData.fromCity
    
    if (processedCity && isLikelyAirportCode(processedCity)) {
      const airport = findAirportByCode(processedCity)
      if (airport) {
        processedCity = `${airport.city} (${processedCity.toUpperCase()})`
      }
    }
    
    if (processedFromCity && isLikelyAirportCode(processedFromCity)) {
      const airport = findAirportByCode(processedFromCity)
      if (airport) {
        processedFromCity = `${airport.city} (${processedFromCity.toUpperCase()})`
      }
    }
    
    // Generate unique ID with timestamp + random number
    const newStay = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      countryCode: formData.countryCode,
      city: processedCity || undefined,
      fromCountryCode: isMemoryMode ? undefined : (formData.fromCountryCode || undefined),
      fromCity: isMemoryMode ? undefined : (processedFromCity || undefined),
      entryDate: entryDate,
      exitDate: exitDate || undefined,
      visaType: isMemoryMode ? 'memory' : (formData.visaType || 'visa-free'),
      notes: formData.notes || undefined,
      // Memory mode fields
      isMemory: isMemoryMode || undefined,
      dateAccuracy: isMemoryMode ? dateAccuracy : undefined,
      yearVisited: isMemoryMode ? parseInt(memoryData.year) : undefined,
      monthVisited: isMemoryMode && memoryData.month ? parseInt(memoryData.month) : undefined,
      approximateDuration: isMemoryMode ? memoryData.approximateDuration : undefined,
      tripHighlights: isMemoryMode && memoryData.highlights ? 
        memoryData.highlights.split(',').map(h => h.trim()).filter(h => h) : undefined
    }
    
    try {
      await addStay(newStay)
      
      // Show success toast
      if (isMemoryMode) {
        toast.success(`Travel memory added for ${memoryData.year}!`, {
          icon: '🗓️',
        })
      } else {
        toast.success(`Stay in ${processedCity || 'this location'} added!`, {
          icon: '✈️',
        })
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to add stay:', error)
      toast.error('Failed to add stay. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl sm:rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">
              {isMemoryMode ? 'Add Travel Memory' : 'Add Stay Record'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setIsMemoryMode(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isMemoryMode 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📅 Exact Dates
            </button>
            <button
              type="button"
              onClick={() => setIsMemoryMode(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isMemoryMode 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🕰️ Memory Mode
            </button>
          </div>

          {/* Memory Mode Date Selection */}
          {isMemoryMode ? (
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">When did you visit?</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      value={memoryData.year}
                      onChange={(e) => setMemoryData({ ...memoryData, year: e.target.value })}
                      className="w-full h-12 px-4 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month (if remembered)
                    </label>
                    <select
                      value={memoryData.month}
                      onChange={(e) => setMemoryData({ ...memoryData, month: e.target.value })}
                      className="w-full h-12 px-4 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    >
                      <option value="">Not sure</option>
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How long approximately?
                  </label>
                  <select
                    value={memoryData.approximateDuration}
                    onChange={(e) => setMemoryData({ ...memoryData, approximateDuration: parseInt(e.target.value) })}
                    className="w-full h-12 px-4 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    {durationOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>
          ) : (
            /* From Location for exact dates mode */
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">From (Departure)</h3>
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <CountrySelect
                  value={formData.fromCountryCode}
                  onChange={(value) => setFormData({ ...formData, fromCountryCode: value })}
                  placeholder="Select country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City (or Airport Code)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.fromCity}
                    onChange={(e) => setFormData({ ...formData, fromCity: e.target.value.toUpperCase() })}
                    placeholder="e.g. Bangkok, BKK"
                    className="w-full h-12 px-4 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {fromCityDisplay && (
                    <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                      ✈️ {fromCityDisplay}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* To Location */}
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">To (Arrival)</h3>
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <CountrySelect
                  value={formData.countryCode}
                  onChange={(value) => setFormData({ ...formData, countryCode: value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City (or Airport Code)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value.toUpperCase() })}
                    placeholder="e.g. Chiang Mai, CNX"
                    className="w-full h-12 px-4 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {cityDisplay && (
                    <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                      ✈️ {cityDisplay}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!isMemoryMode && (
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Date *
                </label>
                <input
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                  className="w-full h-12 px-4 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={!isMemoryMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exit Date
                </label>
                <input
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                  className="w-full h-12 px-4 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {!isMemoryMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visa Type
              </label>
              <select
                value={formData.visaType}
                onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                className="w-full h-12 px-4 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="visa-free">Visa Free</option>
                <option value="tourist">Tourist Visa</option>
                <option value="business">Business Visa</option>
                <option value="e-visa">E-Visa</option>
                {formData.countryCode === 'KR' && (
                  <option value="183/365">183/365 (Special Resident)</option>
                )}
              </select>
            </div>
          )}

          {isMemoryMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Highlights (Optional)
              </label>
              <textarea
                value={memoryData.highlights}
                onChange={(e) => setMemoryData({ ...memoryData, highlights: e.target.value })}
                className="w-full px-4 py-3 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows={3}
                placeholder="Memorable moments, places visited, people met... (comma-separated)"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Add any additional notes about your stay..."
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-12 px-6 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`w-full sm:w-auto h-12 px-6 text-white rounded-lg font-medium transition-colors ${
                isMemoryMode 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isMemoryMode ? 'Add Memory' : 'Add Stay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}