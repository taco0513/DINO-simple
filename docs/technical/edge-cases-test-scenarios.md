# DINO App - Edge Cases and Test Scenarios

## Critical Edge Cases

### 1. Timezone Boundary Cases

#### Case 1.1: Midnight Border Crossing
```
Scenario: User crosses border at midnight local time
Entry: 2025-08-14 23:59:59 (Local Thai time)
Exit: 2025-08-15 00:00:01 (Local Vietnam time)

Expected Behavior:
- Both dates normalized to 00:00:00
- Thailand exit: 2025-08-14
- Vietnam entry: 2025-08-15
- No overlap detected
```

#### Case 1.2: International Date Line Crossing
```
Scenario: Flying from Seoul to Los Angeles
Departure: 2025-08-14 14:00 (Seoul)
Arrival: 2025-08-14 09:00 (LA, same calendar day)

Expected Behavior:
- Korea exit: 2025-08-14
- USA entry: 2025-08-14
- Both countries count this day
```

### 2. Visa Rule Edge Cases

#### Case 2.1: Exact Visa Limit
```
Scenario: Exactly 90 days in 180-day period
Stays: 
- Korea: Jan 1-30 (30 days)
- Korea: Mar 1-31 (31 days)
- Korea: May 1-29 (29 days)
Total: 90 days

Expected:
- Status: DANGER (100%)
- Remaining: 0 days
- Warning: "Visa limit reached, must exit"
```

#### Case 2.2: Split Stay Across Period Boundary
```
Scenario: Stay spans across rolling window boundary
Current Date: 2025-08-14
Stay: Korea 2025-01-01 to 2025-04-30 (120 days)

180-day window: 2025-02-15 to 2025-08-14
Days counted: Feb 15 - Apr 30 = 75 days
Days outside window: Jan 1 - Feb 14 = 45 days (not counted)

Expected:
- Only 75 days counted
- Status based on 75/90
```

#### Case 2.3: Multiple Visa Types in Same Period
```
Scenario: Tourist visa then business visa
Stay 1: Korea Jan 1-Mar 31 (90 days, tourist)
Stay 2: Korea Jun 1-Aug 14 (75 days, business 183/365)

Expected:
- System detects business visa
- Switches to 183/365 rule
- Counts all 165 days against 183 limit
- Status: DANGER (90%)
```

### 3. Data Entry Edge Cases

#### Case 3.1: Retroactive Long Stay
```
Scenario: User enters 6-month old data
Current Date: 2025-08-14
User Adds: Japan 2025-01-01 to 2025-03-31 (90 days)

Expected:
- Correctly calculates past visa usage
- Updates current visa status
- May trigger overstay warning if applicable
```

#### Case 3.2: Partial Year Statistics
```
Scenario: Stay spans multiple years
Stay: Vietnam 2024-12-15 to 2025-01-15

2024 Statistics:
- Days in 2024: 17 (Dec 15-31)

2025 Statistics:
- Days in 2025: 15 (Jan 1-15)

Total Stay: 32 days
```

#### Case 3.3: Leap Year Handling
```
Scenario: February 29 in leap year
Stay: Korea 2024-02-28 to 2024-03-01

Expected:
- Duration: 3 days (Feb 28, 29, Mar 1)
- Correctly handles Feb 29
```

### 4. Overlap Resolution Edge Cases

#### Case 4.1: Chain Overlap Resolution
```
Initial Data:
Stay A: Korea Jun 1-20
Stay B: Japan Jun 15-25 (overlaps with A)
Stay C: Thailand Jun 23-30 (overlaps with B)

After Resolution:
Stay A: Korea Jun 1-14
Stay B: Japan Jun 15-22 (from Korea)
Stay C: Thailand Jun 23-30 (from Japan)
```

#### Case 4.2: Same-Day Country Switch
```
Scenario: Morning flight
Stay 1: Thailand ends 2025-06-15
Stay 2: Vietnam starts 2025-06-15

Expected:
- Both countries count June 15
- Thailand: includes departure day
- Vietnam: includes arrival day
- Total days that day: 1 (each country)
```

### 5. Display Edge Cases

#### Case 5.1: Current Stay vs Future Trip Boundary
```
Current DateTime: 2025-08-14 15:00:00
Stay 1: Entry today 2025-08-14 (already entered)
Stay 2: Entry tomorrow 2025-08-15 (not yet)

Expected:
- Stay 1: "Currently staying" (even if same day)
- Stay 2: "Future trip"
```

#### Case 5.2: Multiple Ongoing Stays (Error State)
```
Scenario: Data corruption/manual edit
Stay 1: Korea 2025-08-01 to null
Stay 2: Japan 2025-08-10 to null

Expected:
- Overlap warning displayed
- Only most recent considered "current"
- Automatic resolution offered
```

### 6. Performance Edge Cases

#### Case 6.1: Large Dataset
```
Scenario: 5 years of frequent travel
Stays: 500+ records
Countries: 50+

Performance Targets:
- Initial load: < 2 seconds
- Visa calculation: < 100ms per country
- UI remains responsive
```

