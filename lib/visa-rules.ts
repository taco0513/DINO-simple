import { VisaRule } from './types'

// US passport visa rules
export const visaRules: Record<string, VisaRule> = {
  KR: { maxDays: 90, ruleType: 'reset' },
  JP: { maxDays: 90, periodDays: 180, ruleType: 'rolling' },
  TH: { maxDays: 60, ruleType: 'reset' }, // Updated July 2024: 60 days visa-free
  VN: { maxDays: 90, ruleType: 'reset' }, // E-visa allows up to 90 days
  SG: { maxDays: 90, ruleType: 'reset' },
  MY: { maxDays: 90, ruleType: 'reset' },
  PH: { maxDays: 30, ruleType: 'reset' },
  ID: { maxDays: 30, ruleType: 'reset' },
  TW: { maxDays: 90, ruleType: 'reset' },
  HK: { maxDays: 90, ruleType: 'reset' },
  
  // Schengen Area (all share 90/180 rule)
  DE: { maxDays: 90, periodDays: 180, ruleType: 'rolling' },
  FR: { maxDays: 90, periodDays: 180, ruleType: 'rolling' },
  IT: { maxDays: 90, periodDays: 180, ruleType: 'rolling' },
  ES: { maxDays: 90, periodDays: 180, ruleType: 'rolling' },
  NL: { maxDays: 90, periodDays: 180, ruleType: 'rolling' },
  
  GB: { maxDays: 180, periodDays: 365, ruleType: 'rolling' },
  IE: { maxDays: 90, ruleType: 'reset' },
  
  CA: { maxDays: 180, periodDays: 365, ruleType: 'rolling' },
  MX: { maxDays: 180, ruleType: 'reset' },
  BR: { maxDays: 90, ruleType: 'reset' },
  
  AU: { maxDays: 90, ruleType: 'reset' },
  NZ: { maxDays: 90, ruleType: 'reset' },
}