'use client'

import { useState, useEffect } from 'react'
import { CityCoordinates } from '@/lib/city-coordinates'

interface GeoWorldMapProps {
  visitedCountries: string[]
  visitedCities?: CityCoordinates[]
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

export default function GeoWorldMap({ visitedCountries, visitedCities = [], onCountryClick }: GeoWorldMapProps) {
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Map viewport and zoom state
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 900, height: 450 })
  const [scale, setScale] = useState(1)
  
  // Mouse interaction state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastViewBox, setLastViewBox] = useState({ x: 0, y: 0 })
  const [hasDragged, setHasDragged] = useState(false)

  // Constants
  const MIN_SCALE = 1
  const MAX_SCALE = 10
  const ZOOM_FACTOR = 1.5
  const PAN_DISTANCE = 50

  // Zoom functions
  const zoomIn = (centerX?: number, centerY?: number) => {
    if (scale >= MAX_SCALE) return
    
    const newScale = Math.min(scale * ZOOM_FACTOR, MAX_SCALE)
    const scaleFactor = newScale / scale
    
    // Default to center if no coordinates provided
    const zoomCenterX = centerX ?? viewBox.x + viewBox.width / 2
    const zoomCenterY = centerY ?? viewBox.y + viewBox.height / 2
    
    // Calculate new viewBox to zoom toward the center point
    const newWidth = viewBox.width / scaleFactor
    const newHeight = viewBox.height / scaleFactor
    const newX = zoomCenterX - (zoomCenterX - viewBox.x) / scaleFactor
    const newY = zoomCenterY - (zoomCenterY - viewBox.y) / scaleFactor
    
    setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight })
    setScale(newScale)
  }

  const zoomOut = () => {
    if (scale <= MIN_SCALE) return
    
    const newScale = Math.max(scale / ZOOM_FACTOR, MIN_SCALE)
    const scaleFactor = newScale / scale
    
    // Calculate new viewBox
    const newWidth = viewBox.width / scaleFactor
    const newHeight = viewBox.height / scaleFactor
    const newX = viewBox.x - (newWidth - viewBox.width) / 2
    const newY = viewBox.y - (newHeight - viewBox.height) / 2
    
    // Constrain to bounds
    const constrainedViewBox = constrainViewBox(newX, newY, newWidth, newHeight)
    setViewBox(constrainedViewBox)
    setScale(newScale)
  }

  const resetView = () => {
    setViewBox({ x: 0, y: 0, width: 900, height: 450 })
    setScale(1)
  }

  const pan = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (scale <= 1) return // No panning at default zoom
    
    let newX = viewBox.x
    let newY = viewBox.y
    const panAmount = PAN_DISTANCE / scale
    
    switch (direction) {
      case 'up':
        newY = Math.max(0, viewBox.y - panAmount)
        break
      case 'down':
        newY = Math.min(450 - viewBox.height, viewBox.y + panAmount)
        break
      case 'left':
        newX = Math.max(0, viewBox.x - panAmount)
        break
      case 'right':
        newX = Math.min(900 - viewBox.width, viewBox.x + panAmount)
        break
    }
    
    setViewBox({ ...viewBox, x: newX, y: newY })
  }

  // Constrain viewBox to valid bounds
  const constrainViewBox = (x: number, y: number, width: number, height: number) => {
    // Don't allow viewBox to go outside the SVG bounds
    const constrainedX = Math.max(0, Math.min(x, 900 - width))
    const constrainedY = Math.max(0, Math.min(y, 450 - height))
    
    return { 
      x: constrainedX, 
      y: constrainedY, 
      width: Math.min(width, 900), 
      height: Math.min(height, 450) 
    }
  }

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (scale <= 1) return // No dragging at default zoom
    
    setIsDragging(true)
    setHasDragged(false) // Reset drag flag
    setDragStart({ x: e.clientX, y: e.clientY })
    setLastViewBox({ x: viewBox.x, y: viewBox.y })
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleFactorX = viewBox.width / rect.width
    const scaleFactorY = viewBox.height / rect.height
    
    const deltaX = (dragStart.x - e.clientX) * scaleFactorX
    const deltaY = (dragStart.y - e.clientY) * scaleFactorY
    
    // Check if mouse moved more than 5 pixels to consider it a drag
    if (Math.abs(dragStart.x - e.clientX) > 5 || Math.abs(dragStart.y - e.clientY) > 5) {
      setHasDragged(true)
    }
    
    const newX = lastViewBox.x + deltaX
    const newY = lastViewBox.y + deltaY
    
    const constrainedViewBox = constrainViewBox(newX, newY, viewBox.width, viewBox.height)
    setViewBox(constrainedViewBox)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    // hasDragged will be checked by country click handler
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setHasDragged(false)
  }

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Convert mouse position to SVG coordinates
    const svgX = viewBox.x + (mouseX / rect.width) * viewBox.width
    const svgY = viewBox.y + (mouseY / rect.height) * viewBox.height
    
    if (e.deltaY < 0) {
      zoomIn(svgX, svgY)
    } else {
      zoomOut()
    }
  }

  useEffect(() => {
    // Load GeoJSON data
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

  // Coordinate projection functions
  const projectCoordinate = (lng: number, lat: number): [number, number] => {
    const width = 900
    const height = 450
    
    // Simple equirectangular projection
    const x = ((lng + 180) / 360) * width
    const minLat = -85
    const maxLat = 85
    const clampedLat = Math.max(minLat, Math.min(maxLat, lat))
    const y = ((maxLat - clampedLat) / (maxLat - minLat)) * height
    
    return [x, y]
  }

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
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className={`w-full h-full border border-blue-200 rounded bg-gradient-to-b from-blue-50 to-white ${
            scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
          }`}
          style={{ 
            minHeight: '450px',
            maxHeight: '80vh'
          }}
          preserveAspectRatio="xMidYMid meet"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          {/* Background ocean */}
          <rect x="0" y="0" width="900" height="450" fill="#e0f4ff" />
          
          {/* Grid lines (optional) */}
          <g stroke="#d1d5db" strokeWidth="0.5" opacity="0.3">
            {[-120, -60, 0, 60, 120].map(lng => {
              const [x] = projectCoordinate(lng, 0)
              return <line key={lng} x1={x} y1="0" x2={x} y2="450" />
            })}
            {[-60, -30, 0, 30, 60].map(lat => {
              const [, y] = projectCoordinate(0, lat)
              return <line key={lat} x1="0" y1={y} x2="900" y2={y} />
            })}
          </g>

          {/* Countries */}
          {geoData.features.map((feature, index) => {
            const geoJsonId = feature.id?.toString() || `country-${index}`
            const dinoCountryCode = getDinoCountryCode(geoJsonId)
            const isVisited = dinoCountryCode && visitedCountries.includes(dinoCountryCode)
            const isHovered = hoveredCountry === geoJsonId
            
            const pathData = coordinatesToPath(feature.geometry)
            if (!pathData) return null

            return (
              <path
                key={geoJsonId}
                d={pathData}
                fill={isVisited ? '#3b82f6' : '#f3f4f6'}
                stroke={isVisited ? '#1d4ed8' : '#d1d5db'}
                strokeWidth={isHovered ? 2 / scale : 1 / scale}
                className={`transition-all duration-200 ${
                  isHovered ? 'brightness-110' : ''
                } ${isVisited ? 'drop-shadow-sm' : ''}`}
                onMouseEnter={() => setHoveredCountry(geoJsonId)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => {
                  // Only trigger click if we didn't drag
                  if (dinoCountryCode && !hasDragged) {
                    onCountryClick?.(dinoCountryCode)
                  }
                  setHasDragged(false) // Reset for next interaction
                }}
                style={{ cursor: dinoCountryCode ? 'pointer' : 'default' }}
              />
            )
          })}

          {/* City pins */}
          {visitedCities.map((city, index) => {
            const [x, y] = projectCoordinate(city.lng, city.lat)
            
            return (
              <text
                key={`${city.name}-${index}`}
                x={x}
                y={y}
                fontSize={16 / scale}
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none"
                style={{ cursor: 'default' }}
              >
                📍
              </text>
            )
          })}
        </svg>

        {/* Tooltip */}
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

        {/* Map Controls */}
        <div className="absolute top-2 right-2 flex flex-col space-y-1">
          {/* Zoom Controls */}
          <div className="bg-white/90 backdrop-blur-sm rounded-md shadow-lg border border-gray-200/50 p-0.5 flex flex-col">
            <button
              onClick={() => zoomIn()}
              disabled={scale >= MAX_SCALE}
              className="w-6 h-6 flex items-center justify-center hover:bg-blue-50 rounded text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" />
              </svg>
            </button>
            <button
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              className="w-6 h-6 flex items-center justify-center hover:bg-blue-50 rounded text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 12H6" />
              </svg>
            </button>
          </div>

          {/* Pan Controls */}
          <div className="bg-white/90 backdrop-blur-sm rounded-md shadow-lg border border-gray-200/50 p-0.5">
            <div className="grid grid-cols-3 gap-0.5">
              <div></div>
              <button
                onClick={() => pan('up')}
                disabled={scale <= 1}
                className="w-6 h-6 flex items-center justify-center hover:bg-blue-50 rounded text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Pan Up"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <div></div>
              
              <button
                onClick={() => pan('left')}
                disabled={scale <= 1}
                className="w-6 h-6 flex items-center justify-center hover:bg-blue-50 rounded text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Pan Left"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={resetView}
                className="w-6 h-6 flex items-center justify-center hover:bg-blue-50 rounded text-gray-600 hover:text-blue-600 transition-colors"
                title="Reset View"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </button>
              <button
                onClick={() => pan('right')}
                disabled={scale <= 1}
                className="w-6 h-6 flex items-center justify-center hover:bg-blue-50 rounded text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Pan Right"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div></div>
              <button
                onClick={() => pan('down')}
                disabled={scale <= 1}
                className="w-6 h-6 flex items-center justify-center hover:bg-blue-50 rounded text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Pan Down"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div></div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded border border-blue-600"></div>
            <span className="text-gray-700">Visited Countries</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
            <span className="text-gray-700">Not Visited</span>
          </div>
          {visitedCities.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-base">📍</span>
              <span className="text-gray-700">Visited Cities</span>
            </div>
          )}
          <div className="text-xs text-gray-500">
            {visitedCountries.length} countries • {visitedCities.length} cities
          </div>
        </div>
      </div>
    </div>
  )
}