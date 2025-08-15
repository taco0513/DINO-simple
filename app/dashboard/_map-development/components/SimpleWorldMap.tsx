'use client'

import { useState } from 'react'

interface SimpleWorldMapProps {
  visitedCountries: string[]
  onCountryClick?: (countryCode: string) => void
}

// 주요 국가들의 대략적인 위치와 크기 (간소화된 버전)
const countryShapes = {
  // 아시아
  'CN': { x: 700, y: 180, width: 120, height: 80, name: 'China' },
  'JP': { x: 820, y: 160, width: 40, height: 60, name: 'Japan' },
  'KR': { x: 800, y: 170, width: 20, height: 30, name: 'South Korea' },
  'IN': { x: 650, y: 220, width: 80, height: 70, name: 'India' },
  'TH': { x: 700, y: 250, width: 30, height: 50, name: 'Thailand' },
  'VN': { x: 720, y: 240, width: 25, height: 60, name: 'Vietnam' },
  'MY': { x: 700, y: 280, width: 40, height: 20, name: 'Malaysia' },
  'SG': { x: 705, y: 300, width: 8, height: 8, name: 'Singapore' },
  'ID': { x: 720, y: 300, width: 80, height: 40, name: 'Indonesia' },
  'PH': { x: 780, y: 260, width: 30, height: 50, name: 'Philippines' },
  
  // 유럽
  'GB': { x: 450, y: 120, width: 25, height: 35, name: 'United Kingdom' },
  'FR': { x: 480, y: 130, width: 30, height: 35, name: 'France' },
  'DE': { x: 500, y: 120, width: 25, height: 30, name: 'Germany' },
  'IT': { x: 510, y: 150, width: 20, height: 40, name: 'Italy' },
  'ES': { x: 450, y: 160, width: 35, height: 30, name: 'Spain' },
  'NL': { x: 485, y: 115, width: 15, height: 15, name: 'Netherlands' },
  'CH': { x: 495, y: 140, width: 12, height: 12, name: 'Switzerland' },
  'AT': { x: 510, y: 135, width: 15, height: 12, name: 'Austria' },
  'BE': { x: 485, y: 125, width: 12, height: 12, name: 'Belgium' },
  'SE': { x: 520, y: 90, width: 20, height: 40, name: 'Sweden' },
  'NO': { x: 505, y: 80, width: 25, height: 50, name: 'Norway' },
  'FI': { x: 540, y: 90, width: 25, height: 35, name: 'Finland' },
  'DK': { x: 500, y: 110, width: 12, height: 12, name: 'Denmark' },
  
  // 북미
  'US': { x: 200, y: 150, width: 150, height: 80, name: 'United States' },
  'CA': { x: 180, y: 100, width: 180, height: 60, name: 'Canada' },
  'MX': { x: 220, y: 220, width: 80, height: 60, name: 'Mexico' },
  
  // 남미
  'BR': { x: 350, y: 300, width: 80, height: 100, name: 'Brazil' },
  'AR': { x: 330, y: 380, width: 50, height: 80, name: 'Argentina' },
  'CL': { x: 320, y: 350, width: 15, height: 120, name: 'Chile' },
  'PE': { x: 300, y: 320, width: 40, height: 60, name: 'Peru' },
  'CO': { x: 290, y: 280, width: 40, height: 50, name: 'Colombia' },
  
  // 아프리카
  'EG': { x: 540, y: 200, width: 30, height: 40, name: 'Egypt' },
  'ZA': { x: 540, y: 380, width: 40, height: 50, name: 'South Africa' },
  'MA': { x: 450, y: 200, width: 30, height: 30, name: 'Morocco' },
  
  // 오세아니아
  'AU': { x: 780, y: 380, width: 80, height: 50, name: 'Australia' },
  'NZ': { x: 850, y: 420, width: 25, height: 35, name: 'New Zealand' },
  
  // 중동
  'AE': { x: 610, y: 230, width: 20, height: 15, name: 'UAE' },
  'TR': { x: 540, y: 180, width: 40, height: 25, name: 'Turkey' },
  'IL': { x: 560, y: 210, width: 8, height: 12, name: 'Israel' },
}

export default function SimpleWorldMap({ visitedCountries, onCountryClick }: SimpleWorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  return (
    <div className="w-full bg-blue-50 rounded-lg p-4 overflow-x-auto">
      <div className="relative min-w-[900px] mx-auto">
        <svg
          viewBox="0 0 900 500"
          className="w-full h-auto border border-blue-200 rounded bg-gradient-to-b from-blue-100 to-blue-50"
          style={{ minHeight: '400px' }}
        >
          {/* 대륙 배경 */}
          <g opacity="0.3">
            {/* 아시아 배경 */}
            <ellipse cx="720" cy="220" rx="140" ry="120" fill="#e6f3ff" />
            {/* 유럽 배경 */}
            <ellipse cx="500" cy="140" rx="80" ry="60" fill="#e6f3ff" />
            {/* 북미 배경 */}
            <ellipse cx="260" cy="160" rx="120" ry="80" fill="#e6f3ff" />
            {/* 남미 배경 */}
            <ellipse cx="340" cy="360" rx="60" ry="100" fill="#e6f3ff" />
            {/* 아프리카 배경 */}
            <ellipse cx="520" cy="280" rx="50" ry="120" fill="#e6f3ff" />
            {/* 오세아니아 배경 */}
            <ellipse cx="820" cy="400" rx="70" ry="40" fill="#e6f3ff" />
          </g>

          {/* 국가들 */}
          {Object.entries(countryShapes).map(([code, shape]) => {
            const isVisited = visitedCountries.includes(code)
            const isHovered = hoveredCountry === code
            
            return (
              <rect
                key={code}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={2}
                fill={isVisited ? '#3b82f6' : '#d1d5db'}
                stroke={isVisited ? '#1d4ed8' : '#9ca3af'}
                strokeWidth={isHovered ? 2 : 1}
                className={`cursor-pointer transition-all duration-200 ${
                  isHovered ? 'brightness-110' : ''
                }`}
                onMouseEnter={() => setHoveredCountry(code)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => onCountryClick?.(code)}
              />
            )
          })}

          {/* 대륙 라벨 */}
          <g className="text-xs fill-gray-600 font-medium">
            <text x="720" y="150" textAnchor="middle">Asia</text>
            <text x="500" y="100" textAnchor="middle">Europe</text>
            <text x="260" y="120" textAnchor="middle">North America</text>
            <text x="340" y="480" textAnchor="middle">South America</text>
            <text x="520" y="200" textAnchor="middle">Africa</text>
            <text x="820" y="470" textAnchor="middle">Oceania</text>
          </g>
        </svg>

        {/* 툴팁 */}
        {hoveredCountry && (
          <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg border z-10">
            <p className="font-semibold text-sm">
              {countryShapes[hoveredCountry as keyof typeof countryShapes].name}
            </p>
            <p className="text-xs text-gray-600">
              {visitedCountries.includes(hoveredCountry) ? '✅ Visited' : '⭕ Not visited'}
            </p>
          </div>
        )}

        {/* 범례 */}
        <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Visited Countries</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span>Not Visited</span>
          </div>
        </div>
      </div>
    </div>
  )
}