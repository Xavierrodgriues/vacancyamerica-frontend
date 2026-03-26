import { BarChart3, Loader2 } from 'lucide-react';

export function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    const colors: Record<string, { bg: string; iconBg: string; text: string }> = {
        amber: { bg: 'bg-amber-50 border-amber-100', iconBg: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
        emerald: { bg: 'bg-emerald-50 border-emerald-100', iconBg: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-600' },
        red: { bg: 'bg-red-50 border-red-100', iconBg: 'bg-red-100 text-red-600', text: 'text-red-600' },
        blue: { bg: 'bg-blue-50 border-blue-100', iconBg: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
        indigo: { bg: 'bg-indigo-50 border-indigo-100', iconBg: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-600' },
        slate: { bg: 'bg-slate-50 border-slate-100', iconBg: 'bg-slate-100 text-slate-600', text: 'text-slate-600' },
    };

    const c = colors[color] || colors.slate;

    return (
        <div className={`${c.bg} rounded-2xl border p-5 transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${c.iconBg}`}>{icon}</div>
                <div>
                    <p className="text-slate-500 text-sm font-medium">{label}</p>
                    <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
                </div>
            </div>
        </div>
    );
}

export function DarkStatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    const colors: Record<string, { bg: string; iconBg: string; text: string; glow: string }> = {
        amber: { bg: 'bg-amber-500/10 border-amber-500/20', iconBg: 'bg-amber-500/20 text-amber-400', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]' },
        emerald: { bg: 'bg-emerald-500/10 border-emerald-500/20', iconBg: 'bg-emerald-500/20 text-emerald-400', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
        red: { bg: 'bg-red-500/10 border-red-500/20', iconBg: 'bg-red-500/20 text-red-400', text: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.1)]' },
        blue: { bg: 'bg-blue-500/10 border-blue-500/20', iconBg: 'bg-blue-500/20 text-blue-400', text: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]' },
        indigo: { bg: 'bg-indigo-500/10 border-indigo-500/20', iconBg: 'bg-indigo-500/20 text-indigo-400', text: 'text-indigo-400', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.1)]' },
        slate: { bg: 'bg-slate-800/50 border-slate-700', iconBg: 'bg-slate-700/50 text-slate-300', text: 'text-white', glow: 'shadow-[0_0_15px_rgba(255,255,255,0.02)]' },
    };

    const c = colors[color] || colors.slate;

    return (
        <div className={`${c.bg} backdrop-blur-xl rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${c.glow} group cursor-default relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${c.iconBg} transition-transform duration-300 group-hover:scale-110 ring-1 ring-white/5`}>{icon}</div>
                <div>
                    <p className="text-slate-400 text-[13px] font-bold tracking-wider uppercase mb-0.5">{label}</p>
                    <p className={`text-3xl font-black tracking-tight ${c.text} drop-shadow-md`}>{value}</p>
                </div>
            </div>
        </div>
    );
}

export function LoadingState() {
    return (
        <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );
}

export function DarkLoadingState() {
    return (
        <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
    );
}

export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-slate-300 mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
            <p className="text-slate-400 mt-1 text-sm">{description}</p>
        </div>
    );
}

export function DarkEmptyState({ icon, title, description, glowColor = 'amber' }: { icon: React.ReactNode; title: string; description: string; glowColor?: string }) {
    const isAmber = glowColor === 'amber';
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center relative">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl opacity-20 ${isAmber ? 'bg-amber-500' : 'bg-slate-500'}`} />
            <div className={`relative p-5 rounded-full mb-6 border shadow-inner ${isAmber ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800/80 text-slate-400 border-slate-700'}`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-slate-400 mt-2 text-sm max-w-sm">{description}</p>
        </div>
    );
}

export function ChartPlaceholder({ title }: { title: string }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">{title}</h3>
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                <div className="text-center text-slate-400">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chart coming soon</p>
                </div>
            </div>
        </div>
    );
}
