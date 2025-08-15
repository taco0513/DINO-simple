'use client'

import { useState } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { countries } from '@/lib/countries'

interface QuickVisitModalProps {
  isOpen: boolean
  countryCode: string | null
  onClose: () => void
  onSuccess: () => void
}

export default function QuickVisitModal({ isOpen, countryCode, onClose, onSuccess }: QuickVisitModalProps) {
  const [loading, setLoading] = useState(false)
  const { addStay } = useSupabaseStore()
  
  const country = countryCode ? countries.find(c => c.code === countryCode) : null
  
  if (!isOpen || !country || !countryCode) return null

  const handleQuickAdd = async () => {
    setLoading(true)
    
    try {
      // 대략적인 과거 날짜 사용 (1년 전)
      const pastDate = new Date()
      pastDate.setFullYear(pastDate.getFullYear() - 1)
      const entryDate = pastDate.toISOString().split('T')[0]
      
      // 7일 후를 exit date로 설정
      const exitDate = new Date(pastDate)
      exitDate.setDate(exitDate.getDate() + 7)
      const exitDateStr = exitDate.toISOString().split('T')[0]
      
      await addStay({
        id: crypto.randomUUID(),
        countryCode: countryCode,
        city: 'Unknown',
        entryDate: entryDate,
        exitDate: exitDateStr,
        visaType: 'Tourist',
        notes: 'Quick visit marker - dates are approximate'
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to add quick visit:', error)
    } finally {
      setLoading(false)
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
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Visit Marker
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Country Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl">{country.flag}</span>
              <div>
                <h4 className="font-semibold text-gray-900">{country.name}</h4>
                <p className="text-sm text-gray-500">Mark as visited</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>💡 Quick Marker:</strong> This will add a general "visited" record for countries where you don't remember exact dates. 
                Perfect for old travels!
              </p>
            </div>
          </div>

          {/* What gets added */}
          <div className="mb-6">
            <h5 className="font-medium text-gray-700 mb-2">What will be recorded:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Country: <strong>{country.name}</strong></li>
              <li>• Duration: <strong>~7 days</strong> (approximate)</li>
              <li>• Date: <strong>~1 year ago</strong> (placeholder)</li>
              <li>• Note: <strong>"Quick visit marker"</strong></li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <span className="mr-2">🗺️</span>
                  Mark as Visited
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}