import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-100 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={cn(
                'flex items-center gap-3 rounded-2xl bg-white p-4 shadow-warm border',
                toast.type === 'success' && 'border-green-200',
                toast.type === 'error' && 'border-red-200',
                toast.type === 'info' && 'border-blue-200',
              )}
            >
              {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
              {toast.type === 'error' && <XCircle className="h-5 w-5 text-red-600 shrink-0" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-blue-600 shrink-0" />}
              <p className="text-sm font-medium text-charcoal">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-auto text-warm-gray hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}