import { Search, Circle, Camera, Edit3, ArrowLeft, Send, Phone, Video, Info, Image, Smile, Mic } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// ─── Dummy Chat Data ────────────────────────────────────────────────────────
interface ChatUser {
    id: string;
    name: string;
    username: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
    isTyping?: boolean;
}

interface Message {
    id: string;
    senderId: string;
    text: string;
    time: string;
    isMine: boolean;
}

const DUMMY_CHATS: ChatUser[] = [
    { id: "1", name: "Sarah Johnson", username: "sarahj", lastMessage: "Hey! I saw the new job posting 🎉", time: "2m", unread: 3, online: true },
    { id: "2", name: "Mike Chen", username: "mikechen", lastMessage: "Thanks for the referral!", time: "15m", unread: 1, online: true, isTyping: true },
    { id: "3", name: "Emily Davis", username: "emilyd", lastMessage: "Can you share the interview tips?", time: "1h", unread: 0, online: true },
    { id: "4", name: "Alex Rivera", username: "alexr", lastMessage: "Great article on remote work!", time: "2h", unread: 0, online: false },
    { id: "5", name: "Jessica Wang", username: "jessicaw", lastMessage: "Let's connect later today", time: "3h", unread: 2, online: true },
    { id: "6", name: "David Kim", username: "davidk", lastMessage: "Sent you the resume template", time: "5h", unread: 0, online: false },
    { id: "7", name: "Rachel Green", username: "rachelg", lastMessage: "How's the new role going?", time: "8h", unread: 0, online: false },
    { id: "8", name: "Tom Wilson", username: "tomw", lastMessage: "Check out this company 👀", time: "1d", unread: 0, online: false },
    { id: "9", name: "Lisa Thompson", username: "lisat", lastMessage: "Congrats on the offer! 🥳", time: "1d", unread: 0, online: true },
    { id: "10", name: "James Brown", username: "jamesb", lastMessage: "We should catch up sometime", time: "2d", unread: 0, online: false },
];

// Dummy conversation messages per user
const DUMMY_MESSAGES: Record<string, Message[]> = {
    "1": [
        { id: "m1", senderId: "1", text: "Hey! How are you doing?", time: "10:30 AM", isMine: false },
        { id: "m2", senderId: "me", text: "I'm great! Just browsing for new roles 😊", time: "10:32 AM", isMine: true },
        { id: "m3", senderId: "1", text: "That's awesome! Have you checked the latest postings?", time: "10:33 AM", isMine: false },
        { id: "m4", senderId: "me", text: "Not yet, any recommendations?", time: "10:35 AM", isMine: true },
        { id: "m5", senderId: "1", text: "Hey! I saw the new job posting 🎉", time: "10:36 AM", isMine: false },
    ],
    "2": [
        { id: "m1", senderId: "me", text: "Thanks for connecting me with the hiring manager!", time: "9:00 AM", isMine: true },
        { id: "m2", senderId: "2", text: "No problem at all! They were really impressed with your profile", time: "9:05 AM", isMine: false },
        { id: "m3", senderId: "me", text: "That means a lot, really appreciate it 🙏", time: "9:07 AM", isMine: true },
        { id: "m4", senderId: "2", text: "Thanks for the referral!", time: "9:10 AM", isMine: false },
    ],
    "3": [
        { id: "m1", senderId: "3", text: "Hi! I have an interview coming up next week", time: "Yesterday", isMine: false },
        { id: "m2", senderId: "me", text: "That's great! Which company?", time: "Yesterday", isMine: true },
        { id: "m3", senderId: "3", text: "It's a senior dev role at a startup", time: "Yesterday", isMine: false },
        { id: "m4", senderId: "3", text: "Can you share the interview tips?", time: "1h ago", isMine: false },
    ],
    "5": [
        { id: "m1", senderId: "5", text: "Hey! Loved your recent post about career growth", time: "2h ago", isMine: false },
        { id: "m2", senderId: "me", text: "Thanks Jessica! Glad you found it useful", time: "2h ago", isMine: true },
        { id: "m3", senderId: "5", text: "Let's connect later today", time: "1h ago", isMine: false },
    ],
};

