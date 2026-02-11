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
    {
        id: '1',
        category: 'Getting Started',
        question: 'How do I create an account?',
        answer: 'To create an account, click the "Sign Up" button on the login page. Fill in your details including username, email, and password. Once submitted, you\'ll be able to start using Vacancy America right away!'
    },
    {
        id: '2',
        category: 'Getting Started',
        question: 'How do I create a post?',
        answer: 'Once logged in, you\'ll find a "Create Post" section at the top of your Home feed. Simply type your content, optionally attach an image or video, and click "Post" to share it with the community.'
    },
    {
        id: '3',
        category: 'Account',
        question: 'How do I edit my profile?',
        answer: 'Navigate to your Profile page by clicking "Profile" in the sidebar. There you can update your display name, bio, avatar, and other profile information.'
    },
    {
        id: '4',
        category: 'Account',
        question: 'How do I change my password?',
        answer: 'Go to your Profile settings and look for the password section. Enter your current password and your new password to update it. For security, make sure your new password is at least 8 characters long.'
    },
    {
        id: '5',
        category: 'Jobs',
        question: 'How do I search for jobs?',
        answer: 'Use the "Explore" page to discover job listings. You can filter by role, location, and keywords. Click on any listing to view full details and application instructions.'
    },
    {
        id: '6',
        category: 'Jobs',
        question: 'How often are jobs updated?',
        answer: 'Our job listings are updated regularly through automated scraping and manual curation. New positions are added daily, so check back frequently for the latest opportunities!'
    },
    {
        id: '7',
        category: 'Community',
        question: 'How do I follow other users?',
        answer: 'Visit any user\'s profile and click the "Follow" button. You can also follow users directly from their posts on your feed by clicking the follow icon.'
    },
    {
        id: '8',
        category: 'Community',
        question: 'How do I report inappropriate content?',
        answer: 'If you encounter inappropriate content, please contact our support team through this chatbot or via email. We take all reports seriously and will review them promptly.'
    },
    {
        id: '9',
        category: 'Admin',
        question: 'How do I become an admin?',
        answer: 'To become an admin, navigate to the Admin Registration page (/admin/register) and submit your application. A Super Admin will review and approve your request. Once approved, you\'ll be able to access the Admin Dashboard.'
    },
    {
        id: '10',
        category: 'Support',
        question: 'How do I contact support?',
        answer: 'You can reach our support team through this chatbot for common questions, or email us at support@vacancyamerica.com for more complex issues. We typically respond within 24 hours.'
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
                className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ease-out ${isOpen
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                    }`}
                style={{ width: '380px', maxHeight: '560px' }}
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
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isOpen
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
