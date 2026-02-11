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
    LogOut,
    Plus,
    Trash2,
    Image,
    Video,
    X,
    FileText,
    TrendingUp,
    Calendar,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { StatCard, LoadingState, EmptyState } from '../components/SharedUI';

export default function AdminDashboard() {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [activeTab, setActiveTab] = useState<'posts' | 'privileges'>('posts');

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
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-black/80 border-b border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white tracking-tight">Admin Dashboard</h1>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-neutral-500 font-medium tracking-wide">Welcome, {admin.display_name}</p>
                                    <span className="px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400 text-[10px] font-bold border border-neutral-700 uppercase tracking-wider">
                                        Level {admin.admin_level || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Section */}
                <StatsSection />

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 p-1 mb-8 bg-neutral-900/50 rounded-xl border border-neutral-800 w-fit">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'posts'
                            ? 'bg-white text-black shadow-sm'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                            }`}
                    >
                        Manage Posts
                    </button>
                    <button
                        onClick={() => setActiveTab('privileges')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'privileges'
                            ? 'bg-white text-black shadow-sm'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                            }`}
                    >
                        My Privileges
                    </button>
                </div>

                {activeTab === 'posts' ? (
                    <>
                        {/* Create Post Button */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Manage Posts</h2>
                                <p className="text-neutral-500 text-sm mt-1">Create and manage your content</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold shadow-sm hover:shadow transition-all text-sm"
                            >
                                <Plus className="w-5 h-5" />
                                Create Post
                            </button>
                        </div>

                        {/* Posts List */}
                        <PostsList page={page} setPage={setPage} />
                    </>
                ) : (
                    <PrivilegesTab level={admin.admin_level || 0} />
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <CreatePostModal onClose={() => setShowCreateModal(false)} />
                )}
            </main>
        </div>
    );
}

