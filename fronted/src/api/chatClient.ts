// src/api/chatClient.ts
const API_BASE_URL = '/api/v1'

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('sanfoody:token')
    const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options?.headers as Record<string, string>) || {}),
    }
    if (options?.body) headers['Content-Type'] = 'application/json'

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options,
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || 'API request failed')
    }
    return data.data
}

// ============================================
// Types
// ============================================

export interface ChatMessage {
    _id: string
    senderId: string
    senderRole: 'customer' | 'support'
    message: string
    createdAt: string
}

export interface Chat {
    _id: string
    customerId: string | { _id: string; name: string; email: string; phone?: string }
    subject: string
    status: 'open' | 'closed'
    messages: ChatMessage[]
    createdAt: string
    updatedAt: string
}

// ============================================
// Customer APIs
// ============================================

export async function createChat(subject: string, message: string): Promise<Chat> {
    return apiFetch('/chats', {
        method: 'POST',
        body: JSON.stringify({ subject, message }),
    })
}

export async function fetchUserChats(): Promise<Chat[]> {
    return apiFetch('/chats')
}

export async function fetchChatById(id: string): Promise<Chat> {
    return apiFetch(`/chats/${id}`)
}

export async function sendChatMessage(id: string, message: string): Promise<Chat> {
    return apiFetch(`/chats/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
    })
}

// ============================================
// Admin APIs
// ============================================

export async function fetchAllChats(
    status?: string,
    page = 1,
    limit = 20
): Promise<{ chats: Chat[]; total: number; page: number; totalPages: number; stats: any }> {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.append('status', status)
    params.append('page', String(page))
    params.append('limit', String(limit))
    return apiFetch(`/admin/chats?${params.toString()}`)
}

export async function fetchAdminChatById(id: string): Promise<Chat> {
    return apiFetch(`/admin/chats/${id}`)
}

export async function replyToChat(id: string, message: string): Promise<Chat> {
    return apiFetch(`/admin/chats/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message }),
    })
}

export async function closeChat(id: string): Promise<Chat> {
    return apiFetch(`/admin/chats/${id}/close`, { method: 'PATCH' })
}

export async function reopenChat(id: string): Promise<Chat> {
    return apiFetch(`/admin/chats/${id}/reopen`, { method: 'PATCH' })
}