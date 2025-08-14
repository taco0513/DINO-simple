// Extended visa rule types with more detailed information
export interface ExtendedVisaRule {
  // Basic visa information
  maxDays: number
  periodDays?: number
  ruleType: 'reset' | 'rolling' | 'annual'
  resetInfo?: string
  
  // Visa costs and application
  visaCost?: {
    currency: string
    amount: number
    type: 'free' | 'on-arrival' | 'e-visa' | 'embassy' | 'eta'
    processingTime?: string // e.g., "3-5 business days"
  }
  
  // Special visa types available
  specialVisas?: {
    workingHoliday?: {
      available: boolean
      ageLimit?: string // e.g., "18-30"
      maxDuration?: number // in days
      quota?: number // annual quota if applicable
      requirements?: string[]
    }
    digitalNomad?: {
      available: boolean
      minIncome?: number // USD per month
      maxDuration?: number // in days
      requirements?: string[]
      cost?: number // in USD
    }
    studentVisa?: {
      available: boolean
      maxDuration?: number
      workAllowed?: boolean
    }
    retirementVisa?: {
      available: boolean
      minAge?: number
      minIncome?: number // USD per month
      requirements?: string[]
    }
  }
  
  // Visa exemption agreements
  exemptionInfo?: {
    diplomaticPassport?: boolean
    officialPassport?: boolean
    specialAgreements?: string[] // e.g., ["APEC Card holders: 90 days"]
  }
  
  // Extension information
  extension?: {
    possible: boolean
    maxExtension?: number // additional days
    cost?: number // in USD
    requirements?: string
  }
  
  // Additional information
  multipleEntry?: boolean
  workPermitted?: boolean
  businessPermitted?: boolean
  minimumPassportValidity?: number // months
  proofOfOnwardTravel?: boolean
  proofOfFunds?: {
    required: boolean
    amount?: number // in USD
  }
  yellowFeverVaccination?: boolean
  covidRequirements?: string
  
  // Metadata
  sourceUrl?: string
  lastUpdated?: string // YYYY-MM format
  notes?: string
}

