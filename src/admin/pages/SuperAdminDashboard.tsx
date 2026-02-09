import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '../lib/super-admin-auth-context';
import { useNotifications, useUnreadCount, useTakeAction, useMarkAllAsRead } from '../hooks/use-notifications';
import {
    Shield, Bell, LogOut, Check, X, Loader2,
    UserCheck, UserX, Clock, ChevronRight, Users,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminDashboard() {
    const { superAdmin, logout } = useSuperAdminAuth();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'notifications' | 'admins'>('notifications');
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    const { data: notificationsData, isLoading, refetch } = useNotifications(1);
    const { data: unreadCount = 0 } = useUnreadCount();
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-amber-500/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg shadow-amber-500/30">
                                <Shield className="w-6 h-6 text-slate-900" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-amber-100">Super Admin</h1>
                                <p className="text-xs text-slate-400">{superAdmin?.display_name}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            {/* Refresh */}
                            <button
                                onClick={() => refetch()}
                                className="p-2 text-slate-400 hover:text-amber-400 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>

                            {/* Notification Bell */}
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-slate-400 hover:text-amber-400 transition-colors"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-amber-500/10 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-xl">
                                <Bell className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Pending Approvals</p>
                                <p className="text-2xl font-bold text-white">{pendingNotifications.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-emerald-500/10 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                                <UserCheck className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Approved Today</p>
                                <p className="text-2xl font-bold text-white">
                                    {notifications.filter(n => n.actionTaken === 'approved').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-red-500/10 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                                <UserX className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Rejected</p>
                                <p className="text-2xl font-bold text-white">
                                    {notifications.filter(n => n.actionTaken === 'rejected').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setSelectedTab('notifications')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedTab === 'notifications'
                                ? 'bg-amber-500 text-slate-900'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Notifications
                            {pendingNotifications.length > 0 && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {pendingNotifications.length}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setSelectedTab('admins')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedTab === 'admins'
                                ? 'bg-amber-500 text-slate-900'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            All Admins
                        </div>
                    </button>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="ml-auto text-sm text-amber-400 hover:text-amber-300 transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {selectedTab === 'notifications' && (
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
                                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`bg-slate-900/60 backdrop-blur-sm rounded-2xl border p-6 transition-all ${notification.status === 'unread'
                                            ? 'border-amber-500/30 shadow-lg shadow-amber-500/5'
                                            : 'border-slate-800'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {notification.type === 'admin_approval' && (
                                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                                        <Users className="w-4 h-4 text-amber-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-white">{notification.title}</h3>
                                                    <p className="text-sm text-slate-400">{notification.message}</p>
                                                </div>
                                            </div>

                                            {/* Admin Details */}
                                            {notification.data && notification.type === 'admin_approval' && (
                                                <div className="ml-11 mt-3 p-3 bg-slate-800/50 rounded-xl">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-slate-500">Username:</span>{' '}
                                                            <span className="text-white">{notification.data.username}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">Email:</span>{' '}
                                                            <span className="text-white">{notification.data.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Time */}
                                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {notification.type === 'admin_approval' && notification.status !== 'actioned' && (
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleApprove(notification._id)}
                                                    disabled={takeAction.isPending}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors disabled:opacity-50"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Approve
                                                </button>

                                                {rejectingId === notification._id ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={rejectReason}
                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                            placeholder="Reason (optional)"
                                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleReject(notification._id)}
                                                                disabled={takeAction.isPending}
                                                                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm disabled:opacity-50"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setRejectingId(null);
                                                                    setRejectReason('');
                                                                }}
                                                                className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReject(notification._id)}
                                                        disabled={takeAction.isPending}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors disabled:opacity-50"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Reject
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Badge */}
                                        {notification.actionTaken && (
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${notification.actionTaken === 'approved'
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {notification.actionTaken === 'approved' ? 'Approved' : 'Rejected'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* All Admins Tab - Placeholder */}
                {selectedTab === 'admins' && (
                    <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-8 text-center">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Admin management coming soon</p>
                        <p className="text-slate-500 text-sm mt-2">View and manage all registered admins</p>
                    </div>
                )}
            </main>
        </div>
    );
}
