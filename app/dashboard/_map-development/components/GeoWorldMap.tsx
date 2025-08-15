'use client'

import { useState, useEffect } from 'react'

interface GeoWorldMapProps {
  visitedCountries: string[]
  onCountryClick?: (countryCode: string) => void
}

interface CountryFeature {
  type: 'Feature'
  properties: {
    name: string
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
  id?: string
}

interface GeoJSONData {
  type: 'FeatureCollection'
  features: CountryFeature[]
}

// GeoJSON ID (ISO 3166-1 alpha-3)를 DINO country code (ISO 3166-1 alpha-2)로 매핑하는 함수
const getDinoCountryCode = (geoJsonId: string): string | null => {
  // ISO 3166-1 alpha-3 → alpha-2 매핑 테이블
  const mapping: Record<string, string> = {
    // Africa
    'DZA': 'DZ', 'AGO': 'AO', 'BEN': 'BJ', 'BWA': 'BW', 'BFA': 'BF', 'BDI': 'BI',
    'CMR': 'CM', 'CPV': 'CV', 'CAF': 'CF', 'TCD': 'TD', 'COM': 'KM', 'COG': 'CG',
    'COD': 'CD', 'CIV': 'CI', 'DJI': 'DJ', 'EGY': 'EG', 'GNQ': 'GQ', 'ERI': 'ER',
    'SWZ': 'SZ', 'ETH': 'ET', 'GAB': 'GA', 'GMB': 'GM', 'GHA': 'GH', 'GIN': 'GN',
    'GNB': 'GW', 'KEN': 'KE', 'LSO': 'LS', 'LBR': 'LR', 'LBY': 'LY', 'MDG': 'MG',
    'MWI': 'MW', 'MLI': 'ML', 'MRT': 'MR', 'MUS': 'MU', 'MAR': 'MA', 'MOZ': 'MZ',
    'NAM': 'NA', 'NER': 'NE', 'NGA': 'NG', 'RWA': 'RW', 'STP': 'ST', 'SEN': 'SN',
    'SYC': 'SC', 'SLE': 'SL', 'SOM': 'SO', 'ZAF': 'ZA', 'SSD': 'SS', 'SDN': 'SD',
    'TZA': 'TZ', 'TGO': 'TG', 'TUN': 'TN', 'UGA': 'UG', 'ZMB': 'ZM', 'ZWE': 'ZW',
    
    // Americas
    'ATG': 'AG', 'ARG': 'AR', 'BHS': 'BS', 'BRB': 'BB', 'BLZ': 'BZ', 'BOL': 'BO',
    'BRA': 'BR', 'CAN': 'CA', 'CHL': 'CL', 'COL': 'CO', 'CRI': 'CR', 'CUB': 'CU',
    'DMA': 'DM', 'DOM': 'DO', 'ECU': 'EC', 'SLV': 'SV', 'GRD': 'GD', 'GTM': 'GT',
    'GUY': 'GY', 'HTI': 'HT', 'HND': 'HN', 'JAM': 'JM', 'MEX': 'MX', 'NIC': 'NI',
    'PAN': 'PA', 'PRY': 'PY', 'PER': 'PE', 'KNA': 'KN', 'LCA': 'LC', 'VCT': 'VC',
    'SUR': 'SR', 'TTO': 'TT', 'USA': 'US', 'URY': 'UY', 'VEN': 'VE',
    
    // Asia
    'AFG': 'AF', 'ARM': 'AM', 'AZE': 'AZ', 'BHR': 'BH', 'BGD': 'BD', 'BTN': 'BT',
    'BRN': 'BN', 'KHM': 'KH', 'CHN': 'CN', 'GEO': 'GE', 'HKG': 'HK', 'IND': 'IN',
    'IDN': 'ID', 'IRN': 'IR', 'IRQ': 'IQ', 'ISR': 'IL', 'JPN': 'JP', 'JOR': 'JO',
    'KAZ': 'KZ', 'PRK': 'KP', 'KOR': 'KR', 'KWT': 'KW', 'KGZ': 'KG', 'LAO': 'LA',
    'LBN': 'LB', 'MAC': 'MO', 'MYS': 'MY', 'MDV': 'MV', 'MNG': 'MN', 'MMR': 'MM',
    'NPL': 'NP', 'OMN': 'OM', 'PAK': 'PK', 'PSE': 'PS', 'PHL': 'PH', 'QAT': 'QA',
    'SAU': 'SA', 'SGP': 'SG', 'LKA': 'LK', 'SYR': 'SY', 'TWN': 'TW', 'TJK': 'TJ',
    'THA': 'TH', 'TLS': 'TL', 'TUR': 'TR', 'TKM': 'TM', 'ARE': 'AE', 'UZB': 'UZ',
    'VNM': 'VN', 'YEM': 'YE',
    
    // Europe
    'ALB': 'AL', 'AND': 'AD', 'AUT': 'AT', 'BLR': 'BY', 'BEL': 'BE', 'BIH': 'BA',
    'BGR': 'BG', 'HRV': 'HR', 'CYP': 'CY', 'CZE': 'CZ', 'DNK': 'DK', 'EST': 'EE',
    'FIN': 'FI', 'FRA': 'FR', 'DEU': 'DE', 'GRC': 'GR', 'HUN': 'HU', 'ISL': 'IS',
    'IRL': 'IE', 'ITA': 'IT', 'XKX': 'XK', 'LVA': 'LV', 'LIE': 'LI', 'LTU': 'LT',
    'LUX': 'LU', 'MLT': 'MT', 'MDA': 'MD', 'MCO': 'MC', 'MNE': 'ME', 'NLD': 'NL',
    'MKD': 'MK', 'NOR': 'NO', 'POL': 'PL', 'PRT': 'PT', 'ROU': 'RO', 'RUS': 'RU',
    'SMR': 'SM', 'SRB': 'RS', 'SVK': 'SK', 'SVN': 'SI', 'ESP': 'ES', 'SWE': 'SE',
    'CHE': 'CH', 'UKR': 'UA', 'GBR': 'GB', 'VAT': 'VA',
    
    // Oceania
    'AUS': 'AU', 'FJI': 'FJ', 'KIR': 'KI', 'MHL': 'MH', 'FSM': 'FM', 'NRU': 'NR',
    'NZL': 'NZ', 'PLW': 'PW', 'PNG': 'PG', 'WSM': 'WS', 'SLB': 'SB', 'TON': 'TO',
    'TUV': 'TV', 'VUT': 'VU'
  }
  
  return mapping[geoJsonId] || null
}

export default function GeoWorldMap({ visitedCountries, onCountryClick }: GeoWorldMapProps) {
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // GeoJSON 데이터 로드
    fetch('/world-countries.geojson')
      .then(response => response.json())
      .then((data: GeoJSONData) => {
        setGeoData(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load map data:', error)
        setLoading(false)
      })
  }, [])

