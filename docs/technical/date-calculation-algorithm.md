# DINO App - Date Calculation Algorithm Documentation

## Overview
This document provides comprehensive documentation of the date calculation algorithms used in the DINO visa tracking application. All date calculations follow strict normalization rules to ensure accuracy across different timezones and edge cases.

## Core Principles

### 1. Date Normalization
All dates are normalized to the start of day (00:00:00) to ensure consistent comparisons:

```typescript
const normalizedDate = startOfDay(parseISO(dateString))
```

### 2. Inclusive Date Ranges
When calculating stay duration, both start and end dates are included:

```typescript
const stayDays = differenceInDays(endDate, startDate) + 1
```

## Visa Calculation Algorithms

### Rolling Window Method
Used for countries with X days within Y period rules (e.g., Korea 90/180, Japan 90/180)

```typescript
// Calculate the rolling window
const periodStart = subDays(referenceDate, periodDays)
const periodEnd = referenceDate

// For each stay, calculate overlap with the window
const overlapStart = max(entryDate, periodStart)
const overlapEnd = min(exitDate || referenceDate, periodEnd)

// Only count days that fall within the window
if (overlapStart <= overlapEnd) {
  const daysInWindow = differenceInDays(overlapEnd, overlapStart) + 1
  totalDaysUsed += daysInWindow
}
```

#### Special Case: Korea 183/365 Visa
When a stay has `visaType: '183/365'`, the system automatically applies:
- Maximum 183 days within any 365-day rolling period
- Overrides the standard 90/180 rule

### Reset Method
Used for countries where the visa period resets upon entry (e.g., Vietnam)

```typescript
// Find continuous stay groups (gaps < 7 days are considered continuous)
if (gapBetweenStays < 7) {
  // Add to current group
  currentGroupDays += stayDays
} else {
  // Start new group (visa reset)
  currentGroupDays = stayDays
}
```

## Stay Status Classification

### Current Stay Detection
```typescript
const today = new Date()
today.setHours(0, 0, 0, 0)
const entryDate = new Date(stay.entryDate)
entryDate.setHours(0, 0, 0, 0)

// Status determination
const isFutureTrip = entryDate > today && !stay.exitDate
const isCurrentlyStaying = entryDate <= today && !stay.exitDate
const isPastTrip = stay.exitDate !== null
const isOngoingPastTrip = entryDate <= today && stay.exitDate && new Date(stay.exitDate) >= today
```

## Statistics Calculations

### Year-to-Date Travel Days
```typescript
const yearStart = startOfYear(new Date())
const yearEnd = endOfYear(new Date())

// Calculate overlap with current year
const overlapStart = max(entryDate, yearStart)
const overlapEnd = min(exitDate || today, yearEnd)

if (overlapStart <= overlapEnd) {
  const daysInYear = differenceInDays(overlapEnd, overlapStart) + 1
}
```

### Current Stay Duration
```typescript
const currentStay = stays.find(s => 
  !s.exitDate && new Date(s.entryDate) <= new Date()
)

if (currentStay) {
  const duration = differenceInDays(new Date(), parseISO(currentStay.entryDate)) + 1
}
```

## Overlap Resolution Algorithm

When stays overlap (impossible to be in two countries simultaneously):

```typescript
// Automatically adjust exit date of previous stay
if (nextEntryDate < currentExitDate) {
  currentStay.exitDate = subDays(nextEntryDate, 1)
  nextStay.fromCountryCode = currentStay.countryCode
  nextStay.fromCity = currentStay.city
}
```

## Test Scenarios and Edge Cases

### Scenario 1: Standard Tourist Travel
```
Date: 2025-08-14
Stay: Korea 2025-07-01 to 2025-07-30 (30 days)
Stay: Japan 2025-08-01 to 2025-08-10 (10 days)
Current: Japan 2025-08-12 to present

Korea Status (90/180):
- Period: 2025-02-15 to 2025-08-14
- Days used: 30
- Remaining: 60
- Status: Safe (33%)

Japan Status (90/180):
- Period: 2025-02-15 to 2025-08-14
- Days used: 13 (10 + 3 ongoing)
- Remaining: 77
- Status: Safe (14%)
```

