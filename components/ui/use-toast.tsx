// This is a simplified toast hook for notifications
import { useState, useCallback } from "react"

type ToastVariant = "default" | "destructive" | "success"

interface ToastProps {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 5000 }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = { id, title, description, variant, duration }
      
      // Add toast to state
      setToasts((prev) => [...prev, newToast])
      
      // Remove after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
      
      // Log toast for development
      console.log(`Toast: ${title}`, description)
      
      return id
    },
    []
  )

  return { toast, toasts }
} 