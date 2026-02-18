import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSuperAdminAuth } from '../lib/super-admin-auth-context';

const API_URL = 'http://localhost:5000/api/superadmin/notifications';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    status: 'unread' | 'read' | 'actioned';
    actionTaken: 'approved' | 'rejected' | null;
    priority: string;
    createdAt: string;
}

interface NotificationsResponse {
    notifications: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export function useNotifications(page = 1, status?: string) {
    const { superAdmin } = useSuperAdminAuth();

    return useQuery<NotificationsResponse>({
        queryKey: ['notifications', page, status],
        queryFn: async () => {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (status) params.append('status', status);

            const res = await fetch(`${API_URL}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${superAdmin?.token}`
                }
            });

            if (!res.ok) throw new Error('Failed to fetch notifications');
            const data = await res.json();
            return data.data;
        },
        enabled: !!superAdmin?.token,
        refetchInterval: 10000,
        refetchOnWindowFocus: true
    });
}

export function useUnreadCount() {
    const { superAdmin } = useSuperAdminAuth();

    return useQuery<number>({
        queryKey: ['notifications', 'unreadCount'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/count`, {
                headers: {
                    'Authorization': `Bearer ${superAdmin?.token}`
                }
            });

            if (!res.ok) throw new Error('Failed to fetch count');
            const data = await res.json();
            return data.data.count;
        },
        enabled: !!superAdmin?.token,
        refetchInterval: 30000 // Refetch every 30 seconds
    });
}

export function useMarkAsRead() {
    const { superAdmin } = useSuperAdminAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const res = await fetch(`${API_URL}/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${superAdmin?.token}`
                }
            });

            if (!res.ok) throw new Error('Failed to mark as read');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
}

export function useMarkAllAsRead() {
    const { superAdmin } = useSuperAdminAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/read-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${superAdmin?.token}`
                }
            });

            if (!res.ok) throw new Error('Failed to mark all as read');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
}

export function useTakeAction() {
    const { superAdmin } = useSuperAdminAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ notificationId, action, reason }: {
            notificationId: string;
            action: 'approved' | 'rejected';
            reason?: string;
        }) => {
            const res = await fetch(`${API_URL}/${notificationId}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${superAdmin?.token}`
                },
                body: JSON.stringify({ action, reason })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to take action');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['pendingAdmins'] });
        }
    });
}

export function usePendingAdmins() {
    const { superAdmin } = useSuperAdminAuth();

    return useQuery({
        queryKey: ['pendingAdmins'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/admins/pending`, {
                headers: {
                    'Authorization': `Bearer ${superAdmin?.token}`
                }
            });

            if (!res.ok) throw new Error('Failed to fetch pending admins');
            const data = await res.json();
            return data.data;
        },
        enabled: !!superAdmin?.token,
        refetchInterval: 10000,
        refetchOnWindowFocus: true
    });
}

export function useAllAdmins(status?: string) {
    const { superAdmin } = useSuperAdminAuth();

    return useQuery({
        queryKey: ['allAdmins', status],
        queryFn: async () => {
            const params = status ? `?status=${status}` : '';
            const res = await fetch(`${API_URL}/admins${params}`, {
                headers: {
                    'Authorization': `Bearer ${superAdmin?.token}`
                }
            });

            if (!res.ok) throw new Error('Failed to fetch admins');
            const data = await res.json();
            return data.data;
        },
        enabled: !!superAdmin?.token,
        refetchInterval: 10000,
        refetchOnWindowFocus: true
    });
}

export function useUpdateAdminStatus() {
    const { superAdmin } = useSuperAdminAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ adminId, status, reason }: {
            adminId: string;
            status: 'approved' | 'rejected';
            reason?: string;
        }) => {
            const res = await fetch(`${API_URL}/admins/${adminId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${superAdmin?.token}`
                },
                body: JSON.stringify({ status, reason })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update status');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['pendingAdmins'] });
            queryClient.invalidateQueries({ queryKey: ['allAdmins'] });
        }
    });
}

export function useUpdateAdminLevel() {
    const { superAdmin } = useSuperAdminAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ adminId, level }: {
            adminId: string;
            level: number;
        }) => {
            const res = await fetch(`${API_URL}/admins/${adminId}/level`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${superAdmin?.token}`
                },
                body: JSON.stringify({ level })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update level');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allAdmins'] });
        }
    });
}
