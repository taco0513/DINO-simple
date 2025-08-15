# Supabase API Documentation

## Overview
Complete API reference for DINO's Supabase integration, including authentication endpoints, database operations, real-time subscriptions, and storage management. All API calls are made through the Supabase JavaScript client library.

## Client Configuration

### Initialization
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'DINO'
    }
  }
})
```

### TypeScript Types
```typescript
// Database schema types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Profile>
      }
      stays: {
        Row: Stay
        Insert: Omit<Stay, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Stay>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Notification>
      }
    }
    Views: {
      user_statistics: {
        Row: UserStatistics
      }
    }
    Functions: {
      calculate_visa_status: {
        Args: { p_user_id: string; p_country_code: string }
        Returns: VisaStatus
      }
      get_travel_stats: {
        Args: { p_user_id: string; p_year?: number }
        Returns: TravelStats
      }
    }
  }
}

// Type-safe client
export const typedSupabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)
```

## Authentication API

### Sign Up
```typescript
// Email/Password signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    emailRedirectTo: 'https://dinoapp.net/auth/callback',
    data: {
      full_name: 'John Doe',
      signup_source: 'web'
    }
  }
})

// Response
{
  user: User | null,
  session: Session | null,
  error: AuthError | null
}
```

### Sign In
```typescript
// Email/Password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
})

// Magic Link
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://dinoapp.net/auth/callback',
    shouldCreateUser: false
  }
})

// OAuth Provider
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google', // or 'github'
  options: {
    redirectTo: 'https://dinoapp.net/auth/callback',
    scopes: 'email profile',
    queryParams: {
      access_type: 'offline',
      prompt: 'consent'
    }
  }
})
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut({
  scope: 'local' // or 'global' to sign out all devices
})
```

### Session Management
```typescript
// Get current session
const { data: { session }, error } = await supabase.auth.getSession()

// Get current user
const { data: { user }, error } = await supabase.auth.getUser()

// Refresh session
const { data, error } = await supabase.auth.refreshSession()

// Update user
const { data, error } = await supabase.auth.updateUser({
  email: 'newemail@example.com',
  password: 'newpassword',
  data: { 
    full_name: 'Updated Name' 
  }
})
```

### Password Management
```typescript
// Reset password email
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  {
    redirectTo: 'https://dinoapp.net/auth/reset-password'
  }
)

// Verify OTP (for password reset)
const { data, error } = await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456',
  type: 'recovery'
})
```

### Auth State Listener
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log(event, session)
    
    switch (event) {
      case 'INITIAL_SESSION':
        // Handle initial session
        break
      case 'SIGNED_IN':
        // Handle sign in
        break
      case 'SIGNED_OUT':
        // Handle sign out
        break
      case 'TOKEN_REFRESHED':
        // Handle token refresh
        break
      case 'USER_UPDATED':
        // Handle user update
        break
      case 'PASSWORD_RECOVERY':
        // Handle password recovery
        break
    }
  }
)

// Cleanup
subscription.unsubscribe()
```

## Database API

### Query Operations

#### Select
```typescript
// Basic select
const { data, error } = await supabase
  .from('stays')
  .select('*')

// Select with columns
const { data, error } = await supabase
  .from('stays')
  .select('id, country_code, entry_date, exit_date')

// Select with joins
const { data, error } = await supabase
  .from('stays')
  .select(`
    *,
    profiles (
      full_name,
      passport_nationality
    )
  `)

// Select with filters
const { data, error } = await supabase
  .from('stays')
  .select('*')
  .eq('country_code', 'JP')
  .gte('entry_date', '2024-01-01')
  .lte('entry_date', '2024-12-31')
  .order('entry_date', { ascending: false })
  .limit(10)
```

#### Insert
```typescript
// Single insert
const { data, error } = await supabase
  .from('stays')
  .insert({
    user_id: 'uuid',
    country_code: 'JP',
    city: 'Tokyo',
    entry_date: '2024-01-15',
    exit_date: '2024-01-30',
    visa_type: 'Tourist'
  })
  .select()
  .single()

// Bulk insert
const { data, error } = await supabase
  .from('stays')
  .insert([
    { country_code: 'JP', entry_date: '2024-01-15' },
    { country_code: 'KR', entry_date: '2024-02-01' }
  ])
  .select()

// Upsert (insert or update)
const { data, error } = await supabase
  .from('profiles')
  .upsert({
    id: 'user-uuid',
    full_name: 'John Doe',
    passport_nationality: 'US'
  }, {
    onConflict: 'id',
    ignoreDuplicates: false
  })
```

