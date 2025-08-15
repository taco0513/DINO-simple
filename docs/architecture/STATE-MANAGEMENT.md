# State Management Architecture Documentation

## Overview
DINO uses Zustand for client-side state management, providing a lightweight, TypeScript-friendly solution for managing application state. The architecture emphasizes simplicity, performance, and seamless integration with Supabase for data persistence.

## Technology Stack

### Zustand
```typescript
// Why Zustand?
- Minimal boilerplate (2KB gzipped)
- TypeScript first-class support
- No providers needed
- Built-in DevTools support
- Async actions support
- Middleware system
- React Suspense ready
```

### Architecture Principles
1. **Single Source of Truth**: Supabase as authoritative data source
2. **Optimistic Updates**: Immediate UI updates with rollback on failure
3. **Smart Caching**: 5-second cache to prevent excessive API calls
4. **Separation of Concerns**: Distinct slices for different domains
5. **Type Safety**: Full TypeScript coverage

## Store Structure

### Main Store (`lib/supabase-store.ts`)

```typescript
interface SupabaseStore {
  // Auth State
  user: User | null
  session: Session | null
  loading: boolean
  
  // Data State
  stays: Stay[]
  profile: Profile | null
  notifications: Notification[]
  
  // UI State
  selectedStay: Stay | null
  filters: FilterState
  sortOrder: SortOrder
  
  // Cache Management
  lastFetch: number
  cacheTimeout: number
  
  // Flags
  initialLoad: boolean
  isSyncing: boolean
  hasUnsavedChanges: boolean
  
  // Actions - Auth
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  
  // Actions - Stays
  loadStays: () => Promise<void>
  addStay: (stay: Partial<Stay>) => Promise<void>
  updateStay: (id: string, updates: Partial<Stay>) => Promise<void>
  deleteStay: (id: string) => Promise<void>
  bulkImportStays: (stays: Stay[]) => Promise<void>
  
  // Actions - Profile
  loadProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  
  // Actions - UI
  setSelectedStay: (stay: Stay | null) => void
  setFilters: (filters: Partial<FilterState>) => void
  setSortOrder: (order: SortOrder) => void
  
  // Actions - Utility
  migrateFromLocalStorage: () => Promise<void>
  clearCache: () => void
  syncWithSupabase: () => Promise<void>
}
```

### Store Implementation

```typescript
import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export const useSupabaseStore = create<SupabaseStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial State
          user: null,
          session: null,
          loading: false,
          stays: [],
          profile: null,
          notifications: [],
          selectedStay: null,
          filters: {
            countries: [],
            dateRange: null,
            visaTypes: [],
            searchTerm: ''
          },
          sortOrder: 'date-desc',
          lastFetch: 0,
          cacheTimeout: 5000, // 5 seconds
          initialLoad: false,
          isSyncing: false,
          hasUnsavedChanges: false,
          
          // Implementation...
        }))
      ),
      {
        name: 'dino-storage',
        partialize: (state) => ({
          // Only persist UI preferences
          filters: state.filters,
          sortOrder: state.sortOrder
        })
      }
    ),
    {
      name: 'DINO Store'
    }
  )
)
```

## State Slices

### 1. Authentication Slice

```typescript
interface AuthSlice {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  refreshSession: () => Promise<void>
}

const authSlice: StateCreator<AuthSlice> = (set, get) => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  
  signIn: async (email, password) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      set({
        user: data.user,
        session: data.session,
        loading: false
      })
      
      // Load user data after sign in
      await get().loadProfile()
      await get().loadStays()
      
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },
  
  signOut: async () => {
    set({ loading: true })
    
    try {
      await supabase.auth.signOut()
      
      // Clear all data
      set({
        user: null,
        session: null,
        stays: [],
        profile: null,
        notifications: [],
        loading: false
      })
      
      // Clear cache
      localStorage.removeItem('dino-storage')
      
    } catch (error) {
      set({ loading: false })
      throw error
    }
  }
})
```

### 2. Stays Data Slice

