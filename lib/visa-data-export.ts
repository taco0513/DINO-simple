import { ExtendedVisaRule } from './visa-rules-extended'
import { visaRulesForUSPassport, visaRulesForKoreanPassport } from './visa-rules-extended'

export interface VisaDataCSVRow {
  countryCode: string
  countryName: string
  passportNationality: string
  maxDays: number
  periodDays: number | ''
  ruleType: string
  visaFree: 'Yes' | 'No'
  visaCost: number
  visaCurrency: string
  visaType: string
  processingTime: string
  digitalNomadAvailable: 'Yes' | 'No'
  digitalNomadMinIncome: number | ''
  digitalNomadDuration: number | ''
  workingHolidayAvailable: 'Yes' | 'No'
  workingHolidayAgeLimit: string
  extensionPossible: 'Yes' | 'No'
  extensionDays: number | ''
  extensionCost: number | ''
  multipleEntry: 'Yes' | 'No'
  minimumPassportValidity: number | ''
  proofOfOnwardTravel: 'Yes' | 'No'
  sourceUrl: string
  lastUpdated: string
  notes: string
}

const countryNames: Record<string, string> = {
  KR: 'South Korea',
  JP: 'Japan',
  VN: 'Vietnam',
  TH: 'Thailand',
  SG: 'Singapore',
  MY: 'Malaysia',
  PH: 'Philippines',
  ID: 'Indonesia',
  TW: 'Taiwan',
  HK: 'Hong Kong',
  AU: 'Australia',
  NZ: 'New Zealand',
  CA: 'Canada',
  MX: 'Mexico',
  BR: 'Brazil',
  AR: 'Argentina',
  GB: 'United Kingdom',
  FR: 'France',
  DE: 'Germany',
  ES: 'Spain',
  IT: 'Italy',
  PT: 'Portugal',
  AE: 'UAE',
  TR: 'Turkey',
  IL: 'Israel',
  ZA: 'South Africa',
  US: 'United States',
}

function convertRuleToCSVRow(
  countryCode: string,
  rule: ExtendedVisaRule,
  passportNationality: string
): VisaDataCSVRow {
  return {
    countryCode,
    countryName: countryNames[countryCode] || countryCode,
    passportNationality,
    maxDays: rule.maxDays,
    periodDays: rule.periodDays || '',
    ruleType: rule.ruleType,
    visaFree: rule.visaCost?.amount === 0 || !rule.visaCost ? 'Yes' : 'No',
    visaCost: rule.visaCost?.amount || 0,
    visaCurrency: rule.visaCost?.currency || '',
    visaType: rule.visaCost?.type || '',
    processingTime: rule.visaCost?.processingTime || '',
    digitalNomadAvailable: rule.specialVisas?.digitalNomad?.available ? 'Yes' : 'No',
    digitalNomadMinIncome: rule.specialVisas?.digitalNomad?.minIncome || '',
    digitalNomadDuration: rule.specialVisas?.digitalNomad?.maxDuration || '',
    workingHolidayAvailable: rule.specialVisas?.workingHoliday?.available ? 'Yes' : 'No',
    workingHolidayAgeLimit: rule.specialVisas?.workingHoliday?.ageLimit || '',
    extensionPossible: rule.extension?.possible ? 'Yes' : 'No',
    extensionDays: rule.extension?.maxExtension || '',
    extensionCost: rule.extension?.cost || '',
    multipleEntry: rule.multipleEntry ? 'Yes' : 'No',
    minimumPassportValidity: rule.minimumPassportValidity || '',
    proofOfOnwardTravel: rule.proofOfOnwardTravel ? 'Yes' : 'No',
    sourceUrl: rule.sourceUrl || '',
    lastUpdated: rule.lastUpdated || '',
    notes: rule.notes || rule.resetInfo || ''
  }
}

export function exportVisaDataToCSV(): string {
  const rows: VisaDataCSVRow[] = []
  
  // Add US passport data
  Object.entries(visaRulesForUSPassport).forEach(([code, rule]) => {
    rows.push(convertRuleToCSVRow(code, rule, 'US'))
  })
  
  // Add Korean passport data
  Object.entries(visaRulesForKoreanPassport).forEach(([code, rule]) => {
    rows.push(convertRuleToCSVRow(code, rule, 'KR'))
  })
  
  // Create CSV header
  const headers = [
    'Country Code',
    'Country Name',
    'Passport Nationality',
    'Max Days',
    'Period Days',
    'Rule Type',
    'Visa Free',
    'Visa Cost',
    'Visa Currency',
    'Visa Type',
    'Processing Time',
    'Digital Nomad Available',
    'Digital Nomad Min Income (USD/month)',
    'Digital Nomad Duration (days)',
    'Working Holiday Available',
    'Working Holiday Age Limit',
    'Extension Possible',
    'Extension Days',
    'Extension Cost (USD)',
    'Multiple Entry',
    'Min Passport Validity (months)',
    'Proof of Onward Travel',
    'Source URL',
    'Last Updated',
    'Notes'
  ]
  
  // Convert rows to CSV format
  const csvRows = [headers.join(',')]
  
  rows.forEach(row => {
    const values = [
      row.countryCode,
      `"${row.countryName}"`,
      row.passportNationality,
      row.maxDays,
      row.periodDays,
      row.ruleType,
      row.visaFree,
      row.visaCost,
      row.visaCurrency,
      row.visaType,
      `"${row.processingTime}"`,
      row.digitalNomadAvailable,
      row.digitalNomadMinIncome,
      row.digitalNomadDuration,
      row.workingHolidayAvailable,
      `"${row.workingHolidayAgeLimit}"`,
      row.extensionPossible,
      row.extensionDays,
      row.extensionCost,
      row.multipleEntry,
      row.minimumPassportValidity,
      row.proofOfOnwardTravel,
      `"${row.sourceUrl}"`,
      row.lastUpdated,
      `"${row.notes.replace(/"/g, '""')}"`
    ]
    csvRows.push(values.join(','))
  })
  
  return csvRows.join('\n')
}

export function downloadVisaDataCSV(filename: string = 'visa-data.csv') {
  const csv = exportVisaDataToCSV()
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}