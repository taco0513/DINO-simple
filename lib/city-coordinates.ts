// Major city coordinates database for map display
export interface CityCoordinates {
  name: string
  countryCode: string
  lat: number
  lng: number
}

// Database of major cities with their coordinates
export const cityCoordinates: Record<string, CityCoordinates> = {
  // South Korea
  'seoul': { name: 'Seoul', countryCode: 'KR', lat: 37.5665, lng: 126.9780 },
  'busan': { name: 'Busan', countryCode: 'KR', lat: 35.1796, lng: 129.0756 },
  'incheon': { name: 'Incheon', countryCode: 'KR', lat: 37.4563, lng: 126.7052 },
  'jeju': { name: 'Jeju', countryCode: 'KR', lat: 33.4996, lng: 126.5312 },
  
  // South Korea Airports
  'icn': { name: 'Seoul (ICN)', countryCode: 'KR', lat: 37.4602, lng: 126.4407 },
  'gimpo': { name: 'Seoul (GMP)', countryCode: 'KR', lat: 37.5583, lng: 126.7906 },
  'gmp': { name: 'Seoul (GMP)', countryCode: 'KR', lat: 37.5583, lng: 126.7906 },
  'pus': { name: 'Busan (PUS)', countryCode: 'KR', lat: 35.1795, lng: 128.9382 },
  'cju': { name: 'Jeju (CJU)', countryCode: 'KR', lat: 33.5113, lng: 126.4930 },
  
  // Japan
  'tokyo': { name: 'Tokyo', countryCode: 'JP', lat: 35.6762, lng: 139.6503 },
  'osaka': { name: 'Osaka', countryCode: 'JP', lat: 34.6937, lng: 135.5023 },
  'kyoto': { name: 'Kyoto', countryCode: 'JP', lat: 35.0116, lng: 135.7681 },
  'hiroshima': { name: 'Hiroshima', countryCode: 'JP', lat: 34.3853, lng: 132.4553 },
  'fukuoka': { name: 'Fukuoka', countryCode: 'JP', lat: 33.5904, lng: 130.4017 },
  
  // Japan Airports
  'nrt': { name: 'Tokyo (NRT)', countryCode: 'JP', lat: 35.7647, lng: 140.3864 },
  'hnd': { name: 'Tokyo (HND)', countryCode: 'JP', lat: 35.5494, lng: 139.7798 },
  'kix': { name: 'Osaka (KIX)', countryCode: 'JP', lat: 34.4273, lng: 135.2449 },
  'itm': { name: 'Osaka (ITM)', countryCode: 'JP', lat: 34.7855, lng: 135.4384 },
  'fuk': { name: 'Fukuoka (FUK)', countryCode: 'JP', lat: 33.5859, lng: 130.4510 },
  'cts': { name: 'Sapporo (CTS)', countryCode: 'JP', lat: 42.7747, lng: 141.6920 },
  
  // Thailand
  'bangkok': { name: 'Bangkok', countryCode: 'TH', lat: 13.7563, lng: 100.5018 },
  'chiang mai': { name: 'Chiang Mai', countryCode: 'TH', lat: 18.7883, lng: 98.9853 },
  'phuket': { name: 'Phuket', countryCode: 'TH', lat: 7.8804, lng: 98.3923 },
  'pattaya': { name: 'Pattaya', countryCode: 'TH', lat: 12.9236, lng: 100.8825 },
  
  // Thailand Airports
  'bkk': { name: 'Bangkok (BKK)', countryCode: 'TH', lat: 13.6900, lng: 100.7501 },
  'dmk': { name: 'Bangkok (DMK)', countryCode: 'TH', lat: 13.9125, lng: 100.6068 },
  'cnx': { name: 'Chiang Mai (CNX)', countryCode: 'TH', lat: 18.7669, lng: 98.9626 },
  'hkt': { name: 'Phuket (HKT)', countryCode: 'TH', lat: 8.1132, lng: 98.3169 },
  
  // Vietnam
  'ho chi minh': { name: 'Ho Chi Minh', countryCode: 'VN', lat: 10.8231, lng: 106.6297 },
  'ho chi minh city': { name: 'Ho Chi Minh', countryCode: 'VN', lat: 10.8231, lng: 106.6297 },
  'saigon': { name: 'Ho Chi Minh', countryCode: 'VN', lat: 10.8231, lng: 106.6297 },
  'hanoi': { name: 'Hanoi', countryCode: 'VN', lat: 21.0285, lng: 105.8542 },
  'da nang': { name: 'Da Nang', countryCode: 'VN', lat: 16.0544, lng: 108.2022 },
  'hoi an': { name: 'Hoi An', countryCode: 'VN', lat: 15.8801, lng: 108.338 },
  
  // Vietnam Airports
  'sgn': { name: 'Ho Chi Minh (SGN)', countryCode: 'VN', lat: 10.8187, lng: 106.6519 },
  'han': { name: 'Hanoi (HAN)', countryCode: 'VN', lat: 21.2187, lng: 105.8070 },
  'dad': { name: 'Da Nang (DAD)', countryCode: 'VN', lat: 16.0439, lng: 108.1987 },
  
  // United States
  'new york': { name: 'New York', countryCode: 'US', lat: 40.7128, lng: -74.0060 },
  'los angeles': { name: 'Los Angeles', countryCode: 'US', lat: 34.0522, lng: -118.2437 },
  'chicago': { name: 'Chicago', countryCode: 'US', lat: 41.8781, lng: -87.6298 },
  'san francisco': { name: 'San Francisco', countryCode: 'US', lat: 37.7749, lng: -122.4194 },
  'las vegas': { name: 'Las Vegas', countryCode: 'US', lat: 36.1699, lng: -115.1398 },
  'miami': { name: 'Miami', countryCode: 'US', lat: 25.7617, lng: -80.1918 },
  'seattle': { name: 'Seattle', countryCode: 'US', lat: 47.6062, lng: -122.3321 },
  
  // US Airports
  'jfk': { name: 'New York (JFK)', countryCode: 'US', lat: 40.6413, lng: -73.7781 },
  'lga': { name: 'New York (LGA)', countryCode: 'US', lat: 40.7769, lng: -73.8740 },
  'ewr': { name: 'New York (EWR)', countryCode: 'US', lat: 40.6895, lng: -74.1745 },
  'lax': { name: 'Los Angeles (LAX)', countryCode: 'US', lat: 33.9425, lng: -118.4081 },
  'ord': { name: 'Chicago (ORD)', countryCode: 'US', lat: 41.9742, lng: -87.9073 },
  'sfo': { name: 'San Francisco (SFO)', countryCode: 'US', lat: 37.6213, lng: -122.3790 },
  'las': { name: 'Las Vegas (LAS)', countryCode: 'US', lat: 36.0840, lng: -115.1537 },
  'mia': { name: 'Miami (MIA)', countryCode: 'US', lat: 25.7953, lng: -80.2901 },
  'sea': { name: 'Seattle (SEA)', countryCode: 'US', lat: 47.4502, lng: -122.3088 },
  
  // India
  'mumbai': { name: 'Mumbai', countryCode: 'IN', lat: 19.0760, lng: 72.8777 },
  'delhi': { name: 'Delhi', countryCode: 'IN', lat: 28.7041, lng: 77.1025 },
  'new delhi': { name: 'Delhi', countryCode: 'IN', lat: 28.7041, lng: 77.1025 },
  'bangalore': { name: 'Bangalore', countryCode: 'IN', lat: 12.9716, lng: 77.5946 },
  'kolkata': { name: 'Kolkata', countryCode: 'IN', lat: 22.5726, lng: 88.3639 },
  'goa': { name: 'Goa', countryCode: 'IN', lat: 15.2993, lng: 74.1240 },
  
  // Singapore
  'singapore': { name: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198 },
  'sin': { name: 'Singapore (SIN)', countryCode: 'SG', lat: 1.3644, lng: 103.9915 },
  
  // Malaysia
  'kuala lumpur': { name: 'Kuala Lumpur', countryCode: 'MY', lat: 3.1390, lng: 101.6869 },
  'penang': { name: 'Penang', countryCode: 'MY', lat: 5.4164, lng: 100.3327 },
  'kul': { name: 'Kuala Lumpur (KUL)', countryCode: 'MY', lat: 2.7456, lng: 101.7072 },
  'pen': { name: 'Penang (PEN)', countryCode: 'MY', lat: 5.2971, lng: 100.2770 },
  
  // Philippines
  'manila': { name: 'Manila', countryCode: 'PH', lat: 14.5995, lng: 120.9842 },
  'cebu': { name: 'Cebu', countryCode: 'PH', lat: 10.3157, lng: 123.8854 },
  
  // Indonesia
  'jakarta': { name: 'Jakarta', countryCode: 'ID', lat: -6.2088, lng: 106.8456 },
  'bali': { name: 'Bali', countryCode: 'ID', lat: -8.3405, lng: 115.0920 },
  'denpasar': { name: 'Bali', countryCode: 'ID', lat: -8.3405, lng: 115.0920 },
  
  // China
  'beijing': { name: 'Beijing', countryCode: 'CN', lat: 39.9042, lng: 116.4074 },
  'shanghai': { name: 'Shanghai', countryCode: 'CN', lat: 31.2304, lng: 121.4737 },
  'hong kong': { name: 'Hong Kong', countryCode: 'HK', lat: 22.3193, lng: 114.1694 },
  
  // Europe
  'london': { name: 'London', countryCode: 'GB', lat: 51.5074, lng: -0.1278 },
  'paris': { name: 'Paris', countryCode: 'FR', lat: 48.8566, lng: 2.3522 },
  'berlin': { name: 'Berlin', countryCode: 'DE', lat: 52.5200, lng: 13.4050 },
  'rome': { name: 'Rome', countryCode: 'IT', lat: 41.9028, lng: 12.4964 },
  'madrid': { name: 'Madrid', countryCode: 'ES', lat: 40.4168, lng: -3.7038 },
  'amsterdam': { name: 'Amsterdam', countryCode: 'NL', lat: 52.3676, lng: 4.9041 },
  'barcelona': { name: 'Barcelona', countryCode: 'ES', lat: 41.3851, lng: 2.1734 },
  'prague': { name: 'Prague', countryCode: 'CZ', lat: 50.0755, lng: 14.4378 },
  'vienna': { name: 'Vienna', countryCode: 'AT', lat: 48.2082, lng: 16.3738 },
  'budapest': { name: 'Budapest', countryCode: 'HU', lat: 47.4979, lng: 19.0402 },
  
  // Europe Airports
  'lhr': { name: 'London (LHR)', countryCode: 'GB', lat: 51.4700, lng: -0.4543 },
  'lgw': { name: 'London (LGW)', countryCode: 'GB', lat: 51.1537, lng: -0.1821 },
  'cdg': { name: 'Paris (CDG)', countryCode: 'FR', lat: 49.0097, lng: 2.5479 },
  'ber': { name: 'Berlin (BER)', countryCode: 'DE', lat: 52.3667, lng: 13.5033 },
  'fco': { name: 'Rome (FCO)', countryCode: 'IT', lat: 41.8003, lng: 12.2389 },
  'mad': { name: 'Madrid (MAD)', countryCode: 'ES', lat: 40.4719, lng: -3.5626 },
  'ams': { name: 'Amsterdam (AMS)', countryCode: 'NL', lat: 52.3105, lng: 4.7683 },
  
  // Australia & Oceania
  'sydney': { name: 'Sydney', countryCode: 'AU', lat: -33.8688, lng: 151.2093 },
  'melbourne': { name: 'Melbourne', countryCode: 'AU', lat: -37.8136, lng: 144.9631 },
  'brisbane': { name: 'Brisbane', countryCode: 'AU', lat: -27.4698, lng: 153.0251 },
  'perth': { name: 'Perth', countryCode: 'AU', lat: -31.9505, lng: 115.8605 },
  
  // Middle East
  'dubai': { name: 'Dubai', countryCode: 'AE', lat: 25.2048, lng: 55.2708 },
  'istanbul': { name: 'Istanbul', countryCode: 'TR', lat: 41.0082, lng: 28.9784 },
  'tel aviv': { name: 'Tel Aviv', countryCode: 'IL', lat: 32.0853, lng: 34.7818 },
  
  // South America
  'rio de janeiro': { name: 'Rio de Janeiro', countryCode: 'BR', lat: -22.9068, lng: -43.1729 },
  'sao paulo': { name: 'São Paulo', countryCode: 'BR', lat: -23.5505, lng: -46.6333 },
  'buenos aires': { name: 'Buenos Aires', countryCode: 'AR', lat: -34.6118, lng: -58.3960 },
  
  // Canada
  'toronto': { name: 'Toronto', countryCode: 'CA', lat: 43.6532, lng: -79.3832 },
  'vancouver': { name: 'Vancouver', countryCode: 'CA', lat: 49.2827, lng: -123.1207 },
  'montreal': { name: 'Montreal', countryCode: 'CA', lat: 45.5017, lng: -73.5673 },
  
  // Mexico
  'mexico city': { name: 'Mexico City', countryCode: 'MX', lat: 19.4326, lng: -99.1332 },
  'cancun': { name: 'Cancun', countryCode: 'MX', lat: 21.1619, lng: -86.8515 },
}

// Function to find city coordinates by name (case-insensitive)
export const getCityCoordinates = (cityName: string): CityCoordinates | null => {
  const normalizedName = cityName.toLowerCase().trim()
  return cityCoordinates[normalizedName] || null
}

// Function to get all visited cities with coordinates from stays data
export const getVisitedCitiesWithCoordinates = (stays: any[]): CityCoordinates[] => {
  const visitedCities = new Set<string>()
  const citiesWithCoords: CityCoordinates[] = []
  
  stays.forEach(stay => {
    if (stay.city && stay.city.trim()) {
      const cityKey = stay.city.toLowerCase().trim()
      if (!visitedCities.has(cityKey)) {
        visitedCities.add(cityKey)
        const coords = getCityCoordinates(stay.city)
        if (coords) {
          citiesWithCoords.push(coords)
        }
      }
    }
  })
  
  return citiesWithCoords
}