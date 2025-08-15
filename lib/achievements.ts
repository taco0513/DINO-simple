// Achievement System for DINO
// Gamification to motivate and reward travel milestones

import { Stay } from './types'
import { differenceInDays, parseISO } from 'date-fns'

export interface Achievement {
  id: string
  category: 'countries' | 'cities' | 'days' | 'milestones' | 'special'
  title: string
  description: string
  icon: string
  requirement: number | string
  checkFunction: (stays: Stay[]) => boolean
  progress?: (stays: Stay[]) => { current: number; target: number }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  hint?: string           // Quick tip for earning
  howTo?: string          // Detailed explanation
  estimatedTime?: string  // Typical time to achieve
  difficulty?: 1 | 2 | 3 | 4 | 5  // For rarity calculation
}

// Achievement Definitions
export const achievements: Achievement[] = [
  // === COUNTRIES ACHIEVEMENTS ===
  {
    id: 'first-country',
    category: 'countries',
    title: 'First Steps',
    description: 'Visit your first country',
    icon: '🎯',
    requirement: 1,
    rarity: 'common',
    points: 10,
    hint: 'Every journey starts with a single step!',
    howTo: 'Add your first international trip to unlock this achievement',
    estimatedTime: 'Your first trip abroad',
    difficulty: 1,
    checkFunction: (stays) => {
      const countries = new Set(stays.map(s => s.countryCode))
      return countries.size >= 1
    },
    progress: (stays) => {
      const countries = new Set(stays.map(s => s.countryCode))
      return { current: countries.size, target: 1 }
    }
  },
  {
    id: 'five-countries',
    category: 'countries',
    title: 'Explorer',
    description: 'Visit 5 different countries',
    icon: '🗺️',
    requirement: 5,
    rarity: 'common',
    points: 25,
    hint: 'Weekend trips to nearby countries count too!',
    howTo: 'Visit 5 different countries - day trips and long stays both count',
    estimatedTime: '6-12 months for most travelers',
    difficulty: 1,
    checkFunction: (stays) => {
      const countries = new Set(stays.map(s => s.countryCode))
      return countries.size >= 5
    },
    progress: (stays) => {
      const countries = new Set(stays.map(s => s.countryCode))
      return { current: countries.size, target: 5 }
    }
  },
  {
    id: 'ten-countries',
    category: 'countries',
    title: 'Wanderer',
    description: 'Visit 10 different countries',
    icon: '🌍',
    requirement: 10,
    rarity: 'rare',
    points: 50,
    hint: 'Consider a multi-country trip to rack up visits!',
    howTo: 'Reach double digits by visiting 10 different countries',
    estimatedTime: '1-2 years of regular travel',
    difficulty: 2,
    checkFunction: (stays) => {
      const countries = new Set(stays.map(s => s.countryCode))
      return countries.size >= 10
    },
    progress: (stays) => {
      const countries = new Set(stays.map(s => s.countryCode))
      return { current: countries.size, target: 10 }
    }
  },
  {
    id: 'twenty-countries',
    category: 'countries',
    title: 'Globe Trotter',
    description: 'Visit 20 different countries',
    icon: '🌎',
    requirement: 20,
    rarity: 'epic',
    points: 100,
    hint: 'Mix continents to expand your country count faster',
    howTo: 'A significant milestone - visit 20 different countries',
    estimatedTime: '2-5 years for dedicated travelers',
    difficulty: 3,
    checkFunction: (stays) => {
      const countries = new Set(stays.map(s => s.countryCode))
      return countries.size >= 20
    },
    progress: (stays) => {
      const countries = new Set(stays.map(s => s.countryCode))
      return { current: countries.size, target: 20 }
    }
  },
  {
    id: 'fifty-countries',
    category: 'countries',
    title: 'World Citizen',
    description: 'Visit 50 different countries',
    icon: '🌐',
    requirement: 50,
    rarity: 'legendary',
    points: 250,
    hint: 'You\'ve seen more of the world than 99% of people!',
    howTo: 'An elite achievement - visit 50 different countries',
    estimatedTime: '5-10+ years of extensive travel',
    difficulty: 5,
    checkFunction: (stays) => {
      const countries = new Set(stays.map(s => s.countryCode))
      return countries.size >= 50
    },
    progress: (stays) => {
      const countries = new Set(stays.map(s => s.countryCode))
      return { current: countries.size, target: 50 }
    }
  },

  // === CITIES ACHIEVEMENTS ===
  {
    id: 'ten-cities',
    category: 'cities',
    title: 'City Hopper',
    description: 'Visit 10 different cities',
    icon: '🏙️',
    requirement: 10,
    rarity: 'common',
    points: 20,
    hint: 'Day trips to nearby cities count too!',
    howTo: 'Explore different cities within countries to unlock',
    estimatedTime: '6 months of regular travel',
    difficulty: 1,
    checkFunction: (stays) => {
      const cities = new Set(stays.map(s => s.city).filter(c => c && c.trim()))
      return cities.size >= 10
    },
    progress: (stays) => {
      const cities = new Set(stays.map(s => s.city).filter(c => c && c.trim()))
      return { current: cities.size, target: 10 }
    }
  },
  {
    id: 'twenty-five-cities',
    category: 'cities',
    title: 'Urban Explorer',
    description: 'Visit 25 different cities',
    icon: '🌆',
    requirement: 25,
    rarity: 'rare',
    points: 40,
    hint: 'Multi-city trips help you reach this faster',
    howTo: 'Visit 25 unique cities across your travels',
    estimatedTime: '1-2 years for most travelers',
    difficulty: 2,
    checkFunction: (stays) => {
      const cities = new Set(stays.map(s => s.city).filter(c => c && c.trim()))
      return cities.size >= 25
    },
    progress: (stays) => {
      const cities = new Set(stays.map(s => s.city).filter(c => c && c.trim()))
      return { current: cities.size, target: 25 }
    }
  },
  {
    id: 'fifty-cities',
    category: 'cities',
    title: 'Metropolitan Master',
    description: 'Visit 50 different cities',
    icon: '🏛️',
    requirement: 50,
    rarity: 'epic',
    points: 80,
    hint: 'Each country has many cities to explore',
    howTo: 'An impressive milestone of urban exploration',
    estimatedTime: '2-4 years of frequent travel',
    difficulty: 3,
    checkFunction: (stays) => {
      const cities = new Set(stays.map(s => s.city).filter(c => c && c.trim()))
      return cities.size >= 50
    },
    progress: (stays) => {
      const cities = new Set(stays.map(s => s.city).filter(c => c && c.trim()))
      return { current: cities.size, target: 50 }
    }
  },

  // === DAYS TRAVELED ACHIEVEMENTS ===
  {
    id: 'thirty-days',
    category: 'days',
    title: 'Month Abroad',
    description: 'Travel for 30 total days',
    icon: '📅',
    requirement: 30,
    rarity: 'common',
    points: 15,
    hint: 'A few weekend trips add up quickly!',
    howTo: 'Accumulate 30 days of international travel',
    estimatedTime: '2-6 months depending on trip frequency',
    difficulty: 1,
    checkFunction: (stays) => {
      const totalDays = calculateTotalDays(stays)
      return totalDays >= 30
    },
    progress: (stays) => {
      const totalDays = calculateTotalDays(stays)
      return { current: totalDays, target: 30 }
    }
  },
  {
    id: 'ninety-days',
    category: 'days',
    title: 'Season Traveler',
    description: 'Travel for 90 total days',
    icon: '🗓️',
    requirement: 90,
    rarity: 'rare',
    points: 35,
    hint: 'Three months of travel - a full season!',
    howTo: 'Spend a total of 90 days traveling internationally',
    estimatedTime: '6-12 months for regular travelers',
    difficulty: 2,
    checkFunction: (stays) => {
      const totalDays = calculateTotalDays(stays)
      return totalDays >= 90
    },
    progress: (stays) => {
      const totalDays = calculateTotalDays(stays)
      return { current: totalDays, target: 90 }
    }
  },
  {
    id: 'half-year',
    category: 'days',
    title: 'Half-Year Nomad',
    description: 'Travel for 180 total days',
    icon: '⏰',
    requirement: 180,
    rarity: 'epic',
    points: 75,
    hint: 'Living half your life abroad!',
    howTo: 'Accumulate 180 days of international travel',
    estimatedTime: '1-2 years for dedicated travelers',
    difficulty: 3,
    checkFunction: (stays) => {
      const totalDays = calculateTotalDays(stays)
      return totalDays >= 180
    },
    progress: (stays) => {
      const totalDays = calculateTotalDays(stays)
      return { current: totalDays, target: 180 }
    }
  },
  {
    id: 'full-year',
    category: 'days',
    title: 'Perpetual Traveler',
    description: 'Travel for 365 total days',
    icon: '🎊',
    requirement: 365,
    rarity: 'legendary',
    points: 150,
    hint: 'A full year of international adventures!',
    howTo: 'Travel for a cumulative total of 365 days',
    estimatedTime: '2-5 years depending on lifestyle',
    difficulty: 5,
    checkFunction: (stays) => {
      const totalDays = calculateTotalDays(stays)
      return totalDays >= 365
    },
    progress: (stays) => {
      const totalDays = calculateTotalDays(stays)
      return { current: totalDays, target: 365 }
    }
  },

  // === MILESTONES ACHIEVEMENTS ===
  {
    id: 'long-stay',
    category: 'milestones',
    title: 'Slow Traveler',
    description: 'Stay 30+ days in one country',
    icon: '🏡',
    requirement: '30 days in one stay',
    rarity: 'rare',
    points: 30,
    hint: 'Immerse yourself in local culture with a longer stay',
    howTo: 'Spend at least 30 consecutive days in one country',
    estimatedTime: 'Next extended vacation or work trip',
    difficulty: 2,
    checkFunction: (stays) => {
      return stays.some(stay => {
        if (!stay.exitDate) return false
        const days = differenceInDays(parseISO(stay.exitDate), parseISO(stay.entryDate)) + 1
        return days >= 30
      })
    }
  },
  {
    id: 'return-visitor',
    category: 'milestones',
    title: 'Return Visitor',
    description: 'Visit the same country 3+ times',
    icon: '🔄',
    requirement: '3 visits to same country',
    rarity: 'common',
    points: 20,
    hint: 'Found a favorite? Visit it three times!',
    howTo: 'Return to the same country on 3 separate trips',
    estimatedTime: '1-2 years if you have a favorite destination',
    difficulty: 1,
    checkFunction: (stays) => {
      const countryVisits = new Map<string, number>()
      stays.forEach(stay => {
        const count = countryVisits.get(stay.countryCode) || 0
        countryVisits.set(stay.countryCode, count + 1)
      })
      return Array.from(countryVisits.values()).some(count => count >= 3)
    }
  },
  {
    id: 'frequent-flyer',
    category: 'milestones',
    title: 'Frequent Flyer',
    description: 'Take 10+ trips',
    icon: '✈️',
    requirement: '10 trips',
    rarity: 'rare',
    points: 40,
    hint: 'Weekend getaways count too!',
    howTo: 'Complete 10 international trips of any duration',
    estimatedTime: '1-2 years for regular travelers',
    difficulty: 2,
    checkFunction: (stays) => stays.length >= 10,
    progress: (stays) => ({
      current: stays.length,
      target: 10
    })
  },
  {
    id: 'continent-hopper',
    category: 'milestones',
    title: 'Continent Hopper',
    description: 'Visit countries in 3+ continents',
    icon: '🗾',
    requirement: '3 continents',
    rarity: 'epic',
    points: 60,
    hint: 'Explore beyond your home continent!',
    howTo: 'Visit countries across 3 different continents',
    estimatedTime: '2-3 years for most travelers',
    difficulty: 3,
    checkFunction: (stays) => {
      const continents = new Set<string>()
      stays.forEach(stay => {
        const continent = getContinent(stay.countryCode)
        if (continent) continents.add(continent)
      })
      return continents.size >= 3
    },
    progress: (stays) => {
      const continents = new Set<string>()
      stays.forEach(stay => {
        const continent = getContinent(stay.countryCode)
        if (continent) continents.add(continent)
      })
      return { current: continents.size, target: 3 }
    }
  },

  // === SPECIAL ACHIEVEMENTS ===
  {
    id: 'asia-expert',
    category: 'special',
    title: 'Asia Expert',
    description: 'Visit 5+ Asian countries',
    icon: '🏯',
    requirement: '5 Asian countries',
    rarity: 'rare',
    points: 45,
    hint: 'Southeast Asia offers easy multi-country trips',
    howTo: 'Explore 5 different countries across Asia',
    estimatedTime: '1-2 years if focusing on Asia',
    difficulty: 2,
    checkFunction: (stays) => {
      const asianCountries = new Set<string>()
      stays.forEach(stay => {
        if (isAsianCountry(stay.countryCode)) {
          asianCountries.add(stay.countryCode)
        }
      })
      return asianCountries.size >= 5
    },
    progress: (stays) => {
      const asianCountries = new Set<string>()
      stays.forEach(stay => {
        if (isAsianCountry(stay.countryCode)) {
          asianCountries.add(stay.countryCode)
        }
      })
      return { current: asianCountries.size, target: 5 }
    }
  },
  {
    id: 'europe-explorer',
    category: 'special',
    title: 'Europe Explorer',
    description: 'Visit 5+ European countries',
    icon: '🏰',
    requirement: '5 European countries',
    rarity: 'rare',
    points: 45,
    hint: 'Train travel makes multi-country trips easy!',
    howTo: 'Visit 5 different European countries',
    estimatedTime: '1-2 years with European trips',
    difficulty: 2,
    checkFunction: (stays) => {
      const europeanCountries = new Set<string>()
      stays.forEach(stay => {
        if (isEuropeanCountry(stay.countryCode)) {
          europeanCountries.add(stay.countryCode)
        }
      })
      return europeanCountries.size >= 5
    },
    progress: (stays) => {
      const europeanCountries = new Set<string>()
      stays.forEach(stay => {
        if (isEuropeanCountry(stay.countryCode)) {
          europeanCountries.add(stay.countryCode)
        }
      })
      return { current: europeanCountries.size, target: 5 }
    }
  },
  {
    id: 'weekend-warrior',
    category: 'special',
    title: 'Weekend Warrior',
    description: 'Complete 5 trips of 3 days or less',
    icon: '🎒',
    requirement: '5 short trips',
    rarity: 'common',
    points: 25,
    hint: 'Master the art of quick getaways!',
    howTo: 'Take 5 trips that are 3 days or shorter',
    estimatedTime: '6-12 months using weekends',
    difficulty: 1,
    checkFunction: (stays) => {
      const shortTrips = stays.filter(stay => {
        if (!stay.exitDate) return false
        const days = differenceInDays(parseISO(stay.exitDate), parseISO(stay.entryDate)) + 1
        return days <= 3
      })
      return shortTrips.length >= 5
    },
    progress: (stays) => {
      const shortTrips = stays.filter(stay => {
        if (!stay.exitDate) return false
        const days = differenceInDays(parseISO(stay.exitDate), parseISO(stay.entryDate)) + 1
        return days <= 3
      })
      return { current: shortTrips.length, target: 5 }
    }
  },
  {
    id: 'digital-nomad',
    category: 'special',
    title: 'Digital Nomad',
    description: 'Work from 3+ countries (stay 7+ days)',
    icon: '💻',
    requirement: '3 countries with 7+ day stays',
    rarity: 'epic',
    points: 70,
    hint: 'Perfect for remote workers and freelancers!',
    howTo: 'Stay at least 7 days in 3 different countries - enough time to work productively',
    estimatedTime: '3-6 months if planned intentionally',
    difficulty: 3,
    checkFunction: (stays) => {
      const workCountries = new Set<string>()
      stays.forEach(stay => {
        if (!stay.exitDate) return
        const days = differenceInDays(parseISO(stay.exitDate), parseISO(stay.entryDate)) + 1
        if (days >= 7) {
          workCountries.add(stay.countryCode)
        }
      })
      return workCountries.size >= 3
    },
    progress: (stays) => {
      const workCountries = new Set<string>()
      stays.forEach(stay => {
        if (!stay.exitDate) return
        const days = differenceInDays(parseISO(stay.exitDate), parseISO(stay.entryDate)) + 1
        if (days >= 7) {
          workCountries.add(stay.countryCode)
        }
      })
      return { current: workCountries.size, target: 3 }
    }
  },
  {
    id: 'visa-master',
    category: 'special',
    title: 'Visa Master',
    description: 'Navigate 5+ different visa types',
    icon: '📋',
    requirement: '5 visa types',
    rarity: 'rare',
    points: 35,
    hint: 'Each country has different visa rules to master',
    howTo: 'Experience 5 different visa types (tourist, business, etc.)',
    estimatedTime: '2-3 years of diverse travel',
    difficulty: 2,
    checkFunction: (stays) => {
      const visaTypes = new Set(stays.map(s => s.visaType).filter(v => v && v.trim()))
      return visaTypes.size >= 5
    },
    progress: (stays) => {
      const visaTypes = new Set(stays.map(s => s.visaType).filter(v => v && v.trim()))
      return { current: visaTypes.size, target: 5 }
    }
  }
]

