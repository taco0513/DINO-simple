import { Stay, VisaStatus, Country } from './types'
import { visaRules } from './visa-rules'
import { differenceInDays, subDays, parseISO, format, startOfDay } from 'date-fns'

export function calculateVisaStatus(
  stays: Stay[],
  country: Country,
  referenceDate: Date = new Date()
): VisaStatus {
  // Ensure reference date is normalized to start of day
  referenceDate = startOfDay(referenceDate)
  let daysUsed = 0
  let currentDays = 0  // Days from past and current stays
  let plannedDays = 0  // Days from future stays
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
        .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()) // Sort by newest first
      
      if (sortedStays.length > 0) {
        // Find the most recent continuous stay group
        let currentGroupDays = 0
        let nextEntry: Date | null = null
        
        // Process stays from newest to oldest
        for (let i = 0; i < sortedStays.length; i++) {
          const stay = sortedStays[i]
          const entryDate = startOfDay(parseISO(stay.entryDate))
          const exitDate = stay.exitDate ? startOfDay(parseISO(stay.exitDate)) : referenceDate
          
          // If this is the first stay we're checking (most recent) or
          // if there's no significant gap (< 7 days) between this stay's exit and the next stay's entry
          if (!nextEntry || differenceInDays(nextEntry, exitDate) < 7) {
            const stayDays = differenceInDays(exitDate, entryDate) + 1
            currentGroupDays += stayDays
            
            // Separate current/past days from future days
            if (entryDate > referenceDate) {
              // Future stay
              plannedDays += stayDays
            } else if (exitDate > referenceDate) {
              // Ongoing stay (started in past, extends to future)
              const pastDays = differenceInDays(referenceDate, entryDate) + 1
              const futureDays = differenceInDays(exitDate, referenceDate)
              currentDays += pastDays
              plannedDays += futureDays
            } else {
              // Past stay
              currentDays += stayDays
            }
            
            nextEntry = entryDate
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
        // Use startOfDay to ensure consistent date handling
        // For 365-day period: today minus 365 days (not 364)
        const periodStart = startOfDay(subDays(referenceDate, rule.periodDays))
        
        
        countryStays.forEach(stay => {
          // Parse dates and normalize to start of day to avoid timezone issues
          const entryDate = startOfDay(parseISO(stay.entryDate))
          const exitDate = stay.exitDate ? startOfDay(parseISO(stay.exitDate)) : referenceDate
          
          
          // Handle future stays separately - they don't count in the current rolling window
          // but we want to track them as planned days
          if (entryDate > referenceDate) {
            // This is a future stay - count all its days as planned
            const stayDays = differenceInDays(exitDate, entryDate) + 1
            plannedDays += stayDays
            
            return // Skip to next stay
          }
          
          // For past and ongoing stays, calculate overlap with the rolling window
          const overlapStart = entryDate < periodStart ? periodStart : entryDate
          const overlapEnd = exitDate > referenceDate ? referenceDate : exitDate
          
          if (overlapStart <= overlapEnd) {
            const diffDays = differenceInDays(overlapEnd, overlapStart)
            const overlap = diffDays + 1
            
            if (exitDate > referenceDate) {
              // Ongoing stay (crosses today)
              // Calculate days up to today (including today)
              const startDate = overlapStart > entryDate ? overlapStart : entryDate
              const daysToToday = differenceInDays(referenceDate, startDate) + 1
              // Calculate days after today (these are planned days)
              const daysAfterToday = differenceInDays(exitDate, referenceDate)
              
              currentDays += Math.max(0, daysToToday)
              plannedDays += Math.max(0, daysAfterToday)
              
            } else {
              // Past stay
              currentDays += overlap
              
            }
            
            
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
    currentDays,
    plannedDays,
    maxDays: rule.maxDays,
    remainingDays,
    percentage: Math.min(100, percentage),
    status,
  }
}