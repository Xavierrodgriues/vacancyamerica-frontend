import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import { useEffect } from "react";
import { toast } from "sonner";
import { BASE_URL } from "@/lib/constants";

export interface FriendRequest {
    _id: string;
    sender: {
        _id: string;
        username: string;
        display_name: string;
        avatar_url: string | null;
    };
    receiver: {
        _id: string;
        username: string;
        display_name: string;
        avatar_url: string | null;
    };
    status: string;
    createdAt: string;
}

export interface UserProfile {
    _id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
}

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function useFriends() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ["friends", user?._id],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/friends`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch friends");
            return res.json() as Promise<UserProfile[]>;
        },
        enabled: !!user,
        staleTime: STALE_TIME,
    });
}

export interface ConnectionStatus {
    status: 'none' | 'pending' | 'accepted' | 'self';
    senderId?: string;
    requestId?: string;
}

export function useConnectionStatus(userId: string) {
    const { user } = useAuth();
    return useQuery({
        queryKey: ["connection-status", userId],
        queryFn: async () => {
             const res = await fetch(`${BASE_URL}/api/friends/status/${userId}`, {
                headers: { Authorization: `Bearer ${user?.token}` },
             });
             if (!res.ok) throw new Error("Failed to fetch connection status");
             return res.json() as Promise<ConnectionStatus>;
        },
        enabled: !!user && !!userId,
        staleTime: STALE_TIME,
    });
}

export function useInfiniteFriends() {
    const { user } = useAuth();
    return useInfiniteQuery({
        queryKey: ["friends", "infinite", user?._id],
        queryFn: async ({ pageParam = null }) => {
            const url = new URL(`${BASE_URL}/api/friends`);
            url.searchParams.append("limit", "20");
            if (pageParam) url.searchParams.append("cursor", pageParam);

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch friends");
            return res.json() as Promise<{ friends: UserProfile[], nextCursor: string | null }>;
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!user,
        staleTime: STALE_TIME,
        initialPageParam: null as string | null,
    });
}

export function useFriendRequests() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ["friend-requests", user?._id],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/friends/requests`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch friend requests");
            return res.json() as Promise<FriendRequest[]>;
        },
        enabled: !!user,
        staleTime: STALE_TIME, // Caching requests as well
    });
}

export function useFriendRealtimeUpdates() {
    const { socket } = useSocket();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    useEffect(() => {
        if (!socket || !user) return;

        const handleNewActivity = (activity: any) => {
            if (activity.type === 'FOLLOW') {
                // Determine if it's an incoming friend request or an accepted friend request
                // In this architecture, FOLLOW represents sending a request.
                // Activity.actor is the sender. Our current user is the recipient.
                
                // Partial Cache Update for Friend Requests
                queryClient.setQueryData<FriendRequest[]>(["friend-requests", user._id], (oldData) => {
                    const newReq: FriendRequest = {
                        _id: activity._id, // Assume unique enough or need exact request ID. Realistically, we might want to refetch or manually construct
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        sender: activity.actor,
                        receiver: {
                            _id: user._id,
                            username: user.username,
                            display_name: user.display_name,
                            avatar_url: user.avatar_url || null
                        }
                    };
                    if (!oldData) return [newReq];
                    // Prevent duplicates
                    if (oldData.some(r => r.sender._id === newReq.sender._id)) return oldData;
                    return [newReq, ...oldData];
                });
                
                // We're dynamically updating UI without triggering network fetches immediately.
                toast.success(`${activity.actor.display_name} sent you a friend request!`);
            }
        };

        socket.on('new_activity', handleNewActivity);
        
        return () => {
            socket.off('new_activity', handleNewActivity);
        };
    }, [socket, queryClient, user]);
}

export function useSendFriendRequest() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (userId: string) => {
            const res = await fetch(`${BASE_URL}/api/friends/request/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to send request");
            }
            return res.json();
        },
        onSuccess: (data, userId) => {
            toast.success("Friend request sent!");
            // Partial update
            queryClient.setQueryData<FriendRequest[]>(["friend-requests", user?._id], (oldData) => {
                if (!oldData) return [data];
                return [...oldData, data];
            });
            queryClient.setQueryData(["connection-status", userId], {
                status: 'pending',
                senderId: user?._id,
                requestId: data._id
            });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });
}

export function useAcceptFriendRequest() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (requestId: string) => {
            const res = await fetch(`${BASE_URL}/api/friends/accept/${requestId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to accept request");
            return res.json();
        },
        onSuccess: (_, requestId) => {
            toast.success("Friend request accepted!");
            
            queryClient.invalidateQueries({ queryKey: ["friends"] });
            queryClient.invalidateQueries({ queryKey: ["friends", "infinite"] });
            queryClient.invalidateQueries({ queryKey: ["connection-status"] });
            
            queryClient.setQueryData<FriendRequest[]>(["friend-requests", user?._id], (oldData) => {
                 if (!oldData) return [];
                 return oldData.filter(r => r._id !== requestId);
            });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}

export function useCancelFriendRequest() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (requestId: string) => {
            const res = await fetch(`${BASE_URL}/api/friends/request/${requestId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to cancel request");
            return res.json();
        },
        onSuccess: (_, requestId) => {
            toast.success("Request removed");
            queryClient.setQueryData<FriendRequest[]>(["friend-requests", user?._id], (oldData) => {
                if (!oldData) return [];
                return oldData.filter(r => r._id !== requestId);
           });
           queryClient.invalidateQueries({ queryKey: ["connection-status"] });
           queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}

export function useUnfriendUser() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (friendId: string) => {
            const res = await fetch(`${BASE_URL}/api/friends/${friendId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to unfriend");
            return res.json();
        },
        onSuccess: (_, friendId) => {
            toast.success("Unfriended user");
            
            // Partial update friends list
            queryClient.setQueryData<UserProfile[]>(["friends", user?._id], (oldData) => {
                if (!oldData) return [];
                return oldData.filter(f => f._id !== friendId);
            });
            
            queryClient.setQueryData(["connection-status", friendId], { status: 'none' });
            queryClient.invalidateQueries({ queryKey: ["friends", "infinite"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}

export function useBlockUser() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (userId: string) => {
            const res = await fetch(`${BASE_URL}/api/friends/block/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to block user");
            return res.json();
        },
        onSuccess: (_, blockedUserId) => {
            toast.success("User blocked");
            
            queryClient.setQueryData<UserProfile[]>(["friends", user?._id], (oldData) => {
                if (!oldData) return [];
                return oldData.filter(f => f._id !== blockedUserId);
            });
            queryClient.setQueryData<FriendRequest[]>(["friend-requests", user?._id], (oldData) => {
                if (!oldData) return [];
                return oldData.filter(r => r.sender._id !== blockedUserId && r.receiver._id !== blockedUserId);
           });
           
            queryClient.setQueryData(["connection-status", blockedUserId], { status: 'none' });
            queryClient.invalidateQueries({ queryKey: ["friends", "infinite"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}

