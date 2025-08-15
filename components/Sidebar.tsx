'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Achievements', href: '/dashboard/achievements', icon: '🏆' },
  // { name: 'Map', href: '/dashboard/map', icon: '🗺️' }, // Temporarily disabled - still in development
  { name: 'Calendar', href: '/dashboard/calendar', icon: '📅' },
  { name: 'Profile', href: '/dashboard/profile', icon: '👤' },
  { name: 'CSV File', href: '/dashboard/csv', icon: '📁' },
  { name: 'Sources', href: '/dashboard/sources', icon: '🔍' },
  { name: 'Info', href: '/dashboard/info', icon: 'ℹ️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState === 'true') {
      setIsCollapsed(true)
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', newState.toString())
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 bg-white border border-gray-200 rounded-lg p-2 shadow-md"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay - Only visible when menu is open */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileMenu} />
      )}

      {/* Desktop Sidebar + Mobile Slide-in Menu */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 
        bg-white shadow-md transition-all duration-300 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
        ${isCollapsed ? 'md:w-16 w-64' : 'md:w-64 w-64'} 
      `}>
        {/* Desktop Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:block absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow z-10"
        >
          <svg 
            className="w-4 h-4 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
            />
          </svg>
        </button>

        {/* Close button for mobile */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden absolute top-4 right-4 p-2 text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className={`${isCollapsed ? 'md:p-3 p-6' : 'p-6'} pt-16 md:pt-6`}>
          <h2 className={`font-bold text-gray-900 ${isCollapsed ? 'md:text-xl md:text-center text-2xl' : 'text-2xl'}`}>
            {isCollapsed ? '🌍' : '🌍 DINO'}
          </h2>
          <p className={`text-sm text-gray-600 mt-1 ${isCollapsed ? 'md:hidden' : ''}`}>Visa Tracker</p>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className={`${isCollapsed ? 'md:px-3 px-6' : 'px-6'} mt-4 pb-4 border-b border-gray-200`}>
            <div className={`flex items-center ${isCollapsed ? 'md:justify-center justify-start' : ''} gap-3`}>
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {/* User Info */}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Welcome back</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              )}
            </div>
            
            {/* Sign Out Button */}
            {!isCollapsed && (
              <button
                onClick={signOut}
                className="mt-3 w-full text-left text-xs text-gray-500 hover:text-gray-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            )}
          </div>
        )}
        
        <nav className="mt-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={toggleMobileMenu} // Close mobile menu when link is clicked
                className={`
                  flex items-center text-sm font-medium
                  transition-colors duration-200
                  ${isCollapsed ? 'md:px-3 md:py-3 md:justify-center px-6 py-3' : 'px-6 py-3'}
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <span className={isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'}>{item.icon}</span>
                <span className={isCollapsed ? 'md:hidden' : ''}>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}