// Fallback messages for users without specific conversations
const DEFAULT_MESSAGES: Message[] = [
    { id: "d1", senderId: "other", text: "Hey! Nice to connect with you on Vacancy America 👋", time: "Yesterday", isMine: false },
    { id: "d2", senderId: "me", text: "Hey! Great to connect. How's the job search going?", time: "Yesterday", isMine: true },
    { id: "d3", senderId: "other", text: "Pretty good! Found some great listings here", time: "Yesterday", isMine: false },
];

// ─── Avatar Colors ──────────────────────────────────────────────────────────
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
    const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

// ─── Avatar ─────────────────────────────────────────────────────────────────
function ChatAvatar({ name, online, size = "md" }: { name: string; online: boolean; size?: "sm" | "md" | "lg" }) {
    const sizeMap = { sm: "w-8 h-8 text-[10px]", md: "w-11 h-11 text-xs", lg: "w-14 h-14 text-base" };
    const dotMap = { sm: "w-2.5 h-2.5", md: "w-3 h-3", lg: "w-3.5 h-3.5" };

    return (
        <div className="relative flex-shrink-0">
            <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${getColor(name)} flex items-center justify-center font-semibold text-white`}>
                {getInitials(name)}
            </div>
            {online && (
                <div className={`absolute bottom-0 right-0 ${dotMap[size]} bg-green-500 rounded-full border-2 border-background`} />
            )}
        </div>
    );
}

// ─── Chat Conversation View ─────────────────────────────────────────────────
function ChatView({ user, onBack }: { user: ChatUser; onBack: () => void }) {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>(
        DUMMY_MESSAGES[user.id] || DEFAULT_MESSAGES
    );
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim()) return;
        const msg: Message = {
            id: `new-${Date.now()}`,
            senderId: "me",
            text: newMessage.trim(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isMine: true,
        };
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-post-border flex-shrink-0">
                <button onClick={onBack} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <ChatAvatar name={user.name} online={user.online} size="md" />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{user.name}</h3>
                    <p className="text-xs text-muted-foreground">
                        {user.isTyping ? (
                            <span className="text-blue-400 font-medium flex items-center gap-1">
                                typing
                                <span className="flex gap-0.5">
                                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </span>
                            </span>
                        ) : user.online ? "Active now" : `Active ${user.time} ago`}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2 rounded-full hover:bg-muted transition-colors">
                        <Phone className="w-4 h-4 text-foreground" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-muted transition-colors">
                        <Video className="w-4 h-4 text-foreground" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-muted transition-colors">
                        <Info className="w-4 h-4 text-foreground" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#2f3336 transparent" }}
            >
                {/* Profile info at top */}
                <div className="flex flex-col items-center py-6 mb-4">
                    <ChatAvatar name={user.name} online={user.online} size="lg" />
                    <h4 className="text-base font-bold text-foreground mt-3">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">@{user.username} · Vacancy America</p>
                    <button className="mt-3 px-4 py-1.5 text-xs font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-full transition-colors">
                        View Profile
                    </button>
                </div>

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] ${msg.isMine ? "order-1" : ""}`}>
                            {!msg.isMine && (
                                <div className="flex items-end gap-2">
                                    <ChatAvatar name={user.name} online={false} size="sm" />
                                    <div>
                                        <div className="bg-muted/80 rounded-2xl rounded-bl-md px-3.5 py-2.5">
                                            <p className="text-sm text-foreground leading-relaxed">{msg.text}</p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground ml-1 mt-0.5 block">{msg.time}</span>
                                    </div>
                                </div>
                            )}
                            {msg.isMine && (
                                <div>
                                    <div className="bg-blue-600 rounded-2xl rounded-br-md px-3.5 py-2.5">
                                        <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground mr-1 mt-0.5 block text-right">{msg.time}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-4 py-3 border-t border-post-border flex-shrink-0">
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-muted transition-colors flex-shrink-0">
                        <Smile className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            className="w-full px-4 py-2.5 bg-muted/50 border border-post-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all pr-20"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                            <button className="p-1.5 rounded-full hover:bg-muted/80 transition-colors">
                                <Mic className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button className="p-1.5 rounded-full hover:bg-muted/80 transition-colors">
                                <Image className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>
                    {newMessage.trim() && (
                        <button
                            onClick={handleSend}
                            className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors flex-shrink-0"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function RightSidebar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"primary" | "general">("primary");
    const [activeChat, setActiveChat] = useState<ChatUser | null>(null);

    const filteredChats = DUMMY_CHATS.filter(
        (chat) =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalUnread = DUMMY_CHATS.reduce((sum, c) => sum + c.unread, 0);

    return (
        <aside className="hidden lg:flex flex-col flex-1 h-screen sticky top-0 border-l border-post-border bg-background overflow-hidden">
            {activeChat ? (
                <ChatView user={activeChat} onBack={() => setActiveChat(null)} />
            ) : (
                <>
                    {/* ── Header ── */}
                    <div className="px-5 py-4 border-b border-post-border flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">Messages</h2>
                            <button className="p-2 rounded-full hover:bg-muted transition-colors">
                                <Edit3 className="w-5 h-5 text-foreground" />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-post-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                            />
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex border-b border-post-border flex-shrink-0">
                        <button
                            onClick={() => setActiveTab("primary")}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === "primary" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                                }`}
                        >
                            Primary
                            {totalUnread > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">
                                    {totalUnread}
                                </span>
                            )}
                            {activeTab === "primary" && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-blue-500 rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("general")}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === "general" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                                }`}
                        >
                            General
                            {activeTab === "general" && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-blue-500 rounded-full" />
                            )}
                        </button>
                    </div>

                    {/* ── Active Now ── */}
                    <div className="px-4 py-3 border-b border-post-border flex-shrink-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Now</p>
                        <div className="flex gap-3 overflow-x-auto pb-1">
                            {DUMMY_CHATS.filter((c) => c.online).map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => setActiveChat(user)}
                                    className="flex flex-col items-center gap-1 group cursor-pointer"
                                >
                                    <ChatAvatar name={user.name} online size="sm" />
                                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors truncate w-12 text-center">
                                        {user.name.split(" ")[0]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Chat List ── */}
                    <div
                        className="flex-1 overflow-y-auto"
                        style={{ scrollbarWidth: "thin", scrollbarColor: "#2f3336 transparent" }}
                    >
                        {activeTab === "primary" ? (
                            filteredChats.length > 0 ? (
                                filteredChats.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => setActiveChat(chat)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors duration-150 cursor-pointer group"
                                    >
                                        <ChatAvatar name={chat.name} online={chat.online} />
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm truncate ${chat.unread > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                                                    {chat.name}
                                                </span>
                                                <span className={`text-[11px] flex-shrink-0 ml-2 ${chat.unread > 0 ? "text-blue-400 font-semibold" : "text-muted-foreground"}`}>
                                                    {chat.time}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {chat.isTyping ? (
                                                    <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
                                                        typing
                                                        <span className="flex gap-0.5">
                                                            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className={`text-xs truncate ${chat.unread > 0 ? "text-foreground/80 font-medium" : "text-muted-foreground"}`}>
                                                        {chat.lastMessage}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {chat.unread > 0 && (
                                            <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-white">{chat.unread}</span>
                                            </div>
                                        )}
                                        {!chat.unread && (
                                            <Camera className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-6">
                                    <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-muted-foreground text-center">No conversations found</p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-6">
                                <Circle className="w-10 h-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground text-center">No general messages</p>
                                <p className="text-xs text-muted-foreground/60 text-center mt-1">Group conversations will appear here</p>
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="px-4 py-3 border-t border-post-border flex-shrink-0">
                        <p className="text-[11px] text-muted-foreground/60 text-center">End-to-end encrypted · Vacancy America</p>
                    </div>
                </>
            )}
        </aside>
    );
}
