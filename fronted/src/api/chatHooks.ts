// src/api/chatHooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    createChat,
    fetchUserChats,
    fetchChatById,
    sendChatMessage,
    fetchAllChats,
    fetchAdminChatById,
    replyToChat,
    closeChat,
    reopenChat,
    type Chat,
} from './chatClient'

// ============================================
// Customer
// ============================================

export function useUserChats() {
    return useQuery<Chat[]>({
        queryKey: ['chats'],
        queryFn: fetchUserChats,
    })
}

export function useChat(id: string | undefined) {
    return useQuery<Chat>({
        queryKey: ['chat', id],
        queryFn: () => fetchChatById(id as string),
        enabled: !!id,
    })
}

export function useCreateChat() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ subject, message }: { subject: string; message: string }) =>
            createChat(subject, message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chats'] })
        },
    })
}

export function useSendMessage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, message }: { id: string; message: string }) =>
            sendChatMessage(id, message),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['chat', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['chats'] })
        },
    })
}

// ============================================
// Admin
// ============================================

export function useAllChats(status?: string, page = 1, limit = 20) {
    return useQuery({
        queryKey: ['admin', 'chats', status, page, limit],
        queryFn: () => fetchAllChats(status, page, limit),
        refetchInterval: 15_000,
    })
}

export function useAdminChat(id: string | undefined) {
    return useQuery<Chat>({
        queryKey: ['admin', 'chat', id],
        queryFn: () => fetchAdminChatById(id as string),
        enabled: !!id,
        refetchInterval: 5_000,  // Poll every 5s for new messages
    })
}

export function useReplyToChat() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, message }: { id: string; message: string }) =>
            replyToChat(id, message),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'chat', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'chats'] })
        },
    })
}

export function useCloseChat() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => closeChat(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'chats'] })
        },
    })
}

export function useReopenChat() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => reopenChat(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'chats'] })
        },
    })
}