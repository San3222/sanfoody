import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface GSAPScrollAnimationsProps {
  children?: React.ReactNode
}

export function GSAPScrollAnimations({ children }: GSAPScrollAnimationsProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // useGSAP automatically handles cleanup on unmount/route change
  useGSAP(
    () => {
      // Kill all existing ScrollTriggers first (route change pe purane cleanup)
      ScrollTrigger.getAll().forEach((st) => st.kill())

      // 1. Hero Section Pinning (isay hata diya hai kyunki yehi crash kar raha tha)
      // ScrollTrigger pinning React ke saath conflict karta hai. 
      // Agar pin karna hi hai toh alag se handle karna padega, 
      // lekin abhi ke liye isay remove karna safest hai.

      // 2. Fade Sections
      const sections = document.querySelectorAll('.fade-section')
      sections.forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        )
      })

      // 3. Stagger Cards
      const cards = document.querySelectorAll('.stagger-card')
      cards.forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: i * 0.08,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none none',
            }
          }
        )
      })

      // 4. Reveal Text
      const texts = document.querySelectorAll('.reveal-text')
      texts.forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        )
      })

      // 5. Slide Left
      const slideLefts = document.querySelectorAll('.slide-left')
      slideLefts.forEach((el, i) => {
        gsap.fromTo(el,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        )
      })

      // 6. Slide Right
      const slideRights = document.querySelectorAll('.slide-right')
      slideRights.forEach((el, i) => {
        gsap.fromTo(el,
          { x: 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        )
      })

      // 7. Scale Fade
      const scaleFades = document.querySelectorAll('.scale-fade')
      scaleFades.forEach((el, i) => {
        gsap.fromTo(el,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        )
      })

      // Refresh ScrollTrigger
      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [location.pathname] }
  )

  return <div ref={sectionRef}>{children}</div>
}