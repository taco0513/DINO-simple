'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import AchievementsDisplay from '@/components/AchievementsDisplay'

export default function AchievementsPage() {
  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <AchievementsDisplay />
      </div>
    </ProtectedRoute>
  )
}