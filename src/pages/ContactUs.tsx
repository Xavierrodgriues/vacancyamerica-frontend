import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, MapPin, Phone, Send, Loader2, Menu, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import "./landing.css";

export default function ContactUs() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const navLinks = [
        { label: "Verified Jobs", href: "/#hero" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "Mission", href: "/#mission" },
        { label: "Articles & News", href: "/#trust" },
        { label: "For Companies", href: "/#for-companies" },
    ];
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);

        toast.success("Message sent successfully! We'll be in touch soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans antialiased text-[#102A43]">
            {/* Decorative background grid */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: "radial-gradient(circle, #102A43 1px, transparent 1px)",
                    backgroundSize: "24px 24px"
                }}
            />

            {/* ─── NAVBAR ─── */}
            <nav
                className={`landing-navbar fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/80 ${scrolled ? "scrolled" : ""
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div onClick={() => { window.scrollTo(0, 0); navigate("/"); }} className="flex items-center group cursor-pointer focus:outline-none">
                            <img src="/VA-logo2-removebg.png" alt="VacancyAmerica" className="h-[48px] lg:h-[56px] w-auto cursor-pointer" onClick={() => navigate("/")} />
                        </div>

                        {/* Desktop Nav Links */}
                        <div className="hidden lg:flex items-center gap-7">
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
                        <div className="hidden lg:flex items-center gap-3">
                            <button
                                onClick={() => navigate("/auth")}
                                className="text-sm font-medium text-[#64748B] hover:text-[#102A43] transition-colors px-3 py-2"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate("/auth")}
                                className="text-sm font-medium text-[#102A43] hover:text-[#102A43] transition-colors px-3 py-2"
                            >
                                Sign Up
                            </button>
                            <button
                                onClick={() => navigate("/auth")}
                                className="landing-btn-primary bg-[#E63946] text-white text-sm font-semibold px-5 py-2.5 rounded-full"
                            >
                                Post a Job
                            </button>
                            <button
                                onClick={() => window.scrollTo(0, 0)}
                                className="landing-btn-secondary bg-white text-[#102A43] text-sm font-medium px-5 py-2.5 rounded-full border border-[#E5E7EB]"
                            >
                                Contact Us
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

                </div>
            </nav>

            {/* ─── MOBILE FULLSCREEN MENU ─── */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col lg:hidden overflow-hidden mobile-menu-overlay">
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] flex-shrink-0 mobile-menu-top-bar">
                        <div
                            onClick={() => { setMobileOpen(false); window.scrollTo(0, 0); navigate("/"); }}
                            className="cursor-pointer"
                        >
                            <img src="/VA-logo2-removebg.png" alt="VacancyAmerica" className="h-[44px] w-auto" />
                        </div>
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="w-10 h-10 rounded-full bg-[#E63946] flex items-center justify-center text-white hover:bg-[#d32f3f] transition-colors flex-shrink-0"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <div className="flex-1 overflow-y-auto px-4 py-8">
                        <div className="space-y-2">
                            {navLinks.map((link, index) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="mobile-menu-item group flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-[#FFF5F5] transition-all duration-200"
                                    style={{ animationDelay: `${0.1 + index * 0.08}s` }}
                                >
                                    <span className="text-xl font-semibold text-[#102A43] group-hover:text-[#E63946] transition-colors duration-200">
                                        {link.label}
                                    </span>
                                    <span className="w-9 h-9 rounded-full bg-[#E63946] flex items-center justify-center text-white flex-shrink-0">
                                        <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Auth Buttons */}
                    <div
                        className="px-6 pb-10 pt-4 border-t border-[#E5E7EB] flex flex-col gap-3 flex-shrink-0 mobile-menu-auth"
                        style={{ animationDelay: `${0.1 + navLinks.length * 0.08}s` }}
                    >
                        <button
                            onClick={() => { navigate("/auth"); setMobileOpen(false); }}
                            className="text-sm font-medium text-[#102A43] py-2"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { navigate("/auth"); setMobileOpen(false); }}
                            className="landing-btn-primary bg-[#E63946] text-white text-sm font-semibold px-5 py-3 rounded-full"
                        >
                            Post a Job
                        </button>
                        <button
                            onClick={() => { setMobileOpen(false); window.scrollTo(0, 0); }}
                            className="landing-btn-primary bg-[#E63946] text-white text-sm font-medium px-5 py-3 rounded-full"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-32 pb-24 relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                {/* Left Column - Info */}
                <div className="flex flex-col gap-10">
                    <div>
                        <span className="text-[#E63946] font-bold tracking-wider uppercase text-sm mb-3 block">
                            Contact Us
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                            Get in touch with our team.
                        </h1>
                        <p className="text-[#64748B] text-lg leading-relaxed max-w-md">
                            Whether you have a question about verified listings, employer accounts, or anything else, our team is ready to answer all your questions.
                        </p>
                    </div>

                    <div className="space-y-8 mt-2">
                        <div className="flex gap-5 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center flex-shrink-0 text-[#102A43]">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1 text-lg">Email Us</h3>
                                <p className="text-[#64748B] mb-1">Our friendly team is here to help.</p>
                                <a href="mailto:support@vacancyamerica.com" className="text-[#E63946] font-semibold hover:underline">
                                    support@vacancyamerica.com
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-5 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center flex-shrink-0 text-[#102A43]">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1 text-lg">Office</h3>
                                <p className="text-[#64748B] mb-1">Come say hello at our headquarters.</p>
                                <p className="text-[#102A43] font-medium mt-1">
                                    1007 N Orange St. 4th Floor Ste 1382<br />
                                    Wilmington, DE 19801
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-5 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center flex-shrink-0 text-[#102A43]">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1 text-lg">Phone</h3>
                                <p className="text-[#64748B] mb-1">Mon-Fri from 9am to 6pm CT.</p>
                                <a href="tel:+18005551234" className="text-[#E63946] font-semibold hover:underline">
                                    +1 (800) 555-1234
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] border border-[#E5E7EB]">
                    <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-semibold text-[#102A43]">Full Name</label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="h-12 bg-[#FAFAFA] border-[#E5E7EB] focus-visible:ring-[#E63946]/20 focus-visible:border-[#E63946] rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-semibold text-[#102A43]">Email Address</label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="h-12 bg-[#FAFAFA] border-[#E5E7EB] focus-visible:ring-[#E63946]/20 focus-visible:border-[#E63946] rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="subject" className="text-sm font-semibold text-[#102A43]">Subject</label>
                            <Input
                                id="subject"
                                name="subject"
                                placeholder="How can we help?"
                                value={formData.subject}
                                onChange={handleChange}
                                className="h-12 bg-[#FAFAFA] border-[#E5E7EB] focus-visible:ring-[#E63946]/20 focus-visible:border-[#E63946] rounded-xl"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-semibold text-[#102A43]">Message</label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="Tell us a little about your issue..."
                                value={formData.message}
                                onChange={handleChange}
                                className="min-h-[160px] bg-[#FAFAFA] border-[#E5E7EB] focus-visible:ring-[#E63946]/20 focus-visible:border-[#E63946] rounded-xl resize-y"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#E63946] hover:bg-[#d32f3f] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E63946]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Send Message
                                </>
                            )}
                        </button>
                        <p className="text-xs text-center text-[#64748B] mt-4">
                            By submitting this form, you agree to our Privacy Policy.
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}
