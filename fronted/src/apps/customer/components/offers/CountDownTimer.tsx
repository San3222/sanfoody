import { useEffect, useState } from 'react'

function getRemaining(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now()
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true }
  const totalSeconds = Math.floor(diff / 1000)
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: false,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function CountdownTimer({ endsAt, className }: { endsAt: string; className?: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endsAt))

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining(endsAt)), 1000)
    return () => window.clearInterval(timer)
  }, [endsAt])

  if (remaining.expired) {
    return <span className={className}>Deal ended</span>
  }

  return (
    <span className={className} aria-live="off">
      {pad(remaining.hours)}h : {pad(remaining.minutes)}m : {pad(remaining.seconds)}s
    </span>
  )
}