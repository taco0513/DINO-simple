import { VisaRule } from './types'

// US passport visa rules
export const visaRules: Record<string, VisaRule> = {
  KR: { maxDays: 90, ruleType: 'reset', resetInfo: 'Resets upon exit. Immediate re-entry allowed.' },
  JP: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: '90 days within any 180-day period' },
  TH: { maxDays: 60, ruleType: 'reset', resetInfo: 'Resets upon exit. Land border: max 2 entries/year. Air: unlimited but may be questioned.' }, // Updated July 2024: 60 days visa-free
  VN: { maxDays: 90, ruleType: 'reset', resetInfo: 'Requires new e-visa for each entry. Cannot extend beyond 90 days.' }, // E-visa allows up to 90 days
  SG: { maxDays: 90, ruleType: 'reset', resetInfo: 'Resets upon exit. Frequent visa runs may be questioned.' },
  MY: { maxDays: 90, ruleType: 'reset', resetInfo: 'Resets upon exit. Multiple entries allowed.' },
  PH: { maxDays: 30, ruleType: 'reset', resetInfo: 'Resets upon exit. Can extend up to 36 months in-country.' },
  ID: { maxDays: 30, ruleType: 'reset', resetInfo: 'Resets upon exit. Can extend once for 30 days.' },
  TW: { maxDays: 90, ruleType: 'reset', resetInfo: 'Resets upon exit. Immediate re-entry allowed.' },
  HK: { maxDays: 90, ruleType: 'reset', resetInfo: 'Resets upon exit. Immediate re-entry allowed.' },
  
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