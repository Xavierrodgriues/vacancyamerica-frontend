import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSuperAdminAuth } from '../lib/super-admin-auth-context';
import { useAdminAuth } from '../lib/admin-auth-context';

const API_URL = 'http://localhost:5000/api/admin/posts';

export interface AdminPost {
    _id: string;
    user: {
        _id: string;
        username: string;
        display_name: string;
        avatar_url: string;
    };
    content: string;
    image_url: string | null;
    video_url: string | null;
    status: 'pending' | 'pending_trusted' | 'published' | 'rejected';
    createdAt: string;
    rejectionReason?: string;
    approvedBy?: {
        display_name: string;
    };
}

// --- Regular Admin Hooks ---

export function useAdminPosts(page = 1) {
    const { admin } = useAdminAuth();
    return useQuery({
        queryKey: ['adminPosts', page],
        queryFn: async () => {
            const res = await fetch(`${API_URL}?page=${page}`, {
                headers: { 'Authorization': `Bearer ${admin?.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch posts');
            return res.json();
        },
        enabled: !!admin?.token
    });
}

export function useAdminPostStats() {
    const { admin } = useAdminAuth();
    return useQuery({
        queryKey: ['adminPostStats'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/stats`, {
                headers: { 'Authorization': `Bearer ${admin?.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
        },
        enabled: !!admin?.token
    });
}

export function useCreateAdminPost() {
    const { admin } = useAdminAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { content: string; mediaFile?: File }) => {
            const formData = new FormData();
            formData.append('content', data.content);
            if (data.mediaFile) {
                formData.append('media', data.mediaFile);
            }

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${admin?.token}` },
                body: formData
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create post');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
            queryClient.invalidateQueries({ queryKey: ['adminPostStats'] });
        }
    });
}

export function useDeleteAdminPost() {
    const { admin } = useAdminAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${admin?.token}` }
            });

            if (!res.ok) {
                throw new Error('Failed to delete post');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
            queryClient.invalidateQueries({ queryKey: ['adminPostStats'] });
        }
    });
}

// --- Super Admin Hooks ---

export function usePendingPosts() {
    const { superAdmin } = useSuperAdminAuth();
    return useQuery<AdminPost[]>({
        queryKey: ['adminPosts', 'pending'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/pending`, {
                headers: { 'Authorization': `Bearer ${superAdmin?.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch pending posts');
            const data = await res.json();
            return data.data;
        },
        enabled: !!superAdmin?.token,
        staleTime: 60000, // 1 minute
        refetchOnWindowFocus: false
    });
}

export function useTrustedPosts() {
    const { superAdmin } = useSuperAdminAuth();
    return useQuery<AdminPost[]>({
        queryKey: ['adminPosts', 'trusted'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/trusted`, {
                headers: { 'Authorization': `Bearer ${superAdmin?.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch trusted posts');
            const data = await res.json();
            return data.data;
        },
        enabled: !!superAdmin?.token,
        staleTime: 60000, // 1 minute
        refetchOnWindowFocus: false
    });
}

export function useRejectedPosts() {
    const { superAdmin } = useSuperAdminAuth();
    return useQuery<AdminPost[]>({
        queryKey: ['adminPosts', 'rejected'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/rejected`, {
                headers: { 'Authorization': `Bearer ${superAdmin?.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch rejected posts');
            const data = await res.json();
            return data.data;
        },
        enabled: !!superAdmin?.token,
        staleTime: 60000, // 1 minute
        refetchOnWindowFocus: false
    });
}

export function useApprovePost() {
    const { superAdmin } = useSuperAdminAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId: string) => {
            const res = await fetch(`${API_URL}/${postId}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${superAdmin?.token}` }
            });
            if (!res.ok) throw new Error('Failed to approve post');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
        }
    });
}

export function useRejectPost() {
    const { superAdmin } = useSuperAdminAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, reason }: { postId: string; reason: string }) => {
            const res = await fetch(`${API_URL}/${postId}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${superAdmin?.token}`
                },
                body: JSON.stringify({ reason })
            });
            if (!res.ok) throw new Error('Failed to reject post');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
        }
    });
}
