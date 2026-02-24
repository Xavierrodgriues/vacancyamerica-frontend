import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

/* ─── Inline SVG Icons ─── */

const CheckShield = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const Briefcase = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const Users = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const Search = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, signup } = useAuth();

  // Sanitize text input — strip HTML tags and dangerous chars
  const sanitize = (str: string) => str.trim().replace(/<[^>]*>/g, '').replace(/[<>"'`;()]/g, '');

  // Phone: allow only digits, max 15
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 15);
    setPhoneNumber(digits);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Google login failed");

        login(data);
        toast.success("Welcome back!");
        navigate("/home");
      } catch (error: any) {
        toast.error(error.message || "Google login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed");
      setLoading(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");

        login(data);
        toast.success("Welcome back!");
        navigate("/home");
      } else {
        if (!username.trim() || !displayName.trim()) {
          toast.error("Please fill in all fields");
          setLoading(false);
          return;
        }
        if (username.length < 3) {
          toast.error("Username must be at least 3 characters");
          setLoading(false);
          return;
        }
        if (phoneNumber && phoneNumber.length < 10) {
          toast.error("Phone number must be at least 10 digits");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: sanitize(email),
            password,
            username: sanitize(username).toLowerCase(),
            display_name: sanitize(displayName),
            phone_number: phoneNumber || undefined
          })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Signup failed");

        signup(data);
        toast.success("Welcome aboard!");
        navigate("/home");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <CheckShield className="w-5 h-5" />,
      title: "100% Verified Jobs",
      desc: "Every listing is manually reviewed before going live."
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Browse Real Opportunities",
      desc: "No ghost jobs, no scams — only genuine positions."
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Connect with Employers",
      desc: "Apply directly to verified companies across America."
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      title: "Always Free",
      desc: "No charges for job seekers. Ever."
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

      {/* Back to home */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-5 right-5 md:top-7 md:right-7 z-20 inline-flex items-center gap-2 bg-[#E63946] text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:bg-[#d32f3f] transition-all group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Home
      </button>

      <div className="bg-white rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:flex-row max-w-[1100px] w-full min-h-[680px] border border-[#E5E7EB]">

        {/* ─── Left Panel — Contextual Content ─── */}
        <div className="hidden lg:flex w-[45%] bg-[#102A43] relative flex-col justify-between p-10 overflow-hidden text-white">
          {/* Decorative accents */}
          <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-[#E63946] rounded-full blur-[120px] opacity-20" />
          <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 bg-white rounded-full blur-[100px] opacity-[0.06]" />

          {/* Logo */}
          <div className="relative z-10">
            <img
              src="/logo1.png"
              alt="VacancyAmerica"
              className="h-14 w-auto cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 -mt-4">
            <h1 className="text-3xl font-bold leading-tight mb-3 tracking-tight">
              {isLogin ? (
                <>Welcome back to<br /><span className="text-[#E63946]">VacancyAmerica</span></>
              ) : (
                <>Start your journey<br />with <span className="text-[#E63946]">real jobs</span></>
              )}
            </h1>
            <p className="text-gray-400 text-[15px] leading-relaxed max-w-xs mb-8">
              {isLogin
                ? "Sign in to browse verified job listings, connect with real employers, and continue your career journey."
                : "Create your free account to access verified opportunities from real employers across the United States."
              }
            </p>

            {/* Feature list */}
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

          {/* Bottom tags */}
          <div className="relative z-10 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">✓ Verified Jobs</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">✓ Always Free</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">✓ USA Only</span>
          </div>
        </div>

        {/* ─── Right Panel — Form ─── */}
        <div className="w-full lg:w-[55%] p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-white relative">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src="/logo1.png" alt="VacancyAmerica" className="h-10 w-auto" />
          </div>

          <div className="max-w-[420px] w-full mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#102A43] mb-2 tracking-tight">
                {isLogin ? "Log in to your account" : "Create your account"}
              </h2>
              <div className="flex justify-center gap-1 text-[#64748B] text-sm font-medium">
                {isLogin ? "New here?" : "Already a member?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#E63946] hover:text-[#d32f3f] font-semibold transition-colors"
                >
                  {isLogin ? "Sign up free" : "Log in"}
                </button>
              </div>
            </div>

            {/* Google */}
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGoogleLogin()}
                className="w-full h-12 rounded-xl text-[#102A43] font-semibold text-sm flex items-center justify-center gap-3 border-2 border-[#E5E7EB] hover:border-[#102A43]/20 hover:bg-[#FAFAFA] transition-all"
                disabled={loading}
              >
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="relative flex py-3 items-center mb-6">
              <div className="flex-grow border-t border-[#E5E7EB]"></div>
              <span className="flex-shrink-0 mx-4 text-[#64748B] text-xs font-semibold uppercase tracking-widest">Or with email</span>
              <div className="flex-grow border-t border-[#E5E7EB]"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName" className="text-[#102A43] font-semibold text-xs uppercase ml-1">Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      type="text"
                      placeholder="John"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="h-11 bg-[#FAFAFA] border-[#E5E7EB] focus:bg-white focus:border-[#102A43] focus:ring-2 focus:ring-[#102A43]/10 rounded-xl transition-all text-[#102A43] font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-[#102A43] font-semibold text-xs uppercase ml-1">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="h-11 bg-[#FAFAFA] border-[#E5E7EB] focus:bg-white focus:border-[#102A43] focus:ring-2 focus:ring-[#102A43]/10 rounded-xl transition-all text-[#102A43] font-medium"
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Label htmlFor="phone" className="text-[#102A43] font-semibold text-xs uppercase ml-1">Phone Number <span className="text-[#94A3B8] font-normal normal-case">(optional)</span></Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="1234567890"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="h-11 bg-[#FAFAFA] border-[#E5E7EB] focus:bg-white focus:border-[#102A43] focus:ring-2 focus:ring-[#102A43]/10 rounded-xl transition-all text-[#102A43] font-medium"
                    maxLength={15}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  {phoneNumber && phoneNumber.length < 10 && (
                    <p className="text-xs text-amber-600 ml-1">Must be at least 10 digits</p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#102A43] font-semibold text-xs uppercase ml-1">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-[#FAFAFA] border-[#E5E7EB] focus:bg-white focus:border-[#102A43] focus:ring-2 focus:ring-[#102A43]/10 rounded-xl transition-all text-[#102A43] font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#102A43] font-semibold text-xs uppercase ml-1">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-[#FAFAFA] border-[#E5E7EB] focus:bg-white focus:border-[#102A43] focus:ring-2 focus:ring-[#102A43]/10 rounded-xl transition-all text-[#102A43] font-medium"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#E63946] hover:bg-[#d32f3f] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#E63946]/20 transition-all hover:shadow-[#E63946]/30 hover:scale-[1.01] active:scale-[0.99] mt-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? "Sign In" : "Get Started — Free")}
              </Button>
            </form>

            {/* Bottom link to admin */}
            <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-center">
              <p className="text-[#64748B] text-xs">
                Are you a company?{" "}
                <button
                  onClick={() => navigate("/admin/login")}
                  className="text-[#102A43] hover:text-[#E63946] font-semibold transition-colors"
                >
                  Admin Portal →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
