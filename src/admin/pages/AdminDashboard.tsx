import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../lib/admin-auth-context';
import {
    useAdminPosts,
    useAdminPostStats,
    useCreateAdminPost,
    useDeleteAdminPost
} from '../hooks/use-admin-posts';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
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

    // Track previous level for animations
    const prevLevelRef = useRef(admin?.admin_level);

    useEffect(() => {
        if (!admin) return;

        // Check if level changed
        if (prevLevelRef.current !== undefined && admin.admin_level !== prevLevelRef.current) {
            if (admin.admin_level > prevLevelRef.current) {
                // Upgrade - Party Popper!
                const duration = 5 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                const randomInRange = (min: number, max: number) => {
                    return Math.random() * (max - min) + min;
                }

                const interval: any = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);

                    // since particles fall down, start a bit higher than random
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);

                toast.success(`Congratulations! You've been upgraded to Level ${admin.admin_level}!`);
            } else {
                // Downgrade
                toast.info(`Your admin level has changed to Level ${admin.admin_level}.`);
            }

            // Update ref
            prevLevelRef.current = admin.admin_level;
        } else if (prevLevelRef.current === undefined) {
            prevLevelRef.current = admin.admin_level;
        }

    }, [admin?.admin_level]);

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
                    <PostsView
                        page={page}
                        setPage={setPage}
                        showCreateModal={showCreateModal}
                        setShowCreateModal={setShowCreateModal}
                    />
                ) : (
                    <PrivilegesView />
                )}
            </main>

            {/* Create Post Modal */}
            {showCreateModal && (
                <CreatePostModal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
}

// Sub-components to keep the file clean-ish
function StatsSection() {
    const { data: statsData, isLoading: statsLoading, error: statsError } = useAdminPostStats();

    const stats = statsData?.data;

    if (statsLoading) return <LoadingState />;
    if (statsError) return <div className="text-red-500">Failed to load stats</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
                label="Total Posts"
                value={stats?.totalPosts || 0}
                icon={<FileText className="w-5 h-5 text-white" />}
                color="indigo"
            />
            <StatCard
                label="Today"
                value={stats?.todayPosts || 0}
                icon={<Calendar className="w-5 h-5 text-white" />}
                color="amber"
            />
            <StatCard
                label="This Week"
                value={stats?.weekPosts || 0}
                icon={<TrendingUp className="w-5 h-5 text-white" />}
                color="emerald"
            />
        </div>
    );
}

