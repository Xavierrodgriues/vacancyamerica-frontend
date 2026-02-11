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

export function LoadingState() {
    return (
        <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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
