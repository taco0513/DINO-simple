# Mobile Design Documentation

## Overview
DINO's mobile-first responsive design ensures optimal user experience across all device sizes, from smartphones to tablets. The design system prioritizes touch interactions, readability, and efficient use of screen space while maintaining feature parity with the desktop experience.

## Design Philosophy

### Mobile-First Approach
```css
/* Base styles for mobile */
.container {
  padding: 1rem;
  font-size: 16px;
}

/* Progressive enhancement for larger screens */
@media (min-width: 640px) {
  .container {
    padding: 1.5rem;
    font-size: 14px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Core Principles
1. **Touch-First**: All interactions optimized for finger navigation
2. **Content Priority**: Most important content visible without scrolling
3. **Performance**: Fast loading and smooth animations
4. **Accessibility**: WCAG 2.1 AA compliance on all screen sizes
5. **Progressive Enhancement**: Core functionality works on any device

## Responsive Breakpoints

### Tailwind CSS Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Small tablets and large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Large screens
  '2xl': '1536px' // Extra large screens
}

// Usage in components
<div className="text-sm sm:text-base lg:text-lg">
  Responsive text sizing
</div>
```

### Custom Breakpoints for Specific Needs
```css
/* Ultra-wide phones (iPhone 14 Pro Max, etc.) */
@media (min-width: 428px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Foldable devices */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .sidebar {
    width: 300px;
  }
}
```

## Navigation Design

### Mobile Navigation
```typescript
const MobileNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦕</span>
            <h1 className="text-lg font-semibold">DINO</h1>
          </div>
          
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </header>
      
      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
        <div className="grid grid-cols-4 h-16">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === tab.id 
                  ? 'text-blue-600' 
                  : 'text-gray-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
      
      {/* Slide-out Menu */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-lg transform transition-transform duration-300
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        <SidebarContent onNavigate={() => setIsMenuOpen(false)} />
      </aside>
    </>
  )
}
```

### Tab Navigation Configuration
```typescript
const navigationTabs = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: HomeIcon,
    path: '/dashboard'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: CalendarIcon,
    path: '/dashboard/calendar'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserIcon,
    path: '/dashboard/profile'
  },
  {
    id: 'more',
    label: 'More',
    icon: DotsHorizontalIcon,
    path: '/dashboard/more'
  }
]
```

## Component Adaptations

### Dashboard Grid System

#### Mobile Layout (< 640px)
```typescript
const MobileDashboard: React.FC = () => {
  return (
    <div className="space-y-4 pb-20"> {/* Bottom padding for tab bar */}
      {/* Stats Cards - Single Column */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {statsCards.map(card => (
          <MobileStatsCard key={card.id} {...card} />
        ))}
      </div>
      
      {/* Visa Cards - Single Column */}
      <div className="space-y-3 px-4">
        {visaCards.map(card => (
          <MobileVisaCard key={card.countryCode} {...card} />
        ))}
      </div>
    </div>
  )
}

const MobileStatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-600 truncate">{title}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </div>
    </div>
  )
}
```

#### Tablet Layout (640px - 1024px)
```typescript
const TabletDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statsCards.map(card => (
          <StatsCard key={card.id} {...card} />
        ))}
      </div>
      
      {/* Visa Cards - 2 Column Grid */}
      <div className="grid grid-cols-2 gap-4">
        {visaCards.map(card => (
          <VisaCard key={card.countryCode} {...card} />
        ))}
      </div>
    </div>
  )
}
```

