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
    AlertCircle,
    Shield,
    Bell,
    User
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

        if (prevLevelRef.current !== undefined && admin.admin_level !== prevLevelRef.current) {
            if (admin.admin_level > prevLevelRef.current) {
                const duration = 5 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                const randomInRange = (min: number, max: number) => {
                    return Math.random() * (max - min) + min;
                }

                const interval: any = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) return clearInterval(interval);
                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);

                toast.success(`Congratulations! You've been upgraded to Level ${admin.admin_level}!`);
            } else {
                toast.info(`Your admin level has changed to Level ${admin.admin_level}.`);
            }
            prevLevelRef.current = admin.admin_level;
        } else if (prevLevelRef.current === undefined) {
            prevLevelRef.current = admin.admin_level;
        }
    }, [admin?.admin_level]);

    if (!admin) {
        navigate('/admin/login');
        return null;
    }

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/admin/login');
    };

    const sidebarItems = [
        { id: 'posts' as const, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'privileges' as const, label: 'Privileges', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex">
            {/* ─── Sidebar ─── */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen fixed left-0 top-0 z-40">
                {/* Logo / Brand */}
                <div className="px-6 py-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Admin</h1>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">General</p>
                    <div className="space-y-1">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                        }`}
                                >
                                    <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-indigo-600' : ''}`} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom: User Card + Logout */}
                <div className="px-4 py-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 mb-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{admin.display_name}</p>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-medium">Level {admin.admin_level || 0}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* ─── Main Content ─── */}
            <div className="flex-1 ml-64">
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                    <div className="px-8 py-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                Welcome, {admin.display_name}!
                            </h2>
                            <p className="text-sm text-slate-400 mt-0.5">Manage your content and view your privileges</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors relative">
                                <Bell className="w-[18px] h-[18px] text-slate-500" />
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <User className="w-[18px] h-[18px] text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="px-8 py-8">
                    {activeTab === 'posts' ? (
                        <>
                            <StatsSection />
                            <PostsView
                                page={page}
                                setPage={setPage}
                                showCreateModal={showCreateModal}
                                setShowCreateModal={setShowCreateModal}
                            />
                        </>
                    ) : (
                        <PrivilegesView />
                    )}
                </main>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <CreatePostModal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
}

// ─── Stats Section ──────────────────────────────────────────────────────────
function StatsSection() {
    const { data: statsData, isLoading: statsLoading, error: statsError } = useAdminPostStats();
    const stats = statsData?.data;

    if (statsLoading) return <LoadingState />;
    if (statsError) return <div className="text-red-500 p-4">Failed to load stats</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <StatCard
                label="Total Posts"
                value={stats?.totalPosts || 0}
                icon={<FileText className="w-5 h-5" />}
                color="indigo"
            />
            <StatCard
                label="Today"
                value={stats?.todayPosts || 0}
                icon={<Calendar className="w-5 h-5" />}
                color="amber"
            />
            <StatCard
                label="This Week"
                value={stats?.weekPosts || 0}
                icon={<TrendingUp className="w-5 h-5" />}
                color="emerald"
            />
        </div>
    );
}

