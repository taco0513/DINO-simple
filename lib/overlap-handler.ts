import { Stay } from './types'
import { parseISO, isBefore, isAfter, format, subDays, addDays } from 'date-fns'

/**
 * 새로운 체류 기록을 추가할 때 기존 체류와의 오버랩을 자동으로 처리합니다.
 * 
 * 로직:
 * 1. 새 체류의 시작일에 다른 나라에서 체류 중이던 기록이 있으면 그 기록을 같은 날에 종료
 * 2. 새 체류가 종료될 때 다른 체류가 시작되면 해당 체류로 자동 연결
 * 3. Inclusive 처리: A국 체류 종료일과 B국 체류 시작일이 같은 날 허용 (같은 날 출국/입국)
 */
export function resolveStayOverlaps(stays: Stay[], newStay: Stay): Stay[] {
  // 날짜 기준으로 정렬
  const allStays = [...stays, newStay].sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )

  const resolvedStays: Stay[] = []
  
  for (let i = 0; i < allStays.length; i++) {
    const currentStay = { ...allStays[i] }
    const entryDate = parseISO(currentStay.entryDate)
    
    // 이 체류 시작 시점에 다른 나라에서 체류 중인 기록이 있는지 확인
    const overlappingStay = resolvedStays.find(stay => {
      if (stay.countryCode === currentStay.countryCode) return false // 같은 나라는 제외
      if (stay.exitDate) return false // 이미 종료된 체류는 제외
      
      const stayEntryDate = parseISO(stay.entryDate)
      return isBefore(stayEntryDate, entryDate) || stayEntryDate.getTime() === entryDate.getTime()
    })
    
    // 오버랩되는 체류가 있으면 해당 체류를 같은 날에 종료 (inclusive)
    if (overlappingStay) {
      const exitDate = format(entryDate, 'yyyy-MM-dd')
      overlappingStay.exitDate = exitDate
      
      // 새 체류에 From 정보가 없으면 종료되는 체류에서 가져오기
      if (!currentStay.fromCountryCode && overlappingStay) {
        currentStay.fromCountryCode = overlappingStay.countryCode
        currentStay.fromCity = overlappingStay.city
      }
    }
    
    // 다음 체류와의 연결 처리
    const nextStay = allStays[i + 1]
    if (nextStay && !currentStay.exitDate && nextStay.countryCode !== currentStay.countryCode) {
      const nextEntryDate = parseISO(nextStay.entryDate)
      const currentEntryDate = parseISO(currentStay.entryDate)
      
      // 다음 체류가 시작되면 현재 체류를 같은 날에 종료 (inclusive)
      if (isAfter(nextEntryDate, currentEntryDate)) {
        const exitDate = format(nextEntryDate, 'yyyy-MM-dd')
        currentStay.exitDate = exitDate
        
        // 다음 체류에 From 정보가 없으면 현재 체류에서 가져오기
        if (!nextStay.fromCountryCode) {
          nextStay.fromCountryCode = currentStay.countryCode
          nextStay.fromCity = currentStay.city
        }
      }
    }
    
    resolvedStays.push(currentStay)
  }
  
  return resolvedStays.filter(stay => stay.id !== newStay.id ? true : false).concat([
    resolvedStays.find(stay => stay.id === newStay.id)!
  ])
}

/**
 * 기존 체류들 간의 모든 오버랩을 해결합니다.
 */
export function resolveAllOverlaps(stays: Stay[]): Stay[] {
  if (stays.length <= 1) return stays
  
  // 날짜순으로 정렬
  const sortedStays = [...stays].sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )
  
  const resolvedStays: Stay[] = []
  
  for (let i = 0; i < sortedStays.length; i++) {
    const currentStay = { ...sortedStays[i] }
    const nextStay = sortedStays[i + 1]
    
    // 다음 체류가 있고, 현재 체류가 종료되지 않은 상태에서 다른 나라로 이동하는 경우
    if (nextStay && !currentStay.exitDate && nextStay.countryCode !== currentStay.countryCode) {
      const nextEntryDate = parseISO(nextStay.entryDate)
      const currentEntryDate = parseISO(currentStay.entryDate)
      
      if (isAfter(nextEntryDate, currentEntryDate)) {
        // 현재 체류를 다음 체류 시작일에 종료 (inclusive)
        const exitDate = format(nextEntryDate, 'yyyy-MM-dd')
        currentStay.exitDate = exitDate
        
        // 다음 체류에 From 정보 자동 설정
        if (!nextStay.fromCountryCode) {
          nextStay.fromCountryCode = currentStay.countryCode
          nextStay.fromCity = currentStay.city
        }
      }
    }
    
    resolvedStays.push(currentStay)
  }
  
  return resolvedStays
}