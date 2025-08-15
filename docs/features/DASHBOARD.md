# Dashboard Feature Documentation

## Overview
The Dashboard is the central hub of DINO (Digital Nomad Visa Tracker), providing users with a comprehensive view of their visa status across multiple countries. It serves as the primary interface for tracking travel history, monitoring visa limitations, and planning future trips.

## File Structure
```
app/dashboard/
├── page.tsx                 # Main dashboard page component
├── layout.tsx              # Dashboard layout with sidebar
└── [other pages]...

components/
├── VisaCard.tsx            # Individual visa status card
├── StatsCards.tsx          # Statistics overview cards
├── StaysList.tsx           # Travel history list
├── AddStayModal.tsx        # Modal for adding new stays
├── FeedbackModal.tsx       # User feedback modal
└── ProtectedRoute.tsx      # Authentication wrapper
```

## Core Components

### 1. Dashboard Page (`app/dashboard/page.tsx`)

#### Purpose
Main dashboard container that orchestrates all dashboard features and manages global dashboard state.

#### Key Features
- **Automatic Data Loading**: Loads user stays on mount via Supabase
- **Local Storage Migration**: One-time migration from localStorage to Supabase
- **Overlap Detection**: Identifies and resolves date overlaps in travel records
- **Dynamic Visa Calculation**: Real-time visa status calculation for visited countries

#### State Management
```typescript
const [showAddModal, setShowAddModal] = useState(false)
const [showFeedbackModal, setShowFeedbackModal] = useState(false)
```

#### Data Flow
1. User authentication check via `ProtectedRoute`
2. Parallel execution of:
   - Local storage migration
   - Stays data loading from Supabase
3. Visa status calculation for each visited country
4. UI rendering based on calculated data

#### Loading States
- **Initial Load**: Skeleton UI with animated placeholders
- **Empty State**: Prompt to add first stay
- **Loaded State**: Full dashboard with visa cards

### 2. Visa Card Component (`components/VisaCard.tsx`)

#### Purpose
Individual country visa status display with visual indicators and detailed information access.

#### Visual Design
```
┌─────────────────────────────┐
│ 🇰🇷 South Korea        (i) │ <- Country flag, name, info button
│ 183/365 Special            │ <- Special visa type indicator
│                            │
│ Days Used        131 / 183 │ <- Usage statistics
│ ████████████░░░░░░░░░░░░░ │ <- Progress bar (blue)
│ ● Current ● Planned        │ <- Legend
│                            │
│ Remaining         52 days  │ <- Days remaining
└─────────────────────────────┘
```

#### Props Interface
```typescript
interface VisaCardProps {
  status: VisaStatus
}
```

#### Visual Indicators
- **Border Colors**:
  - Red (`border-red-500`): ≤14 days remaining
  - Yellow (`border-yellow-500`): 15-30 days remaining
  - Gray (`border-gray-200`): >30 days remaining

- **Progress Bar**:
  - Dark Blue (`bg-blue-500`): Current/past days
  - Light Blue (`bg-blue-300`): Planned/future days
  - Gray (`bg-gray-200`): Unused days

#### Special Features
- **Korea 183/365 Visa**: Special indicator for F-4 visa holders
- **Info Button**: Opens `VisaDetailModal` with comprehensive visa information
- **Responsive Design**: Adapts to mobile/desktop viewports

### 3. Stats Cards Component (`components/StatsCards.tsx`)

#### Purpose
Provides high-level travel statistics and quick insights.

#### Statistics Displayed
1. **Total Countries**: Unique countries visited
2. **Current Year Days**: Days traveled in current calendar year
3. **Current Stay**: Active stay information (if applicable)

#### Calculation Logic
```typescript
// Year days calculation
const yearStart = startOfYear(today)
const thisYearDays = stays
  .filter(stay => {
    const entryDate = new Date(stay.entryDate)
    const exitDate = stay.exitDate ? new Date(stay.exitDate) : today
    return exitDate >= yearStart && entryDate <= today
  })
  .reduce((total, stay) => {
    // Calculate overlap with current year
    const effectiveStart = entryDate > yearStart ? entryDate : yearStart
    const effectiveEnd = exitDate < today ? exitDate : today
    const days = differenceInDays(effectiveEnd, effectiveStart) + 1
    return total + days
  }, 0)
```

#### Visual Design
- Card-based layout with icons
- Responsive grid (1 column mobile, 3 columns desktop)
- Subtle shadows and hover effects

### 4. Stays List Component (`components/StaysList.tsx`)

#### Purpose
Chronological display of all travel records with editing capabilities.

#### Features
- **Sorting**: Most recent stays first
- **Status Indicators**:
  - "Currently staying" for active trips
  - Duration display for completed trips
  - "X days planned" for future trips
- **Edit/Delete Actions**: Per-stay management options
- **Country Display**: Flag emoji + country name
- **Date Formatting**: Human-readable date format

#### Trip Status Logic
```typescript
const getTripStatus = (stay: Stay) => {
  const today = new Date()
  const entryDate = new Date(stay.entryDate)
  const exitDate = stay.exitDate ? new Date(stay.exitDate) : null
  
  if (entryDate > today) {
    // Future trip
    return `${duration} days planned`
  } else if (!exitDate || exitDate >= today) {
    // Current trip
    return "Currently staying"
  } else {
    // Past trip
    return `${duration} days`
  }
}
```

