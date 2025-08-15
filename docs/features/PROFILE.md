# Profile Feature Documentation

## Overview
The Profile feature provides comprehensive user account management, including passport information, security settings, emergency contacts, preferences, and travel statistics. It's organized into five distinct tabs for better user experience and data organization.

## File Structure
```
app/dashboard/profile/
├── page.tsx                    # Main profile page with tab navigation
└── loading.tsx                 # Loading state component

components/
├── ProfileTabs/
│   ├── PassportTab.tsx        # Passport and nationality information
│   ├── SecurityTab.tsx        # Password and account security
│   ├── EmergencyTab.tsx       # Emergency contact details
│   ├── PreferencesTab.tsx     # User preferences and settings
│   └── StatsTab.tsx           # Travel statistics and insights

lib/
├── supabase-store.ts          # Profile state management
└── types.ts                   # TypeScript interfaces
```

## Core Components

### 1. Profile Page (`app/dashboard/profile/page.tsx`)

#### Purpose
Container component that manages tab navigation and orchestrates profile data loading and saving.

#### Tab Structure
```typescript
const tabs = [
  { id: 'passport', label: 'Passport', icon: '📔' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'emergency', label: 'Emergency', icon: '🚨' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  { id: 'stats', label: 'Stats', icon: '📊' }
]
```

#### State Management
```typescript
const [activeTab, setActiveTab] = useState<TabId>('passport')
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
const [isSaving, setIsSaving] = useState(false)
```

#### Mobile Responsiveness
- **Desktop**: Full tab labels with icons
- **Mobile**: Icons only to save space
- **Tablet**: Responsive flex layout

### 2. Passport Tab (`components/ProfileTabs/PassportTab.tsx`)

#### Purpose
Manages passport details and nationality information critical for visa calculations.

#### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| passport_number | string | No | Passport identification number |
| passport_nationality | string | Yes | Country code (e.g., 'US', 'KR') |
| passport_issue_date | date | No | Date passport was issued |
| passport_expiry_date | date | Yes | Passport expiration date |
| date_of_birth | date | No | User's date of birth |
| full_name | string | No | Full legal name |

#### Visual Layout
```
┌─────────────────────────────────────┐
│ 📔 Passport Information             │
├─────────────────────────────────────┤
│ Nationality:    [🇺🇸 United States ▼]│
│ Passport No:    [_______________]   │
│ Full Name:      [_______________]   │
│ Date of Birth:  [_______________]   │
│ Issue Date:     [_______________]   │
│ Expiry Date:    [_______________]   │
│                                     │
│ ⚠️ Passport expires in 89 days      │
│                                     │
│              [💾 Save Changes]       │
└─────────────────────────────────────┘
```

#### Validation Rules
- Expiry date must be in the future
- Issue date must be before expiry date
- Nationality required for visa calculations
- Passport number format validation (alphanumeric)

#### Special Features
- **Expiry Warning**: Visual alert when passport expires within 6 months
- **Country Selector**: Dropdown with flag emojis and country names
- **Auto-Save**: Saves on blur after changes

### 3. Security Tab (`components/ProfileTabs/SecurityTab.tsx`)

#### Purpose
Account security management including password changes and two-factor authentication settings.

#### Features
1. **Password Change**
   - No current password required (Supabase Auth)
   - Minimum 6 characters validation
   - Password strength indicator (planned)
   - Confirmation field matching

2. **Two-Factor Authentication** (Planned)
   - TOTP setup
   - Backup codes
   - Device management

3. **Active Sessions** (Planned)
   - View active sessions
   - Remote logout capability

#### Password Change Flow
```typescript
const handlePasswordChange = async () => {
  // Validation
  if (newPassword.length < 6) {
    setError('Password must be at least 6 characters')
    return
  }
  if (newPassword !== confirmPassword) {
    setError('Passwords do not match')
    return
  }
  
  // Update via Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (!error) {
    // Success feedback
    toast.success('Password updated successfully')
    // Clear form
    setNewPassword('')
    setConfirmPassword('')
  }
}
```

#### Security Best Practices
- Passwords never stored in profile table
- Uses Supabase Auth for all authentication
- HTTPS only for production
- Session tokens with expiry

### 4. Emergency Tab (`components/ProfileTabs/EmergencyTab.tsx`)

#### Purpose
Critical information for emergency situations during travel.

#### Data Structure
```typescript
interface EmergencyContact {
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_email?: string
  emergency_contact_relationship?: string
  
  // Secondary contact
  emergency_contact_2_name?: string
  emergency_contact_2_phone?: string
  emergency_contact_2_email?: string
  emergency_contact_2_relationship?: string
  
  // Medical information
  blood_type?: string
  medical_conditions?: string
  allergies?: string
  medications?: string
  
  // Insurance
  insurance_provider?: string
  insurance_policy_number?: string
  insurance_phone?: string
}
```