function PostsView({ page, setPage, showCreateModal, setShowCreateModal }: any) {
    const { data, isLoading: loading, error } = useAdminPosts(page);
    const deletePostCmd = useDeleteAdminPost();

    const posts = data?.data || [];
    const totalPages = data?.pagination?.totalPages || 1;

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (postId: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setDeletingId(postId);
            try {
                await deletePostCmd.mutateAsync(postId);
                toast.success('Post deleted successfully');
            } catch (err) {
                toast.error('Failed to delete post');
            } finally {
                setDeletingId(null);
            }
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <div className="text-red-500">Failed to load posts</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight">Recent Posts</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-neutral-200 transition-all font-bold text-sm shadow-sm hover:shadow-md"
                >
                    <Plus className="w-4 h-4" />
                    Create Post
                </button>
            </div>

            {posts.length === 0 ? (
                <EmptyState icon={<FileText className="w-8 h-8" />} title="No posts yet" description="Create your first post to get started!" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            className="group bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:shadow-neutral-900/50 hover:-translate-y-1"
                        >
                            <div className="aspect-video relative overflow-hidden bg-neutral-800">
                                {post.type === 'video' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                                        <Video className="w-8 h-8 text-neutral-600" />
                                        {/* Video Preview or Thumbnail would go here if available */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs font-bold px-2 py-1 bg-black/60 rounded text-white backdrop-blur-sm flex items-center gap-1">
                                                <Video className="w-3 h-3" /> Video Post
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={post.media_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"}
                                        alt={post.caption}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                )}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => handleDelete(post._id)}
                                        disabled={deletingId === post._id}
                                        className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors backdrop-blur-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${post.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        post.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                        }`}>
                                        {post.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-neutral-300 line-clamp-2 font-medium leading-relaxed">
                                    {post.caption}
                                </p>
                                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500 font-medium">
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    {post.scheduledFor && (
                                        <span className="flex items-center gap-1 text-blue-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(post.scheduledFor).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 disabled:opacity-50 hover:bg-neutral-800 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="flex items-center px-4 font-mono text-sm text-neutral-400">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 disabled:opacity-50 hover:bg-neutral-800 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

function PrivilegesView() {
    const { admin } = useAdminAuth();

    if (!admin) return null;

    const currentLevel = admin.admin_level || 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 lg:p-8">
                    <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                        Your Privileges
                    </h2>
                    <p className="text-neutral-400 mb-8">Current capabilities based on your admin level</p>

                    <div className="space-y-6">
                        {/* Level 2 Content */}
                        {currentLevel >= 2 && (
                            <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group hover:border-neutral-700 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start gap-4/ relative z-10">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
                                        <span className="text-xl font-bold text-white">2</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-1">halPartner</h3>
                                        <p className="text-neutral-400 text-sm">Current Access Level</p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-4 relative z-10">
                                    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                                        <div className="flex items-center gap-2 mb-2 text-green-400 font-bold text-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Full Access
                                        </div>
                                        <p className="text-neutral-400 text-xs leading-relaxed">
                                            Verified Employer/Partner status. Your posts are published instantly without requiring approval.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                                        <div className="flex items-center gap-2 mb-2 text-neutral-300 font-bold text-xs uppercase tracking-wider">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Process Flow
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                                            <span>Submit</span>
                                            <ChevronRight className="w-3 h-3" />
                                            <span className="text-white font-bold">Published Instantly</span>
                                            <ChevronRight className="w-3 h-3" />
                                            <span>Live</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Level 1 Content */}
                        {currentLevel === 1 && (
                            <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group hover:border-neutral-700 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                                        <span className="text-xl font-bold text-white">1</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-1">Trusted Admin</h3>
                                        <p className="text-neutral-400 text-sm">Current Access Level</p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-4 relative z-10">
                                    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                                        <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold text-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Priority Review
                                        </div>
                                        <p className="text-neutral-400 text-xs leading-relaxed">
                                            Trusted status. Your posts are reviewed with priority but still require approval from a Super Admin.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Level 0 Content */}
                        {currentLevel === 0 && (
                            <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group hover:border-neutral-700 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-r from-neutral-500/10 to-stone-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neutral-600 to-stone-600 flex items-center justify-center shadow-lg shadow-neutral-900/20">
                                        <span className="text-xl font-bold text-white">0</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-1">Standard Admin</h3>
                                        <p className="text-neutral-400 text-sm">Current Access Level</p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-4 relative z-10">
                                    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                                        <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            Approval Required
                                        </div>
                                        <p className="text-neutral-400 text-xs leading-relaxed">
                                            Standard status. All posts must be approved by a Super Admin before going live.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                                        <div className="flex items-center gap-2 mb-2 text-neutral-300 font-bold text-xs uppercase tracking-wider">
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                            Process Flow
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                                            <span>Submit</span>
                                            <ChevronRight className="w-3 h-3" />
                                            <span className="text-yellow-400 font-bold">Pending Approval</span>
                                            <ChevronRight className="w-3 h-3" />
                                            <span>Start 6hr Timer (If Approved)</span>
                                            <ChevronRight className="w-3 h-3" />
                                            <span>Live</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Level Hierarchy</h3>
                    <div className="space-y-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-neutral-800" />

                        {/* Level 2 Item */}
                        <div className={`relative flex gap-4 transition-opacity duration-300 ${currentLevel === 2 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 transition-colors ${currentLevel === 2 ? 'bg-purple-600 border-neutral-900 text-white' : 'bg-neutral-800 border-neutral-900 text-neutral-500'
                                }`}>
                                <span className="font-bold text-sm">2</span>
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${currentLevel === 2 ? 'text-white' : 'text-neutral-400'}`}>Verified Partner</h4>
                                <p className="text-xs text-neutral-500 mt-1">Instant publishing, full features access</p>
                            </div>
                        </div>

                        {/* Level 1 Item */}
                        <div className={`relative flex gap-4 transition-opacity duration-300 ${currentLevel === 1 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 transition-colors ${currentLevel === 1 ? 'bg-blue-600 border-neutral-900 text-white' : 'bg-neutral-800 border-neutral-900 text-neutral-500'
                                }`}>
                                <span className="font-bold text-sm">1</span>
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${currentLevel === 1 ? 'text-white' : 'text-neutral-400'}`}>Trusted Admin</h4>
                                <p className="text-xs text-neutral-500 mt-1">Priority review, proven track record</p>
                            </div>
                        </div>

                        {/* Level 0 Item */}
                        <div className={`relative flex gap-4 transition-opacity duration-300 ${currentLevel === 0 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 transition-colors ${currentLevel === 0 ? 'bg-neutral-600 border-neutral-900 text-white' : 'bg-neutral-800 border-neutral-900 text-neutral-500'
                                }`}>
                                <span className="font-bold text-sm">0</span>
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${currentLevel === 0 ? 'text-white' : 'text-neutral-400'}`}>Standard Admin</h4>
                                <p className="text-xs text-neutral-500 mt-1">Standard approval process</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
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