// Helper Functions
function calculateTotalDays(stays: Stay[]): number {
  return stays.reduce((total, stay) => {
    if (!stay.exitDate) {
      // For ongoing stays, count up to today
      const days = differenceInDays(new Date(), parseISO(stay.entryDate)) + 1
      return total + days
    }
    const days = differenceInDays(parseISO(stay.exitDate), parseISO(stay.entryDate)) + 1
    return total + days
  }, 0)
}

function getContinent(countryCode: string): string | null {
  const continentMap: { [key: string]: string } = {
    // Asia
    'JP': 'Asia', 'KR': 'Asia', 'CN': 'Asia', 'TH': 'Asia', 'VN': 'Asia',
    'SG': 'Asia', 'MY': 'Asia', 'ID': 'Asia', 'PH': 'Asia', 'TW': 'Asia',
    'HK': 'Asia', 'IN': 'Asia', 'AE': 'Asia', 'IL': 'Asia', 'TR': 'Asia',
    
    // Europe
    'GB': 'Europe', 'FR': 'Europe', 'DE': 'Europe', 'ES': 'Europe', 'IT': 'Europe',
    'PT': 'Europe', 'NL': 'Europe', 'BE': 'Europe', 'CH': 'Europe', 'AT': 'Europe',
    'GR': 'Europe', 'PL': 'Europe', 'CZ': 'Europe', 'HU': 'Europe', 'SE': 'Europe',
    'NO': 'Europe', 'DK': 'Europe', 'FI': 'Europe', 'IE': 'Europe', 'RU': 'Europe',
    
    // Americas
    'US': 'Americas', 'CA': 'Americas', 'MX': 'Americas', 'BR': 'Americas',
    'AR': 'Americas', 'CL': 'Americas', 'PE': 'Americas', 'CO': 'Americas',
    'CR': 'Americas', 'PA': 'Americas', 'UY': 'Americas', 'EC': 'Americas',
    
    // Africa
    'ZA': 'Africa', 'EG': 'Africa', 'MA': 'Africa', 'KE': 'Africa', 'TZ': 'Africa',
    'ET': 'Africa', 'NG': 'Africa', 'GH': 'Africa', 'TN': 'Africa', 'SN': 'Africa',
    
    // Oceania
    'AU': 'Oceania', 'NZ': 'Oceania', 'FJ': 'Oceania', 'PG': 'Oceania'
  }
  
  return continentMap[countryCode] || null
}

