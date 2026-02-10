import { ChartPlaceholder } from './SharedUI';

export function AnalyticsTab() {
    return (
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChartPlaceholder title="User Growth" />
                <ChartPlaceholder title="Admin Activity" />
                <ChartPlaceholder title="Post Statistics" />
                <ChartPlaceholder title="Engagement Metrics" />
            </div>
        </div>
    );
}
