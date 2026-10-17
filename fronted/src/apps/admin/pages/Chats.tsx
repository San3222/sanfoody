// src/apps/admin/pages/Chats.tsx
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle,
  Send,
  RefreshCw,
  Search,
  X,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  UserRound,
  Zap,
  Lock,
} from 'lucide-react'
import { AdminButton } from '@/components/ui/AdminButton'
import {
  useAllChats,
  useAdminChat,
  useReplyToChat,
  useCloseChat,
  useReopenChat,
} from '@/api/chatHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

// ============================================
// Config
// ============================================

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'closed', label: 'Closed' },
] as const

const QUICK_REPLIES = [
  'Thanks for reaching out! Let me look into this for you.',
  'Could you please share your order ID so I can check?',
  'We have escalated this and will update you shortly.',
  'Your issue has been resolved. Anything else I can help with?',
]

// ============================================
// Helpers
// ============================================

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

function listTime(d?: string) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  if (sameDay(date, now))
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  const y = new Date()
  y.setDate(now.getDate() - 1)
  if (sameDay(date, y)) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function dayLabel(d: string) {
  const date = new Date(d)
  const now = new Date()
  if (sameDay(date, now)) return 'Today'
  const y = new Date()
  y.setDate(now.getDate() - 1)
  if (sameDay(date, y)) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

const msgTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })

// ============================================
// Page
// ============================================