#### Desktop Layout (> 1024px)
```typescript
const DesktopDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Stats Cards - 4 Columns */}
      <div className="col-span-12">
        <div className="grid grid-cols-4 gap-6">
          {statsCards.map(card => (
            <StatsCard key={card.id} {...card} />
          ))}
        </div>
      </div>
      
      {/* Visa Cards - 3 Columns */}
      <div className="col-span-12">
        <div className="grid grid-cols-3 gap-6">
          {visaCards.map(card => (
            <VisaCard key={card.countryCode} {...card} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Visa Card Responsive Design

```typescript
const ResponsiveVisaCard: React.FC<VisaCardProps> = ({ 
  country, 
  visaStatus 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Always visible */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{country.flag}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {country.name}
            </h3>
            <p className="text-sm text-gray-600">
              {visaStatus.daysUsed} / {visaStatus.maxDays} days
            </p>
          </div>
          <InfoButton country={country} className="shrink-0" />
        </div>
      </div>
      
      {/* Progress Bar - Responsive sizing */}
      <div className="px-4 pb-2">
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              visaStatus.status === 'danger' ? 'bg-red-500' :
              visaStatus.status === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${visaStatus.percentage}%` }}
          />
        </div>
      </div>
      
      {/* Details - Hidden on mobile, shown on larger screens */}
      <div className="hidden sm:block px-4 pb-4">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>Days remaining:</span>
            <span className="font-medium">{visaStatus.remainingDays}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span>Rule type:</span>
            <span className="capitalize">{visaStatus.ruleType}</span>
          </div>
        </div>
      </div>
      
      {/* Status indicator - Mobile only */}
      <div className="sm:hidden px-4 pb-4">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          visaStatus.status === 'danger' ? 'bg-red-100 text-red-800' :
          visaStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {visaStatus.remainingDays} days left
        </div>
      </div>
    </div>
  )
}
```

## Touch Interactions

### Touch Target Sizing
```css
/* Minimum touch target size: 44px × 44px (iOS) / 48dp (Android) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Button sizing */
.btn-sm {
  min-height: 44px;
  padding: 8px 16px;
  font-size: 14px;
}

.btn-lg {
  min-height: 56px;
  padding: 16px 24px;
  font-size: 16px;
}
```

### Gesture Support
```typescript
import { useSwipeable } from 'react-swipeable'

const SwipeableCard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => console.log('Swiped left'),
    onSwipedRight: () => console.log('Swiped right'),
    onSwipedUp: () => console.log('Swiped up'),
    onSwipedDown: () => console.log('Swiped down'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 50 // Minimum swipe distance
  })
  
  return (
    <div {...handlers} className="select-none">
      {children}
    </div>
  )
}
```

### Pull-to-Refresh
```typescript
const PullToRefresh: React.FC<{ onRefresh: () => Promise<void> }> = ({ 
  onRefresh,
  children 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  
  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY
    }
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    if (startY && window.scrollY === 0) {
      const currentY = e.touches[0].clientY
      const distance = Math.max(0, currentY - startY)
      setPullDistance(Math.min(distance, 100))
    }
  }
  
  const handleTouchEnd = async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    setPullDistance(0)
    startY = null
  }
  
  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none'
      }}
    >
      {/* Refresh indicator */}
      {pullDistance > 0 && (
        <div className="text-center py-2">
          <RefreshIcon className={`w-6 h-6 mx-auto transition-transform ${
            isRefreshing ? 'animate-spin' : ''
          } ${
            pullDistance > 60 ? 'rotate-180' : ''
          }`} />
        </div>
      )}
      
      {children}
    </div>
  )
}
```

## Form Design

### Mobile-Optimized Forms
```typescript
const MobileForm: React.FC = () => {
  return (
    <form className="space-y-4 p-4">
      {/* Large input fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country
        </label>
        <select className="w-full h-12 px-4 border border-gray-300 rounded-lg text-16px">
          <option>Select country</option>
        </select>
      </div>
      
      {/* Date inputs with native picker */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entry Date
          </label>
          <input
            type="date"
            className="w-full h-12 px-4 border border-gray-300 rounded-lg text-16px"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exit Date
          </label>
          <input
            type="date"
            className="w-full h-12 px-4 border border-gray-300 rounded-lg text-16px"
          />
        </div>
      </div>
      
      {/* Large submit button */}
      <button className="w-full h-12 bg-blue-600 text-white rounded-lg font-medium text-16px">
        Add Stay
      </button>
    </form>
  )
}
```

### Input Field Best Practices
```css
/* Prevent zoom on iOS when input is focused */
input, select, textarea {
  font-size: 16px; /* 16px or larger prevents zoom */
}

/* Improve touch targets */
.form-field {
  min-height: 48px;
  padding: 12px 16px;
  border: 2px solid transparent;
  border-radius: 8px;
}

.form-field:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

## Modal and Overlay Design

### Mobile-First Modals
```typescript
const ResponsiveModal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children,
  title 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

### Bottom Sheet Pattern
```typescript
const BottomSheet: React.FC<BottomSheetProps> = ({ 
  isOpen, 
  onClose, 
  children 
}) => {
  const [dragY, setDragY] = useState(0)
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 sm:hidden"
          />
          
          <motion.div
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose()
              }
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            style={{ y: dragY }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-xl shadow-xl max-h-[90vh] sm:hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            
            <div className="px-4 pb-4 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

## Typography Scale

### Mobile Typography System
```css
/* Mobile typography scale */
.text-xs { font-size: 12px; line-height: 16px; } /* Labels, captions */
.text-sm { font-size: 14px; line-height: 20px; } /* Body text, descriptions */
.text-base { font-size: 16px; line-height: 24px; } /* Main text, inputs */
.text-lg { font-size: 18px; line-height: 28px; } /* Card titles, section headers */
.text-xl { font-size: 20px; line-height: 28px; } /* Page titles */
.text-2xl { font-size: 24px; line-height: 32px; } /* Main headings */

/* Responsive scaling */
@media (min-width: 640px) {
  .text-lg { font-size: 16px; line-height: 24px; }
  .text-xl { font-size: 18px; line-height: 28px; }
  .text-2xl { font-size: 20px; line-height: 28px; }
}
```

### Reading Optimization
```css
/* Optimize line length for readability */
.prose {
  max-width: 65ch; /* Optimal line length */
  line-height: 1.6; /* Comfortable line spacing */
}

/* Improve contrast on mobile */
@media (max-width: 640px) {
  .text-gray-600 {
    color: #4b5563; /* Slightly darker for better readability */
  }
}
```

## Color System

### Mobile-Optimized Colors
```css
/* High contrast colors for mobile */
:root {
  --color-text-primary: #111827;     /* Near black for main text */
  --color-text-secondary: #4b5563;   /* Dark gray for secondary text */
  --color-text-muted: #6b7280;       /* Medium gray for labels */
  
  --color-bg-primary: #ffffff;       /* White background */
  --color-bg-secondary: #f9fafb;     /* Light gray background */
  --color-bg-accent: #eff6ff;        /* Blue tinted background */
  
  --color-border: #e5e7eb;           /* Light gray borders */
  --color-border-focus: #3b82f6;     /* Blue focus state */
  
  --color-success: #10b981;          /* Green for success states */
  --color-warning: #f59e0b;          /* Amber for warnings */
  --color-danger: #ef4444;           /* Red for errors */
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: #f9fafb;
    --color-text-secondary: #d1d5db;
    --color-text-muted: #9ca3af;
    
    --color-bg-primary: #111827;
    --color-bg-secondary: #1f2937;
    --color-bg-accent: #1e3a8a;
    
    --color-border: #374151;
    --color-border-focus: #60a5fa;
  }
}
```

## Performance Optimizations

### Image Optimization
```typescript
const ResponsiveImage: React.FC<{
  src: string
  alt: string
  sizes?: string
}> = ({ src, alt, sizes = "100vw" }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      sizes={sizes}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyatinyPWkXduzk1saERw=="
      className="rounded-lg"
    />
  )
}
```

### Lazy Loading Components
```typescript
import { lazy, Suspense } from 'react'

