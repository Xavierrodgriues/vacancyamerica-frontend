import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

const API = "http://localhost:5000/api/chat";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface Participant {
    _id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
}

export interface ConversationData {
    _id: string;
    participants: Participant[];
    lastMessage: {
        text: string;
        sender: string;
        createdAt: string;
    };
    unreadCount: number;
    updatedAt: string;
    createdAt: string;
}

export interface MessageData {
    _id: string;
    conversationId: string;
    sender: Participant;
    text: string;
    readBy: string[];
    createdAt: string;
}

// ─── Conversations (Inbox) ──────────────────────────────────────────────────
export function useConversations() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["conversations", user?._id],
        queryFn: async () => {
            const res = await fetch(`${API}/conversations`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch conversations");
            const data = await res.json();
            return data.conversations as ConversationData[];
        },
        enabled: !!user,
        refetchInterval: 30000, // Poll every 30s as fallback
    });

    // Listen for new messages to refresh the inbox
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        };

        socket.on("newMessage", handleNewMessage);
        return () => { socket.off("newMessage", handleNewMessage); };
    }, [socket, queryClient]);

    return query;
}

// ─── Messages (for a specific conversation) ────────────────────────────────
export function useMessages(conversationId: string | null) {
    const { user } = useAuth();
    const { socket } = useSocket();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
            if (!conversationId) return { messages: [], hasMore: false };
            const res = await fetch(`${API}/conversations/${conversationId}/messages?limit=50`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch messages");
            return res.json() as Promise<{ messages: MessageData[]; hasMore: boolean; cursor: string | null }>;
        },
        enabled: !!user && !!conversationId,
    });

    // Listen for real-time incoming messages
    useEffect(() => {
        if (!socket || !conversationId) return;

        const handleNewMessage = (data: { message: MessageData; conversationId: string }) => {
            if (data.conversationId === conversationId) {
                queryClient.setQueryData(
                    ["messages", conversationId],
                    (old: any) => {
                        if (!old) return { messages: [data.message], hasMore: false, cursor: null };
                        // Avoid duplicate messages
                        const exists = old.messages.some((m: MessageData) => m._id === data.message._id);
                        if (exists) return old;
                        return {
                            ...old,
                            messages: [...old.messages, data.message]
                        };
                    }
                );

                // Mark as read when the chat is open
                socket.emit("markRead", { conversationId });
            }
        };

        socket.on("newMessage", handleNewMessage);

        // Mark messages as read when opening the conversation
        socket.emit("markRead", { conversationId });

        return () => { socket.off("newMessage", handleNewMessage); };
    }, [socket, conversationId, queryClient]);

    return query;
}

// ─── Send Message ───────────────────────────────────────────────────────────
export function useSendMessage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ conversationId, text }: { conversationId: string; text: string }) => {
            const res = await fetch(`${API}/conversations/${conversationId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ text }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to send message");
            }
            return res.json() as Promise<MessageData>;
        },
        onSuccess: (newMessage, { conversationId }) => {
            // Optimistically add the message to the cache
            queryClient.setQueryData(
                ["messages", conversationId],
                (old: any) => {
                    if (!old) return { messages: [newMessage], hasMore: false, cursor: null };
                    const exists = old.messages.some((m: MessageData) => m._id === newMessage._id);
                    if (exists) return old;
                    return {
                        ...old,
                        messages: [...old.messages, newMessage]
                    };
                }
            );
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

// ─── Start Conversation ─────────────────────────────────────────────────────
export function useStartConversation() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (participantId: string) => {
            const res = await fetch(`${API}/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ participantId }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to start conversation");
            }
            return res.json() as Promise<ConversationData>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

// ─── Typing indicator hook ──────────────────────────────────────────────────
export function useTypingIndicator(conversationId: string | null) {
    const { socket } = useSocket();
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const sendTyping = useCallback(() => {
        if (!socket || !conversationId) return;

        socket.emit("typing", { conversationId });

        // Auto-stop typing after 2 seconds of no input
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { conversationId });
        }, 2000);
    }, [socket, conversationId]);

    const stopTyping = useCallback(() => {
        if (!socket || !conversationId) return;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit("stopTyping", { conversationId });
    }, [socket, conversationId]);

    return { sendTyping, stopTyping };
}
