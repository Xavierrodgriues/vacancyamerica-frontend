import {
    Search, Edit3, Send, Phone, Video, Smile, ArrowLeft,
    Lock, Users, MessageCircle
} from "lucide-react";
import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchParams } from "react-router-dom";
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
    "from-blue-500 to-purple-600",
    "from-pink-500 to-rose-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-indigo-500 to-blue-600",
    "from-violet-500 to-purple-600",
    "from-cyan-500 to-blue-600",
    "from-fuchsia-500 to-pink-600",
];

function getColor(name: string) {
    return AVATAR_COLORS[
        name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length
    ];
}
function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}

function ChatAvatar({
    name,
    avatarUrl,
    online,
    size = "md",
}: {
    name: string;
    avatarUrl?: string | null;
    online?: boolean;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
    const sizeMap = {
        xs: "w-7 h-7 text-[9px]",
        sm: "w-9 h-9 text-[11px]",
        md: "w-11 h-11 text-xs",
        lg: "w-14 h-14 text-base",
        xl: "w-16 h-16 text-lg",
    };
    const imgSize = {
        xs: "w-7 h-7",
        sm: "w-9 h-9",
        md: "w-11 h-11",
        lg: "w-14 h-14",
        xl: "w-16 h-16",
    };
    const dotMap = {
        xs: "w-2 h-2",
        sm: "w-2.5 h-2.5",
        md: "w-3 h-3",
        lg: "w-3.5 h-3.5",
        xl: "w-4 h-4",
    };
    return (
        <div className="relative flex-shrink-0">
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={name}
                    className={`${imgSize[size]} rounded-full object-cover`}
                />
            ) : (
                <div
                    className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${getColor(name)} flex items-center justify-center font-bold text-white shadow-sm`}
                >
                    {getInitials(name)}
                </div>
            )}
            {online && (
                <div
                    className={`absolute bottom-0 right-0 ${dotMap[size]} bg-emerald-400 rounded-full border-2 border-white`}
                />
            )}
        </div>
    );
}

// ─── Time formatter ─────────────────────────────────────────────────────────
function formatTime(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}D`;
}

// ─── Chat View (right panel) ─────────────────────────────────────────────────
function ChatView({
    conversation,
    otherUser,
    onCall,
    onBack,
}: {
    conversation: ConversationData;
    otherUser: Participant;
    onCall: () => void;
    onBack?: () => void;
}) {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const { data: msgData, isLoading } = useMessages(conversation._id);
    const sendMessage = useSendMessage();
    const { sendTyping, stopTyping } = useTypingIndicator(conversation._id);
    const { socket } = useSocket();
    const [isOtherTyping, setIsOtherTyping] = useState(false);

    const messages = msgData?.messages || [];

    useEffect(() => {
        const el = messagesContainerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (!socket) return;
        const handleTyping = (data: { conversationId: string; userId: string }) => {
            if (data.conversationId === conversation._id && data.userId !== user?._id)
                setIsOtherTyping(true);
        };
        const handleStopTyping = (data: { conversationId: string; userId: string }) => {
            if (data.conversationId === conversation._id && data.userId !== user?._id)
                setIsOtherTyping(false);
        };
        socket.on("userTyping", handleTyping);
        socket.on("userStopTyping", handleStopTyping);
        return () => {
            socket.off("userTyping", handleTyping);
            socket.off("userStopTyping", handleStopTyping);
        };
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
            {/* ─── Chat Header ─── */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
                {/* Mobile back button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="md:hidden p-1.5 rounded-full hover:bg-slate-100 transition-colors mr-1"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                )}
                <ChatAvatar
                    name={otherUser.display_name}
                    avatarUrl={otherUser.avatar_url}
                    online={true}
                    size="md"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-slate-800 leading-tight">
                        {otherUser.display_name}
                    </h3>
                    <p className="text-[12px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        {isOtherTyping ? (
                            <span className="text-indigo-500 font-medium flex items-center gap-1">
                                typing
                                <span className="flex gap-0.5 ml-1">
                                    <span
                                        className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0ms" }}
                                    />
                                    <span
                                        className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "150ms" }}
                                    />
                                    <span
                                        className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "300ms" }}
                                    />
                                </span>
                            </span>
                        ) : (
                            <>
                                <span>@{otherUser.username}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-emerald-500 font-medium">Active</span>
                            </>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onCall}
                        className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                        title="Voice Call"
                    >
                        <Phone className="w-4.5 h-4.5 text-slate-500" />
                    </button>
                    <button
                        className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                        title="Video Call"
                    >
                        <Video className="w-4.5 h-4.5 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* ─── Messages Area ─── */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-5 py-5 space-y-1"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
            >
                {/* Profile intro */}
                <div className="flex flex-col items-center py-6 mb-4">
                    <ChatAvatar
                        name={otherUser.display_name}
                        avatarUrl={otherUser.avatar_url}
                        online={true}
                        size="xl"
                    />
                    <h4 className="text-base font-bold text-slate-800 mt-3">
                        {otherUser.display_name}
                    </h4>
                    <p className="text-[13px] text-slate-400">@{otherUser.username}</p>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isMine =
                        msg.sender._id === user?._id ||
                        msg.sender.toString() === user?._id;
                    const prevMsg = messages[idx - 1];
                    const nextMsg = messages[idx + 1];
                    const isSameAsPrev =
                        prevMsg &&
                        (prevMsg.sender._id === msg.sender._id ||
                            prevMsg.sender.toString() === msg.sender._id);
                    const isSameAsNext =
                        nextMsg &&
                        (nextMsg.sender._id === msg.sender._id ||
                            nextMsg.sender.toString() === msg.sender._id);

                    return (
                        <div
                            key={msg._id}
                            className={`flex ${isMine ? "justify-end" : "justify-start"} ${isSameAsPrev ? "mt-0.5" : "mt-3"}`}
                        >
                            {/* Other user avatar */}
                            {!isMine && (
                                <div className="flex-shrink-0 mr-2 self-end">
                                    {!isSameAsNext ? (
                                        <ChatAvatar
                                            name={otherUser.display_name}
                                            avatarUrl={otherUser.avatar_url}
                                            size="sm"
                                        />
                                    ) : (
                                        <div className="w-9 h-9" />
                                    )}
                                </div>
                            )}

                            <div className={`max-w-[65%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                                <div
                                    className={`px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                                        isMine
                                            ? `text-white rounded-2xl ${
                                                  isSameAsPrev ? "rounded-tr-md" : ""
                                              } ${isSameAsNext ? "rounded-br-md" : ""}`
                                            : `text-slate-700 bg-white border border-slate-100 rounded-2xl ${
                                                  isSameAsPrev ? "rounded-tl-md" : ""
                                              } ${isSameAsNext ? "rounded-bl-md" : ""}`
                                    }`}
                                    style={
                                        isMine
                                            ? {
                                                  background:
                                                      "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                                              }
                                            : {}
                                    }
                                >
                                    {msg.text}
                                </div>
                                {/* Timestamp — only show on last in a group */}
                                {!isSameAsNext && (
                                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Typing indicator */}
                {isOtherTyping && (
                    <div className="flex items-end gap-2 mt-3">
                        <ChatAvatar
                            name={otherUser.display_name}
                            avatarUrl={otherUser.avatar_url}
                            size="sm"
                        />
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                                <span
                                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0ms" }}
                                />
                                <span
                                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "150ms" }}
                                />
                                <span
                                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "300ms" }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ─── Input Bar ─── */}
            <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1 focus-within:border-indigo-300 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="p-1.5 rounded-xl hover:bg-slate-200 transition-colors flex-shrink-0">
                                <Smile className="w-5 h-5 text-slate-400" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-full p-0 border-none bg-transparent shadow-none z-[70]"
                            side="top"
                            align="start"
                        >
                            <Suspense fallback={<Skeleton className="h-[350px] w-full rounded-lg" />}>
                                <EmojiPicker
                                    onEmojiClick={(emojiData: EmojiClickData) =>
                                        setNewMessage((prev) => prev + emojiData.emoji)
                                    }
                                    theme={Theme.LIGHT}
                                    width="100%"
                                    height={350}
                                />
                            </Suspense>
                        </PopoverContent>
                    </Popover>

                    <input
                        type="text"
                        name="messageInput"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        className="flex-1 bg-transparent py-2 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none min-w-0"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sendMessage.isPending}
                        className={`p-2 rounded-xl flex-shrink-0 transition-all ${
                            newMessage.trim()
                                ? "text-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                : "text-slate-300 cursor-default"
                        }`}
                        style={
                            newMessage.trim()
                                ? {
                                      background:
                                          "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                                  }
                                : { background: "transparent" }
                        }
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyChatState() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
            <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)" }}
            >
                <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-bold text-slate-800">Your Messages</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                    Select a conversation to start messaging or pick a friend to chat with.
                </p>
            </div>
        </div>
    );
}

// ─── Desktop Chat Panel ──────────────────────────────────────────────────────
export function DesktopChatPanel() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [activeConversation, setActiveConversation] = useState<ConversationData | null>(null);
    const { data: conversations, isLoading: convsLoading } = useConversations();
    const { data: friends } = useFriends();
    const startConversation = useStartConversation();
    const [searchParams, setSearchParams] = useSearchParams();
    const chatId = searchParams.get("chatId");

    // Auto-open conversation from URL
    useEffect(() => {
        if (chatId && conversations && conversations.length > 0 && !activeConversation) {
            const targetConv = conversations.find((c) => c._id === chatId);
            if (targetConv) setActiveConversation(targetConv);
        }
    }, [chatId, conversations, activeConversation]);

    const getOtherUser = (conv: ConversationData): Participant =>
        conv.participants.find((p) => p._id !== user?._id) || conv.participants[0];

    const filteredConversations = (conversations || []).filter((conv) => {
        const other = getOtherUser(conv);
        return (
            other.display_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            other.username.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    });

    const handleStartChat = async (friendId: string) => {
        try {
            const conv = await startConversation.mutateAsync(friendId);
            setActiveConversation(conv);
        } catch (_) {}
    };

    const handleSelectConversation = (conv: ConversationData) => {
        setActiveConversation(conv);
        setSearchParams((p) => {
            p.set("chatId", conv._id);
            return p;
        }, { replace: true });
    };

    const handleBack = () => {
        setActiveConversation(null);
        setSearchParams((p) => { p.delete("chatId"); return p; }, { replace: true });
    };

    const activeCount = (conversations || []).filter((c) => c.unreadCount > 0).length;

    // ─── WebRTC ──────────────────────────────────────────────────────────────
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
        toggleMute,
    } = useWebRTC();

    return (
        <div className="h-full w-full flex bg-white overflow-hidden">
            {/* Call Modal */}
            {(callStatus !== "idle" || incomingCall) && (
                <CallModal
                    status={callStatus}
                    incomingCall={incomingCall}
                    otherUserName={
                        activeConversation
                            ? getOtherUser(activeConversation).display_name
                            : incomingCall?.name
                    }
                    otherUserAvatar={
                        activeConversation ? getOtherUser(activeConversation).avatar_url : null
                    }
                    localStream={localStream}
                    remoteStream={remoteStream}
                    isMuted={isMuted}
                    onAnswer={answerCall}
                    onReject={rejectCall}
                    onEnd={endCall}
                    onToggleMute={toggleMute}
                />
            )}

            {/* ─── LEFT PANEL: Conversation list ─── */}
            <div
                className={`w-full md:w-[300px] lg:w-[320px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white ${
                    activeConversation ? "hidden md:flex" : "flex"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-[18px] font-extrabold text-slate-800 tracking-tight">
                            Messages
                        </h2>
                        {activeCount > 0 && (
                            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                                style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)" }}>
                                {activeCount} ACTIVE
                            </span>
                        )}
                    </div>
                    <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <Edit3 className="w-4.5 h-4.5 text-slate-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            name="searchMessages"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Friends strip */}
                {friends && friends.length > 0 && (
                    <div className="px-4 pb-3 border-b border-slate-100 flex-shrink-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> Friends
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                            {friends.map((friend) => (
                                <button
                                    key={friend._id}
                                    onClick={() => handleStartChat(friend._id)}
                                    className="flex flex-col items-center gap-1.5 group flex-shrink-0"
                                >
                                    <div className="relative">
                                        <ChatAvatar
                                            name={friend.display_name}
                                            avatarUrl={friend.avatar_url}
                                            size="sm"
                                        />
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                                    </div>
                                    <span className="text-[10px] text-slate-500 group-hover:text-indigo-500 truncate w-11 text-center transition-colors font-medium">
                                        {friend.display_name.split(" ")[0]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>
                    {convsLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredConversations.length > 0 ? (
                        filteredConversations.map((conv) => {
                            const other = getOtherUser(conv);
                            const isActive = activeConversation?._id === conv._id;
                            return (
                                <button
                                    key={conv._id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left group relative ${
                                        isActive ? "" : "hover:bg-slate-50"
                                    }`}
                                    style={
                                        isActive
                                            ? {
                                                  background:
                                                      "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                                              }
                                            : {}
                                    }
                                >
                                    <div className="relative flex-shrink-0">
                                        <ChatAvatar
                                            name={other.display_name}
                                            avatarUrl={other.avatar_url}
                                            online={true}
                                            size="md"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-[14px] font-semibold truncate ${
                                                    isActive
                                                        ? "text-white"
                                                        : conv.unreadCount > 0
                                                          ? "text-slate-900 font-bold"
                                                          : "text-slate-700"
                                                }`}
                                            >
                                                {other.display_name}
                                            </span>
                                            <span
                                                className={`text-[11px] flex-shrink-0 ml-2 font-medium ${
                                                    isActive
                                                        ? "text-indigo-200"
                                                        : conv.unreadCount > 0
                                                          ? "text-indigo-500"
                                                          : "text-slate-400"
                                                }`}
                                            >
                                                {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                                            </span>
                                        </div>
                                        <p
                                            className={`text-[12px] mt-0.5 truncate ${
                                                isActive
                                                    ? "text-indigo-200"
                                                    : conv.unreadCount > 0
                                                      ? "text-slate-700 font-medium"
                                                      : "text-slate-400"
                                            }`}
                                        >
                                            {conv.lastMessage?.text || "Start a conversation"}
                                        </p>
                                    </div>
                                    {conv.unreadCount > 0 && !isActive && (
                                        <div
                                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ml-1"
                                            style={{
                                                background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                                            }}
                                        >
                                            <span className="text-[9px] font-bold text-white">
                                                {conv.unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-6">
                            <Search className="w-10 h-10 text-slate-200 mb-3" />
                            <p className="text-sm text-slate-400 font-medium">
                                {searchQuery ? "No conversations found" : "No messages yet"}
                            </p>
                            <p className="text-xs text-slate-300 mt-1">
                                {searchQuery ? "" : "Tap a friend above to start chatting"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
                    <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5 uppercase tracking-widest">
                        <Lock className="w-3 h-3" /> End-to-End Encrypted
                    </p>
                </div>
            </div>

            {/* ─── RIGHT PANEL: Chat view ─── */}
            <div
                className={`flex-1 flex flex-col bg-slate-50/50 ${
                    activeConversation ? "flex" : "hidden md:flex"
                }`}
            >
                {activeConversation ? (
                    <ChatView
                        conversation={activeConversation}
                        otherUser={getOtherUser(activeConversation)}
                        onCall={() => callUser(getOtherUser(activeConversation)._id)}
                        onBack={handleBack}
                    />
                ) : (
                    <EmptyChatState />
                )}
            </div>
        </div>
    );
}
