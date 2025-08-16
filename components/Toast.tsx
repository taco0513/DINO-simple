'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastProps {
  toast: ToastMessage
  onClose: (id: string) => void
}

const toastIcons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️'
}

const toastColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
}

function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, toast.duration || 3000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  return (
    <div
      className={`flex items-start p-4 rounded-lg border shadow-lg transition-all transform animate-slide-in ${toastColors[toast.type]}`}
      role="alert"
    >
      <span className="text-xl mr-3">{toastIcons[toast.type]}</span>
      <div className="flex-1">
        <p className="font-medium">{toast.title}</p>
        {toast.message && (
          <p className="text-sm mt-1 opacity-90">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// Toast Container Component
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Listen for custom toast events
    const handleToast = (event: CustomEvent<ToastMessage>) => {
      setToasts(prev => [...prev, event.detail])
    }

    window.addEventListener('show-toast' as any, handleToast)
    return () => window.removeEventListener('show-toast' as any, handleToast)
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full sm:max-w-md">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>,
    document.body
  )
}

// Helper function to show toast
export function showToast(type: ToastType, title: string, message?: string, duration?: number) {
  const event = new CustomEvent('show-toast', {
    detail: {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      duration
    }
  })
  window.dispatchEvent(event)
}

// Convenience functions
export const toast = {
  success: (title: string, message?: string) => showToast('success', title, message),
  error: (title: string, message?: string) => showToast('error', title, message),
  info: (title: string, message?: string) => showToast('info', title, message),
  warning: (title: string, message?: string) => showToast('warning', title, message)
}