'use client'

import { useState } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { 
  getAchievementProgress, 
  getNextMilestones, 
  Achievement,
  calculateTravelStreak,
  getSmartRecommendations,
  analyzeTravelStyle,
  achievementThemes,
  getThemeProgress
} from '@/lib/achievements'
import AchievementCard from './AchievementCard'

export default function AchievementsDisplay() {
  const { stays } = useSupabaseStore()
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'earned' | 'progress'>('all')
  const [showRecommendations, setShowRecommendations] = useState(false)
  
  const { earned, inProgress, totalPoints, level } = getAchievementProgress(stays)
  const nextMilestones = getNextMilestones(stays, 3)
  const streak = calculateTravelStreak(stays)
  const recommendations = getSmartRecommendations(stays)
  const travelStyle = analyzeTravelStyle(stays)
  const earnedIds = new Set(earned.map(a => a.id))
  
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
      
      {/* Travel Style and Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Travel Style Card */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Your Travel Style</h3>
            <span className="text-2xl">{travelStyle.style === 'explorer' ? '🗺️' : travelStyle.style === 'nomad' ? '🏕️' : travelStyle.style === 'weekender' ? '🎒' : travelStyle.style === 'returner' ? '🔄' : '⚖️'}</span>
          </div>
          <p className="text-lg font-bold capitalize text-blue-600">{travelStyle.style}</p>
          <p className="text-sm text-gray-600 mt-1">{travelStyle.description}</p>
          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">Your Strengths:</p>
            <div className="flex flex-wrap gap-1">
              {travelStyle.strengths.map((strength, i) => (
                <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  {strength}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Streak Card */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Travel Streak</h3>
            <span className="text-2xl">
              {streak.streakStatus === 'active' ? '🔥' : streak.streakStatus === 'grace' ? '⏰' : '💤'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-orange-600">{streak.currentStreak}</p>
              <p className="text-xs text-gray-600">Current Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{streak.longestStreak}</p>
              <p className="text-xs text-gray-600">Longest Streak</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-600">
              Status: <span className={`font-semibold ${
                streak.streakStatus === 'active' ? 'text-green-600' : 
                streak.streakStatus === 'grace' ? 'text-yellow-600' : 
                'text-gray-500'
              }`}>
                {streak.streakStatus === 'active' ? 'Active! Keep it up!' :
                 streak.streakStatus === 'grace' ? 'Travel this month to continue!' :
                 streak.streakStatus === 'none' ? 'Start your streak!' :
                 'Streak broken - start again!'}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">🎯 Personalized Recommendations</h3>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              {showRecommendations ? 'Hide' : 'Show'} All
            </button>
          </div>
          
          <div className={`space-y-2 ${!showRecommendations ? 'max-h-24 overflow-hidden' : ''}`}>
            {recommendations.slice(0, showRecommendations ? undefined : 2).map((rec, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded p-3">
                <span className="text-xl">{rec.achievement.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{rec.achievement.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{rec.reason}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      rec.effort === 'low' ? 'bg-green-100 text-green-700' :
                      rec.effort === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {rec.effort} effort
                    </span>
                    {rec.estimatedDays && (
                      <span className="text-xs text-gray-500">
                        ~{rec.estimatedDays} days
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Achievement Themes */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">🎯 Achievement Collections</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievementThemes.map(theme => {
            const progress = getThemeProgress(theme, earnedIds)
            return (
              <div 
                key={theme.id} 
                className={`p-3 rounded-lg border ${
                  progress.isComplete 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{theme.icon}</span>
                  <p className="text-sm font-medium text-gray-900">{theme.name}</p>
                </div>
                <p className="text-xs text-gray-600 mb-2">{theme.description}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {progress.earned}/{progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${
                        progress.isComplete ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  {progress.isComplete && theme.reward && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      ✓ {theme.reward} Earned!
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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