import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '../lib/super-admin-auth-context';
import { useNotifications, useUnreadCount, useAllAdmins } from '../hooks/use-notifications';
import { usePendingPosts, useTrustedPosts, useRejectedPosts } from '../hooks/use-admin-posts';
import {
    Shield, Bell, LogOut, Users, RefreshCw,
    Settings, BarChart3, FileText, Activity,
    Menu, XIcon
} from 'lucide-react';
import { toast } from 'sonner';

// Components
import { StatCard } from '../components/SharedUI';
import { NotificationsTab } from '../components/NotificationsTab';
import { AdminManagementTab } from '../components/AdminManagementTab';
import { PostListTab } from '../components/PostListTab';
import { AnalyticsTab } from '../components/AnalyticsTab';
import { ReportsTab } from '../components/ReportsTab';
import { SettingsTab } from '../components/SettingsTab';

type TabId = 'notifications' | 'admins' | 'analytics' | 'reports' | 'settings' | 'pending_posts' | 'trusted_posts' | 'rejected_posts';

interface Tab {
    id: TabId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
}

export default function SuperAdminDashboard() {
    const { superAdmin, logout } = useSuperAdminAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>('notifications');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { data: notificationsData, refetch } = useNotifications(1);
    const { data: unreadCount = 0 } = useUnreadCount();
    const { data: allAdmins = [] } = useAllAdmins();

    // Post Hooks
    const { data: pendingPosts = [], isLoading: pendingPostsLoading } = usePendingPosts();
    const { data: trustedPosts = [], isLoading: trustedPostsLoading } = useTrustedPosts();
    const { data: rejectedPosts = [], isLoading: rejectedPostsLoading } = useRejectedPosts();

    const handleLogout = () => {
        logout();
        navigate('/superadmin/login');
    };

    const notifications = notificationsData?.notifications || [];
    const pendingNotifications = notifications.filter(n => n.status !== 'actioned' && n.type === 'admin_approval');

    const adminCounts = {
        all: allAdmins.length,
        pending: allAdmins.filter((a: any) => a.status === 'pending').length,
        approved: allAdmins.filter((a: any) => a.status === 'approved').length,
        rejected: allAdmins.filter((a: any) => a.status === 'rejected').length,
    };

    const tabs: Tab[] = [
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, badge: pendingNotifications.length || undefined },
        { id: 'pending_posts', label: 'Level 0 Requests', icon: <FileText className="w-5 h-5" />, badge: pendingPosts.length || undefined },
        { id: 'trusted_posts', label: 'Trusted Requests', icon: <Shield className="w-5 h-5" />, badge: trustedPosts.length || undefined },
        { id: 'admins', label: 'Admin Management', icon: <Users className="w-5 h-5" /> },
        { id: 'rejected_posts', label: 'Rejected Posts', icon: <XIcon className="w-5 h-5" /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'reports', label: 'Reports', icon: <Activity className="w-5 h-5" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-all duration-300 fixed h-full z-40`}>
                {/* Logo */}
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg shadow-amber-500/30 flex-shrink-0">
                            <Shield className="w-6 h-6 text-slate-900" />
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <h1 className="text-lg font-bold text-amber-100 truncate">Super Admin</h1>
                                <p className="text-xs text-slate-400 truncate">{superAdmin?.display_name}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            {tab.icon}
                            {sidebarOpen && (
                                <>
                                    <span className="flex-1 text-left font-medium">{tab.label}</span>
                                    {tab.badge && (
                                        <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                                            {tab.badge}
                                        </span>
                                    )}
                                </>
                            )}
                            {!sidebarOpen && tab.badge && (
                                <span className="absolute left-14 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Sidebar Toggle */}
                <div className="p-3 border-t border-slate-800">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        {sidebarOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        {sidebarOpen && <span>Collapse</span>}
                    </button>
                </div>

                {/* Logout */}
                <div className="p-3 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                {/* Top Bar */}
                <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <h2 className="text-xl font-bold text-white">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    refetch();
                                    toast.success('Dashboard refreshed');
                                }}
                                className="p-2 text-slate-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-slate-800"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <div className="relative">
                                <Bell className="w-5 h-5 text-slate-400" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <StatCard icon={<FileText className="w-5 h-5" />} label="Pending Level 0" value={pendingPosts.length} color="indigo" />
                        <StatCard icon={<Shield className="w-5 h-5" />} label="Pending Trusted" value={trustedPosts.length} color="blue" />
                        <StatCard icon={<Users className="w-5 h-5" />} label="Pending Admins" value={adminCounts.pending} color="amber" />
                        <StatCard icon={<Activity className="w-5 h-5" />} label="Approved Admins" value={adminCounts.approved} color="emerald" />
                        <StatCard icon={<Activity className="w-5 h-5" />} label="Total Admins" value={adminCounts.all} color="slate" />
                    </div>

                    {/* Tab Content */}
                    <>
                        {activeTab === 'notifications' && <NotificationsTab />}

                        {activeTab === 'admins' && <AdminManagementTab />}

                        {activeTab === 'analytics' && <AnalyticsTab />}

                        {activeTab === 'reports' && <ReportsTab />}

                        {activeTab === 'settings' && <SettingsTab />}

                        {activeTab === 'pending_posts' && (
                            <PostListTab posts={pendingPosts} isLoading={pendingPostsLoading} type="pending" />
                        )}

                        {activeTab === 'trusted_posts' && (
                            <PostListTab posts={trustedPosts} isLoading={trustedPostsLoading} type="trusted" />
                        )}

                        {activeTab === 'rejected_posts' && (
                            <PostListTab posts={rejectedPosts} isLoading={rejectedPostsLoading} type="rejected" />
                        )}
                    </>
                </div>
            </main>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
        </div>
    );
}
