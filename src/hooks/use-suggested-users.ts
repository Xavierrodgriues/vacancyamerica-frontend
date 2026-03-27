import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";

export function useSuggestedUsers() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["suggested-users"],
        queryFn: async () => {
            const res = await fetch(`http://localhost:5000/api/auth/suggested`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch suggested users");
            return res.json();
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
