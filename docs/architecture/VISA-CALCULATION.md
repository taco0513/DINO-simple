# Visa Calculation Architecture Documentation

## Overview
The visa calculation system is the core engine of DINO, responsible for tracking visa usage, calculating remaining days, and providing warnings based on complex international visa rules. It handles various visa types including rolling windows, reset-on-exit, and annual limits with special cases for different nationalities.

## System Architecture

### Component Hierarchy
```
lib/
├── visa-calculator.ts         # Core calculation engine
├── visa-rules.ts              # Basic visa rule definitions
├── visa-rules-extended.ts     # Extended rules with details
├── countries.ts               # Country database
└── types.ts                   # TypeScript interfaces

components/
├── VisaCard.tsx               # Visual representation
├── VisaDetailModal.tsx        # Detailed information display
└── StatsCards.tsx             # Statistical calculations
```

## Core Concepts

### 1. Visa Rule Types

#### Reset on Exit
Countries where visa days reset to zero upon leaving the country.

```typescript
interface ResetRule {
  ruleType: 'reset'
  maxDays: number
  resetInfo: string
}

// Example: Thailand
{
  ruleType: 'reset',
  maxDays: 60,
  resetInfo: 'Resets upon exit. Land border: max 2 entries/year'
}
```

**Countries using this rule**:
- Thailand (60 days)
- Singapore (90 days)
- South Korea (90 days)
- Vietnam (90 days via e-visa)
- Malaysia (90 days)
- Philippines (30 days)

**Calculation Logic**:
```typescript
case 'reset':
  // Only count current stay
  const currentStay = stays
    .filter(s => s.countryCode === country.code)
    .find(s => {
      const exitDate = s.exitDate ? new Date(s.exitDate) : new Date()
      return exitDate >= referenceDate
    })
  
  if (currentStay) {
    const entryDate = new Date(currentStay.entryDate)
    const exitDate = currentStay.exitDate ? 
      new Date(currentStay.exitDate) : referenceDate
    
    // Calculate days
    daysUsed = differenceInDays(exitDate, entryDate) + 1
    
    // Split into current and planned
    if (exitDate > referenceDate) {
      currentDays = differenceInDays(referenceDate, entryDate) + 1
      plannedDays = differenceInDays(exitDate, referenceDate)
    } else {
      currentDays = daysUsed
    }
  }
  break
```

#### Rolling Window
Countries that count days within a moving time window.

```typescript
interface RollingRule {
  ruleType: 'rolling'
  maxDays: number
  periodDays: number
  resetInfo: string
}

// Example: Schengen Area
{
  ruleType: 'rolling',
  maxDays: 90,
  periodDays: 180,
  resetInfo: '90 days in any 180-day period'
}
```

**Countries using this rule**:
- Schengen Area (90/180)
- Japan (90/180)
- United Kingdom (180/365)
- Canada (180/365)
- Turkey (90/180)

**Calculation Algorithm**:
```typescript
case 'rolling':
  if (rule.periodDays) {
    // Calculate the start of the rolling window
    const periodStart = subDays(referenceDate, rule.periodDays - 1)
    
    // Filter stays within the rolling window
    const relevantStays = stays.filter(stay => {
      if (stay.countryCode !== country.code) return false
      
      const exitDate = stay.exitDate ? 
        new Date(stay.exitDate) : new Date()
      
      // Check if stay overlaps with rolling window
      return exitDate >= periodStart
    })
    
    // Calculate days for each stay
    relevantStays.forEach(stay => {
      const entryDate = new Date(stay.entryDate)
      const exitDate = stay.exitDate ? 
        new Date(stay.exitDate) : new Date()
      
      // Calculate overlap with rolling window
      const overlapStart = entryDate < periodStart ? 
        periodStart : entryDate
      const overlapEnd = exitDate > referenceDate ? 
        referenceDate : exitDate
      
      if (overlapStart <= overlapEnd) {
        const days = differenceInDays(overlapEnd, overlapStart) + 1
        
        // Categorize days
        if (exitDate > referenceDate) {
          // Ongoing stay
          const daysToToday = differenceInDays(referenceDate, overlapStart) + 1
          const daysAfterToday = differenceInDays(exitDate, referenceDate)
          
          currentDays += Math.max(0, daysToToday)
          plannedDays += Math.max(0, daysAfterToday)
        } else {
          // Past stay
          currentDays += days
        }
        
        daysUsed += days
      }
    })
  }
  break
```

