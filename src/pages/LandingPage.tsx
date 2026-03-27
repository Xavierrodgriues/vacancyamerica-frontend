import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";

/* ─── Icons ─── */
const CheckShield = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
    </svg>
);
const Users = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const Ban = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);
const Briefcase = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);
const Search = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const FileCheck = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" />
    </svg>
);
const UserCheck = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
    </svg>
);
const Eye = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const Globe = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);
const Menu = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);
const XIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const ArrowRight = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);
const Zap = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const Target = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
);
const Award = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
);
const Clock = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const Star = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
const ChevronLeft = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const ChevronRight = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

/* ─── Scroll Reveal Hook ─── */
function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); observer.unobserve(el); } },
            { threshold: 0.12 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return ref;
}

function RevealSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
    const ref = useScrollReveal();
    return <div ref={ref} id={id} className={`landing-fade-in ${className}`}>{children}</div>;
}

/* ─── Category SVG Icons ─── */
const IconBroom = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M7 14l-2 6h14l-2-6" /><path d="M4 14h16" /><path d="M12 2v12" /><path d="M9 5l3-3 3 3" /></svg>;
const IconTrash = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const IconScissors = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>;
const IconChef = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" /><line x1="6" y1="17" x2="18" y2="17" /></svg>;
const IconCar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" /><path d="M19 17h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" /><rect x="5" y="7" width="14" height="10" rx="2" /><circle cx="7.5" cy="17" r="1.5" /><circle cx="16.5" cy="17" r="1.5" /></svg>;
const IconHardHat = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" /><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" /><path d="M4 15v-3a8 8 0 0 1 16 0v3" /></svg>;
const IconShoppingCart = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>;
const IconPackage = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
const IconHeart = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
const IconZap2 = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const IconDroplet = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>;
const IconLeaf = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 8C8 10 5.9 16.17 3.82 19.41a1 1 0 0 0 1.49 1.23l.29-.37" /><path d="M21.67 22.84A14.54 14.54 0 0 0 22 12C22 6 17 2 12 2c0 6-1 10.38-4 14" /></svg>;
const IconUser2 = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconCode = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
const IconBarChart = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IconDollar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const IconBookOpen = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
const IconBed = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>;
const IconActivity = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const IconPhone = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
const IconShield2 = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const IconMonitor = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
const IconPlane = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>;
const IconPenTool = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m12 19 7-7 3 3-7 7-3-3z" /><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="m2 2 7.586 7.586" /><circle cx="11" cy="11" r="2" /></svg>;

/* ─── Job Categories data ─── */
const JOB_CATEGORIES = [
    { icon: <IconBroom />, label: "Cleaner" },
    { icon: <IconTrash />, label: "Sanitation Worker" },
    { icon: <IconScissors />, label: "Barber" },
    { icon: <IconChef />, label: "Chef / Cook" },
    { icon: <IconCar />, label: "Driver" },
    { icon: <IconHardHat />, label: "Construction Worker" },
    { icon: <IconShoppingCart />, label: "Retail Associate" },
    { icon: <IconPackage />, label: "Warehouse Staff" },
    { icon: <IconHeart />, label: "Healthcare Aide" },
    { icon: <IconZap2 />, label: "Electrician" },
    { icon: <IconDroplet />, label: "Plumber" },
    { icon: <IconLeaf />, label: "Landscaper" },
    { icon: <IconUser2 />, label: "Hair Stylist" },
    { icon: <IconCode />, label: "Software Engineer" },
    { icon: <IconBarChart />, label: "Data Analyst" },
    { icon: <IconDollar />, label: "Finance Manager" },
    { icon: <IconBookOpen />, label: "Teacher" },
    { icon: <IconBed />, label: "Hotel Staff" },
    { icon: <IconActivity />, label: "Nurse" },
    { icon: <IconPhone />, label: "Customer Support" },
    { icon: <IconShield2 />, label: "Security Guard" },
    { icon: <IconMonitor />, label: "IT Technician" },
    { icon: <IconPlane />, label: "Airline Staff" },
    { icon: <IconPenTool />, label: "Graphic Designer" },
];

/* ─── Testimonials ─── */
const TESTIMONIALS = [
    { name: "Marcus T.", role: "Truck Driver – Texas", text: "I never thought a site would list jobs for truck drivers without charging fees. Found a great gig in 3 days. VacancyAmerica is the real deal.", stars: 5 },
    { name: "Priya S.", role: "Software Engineer – California", text: "Every job I applied to actually responded. No ghost listings here — the quality is incredible compared to other platforms.", stars: 5 },
    { name: "Linda R.", role: "HR Manager – New York", text: "We filled three positions in two weeks. The applicants who found us through VacancyAmerica were engaged and fully read our job post.", stars: 5 },
    { name: "James K.", role: "Barber – Florida", text: "I was surprised to find barbershop jobs on a legit job board. Got my current position through this platform. Highly recommend!", stars: 5 },
    { name: "Sofia M.", role: "Restaurant Owner – Illinois", text: "Posted a chef and two cleaner positions. Had qualified applicants within 48 hours. Completely free — can't beat that.", stars: 5 },
    { name: "Derek P.", role: "Security Guard – Ohio", text: "Simple to apply, real jobs. The listing was accurate and the employer actually called back. First time that's happened to me online.", stars: 5 },
];

