'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabase'
import { countries } from '@/lib/countries'
import { useSupabaseStore } from '@/lib/supabase-store'

interface Profile {
  passport_nationality: string | null
  passport_issue_date: string | null
  passport_expiry_date: string | null
  preferred_currency: string | null
  travel_insurance_provider: string | null
  travel_insurance_policy_number: string | null
  notification_days_before_visa_expiry: number | null
  notification_days_before_passport_expiry: number | null
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const { stays } = useSupabaseStore()
  const [activeTab, setActiveTab] = useState<'passport' | 'security' | 'preferences' | 'stats'>('passport')
  const [profile, setProfile] = useState<Profile>({
    passport_nationality: null,
    passport_issue_date: null,
    passport_expiry_date: null,
    preferred_currency: 'USD',
    travel_insurance_provider: null,
    travel_insurance_policy_number: null,
    notification_days_before_visa_expiry: 30,
    notification_days_before_passport_expiry: 180
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile({
          ...profile,
          ...data
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      setMessage(null)

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // First try with only basic passport fields that exist in original schema
      const basicProfileData: any = {}
      if (profile.passport_nationality) basicProfileData.passport_nationality = profile.passport_nationality
      if (profile.passport_issue_date) basicProfileData.passport_issue_date = profile.passport_issue_date
      if (profile.passport_expiry_date) basicProfileData.passport_expiry_date = profile.passport_expiry_date

      // Try to save additional fields if they exist in database
      const fullProfileData: any = {
        ...basicProfileData
      }
      if (profile.preferred_currency) fullProfileData.preferred_currency = profile.preferred_currency
      if (profile.travel_insurance_provider) fullProfileData.travel_insurance_provider = profile.travel_insurance_provider
      if (profile.travel_insurance_policy_number) fullProfileData.travel_insurance_policy_number = profile.travel_insurance_policy_number
      if (profile.notification_days_before_visa_expiry !== null) fullProfileData.notification_days_before_visa_expiry = profile.notification_days_before_visa_expiry
      if (profile.notification_days_before_passport_expiry !== null) fullProfileData.notification_days_before_passport_expiry = profile.notification_days_before_passport_expiry

      // Try with full data first, fall back to basic if it fails
      let profileData = fullProfileData

      console.log('Saving profile data:', profileData)
      console.log('Existing profile?', !!existingProfile)

      let error
      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id)
        error = updateError
        
        // If full update fails, try with basic fields only
        if (error && error.message?.includes('column')) {
          console.log('Full update failed, trying basic fields only')
          const { error: basicError } = await supabase
            .from('profiles')
            .update(basicProfileData)
            .eq('user_id', user.id)
          error = basicError
        }
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...profileData
          })
        error = insertError
        
        // If full insert fails, try with basic fields only
        if (error && error.message?.includes('column')) {
          console.log('Full insert failed, trying basic fields only')
          const { error: basicError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              ...basicProfileData
            })
          error = basicError
        }
      }

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      setMessage({ type: 'success', text: 'Profile saved successfully!' })
    } catch (error: any) {
      console.error('Error saving profile:', error)
      const errorMessage = error?.message || error?.details || 'Failed to save profile. Please try again.'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    try {
      setChangingPassword(true)
      setMessage(null)

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to change password' })
    } finally {
      setChangingPassword(false)
    }
  }

  const calculateDaysUntilExpiry = () => {
    if (!profile.passport_expiry_date) return null
    
    const today = new Date()
    const expiry = new Date(profile.passport_expiry_date)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const getStats = () => {
    const countriesVisited = [...new Set(stays.map(s => s.countryCode))].length
    const currentYear = new Date().getFullYear()
    const daysThisYear = stays
      .filter(stay => {
        const year = new Date(stay.entryDate).getFullYear()
        return year === currentYear
      })
      .reduce((total, stay) => {
        const entry = new Date(stay.entryDate)
        const exit = stay.exitDate ? new Date(stay.exitDate) : new Date()
        const days = Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) + 1
        return total + days
      }, 0)

    const mostVisited = stays.reduce((acc, stay) => {
      acc[stay.countryCode] = (acc[stay.countryCode] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCountry = Object.entries(mostVisited)
      .sort(([, a], [, b]) => b - a)[0]

    return { countriesVisited, daysThisYear, topCountry }
  }

  const stats = getStats()
  const daysUntilExpiry = calculateDaysUntilExpiry()

  const tabs = [
    { id: 'passport', label: 'Passport', icon: '📔' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'stats', label: 'Stats', icon: '📊' },
  ]

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Manage your travel profile and settings</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex px-2 sm:px-6 pt-3 pb-1 overflow-x-auto">
                <div className="flex gap-1 sm:gap-2 min-w-full sm:min-w-0 justify-around sm:justify-start">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 sm:flex-initial flex flex-col sm:flex-row items-center justify-center sm:justify-start px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-sm border border-gray-200 sm:border-b-2 sm:border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl sm:text-base sm:mr-2">{tab.icon}</span>
                      <span className="mt-1 sm:mt-0 text-[10px] sm:text-sm hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {/* Passport Tab */}
              {activeTab === 'passport' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Passport Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passport Nationality
                    </label>
                    <select
                      value={profile.passport_nationality || ''}
                      onChange={(e) => setProfile({ ...profile, passport_nationality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select nationality</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        value={profile.passport_issue_date || ''}
                        onChange={(e) => setProfile({ ...profile, passport_issue_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={profile.passport_expiry_date || ''}
                        onChange={(e) => setProfile({ ...profile, passport_expiry_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {daysUntilExpiry !== null && (
                        <p className={`text-sm mt-1 ${
                          daysUntilExpiry < 180 ? 'text-red-600' : 
                          daysUntilExpiry < 365 ? 'text-yellow-600' : 
                          'text-gray-600'
                        }`}>
                          {daysUntilExpiry > 0 
                            ? `Expires in ${daysUntilExpiry} days`
                            : `Expired ${Math.abs(daysUntilExpiry)} days ago`
                          }
                          {daysUntilExpiry > 0 && daysUntilExpiry < 180 && ' - Consider renewal'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Change Password</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={changingPassword || !passwordData.newPassword}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {changingPassword ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Account Email</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Travel Preferences</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Currency
                    </label>
                    <select
                      value={profile.preferred_currency || 'USD'}
                      onChange={(e) => setProfile({ ...profile, preferred_currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Travel Insurance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Insurance Provider
                        </label>
                        <input
                          type="text"
                          value={profile.travel_insurance_provider || ''}
                          onChange={(e) => setProfile({ ...profile, travel_insurance_provider: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Insurance company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Policy Number
                        </label>
                        <input
                          type="text"
                          value={profile.travel_insurance_policy_number || ''}
                          onChange={(e) => setProfile({ ...profile, travel_insurance_policy_number: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Policy number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Notification Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Visa Expiry Alert (days before)
                        </label>
                        <input
                          type="number"
                          value={profile.notification_days_before_visa_expiry || 30}
                          onChange={(e) => setProfile({ ...profile, notification_days_before_visa_expiry: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                          max="90"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Passport Expiry Alert (days before)
                        </label>
                        <input
                          type="number"
                          value={profile.notification_days_before_passport_expiry || 180}
                          onChange={(e) => setProfile({ ...profile, notification_days_before_passport_expiry: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="30"
                          max="365"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Travel Statistics</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🌍</span>
                        <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">Countries</span>
                      </div>
                      <p className="text-3xl font-bold text-blue-900">{stats.countriesVisited || 0}</p>
                      <p className="text-xs text-blue-600 mt-1">visited so far</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">📅</span>
                        <span className="text-xs text-green-600 font-medium uppercase tracking-wider">{new Date().getFullYear()}</span>
                      </div>
                      <p className="text-3xl font-bold text-green-900">{stats.daysThisYear || 0}</p>
                      <p className="text-xs text-green-600 mt-1">days traveled</p>
                    </div>
                    
                    {stats.topCountry ? (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 sm:col-span-2 md:col-span-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">🏆</span>
                          <span className="text-xs text-purple-600 font-medium uppercase tracking-wider">Most Visited</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">
                            {countries.find(c => c.code === stats.topCountry[0])?.flag}
                          </span>
                          <div>
                            <p className="text-xl font-bold text-purple-900">{stats.topCountry[0]}</p>
                            <p className="text-xs text-purple-600">{stats.topCountry[1]} visits</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 sm:col-span-2 md:col-span-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">✈️</span>
                          <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Start</span>
                        </div>
                        <p className="text-sm text-gray-600">Add your first stay to see stats!</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Additional Stats */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Insights</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Average Stay</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {stays.length > 0 ? Math.round(stats.daysThisYear / stays.length) || 0 : 0} days
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Total Trips</p>
                        <p className="text-lg font-semibold text-gray-900">{stays.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {message && (
                <div className={`mt-4 p-3 rounded-lg ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Save Button (not on security or stats tab) */}
              {activeTab !== 'security' && activeTab !== 'stats' && (
                <div className="mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-500"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}