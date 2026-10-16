export interface FoodCategory {
  _id: string
  id: string
  name: string
  emoji: string
  image: string
}

export const categories: FoodCategory[] = [
  {
    id: 'pizza',
    name: 'Pizza',
    emoji: '🍕',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'burgers',
    name: 'Burgers',
    emoji: '🍔',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'noodles',
    name: 'Noodles',
    emoji: '🍜',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'sushi',
    name: 'Sushi',
    emoji: '🍣',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'mexican',
    name: 'Mexican',
    emoji: '🌮',
    image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'chicken',
    name: 'Chicken',
    emoji: '🍗',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'healthy',
    name: 'Healthy',
    emoji: '🥗',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'desserts',
    name: 'Desserts',
    emoji: '🍰',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: 'drinks',
    name: 'Drinks',
    emoji: '☕',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&h=300&q=80',
  },
]
