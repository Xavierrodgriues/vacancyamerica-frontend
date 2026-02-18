import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";

/* ─── Icons (inline SVGs for zero dependencies) ─── */

const CheckShield = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
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

const Ban = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);

const Briefcase = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const Search = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const FileCheck = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 15 2 2 4-4" />
    </svg>
);

const UserCheck = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
    </svg>
);

const Eye = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const Globe = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const Menu = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const X = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ArrowRight = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

const Zap = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const Target = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const Building = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <line x1="8" y1="6" x2="10" y2="6" />
        <line x1="14" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="10" y2="10" />
        <line x1="14" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="10" y2="14" />
        <line x1="14" y1="14" x2="16" y2="14" />
    </svg>
);

const Award = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
);

const Clock = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

/* ─── Intersection Observer hook ─── */

function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("visible");
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return ref;
}

/* ─── Section wrapper with scroll reveal ─── */

function RevealSection({
    children,
    className = "",
    id,
}: {
    children: React.ReactNode;
    className?: string;
    id?: string;
}) {
    const ref = useScrollReveal();
    return (
        <div ref={ref} id={id} className={`landing-fade-in ${className}`}>
            {children}
        </div>
    );
}

/* ════════════════════════════════════════════════════
   LANDING PAGE
   ════════════════════════════════════════════════════ */

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const navLinks = [
        { label: "Verified Jobs", href: "#hero" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Mission", href: "#mission" },
        { label: "Articles & News", href: "#trust" },
        { label: "For Companies", href: "#for-companies" },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#102A43] font-sans antialiased overflow-x-hidden">
            {/* ─── NAVBAR ─── */}
            <nav
                className={`landing-navbar fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/80 ${scrolled ? "scrolled" : ""
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <a href="#hero" className="flex items-center group">
                            <img
                                src="/logo1.png"
                                alt="VacancyAmerica"
                                className="h-12 lg:h-14 w-auto"
                            />
                        </a>

                        {/* Desktop Nav Links */}
                        <div className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="landing-nav-link text-sm font-medium text-[#64748B] hover:text-[#102A43]"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* Auth Actions */}
                        <div className="hidden lg:flex items-center gap-4">
                            <button
                                onClick={() => navigate("/auth")}
                                className="text-sm font-medium text-[#64748B] hover:text-[#102A43] transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate("/auth")}
                                className="text-sm font-medium text-[#102A43] hover:text-[#102A43] transition-colors"
                            >
                                Sign Up
                            </button>
                            <button
                                onClick={() => navigate("/auth")}
                                className="landing-btn-primary bg-[#E63946] text-white text-sm font-medium px-5 py-2.5 rounded-full"
                            >
                                Post a Job
                            </button>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="lg:hidden p-2 -mr-2"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={`landing-mobile-menu lg:hidden ${mobileOpen ? "open" : ""
                            }`}
                    >
                        <div className="pb-4 pt-2 space-y-1 border-t border-[#E5E7EB]">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-3 py-2.5 text-sm font-medium text-[#64748B] hover:text-[#102A43] hover:bg-white rounded-lg transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="flex flex-col gap-2 pt-3 px-3">
                                <button
                                    onClick={() => navigate("/auth")}
                                    className="text-sm font-medium text-[#102A43] py-2"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate("/auth")}
                                    className="landing-btn-primary bg-[#E63946] text-white text-sm font-medium px-5 py-2.5 rounded-full text-center"
                                >
                                    Post a Job
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ─── HERO ─── */}
            <section
                id="hero"
                className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-6 lg:px-8"
            >
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="landing-hero-animate inline-flex items-center gap-2 bg-[#102A43]/10 text-[#102A43] text-xs font-medium tracking-wide uppercase px-4 py-1.5 rounded-full mb-8">
                        <CheckShield className="w-3.5 h-3.5" />
                        USA-Only Verified Platform
                    </div>

                    <h1 className="landing-hero-animate text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                        Real Jobs. Always Free.
                        <br />
                        <span className="text-[#64748B]">Zero Fake Listings.</span>
                    </h1>

                    <p className="landing-hero-animate-delay text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto leading-relaxed mb-10">
                        VacancyAmerica is a completely free platform — no charges for job seekers,
                        no charges for companies. Every listing is verified by our team, so you
                        only see real opportunities from real employers across the United States.
                    </p>

                    <div className="landing-hero-animate-delay-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate("/auth")}
                            className="landing-btn-primary bg-[#E63946] text-white font-medium px-8 py-3.5 rounded-full text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                            Explore Verified Jobs
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigate("/auth")}
                            className="landing-btn-secondary bg-white text-[#102A43] font-medium px-8 py-3.5 rounded-full text-sm border border-[#E5E7EB] w-full sm:w-auto"
                        >
                            Company Hiring Portal
                        </button>
                    </div>
                </div>

                {/* Subtle grid background */}
                <div
                    className="absolute inset-0 -z-10 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #102A43 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />
            </section>

            {/* ─── STATS BAR ─── */}
            <RevealSection className="border-y border-[#E5E7EB] py-12 px-6 lg:px-8">
                <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {[
                        { value: "100%", label: "Verified Jobs" },
                        { value: "0", label: "Fake Listings" },
                        { value: "$0", label: "Always Free" },
                        { value: "USA Citizens", label: "Only" },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div className="text-3xl lg:text-4xl font-bold tracking-tight">
                                {stat.value}
                            </div>
                            <div className="text-sm text-[#64748B] mt-1 font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </RevealSection>

            {/* ─── FOR COMPANIES ─── */}
            <section
                id="for-companies"
                className="py-24 lg:py-32 px-6 lg:px-8"
            >
                <RevealSection className="max-w-4xl mx-auto text-center mb-16">
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#64748B] mb-4">
                        For Companies &amp; Hiring Teams
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                        Post where applicants
                        <br />
                        <span className="text-[#64748B]">actually trust the listing.</span>
                    </h2>
                    <p className="text-[#64748B] text-lg max-w-2xl mx-auto leading-relaxed">
                        On other platforms, job seekers scroll past hundreds of ghost jobs and scams.
                        They get exhausted. They stop applying. On VacancyAmerica, every listing is verified —
                        so when someone sees your job, they apply with confidence because they know it's real.
                    </p>
                </RevealSection>

                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
                    {[
                        {
                            icon: <Target className="w-6 h-6" />,
                            title: "Higher Quality Applications",
                            desc: "Job seekers on our platform are engaged, not exhausted. Because there are no fake listings here, applicants don't waste energy on ghost jobs — they save it for real ones like yours.",
                        },
                        {
                            icon: <Award className="w-6 h-6" />,
                            title: "Verified Employer Badge",
                            desc: "Your company earns a trust badge after SuperAdmin verification. Candidates are far more likely to apply to verified employers — it signals legitimacy and professionalism.",
                        },
                        {
                            icon: <Briefcase className="w-6 h-6" />,
                            title: "$0 to Post — Forever",
                            desc: "No pay-per-click, no subscriptions, no premium tiers. Post unlimited jobs without spending a dollar. Your competitors are paying $300+ per listing elsewhere.",
                        },
                        {
                            icon: <Users className="w-6 h-6" />,
                            title: "Applicants Who Actually Read Your Job",
                            desc: "On platforms full of fake postings, applicants mass-apply without reading. Here, they engage carefully because every listing is genuine — meaning better-fit candidates for you.",
                        },
                        {
                            icon: <Ban className="w-6 h-6" />,
                            title: "No Competition from Fake Listings",
                            desc: "Your real job opening isn't buried under hundreds of ghost postings. Every listing on VacancyAmerica is verified, so your position gets the attention it deserves.",
                        },
                        {
                            icon: <Globe className="w-6 h-6" />,
                            title: "Reach Real Talent Across 50 States",
                            desc: "Whether you're hiring in New York or Montana, your verified listing reaches motivated job seekers nationwide. No geographic restrictions, no extra fees for wider reach.",
                        },
                    ].map((item) => (
                        <RevealSection key={item.title}>
                            <div className="landing-card bg-white rounded-2xl p-8 h-full border border-[#E5E7EB]">
                                <div className="w-12 h-12 bg-[#102A43] text-white rounded-xl flex items-center justify-center mb-5">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                                <p className="text-[#64748B] text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        </RevealSection>
                    ))}
                </div>

                {/* More advantages */}
                <RevealSection className="max-w-4xl mx-auto mb-16">
                    <div className="bg-white rounded-2xl p-10 lg:p-14 border border-[#E5E7EB]">
                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">
                            What you get that other platforms don't
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                {
                                    icon: <CheckShield className="w-5 h-5" />,
                                    title: "Applicants who trust your listing",
                                    desc: "Because we remove fake jobs, candidates don't second-guess whether your post is real.",
                                },
                                {
                                    icon: <Zap className="w-5 h-5" />,
                                    title: "Faster time to hire",
                                    desc: "Engaged applicants + no noise from ghost jobs = you fill positions faster with less effort.",
                                },
                                {
                                    icon: <Eye className="w-5 h-5" />,
                                    title: "Full visibility — no pay-to-rank",
                                    desc: "Your listing won't be hidden behind a paywall. Every verified job gets equal visibility.",
                                },
                                {
                                    icon: <Clock className="w-5 h-5" />,
                                    title: "Quick review turnaround",
                                    desc: "Submit your listing, our SuperAdmin verifies it promptly, and you're live — no week-long waits.",
                                },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-[#102A43] text-white rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">{item.title}</h4>
                                        <p className="text-[#64748B] text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </RevealSection>

                {/* Comparison */}
                <RevealSection className="max-w-4xl mx-auto mb-16">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Traditional */}
                        <div className="landing-card bg-white rounded-2xl p-8 border border-[#E5E7EB]">
                            <div className="text-xs font-semibold tracking-widest uppercase text-[#64748B] mb-6">
                                Other Job Boards
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "$300–$500+ per job listing",
                                    "Applicants tired from applying to ghost jobs",
                                    "No verification — scams mixed with real posts",
                                    "Mass applications from unqualified candidates",
                                    "Your listing buried under sponsored posts",
                                    "Candidates distrust postings — lower apply rates",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm text-[#64748B]">
                                        <span className="w-5 h-5 rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="block w-1.5 h-1.5 rounded-full bg-[#64748B]" />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* VacancyAmerica */}
                        <div className="landing-card bg-[#102A43] text-white rounded-2xl p-8 border-2 border-[#102A43]">
                            <div className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-6">
                                VacancyAmerica
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "$0 per listing — free forever",
                                    "Applicants who are engaged and ready to apply",
                                    "Every listing manually verified by SuperAdmin",
                                    "Serious candidates who read your actual job post",
                                    "Equal visibility — no pay-to-rank system",
                                    "Verified badge builds instant trust with applicants",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckShield className="w-3 h-3 text-white" />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </RevealSection>

                {/* Company CTA */}
                <RevealSection className="max-w-4xl mx-auto">
                    <div className="bg-[#102A43] text-white rounded-3xl p-10 lg:p-14">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                                Start hiring in three steps
                            </h3>
                            <p className="text-gray-300 text-sm max-w-lg mx-auto">
                                No credit card. No sales calls. No contracts. Just post your real job and reach real people.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    step: "1",
                                    title: "Create Your Account",
                                    desc: "Sign up for free. Just your company name and email — you're in under 60 seconds.",
                                },
                                {
                                    step: "2",
                                    title: "Submit Your Job Listing",
                                    desc: "Fill out the essentials — title, description, location, salary. Our form is simple and fast.",
                                },
                                {
                                    step: "3",
                                    title: "Get Verified & Go Live",
                                    desc: "Our SuperAdmin verifies your post. Once approved, candidates across America can see and apply.",
                                },
                            ].map((item) => (
                                <div key={item.step} className="text-center">
                                    <div className="w-10 h-10 rounded-full bg-white text-[#102A43] font-bold text-lg flex items-center justify-center mx-auto mb-4">
                                        {item.step}
                                    </div>
                                    <h4 className="font-semibold mb-2">{item.title}</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-10">
                            <button
                                onClick={() => navigate("/auth")}
                                className="landing-btn-primary bg-[#E63946] text-white font-medium px-8 py-3.5 rounded-full text-sm inline-flex items-center gap-2"
                            >
                                Post Your First Job — Free
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </RevealSection>
            </section>

            {/* ─── MISSION ─── */}
            <section id="mission" className="py-24 lg:py-32 px-6 lg:px-8">
                <RevealSection className="max-w-4xl mx-auto text-center mb-16">
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#64748B] mb-4">
                        Our Mission
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-6">
                        To make job searching in America
                        <br />
                        <span className="text-[#64748B]">
                            transparent, trustworthy, and scam-free.
                        </span>
                    </h2>
                </RevealSection>

                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <CheckShield className="w-6 h-6" />,
                            title: "Verified Opportunities",
                            desc: "Every job post is manually reviewed by our SuperAdmin team before going live. No exceptions.",
                        },
                        {
                            icon: <Users className="w-6 h-6" />,
                            title: "Community-First Hiring",
                            desc: "Built for people, not profit. We connect real companies with real talent across the United States.",
                        },
                        {
                            icon: <Ban className="w-6 h-6" />,
                            title: "Eliminating Fake Listings",
                            desc: "No ghost jobs. No scams. No misleading posts. If it's on VacancyAmerica, it's real.",
                        },
                    ].map((item, i) => (
                        <RevealSection key={item.title}>
                            <div
                                className={`landing-card bg-white rounded-2xl p-8 h-full border border-[#E5E7EB] stagger-${i + 1
                                    }`}
                            >
                                <div className="w-12 h-12 bg-[#102A43] text-white rounded-xl flex items-center justify-center mb-5">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                                <p className="text-[#64748B] text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ─── VISION ─── */}
            <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#102A43] text-white">
                <RevealSection className="max-w-4xl mx-auto text-center">
                    <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">
                        Our Vision
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-8">
                        A future where job seekers never waste time on ghost jobs
                        <span className="text-gray-300">
                            {" "}
                            and companies connect with real talent instantly.
                        </span>
                    </h2>

                    <div className="flex items-center justify-center gap-12 mt-12">
                        <div className="landing-float flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                <Eye className="w-6 h-6 text-white/80" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                                Transparency
                            </span>
                        </div>
                        <div className="landing-float-delay-1 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                <CheckShield className="w-6 h-6 text-white/80" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Trust</span>
                        </div>
                        <div className="landing-float-delay-2 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                <Globe className="w-6 h-6 text-white/80" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                                Accessibility
                            </span>
                        </div>
                    </div>
                </RevealSection>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section
                id="how-it-works"
                className="py-24 lg:py-32 px-6 lg:px-8"
            >
                <RevealSection className="max-w-4xl mx-auto text-center mb-16">
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#64748B] mb-4">
                        How It Works
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                        Three simple steps.
                        <br />
                        <span className="text-[#64748B]">Real results.</span>
                    </h2>
                </RevealSection>

                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                    {[
                        {
                            step: "01",
                            icon: <Briefcase className="w-6 h-6" />,
                            title: "Companies Submit",
                            desc: "Companies submit their real job openings through our simple hiring portal — completely free.",
                        },
                        {
                            step: "02",
                            icon: <FileCheck className="w-6 h-6" />,
                            title: "SuperAdmin Verifies",
                            desc: "Our team manually reviews every posting for authenticity. No automated approvals, no shortcuts.",
                        },
                        {
                            step: "03",
                            icon: <UserCheck className="w-6 h-6" />,
                            title: "Users Apply with Confidence",
                            desc: "Job seekers browse and apply to verified opportunities, knowing every listing is legitimate.",
                        },
                    ].map((item) => (
                        <RevealSection key={item.step}>
                            <div className="landing-card bg-white border border-[#E5E7EB] rounded-2xl p-8 h-full relative overflow-hidden group">
                                {/* Step number watermark */}
                                <span className="absolute top-4 right-6 text-6xl font-bold text-[#E5E7EB] group-hover:text-[#E5E7EB]/60 transition-colors select-none">
                                    {item.step}
                                </span>

                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-[#102A43] text-white rounded-xl flex items-center justify-center mb-5">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                                    <p className="text-[#64748B] text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ─── TRUST & SAFETY ─── */}
            <section id="trust" className="py-24 lg:py-32 px-6 lg:px-8 bg-white">
                <RevealSection className="max-w-4xl mx-auto text-center mb-16">
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#64748B] mb-4">
                        Trust &amp; Safety
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                        Every job is reviewed.
                        <br />
                        <span className="text-[#64748B]">Every opportunity is real.</span>
                    </h2>
                </RevealSection>

                <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
                    {[
                        {
                            icon: <Search className="w-5 h-5" />,
                            title: "Manual Verification",
                            desc: "Each posting is reviewed by real humans, not algorithms.",
                        },
                        {
                            icon: <Ban className="w-5 h-5" />,
                            title: "No Fake Employers",
                            desc: "We verify company identity before any listing goes live.",
                        },
                        {
                            icon: <CheckShield className="w-5 h-5" />,
                            title: "No Misleading Posts",
                            desc: "Accurate job descriptions, real salaries, genuine positions.",
                        },
                        {
                            icon: <Briefcase className="w-5 h-5" />,
                            title: "Real Hiring Only",
                            desc: "Every company on our platform is actively hiring right now.",
                        },
                    ].map((item) => (
                        <RevealSection key={item.title}>
                            <div className="landing-card bg-[#FAFAFA] rounded-2xl p-6 flex items-start gap-4 border border-[#E5E7EB] h-full">
                                <div className="w-10 h-10 bg-[#102A43] text-white rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">{item.title}</h3>
                                    <p className="text-[#64748B] text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ─── FREE PLATFORM ─── */}
            <section
                id="free"
                className="py-24 lg:py-32 px-6 lg:px-8"
            >
                <RevealSection className="max-w-4xl mx-auto text-center">
                    <p className="text-xs font-semibold tracking-widest uppercase text-[#64748B] mb-4">
                        Pricing
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                        Completely free.
                        <br />
                        <span className="text-[#64748B]">For everyone. Forever.</span>
                    </h2>
                    <p className="text-[#64748B] text-lg max-w-xl mx-auto mb-12">
                        No charges for job seekers. No charges for companies. No
                        subscriptions. No hidden fees. No paid promotions. Built purely
                        for trust and transparency.
                    </p>

                    {/* $0 Card */}
                    <div className="landing-price-card inline-block bg-white border-2 border-[#102A43] rounded-3xl px-12 py-10 text-center">
                        <div className="text-6xl lg:text-7xl font-bold tracking-tighter mb-2">
                            $0
                        </div>
                        <div className="text-sm font-medium text-[#64748B] uppercase tracking-widest">
                            Forever
                        </div>
                        <div className="w-12 h-px bg-[#E5E7EB] mx-auto my-6" />
                        <ul className="space-y-3 text-sm text-[#64748B]">
                            <li className="flex items-center gap-2 justify-center">
                                <CheckShield className="w-4 h-4 text-[#102A43]" />
                                Free for job seekers
                            </li>
                            <li className="flex items-center gap-2 justify-center">
                                <CheckShield className="w-4 h-4 text-[#102A43]" />
                                Free for companies
                            </li>
                            <li className="flex items-center gap-2 justify-center">
                                <CheckShield className="w-4 h-4 text-[#102A43]" />
                                No subscriptions ever
                            </li>
                            <li className="flex items-center gap-2 justify-center">
                                <CheckShield className="w-4 h-4 text-[#102A43]" />
                                No hidden charges
                            </li>
                        </ul>

                        <button
                            onClick={() => navigate("/auth")}
                            className="landing-btn-primary bg-[#E63946] text-white text-sm font-medium px-8 py-3 rounded-full mt-8 w-full"
                        >
                            Get Started — It's Free
                        </button>
                    </div>
                </RevealSection>
            </section>

            {/* ─── CTA BAND ─── */}
            <section className="py-20 lg:py-24 px-6 lg:px-8 bg-[#102A43] text-white">
                <RevealSection className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                        Ready to find your next opportunity?
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                        Join thousands of Americans who trust VacancyAmerica for real,
                        verified job opportunities.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate("/auth")}
                            className="landing-btn-primary bg-[#E63946] text-white font-medium px-8 py-3.5 rounded-full text-sm flex items-center gap-2"
                        >
                            Explore Verified Jobs
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigate("/auth")}
                            className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-6 py-3.5"
                        >
                            Company Hiring Portal →
                        </button>
                    </div>
                </RevealSection>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="py-16 px-6 lg:px-8 border-t border-[#E5E7EB]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="col-span-2 md:col-span-1">
                            <a href="#hero" className="flex items-center mb-4">
                                <img
                                    src="/logo1.png"
                                    alt="VacancyAmerica"
                                    className="h-12 lg:h-14 w-auto"
                                />
                            </a>
                            <p className="text-sm text-[#64748B] leading-relaxed">
                                Verified job opportunities across the United States.
                            </p>
                        </div>

                        {/* Platform */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-4">
                                Platform
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="#hero"
                                        className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors"
                                    >
                                        Verified Jobs
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#how-it-works"
                                        className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors"
                                    >
                                        How It Works
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#free"
                                        className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors"
                                    >
                                        For Companies
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-4">
                                Company
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="#mission"
                                        className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#mission"
                                        className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors"
                                    >
                                        Mission
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#trust"
                                        className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors"
                                    >
                                        Trust & Safety
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-4">
                                Legal
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors"
                                    >
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors"
                                    >
                                        Terms of Service
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#E5E7EB] gap-4">
                        <p className="text-xs text-[#64748B]">
                            © {new Date().getFullYear()} VacancyAmerica. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate("/auth")}
                                className="text-xs text-[#64748B] hover:text-[#102A43] transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate("/auth")}
                                className="text-xs text-[#64748B] hover:text-[#102A43] transition-colors"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