function isAsianCountry(countryCode: string): boolean {
  return getContinent(countryCode) === 'Asia'
}

function isEuropeanCountry(countryCode: string): boolean {
  return getContinent(countryCode) === 'Europe'
}

// Get user's earned achievements
export function getEarnedAchievements(stays: Stay[]): Achievement[] {
  return achievements.filter(achievement => achievement.checkFunction(stays))
}

// Get user's achievement progress
export function getAchievementProgress(stays: Stay[]): {
  earned: Achievement[]
  inProgress: Array<Achievement & { progressPercent: number }>
  totalPoints: number
  level: string
} {
  const earned = getEarnedAchievements(stays)
  const earnedIds = new Set(earned.map(a => a.id))
  
  const inProgress = achievements
    .filter(a => !earnedIds.has(a.id) && a.progress)
    .map(a => {
      const progress = a.progress!(stays)
      return {
        ...a,
        progressPercent: Math.min(100, Math.round((progress.current / progress.target) * 100))
      }
    })
    .filter(a => a.progressPercent > 0)
    .sort((a, b) => b.progressPercent - a.progressPercent)
  
  const totalPoints = earned.reduce((sum, a) => sum + a.points, 0)
  
  // Calculate level based on points
  let level = 'Beginner'
  if (totalPoints >= 1000) level = 'Master Nomad'
  else if (totalPoints >= 500) level = 'Expert Traveler'
  else if (totalPoints >= 250) level = 'Seasoned Explorer'
  else if (totalPoints >= 100) level = 'Adventurer'
  else if (totalPoints >= 50) level = 'Explorer'
  else if (totalPoints >= 25) level = 'Traveler'
  
  return {
    earned,
    inProgress,
    totalPoints,
    level
  }
}

