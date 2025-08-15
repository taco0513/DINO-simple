'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabase'
import { countries } from '@/lib/countries'
import { useSupabaseStore } from '@/lib/supabase-store'

interface Profile {
  nickname: string | null
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
  const [profile, setProfile] = useState<Profile>({
    nickname: null,
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

      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      // Check for safe columns first
      const safeData = {
        nickname: profile.nickname,
        passport_nationality: profile.passport_nationality,
        passport_issue_date: profile.passport_issue_date,
        passport_expiry_date: profile.passport_expiry_date,
      }
      
      // Only include optional columns if they exist
      const fullData = {
        ...safeData,
        preferred_currency: profile.preferred_currency || 'USD',
        travel_insurance_provider: profile.travel_insurance_provider,
        travel_insurance_policy_number: profile.travel_insurance_policy_number,
        notification_days_before_visa_expiry: profile.notification_days_before_visa_expiry || 30,
        notification_days_before_passport_expiry: profile.notification_days_before_passport_expiry || 180
      }

      // Try with full data first, fall back to safe data if it fails  
      let dataToSave: typeof fullData | typeof safeData = fullData
      let error: any = null

      if (!existingProfile && fetchError?.code === 'PGRST116') {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, ...dataToSave })
        error = insertError
        
        // If full data fails, try with safe data only
        if (insertError && insertError.message?.includes('column')) {
          const { error: safeInsertError } = await supabase
            .from('profiles')
            .insert({ user_id: user.id, ...safeData })
          error = safeInsertError
          dataToSave = safeData
        }
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(dataToSave)
          .eq('user_id', user.id)
        error = updateError
        
        // If full data fails, try with safe data only
        if (updateError && updateError.message?.includes('column')) {
          const { error: safeUpdateError } = await supabase
            .from('profiles')
            .update(safeData)
            .eq('user_id', user.id)
          error = safeUpdateError
          dataToSave = safeData
        }
      }

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile saved successfully!' })
      
