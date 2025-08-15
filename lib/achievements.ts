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

// Get rarity color
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  }
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