// Get rarity color with gradients for better visual distinction
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-300'
    case 'rare': return 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border-blue-300'
    case 'epic': return 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 border-purple-300'
    case 'legendary': return 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 text-yellow-800 border-yellow-400'
  }
}

// Get estimated rarity percentage
export function getAchievementRarity(difficulty?: number): string {
  const estimates: { [key: number]: string } = {
    1: '95% of travelers',
    2: '60% of travelers',
    3: '25% of travelers',
    4: '10% of travelers',
    5: '2% of travelers'
  }
  return estimates[difficulty || 1] || 'Many travelers'
}

// Get contextual progress message
export function getProgressMessage(current: number, target: number, type: string): string {
  const remaining = target - current
  const percentage = Math.round((current / target) * 100)
  
  // Special messages for being very close
  if (percentage >= 90) {
    return `So close! Just ${remaining} more to go!`
  }
  
  // Type-specific messages
  if (type === 'countries') {
    if (remaining === 1) return 'Just 1 more country!'
    if (remaining <= 3) return `Visit ${remaining} more countries`
    return `${current} of ${target} countries visited`
  }
  
  if (type === 'cities') {
    if (remaining === 1) return 'Just 1 more city!'
    if (remaining <= 3) return `Explore ${remaining} more cities`
    return `${current} of ${target} cities explored`
  }
  
  if (type === 'days') {
    if (remaining <= 7) return 'Less than a week to go!'
    if (remaining <= 30) return `Just ${remaining} more days of travel`
    return `${current} of ${target} days traveled`
  }
  
  // Default percentage for other types
  return `${percentage}% complete`
}

