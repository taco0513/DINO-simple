'use client'

import { useState } from 'react'
import Calendar from '@/components/Calendar'
import YearCalendar from '@/components/YearCalendar'
import CountryFilter from '@/components/CountryFilter'
import { useStore } from '@/lib/store'
import { countries } from '@/lib/countries'

type CalendarView = 'month' | 'year'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const { stays } = useStore()
  
  // Check if there are any Korea stays with 183/365 visa
  const hasKoreaSpecialVisa = stays.some(s => s.countryCode === 'KR' && s.visaType === '183/365')

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Visualize your travel history</p>
        </div>
      </div>

      {/* Country Filter */}
      <div className="mb-6">
        <CountryFilter 
          selectedCountries={selectedCountries}
          onSelectionChange={setSelectedCountries}
        />
      </div>

      <YearCalendar 
        currentDate={currentDate} 
        onDateChange={setCurrentDate}
        selectedCountries={selectedCountries}
      />

      {/* Global Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-700">Past Stays</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-400 rounded"></div>
            <span className="text-sm text-gray-700">Future Stays</span>
          </div>
          {hasKoreaSpecialVisa && (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-yellow-100 rounded border border-yellow-400"></div>
              <span className="text-sm text-gray-700">365-Day Window</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}