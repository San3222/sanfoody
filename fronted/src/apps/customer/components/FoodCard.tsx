import { useState } from 'react'
import { motion, useMotionTemplate, useTransform } from 'motion/react'
import { Clock, Heart, Plus, Star } from 'lucide-react'
import type { FoodItem } from '@/data/foods'
import { useParallax } from '@/hooks/useParallax'
import { useCart } from '@/context/useCart'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/context/useFavorites'

export function FoodCard({ food }: { food: FoodItem }) {
  const { ref, x, y, onMouseMove, onMouseLeave } = useParallax<HTMLDivElement>()
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(`food:${food.id}`)  // 🔥 Format: food:itemId

  // Card tilts on X/Y, image drifts opposite direction at a different rate —
  // this is what gives the card a sense of layered depth (the "4D" feel).
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8])
  const imageX = useTransform(x, [-0.5, 0.5], [6, -6])
  const imageY = useTransform(y, [-0.5, 0.5], [6, -6])
  const glarePosition = useMotionTemplate`${useTransform(x, [-0.5, 0.5], [0, 100])}% ${useTransform(y, [-0.5, 0.5], [0, 100])}%`

  const handleAdd = () => {
    addItem(food)
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 900)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft transform-3d"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-3xl bg-beige">
        <motion.img
          style={{ x: imageX, y: imageY }}
          src={food.image}
          alt={food.name}
          loading="lazy"
          width={600}
          height={600}
          className="h-full w-full scale-110 object-cover transition-transform duration-500 group-hover:scale-125"
        />
        {/* Cursor-following glare for extra dimensionality */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`radial-gradient(180px circle at ${glarePosition}, rgba(255,255,255,0.35), transparent 70%)`,
          }}
        />

        <button
          type="button"
          onClick={() => toggleFavorite(`food:${food.id}`)}  // 🔥 Backend favorite toggle
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={favorited}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-charcoal/60 shadow-soft backdrop-blur-sm transition-transform hover:scale-110"
        >
          <Heart
            className={cn('h-4 w-4 transition-colors', favorited && 'fill-tomato text-tomato')}
            strokeWidth={2}
          />
        </button>

        <span
          className={cn(
            'absolute left-3 top-3 grid h-5 w-5 place-items-center rounded border-2',
            food.isVeg ? 'border-fresh-green' : 'border-tomato',
          )}
          aria-label={food.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
          title={food.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
        >
          <span className={cn('h-2 w-2 rounded-full', food.isVeg ? 'bg-fresh-green' : 'bg-tomato')} />
        </span>
      </div>

      {/* Content */}
      <div className="p-5" style={{ transform: 'translateZ(20px)' }}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-bold leading-tight text-charcoal">{food.name}</h3>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-beige px-2 py-1 text-xs font-semibold text-charcoal">
            <Star className="h-3 w-3 fill-gold text-gold" />
            {food.rating}
          </div>
        </div>
        <p className="mt-1.5 text-sm text-warm-gray">{food.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-extrabold text-charcoal">₹{food.price}</span>
            <span className="flex items-center gap-1 text-xs text-warm-gray">
              <Clock className="h-3 w-3" />
              {food.deliveryTime}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={cn(
              'relative grid h-9 w-9 place-items-center overflow-hidden rounded-full text-cream shadow-warm transition-all duration-300',
              justAdded ? 'w-24 bg-fresh-green' : 'bg-linear-to-br from-tomato to-orange hover:scale-110',
            )}
            aria-label={`Add ${food.name} to cart`}
          >
            {justAdded ? (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold"
              >
                Added ✓
              </motion.span>
            ) : (
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}