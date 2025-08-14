import { VisaStatus, Stay } from '@/lib/types'
import { useSupabaseStore } from '@/lib/supabase-store'
import { visaRules } from '@/lib/visa-rules'
import { useState } from 'react'

interface VisaCardProps {
  status: VisaStatus
}

export default function VisaCard({ status }: VisaCardProps) {
  const stays = useSupabaseStore((state) => state.stays)
  const [showInfo, setShowInfo] = useState(false)
  const hasSpecialKoreaVisa = status.country.code === 'KR' && 
    stays.filter(s => s.countryCode === 'KR').some(s => s.visaType === '183/365')
  
  const visaRule = visaRules[status.country.code]
  
  const getStatusColor = () => {
    switch (status.status) {
      case 'danger': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  const getBorderColor = () => {
    // Use standard thresholds for all countries including Korea
    if (status.remainingDays <= 14) {
      return 'border-red-500 border-2'
    } else if (status.remainingDays <= 30) {
      return 'border-yellow-500 border-2'
    }
    
    // Default border
    return 'border-gray-200'
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 border ${getBorderColor()}`}>
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-3">{status.country.flag}</span>
        <div>
          <h3 className="text-lg font-semibold">{status.country.name}</h3>
          {hasSpecialKoreaVisa && (
            <span className="text-xs text-blue-600 font-medium">183/365 Special</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Days Used</span>
            <span className="font-medium">{status.daysUsed} / {status.maxDays}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
            {/* Current/Past days bar */}
            {status.currentDays !== undefined && status.currentDays > 0 && (
              <div
                className={`h-2 absolute left-0 top-0 rounded-l-full ${
                  status.status === 'danger' ? 'bg-red-500' :
                  status.status === 'warning' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (status.currentDays / status.maxDays) * 100)}%` }}
              />
            )}
            {/* Planned/Future days bar */}
            {status.plannedDays !== undefined && status.plannedDays > 0 && (
              <div
                className={`h-2 absolute top-0 rounded-r-full ${
                  status.status === 'danger' ? 'bg-red-300' :
                  status.status === 'warning' ? 'bg-yellow-300' :
                  'bg-green-300'
                }`}
                style={{ 
                  width: `${Math.min(100 - ((status.currentDays || 0) / status.maxDays * 100), (status.plannedDays / status.maxDays * 100))}%`,
                  left: `${Math.min(100, ((status.currentDays || 0) / status.maxDays) * 100)}%`
                }}
              />
            )}
            {/* Fallback for backward compatibility */}
            {status.currentDays === undefined && (
              <div
                className={`h-2 rounded-full ${getStatusColor()}`}
                style={{ width: `${Math.min(100, status.percentage)}%` }}
              />
            )}
          </div>
          {/* Legend for current vs planned */}
          {status.currentDays !== undefined && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${
                  status.status === 'danger' ? 'bg-red-500' :
                  status.status === 'warning' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></div>
                <span className="text-xs text-gray-600">Current ({status.currentDays || 0} days)</span>
              </div>
              {status.plannedDays !== undefined && status.plannedDays > 0 && (
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${
                    status.status === 'danger' ? 'bg-red-300' :
                    status.status === 'warning' ? 'bg-yellow-300' :
                    'bg-green-300'
                  }`}></div>
                  <span className="text-xs text-gray-600">Planned ({status.plannedDays} days)</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Remaining</span>
          <span className={`font-medium ${
            status.remainingDays <= 14 ? 'text-red-600' : 
            status.remainingDays <= 30 ? 'text-yellow-600' : 
            ''
          }`}>
            {status.remainingDays} days
            {status.remainingDays <= 14 && ' ⚠️'}
          </span>
        </div>

        {/* Reset Info Button */}
        {visaRule?.resetInfo && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
            >
              <svg 
                className={`w-3 h-3 mr-1 transition-transform ${showInfo ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {visaRule.ruleType === 'rolling' ? 'How it works' : 'Reset info'}
            </button>
            
            {showInfo && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-700">
                {visaRule.resetInfo}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}