  // 좌표를 SVG 화면 좌표로 변환하는 함수 (전체 세계지도 범위)
  const projectCoordinate = (lng: number, lat: number): [number, number] => {
    const width = 900
    const height = 450
    
    // 경도는 선형 변환
    const x = ((lng + 180) / 360) * width
    
    // 위도는 -90도 ~ +90도 전체 범위 사용 (약간의 패딩 추가)
    // 위도 범위를 넓혀서 모든 대륙이 보이도록
    const minLat = -85  // 남극 포함
    const maxLat = 85   // 북극 포함  
    const clampedLat = Math.max(minLat, Math.min(maxLat, lat))
    const y = ((maxLat - clampedLat) / (maxLat - minLat)) * height
    
    return [x, Math.max(0, Math.min(height, y))]
  }

  // GeoJSON 좌표를 SVG path로 변환 (Polygon과 MultiPolygon 모두 지원)
  const coordinatesToPath = (geometry: CountryFeature['geometry']): string => {
    const processCoordinates = (coords: number[][][]): string => {
      return coords.map(ring => {
        const pathData = ring.map((coord, index) => {
          const [x, y] = projectCoordinate(coord[0], coord[1])
          return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
        }).join(' ')
        return pathData + ' Z'
      }).join(' ')
    }

    if (geometry.type === 'Polygon') {
      return processCoordinates(geometry.coordinates as number[][][])
    } else if (geometry.type === 'MultiPolygon') {
      const multiCoords = geometry.coordinates as number[][][][]
      return multiCoords.map(polygon => processCoordinates(polygon)).join(' ')
    }
    return ''
  }

