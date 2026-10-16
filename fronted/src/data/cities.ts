export interface City {
  id: string
  name: string
  state: string
  emoji: string
  popular: boolean
}

export const CITIES: City[] = [
  { id: 'Mumbai', name: 'Mumbai', state: 'Maharashtra', emoji: '🌊', popular: true },
  { id: 'Delhi', name: 'Delhi', state: 'Delhi NCR', emoji: '🏛️', popular: true },
  { id: 'Bangalore', name: 'Bangalore', state: 'Karnataka', emoji: '🌳', popular: true },
  { id: 'Hyderabad', name: 'Hyderabad', state: 'Telangana', emoji: '🕌', popular: false },
  { id: 'Pune', name: 'Pune', state: 'Maharashtra', emoji: '🎓', popular: false },
  { id: 'Chennai', name: 'Chennai', state: 'Tamil Nadu', emoji: '🏖️', popular: false },
  { id: 'Kolkata', name: 'Kolkata', state: 'West Bengal', emoji: '🎭', popular: false },
  { id: 'Ahmedabad', name: 'Ahmedabad', state: 'Gujarat', emoji: '🪷', popular: false },
]

export const DEFAULT_CITY = 'Mumbai'

export function getCityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id)
}