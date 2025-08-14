# Changelog

All notable changes to the DINO project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-08-14 🚀 BETA LAUNCH

### Added
- **🎯 Beta Feedback System**: Comprehensive feedback collection for beta users
  - Screenshot upload support (PNG, JPG up to 5MB)
  - Four feedback categories: General, Bug, Feature, UI/UX  
  - Real-time character validation (minimum 10 characters)
  - Email delivery to hello@zimojin.com via Resend API
  - Supabase storage integration for screenshot management
  - Accessible via dashboard hamburger menu → "Send Feedback"

- **🛡️ Production Security Suite**: Enterprise-level security implementation
  - Row Level Security (RLS) policies on all database tables
  - API rate limiting (10 requests per minute per user)
  - Input validation and sanitization utilities
  - SQL injection prevention mechanisms
  - CORS and security headers configuration
  - Comprehensive audit logging for all data modifications
  - Zero security vulnerabilities (verified with npm audit)

- **📊 Source Attribution**: Liability protection for visa information
  - Official government source links for all visa rules
  - Last updated timestamps for information freshness
  - Clear disclaimers about information accuracy
  - External link indicators for transparency

### Improved  
- **⚡ Performance Optimizations**: Enhanced user experience
  - Removed debug console logs from visa calculator
  - Optimized build output to 140KB First Load JS
  - Clean development console experience
  - Faster page load times and smoother interactions

- **📱 Travel History UX**: Better pagination and usability
  - Reduced items per page from 10 to 5 for mobile optimization
  - Improved pagination controls
  - Better visual hierarchy

### Security
- **🔒 Environment Variable Security**: Complete isolation of sensitive data
  - All .env files properly gitignored
  - Production environment variables secured
  - Vercel deployment variables configured
  - No sensitive data exposure in codebase

- **🗃️ Database Security Enhancement**: Comprehensive data protection
  - Feedback table with proper constraints and validation
  - Rate limiting table for API protection
  - Audit logs table for security monitoring
  - Storage bucket policies for file upload security

### Technical
- **📋 Migration Files**: Complete database setup scripts
  - Security policies migration (20250115_security_policies.sql)
  - Feedback table creation with validation constraints
  - Storage bucket creation with proper permissions
  - Audit trigger implementation for data tracking

### Deployment
- **☁️ Vercel Production Ready**: Full deployment configuration
  - All environment variables configured
  - Build optimization for production
  - Automatic deployment pipeline via Git
  - dinoapp.net domain ready for beta users

## [1.2.0] - 2025-08-14

### Added
- **User Profile Management**: Complete profile system with avatar display
- **Travel Duration Display**: Shows exact duration for each trip in Travel History
  - Past trips: "X days"
  - Current trips: "Day X (ongoing)"
  - Future trips: "X days planned" or "Duration TBD"
- **Professional User Menu**: Dropdown menu with avatar and navigation options
- **Sidebar User Profile**: Integrated user information in sidebar above navigation
- **Modern Calendar Colors**: Updated legend colors for better visual distinction
  - Today: Bright Orange (#FF7A00)
  - Past Stays: Cool Slate (#7B8FA1)
  - Future Stays: Teal Green (#1ABC9C)

### Fixed
- **Future Trip Display Bug**: Future trips no longer incorrectly show as "Currently staying"
  - Added proper date normalization with `setHours(0,0,0,0)`
  - Separated logic for future trips vs current stays
- **Current Stay Statistics**: Fixed stats not showing for trips with exit dates in the future
  - Updated logic to check if today falls within entry-exit date range
  - Now correctly identifies ongoing trips even with future exit dates
- **Travel History Badges**: Properly displays status badges for all trip types
  - "Currently staying" for ongoing trips
  - "Future trip" for upcoming travel
- **Vercel Deployment Issues**: Resolved build cache and module resolution errors
  - Added baseUrl to tsconfig.json
  - Moved build dependencies to production dependencies

### Changed
- **UI/UX Improvements**: 
  - Moved user welcome message and sign out from header to sidebar
  - Cleaner dashboard header layout
  - Better visual hierarchy with modern color scheme
- **Date Calculation Logic**: Enhanced accuracy for all date-based features
  - Consistent time normalization across components
  - Proper handling of timezone boundaries

### Technical
- **Documentation**: 
  - Added comprehensive date calculation algorithm documentation
  - Created edge cases and test scenarios documentation
  - Updated CLAUDE.md with recent fixes and solutions
- **Code Quality**:
  - Improved type safety in date handling functions
  - Better error handling for edge cases
  - More maintainable component structure

## [1.1.0] - 2025-08-13

### Added
- CSV import/export functionality
- Year calendar view with 12-month display
- Profile management with 5 tabs
- Mobile-optimized UI with responsive design
- Country filter for calendar view

### Fixed
- Dashboard performance issues with caching
- Mobile tab display with icon-only view
- Korea 183/365 visa calculation accuracy

## [1.0.0] - 2025-08-12

### Initial Release
- Core visa tracking functionality
- Supabase authentication integration
- Dashboard with visa status cards
- Travel history management
- Overlap detection and resolution
- Real-time visa calculation for multiple countries