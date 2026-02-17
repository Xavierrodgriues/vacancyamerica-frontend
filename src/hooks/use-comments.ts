import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";

export function useComments(postId: string) {
  const query = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await fetch(`https://vacancyamerica-backend.onrender.com/api/comments/${postId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const comments = await res.json();

      return comments.map((c: any) => ({
        ...c,
        profiles: c.user || { username: "unknown", display_name: "Unknown", avatar_url: null },
      }));
    },
    enabled: !!postId,
  });

  return query;
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) => {
      if (!user || !user.token) throw new Error("Not authenticated");

      const res = await fetch("https://vacancyamerica-backend.onrender.com/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ content, postId, parentId })
      });

      if (!res.ok) {
        const errorPayload = await res.json();
        throw new Error(errorPayload.message || "Failed to add comment");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!user || !user.token) throw new Error("Not authenticated");

      const res = await fetch(`https://vacancyamerica-backend.onrender.com/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (!res.ok) {
        const errorPayload = await res.json();
        throw new Error(errorPayload.message || "Failed to delete comment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}
