'use client'

import { useSupabaseStore } from '@/lib/supabase-store'
import { differenceInDays, parseISO, startOfYear, endOfYear } from 'date-fns'
import { countries } from '@/lib/countries'

export default function StatsCards() {
  const { stays } = useSupabaseStore()
  
  // Number of countries visited
  const visitedCountries = [...new Set(stays.map(s => s.countryCode))].length
  
  // Calculate days traveled this year (from Jan 1 to today)
  const currentYear = new Date().getFullYear()
  const yearStart = new Date(currentYear, 0, 1) // January 1st of current year
  const today = new Date()
  
  const thisYearDays = stays
    .filter(stay => {
      // Include any stay that overlaps with the current year
      const entryDate = new Date(stay.entryDate)
      const exitDate = stay.exitDate ? new Date(stay.exitDate) : today
      
      // Check if the stay overlaps with the current year (from Jan 1 to today)
      return exitDate >= yearStart && entryDate <= today
    })
    .reduce((total, stay) => {
      const entryDate = new Date(stay.entryDate)
      const exitDate = stay.exitDate ? new Date(stay.exitDate) : today
      
      // Calculate the overlap with the current year
      const effectiveStart = entryDate > yearStart ? entryDate : yearStart
      const effectiveEnd = exitDate < today ? exitDate : today
      
      // Only count if there's a valid overlap
      if (effectiveEnd >= effectiveStart) {
        const msPerDay = 1000 * 60 * 60 * 24
        const daysDiff = Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / msPerDay)
        const days = daysDiff + 1 // Add 1 to include both start and end dates
        return total + days
      }
      return total
    }, 0)
  
  // Currently staying in country (including stays with exit dates that haven't passed yet)
  const currentStay = stays.find(s => {
    const entryDate = new Date(s.entryDate)
    const exitDate = s.exitDate ? new Date(s.exitDate) : null
    
    // Check if today is between entry and exit dates
    if (entryDate <= today) {
      if (!exitDate) {
        // No exit date means ongoing
        return true
      } else if (exitDate >= today) {
        // Exit date is in the future or today
        return true
      }
    }
    return false
  })
  
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