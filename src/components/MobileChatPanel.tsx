import { Search, Edit3, ArrowLeft, Send, Phone, Video, Image, Smile } from "lucide-react";
import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useFriends } from "@/hooks/use-friends";
import {
    useConversations,
    useMessages,
    useSendMessage,
    useStartConversation,
    useTypingIndicator,
    type ConversationData,
    type Participant,
} from "@/hooks/use-chat";
import { useSocket } from "@/lib/socket-context";
import { EmojiClickData, Theme } from "emoji-picker-react";
const EmojiPicker = lazy(() => import("emoji-picker-react"));
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWebRTC } from "@/hooks/use-web-rtc";
import { CallModal } from "./chat/CallModal";

// ─── Avatar ─────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
    "from-blue-500 to-purple-600", "from-pink-500 to-rose-600",
    "from-emerald-500 to-teal-600", "from-orange-500 to-amber-600",
    "from-indigo-500 to-blue-600", "from-violet-500 to-purple-600",
    "from-cyan-500 to-blue-600", "from-fuchsia-500 to-pink-600",
];

function getColor(name: string) {
    return AVATAR_COLORS[name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}
function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

function ChatAvatar({ name, avatarUrl, online, size = "md" }: { name: string; avatarUrl?: string | null; online?: boolean; size?: "sm" | "md" | "lg" }) {
    const sizeMap = { sm: "w-8 h-8 text-[10px]", md: "w-11 h-11 text-xs", lg: "w-14 h-14 text-base" };
    const imgSize = { sm: "w-8 h-8", md: "w-11 h-11", lg: "w-14 h-14" };
    const dotMap = { sm: "w-2.5 h-2.5", md: "w-3 h-3", lg: "w-3.5 h-3.5" };
    return (
        <div className="relative flex-shrink-0">
            {avatarUrl ? (
                <img src={avatarUrl} alt={name} className={`${imgSize[size]} rounded-full object-cover`} />
            ) : (
                <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${getColor(name)} flex items-center justify-center font-semibold text-white`}>
                    {getInitials(name)}
                </div>
            )}
            {online && <div className={`absolute bottom-0 right-0 ${dotMap[size]} bg-green-500 rounded-full border-2 border-background`} />}
        </div>
    );
}

// ─── Mobile Chat View ───────────────────────────────────────────────────────
function MobileChatView({ conversation, otherUser, onBack, onCall }: {
    conversation: ConversationData;
    otherUser: Participant;
    onBack: () => void;
    onCall: () => void;
}) {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const { data: msgData, isLoading } = useMessages(conversation._id);
    const sendMessage = useSendMessage();
    const { sendTyping, stopTyping } = useTypingIndicator(conversation._id);
    const { socket } = useSocket();
    const [isOtherTyping, setIsOtherTyping] = useState(false);

    const messages = msgData?.messages || [];

    // Scroll only the chat container — not the main page
    useEffect(() => {
        const el = messagesContainerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (!socket) return;
        const handleTyping = (data: { conversationId: string; userId: string }) => {
            if (data.conversationId === conversation._id && data.userId !== user?._id) setIsOtherTyping(true);
        };
        const handleStopTyping = (data: { conversationId: string; userId: string }) => {
            if (data.conversationId === conversation._id && data.userId !== user?._id) setIsOtherTyping(false);
        };
        socket.on("userTyping", handleTyping);
        socket.on("userStopTyping", handleStopTyping);
        return () => { socket.off("userTyping", handleTyping); socket.off("userStopTyping", handleStopTyping); };
    }, [socket, conversation._id, user?._id]);

    const handleSend = () => {
        if (!newMessage.trim()) return;
        stopTyping();
        sendMessage.mutate({ conversationId: conversation._id, text: newMessage.trim() });
        setNewMessage("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        if (e.target.value.trim()) sendTyping();
        else stopTyping();
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-3 border-b border-post-border flex-shrink-0">
                <button onClick={onBack} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <ChatAvatar name={otherUser.display_name} avatarUrl={otherUser.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{otherUser.display_name}</h3>
                    <p className="text-xs text-muted-foreground">
                        {isOtherTyping ? (
                            <span className="text-blue-400 font-medium flex items-center gap-1">
                                typing
                                <span className="flex gap-0.5">
                                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </span>
                            </span>
                        ) : `@${otherUser.username}`}
                    </p>
                </div>
                <button onClick={onCall} className="p-2 rounded-full hover:bg-muted transition-colors">
                    <Phone className="w-4 h-4 text-foreground" />
                </button>
                <button className="p-2 rounded-full hover:bg-muted transition-colors">
                    <Video className="w-4 h-4 text-foreground" />
                </button>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
                <div className="flex flex-col items-center py-4 mb-2">
                    <ChatAvatar name={otherUser.display_name} avatarUrl={otherUser.avatar_url} size="lg" />
                    <h4 className="text-sm font-bold text-foreground mt-2">{otherUser.display_name}</h4>
                    <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {messages.map((msg) => {
                    const isMine = msg.sender._id === user?._id || msg.sender.toString() === user?._id;
                    return (
                        <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className="max-w-[80%]">
                                {!isMine ? (
                                    <div className="flex items-end gap-2">
                                        <ChatAvatar name={otherUser.display_name} avatarUrl={otherUser.avatar_url} size="sm" />
                                        <div>
                                            <div className="bg-muted/80 rounded-2xl rounded-bl-md px-3 py-2.5">
                                                <p className="text-sm text-foreground leading-relaxed">{msg.text}</p>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground ml-1 mt-0.5 block">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="bg-blue-600 rounded-2xl rounded-br-md px-3 py-2.5">
                                            <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground mr-1 mt-0.5 block text-right">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {isOtherTyping && (
                    <div className="flex items-center gap-2">
                        <ChatAvatar name={otherUser.display_name} avatarUrl={otherUser.avatar_url} size="sm" />
                        <div className="bg-muted/80 rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}

                <div />
            </div>

            {/* Input */}
            <div className="px-3 py-2 border-t border-post-border flex-shrink-0 mb-0">
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="p-2 rounded-full hover:bg-muted transition-colors flex-shrink-0">
                                <Smile className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 border-none bg-transparent shadow-none z-[70]" side="top" align="start">
                            <Suspense fallback={<Skeleton className="h-[350px] w-full rounded-lg" />}>
                                <EmojiPicker
                                    onEmojiClick={(emojiData: EmojiClickData) => setNewMessage((prev) => prev + emojiData.emoji)}
                                    theme={Theme.AUTO}
                                    width="100%"
                                    height={350}
                                />
                            </Suspense>
                        </PopoverContent>
                    </Popover>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Message..."
                            value={newMessage}
                            onChange={handleInputChange}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            className="w-full px-4 py-2.5 bg-muted/50 border border-post-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 transition-all pr-12"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted/80 transition-colors">
                            <Image className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                    {newMessage.trim() && (
                        <button
                            onClick={handleSend}
                            disabled={sendMessage.isPending}
                            className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Mobile Chat Panel ─────────────────────────────────────────────────
export function MobileChatPanel({ onClose, variant = "overlay" }: { onClose?: () => void; variant?: "overlay" | "page" }) {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [activeConversation, setActiveConversation] = useState<ConversationData | null>(null);
    const { data: conversations, isLoading: convsLoading } = useConversations();
    const { data: friends } = useFriends();
    const startConversation = useStartConversation();
    const navigate = useNavigate();

    const getOtherUser = (conv: ConversationData): Participant => {
        return conv.participants.find((p) => p._id !== user?._id) || conv.participants[0];
    };

    const filteredConversations = (conversations || []).filter((conv) => {
        const other = getOtherUser(conv);
        return other.display_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            other.username.toLowerCase().includes(debouncedSearch.toLowerCase());
    });

    const handleStartChat = async (friendId: string) => {
        try {
            const conv = await startConversation.mutateAsync(friendId);
            setActiveConversation(conv);
        } catch (err) { /* handled by hook */ }
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "now";
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    // ─── WebRTC Call Integration ──────────────────────────────────────────────
    const {
        callStatus,
        incomingCall,
        localStream,
        remoteStream,
        isMuted,
        callUser,
        answerCall,
        endCall,
        rejectCall,
        toggleMute
    } = useWebRTC();

    return (
        <div className={variant === "overlay"
            ? `fixed inset-0 bg-background flex flex-col ${activeConversation ? "z-[60]" : "z-40"}`
            : "flex flex-col h-[calc(100vh-4rem)] bg-background relative"
        }>
            <style>{`
                /* Hide support chatbot when chat panel is open */
                button[aria-label*="support chat"] {
                    display: none !important;
                }
            `}</style>

            {/* Call Modal */}
            {(callStatus !== "idle" || incomingCall) && (
                <CallModal
                    status={callStatus}
                    incomingCall={incomingCall}
                    otherUserName={activeConversation ? getOtherUser(activeConversation).display_name : incomingCall?.name}
                    otherUserAvatar={activeConversation ? getOtherUser(activeConversation).avatar_url : null}
                    remoteStream={remoteStream}
                    isMuted={isMuted}
                    onAnswer={answerCall}
                    onReject={rejectCall}
                    onEnd={endCall}
                    onToggleMute={toggleMute}
                />
            )}

            {activeConversation ? (
                <MobileChatView
                    conversation={activeConversation}
                    otherUser={getOtherUser(activeConversation)}
                    onBack={() => setActiveConversation(null)}
                    onCall={() => callUser(getOtherUser(activeConversation)._id)}
                />
            ) : (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-post-border flex-shrink-0">
                        <div className="flex items-center gap-2">
                            {variant === "page" && (
                                <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-foreground" />
                                </button>
                            )}
                            <h2 className="text-lg font-bold text-foreground">Messages</h2>
                        </div>
                        <button className="p-2 rounded-full hover:bg-muted transition-colors">
                            <Edit3 className="w-5 h-5 text-foreground" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-4 py-2 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-post-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Friends */}
                    {friends && friends.length > 0 && (
                        <div className="px-4 py-2 border-b border-post-border flex-shrink-0">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Friends</p>
                            <div className="flex gap-3 overflow-x-auto pb-1">
                                {friends.map((friend) => (
                                    <button key={friend._id} onClick={() => handleStartChat(friend._id)} className="flex flex-col items-center gap-1 group">
                                        <ChatAvatar name={friend.display_name} avatarUrl={friend.avatar_url} size="sm" />
                                        <span className="text-[10px] text-muted-foreground group-hover:text-foreground truncate w-12 text-center">
                                            {friend.display_name.split(" ")[0]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto mb-16" style={{ scrollbarWidth: "thin" }}>
                        {convsLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredConversations.length > 0 ? (
                            filteredConversations.map((conv) => {
                                const other = getOtherUser(conv);
                                return (
                                    <button
                                        key={conv._id}
                                        onClick={() => setActiveConversation(conv)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <ChatAvatar name={other.display_name} avatarUrl={other.avatar_url} />
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm truncate ${conv.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                                                    {other.display_name}
                                                </span>
                                                <span className={`text-[11px] flex-shrink-0 ml-2 ${conv.unreadCount > 0 ? "text-blue-400 font-semibold" : "text-muted-foreground"}`}>
                                                    {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                                                </span>
                                            </div>
                                            <p className={`text-xs mt-0.5 truncate ${conv.unreadCount > 0 ? "text-foreground/80 font-medium" : "text-muted-foreground"}`}>
                                                {conv.lastMessage?.text || "Start a conversation"}
                                            </p>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-white">{conv.unreadCount}</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-6">
                                <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery ? "No conversations found" : "No messages yet"}
                                </p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                    Tap a friend above to start chatting
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
