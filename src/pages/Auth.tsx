import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, signup } = useAuth();

  // Subtle parallax effect for "playfulness"
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch("https://vacancyamerica-backend.onrender.com/api/auth/google", {
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
        const res = await fetch("https://vacancyamerica-backend.onrender.com/api/auth/login", {
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

        const res = await fetch("https://vacancyamerica-backend.onrender.com/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            username: username.toLowerCase(),
            display_name: displayName
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

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Playful Background Elements */}
      <div
        className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full blur-xl opacity-60 animate-bounce delay-700 mix-blend-multiply"
        style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}
      ></div>
      <div
        className="absolute bottom-20 right-20 w-40 h-40 bg-pink-300 rounded-full blur-2xl opacity-60 animate-bounce delay-100 mix-blend-multiply"
        style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-40 -z-10"
      ></div>

      <div className="bg-white/90 backdrop-blur-2xl rounded-[48px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex max-w-[1100px] w-full min-h-[700px] animate-in fade-in zoom-in-95 duration-500 border border-white/50">

        {/* Left Panel - Vivid & Playful */}
        <div className="hidden lg:flex w-[45%] bg-[#6366F1] relative flex-col justify-between p-12 overflow-hidden text-white">
          {/* Dynamic Mesh Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-500 to-purple-500"></div>

          {/* Animated Patterns */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          <div
            className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y * -1}px)` }}
          ></div>
          <div
            className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-pink-500 rounded-full blur-3xl opacity-40 animate-pulse delay-700"
            style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y}px)` }}
          ></div>

          {/* Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                V
              </div>
              <span className="text-lg font-bold tracking-tight">VacancyAmerica</span>
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-5xl font-extrabold leading-tight mb-6 drop-shadow-sm">
              {isLogin ? "Welcome back!" : <span className="text-yellow-300">Let's get started.</span>}
            </h1>
            <p className="text-indigo-100 text-xl font-medium leading-relaxed max-w-xs">
              Your personal hub for career growth, connections, and shiny new opportunities.
            </p>

            {/* Playful Pill Tags */}
            <div className="flex flex-wrap gap-2 mt-8">
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium border border-white/20">✨ New Jobs</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium border border-white/20">🚀 Career Tips</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium border border-white/20">👋 Community</span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-sm text-indigo-200 font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live platform updates
          </div>
        </div>

        {/* Right Panel - Clean Form */}
        <div className="w-full lg:w-[55%] p-8 md:p-16 flex flex-col justify-center bg-white relative">

          <div className="max-w-[420px] w-full mx-auto relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                {isLogin ? "Log in to your account" : "Create new account"}
              </h2>
              <div className="flex justify-center gap-1 text-slate-500 font-medium">
                {isLogin ? "New here?" : "Already a member?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-2 decoration-indigo-200 hover:decoration-indigo-500 transition-all font-bold"
                >
                  {isLogin ? "Sign up free" : "Log in"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGoogleLogin()}
                className="w-full h-14 rounded-2xl text-slate-700 font-bold text-[15px] flex items-center justify-center gap-3 border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group"
                disabled={loading}
              >
                <svg className="h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="relative flex py-4 items-center mb-8">
              <div className="flex-grow border-t-2 border-slate-100 rounded-full"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Or with email</span>
              <div className="flex-grow border-t-2 border-slate-100 rounded-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName" className="text-slate-600 font-bold text-xs uppercase ml-1">Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="John"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl transition-all font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-slate-600 font-bold text-xs uppercase ml-1">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-600 font-bold text-xs uppercase ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl transition-all font-medium text-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-600 font-bold text-xs uppercase ml-1">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl transition-all font-medium text-slate-800"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (isLogin ? "Sign In" : "Get Started Now")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
