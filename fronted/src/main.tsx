import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import './index.css'
import 'leaflet/dist/leaflet.css'  // 🔥 YEH ADD KARO
import App from './App.tsx'
import { ToastProvider } from '@/context/ToastContext'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CityProvider } from '@/context/CityContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,  // 🔥 1 minute se 5 minutes
      gcTime: 10 * 60_000, // 🔥 10 minutes cache
      refetchOnWindowFocus: false,  // 🔥 Window focus par refetch band karo
      retry: 1,
      throwOnError: false,
      structuralSharing: true,
    },
    mutations: {
      throwOnError: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <CityProvider>
            {/* 🔥 YAHAN AUTH PROVIDER ADD KARO */}
            <AuthProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </AuthProvider>
            </CityProvider>
          </ThemeProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)