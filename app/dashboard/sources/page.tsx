'use client'

import { useState, useMemo } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { visaSourcesLibrary, getLibraryStats, getSourcesNeedingUpdate, VisaSource } from '@/lib/visa-sources'
import { APP_CONFIG } from '@/lib/config'

export default function VisaSourcesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'needs-update' | 'outdated' | 'pending'>('all')
  const [sortBy, setSortBy] = useState<'country' | 'lastCheck' | 'status'>('country')
  
  const stats = getLibraryStats()
  const sourcesNeedingUpdate = getSourcesNeedingUpdate(30)
  
  // Filter and sort sources
  const filteredSources = useMemo(() => {
    let sources = [...visaSourcesLibrary.sources]
    
    // Search filter
    if (searchTerm) {
      sources = sources.filter(source => 
        source.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.countryCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      sources = sources.filter(source => source.verificationStatus === filterStatus)
    }
    
    // Sort
    sources.sort((a, b) => {
      switch (sortBy) {
        case 'country':
          return a.countryName.localeCompare(b.countryName)
        case 'lastCheck':
          return new Date(b.lastDINOCheck).getTime() - new Date(a.lastDINOCheck).getTime()
        case 'status':
          return a.verificationStatus.localeCompare(b.verificationStatus)
        default:
          return 0
      }
    })
    
    return sources
  }, [searchTerm, filterStatus, sortBy])
  
  const getStatusColor = (status: VisaSource['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'needs-update':
        return 'bg-yellow-100 text-yellow-800'
      case 'outdated':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getSourceTypeIcon = (type: VisaSource['sourceType']) => {
    switch (type) {
      case 'official':
        return '🏛️'
      case 'embassy':
        return '🏢'
      case 'consulate':
        return '🏬'
      case 'government':
        return '🏛️'
      case 'third-party':
        return '🌐'
      default:
        return '📄'
    }
  }
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysAgo === 0) return 'Today'
    if (daysAgo === 1) return 'Yesterday'
    if (daysAgo < 7) return `${daysAgo} days ago`
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`
    if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} months ago`
    return `${Math.floor(daysAgo / 365)} years ago`
  }
  
  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Visa Sources Library</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage official visa information sources</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Search & Filter</h2>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Search by country name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="verified">Verified</option>
                      <option value="needs-update">Needs Update</option>
                      <option value="outdated">Outdated</option>
                      <option value="pending">Pending</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="country">Sort by Country</option>
                      <option value="lastCheck">Sort by Last Check</option>
                      <option value="status">Sort by Status</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sources Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sources Directory</h2>
                <span className="text-sm text-gray-600">{filteredSources.length} sources</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Check
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSources.slice(0, 20).map((source) => (
                      <tr key={source.countryCode} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm mr-2">{source.countryCode}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{source.countryName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-gray-900">
                            {getSourceTypeIcon(source.sourceType)} {source.sourceType}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs text-gray-900">{source.lastDINOCheck}</div>
                          <div className="text-xs text-gray-500">{formatDate(source.lastDINOCheck)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(source.verificationStatus)}`}>
                            {source.verificationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <a
                              href={source.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 text-xs"
                              title="Open official visa source"
                            >
                              View
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(source.sourceUrl)
                              }}
                              className="text-gray-500 hover:text-gray-700 text-xs"
                              title="Copy URL"
                            >
                              📋
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSources.length > 20 && (
                  <div className="text-center py-3 text-sm text-gray-500 bg-gray-50">
                    Showing 20 of {filteredSources.length} sources
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="space-y-6">
            {/* Library Info */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Library Info</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Version</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    v{visaSourcesLibrary.version}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last comprehensive check</p>
                  <p className="text-sm font-medium">{visaSourcesLibrary.lastComprehensiveCheck}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Statistics</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Sources</span>
                  <span className="text-lg font-semibold text-gray-900">{stats.totalSources}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Verified</span>
                  <span className="text-lg font-semibold text-green-600">{stats.verified}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Needs Update</span>
                  <span className="text-lg font-semibold text-yellow-600">{stats.needsUpdate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Outdated (30d+)</span>
                  <span className="text-lg font-semibold text-red-600">{sourcesNeedingUpdate.length}</span>
                </div>
              </div>
            </div>

            {/* Access Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-xs font-medium text-blue-900 mb-1">Access Note</h3>
                  <p className="text-xs text-blue-700">
                    Some government websites may block direct access (403 error). If a link doesn't work, use the copy button 📋 to paste the URL directly into your browser.
                  </p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-xs font-medium text-amber-900 mb-2">About Visa Sources</h3>
              <p className="text-xs text-amber-700">
                This library tracks official visa information sources to ensure DINO provides accurate and up-to-date visa rules. Sources are regularly checked and verified against official government websites.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}