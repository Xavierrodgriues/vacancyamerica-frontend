import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";

export function usePosts() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      const posts = await res.json();

      // Map 'user' to 'profiles' to match existing UI expectations
      return posts.map((p: any) => ({
        ...p,
        profiles: p.user || { username: "unknown", display_name: "Unknown", avatar_url: null },
      }));
    },
  });

  return query;
}

export function useUserPosts(userId: string | undefined) {
  const query = useQuery({
    queryKey: ["posts", "user", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`http://localhost:5000/api/posts/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user posts");
      const posts = await res.json();

      return posts.map((p: any) => ({
        ...p,
        profiles: p.user || { username: "unknown", display_name: "Unknown", avatar_url: null },
      }));
    },
    enabled: !!userId,
  });

  return query;
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ content, mediaFile }: { content: string; mediaFile?: File }) => {
      if (!user || !user.token) throw new Error("Not authenticated");

      let body: any;
      const headers: HeadersInit = {
        "Authorization": `Bearer ${user.token}`
      };

      if (mediaFile) {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('image', mediaFile); // Multer expects 'image' field based on middleware config, even for video
        body = formData;
        // Content-Type header with FormData is set automatically by fetch to include boundary
      } else {
        body = JSON.stringify({ content, image_url: null });
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: headers,
        body: body
      });

      if (!res.ok) {
        const errorPayload = await res.json();
        throw new Error(errorPayload.message || "Failed to create post");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
