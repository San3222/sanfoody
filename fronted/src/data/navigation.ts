export interface NavLink {
  label: string
  href: string
}

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/explore' },
  { label: 'Restaurants', href: '/restaurants' },
  { label: 'Collections', href: '/collections' },
  { label: 'Offers', href: '/offers' },
  // { label: 'About', href: '/#about' },
]