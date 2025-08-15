# Calendar Feature Documentation

## Overview
The Calendar feature provides a visual timeline representation of travel history and future plans, enabling users to see their travel patterns, identify visa usage periods, and plan future trips effectively. It offers monthly, yearly, and timeline views with interactive features for managing stays.

## File Structure
```
app/dashboard/calendar/
├── page.tsx                    # Main calendar page component
└── loading.tsx                 # Loading state

components/
├── Calendar/
│   ├── MonthView.tsx          # Monthly calendar grid
│   ├── YearView.tsx           # Annual overview
│   ├── TimelineView.tsx       # Horizontal timeline
│   ├── CalendarHeader.tsx     # Navigation and controls
│   └── DayCell.tsx            # Individual day component

lib/
├── calendar-utils.ts          # Calendar calculation utilities
└── date-utils.ts              # Date manipulation helpers
```

## Core Components

### 1. Calendar Page (`app/dashboard/calendar/page.tsx`)

#### Purpose
Main container for calendar views with view switching, navigation, and stay management integration.

#### View Modes
```typescript
type CalendarView = 'month' | 'year' | 'timeline'

interface CalendarState {
  currentView: CalendarView
  currentDate: Date
  selectedDate: Date | null
  selectedStay: Stay | null
  showAddModal: boolean
  filters: CalendarFilters
}
```

#### Visual Layout
```
┌────────────────────────────────────────────┐
│ 📅 Calendar                                │
├────────────────────────────────────────────┤
│ [◀] January 2024 [▶]  [Month|Year|Timeline]│
├────────────────────────────────────────────┤
│ Sun  Mon  Tue  Wed  Thu  Fri  Sat         │
│      1    2    3    4    5    6           │
│      ·    ·    ·    ·    ·    ·           │
│  7    8    9   10   11   12   13          │
│  ·    ·    ·   🇯🇵──🇯🇵──🇯🇵──🇯🇵         │
│ 14   15   16   17   18   19   20          │
│ 🇯🇵──🇯🇵──🇯🇵   ·    ·    ·    ·          │
│ 21   22   23   24   25   26   27          │
│  ·   🇰🇷──🇰🇷──🇰🇷──🇰🇷──🇰🇷──🇰🇷         │
│ 28   29   30   31                         │
│ 🇰🇷──🇰🇷──🇰🇷──🇰🇷                        │
└────────────────────────────────────────────┘
```

### 2. Month View Component (`components/Calendar/MonthView.tsx`)

#### Purpose
Display a traditional monthly calendar grid with stay visualizations.

#### Grid Generation
```typescript
function generateMonthGrid(year: number, month: number): Day[][] {
  const firstDay = startOfMonth(new Date(year, month))
  const lastDay = endOfMonth(new Date(year, month))
  const startDate = startOfWeek(firstDay)
  const endDate = endOfWeek(lastDay)
  
  const days: Day[][] = []
  let currentWeek: Day[] = []
  let currentDate = startDate
  
  while (currentDate <= endDate) {
    currentWeek.push({
      date: currentDate,
      isCurrentMonth: isSameMonth(currentDate, firstDay),
      isToday: isToday(currentDate),
      stays: getStaysForDate(currentDate)
    })
    
    if (currentWeek.length === 7) {
      days.push(currentWeek)
      currentWeek = []
    }
    
    currentDate = addDays(currentDate, 1)
  }
  
  return days
}
```

