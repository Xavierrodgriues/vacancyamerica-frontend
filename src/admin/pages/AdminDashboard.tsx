import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../lib/admin-auth-context';
import {
    useAdminPosts,
    useAdminPostStats,
    useCreateAdminPost,
    useDeleteAdminPost
} from '../hooks/use-admin-posts';
import { toast } from 'sonner';
import {
    Loader2,
    LogOut,
    Plus,
    Trash2,
    Image,
    Video,
    X,
    FileText,
    TrendingUp,
    Calendar,
    BarChart3,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Redirect if not logged in
    if (!admin) {
        navigate('/admin/login');
        return null;
    }

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
                                <p className="text-xs text-gray-400">Welcome, {admin.display_name}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Section */}
                <StatsSection />

                {/* Create Post Button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Manage Posts</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Create Post
                    </button>
                </div>

                {/* Posts List */}
                <PostsList page={page} setPage={setPage} />

                {/* Create Modal */}
                {showCreateModal && (
                    <CreatePostModal onClose={() => setShowCreateModal(false)} />
                )}
            </main>
        </div>
    );
}

function StatsSection() {
    const { data: statsData, isLoading } = useAdminPostStats();

    const stats = [
        {
            label: 'Total Posts',
            value: statsData?.data?.totalPosts || 0,
            icon: FileText,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            label: 'Today',
            value: statsData?.data?.todayPosts || 0,
            icon: Calendar,
            color: 'from-emerald-500 to-teal-500'
        },
        {
            label: 'This Week',
            value: statsData?.data?.weeklyPosts || 0,
            icon: TrendingUp,
            color: 'from-purple-500 to-pink-500'
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6"
                >
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-20 blur-2xl`} />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">{stat.label}</p>
                            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                            <stat.icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function PostsList({ page, setPage }: { page: number; setPage: (p: number) => void }) {
    const { data, isLoading, error } = useAdminPosts(page);
    const deletePost = useDeleteAdminPost();

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            await deletePost.mutateAsync(id);
            toast.success('Post deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete post');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-400">
                Failed to load posts. Please try again.
            </div>
        );
    }

    const posts = data?.data || [];
    const pagination = data?.pagination;

    if (posts.length === 0) {
        return (
            <div className="text-center py-16 rounded-2xl bg-white/5 border border-white/10">
                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
                <p className="text-gray-400">Create your first post to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post: any) => (
                <div
                    key={post._id}
                    className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                            {post.user?.display_name?.[0]?.toUpperCase() || 'A'}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-white">{post.user?.display_name || 'Admin'}</span>
                                <span className="text-gray-500">@{post.user?.username || 'admin'}</span>
                                <span className="text-gray-500">·</span>
                                <span className="text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>

                            <p className="text-gray-200 mt-2 whitespace-pre-wrap">{post.content}</p>

                            {post.image_url && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                                    <img src={post.image_url} alt="" className="max-h-48 w-full object-cover" />
                                </div>
                            )}

                            {post.video_url && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                                    <video src={post.video_url} controls className="max-h-48 w-full" />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleDelete(post._id)}
                            disabled={deletePost.isPending}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            {deletePost.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-gray-400">
                        Page {page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

function CreatePostModal({ onClose }: { onClose: () => void }) {
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const createPost = useCreateAdminPost();

    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const isVideo = file.type.startsWith('video/');
            setMediaFile(file);
            setMediaType(isVideo ? 'video' : 'image');

            const reader = new FileReader();
            reader.onloadend = () => setMediaPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!content.trim() && !mediaFile) {
            toast.error('Please add content or media');
            return;
        }

        try {
            await createPost.mutateAsync({ content: content.trim(), mediaFile: mediaFile || undefined });
            toast.success('Post created successfully!');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create post');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg rounded-2xl bg-slate-800 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white">Create New Post</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        maxLength={500}
                    />

                    {mediaPreview && (
                        <div className="relative mt-4 rounded-xl overflow-hidden border border-white/10">
                            {mediaType === 'video' ? (
                                <video src={mediaPreview} controls className="w-full max-h-48 object-contain bg-black" />
                            ) : (
                                <img src={mediaPreview} alt="Preview" className="w-full max-h-48 object-cover" />
                            )}
                            <button
                                onClick={removeMedia}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            onChange={handleMediaSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                            title="Add image"
                        >
                            <Image className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                            title="Add video"
                        >
                            <Video className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-gray-500 ml-auto">{content.length}/500</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={(!content.trim() && !mediaFile) || createPost.isPending}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {createPost.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Post'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
