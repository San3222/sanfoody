// src/apps/admin/pages/Chats.tsx
import { useState, useEffect, useRef } from 'react'
import {
    MessageCircle,
    Send,
    RefreshCw,
    Search,
    CheckCircle2,
    RotateCcw,
    User,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import {
    useAllChats,
    useAdminChat,
    useReplyToChat,
    useCloseChat,
    useReopenChat,
} from '@/api/chatHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

const FILTER_TABS = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'closed', label: 'Closed' },
] as const

export function AdminChats() {
    const [filter, setFilter] = useState<string>('all')
    const [activeChatId, setActiveChatId] = useState<string | null>(null)
    const [message, setMessage] = useState('')
    const [search, setSearch] = useState('')

    const { data, isLoading, refetch, isRefetching } = useAllChats(filter, 1, 50)
    const { data: activeChat } = useAdminChat(activeChatId || undefined)
    const replyMutation = useReplyToChat()
    const closeMutation = useCloseChat()
    const reopenMutation = useReopenChat()
    const { showToast } = useToast()

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const chats = data?.chats ?? []
    const stats = data?.stats

    const filteredChats = search
        ? chats.filter(
            (c: any) =>
                c.subject?.toLowerCase().includes(search.toLowerCase()) ||
                c.customerId?.name?.toLowerCase().includes(search.toLowerCase())
        )
        : chats

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeChat?.messages])

    const handleSend = () => {
        if (!message.trim() || !activeChatId) return
        replyMutation.mutate(
            { id: activeChatId, message: message.trim() },
            {
                onSuccess: () => setMessage(''),
                onError: (err: any) => showToast('error', err.message || 'Failed'),
            }
        )
    }

    const handleClose = () => {
        if (!activeChatId) return
        closeMutation.mutate(activeChatId, {
            onSuccess: () => showToast('success', 'Ticket closed'),
        })
    }

    const handleReopen = () => {
        if (!activeChatId) return
        reopenMutation.mutate(activeChatId, {
            onSuccess: () => showToast('success', 'Ticket reopened'),
        })
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-4">
            {/* Left: Ticket List */}
            <div className="flex w-96 shrink-0 flex-col">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-charcoal">Support</h1>
                        <p className="mt-0.5 text-sm text-warm-gray">
                            {data?.total ?? 0} tickets
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                    >
                        <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
                    </Button>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="mt-4 flex gap-2">
                        <Badge variant="success">{stats.open || 0} Open</Badge>
                        <Badge variant="neutral">{stats.closed || 0} Closed</Badge>
                    </div>
                )}

                {/* Search */}
                <div className="mt-4 flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-4 py-2">
                    <Search className="h-4 w-4 text-warm-gray" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
                    />
                </div>

                {/* Filters */}
                <div className="mt-3 flex gap-2">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={cn(
                                'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                                filter === tab.id
                                    ? 'bg-tomato text-cream'
                                    : 'bg-white text-charcoal/70 hover:bg-beige'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Ticket List */}
                <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
                    {isLoading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-20 animate-pulse rounded-2xl bg-charcoal/5" />
                        ))
                    ) : filteredChats.length === 0 ? (
                        <Card className="p-6 text-center">
                            <MessageCircle className="mx-auto h-10 w-10 text-charcoal/20" />
                            <p className="mt-3 text-sm text-warm-gray">No tickets</p>
                        </Card>
                    ) : (
                        filteredChats.map((chat: any) => {
                            const customer = chat.customerId || {}
                            const lastMessage = chat.messages[chat.messages.length - 1]
                            const isActive = chat._id === activeChatId

                            return (
                                <button
                                    key={chat._id}
                                    onClick={() => setActiveChatId(chat._id)}
                                    className={cn(
                                        'w-full rounded-2xl border p-3 text-left transition-all',
                                        isActive
                                            ? 'border-tomato bg-tomato/5 shadow-soft'
                                            : 'border-charcoal/5 bg-white hover:border-tomato/30'
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tomato/10 font-semibold text-tomato">
                                            {customer.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-sm font-semibold text-charcoal">
                                                    {customer.name || 'Customer'}
                                                </p>
                                                <span
                                                    className={cn(
                                                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                                                        chat.status === 'open'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-charcoal/10 text-charcoal/60'
                                                    )}
                                                >
                                                    {chat.status}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs text-warm-gray">
                                                {chat.subject}
                                            </p>
                                            {lastMessage && (
                                                <p className="mt-1 truncate text-xs text-warm-gray">
                                                    {lastMessage.senderRole === 'support' ? 'You: ' : ''}
                                                    {lastMessage.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Right: Active Chat */}
            <div className="flex-1 rounded-3xl border border-charcoal/10 bg-white shadow-soft">
                {!activeChat ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <MessageCircle className="h-16 w-16 text-charcoal/20" />
                        <p className="mt-4 font-display text-lg font-bold text-charcoal">
                            Select a ticket
                        </p>
                        <p className="mt-1 text-sm text-warm-gray">
                            Choose a conversation to start replying
                        </p>
                    </div>
                ) : (
                    <div className="flex h-full flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-full bg-tomato/10 font-semibold text-tomato">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-charcoal">
                                        {(activeChat.customerId as any)?.name || 'Customer'}
                                    </p>
                                    <p className="text-xs text-warm-gray">
                                        {(activeChat.customerId as any)?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {activeChat.status === 'open' ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClose}
                                        disabled={closeMutation.isPending}
                                    >
                                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                        Close
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleReopen}
                                        disabled={reopenMutation.isPending}
                                    >
                                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                        Reopen
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-3">
                                {activeChat.messages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        className={cn(
                                            'flex',
                                            msg.senderRole === 'support' ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                                                msg.senderRole === 'support'
                                                    ? 'bg-linear-to-br from-tomato to-orange text-cream'
                                                    : 'bg-beige text-charcoal'
                                            )}
                                        >
                                            <p>{msg.message}</p>
                                            <p
                                                className={cn(
                                                    'mt-1 text-[10px]',
                                                    msg.senderRole === 'support'
                                                        ? 'text-cream/70'
                                                        : 'text-warm-gray'
                                                )}
                                            >
                                                {new Date(msg.createdAt).toLocaleString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Reply Input */}
                        {activeChat.status === 'open' && (
                            <div className="border-t border-charcoal/10 p-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Type your reply..."
                                        className="flex-1 rounded-full border border-charcoal/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-tomato"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!message.trim() || replyMutation.isPending}
                                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tomato text-cream transition-transform hover:scale-105 disabled:opacity-60"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeChat.status === 'closed' && (
                            <div className="border-t border-charcoal/10 bg-beige/50 p-4 text-center">
                                <p className="text-sm text-warm-gray">
                                    This ticket is closed. Reopen to reply.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}