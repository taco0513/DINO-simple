export interface Country {
  code: string
  name: string
  flag: string
  color: string
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