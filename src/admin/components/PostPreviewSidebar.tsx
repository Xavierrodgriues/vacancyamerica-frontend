import { X, Clock, Video, FileText, Shield, XCircle, CheckCircle2, Share2 } from 'lucide-react';
import { AdminPost } from '../hooks/use-admin-posts';

interface PostPreviewSidebarProps {
    post: AdminPost;
    onClose: () => void;
}

export function PostPreviewSidebar({ post, onClose }: PostPreviewSidebarProps) {
    const userDisplayName = post.user?.display_name || 'Unknown User';
    const userUsername = post.user?.username || 'unknown';
    const userAvatar = post.user?.avatar_url;
    const userInitial = userDisplayName[0]?.toUpperCase() || '?';

    return (
        <div
            className="fixed inset-0 z-[60] overflow-hidden flex justify-end"
            onClick={onClose}
        >
            {/* Backdrop Overlay */}
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] animate-in fade-in duration-500" />

            {/* Sidebar Container */}
            <div
                className="relative w-full md:w-[500px] h-full bg-white/95 backdrop-blur-2xl border-l border-white/20 shadow-[-32px_0_64px_-16px_rgba(0,0,0,0.15)] flex flex-col animate-in slide-in-from-right duration-500 ease-out fill-mode-forwards"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative Accent Bar */}
                {/* <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" /> */}

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-7 border-b border-slate-100/50">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative w-12 h-12 rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden ring-1 ring-slate-100 shadow-sm">
                                {userAvatar ? (
                                    <img src={userAvatar} alt={userDisplayName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
                                        <span className="text-lg font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">{userInitial}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-tight">
                                {userDisplayName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400 font-bold tracking-wide">@{userUsername}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-2xl bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all border border-slate-100 group"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {/* Status Section */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ring-1 ${post.status === 'published' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' :
                            post.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-100' :
                                'bg-amber-50 text-amber-700 ring-amber-100'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-emerald-500 animate-pulse' :
                                post.status === 'rejected' ? 'bg-red-500' :
                                    'bg-amber-500 animate-pulse'
                                }`} />
                            {post.status}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>

                    {/* Text content */}
                    <div className="relative mb-10">
                        <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-slate-100 rounded-full" />
                        <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap font-medium tracking-tight">
                            {post.content}
                        </p>
                    </div>

                    {/* Media */}
                    {(post.image_url || post.video_url) && (
                        <div className="mb-10 group relative">
                            <div className="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-black/5 shadow-xl">
                                {post.video_url ? (
                                    <video
                                        src={post.video_url}
                                        controls
                                        className="w-full h-auto max-h-[500px] object-contain mx-auto transition duration-500 group-hover:scale-[1.02]"
                                    />
                                ) : post.image_url ? (
                                    <img
                                        src={post.image_url}
                                        alt="Post content"
                                        className="w-full h-auto max-h-[500px] object-contain mx-auto transition duration-500 group-hover:scale-[1.02]"
                                    />
                                ) : null}
                            </div>
                        </div>
                    )}

                    {/* Rejection Detail */}
                    {post.status === 'rejected' && post.rejectionReason && (
                        <div className="p-7 bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 rounded-[2rem] relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3 text-red-600 font-black text-[10px] uppercase tracking-widest">
                                    <XCircle className="w-4 h-4" />
                                    Rejection Feedback
                                </div>
                                <p className="text-red-950/80 text-base leading-relaxed font-semibold">
                                    "{post.rejectionReason}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-8 border-t border-slate-100/50 bg-slate-50/30">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Back to List
                    </button>
                </div>
            </div>

            <style>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
