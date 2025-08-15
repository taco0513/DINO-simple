import { countries } from './countries'

// Country color mapping for calendar visualization
export function getCountryColor(countryCode: string, isFuture: boolean = false): string {
  const country = countries.find(c => c.code === countryCode)
  const baseColor = country?.color || 'slate'
  
  // Different intensities for past vs future travels
  const intensity = isFuture ? '400' : '600'
  
  // Map color names to Tailwind classes
  const colorMap: Record<string, string> = {
    red: `bg-red-${intensity}`,
    blue: `bg-blue-${intensity}`,
    green: `bg-green-${intensity}`,
    yellow: `bg-yellow-${intensity}`,
    purple: `bg-purple-${intensity}`,
    pink: `bg-pink-${intensity}`,
    indigo: `bg-indigo-${intensity}`,
    emerald: `bg-emerald-${intensity}`,
    orange: `bg-orange-${intensity}`,
    sky: `bg-sky-${intensity}`,
    teal: `bg-teal-${intensity}`,
    gray: `bg-gray-${intensity}`,
    slate: `bg-slate-${intensity}`,
    zinc: `bg-zinc-${intensity}`,
    stone: `bg-stone-${intensity}`,
    amber: `bg-amber-${intensity}`,
    lime: `bg-lime-${intensity}`,
    cyan: `bg-cyan-${intensity}`,
    violet: `bg-violet-${intensity}`,
    fuchsia: `bg-fuchsia-${intensity}`,
    rose: `bg-rose-${intensity}`,
  }
  
  return colorMap[baseColor] || `bg-slate-${intensity}`
}

// Get unique visited countries from stays
export function getVisitedCountries(stays: any[]): { code: string; name: string; color: string; flag: string }[] {
  const uniqueCountries = new Map()
  
  stays.forEach(stay => {
    if (!uniqueCountries.has(stay.countryCode)) {
      const country = countries.find(c => c.code === stay.countryCode)
      if (country) {
        uniqueCountries.set(stay.countryCode, {
          code: country.code,
          name: country.name,
          color: country.color,
          flag: country.flag
        })
      }
    }
  })
  
  // Sort by country name
  return Array.from(uniqueCountries.values()).sort((a, b) => a.name.localeCompare(b.name))
}

// Get country display name with flag
export function getCountryDisplay(countryCode: string): string {
  const country = countries.find(c => c.code === countryCode)
  return country ? `${country.flag} ${country.name}` : countryCode
}

// Check if device is mobile (for touch-friendly sizing)
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768 // md breakpoint
}