#### Stay Visualization
```typescript
interface DayCell {
  date: Date
  stays: Stay[]
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
}

const DayCell: React.FC<DayCell> = ({ date, stays, ...props }) => {
  const dayNumber = format(date, 'd')
  const hasStays = stays.length > 0
  
  return (
    <div className={`
      relative p-2 h-24 border border-gray-200
      ${props.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
      ${props.isToday ? 'ring-2 ring-blue-500' : ''}
      ${props.isSelected ? 'bg-blue-50' : ''}
      ${hasStays ? 'cursor-pointer hover:bg-gray-50' : ''}
    `}>
      {/* Day number */}
      <div className={`
        text-sm font-medium
        ${props.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
      `}>
        {dayNumber}
      </div>
      
      {/* Stay indicators */}
      <div className="mt-1 space-y-1">
        {stays.slice(0, 3).map((stay, index) => (
          <StayIndicator key={stay.id} stay={stay} compact />
        ))}
        {stays.length > 3 && (
          <div className="text-xs text-gray-500">
            +{stays.length - 3} more
          </div>
        )}
      </div>
    </div>
  )
}
```

#### Stay Indicator Component
```typescript
const StayIndicator: React.FC<{ stay: Stay, compact?: boolean }> = ({ 
  stay, 
  compact = false 
}) => {
  const country = countries.find(c => c.code === stay.countryCode)
  const isOngoing = !stay.exitDate || new Date(stay.exitDate) >= new Date()
  
  if (compact) {
    return (
      <div className={`
        flex items-center gap-1 text-xs
        ${isOngoing ? 'font-medium' : ''}
      `}>
        <span>{country?.flag}</span>
        {!compact && <span>{country?.name}</span>}
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
      <span className="text-lg">{country?.flag}</span>
      <div className="flex-1">
        <div className="text-sm font-medium">{country?.name}</div>
        <div className="text-xs text-gray-600">{stay.city}</div>
      </div>
      {isOngoing && (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
          Current
        </span>
      )}
    </div>
  )
}
```

### 3. Year View Component (`components/Calendar/YearView.tsx`)

#### Purpose
Provide annual overview with heat map visualization of travel intensity.

#### Visual Design
```
┌─────────────────────────────────────────┐
│ 2024 Year Overview                      │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │   JAN   │ │   FEB   │ │   MAR   │   │
│ │ ▓▓▓▓▓▓▓ │ │ ░░▓▓▓▓▓ │ │ ▓▓▓░░░░ │   │
│ │ ▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓ │ │ ░░░░░░░ │   │
│ │ ▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓ │ │ ░░░░░░░ │   │
│ │ ▓▓▓▓▓▓▓ │ │ ▓▓▓▓    │ │ ░░░░░░░ │   │
│ │ ▓▓▓     │ │         │ │         │   │
│ └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│ Travel Intensity: ░ None ▓ Active      │
│ Total Days: 89 | Countries: 5          │
└─────────────────────────────────────────┘
```

#### Heat Map Calculation
```typescript
function calculateHeatMap(year: number, stays: Stay[]): HeatMapData {
  const yearStart = startOfYear(new Date(year, 0))
  const yearEnd = endOfYear(new Date(year, 0))
  const heatMap: Record<string, number> = {}
  
  stays.forEach(stay => {
    const entryDate = new Date(stay.entryDate)
    const exitDate = stay.exitDate ? new Date(stay.exitDate) : new Date()
    
    // Calculate overlap with year
    const overlapStart = max([entryDate, yearStart])
    const overlapEnd = min([exitDate, yearEnd])
    
    if (overlapStart <= overlapEnd) {
      let current = overlapStart
      while (current <= overlapEnd) {
        const key = format(current, 'yyyy-MM-dd')
        heatMap[key] = (heatMap[key] || 0) + 1
        current = addDays(current, 1)
      }
    }
  })
  
  return heatMap
}
```

#### Mini Month Component
```typescript
const MiniMonth: React.FC<{ month: number, year: number, heatMap: HeatMapData }> = ({ 
  month, 
  year, 
  heatMap 
}) => {
  const firstDay = new Date(year, month)
  const daysInMonth = getDaysInMonth(firstDay)
  const startOffset = getDay(firstDay)
  
  return (
    <div className="bg-white rounded-lg shadow p-3">
      <h3 className="text-sm font-medium text-center mb-2">
        {format(firstDay, 'MMM')}
      </h3>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-xs text-gray-400 text-center">
            {day}
          </div>
        ))}
        
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        
        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(year, month, i + 1)
          const key = format(date, 'yyyy-MM-dd')
          const intensity = heatMap[key] || 0
          
          return (
            <div
              key={i}
              className={`
                aspect-square rounded-sm
                ${intensity === 0 ? 'bg-gray-100' :
                  intensity === 1 ? 'bg-blue-200' :
                  intensity === 2 ? 'bg-blue-400' :
                  'bg-blue-600'}
              `}
              title={`${format(date, 'MMM d')}: ${intensity} stays`}
            />
          )
        })}
      </div>
    </div>
  )
}
```

### 4. Timeline View Component (`components/Calendar/TimelineView.tsx`)

#### Purpose
Horizontal timeline showing stays as continuous bars with overlap visualization.

#### Visual Design
```
┌──────────────────────────────────────────────┐
│ Timeline View                                │
├──────────────────────────────────────────────┤
│ 2024                                         │
│ Jan ─────────────────────────────────── Dec  │
│                                              │
│ 🇯🇵 Japan    ████████                        │
│             Jan 15-30                        │
│                                              │
│ 🇰🇷 Korea          ████████████              │
│                   Feb 1 - Mar 15             │
│                                              │
│ 🇹🇭 Thailand              ████████████████   │
│                          Mar 16 - Present    │
└──────────────────────────────────────────────┘
```

#### Timeline Calculation
```typescript
interface TimelineBar {
  stay: Stay
  startPosition: number  // Percentage from left
  width: number         // Percentage width
  row: number          // Vertical row to avoid overlaps
}

function calculateTimelineBars(
  stays: Stay[], 
  viewStart: Date, 
  viewEnd: Date
): TimelineBar[] {
  const totalDays = differenceInDays(viewEnd, viewStart)
  const bars: TimelineBar[] = []
  const rows: Date[] = [] // Track end dates per row
  
  // Sort stays by entry date
  const sortedStays = [...stays].sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )
  
  sortedStays.forEach(stay => {
    const entryDate = new Date(stay.entryDate)
    const exitDate = stay.exitDate ? 
      new Date(stay.exitDate) : 
      new Date()
    
    // Calculate position and width
    const startDays = differenceInDays(entryDate, viewStart)
    const duration = differenceInDays(exitDate, entryDate) + 1
    
    const startPosition = (startDays / totalDays) * 100
    const width = (duration / totalDays) * 100
    
    // Find available row (no overlap)
    let row = 0
    for (let i = 0; i < rows.length; i++) {
      if (rows[i] < entryDate) {
        row = i
        break
      }
    }
    if (row === rows.length) {
      rows.push(exitDate)
    } else {
      rows[row] = exitDate
    }
    
    bars.push({
      stay,
      startPosition: Math.max(0, startPosition),
      width: Math.min(100 - startPosition, width),
      row
    })
  })
  
  return bars
}
```

#### Timeline Bar Component
```typescript
const TimelineBar: React.FC<{ bar: TimelineBar }> = ({ bar }) => {
  const country = countries.find(c => c.code === bar.stay.countryCode)
  const isOngoing = !bar.stay.exitDate
  
  return (
    <div 
      className="absolute h-12 flex items-center"
      style={{
        left: `${bar.startPosition}%`,
        width: `${bar.width}%`,
        top: `${bar.row * 60}px`
      }}
    >
      <div className={`
        relative w-full h-10 rounded-lg shadow-sm
        bg-gradient-to-r from-blue-500 to-blue-600
        ${isOngoing ? 'animate-pulse' : ''}
        hover:shadow-lg transition-shadow cursor-pointer
      `}>
        {/* Country flag and name */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 
                        flex items-center gap-2">
          <span className="text-white text-lg">{country?.flag}</span>
          <span className="text-white text-sm font-medium">
            {country?.name}
          </span>
        </div>
        
        {/* Duration */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 
                        text-white text-xs">
          {formatDuration(bar.stay)}
        </div>
        
        {/* Ongoing indicator */}
        {isOngoing && (
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 
                          w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  )
}
```

### 5. Calendar Header Component (`components/Calendar/CalendarHeader.tsx`)

#### Purpose
Navigation controls, view switcher, and quick actions.

#### Features
```typescript
interface CalendarHeaderProps {
  currentDate: Date
  currentView: CalendarView
  onDateChange: (date: Date) => void
  onViewChange: (view: CalendarView) => void
  onAddStay: () => void
  onToday: () => void
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  currentView,
  onDateChange,
  onViewChange,
  onAddStay,
  onToday
}) => {
  const navigatePrevious = () => {
    switch (currentView) {
      case 'month':
        onDateChange(subMonths(currentDate, 1))
        break
      case 'year':
        onDateChange(subYears(currentDate, 1))
        break
      case 'timeline':
        onDateChange(subMonths(currentDate, 3))
        break
    }
  }
  
  const navigateNext = () => {
    switch (currentView) {
      case 'month':
        onDateChange(addMonths(currentDate, 1))
        break
      case 'year':
        onDateChange(addYears(currentDate, 1))
        break
      case 'timeline':
        onDateChange(addMonths(currentDate, 3))
        break
    }
  }
  
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={navigatePrevious}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-semibold">
          {currentView === 'year' ? 
            format(currentDate, 'yyyy') :
            format(currentDate, 'MMMM yyyy')
          }
        </h2>
        
        <button
          onClick={navigateNext}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
        
        <button
          onClick={onToday}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 
                     rounded-lg hover:bg-blue-100"
        >
          Today
        </button>
      </div>
      
      {/* View Switcher */}
      <div className="flex items-center gap-2">
        {(['month', 'year', 'timeline'] as CalendarView[]).map(view => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`
              px-3 py-1 text-sm rounded-lg capitalize
              ${currentView === view ? 
                'bg-blue-600 text-white' : 
                'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {view}
          </button>
        ))}
      </div>
      
      {/* Quick Actions */}
      <button
        onClick={onAddStay}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                   hover:bg-blue-700 flex items-center gap-2"
      >
        <PlusIcon className="w-4 h-4" />
        Add Stay
      </button>
    </div>
  )
}
```

## Interaction Features

### 1. Day Selection and Details

#### Click Handler
```typescript
const handleDayClick = (date: Date, stays: Stay[]) => {
  setSelectedDate(date)
  
  if (stays.length === 0) {
    // Open add stay modal with pre-filled date
    openAddStayModal({ entryDate: date })
  } else if (stays.length === 1) {
    // Show stay details
    setSelectedStay(stays[0])
    openStayDetailsModal()
  } else {
    // Show stay selector
    openStaySelector(stays)
  }
}
```

#### Stay Details Modal
```typescript
const StayDetailsModal: React.FC<{ stay: Stay }> = ({ stay }) => {
  const country = countries.find(c => c.code === stay.countryCode)
  const duration = calculateDuration(stay)
  const visaStatus = calculateVisaStatus([stay], country)
  
  return (
    <Modal>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{country?.flag}</span>
          <div>
            <h3 className="text-lg font-semibold">{country?.name}</h3>
            <p className="text-sm text-gray-600">{stay.city}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Entry Date:</span>
            <span>{format(new Date(stay.entryDate), 'PPP')}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Exit Date:</span>
            <span>
              {stay.exitDate ? 
                format(new Date(stay.exitDate), 'PPP') : 
                'Ongoing'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span>{duration} days</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Visa Type:</span>
            <span>{stay.visaType || 'Tourist'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Visa Status:</span>
            <span className={`
              font-medium
              ${visaStatus.status === 'danger' ? 'text-red-600' :
                visaStatus.status === 'warning' ? 'text-yellow-600' :
                'text-green-600'}
            `}>
              {visaStatus.remainingDays} days remaining
            </span>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white 
                           rounded-lg hover:bg-blue-700">
            Edit Stay
          </button>
          <button className="flex-1 px-4 py-2 bg-red-600 text-white 
                           rounded-lg hover:bg-red-700">
            Delete Stay
          </button>
        </div>
      </div>
    </Modal>
  )
}
```

### 2. Drag and Drop (Planned)

#### Drag to Reschedule
```typescript
const handleDragStart = (e: DragEvent, stay: Stay) => {
  e.dataTransfer.setData('stayId', stay.id)
  e.dataTransfer.effectAllowed = 'move'
  setDraggingStay(stay)
}

const handleDrop = (e: DragEvent, date: Date) => {
  e.preventDefault()
  const stayId = e.dataTransfer.getData('stayId')
  const stay = stays.find(s => s.id === stayId)
  
  if (stay) {
    const duration = calculateDuration(stay)
    const newEntryDate = format(date, 'yyyy-MM-dd')
    const newExitDate = format(
      addDays(date, duration - 1), 
      'yyyy-MM-dd'
    )
    
    updateStay(stayId, {
      entryDate: newEntryDate,
      exitDate: newExitDate
    })
  }
  
  setDraggingStay(null)
}
```

### 3. Filters and Search

#### Filter Interface
```typescript
interface CalendarFilters {
  countries: string[]        // Filter by country codes
  visaTypes: string[]        // Filter by visa types
  dateRange: {
    start: Date | null
    end: Date | null
  }
  searchTerm: string         // Search in cities/notes
  showOngoing: boolean       // Show current stays
  showFuture: boolean        // Show planned trips
}
```

#### Filter Implementation
```typescript
const applyFilters = (stays: Stay[], filters: CalendarFilters): Stay[] => {
  return stays.filter(stay => {
    // Country filter
    if (filters.countries.length > 0 && 
        !filters.countries.includes(stay.countryCode)) {
      return false
    }
    
    // Visa type filter
    if (filters.visaTypes.length > 0 && 
        !filters.visaTypes.includes(stay.visaType || 'Tourist')) {
      return false
    }
    
    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const entryDate = new Date(stay.entryDate)
      const exitDate = stay.exitDate ? 
        new Date(stay.exitDate) : 
        new Date()
      
      if (filters.dateRange.start && exitDate < filters.dateRange.start) {
        return false
      }
      if (filters.dateRange.end && entryDate > filters.dateRange.end) {
        return false
      }
    }
    
    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const cityMatch = stay.city?.toLowerCase().includes(searchLower)
      const notesMatch = stay.notes?.toLowerCase().includes(searchLower)
      
      if (!cityMatch && !notesMatch) {
        return false
      }
    }
    
    // Ongoing filter
    if (!filters.showOngoing) {
      const isOngoing = !stay.exitDate || 
                       new Date(stay.exitDate) >= new Date()
      if (isOngoing) return false
    }
    
    // Future filter
    if (!filters.showFuture) {
      const isFuture = new Date(stay.entryDate) > new Date()
      if (isFuture) return false
    }
    
    return true
  })
}
```

## Performance Optimization

### 1. Virtualization for Large Datasets

#### Virtual Scrolling
```typescript
import { FixedSizeList } from 'react-window'

