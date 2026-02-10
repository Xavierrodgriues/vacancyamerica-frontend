import { Users, Clock, Check, X } from 'lucide-react';

interface NotificationCardProps {
    notification: any;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    rejectingId: string | null;
    rejectReason: string;
    setRejectReason: (reason: string) => void;
    setRejectingId: (id: string | null) => void;
    isLoading: boolean;
}

export function NotificationCard({ notification, onApprove, onReject, rejectingId, rejectReason, setRejectReason, setRejectingId, isLoading }: NotificationCardProps) {
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
