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

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">CSV Management</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Import and export your travel records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Export Data</h2>
            <p className="text-gray-600 text-sm mb-4">
              Download all your travel records as a CSV file for backup or external use.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Total Records</span>
                <span className="font-semibold">{stays.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Countries Visited</span>
                <span className="font-semibold">{[...new Set(stays.map(s => s.countryCode))].length}</span>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={stays.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export to CSV</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Import Data</h2>
            <p className="text-gray-600 text-sm mb-4">
              Upload a CSV file to bulk import travel records.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">CSV Format</h3>
              <p className="text-xs text-blue-800">
                Required columns: Country Code, Entry Date<br/>
                Optional: City, Exit Date, Visa Type, Notes
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Template</span>
              </button>

              <label className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Select CSV File</span>
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
              <div className={`mt-4 p-3 rounded-lg ${importResult.failed === -1 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {importResult.failed === -1 ? (
                  'Failed to parse CSV file. Please check the format.'
                ) : (
                  <>
                    Successfully imported {importResult.success} records
                    {importResult.failed > 0 && `, ${importResult.failed} failed`}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Preview Import Data</h2>
              <span className="text-sm text-gray-600">{previewData.length} records found</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entry Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exit Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Visa Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.slice(0, 10).map((stay, index) => {
                    const country = countries.find(c => c.code === stay.countryCode)
                    return (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">
                          <span className="mr-2">{country?.flag}</span>
                          {country?.name || stay.countryCode}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{stay.city || '-'}</td>
                        <td className="px-4 py-2 text-sm">{stay.entryDate}</td>
                        <td className="px-4 py-2 text-sm">{stay.exitDate || '-'}</td>
                        <td className="px-4 py-2 text-sm capitalize">{stay.visaType || 'visa-free'}</td>
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

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={cancelImport}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-500"
              >
                {importing ? 'Importing...' : `Import ${previewData.length} Records`}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Instructions</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-1">Exporting Data</h3>
              <p>Click "Export to CSV" to download all your travel records. The file will include all details such as countries, cities, dates, and visa types.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Importing Data</h3>
              <p>Download the template CSV file to see the correct format. Fill in your travel records and upload the file. At minimum, Country Code and Entry Date are required.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">CSV Format Example</h3>
              <pre className="bg-white p-2 rounded border border-gray-200 text-xs overflow-x-auto">
Country,Country Code,City,From Country,From Country Code,From City,Entry Date,Exit Date,Visa Type,Notes
Thailand,TH,Bangkok,Vietnam,VN,Ho Chi Minh,2024-01-15,2024-02-15,visa-free,Tourist visit
Vietnam,VN,Hanoi,Thailand,TH,Bangkok,2024-02-15,2024-03-20,e-visa,Extended stay
              </pre>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}