### 5. Add Stay Modal (`components/AddStayModal.tsx`)

#### Purpose
Interface for adding new travel records with validation and auto-save.

#### Form Fields
- **Country**: Searchable dropdown with flags
- **City**: Text input
- **Entry Date**: Date picker
- **Exit Date**: Optional date picker
- **Visa Type**: Dropdown (Tourist, Business, etc.)
- **Notes**: Optional textarea

#### Validation Rules
- Entry date required
- Exit date must be after entry date
- Country selection required
- Automatic today's date for exit if ongoing

#### Save Flow
1. Form validation
2. Create stay object
3. Call `addStay` from Supabase store
4. Automatic dashboard refresh
5. Modal close

## Data Management

### Visa Status Calculation
Located in `lib/visa-calculator.ts`, the calculation engine handles:

#### Rule Types
1. **Reset on Exit**: Days reset when leaving (Thailand, Singapore)
2. **Rolling Window**: Days counted in moving window (Schengen, Japan)
3. **Annual Limit**: Fixed days per calendar year (South Africa)

#### Calculation Process
```typescript
1. Identify visa rule for country
2. Filter relevant stays
3. Calculate based on rule type:
   - Reset: Count current stay only
   - Rolling: Count days in window
   - Annual: Count days in calendar year
4. Determine status (safe/warning/danger)
5. Return VisaStatus object
```

### Overlap Detection & Resolution

#### Detection Algorithm
```typescript
const hasOverlaps = () => {
  for (let i = 0; i < sortedStays.length; i++) {
    const current = sortedStays[i]
    const next = sortedStays[i + 1]
    
    if (next && !current.exitDate && current.countryCode !== next.countryCode) {
      if (isBefore(currentEntry, nextEntry)) {
        return true // Overlap detected
      }
    }
  }
  return false
}
```

#### Resolution Strategy
1. Sort stays by entry date
2. When overlap detected, set exit date of previous stay to day before next entry
3. Update each modified stay in database
4. Reload data to reflect changes

## User Interactions

### Primary Actions
1. **Add Stay Record**: Opens modal for new travel entry
2. **Edit Stay**: Inline editing of existing records
3. **Delete Stay**: Remove travel records with confirmation
4. **Resolve Overlaps**: One-click overlap resolution
5. **View Visa Details**: Detailed visa information modal

### Secondary Actions
1. **Send Feedback**: Floating feedback button
2. **Navigate Pages**: Via sidebar navigation
3. **Collapse Sidebar**: Desktop sidebar toggle

## Performance Optimizations

### Loading Strategy
- **Parallel Data Fetching**: Migration and loading run concurrently
- **5-Second Cache**: Prevents excessive API calls (implemented in Supabase store)
- **Skeleton Loading**: Immediate UI feedback during data fetch

### Rendering Optimizations
- **Conditional Rendering**: Components only render when data available
- **Memoization**: Visa calculations cached per render cycle
- **Lazy Loading**: Modals load on-demand

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
- Single column visa cards
- Collapsible sidebar
- Touch-friendly buttons (min 44px tap targets)
- Simplified stats display
- Full-width modals

### Desktop Features
- Multi-column grid (up to 3 columns)
- Persistent sidebar
- Hover effects
- Keyboard shortcuts (planned)

## Error Handling

### Data Loading Errors
- Graceful fallback to empty state
- Error toast notifications (planned)
- Retry mechanism in Supabase store

### Validation Errors
- Inline form validation
- Clear error messages
- Prevent invalid data submission

## Accessibility

### Current Implementation
- Semantic HTML structure
- ARIA labels on interactive elements
- Focus management in modals
- Keyboard navigation support

### Planned Improvements
- Screen reader announcements
- High contrast mode
- Keyboard shortcuts
- Skip navigation links

## Testing Considerations

### Unit Tests (Recommended)
```typescript
describe('VisaCard', () => {
  it('should display correct border color based on remaining days')
  it('should calculate progress percentage correctly')
  it('should handle special visa types')
})

describe('Dashboard', () => {
  it('should load stays on mount')
  it('should detect overlaps correctly')
  it('should calculate visa status for all countries')
})
```

### Integration Tests
- Test Supabase data flow
- Test modal interactions
- Test overlap resolution
- Test visa calculations

### E2E Tests
- Complete user journey from login to adding stays
- Test responsive behavior
- Test error scenarios

## Future Enhancements

### Planned Features
1. **Visa Predictions**: ML-based visa usage predictions
2. **Notifications**: Alert system for visa expirations
3. **Export Options**: PDF reports, calendar sync
4. **Multi-Passport Support**: Handle multiple nationalities
5. **Trip Planning**: Future trip impact analysis

### UI/UX Improvements
1. **Dark Mode**: System-wide theme support
2. **Animations**: Smooth transitions and micro-interactions
3. **Drag & Drop**: Reorder stays, file uploads
4. **Bulk Actions**: Multi-select for batch operations
5. **Advanced Filters**: Filter by date, country, visa type

## Related Documentation
- [Visa Calculation Logic](../architecture/VISA-CALCULATION.md)
- [State Management](../architecture/STATE-MANAGEMENT.md)
- [Database Schema](../architecture/DATABASE.md)
- [API Reference](../api/SUPABASE-API.md)