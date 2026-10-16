export interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  rating: number
  review: string
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Ananya Rao',
    role: 'Regular customer',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    review:
      'Every order feels like it was plated five minutes ago. The pizza arrives hot, the packaging never leaks — genuinely the best delivery experience in the city.',
  },
  {
    id: 't2',
    name: 'Kabir Malhotra',
    role: 'Food blogger',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    review:
      "SanFoody's restaurant curation is unmatched. I've discovered three new favorite spots in my neighbourhood I never knew existed.",
  },
  {
    id: 't3',
    name: 'Priya Nair',
    role: 'Verified buyer',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4,
    review:
      'Delivery windows are shockingly accurate. I schedule my lunch order and it shows up within a two-minute margin, every single time.',
  },
  {
    id: 't4',
    name: 'Dev Sharma',
    role: 'Regular customer',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    rating: 5,
    review:
      'The app itself is a joy to use — fast, clean, and the live order tracking actually feels alive instead of a static progress bar.',
  },
]

export const searchData = {
  recent: ['Margherita Pizza', 'Chicken Biryani', 'Cold Coffee'],
  popular: ['Butter Chicken', 'Paneer Tikka', 'Veg Momos', 'Cheese Burst Pizza'],
  trending: ['Korean Corn Dogs', 'Smash Burgers', 'Boba Tea', 'Loaded Fries'],
}
