import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';
import { useUpdateAdminLevel } from '../hooks/use-notifications';
import { useSuperAdminAuth } from '../lib/super-admin-auth-context';

export function AdminCard({ admin }: { admin: any }) {
    const statusColors = {
        pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const updateLevel = useUpdateAdminLevel();
    const { superAdmin } = useSuperAdminAuth();
    const isSelf = superAdmin?._id === admin._id;

    const handleLevelChange = (newLevel: number) => {
        updateLevel.mutate({
            adminId: admin._id,
            level: newLevel
        }, {
            onSuccess: () => toast.success(`Admin level updated to ${newLevel}`),
            onError: (err: any) => toast.error(err.message)
        });
    };

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:bg-slate-800/70 transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-lg">
                        {admin.display_name?.charAt(0).toUpperCase() || admin.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">{admin.display_name || admin.username}</h4>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-slate-400">{admin.email}</p>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-amber-500 font-medium">Level {admin.admin_level || 0}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Joined: {new Date(admin.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-4">
                        {[0, 1, 2].map(level => (
                            <button
                                key={level}
                                disabled={isSelf || updateLevel.isPending}
                                onClick={() => handleLevelChange(level)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${(admin.admin_level || 0) === level
                                    ? 'bg-amber-500 text-slate-900'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                    } ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={`Set Level ${level}`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[admin.status as keyof typeof statusColors]}`}>
                        {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
            </div>
            {admin.rejectionReason && (
                <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-sm text-red-400">
                        <span className="font-medium">Rejection Reason:</span> {admin.rejectionReason}
                    </p>
                </div>
            )}
        </div>
    );
}