function PrivilegesTab({ level }: { level: number }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Your Privileges</h2>
                    <p className="text-neutral-500 text-sm mt-1">Current capabilities based on your admin level</p>
                </div>

                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-2xl font-bold text-white">{level}</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                {level === 0 && 'Standard Admin'}
                                {level === 1 && 'Trusted Admin'}
                                {level === 2 && 'Verified Partner'}
                            </h3>
                            <p className="text-sm text-neutral-400">Current Access Level</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {level === 0 && (
                            <>
                                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                                    <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-500" /> Posting Rules
                                    </h4>
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        Your posts require approval. After submission, they enter a pending state and must be approved by a Super Admin before going live.
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Process Flow</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                                        <span>Submit</span>
                                        <ChevronRight className="w-4 h-4 text-neutral-600" />
                                        <span>Pending Approval</span>
                                        <ChevronRight className="w-4 h-4 text-neutral-600" />
                                        <span>Super Admin Review</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {level === 1 && (
                            <>
                                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                                    <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" /> Trusted Status
                                    </h4>
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        You have proven legitimacy. Your posts enter a priority review queue and are typically approved quickly by Super Admins.
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Process Flow</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                                        <span>Submit</span>
                                        <ChevronRight className="w-4 h-4 text-neutral-600" />
                                        <span>Priority Review</span>
                                        <ChevronRight className="w-4 h-4 text-neutral-600" />
                                        <span>Quick Approval</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {level === 2 && (
                            <>
                                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                                    <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full Access
                                    </h4>
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        Verified Employer/Partner status. Your posts are published instantly without requiring approval.
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Process Flow</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                                        <span>Submit</span>
                                        <ChevronRight className="w-4 h-4 text-neutral-600" />
                                        <span>Published Instantly</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-white">Level Management</h4>
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                Admin levels are managed by Super Admins based on platform behavior and verification status. Consistent positive contributions can lead to upgrades, while policy violations may result in downgrades.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Representation / Sidebar Info */}
            <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800 h-full">
                    <h3 className="text-lg font-bold text-white mb-6">Level Hierarchy</h3>

                    <div className="relative space-y-8 pl-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
                        <div className={`relative ${level === 2 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div className="absolute -left-[39px] top-0 w-10 h-10 rounded-full bg-neutral-900 border-4 border-black flex items-center justify-center z-10">
                                <span className="text-emerald-500 font-bold">2</span>
                            </div>
                            <h4 className="font-bold text-white">Verified Partner</h4>
                            <p className="text-xs text-neutral-500 mt-1">Instant publishing, full features access</p>
                        </div>

                        <div className={`relative ${level === 1 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div className="absolute -left-[39px] top-0 w-10 h-10 rounded-full bg-neutral-900 border-4 border-black flex items-center justify-center z-10">
                                <span className="text-blue-500 font-bold">1</span>
                            </div>
                            <h4 className="font-bold text-white">Trusted Admin</h4>
                            <p className="text-xs text-neutral-500 mt-1">Priority review, proven track record</p>
                        </div>

                        <div className={`relative ${level === 0 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div className="absolute -left-[39px] top-0 w-10 h-10 rounded-full bg-neutral-900 border-4 border-black flex items-center justify-center z-10">
                                <span className="text-amber-500 font-bold">0</span>
                            </div>
                            <h4 className="font-bold text-white">Standard Admin</h4>
                            <p className="text-xs text-neutral-500 mt-1">Standard approval process</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}




function StatsSection() {
    const { data: statsData, isLoading } = useAdminPostStats();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 rounded-xl bg-neutral-900 animate-pulse border border-neutral-800" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <StatCard
                icon={<FileText className="w-5 h-5" />}
                label="Total Posts"
                value={statsData?.data?.totalPosts || 0}
                color="white"
            />
            <StatCard
                icon={<Calendar className="w-5 h-5" />}
                label="Today"
                value={statsData?.data?.todayPosts || 0}
                color="neutral"
            />
            <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="This Week"
                value={statsData?.data?.weeklyPosts || 0}
                color="neutral"
            />
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

    if (isLoading) return <LoadingState />;

    if (error) {
        return (
            <div className="text-center py-12 text-red-500 border border-red-900/50 rounded-xl bg-red-950/10">
                Failed to load posts. Please try again.
            </div>
        );
    }

    const posts = data?.data || [];
    const pagination = data?.pagination;

    if (posts.length === 0) {
        return (
            <EmptyState
                icon={<FileText className="w-8 h-8" />}
                title="No posts yet"
                description="Create your first post to get started!"
            />
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post: any) => (
                <div
                    key={post._id}
                    className="group rounded-xl bg-black border border-neutral-800 p-6 hover:border-neutral-600 transition-all"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center text-black font-bold text-sm">
                            {post.user?.display_name?.[0]?.toUpperCase() || 'A'}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-sm font-bold text-white">{post.user?.display_name || 'Admin'}</h3>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                                        <span className="font-mono">@{post.user?.username || 'admin'}</span>
                                        <span>•</span>
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center gap-2">
                                    {post.status === 'published' && (
                                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white text-black border border-white flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3" /> Published
                                        </span>
                                    )}
                                    {post.status === 'pending' && (
                                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-neutral-400 border border-neutral-800 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> Pending
                                        </span>
                                    )}
                                    {post.status === 'pending_trusted' && (
                                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white border border-neutral-700 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3" /> Trusted Pending
                                        </span>
                                    )}
                                    {post.status === 'rejected' && (
                                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-500 border border-red-900 flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" /> Rejected
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-neutral-300 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>

                            {post.image_url && (
                                <div className="mt-4 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
                                    <img src={post.image_url} alt="" className="max-h-96 w-full object-contain" />
                                </div>
                            )}

                            {post.video_url && (
                                <div className="mt-4 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
                                    <video src={post.video_url} controls className="max-h-96 w-full" />
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {post.status === 'rejected' && post.rejectionReason && (
                                <div className="mt-4 p-4 bg-neutral-900/50 border-l-2 border-red-500">
                                    <p className="text-xs text-red-500 font-bold uppercase tracking-wide mb-1">Rejection Reason</p>
                                    <p className="text-sm text-neutral-400">{post.rejectionReason}</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleDelete(post._id)}
                            disabled={deletePost.isPending}
                            className="p-2 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-red-950/20 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-neutral-500">
                        Page <span className="text-white">{page}</span> of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="p-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-lg rounded-xl bg-black border border-neutral-800 shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                    <h3 className="text-lg font-bold text-white tracking-tight">Create New Post</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full h-32 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors resize-none text-sm"
                        maxLength={500}
                    />

                    {mediaPreview && (
                        <div className="relative mt-4 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                            {mediaType === 'video' ? (
                                <video src={mediaPreview} controls className="w-full max-h-64 object-contain" />
                            ) : (
                                <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-contain" />
                            )}
                            <button
                                onClick={removeMedia}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
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
                            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                            title="Add image"
                        >
                            <Image className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                            title="Add video"
                        >
                            <Video className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-medium text-neutral-600 ml-auto">{content.length}/500</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-neutral-800 bg-neutral-950/50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={(!content.trim() && !mediaFile) || createPost.isPending}
                        className="px-6 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {createPost.isPending ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
}
