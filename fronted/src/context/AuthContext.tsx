import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { MockUser } from '@/api/Client'

const STORAGE_KEY = 'sanfoody:user'

export type UserRole = 'customer' | 'restaurant' | 'delivery' | 'admin'

interface AuthContextValue {
  user: MockUser | null
  role: UserRole | null
  isAuthenticated: boolean
  setUser: (user: MockUser | null) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function loadInitial(): MockUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as MockUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(loadInitial)

  useEffect(() => {
    try {
      if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage unavailable — session just won't persist across reloads
    }
  }, [user])



  useEffect(() => {
  if (!user) return

  const setupPush = async () => {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await apiFetch("/push/subscribe", {
        method: "POST",
        body: JSON.stringify({ subscription }),
      })
    }
  }

  setupPush()
}, [user])



  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: (user as MockUser & { role?: UserRole })?.role ?? null,
      isAuthenticated: !!user,
      setUser,
      logout: () => setUser(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

function apiFetch(arg0: string, arg1: { method: string; body: string }) {
  throw new Error('Function not implemented.')
}
