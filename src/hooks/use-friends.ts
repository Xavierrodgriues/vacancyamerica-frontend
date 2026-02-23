import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

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

export function useFriends() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ["friends", user?._id],
        queryFn: async () => {
            const res = await fetch("http://localhost:5000/api/friends", {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch friends");
            return res.json() as Promise<UserProfile[]>;
        },
        enabled: !!user,
    });
}

export function useFriendRequests() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ["friend-requests", user?._id],
        queryFn: async () => {
            const res = await fetch("http://localhost:5000/api/friends/requests", {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch friend requests");
            return res.json() as Promise<FriendRequest[]>;
        },
        enabled: !!user,
    });
}

export function useSendFriendRequest() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (userId: string) => {
            const res = await fetch(`http://localhost:5000/api/friends/request/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to send request");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Friend request sent!");
            queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
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
            const res = await fetch(`http://localhost:5000/api/friends/accept/${requestId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to accept request");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Friend request accepted!");
            queryClient.invalidateQueries({ queryKey: ["friends"] });
            queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}

export function useCancelFriendRequest() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (requestId: string) => {
            const res = await fetch(`http://localhost:5000/api/friends/request/${requestId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to cancel request");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Request cancelled");
            queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}

export function useUnfriendUser() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (friendId: string) => {
            const res = await fetch(`http://localhost:5000/api/friends/${friendId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to unfriend");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Unfriended user");
            queryClient.invalidateQueries({ queryKey: ["friends"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}

export function useBlockUser() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (userId: string) => {
            const res = await fetch(`http://localhost:5000/api/friends/block/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to block user");
            return res.json();
        },
        onSuccess: () => {
            toast.success("User blocked");
            queryClient.invalidateQueries({ queryKey: ["friends"] });
            queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}
