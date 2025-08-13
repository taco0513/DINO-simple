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
  subDays,
  isSameMonth,
  isSameDay,
  parseISO,
  isWithinInterval,
  differenceInDays,
} from 'date-fns'

interface CalendarProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  selectedCountries: string[]
}

export default function Calendar({ currentDate, onDateChange, selectedCountries }: CalendarProps) {
  const { stays, loadStays } = useStore()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
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

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

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

  // Generate calendar days
  const days = []
  let day = startDate
  
  while (day <= endDate) {
    days.push(day)
    day = addDays(day, 1)
  }

  // Week days header
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={navigatePrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <button
            onClick={navigateNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex space-x-2">
          {hasKoreaSpecialVisa && (
            <button
              onClick={() => setShowKoreaWindow(!showKoreaWindow)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors relative overflow-hidden ${
                showKoreaWindow
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showKoreaWindow && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-300 via-red-200 to-red-300 opacity-60 animate-pulse"></div>
              )}
              <span className="relative z-10">🇰🇷 365-Day Window</span>
            </button>
          )}
          <button
            onClick={navigateToday}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Today
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayStays = getStaysForDate(day)
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isToday = isSameDay(day, new Date())
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const inRollingWindow = isInRollingWindow(day)
          const isWindowStart = isSameDay(day, windowStart)
          const isWindowEnd = isSameDay(day, windowEnd)
          const hasKoreaStay = dayStays.some(s => s.countryCode === 'KR' && s.visaType === '183/365')
          
          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`
                min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all relative
                ${!isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white hover:bg-gray-50'}
                ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
                ${isSelected ? 'ring-2 ring-blue-400' : ''}
                ${showKoreaWindow && hasKoreaSpecialVisa && inRollingWindow ? 'bg-yellow-100' : ''}
              `}
            >
              {/* 365-day window indicators */}
              {showKoreaWindow && hasKoreaSpecialVisa && (
                <>
                  {isWindowEnd && (
                    <div className="absolute -top-2 right-1 text-xs text-red-600 font-bold bg-white px-1 rounded shadow-sm">TODAY</div>
                  )}
                  {hasKoreaStay && (
                    <div className="absolute inset-0 bg-red-200 opacity-20 rounded-lg pointer-events-none"></div>
                  )}
                </>
              )}
              <div className="text-sm font-medium mb-1">
                {format(day, 'd')}
              </div>
              
              {/* Display stays for this day */}
              <div className="space-y-1">
                {dayStays.slice(0, 2).map((stay) => {
                  const country = countries.find(c => c.code === stay.countryCode)
                  return (
                    <div
                      key={stay.id}
                      className="text-xs truncate"
                      title={country?.name}
                    >
                      <span className="mr-1">{country?.flag}</span>
                      <span className="text-gray-600">{country?.name}</span>
                    </div>
                  )
                })}
                {dayStays.length > 2 && (
                  <div className="text-xs text-gray-400">
                    +{dayStays.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold mb-3 text-blue-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          {getStaysForDate(selectedDate).length > 0 ? (
            <div className="space-y-3">
              {getStaysForDate(selectedDate).map(stay => {
                const country = countries.find(c => c.code === stay.countryCode)
                return (
                  <div key={stay.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                    <span className="text-2xl">{country?.flag}</span>
                    <div>
                      <p className="font-medium text-gray-900">{country?.name}</p>
                      <p className="text-sm text-gray-600">
                        {stay.entryDate} ~ {stay.exitDate || 'Present'}
                      </p>
                      {stay.visaType && (
                        <p className="text-xs text-blue-600">{stay.visaType}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-blue-700">No travels on this date</p>
          )}
        </div>
      )}

      {/* Korea 365-Day Window Info */}
      {showKoreaWindow && hasKoreaSpecialVisa && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-900 mb-3">🇰🇷 Korea 365-Day Rolling Window</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Window Period:</span>
              <span className="font-medium">{format(windowStart, 'MMM d, yyyy')} - {format(windowEnd, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span>Days Used in Window:</span>
              <span className="font-medium text-red-700">
                {getKoreaStaysInWindow().reduce((total, stay) => {
                  const entryDate = parseISO(stay.entryDate)
                  const exitDate = stay.exitDate ? parseISO(stay.exitDate) : today
                  const overlapStart = entryDate < windowStart ? windowStart : entryDate
                  const overlapEnd = exitDate > windowEnd ? windowEnd : exitDate
                  return total + Math.max(0, differenceInDays(overlapEnd, overlapStart) + 1)
                }, 0)} / 183 days
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}