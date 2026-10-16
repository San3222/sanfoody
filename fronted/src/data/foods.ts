export interface FoodItem {
  _id: string
  category: any
  isAvailable: boolean
  restaurantId?: string 
  id: string
  name: string
  description: string
  image: string
  price: number
  rating: number
  deliveryTime: string
  isVeg: boolean
  course?: 'Starters' | 'Main Course' | 'Desserts' | 'Beverages'
}

export const foods: FoodItem[] = [
  {
    id: 'margherita-pizza',
    name: 'Margherita Pizza',
    description: 'Fresh basil, mozzarella & tomato',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&h=600&q=80',
    price: 299,
    rating: 4.8,
    deliveryTime: '25 min',
    isVeg: true,
    course: 'Main Course',
  },
  {
    id: 'smash-burger',
    name: 'Double Smash Burger',
    description: 'Charred beef patties, cheddar, house sauce',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&h=600&q=80',
    price: 349,
    rating: 4.7,
    deliveryTime: '20 min',
    isVeg: false,
    course: 'Main Course',
  },
  {
    id: 'tonkotsu-ramen',
    name: 'Tonkotsu Ramen',
    description: 'Slow-simmered pork broth, soft egg',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&h=600&q=80',
    price: 379,
    rating: 4.9,
    deliveryTime: '30 min',
    isVeg: false,
    course: 'Main Course',
  },
  {
    id: 'salmon-sushi',
    name: 'Salmon Sushi Platter',
    description: 'Hand-rolled, sushi-grade salmon',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&h=600&q=80',
    price: 449,
    rating: 4.8,
    deliveryTime: '35 min',
    isVeg: false,
    course: 'Starters',
  },
  {
    id: 'street-tacos',
    name: 'Street-Style Tacos',
    description: 'Charred corn tortillas, salsa verde',
    image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=600&h=600&q=80',
    price: 259,
    rating: 4.6,
    deliveryTime: '22 min',
    isVeg: true,
    course: 'Starters',
  },
  {
    id: 'crispy-chicken',
    name: 'Crispy Fried Chicken',
    description: 'Buttermilk-brined, double-fried',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&h=600&q=80',
    price: 329,
    rating: 4.7,
    deliveryTime: '25 min',
    isVeg: false,
    course: 'Starters',
  },
  {
    id: 'harvest-bowl',
    name: 'Harvest Salad Bowl',
    description: 'Quinoa, roasted veg, tahini dressing',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80',
    price: 279,
    rating: 4.5,
    deliveryTime: '18 min',
    isVeg: true,
    course: 'Starters',
  },
  {
    id: 'chocolate-cake',
    name: 'Molten Chocolate Cake',
    description: 'Warm centre, vanilla bean ice cream',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&h=600&q=80',
    price: 199,
    rating: 4.9,
    deliveryTime: '15 min',
    isVeg: true,
    course: 'Desserts',
  },
  {
    id: 'iced-cold-coffee',
    name: 'Iced Cold Coffee',
    description: 'Slow-brewed, served over ice',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&h=600&q=80',
    price: 149,
    rating: 4.6,
    deliveryTime: '12 min',
    isVeg: true,
    course: 'Beverages',
  },
]