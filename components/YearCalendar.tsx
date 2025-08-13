'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { countries } from '@/lib/countries'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfYear,
  isSameMonth,
  isSameDay,
  parseISO,
  isWithinInterval,
  subDays,
  differenceInDays,
} from 'date-fns'

interface YearCalendarProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  selectedCountries: string[]
}

export default function YearCalendar({ currentDate, onDateChange, selectedCountries }: YearCalendarProps) {
  const { stays, loadStays } = useStore()
  const [showKoreaWindow, setShowKoreaWindow] = useState(false)
  

  useEffect(() => {
    loadStays()
  }, [loadStays])

  // Check if there are any Korea stays with 183/365 visa
  const hasKoreaSpecialVisa = stays.some(s => s.countryCode === 'KR' && s.visaType === '183/365')

  // Calculate 365-day window from today
  const today = new Date()
  const windowStart = subDays(today, 364) // 365 days including today
  const windowEnd = today

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  
  const navigatePrevious = () => onDateChange(subMonths(currentDate, 1))
  const navigateNext = () => onDateChange(addMonths(currentDate, 1))
  const navigateToday = () => onDateChange(new Date())

  // Check if a date is within the 365-day rolling window
  const isInRollingWindow = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const startStr = format(windowStart, 'yyyy-MM-dd')
    const endStr = format(windowEnd, 'yyyy-MM-dd')
    return dateStr >= startStr && dateStr <= endStr
  }

  // Get Korea stays within the rolling window
  const getKoreaStaysInWindow = () => {
    return stays.filter(stay => {
      if (stay.countryCode !== 'KR' || stay.visaType !== '183/365') return false
      const entryDate = parseISO(stay.entryDate)
      const exitDate = stay.exitDate ? parseISO(stay.exitDate) : today
      
      // Check if stay overlaps with rolling window
      return entryDate <= windowEnd && exitDate >= windowStart
    })
  }

  // Get stays for a specific date (filtered by selected countries)
  const getStaysForDate = (date: Date) => {
    return stays.filter(stay => {
      const entryDate = parseISO(stay.entryDate)
      const exitDate = stay.exitDate ? parseISO(stay.exitDate) : new Date()
      const isInDateRange = isWithinInterval(date, { start: entryDate, end: exitDate })
      const isCountrySelected = selectedCountries.length === 0 || selectedCountries.includes(stay.countryCode)
      return isInDateRange && isCountrySelected
    })
  }

  // Generate 12 months ending with current month (show past 11 months + current month)
  const months = []
  for (let i = -11; i <= 0; i++) {
    months.push(addMonths(currentDate, i))
  }

  const renderMiniCalendar = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = []
    let day = startDate
    
    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }

    return (
      <div key={format(monthDate, 'yyyy-MM')} className="bg-white rounded-lg shadow-sm border border-gray-100 p-2">
        {/* Month Header */}
        <div className="text-center mb-2">
          <h3 className="text-xs font-semibold text-gray-900">
            {format(monthDate, 'MMM yyyy')}
          </h3>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="text-center text-xs text-gray-500 py-0.5">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px">
          {days.map((day, idx) => {
            const dayStays = getStaysForDate(day)
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isToday = isSameDay(day, new Date())
            const isFuture = day > new Date()
            const hasStay = dayStays.length > 0
            const inRollingWindow = isInRollingWindow(day)
            const isWindowStart = isSameDay(day, windowStart)
            const isWindowEnd = isSameDay(day, windowEnd)
            const hasKoreaStay = dayStays.some(s => s.countryCode === 'KR' && s.visaType === '183/365')
            
            // Don't render days from other months
            if (!isCurrentMonth) {
              return <div key={idx} className="w-8 h-8"></div>
            }
            
            return (
              <div
                key={idx}
                className={`
                  w-8 h-8 flex items-center justify-center text-xs transition-colors cursor-pointer relative
                  text-gray-700
                  ${showKoreaWindow && hasKoreaSpecialVisa && inRollingWindow ? 'bg-yellow-100' : ''}
                  hover:bg-gray-100
                `}
                title={
                  hasStay 
                    ? `${dayStays.map(s => countries.find(c => c.code === s.countryCode)?.name).join(', ')}`
                    : showKoreaWindow && inRollingWindow 
                    ? `365-day window: ${format(day, 'MMM d')}`
                    : format(day, 'MMM d')
                }
              >
                {hasStay && !isToday ? (
                  // Green for future stays, gray for past stays
                  <div className={`w-6 h-6 ${isFuture ? 'bg-green-400' : 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
                    {format(day, 'd')}
                  </div>
                ) : isToday ? (
                  // Blue circle for today
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {format(day, 'd')}
                  </div>
                ) : (
                  <div className="relative">
                    {format(day, 'd')}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation for Year View */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={navigatePrevious}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">
            {format(addMonths(currentDate, -11), 'MMM yyyy')} - {format(currentDate, 'MMM yyyy')}
          </h2>
          
          <button
            onClick={navigateNext}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {hasKoreaSpecialVisa && (
            <button
              onClick={() => setShowKoreaWindow(!showKoreaWindow)}
              className={`px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors relative overflow-hidden flex-1 md:flex-none ${
                showKoreaWindow
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showKoreaWindow && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-300 via-red-200 to-red-300 opacity-60 animate-pulse"></div>
              )}
              <span className="relative z-10">🇰🇷 365-Day</span>
            </button>
          )}
          <button
            onClick={navigateToday}
            className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-1 md:flex-none"
          >
            Today
          </button>
        </div>
      </div>

      {/* 12 Months Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1 md:gap-2">
        {months.map(month => renderMiniCalendar(month))}
      </div>

    </div>
  )
}