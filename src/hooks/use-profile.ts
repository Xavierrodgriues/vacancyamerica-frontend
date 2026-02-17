import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";

export function useProfile() {
  const { user } = useAuth();

  // If we already have the user in context, we could just return it, 
  // but keeping useQuery ensures consistency with existing code
  return useQuery({
    queryKey: ["profile", user?._id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const res = await fetch('https://vacancyamerica-backend.onrender.com/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      return { ...data, id: data._id, user_id: data._id };
    },
    enabled: !!user,
  });
}

export function useProfileByUsername(username: string) {
  return useQuery({
    queryKey: ["profile", "username", username],
    queryFn: async () => {
      const res = await fetch(`https://vacancyamerica-backend.onrender.com/api/auth/user/${username}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      // Map _id to id and user_id for compatibility
      return { ...data, id: data._id, user_id: data._id };
    },
    enabled: !!username,
  });
}
