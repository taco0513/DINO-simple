# Database Architecture Documentation

## Overview
DINO uses Supabase (PostgreSQL) as its primary database, providing real-time capabilities, built-in authentication, and Row Level Security (RLS) for data isolation. The architecture is designed for scalability, security, and efficient querying of travel data.

## Database Provider

### Supabase Configuration
```typescript
// Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

// Client Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

## Schema Design

### Core Tables

#### 1. profiles Table
User profile information and preferences.

```sql
CREATE TABLE profiles (
  -- Primary Key
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User Information
  email TEXT,
  full_name TEXT,
  date_of_birth DATE,
  
  -- Passport Information
  passport_number TEXT,
  passport_nationality TEXT, -- ISO country code
  passport_issue_date DATE,
  passport_expiry_date DATE,
  
  -- Emergency Contacts
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_email TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_2_name TEXT,
  emergency_contact_2_phone TEXT,
  emergency_contact_2_email TEXT,
  emergency_contact_2_relationship TEXT,
  
  -- Medical Information
  blood_type TEXT,
  medical_conditions TEXT,
  allergies TEXT,
  medications TEXT,
  
  -- Insurance
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_phone TEXT,
  
  -- Preferences (JSONB for flexibility)
  notification_settings JSONB DEFAULT '{
    "email_visa_expiry": true,
    "email_passport_expiry": true,
    "email_weekly_summary": false,
    "visa_warning_days": 30,
    "passport_warning_days": 90
  }'::jsonb,
  
  display_preferences JSONB DEFAULT '{
    "date_format": "MM/DD/YYYY",
    "timezone": "UTC",
    "default_view": "cards",
    "show_planned_trips": true
  }'::jsonb,
  
  privacy_settings JSONB DEFAULT '{
    "profile_visibility": "private",
    "share_statistics": false,
    "allow_analytics": true
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT valid_passport_dates CHECK (
    passport_issue_date IS NULL OR 
    passport_expiry_date IS NULL OR 
    passport_issue_date < passport_expiry_date
  ),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_nationality ON profiles(passport_nationality);
CREATE INDEX idx_profiles_updated_at ON profiles(updated_at DESC);
```

#### 2. stays Table
Travel history records.

```sql
CREATE TABLE stays (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stay Information
  country_code TEXT NOT NULL, -- ISO 3166-1 alpha-2
  city TEXT,
  entry_date DATE NOT NULL,
  exit_date DATE, -- NULL for ongoing stays
  
  -- Visa Information
  visa_type TEXT DEFAULT 'Tourist',
  visa_number TEXT,
  entry_type TEXT, -- 'air', 'land', 'sea'
  
  -- Travel Details
  arrival_flight TEXT,
  departure_flight TEXT,
  accommodation_name TEXT,
  accommodation_address TEXT,
  
  -- Exit Information
  from_country_code TEXT, -- Previous country
  from_city TEXT,
  to_country_code TEXT, -- Next country (for planning)
  to_city TEXT,
  
  -- Additional Data
  notes TEXT,
  tags TEXT[], -- Array of tags
  attachments JSONB, -- File references
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Computed Columns (Generated)
  duration INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN exit_date IS NOT NULL THEN 
        exit_date - entry_date + 1
      ELSE 
        NULL 
    END
  ) STORED,
  
  is_ongoing BOOLEAN GENERATED ALWAYS AS (
    exit_date IS NULL OR exit_date >= CURRENT_DATE
  ) STORED,
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (
    exit_date IS NULL OR exit_date >= entry_date
  ),
  CONSTRAINT valid_country_code CHECK (
    country_code ~ '^[A-Z]{2}$'
  ),
  CONSTRAINT valid_visa_type CHECK (
    visa_type IN ('Tourist', 'Business', 'Work', 'Student', 'Transit', 'Other', '183/365')
  )
);

