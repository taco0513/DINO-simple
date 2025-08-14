# Changelog

All notable changes to the DINO project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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