#### Update
```typescript
// Update single
const { data, error } = await supabase
  .from('stays')
  .update({ 
    exit_date: '2024-01-31',
    notes: 'Extended stay'
  })
  .eq('id', 'stay-uuid')
  .select()
  .single()

// Update multiple
const { data, error } = await supabase
  .from('stays')
  .update({ visa_type: 'Business' })
  .eq('country_code', 'JP')
  .gte('entry_date', '2024-01-01')
```

#### Delete
```typescript
// Delete single
const { error } = await supabase
  .from('stays')
  .delete()
  .eq('id', 'stay-uuid')

// Delete multiple
const { error } = await supabase
  .from('stays')
  .delete()
  .eq('user_id', 'user-uuid')
  .lt('entry_date', '2020-01-01')
```

### Query Filters

#### Comparison Operators
```typescript
// Equality
.eq('column', 'value')           // Equal to
.neq('column', 'value')          // Not equal to

// Comparison
.gt('column', value)             // Greater than
.gte('column', value)            // Greater than or equal
.lt('column', value)             // Less than
.lte('column', value)            // Less than or equal

// Pattern matching
.like('column', '%pattern%')     // LIKE operator
.ilike('column', '%pattern%')    // Case-insensitive LIKE

// Array/Range
.in('column', ['value1', 'value2'])        // IN array
.contains('column', ['value'])              // Array contains
.containedBy('column', ['value1', 'value2']) // Array contained by
.rangeGt('column', '[2020-01-01,2020-12-31]') // Range greater than
.rangeLt('column', '[2020-01-01,2020-12-31]') // Range less than
.rangeGte('column', '[2020-01-01,2020-12-31]') // Range greater or equal
.rangeLte('column', '[2020-01-01,2020-12-31]') // Range less or equal
.rangeAdjacent('column', '[2020-01-01,2020-12-31]') // Adjacent ranges
.overlaps('column', '[2020-01-01,2020-12-31]') // Overlapping ranges

// NULL checking
.is('column', null)              // IS NULL
.not.is('column', null)          // IS NOT NULL
```

#### Logical Operators
```typescript
// OR conditions
const { data } = await supabase
  .from('stays')
  .select('*')
  .or('country_code.eq.JP,country_code.eq.KR')

// Complex filters
const { data } = await supabase
  .from('stays')
  .select('*')
  .or('exit_date.is.null,exit_date.gte.2024-01-01')
  .eq('user_id', 'uuid')

// Nested OR/AND
const { data } = await supabase
  .from('stays')
  .select('*')
  .or('and(country_code.eq.JP,visa_type.eq.Tourist),and(country_code.eq.KR,visa_type.eq.Business)')
```

### Query Modifiers

```typescript
// Ordering
.order('column', { ascending: false })
.order('column1', { ascending: true })
.order('column2', { ascending: false })

// Limiting
.limit(10)                       // Limit results
.range(0, 9)                     // Paginate (0-indexed)

// Single result
.single()                        // Expect single row
.maybeSingle()                   // Single row or null

// Count
const { count, error } = await supabase
  .from('stays')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', 'uuid')
```

### Stored Procedures / Functions

```typescript
// Call RPC function
const { data, error } = await supabase
  .rpc('calculate_visa_status', {
    p_user_id: 'user-uuid',
    p_country_code: 'JP',
    p_reference_date: '2024-01-15'
  })

// Function with complex return
const { data, error } = await supabase
  .rpc('get_travel_stats', {
    p_user_id: 'user-uuid',
    p_year: 2024
  })
  .single()

// Response structure
{
  total_countries: 5,
  total_days: 120,
  year_days: 89,
  year_countries: 3,
  longest_stay_days: 30,
  shortest_stay_days: 5,
  favorite_country: 'JP',
  current_country: 'TH'
}
```

## Real-time API

### Subscribe to Changes

