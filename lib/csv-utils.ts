import { Stay } from './types'
import { countries } from './countries'

// CSV Headers
const CSV_HEADERS = [
  'Country',
  'Country Code',
  'City',
  'From Country',
  'From Country Code',
  'From City',
  'Entry Date',
  'Exit Date',
  'Visa Type',
  'Notes'
]

export function exportToCSV(stays: Stay[]): string {
  // Create CSV header
  const headers = CSV_HEADERS.join(',')
  
  // Create CSV rows
  const rows = stays.map(stay => {
    const country = countries.find(c => c.code === stay.countryCode)
    const fromCountry = stay.fromCountryCode ? countries.find(c => c.code === stay.fromCountryCode) : null
    
    const row = [
      country?.name || stay.countryCode,
      stay.countryCode,
      stay.city || '',
      fromCountry?.name || stay.fromCountryCode || '',
      stay.fromCountryCode || '',
      stay.fromCity || '',
      stay.entryDate,
      stay.exitDate || '',
      stay.visaType || 'visa-free',
      stay.notes || ''
    ]
    
    // Escape quotes and wrap fields with commas or quotes in quotes
    return row.map(field => {
      const str = String(field)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(',')
  })
  
  return [headers, ...rows].join('\n')
}

export function downloadCSV(csv: string, filename: string = 'dino-stays.csv') {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function generateCSVTemplate(): string {
  const headers = CSV_HEADERS.join(',')
  
  // Sample data rows
  const sampleRows = [
    'Thailand,TH,Bangkok,Vietnam,VN,Ho Chi Minh,2024-01-15,2024-02-15,visa-free,Tourist visit',
    'Vietnam,VN,Hanoi,Thailand,TH,Bangkok,2024-02-15,2024-03-20,e-visa,Business trip',
    'South Korea,KR,Seoul,Vietnam,VN,Hanoi,2024-03-20,2024-04-10,visa-free,Visit family'
  ]
  
  return [headers, ...sampleRows].join('\n')
}

export function parseCSV(csvText: string): Partial<Stay>[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  
  // Skip header if it matches our expected headers
  const firstLine = lines[0]
  const hasHeader = firstLine.toLowerCase().includes('country') || 
                    firstLine.toLowerCase().includes('entry') ||
                    firstLine.toLowerCase().includes('exit')
  
  const dataLines = hasHeader ? lines.slice(1) : lines
  
  return dataLines.map(line => {
    // Parse CSV line considering quoted fields
    const fields: string[] = []
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
        fields.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    // Add last field
    fields.push(current.trim())
    
    // Map fields to Stay object
    // Try to detect format based on number of fields
    if (fields.length >= 6) {
      // Try to find country code
      let countryCode = fields[1] // Assume second field is country code
      
      // If country code doesn't exist in our list, try to find by name
      if (!countries.find(c => c.code === countryCode)) {
        const countryByName = countries.find(c => 
          c.name.toLowerCase() === fields[0].toLowerCase()
        )
        if (countryByName) {
          countryCode = countryByName.code
        }
      }
      
      // Similar for from country
      let fromCountryCode = fields[4]
      if (fromCountryCode && !countries.find(c => c.code === fromCountryCode)) {
        const fromCountryByName = countries.find(c => 
          c.name.toLowerCase() === fields[3].toLowerCase()
        )
        if (fromCountryByName) {
          fromCountryCode = fromCountryByName.code
        }
      }
      
      return {
        countryCode: countryCode || fields[1],
        city: fields[2] || undefined,
        fromCountryCode: fromCountryCode || undefined,
        fromCity: fields[5] || undefined,
        entryDate: fields[6],
        exitDate: fields[7] || undefined,
        visaType: fields[8] || 'visa-free',
        notes: fields[9] || undefined
      }
    }
    
    // Minimal format (country code, entry date, exit date)
    return {
      countryCode: fields[0],
      entryDate: fields[1],
      exitDate: fields[2] || undefined,
      visaType: 'visa-free'
    }
  }).filter(stay => 
    // Validate required fields
    stay.countryCode && 
    stay.entryDate &&
    countries.find(c => c.code === stay.countryCode)
  )
}