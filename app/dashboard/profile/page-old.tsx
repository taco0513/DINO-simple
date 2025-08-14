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
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  preferred_currency: string | null
  travel_insurance_provider: string | null
  travel_insurance_policy_number: string | null
  notification_days_before_visa_expiry: number | null
  notification_days_before_passport_expiry: number | null
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { stays } = useSupabaseStore()
  const [activeTab, setActiveTab] = useState<'passport' | 'security' | 'emergency' | 'preferences'>('passport')
  const [profile, setProfile] = useState<Profile>({
    passport_nationality: null,
    passport_issue_date: null,
    passport_expiry_date: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    emergency_contact_relationship: null,
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
    currentPassword: '',
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

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
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

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let error
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profile)
          .eq('user_id', user.id)
        error = updateError
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...profile
          })
        error = insertError
      }

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile saved successfully!' })
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' })
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
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
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

  const daysUntilExpiry = calculateDaysUntilExpiry()

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Manage your passport information</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-6">Passport Information</h2>
            
            {/* Warning about privacy */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold">Privacy Notice</p>
                  <p>Only minimal passport information is stored for visa calculation purposes. This data is encrypted and only visible to you.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Passport Nationality */}
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

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Issue Date
                </label>
                <input
                  type="date"
                  value={profile.passport_issue_date || ''}
                  onChange={(e) => setProfile({ ...profile, passport_issue_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Expiry Date
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

            {/* Message */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-500"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            {/* Passport Status Summary */}
            {profile.passport_nationality && profile.passport_expiry_date && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Passport Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Nationality</p>
                    <p className="text-sm font-semibold">
                      {countries.find(c => c.code === profile.passport_nationality)?.flag} {' '}
                      {countries.find(c => c.code === profile.passport_nationality)?.name}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Valid From</p>
                    <p className="text-sm font-semibold">
                      {profile.passport_issue_date ? new Date(profile.passport_issue_date).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 ${
                    daysUntilExpiry && daysUntilExpiry < 180 ? 'bg-red-50' :
                    daysUntilExpiry && daysUntilExpiry < 365 ? 'bg-yellow-50' :
                    'bg-green-50'
                  }`}>
                    <p className="text-xs text-gray-600">Valid Until</p>
                    <p className="text-sm font-semibold">
                      {new Date(profile.passport_expiry_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}