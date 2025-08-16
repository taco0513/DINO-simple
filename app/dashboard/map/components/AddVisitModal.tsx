'use client'

import { useState, useEffect } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { countries } from '@/lib/countries'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface AddVisitModalProps {
  isOpen: boolean
  countryCode: string | null
  onClose: () => void
  onSuccess: () => void
}

export default function AddVisitModal({ isOpen, countryCode, onClose, onSuccess }: AddVisitModalProps) {
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [city, setCity] = useState('')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString())
  
  const { stays, addStay, deleteStay, loadStays } = useSupabaseStore()
  
  const country = countryCode ? countries.find(c => c.code === countryCode) : null
  const existingStays = stays.filter(s => s.countryCode === countryCode)
  const existingCities = [...new Set(existingStays.map(s => s.city).filter(c => c))]
  
  // Month names for dropdown
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]
  
  // Generate year options (last 50 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCity('')
      setYear(new Date().getFullYear().toString())
      setMonth((new Date().getMonth() + 1).toString())
    }
  }, [isOpen])
  
  if (!isOpen || !country || !countryCode) return null

  const handleAdd = async () => {
    setLoading(true)
    
    try {
      // Create approximate dates based on year and month
      const entryDate = `${year}-${month.padStart(2, '0')}-01`
      const exitDate = `${year}-${month.padStart(2, '0')}-07` // Assume 1 week stay
      
      await addStay({
        id: crypto.randomUUID(),
        countryCode: countryCode,
        city: city.trim() || country.name, // If no city, use country name
        entryDate: entryDate,
        exitDate: exitDate,
        visaType: 'visa-free',
        notes: city.trim() ? undefined : 'Country visit - city not specified'
      })
      
      await loadStays()
      onSuccess()
      
      // Show success toast
      if (city.trim()) {
        toast.success(`Added ${city} to ${country.name}!`, {
          icon: '📍',
        })
        setCity('')
      } else {
        toast.success(`${country.name} marked as visited!`, {
          icon: '✈️',
        })
        // If just marking country as visited, close modal
        onClose()
      }
    } catch (error) {
      console.error('Failed to add visit:', error)
      toast.error('Failed to add visit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (stayId: string) => {
    if (!confirm('Are you sure you want to delete this visit?')) return
    
    setDeletingId(stayId)
    try {
      await deleteStay(stayId)
      await loadStays()
      onSuccess()
      
      toast.success('Visit deleted successfully', {
        icon: '🗑️',
      })
      
      // If no more stays for this country, close modal
      if (existingStays.length === 1) {
        onClose()
      }
    } catch (error) {
      console.error('Failed to delete visit:', error)
      toast.error('Failed to delete visit. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{country.flag}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {country.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {existingCities.length > 0 
                      ? `Add more cities (${existingCities.length} visited)`
                      : 'Add your visit'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Existing Visits */}
            {existingStays.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-700 mb-2">Travel History</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {existingStays
                    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
                    .map((stay) => (
                      <div key={stay.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 group">
                        <div className="flex items-center space-x-2 text-xs">
                          <span>📍</span>
                          <span className="font-medium">{stay.city}</span>
                          <span className="text-gray-500">
                            {format(new Date(stay.entryDate), 'MMM yyyy')}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(stay.id!)}
                          disabled={deletingId === stay.id}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all p-1"
                          title="Delete this visit"
                        >
                          {deletingId === stay.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Simple Form */}
            <div className="space-y-4">
              {/* City (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-xs text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Leave empty to just mark country as visited"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Year and Month */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  💡 <strong>Tip:</strong> Leave city empty to just mark the country as visited, 
                  or add specific cities you remember visiting.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  {city.trim() ? 'Add City' : 'Mark as Visited'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}