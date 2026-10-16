// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { CustomerApp } from '@/apps/customer/App'
import { RestaurantApp } from '@/apps/restaurant/App'
import { DeliveryApp } from '@/apps/delivery/App'
import { AdminApp } from '@/apps/admin/App'
import { RequireRole } from '@/components/shared/RequireRole'
import { useAuth } from '@/context/useAuth'

function RootRedirect() {
  const { role } = useAuth()
  if (role === 'restaurant') return <Navigate to="/restaurant/dashboard" replace />
  if (role === 'delivery') return <Navigate to="/delivery/available-orders" replace />
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      {/* 1. Customer App - Sab routes yahan handle honge */}
      <Route path="/*" element={<CustomerApp />} />

      {/* 2. Restaurant App - Protected route */}
      <Route
        path="/restaurant/*"
        element={
          <RequireRole role="restaurant">
            <RestaurantApp />
          </RequireRole>
        }
      />

      {/* 3. Delivery App - Protected route */}
      <Route
        path="/delivery/*"
        element={
          <RequireRole role="delivery">
            <DeliveryApp />
          </RequireRole>
        }
      />

      {/* 4. Admin App - Protected route */}
      <Route
        path="/admin/*"
        element={
          <RequireRole role="admin">
            <AdminApp />
          </RequireRole>
        }
      />
    </Routes>
  )
}