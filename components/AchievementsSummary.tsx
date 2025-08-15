'use client'

import Link from 'next/link'
import { useSupabaseStore } from '@/lib/supabase-store'
import { getAchievementProgress, getNextMilestones } from '@/lib/achievements'

export default function AchievementsSummary() {
  const { stays } = useSupabaseStore()
  const { earned, totalPoints, level } = getAchievementProgress(stays)
  const nextMilestones = getNextMilestones(stays, 2)
  
  // Get recent achievements (last 3 earned)
  const recentAchievements = earned.slice(-3).reverse()
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 md:p-6 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
          <p className="text-sm text-gray-600">{level} • {totalPoints} points</p>
        </div>
        <Link
          href="/dashboard/achievements"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All →
        </Link>
      </div>
      
      {/* Recent Achievements */}
      {recentAchievements.length > 0 ? (
        <div className="space-y-3 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Recently Earned</p>
          <div className="flex flex-wrap gap-2">
            {recentAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-purple-200"
              >
                <span className="text-xl">{achievement.icon}</span>
                <div>
                  <p className="text-sm font-medium">{achievement.title}</p>
                  <p className="text-xs text-gray-500">+{achievement.points} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white/50 rounded-lg p-4 mb-4 text-center">
          <p className="text-sm text-gray-600">Start traveling to earn achievements!</p>
        </div>
      )}
      
      {/* Next Milestones */}
      {nextMilestones.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Next Milestones</p>
          {nextMilestones.map(achievement => {
            const progress = achievement.progress ? achievement.progress(stays) : null
            const progressPercent = progress 
              ? Math.round((progress.current / progress.target) * 100)
              : 0
            
            return (
              <div key={achievement.id} className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{achievement.title}</p>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                  <span className="text-xs text-purple-600 font-medium">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-1.5">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-purple-200">
        <div className="text-center">
          <p className="text-lg font-bold text-purple-600">{earned.length}</p>
          <p className="text-xs text-gray-600">Earned</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">
            {earned.filter(a => a.rarity === 'legendary').length}
          </p>
          <p className="text-xs text-gray-600">Legendary</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">
            {Math.round((earned.length / 20) * 100)}%
          </p>
          <p className="text-xs text-gray-600">Complete</p>
        </div>
      </div>
    </div>
  )
}