// Extended visa rules for Korea (한국인 여권 기준)
export const visaRulesForKoreanPassport: Record<string, ExtendedVisaRule> = {
  // 아시아-태평양
  JP: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: '출국 시 리셋. 관광/상용 목적',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    specialVisas: {
      workingHoliday: {
        available: true,
        ageLimit: '18-30',
        maxDuration: 365,
        quota: 10000,
        requirements: ['연령 제한', '재정 증명', '왕복 항공권']
      }
    },
    exemptionInfo: {
      diplomaticPassport: true,
      officialPassport: true
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    sourceUrl: 'https://www.kr.emb-japan.go.jp/',
    lastUpdated: '2024-11'
  },
  
  TH: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: '출국 시 리셋. 육로 입국 시 30일',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    specialVisas: {
      digitalNomad: {
        available: true,
        minIncome: 80000, // USD per year
        maxDuration: 1825, // 5 years
        requirements: ['고용 증명', '소득 증명', '건강 보험'],
        cost: 300
      }
    },
    extension: {
      possible: true,
      maxExtension: 30,
      cost: 60,
      requirements: 'Immigration office visit required'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    sourceUrl: 'https://www.thaiembassy.com/thailand/',
    lastUpdated: '2024-11'
  },
  
  SG: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: '출국 시 리셋',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: true,
      maxExtension: 89,
      cost: 40,
      requirements: 'Valid reason required'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    proofOfOnwardTravel: true,
    sourceUrl: 'https://www.ica.gov.sg/',
    lastUpdated: '2024-11'
  },
  
  VN: {
    maxDays: 45,
    ruleType: 'reset',
    resetInfo: '45일 무비자. 출국 후 즉시 재입국 가능',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free',
      processingTime: 'Instant'
    },
    specialVisas: {
      digitalNomad: {
        available: false
      }
    },
    extension: {
      possible: true,
      maxExtension: 45,
      cost: 25,
      requirements: 'Through travel agency'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: false,
    sourceUrl: 'https://vietnam.vn/',
    lastUpdated: '2024-08'
  },
  
  // 유럽 (쉥겐)
  FR: {
    maxDays: 90,
    periodDays: 180,
    ruleType: 'rolling',
    resetInfo: '쉥겐 지역: 180일 중 90일. 2025년부터 ETIAS 필요',
    visaCost: {
      currency: 'EUR',
      amount: 7,
      type: 'eta',
      processingTime: 'Few minutes to 96 hours'
    },
    specialVisas: {
      workingHoliday: {
        available: true,
        ageLimit: '18-30',
        maxDuration: 365,
        quota: 2000,
        requirements: ['연령 제한', '재정 증명', '건강 보험']
      }
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 3,
    sourceUrl: 'https://france-visas.gouv.fr/',
    lastUpdated: '2024-11'
  },
  
  DE: {
    maxDays: 90,
    periodDays: 180,
    ruleType: 'rolling',
    resetInfo: '쉥겐 지역: 180일 중 90일',
    visaCost: {
      currency: 'EUR',
      amount: 7,
      type: 'eta',
      processingTime: 'Few minutes to 96 hours'
    },
    specialVisas: {
      workingHoliday: {
        available: true,
        ageLimit: '18-30',
        maxDuration: 365,
        requirements: ['연령 제한', '재정 증명', '건강 보험']
      }
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 3,
    sourceUrl: 'https://www.germany.info/',
    lastUpdated: '2024-11'
  },
  
  // 미주
  US: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'ESTA 필요. 2년 유효, 90일 체류',
    visaCost: {
      currency: 'USD',
      amount: 21,
      type: 'eta',
      processingTime: '72 hours'
    },
    specialVisas: {
      studentVisa: {
        available: true,
        maxDuration: 0, // Duration of study
        workAllowed: true // with restrictions
      }
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 6,
    proofOfOnwardTravel: true,
    sourceUrl: 'https://esta.cbp.dhs.gov/',
    lastUpdated: '2024-11'
  },
  
  CA: {
    maxDays: 180,
    ruleType: 'reset',
    resetInfo: 'eTA 필요. 5년 유효 또는 여권 만료까지',
    visaCost: {
      currency: 'CAD',
      amount: 7,
      type: 'eta',
      processingTime: 'Few minutes'
    },
    specialVisas: {
      workingHoliday: {
        available: true,
        ageLimit: '18-30',
        maxDuration: 365,
        requirements: ['연령 제한', '재정 증명', '건강 보험']
      }
    },
    extension: {
      possible: true,
      maxExtension: 180,
      cost: 100,
      requirements: 'Valid reason required'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    sourceUrl: 'https://www.canada.ca/',
    lastUpdated: '2024-11'
  },
  
  MX: {
    maxDays: 180,
    ruleType: 'reset',
    resetInfo: '최대 180일. 입국 시 기간 결정',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: true,
      maxExtension: 180,
      cost: 30,
      requirements: 'Immigration office visit'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    sourceUrl: 'https://www.gob.mx/inm',
    lastUpdated: '2024-11'
  },
  
  // 오세아니아
  AU: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'ETA 필요. 12개월 유효, 방문당 90일',
    visaCost: {
      currency: 'AUD',
      amount: 20,
      type: 'eta',
      processingTime: 'Instant to 24 hours'
    },
    specialVisas: {
      workingHoliday: {
        available: true,
        ageLimit: '18-30',
        maxDuration: 365,
        requirements: ['연령 제한', '재정 증명', '건강 검진']
      }
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 6,
    sourceUrl: 'https://immi.homeaffairs.gov.au/',
    lastUpdated: '2024-11'
  },
  
  NZ: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'NZeTA 필요. 2년 유효',
    visaCost: {
      currency: 'NZD',
      amount: 23,
      type: 'eta',
      processingTime: '10 minutes to 72 hours'
    },
    specialVisas: {
      workingHoliday: {
        available: true,
        ageLimit: '18-30',
        maxDuration: 365,
        quota: 3000,
        requirements: ['연령 제한', '재정 증명', '건강 보험']
      }
    },
    extension: {
      possible: true,
      maxExtension: 90,
      cost: 0,
      requirements: 'Total stay cannot exceed 9 months in 18 months'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    proofOfOnwardTravel: true,
    sourceUrl: 'https://www.immigration.govt.nz/',
    lastUpdated: '2024-11'
  }
}

// Extended visa rules for US passport (기존 규칙 확장)
export const visaRulesForUSPassport: Record<string, ExtendedVisaRule> = {
  KR: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'K-ETA required. Resets upon exit',
    visaCost: {
      currency: 'KRW',
      amount: 10000,
      type: 'eta',
      processingTime: '24-72 hours'
    },
    specialVisas: {
      digitalNomad: {
        available: true,
        minIncome: 66000, // USD per year
        maxDuration: 730, // 2 years
        requirements: ['Employment proof', 'Income proof', 'Health insurance'],
        cost: 130
      },
      workingHoliday: {
        available: false // Not available for US citizens
      }
    },
    extension: {
      possible: true,
      maxExtension: 90,
      cost: 60,
      requirements: 'Valid reason and immigration office visit'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 6,
    sourceUrl: 'https://www.k-eta.go.kr/',
    lastUpdated: '2024-11'
  },
  
  JP: {
    maxDays: 90,
    periodDays: 180,
    ruleType: 'rolling',
    resetInfo: '90 days within any 180-day period',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    specialVisas: {
      digitalNomad: {
        available: true,
        minIncome: 0, // Case by case
        maxDuration: 180, // 6 months
        requirements: ['Remote work contract', 'Private health insurance'],
        cost: 0
      }
    },
    extension: {
      possible: true,
      maxExtension: 90,
      cost: 40,
      requirements: 'Valid reason required'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 0, // Valid for duration of stay
    sourceUrl: 'https://www.mofa.go.jp/',
    lastUpdated: '2024-11'
  },
  
  VN: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'E-visa required ($25). Multiple entry available. Cannot extend beyond 90 days.',
    visaCost: {
      currency: 'USD',
      amount: 25,
      type: 'e-visa',
      processingTime: '3 business days'
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: false,
    minimumPassportValidity: 6,
    sourceUrl: 'https://evisa.xuatnhapcanh.gov.vn/',
    lastUpdated: '2023-08'
  },
  
  TH: {
    maxDays: 60,
    ruleType: 'reset',
    resetInfo: 'Resets upon exit. Land border: max 2 entries/year',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free',
      processingTime: 'On arrival'
    },
    specialVisas: {
      digitalNomad: {
        available: true,
        minIncome: 80000, // USD per year
        maxDuration: 3650, // 10 years (5+5)
        requirements: ['Employment proof', 'Income proof', 'Health insurance'],
        cost: 300
      },
      retirementVisa: {
        available: true,
        minAge: 50,
        minIncome: 2000, // USD per month
        requirements: ['Age proof', 'Financial proof', 'Health insurance']
      }
    },
    extension: {
      possible: true,
      maxExtension: 30,
      cost: 60,
      requirements: 'Immigration office visit'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: false,
    proofOfOnwardTravel: true,
    proofOfFunds: {
      required: true,
      amount: 700 // per person
    },
    sourceUrl: 'https://www.thaiembassy.com/',
    lastUpdated: '2024-07'
  },

  SG: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'Resets upon exit. Frequent visa runs may be questioned.',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: true,
      maxExtension: 89,
      cost: 40,
      requirements: 'Valid reason required'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    proofOfOnwardTravel: true,
    sourceUrl: 'https://www.ica.gov.sg/',
    lastUpdated: '2024-11'
  },

  MY: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'Resets upon exit. Multiple entries allowed. Must complete MDAC within 3 days before arrival (free).',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: true,
      maxExtension: 30,
      cost: 35,
      requirements: 'Immigration office visit'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 6,
    sourceUrl: 'https://www.imi.gov.my/',
    lastUpdated: '2024-11'
  },

  // Schengen Area (sample countries)
  FR: {
    maxDays: 90,
    periodDays: 180,
    ruleType: 'rolling',
    resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€7) required from 2025.',
    visaCost: {
      currency: 'EUR',
      amount: 7,
      type: 'eta',
      processingTime: 'Few minutes to 96 hours'
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 3,
    sourceUrl: 'https://france-visas.gouv.fr/',
    lastUpdated: '2024-11'
  },

  GB: {
    maxDays: 180,
    periodDays: 365,
    ruleType: 'rolling',
    resetInfo: '180 days in any 365-day period',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 0,
    sourceUrl: 'https://www.gov.uk/check-uk-visa',
    lastUpdated: '2024-11'
  },

  // More Asia-Pacific countries
  PH: {
    maxDays: 30,
    ruleType: 'reset',
    resetInfo: 'Resets upon exit. Can extend up to 36 months in-country.',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: true,
      maxExtension: 29, // First extension
      cost: 75,
      requirements: 'Immigration office visit. Multiple extensions possible up to 36 months'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: false,
    minimumPassportValidity: 6,
    proofOfOnwardTravel: true,
    sourceUrl: 'https://www.immigration.gov.ph/',
    lastUpdated: '2024-11'
  },

  ID: {
    maxDays: 30,
    ruleType: 'reset',
    resetInfo: 'Resets upon exit. Can extend once for 30 days.',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    specialVisas: {
      digitalNomad: {
        available: true,
        minIncome: 60000, // USD per year
        maxDuration: 1825, // 5 years
        requirements: ['Remote work proof', 'Income proof', 'Health insurance'],
        cost: 300
      }
    },
    extension: {
      possible: true,
      maxExtension: 30,
      cost: 50,
      requirements: 'Immigration office visit. Only one extension allowed'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: false,
    minimumPassportValidity: 6,
    sourceUrl: 'https://www.imigrasi.go.id/',
    lastUpdated: '2024-11'
  },

  TW: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'Resets upon exit. Immediate re-entry allowed.',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: true,
      maxExtension: 90,
      cost: 100,
      requirements: 'Valid reason required'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 6,
    sourceUrl: 'https://www.boca.gov.tw/',
    lastUpdated: '2024-11'
  },

  HK: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'Resets upon exit. Immediate re-entry allowed.',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: true,
      maxExtension: 90,
      cost: 30,
      requirements: 'Immigration department visit'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    sourceUrl: 'https://www.immd.gov.hk/',
    lastUpdated: '2024-11'
  },

  AU: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'ETA required (AUD 20). 90 days per visit, multiple entries in 12 months.',
    visaCost: {
      currency: 'AUD',
      amount: 20,
      type: 'eta',
      processingTime: 'Instant to 24 hours'
    },
    specialVisas: {
      workingHoliday: {
        available: true,
        ageLimit: '18-30',
        maxDuration: 365,
        requirements: ['Age proof', 'Financial proof', 'Health check']
      }
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 6,
    sourceUrl: 'https://immi.homeaffairs.gov.au/',
    lastUpdated: '2024-11'
  },

  NZ: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'NZeTA required (NZD 17-23). 90 days per visit, can stay up to 6 months in 12-month period.',
    visaCost: {
      currency: 'NZD',
      amount: 23,
      type: 'eta',
      processingTime: '10 minutes to 72 hours'
    },
    specialVisas: {
      workingHoliday: {
        available: true,
        ageLimit: '18-30',
        maxDuration: 365,
        requirements: ['Age proof', 'Financial proof', 'Health insurance']
      }
    },
    extension: {
      possible: true,
      maxExtension: 90,
      cost: 0,
      requirements: 'Total stay cannot exceed 9 months in 18 months'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    proofOfOnwardTravel: true,
    sourceUrl: 'https://www.immigration.govt.nz/',
    lastUpdated: '2024-11'
  },

  // Americas
  CA: {
    maxDays: 180,
    periodDays: 365,
    ruleType: 'rolling',
    resetInfo: '180 days in any 365-day period',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: true,
      maxExtension: 180,
      cost: 100,
      requirements: 'Valid reason required'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 0,
    sourceUrl: 'https://www.canada.ca/',
    lastUpdated: '2024-11'
  },

  MX: {
    maxDays: 180,
    ruleType: 'reset',
    resetInfo: 'Up to 180 days per entry. Tourist card required.',
    visaCost: {
      currency: 'USD',
      amount: 30,
      type: 'on-arrival',
      processingTime: 'Immediate'
    },
    specialVisas: {
      digitalNomad: {
        available: true,
        minIncome: 2500, // USD per month
        maxDuration: 1460, // 4 years
        requirements: ['Remote work proof', 'Income proof'],
        cost: 200
      }
    },
    extension: {
      possible: true,
      maxExtension: 180,
      cost: 30,
      requirements: 'Immigration office visit before expiry'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: false,
    sourceUrl: 'https://www.gob.mx/inm',
    lastUpdated: '2024-11'
  },

  BR: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'Can extend once for 90 days (180 total).',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    specialVisas: {
      digitalNomad: {
        available: true,
        minIncome: 1500, // USD per month
        maxDuration: 730, // 2 years
        requirements: ['Remote work proof', 'Income proof', 'Health insurance'],
        cost: 100
      }
    },
    extension: {
      possible: true,
      maxExtension: 90,
      cost: 25,
      requirements: 'Federal Police website or office'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: false,
    minimumPassportValidity: 6,
    sourceUrl: 'https://www.gov.br/pf/',
    lastUpdated: '2024-11'
  },

  AR: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: 'Can extend for 90 days. Easy to reset via border run.',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    specialVisas: {
      digitalNomad: {
        available: true,
        minIncome: 0, // No specific requirement
        maxDuration: 365,
        requirements: ['Remote work proof'],
        cost: 200
      }
    },
    extension: {
      possible: true,
      maxExtension: 90,
      cost: 50,
      requirements: 'Online or immigration office'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: false,
    sourceUrl: 'https://www.argentina.gob.ar/',
    lastUpdated: '2024-11'
  },

  // More European countries
  ES: {
    maxDays: 90,
    periodDays: 180,
    ruleType: 'rolling',
    resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€7) required from 2025.',
    visaCost: {
      currency: 'EUR',
      amount: 7,
      type: 'eta',
      processingTime: 'Few minutes to 96 hours'
    },
    specialVisas: {
      digitalNomad: {
        available: true,
        minIncome: 2500, // EUR per month
        maxDuration: 1825, // 5 years
        requirements: ['Remote work proof', 'Income proof', 'Health insurance'],
        cost: 80
      }
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 3,
    sourceUrl: 'https://www.exteriores.gob.es/',
    lastUpdated: '2024-11'
  },

  IT: {
    maxDays: 90,
    periodDays: 180,
    ruleType: 'rolling',
    resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€7) required from 2025.',
    visaCost: {
      currency: 'EUR',
      amount: 7,
      type: 'eta',
      processingTime: 'Few minutes to 96 hours'
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 3,
    sourceUrl: 'https://www.esteri.it/',
    lastUpdated: '2024-11'
  },

  DE: {
    maxDays: 90,
    periodDays: 180,
    ruleType: 'rolling',
    resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€7) required from 2025.',
    visaCost: {
      currency: 'EUR',
      amount: 7,
      type: 'eta',
      processingTime: 'Few minutes to 96 hours'
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 3,
    sourceUrl: 'https://www.auswaertiges-amt.de/',
    lastUpdated: '2024-11'
  },

  PT: {
    maxDays: 90,
    periodDays: 180,
    ruleType: 'rolling',
    resetInfo: 'Schengen Area: 90 days in any 180-day period. ETIAS (€7) required from 2025.',
    visaCost: {
      currency: 'EUR',
      amount: 7,
      type: 'eta',
      processingTime: 'Few minutes to 96 hours'
    },
    specialVisas: {
      digitalNomad: {
        available: true,
        minIncome: 3000, // EUR per month
        maxDuration: 730, // 2 years renewable
        requirements: ['Remote work proof', 'Income proof', 'Tax residency proof'],
        cost: 90
      }
    },
    extension: {
      possible: false
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 3,
    sourceUrl: 'https://www.vistos.mne.gov.pt/',
    lastUpdated: '2024-11'
  },

  // Middle East & Africa
  AE: {
    maxDays: 30,
    ruleType: 'reset',
    resetInfo: 'Can extend twice for 30 days each (90 total).',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    specialVisas: {
      digitalNomad: {
        available: true,
        minIncome: 5000, // USD per month
        maxDuration: 365,
        requirements: ['Remote work proof', 'Income proof', 'Health insurance'],
        cost: 300
      }
    },
    extension: {
      possible: true,
      maxExtension: 30,
      cost: 150,
      requirements: 'Can extend twice for total 90 days'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 6,
    sourceUrl: 'https://www.icp.gov.ae/',
    lastUpdated: '2024-11'
  },

  TR: {
    maxDays: 90,
    periodDays: 180,
    ruleType: 'rolling',
    resetInfo: '90 days in any 180-day period.',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: true,
      maxExtension: 90,
      cost: 100,
      requirements: 'Residence permit required for longer stays'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: false,
    minimumPassportValidity: 6,
    sourceUrl: 'https://www.mfa.gov.tr/',
    lastUpdated: '2024-11'
  },

  IL: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: '90 days per entry. May face questions on frequent entries.',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: true,
      maxExtension: 90,
      cost: 50,
      requirements: 'Interior Ministry office'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: true,
    minimumPassportValidity: 6,
    sourceUrl: 'https://www.gov.il/',
    lastUpdated: '2024-11'
  },

  ZA: {
    maxDays: 90,
    ruleType: 'reset',
    resetInfo: '90 days per year. Can apply for extension once.',
    visaCost: {
      currency: 'FREE',
      amount: 0,
      type: 'free'
    },
    extension: {
      possible: true,
      maxExtension: 90,
      cost: 50,
      requirements: 'Department of Home Affairs'
    },
    multipleEntry: true,
    workPermitted: false,
    businessPermitted: false,
    minimumPassportValidity: 6,
    proofOfOnwardTravel: true,
    sourceUrl: 'https://www.dha.gov.za/',
    lastUpdated: '2024-11'
  }
}