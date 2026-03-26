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
        <div className={`relative overflow-hidden bg-slate-800/30 backdrop-blur-md rounded-2xl border p-6 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.5)] ${notification.status === 'unread' ? 'border-amber-500/40 hover:border-amber-500/60' : 'border-white/5 hover:border-white/10'}`}>
            {notification.status === 'unread' && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />}
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/5 rounded-2xl flex-shrink-0 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-white text-lg tracking-tight mb-1">{notification.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">{notification.message}</p>
                        </div>
                        {notification.actionTaken && (
                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex-shrink-0 shadow-inner ${notification.actionTaken === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                                }`}>
                                {notification.actionTaken === 'approved' ? 'Approved' : 'Rejected'}
                            </span>
                        )}
                    </div>
                    {notification.data && (
                        <div className="mt-5 p-4 bg-slate-950/50 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border border-white/5 shadow-inner">
                            <div className="flex items-center gap-2"><span className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">Username:</span> <span className="text-white font-medium">{notification.data.username}</span></div>
                            <div className="flex items-center gap-2"><span className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">Email:</span> <span className="text-white font-medium">{notification.data.email}</span></div>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-5 gap-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full w-fit border border-white/5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(notification.createdAt).toLocaleString()}
                        </div>
                        {notification.type === 'admin_approval' && notification.status !== 'actioned' && (
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {rejectingId === notification._id ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                                        <input type="text" name="rejectReason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason (optional)" className="px-5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-full text-white text-sm w-full sm:w-48 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner transition-all" />
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button onClick={() => onReject(notification._id)} disabled={isLoading} className="flex-1 sm:flex-none px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-bold shadow-[0_5px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_5px_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50">Confirm</button>
                                            <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 hover:border-slate-600 text-sm font-medium transition-all">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button onClick={() => onApprove(notification._id)} disabled={isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold transition-all disabled:opacity-50 border border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_5px_20px_rgba(16,185,129,0.15)] hover:-translate-y-0.5 group/btn">
                                            <Check className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />Approve
                                        </button>
                                        <button onClick={() => onReject(notification._id)} disabled={isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full text-sm font-bold transition-all disabled:opacity-50 border border-red-500/20 hover:border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_5px_20px_rgba(239,68,68,0.15)] hover:-translate-y-0.5 group/btn">
                                            <X className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
