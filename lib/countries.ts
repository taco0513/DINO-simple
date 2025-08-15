import { Country } from './types'

// Export the enhanced version with visa information as the default
export { countriesWithVisa as countries, countriesWithVisa } from './countries-with-visa'

// Keep the basic version for backward compatibility if needed
export const countriesBasic: Country[] = [
  // Africa
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', color: 'green' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', color: 'red' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', color: 'green' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', color: 'sky' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', color: 'green' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', color: 'red' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', color: 'green' },
  { code: 'CV', name: 'Cape Verde', flag: '🇨🇻', color: 'blue' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', color: 'blue' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩', color: 'blue' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', color: 'green' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', color: 'green' },
  { code: 'CD', name: 'Congo (DRC)', flag: '🇨🇩', color: 'blue' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', color: 'orange' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', color: 'blue' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', color: 'red' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶', color: 'green' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', color: 'green' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', color: 'blue' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', color: 'green' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', color: 'green' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', color: 'red' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', color: 'yellow' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳', color: 'red' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼', color: 'yellow' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', color: 'green' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸', color: 'blue' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', color: 'red' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾', color: 'green' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', color: 'red' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', color: 'red' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', color: 'green' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷', color: 'green' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', color: 'red' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', color: 'red' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', color: 'green' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦', color: 'blue' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', color: 'orange' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', color: 'green' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', color: 'blue' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹', color: 'green' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', color: 'green' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', color: 'blue' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', color: 'green' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', color: 'blue' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', color: 'green' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', color: 'blue' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', color: 'red' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', color: 'green' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', color: 'green' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', color: 'red' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', color: 'red' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', color: 'green' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', color: 'green' },

  // Americas
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬', color: 'red' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', color: 'sky' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸', color: 'blue' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧', color: 'blue' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿', color: 'blue' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', color: 'red' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', color: 'green' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', color: 'red' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', color: 'blue' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', color: 'yellow' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', color: 'blue' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', color: 'red' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲', color: 'green' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', color: 'blue' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', color: 'yellow' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', color: 'blue' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩', color: 'red' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', color: 'blue' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾', color: 'green' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹', color: 'blue' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', color: 'blue' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲', color: 'green' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', color: 'emerald' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', color: 'blue' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', color: 'blue' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', color: 'red' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', color: 'red' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳', color: 'green' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨', color: 'blue' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨', color: 'blue' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷', color: 'green' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', color: 'red' },
  { code: 'US', name: 'United States', flag: '🇺🇸', color: 'blue' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', color: 'blue' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', color: 'yellow' },

  // Asia
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', color: 'red' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', color: 'red' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', color: 'blue' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', color: 'red' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', color: 'green' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹', color: 'orange' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳', color: 'yellow' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', color: 'indigo' },
  { code: 'CN', name: 'China', flag: '🇨🇳', color: 'red' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', color: 'red' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', color: 'rose' },
  { code: 'IN', name: 'India', flag: '🇮🇳', color: 'orange' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', color: 'red' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', color: 'green' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', color: 'red' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', color: 'blue' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', color: 'pink' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', color: 'red' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', color: 'sky' },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵', color: 'red' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', color: 'purple' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', color: 'green' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬', color: 'red' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', color: 'blue' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', color: 'red' },
  { code: 'MO', name: 'Macao', flag: '🇲🇴', color: 'green' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', color: 'cyan' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', color: 'red' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳', color: 'blue' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', color: 'yellow' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', color: 'red' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', color: 'red' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', color: 'green' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸', color: 'red' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', color: 'blue' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', color: 'purple' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', color: 'green' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', color: 'red' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', color: 'amber' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾', color: 'red' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', color: 'violet' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯', color: 'red' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', color: 'orange' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱', color: 'red' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', color: 'red' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲', color: 'green' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', color: 'green' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', color: 'blue' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', color: 'yellow' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪', color: 'red' },

  // Europe
  { code: 'AL', name: 'Albania', flag: '🇦🇱', color: 'red' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩', color: 'blue' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', color: 'red' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾', color: 'red' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', color: 'amber' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', color: 'blue' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', color: 'green' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', color: 'blue' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', color: 'orange' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', color: 'blue' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', color: 'red' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', color: 'blue' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', color: 'blue' },
  { code: 'FR', name: 'France', flag: '🇫🇷', color: 'indigo' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', color: 'amber' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', color: 'blue' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', color: 'green' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', color: 'blue' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', color: 'lime' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', color: 'teal' },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰', color: 'blue' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', color: 'red' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', color: 'blue' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', color: 'yellow' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', color: 'sky' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', color: 'red' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩', color: 'blue' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', color: 'red' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', color: 'red' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', color: 'orange' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', color: 'red' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', color: 'red' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', color: 'red' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', color: 'green' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', color: 'blue' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', color: 'blue' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲', color: 'blue' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸', color: 'red' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', color: 'blue' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', color: 'blue' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', color: 'yellow' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', color: 'blue' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', color: 'red' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', color: 'blue' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', color: 'slate' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦', color: 'yellow' },

  // Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺', color: 'emerald' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯', color: 'sky' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮', color: 'red' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭', color: 'blue' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲', color: 'blue' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷', color: 'blue' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', color: 'sky' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼', color: 'blue' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', color: 'red' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸', color: 'red' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧', color: 'green' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴', color: 'red' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻', color: 'blue' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺', color: 'red' },
].sort((a, b) => a.name.localeCompare(b.name))

// Re-export the enhanced functions from countries-with-visa
export { getCountryByCode, getCountryColor } from './countries-with-visa'

// Keep the basic color function for backward compatibility
function getCountryByCodeBasic(code: string): Country | undefined {
  return countriesBasic.find(c => c.code === code)
}

export function getCountryColorBasic(countryCode: string): string {
  const country = getCountryByCodeBasic(countryCode)
  if (!country) return 'bg-gray-500'
  
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',           // Multiple countries
    orange: 'bg-orange-500',     // Thailand, India, Netherlands  
    yellow: 'bg-yellow-500',     // Spain, Vietnam, Myanmar, Colombia
    amber: 'bg-amber-500',       // Germany, Belgium, Sri Lanka
    lime: 'bg-lime-500',         // Ireland
    green: 'bg-green-500',       // Brazil, Hungary, Portugal, UAE, South Africa
    emerald: 'bg-emerald-500',   // Australia, Mexico
    teal: 'bg-teal-500',         // Italy
    cyan: 'bg-cyan-500',         // Malaysia
    sky: 'bg-sky-500',           // New Zealand, Argentina, Luxembourg
    blue: 'bg-blue-500',         // Multiple countries
    indigo: 'bg-indigo-600',     // France, Cambodia
    violet: 'bg-violet-500',     // Taiwan
    purple: 'bg-purple-500',     // South Korea, Qatar
    pink: 'bg-pink-500',         // Japan
    rose: 'bg-rose-500',         // Hong Kong
    slate: 'bg-slate-500',       // United Kingdom
  }
  
  return colorMap[country.color] || 'bg-gray-500'
}