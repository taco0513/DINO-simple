// Major airport IATA codes with their cities
// Focus on commonly used airports by digital nomads

export interface Airport {
  code: string
  city: string
  country: string
  countryCode: string
  name?: string
}

export const airports: Airport[] = [
  // Asia-Pacific
  { code: 'ICN', city: 'Seoul', country: 'South Korea', countryCode: 'KR', name: 'Incheon' },
  { code: 'GMP', city: 'Seoul', country: 'South Korea', countryCode: 'KR', name: 'Gimpo' },
  { code: 'PUS', city: 'Busan', country: 'South Korea', countryCode: 'KR' },
  { code: 'CJU', city: 'Jeju', country: 'South Korea', countryCode: 'KR' },
  
  { code: 'NRT', city: 'Tokyo', country: 'Japan', countryCode: 'JP', name: 'Narita' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', countryCode: 'JP', name: 'Haneda' },
  { code: 'KIX', city: 'Osaka', country: 'Japan', countryCode: 'JP', name: 'Kansai' },
  { code: 'ITM', city: 'Osaka', country: 'Japan', countryCode: 'JP', name: 'Itami' },
  { code: 'NGO', city: 'Nagoya', country: 'Japan', countryCode: 'JP', name: 'Chubu' },
  { code: 'FUK', city: 'Fukuoka', country: 'Japan', countryCode: 'JP' },
  { code: 'CTS', city: 'Sapporo', country: 'Japan', countryCode: 'JP', name: 'New Chitose' },
  { code: 'OKA', city: 'Okinawa', country: 'Japan', countryCode: 'JP', name: 'Naha' },
  
  { code: 'PEK', city: 'Beijing', country: 'China', countryCode: 'CN', name: 'Capital' },
  { code: 'PKX', city: 'Beijing', country: 'China', countryCode: 'CN', name: 'Daxing' },
  { code: 'PVG', city: 'Shanghai', country: 'China', countryCode: 'CN', name: 'Pudong' },
  { code: 'SHA', city: 'Shanghai', country: 'China', countryCode: 'CN', name: 'Hongqiao' },
  { code: 'CAN', city: 'Guangzhou', country: 'China', countryCode: 'CN' },
  { code: 'SZX', city: 'Shenzhen', country: 'China', countryCode: 'CN' },
  { code: 'CTU', city: 'Chengdu', country: 'China', countryCode: 'CN' },
  { code: 'XIY', city: "Xi'an", country: 'China', countryCode: 'CN' },
  
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK' },
  { code: 'TPE', city: 'Taipei', country: 'Taiwan', countryCode: 'TW', name: 'Taoyuan' },
  { code: 'TSA', city: 'Taipei', country: 'Taiwan', countryCode: 'TW', name: 'Songshan' },
  { code: 'KHH', city: 'Kaohsiung', country: 'Taiwan', countryCode: 'TW' },
  
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', name: 'Suvarnabhumi' },
  { code: 'DMK', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', name: 'Don Mueang' },
  { code: 'CNX', city: 'Chiang Mai', country: 'Thailand', countryCode: 'TH' },
  { code: 'HKT', city: 'Phuket', country: 'Thailand', countryCode: 'TH' },
  
  { code: 'SIN', city: 'Singapore', country: 'Singapore', countryCode: 'SG', name: 'Changi' },
  
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', name: 'KLIA' },
  { code: 'PEN', city: 'Penang', country: 'Malaysia', countryCode: 'MY' },
  { code: 'LGK', city: 'Langkawi', country: 'Malaysia', countryCode: 'MY' },
  
  { code: 'CGK', city: 'Jakarta', country: 'Indonesia', countryCode: 'ID', name: 'Soekarno-Hatta' },
  { code: 'DPS', city: 'Denpasar', country: 'Indonesia', countryCode: 'ID', name: 'Bali' },
  { code: 'SUB', city: 'Surabaya', country: 'Indonesia', countryCode: 'ID' },
  
  { code: 'MNL', city: 'Manila', country: 'Philippines', countryCode: 'PH', name: 'Ninoy Aquino' },
  { code: 'CEB', city: 'Cebu', country: 'Philippines', countryCode: 'PH' },
  { code: 'CRK', city: 'Angeles', country: 'Philippines', countryCode: 'PH', name: 'Clark' },
  
  { code: 'SGN', city: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', name: 'Tan Son Nhat' },
  { code: 'HAN', city: 'Hanoi', country: 'Vietnam', countryCode: 'VN', name: 'Noi Bai' },
  { code: 'DAD', city: 'Da Nang', country: 'Vietnam', countryCode: 'VN' },
  { code: 'CXR', city: 'Nha Trang', country: 'Vietnam', countryCode: 'VN', name: 'Cam Ranh' },
  
  { code: 'DEL', city: 'New Delhi', country: 'India', countryCode: 'IN', name: 'Indira Gandhi' },
  { code: 'BOM', city: 'Mumbai', country: 'India', countryCode: 'IN', name: 'Chhatrapati Shivaji' },
  { code: 'BLR', city: 'Bangalore', country: 'India', countryCode: 'IN', name: 'Kempegowda' },
  { code: 'MAA', city: 'Chennai', country: 'India', countryCode: 'IN' },
  { code: 'CCU', city: 'Kolkata', country: 'India', countryCode: 'IN' },
  { code: 'HYD', city: 'Hyderabad', country: 'India', countryCode: 'IN' },
  
  { code: 'SYD', city: 'Sydney', country: 'Australia', countryCode: 'AU', name: 'Kingsford Smith' },
  { code: 'MEL', city: 'Melbourne', country: 'Australia', countryCode: 'AU', name: 'Tullamarine' },
  { code: 'BNE', city: 'Brisbane', country: 'Australia', countryCode: 'AU' },
  { code: 'PER', city: 'Perth', country: 'Australia', countryCode: 'AU' },
  { code: 'ADL', city: 'Adelaide', country: 'Australia', countryCode: 'AU' },
  
  { code: 'AKL', city: 'Auckland', country: 'New Zealand', countryCode: 'NZ' },
  { code: 'WLG', city: 'Wellington', country: 'New Zealand', countryCode: 'NZ' },
  { code: 'CHC', city: 'Christchurch', country: 'New Zealand', countryCode: 'NZ' },
  
  // Middle East
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE' },
  { code: 'DOH', city: 'Doha', country: 'Qatar', countryCode: 'QA', name: 'Hamad' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', countryCode: 'TR', name: 'Istanbul Airport' },
  { code: 'SAW', city: 'Istanbul', country: 'Turkey', countryCode: 'TR', name: 'Sabiha Gökçen' },
  { code: 'TLV', city: 'Tel Aviv', country: 'Israel', countryCode: 'IL', name: 'Ben Gurion' },
  
  // Europe
  { code: 'LHR', city: 'London', country: 'United Kingdom', countryCode: 'GB', name: 'Heathrow' },
  { code: 'LGW', city: 'London', country: 'United Kingdom', countryCode: 'GB', name: 'Gatwick' },
  { code: 'STN', city: 'London', country: 'United Kingdom', countryCode: 'GB', name: 'Stansted' },
  { code: 'LCY', city: 'London', country: 'United Kingdom', countryCode: 'GB', name: 'City' },
  { code: 'MAN', city: 'Manchester', country: 'United Kingdom', countryCode: 'GB' },
  { code: 'EDI', city: 'Edinburgh', country: 'United Kingdom', countryCode: 'GB' },
  
  { code: 'CDG', city: 'Paris', country: 'France', countryCode: 'FR', name: 'Charles de Gaulle' },
  { code: 'ORY', city: 'Paris', country: 'France', countryCode: 'FR', name: 'Orly' },
  { code: 'NCE', city: 'Nice', country: 'France', countryCode: 'FR' },
  { code: 'LYS', city: 'Lyon', country: 'France', countryCode: 'FR' },
  
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', countryCode: 'DE' },
  { code: 'MUC', city: 'Munich', country: 'Germany', countryCode: 'DE' },
  { code: 'BER', city: 'Berlin', country: 'Germany', countryCode: 'DE', name: 'Brandenburg' },
  { code: 'HAM', city: 'Hamburg', country: 'Germany', countryCode: 'DE' },
  { code: 'DUS', city: 'Düsseldorf', country: 'Germany', countryCode: 'DE' },
  { code: 'CGN', city: 'Cologne', country: 'Germany', countryCode: 'DE' },
  
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', name: 'Schiphol' },
  { code: 'BRU', city: 'Brussels', country: 'Belgium', countryCode: 'BE' },
  { code: 'ZRH', city: 'Zurich', country: 'Switzerland', countryCode: 'CH' },
  { code: 'GVA', city: 'Geneva', country: 'Switzerland', countryCode: 'CH' },
  { code: 'VIE', city: 'Vienna', country: 'Austria', countryCode: 'AT' },
  
  { code: 'MAD', city: 'Madrid', country: 'Spain', countryCode: 'ES', name: 'Barajas' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', countryCode: 'ES', name: 'El Prat' },
  { code: 'AGP', city: 'Málaga', country: 'Spain', countryCode: 'ES' },
  { code: 'PMI', city: 'Palma de Mallorca', country: 'Spain', countryCode: 'ES' },
  
  { code: 'LIS', city: 'Lisbon', country: 'Portugal', countryCode: 'PT', name: 'Humberto Delgado' },
  { code: 'OPO', city: 'Porto', country: 'Portugal', countryCode: 'PT' },
  
  { code: 'FCO', city: 'Rome', country: 'Italy', countryCode: 'IT', name: 'Fiumicino' },
  { code: 'MXP', city: 'Milan', country: 'Italy', countryCode: 'IT', name: 'Malpensa' },
  { code: 'VCE', city: 'Venice', country: 'Italy', countryCode: 'IT', name: 'Marco Polo' },
  { code: 'NAP', city: 'Naples', country: 'Italy', countryCode: 'IT' },
  { code: 'FLR', city: 'Florence', country: 'Italy', countryCode: 'IT' },
  
  { code: 'ATH', city: 'Athens', country: 'Greece', countryCode: 'GR' },
  { code: 'SKG', city: 'Thessaloniki', country: 'Greece', countryCode: 'GR' },
  
  { code: 'CPH', city: 'Copenhagen', country: 'Denmark', countryCode: 'DK' },
  { code: 'ARN', city: 'Stockholm', country: 'Sweden', countryCode: 'SE', name: 'Arlanda' },
  { code: 'OSL', city: 'Oslo', country: 'Norway', countryCode: 'NO' },
  { code: 'HEL', city: 'Helsinki', country: 'Finland', countryCode: 'FI', name: 'Vantaa' },
  
  { code: 'WAW', city: 'Warsaw', country: 'Poland', countryCode: 'PL', name: 'Chopin' },
  { code: 'KRK', city: 'Kraków', country: 'Poland', countryCode: 'PL' },
  { code: 'PRG', city: 'Prague', country: 'Czech Republic', countryCode: 'CZ', name: 'Václav Havel' },
  { code: 'BUD', city: 'Budapest', country: 'Hungary', countryCode: 'HU', name: 'Ferenc Liszt' },
  
  { code: 'DUB', city: 'Dublin', country: 'Ireland', countryCode: 'IE' },
  { code: 'KEF', city: 'Reykjavik', country: 'Iceland', countryCode: 'IS', name: 'Keflavik' },
  
  // North America
  { code: 'JFK', city: 'New York', country: 'United States', countryCode: 'US', name: 'John F. Kennedy' },
  { code: 'EWR', city: 'Newark', country: 'United States', countryCode: 'US' },
  { code: 'LGA', city: 'New York', country: 'United States', countryCode: 'US', name: 'LaGuardia' },
  { code: 'LAX', city: 'Los Angeles', country: 'United States', countryCode: 'US' },
  { code: 'SFO', city: 'San Francisco', country: 'United States', countryCode: 'US' },
  { code: 'ORD', city: 'Chicago', country: 'United States', countryCode: 'US', name: "O'Hare" },
  { code: 'MDW', city: 'Chicago', country: 'United States', countryCode: 'US', name: 'Midway' },
  { code: 'ATL', city: 'Atlanta', country: 'United States', countryCode: 'US', name: 'Hartsfield-Jackson' },
  { code: 'DFW', city: 'Dallas', country: 'United States', countryCode: 'US', name: 'Fort Worth' },
  { code: 'IAH', city: 'Houston', country: 'United States', countryCode: 'US', name: 'George Bush' },
  { code: 'MIA', city: 'Miami', country: 'United States', countryCode: 'US' },
  { code: 'MCO', city: 'Orlando', country: 'United States', countryCode: 'US' },
  { code: 'LAS', city: 'Las Vegas', country: 'United States', countryCode: 'US', name: 'Harry Reid' },
  { code: 'SEA', city: 'Seattle', country: 'United States', countryCode: 'US', name: 'Tacoma' },
  { code: 'PDX', city: 'Portland', country: 'United States', countryCode: 'US' },
  { code: 'DEN', city: 'Denver', country: 'United States', countryCode: 'US' },
  { code: 'PHX', city: 'Phoenix', country: 'United States', countryCode: 'US', name: 'Sky Harbor' },
  { code: 'BOS', city: 'Boston', country: 'United States', countryCode: 'US', name: 'Logan' },
  { code: 'DCA', city: 'Washington', country: 'United States', countryCode: 'US', name: 'Reagan National' },
  { code: 'IAD', city: 'Washington', country: 'United States', countryCode: 'US', name: 'Dulles' },
  { code: 'PHL', city: 'Philadelphia', country: 'United States', countryCode: 'US' },
  { code: 'DTW', city: 'Detroit', country: 'United States', countryCode: 'US' },
  { code: 'MSP', city: 'Minneapolis', country: 'United States', countryCode: 'US' },
  { code: 'SLC', city: 'Salt Lake City', country: 'United States', countryCode: 'US' },
  { code: 'CLT', city: 'Charlotte', country: 'United States', countryCode: 'US' },
  { code: 'SAN', city: 'San Diego', country: 'United States', countryCode: 'US' },
  { code: 'TPA', city: 'Tampa', country: 'United States', countryCode: 'US' },
  { code: 'AUS', city: 'Austin', country: 'United States', countryCode: 'US' },
  { code: 'HNL', city: 'Honolulu', country: 'United States', countryCode: 'US' },
  
  { code: 'YYZ', city: 'Toronto', country: 'Canada', countryCode: 'CA', name: 'Pearson' },
  { code: 'YVR', city: 'Vancouver', country: 'Canada', countryCode: 'CA' },
  { code: 'YUL', city: 'Montreal', country: 'Canada', countryCode: 'CA', name: 'Trudeau' },
  { code: 'YYC', city: 'Calgary', country: 'Canada', countryCode: 'CA' },
  { code: 'YEG', city: 'Edmonton', country: 'Canada', countryCode: 'CA' },
  { code: 'YOW', city: 'Ottawa', country: 'Canada', countryCode: 'CA' },
  
  { code: 'MEX', city: 'Mexico City', country: 'Mexico', countryCode: 'MX', name: 'Benito Juárez' },
  { code: 'CUN', city: 'Cancun', country: 'Mexico', countryCode: 'MX' },
  { code: 'GDL', city: 'Guadalajara', country: 'Mexico', countryCode: 'MX' },
  { code: 'MTY', city: 'Monterrey', country: 'Mexico', countryCode: 'MX' },
  { code: 'PVR', city: 'Puerto Vallarta', country: 'Mexico', countryCode: 'MX' },
  { code: 'SJD', city: 'Cabo San Lucas', country: 'Mexico', countryCode: 'MX', name: 'Los Cabos' },
  
  // Central & South America
  { code: 'PTY', city: 'Panama City', country: 'Panama', countryCode: 'PA', name: 'Tocumen' },
  { code: 'SJO', city: 'San José', country: 'Costa Rica', countryCode: 'CR' },
  { code: 'GUA', city: 'Guatemala City', country: 'Guatemala', countryCode: 'GT' },
  
  { code: 'BOG', city: 'Bogotá', country: 'Colombia', countryCode: 'CO', name: 'El Dorado' },
  { code: 'MDE', city: 'Medellín', country: 'Colombia', countryCode: 'CO' },
  { code: 'CTG', city: 'Cartagena', country: 'Colombia', countryCode: 'CO' },
  
  { code: 'GRU', city: 'São Paulo', country: 'Brazil', countryCode: 'BR', name: 'Guarulhos' },
  { code: 'CGH', city: 'São Paulo', country: 'Brazil', countryCode: 'BR', name: 'Congonhas' },
  { code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', name: 'Galeão' },
  { code: 'SDU', city: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', name: 'Santos Dumont' },
  { code: 'BSB', city: 'Brasília', country: 'Brazil', countryCode: 'BR' },
  
  { code: 'EZE', city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', name: 'Ezeiza' },
  { code: 'AEP', city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', name: 'Aeroparque' },
  
  { code: 'SCL', city: 'Santiago', country: 'Chile', countryCode: 'CL' },
  { code: 'LIM', city: 'Lima', country: 'Peru', countryCode: 'PE', name: 'Jorge Chávez' },
  { code: 'UIO', city: 'Quito', country: 'Ecuador', countryCode: 'EC' },
  { code: 'CCS', city: 'Caracas', country: 'Venezuela', countryCode: 'VE' },
  { code: 'MVD', city: 'Montevideo', country: 'Uruguay', countryCode: 'UY' },
  
  // Africa
  { code: 'CPT', city: 'Cape Town', country: 'South Africa', countryCode: 'ZA' },
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', name: 'O.R. Tambo' },
  { code: 'DUR', city: 'Durban', country: 'South Africa', countryCode: 'ZA' },
  
  { code: 'CAI', city: 'Cairo', country: 'Egypt', countryCode: 'EG' },
  { code: 'HRG', city: 'Hurghada', country: 'Egypt', countryCode: 'EG' },
  { code: 'SSH', city: 'Sharm El Sheikh', country: 'Egypt', countryCode: 'EG' },
  
  { code: 'CMN', city: 'Casablanca', country: 'Morocco', countryCode: 'MA', name: 'Mohammed V' },
  { code: 'RAK', city: 'Marrakech', country: 'Morocco', countryCode: 'MA' },
  
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', countryCode: 'KE', name: 'Jomo Kenyatta' },
  { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', countryCode: 'ET', name: 'Bole' },
  { code: 'LOS', city: 'Lagos', country: 'Nigeria', countryCode: 'NG', name: 'Murtala Muhammed' },
  { code: 'ABJ', city: 'Abidjan', country: 'Ivory Coast', countryCode: 'CI' },
]

// Helper function to find airport by IATA code
export function findAirportByCode(code: string): Airport | undefined {
  return airports.find(airport => 
    airport.code.toUpperCase() === code.toUpperCase()
  )
}

// Helper function to search airports by city or code
export function searchAirports(query: string): Airport[] {
  const normalizedQuery = query.toLowerCase()
  return airports.filter(airport => 
    airport.code.toLowerCase().includes(normalizedQuery) ||
    airport.city.toLowerCase().includes(normalizedQuery) ||
    airport.name?.toLowerCase().includes(normalizedQuery) ||
    airport.country.toLowerCase().includes(normalizedQuery)
  )
}

// Helper function to get display text for airport
export function getAirportDisplay(airport: Airport): string {
  if (airport.name) {
    return `${airport.city} (${airport.code} - ${airport.name})`
  }
  return `${airport.city} (${airport.code})`
}

// Helper function to detect if input is likely an airport code
export function isLikelyAirportCode(input: string): boolean {
  // IATA codes are exactly 3 letters
  return /^[A-Z]{3}$/i.test(input.trim())
}