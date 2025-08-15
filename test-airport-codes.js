// Test script for airport code recognition
import { findAirportByCode, isLikelyAirportCode, getAirportDisplay } from './lib/airport-codes.js'

// Test cases
const testCodes = [
  'ICN',  // Seoul Incheon
  'JFK',  // New York JFK
  'BKK',  // Bangkok Suvarnabhumi
  'NRT',  // Tokyo Narita
  'LAX',  // Los Angeles
  'DXB',  // Dubai
  'SIN',  // Singapore Changi
  'HND',  // Tokyo Haneda
  'CDG',  // Paris Charles de Gaulle
  'LHR',  // London Heathrow
  'XXX',  // Invalid code
  'AB',   // Too short
  'ABCD', // Too long
  'bangkok', // Not a code
]

console.log('Testing Airport Code Recognition System\n')
console.log('=' . repeat(50))

testCodes.forEach(code => {
  console.log(`\nTesting: "${code}"`)
  
  if (isLikelyAirportCode(code)) {
    console.log('  ✓ Detected as airport code')
    const airport = findAirportByCode(code)
    if (airport) {
      console.log(`  ✓ Found: ${getAirportDisplay(airport)}`)
      console.log(`    Country: ${airport.country} (${airport.countryCode})`)
    } else {
      console.log('  ✗ Airport not found in database')
    }
  } else {
    console.log('  ✗ Not detected as airport code')
  }
})

console.log('\n' + '=' . repeat(50))
console.log('Test complete!')