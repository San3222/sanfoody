import { AnimatePresence, motion } from 'motion/react'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/useCart'
import { DELIVERY_FEE } from '@/lib/constants'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export function CartDrawer() {
  const { items, isOpen, close, incrementItem, decrementItem, removeItem, subtotal } = useCart()
  const panelRef = useFocusTrap<HTMLElement>(isOpen)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-70 flex w-full max-w-md flex-col bg-cream shadow-warm"
          >
            <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-5">
              <h2 className="font-display text-lg font-bold text-charcoal">Your cart</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <ShoppingBag className="h-10 w-10 text-warm-gray" strokeWidth={1.5} />
                <p className="text-warm-gray">Your cart is empty. Add something delicious.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="flex flex-col gap-4">
                    <AnimatePresence initial={false}>
                      {items.map((line) => (
                        <motion.li
                          key={line.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex gap-3"
                        >
                          <img
                            src={line.image}
                            alt={line.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 shrink-0 rounded-xl object-cover"
                          />
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-semibold text-charcoal">{line.name}</span>
                              <button
                                type="button"
                                onClick={() => removeItem(line.id)}
                                aria-label={`Remove ${line.name}`}
                                className="text-warm-gray hover:text-tomato"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 rounded-full border border-charcoal/10 px-1.5 py-1">
                                <button
                                  type="button"
                                  onClick={() => decrementItem(line.id)}
                                  aria-label={`Decrease ${line.name} quantity`}
                                  className="grid h-6 w-6 place-items-center rounded-full text-charcoal/70 hover:bg-beige"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-4 text-center text-sm font-semibold">{line.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => incrementItem(line.id)}
                                  aria-label={`Increase ${line.name} quantity`}
                                  className="grid h-6 w-6 place-items-center rounded-full text-charcoal/70 hover:bg-beige"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="font-display text-sm font-bold text-charcoal">
                                ₹{line.price * line.quantity}
                              </span>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <div className="border-t border-charcoal/10 px-6 py-5">
                  <div className="flex items-center justify-between text-sm text-warm-gray">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-sm text-warm-gray">
                    <span>Delivery fee</span>
                    <span>₹{DELIVERY_FEE}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-charcoal/10 pt-3">
                    <span className="font-display font-bold text-charcoal">Total</span>
                    <span className="font-display text-lg font-extrabold text-charcoal">
                      ₹{subtotal + DELIVERY_FEE}
                    </span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={close}
                    className="mt-5 block w-full rounded-full bg-linear-to-r from-tomato to-orange py-3.5 text-center text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Checkout · ₹{subtotal + DELIVERY_FEE}
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}