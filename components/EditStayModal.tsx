'use client'

import { useState, useEffect } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { Stay } from '@/lib/types'
import CountrySelect from './CountrySelect'
import { findAirportByCode, isLikelyAirportCode, getAirportDisplay } from '@/lib/airport-codes'

interface EditStayModalProps {
  stay: Stay
  onClose: () => void
}

export default function EditStayModal({ stay, onClose }: EditStayModalProps) {
  const { updateStay } = useSupabaseStore()
  
  const [formData, setFormData] = useState({
    countryCode: stay.countryCode,
    city: stay.city || '',
    fromCountryCode: stay.fromCountryCode || '',
    fromCity: stay.fromCity || '',
    entryDate: stay.entryDate,
    exitDate: stay.exitDate || '',
    visaType: stay.visaType || 'visa-free',
    notes: stay.notes || '',
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
    
    const updateData = {
      countryCode: formData.countryCode,
      city: processedCity || undefined,
      fromCountryCode: formData.fromCountryCode || undefined,
      fromCity: processedFromCity || undefined,
      entryDate: formData.entryDate,
      exitDate: formData.exitDate || undefined,
      visaType: formData.visaType,
      notes: formData.notes || undefined,
    }
    
    await updateStay(stay.id, updateData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Stay Record</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From Location */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">From (Departure)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Country
                </label>
                <CountrySelect
                  value={formData.fromCountryCode}
                  onChange={(value) => setFormData({ ...formData, fromCountryCode: value })}
                  placeholder="Select country"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  City (or Airport Code)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.fromCity}
                    onChange={(e) => setFormData({ ...formData, fromCity: e.target.value.toUpperCase() })}
                    placeholder="e.g. Bangkok, BKK"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {fromCityDisplay && (
                    <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 z-10">
                      ✈️ {fromCityDisplay}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* To Location */}
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">To (Arrival)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Country *
                </label>
                <CountrySelect
                  value={formData.countryCode}
                  onChange={(value) => setFormData({ ...formData, countryCode: value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  City (or Airport Code)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value.toUpperCase() })}
                    placeholder="e.g. Chiang Mai, CNX"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {cityDisplay && (
                    <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 z-10">
                      ✈️ {cityDisplay}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Date
              </label>
              <input
                type="date"
                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exit Date
              </label>
              <input
                type="date"
                value={formData.exitDate}
                onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visa Type
            </label>
            <select
              value={formData.visaType}
              onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}