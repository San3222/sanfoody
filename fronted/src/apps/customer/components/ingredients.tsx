// Small flat-vector garnish icons. Deliberately illustrative (not photographic)
// so they read as "floating seasoning" around the photographic centerpiece
// dish, rather than competing with it.

export function TomatoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M32 14c11 0 20 9.5 20 22s-9 22-20 22-20-9.5-20-22 9-22 20-22Z" fill="#E63946" />
      <path d="M32 14c6 3 9 9 8 15-6-1-11-6-12-13 1-1 2-2 4-2Z" fill="#B91C1C" opacity="0.35" />
      <path d="M25 8c2 3 4 5 7 6-1 2-2 4-2 6-3-1-6-4-7-8 1-2 1-3 2-4Z" fill="#16A34A" />
      <path d="M32 6c3 1 5 3 6 6-2 1-4 1-6 0-1-2-1-4 0-6Z" fill="#16A34A" />
    </svg>
  )
}

export function ChiliIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M14 22c8-6 14-10 14-10 2 4 1 8-2 11l14 15c4 4 4 10 0 14-4 4-10 4-14 0L11 37c-3-3-4-7-2-11 1-2 3-3 5-4Z"
        fill="#F97316"
      />
      <path d="M28 12c2-4 5-7 9-8-1 3-1 6 1 8-3 2-7 2-10 0Z" fill="#16A34A" />
    </svg>
  )
}

export function BasilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M32 6c12 2 20 12 20 24 0 4-1 7-3 10-3-10-9-17-17-21-8 4-14 11-17 21-2-3-3-6-3-10C12 18 20 8 32 6Z"
        fill="#16A34A"
      />
      <path d="M32 12v34" stroke="#0f7a34" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CheeseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M6 46 30 12l28 8-4 26H6Z" fill="#F59E0B" />
      <circle cx="20" cy="38" r="2.6" fill="#FEF3E2" />
      <circle cx="33" cy="30" r="2" fill="#FEF3E2" />
      <circle cx="42" cy="40" r="2.4" fill="#FEF3E2" />
    </svg>
  )
}

export function PepperIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="22" fill="#1F2937" />
      <circle cx="24" cy="24" r="2.2" fill="#6B7280" />
      <circle cx="34" cy="19" r="1.8" fill="#6B7280" />
      <circle cx="41" cy="30" r="2" fill="#6B7280" />
      <circle cx="26" cy="36" r="1.6" fill="#6B7280" />
      <circle cx="38" cy="40" r="2.2" fill="#6B7280" />
      <circle cx="20" cy="30" r="1.4" fill="#6B7280" />
    </svg>
  )
}
