'use client'

import { useState, useRef } from 'react'
import { useSupabaseStore } from '@/lib/supabase-store'
import { exportToCSV, downloadCSV, parseCSV } from '@/lib/csv-utils'
import { v4 as uuidv4 } from 'uuid'

export default function ImportExport() {
  const { stays, addStay } = useSupabaseStore()
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const csv = exportToCSV(stays)
    const timestamp = new Date().toISOString().split('T')[0]
    downloadCSV(csv, `dino-stays-${timestamp}.csv`)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const parsedStays = parseCSV(text)
      
      let success = 0
      let failed = 0

      for (const stayData of parsedStays) {
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
    } catch (error) {
      console.error('Failed to parse CSV:', error)
      setImportResult({ success: 0, failed: -1 })
    } finally {
      setImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={stays.length === 0}
        className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Export CSV</span>
      </button>

      {/* Import Button */}
      <label className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span>{importing ? 'Importing...' : 'Import CSV'}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          disabled={importing}
          className="hidden"
        />
      </label>

      {/* Import Result Message */}
      {importResult && (
        <div className={`text-sm ${importResult.failed === -1 ? 'text-red-600' : 'text-green-600'}`}>
          {importResult.failed === -1 ? (
            'Failed to parse CSV file'
          ) : (
            <>
              Imported {importResult.success} records
              {importResult.failed > 0 && `, ${importResult.failed} failed`}
            </>
          )}
        </div>
      )}
    </div>
  )
}