// ─── Posts View ─────────────────────────────────────────────────────────────
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
    if (error) return <div className="text-red-500 p-4">Failed to load posts</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Recent Posts</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{posts.length} posts found</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200"
                >
                    <Plus className="w-4 h-4" />
                    Create Post
                </button>
            </div>

            {posts.length === 0 ? (
                <EmptyState icon={<FileText className="w-8 h-8" />} title="No posts yet" description="Create your first post to get started!" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {posts.map((post: any) => (
                        <div
                            key={post._id}
                            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="aspect-video relative overflow-hidden bg-slate-100">
                                {post.type === 'video' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <Video className="w-8 h-8 text-slate-300" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs font-semibold px-2.5 py-1 bg-black/40 rounded-lg text-white backdrop-blur-sm flex items-center gap-1">
                                                <Video className="w-3 h-3" /> Video
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
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => handleDelete(post._id)}
                                        disabled={deletingId === post._id}
                                        className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${post.status === 'published' ? 'bg-green-100/90 text-green-700 border border-green-200' :
                                            post.status === 'rejected' ? 'bg-red-100/90 text-red-700 border border-red-200' :
                                                'bg-amber-100/90 text-amber-700 border border-amber-200'
                                        }`}>
                                        {post.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-slate-600 line-clamp-2 font-medium leading-relaxed">
                                    {post.content || post.caption}
                                </p>
                                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    {post.scheduledFor && (
                                        <span className="flex items-center gap-1 text-indigo-500">
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
                <div className="flex justify-center items-center gap-3 mt-8">
                    <button
                        onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-500" />
                    </button>
                    <span className="flex items-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-500 font-medium shadow-sm">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Privileges View ────────────────────────────────────────────────────────
function PrivilegesView() {
    const { admin } = useAdminAuth();

    if (!admin) return null;

    const currentLevel = admin.admin_level || 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-2 text-slate-800">
                        Your Privileges
                    </h2>
                    <p className="text-slate-400 mb-8 text-sm">Current capabilities based on your admin level</p>

                    <div className="space-y-5">
                        {/* Level 2 Content */}
                        {currentLevel >= 2 && (
                            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-200 transition-all">
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-200">
                                        <span className="text-xl font-bold text-white">2</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">Verified Partner</h3>
                                        <p className="text-slate-400 text-sm">Current Access Level</p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-4 relative z-10">
                                    <div className="p-4 bg-white/80 rounded-xl border border-purple-100">
                                        <div className="flex items-center gap-2 mb-2 text-green-600 font-semibold text-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Full Access
                                        </div>
                                        <p className="text-slate-500 text-xs leading-relaxed">
                                            Verified Employer/Partner status. Your posts are published instantly without requiring approval.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/80 rounded-xl border border-purple-100">
                                        <div className="flex items-center gap-2 mb-2 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Process Flow
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>Submit</span>
                                            <ChevronRight className="w-3 h-3" />
                                            <span className="text-green-600 font-bold">Published Instantly</span>
                                            <ChevronRight className="w-3 h-3" />
                                            <span>Live</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Level 1 Content */}
                        {currentLevel === 1 && (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-200 transition-all">
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200">
                                        <span className="text-xl font-bold text-white">1</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">Trusted Admin</h3>
                                        <p className="text-slate-400 text-sm">Current Access Level</p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-4 relative z-10">
                                    <div className="p-4 bg-white/80 rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2 text-blue-600 font-semibold text-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Priority Review
                                        </div>
                                        <p className="text-slate-500 text-xs leading-relaxed">
                                            Trusted status. Your posts are reviewed with priority but still require approval from a Super Admin.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Level 0 Content */}
                        {currentLevel === 0 && (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-300 transition-all">
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-200">
                                        <span className="text-xl font-bold text-white">0</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">Standard Admin</h3>
                                        <p className="text-slate-400 text-sm">Current Access Level</p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-4 relative z-10">
                                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2 text-amber-600 font-semibold text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            Approval Required
                                        </div>
                                        <p className="text-slate-500 text-xs leading-relaxed">
                                            Standard status. All posts must be approved by a Super Admin before going live.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            Process Flow
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                                            <span>Submit</span>
                                            <ChevronRight className="w-3 h-3" />
                                            <span className="text-amber-600 font-bold">Pending Approval</span>
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

            {/* Level Hierarchy Sidebar */}
            <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-5">Level Hierarchy</h3>
                    <div className="space-y-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200" />

                        {/* Level 2 */}
                        <div className={`relative flex gap-4 transition-opacity duration-300 ${currentLevel === 2 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 transition-colors ${currentLevel === 2 ? 'bg-purple-500 border-white text-white shadow-md shadow-purple-200' : 'bg-slate-200 border-white text-slate-400'
                                }`}>
                                <span className="font-bold text-sm">2</span>
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${currentLevel === 2 ? 'text-slate-800' : 'text-slate-400'}`}>Verified Partner</h4>
                                <p className="text-xs text-slate-400 mt-1">Instant publishing, full features access</p>
                            </div>
                        </div>

                        {/* Level 1 */}
                        <div className={`relative flex gap-4 transition-opacity duration-300 ${currentLevel === 1 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 transition-colors ${currentLevel === 1 ? 'bg-blue-500 border-white text-white shadow-md shadow-blue-200' : 'bg-slate-200 border-white text-slate-400'
                                }`}>
                                <span className="font-bold text-sm">1</span>
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${currentLevel === 1 ? 'text-slate-800' : 'text-slate-400'}`}>Trusted Admin</h4>
                                <p className="text-xs text-slate-400 mt-1">Priority review, proven track record</p>
                            </div>
                        </div>

                        {/* Level 0 */}
                        <div className={`relative flex gap-4 transition-opacity duration-300 ${currentLevel === 0 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 transition-colors ${currentLevel === 0 ? 'bg-slate-500 border-white text-white shadow-md shadow-slate-200' : 'bg-slate-200 border-white text-slate-400'
                                }`}>
                                <span className="font-bold text-sm">0</span>
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${currentLevel === 0 ? 'text-slate-800' : 'text-slate-400'}`}>Standard Admin</h4>
                                <p className="text-xs text-slate-400 mt-1">Standard approval process</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Create Post Modal ──────────────────────────────────────────────────────
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Create New Post</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all resize-none text-sm"
                        maxLength={500}
                    />

                    {mediaPreview && (
                        <div className="relative mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                            {mediaType === 'video' ? (
                                <video src={mediaPreview} controls className="w-full max-h-64 object-contain" />
                            ) : (
                                <img src={mediaPreview} alt="Preview" className="w-full max-h-64 object-contain" />
                            )}
                            <button
                                onClick={removeMedia}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
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
                            className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Add image"
                        >
                            <Image className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Add video"
                        >
                            <Video className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-medium text-slate-400 ml-auto">{content.length}/500</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={(!content.trim() && !mediaFile) || createPost.isPending}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200"
                    >
                        {createPost.isPending ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
}
