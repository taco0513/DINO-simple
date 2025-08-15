'use client'

import { Achievement } from '@/lib/achievements'

interface AchievementCardProps {
  achievement: Achievement
  earned: boolean
  progress?: { current: number; target: number }
  progressPercent?: number
}

export default function AchievementCard({ 
  achievement, 
  earned, 
  progress,
  progressPercent 
}: AchievementCardProps) {
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-purple-500 to-pink-500'
      case 'epic': return 'from-blue-500 to-indigo-500'
      case 'rare': return 'from-green-500 to-emerald-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500'
    if (percent >= 50) return 'bg-blue-500'
    if (percent >= 25) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  return (
    <div className={`
      relative bg-white rounded-xl border transition-all duration-300 hover:shadow-lg group
      ${earned ? 'border-green-200 shadow-md' : 'border-gray-200 hover:border-gray-300'}
    `}>
      {/* Earned gradient border */}
      {earned && (
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getRarityStyle(achievement.rarity)} p-0.5`}>
          <div className="bg-white rounded-xl h-full w-full" />
        </div>
      )}

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`
            text-2xl p-3 rounded-lg flex-shrink-0 transition-transform duration-200
            ${earned 
              ? 'bg-green-50 group-hover:scale-110' 
              : 'bg-gray-50 group-hover:bg-gray-100'
            }
          `}>
            {achievement.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={`font-semibold text-sm leading-tight ${
                earned ? 'text-gray-900' : 'text-gray-600'
              }`}>
                {achievement.title}
              </h3>
              {earned && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Earned
                  </span>
                </div>
              )}
            </div>
            
            <p className={`text-xs mt-1 leading-relaxed ${
              earned ? 'text-gray-600' : 'text-gray-500'
            }`}>
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Progress Section */}
        {!earned && progress && progressPercent !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">
                {progress.current} / {progress.target}
              </span>
              <span className="text-xs font-medium text-gray-700">
                {Math.round(progressPercent)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className={`${getProgressColor(progressPercent)} h-1.5 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
            
            {progressPercent >= 90 && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs">🔥</span>
                <span className="text-xs font-medium text-orange-600">Almost there!</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`
              text-xs px-2 py-1 rounded-full font-medium capitalize
              ${earned 
                ? `bg-gradient-to-r ${getRarityStyle(achievement.rarity)} text-white`
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {achievement.rarity}
            </span>
            
            {!earned && achievement.hint && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs text-gray-400" title={achievement.hint}>
                  💡
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <span className={`text-xs font-semibold ${
              earned ? 'text-green-600' : 'text-gray-500'
            }`}>
              {achievement.points}
            </span>
            <span className={`text-xs ${
              earned ? 'text-green-600' : 'text-gray-400'
            }`}>
              pts
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}