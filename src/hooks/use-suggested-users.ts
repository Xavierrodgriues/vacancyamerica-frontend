import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { BASE_URL } from "@/lib/constants";

export function useSuggestedUsers() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["suggested-users"],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/auth/suggested`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch suggested users");
            return res.json();
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
