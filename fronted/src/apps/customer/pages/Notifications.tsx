import { useState } from 'react'
import { motion } from 'motion/react'
import { Bell, Clock, Check, X, ShoppingBag, Tag, Truck, Star, ChevronRight } from 'lucide-react'
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/api/Hooks'
import { cn } from '@/lib/utils'

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'order': return <Truck className="h-5 w-5 text-blue-500" />
    case 'offer': return <Tag className="h-5 w-5 text-tomato" />
    case 'promotion': return <ShoppingBag className="h-5 w-5 text-orange" />
    case 'review': return <Star className="h-5 w-5 text-gold" />
    default: return <Bell className="h-5 w-5 text-warm-gray" />
  }
}

export function Notifications() {
  const { data, isLoading, isError } = useNotifications()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.isRead)

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-charcoal/8"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-charcoal/8"></div>
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="rounded-3xl border border-charcoal/10 bg-white p-12 text-center shadow-soft">
          <p className="text-warm-gray">Couldn't load notifications. Please try again.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-28 sm:px-8 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-7 w-7 text-tomato" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-tomato text-[10px] font-bold text-cream">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl">Notifications</h1>
              <p className="text-sm text-warm-gray">{unreadCount} unread notifications</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="rounded-full bg-charcoal/5 px-4 py-2 text-sm font-semibold text-charcoal/70 transition-colors hover:bg-charcoal/10"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              filter === 'all'
                ? 'bg-tomato text-cream'
                : 'bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              filter === 'unread'
                ? 'bg-tomato text-cream'
                : 'bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10'
            )}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border border-charcoal/5 bg-white p-12 text-center shadow-soft">
            <Bell className="mx-auto h-12 w-12 text-charcoal/20" strokeWidth={1.5} />
            <h3 className="mt-4 font-display text-xl font-bold text-charcoal">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p className="mt-1 text-warm-gray">
              {filter === 'unread' ? 'You have no unread notifications.' : 'Check back later for updates.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.04 }}
                className={cn(
                  'group relative overflow-hidden rounded-3xl border p-5 transition-all',
                  notification.isRead
                    ? 'border-charcoal/5 bg-white/50'
                    : 'border-tomato/20 bg-tomato/5'
                )}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-tomato" />
                )}

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 rounded-full bg-charcoal/5 p-2">
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-charcoal">
                        {notification.title}
                      </h3>
                      <span className="shrink-0 text-xs text-warm-gray">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-charcoal/70">
                      {notification.message}
                    </p>
                    {notification.actionUrl && (
                      <a
                        href={String(notification.actionUrl)}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-tomato transition-colors hover:underline"
                      >
                        View Details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="rounded-full p-1 text-charcoal/30 transition-colors hover:bg-tomato/10 hover:text-tomato"
                        aria-label="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="rounded-full p-1 text-charcoal/20 transition-colors hover:bg-charcoal/5 hover:text-tomato"
                      aria-label="Delete notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}