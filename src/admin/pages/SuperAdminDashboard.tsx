import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '../lib/super-admin-auth-context';
import { useNotifications, useUnreadCount, useTakeAction, useMarkAllAsRead, useAllAdmins } from '../hooks/use-notifications';
import {
    Shield, Bell, LogOut, Check, X, Loader2,
    UserCheck, UserX, Clock, Users, RefreshCw,
    Settings, BarChart3, FileText, Activity,
    ChevronRight, Menu, XIcon
} from 'lucide-react';
import { toast } from 'sonner';

type TabId = 'notifications' | 'admins' | 'analytics' | 'reports' | 'settings';
type AdminFilter = 'all' | 'pending' | 'approved' | 'rejected';
type NotifFilter = 'pending' | 'history';

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
    const [adminFilter, setAdminFilter] = useState<AdminFilter>('all');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifFilter, setNotifFilter] = useState<NotifFilter>('pending');
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    const { data: notificationsData, isLoading, refetch } = useNotifications(1);
    const { data: unreadCount = 0 } = useUnreadCount();
    const { data: allAdmins = [], isLoading: adminsLoading } = useAllAdmins();
    const takeAction = useTakeAction();
    const markAllAsRead = useMarkAllAsRead();

    const handleLogout = () => {
        logout();
        navigate('/superadmin/login');
    };

    const handleApprove = async (notificationId: string) => {
        try {
            await takeAction.mutateAsync({ notificationId, action: 'approved' });
            toast.success('Admin approved successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve');
        }
    };

    const handleReject = async (notificationId: string) => {
        if (rejectingId === notificationId) {
            try {
                await takeAction.mutateAsync({
                    notificationId,
                    action: 'rejected',
                    reason: rejectReason
                });
                toast.success('Admin rejected');
                setRejectingId(null);
                setRejectReason('');
            } catch (error: any) {
                toast.error(error.message || 'Failed to reject');
            }
        } else {
            setRejectingId(notificationId);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead.mutateAsync();
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const notifications = notificationsData?.notifications || [];
    const pendingNotifications = notifications.filter(n => n.status !== 'actioned' && n.type === 'admin_approval');
    const actionedNotifications = notifications.filter(n => n.status === 'actioned');
    const displayedNotifications = notifFilter === 'pending' ? pendingNotifications : actionedNotifications;

    // Filter admins based on selected filter
    const filteredAdmins = allAdmins.filter((admin: any) => {
        if (adminFilter === 'all') return true;
        return admin.status === adminFilter;
    });

    const adminCounts = {
        all: allAdmins.length,
        pending: allAdmins.filter((a: any) => a.status === 'pending').length,
        approved: allAdmins.filter((a: any) => a.status === 'approved').length,
        rejected: allAdmins.filter((a: any) => a.status === 'rejected').length,
    };

    const tabs: Tab[] = [
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, badge: pendingNotifications.length || undefined },
        { id: 'admins', label: 'Admin Management', icon: <Users className="w-5 h-5" /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
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
                                onClick={() => refetch()}
                                className="p-2 text-slate-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-slate-800"
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <StatCard icon={<Bell className="w-5 h-5" />} label="Pending Approvals" value={adminCounts.pending} color="amber" />
                        <StatCard icon={<UserCheck className="w-5 h-5" />} label="Approved Admins" value={adminCounts.approved} color="emerald" />
                        <StatCard icon={<UserX className="w-5 h-5" />} label="Rejected" value={adminCounts.rejected} color="red" />
                        <StatCard icon={<Activity className="w-5 h-5" />} label="Total Admins" value={adminCounts.all} color="blue" />
                    </div>

                    {/* Tab Content */}
                    <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 min-h-[500px]">
                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="animate-fadeIn">
                                {/* Notification Sub-tabs */}
                                <div className="border-b border-slate-800 px-6 pt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setNotifFilter('pending')}
                                                className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${notifFilter === 'pending'
                                                        ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                                    }`}
                                            >
                                                Pending Action
                                                {pendingNotifications.length > 0 && (
                                                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                                        {pendingNotifications.length}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setNotifFilter('history')}
                                                className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${notifFilter === 'history'
                                                        ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                                    }`}
                                            >
                                                History
                                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-slate-700 rounded-full">
                                                    {actionedNotifications.length}
                                                </span>
                                            </button>
                                        </div>
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAllRead} className="text-sm text-amber-400 hover:text-amber-300">
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    {isLoading ? (
                                        <LoadingState />
                                    ) : displayedNotifications.length === 0 ? (
                                        <EmptyState
                                            icon={<Bell className="w-12 h-12" />}
                                            title={notifFilter === 'pending' ? 'No pending notifications' : 'No history yet'}
                                            description={notifFilter === 'pending' ? "You're all caught up! No actions needed." : 'Actioned notifications will appear here.'}
                                        />
                                    ) : (
                                        <div className="space-y-3">
                                            {displayedNotifications.map((notification) => (
                                                <NotificationCard
                                                    key={notification._id}
                                                    notification={notification}
                                                    onApprove={handleApprove}
                                                    onReject={handleReject}
                                                    rejectingId={rejectingId}
                                                    rejectReason={rejectReason}
                                                    setRejectReason={setRejectReason}
                                                    setRejectingId={setRejectingId}
                                                    isLoading={takeAction.isPending}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Admin Management Tab */}
                        {activeTab === 'admins' && (
                            <div className="animate-fadeIn">
                                {/* Admin Filter Tabs */}
                                <div className="border-b border-slate-800 px-6 pt-4">
                                    <div className="flex gap-2">
                                        {(['all', 'pending', 'approved', 'rejected'] as AdminFilter[]).map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => setAdminFilter(filter)}
                                                className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${adminFilter === filter
                                                    ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                                    }`}
                                            >
                                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-slate-700 rounded-full">
                                                    {adminCounts[filter]}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6">
                                    {adminsLoading ? (
                                        <LoadingState />
                                    ) : filteredAdmins.length === 0 ? (
                                        <EmptyState
                                            icon={<Users className="w-12 h-12" />}
                                            title={`No ${adminFilter} admins`}
                                            description={adminFilter === 'pending' ? "No pending approval requests" : `No ${adminFilter} admins found`}
                                        />
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredAdmins.map((admin: any) => (
                                                <AdminCard key={admin._id} admin={admin} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div className="p-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ChartPlaceholder title="User Growth" />
                                    <ChartPlaceholder title="Admin Activity" />
                                    <ChartPlaceholder title="Post Statistics" />
                                    <ChartPlaceholder title="Engagement Metrics" />
                                </div>
                            </div>
                        )}

                        {/* Reports Tab */}
                        {activeTab === 'reports' && (
                            <div className="p-6 animate-fadeIn">
                                <div className="space-y-3">
                                    <ReportItem title="Weekly Admin Activity Report" date="Feb 9, 2026" status="available" />
                                    <ReportItem title="Monthly User Growth Report" date="Feb 1, 2026" status="available" />
                                    <ReportItem title="Content Moderation Summary" date="Jan 31, 2026" status="available" />
                                    <ReportItem title="Security Audit Report" date="Jan 25, 2026" status="pending" />
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="p-6 animate-fadeIn space-y-4">
                                <SettingsGroup title="Security">
                                    <SettingItem label="Two-Factor Authentication" description="Require 2FA for all super admins" enabled={false} />
                                    <SettingItem label="Session Timeout" description="Auto-logout after 8 hours of inactivity" enabled={true} />
                                </SettingsGroup>
                                <SettingsGroup title="Notifications">
                                    <SettingItem label="Email Alerts" description="Receive email for new admin requests" enabled={true} />
                                    <SettingItem label="Push Notifications" description="Browser push notifications" enabled={false} />
                                </SettingsGroup>
                            </div>
                        )}
                    </div>
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

// Admin Card Component
function AdminCard({ admin }: { admin: any }) {
    const statusColors = {
        pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:bg-slate-800/70 transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-lg">
                        {admin.display_name?.charAt(0).toUpperCase() || admin.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">{admin.display_name || admin.username}</h4>
                        <p className="text-sm text-slate-400">{admin.email}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Joined: {new Date(admin.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[admin.status as keyof typeof statusColors]}`}>
                        {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
            </div>
            {admin.rejectionReason && (
                <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-sm text-red-400">
                        <span className="font-medium">Rejection Reason:</span> {admin.rejectionReason}
                    </p>
                </div>
            )}
        </div>
    );
}

// Stat Card Component
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    const colors = {
        amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
        emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
        red: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-xl border p-5 transition-transform hover:scale-[1.02]`}>
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900/50 rounded-lg">{icon}</div>
                <div>
                    <p className="text-slate-400 text-sm">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}

// Loading State
function LoadingState() {
    return (
        <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
    );
}

// Notification Card Component
function NotificationCard({ notification, onApprove, onReject, rejectingId, rejectReason, setRejectReason, setRejectingId, isLoading }: any) {
    return (
        <div className={`bg-slate-800/50 rounded-xl border p-5 transition-all hover:bg-slate-800/70 ${notification.status === 'unread' ? 'border-amber-500/30' : 'border-slate-700'
            }`}>
            <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-500/10 rounded-lg flex-shrink-0">
                    <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-white">{notification.title}</h3>
                            <p className="text-sm text-slate-400 mt-0.5">{notification.message}</p>
                        </div>
                        {notification.actionTaken && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${notification.actionTaken === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                {notification.actionTaken === 'approved' ? 'Approved' : 'Rejected'}
                            </span>
                        )}
                    </div>
                    {notification.data && (
                        <div className="mt-3 p-3 bg-slate-900/50 rounded-lg grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-slate-500">Username:</span> <span className="text-white font-medium">{notification.data.username}</span></div>
                            <div><span className="text-slate-500">Email:</span> <span className="text-white font-medium">{notification.data.email}</span></div>
                        </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(notification.createdAt).toLocaleString()}
                        </div>
                        {notification.type === 'admin_approval' && notification.status !== 'actioned' && (
                            <div className="flex items-center gap-2">
                                {rejectingId === notification._id ? (
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason (optional)" className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm w-40 focus:outline-none focus:border-amber-500" />
                                        <button onClick={() => onReject(notification._id)} disabled={isLoading} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">Confirm</button>
                                        <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm">Cancel</button>
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={() => onApprove(notification._id)} disabled={isLoading} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-emerald-500/20">
                                            <Check className="w-3.5 h-3.5" />Approve
                                        </button>
                                        <button onClick={() => onReject(notification._id)} disabled={isLoading} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-red-500/20">
                                            <X className="w-3.5 h-3.5" />Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Empty State Component
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-slate-600 mb-4">{icon}</div>
            <h3 className="text-lg font-medium text-slate-300">{title}</h3>
            <p className="text-slate-500 mt-1">{description}</p>
        </div>
    );
}

// Chart Placeholder Component
function ChartPlaceholder({ title }: { title: string }) {
    return (
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
            <h3 className="font-medium text-white mb-4">{title}</h3>
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg">
                <div className="text-center text-slate-500">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chart coming soon</p>
                </div>
            </div>
        </div>
    );
}

// Report Item Component
function ReportItem({ title, date, status }: { title: string; date: string; status: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700 rounded-xl hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                    <h4 className="font-medium text-white">{title}</h4>
                    <p className="text-sm text-slate-500">{date}</p>
                </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {status === 'available' ? 'Download' : 'Processing'}
            </span>
        </div>
    );
}

// Settings Group Component
function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-slate-800/50 border-b border-slate-700">
                <h3 className="font-medium text-white">{title}</h3>
            </div>
            <div className="divide-y divide-slate-700">{children}</div>
        </div>
    );
}

// Setting Item Component
function SettingItem({ label, description, enabled }: { label: string; description: string; enabled: boolean }) {
    return (
        <div className="flex items-center justify-between p-4">
            <div>
                <h4 className="font-medium text-white">{label}</h4>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
            <button className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-amber-500' : 'bg-slate-600'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
            </button>
        </div>
    );
}