// Lazy load non-critical components
const Calendar = lazy(() => import('../components/Calendar'))
const Profile = lazy(() => import('../components/Profile'))

const App: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <Route path="/calendar" component={Calendar} />
        <Route path="/profile" component={Profile} />
      </Router>
    </Suspense>
  )
}
```

### Bundle Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizeImages: true
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
}
```

## Testing on Mobile Devices

### Device Testing Matrix
```typescript
const testDevices = [
  // iOS
  { name: 'iPhone SE', viewport: { width: 375, height: 667 } },
  { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
  { name: 'iPhone 14 Pro Max', viewport: { width: 430, height: 932 } },
  { name: 'iPad', viewport: { width: 768, height: 1024 } },
  { name: 'iPad Pro', viewport: { width: 1024, height: 1366 } },
  
  // Android
  { name: 'Galaxy S21', viewport: { width: 360, height: 800 } },
  { name: 'Pixel 5', viewport: { width: 393, height: 851 } },
  { name: 'Galaxy Tab', viewport: { width: 800, height: 1280 } }
]
```

### Responsive Testing
```typescript
// Playwright mobile testing
import { test, devices } from '@playwright/test'

for (const device of testDevices) {
  test.describe(`Mobile tests - ${device.name}`, () => {
    test.use(device)
    
    test('should display mobile navigation', async ({ page }) => {
      await page.goto('/dashboard')
      await expect(page.locator('.mobile-nav')).toBeVisible()
      await expect(page.locator('.desktop-nav')).toBeHidden()
    })
    
    test('should handle touch interactions', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Test swipe gesture
      const card = page.locator('.visa-card').first()
      await card.hover()
      await page.mouse.down()
      await page.mouse.move(100, 0)
      await page.mouse.up()
      
      // Verify swipe action
      await expect(page.locator('.swipe-indicator')).toBeVisible()
    })
  })
}
```