### Scenario 2: Long-term Stay with Special Visa
```
Date: 2025-08-14
Stay: Korea 2025-01-15 to 2025-06-30 (166 days, visa type: 183/365)
Stay: Thailand 2025-07-01 to 2025-07-15 (15 days)
Current: Korea 2025-07-20 to present

Korea Status (183/365):
- Period: 2024-08-15 to 2025-08-14
- Days used: 166 + 26 = 192 days
- Remaining: -9 days
- Status: OVERSTAY DANGER (105%)

Thailand Status (60/180):
- Days used: 15
- Remaining: 45
- Status: Safe (25%)
```

### Scenario 3: Multiple Entries with Reset Rule
```
Date: 2025-08-14
Stay: Vietnam 2025-03-01 to 2025-04-15 (46 days)
Stay: Korea 2025-04-16 to 2025-04-20 (5 days)
Stay: Vietnam 2025-04-25 to present

Vietnam Status (90 days, reset on entry):
- First group: 46 days (ended with >7 day gap)
- Second group: 112 days (ongoing)
- Status: OVERSTAY DANGER (124%)
- Action needed: Exit immediately
```

### Scenario 4: Year Boundary Crossing
```
Date: 2025-01-10
Stay: Japan 2024-12-20 to 2025-01-05 (17 days)
Current: Korea 2025-01-08 to present

2024 Travel Days: 12 (Dec 20-31)
2025 Travel Days: 8 (Jan 1-5, Jan 8-10)

Japan Status (90/180):
- Period: 2024-07-14 to 2025-01-10
- Days used: 17
- Status: Safe (19%)
```

### Scenario 5: Future Trip Planning
```
Date: 2025-08-14
Current: Vietnam 2025-07-10 to 2025-08-19 (ongoing)
Future: Korea 2025-09-02 to 2025-09-30 (planned)
Future: Japan 2025-10-01 to 2025-10-15 (planned)

Display:
- Vietnam: "Currently staying" badge, Day 36
- Korea: "Future trip" badge
- Japan: "Future trip" badge

Visa Calculations:
- Future trips NOT included in visa day counts
- Only counted after entry date passes
```

### Scenario 6: Overlap Detection and Resolution
```
Before Resolution:
Stay 1: Korea 2025-07-01 to 2025-07-20
Stay 2: Japan 2025-07-15 to 2025-07-25 (OVERLAP!)

After Automatic Resolution:
Stay 1: Korea 2025-07-01 to 2025-07-14 (adjusted)
Stay 2: Japan 2025-07-15 to 2025-07-25 (from: Korea)
```

### Scenario 7: Same-Day Exit/Entry
```
Date: 2025-08-14
Stay: Thailand 2025-06-01 to 2025-06-15
Stay: Vietnam 2025-06-15 to 2025-06-30

Calculation:
- Thailand: 15 days (June 1-15 inclusive)
- Vietnam: 16 days (June 15-30 inclusive)
- June 15 counted for BOTH countries (transit day)
```

### Scenario 8: Visa Warning Thresholds
```
Country: Korea (90/180)
Days Used: 75

Status Calculation:
- Percentage: 83% (75/90)
- Status: DANGER (>80%)
- Warning: "Only 15 days remaining"
- Recommendation: "Plan exit soon"
```

### Scenario 9: Multiple Special Visas
```
Stay 1: Korea 2025-01-01 to 2025-03-31 (90 days, tourist)
Stay 2: Korea 2025-05-01 to present (visa type: 183/365)

System Behavior:
- Detects special visa type
- Switches to 183/365 rule for ALL Korea stays
- Recalculates using 365-day window
- Shows special visa indicator in UI
```

