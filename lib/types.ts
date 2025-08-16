export interface Country {
  code: string // ISO 3166-1 alpha-2
  name: string
  flag: string
  color: string
  visa?: {
    maxDays: number // Maximum days allowed
    ruleType: 'rolling' | 'reset' | 'annual' // Rolling window, resets on exit, or annual
    periodDays?: number // Period for rolling window (e.g., 180 days)
    requiresVisa?: boolean // If visa required in advance
    eVisa?: boolean // If e-visa is available
    visaOnArrival?: boolean // If visa on arrival is available
    eta?: boolean // If ETA/ESTA required
    info?: string // Additional visa info
    resetInfo?: string // Information about how the visa resets
    sourceUrl?: string // Official source for visa information
    lastUpdated?: string // When the information was last verified
  }
}

export interface Stay {
  id: string
  user_id?: string
  countryCode: string
  city?: string
  fromCountryCode?: string
  fromCity?: string
  entryDate: string
  exitDate?: string
  visaType?: string
  notes?: string
  created_at?: string
  updated_at?: string
  
  // Memory Mode fields
  isMemory?: boolean
  dateAccuracy?: 'exact' | 'month' | 'quarter' | 'year' | 'decade'
  yearVisited?: number        // e.g., 2019
  monthVisited?: number       // 1-12
  approximateDuration?: number // estimated days
  tripHighlights?: string[]   // memorable moments
}

export interface VisaRule {
  maxDays: number
  periodDays?: number
  ruleType: 'reset' | 'rolling' | 'annual'
  resetInfo?: string // Information about how the visa resets
  sourceUrl?: string // Official source for visa information
  lastUpdated?: string // When the information was last verified (YYYY-MM format)
}

export interface VisaStatus {
  country: Country
  daysUsed: number
  currentDays?: number  // Days from past/current stays
  plannedDays?: number  // Days from future stays
  maxDays: number
  remainingDays: number
  percentage: number
  status: 'safe' | 'warning' | 'danger'
}