import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../lib/admin-auth-context';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Clock, XCircle } from 'lucide-react';

/* ─── Inline SVG Icons ─── */
const CheckShield = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const BarChart = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
);

const FileText = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const UsersIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'pending' | 'rejected' | null; message: string }>({ type: null, message: '' });
    const { login, admin } = useAdminAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (admin) {
            navigate('/admin/dashboard');
        }
    }, [admin, navigate]);

    if (admin) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage({ type: null, message: '' });

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back, Admin!');
            navigate('/admin/dashboard');
        } catch (error: any) {
            if (error.message?.includes('pending')) {
                setStatusMessage({
                    type: 'pending',
                    message: 'Your account is awaiting super admin approval. Please check back later.'
                });
            } else if (error.message?.includes('rejected')) {
                setStatusMessage({
                    type: 'rejected',
                    message: error.message
                });
            } else {
                toast.error(error.message || 'Login failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: <FileText className="w-5 h-5" />,
            title: "Post & Manage Listings",
            desc: "Create and manage verified job listings visible to all users."
        },
        {
            icon: <BarChart className="w-5 h-5" />,
            title: "Analytics Dashboard",
            desc: "Track applicant engagement and listing performance."
        },
        {
            icon: <UsersIcon className="w-5 h-5" />,
            title: "Applicant Management",
            desc: "Review and connect with qualified candidates."
        },
        {
            icon: <CheckShield className="w-5 h-5" />,
            title: "Verified Employer Badge",
            desc: "Build trust with a verified company profile."
        }
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 lg:p-8 font-sans antialiased">
            {/* Subtle dot grid background */}
            <div
                className="absolute inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: "radial-gradient(circle, #102A43 1px, transparent 1px)",
                    backgroundSize: "24px 24px"
                }}
            />

            <div className="bg-white rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:flex-row max-w-[1100px] w-full min-h-[640px] border border-[#E5E7EB]">

                {/* Back to home */}
                <Link
                    to="/"
                    className="absolute top-5 right-5 md:top-7 md:right-7 z-20 inline-flex items-center gap-2 bg-white text-[#102A43] text-sm font-semibold px-4 py-2 rounded-full border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#102A43]/30 transition-all group"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Home
                </Link>

                {/* ─── Left Panel — Admin Content ─── */}
                <div className="hidden lg:flex w-[45%] bg-[#102A43] relative flex-col justify-between p-10 overflow-hidden text-white">
                    <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-[#E63946] rounded-full blur-[120px] opacity-20" />
                    <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 bg-white rounded-full blur-[100px] opacity-[0.06]" />

                    {/* Logo */}
                    <div className="relative z-10">
                        <img src="/logo1.png" alt="VacancyAmerica" className="h-14 w-auto" />
                    </div>

                    {/* Main content */}
                    <div className="relative z-10 -mt-4">
                        <div className="inline-flex items-center gap-2 bg-[#E63946]/20 text-[#E63946] text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4 border border-[#E63946]/20">
                            <CheckShield className="w-3.5 h-3.5" />
                            Admin Portal
                        </div>
                        <h1 className="text-3xl font-bold leading-tight mb-3 tracking-tight">
                            Manage your<br /><span className="text-[#E63946]">hiring platform</span>
                        </h1>
                        <p className="text-gray-400 text-[15px] leading-relaxed max-w-xs mb-8">
                            Access your dashboard to post jobs, review applications, and manage your company's presence on VacancyAmerica.
                        </p>

                        <div className="space-y-4">
                            {features.map((f) => (
                                <div key={f.title} className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {f.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-0.5">{f.title}</h4>
                                        <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">Free</span>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">Verified Platform</span>
                    </div>
                </div>

                {/* ─── Right Panel — Login Form ─── */}
                <div className="w-full lg:w-[55%] p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-white relative">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <img src="/logo1.png" alt="VacancyAmerica" className="h-10 w-auto" />
                    </div>

                    <div className="max-w-[420px] w-full mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-[#102A43] mb-2 tracking-tight">Admin Sign In</h2>
                            <p className="text-[#64748B] text-sm font-medium">Sign in to manage your platform</p>
                        </div>

                        {/* Status Messages */}
                        {statusMessage.type && (
                            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${statusMessage.type === 'pending'
                                ? 'bg-amber-50 border border-amber-200'
                                : 'bg-red-50 border border-red-200'
                                }`}>
                                {statusMessage.type === 'pending' ? (
                                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                )}
                                <p className={`text-sm ${statusMessage.type === 'pending' ? 'text-amber-800' : 'text-red-700'}`}>
                                    {statusMessage.message}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-[#102A43] font-semibold text-xs uppercase ml-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#102A43]/10 focus:border-[#102A43] transition-all font-medium"
                                    placeholder="admin@company.com"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[#102A43] font-semibold text-xs uppercase ml-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#102A43]/10 focus:border-[#102A43] transition-all pr-12 font-medium"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#102A43] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 rounded-xl bg-[#E63946] hover:bg-[#d32f3f] text-white font-semibold text-sm shadow-lg shadow-[#E63946]/20 hover:shadow-[#E63946]/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-[#64748B] text-sm">
                                Don't have an account?{' '}
                                <Link
                                    to="/admin/register"
                                    className="text-[#E63946] hover:text-[#d32f3f] font-semibold transition-colors"
                                >
                                    Register here
                                </Link>
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-center">
                            <Link
                                to="/auth"
                                className="text-[#64748B] hover:text-[#102A43] text-xs font-medium transition-colors"
                            >
                                ← Back to User Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