export function AdminChats() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [filter, setFilter] = useState<string>('all')
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [showQuick, setShowQuick] = useState(false)

  const { data, isLoading, refetch, isRefetching } = useAllChats(filter, 1, 50)
  const { data: activeChat } = useAdminChat(activeChatId || undefined)
  const replyMutation = useReplyToChat()
  const closeMutation = useCloseChat()
  const reopenMutation = useReopenChat()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const chats: any[] = data?.chats ?? []
  const stats = data?.stats
  const total = data?.total ?? chats.length

  const lastOf = (c: any) => c.messages?.[c.messages.length - 1]

  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = q
      ? chats.filter(
          (c) =>
            c.subject?.toLowerCase().includes(q) ||
            c.customerId?.name?.toLowerCase().includes(q) ||
            c.customerId?.email?.toLowerCase().includes(q) ||
            lastOf(c)?.message?.toLowerCase().includes(q)
        )
      : chats
    // newest activity first
    return [...list].sort(
      (a, b) =>
        new Date(lastOf(b)?.createdAt ?? b.createdAt ?? 0).getTime() -
        new Date(lastOf(a)?.createdAt ?? a.createdAt ?? 0).getTime()
    )
  }, [chats, search])

  const needsReplyCount = chats.filter(
    (c) => c.status === 'open' && lastOf(c) && lastOf(c).senderRole !== 'support'
  ).length

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages, activeChatId])

  // Auto-grow textarea
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [message])

  const handleSend = () => {
    if (!message.trim() || !activeChatId) return
    replyMutation.mutate(
      { id: activeChatId, message: message.trim() },
      {
        onSuccess: () => {
          setMessage('')
          setShowQuick(false)
        },
        onError: (err: any) => showToast('error', err.message || 'Failed to send'),
      }
    )
  }

  const handleClose = () => {
    if (!activeChatId) return
    closeMutation.mutate(activeChatId, {
      onSuccess: () => showToast('success', 'Ticket closed'),
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  const handleReopen = () => {
    if (!activeChatId) return
    reopenMutation.mutate(activeChatId, {
      onSuccess: () => showToast('success', 'Ticket reopened'),
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  const customer: any = (activeChat?.customerId as any) || {}

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-[1500px] gap-4">
      {/* ================= LEFT: inbox ================= */}
      <section
        className={cn(
          'w-full shrink-0 flex-col lg:flex lg:w-[380px]',
          activeChatId ? 'hidden' : 'flex'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal">Support</h1>
            <p className="mt-0.5 text-sm text-warm-gray">
              {total} ticket{total !== 1 ? 's' : ''}
              {needsReplyCount > 0 && (
                <>
                  {' · '}
                  <span className="font-semibold text-amber-600">{needsReplyCount} need reply</span>
                </>
              )}
            </p>
          </div>
          <AdminButton
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full"
            title="Refresh"
            aria-label="Refresh"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
          </AdminButton>
        </div>

        {/* Search + tabs in one card */}
        <div className="mt-4 rounded-2xl border border-charcoal/10 bg-white p-3">
          <div className="flex h-10 items-center gap-2 rounded-xl bg-beige/50 px-3.5 focus-within:bg-beige/80">
            <Search className="h-4 w-4 shrink-0 text-warm-gray" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, subject or message..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="text-warm-gray hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-3 flex gap-1 rounded-xl bg-beige/50 p-1">
            {FILTER_TABS.map((tab) => {
              const count =
                tab.id === 'open' ? stats?.open : tab.id === 'closed' ? stats?.closed : undefined
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-all',
                    filter === tab.id
                      ? 'bg-white text-tomato shadow-sm'
                      : 'text-charcoal/60 hover:text-charcoal'
                  )}
                >
                  {tab.label}
                  {typeof count === 'number' && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 text-[11px]',
                        filter === tab.id ? 'bg-tomato/10 text-tomato' : 'bg-charcoal/10'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Ticket list */}
        <div className="mt-3 flex-1 space-y-2 overflow-y-auto pb-2 pr-1">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[88px] animate-pulse rounded-2xl bg-charcoal/5" />
            ))
          ) : filteredChats.length === 0 ? (
            <div className="rounded-2xl border border-charcoal/10 bg-white px-6 py-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-charcoal/5">
                <MessageCircle className="h-5 w-5 text-charcoal/30" />
              </div>
              <p className="mt-3 text-sm font-semibold text-charcoal">No tickets found</p>
              <p className="mt-1 text-xs text-warm-gray">
                {search ? 'Try a different search.' : 'New support requests will appear here.'}
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const c = chat.customerId || {}
              const last = lastOf(chat)
              const isActive = chat._id === activeChatId
              const needsReply = chat.status === 'open' && last && last.senderRole !== 'support'

              return (
                <button
                  key={chat._id}
                  onClick={() => setActiveChatId(chat._id)}
                  className={cn(
                    'w-full rounded-2xl border p-3.5 text-left transition-all',
                    isActive
                      ? 'border-tomato bg-tomato/[0.04] shadow-sm'
                      : 'border-charcoal/10 bg-white hover:border-charcoal/20 hover:shadow-sm'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-tomato/10 font-semibold text-tomato">
                        {c.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      {needsReply && (
                        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-amber-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-charcoal">
                          {c.name || 'Customer'}
                        </p>
                        <span className="shrink-0 text-[11px] text-warm-gray">
                          {listTime(last?.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs font-medium text-charcoal/70">
                        {chat.subject}
                      </p>
                      {last && (
                        <p className="mt-1 truncate text-xs text-warm-gray">
                          {last.senderRole === 'support' ? 'You: ' : ''}
                          {last.message}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            chat.status === 'open'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-charcoal/10 text-charcoal/60'
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              chat.status === 'open' ? 'bg-green-500' : 'bg-charcoal/40'
                            )}
                          />
                          {chat.status}
                        </span>
                        {needsReply && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                            Needs reply
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </section>

      {/* ================= RIGHT: conversation ================= */}
      <section
        className={cn(
          'min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-charcoal/10 bg-white lg:flex',
          activeChatId ? 'flex' : 'hidden'
        )}
      >
        {!activeChat ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-tomato/10">
              <MessageCircle className="h-9 w-9 text-tomato" />
            </div>
            <p className="mt-5 font-display text-lg font-bold text-charcoal">
              {activeChatId ? 'Loading conversation...' : 'Select a ticket'}
            </p>
            <p className="mt-1 max-w-xs text-sm text-warm-gray">
              {activeChatId
                ? 'Please wait a moment.'
                : 'Choose a conversation from the left to read and reply.'}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal/10 px-5 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setActiveChatId(null)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-charcoal/10 text-charcoal hover:bg-beige lg:hidden"
                  aria-label="Back to tickets"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tomato/10 font-semibold text-tomato">
                  {customer.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-charcoal">
                      {customer.name || 'Customer'}
                    </p>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                        activeChat.status === 'open'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-charcoal/10 text-charcoal/60'
                      )}
                    >
                      {activeChat.status}
                    </span>
                  </div>
                  <p className="truncate text-xs text-warm-gray">
                    {activeChat.subject}
                    {customer.email && ` · ${customer.email}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {customer._id && (
                  <AdminButton
                    variant="secondary"
                    onClick={() => navigate(`/admin/users/${customer._id}`)}
                  >
                    <UserRound className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </AdminButton>
                )}
                {activeChat.status === 'open' ? (
                  <AdminButton
                    variant="soft-danger"
                    onClick={handleClose}
                    disabled={closeMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Close ticket
                  </AdminButton>
                ) : (
                  <AdminButton
                    variant="primary"
                    onClick={handleReopen}
                    disabled={reopenMutation.isPending}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reopen
                  </AdminButton>
                )}
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-beige/30 px-5 py-5">
              <div className="mx-auto max-w-3xl space-y-1.5">
                {activeChat.messages.map((msg: any, i: number) => {
                  const mine = msg.senderRole === 'support'
                  const prev = activeChat.messages[i - 1]
                  const showDay = !prev || !sameDay(new Date(prev.createdAt), new Date(msg.createdAt))
                  const newSender = !prev || prev.senderRole !== msg.senderRole || showDay

                  return (
                    <div key={msg._id}>
                      {showDay && (
                        <div className="my-4 flex items-center gap-3">
                          <span className="h-px flex-1 bg-charcoal/10" />
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-warm-gray shadow-sm">
                            {dayLabel(msg.createdAt)}
                          </span>
                          <span className="h-px flex-1 bg-charcoal/10" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'flex items-end gap-2',
                          mine ? 'justify-end' : 'justify-start',
                          newSender && i !== 0 && 'mt-3'
                        )}
                      >
                        {!mine && (
                          <div
                            className={cn(
                              'grid h-7 w-7 shrink-0 place-items-center rounded-full bg-tomato/10 text-[11px] font-bold text-tomato',
                              !newSender && 'invisible'
                            )}
                          >
                            {customer.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div
                          className={cn(
                            'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                            mine
                              ? 'rounded-br-md bg-tomato text-cream'
                              : 'rounded-bl-md bg-white text-charcoal'
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.message}
                          </p>
                          <p
                            className={cn(
                              'mt-1 text-right text-[10px]',
                              mine ? 'text-cream/70' : 'text-warm-gray'
                            )}
                          >
                            {msgTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Composer */}
            {activeChat.status === 'open' ? (
              <footer className="border-t border-charcoal/10 bg-white p-4">
                <div className="mx-auto max-w-3xl">
                  {showQuick && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {QUICK_REPLIES.map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setMessage(q)
                            inputRef.current?.focus()
                          }}
                          className="rounded-full border border-charcoal/10 bg-beige/40 px-3 py-1.5 text-left text-xs text-charcoal/80 transition-colors hover:border-tomato/40 hover:bg-tomato/5"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <AdminButton
                      size="icon"
                      variant="secondary"
                      className={cn('h-11 w-11 rounded-full', showQuick && 'border-tomato/40 text-tomato')}
                      title="Quick replies"
                      aria-label="Quick replies"
                      onClick={() => setShowQuick((s) => !s)}
                    >
                      <Zap className="h-4 w-4" />
                    </AdminButton>
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                      className="max-h-[120px] flex-1 resize-none rounded-2xl border border-charcoal/15 bg-cream px-4 py-3 text-sm outline-none transition-colors placeholder:text-warm-gray focus:border-tomato"
                    />
                    <AdminButton
                      size="icon"
                      variant="primary"
                      className="h-11 w-11 rounded-full"
                      title="Send"
                      aria-label="Send"
                      onClick={handleSend}
                      disabled={!message.trim() || replyMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </AdminButton>
                  </div>
                </div>
              </footer>
            ) : (
              <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-charcoal/10 bg-beige/50 px-4 py-4">
                <span className="inline-flex items-center gap-2 text-sm text-warm-gray">
                  <Lock className="h-4 w-4" />
                  This ticket is closed.
                </span>
                <AdminButton
                  variant="secondary"
                  onClick={handleReopen}
                  disabled={reopenMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reopen to reply
                </AdminButton>
              </footer>
            )}
          </>
        )}
      </section>
    </div>
  )
}