'use client'

import { useState } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { Stay } from '@/lib/types'
import CountrySelect from './CountrySelect'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const updateData = {
      countryCode: formData.countryCode,
      city: formData.city || undefined,
      fromCountryCode: formData.fromCountryCode || undefined,
      fromCity: formData.fromCity || undefined,
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
        <h2 className="text-xl font-semibold mb-4">체류 기록 수정</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From Location */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">From (출발지)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Country/나라
                </label>
                <CountrySelect
                  value={formData.fromCountryCode}
                  onChange={(value) => setFormData({ ...formData, fromCountryCode: value })}
                  placeholder="Select country"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  City/도시 (or Airport Code)
                </label>
                <input
                  type="text"
                  value={formData.fromCity}
                  onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
                  placeholder="e.g. Bangkok, BKK"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* To Location */}
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">To (도착지)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Country/나라 *
                </label>
                <CountrySelect
                  value={formData.countryCode}
                  onChange={(value) => setFormData({ ...formData, countryCode: value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  City/도시 (or Airport Code)
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Chiang Mai, CNX"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                입국일
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
                출국일
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
              비자 타입
            </label>
            <select
              value={formData.visaType}
              onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="visa-free">무비자</option>
              <option value="tourist">관광비자</option>
              <option value="business">비즈니스비자</option>
              <option value="e-visa">전자비자</option>
              {formData.countryCode === 'KR' && (
                <option value="183/365">183/365 (특별 거주)</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모 (선택)
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
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}