// Get progress bar color based on percentage
export function getProgressColor(percent: number): string {
  if (percent >= 90) return 'bg-green-500'   // So close!
  if (percent >= 75) return 'bg-blue-500'    // Getting there
  if (percent >= 50) return 'bg-indigo-500'  // Halfway
  if (percent >= 25) return 'bg-purple-500'  // Started
  return 'bg-gray-400'                        // Just beginning
}

// Get next achievable milestones
export function getNextMilestones(stays: Stay[], limit: number = 3): Achievement[] {
  const earned = new Set(getEarnedAchievements(stays).map(a => a.id))
  
  return achievements
    .filter(a => !earned.has(a.id) && a.progress)
    .map(a => {
      const progress = a.progress!(stays)
      const percentComplete = (progress.current / progress.target) * 100
      return { achievement: a, percentComplete }
    })
    .sort((a, b) => b.percentComplete - a.percentComplete)
    .slice(0, limit)
    .map(item => item.achievement)
}

// === PHASE 3: SMART FEATURES ===

// Streak tracking system
export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastTravelDate: string | null
  streakStatus: 'active' | 'broken' | 'grace' | 'none'
}

export function calculateTravelStreak(stays: Stay[]): StreakData {
  if (stays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastTravelDate: null,
      streakStatus: 'none'
    }
  }

  // Get all unique travel months
  const travelMonths = new Set<string>()
  stays.forEach(stay => {
    const entryDate = parseISO(stay.entryDate)
    const exitDate = stay.exitDate ? parseISO(stay.exitDate) : new Date()
    
    // Add all months between entry and exit
    let currentDate = entryDate
    while (currentDate <= exitDate) {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      travelMonths.add(monthKey)
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    }
  })

  // Sort months and calculate streaks
  const sortedMonths = Array.from(travelMonths).sort()
  if (sortedMonths.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastTravelDate: null,
      streakStatus: 'none'
    }
  }

  let currentStreak = 1
  let longestStreak = 1
  let tempStreak = 1

  for (let i = 1; i < sortedMonths.length; i++) {
    const prevDate = parseISO(sortedMonths[i - 1] + '-01')
    const currDate = parseISO(sortedMonths[i] + '-01')
    const monthDiff = (currDate.getFullYear() - prevDate.getFullYear()) * 12 + 
                      (currDate.getMonth() - prevDate.getMonth())

    if (monthDiff === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  // Check if streak is current
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

  let streakStatus: StreakData['streakStatus'] = 'broken'
  if (travelMonths.has(currentMonth)) {
    streakStatus = 'active'
    currentStreak = tempStreak
  } else if (travelMonths.has(lastMonthKey)) {
    streakStatus = 'grace' // Missed this month but traveled last month
    currentStreak = tempStreak
  } else {
    currentStreak = 0
  }

  const lastTravelDate = sortedMonths[sortedMonths.length - 1] + '-01'

  return {
    currentStreak,
    longestStreak,
    lastTravelDate,
    streakStatus
  }
}

// Smart recommendations based on travel patterns
export interface Recommendation {
  achievement: Achievement
  reason: string
  effort: 'low' | 'medium' | 'high'
  estimatedDays?: number
}

export function getSmartRecommendations(stays: Stay[]): Recommendation[] {
  const recommendations: Recommendation[] = []
  const earned = new Set(getEarnedAchievements(stays).map(a => a.id))
  
  // Analyze travel patterns
  const countryCounts = new Map<string, number>()
  const cityCounts = new Map<string, number>()
  const tripLengths: number[] = []
  
  stays.forEach(stay => {
    countryCounts.set(stay.countryCode, (countryCounts.get(stay.countryCode) || 0) + 1)
    if (stay.city) cityCounts.set(stay.city, (cityCounts.get(stay.city) || 0) + 1)
    if (stay.exitDate) {
      const days = differenceInDays(parseISO(stay.exitDate), parseISO(stay.entryDate)) + 1
      tripLengths.push(days)
    }
  })

  // Find countries close to return visitor achievement
  const returnVisitorCandidates = Array.from(countryCounts.entries())
    .filter(([_, count]) => count === 2)
    .map(([country]) => country)

  if (returnVisitorCandidates.length > 0 && !earned.has('return-visitor')) {
    const achievement = achievements.find(a => a.id === 'return-visitor')!
    recommendations.push({
      achievement,
      reason: `You're one visit away from the Return Visitor achievement! Visit ${returnVisitorCandidates[0]} again.`,
      effort: 'low',
      estimatedDays: 3
    })
  }

  // Check for weekend warrior potential
  const shortTrips = tripLengths.filter(days => days <= 3).length
  if (shortTrips >= 3 && shortTrips < 5 && !earned.has('weekend-warrior')) {
    const achievement = achievements.find(a => a.id === 'weekend-warrior')!
    recommendations.push({
      achievement,
      reason: `You have ${shortTrips} short trips. Just ${5 - shortTrips} more weekend getaways needed!`,
      effort: 'low',
      estimatedDays: 3 * (5 - shortTrips)
    })
  }

  // Suggest slow travel if user takes many short trips
  const avgTripLength = tripLengths.length > 0 
    ? tripLengths.reduce((a, b) => a + b, 0) / tripLengths.length 
    : 0
    
  if (avgTripLength < 7 && avgTripLength > 0 && !earned.has('long-stay')) {
    const achievement = achievements.find(a => a.id === 'long-stay')!
    recommendations.push({
      achievement,
      reason: 'Try a longer stay for a change of pace. Experience a destination deeply!',
      effort: 'medium',
      estimatedDays: 30
    })
  }

  // Check progress on current achievements
  achievements.forEach(achievement => {
    if (!earned.has(achievement.id) && achievement.progress) {
      const progress = achievement.progress(stays)
      const percent = (progress.current / progress.target) * 100
      
      if (percent >= 60 && percent < 100) {
        const remaining = progress.target - progress.current
        let effort: Recommendation['effort'] = 'medium'
        if (percent >= 80) effort = 'low'
        else if (percent < 70) effort = 'high'
        
        recommendations.push({
          achievement,
          reason: `You're ${Math.round(percent)}% complete! Just ${remaining} more to go.`,
          effort,
          estimatedDays: achievement.category === 'days' ? remaining : undefined
        })
      }
    }
  })

  // Sort by effort (low first) and percentage complete
  return recommendations
    .sort((a, b) => {
      const effortOrder = { low: 0, medium: 1, high: 2 }
      return effortOrder[a.effort] - effortOrder[b.effort]
    })
    .slice(0, 5)
}

// Achievement themes - grouped achievements for focused goals
export interface AchievementTheme {
  id: string
  name: string
  description: string
  achievementIds: string[]
  icon: string
  reward?: string
}

export const achievementThemes: AchievementTheme[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Perfect achievements for new travelers',
    achievementIds: ['first-country', 'ten-cities', 'thirty-days'],
    icon: '🎯',
    reward: 'Beginner Badge'
  },
  {
    id: 'asia-adventure',
    name: 'Asian Adventure',
    description: 'Master the wonders of Asia',
    achievementIds: ['asia-expert', 'five-countries', 'ten-countries'],
    icon: '🏯',
    reward: 'Asia Specialist Badge'
  },
  {
    id: 'europe-explorer',
    name: 'European Journey',
    description: 'Discover the charm of Europe',
    achievementIds: ['europe-explorer', 'five-countries', 'ten-countries'],
    icon: '🏰',
    reward: 'Europe Specialist Badge'
  },
  {
    id: 'weekend-master',
    name: 'Weekend Master',
    description: 'Perfect for maximizing short trips',
    achievementIds: ['weekend-warrior', 'return-visitor', 'ten-cities'],
    icon: '🎒',
    reward: 'Efficient Traveler Badge'
  },
  {
    id: 'nomad-life',
    name: 'Nomad Lifestyle',
    description: 'For those who live on the road',
    achievementIds: ['digital-nomad', 'half-year', 'long-stay'],
    icon: '💻',
    reward: 'Digital Nomad Badge'
  },
  {
    id: 'world-explorer',
    name: 'World Explorer',
    description: 'The ultimate travel challenge',
    achievementIds: ['fifty-countries', 'continent-hopper', 'full-year'],
    icon: '🌍',
    reward: 'World Citizen Badge'
  }
]

