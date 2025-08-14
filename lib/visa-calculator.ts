import { Stay, VisaStatus, Country } from './types'
import { visaRules } from './visa-rules'
import { differenceInDays, subDays, parseISO } from 'date-fns'

export function calculateVisaStatus(
  stays: Stay[],
  country: Country,
  referenceDate: Date = new Date()
): VisaStatus {
  let daysUsed = 0
  const countryStays = stays.filter(s => s.countryCode === country.code)
  
  // Check for special Korea 183/365 visa type
  const hasSpecialKoreaVisa = country.code === 'KR' && 
    countryStays.some(s => s.visaType === '183/365')
  
  // Use special rule for Korea if 183/365 visa type is present
  const rule = hasSpecialKoreaVisa 
    ? { maxDays: 183, periodDays: 365, ruleType: 'rolling' as const }
    : visaRules[country.code]
  
  if (!rule) {
    return {
      country,
      daysUsed: 0,
      maxDays: 0,
      remainingDays: 0,
      percentage: 0,
      status: 'safe',
    }
  }

  switch (rule.ruleType) {
    case 'reset':
      // For reset type, find continuous stays (no gap or minimal gap between stays)
      const sortedStays = countryStays
        .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
      
      if (sortedStays.length > 0) {
        // Find the most recent continuous stay group
        let currentGroupDays = 0
        let previousExit: Date | null = null
        
        // Process stays from oldest to newest
        for (let i = sortedStays.length - 1; i >= 0; i--) {
          const stay = sortedStays[i]
          const entryDate = parseISO(stay.entryDate)
          const exitDate = stay.exitDate ? parseISO(stay.exitDate) : referenceDate
          
          // If this is the first stay we're checking (most recent) or
          // if there's no significant gap (< 7 days) between this stay and the previous one
          if (!previousExit || differenceInDays(previousExit, exitDate) < 7) {
            const stayDays = differenceInDays(exitDate, entryDate) + 1
            currentGroupDays += stayDays
            previousExit = entryDate
          } else {
            // Gap is too large, stop counting
            break
          }
        }
        
        daysUsed = currentGroupDays
      }
      break

    case 'rolling':
      // Count days within the rolling window
      if (rule.periodDays) {
        const periodStart = subDays(referenceDate, rule.periodDays - 1)
        
        countryStays.forEach(stay => {
          const entryDate = parseISO(stay.entryDate)
          const exitDate = stay.exitDate ? parseISO(stay.exitDate) : referenceDate
          
          // Calculate overlap with the rolling window
          const overlapStart = entryDate < periodStart ? periodStart : entryDate
          const overlapEnd = exitDate > referenceDate ? referenceDate : exitDate
          
          if (overlapStart <= overlapEnd) {
            const overlap = differenceInDays(overlapEnd, overlapStart) + 1
            daysUsed += overlap
          }
        })
      }
      break
  }

  const remainingDays = Math.max(0, rule.maxDays - daysUsed)
  const percentage = rule.maxDays > 0 ? (daysUsed / rule.maxDays) * 100 : 0

  let status: 'safe' | 'warning' | 'danger' = 'safe'
  if (percentage >= 100) {
    status = 'danger'
  } else if (percentage >= 80) {
    status = 'danger'
  } else if (percentage >= 60) {
    status = 'warning'
  }

  return {
    country,
    daysUsed,
    maxDays: rule.maxDays,
    remainingDays,
    percentage: Math.min(100, percentage),
    status,
  }
}