### Scenario 10: Retroactive Data Entry
```
Current Date: 2025-08-14
User Adds: Vietnam 2025-06-01 to 2025-06-30 (past)
User Adds: Thailand 2025-06-15 to 2025-07-01 (overlap!)

System Response:
1. Detects overlap
2. Shows warning banner
3. Offers "Resolve Overlaps" button
4. Auto-adjusts: Vietnam ends 2025-06-14
5. Updates Thailand: from Vietnam
```

## Error Handling

### Invalid Date Inputs
- Future exit dates with past entry: Validated on input
- Exit before entry: Prevented by UI validation
- Invalid date formats: Caught by parseISO with fallback

### Missing Data
- No exit date: Treated as ongoing stay
- No entry date: Record rejected
- No country code: Record rejected

### Data Conflicts
- Multiple ongoing stays: Overlap detection triggered
- Impossible travel times: Warning displayed
- Visa overstay: Red danger status with immediate action required

## Performance Considerations

### Optimization Strategies
1. **Date Normalization**: All dates normalized once on load
2. **Caching**: Visa calculations cached until stay data changes
3. **Batch Updates**: Multiple stay updates processed together
4. **Lazy Calculation**: Statistics only calculated when visible

### Scalability
- Efficient for up to 1000+ stay records
- O(n) complexity for most calculations
- O(n²) only for overlap detection (rare operation)

## API Integration Points

### Supabase Database
```typescript
interface Stay {
  id: string
  userId: string
  countryCode: string
  city?: string
  entryDate: string  // ISO format
  exitDate?: string  // ISO format, null if ongoing
  visaType?: string  // e.g., "183/365"
  fromCountryCode?: string
  fromCity?: string
  createdAt: string
  updatedAt: string
}
```

### Local Storage Migration
- Automatically migrates v1 data on first login
- Preserves all date calculations
- One-time operation per user

## Testing Guidelines

### Unit Test Coverage
- Date normalization functions
- Visa calculation for each rule type
- Overlap detection and resolution
- Edge cases (year boundaries, same-day travel)

### Integration Tests
- Full user journey from entry to statistics
- Multi-country visa tracking
- Future trip planning
- Data migration scenarios

### Manual Test Cases
1. Add overlapping stays → Verify warning appears
2. Add future trip → Verify "Future trip" badge
3. Current stay → Verify "Currently staying" badge
4. Year boundary stay → Verify correct year allocation
5. Special visa type → Verify rule switching

## Maintenance Notes

### Common Issues and Solutions

1. **Timezone Problems**
   - Always use startOfDay() for normalization
   - Store dates in ISO format
   - Display in user's local timezone

2. **Calculation Discrepancies**
   - Remember to add +1 for inclusive ranges
   - Check visa rule configuration
   - Verify special visa detection

3. **Performance Degradation**
   - Monitor stays array size
   - Consider pagination for history
   - Implement virtual scrolling for large lists

### Future Enhancements

1. **Multi-passport Support**
   - Track different visa rules per passport
   - Handle citizenship changes

2. **Visa Type Management**
   - User-defined visa types
   - Custom rule configuration
   - Visa expiry tracking

3. **Advanced Analytics**
   - Predictive visa usage
   - Optimal travel planning
   - Historical trends analysis

## Appendix: Date Function Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `startOfDay(date)` | Set time to 00:00:00 | `2025-08-14 15:30` → `2025-08-14 00:00` |
| `parseISO(string)` | Parse ISO string to Date | `"2025-08-14"` → Date object |
| `differenceInDays(end, start)` | Days between dates | `(Aug 14, Aug 10)` → 4 |
| `subDays(date, days)` | Subtract days from date | `(Aug 14, 7)` → Aug 7 |
| `format(date, pattern)` | Format date for display | `(date, 'yyyy-MM-dd')` → "2025-08-14" |
| `startOfYear(date)` | First day of year | `2025-08-14` → `2025-01-01` |
| `endOfYear(date)` | Last day of year | `2025-08-14` → `2025-12-31` |

---

*Last Updated: August 2025*
*Version: 1.0.0*