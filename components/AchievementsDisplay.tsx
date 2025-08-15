'use client'

import { useState } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { getAchievementProgress, getNextMilestones, Achievement } from '@/lib/achievements'
import AchievementCard from './AchievementCard'

export default function AchievementsDisplay() {
  const { stays } = useSupabaseStore()
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'earned' | 'progress'>('all')
  
  const { earned, inProgress, totalPoints, level } = getAchievementProgress(stays)
  const nextMilestones = getNextMilestones(stays, 3)
  
  // Group achievements by category
  const earnedByCategory = earned.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = []
    acc[achievement.category].push(achievement)
    return acc
  }, {} as Record<string, Achievement[]>)
  
  // Calculate level progress
  const levelThresholds = [
    { level: 'Beginner', min: 0, max: 25 },
    { level: 'Traveler', min: 25, max: 50 },
    { level: 'Explorer', min: 50, max: 100 },
    { level: 'Adventurer', min: 100, max: 250 },
    { level: 'Seasoned Explorer', min: 250, max: 500 },
    { level: 'Expert Traveler', min: 500, max: 1000 },
    { level: 'Master Nomad', min: 1000, max: 2000 }
  ]
  
  const currentLevelData = levelThresholds.find(l => l.level === level) || levelThresholds[0]
  const nextLevelData = levelThresholds[levelThresholds.indexOf(currentLevelData) + 1]
  const levelProgress = nextLevelData 
    ? ((totalPoints - currentLevelData.min) / (nextLevelData.min - currentLevelData.min)) * 100
    : 100
  
  return (
    <div className="space-y-6">
      {/* Level and Points Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Travel Achievements</h2>
            <p className="text-blue-100">Track your journey milestones and earn rewards</p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold">{totalPoints}</div>
            <div className="text-sm text-blue-100">Total Points</div>
          </div>
        </div>
        
        {/* Level Progress */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">{level}</span>
            {nextLevelData && (
              <span className="text-sm text-blue-100">
                Next: {nextLevelData.level} ({nextLevelData.min} pts)
              </span>
            )}
          </div>
          <div className="w-full bg-blue-400/30 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, levelProgress)}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{earned.length}</div>
          <div className="text-sm text-gray-600">Earned</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{inProgress.length}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {earned.filter(a => a.rarity === 'legendary').length}
          </div>
          <div className="text-sm text-gray-600">Legendary</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {Math.round((earned.length / 20) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
      </div>
      
      {/* Next Milestones */}
      {nextMilestones.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">🎯 Next Milestones</h3>
          <div className="space-y-2">
            {nextMilestones.map(achievement => {
              const progress = achievement.progress ? achievement.progress(stays) : null
              const progressPercent = progress 
                ? Math.round((progress.current / progress.target) * 100)
                : 0
              
              return (
                <div key={achievement.id} className="flex items-center gap-3">
                  <span className="text-xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{achievement.title}</span>
                      <span className="text-xs text-blue-600">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Achievements
        </button>
        <button
          onClick={() => setSelectedCategory('earned')}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedCategory === 'earned'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Earned ({earned.length})
        </button>
        <button
          onClick={() => setSelectedCategory('progress')}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedCategory === 'progress'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          In Progress ({inProgress.length})
        </button>
      </div>
      
      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedCategory === 'earned' && earned.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            earned={true}
          />
        ))}
        
        {selectedCategory === 'progress' && inProgress.map(item => (
          <AchievementCard
            key={item.id}
            achievement={item}
            earned={false}
            progress={item.progress ? item.progress(stays) : undefined}
            progressPercent={item.progressPercent}
          />
        ))}
        
        {selectedCategory === 'all' && (
          <>
            {/* Show earned first */}
            {earned.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                earned={true}
              />
            ))}
            
            {/* Then show in progress */}
            {inProgress.map(item => (
              <AchievementCard
                key={item.id}
                achievement={item}
                earned={false}
                progress={item.progress ? item.progress(stays) : undefined}
                progressPercent={item.progressPercent}
              />
            ))}
          </>
        )}
      </div>
      
      {/* Empty State */}
      {selectedCategory === 'earned' && earned.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No achievements earned yet</p>
          <p className="text-sm">Start traveling to unlock your first achievement!</p>
        </div>
      )}
      
      {selectedCategory === 'progress' && inProgress.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No achievements in progress</p>
          <p className="text-sm">Add more travel records to start working towards achievements!</p>
        </div>
      )}
    </div>
  )
}