#### Annual Limit
Countries with a fixed number of days per calendar year.

```typescript
interface AnnualRule {
  ruleType: 'annual'
  maxDays: number
  resetInfo: string
}

// Example: South Africa
{
  ruleType: 'annual',
  maxDays: 90,
  resetInfo: '90 days per calendar year'
}
```

**Calculation Logic**:
```typescript
case 'annual':
  const currentYear = referenceDate.getFullYear()
  const yearStart = new Date(currentYear, 0, 1)
  const yearEnd = new Date(currentYear, 11, 31)
  
  const yearStays = stays.filter(stay => {
    if (stay.countryCode !== country.code) return false
    
    const entryDate = new Date(stay.entryDate)
    const exitDate = stay.exitDate ? 
      new Date(stay.exitDate) : new Date()
    
    // Check if stay overlaps with current year
    return exitDate >= yearStart && entryDate <= yearEnd
  })
  
  yearStays.forEach(stay => {
    const entryDate = new Date(stay.entryDate)
    const exitDate = stay.exitDate ? 
      new Date(stay.exitDate) : new Date()
    
    // Calculate overlap with year
    const overlapStart = max([entryDate, yearStart])
    const overlapEnd = min([exitDate, yearEnd, referenceDate])
    
    if (overlapStart <= overlapEnd) {
      const days = differenceInDays(overlapEnd, overlapStart) + 1
      daysUsed += days
      
      if (overlapEnd === referenceDate && exitDate > referenceDate) {
        currentDays = days
        plannedDays = differenceInDays(
          min([exitDate, yearEnd]), 
          referenceDate
        )
      } else {
        currentDays += days
      }
    }
  })
  break
```

### 2. Special Visa Cases

#### Korea 183/365 Rule
Special long-term visa for ethnic Koreans (F-4 visa).

```typescript
// Detection
const hasSpecialKoreaVisa = stays
  .filter(s => s.countryCode === 'KR')
  .some(s => s.visaType === '183/365')

// Special rule application
if (hasSpecialKoreaVisa && country.code === 'KR') {
  rule = {
    maxDays: 183,
    periodDays: 365,
    ruleType: 'rolling' as const
  }
}
```

**Calculation Specifics**:
- Uses 365-day rolling window (not 364)
- Maximum 183 days in any 365-day period
- Period starts exactly 365 days before reference date

#### Thailand Land Border Restriction
```typescript
interface ThailandSpecialRule {
  landBorderEntries: number
  maxLandEntriesPerYear: 2
}

// Validation
const validateThailandEntry = (stays: Stay[]): boolean => {
  const currentYear = new Date().getFullYear()
  const landEntries = stays.filter(stay => 
    stay.countryCode === 'TH' &&
    stay.entryType === 'land' &&
    new Date(stay.entryDate).getFullYear() === currentYear
  )
  
  return landEntries.length < 2
}
```

#### Schengen Shared Zone
```typescript
const SCHENGEN_COUNTRIES = [
  'AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
  'PT', 'SK', 'SI', 'ES', 'SE', 'CH'
]

// Aggregate all Schengen stays
const schengenStays = stays.filter(stay => 
  SCHENGEN_COUNTRIES.includes(stay.countryCode)
)

// Calculate as single zone
const schengenStatus = calculateVisaStatus(
  schengenStays,
  { code: 'SCHENGEN', name: 'Schengen Area', flag: '🇪🇺' }
)
```

### 3. Status Determination

#### Risk Levels
```typescript
type VisaStatus = 'safe' | 'warning' | 'danger'

const determineStatus = (percentage: number): VisaStatus => {
  if (percentage >= 100) return 'danger'   // Over limit
  if (percentage >= 80) return 'danger'    // Critical threshold
  if (percentage >= 60) return 'warning'   // Caution needed
  return 'safe'                            // Plenty of days remaining
}
```

