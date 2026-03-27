import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/lib/constants";

export function useSearchUsers(query: string) {
    const { user } = useAuth();
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300); // 300ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    return useQuery({
        queryKey: ["search-users", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return [];
            const res = await fetch(`${BASE_URL}/api/auth/search?q=${encodeURIComponent(debouncedQuery)}`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!res.ok) throw new Error("Failed to search users");
            return res.json();
        },
        enabled: !!debouncedQuery && !!user,
        staleTime: 1000 * 60, // 1 minute
    });
}
