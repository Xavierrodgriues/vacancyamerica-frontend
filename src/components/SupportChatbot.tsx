import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, ChevronRight, ArrowLeft, Send, Headphones } from 'lucide-react';

// ─── FAQ Data (easily extensible) ───────────────────────────────────────────
interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

const FAQ_DATA: FAQItem[] = [
    // ── 📌 About Vacancy America ──
    {
        id: '1',
        category: '📌 About Vacancy America',
        question: 'What is Vacancy America?',
        answer: 'Vacancy America is a USA-focused professional platform where verified companies publish hiring updates, job openings, and career-related news in a trusted and moderated environment.'
    },
    {
        id: '2',
        category: '📌 About Vacancy America',
        question: 'How is Vacancy America different from LinkedIn or Indeed?',
        answer: 'Unlike open platforms, Vacancy America is curated. Posts are published only by verified admins and approved companies, which reduces spam, fake job listings, and low-quality content.'
    },
    {
        id: '3',
        category: '📌 About Vacancy America',
        question: 'What kind of content is shared here?',
        answer: 'You will find:\n\n• Verified job openings\n• Company hiring announcements\n• USA career news and articles\n• Professional community discussions'
    },
    // ── 👥 Roles on Vacancy America ──
    {
        id: '4',
        category: '👥 Roles on Vacancy America',
        question: 'What roles exist on this platform?',
        answer: 'Vacancy America has three main roles:\n\n• Users: browse, comment, follow, and chat\n• Admins: create hiring/news posts (with approval workflow)\n• Super Admin: verifies admins and approves or rejects posts'
    },
    {
        id: '5',
        category: '👥 Roles on Vacancy America',
        question: 'Why can\'t normal users create posts?',
        answer: 'To maintain trust and prevent spam, posting is limited to verified admins and companies. Users participate through comments, follows, and discussions.'
    },
    {
        id: '6',
        category: '👥 Roles on Vacancy America',
        question: 'Who controls what gets published?',
        answer: 'The Super Admin ensures that only authentic and professional content becomes publicly visible.'
    },
    // ── 🛡️ Becoming an Admin ──
    {
        id: '7',
        category: '🛡️ Becoming an Admin',
        question: 'How can I become an admin on Vacancy America?',
        answer: 'To become an admin, you must register through the Admin Panel. Your request will be reviewed and approved by the Super Admin before you can publish.'
    },
    {
        id: '8',
        category: '🛡️ Becoming an Admin',
        question: 'Why does admin registration require approval?',
        answer: 'Admin approval ensures that only genuine companies and trusted publishers can post hiring content, keeping the platform reliable.'
    },
    {
        id: '9',
        category: '🛡️ Becoming an Admin',
        question: 'What happens after I register as an admin?',
        answer: 'Your admin account stays in "Pending" status until the Super Admin approves it. Once approved, you can start submitting posts.'
    },
    // ── 📢 Admin Posting & Approval Workflow ──
    {
        id: '10',
        category: '📢 Admin Posting & Approval',
        question: 'Why are admin posts not published instantly?',
        answer: 'Most admin posts require Super Admin verification to ensure authenticity and quality before appearing publicly.'
    },
    {
        id: '11',
        category: '📢 Admin Posting & Approval',
        question: 'What are admin levels?',
        answer: 'Admins have 3 levels:\n\n• Level 0: New admin (all posts require approval)\n• Level 1: Trusted admin (fast approval queue)\n• Level 2: Verified publisher (can post directly)'
    },
    {
        id: '12',
        category: '📢 Admin Posting & Approval',
        question: 'What happens if my post is rejected?',
        answer: 'Rejected posts include a clear reason from the Super Admin, and you can edit and resubmit the post.'
    },
    // ── 🎧 Support & Safety ──
    {
        id: '13',
        category: '🎧 Support & Safety',
        question: 'How do I contact Vacancy America support?',
        answer: 'You can contact support through the Support section or the official email provided on the platform.'
    },
    {
        id: '14',
        category: '🎧 Support & Safety',
        question: 'How do I report a suspicious job post?',
        answer: 'If you see a post that looks fake or misleading, use the Report option. Our team will review it quickly.'
    },
    {
        id: '15',
        category: '🎧 Support & Safety',
        question: 'How does Vacancy America prevent fake jobs?',
        answer: 'We use verified admin onboarding, Super Admin approvals, and moderation controls to ensure trust and safety.'
    }
];

// Get unique categories
const CATEGORIES = [...new Set(FAQ_DATA.map(faq => faq.category))];

