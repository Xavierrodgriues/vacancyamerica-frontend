import { FileText, Mail, MapPin, Phone, UserRound, BriefcaseBusiness, Download, Image as ImageIcon } from 'lucide-react';
import { InterestedApplication, useInterestedApplications } from '../hooks/use-admin-posts';
import { LoadingState, EmptyState } from './SharedUI';

function formatDate(value: string) {
    return new Date(value).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatMb(bytes: number) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isImage(mimeType: string) {
    return mimeType.startsWith('image/');
}

function isPdf(mimeType: string) {
    return mimeType === 'application/pdf';
}

function DocumentPreview({ document }: { document: InterestedApplication['documents'][number] }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{document.originalName}</p>
                    <p className="text-xs text-slate-500">
                        Original {formatMb(document.originalSize)} • Stored {formatMb(document.compressedSize)}
                    </p>
                </div>
                <a
                    href={document.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Open
                </a>
            </div>

            <div className="bg-slate-100">
                {isImage(document.mimeType) ? (
                    <img
                        src={document.previewUrl}
                        alt={document.originalName}
                        className="w-full h-auto max-h-[360px] object-contain bg-white"
                    />
                ) : isPdf(document.mimeType) ? (
                    <iframe
                        src={document.previewUrl}
                        title={document.originalName}
                        className="w-full h-[360px] bg-white"
                    />
                ) : (
                    <div className="h-[220px] flex flex-col items-center justify-center text-center px-6">
                        <FileText className="w-10 h-10 text-slate-400 mb-3" />
                        <p className="text-sm font-semibold text-slate-700">Preview not available in-app</p>
                        <p className="text-xs text-slate-500 mt-1">This document type can still be opened in a new tab.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ApplicationCard({ application }: { application: InterestedApplication }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-0">
                <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider border border-emerald-100">
                                <BriefcaseBusiness className="w-3.5 h-3.5" />
                                Interested User
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-slate-900">Applied on {formatDate(application.createdAt)}</h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide">
                            {application.status}
                        </span>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Post</p>
                        <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap break-words">
                            {application.post?.content || 'No post description'}
                        </p>
                        {(application.post?.image_url || application.post?.video_url) && (
                            <div className="mt-4">
                                {application.post.image_url ? (
                                    <img
                                        src={application.post.image_url}
                                        alt="Post media"
                                        className="w-full max-h-[260px] rounded-2xl object-cover border border-slate-200"
                                    />
                                ) : (
                                    <video
                                        src={application.post.video_url || undefined}
                                        controls
                                        className="w-full max-h-[260px] rounded-2xl border border-slate-200 bg-black"
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-100 p-4">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Applicant Details</p>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex items-center gap-2"><UserRound className="w-4 h-4 text-slate-400" /> {application.fullName}</div>
                                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {application.email}</div>
                                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {application.phone}</div>
                                {application.location && (
                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {application.location}</div>
                                )}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 p-4">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Platform User</p>
                            <div className="space-y-2 text-sm text-slate-700">
                                <p className="font-semibold text-slate-800">{application.applicant?.display_name || 'Unknown user'}</p>
                                <p>@{application.applicant?.username || 'unknown'}</p>
                                {application.applicant?.email && <p>{application.applicant.email}</p>}
                            </div>
                        </div>
                    </div>

                    {application.coverLetter && (
                        <div className="mt-5 rounded-2xl border border-slate-100 p-4">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Message</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap break-words leading-6">{application.coverLetter}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50/70">
                    <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-500">Documents</h4>
                    </div>

                    <div className="space-y-4">
                        {application.documents.map((document) => (
                            <DocumentPreview
                                key={`${application._id}-${document.r2Key}`}
                                document={document}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function InterestedApplicationsTab() {
    const { data, isLoading, error } = useInterestedApplications();
    const applications = data?.data || [];

    if (isLoading) return <LoadingState />;
    if (error) {
        return (
            <div className="p-6">
                <EmptyState
                    icon={<FileText className="w-12 h-12" />}
                    title="Unable to load interested users"
                    description="There was a problem fetching the interest applications for your posts."
                />
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="p-6">
                <EmptyState
                    icon={<BriefcaseBusiness className="w-12 h-12" />}
                    title="No interested users yet"
                    description="When users click Interested on one of your published posts, their details and documents will appear here."
                />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-fadeIn">
            {applications.map((application) => (
                <ApplicationCard key={application._id} application={application} />
            ))}
        </div>
    );
}