  if (loading) {
    return (
      <div className="w-full h-96 bg-blue-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading world map...</p>
        </div>
      </div>
    )
  }

  if (!geoData) {
    return (
      <div className="w-full h-96 bg-red-50 rounded-lg flex items-center justify-center">
        <p className="text-red-600">Failed to load map data</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg p-4">
      <div className="relative w-full h-full">
        <svg
          viewBox="0 0 900 450"
          className="w-full h-full border border-blue-200 rounded bg-gradient-to-b from-blue-50 to-white"
          style={{ 
            minHeight: '350px',
            maxHeight: '70vh'
          }}
          preserveAspectRatio="xMidYMid slice"
        >
          {/* 배경 바다 */}
          <rect width="900" height="450" fill="#e0f4ff" />
          
          {/* 위도/경도 격자 (옵션) */}
          <g stroke="#d1d5db" strokeWidth="0.5" opacity="0.3">
            {/* 경도선 */}
            {[-120, -60, 0, 60, 120].map(lng => {
              const [x] = projectCoordinate(lng, 0)
              return <line key={lng} x1={x} y1="0" x2={x} y2="450" />
            })}
            {/* 위도선 */}
            {[-60, -30, 0, 30, 60].map(lat => {
              const [, y] = projectCoordinate(0, lat)
              return <line key={lat} x1="0" y1={y} x2="900" y2={y} />
            })}
          </g>

          {/* 국가들 */}
          {geoData.features.map((feature, index) => {
            // GeoJSON ID (ISO alpha-3)를 사용하여 정확한 매핑
            const geoJsonId = feature.id?.toString() || `country-${index}`
            const countryName = feature.properties.name
            
            // DINO의 country code와 매칭을 위해 ID 기반 매핑 사용
            const dinoCountryCode = getDinoCountryCode(geoJsonId)
            const isVisited = dinoCountryCode && visitedCountries.includes(dinoCountryCode)
            const isHovered = hoveredCountry === geoJsonId
            
            const pathData = coordinatesToPath(feature.geometry)
            
            // pathData가 빈 문자열이면 렌더링하지 않음
            if (!pathData) return null

            return (
              <path
                key={geoJsonId}
                d={pathData}
                fill={isVisited ? '#3b82f6' : '#f3f4f6'}
                stroke={isVisited ? '#1d4ed8' : '#d1d5db'}
                strokeWidth={isHovered ? 2 : 1}
                className={`cursor-pointer transition-all duration-200 ${
                  isHovered ? 'brightness-110' : ''
                } ${isVisited ? 'drop-shadow-sm' : ''}`}
                onMouseEnter={() => setHoveredCountry(geoJsonId)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => dinoCountryCode && onCountryClick?.(dinoCountryCode)}
              />
            )
          })}
        </svg>

        {/* 툴팁 */}
        {hoveredCountry && (() => {
          const hoveredFeature = geoData.features.find(f => f.id?.toString() === hoveredCountry)
          const dinoCode = hoveredFeature ? getDinoCountryCode(hoveredCountry) : null
          const isVisited = dinoCode && visitedCountries.includes(dinoCode)
          
          return (
            <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg border z-10">
              <p className="font-semibold text-sm">
                {hoveredFeature?.properties.name}
              </p>
              <p className="text-xs text-gray-600">
                {isVisited ? '✅ Visited' : '⭕ Not visited yet'}
              </p>
            </div>
          )
        })()}

        {/* 범례 */}
        <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded border border-blue-600"></div>
            <span className="text-gray-700">Visited Countries</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
            <span className="text-gray-700">Not Visited</span>
          </div>
          <div className="text-xs text-gray-500">
            {visitedCountries.length} of {geoData.features.length} countries visited
          </div>
        </div>
      </div>
    </div>
  )
}