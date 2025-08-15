'use client'

import { useState } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import CountrySelect from './CountrySelect'

interface AddStayModalProps {
  onClose: () => void
}

export default function AddStayModal({ onClose }: AddStayModalProps) {
  const { addStay } = useSupabaseStore()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Generate unique ID with timestamp + random number
    const newStay = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      countryCode: formData.countryCode,
      city: formData.city || undefined,
      fromCountryCode: formData.fromCountryCode || undefined,
      fromCity: formData.fromCity || undefined,
      entryDate: formData.entryDate,
      exitDate: formData.exitDate || undefined,
      visaType: formData.visaType || 'visa-free',
      notes: formData.notes || undefined,
    }
    
    await addStay(newStay)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl sm:rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Add Stay Record</h2>
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
          {/* From Location */}
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
                <input
                  type="text"
                  value={formData.fromCity}
                  onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
                  placeholder="e.g. Bangkok, BKK"
                  className="w-full h-12 px-4 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

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
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Chiang Mai, CNX"
                  className="w-full h-12 px-4 text-16px border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

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
                required
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
              className="w-full sm:w-auto h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Add Stay
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}