#### Warning Thresholds
```typescript
interface WarningThresholds {
  remainingDays: {
    danger: 14,    // Less than 2 weeks
    warning: 30    // Less than 1 month
  },
  usagePercentage: {
    danger: 80,    // 80% or more used
    warning: 60    // 60% or more used
  }
}
```

## Data Structures

### Input Data

#### Stay Interface
```typescript
interface Stay {
  id: string
  userId: string
  countryCode: string
  city?: string
  entryDate: string  // ISO date string
  exitDate?: string  // ISO date string, null if ongoing
  visaType?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
```

#### Country Interface
```typescript
interface Country {
  code: string       // ISO 3166-1 alpha-2
  name: string      // English name
  flag: string      // Emoji flag
  continent?: string
  aliases?: string[] // Alternative names
}
```

### Output Data

#### VisaStatus Interface
```typescript
interface VisaStatus {
  country: Country
  daysUsed: number
  currentDays?: number    // Past + current days
  plannedDays?: number    // Future planned days
  maxDays: number
  remainingDays: number
  percentage: number      // Usage percentage
  status: 'safe' | 'warning' | 'danger'
  ruleType: 'reset' | 'rolling' | 'annual'
  periodDays?: number     // For rolling window rules
  specialVisa?: string    // Special visa type indicator
}
```

## Calculation Pipeline

### 1. Data Preparation
```typescript
function prepareData(stays: Stay[]): ProcessedStay[] {
  return stays
    .map(stay => ({
      ...stay,
      entryDate: parseISO(stay.entryDate),
      exitDate: stay.exitDate ? parseISO(stay.exitDate) : null,
      duration: calculateDuration(stay)
    }))
    .sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime())
}
```

### 2. Rule Selection
```typescript
function selectRule(
  country: Country,
  stays: Stay[],
  passportNationality: string = 'US'
): VisaRule {
  // Check for special visas
  const specialVisa = detectSpecialVisa(country, stays)
  if (specialVisa) {
    return specialVisaRules[specialVisa]
  }
  
  // Get standard rules based on passport
  const rules = passportNationality === 'KR' ? 
    visaRulesForKoreanPassport : 
    visaRulesForUSPassport
  
  return rules[country.code] || defaultRule
}
```

### 3. Calculation Execution
```typescript
function calculateVisaStatus(
  stays: Stay[],
  country: Country,
  referenceDate: Date = new Date()
): VisaStatus {
  // 1. Filter relevant stays
  const countryStays = stays.filter(s => s.countryCode === country.code)
  
  // 2. Get applicable rule
  const rule = selectRule(country, countryStays)
  
  // 3. Calculate based on rule type
  let result: CalculationResult
  switch (rule.ruleType) {
    case 'reset':
      result = calculateResetRule(countryStays, rule, referenceDate)
      break
    case 'rolling':
      result = calculateRollingRule(countryStays, rule, referenceDate)
      break
    case 'annual':
      result = calculateAnnualRule(countryStays, rule, referenceDate)
      break
  }
  
  // 4. Determine status
  const status = determineStatus(result.percentage)
  
  // 5. Apply additional warnings
  const finalStatus = applyAdditionalWarnings(status, result)
  
  // 6. Return complete status
  return {
    country,
    ...result,
    status: finalStatus
  }
}
```

### 4. Post-Processing
```typescript
function postProcess(status: VisaStatus): EnhancedVisaStatus {
  return {
    ...status,
    // Add recommendations
    recommendations: generateRecommendations(status),
    
    // Add predictions
    predictions: generatePredictions(status),
    
    // Add related countries (for Schengen, etc.)
    relatedCountries: getRelatedCountries(status.country),
    
    // Add visa extension options
    extensionOptions: getExtensionOptions(status)
  }
}
```

## Edge Cases and Special Handling

