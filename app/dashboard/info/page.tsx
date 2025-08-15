'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { APP_CONFIG } from '@/lib/config'

export default function InfoPage() {
  const version = APP_CONFIG.version
  
  const recentUpdates = [
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
    },
    {
      datetime: "2025-08-13 15:00 KST",
      version: "v6.4.5-beta",
      changes: [
        "🐛 Fixed future trip display showing as 'Currently staying'",
        "✨ Added duration display for all trips",
        "🐛 Fixed current stay statistics calculation",
        "🔧 Fixed Vercel deployment TypeScript baseUrl issue"
      ]
    },
    {
      datetime: "2025-08-12 14:00 KST",
      version: "v6.4.0-beta", 
      changes: [
        "✨ Profile management with 5 tabs",
        "✨ CSV import/export functionality",
        "✨ Dashboard optimization with 5-second cache",
        "🐛 Fixed Korea 183/365 visa calculation",
        "💄 Mobile-responsive UI improvements"
      ]
    },
    {
      datetime: "2025-08-10 12:00 KST",
      version: "v6.3.0-beta",
      changes: [
        "✨ Initial Supabase integration",
        "✨ User authentication system",
        "✨ Travel history management",
        "✨ Basic visa calculation for major countries",
        "💄 Dashboard UI design"
      ]
    },
    {
      datetime: "2025-08-01 10:00 KST",
      version: "v6.0.0-alpha",
      changes: [
        "🎉 Complete rewrite from scratch (6th iteration)",
        "⚡ Next.js 15 with App Router",
        "💾 Supabase backend integration",
        "🎨 New modern UI with Tailwind CSS",
        "📱 Mobile-first responsive design"
      ]
    }
  ]

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">About DINO</h1>
          <p className="text-gray-600">Digital Nomad Visa Tracker</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              v{version}
            </span>
          </div>
        </div>

        {/* Service Info */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Service Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-gray-500 min-w-24">Website:</span>
              <a href="https://dinoapp.net" target="_blank" rel="noopener noreferrer" 
                className="text-blue-600 hover:underline">
                dinoapp.net
              </a>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-500 min-w-24">Status:</span>
              <span className="text-green-600 font-medium">Active Beta</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-500 min-w-24">Framework:</span>
              <span>Next.js 15 + Supabase + TypeScript</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-500 min-w-24">Region:</span>
              <span>Seoul, South Korea (ICN1)</span>
            </div>
          </div>
        </section>

        {/* Recent Updates */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Recent Updates</h2>
          <div className="space-y-6">
            {recentUpdates.map((update, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-gray-900">{update.datetime}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {update.version}
                  </span>
                </div>
                <ul className="space-y-1">
                  {update.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="text-sm text-gray-600">
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Data Sources */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Visa Data Sources</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Our visa information is compiled from official sources including:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Official government immigration websites</li>
              <li>Embassy and consulate websites</li>
              <li>IATA Travel Centre database</li>
              <li>Recent traveler reports (2023-2024)</li>
            </ul>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Important:</strong> Visa rules change frequently. Always verify with official sources before travel.
              </p>
            </div>
          </div>
        </section>

        {/* Contact & Support */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Contact & Support</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>DINO is currently in beta. We welcome your feedback and suggestions!</p>
            <button 
              onClick={() => window.location.href = 'mailto:hello@zimojin.com'}
              className="inline-flex items-center gap-2 text-blue-600 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              hello@zimojin.com
            </button>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  )
}