// Get theme progress
export function getThemeProgress(theme: AchievementTheme, earnedIds: Set<string>): {
  earned: number
  total: number
  percentage: number
  isComplete: boolean
} {
  const earned = theme.achievementIds.filter(id => earnedIds.has(id)).length
  const total = theme.achievementIds.length
  const percentage = Math.round((earned / total) * 100)
  const isComplete = earned === total
  
  return { earned, total, percentage, isComplete }
}

// Pattern analysis - find user's travel style
export type TravelStyle = 'explorer' | 'nomad' | 'weekender' | 'returner' | 'balanced'

export function analyzeTravelStyle(stays: Stay[]): {
  style: TravelStyle
  description: string
  strengths: string[]
  suggestions: string[]
} {
  if (stays.length === 0) {
    return {
      style: 'explorer',
      description: 'Ready to start your journey!',
      strengths: ['Unlimited potential'],
      suggestions: ['Take your first trip', 'Start with nearby countries']
    }
  }

  // Calculate metrics
  const uniqueCountries = new Set(stays.map(s => s.countryCode)).size
  const totalTrips = stays.length
  const repeatVisits = totalTrips - uniqueCountries
  
  const tripLengths = stays
    .filter(s => s.exitDate)
    .map(s => differenceInDays(parseISO(s.exitDate!), parseISO(s.entryDate)) + 1)
  
  const avgTripLength = tripLengths.length > 0 
    ? tripLengths.reduce((a, b) => a + b, 0) / tripLengths.length 
    : 0
  
  const shortTrips = tripLengths.filter(d => d <= 3).length
  const longTrips = tripLengths.filter(d => d >= 30).length
  
  // Determine style
  let style: TravelStyle = 'balanced'
  let description = ''
  let strengths: string[] = []
  let suggestions: string[] = []
  
  if (avgTripLength >= 14 && longTrips >= 2) {
    style = 'nomad'
    description = 'You prefer immersive, long-term travel experiences'
    strengths = ['Deep cultural immersion', 'Cost-effective travel', 'Strong local connections']
    suggestions = ['Try digital nomad visas', 'Explore co-living spaces']
  } else if (shortTrips >= totalTrips * 0.5) {
    style = 'weekender'
    description = 'You excel at maximizing short trips and weekend getaways'
    strengths = ['Efficient planning', 'Work-life balance', 'Regular adventures']
    suggestions = ['Explore nearby countries', 'Try city breaks', 'Maximize long weekends']
  } else if (repeatVisits >= totalTrips * 0.3) {
    style = 'returner'
    description = 'You build deep connections with favorite destinations'
    strengths = ['Local expertise', 'Meaningful relationships', 'Hidden gems knowledge']
    suggestions = ['Become a local expert', 'Try seasonal visits', 'Explore new regions in familiar countries']
  } else if (uniqueCountries >= 10) {
    style = 'explorer'
    description = 'You love discovering new countries and cultures'
    strengths = ['Adaptability', 'Cultural awareness', 'Adventure seeking']
    suggestions = ['Try new continents', 'Challenge yourself with different cultures', 'Learn local phrases']
  } else {
    style = 'balanced'
    description = 'You enjoy a mix of travel styles and experiences'
    strengths = ['Flexibility', 'Varied experiences', 'Well-rounded perspective']
    suggestions = ['Try different travel styles', 'Mix short and long trips', 'Balance new and familiar']
  }
  
  return { style, description, strengths, suggestions }
}