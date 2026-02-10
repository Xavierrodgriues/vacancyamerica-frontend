import { useState } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications, useUnreadCount, useMarkAllAsRead, useTakeAction } from '../hooks/use-notifications';
import { NotificationCard } from './NotificationCard';
import { LoadingState, EmptyState } from './SharedUI';

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
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 animate-fadeIn">
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
    );
}
