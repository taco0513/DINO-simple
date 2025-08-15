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
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Visa Sources Library</h1>
          <p className="text-gray-600">Track and manage official visa information sources</p>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              v{visaSourcesLibrary.version}
            </span>
            <span className="text-sm text-gray-500">
              Last comprehensive check: {visaSourcesLibrary.lastComprehensiveCheck}
            </span>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.totalSources}</div>
            <div className="text-sm text-gray-600">Total Sources</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-900">{stats.verified}</div>
            <div className="text-sm text-green-700">Verified</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-900">{stats.needsUpdate}</div>
            <div className="text-sm text-yellow-700">Needs Update</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-900">{sourcesNeedingUpdate.length}</div>
            <div className="text-sm text-red-700">Older than 30 days</div>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by country name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="country">Sort by Country</option>
              <option value="lastCheck">Sort by Last Check</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
        
        {/* Sources Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DINO Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSources.map((source) => (
                  <tr key={source.countryCode} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{source.countryCode}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{source.countryName}</div>
                          <div className="text-xs text-gray-500">{source.countryCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getSourceTypeIcon(source.sourceType)} {source.sourceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{source.sourceLastUpdated}</div>
                      <div className="text-xs text-gray-500">{formatDate(source.sourceLastUpdated + '-01')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{source.lastDINOCheck}</div>
                      <div className="text-xs text-gray-500">{formatDate(source.lastDINOCheck)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(source.verificationStatus)}`}>
                        {source.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={source.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View Source
                      </a>
                      {source.notes && (
                        <span className="text-gray-400" title={source.notes}>
                          ℹ️
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">About Visa Sources</h3>
              <p className="mt-1 text-sm text-amber-700">
                This library tracks official visa information sources to ensure DINO provides accurate and up-to-date visa rules. 
                Sources are regularly checked and verified against official government websites and embassy information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}