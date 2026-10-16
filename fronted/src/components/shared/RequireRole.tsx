// src/components/shared/RequireRole.tsx
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import type { UserRole } from '@/context/AuthContext'

export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { role: userRole, isAuthenticated } = useAuth()
  const location = useLocation()

  // 🔥 DEBUG LOG
  // console.log('RequireRole Debug:', { userRole, isAuthenticated, requiredRole: role })

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (userRole !== role) {
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (userRole === 'restaurant') return <Navigate to="/restaurant/dashboard" replace />
    if (userRole === 'delivery') return <Navigate to="/delivery/available-orders" replace />
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}