```typescript
interface StaysSlice {
  stays: Stay[]
  lastFetch: number
  cacheTimeout: number
  loading: boolean
  error: string | null
  
  loadStays: () => Promise<void>
  addStay: (stay: Partial<Stay>) => Promise<void>
  updateStay: (id: string, updates: Partial<Stay>) => Promise<void>
  deleteStay: (id: string) => Promise<void>
  bulkImportStays: (stays: Stay[]) => Promise<void>
}

const staysSlice: StateCreator<StaysSlice> = (set, get) => ({
  stays: [],
  lastFetch: 0,
  cacheTimeout: 5000,
  loading: false,
  error: null,
  
  loadStays: async () => {
    // Check cache
    const now = Date.now()
    if (now - get().lastFetch < get().cacheTimeout) {
      return // Use cached data
    }
    
    set({ loading: true, error: null })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('stays')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
      
      if (error) throw error
      
      set({
        stays: data || [],
        lastFetch: now,
        loading: false,
        initialLoad: true
      })
      
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },
  
  addStay: async (stayData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    const newStay = {
      ...stayData,
      user_id: user.id,
      id: crypto.randomUUID()
    }
    
    // Optimistic update
    set(state => ({
      stays: [newStay, ...state.stays]
    }))
    
    try {
      const { data, error } = await supabase
        .from('stays')
        .insert([newStay])
        .select()
        .single()
      
      if (error) throw error
      
      // Update with server response
      set(state => ({
        stays: state.stays.map(s => 
          s.id === newStay.id ? data : s
        )
      }))
      
    } catch (error) {
      // Rollback optimistic update
      set(state => ({
        stays: state.stays.filter(s => s.id !== newStay.id)
      }))
      throw error
    }
  },
  
  updateStay: async (id, updates) => {
    // Store original for rollback
    const original = get().stays.find(s => s.id === id)
    if (!original) throw new Error('Stay not found')
    
    // Optimistic update
    set(state => ({
      stays: state.stays.map(s => 
        s.id === id ? { ...s, ...updates } : s
      )
    }))
    
    try {
      const { error } = await supabase
        .from('stays')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      
      // Invalidate cache to force refresh
      set({ lastFetch: 0 })
      
    } catch (error) {
      // Rollback
      set(state => ({
        stays: state.stays.map(s => 
          s.id === id ? original : s
        )
      }))
      throw error
    }
  },
  
  deleteStay: async (id) => {
    // Store for rollback
    const original = get().stays
    
    // Optimistic update
    set(state => ({
      stays: state.stays.filter(s => s.id !== id)
    }))
    
    try {
      const { error } = await supabase
        .from('stays')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
    } catch (error) {
      // Rollback
      set({ stays: original })
      throw error
    }
  }
})
```

### 3. Profile Slice

```typescript
interface ProfileSlice {
  profile: Profile | null
  loading: boolean
  error: string | null
  
  loadProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
}

const profileSlice: StateCreator<ProfileSlice> = (set, get) => ({
  profile: null,
  loading: false,
  error: null,
  
  loadProfile: async () => {
    set({ loading: true, error: null })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      set({
        profile: data || null,
        loading: false
      })
      
      // Create profile if doesn't exist
      if (!data) {
        await get().createProfile()
      }
      
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },
  
  updateProfile: async (updates) => {
    const original = get().profile
    
    // Optimistic update
    set(state => ({
      profile: { ...state.profile, ...updates }
    }))
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
      
      if (error) throw error
      
    } catch (error) {
      // Rollback
      set({ profile: original })
      throw error
    }
  }
})
```

### 4. UI State Slice

```typescript
interface UISlice {
  // Selection
  selectedStay: Stay | null
  selectedCountry: Country | null
  
  // Filters
  filters: {
    countries: string[]
    dateRange: { start: Date | null; end: Date | null }
    visaTypes: string[]
    searchTerm: string
    showOngoing: boolean
    showFuture: boolean
  }
  
  // Sorting
  sortOrder: 'date-asc' | 'date-desc' | 'country' | 'duration'
  
  // View preferences
  viewMode: 'cards' | 'list' | 'calendar'
  dashboardLayout: 'default' | 'compact' | 'detailed'
  
  // Modals
  modals: {
    addStay: boolean
    editStay: boolean
    feedback: boolean
    visaDetail: boolean
  }
  
  // Actions
  setSelectedStay: (stay: Stay | null) => void
  setFilters: (filters: Partial<FilterState>) => void
  setSortOrder: (order: SortOrder) => void
  toggleModal: (modal: keyof UISlice['modals'], open?: boolean) => void
  resetFilters: () => void
}

const uiSlice: StateCreator<UISlice> = (set, get) => ({
  selectedStay: null,
  selectedCountry: null,
  filters: {
    countries: [],
    dateRange: { start: null, end: null },
    visaTypes: [],
    searchTerm: '',
    showOngoing: true,
    showFuture: true
  },
  sortOrder: 'date-desc',
  viewMode: 'cards',
  dashboardLayout: 'default',
  modals: {
    addStay: false,
    editStay: false,
    feedback: false,
    visaDetail: false
  },
  
  setSelectedStay: (stay) => set({ selectedStay: stay }),
  
  setFilters: (newFilters) => set(state => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  setSortOrder: (order) => set({ sortOrder: order }),
  
  toggleModal: (modal, open) => set(state => ({
    modals: {
      ...state.modals,
      [modal]: open !== undefined ? open : !state.modals[modal]
    }
  })),
  
  resetFilters: () => set({
    filters: {
      countries: [],
      dateRange: { start: null, end: null },
      visaTypes: [],
      searchTerm: '',
      showOngoing: true,
      showFuture: true
    }
  })
})
```