#### Visual Organization
- **Primary Contact**: First person to contact
- **Secondary Contact**: Backup contact person
- **Medical Information**: Critical health data
- **Insurance Details**: Travel insurance information

#### Privacy Considerations
- Data encrypted at rest in Supabase
- RLS ensures only user can access their data
- Optional fields - user controls what to share
- Export capability for offline access (planned)

### 5. Preferences Tab (`components/ProfileTabs/PreferencesTab.tsx`)

#### Purpose
User preferences for notifications, display settings, and app behavior.

#### Settings Categories

##### Notification Preferences
```typescript
interface NotificationSettings {
  email_visa_expiry: boolean      // Email before visa expires
  email_passport_expiry: boolean  // Email before passport expires
  email_weekly_summary: boolean   // Weekly travel summary
  push_notifications: boolean     // Mobile push (future)
  
  // Timing
  visa_warning_days: number       // Days before visa expiry (default: 30)
  passport_warning_days: number   // Days before passport expiry (default: 90)
}
```

##### Display Preferences
```typescript
interface DisplaySettings {
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timezone: string                // User's preferred timezone
  language: string                // Interface language (future)
  theme: 'light' | 'dark' | 'auto' // Theme preference (future)
  
  // Dashboard
  default_view: 'cards' | 'list' | 'calendar'
  countries_per_row: 1 | 2 | 3
  show_planned_trips: boolean
}
```

##### Privacy Settings
```typescript
interface PrivacySettings {
  profile_visibility: 'private' | 'friends' | 'public' // Future
  share_statistics: boolean       // Anonymous statistics
  allow_analytics: boolean        // Usage analytics
}
```

#### UI Components
- Toggle switches for boolean settings
- Dropdowns for enumerated options
- Number inputs with min/max validation
- Grouped sections with descriptions

### 6. Stats Tab (`components/ProfileTabs/StatsTab.tsx`)

#### Purpose
Read-only display of travel statistics and insights derived from stay data.

#### Statistics Displayed

##### Travel Overview
```typescript
const stats = {
  // Lifetime stats
  totalCountries: uniqueCountries.length,
  totalDaysAbroad: calculateTotalDays(stays),
  totalTrips: stays.length,
  averageTripLength: totalDays / trips,
  
  // Current year
  currentYearDays: calculateYearDays(stays, new Date()),
  currentYearCountries: getYearCountries(stays, new Date()),
  
  // Visa usage
  mostVisitedCountry: getMostVisited(stays),
  longestStay: getLongestStay(stays),
  shortestStay: getShortestStay(stays),
  
  // Patterns
  favoriteMonth: getFavoriteMonth(stays),
  averageDaysPerCountry: getAverageByCountry(stays)
}
```

##### Visual Components
1. **Stat Cards**: Key metrics in card layout
2. **Country Ranking**: Top 5 most visited countries
3. **Year Comparison**: Year-over-year travel trends
4. **Monthly Heatmap**: Travel intensity by month (planned)
5. **Visa Usage Chart**: Visual representation of visa utilization

#### Calculation Methods
```typescript
// Total days calculation (handles overlaps)
const calculateTotalDays = (stays: Stay[]) => {
  return stays.reduce((total, stay) => {
    const entry = new Date(stay.entryDate)
    const exit = stay.exitDate ? new Date(stay.exitDate) : new Date()
    const days = differenceInDays(exit, entry) + 1
    return total + days
  }, 0)
}

// Most visited country
const getMostVisited = (stays: Stay[]) => {
  const countryDays = stays.reduce((acc, stay) => {
    const days = calculateStayDays(stay)
    acc[stay.countryCode] = (acc[stay.countryCode] || 0) + days
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(countryDays)
    .sort(([,a], [,b]) => b - a)[0]
}
```

## Data Management

### Profile Store Integration

#### Loading Profile
```typescript
const loadProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (data) {
    set({ profile: data })
  }
}
```

#### Saving Profile
```typescript
const updateProfile = async (updates: Partial<Profile>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  // Optimistic update
  set(state => ({
    profile: { ...state.profile, ...updates }
  }))
  
  // Database update
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    
  if (error) {
    // Rollback on error
    await loadProfile()
    throw error
  }
}
```

### Database Schema
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  -- Passport fields
  passport_number TEXT,
  passport_nationality TEXT,
  passport_issue_date DATE,
  passport_expiry_date DATE,
  date_of_birth DATE,
  full_name TEXT,
  
  -- Emergency contacts
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_email TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_2_name TEXT,
  emergency_contact_2_phone TEXT,
  emergency_contact_2_email TEXT,
  emergency_contact_2_relationship TEXT,
  
  -- Medical
  blood_type TEXT,
  medical_conditions TEXT,
  allergies TEXT,
  medications TEXT,
  
  -- Insurance
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_phone TEXT,
  
  -- Preferences (JSONB)
  notification_settings JSONB,
  display_preferences JSONB,
  privacy_settings JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

