'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthProvider'

interface FeedbackModalProps {
  onClose: () => void
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const { user } = useAuth()
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature' | 'ui'>('general')
  const [message, setMessage] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot must be less than 5MB')
      return
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    
    setScreenshot(file)
    setError(null)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      setError('Please enter your feedback')
      return
    }
    
    if (message.trim().length < 10) {
      setError('Feedback must be at least 10 characters long')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Convert screenshot to base64 if provided
      let screenshotBase64: string | null = null
      if (screenshot) {
        screenshotBase64 = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(screenshot)
        })
      }
      
      // Send email using backend API route
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackType,
          message: message.trim(),
          screenshot: screenshotBase64,
          userEmail: user?.email || 'anonymous',
          pageUrl: window.location.href,
          userAgent: navigator.userAgent
        })
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error:', response.status, errorData)
        throw new Error(`Failed to send feedback: ${response.status} - ${errorData}`)
      }
      
      setSuccess(true)
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (err) {
      console.error('Feedback submission error:', err)
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Send Feedback</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success ? (
            <div className="py-8 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Thank you!</h3>
              <p className="text-gray-600">Your feedback has been submitted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'general', label: '💬 General', color: 'blue' },
                    { value: 'bug', label: '🐛 Bug', color: 'red' },
                    { value: 'feature', label: '✨ Feature', color: 'green' },
                    { value: 'ui', label: '🎨 UI/UX', color: 'purple' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFeedbackType(type.value as typeof feedbackType)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        feedbackType === type.value
                          ? `bg-${type.color}-50 border-${type.color}-300 text-${type.color}-700`
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === 'bug' 
                      ? "Please describe the issue you're experiencing..."
                      : feedbackType === 'feature'
                      ? "What feature would you like to see?"
                      : feedbackType === 'ui'
                      ? "How can we improve the design?"
                      : "Share your thoughts with us..."
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">Minimum 10 characters required</p>
                  <p className={`text-xs ${message.trim().length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                    {message.trim().length}/10
                  </p>
                </div>
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screenshot (Optional)
                </label>
                
                {screenshotPreview ? (
                  <div className="relative">
                    <img 
                      src={screenshotPreview} 
                      alt="Screenshot preview" 
                      className="w-full rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshot(null)
                        setScreenshotPreview(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                      id="screenshot-upload"
                    />
                    <label
                      htmlFor="screenshot-upload"
                      className={`flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-blue-500 bg-blue-50 scale-105' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <svg className={`w-8 h-8 mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className={`text-sm ${isDragging ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                        {isDragging ? 'Drop your screenshot here!' : 'Click or drag screenshot here'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </label>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Beta Notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  🚀 Thank you for being a beta tester! Your feedback helps us improve DINO for everyone.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !message.trim() || message.trim().length < 10}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  isSubmitting || !message.trim() || message.trim().length < 10
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}