import { useState } from 'react';
import {
    FileText, Mail, Phone, UserRound, BriefcaseBusiness,
    Download, ArrowLeft, Calendar, MapPin, ExternalLink,
    ChevronRight, Search, Filter
} from 'lucide-react';
import { InterestedApplication, useInterestedApplications, useUpdateInterestedStatus } from '../hooks/use-admin-posts';
import { LoadingState, EmptyState } from './SharedUI';
import { toast } from 'sonner';

/* ── helpers ─────────────────────────────────────────────── */

function fDate(v: string) {
    return new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function fDateTime(v: string) {
    return new Date(v).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function fMb(b: number) { return `${(b / (1024 * 1024)).toFixed(2)} MB`; }
function initials(name: string) {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    reviewed: { label: 'Reviewed', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200' },
};
function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
            {s.label}
        </span>
    );
}

/* ── Avatar ─────────────────────────────────────────────── */
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
    const sz = size === 'lg' ? 'w-14 h-14 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}>
            {initials(name)}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   LIST VIEW
══════════════════════════════════════════════════════════ */
function ListView({
    applications,
    onSelect,
}: {
    applications: InterestedApplication[];
    onSelect: (a: InterestedApplication) => void;
}) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = applications.filter(a => {
        const matchSearch =
            a.fullName.toLowerCase().includes(search.toLowerCase()) ||
            a.email.toLowerCase().includes(search.toLowerCase()) ||
            (a.post?.content || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="flex flex-col h-full bg-slate-50">

            {/* ── Toolbar ── */}
            <div className="bg-white border-b border-slate-200 p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 leading-none">
                <div className="relative w-full sm:max-w-xs sm:flex-[2]">
                    <Search className="absolute left-3 top-[50%] -translate-y-[50%] w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search applicants…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 sm:py-2 text-sm rounded-xl sm:rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                    />
                </div>
                <div className="flex items-center justify-between gap-3 w-full sm:w-auto sm:flex-[3]">
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto text-sm rounded-xl sm:rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 shrink-0 sm:ml-auto bg-slate-100 px-3 py-1.5 rounded-full">
                        {filtered.length} / {applications.length}
                    </span>
                </div>
            </div>

            {/* ── Data Views ── */}
            <div className="flex-1 overflow-auto bg-slate-50 sm:bg-white">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-slate-400 text-center">
                        <BriefcaseBusiness className="w-10 h-10 mb-3 opacity-40 mx-auto" />
                        <p className="font-semibold text-sm">No applicants found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <>
                        {/* ── Mobile View: Cards ── */}
                        <div className="md:hidden p-4 space-y-3">
                            {filtered.map((app) => (
                                <div
                                    key={app._id}
                                    onClick={() => onSelect(app)}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer active:scale-[0.98] transition-transform"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <Avatar name={app.fullName} size="md" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-800 text-sm truncate">{app.fullName}</p>
                                            <p className="text-xs text-slate-500 truncate">{app.email}</p>
                                        </div>
                                    </div>
                                    {app.post?.content && (
                                        <div className="mb-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-500 line-clamp-2">{app.post.content}</p>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                        <StatusBadge status={app.status} />
                                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-3.5 h-3.5 text-slate-300" /> 
                                                {app.documents.length}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Desktop View: Table ── */}
                        <div className="hidden md:block">
                            <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200 text-left sticky top-0 z-10">
                                <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                                <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                                <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Post Preview</th>
                                <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Docs</th>
                                <th className="px-4 py-3.5 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((app) => (
                                <tr
                                    key={app._id}
                                    onClick={() => onSelect(app)}
                                    className="bg-white hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                                >
                                    {/* Applicant */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={app.fullName} size="sm" />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-800 truncate max-w-[140px]">{app.fullName}</p>
                                                <p className="text-xs text-slate-400 truncate max-w-[140px]">{app.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Contact */}
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <p className="text-slate-600 text-xs">{app.phone}</p>
                                        {app.location && <p className="text-slate-400 text-xs mt-0.5">{app.location}</p>}
                                    </td>
                                    {/* Post */}
                                    <td className="px-4 py-4 hidden lg:table-cell">
                                        <p className="text-slate-500 text-xs line-clamp-2 max-w-[220px]">
                                            {app.post?.content || <span className="italic text-slate-300">No post content</span>}
                                        </p>
                                    </td>
                                    {/* Date */}
                                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                                        {fDate(app.createdAt)}
                                    </td>
                                    {/* Status */}
                                    <td className="px-4 py-4">
                                        <StatusBadge status={app.status} />
                                    </td>
                                    {/* Docs count */}
                                    <td className="px-4 py-4 text-right">
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                                            <FileText className="w-3.5 h-3.5" />
                                            {app.documents.length}
                                        </span>
                                    </td>
                                    {/* Arrow */}
                                    <td className="px-4 py-4">
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   DETAIL VIEW
══════════════════════════════════════════════════════════ */
function DetailView({
    application: a,
    onBack,
    onStatusChange,
}: {
    application: InterestedApplication;
    onBack: () => void;
    onStatusChange: (newApplication: InterestedApplication) => void;
}) {
    const updateMutation = useUpdateInterestedStatus();

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        try {
            const result = await updateMutation.mutateAsync({ id: a._id, status: newStatus });
            toast.success('Status updated successfully');
            if (result.data) {
                onStatusChange(result.data);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-auto">

            {/* ── Top Bar ── */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 shrink-0 sticky top-0 z-10">
                <div className="flex items-center justify-between w-full sm:w-auto shrink-0">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back <span className="hidden sm:inline">to list</span></span>
                    </button>
                    <p className="sm:hidden text-sm font-bold text-slate-800 truncate max-w-[150px]">{a.fullName}</p>
                </div>
                <div className="hidden sm:block h-5 w-px bg-slate-200 shrink-0" />
                <p className="hidden sm:block text-sm font-semibold text-slate-800 truncate">{a.fullName}</p>
                
                <div className="flex items-center justify-between sm:justify-end sm:ml-auto w-full sm:w-auto pt-3 sm:pt-0 border-t border-slate-100 sm:border-0 gap-2 shrink-0">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
                    <select
                        value={a.status}
                        onChange={handleStatusChange}
                        disabled={updateMutation.isPending}
                        className={`text-xs font-bold rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer border shadow-sm transition-all ${
                            a.status === 'submitted' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            a.status === 'reviewed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            a.status === 'contacted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            a.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                        } ${updateMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-95'}`}
                    >
                        <option value="submitted" className="text-slate-800 bg-white">Submitted</option>
                        <option value="reviewed" className="text-slate-800 bg-white">Reviewed</option>
                        <option value="contacted" className="text-slate-800 bg-white">Contacted</option>
                        <option value="rejected" className="text-slate-800 bg-white">Rejected</option>
                    </select>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 px-6 py-6 max-w-5xl mx-auto w-full space-y-6">

                {/* Profile header card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="h-20 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />
                    <div className="px-6 pb-6">
                        <div className="flex items-end gap-4 -mt-8 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ring-white">
                                {initials(a.fullName)}
                            </div>
                            <div className="pb-1">
                                <h2 className="text-lg font-bold text-slate-900">{a.fullName}</h2>
                                <p className="text-sm text-slate-500">{a.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 pt-4 border-t border-slate-100">
                            <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={a.phone} />
                            <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={a.email} />
                            {a.location && <InfoItem icon={<MapPin className="w-4 h-4" />} label="Location" value={a.location} />}
                            <InfoItem icon={<Calendar className="w-4 h-4" />} label="Applied" value={fDateTime(a.createdAt)} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div className="space-y-6">

                        {/* Platform Account */}
                        {a.applicant && (
                            <Section title="Platform Account" icon={<UserRound className="w-4 h-4" />}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                                        {initials(a.applicant.display_name || a.applicant.username || '?')}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{a.applicant.display_name}</p>
                                        <p className="text-xs text-slate-500">@{a.applicant.username}</p>
                                        {a.applicant.email && <p className="text-xs text-slate-400">{a.applicant.email}</p>}
                                    </div>
                                </div>
                            </Section>
                        )}

                        {/* Cover Letter / Message */}
                        {a.coverLetter && (
                            <Section title="Message from Applicant" icon={<FileText className="w-4 h-4" />}>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{a.coverLetter}</p>
                            </Section>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">

                        {/* Post */}
                        <Section title="Applied To Post" icon={<BriefcaseBusiness className="w-4 h-4" />}>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed line-clamp-6">
                                {a.post?.content || <span className="italic text-slate-400">No post content</span>}
                            </p>
                            {(a.post?.image_url || a.post?.video_url) && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                                    {a.post.image_url
                                        ? <img src={a.post.image_url} alt="Post" className="w-full max-h-48 object-cover" />
                                        : <video src={a.post.video_url || undefined} controls className="w-full max-h-48 bg-black" />
                                    }
                                </div>
                            )}
                        </Section>

                        {/* Documents */}
                        <Section
                            title={`Documents (${a.documents.length})`}
                            icon={<Download className="w-4 h-4" />}
                        >
                            {a.documents.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">No documents attached</p>
                            ) : (
                                <div className="space-y-2">
                                    {a.documents.map((doc) => (
                                        <div
                                            key={doc.r2Key}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                                                <FileText className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-700 truncate">{doc.originalName}</p>
                                                <p className="text-xs text-slate-400">{fMb(doc.originalSize)}</p>
                                            </div>
                                            <a
                                                href={doc.previewUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shrink-0"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Open
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Small reusable bits ─────────────────────────────────── */
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <div className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-slate-400 shrink-0">{icon}</span>
                <span className="truncate max-w-[200px]" title={value}>{value}</span>
            </div>
        </div>
    );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                <span className="text-indigo-500">{icon}</span>
                <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
            </div>
            <div className="px-5 py-4">{children}</div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════ */
export default function InterestedApplicationsTab() {
    const { data, isLoading, error } = useInterestedApplications();
    const [selected, setSelected] = useState<InterestedApplication | null>(null);
    const applications = data?.data || [];

    if (isLoading) return <LoadingState />;

    if (error) {
        return (
            <div className="p-8">
                <EmptyState
                    icon={<FileText className="w-12 h-12" />}
                    title="Unable to load applications"
                    description="There was a problem fetching interest applications for your posts."
                />
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="p-8">
                <EmptyState
                    icon={<BriefcaseBusiness className="w-12 h-12" />}
                    title="No interested users yet"
                    description="When users click Interested on your published posts, their details will appear here."
                />
            </div>
        );
    }

    return (
        <div className="h-full">
            {selected
                ? <DetailView 
                    application={selected} 
                    onBack={() => setSelected(null)} 
                    onStatusChange={(updatedApp) => setSelected(updatedApp)}
                  />
                : <ListView applications={applications} onSelect={setSelected} />
            }
        </div>
    );
}
