# SanFoody — Full Homepage

Premium 4D food-experience homepage. React 19 + Vite + TypeScript + Tailwind
CSS v4, Motion, Lucide icons.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## Every section, and where it lives

| Section (as in the brief) | File |
|---|---|
| Navbar | `src/components/Navbar.tsx` |
| Hero | `src/components/Hero.tsx` |
| Food Categories | `src/components/FoodCategories.tsx` |
| Popular Food grid | `src/components/FoodGrid.tsx` (uses `FoodCard.tsx`) |
| 4D food card | `src/components/FoodCard.tsx` |
| Special Offer banner | `src/components/OfferBanner.tsx` |
| How It Works | `src/components/HowItWorks.tsx` |
| Restaurants + filters | `src/components/Restaurants.tsx` (uses `RestaurantCard.tsx`) |
| Search modal | `src/components/SearchModal.tsx` |
| Cart drawer | `src/components/CartDrawer.tsx` |
| Testimonials | `src/components/Testimonials.tsx` |
| App promo | `src/components/AppPromo.tsx` |
| Footer | `src/components/Footer.tsx` |

Data (edit these to change content — no component code touched):
`src/data/categories.ts`, `foods.ts`, `restaurants.ts`, `testimonials.ts`, `navigation.ts`.

State: `src/context/CartContext.tsx` + `src/context/useCart.ts` — real cart
logic (add/remove/qty), consumed by `FoodCard`, `Navbar`, and `CartDrawer`.

Everything is assembled in `src/pages/Home.tsx`, in this order:
Hero → FoodCategories → PopularFood → OfferBanner → HowItWorks →
Restaurants → Testimonials → AppPromo. Navbar, Footer, SearchModal, and
CartDrawer live in `src/components/Layout.tsx` and wrap every page.

## Routing (category → brand pages)

Clicking a category circle (Pizza, Burgers, ...) or a Popular Food category
now navigates to a real routed page instead of a same-page anchor:

- `/` — homepage
- `/explore/:categoryId` — `src/pages/CategoryPage.tsx`, lists every brand
  ("restaurant") serving that category. Clicking a category circle in
  `FoodCategories.tsx` routes here via `<Link to={`/explore/${category.id}`}>`.
- `/explore/:categoryId/:brandId` — `src/pages/BrandPage.tsx`, shows that
  brand's full menu (its "flavors"), reusing the same `FoodCard` component
  from the homepage — so Add to Cart, favoriting, and the 4D tilt all work
  identically here.

Brand + menu data lives in `src/data/menu.ts`:
- `brands: Brand[]` — one row per restaurant, tagged with `categoryId`.
- `flavors: FlavorItem[]` — one row per menu item, tagged with `brandId`.
- Helpers `getBrandsByCategory(categoryId)`, `getFlavorsByBrand(brandId)`,
  `getBrandById(brandId)` do the filtering — pages just call these.

**Add a new brand to a category** — add an object to `brands` in
`menu.ts` with a unique `id` and the right `categoryId`. It shows up on
`/explore/:categoryId` automatically.

**Add a flavor/menu item to a brand** — add an object to `flavors` with
that brand's `brandId`. It shows up on that brand's page automatically.

**Add a whole new category** — add it to `src/data/categories.ts` first
(so the homepage circle exists), then add at least one brand in `menu.ts`
with a matching `categoryId`.

If a `categoryId` or `brandId` in the URL doesn't exist in the data, both
pages redirect back to `/` (see the `Navigate` fallback in each page file).

## How to change or add things

**Edit copy/prices/images** — go to the matching file in `src/data/`, edit
the array. Every card/section reads from there, so you never touch JSX for
content changes.

**Add a new food item** — add an object to the `foods` array in
`src/data/foods.ts` with a unique `id`. It appears automatically in the
Popular Food grid and the app-promo phone preview.

**Add a new restaurant** — same idea, in `src/data/restaurants.ts`.

**Add a whole new section** — three steps:
1. Create `src/components/YourSection.tsx`, default pattern: a `<section>`
   with `id`, `max-w-7xl mx-auto px-5 sm:px-8` wrapper, heading using
   `font-display`, and `motion.div`/`whileInView` for scroll-reveal (copy the
   pattern from `HowItWorks.tsx` — it's the simplest one).
2. Import it in `src/App.tsx` and place it in the `<main>` list where you
   want it to appear.
3. If it needs a nav link, add `{ label: 'Your Label', href: '#your-id' }`
   to `src/data/navigation.ts`.

**Change colors/fonts** — all tokens are in `src/index.css` under `@theme`.
Change a hex value there and every component using that color updates
(e.g. `bg-tomato`, `text-charcoal`).

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

Verified: `tsc -b` clean, `oxlint` clean (0 errors), `vite build` clean.

## Notes

- Food/restaurant photos are hotlinked from Unsplash — swap the `image` URLs
  in `src/data/` for your own photography when ready.
- Testimonial avatars use randomuser.me placeholder portraits — swap for
  real customer photos when you have them.
- Cart and Search are fully functional (add/remove/qty, live totals, search
  suggestions) but there's no backend — checkout button is a visual
  end-point, ready for you to wire to a real API.
- Respects `prefers-reduced-motion` globally.
