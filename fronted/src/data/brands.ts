import type { FoodItem } from '@/data/foods'

export interface Brand {
  id: string
  categoryId: string
  name: string
  tagline: string
  image: string
  rating: number
  deliveryTime: string
  priceRange: '₹' | '₹₹' | '₹₹₹'
  distance: string
  menu: FoodItem[]
}

// One representative photo per category — reused across that category's
// brand covers and menu items to keep the dataset light and reliable.
const CATEGORY_IMAGE: Record<string, string> = {
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
  burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
  noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624',
  sushi: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
  mexican: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85',
  chicken: 'https://images.unsplash.com/photo-1562967914-608f82629710',
  healthy: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  desserts: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
  drinks: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
}

function cover(categoryId: string) {
  return `${CATEGORY_IMAGE[categoryId]}?auto=format&fit=crop&w=800&h=600&q=80`
}
function thumb(categoryId: string) {
  return `${CATEGORY_IMAGE[categoryId]}?auto=format&fit=crop&w=600&h=600&q=80`
}

function menu(
  categoryId: string,
  brandId: string,
  deliveryTime: string,
  items: Array<Pick<FoodItem, 'name' | 'description' | 'price' | 'rating' | 'isVeg'>>,
): FoodItem[] {
  return items.map((item, i) => ({
    ...item,
    id: `${brandId}-${i}`,
    image: thumb(categoryId),
    deliveryTime,
  }))
}

