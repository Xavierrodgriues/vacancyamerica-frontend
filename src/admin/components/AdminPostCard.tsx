import { useState } from 'react';
import { Shield, XIcon, Check, AlertCircle } from 'lucide-react';
import { AdminPost } from '../hooks/use-admin-posts';

interface AdminPostCardProps {
    post: AdminPost;
    onApprove?: () => void;
    onReject?: (reason: string) => void;
    onPreview?: (post: AdminPost) => void;
    isTrusted?: boolean;
    isRejected?: boolean;
}

export function AdminPostCard({ post, onApprove, onReject, onPreview, isTrusted, isRejected }: AdminPostCardProps) {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    // Safeguard against missing user data
    const userDisplayName = post.user?.display_name || 'Unknown User';
    const userUsername = post.user?.username || 'unknown';
    const userAvatar = post.user?.avatar_url;
    const userInitial = userDisplayName[0]?.toUpperCase() || '?';

    return (
        <div className="group relative bg-[#0B0F1A] rounded-[2.5rem] border border-slate-800/50 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] hover:border-indigo-500/30 transition-all duration-700 hover:-translate-y-1.5 active:scale-[0.99]">
            {/* Top Gloss Highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div
                className={onPreview ? "cursor-pointer" : ""}
                onClick={() => onPreview?.(post)}
            >
                {/* Card Header */}
                <div className="p-7 flex justify-between items-start bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 to-amber-200 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
                            <div className="relative w-14 h-14 rounded-full bg-slate-900 p-0.5 flex items-center justify-center overflow-hidden border border-slate-800 shadow-2xl">
                                {userAvatar ? (
                                    <img src={userAvatar} alt={userDisplayName} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="text-2xl font-black bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 bg-clip-text text-transparent">{userInitial}</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-slate-100 tracking-tight leading-none mb-1.5">{userDisplayName}</h4>
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest bg-slate-800/40 px-2 py-0.5 rounded-md border border-slate-700/30">@{userUsername}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-xs text-slate-500 font-medium">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {isTrusted && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                <Shield className="w-3.5 h-3.5" />
                                <span>Verified</span>
                            </div>
                        )}
                        {isRejected && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                                <XIcon className="w-3.5 h-3.5" />
                                <span>Rejected</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="px-8 pb-8">
                    {post.content ? (
                        <p className="text-slate-300 text-lg leading-[1.8] font-medium tracking-tight mb-8 line-clamp-4 group-hover:line-clamp-none transition-all duration-500 border-l-2 border-indigo-500/20 pl-6 py-1 italic decoration-slate-600 underline-offset-4 decoration-dotted">
                            {post.content}
                        </p>
                    ) : (
                        <div className="p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800 border-dashed text-center mb-8">
                            <p className="text-slate-600 italic font-medium tracking-wide">Empty narrative sequence.</p>
                        </div>
                    )}

                    {/* Media Display */}
                    {(post.image_url || post.video_url) && (
                        <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-black/40 shadow-2xl h-[360px] group/media">
                            {/* Inner Glow/Shadow */}
                            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.4)] pointer-events-none z-10" />

                            {post.image_url ? (
                                <img
                                    src={post.image_url}
                                    alt="Attachment"
                                    className="w-full h-full object-contain transition-transform duration-1000 group-hover/media:scale-105"
                                />
                            ) : (
                                <video
                                    src={post.video_url}
                                    className="w-full h-full object-contain"
                                    muted
                                    onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                                    onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                                />
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-500 flex items-end p-8 gap-4 z-20">
                                <span className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                                    {post.image_url ? 'Still Image' : 'Motion Video'}
                                </span>
                            </div>
                        </div>
                    )}

                    {isRejected && post.rejectionReason && (
                        <div className="mt-8 p-6 bg-rose-950/20 border border-rose-900/30 rounded-[2rem] flex gap-5 animate-fadeIn backdrop-blur-sm">
                            <div className="p-3 bg-rose-500/10 rounded-2xl h-fit border border-rose-500/20 shadow-lg shadow-rose-900/20">
                                <XIcon className="w-5 h-5 text-rose-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-rose-400 font-black uppercase tracking-[0.15em]">Moderation Note</p>
                                    <span className="text-[10px] text-slate-500 font-bold bg-slate-800/50 px-2 py-0.5 rounded uppercase">{post.approvedBy?.display_name || 'Admin'}</span>
                                </div>
                                <p className="text-slate-400 leading-relaxed text-sm font-medium italic underline decoration-rose-900/50 decoration-2 underline-offset-4">"{post.rejectionReason}"</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions Footer */}
            {!isRejected && onApprove && onReject && (
                <div className="px-8 py-6 bg-slate-950/80 border-t border-slate-900 flex justify-end gap-4 backdrop-blur-xl">
                    {showRejectInput ? (
                        <div className="flex items-center gap-4 w-full animate-fadeIn">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    name="postRejectReason"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Briefly state reason for rejection..."
                                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-600 font-medium"
                                    autoFocus
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500/40">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                            </div>
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
                                    className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(225,29,72,0.3)] active:translate-y-0.5"
                                >
                                    Confirm Reject
                                </button>
                                <button
                                    onClick={() => setShowRejectInput(false)}
                                    className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:translate-y-0.5"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowRejectInput(true)}
                                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group flex items-center gap-2.5 active:translate-y-0.5"
                            >
                                <XIcon className="w-4 h-4 transition-transform group-hover:rotate-90 group-hover:scale-110" />
                                Reject
                            </button>
                            <button
                                onClick={onApprove}
                                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)] rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 group active:translate-y-0.5"
                            >
                                <Check className="w-4 h-4 transition-transform group-hover:scale-125" />
                                Approve & Publish
                            </button>
                        </>
                    )}
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
}
