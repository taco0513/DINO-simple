import { addDays } from 'date-fns'

export interface MemoryInput {
  year: number
  month?: number
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  season?: 'spring' | 'summer' | 'fall' | 'winter'
  approximateDuration?: number
}

/**
 * Generate approximate dates for memory-based travel records
 * When users don't remember exact dates, we create reasonable approximations
 */
export function generateApproximateDates(input: MemoryInput): { 
  entryDate: string
  exitDate: string 
} {
  const year = input.year
  let entryDate: Date
  let duration = input.approximateDuration || 7 // Default to 1 week
  
  if (input.month) {
    // Month known: Use middle of month
    entryDate = new Date(year, input.month - 1, 15)
  } else if (input.quarter) {
    // Quarter known: Use middle month of quarter
    const quarterMonths = {
      'Q1': 1, // February (middle of Jan-Mar)
      'Q2': 4, // May (middle of Apr-Jun)
      'Q3': 7, // August (middle of Jul-Sep)
      'Q4': 10 // November (middle of Oct-Dec)
    }
    entryDate = new Date(year, quarterMonths[input.quarter], 15)
    duration = input.approximateDuration || 14 // Default to 2 weeks for quarter
  } else if (input.season) {
    // Season known: Use middle month of season
    const seasonMonths = {
      'spring': 3,  // April
      'summer': 6,  // July
      'fall': 9,    // October
      'winter': 0   // January
    }
    entryDate = new Date(year, seasonMonths[input.season], 15)
    duration = input.approximateDuration || 10 // Default to 10 days for season
  } else {
    // Only year known: Use middle of year (June 15)
    entryDate = new Date(year, 5, 15)
    duration = input.approximateDuration || 7 // Default to 1 week
  }
  
  const exitDate = addDays(entryDate, duration - 1) // -1 because entry day counts
  
  return {
    entryDate: entryDate.toISOString().split('T')[0],
    exitDate: exitDate.toISOString().split('T')[0]
  }
}

/**
 * Get duration options for memory mode
 */
export const durationOptions = [
  { value: 2, label: 'Weekend (2 days)' },
  { value: 3, label: 'Long weekend (3 days)' },
  { value: 5, label: 'Few days (5 days)' },
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
  { value: 21, label: '3 weeks' },
  { value: 30, label: '1 month' },
  { value: 60, label: '2 months' },
  { value: 90, label: '3 months' },
  { value: 180, label: '6 months' },
  { value: 365, label: '1 year' }
]

/**
 * Format memory date display
 */
export function formatMemoryDate(stay: any): string {
  if (!stay.isMemory) {
    return `${stay.entryDate}${stay.exitDate ? ` - ${stay.exitDate}` : ''}`
  }
  
  const year = stay.yearVisited || new Date(stay.entryDate).getFullYear()
  
  if (stay.dateAccuracy === 'month' && stay.monthVisited) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[stay.monthVisited - 1]} ${year}`
  }
  
  if (stay.dateAccuracy === 'quarter') {
    const quarter = Math.ceil((stay.monthVisited || 6) / 3)
    return `Q${quarter} ${year}`
  }
  
  if (stay.dateAccuracy === 'decade') {
    const decade = Math.floor(year / 10) * 10
    return `${decade}s`
  }
  
  // Default to year
  return `${year}`
}