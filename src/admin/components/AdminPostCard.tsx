import { useState } from 'react';
import { Shield, XIcon, Check } from 'lucide-react';
import { AdminPost } from '../hooks/use-admin-posts';

interface AdminPostCardProps {
    post: AdminPost;
    onApprove?: () => void;
    onReject?: (reason: string) => void;
    isTrusted?: boolean;
    isRejected?: boolean;
}

export function AdminPostCard({ post, onApprove, onReject, isTrusted, isRejected }: AdminPostCardProps) {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    // Safeguard against missing user data
    const userDisplayName = post.user?.display_name || 'Unknown User';
    const userUsername = post.user?.username || 'unknown';
    const userAvatar = post.user?.avatar_url;
    const userInitial = userDisplayName[0]?.toUpperCase() || '?';

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all duration-300">
            {/* Card Header */}
            <div className="p-5 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-700 ring-2 ring-slate-900">
                        {userAvatar ? (
                            <img src={userAvatar} alt={userDisplayName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl font-bold bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent">{userInitial}</span>
                        )}
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-white leading-tight">{userDisplayName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400 font-medium">@{userUsername}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isTrusted && <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20 flex items-center gap-1.5 shadow-sm shadow-blue-900/10"><Shield className="w-3.5 h-3.5" /> Trusted</span>}
                    {isRejected && <span className="px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 flex items-center gap-1.5 shadow-sm shadow-red-900/10"><XIcon className="w-3.5 h-3.5" /> Rejected</span>}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-5">
                {post.content ? (
                    <p className="text-slate-300 whitespace-pre-wrap mb-4 text-base leading-relaxed font-light">{post.content}</p>
                ) : (
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-800 border-dashed text-center mb-4">
                        <p className="text-slate-500 italic text-sm">No text content provided.</p>
                    </div>
                )}

                {post.image_url && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-slate-800 bg-black relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <img src={post.image_url} alt="Post attachment" className="w-full max-h-[500px] object-contain" />
                    </div>
                )}

                {post.video_url && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-slate-800 bg-black shadow-lg">
                        <video src={post.video_url} controls className="w-full max-h-[500px]" />
                    </div>
                )}

                {isRejected && post.rejectionReason && (
                    <div className="mt-4 p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg h-fit">
                            <XIcon className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm text-red-400 font-medium">Rejection Reason</p>
                            <p className="text-sm text-slate-400 mt-1">{post.rejectionReason}</p>
                            <p className="text-xs text-slate-600 mt-2">rejected by {post.approvedBy?.display_name || 'Super Admin'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions Footer */}
            {!isRejected && onApprove && onReject && (
                <div className="px-5 py-4 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-3 backdrop-blur-sm">
                    {showRejectInput ? (
                        <div className="flex items-center gap-3 w-full animate-fadeIn">
                            <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Why are you rejecting this post?"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-slate-600"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (rejectReason.trim()) {
                                            onReject(rejectReason);
                                            setShowRejectInput(false);
                                            setRejectReason('');
                                        }
                                    }}
                                    disabled={!rejectReason.trim()}
                                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => setShowRejectInput(false)}
                                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowRejectInput(true)}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2 group"
                            >
                                <XIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                                Reject
                            </button>
                            <button
                                onClick={onApprove}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 rounded-lg text-sm font-bold transition-all flex items-center gap-2 hover:transform hover:-translate-y-0.5"
                            >
                                <Check className="w-4 h-4" />
                                Approve & Publish
                            </button>
                        </>
                    )}
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}
