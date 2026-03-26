import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../lib/admin-auth-context';
import {
    useAdminPosts,
    useAdminPostStats,
    useCreateAdminPost,
    useDeleteAdminPost
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
    Menu
} from 'lucide-react';
import { StatCard, LoadingState, EmptyState } from '../components/SharedUI';
import { PostPreviewSidebar } from '../components/PostPreviewSidebar';
import { AdminPost } from '../hooks/use-admin-posts';
import { useAdminAnalytics } from '../hooks/use-admin-posts';
import MessagesTab from '../components/MessagesTab';

export default function AdminDashboard() {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewPost, setPreviewPost] = useState<AdminPost | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'privileges' | 'messages'>('overview');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [unreadMsgCount, setUnreadMsgCount] = useState(0);
    const activeTabRef = useRef(activeTab);

    // Track previous level for animations
    const prevLevelRef = useRef(admin?.admin_level);

    // Keep activeTabRef in sync (avoids stale closures in callbacks)
    useEffect(() => {
        activeTabRef.current = activeTab;
        // Clear unread badge as soon as admin opens the messages tab
        if (activeTab === 'messages') {
            setUnreadMsgCount(0);
        }
    }, [activeTab]);

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

                {/* Bottom: User Card + Logout */}
                <div className="px-4 py-4 border-t border-slate-100">
                    <div className={`flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 mb-3 transition-colors ${isCollapsed ? 'bg-transparent' : ''}`}>
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                            <p className="text-sm font-semibold text-slate-700 truncate">{admin.display_name}</p>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Level {admin.admin_level || 0}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? 'Log out' : ''}
                        className={`group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-rose-500 transition-all duration-300 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="absolute inset-0 bg-rose-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
                        <div className="relative z-10 flex items-center gap-3 w-full">
                            <LogOut className="w-[18px] h-[18px] flex-shrink-0 group-hover:-translate-x-1 transition-transform duration-300" />
                            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                Log out
                            </span>
                        </div>
                    </button>
                </div>
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
                                    : activeTab === 'privileges' ? 'My Privileges'
                                    : 'Messages'}
                            </h2>
                            <p className="text-sm text-slate-400 mt-0.5">
                                {activeTab === 'overview' ? 'System stats & quick summary'
                                    : activeTab === 'posts' ? 'Review, approve, or delete community content'
                                    : activeTab === 'privileges' ? 'Manage your admin capabilities'
                                    : 'View and reply to user conversations'}
                            </p>
                        </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors relative">
                                <Bell className="w-[18px] h-[18px] text-slate-500" />
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <User className="w-[18px] h-[18px] text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="px-4 md:px-8 py-6 md:py-8">
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
        <div className="text-center py-20 text-slate-400">Failed to load analytics.</div>
    );

    const { statusBreakdown, totalLikes, totalComments, chartData, topPosts } = analytics;
    const maxCount = Math.max(...chartData.map(d => d.count), 1);

    const kpis = [
        {
            label: 'Total Posts',
            value: statusBreakdown.total,
            icon: <FileText className="w-6 h-6" />,
            color: 'indigo',
            bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
            text: 'text-white',
            shadow: 'shadow-indigo-200',
        },
        {
            label: 'Published',
            value: statusBreakdown.published,
            icon: <CheckCircle2 className="w-6 h-6" />,
            color: 'emerald',
            bg: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            text: 'text-white',
            shadow: 'shadow-emerald-200',
        },
        {
            label: 'Pending',
            value: statusBreakdown.pending,
            icon: <Clock className="w-6 h-6" />,
            color: 'amber',
            bg: 'bg-gradient-to-br from-amber-400 to-amber-500',
            text: 'text-white',
            shadow: 'shadow-amber-200',
        },
        {
            label: 'Likes',
            value: totalLikes,
            icon: <Heart className="w-6 h-6" />,
            color: 'rose',
            bg: 'bg-gradient-to-br from-rose-400 to-rose-500',
            text: 'text-white',
            shadow: 'shadow-rose-200',
        },
        {
            label: 'Comments',
            value: totalComments,
            icon: <MessageCircle className="w-6 h-6" />,
            color: 'violet',
            bg: 'bg-gradient-to-br from-violet-400 to-violet-500',
            text: 'text-white',
            shadow: 'shadow-violet-200',
        },
    ];

    const publishRate = statusBreakdown.total > 0
        ? Math.round((statusBreakdown.published / statusBreakdown.total) * 100)
        : 0;

    return (
        <div className="space-y-8 pb-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="relative drop-shadow-lg bg-white rounded-[2rem] p-6 flex flex-col gap-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 group border border-slate-100 cursor-default"
                    >
                        <div className="flex items-center justify-between z-10">
                            <div className={`w-14 h-14 drop-shadow-lg rounded-2xl ${kpi.bg} shadow-lg ${kpi.shadow} flex items-center justify-center ${kpi.text} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                                {kpi.icon}
                            </div>
                            <div className={`w-3 h-3 rounded-full ${kpi.bg} animate-pulse shadow-sm`} />
                        </div>
                        <div className="relative z-10 mt-2">
                            <p className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{kpi.value.toLocaleString()}</p>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-colors">{kpi.label}</p>
                        </div>
                        {/* Decorative background circle */}
                        <div className={`absolute -right-6 -bottom-6 w-32 h-32 ${kpi.bg} opacity-[0.03] group-hover:opacity-[0.08] rounded-full blur-2xl transition-opacity duration-500`} />
                    </div>
                ))}
            </div>

            {/* Chart + Top Posts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 7-Day Activity Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 group/chart relative overflow-hidden flex flex-col">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                </span>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Post Activity</h3>
                            </div>
                            <p className="text-sm font-medium text-slate-400 mt-1 ml-6">Live overview of your platform's pulse</p>
                        </div>
                        <span className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest border border-slate-100 shadow-sm">
                            Last 7 Days
                        </span>
                    </div>
                    
                    <div className="flex items-end gap-4 h-64 mt-auto relative z-10 w-full pt-10">
                        {chartData.map((day) => {
                            const heightPct = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                            const isToday = day.label === new Date().toLocaleDateString('en-US', { weekday: 'short' });
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-3 group/bar h-full relative">
                                    <div className="w-full flex items-end justify-center relative flex-1 pb-2">
                                        <div 
                                            className="w-full max-w-[48px] flex flex-col items-center justify-end relative"
                                            style={{ height: `${Math.max(heightPct, day.count > 0 ? 12 : 6)}%` }}
                                        >
                                            {/* Tooltip positioned just above the bar */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 text-sm font-black text-indigo-600 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 translate-y-2 group-hover/bar:translate-y-0 drop-shadow-sm bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 z-30 pointer-events-none">
                                                {day.count}
                                            </div>
                                            
                                            {/* The actual visual bar */}
                                            <div
                                                className={`w-full h-full rounded-2xl transition-all duration-700 ease-in-out group-hover/bar:scale-x-110 relative overflow-hidden ${
                                                    isToday
                                                        ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 shadow-[0_10px_20px_rgba(99,102,241,0.4)]'
                                                        : day.count > 0
                                                            ? 'bg-gradient-to-t from-slate-200 to-slate-100 group-hover/bar:from-indigo-300 group-hover/bar:to-indigo-200 shadow-sm'
                                                            : 'bg-slate-50'
                                                }`}
                                            >
                                                <div className="absolute inset-0 bg-white/30 rounded-2xl opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300" />
                                                {/* Reflection highlight */}
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 group-hover/bar:bg-white/60 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 z-10 ${ isToday ? 'text-indigo-600 scale-110 drop-shadow-sm' : 'text-slate-400 group-hover/bar:text-slate-800'}`}>
                                        {day.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel: Publish Rate + Top Posts */}
                <div className="flex flex-col gap-8">
                    {/* Publish Rate donut-style */}
                    <div className="drop-shadow-lg bg-white rounded-[2rem] p-7 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-between group/donut hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
                        
                        <div className="relative z-10 flex-1">
                            <p className="text-xl font-black text-slate-800 tracking-tight">Publish Rate</p>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">
                                <span className="text-indigo-600 font-black">{statusBreakdown.published}</span> / {statusBreakdown.total} Live
                            </p>
                        </div>
                        
                        <div className="relative w-28 h-28 flex-shrink-0 z-10">
                            <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90 group-hover/donut:scale-110 transition-transform duration-700 ease-out drop-shadow-xl">
                                <defs>
                                    <linearGradient id="publishGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#818cf8" />
                                        <stop offset="100%" stopColor="#4f46e5" />
                                    </linearGradient>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="2" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-slate-100" strokeWidth="4" />
                                <circle
                                    cx="18" cy="18" r="15.9"
                                    fill="none"
                                    stroke="url(#publishGlow)"
                                    strokeWidth="4"
                                    strokeDasharray={`${publishRate} ${100 - publishRate}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-[1500ms] ease-in-out"
                                    filter="url(#glow)"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-800 tracking-tighter">
                                {publishRate}%
                            </span>
                        </div>
                    </div>

                    {/* Top Posts */}
                    <div className="drop-shadow-lg bg-white rounded-[2rem] p-7 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 flex-1 flex flex-col hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] transition-shadow duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <span className="p-1.5 bg-rose-100 rounded-lg text-rose-500">
                                    <TrendingUp className="w-4 h-4" />
                                </span>
                                Trending Posts
                            </h3>
                        </div>
                        {topPosts.length === 0 ? (
                            <div className="flex-1 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center py-8">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <Heart className="w-5 h-5 text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">No trending data yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4 flex-1">
                                {topPosts.map((post, i) => (
                                    <div key={post._id} className="flex drop-shadow-lg items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group/post">
                                        <div className={`w-12 h-12 rounded-xl flex items-center drop-shadow-lg justify-center text-sm font-black flex-shrink-0 shadow-md ${
                                            i === 0 ? 'bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-orange-200' :
                                            i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-200' :
                                            'bg-gradient-to-br from-amber-100 to-orange-200 text-orange-700 shadow-orange-100'
                                        }`}>
                                            #{i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-800 font-bold line-clamp-1 group-hover/post:text-indigo-600 transition-colors">
                                                {post.content || '📸 Image Content'}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="flex items-center gap-1.5 text-xs font-black text-rose-500">
                                                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                                                    {post.likesCount}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="text-xs font-bold text-slate-400">
                                                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Footer Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                    { label: 'Rejected Posts', value: statusBreakdown.rejected, icon: <AlertCircle className="w-6 h-6" />, color: 'text-rose-500', bg: 'bg-rose-50', gradient: 'group-hover:bg-rose-500 group-hover:text-white', border: 'border-rose-100' },
                    { label: 'Total Engagement', value: totalLikes + totalComments, icon: <TrendingUp className="w-6 h-6" />, color: 'text-indigo-500', bg: 'bg-indigo-50', gradient: 'group-hover:bg-indigo-500 group-hover:text-white', border: 'border-indigo-100' },
                    { label: 'Avg Likes/Post', value: statusBreakdown.published > 0 ? (totalLikes / statusBreakdown.published).toFixed(1) : '0', icon: <Heart className="w-6 h-6" />, color: 'text-rose-500', bg: 'bg-rose-50', gradient: 'group-hover:bg-rose-500 group-hover:text-white', border: 'border-rose-100' },
                    { label: 'Comments / Post', value: statusBreakdown.published > 0 ? (totalComments / statusBreakdown.published).toFixed(1) : '0', icon: <MessageCircle className="w-6 h-6" />, color: 'text-violet-500', bg: 'bg-violet-50', gradient: 'group-hover:bg-violet-500 group-hover:text-white', border: 'border-violet-100' },
                ].map((stat) => (
                    <div key={stat.label} className="drop-shadow-lg bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 group flex items-center gap-5 cursor-default relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br from-white to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                        <div className={`w-14 h-14 drop-shadow-lg rounded-2xl ${stat.bg} ${stat.color} ${stat.gradient} flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-sm z-10`}>
                            {stat.icon}
                        </div>
                        <div className="z-10">
                            <p className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{stat.value}</p>
                            <p className="text-[11px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
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

// --- Posts View -------------------------------------------------------------
function PostsView({ page, setPage, showCreateModal, setShowCreateModal, setPreviewPost }: any) {
    const { data, isLoading: loading, error } = useAdminPosts(page);
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
    if (error) return <div className="text-center py-20 text-rose-500 font-bold">Failed to load posts</div>;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="drop-shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 gap-4">
                <div className="flex items-center gap-5">
                    <div className="drop-shadow-lg w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center shadow-inner">
                        <FileText className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Manage Posts</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{posts.length} posts found in current view</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white px-7 py-3.5 rounded-full hover:shadow-[0_10px_20px_rgba(99,102,241,0.4)] hover:-translate-y-1 transition-all duration-500 font-bold text-sm tracking-wide group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    Create New Post
                </button>
            </div>

            {/* Post Grid */}
            {posts.length === 0 ? (
                <div className="drop-shadow-lg bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 p-16">
                    <EmptyState icon={<FileText className="w-10 h-10" />} title="No posts yet" description="Create your first post to get started!" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {posts.map((post: any) => (
                        <div
                            key={post._id}
                            onClick={() => setPreviewPost(post)}
                            className="drop-shadow-lg group bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col relative"
                        >
                            {/* Image/Video Container */}
                            <div className="aspect-video relative overflow-hidden bg-slate-50">
                                {post.video_url ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                        <div className="w-16 h-16 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                            <Video className="w-8 h-8 text-slate-700" />
                                        </div>
                                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-xs font-black px-4 py-2 bg-black/60 rounded-xl text-white backdrop-blur-md flex items-center gap-2 uppercase tracking-widest">
                                                <Video className="w-3.5 h-3.5" /> Video Preview
                                            </span>
                                        </div>
                                    </div>
                                ) : post.image_url ? (
                                    <img
                                        src={post.image_url}
                                        alt={post.content || 'Post image'}
                                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                                        <FileText className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                )}
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Delete Button */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(post._id);
                                        }}
                                        disabled={deletingId === post._id}
                                        className="p-3 bg-white/90 backdrop-blur-md text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                {/* Status Badge */}
                                <div className="absolute bottom-4 left-4 z-10">
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 backdrop-blur-md border ${
                                        post.status === 'published' ? 'bg-emerald-500/90 text-white shadow-emerald-500/20 border-emerald-400' :
                                        post.status === 'rejected' ? 'bg-rose-500/90 text-white shadow-rose-500/20 border-rose-400' :
                                            'bg-amber-500/90 text-amber-50 shadow-amber-500/20 border-amber-400'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full bg-white ${post.status === 'published' ? 'animate-pulse' : ''}`} />
                                        {post.status}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Card Body */}
                            <div className="p-6 flex-1 flex flex-col relative z-10 bg-white">
                                <p className="text-sm text-slate-700 font-bold line-clamp-2 leading-relaxed group-hover:text-indigo-600 transition-colors">
                                    {post.content || post.caption || 'No text content provided.'}
                                </p>
                                
                                {/* Engagement quick stats */}
                                <div className="flex items-center gap-4 mt-4 mb-2">
                                    <span className="flex items-center gap-1.5 text-xs font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg">
                                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                                        {post.likesCount || 0}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-black text-violet-500 bg-violet-50 px-3 py-1.5 rounded-lg">
                                        <MessageCircle className="w-3.5 h-3.5 fill-violet-500" />
                                        {post.commentsCount || 0}
                                    </span>
                                </div>

                                {/* Footer Timeline */}
                                <div className="mt-auto pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    {post.scheduledFor && (
                                        <span className="flex items-center gap-1.5 text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
                                            <Clock className="w-3 h-3" />
                                            {new Date(post.scheduledFor).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                    <button
                        onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-4 rounded-2xl bg-white border border-slate-100 disabled:opacity-40 hover:shadow-[0_10px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <span className="flex items-center px-6 py-4 rounded-2xl bg-white border border-slate-100 text-sm text-slate-600 font-black tracking-widest uppercase shadow-sm">
                        Page <span className="text-indigo-600 mx-2">{page}</span> of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-4 rounded-2xl bg-white border border-slate-100 disabled:opacity-40 hover:shadow-[0_10px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 shadow-sm"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 lg:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-2 text-slate-800 tracking-tight">
                            Your Privileges
                        </h2>
                        <p className="text-slate-400 mb-10 text-sm font-bold uppercase tracking-widest">Current capabilities based on your admin level</p>

                        <div className="space-y-6">
                            {/* Level 2 Content */}
                            {currentLevel >= 2 && (
                                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 relative overflow-hidden group hover:border-purple-200 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_-10px_rgba(168,85,247,0.15)] hover:-translate-y-2 transition-all duration-500">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors duration-500 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                    
                                    <div className="flex items-start gap-5 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_10px_20px_rgba(168,85,247,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                            <span className="text-2xl font-black text-white">2</span>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Verified Partner</h3>
                                            <p className="text-purple-600 text-xs font-bold uppercase tracking-widest">Current Access Level</p>
                                        </div>
                                    </div>
                                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                        <div className="p-5 bg-purple-50/50 backdrop-blur-sm rounded-2xl border border-purple-100/50 group-hover:bg-purple-50 transition-colors duration-500 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-emerald-600 font-black text-sm uppercase tracking-wide">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Full Access
                                            </div>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                Verified Employer/Partner status. Your posts are published instantly without requiring approval.
                                            </p>
                                        </div>
                                        <div className="p-5 bg-purple-50/50 backdrop-blur-sm rounded-2xl border border-purple-100/50 group-hover:bg-purple-50 transition-colors duration-500 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-purple-600 font-black text-sm uppercase tracking-wide">
                                                <Shield className="w-5 h-5" />
                                                Verified Trust Badge
                                            </div>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                Exclusive verified indicator on your profile and posts to establish immediate credibility.
                                            </p>
                                        </div>
                                        <div className="p-5 bg-purple-50/50 backdrop-blur-sm rounded-2xl border border-purple-100/50 group-hover:bg-purple-50 transition-colors duration-500 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-indigo-600 font-black text-sm uppercase tracking-wide">
                                                <TrendingUp className="w-5 h-5" />
                                                Advanced Analytics
                                            </div>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                Full access to comprehensive performance metrics, audience insights, and engagement reporting.
                                            </p>
                                        </div>
                                        <div className="p-5 bg-purple-50/50 backdrop-blur-sm rounded-2xl border border-purple-100/50 group-hover:bg-purple-50 transition-colors duration-500 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-slate-700 font-black text-xs uppercase tracking-widest">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                Process Flow
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed flex-wrap">
                                                <span>Submit</span>
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Published Instantly</span>
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <span>Live</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Level 1 Content */}
                            {currentLevel === 1 && (
                                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 relative overflow-hidden group hover:border-blue-200 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-500">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                    
                                    <div className="flex items-start gap-5 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_10px_20px_rgba(59,130,246,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                            <span className="text-2xl font-black text-white">1</span>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Trusted Admin</h3>
                                            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest">Current Access Level</p>
                                        </div>
                                    </div>
                                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                        <div className="p-5 bg-blue-50/50 backdrop-blur-sm rounded-2xl border border-blue-100/50 group-hover:bg-blue-50 transition-colors duration-500 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-blue-600 font-black text-sm uppercase tracking-wide">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Priority Review
                                            </div>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                Trusted status. Your posts are reviewed with priority but still require approval from a Super Admin.
                                            </p>
                                        </div>
                                        <div className="p-5 bg-blue-50/50 backdrop-blur-sm rounded-2xl border border-blue-100/50 group-hover:bg-blue-50 transition-colors duration-500 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-cyan-600 font-black text-sm uppercase tracking-wide">
                                                <Bell className="w-5 h-5" />
                                                Enhanced Visibility
                                            </div>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                Posts bypass the standard review queue, significantly reducing time to publish.
                                            </p>
                                        </div>
                                        <div className="p-5 bg-blue-50/50 backdrop-blur-sm rounded-2xl border border-blue-100/50 sm:col-span-2 group-hover:bg-blue-50 transition-colors duration-500 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-slate-700 font-black text-xs uppercase tracking-widest">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                Process Flow
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed flex-wrap">
                                                <span>Submit</span>
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Priority Queue</span>
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <span>Superadmin Appr.</span>
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <span>Live</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Level 0 Content */}
                            {currentLevel === 0 && (
                                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 relative overflow-hidden group hover:border-slate-300 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl group-hover:bg-slate-500/10 transition-colors duration-500 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                    
                                    <div className="flex items-start gap-5 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-[0_10px_20px_rgba(100,116,139,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                            <span className="text-2xl font-black text-white">0</span>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Standard Admin</h3>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Current Access Level</p>
                                        </div>
                                    </div>
                                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                        <div className="p-5 bg-slate-50 backdrop-blur-sm rounded-2xl border border-slate-100 group-hover:bg-slate-100/70 transition-colors duration-500 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-amber-600 font-black text-sm uppercase tracking-wide">
                                                <AlertCircle className="w-5 h-5" />
                                                Approval Required
                                            </div>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                Standard status. All posts must be approved by a Super Admin before going live.
                                            </p>
                                        </div>
                                        <div className="p-5 bg-slate-50 backdrop-blur-sm rounded-2xl border border-slate-100 group-hover:bg-slate-100/70 transition-colors duration-500 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-slate-700 font-black text-sm uppercase tracking-wide">
                                                <MessageCircle className="w-5 h-5" />
                                                Comm. Interaction
                                            </div>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                Engage with your audience through DMs and monitor basic activity on posts.
                                            </p>
                                        </div>
                                        <div className="p-5 bg-slate-50 backdrop-blur-sm rounded-2xl border border-slate-100 sm:col-span-2 group-hover:bg-slate-100/70 transition-colors duration-500 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-slate-700 font-black text-xs uppercase tracking-widest">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                                Process Flow
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed flex-wrap">
                                                <span>Submit</span>
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Std. Queue</span>
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <span>Superadmin Appr.</span>
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <span>6hr Timer</span>
                                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                                <span>Live</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Level Hierarchy Sidebar */}
            <div className="space-y-8">
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 lg:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] relative overflow-hidden group">
                    <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tight relative z-10">Level Hierarchy</h3>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-50 transition-colors duration-700" />
                    
                    <div className="space-y-8 relative z-10">
                        {/* Connecting Line */}
                        <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-slate-100 rounded-full" />

                        {/* Level 2 */}
                        <div className={`relative flex gap-5 transition-all duration-500 ${currentLevel === 2 ? 'opacity-100 translate-x-2' : 'opacity-40 hover:opacity-70'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex flex-shrink-0 items-center justify-center z-10 transition-colors ${currentLevel === 2 ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-[0_10px_20px_rgba(168,85,247,0.3)]' : 'bg-slate-100 text-slate-400'
                                }`}>
                                <span className="font-black text-lg">2</span>
                            </div>
                            <div className="pt-0.5">
                                <h4 className={`font-black text-lg tracking-tight ${currentLevel === 2 ? 'text-slate-800' : 'text-slate-500'}`}>Verified Partner</h4>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2 leading-relaxed">Instant publishing<br />Full feature access</p>
                            </div>
                        </div>

                        {/* Level 1 */}
                        <div className={`relative flex gap-5 transition-all duration-500 ${currentLevel === 1 ? 'opacity-100 translate-x-2' : 'opacity-40 hover:opacity-70'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex flex-shrink-0 items-center justify-center z-10 transition-colors ${currentLevel === 1 ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)]' : 'bg-slate-100 text-slate-400'
                                }`}>
                                <span className="font-black text-lg">1</span>
                            </div>
                            <div className="pt-0.5">
                                <h4 className={`font-black text-lg tracking-tight ${currentLevel === 1 ? 'text-slate-800' : 'text-slate-500'}`}>Trusted Admin</h4>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2 leading-relaxed">Priority review<br />Proven track record</p>
                            </div>
                        </div>

                        {/* Level 0 */}
                        <div className={`relative flex gap-5 transition-all duration-500 ${currentLevel === 0 ? 'opacity-100 translate-x-2' : 'opacity-40 hover:opacity-70'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex flex-shrink-0 items-center justify-center z-10 transition-colors ${currentLevel === 0 ? 'bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-[0_10px_20px_rgba(100,116,139,0.3)]' : 'bg-slate-100 text-slate-400'
                                }`}>
                                <span className="font-black text-lg">0</span>
                            </div>
                            <div className="pt-0.5">
                                <h4 className={`font-black text-lg tracking-tight ${currentLevel === 0 ? 'text-slate-800' : 'text-slate-500'}`}>Standard Admin</h4>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2 leading-relaxed">Standard approval<br />Process</p>
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
                        className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all resize-none text-sm"
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
