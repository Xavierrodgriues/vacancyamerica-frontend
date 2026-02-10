import { useState } from 'react';
import { Users } from 'lucide-react';
import { useAllAdmins } from '../hooks/use-notifications';
import { AdminCard } from './AdminCard';
import { LoadingState, EmptyState } from './SharedUI';

type AdminFilter = 'all' | 'pending' | 'approved' | 'rejected';

export function AdminManagementTab() {
    const [adminFilter, setAdminFilter] = useState<AdminFilter>('all');
    const { data: allAdmins = [], isLoading: adminsLoading } = useAllAdmins();

    // Filter admins based on selected filter
    const filteredAdmins = allAdmins.filter((admin: any) => {
        if (adminFilter === 'all') return true;
        return admin.status === adminFilter;
    });

    const adminCounts: Record<string, number> = {
        all: allAdmins.length,
        pending: allAdmins.filter((a: any) => a.status === 'pending').length,
        approved: allAdmins.filter((a: any) => a.status === 'approved').length,
        rejected: allAdmins.filter((a: any) => a.status === 'rejected').length,
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 animate-fadeIn">
            {/* Admin Filter Tabs */}
            <div className="border-b border-slate-800 px-6 pt-4">
                <div className="flex gap-2">
                    {(['all', 'pending', 'approved', 'rejected'] as AdminFilter[]).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setAdminFilter(filter)}
                            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all ${adminFilter === filter
                                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-slate-700 rounded-full">
                                {adminCounts[filter]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6">
                {adminsLoading ? (
                    <LoadingState />
                ) : filteredAdmins.length === 0 ? (
                    <EmptyState
                        icon={<Users className="w-12 h-12" />}
                        title={`No ${adminFilter} admins`}
                        description={adminFilter === 'pending' ? "No pending approval requests" : `No ${adminFilter} admins found`}
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredAdmins.map((admin: any) => (
                            <AdminCard key={admin._id} admin={admin} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
