'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { APP_CONFIG } from '@/lib/config'

export default function InfoPage() {
  const version = APP_CONFIG.version
  
  const recentUpdates = [
    {
      datetime: "2025-08-15 20:00 KST",
      version: "v6.6.0-beta",
      changes: [
        "✨ Modular dashboard design with 3-column grid layout",
        "🎨 Redesigned all pages with consistent 2/3 + 1/3 layout",
        "📱 Responsive layout system across all dashboard pages",
        "🎯 Compact headers with uppercase tracking for better hierarchy",
        "💄 Improved information density and visual organization",
        "🚀 Better sidebar utilization for contextual information"
      ]
    },
    {
      datetime: "2025-08-15 17:00 KST",
      version: "v6.5.3-beta",
      changes: [
        "✨ Calendar mobile responsiveness improvements",
        "✨ Optimized touch targets for mobile devices",
        "📱 Enhanced mobile calendar grid layouts",
        "🎨 Simplified calendar design with consistent indicators",
        "📖 Updated project documentation (CLAUDE.md)",
        "🐛 Improved calendar loading performance"
      ]
    },
    {
      datetime: "2025-08-15 14:30 KST",
      version: "v6.5.2-beta",
      changes: [
        "✨ Visa Sources Library - Track official visa information sources",
        "✨ Source verification status tracking system",
        "✨ Sources management dashboard with search/filter",
        "📊 Statistics for source health monitoring",
        "🔍 Added Sources page to navigation menu",
        "ℹ️ Added visa card filtering explanation",
        "🐛 Fixed version numbering consistency"
      ]
    },
    {
      datetime: "2025-08-15 11:00 KST",
      version: "v6.5.1-beta",
      changes: [
        "✨ Airport code recognition with 300+ airports",
        "✨ Auto-populate city names from IATA codes",
        "✨ Display both 'DINO verified' and 'Source updated' dates",
        "🐛 Fixed pagination duplication issue"
      ]
    },
    {
      datetime: "2025-08-14 16:00 KST",
      version: "v6.5.0-beta",
      changes: [
        "✨ Extended visa rules database with 30+ countries",
        "✨ Added comprehensive visa information modal",
        "✨ Digital nomad visa information for multiple countries",
        "✨ Working holiday visa details",
        "🐛 Fixed 2025 travel days calculation (170 days)",
        "🐛 Fixed Vietnam info button functionality",
        "💄 Removed duplicate information displays",
        "📝 Created comprehensive visa research documentation"
      ]
    }
  ]

  const features = [
    {
      title: "Visa Tracking",
      description: "Track visa days across multiple countries with rolling window and reset calculations",
      icon: "📊"
    },
    {
      title: "Smart Filtering",
      description: "Only shows relevant visa cards for countries you've recently visited",
      icon: "🎯"
    },
    {
      title: "Airport Recognition",
      description: "Auto-populate cities from 300+ IATA airport codes",
      icon: "✈️"
    },
    {
      title: "CSV Import/Export",
      description: "Backup and restore your travel data easily",
      icon: "📁"
    },
    {
      title: "Achievement System",
      description: "Gamified travel milestones and rewards",
      icon: "🏆"
    },
    {
      title: "Calendar View",
      description: "Visual representation of your travel history",
      icon: "📅"
    }
  ]

  const techStack = [
    { name: "Next.js 15", description: "React framework with App Router" },
    { name: "Supabase", description: "Authentication & database" },
    { name: "TypeScript", description: "Type-safe development" },
    { name: "Tailwind CSS", description: "Utility-first styling" },
    { name: "Zustand", description: "State management" },
    { name: "Vercel", description: "Deployment & hosting" }
  ]

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">About DINO</h1>
          <p className="text-sm text-gray-600 mt-1">Digital Nomad Visa Tracker - Version {version}</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Updates */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Updates</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentUpdates.map((update, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-600">{update.datetime}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {update.version}
                        </span>
                      </div>
                      <ul className="space-y-0.5">
                        {update.changes.map((change, changeIndex) => (
                          <li key={changeIndex} className="text-xs text-gray-600">
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Key Features</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{feature.title}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Visa Data Sources</h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">Our visa information is compiled from official sources:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Official government immigration websites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Embassy and consulate websites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>IATA Travel Centre database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Recent traveler reports (2023-2025)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="space-y-6">
            {/* Service Info */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Service Info</h2>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Website</p>
                  <a href="https://dinoapp.net" target="_blank" rel="noopener noreferrer" 
                    className="text-sm text-blue-600 hover:underline">
                    dinoapp.net
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium text-green-600">Active Beta</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Region</p>
                  <p className="text-sm">Seoul, South Korea (ICN1)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Version</p>
                  <p className="text-sm font-medium">{version}</p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tech Stack</h2>
              </div>
              <div className="p-4 space-y-2">
                {techStack.map((tech, index) => (
                  <div key={index}>
                    <p className="text-sm font-medium text-gray-900">{tech.name}</p>
                    <p className="text-xs text-gray-500">{tech.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-xs font-medium text-amber-900 mb-2">Important Notice</h3>
              <p className="text-xs text-amber-700">
                Visa rules change frequently. Always verify with official sources before travel. DINO is for reference only and not liable for any travel issues.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-xs font-medium text-blue-900 mb-2">Contact & Support</h3>
              <p className="text-xs text-blue-700 mb-2">
                DINO is in beta. We welcome your feedback!
              </p>
              <button 
                onClick={() => window.location.href = 'mailto:hello@zimojin.com'}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                hello@zimojin.com
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}