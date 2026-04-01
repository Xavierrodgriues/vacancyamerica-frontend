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
        <div className="flex flex-col h-full bg-slate-50/30">
            {/* Header - Floating Frosted Glass */}
            <div className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-20 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="relative group cursor-pointer shrink-0">
                        <ChatAvatar name={otherUser?.display_name || 'User'} avatarUrl={otherUser?.avatar_url} size="md" />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight truncate flex items-center gap-2">
                            {otherUser?.display_name || 'User'}
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-400 truncate tracking-wide">
                            @{otherUser?.username || 'user'} <span className="mx-1">•</span> <span className="text-emerald-500">Active</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 relative"
                style={{ scrollbarWidth: 'none' }}
            >
                {/* Load more */}
                {hasMore && (
                    <div className="flex justify-center pb-4">
                        <button
                            onClick={() => loadMessages(cursor || undefined)}
                            className="text-xs text-indigo-500 font-bold hover:text-white px-5 py-2 rounded-full bg-indigo-50 border border-indigo-100 hover:bg-indigo-600 transition-all shadow-sm"
                        >
                            Load earlier messages
                        </button>
                    </div>
                )}

                {/* Profile card at top */}
                {!hasMore && otherUser && (
                    <div className="flex flex-col items-center py-8 mb-4">
                        <div className="w-24 h-24 shadow-xl shadow-slate-200/50 rounded-full bg-white p-1 mb-4">
                            <ChatAvatar name={otherUser.display_name} avatarUrl={otherUser.avatar_url} size="lg" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800">{otherUser.display_name}</h4>
                        <p className="text-sm font-medium text-slate-400 mt-1 mb-3">@{otherUser.username}</p>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-lg">Conversation Started</span>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMine = msg.sender?.isAdmin === true || msg.sender?._id === adminId;
                    const senderName = msg.sender?.display_name || 'User';
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const isSequential = prevMsg && 
                        (prevMsg.sender?._id === msg.sender?._id || 
                        (prevMsg.sender?.isAdmin && msg.sender?.isAdmin));

                    return (
                        <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isSequential ? 'mt-1.5' : 'mt-5'}`}>
                            <div className={`max-w-[85%] sm:max-w-[70%] flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isMine && !isSequential && (
                                    <div className="shrink-0 mt-auto hidden sm:block">
                                        <ChatAvatar name={senderName} avatarUrl={msg.sender?.avatar_url} size="sm" />
                                    </div>
                                )}
                                {!isMine && isSequential && <div className="w-8 shrink-0 hidden sm:block" />}
                                
                                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                    <div className={`
                                        px-4 py-2.5 shadow-sm text-[13px] sm:text-sm leading-relaxed
                                        ${isMine 
                                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-[1.2rem] rounded-br-[4px] shadow-indigo-500/20' 
                                            : 'bg-white text-slate-700 border border-slate-200/60 rounded-[1.2rem] rounded-bl-[4px]'
                                        }
                                    `}>
                                        {msg.text}
                                    </div>
                                    <span className={`text-[9px] font-medium text-slate-400 mt-1.5 ${isMine ? 'mr-1' : 'ml-1'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input bar - Premium Modern Chat Input */}
            <div className="p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 flex-shrink-0 pb-6 sm:pb-4">
                <div className="flex items-end gap-2 bg-slate-50/80 border border-slate-200/80 p-2 rounded-[1.5rem] shadow-inner focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50/50 transition-all duration-300">
                    <button className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors flex-shrink-0 self-center">
                        <Smile className="w-5 h-5" />
                    </button>
                    <textarea
                        rows={1}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="flex-1 bg-transparent px-2 py-3 max-h-32 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none self-center shadow-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !newMessage.trim()}
                        className="p-2.5 sm:p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-full transition-all flex-shrink-0 shadow-md shadow-indigo-500/20 disabled:shadow-none self-center mx-0.5 active:scale-95"
                    >
                        {sending
                            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                            : <Send className="w-4 h-4 text-white ml-0.5" />
                        }
                    </button>
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
        <div className="flex h-[calc(100vh-130px)] md:h-[calc(100vh-140px)] bg-white/70 backdrop-blur-3xl rounded-[2rem] border border-white shadow-sm overflow-hidden ring-1 ring-slate-100 max-w-7xl mx-auto">

            {/* ── Left: Conversation List ─────────────────────────── */}
            <aside className={`flex flex-col border-r border-slate-100/80 bg-white/70 backdrop-blur-xl transition-all h-full
                ${activeConv ? 'hidden lg:flex lg:w-80 xl:w-96' : 'flex w-full lg:w-80 xl:w-96'}`}>

                {/* Header */}
                <div className="flex flex-col gap-4 px-6 pt-6 pb-4 border-b border-slate-100/80 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Messages</h2>
                        {loading ? (
                            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                        ) : (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 rounded-md">
                                {conversations.length} Active
                            </span>
                        )}
                    </div>
                    
                    {/* Search - Glassmorphic Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-slate-100/80 rounded-full transition-transform group-focus-within:bg-indigo-50/50" />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="relative w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-200/50 rounded-full text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/50 transition-all z-10"
                        />
                    </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto px-3 py-2" style={{ scrollbarWidth: 'none' }}>
                    {!loading && filteredConvs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-600">
                                {search ? 'No conversations found' : 'Inbox zero!'}
                            </p>
                            <p className="text-xs font-medium text-slate-400 mt-1">
                                {search ? 'Try a different search term.' : 'You are all caught up on messages.'}
                            </p>
                        </div>
                    )}

                    <div className="space-y-1">
                        {filteredConvs.map(conv => {
                            const other = getOtherUser(conv);
                            if (!other) return null;
                            const unread = conv.unreadCounts?.[adminId] || 0;
                            const isActive = conv._id === activeConv?._id;

                            return (
                                <button
                                    key={conv._id}
                                    onClick={() => {
                                        setActiveConv(conv);
                                        setConversations(prev => prev.map(c =>
                                            c._id === conv._id ? { ...c, unreadCounts: {} } : c
                                        ));
                                    }}
                                    className={`w-full relative flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all text-left group overflow-hidden border
                                        ${isActive 
                                            ? 'bg-indigo-600 border-indigo-500 shadow-md shadow-indigo-500/20 text-white' 
                                            : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm text-slate-700'
                                        }`}
                                >
                                    <div className="shrink-0 relative">
                                        <div className={`transition-transform duration-300 ${!isActive && 'group-hover:scale-105'}`}>
                                            <ChatAvatar name={other.display_name} avatarUrl={other.avatar_url} size="md" />
                                        </div>
                                        {/* Status indicator pip */}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className={`text-sm truncate font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                                                {other.display_name}
                                            </span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider shrink-0 ml-2 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                                            </span>
                                        </div>
                                        <p className={`text-xs truncate ${isActive ? 'text-indigo-100 font-medium' : (unread > 0 ? 'text-slate-600 font-bold' : 'text-slate-500 font-medium')}`}>
                                            {conv.lastMessage?.text || 'Start a conversation'}
                                        </p>
                                    </div>

                                    {unread > 0 && !isActive && (
                                        <div className="shrink-0 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/30 animate-in zoom-in duration-300">
                                            <span className="text-[9px] font-black text-white">{unread}</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Privacy Note */}
                <div className="px-6 py-4 border-t border-slate-100/80 shrink-0 bg-white/50 backdrop-blur-md">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> End-to-end Encrypted
                    </p>
                </div>
            </aside>

            {/* ── Right: Thread Area ─────────────────────────────────────── */}
            <main className={`flex-1 ${activeConv ? 'flex' : 'hidden lg:flex'} flex-col bg-white overflow-hidden relative`}>
                {!activeConv ? (
                    <div className="flex-1 flex flex-col items-center justify-center relative bg-slate-50/30">
                        {/* Decorative background blur */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6">
                            <div className="w-20 h-20 bg-white border outline outline-4 outline-slate-50 border-slate-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 animate-bounce cursor-default">
                                <Smile className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Select a Conversation</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                Choose an active chat from the sidebar or wait for incoming community inquiries.
                            </p>
                        </div>
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