```typescript
// Subscribe to all changes on a table
const channel = supabase
  .channel('stays-changes')
  .on(
    'postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'stays' 
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// Subscribe to specific events
const channel = supabase
  .channel('stays-insert')
  .on(
    'postgres_changes',
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'stays',
      filter: 'user_id=eq.user-uuid'
    },
    (payload) => {
      console.log('New stay:', payload.new)
    }
  )
  .on(
    'postgres_changes',
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'stays',
      filter: 'user_id=eq.user-uuid'
    },
    (payload) => {
      console.log('Updated stay:', payload.new)
      console.log('Previous:', payload.old)
    }
  )
  .on(
    'postgres_changes',
    { 
      event: 'DELETE', 
      schema: 'public', 
      table: 'stays',
      filter: 'user_id=eq.user-uuid'
    },
    (payload) => {
      console.log('Deleted stay:', payload.old)
    }
  )
  .subscribe()
```

### Presence (Collaborative Features)

```typescript
// Track online users
const channel = supabase.channel('online-users')

// Track user presence
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online users:', state)
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', key, newPresences)
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', key, leftPresences)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: 'user-uuid',
        online_at: new Date().toISOString()
      })
    }
  })
```

### Broadcast (Real-time Messaging)

```typescript
// Send broadcast messages
const channel = supabase.channel('room-1')

// Listen for messages
channel
  .on('broadcast', { event: 'message' }, ({ payload }) => {
    console.log('Message received:', payload)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      // Send message
      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: { 
          text: 'Hello!',
          user_id: 'user-uuid' 
        }
      })
    }
  })
```

### Channel Management

```typescript
// Get all channels
const channels = supabase.getChannels()

// Remove specific channel
await supabase.removeChannel(channel)

// Remove all channels
await supabase.removeAllChannels()

// Channel states
channel.subscribe((status) => {
  switch (status) {
    case 'SUBSCRIBED':
      console.log('Connected to channel')
      break
    case 'TIMED_OUT':
      console.log('Channel timeout')
      break
    case 'CLOSED':
      console.log('Channel closed')
      break
    case 'CHANNEL_ERROR':
      console.log('Channel error')
      break
  }
})
```

## Storage API

### File Upload

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar.png', file, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'image/png'
  })

// Upload with progress
const { data, error } = await supabase.storage
  .from('documents')
  .upload('path/to/file.pdf', file, {
    onUploadProgress: (progress) => {
      console.log(`Upload progress: ${progress.loaded}/${progress.total}`)
    }
  })
```

### File Download

```typescript
// Download file
const { data, error } = await supabase.storage
  .from('avatars')
  .download('public/avatar.png')

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('public/avatar.png')

// Create signed URL (temporary access)
const { data, error } = await supabase.storage
  .from('private-files')
  .createSignedUrl('folder/file.pdf', 60) // 60 seconds
```

### File Management

```typescript
// List files
const { data, error } = await supabase.storage
  .from('avatars')
  .list('public', {
    limit: 100,
    offset: 0,
    sortBy: { 
      column: 'name', 
      order: 'asc' 
    }
  })

// Move file
const { error } = await supabase.storage
  .from('avatars')
  .move('public/avatar.png', 'private/avatar.png')

// Copy file
const { error } = await supabase.storage
  .from('avatars')
  .copy('public/avatar.png', 'backup/avatar.png')

// Delete files
const { error } = await supabase.storage
  .from('avatars')
  .remove(['public/avatar.png', 'public/old-avatar.png'])
```

### Bucket Management

```typescript
// Create bucket
const { data, error } = await supabase.storage
  .createBucket('new-bucket', {
    public: false,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg']
  })

// List buckets
const { data, error } = await supabase.storage
  .listBuckets()

// Get bucket
const { data, error } = await supabase.storage
  .getBucket('avatars')

// Update bucket
const { data, error } = await supabase.storage
  .updateBucket('avatars', {
    public: true,
    fileSizeLimit: 10485760 // 10MB
  })

// Delete bucket
const { error } = await supabase.storage
  .deleteBucket('old-bucket')

// Empty bucket
const { error } = await supabase.storage
  .emptyBucket('temp-files')
```

## Error Handling

### Error Types

```typescript
interface PostgrestError {
  message: string
  details: string
  hint: string
  code: string
}

interface AuthError {
  message: string
  status: number
  __isAuthError: true
}