      // Update local state to match what was saved
      if (dataToSave === safeData) {
        setProfile({
          ...profile,
          ...safeData
        })
      }
    } catch (error: any) {
      console.error('Error saving profile:', error)
      let errorMessage = error?.message || error?.details || 'Failed to save profile. Please try again.'
      
      // Provide helpful error messages for common issues
      if (errorMessage.includes('row-level security')) {
        errorMessage = 'Permission denied. Please run the RLS migration (004_fix_profiles_rls.sql) in Supabase.'
      } else if (errorMessage.includes('column')) {
        errorMessage = 'Database schema mismatch. Please run migrations 003 and 004 in Supabase.'
      }
      
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
    const citiesVisited = [...new Set(stays.map(s => s.city).filter(c => c && c.trim()))].length
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    const today = new Date()
    
    const daysThisYear = stays
      .filter(stay => {
        const entryDate = new Date(stay.entryDate)
        const exitDate = stay.exitDate ? new Date(stay.exitDate) : today
        return exitDate >= yearStart && entryDate <= today
      })
      .reduce((total, stay) => {
        const entryDate = new Date(stay.entryDate)
        const exitDate = stay.exitDate ? new Date(stay.exitDate) : today
        const effectiveStart = entryDate > yearStart ? entryDate : yearStart
        const effectiveEnd = exitDate < today ? exitDate : today
        
        if (effectiveEnd >= effectiveStart) {
          const msPerDay = 1000 * 60 * 60 * 24
          const daysDiff = Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / msPerDay)
          const days = daysDiff + 1
          return total + days
        }
        return total
      }, 0)

    const mostVisited = stays.reduce((acc, stay) => {
      acc[stay.countryCode] = (acc[stay.countryCode] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostVisitedCountry = Object.entries(mostVisited)
      .sort((a, b) => b[1] - a[1])[0]

    return {
      countriesVisited,
      citiesVisited,
      daysThisYear,
      mostVisitedCountry: mostVisitedCountry ? {
        code: mostVisitedCountry[0],
        visits: mostVisitedCountry[1],
        name: countries.find(c => c.code === mostVisitedCountry[0])?.name || mostVisitedCountry[0]
      } : null
    }
  }

  const stats = getStats()
  const daysUntilExpiry = calculateDaysUntilExpiry()

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your passport, security, and preferences</p>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              <div className="md:col-span-2 xl:col-span-2 space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6 h-64"></div>
                <div className="bg-white rounded-lg shadow-sm p-6 h-64"></div>
              </div>
              <div className="md:col-span-2 xl:col-span-1 space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6 h-48"></div>
                <div className="bg-white rounded-lg shadow-sm p-6 h-48"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {/* Primary Content - Profile Forms (Mobile: full width, Tablet: full width, Desktop: 2/3) */}
            <div className="md:col-span-2 xl:col-span-2 space-y-4 xl:space-y-6">
              {/* Display Name */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</h2>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nickname
                    </label>
                    <input
                      type="text"
                      value={profile.nickname || ''}
                      onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                      placeholder="Your display name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      maxLength={50}
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Nickname'}
                  </button>
                </div>
              </div>

              {/* Passport Information */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Passport Information</h2>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality
                      </label>
                      <select
                        value={profile.passport_nationality || ''}
                        onChange={(e) => setProfile({ ...profile, passport_nationality: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select nationality</option>
                        {countries.map(country => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        value={profile.passport_issue_date || ''}
                        onChange={(e) => setProfile({ ...profile, passport_issue_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={profile.passport_expiry_date || ''}
                        onChange={(e) => setProfile({ ...profile, passport_expiry_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      {daysUntilExpiry && (
                        <p className={`text-xs mt-1 ${
                          daysUntilExpiry < 180 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {daysUntilExpiry < 0 
                            ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                            : `Expires in ${daysUntilExpiry} days`}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Passport Info'}
                  </button>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preferences</h2>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Currency
                    </label>
                    <select
                      value={profile.preferred_currency || 'USD'}
                      onChange={(e) => setProfile({ ...profile, preferred_currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Security</h2>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Min 6 characters"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={changingPassword || !passwordData.newPassword}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Notification Preferences</h2>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visa Expiry Alert (days before)
                      </label>
                      <input
                        type="number"
                        value={profile.notification_days_before_visa_expiry || 30}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          notification_days_before_visa_expiry: parseInt(e.target.value) 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
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
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          notification_days_before_passport_expiry: parseInt(e.target.value) 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        min="30"
                        max="365"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Content - Profile Status & Account (Mobile: full width, Tablet: stacked below, Desktop: 1/3 sidebar) */}
            <div className="md:col-span-2 xl:col-span-1 space-y-4 xl:space-y-6">
              {/* Profile Status */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Profile Status</h2>
                </div>
                <div className="p-4 space-y-3">
                  {profile.nickname && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Display Name</span>
                      <span className="text-sm font-semibold text-purple-600">
                        {profile.nickname}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Passport Info</span>
                    <span className="text-sm text-gray-500">
                      {profile.passport_nationality && profile.passport_expiry_date ? '✓ Added' : 'Optional'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Currency</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {profile.preferred_currency || 'USD'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Notifications</span>
                    <span className="text-sm text-gray-500">
                      {profile.notification_days_before_visa_expiry || 30}d / {profile.notification_days_before_passport_expiry || 180}d
                    </span>
                  </div>
                  {daysUntilExpiry && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Passport Expires</span>
                      <span className={`text-sm font-semibold ${daysUntilExpiry < 180 ? 'text-amber-600' : 'text-green-600'}`}>
                        {daysUntilExpiry < 0 ? 'Expired' : `${daysUntilExpiry} days`}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Quick Stats</div>
                    <div className="flex justify-between text-sm">
                      <span>Countries: {stats.countriesVisited}</span>
                      <span>Cities: {stats.citiesVisited}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account</h2>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-xs font-mono text-gray-600 truncate">{user?.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Account Created</p>
                    <p className="text-sm text-gray-600">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-xs font-medium text-blue-900 mb-2">Quick Tips</h3>
                <ul className="space-y-1 text-xs text-blue-700">
                  <li>• Keep your passport info updated</li>
                  <li>• Set notification alerts for visa expiry</li>
                  <li>• Use a strong password</li>
                  <li>• Regular backups via CSV export</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}