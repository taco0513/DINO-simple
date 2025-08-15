'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import AchievementsDisplay from '@/components/AchievementsDisplay'

export default function AchievementsPage() {
  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
          <p className="text-sm text-gray-600 mt-1">Track your travel milestones and unlock rewards</p>
        </div>

        {/* Main Grid Layout - Achievements IA Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Primary Content - Achievement Cards (Mobile: full width, Tablet: full width, Desktop: 3/4) */}
          <div className="md:col-span-2 xl:col-span-3">
            <AchievementsDisplay />
          </div>

          {/* Secondary Content - Quick Actions & Tips (Mobile: full width, Tablet: stacked below, Desktop: 1/4 sidebar) */}
          <div className="md:col-span-2 xl:col-span-1 space-y-4 xl:space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 text-sm flex items-center gap-2"
                >
                  <span>🏠</span> Back to Dashboard
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/calendar'}
                  className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 text-sm flex items-center gap-2"
                >
                  <span>📅</span> View Calendar
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/sources'}
                  className="w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 text-sm flex items-center gap-2"
                >
                  <span>🔍</span> Visa Sources
                </button>
              </div>
            </div>

            {/* Achievement Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-xs font-medium text-purple-900 mb-2">Achievement Tips</h3>
              <ul className="space-y-1 text-xs text-purple-700">
                <li>• Travel to new countries to unlock Explorer achievements</li>
                <li>• Visit multiple cities in one trip for efficiency bonuses</li>
                <li>• Plan consecutive monthly trips for streak rewards</li>
                <li>• Complete achievement collections for bonus points</li>
              </ul>
            </div>

            {/* Travel Goals */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-xs font-medium text-amber-900 mb-2">Travel Goals</h3>
              <div className="space-y-2 text-xs text-amber-700">
                <div>
                  <p className="font-medium">🎯 Next Target</p>
                  <p>Focus on nearby achievements for quick wins</p>
                </div>
                <div>
                  <p className="font-medium">📈 Progress</p>
                  <p>Check "In Progress" tab for active goals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}