### 1. Overlapping Stays
```typescript
function handleOverlaps(stays: Stay[]): Stay[] {
  const sorted = [...stays].sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]
    
    if (!current.exitDate) continue
    
    const currentExit = new Date(current.exitDate)
    const nextEntry = new Date(next.entryDate)
    
    if (currentExit >= nextEntry) {
      // Overlap detected - adjust exit date
      current.exitDate = format(
        subDays(nextEntry, 1), 
        'yyyy-MM-dd'
      )
    }
  }
  
  return sorted
}
```

### 2. Missing Exit Dates
```typescript
function handleOngoingStays(stay: Stay, referenceDate: Date): ProcessedStay {
  return {
    ...stay,
    exitDate: stay.exitDate ? new Date(stay.exitDate) : referenceDate,
    isOngoing: !stay.exitDate,
    projectedDays: stay.exitDate ? 0 : 
      differenceInDays(addDays(referenceDate, 30), referenceDate)
  }
}
```

### 3. Future Stays
```typescript
function categorizeFutureStays(stays: Stay[], referenceDate: Date) {
  return {
    past: stays.filter(s => 
      new Date(s.exitDate || s.entryDate) < referenceDate
    ),
    current: stays.filter(s => {
      const entry = new Date(s.entryDate)
      const exit = s.exitDate ? new Date(s.exitDate) : referenceDate
      return entry <= referenceDate && exit >= referenceDate
    }),
    future: stays.filter(s => 
      new Date(s.entryDate) > referenceDate
    )
  }
}
```

### 4. Timezone Handling
```typescript
function normalizeDate(dateString: string): Date {
  // Parse as UTC to avoid timezone issues
  const date = parseISO(dateString)
  
  // Set to start of day in local timezone
  return startOfDay(date)
}

function calculateDaysDifference(start: Date, end: Date): number {
  // Normalize both dates
  const normalizedStart = startOfDay(start)
  const normalizedEnd = startOfDay(end)
  
  // Calculate difference
  const diff = differenceInDays(normalizedEnd, normalizedStart)
  
  // Add 1 for inclusive counting
  return diff + 1
}
```

## Performance Optimization

### 1. Caching Strategy
```typescript
class VisaCalculationCache {
  private cache: Map<string, CachedResult> = new Map()
  private ttl: number = 5000 // 5 seconds
  
  getCacheKey(stays: Stay[], country: Country): string {
    const stayHash = hashStays(stays)
    return `${country.code}-${stayHash}`
  }
  
  get(stays: Stay[], country: Country): VisaStatus | null {
    const key = this.getCacheKey(stays, country)
    const cached = this.cache.get(key)
    
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.result
  }
  
  set(stays: Stay[], country: Country, result: VisaStatus): void {
    const key = this.getCacheKey(stays, country)
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    })
  }
}
```

### 2. Batch Processing
```typescript
function calculateMultipleCountries(
  stays: Stay[],
  countries: Country[]
): Map<string, VisaStatus> {
  const results = new Map<string, VisaStatus>()
  
  // Group stays by country for efficiency
  const staysByCountry = groupBy(stays, 'countryCode')
  
  // Process in parallel
  const calculations = countries.map(async country => {
    const countryStays = staysByCountry[country.code] || []
    const status = await calculateVisaStatus(countryStays, country)
    results.set(country.code, status)
  })
  
  await Promise.all(calculations)
  return results
}
```

### 3. Incremental Updates
```typescript
function updateVisaStatus(
  previousStatus: VisaStatus,
  newStay: Stay,
  operation: 'add' | 'remove' | 'update'
): VisaStatus {
  // Quick update for simple cases
  if (operation === 'add' && newStay.countryCode !== previousStatus.country.code) {
    return previousStatus // No change needed
  }
  
  // Incremental calculation for affected country
  if (operation === 'add') {
    return recalculateWithNewStay(previousStatus, newStay)
  }
  
  // Full recalculation for complex cases
  return calculateVisaStatus(/* updated stays */)
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('Visa Calculator', () => {
  describe('Reset Rules', () => {
    it('should calculate days for current stay')
    it('should handle ongoing stays')
    it('should reset on country exit')
  })
  
  describe('Rolling Window Rules', () => {
    it('should calculate 90/180 correctly')
    it('should handle stays spanning window boundary')
    it('should handle multiple stays in window')
  })
  
  describe('Annual Rules', () => {
    it('should reset on January 1st')
    it('should handle year boundaries')
  })
  
  describe('Special Cases', () => {
    it('should apply Korea 183/365 rule')
    it('should handle Schengen zone')
    it('should detect Thailand land border limit')
  })
})
```

