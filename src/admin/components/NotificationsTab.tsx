import { useState } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications, useUnreadCount, useMarkAllAsRead, useTakeAction } from '../hooks/use-notifications';
import { NotificationCard } from './NotificationCard';
import { DarkLoadingState, DarkEmptyState } from './SharedUI';

type NotifFilter = 'pending' | 'history';

export function NotificationsTab() {
    const [notifFilter, setNotifFilter] = useState<NotifFilter>('pending');
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    const { data: notificationsData, isLoading, refetch } = useNotifications(1);
    const { data: unreadCount = 0 } = useUnreadCount();
    const takeAction = useTakeAction();
    const markAllAsRead = useMarkAllAsRead();

    const notifications = notificationsData?.notifications || [];
    const pendingNotifications = notifications.filter(n => n.status !== 'actioned' && n.type === 'admin_approval');
    const actionedNotifications = notifications.filter(n => n.status === 'actioned');
    const displayedNotifications = notifFilter === 'pending' ? pendingNotifications : actionedNotifications;

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

    return (
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden animate-fadeIn relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50" />
            
            {/* Header & Sub-tabs */}
            <div className="border-b border-white/5 px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/50">
                <div className="flex p-1 bg-slate-950/80 rounded-full border border-white/5 shadow-inner">
                    <button
                        onClick={() => setNotifFilter('pending')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${notifFilter === 'pending'
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Pending Action
                        {pendingNotifications.length > 0 && (
                            <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${notifFilter === 'pending' ? 'bg-slate-950/20 text-slate-900' : 'bg-red-500/20 text-red-500'}`}>
                                {pendingNotifications.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setNotifFilter('history')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${notifFilter === 'history'
                            ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        History
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${notifFilter === 'history' ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-500'}`}>
                            {actionedNotifications.length}
                        </span>
                    </button>
                </div>
                
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="px-5 py-2 rounded-full text-xs font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:-translate-y-0.5">
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="p-6">
                {isLoading ? (
                    <DarkLoadingState />
                ) : displayedNotifications.length === 0 ? (
                    <DarkEmptyState
                        icon={<Bell className="w-10 h-10 drop-shadow-lg" />}
                        title={notifFilter === 'pending' ? 'No pending action required' : 'Notification history is empty'}
                        description={notifFilter === 'pending' ? "You're all caught up! When user roles require approval, they will securely arrive here." : 'Action summary logs and post audits will safely appear down the line.'}
                        glowColor={notifFilter === 'pending' ? 'amber' : 'slate'}
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
    );
}
