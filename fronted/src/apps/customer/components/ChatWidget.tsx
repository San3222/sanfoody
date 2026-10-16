// src/apps/customer/components/ChatWidget.tsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MessageCircle, X, Send, LifeBuoy } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { useUserChats, useCreateChat, useSendMessage } from '@/api/chatHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'

export function ChatWidget() {
    const { user, isAuthenticated } = useAuth()
    const { showToast } = useToast()

    const [isOpen, setIsOpen] = useState(false)
    const [activeChatId, setActiveChatId] = useState<string | null>(null)
    const [message, setMessage] = useState('')
    const [newTicketSubject, setNewTicketSubject] = useState('')

    const { data: chats, refetch: refetchChats } = useUserChats()
    const createChat = useCreateChat()
    const sendMessage = useSendMessage()

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const socketRef = useRef<any>(null)

    const activeChat = chats?.find((c) => c._id === activeChatId)

    // 🔥 Auto-scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [activeChat?.messages, isOpen])

    // 🔥 Socket listener for replies
    useEffect(() => {
        if (!isAuthenticated || !activeChatId) return

        const token = localStorage.getItem('sanfoody:token')
        const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] })
        socketRef.current = socket

        socket.emit('join-order-room', activeChatId)
        socket.on(`chat_${activeChatId}`, () => {
            refetchChats()
        })

        socket.on('chat-reply', () => {
            refetchChats()
        })

        return () => {
            socket.disconnect()
        }
    }, [activeChatId, isAuthenticated, refetchChats])

    // Don't show for non-customers or guests
    if (!isAuthenticated || user?.role !== 'customer') return null

    const handleCreateTicket = () => {
        if (!newTicketSubject.trim()) {
            showToast('error', 'Please describe your issue')
            return
        }

        createChat.mutate(
            { subject: newTicketSubject, message: newTicketSubject },
            {
                onSuccess: (chat) => {
                    setActiveChatId(chat._id)
                    setNewTicketSubject('')
                    showToast('success', 'Support ticket created')
                },
                onError: (err: any) => showToast('error', err.message || 'Failed'),
            }
        )
    }

    const handleSendMessage = () => {
        if (!message.trim() || !activeChatId) return

        sendMessage.mutate(
            { id: activeChatId, message: message.trim() },
            {
                onSuccess: () => setMessage(''),
                onError: (err: any) => showToast('error', err.message || 'Failed'),
            }
        )
    }

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-linear-to-br from-tomato to-orange text-cream shadow-warm transition-transform hover:scale-110 active:scale-95"
                        aria-label="Open support chat"
                    >
                        <MessageCircle className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-3xl border border-charcoal/10 bg-cream shadow-warm sm:w-[380px]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between bg-linear-to-br from-tomato to-orange p-4 text-cream">
                            <div className="flex items-center gap-2">
                                <LifeBuoy className="h-5 w-5" />
                                <div>
                                    <p className="text-sm font-bold">SanFoody Support</p>
                                    <p className="text-xs opacity-90">We typically reply in minutes</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-cream/20"
                                aria-label="Close chat"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {!activeChatId && !activeChat ? (
                                <>
                                    {/* Ticket list */}
                                    {chats && chats.length > 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
                                                Your tickets
                                            </p>
                                            {chats.map((chat) => (
                                                <button
                                                    key={chat._id}
                                                    onClick={() => setActiveChatId(chat._id)}
                                                    className="w-full rounded-xl border border-charcoal/10 bg-white p-3 text-left transition-colors hover:border-tomato/40"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-semibold text-charcoal line-clamp-1">
                                                            {chat.subject}
                                                        </p>
                                                        <span
                                                            className={cn(
                                                                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                                                                chat.status === 'open'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-charcoal/10 text-charcoal/60'
                                                            )}
                                                        >
                                                            {chat.status}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-warm-gray">
                                                        {chat.messages.length} message
                                                        {chat.messages.length !== 1 ? 's' : ''}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center text-center">
                                            <LifeBuoy className="h-12 w-12 text-charcoal/20" />
                                            <p className="mt-3 text-sm font-semibold text-charcoal">
                                                Need help?
                                            </p>
                                            <p className="mt-1 text-xs text-warm-gray">
                                                Describe your issue and we'll get back to you
                                            </p>
                                        </div>
                                    )}

                                    {/* New ticket form */}
                                    <div className="mt-4 border-t border-charcoal/10 pt-4">
                                        <textarea
                                            value={newTicketSubject}
                                            onChange={(e) => setNewTicketSubject(e.target.value)}
                                            placeholder="Describe your issue..."
                                            rows={3}
                                            className="w-full rounded-xl border border-charcoal/15 bg-white px-3 py-2 text-sm outline-none focus:border-tomato"
                                        />
                                        <button
                                            onClick={handleCreateTicket}
                                            disabled={createChat.isPending || !newTicketSubject.trim()}
                                            className="mt-2 w-full rounded-full bg-linear-to-r from-tomato to-orange py-2.5 text-sm font-semibold text-cream shadow-warm transition-transform hover:scale-[1.02] disabled:opacity-60"
                                        >
                                            {createChat.isPending ? 'Creating...' : 'Start Chat'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Active chat messages */}
                                    <div className="space-y-3">
                                        {activeChat?.messages.map((msg) => (
                                            <div
                                                key={msg._id}
                                                className={cn(
                                                    'flex',
                                                    msg.senderRole === 'customer' ? 'justify-end' : 'justify-start'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                                                        msg.senderRole === 'customer'
                                                            ? 'bg-linear-to-br from-tomato to-orange text-cream'
                                                            : 'bg-white text-charcoal shadow-soft'
                                                    )}
                                                >
                                                    <p>{msg.message}</p>
                                                    <p
                                                        className={cn(
                                                            'mt-1 text-[10px]',
                                                            msg.senderRole === 'customer'
                                                                ? 'text-cream/70'
                                                                : 'text-warm-gray'
                                                        )}
                                                    >
                                                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Input (only when in active chat) */}
                        {activeChatId && (
                            <div className="border-t border-charcoal/10 bg-white p-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type your message..."
                                        className="flex-1 rounded-full border border-charcoal/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-tomato"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim() || sendMessage.isPending}
                                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tomato text-cream transition-transform hover:scale-105 disabled:opacity-60"
                                        aria-label="Send message"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        setActiveChatId(null)
                                        setMessage('')
                                    }}
                                    className="mt-2 w-full text-xs text-warm-gray hover:text-tomato"
                                >
                                    ← Back to tickets
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}