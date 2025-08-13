'use client'

import { useSupabaseStore } from '@/lib/supabase-store'
import { differenceInDays, parseISO, startOfYear, endOfYear } from 'date-fns'
import { countries } from '@/lib/countries'

export default function StatsCards() {
  const { stays } = useSupabaseStore()
  
  // 총 여행일수 계산
  const totalTravelDays = stays.reduce((total, stay) => {
    const entryDate = parseISO(stay.entryDate)
    const exitDate = stay.exitDate ? parseISO(stay.exitDate) : new Date()
    return total + differenceInDays(exitDate, entryDate) + 1
  }, 0)
  
  // 방문한 국가 수
  const visitedCountries = [...new Set(stays.map(s => s.countryCode))].length
  
  // 올해 여행일수 계산
  const currentYear = new Date().getFullYear()
  const yearStart = startOfYear(new Date())
  const yearEnd = endOfYear(new Date())
  
  const thisYearDays = stays.reduce((total, stay) => {
    const entryDate = parseISO(stay.entryDate)
    const exitDate = stay.exitDate ? parseISO(stay.exitDate) : new Date()
    
    // 올해에 겹치는 기간만 계산
    const overlapStart = entryDate < yearStart ? yearStart : entryDate
    const overlapEnd = exitDate > yearEnd ? yearEnd : exitDate
    
    if (overlapStart <= overlapEnd && overlapStart.getFullYear() === currentYear) {
      return total + differenceInDays(overlapEnd, overlapStart) + 1
    }
    return total
  }, 0)
  
  // 현재 체류 중인 국가
  const currentStay = stays.find(s => !s.exitDate)
  const currentCountry = currentStay 
    ? countries.find(c => c.code === currentStay.countryCode)
    : null
  const daysInCurrentCountry = currentStay
    ? differenceInDays(new Date(), parseISO(currentStay.entryDate)) + 1
    : 0
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {/* 총 여행일수 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">총 여행일수</p>
            <p className="text-lg md:text-2xl font-bold">{totalTravelDays}일</p>
          </div>
          <div className="text-xl md:text-3xl opacity-50">✈️</div>
        </div>
      </div>
      
      {/* 방문 국가 수 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">방문한 국가</p>
            <p className="text-lg md:text-2xl font-bold">{visitedCountries}개국</p>
          </div>
          <div className="text-xl md:text-3xl opacity-50">🌍</div>
        </div>
      </div>
      
      {/* 올해 여행일수 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">{currentYear}년 여행</p>
            <p className="text-lg md:text-2xl font-bold">{thisYearDays}일</p>
          </div>
          <div className="text-xl md:text-3xl opacity-50">📅</div>
        </div>
      </div>
      
      {/* 현재 체류 중 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">현재 체류</p>
            {currentCountry ? (
              <div>
                <p className="text-sm md:text-lg font-bold">
                  {currentCountry.flag} {currentCountry.name}
                </p>
                <p className="text-xs text-blue-600">{daysInCurrentCountry}일째</p>
              </div>
            ) : (
              <p className="text-sm md:text-lg text-gray-400">여행 중 아님</p>
            )}
          </div>
          <div className="text-xl md:text-3xl opacity-50">📍</div>
        </div>
      </div>
    </div>
  )
}