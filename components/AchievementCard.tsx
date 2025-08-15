'use client'

import { Achievement, getRarityColor } from '@/lib/achievements'

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
  const rarityColor = getRarityColor(achievement.rarity)
  
  return (
    <div className={`
      relative p-4 rounded-lg border-2 transition-all duration-300
      ${earned 
        ? `${rarityColor} shadow-lg transform hover:scale-105` 
        : 'bg-gray-50 border-gray-200 opacity-75 hover:opacity-100'
      }
    `}>
      {/* Achievement Icon */}
      <div className="flex items-start gap-3">
        <div className={`
          text-3xl p-2 rounded-lg
          ${earned ? 'bg-white/50' : 'bg-gray-100'}
        `}>
          {achievement.icon}
        </div>
        
        <div className="flex-1">
          {/* Title and Points */}
          <div className="flex items-center justify-between">
            <h3 className={`font-bold ${earned ? '' : 'text-gray-600'}`}>
              {achievement.title}
            </h3>
            <span className={`
              text-sm font-semibold px-2 py-1 rounded
              ${earned ? 'bg-white/50' : 'bg-gray-200 text-gray-500'}
            `}>
              {achievement.points} pts
            </span>
          </div>
          
          {/* Description */}
          <p className={`text-sm mt-1 ${earned ? '' : 'text-gray-500'}`}>
            {achievement.description}
          </p>
          
          {/* Progress Bar (if not earned) */}
          {!earned && progress && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress: {progress.current}/{progress.target}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Rarity Badge */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`
              text-xs font-medium px-2 py-0.5 rounded capitalize
              ${earned ? 'bg-white/50' : 'bg-gray-200 text-gray-500'}
            `}>
              {achievement.rarity}
            </span>
            {earned && (
              <span className="text-xs text-green-600 font-semibold">
                ✓ Earned
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}