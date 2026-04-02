import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../lib/admin-auth-context';
import {
    useAdminPosts,
    useAdminPostStats,
    useCreateAdminPost,
    useDeleteAdminPost,
    useInterestedApplications
} from '../hooks/use-admin-posts';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
    LogOut,
    Plus,
    Trash2,
    Image,
    Video,
    X,
    FileText,
    TrendingUp,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    LayoutDashboard,
    Clock,
    CheckCircle2,
    AlertCircle,
    Shield,
    Bell,
    User,
    Eye,
    Heart,
    MessageCircle,
    MessagesSquare,
    MessageSquare,
    Menu,
    Activity,
    Sparkles,
    AlertTriangle,
    Zap,
    Flame,
    BriefcaseBusiness
} from 'lucide-react';
import { StatCard, LoadingState, EmptyState } from '../components/SharedUI';
import { PostPreviewSidebar } from '../components/PostPreviewSidebar';
import { AdminPost } from '../hooks/use-admin-posts';
import { useAdminAnalytics } from '../hooks/use-admin-posts';
import MessagesTab from '../components/MessagesTab';
import InterestedApplicationsTab from '../components/InterestedApplicationsTab';

export default function AdminDashboard() {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewPost, setPreviewPost] = useState<AdminPost | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'interested' | 'privileges' | 'messages'>('overview');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [unreadMsgCount, setUnreadMsgCount] = useState(0);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const activeTabRef = useRef(activeTab);
    const { data: interestedApplicationsData } = useInterestedApplications();
    const interestedCount = interestedApplicationsData?.data?.length || 0;
    const [viewedInterestedCount, setViewedInterestedCount] = useState<number>(
        () => parseInt(localStorage.getItem('admin_viewed_interested_count') || '0', 10)
    );
    const newInterestedBadge = Math.max(0, interestedCount - viewedInterestedCount);

    // Track previous level for animations
    const prevLevelRef = useRef(admin?.admin_level);

    // Keep activeTabRef in sync (avoids stale closures in callbacks)
    useEffect(() => {
        activeTabRef.current = activeTab;
        if (activeTab === 'messages') {
            setUnreadMsgCount(0);
        }
        if (activeTab === 'interested' && interestedCount > 0) {
            localStorage.setItem('admin_viewed_interested_count', String(interestedCount));
            setViewedInterestedCount(interestedCount);
        }
    }, [activeTab, interestedCount]);

    // Called by MessagesTab when a new unread message arrives
    const handleNewMessage = useCallback(
        (convId: string, senderName: string, text: string) => {
            // Only increment + toast if the admin is NOT already on the messages tab
            if (activeTabRef.current !== 'messages') {
                setUnreadMsgCount(prev => prev + 1);
                toast(
                    <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => setActiveTab('messages')}
                    >
                        <p style={{ fontWeight: 700, marginBottom: 2 }}>💬 {senderName}</p>
                        <p style={{ fontSize: 13, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                            {text}
                        </p>
                    </div>,
                    {
                        duration: 5000,
                        style: { cursor: 'pointer' },
                    }
                );
            }
        },
        [] // no deps — uses ref for activeTab
    );

    useEffect(() => {
        if (!admin) return;

        if (prevLevelRef.current !== undefined && admin.admin_level !== prevLevelRef.current) {
            if (admin.admin_level > prevLevelRef.current) {
                const duration = 5 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                const randomInRange = (min: number, max: number) => {
                    return Math.random() * (max - min) + min;
                }

                const interval: any = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) return clearInterval(interval);
                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);

                toast.success(`Congratulations! You've been upgraded to Level ${admin.admin_level}!`);
            } else {
                toast.info(`Your admin level has changed to Level ${admin.admin_level}.`);
            }
            prevLevelRef.current = admin.admin_level;
        } else if (prevLevelRef.current === undefined) {
            prevLevelRef.current = admin.admin_level;
        }
    }, [admin?.admin_level]);

    if (!admin) {
        navigate('/admin/login');
        return null;
    }
    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/admin/login');
    };

    const sidebarItems = [
        { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
        { id: 'posts' as const, label: 'Manage Posts', icon: FileText },
        { id: 'interested' as const, label: 'Interested Users', icon: BriefcaseBusiness, badge: newInterestedBadge },
        { id: 'privileges' as const, label: 'Privileges', icon: Shield },
        { id: 'messages' as const, label: 'Messages', icon: MessagesSquare, badge: unreadMsgCount },
    ];

    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
    const mainMargin = isCollapsed ? 'md:ml-20' : 'md:ml-64';

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* --- Sidebar --- */}
            <aside className={`${sidebarWidth} bg-white border-r border-slate-200 flex flex-col min-h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                {/* Logo / Brand */}
                <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <div className="truncate">
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Admin</h1>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dashboard</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6">
                    <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3 transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                        {isCollapsed ? '•' : 'General'}
                    </p>
                    <div className="space-y-1">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            const badge = (item as any).badge || 0;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsMobileOpen(false);
                                    }}
                                    title={isCollapsed ? item.label : ''}
                                    className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden group ${isActive
                                        ? 'text-white shadow-[0_8px_30px_rgba(99,102,241,0.3)] scale-[1.02] bg-indigo-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500 opacity-100 z-0 bg-[length:200%_auto] animate-[pulse_3s_ease-in-out_infinite]" />
                                    )}
                                    {isActive && (
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 blur-xl rounded-full -mr-8 -mt-8 animate-pulse z-0" />
                                    )}
                                    <div className="relative z-10 flex items-center w-full gap-3">
                                        <div className="relative flex-shrink-0">
                                            <Icon className={`w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white drop-shadow-md' : 'group-hover:text-indigo-500'}`} />
                                            {badge > 0 && activeTab !== item.id && (
                                                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none shadow-lg shadow-rose-500/30 animate-pulse">
                                                    {badge > 99 ? '99+' : badge}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isActive ? 'drop-shadow-sm font-black tracking-wide' : 'font-semibold'} ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                            {item.label}
                                        </span>
                                        {!isCollapsed && badge > 0 && activeTab !== item.id && (
                                            <span className="ml-auto flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none shadow-lg shadow-rose-500/30 animate-bounce">
                                                {badge > 99 ? '99+' : badge}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`absolute inset-0 border-2 rounded-xl transition-all duration-300 pointer-events-none ${isActive ? 'border-white/20 scale-100 opacity-100' : 'border-transparent scale-95 opacity-0 group-hover:border-indigo-100 group-hover:scale-100 group-hover:opacity-100'}`} />
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Removed bottom sidebar User Card/Logout - moved to top header for mobile visibility */}
            </aside>

            {/* --- Main Content --- */}
            <div className={`flex-1 w-full ${mainMargin} transition-all duration-300 ease-in-out`}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                    <div className="px-5 md:px-8 py-4 md:py-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMobileOpen(true)}
                                className="md:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                                    {activeTab === 'overview' ? 'Overview'
                                        : activeTab === 'posts' ? 'Manage Posts'
                                            : activeTab === 'interested' ? 'Interested Users'
                                            : activeTab === 'privileges' ? 'My Privileges'
                                                : 'Messages'}
                                </h2>
                                <p className="text-sm text-slate-400 mt-0.5">
                                    {activeTab === 'overview' ? 'System stats & quick summary'
                                        : activeTab === 'posts' ? 'Review, approve, or delete community content'
                                            : activeTab === 'interested' ? 'People who showed interest in your published posts'
                                            : activeTab === 'privileges' ? 'Manage your admin capabilities'
                                                : 'View and reply to user conversations'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Notification Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setNotificationOpen(!notificationOpen)}
                                    onBlur={() => setTimeout(() => setNotificationOpen(false), 200)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${notificationOpen ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-500'}`}
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse" />
                                </button>

                                {notificationOpen && (
                                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-4 origin-top-right">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                                                <Bell className="w-4 h-4 text-rose-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 tracking-tight">System Alerts</h4>
                                                <p className="text-[11px] font-semibold text-slate-400">You're fully caught up!</p>
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-100 w-full mb-3" />
                                        <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                                            <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-500">Inbox Zero</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    onBlur={() => setTimeout(() => setProfileDropdownOpen(false), 200)}
                                    className={`flex items-center gap-2 pl-2 pr-3 h-10 rounded-xl border transition-all shadow-sm ${profileDropdownOpen ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-50' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                                >
                                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
                                        <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className={`text-sm font-bold truncate max-w-[100px] hidden sm:block ${profileDropdownOpen ? 'text-indigo-700' : 'text-slate-700'}`}>
                                        {admin.display_name}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform hidden sm:block ${profileDropdownOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
                                </button>

                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-4 origin-top-right">
                                        <div className="px-3 py-3 border-b border-slate-100 mb-2 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/3" />
                                            <div className="relative z-10">
                                                <p className="text-sm font-bold text-slate-800 tracking-tight truncate">{admin.display_name}</p>
                                                <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">@{admin.username}</p>
                                                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
                                                    <Shield className="w-3 h-3" /> Level {admin.admin_level || 0}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('privileges')}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                        >
                                            <Shield className="w-4 h-4" /> My Privileges
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors mt-1"
                                        >
                                            <LogOut className="w-4 h-4" /> Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className={activeTab === 'interested' ? 'h-[calc(100vh-73px)] overflow-hidden' : 'px-4 md:px-8 py-6 md:py-8'}>
                    {activeTab === 'overview' && <OverviewSection />}

                    {activeTab === 'posts' && (
                        <PostsView
                            page={page}
                            setPage={setPage}
                            showCreateModal={showCreateModal}
                            setShowCreateModal={setShowCreateModal}
                            setPreviewPost={setPreviewPost}
                        />
                    )}

                    {activeTab === 'interested' && <InterestedApplicationsTab />}

                    {activeTab === 'privileges' && <PrivilegesView />}

                    {activeTab === 'messages' && <MessagesTab onNewMessage={handleNewMessage} />}
                </main>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <CreatePostModal onClose={() => setShowCreateModal(false)} />
            )}

            {/* Post Preview Sidebar */}
            {previewPost && (
                <PostPreviewSidebar post={previewPost} onClose={() => setPreviewPost(null)} />
            )}
        </div>
    );
}

// --- Overview Section (Analytics) ------------------------------------------
function OverviewSection() {
    const { data, isLoading, error } = useAdminAnalytics();
    const analytics = data?.data;

    if (isLoading) return <LoadingState />;
    if (error || !analytics) return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-slate-100 mx-4">
            <AlertCircle className="w-10 h-10 text-rose-400 mb-4" />
            <p className="text-slate-500 font-bold tracking-wide">Failed to sync platform metrics.</p>
        </div>
    );

    const { statusBreakdown, totalLikes, totalComments, chartData, topPosts } = analytics;

    // Dynamic Calculations
    const totalEngagement = totalLikes + (totalComments * 2);
    const maxCount = Math.max(...chartData.map((d: any) => d.count), 1);
    const publishRate = statusBreakdown.total > 0
        ? Math.round((statusBreakdown.published / statusBreakdown.total) * 100) : 0;
    const rejectionRate = statusBreakdown.total > 0
        ? Math.round((statusBreakdown.rejected / statusBreakdown.total) * 100) : 0;

    return (
        <div className="space-y-6 md:space-y-8 pb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Dynamic Insight Banner */}
            <div className={`relative overflow-hidden rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border shadow-lg transition-all duration-500 hover:shadow-xl ${statusBreakdown.pending > 0 ? 'bg-gradient-to-r from-amber-500 to-orange-400 border-amber-400 shadow-amber-500/20 text-white' : 'bg-gradient-to-r from-indigo-600 to-blue-500 border-indigo-400 shadow-indigo-500/20 text-white'}`}>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-4 sm:gap-6 z-10 w-full">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-inner">
                        {statusBreakdown.pending > 0 ? (
                            <Clock className="w-8 h-8 text-white animate-pulse" />
                        ) : (
                            <Activity className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm line-clamp-1">
                            {statusBreakdown.pending > 0
                                ? `${statusBreakdown.pending} Posts Pending Verification`
                                : "Platform Pulse: Healthy"}
                        </h2>
                        <p className="text-white/80 font-bold text-xs sm:text-sm mt-1 uppercase tracking-widest line-clamp-1">
                            {statusBreakdown.pending > 0
                                ? "Waiting on Super Admin approval to go live."
                                : `Engagement score is ${totalEngagement.toLocaleString()} today. Keeping up the momentum!`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Next Gen KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: "Active Postings", val: statusBreakdown.published, sub: `${publishRate}% Publish Rate`, icon: <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" />, col: "emerald" },
                    { label: "Awaiting Verification", val: statusBreakdown.pending, sub: "Pending Super Admin", icon: <Clock className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" />, col: "amber" },
                    { label: "Total Reach", val: totalEngagement, sub: `High interaction`, icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" />, col: "indigo" },
                    { label: "Rejected Postings", val: statusBreakdown.rejected, sub: `${rejectionRate}% Rejection Rate`, icon: <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" />, col: "rose" },
                ].map((kpi, idx) => {
                    const colors = {
                        emerald: "text-emerald-500 bg-emerald-50 border-emerald-100 shadow-emerald-500/10",
                        amber: "text-amber-500 bg-amber-50 border-amber-100 shadow-amber-500/10",
                        indigo: "text-indigo-500 bg-indigo-50 border-indigo-100 shadow-indigo-500/10",
                        rose: "text-rose-500 bg-rose-50 border-rose-100 shadow-rose-500/10"
                    }[kpi.col as 'emerald' | 'amber' | 'indigo' | 'rose'];

                    const iconGlow = {
                        emerald: "from-emerald-400 to-emerald-500 shadow-emerald-200",
                        amber: "from-amber-400 to-amber-500 shadow-amber-200",
                        indigo: "from-indigo-400 to-indigo-500 shadow-indigo-200",
                        rose: "from-rose-400 to-rose-500 shadow-rose-200"
                    }[kpi.col as 'emerald' | 'amber' | 'indigo' | 'rose'];

                    return (
                        <div key={idx} className={`relative p-5 sm:p-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col justify-between`}>
                            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${iconGlow} transition-opacity duration-500 group-hover:opacity-40`} />

                            <div className="flex justify-between items-start mb-4 z-10 w-full">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-gradient-to-br ${iconGlow} text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
                                    {kpi.icon}
                                </div>
                                <span className="flex h-3 w-3 relative shrink-0">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors?.split(' ')[1]}`}></span>
                                    <span className={`relative inline-flex rounded-full h-3 w-3 ${colors?.split(' ')[1]}`}></span>
                                </span>
                            </div>

                            <div className="z-10 mt-auto">
                                <p className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter leading-none mb-1 group-hover:scale-105 origin-left transition-transform duration-300">{kpi.val.toLocaleString()}</p>
                                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{kpi.label}</p>
                                <p className={`text-[10px] sm:text-[11px] font-black mt-2 uppercase tracking-wide ${colors?.split(' ')[0]}`}>{kpi.sub}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Dashboard Core: Charts & Trending */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                {/* Enhanced Activity Chart */}
                <div className="col-span-1 lg:col-span-8 bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden group/chart h-[350px] sm:h-[400px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 z-10">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                                Growth Velocity
                            </h3>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest sm:ml-8">7-Day Trajectory</p>
                        </div>
                        <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest self-start sm:self-auto">
                            Auto-updating
                        </div>
                    </div>

                    <div className="flex-1 flex items-end gap-2 sm:gap-4 relative z-10 w-full pt-6 sm:pt-10">
                        <div className="absolute inset-x-0 inset-y-6 sm:inset-y-8 flex flex-col justify-between pointer-events-none opacity-20">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-full h-px border-b border-dashed border-slate-300" />
                            ))}
                        </div>

                        {chartData.map((day: any) => {
                            const heightPct = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                            const h = Math.max(heightPct, 8);
                            const isToday = day.label === new Date().toLocaleDateString('en-US', { weekday: 'short' });

                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-2 sm:gap-3 group/bar h-full relative hover:z-20">
                                    <div className="w-full max-w-[40px] sm:max-w-[56px] flex flex-col items-center justify-end relative h-full pb-1 sm:pb-2">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-800 text-white text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl opacity-0 group-hover/bar:opacity-100 group-hover/bar:translate-y-0 translate-y-2 transition-all duration-300 pointer-events-none shadow-xl border border-slate-700 whitespace-nowrap z-50">
                                            {day.count} Posts
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] sm:border-[5px] border-transparent border-t-slate-800" />
                                        </div>

                                        <div
                                            className={`w-full rounded-lg sm:rounded-2xl transition-all duration-700 ease-out group-hover/bar:scale-x-110 relative overflow-hidden ${isToday ? 'bg-gradient-to-t from-indigo-500 to-indigo-400 shadow-[0_10px_30px_rgba(99,102,241,0.4)]' : day.count > 0 ? 'bg-gradient-to-t from-slate-200 to-slate-100 group-hover/bar:from-indigo-300 group-hover/bar:to-indigo-200' : 'bg-slate-50'}`}
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    </div>
                                    <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors ${isToday ? 'text-indigo-600' : 'text-slate-400 group-hover/bar:text-slate-800'}`}>
                                        {day.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Mini Donut + Top Posts */}
                <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 md:gap-8">

                    {/* Compact Dynamic Network Ring */}
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-row items-center justify-between group/donut relative overflow-hidden shrink-0 hover:shadow-lg transition-all duration-300">
                        <div className="relative z-10 flex-1">
                            <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 mb-1">
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500/20" /> Active Rate
                            </h3>
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                <span className="text-amber-500 font-black">{statusBreakdown.published}</span> Live of {statusBreakdown.total}
                            </p>
                        </div>
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 z-10">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 group-hover/donut:scale-110 transition-transform duration-700 ease-out drop-shadow-md">
                                <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-slate-100" strokeWidth="4" />
                                <circle
                                    cx="18" cy="18" r="15.9"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeDasharray={`${publishRate} ${100 - publishRate}`}
                                    strokeLinecap="round"
                                    className="text-amber-500 transition-all duration-[1500ms] ease-in-out drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-black text-slate-800 tracking-tighter">
                                {publishRate}%
                            </span>
                        </div>
                    </div>

                    {/* Trending Scroll */}
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col flex-1 relative overflow-hidden group hover:shadow-lg transition-all duration-300 min-h-[250px] lg:min-h-0">
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-rose-50/50 to-transparent pointer-events-none" />

                        <div className="flex items-center justify-between mb-4 z-10">
                            <h3 className="text-[10px] sm:text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                                Hot Content
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 relative z-10 max-h-[200px] sm:max-h-[220px] lg:max-h-full" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>
                            {topPosts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6">
                                    <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 mb-2 opacity-50" />
                                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">No data available</p>
                                </div>
                            ) : topPosts.map((post: any, i: number) => (
                                <div key={post._id} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all duration-300 flex items-start gap-3 sm:gap-4">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-inner ${i === 0 ? 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-rose-500/30' :
                                            i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                                                'bg-white text-slate-500 border border-slate-200'
                                        }`}>
                                        #{i + 1}
                                    </div>
                                    <div className="min-w-0 flex-1 py-0.5">
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed">
                                            {post.content || 'Media Content'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5 sm:mt-2">
                                            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-rose-500 uppercase tracking-wider">
                                                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {post.likesCount}
                                            </span>
                                            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-wider">
                                                <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {post.commentsCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Stats Section (legacy, kept for reference) ----------------------------
function StatsSection() {
    const { data: statsData, isLoading: statsLoading, error: statsError } = useAdminPostStats();
    const stats = statsData?.data;

    if (statsLoading) return <LoadingState />;
    if (statsError) return <div className="text-red-500 p-4">Failed to load stats</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <StatCard
                label="Total Posts"
                value={stats?.totalPosts || 0}
                icon={<FileText className="w-5 h-5" />}
                color="indigo"
            />
            <StatCard
                label="Today"
                value={stats?.todayPosts || 0}
                icon={<Calendar className="w-5 h-5" />}
                color="amber"
            />
            <StatCard
                label="This Week"
                value={stats?.weekPosts || 0}
                icon={<TrendingUp className="w-5 h-5" />}
                color="emerald"
            />
        </div>
    );
}

// --- Animated Dropdown Component --------------------------------------------
function AnimatedDropdown({ value, onChange, options, align = "left", className = "" }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt: any) => opt.value === value) || options[0];

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full sm:w-auto px-5 py-3.5 rounded-full bg-white border border-slate-100 text-sm font-bold shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer drop-shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between gap-3 min-w-[170px] ${isOpen ? 'ring-2 ring-indigo-500/20 shadow-md text-indigo-600' : 'text-slate-600'}`}
            >
                {selectedOption.label}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
            </button>

            <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 min-w-full w-52 bg-white rounded-2xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.15)] border border-slate-100/80 overflow-hidden z-[60] transition-all duration-300 origin-top flex flex-col ${isOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}>
                {options.map((option: any) => (
                    <button
                        key={option.value}
                        onClick={() => {
                            onChange(option.value);
                            setIsOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3.5 text-sm font-bold transition-all duration-200 flex items-center gap-2 ${value === option.value
                            ? 'bg-indigo-50/80 text-indigo-600 pl-6 border-l-[3px] border-indigo-500'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-[3px] border-transparent'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// --- Posts View -------------------------------------------------------------
function AdminFilterDropdown({ value, onChange, options, align = "left" }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt: any) => opt.value === value) || options[0];

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm font-semibold transition-all duration-200 flex items-center justify-between gap-2 shadow-sm ${isOpen ? 'border-indigo-500 ring-1 ring-indigo-500 text-indigo-600' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
            >
                <span className="truncate">{selectedOption.label}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
            </button>

            {isOpen && (
                <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-full sm:min-w-[180px] bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-[60] py-1 animate-in fade-in slide-in-from-top-2 duration-200`}>
                    {options.map((option: any) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between ${value === option.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            {option.label}
                            {value === option.value && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function PostsView({ page, setPage, showCreateModal, setShowCreateModal, setPreviewPost }: any) {
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const { data, isLoading: loading, error } = useAdminPosts({ page, status: filterStatus, sort: sortBy });
    const deletePostCmd = useDeleteAdminPost();

    const posts = data?.data || [];
    const totalPages = data?.pagination?.totalPages || 1;

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (postId: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setDeletingId(postId);
            try {
                await deletePostCmd.mutateAsync(postId);
                toast.success('Post deleted successfully');
            } catch (err) {
                toast.error('Failed to delete post');
            } finally {
                setDeletingId(null);
            }
        }
    };

    if (loading) return <LoadingState />;
    if (error) return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-slate-100 mx-4">
            <AlertCircle className="w-10 h-10 text-slate-400 mb-4" />
            <p className="text-slate-500 font-medium">Failed to sync posts.</p>
        </div>
    );

    return (
        <div className="space-y-6 md:space-y-8 pb-10 w-full animate-in fade-in duration-500 px-1 sm:px-0">
            {/* Header section */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                            Community Posts
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold">{posts.length}</span>
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Review, approve, or delete user content.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-6 py-2.5 rounded-xl transition-colors font-semibold text-sm shadow-sm"
                    >
                        <Plus className="w-4 h-4 shrink-0" />
                        Create New Post
                    </button>
                </div>

                <div className="h-px w-full bg-slate-100 -my-2 sm:my-0"></div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-3 w-full sm:justify-end">
                    <div className="w-full sm:w-44">
                        <AdminFilterDropdown
                            value={filterStatus}
                            onChange={(val: string) => { setFilterStatus(val); setPage(1); }}
                            align="left"
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'published', label: 'Published' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'rejected', label: 'Rejected' }
                            ]}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <AdminFilterDropdown
                            value={sortBy}
                            onChange={(val: string) => { setSortBy(val); setPage(1); }}
                            align="right"
                            options={[
                                { value: 'newest', label: 'Newest First' },
                                { value: 'oldest', label: 'Oldest First' },
                                { value: 'most_likes', label: 'Most Likes' },
                                { value: 'least_likes', label: 'Least Likes' },
                                { value: 'most_comments', label: 'Most Comments' }
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            {posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mb-4">
                        <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No posts found</h3>
                    <p className="text-slate-500 text-sm mt-1">Adjust filters or create a new post.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {posts.map((post: any) => {
                        return (
                            <div
                                key={post._id}
                                onClick={() => setPreviewPost(post)}
                                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-200 cursor-pointer flex flex-col h-full shadow-sm hover:shadow-md transition-all duration-300 relative"
                            >
                                {/* Media block */}
                                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                                    {post.video_url ? (
                                        <div className="w-full h-full relative flex items-center justify-center bg-slate-900 group-hover:scale-105 transition-transform duration-700">
                                            {post.thumbnail_url && (
                                                <img src={post.thumbnail_url} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
                                            )}
                                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg z-10 border border-white/30">
                                                <Video className="w-6 h-6 text-white ml-0.5" />
                                            </div>
                                        </div>
                                    ) : post.image_url ? (
                                        <div className="w-full h-full bg-slate-900 group-hover:scale-105 transition-transform duration-700 relative flex items-center justify-center">
                                            {/* Blurry background for padded images */}
                                            <img src={post.image_url} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-md scale-110" alt="" />
                                            <img
                                                src={post.image_url}
                                                alt={post.content || 'Post image'}
                                                className="w-full h-full object-contain relative z-10 drop-shadow-xl"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                                            <FileText className="w-12 h-12 text-slate-300" />
                                        </div>
                                    )}

                                    {/* Subdued Status Badge */}
                                    <div className="absolute top-3 left-3 z-20">
                                        <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md shadow-sm border ${post.status === 'published' ? 'bg-emerald-500/95 text-white border-emerald-400' :
                                                post.status === 'pending' ? 'bg-amber-500/95 text-white border-amber-400' :
                                                    'bg-rose-500/95 text-white border-rose-400'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </div>

                                    {/* Delete Action - Top Right */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(post._id);
                                        }}
                                        disabled={deletingId === post._id}
                                        className="absolute top-3 right-3 p-2 bg-white/95 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm opacity-100 sm:opacity-0 group-hover:opacity-100 z-20 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4 shrink-0" />
                                    </button>
                                </div>

                                {/* Text content block */}
                                <div className="p-5 flex-1 flex flex-col bg-white">
                                    <p className="text-sm text-slate-700 font-semibold line-clamp-3 leading-relaxed mb-4 group-hover:text-indigo-600 transition-colors">
                                        {post.content || post.caption || 'No specific text content.'}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                                                <Heart className="w-3.5 h-3.5 shrink-0" />
                                                <span className="text-xs font-bold">{post.likesCount || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                                                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span className="text-xs font-bold">{post.commentsCount || 0}</span>
                                            </div>
                                        </div>

                                        <div className="text-[11px] font-bold tracking-wide text-slate-400">
                                            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8 py-4">
                    <button
                        onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm active:scale-95 bg-white"
                    >
                        <ChevronLeft className="w-5 h-5 shrink-0" />
                    </button>
                    <span className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 font-bold shadow-sm">
                        Page <span className="text-indigo-600 mx-1">{page}</span> of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm active:scale-95 bg-white"
                    >
                        <ChevronRight className="w-5 h-5 shrink-0" />
                    </button>
                </div>
            )}
        </div>
    );
}

// --- Privileges View --------------------------------------------------------
function PrivilegesView() {
    const { admin } = useAdminAuth();

    if (!admin) return null;

    const currentLevel = admin.admin_level || 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-10 px-1 sm:px-0 animate-in fade-in duration-500">
            {/* Main Privileges Content */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                                Your Capabilities
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${currentLevel >= 2 ? 'bg-indigo-50 text-indigo-600' :
                                        currentLevel === 1 ? 'bg-indigo-50 text-indigo-600' :
                                            'bg-indigo-50 text-indigo-600'
                                    }`}>Level {currentLevel} Focus</span>
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Review the features available to your current administrative tier.</p>
                        </div>

                        <div className="h-px w-full bg-slate-100"></div>

                        {/* Level 2 Content */}
                        {currentLevel >= 2 && (
                            <div className="flex flex-col gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="text-lg font-bold text-slate-800">Verified Partner</h3>
                                        <p className="text-sm text-slate-500 text-medium mt-0.5 leading-relaxed">As a verified entity, you maintain maximum content autonomy and platform priority.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-sm">
                                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                                            Instant Access
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Your posts bypass the standard queue and are published instantly. No approval wait times.
                                        </p>
                                    </div>
                                    <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-sm">
                                            <Shield className="w-4 h-4 shrink-0" />
                                            Verified Trust Badge
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Exclusive verified status attached to all your outbound content and profile pages.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Level 1 Content */}
                        {currentLevel === 1 && (
                            <div className="flex flex-col gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="text-lg font-bold text-slate-800">Trusted Admin</h3>
                                        <p className="text-sm text-slate-500 text-medium mt-0.5 leading-relaxed">Trusted accounts benefit from prioritized content review and expanded moderation scopes.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-sm">
                                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                                            Priority Review
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Your submissions hit the top of the queue, significantly reducing pending wait times.
                                        </p>
                                    </div>
                                    <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-sm">
                                            <TrendingUp className="w-4 h-4 shrink-0" />
                                            Enhanced Visibility
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Ability to highlight important discussions or lock problematic threads within the community.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Level 0 Content */}
                        {currentLevel === 0 && (
                            <div className="flex flex-col gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="text-lg font-bold text-slate-800">Standard Admin</h3>
                                        <p className="text-sm text-slate-500 text-medium mt-0.5 leading-relaxed">Entry level administrative capabilities focusing on basic content submission and community interactions.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                                        <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            Standard Review Queue
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            All content contributions undergo standard moderation before being published to the main feed.
                                        </p>
                                    </div>
                                    <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                                        <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
                                            <MessageCircle className="w-4 h-4 shrink-0" />
                                            Base Interactions
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            Full ability to comment, like, and flag content, providing front-line community insight.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Process Flow visualization */}
                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">Content Lifespan</h4>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest leading-relaxed">
                                <span>Draft</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                <span className={`${currentLevel >= 2 ? 'text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md' : ''}`}>Submit</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                <span className={`${currentLevel === 1 ? 'text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md' : currentLevel === 0 ? 'text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm' : ''}`}>
                                    {currentLevel >= 2 ? 'Instance Sync' : currentLevel === 1 ? 'Priority Review' : 'Hold / Review'}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                <span className="text-emerald-600 font-bold">Live</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Level Hierarchy Sidebar */}
            <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm h-full max-h-min flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-8">Access Hierarchy</h3>

                    <div className="space-y-8 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-slate-100" />

                        {/* Level 2 */}
                        <div className={`relative flex gap-4 transition-opacity ${currentLevel === 2 ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}>
                            <div className={`w-10 h-10 rounded-xl flex shrink-0 items-center justify-center z-10 transition-colors ${currentLevel === 2 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>
                                <span className="font-bold text-base">2</span>
                            </div>
                            <div className="pt-0.5">
                                <h4 className={`font-bold text-sm tracking-tight ${currentLevel === 2 ? 'text-indigo-600' : 'text-slate-600'}`}>Verified Partner</h4>
                                <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">Instant publishing<br />Full feature autonomy</p>
                            </div>
                        </div>

                        {/* Level 1 */}
                        <div className={`relative flex gap-4 transition-opacity ${currentLevel === 1 ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}>
                            <div className={`w-10 h-10 rounded-xl flex shrink-0 items-center justify-center z-10 transition-colors ${currentLevel === 1 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>
                                <span className="font-bold text-base">1</span>
                            </div>
                            <div className="pt-0.5">
                                <h4 className={`font-bold text-sm tracking-tight ${currentLevel === 1 ? 'text-indigo-600' : 'text-slate-600'}`}>Trusted Admin</h4>
                                <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">Priority queue review<br />Proven track record</p>
                            </div>
                        </div>

                        {/* Level 0 */}
                        <div className={`relative flex gap-4 transition-opacity ${currentLevel === 0 ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}>
                            <div className={`w-10 h-10 rounded-xl flex shrink-0 items-center justify-center z-10 transition-colors ${currentLevel === 0 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>
                                <span className="font-bold text-base">0</span>
                            </div>
                            <div className="pt-0.5">
                                <h4 className={`font-bold text-sm tracking-tight ${currentLevel === 0 ? 'text-indigo-600' : 'text-slate-600'}`}>Standard Admin</h4>
                                <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">Base approval process<br />Community interactions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Create Post Modal ------------------------------------------------------
function CreatePostModal({ onClose }: { onClose: () => void }) {
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const createPost = useCreateAdminPost();

    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const isVideo = file.type.startsWith('video/');
            const limit = isVideo ? 25 * 1024 * 1024 : 10 * 1024 * 1024;

            if (file.size > limit) {
                toast.error(`${isVideo ? 'Video' : 'Image'} must be less than ${isVideo ? '25MB' : '10MB'}`);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            setMediaFile(file);
            setMediaType(isVideo ? 'video' : 'image');

            const reader = new FileReader();
            reader.onloadend = () => setMediaPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!content.trim() && !mediaFile) {
            toast.error('Please add content or media');
            return;
        }

        try {
            await createPost.mutateAsync({ content: content.trim(), mediaFile: mediaFile || undefined });
            toast.success('Post created successfully!');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create post');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Create New Post</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <textarea
                        name="postContent"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all resize-y text-sm"
                        maxLength={500}
                    />

                    {mediaPreview && (
                        <div className="relative mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                            {mediaType === 'video' ? (
                                <video src={mediaPreview} controls className="w-full max-h-64 object-contain" />
                            ) : (
                                <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-contain" />
                            )}
                            <button
                                onClick={removeMedia}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                        <input
                            ref={fileInputRef}
                            name="mediaFile"
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            onChange={handleMediaSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Add image"
                        >
                            <Image className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Add video"
                        >
                            <Video className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-medium text-slate-400 ml-auto">{content.length}/500</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={(!content.trim() && !mediaFile) || createPost.isPending}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200"
                    >
                        {createPost.isPending ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
}
