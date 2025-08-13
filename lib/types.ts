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
}

export interface VisaStatus {
  country: Country
  daysUsed: number
  maxDays: number
  remainingDays: number
  percentage: number
  status: 'safe' | 'warning' | 'danger'
}