### Integration Tests
```typescript
describe('Visa Calculation Integration', () => {
  it('should handle real-world travel patterns')
  it('should maintain consistency across updates')
  it('should perform well with large datasets')
  it('should handle edge cases gracefully')
})
```

### Property-Based Tests
```typescript
import { check, property } from 'fast-check'

describe('Visa Calculator Properties', () => {
  it('should never exceed max days', () => {
    check(property(
      arbitraryStays(),
      arbitraryCountry(),
      (stays, country) => {
        const result = calculateVisaStatus(stays, country)
        return result.daysUsed <= result.maxDays * 1.1 // Allow 10% overflow
      }
    ))
  })
  
  it('should be deterministic', () => {
    check(property(
      arbitraryStays(),
      arbitraryCountry(),
      (stays, country) => {
        const result1 = calculateVisaStatus(stays, country)
        const result2 = calculateVisaStatus(stays, country)
        return deepEqual(result1, result2)
      }
    ))
  })
})
```

## Error Handling

### Validation Errors
```typescript
class VisaCalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'VisaCalculationError'
  }
}

function validateInput(stays: Stay[], country: Country): void {
  if (!country.code) {
    throw new VisaCalculationError(
      'Invalid country',
      'INVALID_COUNTRY',
      { country }
    )
  }
  
  stays.forEach(stay => {
    if (!isValid(parseISO(stay.entryDate))) {
      throw new VisaCalculationError(
        'Invalid entry date',
        'INVALID_DATE',
        { stay, field: 'entryDate' }
      )
    }
    
    if (stay.exitDate && !isValid(parseISO(stay.exitDate))) {
      throw new VisaCalculationError(
        'Invalid exit date',
        'INVALID_DATE',
        { stay, field: 'exitDate' }
      )
    }
  })
}
```

### Recovery Strategies
```typescript
function safeCalculate(
  stays: Stay[],
  country: Country
): VisaStatus | null {
  try {
    return calculateVisaStatus(stays, country)
  } catch (error) {
    console.error('Visa calculation failed:', error)
    
    // Return safe defaults
    return {
      country,
      daysUsed: 0,
      maxDays: 90, // Default assumption
      remainingDays: 90,
      percentage: 0,
      status: 'safe',
      ruleType: 'reset',
      error: error.message
    }
  }
}
```

## Monitoring and Analytics

### Calculation Metrics
```typescript
interface CalculationMetrics {
  totalCalculations: number
  averageTime: number
  cacheHitRate: number
  errorRate: number
  ruleTypeDistribution: Record<string, number>
  statusDistribution: Record<VisaStatus, number>
}

const metrics = {
  track(country: string, duration: number, status: VisaStatus) {
    this.totalCalculations++
    this.totalTime += duration
    this.statusCounts[status]++
    this.countryCounts[country]++
  }
}
```

## Future Enhancements

### Planned Improvements
1. **Machine Learning Predictions**: Predict visa usage patterns
2. **Multi-Passport Support**: Handle dual citizenship
3. **Visa Run Optimization**: Suggest optimal travel routes
4. **Real-time Rule Updates**: Fetch latest visa rules from API
5. **Historical Analysis**: Track visa rule changes over time

### Advanced Features
1. **Risk Score Calculation**: Comprehensive risk assessment
2. **Visa Extension Tracking**: Monitor extension eligibility
3. **Entry Denial Prediction**: Warn about potential issues
4. **Automated Visa Applications**: Integration with visa services
5. **Group Travel Coordination**: Manage visa limits for groups

## Related Documentation
- [Visa Rules Database](./VISA-RULES.md)
- [Date Utilities](../api/DATE-UTILS.md)
- [State Management](./STATE-MANAGEMENT.md)
- [Dashboard Features](../features/DASHBOARD.md)