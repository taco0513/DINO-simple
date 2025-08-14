'use client'

import { useSupabaseStore } from '@/lib/supabase-store'
import { differenceInDays, parseISO, startOfYear, endOfYear } from 'date-fns'
import { countries } from '@/lib/countries'

export default function StatsCards() {
  const { stays } = useSupabaseStore()
  
  // Number of countries visited
  const visitedCountries = [...new Set(stays.map(s => s.countryCode))].length
  
  // Calculate days traveled this year
  const currentYear = new Date().getFullYear()
  const yearStart = startOfYear(new Date())
  const yearEnd = endOfYear(new Date())
  
  const thisYearDays = stays.reduce((total, stay) => {
    const entryDate = parseISO(stay.entryDate)
    const exitDate = stay.exitDate ? parseISO(stay.exitDate) : new Date()
    
    // Calculate only the overlapping period in this year
    const overlapStart = entryDate < yearStart ? yearStart : entryDate
    const overlapEnd = exitDate > yearEnd ? yearEnd : exitDate
    
    if (overlapStart <= overlapEnd && overlapStart.getFullYear() === currentYear) {
      return total + differenceInDays(overlapEnd, overlapStart) + 1
    }
    return total
  }, 0)
  
  // Currently staying in country
  const currentStay = stays.find(s => !s.exitDate)
  const currentCountry = currentStay 
    ? countries.find(c => c.code === currentStay.countryCode)
    : null
  const daysInCurrentCountry = currentStay
    ? differenceInDays(new Date(), parseISO(currentStay.entryDate)) + 1
    : 0
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      {/* 방문 국가 수 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">Countries Visited</p>
            <p className="text-lg md:text-2xl font-bold">{visitedCountries} countries</p>
          </div>
          <div className="text-xl md:text-3xl opacity-50">🌍</div>
        </div>
      </div>
      
      {/* Days traveled this year */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">{currentYear} Travel</p>
            <p className="text-lg md:text-2xl font-bold">{thisYearDays} days</p>
          </div>
          <div className="text-xl md:text-3xl opacity-50">📅</div>
        </div>
      </div>
      
      {/* Currently staying */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">Current Stay</p>
            {currentCountry ? (
              <div>
                <p className="text-sm md:text-lg font-bold">
                  {currentCountry.flag} {currentCountry.name}
                </p>
                <p className="text-xs text-blue-600">Day {daysInCurrentCountry}</p>
              </div>
            ) : (
              <p className="text-sm md:text-lg text-gray-400">Not traveling</p>
            )}
          </div>
          <div className="text-xl md:text-3xl opacity-50">📍</div>
        </div>
      </div>
    </div>
  )
}