## Validation & Error Handling

### Field Validation

#### Client-Side Validation
```typescript
const validatePassport = (data: PassportData): ValidationErrors => {
  const errors: ValidationErrors = {}
  
  // Required fields
  if (!data.passport_nationality) {
    errors.passport_nationality = 'Nationality is required'
  }
  
  // Date validations
  if (data.passport_expiry_date) {
    const expiry = new Date(data.passport_expiry_date)
    if (expiry < new Date()) {
      errors.passport_expiry_date = 'Passport has expired'
    }
  }
  
  // Format validations
  if (data.emergency_contact_email) {
    if (!isValidEmail(data.emergency_contact_email)) {
      errors.emergency_contact_email = 'Invalid email format'
    }
  }
  
  return errors
}
```

#### Server-Side Validation
- Database constraints for data types
- RLS policies for access control
- Trigger functions for data consistency

### Error States

#### Network Errors
```typescript
try {
  await updateProfile(data)
  toast.success('Profile updated successfully')
} catch (error) {
  if (error.code === 'PGRST116') {
    toast.error('Profile not found. Please refresh and try again.')
  } else if (error.message.includes('network')) {
    toast.error('Network error. Please check your connection.')
  } else {
    toast.error('Failed to update profile. Please try again.')
  }
}
```

#### Validation Errors
- Inline field errors with red highlighting
- Error summary at top of form
- Prevent submission with validation errors
- Clear errors on field correction

## Performance Considerations

### Optimization Strategies

1. **Tab Lazy Loading**
```typescript
const TabContent = lazy(() => import(`./ProfileTabs/${activeTab}Tab`))
```

2. **Debounced Auto-Save**
```typescript
const debouncedSave = useMemo(
  () => debounce(updateProfile, 1000),
  []
)
```

3. **Optimistic Updates**
- Update UI immediately
- Sync with database in background
- Rollback on error

4. **Caching Strategy**
- Profile data cached in Zustand store
- Refresh on window focus
- Manual refresh button available

### Loading States

#### Skeleton Screens
```typescript
const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-10 bg-gray-200 rounded w-1/4 mb-4" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  </div>
)
```

## Accessibility

### WCAG 2.1 Compliance

#### Form Accessibility
- Proper label associations
- Required field indicators
- Error announcements
- Keyboard navigation

#### ARIA Attributes
```html
<input
  aria-label="Passport Number"
  aria-required="false"
  aria-invalid={!!errors.passport_number}
  aria-describedby="passport-number-error"
/>
```

#### Focus Management
- Tab order follows visual flow
- Focus trap in modals
- Skip links for navigation
- Focus visible indicators

## Testing Strategy

### Unit Tests
```typescript
describe('PassportTab', () => {
  it('should validate expiry date is in future')
  it('should show warning for soon-to-expire passport')
  it('should format passport number correctly')
})

describe('SecurityTab', () => {
  it('should validate password minimum length')
  it('should ensure password confirmation matches')
  it('should clear form after successful change')
})
```

### Integration Tests
- Test profile loading from Supabase
- Test profile updates and error handling
- Test tab navigation and state persistence
- Test validation across all forms

### E2E Tests
- Complete profile setup flow
- Password change flow
- Emergency contact addition
- Preference changes and persistence

## Security Considerations

### Data Protection
1. **Encryption**: All data encrypted at rest in Supabase
2. **Transit Security**: HTTPS only for all API calls
3. **Access Control**: RLS policies ensure data isolation
4. **Sensitive Data**: Passwords handled by Supabase Auth only

### Privacy Features
1. **Minimal Data Collection**: Only essential fields required
2. **User Control**: All fields except nationality optional
3. **Data Export**: Users can export their data (planned)
4. **Deletion Rights**: Account deletion removes all data

## Future Enhancements

### Planned Features
1. **Profile Photo Upload**: Avatar management
2. **Document Uploads**: Passport/visa scans
3. **Biometric Passport Info**: Chip data storage
4. **Travel Preferences**: Preferred airlines, accommodation
5. **Loyalty Programs**: Frequent flyer integration

### UI/UX Improvements
1. **Profile Completion Progress**: Visual progress indicator
2. **Quick Actions**: Common tasks shortcuts
3. **Profile Templates**: Pre-filled common nationalities
4. **Import/Export**: Backup and restore profile data
5. **Multi-Language Support**: Localized forms

## Related Documentation
- [State Management](../architecture/STATE-MANAGEMENT.md)
- [Database Schema](../architecture/DATABASE.md)
- [Authentication](../architecture/AUTHENTICATION.md)
- [Security Policies](../../SECURITY.md)