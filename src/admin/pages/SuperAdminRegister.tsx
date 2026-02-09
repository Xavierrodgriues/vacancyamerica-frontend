import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSuperAdminAuth } from '../lib/super-admin-auth-context';
import { Eye, EyeOff, Shield, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminRegister() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        display_name: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useSuperAdminAuth();
    const navigate = useNavigate();

    const passwordRequirements = [
        { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
        { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
        { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
        { label: 'One number', test: (p: string) => /\d/.test(p) },
        { label: 'One special character', test: (p: string) => /[@$!%*?&]/.test(p) }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { username, email, password, confirmPassword, display_name } = formData;

        if (!username || !email || !password || !confirmPassword || !display_name) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const allRequirementsMet = passwordRequirements.every(req => req.test(password));
        if (!allRequirementsMet) {
            toast.error('Password does not meet requirements');
            return;
        }

        setLoading(true);
        try {
            await register(username, email, password, display_name);
            toast.success('Registration successful!');
            navigate('/superadmin/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950 to-slate-950 p-4">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-amber-500/20 shadow-2xl shadow-amber-500/10 p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-amber-500/30">
                            <Shield className="w-8 h-8 text-slate-900" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                            Create Super Admin
                        </h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-amber-200/80 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm"
                                    placeholder="username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-amber-200/80 mb-1">Display Name</label>
                                <input
                                    type="text"
                                    name="display_name"
                                    value={formData.display_name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-amber-200/80 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-slate-800/50 border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm"
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-amber-200/80 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all pr-10 text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password requirements */}
                            {formData.password && (
                                <div className="mt-2 space-y-1">
                                    {passwordRequirements.map((req, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            {req.test(formData.password) ? (
                                                <Check size={12} className="text-emerald-400" />
                                            ) : (
                                                <X size={12} className="text-red-400" />
                                            )}
                                            <span className={req.test(formData.password) ? 'text-emerald-400' : 'text-slate-500'}>
                                                {req.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-amber-200/80 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-slate-800/50 border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm"
                                placeholder="••••••••"
                            />
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30 mt-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-slate-400 text-sm">
                            Already have an account?{' '}
                            <Link to="/superadmin/login" className="text-amber-400 hover:text-amber-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
