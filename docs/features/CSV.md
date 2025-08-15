# CSV Import/Export Feature Documentation

## Overview
The CSV feature enables users to bulk import and export their travel history data, facilitating data migration, backup, and integration with external tools like Excel or Google Sheets. This feature is essential for users transitioning from other tracking methods or maintaining offline backups.

## File Structure
```
app/dashboard/csv/
├── page.tsx                    # Main CSV management page
└── loading.tsx                 # Loading state

lib/
├── csv-utils.ts               # CSV parsing and generation utilities
├── supabase-store.ts          # Data persistence layer
└── types.ts                   # TypeScript interfaces

components/
└── CSVImportPreview.tsx       # Import preview and confirmation (inline)
```

## Core Components

### 1. CSV Page (`app/dashboard/csv/page.tsx`)

#### Purpose
Central hub for all CSV operations, providing import, export, and template download functionality.

#### Visual Layout
```
┌──────────────────────────────────────────┐
│ 📁 CSV File Management                   │
├──────────────────────────────────────────┤
│ ┌────────────────────────────────────┐  │
│ │ 📥 Import CSV                      │  │
│ │                                    │  │
│ │ [Choose File] No file chosen       │  │
│ │                                    │  │
│ │ ℹ️ Upload your travel history CSV   │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 📤 Export CSV                      │  │
│ │                                    │  │
│ │ [↓ Export All Stays]               │  │
│ │ [↓ Download Template]              │  │
│ │                                    │  │
│ │ ℹ️ Download your data or template   │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 📋 Import Preview                  │  │
│ │ [Table of parsed data]             │  │
│ │                                    │  │
│ │ [Cancel] [Import X Stays]          │  │
│ └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

#### State Management
```typescript
interface CSVPageState {
  csvFile: File | null
  csvContent: string | null
  parsedStays: Stay[]
  parseErrors: string[]
  importProgress: number
  isImporting: boolean
  showPreview: boolean
}
```

#### File Upload Handling
```typescript
const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // Validate file type
  if (!file.name.endsWith('.csv')) {
    setError('Please upload a CSV file')
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    setError('File size must be less than 5MB')
    return
  }
  
  // Read file content
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    processCsvContent(content)
  }
  reader.readAsText(file)
}
```

### 2. CSV Utilities (`lib/csv-utils.ts`)

#### Purpose
Core CSV parsing and generation logic with robust error handling and data validation.

#### CSV Format Specification

##### Required Columns
| Column | Type | Format | Example | Notes |
|--------|------|--------|---------|-------|
| Country | string | Country name or code | "Japan" or "JP" | Matched against country database |
| City | string | City name | "Tokyo" | Free text, optional |
| Entry Date | date | YYYY-MM-DD or MM/DD/YYYY | "2024-01-15" | Multiple formats supported |
| Exit Date | date | YYYY-MM-DD or MM/DD/YYYY | "2024-01-30" | Optional, empty for ongoing |
| Visa Type | string | Predefined types | "Tourist" | Optional, defaults to "Tourist" |
| Notes | string | Free text | "Business conference" | Optional, max 500 chars |

##### Sample CSV
```csv
Country,City,Entry Date,Exit Date,Visa Type,Notes
Japan,Tokyo,2024-01-15,2024-01-30,Tourist,New Year vacation
"Korea, South",Seoul,2024-02-01,2024-03-15,Business,Client meetings
Thailand,Bangkok,2024-03-16,,Tourist,Currently here
```

#### Parser Implementation

##### Core Parser Function
```typescript
export function parseCSV(csvContent: string): {
  stays: Partial<Stay>[]
  errors: string[]
} {
  const lines = csvContent.split('\n')
  const headers = parseHeaders(lines[0])
  const stays: Partial<Stay>[] = []
  const errors: string[] = []
  
  // Validate headers
  const requiredHeaders = ['Country', 'Entry Date']
  const missingHeaders = requiredHeaders.filter(
    h => !headers.includes(h.toLowerCase())
  )
  
  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(', ')}`)
    return { stays: [], errors }
  }
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    try {
      const stay = parseRow(line, headers)
      if (validateStay(stay)) {
        stays.push(stay)
      } else {
        errors.push(`Row ${i + 1}: Invalid data`)
      }
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error.message}`)
    }
  }
  
  return { stays, errors }
}
```

##### Field Parsing
```typescript
function parseRow(line: string, headers: string[]): Partial<Stay> {
  const values = parseCSVLine(line) // Handles quoted fields
  const stay: Partial<Stay> = {}
  
  headers.forEach((header, index) => {
    const value = values[index]?.trim()
    if (!value) return
    
    switch (header) {
      case 'country':
        stay.countryCode = parseCountry(value)
        break
      case 'city':
        stay.city = value
        break
      case 'entry date':
        stay.entryDate = parseDate(value)
        break
      case 'exit date':
        stay.exitDate = parseDate(value)
        break
      case 'visa type':
        stay.visaType = parseVisaType(value)
        break
      case 'notes':
        stay.notes = value.substring(0, 500)
        break
    }
  })
  
  return stay
}
```

##### Country Matching
```typescript
function parseCountry(value: string): string {
  // Try exact code match
  const upperValue = value.toUpperCase()
  if (countries.find(c => c.code === upperValue)) {
    return upperValue
  }
  
  // Try name match (case-insensitive)
  const country = countries.find(
    c => c.name.toLowerCase() === value.toLowerCase()
  )
  if (country) return country.code
  
  // Try partial match
  const partial = countries.find(
    c => c.name.toLowerCase().includes(value.toLowerCase())
  )
  if (partial) return partial.code
  
  throw new Error(`Unknown country: ${value}`)
}
```

##### Date Parsing
```typescript
function parseDate(value: string): string {
  if (!value) return null
  
  // Try multiple date formats
  const formats = [
    'yyyy-MM-dd',      // ISO format
    'MM/dd/yyyy',      // US format
    'dd/MM/yyyy',      // European format
    'yyyy/MM/dd',      // Alternative ISO
    'MMM dd, yyyy',    // Long format
    'dd-MMM-yyyy'      // Alternative long
  ]
  
  for (const format of formats) {
    try {
      const date = parse(value, format, new Date())
      if (isValid(date)) {
        return format(date, 'yyyy-MM-dd')
      }
    } catch {
      continue
    }
  }
  
  throw new Error(`Invalid date format: ${value}`)
}
```

##### Quoted Field Handling
```typescript
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last field
  result.push(current)
  return result
}
```

#### Generator Implementation

##### Export Function
```typescript
export function generateCSV(stays: Stay[]): string {
  const headers = [
    'Country',
    'City', 
    'Entry Date',
    'Exit Date',
    'Visa Type',
    'Notes'
  ]
  
  const rows = stays.map(stay => {
    const country = countries.find(c => c.code === stay.countryCode)
    return [
      escapeCSVField(country?.name || stay.countryCode),
      escapeCSVField(stay.city || ''),
      stay.entryDate,
      stay.exitDate || '',
      stay.visaType || 'Tourist',
      escapeCSVField(stay.notes || '')
    ]
  })
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
}
```

##### Field Escaping
```typescript
function escapeCSVField(value: string): string {
  if (!value) return ''
  
  // Check if escaping is needed
  if (value.includes(',') || 
      value.includes('"') || 
      value.includes('\n') ||
      value.includes('\r')) {
    // Escape quotes by doubling them
    const escaped = value.replace(/"/g, '""')
    return `"${escaped}"`
  }
  
  return value
}
```

##### Template Generation
```typescript
export function generateTemplate(): string {
  const headers = [
    'Country',
    'City',
    'Entry Date',
    'Exit Date',
    'Visa Type',
    'Notes'
  ]
  
  const sampleRows = [
    ['Japan', 'Tokyo', '2024-01-15', '2024-01-30', 'Tourist', 'Vacation'],
    ['Korea, South', 'Seoul', '2024-02-01', '2024-03-15', 'Business', 'Work trip'],
    ['Thailand', 'Bangkok', '2024-03-16', '', 'Tourist', 'Digital nomad']
  ]
  
  return [
    headers.join(','),
    ...sampleRows.map(row => 
      row.map(field => escapeCSVField(field)).join(',')
    )
  ].join('\n')
}
```

### 3. Import Preview Component

#### Purpose
Display parsed CSV data for user review before committing to database.

#### Features
- **Data Validation**: Visual indicators for valid/invalid rows
- **Error Display**: Clear error messages for problematic data
- **Edit Capability**: Inline editing of parsed data (planned)
- **Selective Import**: Checkbox selection for rows (planned)

#### Visual Design
```
┌──────────────────────────────────────────┐
│ Import Preview (12 stays found)          │
├──────────────────────────────────────────┤
│ ⚠️ 2 errors found:                       │
│ • Row 5: Unknown country "Atlantis"      │
│ • Row 8: Invalid date format             │
├──────────────────────────────────────────┤
│ ┌─┬───────┬──────┬────────┬────────┐   │
│ │✓│Country│City  │Entry   │Exit    │   │
│ ├─┼───────┼──────┼────────┼────────┤   │
│ │✓│🇯🇵 Japan│Tokyo │01/15/24│01/30/24│   │
│ │✓│🇰🇷 Korea│Seoul │02/01/24│03/15/24│   │
│ │✗│Unknown│      │03/16/24│        │   │
│ └─┴───────┴──────┴────────┴────────┘   │
│                                          │
│ [Cancel Import] [Import 10 Valid Stays]  │
└──────────────────────────────────────────┘
```

#### Import Confirmation Flow
```typescript
const handleImport = async () => {
  setIsImporting(true)
  const results = {
    success: 0,
    failed: 0,
    errors: []
  }
  
  // Import with progress tracking
  for (let i = 0; i < validStays.length; i++) {
    try {
      await addStay(validStays[i])
      results.success++
    } catch (error) {
      results.failed++
      results.errors.push(`Row ${i + 1}: ${error.message}`)
    }
    
    // Update progress
    setImportProgress((i + 1) / validStays.length * 100)
  }
  
  // Show results
  if (results.failed === 0) {
    toast.success(`Successfully imported ${results.success} stays`)
  } else {
    toast.warning(
      `Imported ${results.success} stays, ${results.failed} failed`
    )
  }
  
  // Reset state
  setIsImporting(false)
  setCsvFile(null)
  setParsedStays([])
  
  // Refresh dashboard
  await loadStays()
}
```

## Data Validation

### Import Validation Rules

#### Required Fields
```typescript
const validateStay = (stay: Partial<Stay>): boolean => {
  // Required: country and entry date
  if (!stay.countryCode || !stay.entryDate) {
    return false
  }
  
  // Validate country code
  if (!countries.find(c => c.code === stay.countryCode)) {
    return false
  }
  
  // Validate dates
  const entryDate = new Date(stay.entryDate)
  if (!isValid(entryDate)) {
    return false
  }
  
  if (stay.exitDate) {
    const exitDate = new Date(stay.exitDate)
    if (!isValid(exitDate) || exitDate < entryDate) {
      return false
    }
  }
  
  // Validate visa type
  if (stay.visaType && !VALID_VISA_TYPES.includes(stay.visaType)) {
    return false
  }
  
  return true
}
```

#### Duplicate Detection
```typescript
const detectDuplicates = (
  newStays: Stay[], 
  existingStays: Stay[]
): Stay[] => {
  return newStays.filter(newStay => {
    return existingStays.some(existing => 
      existing.countryCode === newStay.countryCode &&
      existing.entryDate === newStay.entryDate &&
      existing.city === newStay.city
    )
  })
}
```

#### Overlap Detection
```typescript
const detectOverlaps = (stays: Stay[]): Overlap[] => {
  const overlaps: Overlap[] = []
  const sorted = [...stays].sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  )
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]
    
    if (!current.exitDate) continue
    
    const currentExit = new Date(current.exitDate)
    const nextEntry = new Date(next.entryDate)
    
    if (currentExit >= nextEntry) {
      overlaps.push({
        stay1: current,
        stay2: next,
        overlapDays: differenceInDays(currentExit, nextEntry) + 1
      })
    }
  }
  
  return overlaps
}
```

## Export Functionality

### Export Options

#### Full Export
```typescript
const handleExportAll = async () => {
  // Load all stays
  const { stays } = useSupabaseStore.getState()
  
  if (stays.length === 0) {
    toast.error('No stays to export')
    return
  }
  
  // Generate CSV
  const csv = generateCSV(stays)
  
  // Create download
  downloadCSV(csv, `dino-export-${format(new Date(), 'yyyy-MM-dd')}.csv`)
  
  toast.success(`Exported ${stays.length} stays`)
}
```

#### Filtered Export (Planned)
```typescript
interface ExportFilters {
  dateRange?: { start: Date; end: Date }
  countries?: string[]
  visaTypes?: string[]
}