#### Case 6.2: Rapid Sequential Updates
```
Scenario: Importing CSV with 100 stays
Expected:
- Batch processing
- Single UI update after all imports
- Progress indicator shown
```

### 7. Special Visa Edge Cases

#### Case 7.1: Visa Type Change Mid-Stay
```
Scenario: Visa conversion while in country
Entry: 2025-06-01 (Tourist)
Visa Change: 2025-07-01 (Student 183/365)
Current: 2025-08-14

Expected:
- UI shows current visa type
- Calculations use new visa rules
- Historical record maintained
```

#### Case 7.2: Visa Overstay Recovery
```
Scenario: Overstayed then left and returned
Stay 1: Korea Jan 1 - Apr 30 (120 days, overstay)
Gap: May 1 - Jun 30 (outside Korea)
Stay 2: Korea Jul 1 - present

Expected:
- New 180-day period includes overstay days
- Warning about previous overstay
- Current status calculated correctly
```

### 8. User Interface Edge Cases

#### Case 8.1: Empty State Handling
```
Scenario: New user, no data
Expected:
- Helpful onboarding message
- Clear CTA to add first stay
- Sample data option offered
```

#### Case 8.2: Extreme Date Selection
```
Scenario: User tries to enter year 1900 or 2100
Expected:
- Reasonable date range validation
- Helpful error message
- Suggest valid date range
```

### 9. Data Migration Edge Cases

#### Case 9.1: Duplicate Detection
```
Scenario: Same stay in both local storage and database
Local: Korea Jun 1-15
Database: Korea Jun 1-15

Expected:
- Detect and merge duplicates
- Preserve database version
- No double counting
```

#### Case 9.2: Conflicting Data
```
Scenario: Different exit dates for same stay
Local: Korea Jun 1-15
Database: Korea Jun 1-20

Expected:
- Database version takes precedence
- User notified of conflict
- Audit log maintained
```

### 10. Calculation Accuracy Cases

#### Case 10.1: Rounding and Precision
```
Scenario: Percentage calculations
Days Used: 89
Max Days: 90
Percentage: 98.888...%

Expected:
- Display: 99% (rounded up for safety)
- Status: DANGER (treats as >98%)
- Clear indication of precise values
```

#### Case 10.2: Negative Remaining Days
```
Scenario: Overstay situation
Days Used: 95
Max Days: 90

Expected:
- Display: "-5 days (OVERSTAY)"
- Red danger indication
- Immediate action message
```

## Test Automation Checklist

### Unit Tests Required
- [ ] Date normalization with various formats
- [ ] Visa calculation for each country rule
- [ ] Overlap detection algorithm
- [ ] Future trip detection
- [ ] Current stay detection
- [ ] Year boundary calculations
- [ ] Statistics aggregation
- [ ] Special visa type detection

### Integration Tests Required
- [ ] CSV import with edge cases
- [ ] Supabase sync with conflicts
- [ ] Multi-user data isolation
- [ ] Retroactive data entry
- [ ] Overlap resolution chain
- [ ] Migration from v1 to v2

### E2E Tests Required
- [ ] Complete user journey
- [ ] Data entry validation
- [ ] Visual regression for badges
- [ ] Mobile responsiveness
- [ ] Offline/online sync
- [ ] Performance under load

### Manual Testing Scenarios
1. **Timezone Testing**
   - Change system timezone
   - Verify calculations remain consistent

2. **Date Boundary Testing**
   - Test at 11:59 PM
   - Test at 12:00 AM
   - Test on Dec 31/Jan 1

3. **Stress Testing**
   - Import 500+ stays
   - Rapid create/edit/delete
   - Multiple browser tabs

4. **Error Recovery**
   - Network disconnection
   - Invalid data entry
   - Browser refresh mid-operation

## Monitoring and Alerts

### Critical Metrics to Track
1. Calculation accuracy rate
2. Overlap detection frequency
3. Average calculation time
4. Data sync conflicts
5. User error rate

### Alert Thresholds
- Calculation time > 1 second
- Sync failure rate > 1%
- Data conflicts > 5 per user
- Error rate > 0.1%

## Known Limitations

1. **Single Passport**: Currently assumes one passport per user
2. **Visa Rule Updates**: Manual update required for rule changes
3. **Transit Days**: Counted for both countries (by design)
4. **Historical Rules**: Uses current rules for past calculations
5. **Time Zones**: All calculations in user's local timezone

## Future Test Scenarios

### Multi-Passport Support
- Different rules per passport
- Passport expiry handling
- Citizenship changes

### Advanced Visa Types
- Multi-entry visas
- Visa validity periods
- Visa fee tracking
- Extension handling

### Travel Planning
- "What-if" scenarios
- Optimal stay duration suggestions
- Visa run planning
- Budget tracking integration

---

*Last Updated: August 2025*
*Version: 1.0.0*