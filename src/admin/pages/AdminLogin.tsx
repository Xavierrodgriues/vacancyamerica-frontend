import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../lib/admin-auth-context';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, Eye, EyeOff, Clock, XCircle } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'pending' | 'rejected' | null; message: string }>({ type: null, message: '' });
    const { login, admin } = useAdminAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    if (admin) {
        navigate('/admin/dashboard');
        return null;
    }

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
            // Check for pending/rejected status
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NCAwLTE4IDguMDYtMTggMThzOC4wNiAxOCAxOCAxOCAxOC04LjA2IDE4LTE4LTguMDYtMTgtMTgtMTh6bTAgMzJjLTcuNzMyIDAtMTQtNi4yNjgtMTQtMTRzNi4yNjgtMTQgMTQtMTQgMTQgNi4yNjggMTQgMTQtNi4yNjggMTQtMTQgMTR6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wMyIvPjwvZz48L3N2Zz4=')] opacity-40"></div>

            <div className="relative w-full max-w-md">
                {/* Glassmorphism card */}
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 mb-4">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
                        <p className="text-gray-400 text-sm">Sign in to manage your platform</p>
                    </div>

                    {/* Status Messages */}
                    {statusMessage.type && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${statusMessage.type === 'pending'
                                ? 'bg-amber-500/10 border border-amber-500/20'
                                : 'bg-red-500/10 border border-red-500/20'
                            }`}>
                            {statusMessage.type === 'pending' ? (
                                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <p className={`text-sm ${statusMessage.type === 'pending' ? 'text-amber-200' : 'text-red-200'}`}>
                                {statusMessage.message}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="admin@example.com"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link
                                to="/admin/register"
                                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                            >
                                Register here
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-2">
                        <Link
                            to="/superadmin/login"
                            className="block text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                        >
                            Super Admin Login →
                        </Link>
                        <Link
                            to="/auth"
                            className="block text-gray-500 hover:text-gray-400 text-sm transition-colors"
                        >
                            ← Back to User Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
