// Application configuration

export const APP_CONFIG = {
  // Version information
  version: '1.4.1',
  
  // Data verification dates
  dataVerification: {
    // When DINO last verified visa information from official sources
    lastChecked: '2024-11-01',
    // When the visa rules database was last comprehensively updated
    lastUpdated: '2024-11',
  },
  
  // Service information
  service: {
    name: 'DINO',
    fullName: 'Digital Nomad Visa Tracker',
    description: 'Track your visa status across countries',
    url: 'https://dinoapp.net',
  },
  
  // Support information
  support: {
    email: 'zbrianjin@gmail.com',
    github: 'https://github.com/taco0513/DINO-simple',
  },
}

// Helper function to format date for display
export function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}