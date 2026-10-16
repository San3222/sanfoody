import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Calendar, Check, Clock, Users, X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

const TIME_SLOTS = ['12:30 PM', '1:00 PM', '1:30 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM']
const GUEST_COUNTS = [1, 2, 3, 4, 5, 6]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function BookTableModal({
  restaurantName,
  isOpen,
  onClose,
}: {
  restaurantName: string
  isOpen: boolean
  onClose: () => void
}) {
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen)
  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState(TIME_SLOTS[3])
  const [guests, setGuests] = useState(2)
  const [confirmed, setConfirmed] = useState(false)

  const handleClose = () => {
    onClose()
    // Reset after the exit animation finishes so it doesn't flash on reopen
    window.setTimeout(() => setConfirmed(false), 300)
  }

  const handleConfirm = () => setConfirmed(true)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Book a table"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-70 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-cream shadow-warm"
          >
            <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4">
              <h2 className="font-display text-lg font-bold text-charcoal">
                {confirmed ? 'Table Booked' : 'Book a Table'}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {confirmed ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-fresh-green/10">
                  <Check className="h-7 w-7 text-fresh-green" />
                </span>
                <p className="font-display text-lg font-bold text-charcoal">You&rsquo;re all set!</p>
                <p className="text-sm text-warm-gray">
                  Table for {guests} at <strong>{restaurantName}</strong>
                  <br />
                  {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {time}
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-semibold text-cream"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="px-6 py-5">
                <p className="mb-5 text-sm text-warm-gray">at {restaurantName}</p>

                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-charcoal">
                  <Calendar className="h-4 w-4" />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={todayISO()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm text-charcoal outline-none focus:border-tomato"
                />

                <label className="mb-1.5 mt-4 flex items-center gap-1.5 text-sm font-semibold text-charcoal">
                  <Clock className="h-4 w-4" />
                  Time
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      aria-pressed={time === slot}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        time === slot
                          ? 'border-tomato bg-tomato text-cream'
                          : 'border-charcoal/15 bg-white text-charcoal/70 hover:border-tomato/40'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                <label className="mb-1.5 mt-4 flex items-center gap-1.5 text-sm font-semibold text-charcoal">
                  <Users className="h-4 w-4" />
                  Guests
                </label>
                <div className="flex flex-wrap gap-2">
                  {GUEST_COUNTS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setGuests(count)}
                      aria-pressed={guests === count}
                      className={`h-9 w-9 rounded-full border text-sm font-semibold transition-colors ${
                        guests === count
                          ? 'border-tomato bg-tomato text-cream'
                          : 'border-charcoal/15 bg-white text-charcoal/70 hover:border-tomato/40'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="mt-6 w-full rounded-full bg-linear-to-r from-tomato to-orange py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Confirm Booking
                </button>
                <p className="mt-3 text-center text-xs text-warm-gray">
                  This is a demo booking — no real reservation is made.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}