export const brands: Brand[] = [
  // Pizza
  {
    id: 'napoli-pizzeria',
    categoryId: 'pizza',
    name: 'Napoli Pizzeria',
    tagline: 'Wood-fired Italian pizza',
    image: cover('pizza'),
    rating: 4.8,
    deliveryTime: '25–30 min',
    priceRange: '₹₹',
    distance: '1.2 km',
    menu: menu('pizza', 'napoli-pizzeria', '25 min', [
      { name: 'Margherita', description: 'Fresh basil, mozzarella & tomato', price: 299, rating: 4.8, isVeg: true },
      { name: 'Pepperoni Feast', description: 'Double pepperoni, mozzarella', price: 379, rating: 4.7, isVeg: false },
      { name: 'Farmhouse Veggie', description: 'Peppers, onion, corn, olives', price: 329, rating: 4.6, isVeg: true },
      { name: 'BBQ Chicken', description: 'Smoky BBQ sauce, grilled chicken', price: 399, rating: 4.7, isVeg: false },
    ]),
  },
  {
    id: 'stonefire-pizza-co',
    categoryId: 'pizza',
    name: 'Stonefire Pizza Co.',
    tagline: 'Stone-baked, thin crust',
    image: cover('pizza'),
    rating: 4.6,
    deliveryTime: '20–25 min',
    priceRange: '₹₹',
    distance: '2.0 km',
    menu: menu('pizza', 'stonefire-pizza-co', '22 min', [
      { name: 'Classic Cheese', description: 'Triple mozzarella blend', price: 259, rating: 4.5, isVeg: true },
      { name: 'Peri Peri Paneer', description: 'Spiced paneer, bell peppers', price: 319, rating: 4.6, isVeg: true },
      { name: 'Meat Lovers', description: 'Pepperoni, sausage, bacon', price: 419, rating: 4.7, isVeg: false },
      { name: 'Mexican Green Wave', description: 'Jalapeño, corn, salsa base', price: 339, rating: 4.5, isVeg: true },
    ]),
  },

  // Burgers
  {
    id: 'smoke-grill-co',
    categoryId: 'burgers',
    name: 'Smoke & Grill Co.',
    tagline: 'Charcoal-grilled, always juicy',
    image: cover('burgers'),
    rating: 4.7,
    deliveryTime: '20–25 min',
    priceRange: '₹₹',
    distance: '0.8 km',
    menu: menu('burgers', 'smoke-grill-co', '20 min', [
      { name: 'Double Smash Burger', description: 'Charred beef patties, cheddar', price: 349, rating: 4.7, isVeg: false },
      { name: 'Classic Cheeseburger', description: 'Single patty, house sauce', price: 269, rating: 4.6, isVeg: false },
      { name: 'Spicy Chicken Burger', description: 'Crispy fillet, chipotle mayo', price: 309, rating: 4.6, isVeg: false },
      { name: 'Veg Supreme', description: 'Grilled veg patty, slaw', price: 239, rating: 4.4, isVeg: true },
    ]),
  },
  {
    id: 'grill-house-burgers',
    categoryId: 'burgers',
    name: 'Grill House Burgers',
    tagline: 'Bold, stacked, unapologetic',
    image: cover('burgers'),
    rating: 4.5,
    deliveryTime: '25–30 min',
    priceRange: '₹₹',
    distance: '1.6 km',
    menu: menu('burgers', 'grill-house-burgers', '27 min', [
      { name: 'BBQ Bacon Burger', description: 'Smoked bacon, onion rings', price: 379, rating: 4.6, isVeg: false },
      { name: 'Mushroom Swiss', description: 'Sautéed mushrooms, swiss cheese', price: 319, rating: 4.5, isVeg: false },
      { name: 'Crispy Paneer Burger', description: 'Spiced paneer, mint mayo', price: 289, rating: 4.4, isVeg: true },
      { name: 'Triple Patty Beast', description: 'Three patties, triple cheese', price: 449, rating: 4.7, isVeg: false },
    ]),
  },

  // Noodles
  {
    id: 'wok-and-roll',
    categoryId: 'noodles',
    name: 'Wok & Roll',
    tagline: 'Pan-Asian noodle kitchen',
    image: cover('noodles'),
    rating: 4.7,
    deliveryTime: '28–33 min',
    priceRange: '₹₹',
    distance: '1.4 km',
    menu: menu('noodles', 'wok-and-roll', '30 min', [
      { name: 'Tonkotsu Ramen', description: 'Slow-simmered pork broth, soft egg', price: 379, rating: 4.9, isVeg: false },
      { name: 'Veg Hakka Noodles', description: 'Wok-tossed vegetables', price: 249, rating: 4.4, isVeg: true },
      { name: 'Spicy Dan Dan Noodles', description: 'Sichuan chili oil, minced pork', price: 329, rating: 4.6, isVeg: false },
      { name: 'Pad Thai', description: 'Tamarind glaze, crushed peanuts', price: 349, rating: 4.6, isVeg: true },
    ]),
  },
  {
    id: 'ramen-avenue',
    categoryId: 'noodles',
    name: 'Ramen Avenue',
    tagline: 'Japanese comfort bowls',
    image: cover('noodles'),
    rating: 4.8,
    deliveryTime: '30–35 min',
    priceRange: '₹₹₹',
    distance: '2.3 km',
    menu: menu('noodles', 'ramen-avenue', '32 min', [
      { name: 'Shoyu Ramen', description: 'Soy-based broth, chashu pork', price: 359, rating: 4.7, isVeg: false },
      { name: 'Miso Ramen', description: 'Rich fermented miso broth', price: 369, rating: 4.8, isVeg: false },
      { name: 'Veg Chow Mein', description: 'Stir-fried noodles, garlic', price: 239, rating: 4.3, isVeg: true },
      { name: 'Kimchi Ramen', description: 'Spicy kimchi, soft-boiled egg', price: 389, rating: 4.7, isVeg: false },
    ]),
  },

  // Sushi
  {
    id: 'sakura-house',
    categoryId: 'sushi',
    name: 'Sakura House',
    tagline: 'Hand-rolled, sushi-grade',
    image: cover('sushi'),
    rating: 4.9,
    deliveryTime: '30–35 min',
    priceRange: '₹₹₹',
    distance: '2.1 km',
    menu: menu('sushi', 'sakura-house', '32 min', [
      { name: 'Salmon Sushi Platter', description: 'Hand-rolled, sushi-grade salmon', price: 449, rating: 4.8, isVeg: false },
      { name: 'California Roll', description: 'Crab, avocado, cucumber', price: 329, rating: 4.6, isVeg: false },
      { name: 'Dragon Roll', description: 'Eel, avocado, unagi glaze', price: 489, rating: 4.8, isVeg: false },
      { name: 'Veggie Roll', description: 'Avocado, cucumber, pickled radish', price: 289, rating: 4.4, isVeg: true },
    ]),
  },
  {
    id: 'tokyo-bites',
    categoryId: 'sushi',
    name: 'Tokyo Bites',
    tagline: 'Nigiri, rolls & sashimi',
    image: cover('sushi'),
    rating: 4.7,
    deliveryTime: '35–40 min',
    priceRange: '₹₹₹',
    distance: '3.0 km',
    menu: menu('sushi', 'tokyo-bites', '37 min', [
      { name: 'Tuna Nigiri Set', description: 'Six pieces, fresh-cut tuna', price: 459, rating: 4.8, isVeg: false },
      { name: 'Spicy Tuna Roll', description: 'Sriracha mayo, scallion', price: 399, rating: 4.6, isVeg: false },
      { name: 'Veg Tempura Roll', description: 'Crispy vegetable tempura', price: 319, rating: 4.4, isVeg: true },
      { name: 'Rainbow Roll', description: 'Assorted fish over California roll', price: 499, rating: 4.9, isVeg: false },
    ]),
  },

  // Mexican
  {
    id: 'casa-taco',
    categoryId: 'mexican',
    name: 'Casa Taco',
    tagline: 'Street-style Mexican',
    image: cover('mexican'),
    rating: 4.6,
    deliveryTime: '20–25 min',
    priceRange: '₹₹',
    distance: '1.0 km',
    menu: menu('mexican', 'casa-taco', '22 min', [
      { name: 'Street-Style Tacos', description: 'Charred corn tortillas, salsa verde', price: 259, rating: 4.6, isVeg: true },
      { name: 'Chicken Quesadilla', description: 'Melted cheese, grilled chicken', price: 319, rating: 4.5, isVeg: false },
      { name: 'Veg Burrito Bowl', description: 'Rice, beans, pico de gallo', price: 279, rating: 4.4, isVeg: true },
      { name: 'Loaded Nachos', description: 'Cheese sauce, jalapeños, guac', price: 299, rating: 4.6, isVeg: true },
    ]),
  },
  {
    id: 'el-fuego',
    categoryId: 'mexican',
    name: 'El Fuego',
    tagline: 'Bold flavors, fire-grilled',
    image: cover('mexican'),
    rating: 4.5,
    deliveryTime: '25–30 min',
    priceRange: '₹₹',
    distance: '1.8 km',
    menu: menu('mexican', 'el-fuego', '27 min', [
      { name: 'Carnitas Burrito', description: 'Slow-braised pork, rice, beans', price: 349, rating: 4.6, isVeg: false },
      { name: 'Veggie Fajitas', description: 'Sizzling peppers & onions', price: 289, rating: 4.4, isVeg: true },
      { name: 'Churro Bites', description: 'Cinnamon sugar, chocolate dip', price: 149, rating: 4.7, isVeg: true },
      { name: 'Spicy Chicken Tacos', description: 'Chipotle-marinated chicken', price: 309, rating: 4.5, isVeg: false },
    ]),
  },

  // Chicken
  {
    id: 'crispy-nest',
    categoryId: 'chicken',
    name: 'Crispy Nest',
    tagline: 'Double-fried, always crunchy',
    image: cover('chicken'),
    rating: 4.7,
    deliveryTime: '22–27 min',
    priceRange: '₹₹',
    distance: '1.1 km',
    menu: menu('chicken', 'crispy-nest', '25 min', [
      { name: 'Crispy Fried Chicken', description: 'Buttermilk-brined, double-fried', price: 329, rating: 4.7, isVeg: false },
      { name: 'Peri Peri Wings', description: 'Fiery peri peri glaze', price: 289, rating: 4.6, isVeg: false },
      { name: 'Chicken Popcorn', description: 'Bite-sized, extra crispy', price: 249, rating: 4.5, isVeg: false },
      { name: 'Grilled Chicken Platter', description: 'Herb-marinated, char-grilled', price: 399, rating: 4.6, isVeg: false },
    ]),
  },
  {
    id: 'southern-bucket',
    categoryId: 'chicken',
    name: 'Southern Bucket',
    tagline: 'Classic Southern-style fried',
    image: cover('chicken'),
    rating: 4.6,
    deliveryTime: '25–30 min',
    priceRange: '₹₹',
    distance: '1.9 km',
    menu: menu('chicken', 'southern-bucket', '27 min', [
      { name: 'Classic Bucket (6pc)', description: 'Original recipe, family size', price: 499, rating: 4.7, isVeg: false },
      { name: 'Hot Honey Wings', description: 'Sweet heat glaze', price: 319, rating: 4.6, isVeg: false },
      { name: 'Chicken Tenders', description: 'Hand-breaded, dipping sauce', price: 279, rating: 4.5, isVeg: false },
      { name: 'Loaded Chicken Fries', description: 'Cheese sauce, crispy bits', price: 339, rating: 4.6, isVeg: false },
    ]),
  },

  // Healthy
  {
    id: 'green-bowl-kitchen',
    categoryId: 'healthy',
    name: 'Green Bowl Kitchen',
    tagline: 'Clean eating, big flavor',
    image: cover('healthy'),
    rating: 4.5,
    deliveryTime: '15–20 min',
    priceRange: '₹',
    distance: '0.5 km',
    menu: menu('healthy', 'green-bowl-kitchen', '18 min', [
      { name: 'Harvest Salad Bowl', description: 'Quinoa, roasted veg, tahini', price: 279, rating: 4.5, isVeg: true },
      { name: 'Quinoa Power Bowl', description: 'Chickpeas, avocado, greens', price: 299, rating: 4.6, isVeg: true },
      { name: 'Grilled Chicken Salad', description: 'Lean protein, citrus dressing', price: 319, rating: 4.5, isVeg: false },
      { name: 'Avocado Toast', description: 'Multigrain, chili flakes', price: 249, rating: 4.4, isVeg: true },
    ]),
  },
  {
    id: 'clean-plate-co',
    categoryId: 'healthy',
    name: 'Clean Plate Co.',
    tagline: 'Nutrient-dense, no compromise',
    image: cover('healthy'),
    rating: 4.6,
    deliveryTime: '18–23 min',
    priceRange: '₹₹',
    distance: '1.0 km',
    menu: menu('healthy', 'clean-plate-co', '20 min', [
      { name: 'Buddha Bowl', description: 'Sweet potato, kale, seeds', price: 289, rating: 4.5, isVeg: true },
      { name: 'Protein Power Plate', description: 'Grilled chicken, brown rice', price: 349, rating: 4.6, isVeg: false },
      { name: 'Detox Green Salad', description: 'Spinach, cucumber, lemon', price: 259, rating: 4.4, isVeg: true },
      { name: 'Overnight Oats', description: 'Berries, chia, almond milk', price: 199, rating: 4.5, isVeg: true },
    ]),
  },

  // Desserts
  {
    id: 'sweet-tooth',
    categoryId: 'desserts',
    name: 'Sweet Tooth',
    tagline: 'Handcrafted daily',
    image: cover('desserts'),
    rating: 4.8,
    deliveryTime: '15–20 min',
    priceRange: '₹',
    distance: '0.9 km',
    menu: menu('desserts', 'sweet-tooth', '15 min', [
      { name: 'Molten Chocolate Cake', description: 'Warm centre, vanilla ice cream', price: 199, rating: 4.9, isVeg: true },
      { name: 'Red Velvet Slice', description: 'Cream cheese frosting', price: 179, rating: 4.7, isVeg: true },
      { name: 'Tiramisu Cup', description: 'Espresso-soaked layers', price: 219, rating: 4.8, isVeg: true },
      { name: 'Belgian Waffle', description: 'Maple syrup, whipped cream', price: 229, rating: 4.7, isVeg: true },
    ]),
  },
  {
    id: 'le-dessert-bar',
    categoryId: 'desserts',
    name: 'Le Dessert Bar',
    tagline: 'French-inspired patisserie',
    image: cover('desserts'),
    rating: 4.7,
    deliveryTime: '20–25 min',
    priceRange: '₹₹',
    distance: '1.5 km',
    menu: menu('desserts', 'le-dessert-bar', '22 min', [
      { name: 'New York Cheesecake', description: 'Classic, buttery biscuit base', price: 249, rating: 4.8, isVeg: true },
      { name: 'Brownie Sundae', description: 'Fudge brownie, ice cream, nuts', price: 229, rating: 4.7, isVeg: true },
      { name: 'Macaron Box (6pc)', description: 'Assorted flavors', price: 299, rating: 4.6, isVeg: true },
      { name: 'Panna Cotta', description: 'Vanilla bean, berry compote', price: 189, rating: 4.6, isVeg: true },
    ]),
  },

  // Drinks
  {
    id: 'brew-and-bean',
    categoryId: 'drinks',
    name: 'Brew & Bean',
    tagline: 'Small-batch coffee',
    image: cover('drinks'),
    rating: 4.6,
    deliveryTime: '12–17 min',
    priceRange: '₹',
    distance: '0.4 km',
    menu: menu('drinks', 'brew-and-bean', '14 min', [
      { name: 'Cold Brew Coffee', description: '18-hour slow steeped', price: 149, rating: 4.6, isVeg: true },
      { name: 'Caramel Latte', description: 'House caramel, steamed milk', price: 179, rating: 4.5, isVeg: true },
      { name: 'Iced Matcha', description: 'Ceremonial-grade matcha', price: 199, rating: 4.6, isVeg: true },
      { name: 'Cappuccino', description: 'Double shot, micro-foam', price: 159, rating: 4.5, isVeg: true },
    ]),
  },
  {
    id: 'sip-society',
    categoryId: 'drinks',
    name: 'Sip Society',
    tagline: 'Juices, teas & more',
    image: cover('drinks'),
    rating: 4.5,
    deliveryTime: '15–20 min',
    priceRange: '₹',
    distance: '0.7 km',
    menu: menu('drinks', 'sip-society', '17 min', [
      { name: 'Mango Smoothie', description: 'Fresh mango, yoghurt', price: 179, rating: 4.6, isVeg: true },
      { name: 'Fresh Lime Soda', description: 'Sweet, salted, or mixed', price: 99, rating: 4.4, isVeg: true },
      { name: 'Boba Milk Tea', description: 'Classic tapioca pearls', price: 219, rating: 4.7, isVeg: true },
      { name: 'Masala Chai', description: 'Spiced, slow-brewed', price: 89, rating: 4.5, isVeg: true },
    ]),
  },
]

export function getBrandsByCategory(categoryId: string) {
  return brands.filter((b) => b.categoryId === categoryId)
}

export function getBrandById(brandId: string) {
  return brands.find((b) => b.id === brandId)
}