const handleFilteredExport = async (filters: ExportFilters) => {
  let filtered = [...stays]
  
  if (filters.dateRange) {
    filtered = filtered.filter(stay => {
      const entryDate = new Date(stay.entryDate)
      return entryDate >= filters.dateRange.start && 
             entryDate <= filters.dateRange.end
    })
  }
  
  if (filters.countries?.length > 0) {
    filtered = filtered.filter(stay => 
      filters.countries.includes(stay.countryCode)
    )
  }
  
  // Generate and download
  const csv = generateCSV(filtered)
  downloadCSV(csv, 'filtered-export.csv')
}
```

### Download Implementation
```typescript
function downloadCSV(content: string, filename: string) {
  // Create blob
  const blob = new Blob([content], { 
    type: 'text/csv;charset=utf-8;' 
  })
  
  // Create download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

## Error Handling

### Import Errors

#### Error Types
```typescript
enum ImportErrorType {
  FILE_TOO_LARGE = 'File size exceeds 5MB limit',
  INVALID_FORMAT = 'File is not valid CSV format',
  MISSING_HEADERS = 'Required columns are missing',
  INVALID_DATA = 'Data validation failed',
  DUPLICATE_ENTRY = 'Duplicate entries detected',
  DATABASE_ERROR = 'Failed to save to database',
  NETWORK_ERROR = 'Network connection failed'
}
```

#### Error Recovery
```typescript
const handleImportError = (error: ImportError) => {
  switch (error.type) {
    case ImportErrorType.FILE_TOO_LARGE:
      // Suggest splitting file
      showSplitFileGuide()
      break
      
    case ImportErrorType.INVALID_FORMAT:
      // Show format requirements
      showFormatGuide()
      break
      
    case ImportErrorType.MISSING_HEADERS:
      // Highlight missing columns
      highlightMissingColumns(error.details)
      break
      
    case ImportErrorType.DUPLICATE_ENTRY:
      // Show duplicate resolution options
      showDuplicateOptions(error.duplicates)
      break
      
    default:
      // Generic error message
      toast.error(error.message)
  }
}
```

### Export Errors

#### Common Issues
- Browser blocking downloads
- Insufficient storage space
- Data corruption during generation

#### Mitigation Strategies
```typescript
try {
  downloadCSV(csv, filename)
} catch (error) {
  // Fallback: Display CSV in textarea for manual copy
  showManualCopyDialog(csv)
  
  toast.error('Download failed. Please copy the data manually.')
}
```

## Performance Optimization

### Large File Handling

#### Chunked Processing
```typescript
async function processLargeCSV(
  content: string, 
  chunkSize: number = 100
): Promise<ProcessResult> {
  const lines = content.split('\n')
  const totalChunks = Math.ceil(lines.length / chunkSize)
  const results: Stay[] = []
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, lines.length)
    const chunk = lines.slice(start, end)
    
    // Process chunk
    const { stays } = await processChunk(chunk)
    results.push(...stays)
    
    // Update progress
    onProgress((i + 1) / totalChunks * 100)
    
    // Allow UI to update
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  
  return { stays: results }
}
```

#### Memory Management
```typescript
// Use FileReader with chunks for very large files
function readLargeFile(file: File, chunkSize: number = 1024 * 1024) {
  const reader = new FileReader()
  let offset = 0
  
  const readChunk = () => {
    const slice = file.slice(offset, offset + chunkSize)
    reader.readAsText(slice)
  }
  
  reader.onload = (e) => {
    processChunk(e.target.result as string)
    offset += chunkSize
    
    if (offset < file.size) {
      readChunk() // Read next chunk
    }
  }
  
  readChunk() // Start reading
}
```

### Caching Strategy

#### Template Caching
```typescript
let cachedTemplate: string | null = null

export function getTemplate(): string {
  if (!cachedTemplate) {
    cachedTemplate = generateTemplate()
  }
  return cachedTemplate
}
```

#### Country Lookup Optimization
```typescript
// Create lookup map for O(1) access
const countryMap = new Map(
  countries.map(c => [c.code, c])
)

const countryNameMap = new Map(
  countries.map(c => [c.name.toLowerCase(), c.code])
)
```

## Browser Compatibility

### File API Support
```typescript
const checkFileAPISupport = (): boolean => {
  return !!(
    window.File && 
    window.FileReader && 
    window.FileList && 
    window.Blob
  )
}

if (!checkFileAPISupport()) {
  // Show fallback UI for manual paste
  showManualPasteInterface()
}
```

### Download Compatibility
```typescript
function downloadCSVCompat(content: string, filename: string) {
  if (navigator.msSaveBlob) {
    // IE 10+
    const blob = new Blob([content], { type: 'text/csv' })
    navigator.msSaveBlob(blob, filename)
  } else if ('download' in HTMLAnchorElement.prototype) {
    // Modern browsers
    standardDownload(content, filename)
  } else {
    // Fallback: Open in new window
    const dataUri = 'data:text/csv;charset=utf-8,' + 
                    encodeURIComponent(content)
    window.open(dataUri)
  }
}
```

## Security Considerations

### Input Sanitization
```typescript
function sanitizeCSVInput(value: string): string {
  // Remove potentially dangerous characters
  return value
    .replace(/[<>]/g, '')           // Remove HTML tags
    .replace(/javascript:/gi, '')    // Remove JS protocols
    .replace(/on\w+=/gi, '')         // Remove event handlers
    .trim()
    .substring(0, 1000)              // Limit length
}
```

### File Validation
```typescript
const validateFile = (file: File): ValidationResult => {
  // Check MIME type
  if (!file.type.includes('csv') && 
      !file.type.includes('text')) {
    return { valid: false, error: 'Invalid file type' }
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File too large' }
  }
  
  // Check filename
  if (!/^[\w\-. ]+\.csv$/i.test(file.name)) {
    return { valid: false, error: 'Invalid filename' }
  }
  
  return { valid: true }
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('CSV Parser', () => {
  it('should parse valid CSV correctly')
  it('should handle quoted fields with commas')
  it('should handle escaped quotes')
  it('should detect missing required columns')
  it('should validate date formats')
  it('should match country names flexibly')
})

describe('CSV Generator', () => {
  it('should generate valid CSV from stays')
  it('should escape special characters')
  it('should handle empty fields')
  it('should include all required columns')
})
```

### Integration Tests
```typescript
describe('CSV Import Flow', () => {
  it('should import valid CSV successfully')
  it('should show preview before import')
  it('should handle import errors gracefully')
  it('should detect and handle duplicates')
  it('should update UI after import')
})
```

### E2E Tests
```typescript
describe('CSV Feature E2E', () => {
  it('should complete full import workflow')
  it('should export and re-import data accurately')
  it('should handle large files')
  it('should work across browsers')
})
```

## Accessibility

### File Input Accessibility
```html
<label htmlFor="csv-upload" className="sr-only">
  Upload CSV file
</label>
<input
  id="csv-upload"
  type="file"
  accept=".csv,text/csv"
  aria-describedby="csv-upload-help"
  onChange={handleFileUpload}
/>
<p id="csv-upload-help" className="text-sm text-gray-600">
  Select a CSV file containing your travel history
</p>
```

### Progress Indicators
```typescript
<div role="progressbar" 
     aria-valuenow={progress} 
     aria-valuemin="0" 
     aria-valuemax="100"
     aria-label="Import progress">
  <div style={{ width: `${progress}%` }} />
</div>
```

### Screen Reader Announcements
```typescript
const announceProgress = (message: string) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', 'polite')
  announcement.className = 'sr-only'
  announcement.textContent = message
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}
```

## User Guide

### Import Instructions
1. Click "Choose File" button
2. Select your CSV file (max 5MB)
3. Review parsed data in preview
4. Correct any errors if needed
5. Click "Import" to add stays

### Export Instructions
1. Click "Export All Stays" to download all data
2. File will be named with current date
3. Open in Excel or Google Sheets
4. Edit as needed and re-import

### Template Usage
1. Download template for correct format
2. Fill in your travel data
3. Save as CSV (UTF-8 encoding)
4. Import using the upload feature

## Troubleshooting

### Common Issues

#### "Unknown country" Error
- Check country spelling and format
- Use full country names or ISO codes
- Refer to template for examples

#### Date Format Errors
- Use YYYY-MM-DD format
- Or use MM/DD/YYYY (US format)
- Ensure dates are valid

#### Character Encoding Issues
- Save CSV with UTF-8 encoding
- Avoid special characters if possible
- Use quotes for fields with commas

## Future Enhancements

### Planned Features
1. **Batch Edit**: Edit multiple stays before import
2. **Smart Mapping**: Auto-detect column mappings
3. **Import History**: Track previous imports
4. **Merge Options**: Merge vs replace on import
5. **Export Formats**: Support for JSON, Excel

### Advanced Features
1. **API Import**: Import from other services
2. **Scheduled Export**: Automatic backups
3. **Cloud Sync**: Google Drive/Dropbox integration
4. **Data Transformation**: Rules for data cleaning
5. **Import Templates**: Preset mappings for common formats

## Related Documentation
- [Database Schema](../architecture/DATABASE.md)
- [Data Types](../api/DATA-TYPES.md)
- [Dashboard Features](./DASHBOARD.md)
- [State Management](../architecture/STATE-MANAGEMENT.md)