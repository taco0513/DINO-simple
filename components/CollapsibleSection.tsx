'use client'

import { useState, useEffect } from 'react'

interface CollapsibleSectionProps {
  title: string
  storageKey?: string
  children: React.ReactNode
  defaultCollapsed?: boolean
  className?: string
}

export default function CollapsibleSection({
  title,
  storageKey,
  children,
  defaultCollapsed = false,
  className = ''
}: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  // Load saved state from localStorage
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved !== null) {
        setIsCollapsed(saved === 'true')
      }
    }
  }, [storageKey])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    
    // Save to localStorage if storageKey provided
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newState.toString())
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </h2>
        <button
          onClick={toggleCollapse}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      
      <div 
        className={`transition-all duration-300 ${
          isCollapsed 
            ? 'opacity-0 max-h-0 overflow-hidden' 
            : 'opacity-100 max-h-[500px] overflow-visible'
        }`}
      >
        {!isCollapsed && children}
      </div>
      
      {isCollapsed && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 text-center">
            Click to expand {title.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  )
}