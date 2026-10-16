import { useRef } from 'react'
import { useMotionValue, useSpring } from 'motion/react'
import type { RefObject } from 'react'

/**
 * Tracks the pointer position inside a container and exposes it as two
 * springy motion values, normalized to a -0.5…0.5 range (0,0 = center).
 * Feed these into useTransform() to drive depth-based movement.
 */
export function useParallax<T extends HTMLElement>(): {
  ref: RefObject<T | null>
  x: ReturnType<typeof useSpring>
  y: ReturnType<typeof useSpring>
  onMouseMove: (e: React.MouseEvent<T>) => void
  onMouseLeave: () => void
} {
  const ref = useRef<T>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 120, damping: 20, mass: 0.5 })
  const y = useSpring(rawY, { stiffness: 120, damping: 20, mass: 0.5 })

  const onMouseMove = (e: React.MouseEvent<T>) => {
    const bounds = ref.current?.getBoundingClientRect()
    if (!bounds) return
    const px = (e.clientX - bounds.left) / bounds.width - 0.5
    const py = (e.clientY - bounds.top) / bounds.height - 0.5
    rawX.set(px)
    rawY.set(py)
  }

  const onMouseLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return { ref, x, y, onMouseMove, onMouseLeave }
}
