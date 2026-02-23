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
        answer: `Vacancy America is a professionally structured, USA-focused hiring and career intelligence platform built to deliver verified, trustworthy, and high-quality employment information. The platform was designed with one core mission: eliminate spam, reduce fake job listings, and create a secure ecosystem where professionals can confidently explore career opportunities.

Unlike traditional open job boards, Vacancy America operates under a controlled publishing model. All hiring announcements, career updates, and company communications are submitted by verified entities and pass through a structured moderation workflow before becoming publicly visible.

The platform serves multiple purposes:

• Providing authentic job openings from verified companies
• Publishing official hiring updates and announcements
• Sharing USA-focused employment news and labor market insights
• Facilitating professional-level discussions in a moderated environment
• Creating a trusted bridge between employers and job seekers

Vacancy America prioritizes quality over quantity. Every visible post reflects credibility, review, and accountability, making it a safer alternative to open-content platforms.`
    },
    {
        id: '2',
        category: '📌 About Vacancy America',
        question: 'How is Vacancy America different from LinkedIn or Indeed?',
        answer: `Vacancy America differs fundamentally in its publishing structure, content governance model, and verification process.

On platforms like LinkedIn or Indeed, content publishing is largely open, allowing individual users, recruiters, and automated systems to post freely. While this creates volume and scale, it can also introduce spam, duplicate listings, misleading opportunities, and unverified claims.

Vacancy America operates differently through a curated and approval-driven ecosystem. Key distinctions include:

• Restricted publishing rights – Only approved and verified admins can create posts.
• Structured moderation – Most posts require review by a Super Admin before going live.
• Multi-level admin trust system – Admin levels determine publishing authority based on reliability history.
• Reduced noise – No irrelevant content, promotional spam, or unverified posts.
• Focused content strategy – Strictly USA-based career and hiring information.

This controlled structure ensures higher signal-to-noise ratio, improved credibility, and a professional environment tailored for serious hiring communication rather than social networking.`
    },
    {
        id: '3',
        category: '📌 About Vacancy America',
        question: 'What kind of content is shared here?',
        answer: `Vacancy America is strictly focused on professional and career-oriented content relevant to the United States employment ecosystem. The platform does not allow unrelated promotional, personal, or entertainment-based content.

Types of content include:

• Verified job openings from approved employers
• Company hiring announcements and recruitment campaigns
• Official internship and graduate program postings
• USA labor market updates and employment trends
• Career growth resources and structured professional insights
• Moderated discussions around hiring practices and industry updates

Every piece of content undergoes quality control measures to ensure:

• Accuracy
• Professional tone
• Relevance to U.S. employment standards
• Compliance with platform policies

The result is a highly focused environment where job seekers can trust what they see, and employers can communicate professionally.`
    },

    // ── 👥 Roles on Vacancy America ──
    {
        id: '4',
        category: '👥 Roles on Vacancy America',
        question: 'What roles exist on this platform?',
        answer: `Vacancy America operates using a clearly defined role-based access system to maintain governance, quality, and accountability.

There are three primary roles:

1. Users  
Users are general members who can:
• Browse job listings and announcements  
• Comment on posts  
• Follow companies  
• Engage in moderated discussions  
• Connect via chat (where applicable)

Users cannot create public posts, ensuring content integrity.

2. Admins  
Admins represent verified companies or authorized publishers. Their responsibilities include:
• Creating hiring and career-related posts  
• Submitting content for approval (depending on level)  
• Maintaining professional communication standards  
• Following platform publishing policies  

Admins operate under an approval workflow and trust-level system.

3. Super Admin  
The Super Admin oversees the entire platform governance structure. Responsibilities include:
• Verifying admin registration requests  
• Reviewing and approving submitted posts  
• Assigning admin levels  
• Rejecting low-quality or misleading content  
• Maintaining safety and compliance standards  

This structured hierarchy ensures clarity of responsibility and maintains platform credibility.`
    },

    {
        id: '5',
        category: '👥 Roles on Vacancy America',
        question: 'Why can\'t normal users create posts?',
        answer: `Vacancy America intentionally restricts public posting rights to prevent spam, misinformation, fraudulent job listings, and content clutter.

Open publishing platforms often face challenges such as:
• Fake recruiters
• Scam job postings
• Duplicate listings
• Unverified salary claims
• Promotional spam

By limiting posting privileges to verified admins only, Vacancy America ensures:

• Content authenticity
• Reduced fraudulent activity
• Professional-grade communication
• Higher trust for job seekers
• Controlled information flow

Users still play an important role by engaging in discussions, commenting, and reporting suspicious content, but the publishing gatekeeping structure ensures that only credible sources can create official posts.`
    },

    {
        id: '6',
        category: '👥 Roles on Vacancy America',
        question: 'Who controls what gets published?',
        answer: `The Super Admin oversees the publishing workflow and ensures that only authentic, relevant, and professionally appropriate content becomes publicly visible.

Every submitted post is evaluated based on:

• Accuracy and clarity
• Compliance with platform standards
• Professional tone
• Relevance to USA job market
• Absence of misleading or exaggerated claims

Depending on an admin’s trust level, posts may require mandatory review or may be auto-approved under supervision. This layered review system preserves platform integrity while maintaining publishing efficiency.`
    },

    // ── 🛡️ Becoming an Admin ──
    {
        id: '7',
        category: '🛡️ Becoming an Admin',
        question: 'How can I become an admin on Vacancy America?',
        answer: `To become an admin, applicants must register through the dedicated Admin Panel and provide accurate company or organizational information.

The registration process typically involves:

• Providing business or organizational details
• Verifying professional credentials
• Submitting contact information
• Agreeing to publishing guidelines

Once submitted, the application enters a review stage. The Super Admin evaluates the request to ensure legitimacy and alignment with platform standards.

Only after approval does the account gain admin-level publishing access. This verification process prevents unauthorized or fraudulent entities from posting.`
    },

    {
        id: '8',
        category: '🛡️ Becoming an Admin',
        question: 'Why does admin registration require approval?',
        answer: `Admin approval is essential to preserve the trust ecosystem of Vacancy America.

Without verification, open admin access could lead to:
• Fake company accounts
• Impersonation of legitimate brands
• Fraudulent hiring campaigns
• Misleading job advertisements

By requiring approval, Vacancy America ensures that:
• Only genuine organizations publish content
• Hiring information remains reliable
• Job seekers interact with legitimate entities
• Platform credibility remains intact

The approval step is a core part of the platform’s safety infrastructure.`
    },

    {
        id: '9',
        category: '🛡️ Becoming an Admin',
        question: 'What happens after I register as an admin?',
        answer: `After registering, your account enters a "Pending Review" status.

During this stage:
• Your submitted details are verified
• Credentials may be cross-checked
• Platform compliance is evaluated

If approved:
• You receive admin-level access
• You can begin submitting posts
• Your publishing authority is assigned based on initial trust level (Level 0 by default)

If rejected:
• You may receive clarification or feedback
• You can correct information and reapply

This structured onboarding ensures professional standards from day one.`
    },

    // ── 📢 Admin Posting & Approval ──
    {
        id: '10',
        category: '📢 Admin Posting & Approval',
        question: 'Why are admin posts not published instantly?',
        answer: `To maintain content quality and prevent misinformation, most new admin posts require Super Admin verification before going live.

This review process ensures:

• Accurate job descriptions
• Clear employment terms
• No misleading salary claims
• Compliance with platform guidelines
• Absence of spam or promotional abuse

As admins demonstrate reliability over time, their trust level increases, potentially reducing approval delays. The system balances speed with integrity.`
    },

    {
        id: '11',
        category: '📢 Admin Posting & Approval',
        question: 'What are admin levels?',
        answer: `Vacancy America uses a structured three-level admin trust system:

Level 0 – New Admin  
• All posts require manual approval  
• Closely monitored publishing  

Level 1 – Trusted Admin  
• Faster review process  
• Priority moderation queue  

Level 2 – Verified Publisher  
• Direct publishing capability  
• Subject to random audits  

Admin levels are determined based on:
• Posting history
• Compliance record
• Content quality
• Professional conduct

This tiered structure encourages responsible publishing behavior.`
    },

    {
        id: '12',
        category: '📢 Admin Posting & Approval',
        question: 'What happens if my post is rejected?',
        answer: `If a post is rejected, the Super Admin provides a clear reason explaining the issue.

Common reasons may include:
• Incomplete job information
• Policy violations
• Misleading details
• Formatting issues
• Irrelevant content

Admins can revise the post and resubmit it for approval. Rejections are part of the quality control system and are intended to improve content standards, not penalize publishers unfairly.`
    },

    // ── 🎧 Support & Safety ──
    {
        id: '13',
        category: '🎧 Support & Safety',
        question: 'How do I contact Vacancy America support?',
        answer: `Users and admins can contact support through the designated Support section on the platform or via the official contact email listed in the footer.

Support handles:
• Technical issues
• Account-related queries
• Content disputes
• Reporting concerns
• Admin onboarding questions

The support team operates with professional response standards and prioritizes user safety and platform reliability.`
    },

    {
        id: '14',
        category: '🎧 Support & Safety',
        question: 'How do I report a suspicious job post?',
        answer: `Each post includes a reporting mechanism. If you encounter suspicious or potentially misleading content:

• Click the “Report” option
• Provide brief details explaining your concern
• Submit the report

The moderation team reviews reports promptly. If the post violates policies, corrective action is taken, including removal or admin review. User reports play a critical role in maintaining safety.`
    },

    {
        id: '15',
        category: '🎧 Support & Safety',
        question: 'How does Vacancy America prevent fake jobs?',
        answer: `Vacancy America employs multiple safety layers to prevent fraudulent job listings:

• Verified admin onboarding
• Super Admin post approval workflow
• Multi-level admin trust system
• Community reporting tools
• Content audits and monitoring
• Strict policy enforcement

By combining structured moderation with verification controls, the platform significantly reduces the risk of fake job postings compared to open publishing systems. Trust and safety are foundational principles of Vacancy America.`
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
                className={`fixed z-50 transition-all duration-300 ease-out
                    top-3 bottom-[72px] left-2 right-2
                    md:top-3 md:bottom-[72px] md:left-auto md:right-3 md:w-[400px]
                    lg:top-0 lg:bottom-0 lg:left-auto lg:right-0 lg:w-[calc(100vw-875px)]
                    ${isOpen
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                    }`}
                style={{ minWidth: '0' }}
            >
                <div className="flex flex-col bg-[#0f1419] border border-[#2f3336] lg:border-l lg:border-y-0 lg:border-r-0 rounded-2xl lg:rounded-none shadow-2xl shadow-black/50 overflow-hidden h-full"
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
