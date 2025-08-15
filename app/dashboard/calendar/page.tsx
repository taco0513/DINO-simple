'use client'

import { useState, useEffect } from 'react'
import YearCalendarEnhanced from '@/components/YearCalendarEnhanced'
import CountryFilter from '@/components/CountryFilter'
import CalendarLegend from '@/components/CalendarLegend'
import { useSupabaseStore } from '@/lib/supabase-store'
import { startOfMonth, endOfMonth, addMonths, isWithinInterval, parseISO, startOfYear } from 'date-fns'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [startMonth, setStartMonth] = useState<Date>(startOfYear(currentDate))
  const [show365Window, setShow365Window] = useState(false)
  const { stays, loadStays } = useSupabaseStore()

  useEffect(() => {
    loadStays()
  }, [loadStays])

  // Get countries visible in current 12-month view
  const getVisibleCountries = () => {
    const months = Array.from({ length: 12 }, (_, i) => addMonths(startMonth, i))
    const viewStart = startOfMonth(months[0])
    const viewEnd = endOfMonth(months[months.length - 1])
    
    const visibleStays = stays.filter(stay => {
      const entryDate = parseISO(stay.entryDate)
      const exitDate = stay.exitDate ? parseISO(stay.exitDate) : new Date()
      
      return isWithinInterval(entryDate, { start: viewStart, end: viewEnd }) ||
             isWithinInterval(exitDate, { start: viewStart, end: viewEnd }) ||
             (entryDate <= viewStart && exitDate >= viewEnd)
    })
    
    return [...new Set(visibleStays.map(s => s.countryCode))]
  }

  const visibleCountries = getVisibleCountries()

  // Calculate stats for sidebar
  const getStats = () => {
    const uniqueCountries = [...new Set(stays.map(s => s.countryCode))].length
    const uniqueCities = [...new Set(stays.map(s => s.city).filter(c => c && c.trim()))].length
    
    // Calculate current year stats
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    const today = new Date()
    
    const thisYearDays = stays
      .filter(stay => {
        const entryDate = parseISO(stay.entryDate)
        const exitDate = stay.exitDate ? parseISO(stay.exitDate) : today
        return exitDate >= yearStart && entryDate <= today
      })
      .reduce((total, stay) => {
        const entryDate = parseISO(stay.entryDate)
        const exitDate = stay.exitDate ? parseISO(stay.exitDate) : today
        const effectiveStart = entryDate > yearStart ? entryDate : yearStart
        const effectiveEnd = exitDate < today ? exitDate : today
        
        if (effectiveEnd >= effectiveStart) {
          const msPerDay = 1000 * 60 * 60 * 24
          const daysDiff = Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / msPerDay)
          return total + (daysDiff + 1)
        }
        return total
      }, 0)
    
    return {
      totalRecords: stays.length,
      uniqueCountries,
      uniqueCities,
      thisYearDays,
      currentYear
    }
  }

  const stats = getStats()

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Compact Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Travel Calendar</h1>
        <p className="text-sm text-gray-600 mt-1">Visualize your journey through {currentDate.getFullYear()}</p>
      </div>

      {/* Main Grid Layout - Calendar IA Optimized */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 xl:gap-6">
        {/* Primary Content - Calendar View (Mobile: full width, Desktop: 3/4 width) */}
        <div className="xl:col-span-3 space-y-4 xl:space-y-6">
          {/* Country Filter */}
          {visibleCountries.length > 0 && (
            <CountryFilter 
              selectedCountries={selectedCountries}
              onSelectionChange={setSelectedCountries}
              visibleCountries={visibleCountries}
            />
          )}

          {/* Main Calendar */}
          <YearCalendarEnhanced 
            currentDate={currentDate} 
            onDateChange={setCurrentDate}
            selectedCountries={selectedCountries}
            onStartMonthChange={setStartMonth}
            onShow365WindowChange={setShow365Window}
          />
        </div>

        {/* Sidebar (1/4 width) */}
        <div className="space-y-6">
          {/* Data Statistics */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Calendar Stats</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Travel Entries</span>
                <span className="text-lg font-semibold text-blue-600">{stats.totalRecords}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Countries</span>
                <span className="text-lg font-semibold text-purple-600">{stats.uniqueCountries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cities</span>
                <span className="text-lg font-semibold text-green-600">{stats.uniqueCities}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">{stats.currentYear} Travel</p>
                <p className="text-lg font-semibold text-indigo-600">{stats.thisYearDays} days</p>
              </div>
            </div>
          </div>

          {/* Calendar Legend */}
          <CalendarLegend show365Window={show365Window} />

        </div>
      </div>
    </div>
  )
}