import { VisaRule } from './types'

// US passport visa rules
export const visaRules: Record<string, VisaRule> = {
  // Asia-Pacific
  KR: { 
    maxDays: 90, 
    ruleType: 'reset', 
    resetInfo: 'Resets upon exit. Immediate re-entry allowed.',
    sourceUrl: 'https://www.visa.go.kr/openPage.do?MENU_ID=10301',
    lastUpdated: '2024-11'
  },
  JP: { 
    maxDays: 90, 
    periodDays: 180, 
    ruleType: 'rolling', 
    resetInfo: '90 days within any 180-day period',
    sourceUrl: 'https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html',
    lastUpdated: '2024-11'
  },
  TH: { 
    maxDays: 60, 
    ruleType: 'reset', 
    resetInfo: 'Resets upon exit. Land border: max 2 entries/year. Air: unlimited but may be questioned. ETA required from June 2025 (free).',
    sourceUrl: 'https://www.thaiembassy.com/thailand/thailand-visa-exemption',
    lastUpdated: '2024-07'
  }, // Updated July 2024: 60 days visa-free, ETA from June 2025
  VN: { 
    maxDays: 90, 
    ruleType: 'reset', 
    resetInfo: 'E-visa required ($25). Multiple entry available. Cannot extend beyond 90 days.',
    sourceUrl: 'https://evisa.xuatnhapcanh.gov.vn/',
    lastUpdated: '2023-08'
  }, // E-visa updated Aug 2023: 90 days, multiple entry
  SG: { 
    maxDays: 90, 
    ruleType: 'reset', 
    resetInfo: 'Resets upon exit. Frequent visa runs may be questioned.',
    sourceUrl: 'https://www.ica.gov.sg/enter-depart/entry_requirements/visa_requirements',
    lastUpdated: '2024-11'
  },
  MY: { 
    maxDays: 90, 
    ruleType: 'reset', 
    resetInfo: 'Resets upon exit. Multiple entries allowed. Must complete MDAC within 3 days before arrival (free).',
    sourceUrl: 'https://www.imi.gov.my/index.php/en/home/',
    lastUpdated: '2024-11'
  },
  PH: { maxDays: 30, ruleType: 'reset', resetInfo: 'Resets upon exit. Can extend up to 36 months in-country.' },
  ID: { maxDays: 30, ruleType: 'reset', resetInfo: 'Resets upon exit. Can extend once for 30 days.' },
  TW: { maxDays: 90, ruleType: 'reset', resetInfo: 'Resets upon exit. Immediate re-entry allowed.' },
  HK: { maxDays: 90, ruleType: 'reset', resetInfo: 'Resets upon exit. Immediate re-entry allowed.' },
  KH: { maxDays: 30, ruleType: 'reset', resetInfo: 'Visa on arrival ($30) or e-visa ($36). Can extend once for 30 days.' },
  LA: { maxDays: 30, ruleType: 'reset', resetInfo: 'Visa on arrival ($30-40). Can extend up to 60 days total.' },
  MM: { maxDays: 28, ruleType: 'reset', resetInfo: 'E-visa required in advance ($50). 28 days granted, single entry.' },
  CN: { maxDays: 0, ruleType: 'reset', resetInfo: 'Visa required in advance. Duration varies by visa type.' },
  IN: { maxDays: 60, ruleType: 'reset', resetInfo: 'E-visa required in advance ($25-100). 30/60/180 days & 1/5 year options available.' },
  LK: { maxDays: 30, ruleType: 'reset', resetInfo: 'ETA required. Can extend up to 180 days total.' },
  AU: { maxDays: 90, ruleType: 'reset', resetInfo: 'ETA required (AUD 20). 90 days per visit, multiple entries in 12 months.' },
  NZ: { maxDays: 90, ruleType: 'reset', resetInfo: 'NZeTA required (NZD 17-23). 90 days per visit, can stay up to 6 months in 12-month period.' },
  
  // Schengen Area (all share 90/180 rule) - ETIAS required from Q4 2026
  AT: { 
    maxDays: 90, 
    periodDays: 180, 
    ruleType: 'rolling', 
    resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.',
    sourceUrl: 'https://travel-europe.europa.eu/etias_en',
    lastUpdated: '2024-11'
  },
  BE: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  CZ: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  DK: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  EE: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  FI: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  FR: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  DE: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  GR: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  HU: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  IS: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  IT: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  LV: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  LT: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  LU: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  MT: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  NL: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  NO: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  PL: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  PT: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  SK: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  SI: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  ES: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  SE: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  CH: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€20) required from Q4 2026.' },
  
  // Non-Schengen Europe
  GB: { 
    maxDays: 180, 
    periodDays: 365, 
    ruleType: 'rolling', 
    resetInfo: '180 days in any 365-day period',
    sourceUrl: 'https://www.gov.uk/check-uk-visa',
    lastUpdated: '2024-11'
  },
  IE: { maxDays: 90, ruleType: 'reset', resetInfo: 'Resets upon exit. Independent from UK and Schengen.' },
  HR: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: '90 days in any 180-day period (non-Schengen)' },
  RO: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: '90 days in any 180-day period (non-Schengen)' },
  
  // Americas
  CA: { 
    maxDays: 180, 
    periodDays: 365, 
    ruleType: 'rolling', 
    resetInfo: '180 days in any 365-day period',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html',
    lastUpdated: '2024-11'
  },
  US: { 
    maxDays: 9999, 
    ruleType: 'reset', 
    resetInfo: 'No visa required for US citizens in the United States',
    sourceUrl: 'https://travel.state.gov/',
    lastUpdated: '2024-11'
  },
  MX: { maxDays: 180, ruleType: 'reset', resetInfo: 'Up to 180 days per entry. Tourist card required.' },
  BR: { maxDays: 90, ruleType: 'reset', resetInfo: 'Can extend once for 90 days (180 total).' },
  AR: { maxDays: 90, ruleType: 'reset', resetInfo: 'Can extend for 90 days. Easy to reset via border run.' },
  CL: { maxDays: 90, ruleType: 'reset', resetInfo: 'Can extend for 90 days (180 total).' },
  CO: { maxDays: 90, ruleType: 'reset', resetInfo: 'Can extend to 180 days per calendar year.' },
  CR: { maxDays: 90, ruleType: 'reset', resetInfo: 'Resets after 72 hours outside. Can extend once.' },
  EC: { maxDays: 90, periodDays: 365, ruleType: 'rolling', resetInfo: '90 days per year, extendable to 180 days.' },
  PA: { maxDays: 180, ruleType: 'reset', resetInfo: '180 days per entry for US citizens.' },
  PE: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: '90 days in 180-day period. Can extend.' },
  UY: { maxDays: 90, ruleType: 'reset', resetInfo: 'Can extend for 90 days. Easy border runs to Argentina.' },
  
  // Middle East & Africa
  AE: { maxDays: 30, ruleType: 'reset', resetInfo: 'Can extend twice for 30 days each (90 total).' },
  TR: { maxDays: 90, periodDays: 180, ruleType: 'rolling', resetInfo: '90 days in any 180-day period.' },
  IL: { maxDays: 90, ruleType: 'reset', resetInfo: '90 days per entry. May face questions on frequent entries.' },
  EG: { maxDays: 30, ruleType: 'reset', resetInfo: 'Visa on arrival or e-visa. Can extend in-country.' },
  MA: { maxDays: 90, ruleType: 'reset', resetInfo: '90 days per entry. Cannot extend tourist visa.' },
  ZA: { maxDays: 90, ruleType: 'reset', resetInfo: '90 days per year. Can apply for extension once.' },
}