-- Indexes
CREATE INDEX idx_stays_user_id ON stays(user_id);
CREATE INDEX idx_stays_country_code ON stays(country_code);
CREATE INDEX idx_stays_entry_date ON stays(entry_date DESC);
CREATE INDEX idx_stays_exit_date ON stays(exit_date DESC);
CREATE INDEX idx_stays_ongoing ON stays(is_ongoing) WHERE is_ongoing = true;
CREATE INDEX idx_stays_user_country ON stays(user_id, country_code);
CREATE INDEX idx_stays_date_range ON stays(user_id, entry_date, exit_date);

-- Full-text search index
CREATE INDEX idx_stays_search ON stays USING gin(
  to_tsvector('english', 
    COALESCE(city, '') || ' ' || 
    COALESCE(notes, '') || ' ' || 
    COALESCE(accommodation_name, '')
  )
);
```

#### 3. visa_rules Table (Future)
Dynamic visa rules management.

```sql
CREATE TABLE visa_rules (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rule Identification
  country_code TEXT NOT NULL,
  passport_nationality TEXT NOT NULL,
  visa_type TEXT DEFAULT 'Tourist',
  
  -- Rule Definition
  rule_type TEXT NOT NULL, -- 'reset', 'rolling', 'annual'
  max_days INTEGER NOT NULL,
  period_days INTEGER, -- For rolling window rules
  
  -- Costs
  visa_free BOOLEAN DEFAULT false,
  visa_cost DECIMAL(10, 2),
  visa_currency TEXT,
  application_type TEXT, -- 'on-arrival', 'e-visa', 'embassy'
  processing_time TEXT,
  
  -- Requirements
  min_passport_validity INTEGER, -- Months
  proof_of_funds DECIMAL(10, 2),
  proof_of_onward_travel BOOLEAN DEFAULT false,
  yellow_fever_required BOOLEAN DEFAULT false,
  
  -- Special Visas
  digital_nomad_available BOOLEAN DEFAULT false,
  digital_nomad_min_income DECIMAL(10, 2),
  digital_nomad_duration INTEGER,
  
  working_holiday_available BOOLEAN DEFAULT false,
  working_holiday_age_min INTEGER,
  working_holiday_age_max INTEGER,
  working_holiday_quota INTEGER,
  
  -- Extension
  extension_possible BOOLEAN DEFAULT false,
  max_extension_days INTEGER,
  extension_cost DECIMAL(10, 2),
  
  -- Metadata
  effective_from DATE NOT NULL,
  effective_to DATE,
  source_url TEXT,
  verified_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(country_code, passport_nationality, visa_type, effective_from),
  CONSTRAINT valid_rule_type CHECK (
    rule_type IN ('reset', 'rolling', 'annual')
  ),
  CONSTRAINT valid_period CHECK (
    rule_type != 'rolling' OR period_days IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_visa_rules_lookup ON visa_rules(
  country_code, 
  passport_nationality, 
  visa_type
) WHERE effective_to IS NULL;
```

#### 4. notifications Table (Future)
User notifications and alerts.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Details
  type TEXT NOT NULL, -- 'visa_expiry', 'passport_expiry', 'update', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  
  -- Related Data
  related_stay_id UUID REFERENCES stays(id) ON DELETE CASCADE,
  related_country_code TEXT,
  action_url TEXT,
  action_text TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_severity CHECK (
    severity IN ('info', 'warning', 'error', 'success')
  )
);

-- Indexes
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) 
  WHERE is_read = false AND is_dismissed = false;
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) 
  WHERE sent_at IS NULL;
```

## Row Level Security (RLS)

### RLS Policies

#### profiles Table Policies
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Select: Users can only view their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Insert: Handled by trigger on user creation
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Update: Users can only update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Delete: Prevent profile deletion (handled by CASCADE)
CREATE POLICY "Profiles cannot be deleted" 
  ON profiles FOR DELETE 
  USING (false);
```

#### stays Table Policies
```sql
-- Enable RLS
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;

-- Select: Users can only view their own stays
CREATE POLICY "Users can view own stays" 
  ON stays FOR SELECT 
  USING (auth.uid() = user_id);

-- Insert: Users can only insert their own stays
CREATE POLICY "Users can insert own stays" 
  ON stays FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Update: Users can only update their own stays
CREATE POLICY "Users can update own stays" 
  ON stays FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete: Users can only delete their own stays
CREATE POLICY "Users can delete own stays" 
  ON stays FOR DELETE 
  USING (auth.uid() = user_id);
```

### Service Role Bypass
```typescript
// Admin operations bypass RLS
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side only
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

## Database Functions

### 1. Profile Creation Trigger
```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (new.id, new.email, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Updated At Trigger
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stays_updated_at 
  BEFORE UPDATE ON stays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Overlap Detection Function
```sql
CREATE OR REPLACE FUNCTION detect_stay_overlaps(
  p_user_id UUID
) RETURNS TABLE(
  stay1_id UUID,
  stay1_country TEXT,
  stay1_dates TEXT,
  stay2_id UUID,
  stay2_country TEXT,
  stay2_dates TEXT,
  overlap_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s1.id as stay1_id,
    s1.country_code as stay1_country,
    s1.entry_date || ' - ' || COALESCE(s1.exit_date::TEXT, 'ongoing') as stay1_dates,
    s2.id as stay2_id,
    s2.country_code as stay2_country,
    s2.entry_date || ' - ' || COALESCE(s2.exit_date::TEXT, 'ongoing') as stay2_dates,
    LEAST(
      COALESCE(s1.exit_date, CURRENT_DATE),
      COALESCE(s2.exit_date, CURRENT_DATE)
    ) - GREATEST(s1.entry_date, s2.entry_date) + 1 as overlap_days
  FROM stays s1
  JOIN stays s2 ON s1.user_id = s2.user_id
  WHERE s1.user_id = p_user_id
    AND s1.id < s2.id
    AND s1.entry_date <= COALESCE(s2.exit_date, CURRENT_DATE)
    AND s2.entry_date <= COALESCE(s1.exit_date, CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. Visa Status Calculation Function
```sql
CREATE OR REPLACE FUNCTION calculate_visa_status(
  p_user_id UUID,
  p_country_code TEXT,
  p_reference_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE(
  days_used INTEGER,
  max_days INTEGER,
  remaining_days INTEGER,
  status TEXT
) AS $$
DECLARE
  v_rule_type TEXT;
  v_max_days INTEGER;
  v_period_days INTEGER;
  v_days_used INTEGER := 0;
BEGIN
  -- Get visa rule (simplified)
  SELECT rule_type, max_days, period_days
  INTO v_rule_type, v_max_days, v_period_days
  FROM visa_rules
  WHERE country_code = p_country_code
    AND passport_nationality = (
      SELECT passport_nationality FROM profiles WHERE id = p_user_id
    )
  LIMIT 1;
  
  -- Default if no rule found
  IF v_rule_type IS NULL THEN
    v_rule_type := 'reset';
    v_max_days := 90;
  END IF;
  
  -- Calculate based on rule type
  CASE v_rule_type
    WHEN 'reset' THEN
      -- Count only current stay
      SELECT COALESCE(duration, p_reference_date - entry_date + 1)
      INTO v_days_used
      FROM stays
      WHERE user_id = p_user_id
        AND country_code = p_country_code
        AND entry_date <= p_reference_date
        AND (exit_date IS NULL OR exit_date >= p_reference_date)
      LIMIT 1;
      
    WHEN 'rolling' THEN
      -- Count days in rolling window
      SELECT COALESCE(SUM(
        LEAST(COALESCE(exit_date, p_reference_date), p_reference_date) -
        GREATEST(entry_date, p_reference_date - v_period_days + 1) + 1
      ), 0)
      INTO v_days_used
      FROM stays
      WHERE user_id = p_user_id
        AND country_code = p_country_code
        AND COALESCE(exit_date, p_reference_date) >= 
            p_reference_date - v_period_days + 1;
        
    WHEN 'annual' THEN
      -- Count days in current year
      SELECT COALESCE(SUM(
        LEAST(
          COALESCE(exit_date, p_reference_date),
          DATE_TRUNC('year', p_reference_date)::DATE + INTERVAL '1 year' - INTERVAL '1 day'
        ) -
        GREATEST(
          entry_date,
          DATE_TRUNC('year', p_reference_date)::DATE
        ) + 1
      ), 0)
      INTO v_days_used
      FROM stays
      WHERE user_id = p_user_id
        AND country_code = p_country_code
        AND EXTRACT(YEAR FROM entry_date) = EXTRACT(YEAR FROM p_reference_date);
  END CASE;
  
  -- Calculate status
  RETURN QUERY SELECT
    COALESCE(v_days_used, 0) as days_used,
    v_max_days as max_days,
    v_max_days - COALESCE(v_days_used, 0) as remaining_days,
    CASE
      WHEN COALESCE(v_days_used, 0) >= v_max_days THEN 'danger'
      WHEN COALESCE(v_days_used, 0) >= v_max_days * 0.8 THEN 'danger'
      WHEN COALESCE(v_days_used, 0) >= v_max_days * 0.6 THEN 'warning'
      ELSE 'safe'
    END as status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Statistics Functions
```sql
-- Get travel statistics for a user
CREATE OR REPLACE FUNCTION get_travel_stats(
  p_user_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
) RETURNS TABLE(
  total_countries BIGINT,
  total_days BIGINT,
  year_days BIGINT,
  year_countries BIGINT,
  longest_stay_days INTEGER,
  shortest_stay_days INTEGER,
  favorite_country TEXT,
  current_country TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(DISTINCT country_code) as total_countries,
      SUM(COALESCE(duration, CURRENT_DATE - entry_date + 1)) as total_days,
      SUM(CASE 
        WHEN EXTRACT(YEAR FROM entry_date) = p_year 
        THEN COALESCE(duration, CURRENT_DATE - entry_date + 1)
        ELSE 0 
      END) as year_days,
      COUNT(DISTINCT CASE 
        WHEN EXTRACT(YEAR FROM entry_date) = p_year 
        THEN country_code 
      END) as year_countries,
      MAX(COALESCE(duration, CURRENT_DATE - entry_date + 1)) as longest_stay_days,
      MIN(COALESCE(duration, CURRENT_DATE - entry_date + 1)) as shortest_stay_days
    FROM stays
    WHERE user_id = p_user_id
  ),
  favorite AS (
    SELECT country_code
    FROM stays
    WHERE user_id = p_user_id
    GROUP BY country_code
    ORDER BY SUM(COALESCE(duration, CURRENT_DATE - entry_date + 1)) DESC
    LIMIT 1
  ),
  current AS (
    SELECT country_code
    FROM stays
    WHERE user_id = p_user_id
      AND is_ongoing = true
    ORDER BY entry_date DESC
    LIMIT 1
  )
  SELECT 
    stats.*,
    favorite.country_code as favorite_country,
    current.country_code as current_country
  FROM stats
  LEFT JOIN favorite ON true
  LEFT JOIN current ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Query Patterns

### Common Queries

#### 1. Get User's Current Stays
```typescript
const getCurrentStays = async (userId: string) => {
  const { data, error } = await supabase
    .from('stays')
    .select('*')
    .eq('user_id', userId)
    .is('exit_date', null)
    .order('entry_date', { ascending: false })
  
  return data
}
```

#### 2. Get Stays for Visa Calculation
```typescript
const getStaysForCountry = async (
  userId: string, 
  countryCode: string,
  startDate: Date
) => {
  const { data, error } = await supabase
    .from('stays')
    .select('*')
    .eq('user_id', userId)
    .eq('country_code', countryCode)
    .or(`exit_date.gte.${startDate.toISOString()},exit_date.is.null`)
    .order('entry_date', { ascending: true })
  
  return data
}
```

#### 3. Search Stays
```typescript
const searchStays = async (
  userId: string,
  searchTerm: string
) => {
  const { data, error } = await supabase
    .from('stays')
    .select('*')
    .eq('user_id', userId)
    .or(`city.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
    .order('entry_date', { ascending: false })
  
  return data
}
```

#### 4. Bulk Operations
```typescript
const bulkInsertStays = async (stays: Stay[]) => {
  // Batch insert with transaction
  const { data, error } = await supabase
    .from('stays')
    .insert(stays)
    .select()
  
  if (error) {
    // Rollback handled automatically
    throw error
  }
  
  return data
}
```

## Real-time Subscriptions

### Stay Changes
```typescript
const subscribeToStays = (userId: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('stays_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'stays',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
  
  return subscription
}
```

### Profile Updates
```typescript
const subscribeToProfile = (userId: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('profile_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      callback
    )
    .subscribe()
  
  return subscription
}
```

## Performance Optimization

### Indexing Strategy

#### Query Pattern Analysis
```sql
-- Analyze query patterns
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE query LIKE '%stays%'
ORDER BY total_exec_time DESC
LIMIT 20;
```

#### Index Recommendations
1. **Primary Access Patterns**: User-based queries
2. **Date Range Queries**: Entry/exit date filtering
3. **Country Filtering**: Visa calculation queries
4. **Full-text Search**: City and notes searching

### Partitioning Strategy (Future)

#### Partition by User (for large scale)
```sql
-- Create partitioned table
CREATE TABLE stays_partitioned (
  LIKE stays INCLUDING ALL
) PARTITION BY HASH (user_id);

-- Create partitions
CREATE TABLE stays_part_0 PARTITION OF stays_partitioned
  FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE stays_part_1 PARTITION OF stays_partitioned
  FOR VALUES WITH (modulus 4, remainder 1);
-- etc...
```

### Query Optimization

#### Use Covering Indexes
```sql
-- Covering index for visa calculations
CREATE INDEX idx_stays_visa_calc ON stays(
  user_id,
  country_code,
  entry_date,
  exit_date
) INCLUDE (visa_type, duration);
```

#### Materialized Views
```sql
-- Materialized view for statistics
CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
  user_id,
  COUNT(DISTINCT country_code) as total_countries,
  COUNT(*) as total_trips,
  SUM(duration) as total_days,
  MAX(duration) as longest_stay,
  MIN(duration) as shortest_stay,
  AVG(duration)::INTEGER as average_stay
FROM stays
GROUP BY user_id;

-- Refresh strategy
CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);
REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
```

## Backup and Recovery

### Backup Strategy

#### Automated Backups
- **Frequency**: Daily automated backups by Supabase
- **Retention**: 30 days for Pro plan, 7 days for Free plan
- **Point-in-time Recovery**: Available for Pro plan

#### Manual Backup Script
```bash
#!/bin/bash
# Backup script for local/additional backups

SUPABASE_URL="your-project-url"
SUPABASE_KEY="your-service-key"
BACKUP_DIR="/backups/dino"
DATE=$(date +%Y%m%d_%H%M%S)

# Export data using Supabase CLI
supabase db dump \
  --project-ref your-project-ref \
  --file "${BACKUP_DIR}/backup_${DATE}.sql"

# Compress backup
gzip "${BACKUP_DIR}/backup_${DATE}.sql"

# Upload to S3 (optional)
aws s3 cp "${BACKUP_DIR}/backup_${DATE}.sql.gz" \
  s3://your-backup-bucket/dino/
```

### Recovery Procedures

#### Point-in-time Recovery
```sql
-- Restore to specific timestamp
SELECT * FROM stays
AS OF SYSTEM TIME '2024-01-15 10:00:00'
WHERE user_id = 'user-uuid';
```

#### Data Recovery Function
```sql
CREATE OR REPLACE FUNCTION recover_deleted_stay(
  p_stay_id UUID,
  p_deleted_after TIMESTAMPTZ
) RETURNS SETOF stays AS $$
BEGIN
  -- Attempt to recover from audit log
  RETURN QUERY
  SELECT * FROM stays
  AS OF SYSTEM TIME p_deleted_after
  WHERE id = p_stay_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Migration Strategy

### Schema Migrations

#### Migration Files Structure
```
supabase/migrations/
├── 20240101000000_initial_schema.sql
├── 20240115000000_add_profiles_fields.sql
├── 20240201000000_add_visa_rules.sql
└── 20240215000000_add_notifications.sql
```

#### Migration Template
```sql
-- Migration: Add new feature
-- Version: 20240301000000
-- Description: Add travel planning features

BEGIN;

-- Add new columns
ALTER TABLE stays 
ADD COLUMN IF NOT EXISTS planned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS confidence_level INTEGER DEFAULT 100;

-- Update existing data
UPDATE stays 
SET planned = false 
WHERE entry_date <= CURRENT_DATE;

UPDATE stays 
SET planned = true 
WHERE entry_date > CURRENT_DATE;

-- Add new indexes
CREATE INDEX IF NOT EXISTS idx_stays_planned 
ON stays(planned) 
WHERE planned = true;

-- Add constraints
ALTER TABLE stays 
ADD CONSTRAINT valid_confidence 
CHECK (confidence_level BETWEEN 0 AND 100);

COMMIT;
```

### Data Migration

#### Local Storage to Supabase
```typescript
async function migrateFromLocalStorage() {
  const localData = localStorage.getItem('stays')
  if (!localData) return
  
  const stays = JSON.parse(localData)
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) return
  
  // Transform and validate data
  const transformedStays = stays.map(stay => ({
    ...stay,
    user_id: user.data.user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
  
  // Bulk insert
  const { error } = await supabase
    .from('stays')
    .upsert(transformedStays, {
      onConflict: 'id',
      ignoreDuplicates: true
    })
  
  if (!error) {
    // Clear local storage after successful migration
    localStorage.removeItem('stays')
  }
}
```

## Security Considerations

### SQL Injection Prevention
```typescript
// Always use parameterized queries
const safeQuery = async (countryCode: string) => {
  // Good - Parameterized
  const { data } = await supabase
    .from('stays')
    .select('*')
    .eq('country_code', countryCode)
  
  // Bad - String concatenation
  // const { data } = await supabase.rpc('unsafe_query', {
  //   query: `SELECT * FROM stays WHERE country_code = '${countryCode}'`
  // })
  
  return data
}
```

### Data Encryption
```sql
-- Encrypt sensitive columns
ALTER TABLE profiles 
ADD COLUMN passport_number_encrypted BYTEA;

-- Encryption function
CREATE OR REPLACE FUNCTION encrypt_passport_number(
  p_passport_number TEXT,
  p_user_id UUID
) RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(
    p_passport_number,
    p_user_id::TEXT || current_setting('app.encryption_key')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Audit Logging
```sql
-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  row_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    user_id,
    table_name,
    operation,
    row_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to tables
CREATE TRIGGER audit_stays
  AFTER INSERT OR UPDATE OR DELETE ON stays
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## Monitoring and Maintenance

### Performance Monitoring
```sql
-- Query performance stats
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  most_common_vals,
  histogram_bounds
FROM pg_stats
WHERE tablename IN ('stays', 'profiles');

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Maintenance Tasks
```sql
-- Vacuum and analyze
VACUUM ANALYZE stays;
VACUUM ANALYZE profiles;

-- Reindex
REINDEX TABLE stays;
REINDEX TABLE profiles;

-- Update statistics
ANALYZE stays;
ANALYZE profiles;
```

## Testing Strategy

### Database Tests
```typescript
describe('Database Operations', () => {
  beforeEach(async () => {
    // Setup test data
    await supabase.from('stays').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  })
  
  it('should enforce RLS policies', async () => {
    // Test that users can only see their own data
  })
  
  it('should validate constraints', async () => {
    // Test date validation, country codes, etc.
  })
  
  it('should handle concurrent updates', async () => {
    // Test optimistic locking
  })
})
```

## Related Documentation
- [State Management](./STATE-MANAGEMENT.md)
- [Authentication](./AUTHENTICATION.md)
- [API Documentation](../api/SUPABASE-API.md)
- [Migration Guide](../../MIGRATIONS.md)