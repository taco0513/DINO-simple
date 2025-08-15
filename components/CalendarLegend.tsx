'use client'

interface CalendarLegendProps {
  show365Window: boolean
}

export default function CalendarLegend({ show365Window }: CalendarLegendProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Calendar Legend</h2>
      </div>
      <div className="p-4 space-y-3">
        {/* Today */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-orange-500 rounded-full flex-shrink-0"></div>
          <span className="text-sm text-gray-600">Today</span>
        </div>
        
        {/* Future Stays */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border border-dashed border-blue-200 rounded flex-shrink-0"></div>
          <span className="text-sm text-gray-600">Future Plans</span>
        </div>
        
        {/* Country Colors */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-0.5 flex-shrink-0">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-full"></div>
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-full"></div>
          </div>
          <span className="text-sm text-gray-600">Different Countries</span>
        </div>
        
        {/* 365-day Window - only show if enabled */}
        {show365Window && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-50 rounded-sm relative flex-shrink-0">
              <div className="absolute inset-0 bg-red-100 border border-red-300 rounded-full scale-90"></div>
            </div>
            <span className="text-sm text-gray-600">365-Day Window</span>
          </div>
        )}
        
        {/* Hover Tip */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-500">
            <span>💡</span>
            <span className="text-xs">Hover days to see flags</span>
          </div>
        </div>
      </div>
    </div>
  )
}