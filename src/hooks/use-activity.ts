import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import { useEffect } from "react";
import { BASE_URL } from "@/lib/constants";

export interface Activity {
    _id: string;
    type: 'LIKE' | 'COMMENT' | 'FOLLOW';
    actor: {
        _id: string;
        username: string;
        display_name: string;
        avatar_url: string;
    };
    post?: {
        _id: string;
        content: string;
        image_url?: string;
    };
    comment?: {
        _id: string;
        content: string;
    };
    isRead: boolean;
    createdAt: string;
}

export function useActivity() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["activity", user?._id],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/activity`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch activity");
            return res.json() as Promise<Activity[]>;
        },
        enabled: !!user,
    });

    // Real-Time Socket Listener
    useEffect(() => {
        if (!socket || !user) return;

        const handleNewActivity = (activity: Activity) => {
            queryClient.setQueryData(["activity", user._id], (old: Activity[] | undefined) => {
                if (!old) return [activity];
                if (old.some(a => a._id === activity._id)) return old; // Avoid dups
                return [activity, ...old];
            });
        };

        socket.on("new_activity", handleNewActivity);

        return () => {
            socket.off("new_activity", handleNewActivity);
        };
    }, [socket, user, queryClient]);

    return query;
}

export function useMarkActivityRead() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await fetch(`${BASE_URL}/api/activity/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to mark activity read");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["activity"] });
        },
    });
}

export function useDeleteActivity() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (activityId: string) => {
            const res = await fetch(`${BASE_URL}/api/activity/${activityId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to delete activity");
            return res.json();
        },
        onMutate: async (activityId: string) => {
            await queryClient.cancelQueries({ queryKey: ["activity", user?._id] });
            const previousActivity = queryClient.getQueryData<Activity[]>(["activity", user?._id]);
            
            if (previousActivity) {
                queryClient.setQueryData<Activity[]>(
                    ["activity", user?._id],
                    previousActivity.filter((act) => act._id !== activityId)
                );
            }
            return { previousActivity };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousActivity) {
                queryClient.setQueryData(["activity", user?._id], context.previousActivity);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["activity", user?._id] });
        },
    });
}
