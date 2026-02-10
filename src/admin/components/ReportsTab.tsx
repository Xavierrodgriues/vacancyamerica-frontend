import { Check, Clock } from 'lucide-react';

function ReportItem({ title, date, status }: { title: string; date: string; status: 'available' | 'pending' }) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800/70 transition-colors">
            <div>
                <h4 className="font-medium text-white">{title}</h4>
                <p className="text-sm text-slate-400 mt-1">Generated: {date}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${status === 'available'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                {status === 'available' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {status === 'available' ? 'Available' : 'Processing'}
            </span>
        </div>
    );
}

export function ReportsTab() {
    return (
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 animate-fadeIn">
            <div className="space-y-3">
                <ReportItem title="Weekly Admin Activity Report" date="Feb 9, 2026" status="available" />
                <ReportItem title="Monthly User Growth Report" date="Feb 1, 2026" status="available" />
                <ReportItem title="Content Moderation Summary" date="Jan 31, 2026" status="available" />
                <ReportItem title="Security Audit Report" date="Jan 25, 2026" status="pending" />
            </div>
        </div>
    );
}