// ─── Message Types ──────────────────────────────────────────────────────────
interface ChatMessage {
    id: string;
    type: 'bot' | 'user';
    content: string;
    timestamp: Date;
    isQuickReply?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────
export function SupportChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Initialize with welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    type: 'bot',
                    content: '👋 Hi there! Welcome to Vacancy America Support. How can I help you today? Choose a category below or browse our FAQs.',
                    timestamp: new Date()
                }
            ]);
        }
    }, [isOpen]);

    // Pulse animation for unopened chatbot
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => setHasNewMessage(true), 3000);
            return () => clearTimeout(timer);
        } else {
            setHasNewMessage(false);
        }
    }, [isOpen]);

    const toggleChat = () => {
        setIsAnimating(true);
        setIsOpen(!isOpen);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);

        // Add user message
        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            type: 'user',
            content: category,
            timestamp: new Date()
        };

        // Add bot response with category questions
        const categoryFAQs = FAQ_DATA.filter(f => f.category === category);
        const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: `Here are some common questions about **${category}**. Click any question to get your answer:`,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg, botMsg]);
    };

    const handleQuestionSelect = (faq: FAQItem) => {
        // Add user's question
        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            type: 'user',
            content: faq.question,
            timestamp: new Date()
        };

        // Simulate typing delay
        setMessages(prev => [...prev, userMsg]);

        setTimeout(() => {
            const botMsg: ChatMessage = {
                id: `bot-${Date.now()}`,
                type: 'bot',
                content: faq.answer,
                timestamp: new Date()
            };

            const followUp: ChatMessage = {
                id: `followup-${Date.now()}`,
                type: 'bot',
                content: 'Was this helpful? Feel free to ask another question or go back to categories.',
                timestamp: new Date(),
                isQuickReply: true
            };

            setMessages(prev => [...prev, botMsg, followUp]);
        }, 600);
    };

    const handleReset = () => {
        setSelectedCategory(null);
        const botMsg: ChatMessage = {
            id: `reset-${Date.now()}`,
            type: 'bot',
            content: 'Sure! What else would you like to know? Pick a category below:',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const activeFAQs = selectedCategory
        ? FAQ_DATA.filter(f => f.category === selectedCategory)
        : [];

    return (
        <>
            {/* ──── Chat Window ──── */}
            <div
                className={`fixed right-4 md:right-6 z-50 transition-all duration-300 ease-out bottom-36 md:bottom-24 ${isOpen
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                    }`}
                style={{ width: 'min(380px, calc(100vw - 32px))', maxHeight: '480px' }}
            >
                <div className="flex flex-col bg-[#0f1419] border border-[#2f3336] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                    style={{ height: '540px' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                <Headphones className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Support Chat</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-blue-100 text-xs">Always Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#2f3336 transparent'
                        }}
                    >
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${msg.type === 'user' ? 'order-1' : 'order-1'}`}>
                                    {msg.type === 'bot' && (
                                        <div className="flex items-start gap-2">
                                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Headphones className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <div>
                                                <div className="bg-[#1a1f25] border border-[#2f3336] rounded-2xl rounded-tl-md px-4 py-3">
                                                    <p className="text-[#e7e9ea] text-sm leading-relaxed whitespace-pre-wrap">
                                                        {msg.content.split('**').map((part, i) =>
                                                            i % 2 === 1 ? <strong key={i} className="text-blue-400">{part}</strong> : part
                                                        )}
                                                    </p>
                                                </div>
                                                <span className="text-[#536471] text-[10px] ml-2 mt-1 block">{formatTime(msg.timestamp)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {msg.type === 'user' && (
                                        <div>
                                            <div className="bg-blue-600 rounded-2xl rounded-tr-md px-4 py-3">
                                                <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                                            </div>
                                            <span className="text-[#536471] text-[10px] mr-2 mt-1 block text-right">{formatTime(msg.timestamp)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Category Buttons */}
                        {!selectedCategory && (
                            <div className="space-y-2 mt-2">
                                {CATEGORIES.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategorySelect(category)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-[#1a1f25] hover:bg-[#22272d] border border-[#2f3336] hover:border-blue-500/50 rounded-xl transition-all duration-200 group"
                                    >
                                        <span className="text-[#e7e9ea] text-sm font-medium">{category}</span>
                                        <ChevronRight className="w-4 h-4 text-[#536471] group-hover:text-blue-400 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* FAQ Buttons for selected category */}
                        {selectedCategory && (
                            <div className="space-y-2 mt-2">
                                {activeFAQs.map((faq) => (
                                    <button
                                        key={faq.id}
                                        onClick={() => handleQuestionSelect(faq)}
                                        className="w-full text-left px-4 py-3 bg-[#1a1f25] hover:bg-[#22272d] border border-[#2f3336] hover:border-blue-500/50 rounded-xl transition-all duration-200 group"
                                    >
                                        <span className="text-[#e7e9ea] text-sm leading-snug">{faq.question}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-4 py-2.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Back to categories
                                </button>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-[#0f1419] border-t border-[#2f3336] flex-shrink-0">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1f25] border border-[#2f3336] rounded-full">
                            <span className="text-[#536471] text-sm flex-1">Choose a question above...</span>
                            <Send className="w-4 h-4 text-[#536471]" />
                        </div>
                        <p className="text-center text-[#536471] text-[10px] mt-2">
                            Powered by Vacancy America · Support
                        </p>
                    </div>
                </div>
            </div>

            {/* ──── Floating Toggle Button ──── */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isOpen
                    ? 'bg-[#1a1f25] border border-[#2f3336] rotate-0 hover:bg-[#22272d]'
                    : 'bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 hover:scale-110 hover:shadow-blue-500/30 hover:shadow-xl'
                    }`}
                aria-label={isOpen ? 'Close support chat' : 'Open support chat'}
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-white" />
                ) : (
                    <Headphones className="w-6 h-6 text-white" />
                )}

                {/* Notification badge */}
                {hasNewMessage && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white">1</span>
                    </span>
                )}

                {/* Pulse ring */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
                )}
            </button>
        </>
    );
}