const VirtualizedTimeline: React.FC<{ stays: Stay[] }> = ({ stays }) => {
  const Row = ({ index, style }) => {
    const bar = timelineBars[index]
    return (
      <div style={style}>
        <TimelineBar bar={bar} />
      </div>
    )
  }
  
  return (
    <FixedSizeList
      height={600}
      itemCount={stays.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

### 2. Memoization

#### Component Memoization
```typescript
const DayCell = React.memo(({ date, stays, ...props }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.date.getTime() === nextProps.date.getTime() &&
    prevProps.stays.length === nextProps.stays.length &&
    prevProps.isSelected === nextProps.isSelected
  )
})
```

#### Calculation Memoization
```typescript
const memoizedHeatMap = useMemo(() => 
  calculateHeatMap(year, stays),
  [year, stays]
)

const memoizedTimelineBars = useMemo(() =>
  calculateTimelineBars(stays, viewStart, viewEnd),
  [stays, viewStart, viewEnd]
)
```

### 3. Lazy Loading

#### View Components
```typescript
const MonthView = lazy(() => import('./MonthView'))
const YearView = lazy(() => import('./YearView'))
const TimelineView = lazy(() => import('./TimelineView'))

const CalendarContent = () => {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      {currentView === 'month' && <MonthView />}
      {currentView === 'year' && <YearView />}
      {currentView === 'timeline' && <TimelineView />}
    </Suspense>
  )
}
```

## Mobile Responsiveness

### Touch Interactions

#### Swipe Navigation
```typescript
import { useSwipeable } from 'react-swipeable'

const handlers = useSwipeable({
  onSwipedLeft: () => navigateNext(),
  onSwipedRight: () => navigatePrevious(),
  preventDefaultTouchmoveEvent: true,
  trackMouse: true
})

return (
  <div {...handlers} className="calendar-container">
    {/* Calendar content */}
  </div>
)
```

### Mobile Layout Adaptations

#### Responsive Grid
```typescript
const MobileMonthView = () => {
  return (
    <div className="grid grid-cols-7 gap-0.5 text-xs">
      {/* Smaller cells for mobile */}
      {days.map(day => (
        <MobileDayCell key={day.date} {...day} />
      ))}
    </div>
  )
}

const MobileDayCell = ({ date, stays }) => {
  const hasStays = stays.length > 0
  
  return (
    <div className={`
      aspect-square p-1 border border-gray-100
      ${hasStays ? 'bg-blue-50' : 'bg-white'}
    `}>
      <div className="text-xs">{format(date, 'd')}</div>
      {hasStays && (
        <div className="text-xs">
          {stays[0].countryCode}
        </div>
      )}
    </div>
  )
}
```

## Accessibility

### Keyboard Navigation

#### Arrow Key Navigation
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowLeft':
      selectPreviousDay()
      break
    case 'ArrowRight':
      selectNextDay()
      break
    case 'ArrowUp':
      selectPreviousWeek()
      break
    case 'ArrowDown':
      selectNextWeek()
      break
    case 'Enter':
      openSelectedDay()
      break
    case 'Escape':
      clearSelection()
      break
  }
}
```

### ARIA Labels

#### Calendar Grid
```html
<div role="grid" aria-label="Calendar">
  <div role="row">
    <div role="columnheader" aria-label="Sunday">S</div>
    <!-- More headers -->
  </div>
  <div role="row">
    <div role="gridcell" 
         aria-label="January 1, 2024. 2 stays"
         tabIndex={0}>
      <!-- Cell content -->
    </div>
  </div>
</div>
```

### Screen Reader Announcements
```typescript
const announceViewChange = (view: CalendarView, date: Date) => {
  const message = view === 'year' ?
    `Showing year ${format(date, 'yyyy')}` :
    `Showing ${format(date, 'MMMM yyyy')}`
  
  announceToScreenReader(message)
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('Calendar Utils', () => {
  it('should generate correct month grid')
  it('should calculate heat map accurately')
  it('should detect overlapping stays')
  it('should apply filters correctly')
})

describe('Calendar Components', () => {
  it('should render month view with stays')
  it('should navigate between months')
  it('should switch views')
  it('should handle day selection')
})
```

### Integration Tests
```typescript
describe('Calendar Integration', () => {
  it('should load stays and display in calendar')
  it('should update calendar when stay is added')
  it('should sync with dashboard')
  it('should persist view preferences')
})
```

## Future Enhancements

### Planned Features
1. **iCal Export**: Export to calendar apps
2. **Recurring Trips**: Template for repeated travel
3. **Trip Planning Mode**: Drag to plan future trips
4. **Visa Warnings**: Visual alerts on calendar
5. **Public Sharing**: Share calendar view

### Advanced Features
1. **AI Trip Suggestions**: Based on visa limits
2. **Weather Integration**: Historical weather data
3. **Flight Integration**: Import from airline APIs
4. **Photo Integration**: Add photos to stays
5. **Collaborative Planning**: Share with travel partners

## Related Documentation
- [Dashboard Features](./DASHBOARD.md)
- [Date Utilities](../api/DATE-UTILS.md)
- [State Management](../architecture/STATE-MANAGEMENT.md)
- [Mobile Design](../design/MOBILE.md)