## Computed Values (Selectors)

### Filtered and Sorted Stays
```typescript
export const useFilteredStays = () => {
  const stays = useSupabaseStore(state => state.stays)
  const filters = useSupabaseStore(state => state.filters)
  const sortOrder = useSupabaseStore(state => state.sortOrder)
  
  return useMemo(() => {
    let filtered = [...stays]
    
    // Apply filters
    if (filters.countries.length > 0) {
      filtered = filtered.filter(s => 
        filters.countries.includes(s.countryCode)
      )
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(s => 
        s.city?.toLowerCase().includes(term) ||
        s.notes?.toLowerCase().includes(term)
      )
    }
    
    if (filters.dateRange.start) {
      filtered = filtered.filter(s => 
        new Date(s.entryDate) >= filters.dateRange.start
      )
    }
    
    if (!filters.showOngoing) {
      filtered = filtered.filter(s => s.exitDate)
    }
    
    if (!filters.showFuture) {
      filtered = filtered.filter(s => 
        new Date(s.entryDate) <= new Date()
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'date-asc':
          return new Date(a.entryDate).getTime() - 
                 new Date(b.entryDate).getTime()
        case 'date-desc':
          return new Date(b.entryDate).getTime() - 
                 new Date(a.entryDate).getTime()
        case 'country':
          return a.countryCode.localeCompare(b.countryCode)
        case 'duration':
          return (b.duration || 0) - (a.duration || 0)
        default:
          return 0
      }
    })
    
    return filtered
  }, [stays, filters, sortOrder])
}
```

### Visa Statuses
```typescript
export const useVisaStatuses = () => {
  const stays = useSupabaseStore(state => state.stays)
  
  return useMemo(() => {
    const countries = [...new Set(stays.map(s => s.countryCode))]
    
    return countries.map(countryCode => {
      const country = countriesData.find(c => c.code === countryCode)
      if (!country) return null
      
      return calculateVisaStatus(stays, country)
    }).filter(Boolean)
  }, [stays])
}
```

### Statistics
```typescript
export const useStatistics = () => {
  const stays = useSupabaseStore(state => state.stays)
  
  return useMemo(() => {
    const now = new Date()
    const yearStart = startOfYear(now)
    
    return {
      totalCountries: new Set(stays.map(s => s.countryCode)).size,
      totalDays: stays.reduce((sum, stay) => {
        const days = stay.duration || 
          differenceInDays(new Date(), new Date(stay.entryDate)) + 1
        return sum + days
      }, 0),
      currentYearDays: stays
        .filter(stay => {
          const entryDate = new Date(stay.entryDate)
          const exitDate = stay.exitDate ? 
            new Date(stay.exitDate) : now
          return exitDate >= yearStart && entryDate <= now
        })
        .reduce((total, stay) => {
          const entryDate = new Date(stay.entryDate)
          const exitDate = stay.exitDate ? 
            new Date(stay.exitDate) : now
          const effectiveStart = entryDate > yearStart ? 
            entryDate : yearStart
          const effectiveEnd = exitDate < now ? exitDate : now
          
          if (effectiveEnd >= effectiveStart) {
            return total + differenceInDays(effectiveEnd, effectiveStart) + 1
          }
          return total
        }, 0),
      currentStay: stays.find(s => !s.exitDate),
      upcomingTrips: stays.filter(s => 
        new Date(s.entryDate) > now
      ).length
    }
  }, [stays])
}
```

## Middleware

### Persistence Middleware
```typescript
const persistConfig = {
  name: 'dino-storage',
  version: 1,
  partialize: (state) => ({
    // Only persist UI preferences, not data
    filters: state.filters,
    sortOrder: state.sortOrder,
    viewMode: state.viewMode,
    dashboardLayout: state.dashboardLayout
  }),
  migrate: (persistedState: any, version: number) => {
    if (version === 0) {
      // Migration from version 0 to 1
      return {
        ...persistedState,
        viewMode: persistedState.viewMode || 'cards'
      }
    }
    return persistedState
  }
}
```

