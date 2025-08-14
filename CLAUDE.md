# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DINO (Digital Nomad Visa Tracker) is a Next.js 15 application for tracking visa stays and calculating remaining days for digital nomads. It uses Supabase for authentication and data storage, Zustand for state management, and Tailwind CSS for styling.

Live service: [dinoapp.net](https://dinoapp.net)

## Essential Commands

```bash
# Development
npm run dev         # Start development server at localhost:3000

# Build & Production
npm run build       # Build for production (runs TypeScript checks)
npm start          # Start production server

# Linting
npm run lint       # Run ESLint (currently not configured - select "Strict" when prompted)
```

## Architecture & Key Components

### Core Architecture

The app follows Next.js 15 App Router pattern with server/client components separation:

- **Authentication Flow**: Supabase Auth → AuthProvider → Protected Routes
- **Data Flow**: Supabase DB → supabase-store (Zustand) → React Components
- **State Management**: Zustand store (`lib/supabase-store.ts`) handles all data operations with Supabase sync

### Critical Business Logic

#### Visa Calculation System (`lib/visa-calculator.ts`)
- **Rolling Window**: Japan (90/180), Schengen (90/180), UK (180/365)
- **Reset on Exit**: Thailand (60 days), Vietnam (90 days), Singapore (90 days)
- **Special Case - Korea 183/365**: Uses 365-day rolling window, counts total days in period
  - Important: Period starts `subDays(referenceDate, rule.periodDays)` - exactly 365 days ago, not 364

#### Date Handling
- All dates use `date-fns` with inclusive counting (entry and exit days both count)
- Period calculations: Start of day comparisons to avoid timezone issues
- Korea 183/365 fix: Changed from `subDays(date, 364)` to `subDays(date, 365)` for correct period

### Database Schema

Two main tables with Row Level Security (RLS):

1. **stays**: User travel records
   - Links to auth.users via user_id
   - Includes entry/exit dates, country, visa type
   - Special visa types: 'K-183/365' for Korea special residence

2. **profiles**: User passport and preferences
   - Emergency contacts, insurance info
   - Notification preferences
   - Passport nationality and expiry dates

### Key Features & Their Implementation

1. **CSV Import/Export** (`lib/csv-utils.ts`, `app/dashboard/csv/`)
   - Template generation for easy import
   - Handles quoted fields and special characters

2. **Profile Management** (`app/dashboard/profile/`)
   - 5 tabs: Passport, Security, Emergency, Preferences, Stats
   - Password change via Supabase Auth (no current password required)

3. **Dashboard Optimization** (`lib/supabase-store.ts`)
   - 5-second cache to prevent excessive API calls
   - Removed duplicate detection from loadStays for performance

4. **Mobile UI**
   - Icon-only tabs on mobile screens
   - Responsive grid layouts
   - Touch-friendly interfaces

## Deployment Configuration

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=       # Required: Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Required: Supabase anonymous key
```

### Vercel Deployment
- Auto-deploys from main branch
- Configuration in `vercel.json` (set to Seoul region: icn1)
- Build outputs ~140KB First Load JS

### Supabase Setup Requirements
1. Run migrations in order (see `supabase/migrations/`)
2. Enable RLS on all tables
3. Update Auth URLs for production domain
4. Configure email settings for auth

## Known Issues & Solutions

### Previously Fixed Issues
1. **Profile Save Error**: Run `supabase/migrations/update_profiles_safe.sql` to add missing columns
2. **Korea Visa Calculation**: Must use 365-day period, not 364
3. **Dashboard Slow Loading**: Fixed by removing duplicate detection and adding cache
4. **Mobile Tab UI**: Fixed with icon-only display and responsive layout

### Recently Fixed Issues (2025.08.14)
1. **Future Trip Display Bug**: Future trips incorrectly showing as "Currently staying"
   - Solution: Added proper date comparison logic with time normalization
2. **Current Stay Statistics**: Stats not showing for trips with exit dates in the future
   - Solution: Updated logic to check if today falls within entry-exit range
3. **Travel History Duration**: Added duration display for all trips
   - Shows: X days (completed), Day X (ongoing), X days planned (future)
4. **Vercel Deployment Issues**: Build cache causing module resolution errors
   - Solution: Delete and recreate project, ensure baseUrl in tsconfig.json

### Beta Launch Features (2025.08.14)
1. **Feedback System**: Comprehensive beta user feedback collection
   - Screenshot upload support (up to 5MB)
   - 4 feedback types: General, Bug, Feature, UI/UX
   - Email delivery to hello@zimojin.com via Resend API
   - 10-character minimum validation with real-time counter
   - Supabase storage integration for screenshots

2. **Security Enhancements**: Production-ready security measures
   - Row Level Security (RLS) policies on all tables
   - Rate limiting on API endpoints (10 requests per minute)
   - Input validation and sanitization
   - SQL injection prevention
   - CORS and security headers configuration
   - Audit logging for all data modifications

3. **Performance Optimizations**:
   - Removed debug console logs from visa calculator
   - Optimized build output (140KB First Load JS)
   - Clean development experience
   - Zero security vulnerabilities (npm audit)

## Testing Specific Features

```bash
# Test visa calculations
# Add a stay in Korea with type 'K-183/365' to test special residence
# Add stays in Japan to test 90/180 rolling window

# Test CSV import
# Download template from CSV page
# Fill with test data
# Import and verify preview before confirming

# Test profile
# All tabs should save independently except Security and Stats
# Password change uses Supabase Auth API

# Test feedback system
# Access via dashboard hamburger menu → "Send Feedback"
# Try different feedback types: General, Bug, Feature, UI/UX
# Upload screenshot (PNG, JPG up to 5MB)
# Minimum 10 characters required for message
# Email sent to hello@zimojin.com with screenshot attachment
```

## Critical Files for Context

- `lib/visa-calculator.ts`: Core visa calculation logic
- `lib/supabase-store.ts`: State management and Supabase sync
- `lib/visa-rules.ts`: Visa rules configuration with source links
- `app/dashboard/page.tsx`: Main dashboard with visa cards
- `components/VisaCard.tsx`: Visual representation of visa status
- `components/FeedbackModal.tsx`: Beta feedback system with screenshot support
- `app/api/feedback/route.ts`: Server-side feedback processing and email delivery
- `lib/security.ts`: Security utilities (input validation, sanitization)
- `lib/rate-limiter.ts`: API rate limiting implementation
- `supabase/migrations/`: Database security policies and table structures