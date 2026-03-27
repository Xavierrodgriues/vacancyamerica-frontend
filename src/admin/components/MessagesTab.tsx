import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Search, ArrowLeft, Send, Smile, Loader2 } from 'lucide-react';
import { BASE_URL } from '@/lib/constants';

const API_BASE = `${BASE_URL}/api/admin/chat`;
const SOCKET_URL = BASE_URL;

// ─── Types ───────────────────────────────────────────────────────────────────
interface Participant {
    _id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
}

interface Conversation {
    _id: string;
    participants: Participant[];
    lastMessage: { text: string; sender: string | null; createdAt: string | null };
    unreadCounts: Record<string, number>;
    updatedAt: string;
}

interface MsgSender {
    _id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    isAdmin?: boolean;
}

interface Message {
    _id: string;
    conversationId: string;
    sender: MsgSender;
    text: string;
    type: string;
    readBy: string[];
    createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getAdminToken(): string | null {
    try {
        const stored = localStorage.getItem('admin');
        return stored ? JSON.parse(stored).token || null : null;
    } catch { return null; }
}

function getAdminId(): string | null {
    try {
        const stored = localStorage.getItem('admin');
        return stored ? JSON.parse(stored)._id || null : null;
    } catch { return null; }
}

const AVATAR_COLORS = [
    'from-blue-500 to-purple-600', 'from-pink-500 to-rose-600',
    'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-600',
    'from-indigo-500 to-blue-600', 'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600', 'from-fuchsia-500 to-pink-600',
];

function getColor(name: string) {
    return AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(dateStr: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
}

// ─── ChatAvatar (matches user-side exactly) ───────────────────────────────────
function ChatAvatar({ name, avatarUrl, size = 'md' }: {
    name: string;
    avatarUrl?: string | null;
    size?: 'sm' | 'md' | 'lg';
}) {
    const sizeMap = { sm: 'w-8 h-8 text-[10px]', md: 'w-11 h-11 text-xs', lg: 'w-14 h-14 text-base' };
    const imgSize = { sm: 'w-8 h-8', md: 'w-11 h-11', lg: 'w-14 h-14' };
    return (
        <div className="relative flex-shrink-0">
            {avatarUrl ? (
                <img src={avatarUrl} alt={name} className={`${imgSize[size]} rounded-full object-cover`} />
            ) : (
                <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${getColor(name)} flex items-center justify-center font-semibold text-white`}>
                    {getInitials(name)}
                </div>
            )}
        </div>
    );
}

// ─── Chat Thread View ─────────────────────────────────────────────────────────
function ChatView({
    conversation, adminId, token, onBack, socketRef
}: {
    conversation: Conversation;
    adminId: string;
    token: string;
    onBack: () => void;
    socketRef: React.MutableRefObject<Socket | null>;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // The "other" participants (everyone except the admin)
    const otherParticipants = conversation.participants.filter(p => p._id !== adminId);
    const otherUser = otherParticipants[0] || conversation.participants[0];

    // Load messages
    const loadMessages = useCallback(async (before?: string) => {
        try {
            const url = `${API_BASE}/conversations/${conversation._id}/messages?limit=30${before ? `&before=${before}` : ''}`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!res.ok) return;
            const data = await res.json();
            if (before) {
                setMessages(prev => [...(data.messages || []), ...prev]);
            } else {
                setMessages(data.messages || []);
            }
            setHasMore(data.hasMore || false);
            setCursor(data.cursor || null);
        } finally {
            setLoading(false);
        }
    }, [conversation._id, token]);

    useEffect(() => {
        loadMessages();
        // Mark read via socket
        socketRef.current?.emit('adminMarkRead', { conversationId: conversation._id });
    }, [conversation._id, loadMessages, socketRef]);

    // Auto-scroll to bottom
    useEffect(() => {
        const el = messagesContainerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages]);

    // Listen for incoming messages on this conversation
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;
        const handler = ({ message, conversationId }: { message: Message; conversationId: string }) => {
            if (conversationId !== conversation._id) return;
            setMessages(prev => {
                if (prev.some(m => m._id === message._id)) return prev;
                return [...prev, message];
            });
        };
        socket.on('newMessage', handler);
        return () => { socket.off('newMessage', handler); };
    }, [conversation._id, socketRef]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;
        setSending(true);
        const text = newMessage.trim();

        // Optimistic
        const tempId = `temp-${Date.now()}`;
        const optimistic: Message = {
            _id: tempId, conversationId: conversation._id,
            sender: { _id: adminId, username: 'admin', display_name: 'Admin', avatar_url: null, isAdmin: true },
            text, type: 'text', readBy: [adminId], createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimistic]);
        setNewMessage('');

        try {
            const res = await fetch(`${API_BASE}/conversations/${conversation._id}/messages`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setMessages(prev => prev.map(m => m._id === tempId ? data.message : m));
        } catch {
            setMessages(prev => prev.filter(m => m._id !== tempId));
            setNewMessage(text);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 flex-shrink-0 bg-white">
                <button
                    onClick={onBack}
                    className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <ChatAvatar name={otherUser?.display_name || 'User'} avatarUrl={otherUser?.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate">
                        {otherUser?.display_name || 'User'}
                    </h3>
                    <p className="text-xs text-slate-400">@{otherUser?.username || 'user'}</p>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50"
                style={{ scrollbarWidth: 'thin' }}
            >
                {/* Load more */}
                {hasMore && (
                    <div className="flex justify-center pb-2">
                        <button
                            onClick={() => loadMessages(cursor || undefined)}
                            className="text-xs text-blue-500 font-semibold hover:text-blue-700 py-1 px-3 rounded-full bg-white border border-slate-200 transition-colors"
                        >
                            Load earlier messages
                        </button>
                    </div>
                )}

                {/* Profile card at top */}
                {!hasMore && otherUser && (
                    <div className="flex flex-col items-center py-4 mb-2">
                        <ChatAvatar name={otherUser.display_name} avatarUrl={otherUser.avatar_url} size="lg" />
                        <h4 className="text-sm font-bold text-slate-800 mt-2">{otherUser.display_name}</h4>
                        <p className="text-xs text-slate-400">@{otherUser.username}</p>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {messages.map((msg) => {
                    const isMine = msg.sender?.isAdmin === true || msg.sender?._id === adminId;
                    const senderName = msg.sender?.display_name || 'User';

                    return (
                        <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[75%]">
                                {!isMine ? (
                                    <div className="flex items-end gap-2">
                                        <ChatAvatar name={senderName} avatarUrl={msg.sender?.avatar_url} size="sm" />
                                        <div>
                                            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-3 py-2.5 shadow-sm">
                                                <p className="text-sm text-slate-700 leading-relaxed">{msg.text}</p>
                                            </div>
                                            <span className="text-[10px] text-slate-400 ml-1 mt-0.5 block">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="bg-blue-600 rounded-2xl rounded-br-md px-3 py-2.5">
                                            <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 mr-1 mt-0.5 block text-right">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input bar — matches user-side exactly */}
            <div className="px-4 py-3 border-t border-slate-200 flex-shrink-0 bg-white">
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0">
                        <Smile className="w-5 h-5 text-slate-400" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Message..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                    {newMessage.trim() && (
                        <button
                            onClick={handleSend}
                            disabled={sending}
                            className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                        >
                            {sending
                                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                : <Send className="w-4 h-4 text-white" />
                            }
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main MessagesTab ─────────────────────────────────────────────────────────
export default function MessagesTab({ onNewMessage }: { onNewMessage?: (convId: string, senderName: string, text: string) => void } = {}) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<Socket | null>(null);
    const activeConvRef = useRef<Conversation | null>(null);

    const token = getAdminToken();
    const adminId = getAdminId() || '';

    // Fetch conversations
    const loadConversations = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/conversations?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            setConversations(data.conversations || []);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Keep activeConvRef in sync so socket handler can read it without stale closure
    useEffect(() => {
        activeConvRef.current = activeConv;
    }, [activeConv]);

    // Socket.IO — /admin namespace
    useEffect(() => {
        if (!token) return;
        const socket = io(`${SOCKET_URL}/admin`, {
            auth: { token },
            transports: ['websocket']
        });
        socketRef.current = socket;

        socket.on('newMessage', ({ message, conversationId }: { message: Message; conversationId: string }) => {
            const isFromAdmin = message.sender?.isAdmin === true || message.sender?._id === adminId;
            const isCurrentlyViewing = activeConvRef.current?._id === conversationId;

            // Bump conversation to top + update preview
            setConversations(prev => {
                const conv = prev.find(c => c._id === conversationId);
                if (!conv) return prev;

                // Only increment unread if this is an incoming message (not from admin)
                // and the admin is not currently viewing that conversation
                const newUnreadCounts = { ...conv.unreadCounts };
                if (!isFromAdmin && !isCurrentlyViewing) {
                    newUnreadCounts[adminId] = (newUnreadCounts[adminId] || 0) + 1;
                }

                const updated = {
                    ...conv,
                    lastMessage: { text: message.text, sender: message.sender._id, createdAt: message.createdAt },
                    updatedAt: message.createdAt,
                    unreadCounts: newUnreadCounts
                };
                return [updated, ...prev.filter(c => c._id !== conversationId)];
            });

            // Notify parent dashboard if this is an unread incoming message
            if (!isFromAdmin && !isCurrentlyViewing && onNewMessage) {
                const senderName = message.sender?.display_name || message.sender?.username || 'Someone';
                onNewMessage(conversationId, senderName, message.text);
            }
        });

        return () => { socket.disconnect(); socketRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, adminId]);

    const filteredConvs = conversations.filter(conv => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return conv.participants.some(p =>
            p.display_name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
        ) || (conv.lastMessage?.text || '').toLowerCase().includes(q);
    });

    const getOtherUser = (conv: Conversation) =>
        conv.participants.find(p => p._id !== adminId) || conv.participants[0];

    if (!token) return (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
            Not authenticated
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-130px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* ── Left: Conversation List ─────────────────────────── */}
            <aside className={`flex flex-col border-r border-slate-200 bg-white transition-all
                ${activeConv ? 'hidden lg:flex lg:w-80' : 'flex w-full lg:w-80'}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">Messages</h2>
                    {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                </div>

                {/* Search */}
                <div className="px-4 py-2 flex-shrink-0 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {!loading && filteredConvs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 px-6">
                            <Search className="w-10 h-10 text-slate-300 mb-3" />
                            <p className="text-sm text-slate-400">
                                {search ? 'No conversations found' : 'No messages yet'}
                            </p>
                            <p className="text-xs text-slate-400/70 mt-1 text-center">
                                Reply to a user to start a conversation
                            </p>
                        </div>
                    )}

                    {filteredConvs.map(conv => {
                        const other = getOtherUser(conv);
                        if (!other) return null;
                        // Use admin's own unread count, not sum of all participants
                        const unread = conv.unreadCounts?.[adminId] || 0;
                        const isActive = conv._id === activeConv?._id;

                        return (
                            <button
                                key={conv._id}
                                onClick={() => {
                                    setActiveConv(conv);
                                    // Optimistically clear badge
                                    setConversations(prev => prev.map(c =>
                                        c._id === conv._id ? { ...c, unreadCounts: {} } : c
                                    ));
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left
                                    ${isActive ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                            >
                                <ChatAvatar name={other.display_name} avatarUrl={other.avatar_url} />
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm truncate ${unread > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                            {other.display_name}
                                        </span>
                                        <span className={`text-[11px] flex-shrink-0 ml-2 ${unread > 0 ? 'text-blue-400 font-semibold' : 'text-slate-400'}`}>
                                            {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                                        </span>
                                    </div>
                                    <p className={`text-xs mt-0.5 truncate ${unread > 0 ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                                        {conv.lastMessage?.text || 'Start a conversation'}
                                    </p>
                                </div>
                                {unread > 0 && (
                                    <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-white">{unread}</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-slate-100 flex-shrink-0">
                    <p className="text-[10px] text-center text-slate-400/60">
                        🔒 End-to-end encrypted · Vacancy America Admin
                    </p>
                </div>
            </aside>

            {/* ── Right: Thread ─────────────────────────────────────── */}
            <main className={`flex-1 ${activeConv ? 'flex' : 'hidden lg:flex'} flex-col`}>
                {!activeConv ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 bg-slate-50">
                        <Search className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-sm text-slate-400">Select a conversation to start messaging</p>
                    </div>
                ) : (
                    <ChatView
                        key={activeConv._id}
                        conversation={activeConv}
                        adminId={adminId}
                        token={token}
                        onBack={() => setActiveConv(null)}
                        socketRef={socketRef}
                    />
                )}
            </main>
        </div>
    );
}
