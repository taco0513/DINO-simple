'use client'

import { useState, useRef } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { exportToCSV, downloadCSV, parseCSV, generateCSVTemplate } from '@/lib/csv-utils'
import { v4 as uuidv4 } from 'uuid'
import ProtectedRoute from '@/components/ProtectedRoute'
import { countries } from '@/lib/countries'
import { format } from 'date-fns'

export default function CSVPage() {
  const { stays, addStay, loadStays } = useSupabaseStore()
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const csv = exportToCSV(stays)
    const timestamp = new Date().toISOString().split('T')[0]
    downloadCSV(csv, `dino-stays-${timestamp}.csv`)
  }

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate()
    downloadCSV(template, 'dino-stays-template.csv')
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsedStays = parseCSV(text)
      setPreviewData(parsedStays)
      setShowPreview(true)
      setImportResult(null)
    } catch (error) {
      console.error('Failed to parse CSV:', error)
      setImportResult({ success: 0, failed: -1 })
    }
  }

  const handleImport = async () => {
    setImporting(true)
    setImportResult(null)

    let success = 0
    let failed = 0

    for (const stayData of previewData) {
      try {
        // Generate ID if not present
        const stay = {
          id: uuidv4(),
          ...stayData
        }
        
        // Validate required fields
        if (stay.countryCode && stay.entryDate) {
          await addStay(stay as any)
          success++
        } else {
          failed++
        }
      } catch (error) {
        console.error('Failed to import stay:', error)
        failed++
      }
    }

    setImportResult({ success, failed })
    setImporting(false)
    setShowPreview(false)
    setPreviewData([])
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Reload stays from database
    await loadStays()
  }

  const cancelImport = () => {
    setShowPreview(false)
    setPreviewData([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Calculate stats for sidebar
  const getStats = () => {
    const uniqueCountries = [...new Set(stays.map(s => s.countryCode))].length
    const uniqueCities = [...new Set(stays.map(s => s.city).filter(c => c && c.trim()))].length
    
    // Calculate total travel days (for completed trips only)
    const completedStays = stays.filter(s => s.exitDate)
    const totalDays = completedStays.reduce((total, stay) => {
      const entry = new Date(stay.entryDate)
      const exit = new Date(stay.exitDate!)
      const days = Math.floor((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return total + days
    }, 0)
    
    // Calculate average stay length
    const avgStayLength = completedStays.length > 0 
      ? Math.round(totalDays / completedStays.length) 
      : 0
    
    return {
      totalRecords: stays.length,
      uniqueCountries,
      uniqueCities,
      totalDays,
      avgStayLength,
      completedTrips: completedStays.length
    }
  }

  const stats = getStats()

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CSV Management</h1>
          <p className="text-sm text-gray-600 mt-1">Import and export your travel records</p>
        </div>

        {/* Main Grid Layout - CSV IA Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Primary Content - CSV Operations (Mobile: full width, Tablet: full width, Desktop: 2/3) */}
          <div className="md:col-span-2 xl:col-span-2 space-y-4 xl:space-y-6">
            {/* Export/Import Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Export Data</h2>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Download all your travel records as a CSV file for backup or external use.
                  </p>
                  
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700">Total Records</span>
                      <span className="text-sm font-semibold">{stays.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">Countries</span>
                      <span className="text-sm font-semibold">{stats.uniqueCountries}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleExport}
                    disabled={stays.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export to CSV</span>
                  </button>
                </div>
              </div>

              {/* Import Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Import Data</h2>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV file to bulk import travel records.
                  </p>

                  <div className="space-y-2 mb-4">
                    <button
                      onClick={handleDownloadTemplate}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Template</span>
                    </button>

                    <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Select File</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Import Result Message */}
                  {importResult && (
                    <div className={`p-2 rounded text-xs ${importResult.failed === -1 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {importResult.failed === -1 ? (
                        'Failed to parse CSV'
                      ) : (
                        <>
                          Imported {importResult.success} records
                          {importResult.failed > 0 && `, ${importResult.failed} failed`}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview Import</h2>
                  <span className="text-sm text-gray-600">{previewData.length} records found</span>
                </div>

                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entry</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exit</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Visa</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.slice(0, 10).map((stay, index) => {
                          const country = countries.find(c => c.code === stay.countryCode)
                          return (
                            <tr key={index}>
                              <td className="px-3 py-2 text-sm">
                                <span className="mr-1">{country?.flag}</span>
                                {country?.name || stay.countryCode}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-600">{stay.city || '-'}</td>
                              <td className="px-3 py-2 text-sm">{stay.entryDate}</td>
                              <td className="px-3 py-2 text-sm">{stay.exitDate || '-'}</td>
                              <td className="px-3 py-2 text-sm capitalize">{stay.visaType || 'visa-free'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {previewData.length > 10 && (
                      <div className="text-center py-2 text-sm text-gray-500">
                        And {previewData.length - 10} more records...
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={cancelImport}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-500"
                    >
                      {importing ? 'Importing...' : `Import ${previewData.length} Records`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CSV Format Example */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">CSV Format Example</h2>
              </div>
              <div className="p-4">
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
Country,Country Code,City,From Country,From Country Code,From City,Entry Date,Exit Date,Visa Type,Notes
Thailand,TH,Bangkok,Vietnam,VN,Ho Chi Minh,2024-01-15,2024-02-15,visa-free,Tourist visit
Vietnam,VN,Hanoi,Thailand,TH,Bangkok,2024-02-15,2024-03-20,e-visa,Extended stay
Japan,JP,Tokyo,Vietnam,VN,Hanoi,2024-03-20,2024-04-10,visa-free,Business trip
                </pre>
              </div>
            </div>
          </div>

          {/* Secondary Content - Data Overview & Help (Mobile: full width, Tablet: stacked below, Desktop: 1/3 sidebar) */}
          <div className="md:col-span-2 xl:col-span-1 space-y-4 xl:space-y-6">
            {/* Data Overview */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Data Overview</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Records</span>
                  <span className="text-sm font-semibold">{stats.totalRecords}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Countries</span>
                  <span className="text-sm font-semibold">{stats.uniqueCountries}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cities</span>
                  <span className="text-sm font-semibold">{stats.uniqueCities}</span>
                </div>
                {stats.totalRecords > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-xs text-green-600 font-medium mb-1">✓ Ready for export</div>
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-xs font-medium text-blue-900 mb-2">Quick Guide</h3>
              <div className="space-y-2 text-xs text-blue-700">
                <div>
                  <p className="font-medium">Exporting:</p>
                  <p>Download all records as CSV for backup</p>
                </div>
                <div>
                  <p className="font-medium">Importing:</p>
                  <p>1. Download template</p>
                  <p>2. Fill in your data</p>
                  <p>3. Upload CSV file</p>
                  <p>4. Review & confirm</p>
                </div>
              </div>
            </div>

            {/* Format Requirements */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-xs font-medium text-amber-900 mb-2">Format Requirements</h3>
              <ul className="space-y-1 text-xs text-amber-700">
                <li>• Country Code: 2-letter ISO code</li>
                <li>• Dates: YYYY-MM-DD format</li>
                <li>• Visa Type: visa-free, e-visa, etc.</li>
                <li>• Required: Country Code, Entry Date</li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-medium text-gray-700 mb-2">Tips</h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Export regularly for backup</li>
                <li>• Use template for correct format</li>
                <li>• Check preview before import</li>
                <li>• Keep dates in YYYY-MM-DD format</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}