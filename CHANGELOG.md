# Changelog

All notable changes to DINO (Digital Nomad Visa Tracker) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2025-08-15

### Added
- **Airport Code Recognition**: Automatic city name detection from IATA codes
  - Database of 300+ major international airports
  - Auto-populate city names when entering airport codes (e.g., ICN → Seoul)
  - Auto-select country when airport code is recognized
  - Visual indicator showing recognized airport information
  - Support for both "From" and "To" city fields
  - Uppercase conversion for consistent code entry
  - Travel History list now displays city names alongside airport codes

### Changed
- Enhanced date display to show both "Last updated" and "Last we checked" dates
  - "Last updated" shows when official visa rules were issued
  - "Last we checked" shows when DINO verified the information
- Visa information modal now shows friendly date format (e.g., "November 2024")
- Created centralized configuration file for app metadata

### Fixed
- Pagination duplication issue where page 4 appeared twice in StaysList

## [1.4.0] - 2025-08-15

### Added
- **Complete Countries Database**: All 195 countries with comprehensive visa information
  - Visa requirements for US passport holders
  - Visa types: visa-free, e-visa, visa on arrival, ETA
  - Maximum stay durations and visa rules (rolling window vs reset)
  - Official source links and last updated dates
  - Enhanced TypeScript types for visa data

### Changed
- **Smart Visa Card Filtering**: Dashboard now only shows relevant visa cards
  - Hide cards for countries not visited in >1 year
  - Reset-type visas hidden after 7 days since exit
  - Rolling window visas always shown if within period
  - Current stays always visible
- **Enhanced Country Interface**: Added comprehensive visa information fields
  - `ruleType`: 'rolling' | 'reset' | 'annual'
  - `requiresVisa`, `eVisa`, `visaOnArrival`, `eta` flags
  - `resetInfo`, `sourceUrl`, `lastUpdated` metadata

### Fixed
- TypeScript type errors in map components
- Build errors related to visa rule types
- ID duplication issue in supabase-store

### Development
- Travel Map temporarily disabled for production stability
  - Code preserved in `app/dashboard/_map-development/`
  - Will be re-enabled after further development

## [1.3.1] - 2025-08-14

### Added
- **Beta Feedback System**: Comprehensive user feedback collection
  - Screenshot upload support (up to 5MB)
  - 4 feedback types: General, Bug, Feature, UI/UX
  - Email delivery via Resend API
  - Real-time character counter
  - Drag & drop for screenshots

### Fixed
- **Profile Saving Issues**: Complete fix for passport information storage
  - Added proper RLS policies for profiles table
  - Disabled RLS on audit_logs table to prevent blocking
  - Added fallback logic for missing database columns
- **Feedback Email Delivery**: Changed to zbrianjin@gmail.com (Resend limitation)
- **UI/UX Improvements**:
  - Removed emergency contact tab
  - Fixed countries list alphabetical ordering
  - Fixed Next.js static chunk 404 errors
- **Future Trip Display**: Fixed incorrect "Currently staying" status
- **Current Stay Statistics**: Fixed stats for trips with future exit dates
- **Travel History Duration**: Added proper duration display

### Security
- Row Level Security (RLS) policies on all tables
- API rate limiting (10 requests per minute)
- Input validation and sanitization
- SQL injection prevention
- CORS and security headers configuration
- Comprehensive audit logging

## [1.3.0] - 2025-08-13

### Added
- **Korea Special Visa**: K-183/365 special residence visa support
- **Searchable Country Select**: Type-to-search country dropdown
- **Stay Management**: Edit and delete functionality for stays
- **Mobile Optimizations**: Icon-only tabs on mobile screens

### Changed
- **Vietnam Visa**: Updated from 45 to 90 days (E-visa)
- **Thailand Visa**: Updated from 30 to 60 days (July 2024 change)
- Countries list now sorted alphabetically
- Improved dashboard loading with 5-second cache

### Fixed
- Dashboard slow loading issue
- Mobile tab UI responsiveness
- Korea visa calculation (365-day period, not 364)

## [1.2.0] - 2025-08-12

### Added
- **Calendar View**: 12-month travel history visualization
- **CSV Import/Export**: Bulk data management
- **User Profiles**: Passport info, insurance, preferences
- **Stats Cards**: Overview of travel statistics
- **Disclaimer**: Visa information accuracy notice

### Changed
- Migrated from localStorage to Supabase
- Improved UI with modern sidebar design
- Enhanced mobile responsiveness

## [1.1.0] - 2025-08-10

### Added
- **Supabase Integration**: Cloud storage and authentication
- **User Authentication**: Secure login/signup
- **Data Sync**: Cross-device data synchronization
- **Profile Management**: User settings and preferences

### Security
- Implemented Row Level Security (RLS)
- Added authentication requirements
- Secured API endpoints

## [1.0.0] - 2025-08-08

### Initial Release
- Basic visa tracking for multiple countries
- Automatic visa day calculation
- Status indicators (safe/warning/danger)
- Add/edit/delete stay records
- Local storage with browser localStorage
- Responsive design for mobile and desktop
- Support for US passport visa rules

## Upcoming Features

### In Development
- 🚧 **World Map Visualization**: Interactive travel map
  - Country visit status
  - Travel routes
  - Visual statistics

### Planned
- [ ] Dark mode support
- [ ] Visa expiry notifications
- [ ] Advanced data export options
- [ ] Travel statistics dashboard
- [ ] Multi-passport support
- [ ] Offline mode
- [ ] Notification system
- [ ] Timeline view
- [ ] Advanced search functionality

---

## Version History

- **1.4.0** - Complete countries database with smart filtering
- **1.3.1** - Beta feedback system and security enhancements
- **1.3.0** - Special visa support and UI improvements
- **1.2.0** - Calendar view and CSV support
- **1.1.0** - Cloud integration with Supabase
- **1.0.0** - Initial release with core features