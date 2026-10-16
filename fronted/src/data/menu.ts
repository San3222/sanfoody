import type { FoodItem } from '@/data/foods'

export interface Brand {
  id: string
  categoryId: string
  name: string
  tagline: string
  image: string
  cuisine: string
  rating: number
  deliveryTime: string
  priceRange: '₹' | '₹₹' | '₹₹₹'
}

export interface FlavorItem extends FoodItem {
  brandId: string
}

const img = (id: string, w = 700, h = 700) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`

const CATEGORY_IMAGE: Record<string, string> = {
  pizza: 'photo-1513104890138-7c749659a591',
  burgers: 'photo-1568901346375-23c9450c58cd',
  noodles: 'photo-1569718212165-3a8278d5f624',
  sushi: 'photo-1579584425555-c3ce17fd4351',
  mexican: 'photo-1552332386-f8dd00dc2f85',
  chicken: 'photo-1562967914-608f82629710',
  healthy: 'photo-1512621776951-a57141f2eefd',
  desserts: 'photo-1578985545062-69928b1d9587',
  drinks: 'photo-1495474472287-4d71bcdd2085',
}

export const brands: Brand[] = [
  // Pizza
  { id: 'bella-forno', categoryId: 'pizza', name: 'Bella Forno', tagline: 'Wood-fired, Naples style', image: img(CATEGORY_IMAGE.pizza, 800, 600), cuisine: 'Italian · Pizza', rating: 4.8, deliveryTime: '25–30 min', priceRange: '₹₹' },
  { id: 'crust-culture', categoryId: 'pizza', name: 'Crust Culture', tagline: 'Detroit-style deep dish', image: img(CATEGORY_IMAGE.pizza, 800, 601), cuisine: 'American · Pizza', rating: 4.6, deliveryTime: '30–35 min', priceRange: '₹₹' },

  // Burgers
  { id: 'smoke-grill-co', categoryId: 'burgers', name: 'Smoke & Grill Co.', tagline: 'Charcoal-grilled patties', image: img(CATEGORY_IMAGE.burgers, 800, 600), cuisine: 'American · Burgers', rating: 4.7, deliveryTime: '20–25 min', priceRange: '₹₹' },
  { id: 'patty-house', categoryId: 'burgers', name: 'Patty House', tagline: 'Smash burgers, done right', image: img(CATEGORY_IMAGE.burgers, 800, 601), cuisine: 'American · Burgers', rating: 4.5, deliveryTime: '18–24 min', priceRange: '₹' },

  // Noodles
  { id: 'ramen-lab', categoryId: 'noodles', name: 'Ramen Lab', tagline: '18-hour tonkotsu broth', image: img(CATEGORY_IMAGE.noodles, 800, 600), cuisine: 'Japanese · Ramen', rating: 4.9, deliveryTime: '30–35 min', priceRange: '₹₹' },
  { id: 'wok-street', categoryId: 'noodles', name: 'Wok Street', tagline: 'Hand-pulled noodles', image: img(CATEGORY_IMAGE.noodles, 800, 601), cuisine: 'Pan-Asian · Noodles', rating: 4.6, deliveryTime: '22–28 min', priceRange: '₹' },

  // Sushi
  { id: 'sakura-house', categoryId: 'sushi', name: 'Sakura House', tagline: 'Sushi-grade, daily catch', image: img(CATEGORY_IMAGE.sushi, 800, 600), cuisine: 'Japanese · Sushi', rating: 4.9, deliveryTime: '30–35 min', priceRange: '₹₹₹' },
  { id: 'nori-bar', categoryId: 'sushi', name: 'Nori Bar', tagline: 'Modern fusion rolls', image: img(CATEGORY_IMAGE.sushi, 800, 601), cuisine: 'Japanese · Sushi', rating: 4.7, deliveryTime: '28–32 min', priceRange: '₹₹' },

  // Mexican
  { id: 'casa-taco', categoryId: 'mexican', name: 'Casa Taco', tagline: 'Street-style, since day one', image: img(CATEGORY_IMAGE.mexican, 800, 600), cuisine: 'Mexican', rating: 4.6, deliveryTime: '20–25 min', priceRange: '₹' },
  { id: 'el-fuego', categoryId: 'mexican', name: 'El Fuego', tagline: 'Fire-grilled, bold salsas', image: img(CATEGORY_IMAGE.mexican, 800, 601), cuisine: 'Mexican', rating: 4.5, deliveryTime: '25–30 min', priceRange: '₹₹' },

  // Chicken
  { id: 'crispy-co', categoryId: 'chicken', name: 'Crispy Co.', tagline: 'Buttermilk-brined, double-fried', image: img(CATEGORY_IMAGE.chicken, 800, 600), cuisine: 'American · Fried Chicken', rating: 4.7, deliveryTime: '20–25 min', priceRange: '₹₹' },
  { id: 'flame-feathers', categoryId: 'chicken', name: 'Flame & Feathers', tagline: 'Peri-peri grilled chicken', image: img(CATEGORY_IMAGE.chicken, 800, 601), cuisine: 'Portuguese · Grilled', rating: 4.6, deliveryTime: '22–28 min', priceRange: '₹₹' },

  // Healthy
  { id: 'green-bowl', categoryId: 'healthy', name: 'Green Bowl Kitchen', tagline: 'Clean eating, real flavor', image: img(CATEGORY_IMAGE.healthy, 800, 600), cuisine: 'Healthy · Salads', rating: 4.5, deliveryTime: '15–20 min', priceRange: '₹' },
  { id: 'the-macro-lab', categoryId: 'healthy', name: 'The Macro Lab', tagline: 'Protein-forward bowls', image: img(CATEGORY_IMAGE.healthy, 800, 601), cuisine: 'Healthy · Bowls', rating: 4.6, deliveryTime: '18–22 min', priceRange: '₹₹' },

  // Desserts
  { id: 'sugar-and-smoke', categoryId: 'desserts', name: 'Sugar & Smoke', tagline: 'Small-batch, made daily', image: img(CATEGORY_IMAGE.desserts, 800, 600), cuisine: 'Desserts · Bakery', rating: 4.9, deliveryTime: '15–20 min', priceRange: '₹₹' },
  { id: 'the-cocoa-room', categoryId: 'desserts', name: 'The Cocoa Room', tagline: 'Belgian chocolate specialists', image: img(CATEGORY_IMAGE.desserts, 800, 601), cuisine: 'Desserts · Chocolate', rating: 4.7, deliveryTime: '18–22 min', priceRange: '₹₹' },

  // Drinks
  { id: 'brew-and-bloom', categoryId: 'drinks', name: 'Brew & Bloom', tagline: 'Single-origin, slow-brewed', image: img(CATEGORY_IMAGE.drinks, 800, 600), cuisine: 'Coffee · Beverages', rating: 4.6, deliveryTime: '12–18 min', priceRange: '₹' },
  { id: 'juice-theory', categoryId: 'drinks', name: 'Juice Theory', tagline: 'Cold-pressed, no added sugar', image: img(CATEGORY_IMAGE.drinks, 800, 601), cuisine: 'Juices · Smoothies', rating: 4.5, deliveryTime: '15–20 min', priceRange: '₹' },
]

export const flavors: FlavorItem[] = [
  // Bella Forno
  { id: 'bf-margherita', brandId: 'bella-forno', name: 'Margherita', description: 'San Marzano tomato, fior di latte, basil', image: img(CATEGORY_IMAGE.pizza, 600, 600), price: 299, rating: 4.8, deliveryTime: '25 min', isVeg: true },
  { id: 'bf-diavola', brandId: 'bella-forno', name: 'Diavola', description: 'Spicy salami, chili oil, mozzarella', image: img(CATEGORY_IMAGE.pizza, 601, 600), price: 349, rating: 4.7, deliveryTime: '25 min', isVeg: false },
  { id: 'bf-quattro-formaggi', brandId: 'bella-forno', name: 'Quattro Formaggi', description: 'Mozzarella, gorgonzola, parmesan, fontina', image: img(CATEGORY_IMAGE.pizza, 602, 600), price: 379, rating: 4.6, deliveryTime: '25 min', isVeg: true },

  // Crust Culture
  { id: 'cc-detroit-classic', brandId: 'crust-culture', name: 'Detroit Classic', description: 'Crispy-edge deep dish, brick cheese', image: img(CATEGORY_IMAGE.pizza, 603, 600), price: 329, rating: 4.6, deliveryTime: '32 min', isVeg: true },
  { id: 'cc-pepperoni-cup', brandId: 'crust-culture', name: 'Pepperoni Cup & Char', description: 'Curled pepperoni, honey drizzle', image: img(CATEGORY_IMAGE.pizza, 604, 600), price: 369, rating: 4.7, deliveryTime: '32 min', isVeg: false },
  { id: 'cc-veggie-supreme', brandId: 'crust-culture', name: 'Veggie Supreme', description: 'Bell pepper, olives, onion, mushroom', image: img(CATEGORY_IMAGE.pizza, 605, 600), price: 319, rating: 4.5, deliveryTime: '32 min', isVeg: true },

  // Smoke & Grill Co.
  { id: 'sg-double-smash', brandId: 'smoke-grill-co', name: 'Double Smash Burger', description: 'Charred beef patties, cheddar, house sauce', image: img(CATEGORY_IMAGE.burgers, 600, 600), price: 349, rating: 4.7, deliveryTime: '22 min', isVeg: false },
  { id: 'sg-bbq-bacon', brandId: 'smoke-grill-co', name: 'BBQ Bacon Stack', description: 'Applewood bacon, smoked BBQ glaze', image: img(CATEGORY_IMAGE.burgers, 601, 600), price: 389, rating: 4.8, deliveryTime: '22 min', isVeg: false },
  { id: 'sg-veg-smokehouse', brandId: 'smoke-grill-co', name: 'Veg Smokehouse', description: 'Grilled mushroom patty, smoked gouda', image: img(CATEGORY_IMAGE.burgers, 602, 600), price: 289, rating: 4.4, deliveryTime: '22 min', isVeg: true },

  // Patty House
  { id: 'ph-classic-smash', brandId: 'patty-house', name: 'Classic Smash', description: 'Griddle-smashed patty, American cheese', image: img(CATEGORY_IMAGE.burgers, 603, 600), price: 249, rating: 4.5, deliveryTime: '20 min', isVeg: false },
  { id: 'ph-spicy-jalapeno', brandId: 'patty-house', name: 'Spicy Jalapeño', description: 'Pickled jalapeño, chipotle mayo', image: img(CATEGORY_IMAGE.burgers, 604, 600), price: 269, rating: 4.6, deliveryTime: '20 min', isVeg: false },
  { id: 'ph-mushroom-swiss', brandId: 'patty-house', name: 'Mushroom Swiss', description: 'Sautéed mushroom, melted swiss', image: img(CATEGORY_IMAGE.burgers, 605, 600), price: 259, rating: 4.4, deliveryTime: '20 min', isVeg: false },

  // Ramen Lab
  { id: 'rl-tonkotsu', brandId: 'ramen-lab', name: 'Tonkotsu Ramen', description: 'Slow-simmered pork broth, soft egg', image: img(CATEGORY_IMAGE.noodles, 600, 600), price: 379, rating: 4.9, deliveryTime: '30 min', isVeg: false },
  { id: 'rl-miso', brandId: 'ramen-lab', name: 'Miso Ramen', description: 'Fermented miso broth, sweet corn', image: img(CATEGORY_IMAGE.noodles, 601, 600), price: 349, rating: 4.7, deliveryTime: '30 min', isVeg: true },
  { id: 'rl-spicy-tantanmen', brandId: 'ramen-lab', name: 'Spicy Tantanmen', description: 'Sesame chili broth, minced pork', image: img(CATEGORY_IMAGE.noodles, 602, 600), price: 389, rating: 4.8, deliveryTime: '30 min', isVeg: false },

  // Wok Street
  { id: 'ws-dan-dan', brandId: 'wok-street', name: 'Dan Dan Noodles', description: 'Hand-pulled, chili-sesame sauce', image: img(CATEGORY_IMAGE.noodles, 603, 600), price: 289, rating: 4.6, deliveryTime: '24 min', isVeg: true },
  { id: 'ws-pad-thai', brandId: 'wok-street', name: 'Pad Thai', description: 'Tamarind, peanut, fresh lime', image: img(CATEGORY_IMAGE.noodles, 604, 600), price: 299, rating: 4.7, deliveryTime: '24 min', isVeg: false },
  { id: 'ws-veg-hakka', brandId: 'wok-street', name: 'Veg Hakka Noodles', description: 'Wok-tossed, soy-garlic, crunchy veg', image: img(CATEGORY_IMAGE.noodles, 605, 600), price: 249, rating: 4.4, deliveryTime: '24 min', isVeg: true },

  // Sakura House
  { id: 'sh-salmon-platter', brandId: 'sakura-house', name: 'Salmon Sushi Platter', description: 'Hand-rolled, sushi-grade salmon', image: img(CATEGORY_IMAGE.sushi, 600, 600), price: 449, rating: 4.8, deliveryTime: '32 min', isVeg: false },
  { id: 'sh-dragon-roll', brandId: 'sakura-house', name: 'Dragon Roll', description: 'Eel, avocado, unagi glaze', image: img(CATEGORY_IMAGE.sushi, 601, 600), price: 499, rating: 4.9, deliveryTime: '32 min', isVeg: false },
  { id: 'sh-veg-tempura-roll', brandId: 'sakura-house', name: 'Veg Tempura Roll', description: 'Crisp tempura veg, spicy mayo', image: img(CATEGORY_IMAGE.sushi, 602, 600), price: 349, rating: 4.5, deliveryTime: '32 min', isVeg: true },

  // Nori Bar
  { id: 'nb-rainbow-roll', brandId: 'nori-bar', name: 'Rainbow Roll', description: 'Tuna, salmon, yellowtail, avocado', image: img(CATEGORY_IMAGE.sushi, 603, 600), price: 469, rating: 4.7, deliveryTime: '29 min', isVeg: false },
  { id: 'nb-spicy-tuna', brandId: 'nori-bar', name: 'Spicy Tuna Roll', description: 'Sriracha mayo, scallion, sesame', image: img(CATEGORY_IMAGE.sushi, 604, 600), price: 399, rating: 4.6, deliveryTime: '29 min', isVeg: false },
  { id: 'nb-cucumber-avocado', brandId: 'nori-bar', name: 'Cucumber Avocado Roll', description: 'Fresh, light, sesame-crusted', image: img(CATEGORY_IMAGE.sushi, 605, 600), price: 269, rating: 4.4, deliveryTime: '29 min', isVeg: true },

  // Casa Taco
  { id: 'ct-street-tacos', brandId: 'casa-taco', name: 'Street-Style Tacos', description: 'Charred corn tortillas, salsa verde', image: img(CATEGORY_IMAGE.mexican, 600, 600), price: 259, rating: 4.6, deliveryTime: '22 min', isVeg: true },
  { id: 'ct-carnitas', brandId: 'casa-taco', name: 'Carnitas Tacos', description: 'Slow-braised pork, pickled onion', image: img(CATEGORY_IMAGE.mexican, 601, 600), price: 289, rating: 4.7, deliveryTime: '22 min', isVeg: false },
  { id: 'ct-burrito-bowl', brandId: 'casa-taco', name: 'Burrito Bowl', description: 'Cilantro rice, black beans, pico', image: img(CATEGORY_IMAGE.mexican, 602, 600), price: 299, rating: 4.5, deliveryTime: '22 min', isVeg: true },

  // El Fuego
  { id: 'ef-quesadilla', brandId: 'el-fuego', name: 'Loaded Quesadilla', description: 'Grilled chicken, three-cheese blend', image: img(CATEGORY_IMAGE.mexican, 603, 600), price: 319, rating: 4.5, deliveryTime: '27 min', isVeg: false },
  { id: 'ef-nachos', brandId: 'el-fuego', name: 'Fire Nachos', description: 'Jalapeño, queso, chipotle crema', image: img(CATEGORY_IMAGE.mexican, 604, 600), price: 279, rating: 4.6, deliveryTime: '27 min', isVeg: true },
  { id: 'ef-fajita-bowl', brandId: 'el-fuego', name: 'Steak Fajita Bowl', description: 'Char-grilled steak, peppers, onion', image: img(CATEGORY_IMAGE.mexican, 605, 600), price: 359, rating: 4.7, deliveryTime: '27 min', isVeg: false },

  // Crispy Co.
  { id: 'cr-crispy-chicken', brandId: 'crispy-co', name: 'Crispy Fried Chicken', description: 'Buttermilk-brined, double-fried', image: img(CATEGORY_IMAGE.chicken, 600, 600), price: 329, rating: 4.7, deliveryTime: '24 min', isVeg: false },
  { id: 'cr-hot-honey', brandId: 'crispy-co', name: 'Hot Honey Tenders', description: 'Spiced batter, honey drizzle', image: img(CATEGORY_IMAGE.chicken, 601, 600), price: 309, rating: 4.8, deliveryTime: '24 min', isVeg: false },
  { id: 'cr-chicken-burger', brandId: 'crispy-co', name: 'Crispy Chicken Burger', description: 'Slaw, pickles, spicy mayo', image: img(CATEGORY_IMAGE.chicken, 602, 600), price: 279, rating: 4.6, deliveryTime: '24 min', isVeg: false },

  // Flame & Feathers
  { id: 'ff-peri-peri', brandId: 'flame-feathers', name: 'Peri-Peri Half Chicken', description: 'Flame-grilled, chili-lime marinade', image: img(CATEGORY_IMAGE.chicken, 603, 600), price: 399, rating: 4.7, deliveryTime: '26 min', isVeg: false },
  { id: 'ff-lemon-herb', brandId: 'flame-feathers', name: 'Lemon Herb Wings', description: 'Zesty citrus, fresh herbs', image: img(CATEGORY_IMAGE.chicken, 604, 600), price: 269, rating: 4.5, deliveryTime: '26 min', isVeg: false },
  { id: 'ff-smoky-bbq', brandId: 'flame-feathers', name: 'Smoky BBQ Drumsticks', description: 'Charred, sticky BBQ glaze', image: img(CATEGORY_IMAGE.chicken, 605, 600), price: 289, rating: 4.6, deliveryTime: '26 min', isVeg: false },

  // Green Bowl Kitchen
  { id: 'gb-harvest-bowl', brandId: 'green-bowl', name: 'Harvest Salad Bowl', description: 'Quinoa, roasted veg, tahini dressing', image: img(CATEGORY_IMAGE.healthy, 600, 600), price: 279, rating: 4.5, deliveryTime: '17 min', isVeg: true },
  { id: 'gb-grilled-chicken-salad', brandId: 'green-bowl', name: 'Grilled Chicken Salad', description: 'Lean protein, citrus vinaigrette', image: img(CATEGORY_IMAGE.healthy, 601, 600), price: 319, rating: 4.6, deliveryTime: '17 min', isVeg: false },
  { id: 'gb-detox-bowl', brandId: 'green-bowl', name: 'Detox Green Bowl', description: 'Kale, cucumber, avocado, lemon', image: img(CATEGORY_IMAGE.healthy, 602, 600), price: 259, rating: 4.4, deliveryTime: '17 min', isVeg: true },

  // The Macro Lab
  { id: 'ml-protein-power', brandId: 'the-macro-lab', name: 'Protein Power Bowl', description: 'Grilled paneer, chickpeas, brown rice', image: img(CATEGORY_IMAGE.healthy, 603, 600), price: 329, rating: 4.6, deliveryTime: '20 min', isVeg: true },
  { id: 'ml-lean-turkey', brandId: 'the-macro-lab', name: 'Lean Turkey Bowl', description: 'Turkey breast, sweet potato mash', image: img(CATEGORY_IMAGE.healthy, 604, 600), price: 359, rating: 4.7, deliveryTime: '20 min', isVeg: false },
  { id: 'ml-quinoa-power', brandId: 'the-macro-lab', name: 'Quinoa Power Salad', description: 'Tri-color quinoa, roasted veg', image: img(CATEGORY_IMAGE.healthy, 605, 600), price: 289, rating: 4.4, deliveryTime: '20 min', isVeg: true },

  // Sugar & Smoke
  { id: 'ss-molten-cake', brandId: 'sugar-and-smoke', name: 'Molten Chocolate Cake', description: 'Warm centre, vanilla bean ice cream', image: img(CATEGORY_IMAGE.desserts, 600, 600), price: 199, rating: 4.9, deliveryTime: '17 min', isVeg: true },
  { id: 'ss-cheesecake', brandId: 'sugar-and-smoke', name: 'New York Cheesecake', description: 'Classic, graham crust, berry compote', image: img(CATEGORY_IMAGE.desserts, 601, 600), price: 229, rating: 4.7, deliveryTime: '17 min', isVeg: true },
  { id: 'ss-tiramisu', brandId: 'sugar-and-smoke', name: 'Tiramisu Cup', description: 'Espresso-soaked, mascarpone cream', image: img(CATEGORY_IMAGE.desserts, 602, 600), price: 219, rating: 4.8, deliveryTime: '17 min', isVeg: true },

  // The Cocoa Room
  { id: 'tc-belgian-brownie', brandId: 'the-cocoa-room', name: 'Belgian Brownie', description: 'Dark chocolate, walnut, fudge core', image: img(CATEGORY_IMAGE.desserts, 603, 600), price: 189, rating: 4.8, deliveryTime: '19 min', isVeg: true },
  { id: 'tc-choco-lava', brandId: 'the-cocoa-room', name: 'Choco Lava Cups', description: 'Twin lava cups, hazelnut crumble', image: img(CATEGORY_IMAGE.desserts, 604, 600), price: 229, rating: 4.7, deliveryTime: '19 min', isVeg: true },
  { id: 'tc-truffle-box', brandId: 'the-cocoa-room', name: 'Assorted Truffle Box', description: 'Six handcrafted Belgian truffles', image: img(CATEGORY_IMAGE.desserts, 605, 600), price: 349, rating: 4.9, deliveryTime: '19 min', isVeg: true },

  // Brew & Bloom
  { id: 'bb-cold-brew', brandId: 'brew-and-bloom', name: 'Signature Cold Brew', description: '18-hour steeped, single-origin', image: img(CATEGORY_IMAGE.drinks, 600, 600), price: 179, rating: 4.6, deliveryTime: '13 min', isVeg: true },
  { id: 'bb-cappuccino', brandId: 'brew-and-bloom', name: 'Classic Cappuccino', description: 'Double shot, micro-foamed milk', image: img(CATEGORY_IMAGE.drinks, 601, 600), price: 159, rating: 4.7, deliveryTime: '13 min', isVeg: true },
  { id: 'bb-matcha-latte', brandId: 'brew-and-bloom', name: 'Matcha Latte', description: 'Ceremonial-grade, oat milk', image: img(CATEGORY_IMAGE.drinks, 602, 600), price: 199, rating: 4.5, deliveryTime: '13 min', isVeg: true },

  // Juice Theory
  { id: 'jt-green-detox', brandId: 'juice-theory', name: 'Green Detox', description: 'Kale, apple, cucumber, ginger', image: img(CATEGORY_IMAGE.drinks, 603, 600), price: 149, rating: 4.5, deliveryTime: '16 min', isVeg: true },
  { id: 'jt-berry-blast', brandId: 'juice-theory', name: 'Berry Blast Smoothie', description: 'Mixed berries, banana, almond milk', image: img(CATEGORY_IMAGE.drinks, 604, 600), price: 169, rating: 4.6, deliveryTime: '16 min', isVeg: true },
  { id: 'jt-citrus-immunity', brandId: 'juice-theory', name: 'Citrus Immunity Shot', description: 'Orange, turmeric, black pepper', image: img(CATEGORY_IMAGE.drinks, 605, 600), price: 129, rating: 4.4, deliveryTime: '16 min', isVeg: true },
]

export function getBrandsByCategory(categoryId: string) {
  return brands.filter((b) => b.categoryId === categoryId)
}

export function getFlavorsByBrand(brandId: string) {
  return flavors.filter((f) => f.brandId === brandId)
}

export function getBrandById(brandId: string) {
  return brands.find((b) => b.id === brandId)
}
