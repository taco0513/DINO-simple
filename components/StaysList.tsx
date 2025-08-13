'use client'

import { useState } from 'react'
import { Stay } from '@/lib/types'
import { useSupabaseStore } from '@/lib/supabase-store'
import { countries } from '@/lib/countries'
import EditStayModal from './EditStayModal'

export default function StaysList() {
  const { stays, deleteStay } = useSupabaseStore()
  const [editingStay, setEditingStay] = useState<Stay | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteStay(id)
    }
  }

  const sortedStays = [...stays].sort((a, b) => 
    new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  )

  if (stays.length === 0) return null

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-100">
          {sortedStays.map((stay) => {
            const country = countries.find(c => c.code === stay.countryCode)
            const fromCountry = stay.fromCountryCode ? countries.find(c => c.code === stay.fromCountryCode) : null
            
            return (
              <div key={stay.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{country?.flag}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">
                        {country?.name}
                        {stay.city && <span className="text-gray-600"> ({stay.city})</span>}
                        {!stay.exitDate && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            현재 체류 중
                          </span>
                        )}
                      </p>
                    </div>
                    {fromCountry && (
                      <p className="text-xs text-gray-500 mb-1">
                        From: {fromCountry.flag} {fromCountry.name}
                        {stay.fromCity && <span> ({stay.fromCity})</span>}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {stay.entryDate} ~ {stay.exitDate || '현재'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingStay(stay)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(stay.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    삭제
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {editingStay && (
        <EditStayModal
          stay={editingStay}
          onClose={() => setEditingStay(null)}
        />
      )}
    </>
  )
}