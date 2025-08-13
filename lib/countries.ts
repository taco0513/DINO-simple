import { Country } from './types'

export const countries: Country[] = [
  { code: 'AU', name: 'Australia', flag: '🇦🇺', color: 'emerald' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', color: 'green' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', color: 'red' },
  { code: 'FR', name: 'France', flag: '🇫🇷', color: 'indigo' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', color: 'amber' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', color: 'rose' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', color: 'orange' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', color: 'lime' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', color: 'teal' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', color: 'pink' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', color: 'cyan' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', color: 'emerald' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', color: 'orange' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', color: 'sky' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', color: 'blue' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', color: 'red' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', color: 'purple' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', color: 'yellow' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', color: 'violet' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', color: 'orange' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', color: 'slate' },
  { code: 'US', name: 'United States', flag: '🇺🇸', color: 'blue' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', color: 'red' },
]

export function getCountryByCode(code: string): Country | undefined {
  return countries.find(c => c.code === code)
}

// Color-blind friendly color mapping with high contrast
export function getCountryColor(countryCode: string): string {
  const country = getCountryByCode(countryCode)
  if (!country) return 'bg-gray-500'
  
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',           // Vietnam, Singapore, Canada
    orange: 'bg-orange-500',     // Thailand, Indonesia, Netherlands  
    yellow: 'bg-yellow-500',     // Spain
    amber: 'bg-amber-500',       // Germany
    lime: 'bg-lime-500',         // Ireland
    green: 'bg-green-500',       // Brazil
    emerald: 'bg-emerald-500',   // Australia, Mexico
    teal: 'bg-teal-500',         // Italy
    cyan: 'bg-cyan-500',         // Malaysia
    sky: 'bg-sky-500',           // New Zealand
    blue: 'bg-blue-500',         // Philippines, United States
    indigo: 'bg-indigo-600',     // France
    violet: 'bg-violet-500',     // Taiwan
    purple: 'bg-purple-500',     // South Korea
    pink: 'bg-pink-500',         // Japan
    rose: 'bg-rose-500',         // Hong Kong
    slate: 'bg-slate-500',       // United Kingdom
  }
  
  return colorMap[country.color] || 'bg-gray-500'
}