### Logger Middleware (Development)
```typescript
const logger = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('Previous state:', get())
      set(...args)
      console.log('New state:', get())
    },
    get,
    api
  )
```

### Immer Middleware
```typescript
import { immer } from 'zustand/middleware/immer'

// Enables direct mutation syntax
const store = create(
  immer((set) => ({
    stays: [],
    addStay: (stay) =>
      set((state) => {
        state.stays.push(stay) // Direct mutation with Immer
      })
  }))
)
```

## Subscriptions and Side Effects

### Auth State Listener
```typescript
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      switch (event) {
        case 'SIGNED_IN':
          useSupabaseStore.setState({
            user: session?.user || null,
            session
          })
          // Load user data
          await useSupabaseStore.getState().loadProfile()
          await useSupabaseStore.getState().loadStays()
          break
          
        case 'SIGNED_OUT':
          useSupabaseStore.setState({
            user: null,
            session: null,
            stays: [],
            profile: null
          })
          break
          
        case 'TOKEN_REFRESHED':
          useSupabaseStore.setState({ session })
          break
      }
    }
  )
  
  return () => {
    authListener.subscription.unsubscribe()
  }
}, [])
```

### Real-time Subscriptions
```typescript
useEffect(() => {
  const user = useSupabaseStore.getState().user
  if (!user) return
  
  const subscription = supabase
    .channel('stays_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'stays',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            useSupabaseStore.setState(state => ({
              stays: [payload.new, ...state.stays]
            }))
            break
            
          case 'UPDATE':
            useSupabaseStore.setState(state => ({
              stays: state.stays.map(s =>
                s.id === payload.new.id ? payload.new : s
              )
            }))
            break
            
          case 'DELETE':
            useSupabaseStore.setState(state => ({
              stays: state.stays.filter(s => s.id !== payload.old.id)
            }))
            break
        }
      }
    )
    .subscribe()
  
  return () => {
    subscription.unsubscribe()
  }
}, [user])
```

### Store Subscriptions
```typescript
// Subscribe to specific state changes
const unsubscribe = useSupabaseStore.subscribe(
  (state) => state.stays,
  (stays) => {
    console.log('Stays updated:', stays)
    // Trigger side effects
  }
)

// Subscribe with selector
const unsubscribeFilters = useSupabaseStore.subscribe(
  (state) => state.filters,
  (filters) => {
    // Save filters to localStorage
    localStorage.setItem('userFilters', JSON.stringify(filters))
  }
)
```

## Performance Optimization

### Selective Subscriptions
```typescript
// Only re-render when specific fields change
const stays = useSupabaseStore(state => state.stays)
const loading = useSupabaseStore(state => state.loading)

// Or use shallow equality check
const { stays, loading } = useSupabaseStore(
  state => ({ stays: state.stays, loading: state.loading }),
  shallow
)
```

### Memoized Selectors
```typescript
const selectFilteredStays = createSelector(
  [(state) => state.stays, (state) => state.filters],
  (stays, filters) => {
    // Expensive filtering logic
    return filterStays(stays, filters)
  }
)

// Usage
const filteredStays = useSupabaseStore(selectFilteredStays)
```

### Batched Updates
```typescript
const batchedUpdate = () => {
  useSupabaseStore.setState((state) => {
    // Multiple updates in single render
    state.loading = true
    state.error = null
    state.stays = []
  })
}
```

## Testing

### Store Testing
```typescript
import { renderHook, act } from '@testing-library/react-hooks'
import { useSupabaseStore } from './supabase-store'

describe('Supabase Store', () => {
  beforeEach(() => {
    useSupabaseStore.setState({
      stays: [],
      profile: null,
      user: null
    })
  })
  
  it('should add stay optimistically', async () => {
    const { result } = renderHook(() => useSupabaseStore())
    
    const newStay = {
      countryCode: 'JP',
      city: 'Tokyo',
      entryDate: '2024-01-01',
      exitDate: '2024-01-15'
    }
    
    await act(async () => {
      await result.current.addStay(newStay)
    })
    
    expect(result.current.stays).toHaveLength(1)
    expect(result.current.stays[0].countryCode).toBe('JP')
  })
  
  it('should rollback on error', async () => {
    const { result } = renderHook(() => useSupabaseStore())
    
    // Mock Supabase error
    jest.spyOn(supabase.from('stays'), 'insert')
      .mockRejectedValue(new Error('Database error'))
    
    await act(async () => {
      try {
        await result.current.addStay({})
      } catch (error) {
        // Expected error
      }
    })
    
    expect(result.current.stays).toHaveLength(0)
  })
})
```

