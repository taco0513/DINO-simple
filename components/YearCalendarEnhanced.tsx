'use client'

import { useState, useEffect } from 'react'
import { Stay } from '@/lib/types'
import { 
  format, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  isWithinInterval,
  getDay,
  addDays,
  addMonths,
  subMonths
} from 'date-fns'
import { countries } from '@/lib/countries'
import { calculateVisaStatus } from '@/lib/visa-calculator'
import { visaRules } from '@/lib/visa-rules'
import { supabase } from '@/lib/supabase'

interface YearCalendarEnhancedProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  selectedCountries: string[]
  onStartMonthChange?: (startMonth: Date) => void
  onShow365WindowChange?: (show365Window: boolean) => void
}

export default function YearCalendarEnhanced({ 
  currentDate, 
  onDateChange, 
  selectedCountries,
  onStartMonthChange,
  onShow365WindowChange
}: YearCalendarEnhancedProps) {
  const [startMonth, setStartMonth] = useState<Date>(startOfYear(currentDate))
  const [show365Window, setShow365Window] = useState<boolean>(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const { stays } = require('@/lib/supabase-store').useSupabaseStore()
  
  // Get user email
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
    }
    getUser()
  }, [])
  
  // Show 12 months starting from startMonth
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startMonth, i))
  
  // Filter stays based on selected countries
  const filteredStays = selectedCountries.length > 0
    ? stays.filter((stay: Stay) => selectedCountries.includes(stay.countryCode))
    : stays

  // Get stays for a specific date
  const getStaysForDate = (date: Date) => {
    return filteredStays.filter((stay: Stay) => {
      const entryDate = parseISO(stay.entryDate)
      const exitDate = stay.exitDate ? parseISO(stay.exitDate) : new Date()
      return isWithinInterval(date, { start: entryDate, end: exitDate })
    })
  }

  // Check if date is within 365-day rolling window from today
  const isWithin365Window = (date: Date) => {
    if (!show365Window) return false
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const windowStart = new Date(today)
    windowStart.setDate(windowStart.getDate() - 365)
    
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    return checkDate >= windowStart && checkDate <= today
  }

  // Get color for a date based on stays
  const getDateColor = (date: Date) => {
    const dayStays = getStaysForDate(date)
    
    if (dayStays.length === 0) return ''
    
    const stay = dayStays[0]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    
    // Check if this is a future stay
    const isFuture = date > today
    
    if (isFuture) {
      // Future stays with striped pattern
      const countryColorMap: Record<string, string> = {
        'US': 'bg-blue-50 hover:bg-blue-100 border-blue-200 border-dashed',
        'KR': 'bg-red-50 hover:bg-red-100 border-red-200 border-dashed',
        'JP': 'bg-pink-50 hover:bg-pink-100 border-pink-200 border-dashed',
        'TH': 'bg-green-50 hover:bg-green-100 border-green-200 border-dashed',
        'VN': 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 border-dashed',
        'SG': 'bg-purple-50 hover:bg-purple-100 border-purple-200 border-dashed',
        'MY': 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 border-dashed',
        'ID': 'bg-teal-50 hover:bg-teal-100 border-teal-200 border-dashed',
        'PH': 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 border-dashed',
        'IN': 'bg-orange-50 hover:bg-orange-100 border-orange-200 border-dashed',
      }
      return countryColorMap[stay.countryCode] || 'bg-gray-50 hover:bg-gray-100 border-gray-200 border-dashed'
    } else {
      // Past/current stays with solid colors
      const countryColorMap: Record<string, string> = {
        'US': 'bg-blue-100 hover:bg-blue-200 border-blue-300',
        'KR': 'bg-red-100 hover:bg-red-200 border-red-300',
        'JP': 'bg-pink-100 hover:bg-pink-200 border-pink-300',
        'TH': 'bg-green-100 hover:bg-green-200 border-green-300',
        'VN': 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
        'SG': 'bg-purple-100 hover:bg-purple-200 border-purple-300',
        'MY': 'bg-indigo-100 hover:bg-indigo-200 border-indigo-300',
        'ID': 'bg-teal-100 hover:bg-teal-200 border-teal-300',
        'PH': 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300',
        'IN': 'bg-orange-100 hover:bg-orange-200 border-orange-300',
      }
      return countryColorMap[stay.countryCode] || 'bg-gray-100 hover:bg-gray-200 border-gray-300'
    }
  }

  // Calculate monthly statistics
  const getMonthStats = (month: Date) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    let travelDays = 0
    const countriesInMonth = new Set<string>()
    
    monthDays.forEach(day => {
      const dayStays = getStaysForDate(day)
      if (dayStays.length > 0) {
        travelDays++
        dayStays.forEach((stay: Stay) => countriesInMonth.add(stay.countryCode))
      }
    })
    
    return { travelDays, countries: countriesInMonth.size }
  }

  const MonthCalendar = ({ month }: { month: Date }) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const startDate = monthStart
    const endDate = monthEnd
    
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const startingDayOfWeek = getDay(monthStart)
    const stats = getMonthStats(month)
    
    // Add empty cells for alignment
    const emptyCells = Array(startingDayOfWeek).fill(null)
    
    return (
      <div 
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="p-2 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">
              {format(month, 'MMMM')}
            </h3>
            {stats.travelDays > 0 && (
              <div className="flex gap-2 text-xs">
                <span className="text-blue-600 font-medium">{stats.travelDays}d</span>
                <span className="text-gray-400">|</span>
                <span className="text-purple-600 font-medium">{stats.countries}c</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-2">
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-[9px] font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-0.5">
            {emptyCells.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            
            {days.map((day) => {
              const dayStays = getStaysForDate(day)
              const hasStay = dayStays.length > 0
              const todayClass = isToday(day) ? 'ring-2 ring-orange-500 ring-offset-1' : ''
              const dateColor = getDateColor(day)
              const country = hasStay ? countries.find(c => c.code === dayStays[0].countryCode) : null
              
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const dayDate = new Date(day)
              dayDate.setHours(0, 0, 0, 0)
              const isFuture = dayDate > today
              
              const within365 = isWithin365Window(day)
              
              return (
                <div
                  key={day.toString()}
                  className={`
                    aspect-square flex items-center justify-center text-[10px] 
                    rounded-sm relative group transition-all
                    ${within365 ? 'bg-amber-50' : 'hover:bg-gray-50'}
                    ${todayClass}
                  `}
                >
                  {/* Travel day circle on top of background */}
                  {hasStay && (
                    <div className={`
                      absolute inset-0 rounded-full scale-90 border z-10
                      ${dateColor}
                    `} />
                  )}
                  {/* Date number - hidden on hover if has stay */}
                  <span className={`${hasStay ? 'group-hover:opacity-0' : ''} transition-opacity duration-75 ${hasStay ? (isFuture ? 'text-gray-600' : 'font-semibold text-gray-900') : 'text-gray-500'} relative z-20`}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Flag - shown on hover if has stay */}
                  {hasStay && country && (
                    <span className="absolute inset-0 flex items-center justify-center text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-75 z-20">
                      {country.flag}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Calculate statistics for the displayed period
  const periodStats = (() => {
    const periodStart = startOfMonth(months[0])
    const periodEnd = endOfMonth(months[months.length - 1])
    const allDays = eachDayOfInterval({ start: periodStart, end: periodEnd })
    let travelDays = 0
    const countriesSet = new Set<string>()
    const citiesSet = new Set<string>()
    
    allDays.forEach(day => {
      const dayStays = getStaysForDate(day)
      if (dayStays.length > 0) {
        travelDays++
        dayStays.forEach((stay: Stay) => {
          countriesSet.add(stay.countryCode)
          if (stay.city) citiesSet.add(stay.city)
        })
      }
    })
    
    const totalDays = allDays.length
    
    return {
      travelDays,
      countries: countriesSet.size,
      cities: citiesSet.size,
      percentage: Math.round((travelDays / totalDays) * 100),
      periodStart,
      periodEnd
    }
  })()

  return (
    <div>
      {/* Year Overview Bar */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newMonth = subMonths(startMonth, 1)
                  setStartMonth(newMonth)
                  onStartMonthChange?.(newMonth)
                }}
                className="p-1 text-gray-600 hover:bg-white rounded transition-colors"
                title="Previous month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center">
                {format(periodStats.periodStart, 'MMM yyyy')} - {format(periodStats.periodEnd, 'MMM yyyy')}
              </span>
              <button
                onClick={() => {
                  const newMonth = addMonths(startMonth, 1)
                  setStartMonth(newMonth)
                  onStartMonthChange?.(newMonth)
                }}
                className="p-1 text-gray-600 hover:bg-white rounded transition-colors"
                title="Next month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <span className="text-sm text-gray-500">Travel Overview</span>
            <button
              onClick={() => {
                const newMonth = new Date()
                setStartMonth(newMonth)
                onStartMonthChange?.(newMonth)
              }}
              className="ml-2 px-2 py-1 text-xs bg-white text-gray-600 hover:bg-gray-50 rounded transition-colors border border-gray-200"
            >
              Today
            </button>
            
            <button
              onClick={() => {
                const newMonth = startOfYear(currentDate)
                setStartMonth(newMonth)
                onStartMonthChange?.(newMonth)
              }}
              className="ml-2 px-2 py-1 text-xs bg-white text-gray-600 hover:bg-gray-50 rounded transition-colors border border-gray-200"
              title="Reset to current year view (Jan-Dec)"
            >
              Year View
            </button>
            
            {/* 365-day window toggle - restricted to specific user */}
            {userEmail === 'zbrianjin@gmail.com' && (
              <button
                onClick={() => {
                  const newValue = !show365Window
                  setShow365Window(newValue)
                  onShow365WindowChange?.(newValue)
                }}
                className={`ml-2 px-2 py-1 text-xs rounded transition-colors border ${
                  show365Window 
                    ? 'bg-amber-100 text-amber-700 border-amber-300' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                }`}
                title="Show 365-day rolling window from today"
              >
                365d Window
              </button>
            )}
          </div>
          
        </div>
      </div>


      {/* Month Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {months.map((month) => (
          <MonthCalendar key={month.toString()} month={month} />
        ))}
      </div>
    </div>
  )
}