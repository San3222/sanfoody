import { motion } from 'motion/react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative grid h-9 w-9 place-items-center rounded-full transition-colors',
        'text-charcoal/70 hover:bg-white hover:text-tomato',
        'dark:text-cream/70 dark:hover:bg-charcoal/30 dark:hover:text-cream',
        className
      )}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
      >
        {theme === 'dark' ? (
          <Sun className="h-4.5 w-4.5" />
        ) : (
          <Moon className="h-4.5 w-4.5" />
        )}
      </motion.div>
    </button>
  )
}