### Mock Store for Testing
```typescript
const createMockStore = (initialState?: Partial<SupabaseStore>) => {
  return create<SupabaseStore>()((set) => ({
    ...defaultState,
    ...initialState,
    
    // Mock actions
    loadStays: jest.fn(() => Promise.resolve()),
    addStay: jest.fn(() => Promise.resolve()),
    updateStay: jest.fn(() => Promise.resolve()),
    deleteStay: jest.fn(() => Promise.resolve())
  }))
}

// Usage in tests
const mockStore = createMockStore({
  stays: mockStays,
  user: mockUser
})
```

## Migration from Local Storage

### Migration Function
```typescript
const migrateFromLocalStorage = async () => {
  try {
    // Check for old data
    const oldStays = localStorage.getItem('stays')
    const oldProfile = localStorage.getItem('userProfile')
    
    if (!oldStays && !oldProfile) return
    
    const user = useSupabaseStore.getState().user
    if (!user) return
    
    // Migrate stays
    if (oldStays) {
      const stays = JSON.parse(oldStays)
      const migratedStays = stays.map(stay => ({
        ...stay,
        user_id: user.id,
        created_at: stay.created_at || new Date().toISOString()
      }))
      
      await supabase
        .from('stays')
        .upsert(migratedStays, {
          onConflict: 'id',
          ignoreDuplicates: true
        })
    }
    
    // Migrate profile
    if (oldProfile) {
      const profile = JSON.parse(oldProfile)
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile
        })
    }
    
    // Clear old data
    localStorage.removeItem('stays')
    localStorage.removeItem('userProfile')
    
    // Reload from Supabase
    await useSupabaseStore.getState().loadStays()
    await useSupabaseStore.getState().loadProfile()
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}
```

## DevTools Integration

### Zustand DevTools
```typescript
// Automatic with devtools middleware
const useStore = create(
  devtools(
    (set) => ({
      // Store implementation
    }),
    {
      name: 'DINO Store',
      trace: true,
      anonymize: false
    }
  )
)
```

### Custom DevTools Actions
```typescript
// Add custom devtools actions
window.__DINO_DEVTOOLS__ = {
  clearCache: () => useSupabaseStore.setState({ lastFetch: 0 }),
  resetStore: () => useSupabaseStore.setState(initialState),
  exportState: () => JSON.stringify(useSupabaseStore.getState()),
  importState: (json) => useSupabaseStore.setState(JSON.parse(json))
}
```

## Error Handling

### Global Error Handler
```typescript
const errorHandler = (error: Error, action: string) => {
  console.error(`Error in ${action}:`, error)
  
  // Show user notification
  toast.error(error.message)
  
  // Report to error tracking
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      tags: { action }
    })
  }
  
  // Update store
  useSupabaseStore.setState({
    error: error.message,
    loading: false
  })
}
```

### Retry Logic
```typescript
const withRetry = async (
  fn: () => Promise<any>,
  retries = 3,
  delay = 1000
) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return withRetry(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

// Usage
const loadStaysWithRetry = () => withRetry(
  () => useSupabaseStore.getState().loadStays()
)
```

## Best Practices

### 1. Avoid Direct State Mutations
```typescript
// Bad
const store = useSupabaseStore.getState()
store.stays.push(newStay) // Direct mutation

// Good
useSupabaseStore.setState(state => ({
  stays: [...state.stays, newStay]
}))
```

### 2. Use Selectors for Derived State
```typescript
// Bad - Computing in component
const Component = () => {
  const stays = useSupabaseStore(state => state.stays)
  const filtered = stays.filter(...) // Recomputed every render
}

// Good - Using selector
const Component = () => {
  const filtered = useSupabaseStore(selectFilteredStays)
}
```

### 3. Batch Related Updates
```typescript
// Bad - Multiple renders
setState({ loading: true })
setState({ error: null })
setState({ data: newData })

// Good - Single render
setState({
  loading: true,
  error: null,
  data: newData
})
```

## Related Documentation
- [Database Architecture](./DATABASE.md)
- [Authentication](./AUTHENTICATION.md)
- [API Documentation](../api/SUPABASE-API.md)
- [Component Architecture](./COMPONENTS.md)