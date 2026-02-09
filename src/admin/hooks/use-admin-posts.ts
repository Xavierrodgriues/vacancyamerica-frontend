import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '../lib/admin-auth-context';

const API_BASE = 'http://localhost:5000/api/admin/posts';

interface Post {
    _id: string;
    content: string;
    image_url: string | null;
    video_url: string | null;
    user: {
        _id: string;
        username: string;
        display_name: string;
        avatar_url: string | null;
    };
    createdAt: string;
}

interface PostsResponse {
    success: boolean;
    data: Post[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

interface StatsResponse {
    success: boolean;
    data: {
        totalPosts: number;
        todayPosts: number;
        weeklyPosts: number;
    };
}

export function useAdminPosts(page = 1, limit = 20) {
    const { admin } = useAdminAuth();

    return useQuery({
        queryKey: ['admin-posts', page, limit],
        queryFn: async (): Promise<PostsResponse> => {
            if (!admin?.token) throw new Error('Not authenticated');

            const res = await fetch(`${API_BASE}?page=${page}&limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${admin.token}` }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to fetch posts');
            }

            return res.json();
        },
        enabled: !!admin?.token
    });
}

export function useAdminPostStats() {
    const { admin } = useAdminAuth();

    return useQuery({
        queryKey: ['admin-post-stats'],
        queryFn: async (): Promise<StatsResponse> => {
            if (!admin?.token) throw new Error('Not authenticated');

            const res = await fetch(`${API_BASE}/stats`, {
                headers: { 'Authorization': `Bearer ${admin.token}` }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to fetch stats');
            }

            return res.json();
        },
        enabled: !!admin?.token
    });
}

export function useCreateAdminPost() {
    const queryClient = useQueryClient();
    const { admin } = useAdminAuth();

    return useMutation({
        mutationFn: async ({ content, mediaFile }: { content: string; mediaFile?: File }) => {
            if (!admin?.token) throw new Error('Not authenticated');

            let body: FormData | string;
            const headers: HeadersInit = {
                'Authorization': `Bearer ${admin.token}`
            };

            if (mediaFile) {
                const formData = new FormData();
                formData.append('content', content);
                formData.append('image', mediaFile);
                body = formData;
            } else {
                body = JSON.stringify({ content });
                headers['Content-Type'] = 'application/json';
            }

            const res = await fetch(API_BASE, {
                method: 'POST',
                headers,
                body
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create post');
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
            queryClient.invalidateQueries({ queryKey: ['admin-post-stats'] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
}

export function useUpdateAdminPost() {
    const queryClient = useQueryClient();
    const { admin } = useAdminAuth();

    return useMutation({
        mutationFn: async ({ id, content, mediaFile }: { id: string; content: string; mediaFile?: File }) => {
            if (!admin?.token) throw new Error('Not authenticated');

            let body: FormData | string;
            const headers: HeadersInit = {
                'Authorization': `Bearer ${admin.token}`
            };

            if (mediaFile) {
                const formData = new FormData();
                formData.append('content', content);
                formData.append('image', mediaFile);
                body = formData;
            } else {
                body = JSON.stringify({ content });
                headers['Content-Type'] = 'application/json';
            }

            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers,
                body
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to update post');
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
}

export function useDeleteAdminPost() {
    const queryClient = useQueryClient();
    const { admin } = useAdminAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            if (!admin?.token) throw new Error('Not authenticated');

            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${admin.token}` }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete post');
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
            queryClient.invalidateQueries({ queryKey: ['admin-post-stats'] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
}