## Accessibility on Mobile

### Focus Management
```css
/* Improve focus indicators on mobile */
.focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Remove focus outline when not using keyboard */
.focus\:not-focus-visible {
  outline: none;
}
```

### Screen Reader Support
```typescript
const MobileAccessibleButton: React.FC<{
  children: ReactNode
  onPress: () => void
  ariaLabel?: string
}> = ({ children, onPress, ariaLabel }) => {
  return (
    <button
      onClick={onPress}
      aria-label={ariaLabel}
      className="min-h-[44px] min-w-[44px] flex items-center justify-center"
    >
      {children}
    </button>
  )
}
```

### Voice Control Support
```typescript
// Add voice control hints
<button
  aria-label="Add new travel stay"
  data-voice-command="add stay"
  className="voice-controllable"
>
  Add Stay
</button>
```

## Common Mobile Issues & Solutions

### iOS Safari Quirks
```css
/* Fix iOS Safari 100vh issue */
.full-height {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}

/* Prevent input zoom */
input, select, textarea {
  font-size: 16px;
  transform-origin: left top;
}

/* Fix iOS Safari bounce scroll */
body {
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
```

### Android Chrome Issues
```css
/* Fix Android keyboard pushing content */
.keyboard-aware {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height */
}

/* Improve touch response */
button {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
}
```

### Performance Monitoring
```typescript
// Performance monitoring for mobile
const MobilePerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Monitor FPS
    let frames = 0
    let lastTime = performance.now()
    
    const countFrames = () => {
      frames++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime))
        
        // Log poor performance
        if (fps < 30) {
          console.warn(`Low FPS detected: ${fps}`)
        }
        
        frames = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(countFrames)
    }
    
    requestAnimationFrame(countFrames)
  }, [])
  
  return null
}
```

## Future Mobile Enhancements

### Progressive Web App (PWA)
```javascript
// next-pwa configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // Next.js config
})
```

### Native App Features
```typescript
// Web Share API
const shareTrip = async (tripData: Trip) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'My Trip to ' + tripData.country,
        text: 'Check out my travel itinerary',
        url: window.location.href
      })
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }
}

// Geolocation
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        // Use coordinates
      },
      (error) => {
        console.error('Location error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }
}
```

## Related Documentation
- [Component Library](./COMPONENTS.md)
- [Dashboard Features](../features/DASHBOARD.md)
- [Calendar Features](../features/CALENDAR.md)
- [Accessibility Guidelines](./ACCESSIBILITY.md)