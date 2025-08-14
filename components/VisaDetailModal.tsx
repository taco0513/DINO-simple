'use client'

import { useState } from 'react'
import { ExtendedVisaRule, visaRulesForUSPassport, visaRulesForKoreanPassport } from '@/lib/visa-rules-extended'
import { Country } from '@/lib/types'

interface VisaDetailModalProps {
  country: Country
  onClose: () => void
  passportNationality?: string
}

export default function VisaDetailModal({ country, onClose, passportNationality = 'US' }: VisaDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'special' | 'costs'>('general')
  
  // Select the appropriate visa rules based on passport nationality
  const visaRules = passportNationality === 'KR' ? visaRulesForKoreanPassport : visaRulesForUSPassport
  const rule = visaRules[country.code] as ExtendedVisaRule | undefined
  
  if (!rule) {
    return null
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">{country.flag}</span>
                {country.name} Visa Information
              </h2>
              <p className="mt-2 opacity-90">
                For {passportNationality === 'KR' ? 'Korean' : 'US'} passport holders
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              General Info
            </button>
            <button
              onClick={() => setActiveTab('special')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'special'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Special Visas
            </button>
            <button
              onClick={() => setActiveTab('costs')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'costs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Costs & Requirements
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Basic Visa Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Visa-Free Stay</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Maximum Stay</p>
                    <p className="text-lg font-bold text-blue-900">{rule.maxDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rule Type</p>
                    <p className="text-lg font-bold text-blue-900 capitalize">{rule.ruleType}</p>
                  </div>
                </div>
                {rule.periodDays && (
                  <p className="mt-3 text-sm text-gray-700">
                    Within any {rule.periodDays}-day period
                  </p>
                )}
                {rule.resetInfo && (
                  <p className="mt-2 text-sm text-gray-700">
                    ℹ️ {rule.resetInfo}
                  </p>
                )}
              </div>
              
              {/* Extension Info */}
              {rule.extension && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Extension Options</h3>
                  <p className="text-sm text-gray-700">
                    Extension possible: {rule.extension.possible ? '✅ Yes' : '❌ No'}
                  </p>
                  {rule.extension.possible && (
                    <>
                      {rule.extension.maxExtension && (
                        <p className="text-sm text-gray-700 mt-1">
                          Maximum extension: {rule.extension.maxExtension} days
                        </p>
                      )}
                      {rule.extension.cost !== undefined && (
                        <p className="text-sm text-gray-700 mt-1">
                          Cost: ${rule.extension.cost} USD
                        </p>
                      )}
                      {rule.extension.requirements && (
                        <p className="text-sm text-gray-700 mt-1">
                          Requirements: {rule.extension.requirements}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* General Permissions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Work Permitted</p>
                  <p className="font-semibold">{rule.workPermitted ? '✅ Yes' : '❌ No'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Business Activities</p>
                  <p className="font-semibold">{rule.businessPermitted ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>
              
              {/* Source and Update Info */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                {rule.lastUpdated && <p>Last updated: {rule.lastUpdated}</p>}
                {rule.sourceUrl && (
                  <a
                    href={rule.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Official source →
                  </a>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'special' && (
            <div className="space-y-4">
              {rule.specialVisas ? (
                <>
                  {/* Working Holiday Visa */}
                  {rule.specialVisas.workingHoliday && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">
                        🎒 Working Holiday Visa
                      </h3>
                      <p className="text-sm text-gray-700">
                        Available: {rule.specialVisas.workingHoliday.available ? '✅ Yes' : '❌ No'}
                      </p>
                      {rule.specialVisas.workingHoliday.available && (
                        <>
                          {rule.specialVisas.workingHoliday.ageLimit && (
                            <p className="text-sm text-gray-700 mt-1">
                              Age limit: {rule.specialVisas.workingHoliday.ageLimit}
                            </p>
                          )}
                          {rule.specialVisas.workingHoliday.maxDuration && (
                            <p className="text-sm text-gray-700 mt-1">
                              Duration: {rule.specialVisas.workingHoliday.maxDuration} days
                            </p>
                          )}
                          {rule.specialVisas.workingHoliday.quota && (
                            <p className="text-sm text-gray-700 mt-1">
                              Annual quota: {rule.specialVisas.workingHoliday.quota.toLocaleString()}
                            </p>
                          )}
                          {rule.specialVisas.workingHoliday.requirements && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Requirements:</p>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {rule.specialVisas.workingHoliday.requirements.map((req, idx) => (
                                  <li key={idx}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Digital Nomad Visa */}
                  {rule.specialVisas.digitalNomad && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">
                        💻 Digital Nomad Visa
                      </h3>
                      <p className="text-sm text-gray-700">
                        Available: {rule.specialVisas.digitalNomad.available ? '✅ Yes' : '❌ No'}
                      </p>
                      {rule.specialVisas.digitalNomad.available && (
                        <>
                          {rule.specialVisas.digitalNomad.minIncome && (
                            <p className="text-sm text-gray-700 mt-1">
                              Minimum income: ${rule.specialVisas.digitalNomad.minIncome.toLocaleString()}/year
                            </p>
                          )}
                          {rule.specialVisas.digitalNomad.maxDuration && (
                            <p className="text-sm text-gray-700 mt-1">
                              Duration: {Math.floor(rule.specialVisas.digitalNomad.maxDuration / 365)} year(s)
                            </p>
                          )}
                          {rule.specialVisas.digitalNomad.cost && (
                            <p className="text-sm text-gray-700 mt-1">
                              Application cost: ${rule.specialVisas.digitalNomad.cost}
                            </p>
                          )}
                          {rule.specialVisas.digitalNomad.requirements && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Requirements:</p>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {rule.specialVisas.digitalNomad.requirements.map((req, idx) => (
                                  <li key={idx}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Retirement Visa */}
                  {rule.specialVisas.retirementVisa && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">
                        🏖️ Retirement Visa
                      </h3>
                      <p className="text-sm text-gray-700">
                        Available: {rule.specialVisas.retirementVisa.available ? '✅ Yes' : '❌ No'}
                      </p>
                      {rule.specialVisas.retirementVisa.available && (
                        <>
                          {rule.specialVisas.retirementVisa.minAge && (
                            <p className="text-sm text-gray-700 mt-1">
                              Minimum age: {rule.specialVisas.retirementVisa.minAge} years
                            </p>
                          )}
                          {rule.specialVisas.retirementVisa.minIncome && (
                            <p className="text-sm text-gray-700 mt-1">
                              Minimum income: ${rule.specialVisas.retirementVisa.minIncome.toLocaleString()}/month
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Student Visa */}
                  {rule.specialVisas.studentVisa && (
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-semibold text-indigo-900 mb-2">
                        📚 Student Visa
                      </h3>
                      <p className="text-sm text-gray-700">
                        Available: {rule.specialVisas.studentVisa.available ? '✅ Yes' : '❌ No'}
                      </p>
                      {rule.specialVisas.studentVisa.available && (
                        <>
                          {rule.specialVisas.studentVisa.workAllowed !== undefined && (
                            <p className="text-sm text-gray-700 mt-1">
                              Work allowed: {rule.specialVisas.studentVisa.workAllowed ? '✅ Yes (with restrictions)' : '❌ No'}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No special visa information available for this country
                </p>
              )}
            </div>
          )}
          
          {activeTab === 'costs' && (
            <div className="space-y-4">
              {/* Visa Cost */}
              {rule.visaCost && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">💳 Visa Cost</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-semibold capitalize">{rule.visaCost.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-semibold">
                        {rule.visaCost.amount === 0 ? 'Free' : `${rule.visaCost.currency} ${rule.visaCost.amount}`}
                      </p>
                    </div>
                  </div>
                  {rule.visaCost.processingTime && (
                    <p className="text-sm text-gray-700 mt-2">
                      Processing time: {rule.visaCost.processingTime}
                    </p>
                  )}
                </div>
              )}
              
              {/* Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">📋 Requirements</h3>
                <div className="space-y-2">
                  {rule.minimumPassportValidity && (
                    <p className="text-sm text-gray-700">
                      • Passport validity: {rule.minimumPassportValidity} months minimum
                    </p>
                  )}
                  {rule.proofOfOnwardTravel && (
                    <p className="text-sm text-gray-700">
                      • Proof of onward travel required
                    </p>
                  )}
                  {rule.proofOfFunds?.required && (
                    <p className="text-sm text-gray-700">
                      • Proof of funds: ${rule.proofOfFunds.amount || 'Amount varies'}
                    </p>
                  )}
                  {rule.yellowFeverVaccination && (
                    <p className="text-sm text-gray-700">
                      • Yellow fever vaccination required
                    </p>
                  )}
                  {rule.covidRequirements && (
                    <p className="text-sm text-gray-700">
                      • COVID-19: {rule.covidRequirements}
                    </p>
                  )}
                  {rule.multipleEntry !== undefined && (
                    <p className="text-sm text-gray-700">
                      • Multiple entry: {rule.multipleEntry ? '✅ Allowed' : '❌ Single entry only'}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Notes */}
              {rule.notes && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📝 Additional Notes</h3>
                  <p className="text-sm text-gray-700">{rule.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}