interface StorageError {
  message: string
  statusCode: string
  error: string
}
```

### Error Handling Patterns

```typescript
// Generic error handler
async function handleSupabaseOperation<T>(
  operation: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await operation
  
  if (error) {
    console.error('Supabase error:', error)
    
    // Handle specific error types
    if (error.code === 'PGRST116') {
      throw new Error('Record not found')
    }
    
    if (error.code === '23505') {
      throw new Error('Duplicate entry')
    }
    
    if (error.code === '23503') {
      throw new Error('Foreign key violation')
    }
    
    // Auth errors
    if (error.__isAuthError) {
      if (error.status === 401) {
        throw new Error('Unauthorized')
      }
      if (error.status === 422) {
        throw new Error('Invalid credentials')
      }
    }
    
    throw new Error(error.message || 'Operation failed')
  }
  
  if (!data) {
    throw new Error('No data returned')
  }
  
  return data
}

// Usage
try {
  const stays = await handleSupabaseOperation(
    supabase.from('stays').select('*')
  )
} catch (error) {
  // Handle error
}
```

### Retry Logic

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on certain errors
      if (
        error.code === '23505' || // Duplicate
        error.code === '23503' || // FK violation
        error.status === 401      // Unauthorized
      ) {
        throw error
      }
      
      // Wait before retry
      if (i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, delay * Math.pow(2, i))
        )
      }
    }
  }
  
  throw lastError!
}
```

## Performance Optimization

### Query Optimization

```typescript
// Use select to limit columns
const { data } = await supabase
  .from('stays')
  .select('id, country_code, entry_date')
  // Instead of select('*')

// Use proper indexes (database side)
CREATE INDEX idx_stays_user_date 
ON stays(user_id, entry_date DESC);

// Batch operations
const stays = [...] // Array of stays
const { data, error } = await supabase
  .from('stays')
  .insert(stays) // Single request for multiple inserts

// Use RPC for complex queries
const { data } = await supabase
  .rpc('get_visa_summary', { user_id: 'uuid' })
  // Instead of multiple queries and client-side calculation
```

### Caching Strategies

```typescript
class SupabaseCache {
  private cache = new Map<string, CacheEntry>()
  
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 5000
  ): Promise<T> {
    const cached = this.cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T
    }
    
    const data = await fetcher()
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
    
    return data
  }
  
  invalidate(pattern?: string) {
    if (!pattern) {
      this.cache.clear()
      return
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}
```

## Testing

### Mock Client

```typescript
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client for testing
export const mockSupabase = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  },
  from: jest.fn((table: string) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: {}, error: null })
  })),
  rpc: jest.fn(),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis()
  }))
}
```

## Rate Limiting

### API Limits
- Anonymous requests: 500 per hour
- Authenticated requests: 100,000 per hour
- Real-time messages: 10 per second per client
- Storage: 5GB per project (free tier)

### Handling Rate Limits

```typescript
class RateLimitHandler {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private requestCount = 0
  private resetTime = Date.now() + 3600000
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check rate limit
    if (Date.now() > this.resetTime) {
      this.requestCount = 0
      this.resetTime = Date.now() + 3600000
    }
    
    if (this.requestCount >= 90000) { // Leave buffer
      // Queue request
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
          try {
            const result = await operation()
            resolve(result)
          } catch (error) {
            reject(error)
          }
        })
        this.processQueue()
      })
    }
    
    this.requestCount++
    return operation()
  }
  
  private async processQueue() {
    if (this.processing) return
    this.processing = true
    
    while (this.queue.length > 0) {
      if (Date.now() > this.resetTime) {
        this.requestCount = 0
        this.resetTime = Date.now() + 3600000
      }
      
      if (this.requestCount < 90000) {
        const operation = this.queue.shift()
        if (operation) {
          this.requestCount++
          await operation()
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    this.processing = false
  }
}
```

## Security Best Practices

1. **Never expose service role key**: Only use in server-side code
2. **Use RLS policies**: Enforce at database level
3. **Validate inputs**: Client and server side
4. **Sanitize data**: Prevent XSS and injection
5. **Use HTTPS**: Always in production
6. **Token rotation**: Regular refresh
7. **Audit logging**: Track sensitive operations

## Related Documentation
- [Authentication Architecture](../architecture/AUTHENTICATION.md)
- [Database Architecture](../architecture/DATABASE.md)
- [State Management](../architecture/STATE-MANAGEMENT.md)
- [Real-time Features](../features/REALTIME.md)