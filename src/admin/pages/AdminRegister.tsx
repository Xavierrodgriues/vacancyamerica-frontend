import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Check, X, Clock } from 'lucide-react';

/* ─── Inline SVG Icons ─── */
const CheckShield = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const ArrowRight = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

export default function AdminRegister() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        display_name: '',
        phone_number: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);

    // Sanitize text input — strip HTML tags and dangerous chars
    const sanitize = (str: string) => str.trim().replace(/<[^>]*>/g, '').replace(/[<>"'`;()]/g, '');

    // Phone: allow only digits, max 15
    const handlePhoneChange = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 15);
        setFormData(prev => ({ ...prev, phone_number: digits }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const passwordRules = [
        { label: 'At least 8 characters', valid: formData.password.length >= 8 },
        { label: 'Uppercase letter', valid: /[A-Z]/.test(formData.password) },
        { label: 'Lowercase letter', valid: /[a-z]/.test(formData.password) },
        { label: 'Number', valid: /\d/.test(formData.password) },
        { label: 'Special character', valid: /[@$!%*?&]/.test(formData.password) }
    ];

    const isPasswordValid = passwordRules.every(rule => rule.valid);
    const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || !formData.email || !formData.password || !formData.display_name) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!isPasswordValid) {
            toast.error('Password does not meet requirements');
            return;
        }

        if (!doPasswordsMatch) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.phone_number && formData.phone_number.length < 10) {
            toast.error('Phone number must be at least 10 digits');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('https://vacancyamerica-backend.onrender.com/api/admin/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: sanitize(formData.username),
                    email: sanitize(formData.email),
                    password: formData.password,
                    display_name: sanitize(formData.display_name),
                    phone_number: formData.phone_number || undefined
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            toast.success('Registration submitted!');
            setRegistrationComplete(true);
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Success State ───
    if (registrationComplete) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans antialiased">
                <div
                    className="absolute inset-0 -z-10 opacity-[0.03]"
                    style={{
                        backgroundImage: "radial-gradient(circle, #102A43 1px, transparent 1px)",
                        backgroundSize: "24px 24px"
                    }}
                />
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] p-10 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-50 mb-6 border border-amber-100">
                            <Clock className="w-10 h-10 text-amber-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#102A43] mb-3">Registration Submitted!</h1>
                        <p className="text-[#64748B] mb-6 text-sm leading-relaxed">
                            Your admin account is pending approval. A super admin will review your request shortly.
                        </p>
                        <div className="bg-[#FAFAFA] rounded-xl p-4 mb-6 border border-[#E5E7EB]">
                            <p className="text-sm text-[#64748B]">
                                You'll be able to login once your account is approved.
                            </p>
                        </div>
                        <Link
                            to="/admin/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E63946] text-white font-semibold rounded-xl transition-all hover:bg-[#d32f3f] hover:scale-[1.02] active:scale-[0.98] text-sm shadow-lg shadow-[#E63946]/20"
                        >
                            Go to Login
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const steps = [
        { num: "1", title: "Register", desc: "Fill out your details below" },
        { num: "2", title: "Get Verified", desc: "Super admin reviews your request" },
        { num: "3", title: "Start Posting", desc: "Manage listings & hire talent" }
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 lg:p-8 font-sans antialiased">
            <div
                className="absolute inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: "radial-gradient(circle, #102A43 1px, transparent 1px)",
                    backgroundSize: "24px 24px"
                }}
            />

            <div className="bg-white rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:flex-row max-w-[1100px] w-full min-h-[700px] border border-[#E5E7EB]">

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

                {/* ─── Left Panel — Admin Registration Content ─── */}
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
                            Company Admin
                        </div>
                        <h1 className="text-3xl font-bold leading-tight mb-3 tracking-tight">
                            Join as a<br /><span className="text-[#E63946]">Company Admin</span>
                        </h1>
                        <p className="text-gray-400 text-[15px] leading-relaxed max-w-xs mb-8">
                            Register your company on VacancyAmerica to post verified job listings and reach real talent across the United States — completely free.
                        </p>

                        {/* Steps */}
                        <div className="space-y-5">
                            {steps.map((s) => (
                                <div key={s.num} className="flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-full bg-white text-[#102A43] font-bold text-sm flex items-center justify-center flex-shrink-0">
                                        {s.num}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold mb-0.5">{s.title}</h4>
                                        <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">$0 to Post</span>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">Verified Listings</span>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">Nationwide Reach</span>
                    </div>
                </div>

                {/* ─── Right Panel — Registration Form ─── */}
                <div className="w-full lg:w-[55%] p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-white relative">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <img src="/logo1.png" alt="VacancyAmerica" className="h-10 w-auto" />
                    </div>

                    <div className="max-w-[420px] w-full mx-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-[#102A43] mb-2 tracking-tight">Create Admin Account</h2>
                            <p className="text-[#64748B] text-sm font-medium">Requires super admin approval</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-[#102A43] font-semibold text-xs uppercase ml-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#102A43]/10 focus:border-[#102A43] transition-all font-medium text-sm"
                                        placeholder="admin_user"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[#102A43] font-semibold text-xs uppercase ml-1">Display Name</label>
                                    <input
                                        type="text"
                                        name="display_name"
                                        value={formData.display_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#102A43]/10 focus:border-[#102A43] transition-all font-medium text-sm"
                                        placeholder="John Admin"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[#102A43] font-semibold text-xs uppercase ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#102A43]/10 focus:border-[#102A43] transition-all font-medium text-sm"
                                    placeholder="admin@company.com"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[#102A43] font-semibold text-xs uppercase ml-1">
                                    Phone Number <span className="text-[#94A3B8] font-normal normal-case">(optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#102A43]/10 focus:border-[#102A43] transition-all font-medium text-sm"
                                    placeholder="1234567890"
                                    disabled={isLoading}
                                    maxLength={15}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                />
                                {formData.phone_number && formData.phone_number.length < 10 && (
                                    <p className="text-xs text-amber-600 ml-1">Must be at least 10 digits</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[#102A43] font-semibold text-xs uppercase ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#102A43]/10 focus:border-[#102A43] transition-all pr-12 font-medium text-sm"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#102A43] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Password requirements */}
                                {formData.password && (
                                    <div className="mt-2 grid grid-cols-2 gap-1">
                                        {passwordRules.map((rule, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 text-xs">
                                                {rule.valid ? (
                                                    <Check className="w-3 h-3 text-emerald-500" />
                                                ) : (
                                                    <X className="w-3 h-3 text-[#94A3B8]" />
                                                )}
                                                <span className={rule.valid ? 'text-emerald-600' : 'text-[#94A3B8]'}>
                                                    {rule.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[#102A43] font-semibold text-xs uppercase ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border text-[#102A43] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#102A43]/10 focus:border-[#102A43] transition-all font-medium text-sm ${formData.confirmPassword
                                        ? doPasswordsMatch
                                            ? 'border-emerald-400'
                                            : 'border-red-300'
                                        : 'border-[#E5E7EB]'
                                        }`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                                className="w-full py-3 px-4 rounded-xl bg-[#E63946] hover:bg-[#d32f3f] text-white font-semibold text-sm shadow-lg shadow-[#E63946]/20 hover:shadow-[#E63946]/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    'Submit for Approval'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-[#64748B] text-sm">
                                Already have an account?{' '}
                                <Link
                                    to="/admin/login"
                                    className="text-[#E63946] hover:text-[#d32f3f] font-semibold transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-[#E5E7EB] text-center">
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
