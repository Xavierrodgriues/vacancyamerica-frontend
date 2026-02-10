import { BarChart3, Loader2 } from 'lucide-react';

export function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    const colors = {
        amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
        emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
        red: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
        indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/20 text-indigo-400',
        slate: 'from-slate-500/20 to-slate-600/10 border-slate-500/20 text-slate-400',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors] || colors.slate} rounded-xl border p-5 transition-transform hover:scale-[1.02]`}>
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900/50 rounded-lg">{icon}</div>
                <div>
                    <p className="text-slate-400 text-sm">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}

export function LoadingState() {
    return (
        <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
    );
}

export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-slate-600 mb-4">{icon}</div>
            <h3 className="text-lg font-medium text-slate-300">{title}</h3>
            <p className="text-slate-500 mt-1">{description}</p>
        </div>
    );
}

export function ChartPlaceholder({ title }: { title: string }) {
    return (
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
            <h3 className="font-medium text-white mb-4">{title}</h3>
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg">
                <div className="text-center text-slate-500">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chart coming soon</p>
                </div>
            </div>
        </div>
    );
}