/* ════════════════════ LANDING PAGE ════════════════════ */
export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [testimonialIdx, setTestimonialIdx] = useState(0);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* auto-advance testimonials */
    useEffect(() => {
        const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
        return () => clearInterval(t);
    }, []);

    const navLinks = [
        { label: "For Job Seekers", href: "#everyone" },
        { label: "For Companies", href: "#for-companies" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Mission", href: "#mission" },
        { label: "Trust & Safety", href: "#trust" },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#102A43] font-sans antialiased overflow-x-hidden">

            {/* ─── NAVBAR ─── */}
            <nav className={`landing-navbar fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/80 ${scrolled ? "scrolled" : ""}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div onClick={() => { window.scrollTo(0, 0); navigate("/"); }} className="flex items-center cursor-pointer">
                            <img src="/VA-logo2.png" alt="VacancyAmerica" className="h-[80px] lg:h-[100px] w-auto" />
                        </div>
                        <div className="hidden lg:flex items-center gap-7">
                            {navLinks.map(link => (
                                <a key={link.label} href={link.href} className="landing-nav-link text-sm font-medium text-[#64748B] hover:text-[#102A43]">{link.label}</a>
                            ))}
                        </div>
                        <div className="hidden lg:flex items-center gap-3">
                            <button onClick={() => navigate("/auth")} className="text-sm font-medium text-[#64748B] hover:text-[#102A43] transition-colors px-3 py-2">Login</button>
                            <button onClick={() => navigate("/auth")} className="text-sm font-medium text-[#102A43] hover:text-[#102A43] transition-colors px-3 py-2">Sign Up</button>
                            <button onClick={() => navigate("/auth")} className="landing-btn-primary bg-[#E63946] text-white text-sm font-semibold px-5 py-2.5 rounded-full">Post a Job</button>
                            <button onClick={() => navigate("/contact")} className="landing-btn-secondary bg-white text-[#102A43] text-sm font-medium px-5 py-2.5 rounded-full border border-[#E5E7EB]">Contact Us</button>
                        </div>
                        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                            {mobileOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                    <div className={`landing-mobile-menu lg:hidden ${mobileOpen ? "open" : ""}`}>
                        <div className="pb-4 pt-2 space-y-1 border-t border-[#E5E7EB]">
                            {navLinks.map(link => (
                                <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-[#64748B] hover:text-[#102A43] hover:bg-white rounded-lg transition-colors">{link.label}</a>
                            ))}
                            <div className="flex flex-col gap-2 pt-3 px-3">
                                <button onClick={() => navigate("/auth")} className="text-sm font-medium text-[#102A43] py-2">Login</button>
                                <button onClick={() => navigate("/auth")} className="landing-btn-primary bg-[#E63946] text-white text-sm font-medium px-5 py-2.5 rounded-full">Post a Job</button>
                                <button onClick={() => navigate("/contact")} className="landing-btn-secondary bg-white text-[#102A43] text-sm font-medium px-5 py-2.5 rounded-full border border-[#E5E7EB]">Contact Us</button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ─── HERO ─── */}
            <section id="hero" className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 px-6 lg:px-8 overflow-hidden">
                {/* Background accent blobs */}
                <div className="absolute top-24 -left-32 w-96 h-96 bg-[#E63946]/6 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 -right-24 w-80 h-80 bg-[#102A43]/6 rounded-full blur-3xl pointer-events-none" />
                {/* dot grid */}
                <div className="absolute inset-0 -z-10 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle, #102A43 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

                <div className="max-w-4xl mx-auto text-center">
                    <div className="badge-pop inline-flex items-center gap-2 bg-[#E63946]/10 text-[#E63946] text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-8 border border-[#E63946]/20">
                        <CheckShield className="w-3.5 h-3.5" />
                        USA-Only · 100% Verified · Free
                    </div>

                    <h1 className="landing-hero-animate text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
                        Every Job. Every Level.
                        <br />
                        <span className="hero-gradient-text">Always Verified.</span>
                    </h1>

                    <p className="landing-hero-animate-delay text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto leading-relaxed mb-4">
                        From barbers and cleaners to Fortune 500 engineers — <strong className="text-[#102A43]">VacancyAmerica</strong> is the only platform where <em>every</em> American worker finds real, verified jobs. No fake listings. No hidden fees. Ever.
                    </p>
                    <p className="landing-hero-animate-delay text-sm text-[#94A3B8] max-w-xl mx-auto mb-10">
                        Companies: we verify your listing and connect you with quality applicants — completely free.
                    </p>

                    <div className="landing-hero-animate-delay-2 flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                        <button onClick={() => navigate("/auth")} className="landing-btn-primary bg-[#E63946] text-white font-semibold px-8 py-3.5 rounded-full text-sm flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg shadow-red-200">
                            Find My Job — Free <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate("/auth")} className="landing-btn-secondary bg-white text-[#102A43] font-semibold px-8 py-3.5 rounded-full text-sm border border-[#E5E7EB] w-full sm:w-auto flex items-center gap-2 justify-center">
                            <Briefcase className="w-4 h-4" /> Post a Job — Free
                        </button>
                    </div>

                    <div className="landing-hero-animate-delay-3 flex items-center justify-center gap-6 text-xs text-[#94A3B8]">
                        <span className="flex items-center gap-1.5"><CheckShield className="w-3.5 h-3.5 text-green-500" /> No sign-up fee</span>
                        <span className="flex items-center gap-1.5"><CheckShield className="w-3.5 h-3.5 text-green-500" /> No hidden charges</span>
                        <span className="flex items-center gap-1.5"><CheckShield className="w-3.5 h-3.5 text-green-500" /> All jobs verified</span>
                    </div>
                </div>
            </section>

            {/* ─── STATS BAR ─── */}
            <RevealSection className="border-y border-[#E5E7EB] py-12 px-6 lg:px-8 bg-white">
                <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {[
                        { value: "100%", label: "Jobs Verified", sub: "manual review" },
                        { value: "0", label: "Fake Listings", sub: "zero tolerance" },
                        { value: "$0", label: "Cost to Use", sub: "free" },
                        { value: "All 50", label: "States Covered", sub: "USA citizens" },
                    ].map((stat, i) => (
                        <div key={stat.label} className={`stat-item stagger-${i + 1}`}>
                            <div className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#102A43]">{stat.value}</div>
                            <div className="text-sm font-semibold text-[#102A43] mt-1">{stat.label}</div>
                            <div className="text-xs text-[#94A3B8] mt-0.5">{stat.sub}</div>
                        </div>
                    ))}
                </div>
            </RevealSection>

            {/* ─── JOB CATEGORIES CAROUSEL ─── */}
            <section id="everyone" className="py-20 lg:py-28 everyone-bg">
                <RevealSection className="max-w-5xl mx-auto text-center px-6 mb-12">
                    <span className="section-label"><Globe className="w-3.5 h-3.5" /> Jobs for Everyone</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
                        No Domain. No Barrier.
                        <br /><span className="text-[#64748B]">Every Job Has a Home Here.</span>
                    </h2>
                    <p className="text-[#64748B] text-lg max-w-2xl mx-auto leading-relaxed">
                        Whether you sweep floors or write code — your work has value and your next opportunity is here.
                        VacancyAmerica lists <strong className="text-[#102A43]">every type of job</strong>, from entry-level to executive, blue-collar to white-collar.
                    </p>
                </RevealSection>

                {/* Scrolling ticker */}
                <div className="carousel-track-outer py-2">
                    <div className="carousel-track gap-3" style={{ columnGap: "12px" }}>
                        {[...JOB_CATEGORIES, ...JOB_CATEGORIES].map((cat, i) => (
                            <div key={i} className="job-pill mx-1.5">
                                <span className="text-[#E63946]">{cat.icon}</span>
                                <span>{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message cards */}
                <RevealSection className="max-w-5xl mx-auto px-6 mt-16">
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><path d="M7 14l-2 6h14l-2-6" /><path d="M4 14h16" /><path d="M12 2v12" /><path d="M9 5l3-3 3 3" /></svg>, title: "Blue-Collar & Skilled Trades", desc: "Cleaners, plumbers, electricians, construction workers, landscapers, barbers, mechanics — every skilled trade is welcome and verified.", color: "from-amber-50 to-orange-50", border: "border-amber-200" },
                            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>, title: "Healthcare & Service", desc: "Nurses, aides, drivers, chefs, hotel staff, security guards — service roles that keep America running are front and center here.", color: "from-green-50 to-teal-50", border: "border-green-200" },
                            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>, title: "Professional & Corporate", desc: "Software engineers, data analysts, finance managers, designers, teachers — big-company roles from top employers across all 50 states.", color: "from-blue-50 to-indigo-50", border: "border-blue-200" },
                        ].map(c => (
                            <div key={c.title} className={`landing-card rounded-2xl p-7 border ${c.border} bg-gradient-to-br ${c.color}`}>
                                <div className="mb-4">{c.icon}</div>
                                <h3 className="font-bold text-lg text-[#102A43] mb-3">{c.title}</h3>
                                <p className="text-[#64748B] text-sm leading-relaxed">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </RevealSection>

                {/* Why it matters */}
                <RevealSection className="max-w-4xl mx-auto px-6 mt-12">
                    <div className="bg-[#102A43] text-white rounded-3xl p-10 lg:p-14 relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at bottom left, rgba(230,57,70,0.18) 0%, transparent 60%)" }} />
                        <div className="relative">
                            <span className="section-label bg-white/10 text-white border border-white/20">
                                <Users className="w-3.5 h-3.5" /> Why VacancyAmerica?
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-8 mt-4">
                                A platform where everyone belongs
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-5">
                                {[
                                    { icon: <CheckShield className="w-4 h-4" />, t: "Full job details, always", d: "Salary, location, hours, requirements — every listing is complete and honest." },
                                    { icon: <Zap className="w-4 h-4" />, t: "Apply with one account", d: "Create a free profile once. Browse and apply to any job, any category." },
                                    { icon: <Eye className="w-4 h-4" />, t: "No pay-to-rank system", d: "A cleaner's job is shown with the same fairness as a CEO position." },
                                    { icon: <Ban className="w-4 h-4" />, t: "Zero scam tolerance", d: "Every employer is verified before any listing goes live. No exceptions." },
                                ].map(item => (
                                    <div key={item.t} className="feature-row border-white/10">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-white mt-0.5">{item.icon}</div>
                                        <div>
                                            <div className="font-semibold text-sm mb-0.5">{item.t}</div>
                                            <div className="text-gray-400 text-sm leading-relaxed">{item.d}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <button onClick={() => navigate("/auth")} className="landing-btn-primary bg-[#E63946] text-white font-semibold px-8 py-3.5 rounded-full text-sm flex items-center gap-2 justify-center">
                                    Browse Jobs — It's Free <ArrowRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => navigate("/auth")} className="landing-btn-secondary bg-white/10 text-white font-medium px-8 py-3.5 rounded-full text-sm border border-white/20 flex items-center gap-2 justify-center hover:bg-white/20">
                                    Create Free Account
                                </button>
                            </div>
                        </div>
                    </div>
                </RevealSection>
            </section>

            {/* ─── FOR COMPANIES ─── */}
            <section id="for-companies" className="py-24 lg:py-32 px-6 lg:px-8 bg-white">
                <RevealSection className="max-w-4xl mx-auto text-center mb-16">
                    <span className="section-label"><Briefcase className="w-3.5 h-3.5" /> For Companies & Hiring Teams</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
                        We help you hire
                        <br /><span className="text-[#64748B]">the right people, faster.</span>
                    </h2>
                    <p className="text-[#64748B] text-lg max-w-2xl mx-auto leading-relaxed">
                        Stop paying hundreds of dollars per posting. Stop getting exhausted applicants who didn't read your job. On VacancyAmerica, every listing is verified — so candidates trust you before they even apply.
                    </p>
                </RevealSection>

                {/* Value cards */}
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: <Target className="w-6 h-6" />, title: "Higher Quality Applicants", desc: "Candidates here are engaged, not burnt out. No ghost jobs means they save energy for real opportunities — like yours.", accent: "#E63946" },
                        { icon: <Award className="w-6 h-6" />, title: "Verified Employer Badge", desc: "Your company earns a trust badge after SuperAdmin verification. Candidates are far more likely to apply to verified employers.", accent: "#2563EB" },
                        { icon: <Briefcase className="w-6 h-6" />, title: "$0 to Post", desc: "No pay-per-click. No subscriptions. No premium tiers. Post unlimited jobs without spending a cent.", accent: "#059669" },
                        { icon: <Users className="w-6 h-6" />, title: "Applicants Who Read Your Post", desc: "On scammy platforms, candidates blind-apply. Here they engage carefully because they trust every listing is genuine.", accent: "#7C3AED" },
                        { icon: <Ban className="w-6 h-6" />, title: "No Competition from Fake Jobs", desc: "Your listing isn't buried under ghost postings. Every spot on VacancyAmerica is a real opportunity — including yours.", accent: "#D97706" },
                        { icon: <Globe className="w-6 h-6" />, title: "Reach All 50 States", desc: "Post once, reach motivated job seekers from New York to Montana. No geographic restrictions, no extra fees.", accent: "#0891B2" },
                    ].map(item => (
                        <RevealSection key={item.title}>
                            <div className="landing-card bg-[#FAFAFA] rounded-2xl p-7 h-full border border-[#E5E7EB]">
                                <div className="w-12 h-12 text-white rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: item.accent }}>
                                    {item.icon}
                                </div>
                                <h3 className="text-base font-bold mb-3 text-[#102A43]">{item.title}</h3>
                                <p className="text-[#64748B] text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </RevealSection>
                    ))}
                </div>

                {/* Comparison table */}
                <RevealSection className="max-w-4xl mx-auto mb-16">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="landing-card bg-[#FAFAFA] rounded-2xl p-8 border border-[#E5E7EB]">
                            <div className="text-xs font-bold tracking-widest uppercase text-[#94A3B8] mb-6">Other Job Boards</div>
                            <ul className="space-y-4">
                                {["$300–$500+ per job listing", "Applicants burnt out from ghost jobs", "No verification — scams mixed in", "Mass blind-applications", "Your listing buried behind ads", "Candidates distrust postings"].map(item => (
                                    <li key={item} className="flex items-start gap-3 text-sm text-[#64748B]">
                                        <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <XIcon className="w-2.5 h-2.5 text-red-400" />
                                        </span>{item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="landing-card bg-[#102A43] text-white rounded-2xl p-8">
                            <div className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-6">VacancyAmerica</div>
                            <ul className="space-y-4">
                                {["$0 per listing — completely free", "Engaged applicants ready to apply", "Every listing manually verified", "Serious candidates who read your post", "Equal visibility — no pay-to-rank", "Verified badge builds instant trust"].map(item => (
                                    <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                                        <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckShield className="w-3 h-3 text-green-400" />
                                        </span>{item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </RevealSection>

                {/* Hiring steps CTA */}
                <RevealSection className="max-w-4xl mx-auto">
                    <div className="company-cta-card text-white rounded-3xl p-10 lg:p-14">
                        <div className="relative">
                            <div className="text-center mb-10">
                                <span className="section-label bg-white/10 text-white border border-white/20"><Zap className="w-3.5 h-3.5" /> Start Hiring Today</span>
                                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-4 mb-3">Three steps. That's it.</h3>
                                <p className="text-gray-300 text-sm max-w-lg mx-auto">No credit card. No sales calls. No contracts. Just post your real job and reach real people.</p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8 mb-10">
                                {[
                                    { step: "1", title: "Create Your Account", desc: "Sign up free with your company name and email — you're in under 60 seconds." },
                                    { step: "2", title: "Submit Your Job Listing", desc: "Fill in the essentials — title, description, location, salary. Fast and simple." },
                                    { step: "3", title: "Get Verified & Go Live", desc: "Our SuperAdmin verifies your post. Approved listings reach applicants across America." },
                                ].map(item => (
                                    <div key={item.step} className="text-center">
                                        <div className="w-12 h-12 rounded-full bg-[#E63946] text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/40">{item.step}</div>
                                        <h4 className="font-bold mb-2 text-sm">{item.title}</h4>
                                        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center">
                                <button onClick={() => navigate("/auth")} className="landing-btn-primary bg-[#E63946] text-white font-bold px-10 py-4 rounded-full text-sm inline-flex items-center gap-2 shadow-lg shadow-red-900/40">
                                    Post Your First Job — Free <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </RevealSection>
            </section>

            {/* ─── MISSION ─── */}
            <section id="mission" className="py-24 lg:py-32 px-6 lg:px-8">
                <RevealSection className="max-w-4xl mx-auto text-center mb-16">
                    <span className="section-label"><Star className="w-3.5 h-3.5" /> Our Mission</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 mt-2">
                        Transparent. Trustworthy.
                        <br /><span className="text-[#64748B]">Scam-Free. For Everyone.</span>
                    </h2>
                </RevealSection>
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                    {[
                        { icon: <CheckShield className="w-6 h-6" />, title: "Verified Opportunities", desc: "Every post is manually reviewed by our SuperAdmin team before going live. No exceptions.", i: 1 },
                        { icon: <Users className="w-6 h-6" />, title: "Community-First Hiring", desc: "Built for people, not profit. We connect real companies with real talent across all 50 states.", i: 2 },
                        { icon: <Ban className="w-6 h-6" />, title: "Zero Fake Listings", desc: "No ghost jobs. No scams. No misleading posts. If it's on VacancyAmerica, it's 100% real.", i: 3 },
                    ].map(item => (
                        <RevealSection key={item.title}>
                            <div className={`landing-card bg-white rounded-2xl p-8 h-full border border-[#E5E7EB] stagger-${item.i}`}>
                                <div className="w-12 h-12 bg-[#102A43] text-white rounded-xl flex items-center justify-center mb-5">{item.icon}</div>
                                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                                <p className="text-[#64748B] text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ─── VISION ─── */}
            <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#102A43] text-white">
                <RevealSection className="max-w-4xl mx-auto text-center">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">Our Vision</p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-8">
                        A future where every American worker
                        <span className="text-gray-400"> finds their opportunity without fear of scams or barriers.</span>
                    </h2>
                    <div className="flex items-center justify-center gap-12 mt-12">
                        {[{ icon: <Eye className="w-6 h-6 text-white/80" />, label: "Transparency", cls: "landing-float" },
                        { icon: <CheckShield className="w-6 h-6 text-white/80" />, label: "Trust", cls: "landing-float-delay-1" },
                        { icon: <Globe className="w-6 h-6 text-white/80" />, label: "Accessibility", cls: "landing-float-delay-2" }].map(v => (
                            <div key={v.label} className={`${v.cls} flex flex-col items-center gap-3`}>
                                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">{v.icon}</div>
                                <span className="text-xs text-gray-500 font-medium">{v.label}</span>
                            </div>
                        ))}
                    </div>
                </RevealSection>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section id="how-it-works" className="py-24 lg:py-32 px-6 lg:px-8">
                <RevealSection className="max-w-4xl mx-auto text-center mb-16">
                    <span className="section-label"><FileCheck className="w-3.5 h-3.5" /> How It Works</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-2">
                        Simple steps. <span className="text-[#64748B]">Real results.</span>
                    </h2>
                </RevealSection>
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                    {[
                        { step: "01", icon: <Briefcase className="w-6 h-6" />, title: "Companies Submit", desc: "Companies submit real job openings through our simple portal — completely free, any industry." },
                        { step: "02", icon: <FileCheck className="w-6 h-6" />, title: "SuperAdmin Verifies", desc: "Our team reviews every posting for authenticity. No automated approvals, no shortcuts." },
                        { step: "03", icon: <UserCheck className="w-6 h-6" />, title: "Apply with Confidence", desc: "Job seekers browse and apply knowing every listing is legitimate — from cleaner to CTO." },
                    ].map(item => (
                        <RevealSection key={item.step}>
                            <div className="landing-card bg-white border border-[#E5E7EB] rounded-2xl p-8 h-full relative overflow-hidden group">
                                <span className="absolute top-4 right-6 text-6xl font-extrabold text-[#F1F5F9] group-hover:text-[#E5E7EB] transition-colors select-none">{item.step}</span>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-[#102A43] text-white rounded-xl flex items-center justify-center mb-5">{item.icon}</div>
                                    <h3 className="text-base font-bold mb-3">{item.title}</h3>
                                    <p className="text-[#64748B] text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ─── TRUST & SAFETY ─── */}
            <section id="trust" className="py-24 lg:py-32 px-6 lg:px-8 bg-white">
                <RevealSection className="max-w-4xl mx-auto text-center mb-16">
                    <span className="section-label"><CheckShield className="w-3.5 h-3.5" /> Trust & Safety</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-2">
                        Every job is reviewed.
                        <br /><span className="text-[#64748B]">Every opportunity is real.</span>
                    </h2>
                </RevealSection>
                <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-5">
                    {[
                        { icon: <Search className="w-5 h-5" />, title: "Manual Verification", desc: "Each posting is reviewed by real humans, not algorithms." },
                        { icon: <Ban className="w-5 h-5" />, title: "No Fake Employers", desc: "We verify company identity before any listing goes live." },
                        { icon: <CheckShield className="w-5 h-5" />, title: "No Misleading Posts", desc: "Accurate descriptions, real salaries, genuine positions." },
                        { icon: <Briefcase className="w-5 h-5" />, title: "Real Hiring Only", desc: "Every company on our platform is actively hiring right now." },
                    ].map(item => (
                        <RevealSection key={item.title}>
                            <div className="landing-card bg-[#FAFAFA] rounded-2xl p-6 flex items-start gap-4 border border-[#E5E7EB] h-full">
                                <div className="w-10 h-10 bg-[#102A43] text-white rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">{item.icon}</div>
                                <div>
                                    <h3 className="font-bold mb-1">{item.title}</h3>
                                    <p className="text-[#64748B] text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ─── ADMIN LEVELS (PLATFORM MODERATION) ─── */}
            <section id="admin-levels" className="py-24 lg:py-32 px-6 lg:px-8 bg-[#FAFAFA]">
                <RevealSection className="max-w-4xl mx-auto text-center mb-16">
                    <span className="section-label"><CheckShield className="w-3.5 h-3.5" /> Platform Security</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-2">
                        How we keep VacancyAmerica <span className="text-[#64748B]">safe.</span>
                    </h2>
                    <p className="text-[#64748B] text-lg max-w-2xl mx-auto leading-relaxed mt-4">
                        We rely on a structured, multi-tier team of administrators who ensure every interaction and listing meets our high standards.
                    </p>
                </RevealSection>
                
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
                    {/* Level 0 */}
                    <RevealSection>
                        <div className="landing-card bg-white rounded-3xl p-8 border-2 border-[#E5E7EB] hover:border-[#3B82F6] transition-colors relative h-full flex flex-col">
                            <div className="absolute top-6 right-8 text-5xl font-extrabold text-[#F1F5F9]">L0</div>
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 shrink-0">
                                <UserCheck className="w-7 h-7" />
                            </div>
                            <div className="inline-block px-3 py-1 bg-gray-100/80 text-gray-700 text-xs font-bold rounded-full mb-4 self-start">Basic Admin / Restricted</div>
                            <h3 className="text-2xl font-bold text-[#102A43] mb-4 relative z-10">Level 0 Admin</h3>
                            <ul className="space-y-3 mb-8 relative z-10 flex-grow">
                                <li className="flex items-start gap-3"><CheckShield className="w-5 h-5 text-blue-500 shrink-0" /><span className="text-[#64748B] text-sm">Posts cannot go live directly</span></li>
                                <li className="flex items-start gap-3"><CheckShield className="w-5 h-5 text-blue-500 shrink-0" /><span className="text-[#64748B] text-sm">Must be approved by Super Admin</span></li>
                                <li className="flex items-start gap-3"><CheckShield className="w-5 h-5 text-blue-500 shrink-0" /><span className="text-[#64748B] text-sm">Suitable for new or low-trust users</span></li>
                                <li className="flex items-start gap-3"><CheckShield className="w-5 h-5 text-blue-500 shrink-0" /><span className="text-[#64748B] text-sm">Ensures content quality and prevents misuse</span></li>
                            </ul>
                            <div className="relative z-10 bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Publishing Flow</div>
                                <div className="text-sm text-[#102A43] font-medium leading-relaxed">Create post → Send request → Super Admin approves → Post published</div>
                            </div>
                        </div>
                    </RevealSection>

                    {/* Level 1 */}
                    <RevealSection>
                        <div className="landing-card bg-white rounded-3xl p-8 border-2 border-[#E5E7EB] hover:border-[#F59E0B] transition-colors relative h-full shadow-lg transform lg:-translate-y-4 flex flex-col">
                            <div className="absolute top-6 right-8 text-5xl font-extrabold text-[#F1F5F9]">L1</div>
                            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 relative z-10 shrink-0">
                                <FileCheck className="w-7 h-7" />
                            </div>
                            <div className="inline-block px-3 py-1 bg-gray-100/80 text-gray-700 text-xs font-bold rounded-full mb-4 self-start">Intermediate Admin / Priority Review</div>
                            <h3 className="text-2xl font-bold text-[#102A43] mb-4 relative z-10">Level 1 Admin</h3>
                            <ul className="space-y-3 mb-8 relative z-10 flex-grow">
                                <li className="flex items-start gap-3"><CheckShield className="w-5 h-5 text-amber-500 shrink-0" /><span className="text-[#64748B] text-sm">Posts go into a priority review queue</span></li>
                                <li className="flex items-start gap-3"><CheckShield className="w-5 h-5 text-amber-500 shrink-0" /><span className="text-[#64748B] text-sm">Faster approval compared to Level 0</span></li>
                                <li className="flex items-start gap-3"><CheckShield className="w-5 h-5 text-amber-500 shrink-0" /><span className="text-[#64748B] text-sm">Moderators/Super Admin review and approve</span></li>
                            </ul>
                            <div className="relative z-10 bg-amber-50/50 rounded-2xl p-4 border border-amber-100">
                                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Publishing Flow</div>
                                <div className="text-sm text-[#102A43] font-medium leading-relaxed">Create post → Goes to priority list → Quick review → Published</div>
                            </div>
                        </div>
                    </RevealSection>

                    {/* Level 2 */}
                    <RevealSection>
                        <div className="landing-card bg-[#102A43] text-white rounded-3xl p-8 border-2 border-[#102A43] relative h-full flex flex-col">
                            <div className="absolute top-6 right-8 text-5xl font-extrabold text-white/10">L2</div>
                            <div className="w-14 h-14 bg-red-500/20 text-[#E63946] rounded-2xl flex items-center justify-center mb-6 relative z-10 shrink-0">
                                <Briefcase className="w-7 h-7 text-white" />
                            </div>
                            <div className="inline-block px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full mb-4 self-start">Trusted Admin / Direct Publishing</div>
                            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Level 2 Admin</h3>
                            <ul className="space-y-3 mb-8 relative z-10 flex-grow">
                                <li className="flex items-start gap-3"><CheckShield className="w-5 h-5 text-[#E63946] shrink-0" /><span className="text-gray-300 text-sm">No approval required</span></li>
                                <li className="flex items-start gap-3"><CheckShield className="w-5 h-5 text-[#E63946] shrink-0" /><span className="text-gray-300 text-sm">Posts are published instantly</span></li>
                                <li className="flex items-start gap-3"><CheckShield className="w-5 h-5 text-[#E63946] shrink-0" /><span className="text-gray-300 text-sm">Given to highly trusted users/admins</span></li>
                            </ul>
                            <div className="relative z-10 bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-xs font-bold text-[#E63946] uppercase tracking-wider mb-2">Publishing Flow</div>
                                <div className="text-sm text-white font-medium leading-relaxed">Create post → Directly published</div>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ─── TESTIMONIALS CAROUSEL ─── */}
            <section className="py-24 lg:py-32 px-6 lg:px-8 everyone-bg">
                <RevealSection className="max-w-4xl mx-auto text-center mb-12">
                    <span className="section-label"><Star className="w-3.5 h-3.5" /> Real Stories</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
                        From cleaners to coders —
                        <br /><span className="text-[#64748B]">real people, real results.</span>
                    </h2>
                </RevealSection>
                <div className="max-w-2xl mx-auto">
                    <div className="relative overflow-hidden">
                        <div className="testimonial-carousel" style={{ transform: `translateX(-${testimonialIdx * 100}%)` }}>
                            {TESTIMONIALS.map((t, i) => (
                                <div key={i} className="min-w-full px-2">
                                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                                        <div className="flex gap-1 mb-4">
                                            {Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400" />)}
                                        </div>
                                        <p className="text-[#102A43] text-base leading-relaxed italic mb-6">"{t.text}"</p>
                                        <div>
                                            <div className="font-bold text-[#102A43]">{t.name}</div>
                                            <div className="text-sm text-[#64748B]">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button onClick={() => setTestimonialIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex gap-2">
                            {TESTIMONIALS.map((_, i) => (
                                <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === testimonialIdx ? "w-6 bg-[#E63946]" : "bg-[#E5E7EB]"}`} />
                            ))}
                        </div>
                        <button onClick={() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length)} className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center hover:bg-[#F1F5F9] transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── FREE PLATFORM ─── */}
            {/* <section id="free" className="py-24 lg:py-32 px-6 lg:px-8 bg-white">
                <RevealSection className="max-w-4xl mx-auto text-center">
                    <span className="section-label"><IconDollar /> Pricing</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 mt-2">
                        Completely free.
                        <br /><span className="text-[#64748B]">For everyone.</span>
                    </h2>
                    <p className="text-[#64748B] text-lg max-w-xl mx-auto mb-12">No charges for job seekers. No charges for companies. No subscriptions. No hidden fees. Built purely for trust.</p>
                    <div className="landing-price-card inline-block bg-white border-2 border-[#102A43] rounded-3xl px-12 py-10 text-center">
                        <div className="text-6xl lg:text-7xl font-extrabold tracking-tighter mb-2 text-[#102A43]">$0</div>
                        <div className="w-12 h-px bg-[#E5E7EB] mx-auto my-6" />
                        <ul className="space-y-3 text-sm text-[#64748B]">
                            {["Free for job seekers", "Free for companies", "No subscriptions ever", "No hidden charges"].map(l => (
                                <li key={l} className="flex items-center gap-2 justify-center">
                                    <CheckShield className="w-4 h-4 text-[#102A43]" />{l}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => navigate("/auth")} className="landing-btn-primary bg-[#E63946] text-white text-sm font-bold px-8 py-3 rounded-full mt-8 w-full">
                            Get Started — It's Free
                        </button>
                    </div>
                </RevealSection>
            </section> */}

            {/* ─── CTA BAND ─── */}
            <section className="py-20 lg:py-24 px-6 lg:px-8 bg-[#102A43] text-white">
                <RevealSection className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                        Your next opportunity is one click away.
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                        Join Americans of every background who trust VacancyAmerica for real, verified jobs — no scams, no fees, no barriers.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => navigate("/auth")} className="landing-btn-primary bg-[#E63946] text-white font-bold px-8 py-3.5 rounded-full text-sm flex items-center gap-2 shadow-lg shadow-red-900/40">
                            Find My Job — Free <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate("/auth")} className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-6 py-3.5">
                            Post a Job for Free →
                        </button>
                    </div>
                </RevealSection>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="py-16 px-6 lg:px-8 border-t border-[#E5E7EB]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div onClick={() => { window.scrollTo(0, 0); navigate("/"); }} className="flex items-center mb-4 cursor-pointer">
                                <img src="/VA-logo2.png" alt="VacancyAmerica" className="h-[80px] lg:h-[100px] w-auto" />
                            </div>
                            <p className="text-sm text-[#64748B] leading-relaxed">Verified job opportunities for every American — from entry-level to executive.</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#64748B] mb-4">Platform</h4>
                            <ul className="space-y-3">
                                {[{ l: "Browse Jobs", h: "#everyone" }, { l: "For Companies", h: "#for-companies" }, { l: "How It Works", h: "#how-it-works" }].map(li => (
                                    <li key={li.l}><a href={li.h} className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors">{li.l}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#64748B] mb-4">Company</h4>
                            <ul className="space-y-3">
                                {[{ l: "About", h: "#mission" }, { l: "Mission", h: "#mission" }, { l: "Trust & Safety", h: "#trust" }].map(li => (
                                    <li key={li.l}><a href={li.h} className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors">{li.l}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#64748B] mb-4">Legal</h4>
                            <ul className="space-y-3">
                                {["Privacy Policy", "Terms of Service", "Contact"].map(l => (
                                    <li key={l}><a href="#" className="text-sm text-[#64748B] hover:text-[#102A43] transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[#E5E7EB] gap-4">
                        <p className="text-xs text-[#64748B]">© {new Date().getFullYear()} VacancyAmerica. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <button onClick={() => navigate("/auth")} className="text-xs text-[#64748B] hover:text-[#102A43] transition-colors">Login</button>
                            <button onClick={() => navigate("/auth")} className="text-xs text-[#64748B] hover:text-[#102A43] transition-colors">Sign Up</button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
