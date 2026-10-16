import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_CITY, getCityById, type City } from '@/data/cities'

const STORAGE_KEY = 'sanfoody:city'

interface CityContextValue {
  city: string
  cityData: City | undefined
  setCity: (city: string) => void
}

const CityContext = createContext<CityContextValue | null>(null)

function loadInitialCity(): string {
  if (typeof window === 'undefined') return DEFAULT_CITY
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && getCityById(stored)) return stored
    return DEFAULT_CITY
  } catch {
    return DEFAULT_CITY
  }
}

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState<string>(loadInitialCity)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, city)
    } catch {
      // Ignore
    }
  }, [city])

  const value = useMemo<CityContextValue>(
    () => ({
      city,
      cityData: getCityById(city),
      setCity,
    }),
    [city]
  )

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>
}

export function useCity() {
  const ctx = useContext(CityContext)
  if (!ctx) throw new Error('useCity must be used within a CityProvider')
  return ctx
}

export { CityContext }