import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";

const API = "http://localhost:5000/api/posts";

export function usePosts() {
  const { user } = useAuth();

  const query = useInfiniteQuery({
    queryKey: ["posts"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const headers: HeadersInit = {};
      if (user?.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }

      const url = new URL(API);
      if (pageParam) {
        url.searchParams.append("cursor", pageParam);
      }

      const res = await fetch(url.toString(), { headers });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();

      return {
        ...data,
        posts: data.posts.map((p: any) => ({
          ...p,
          profiles: p.user || { username: "unknown", display_name: "Unknown", avatar_url: null },
        }))
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : null,
  });

  return query;
}

export function useUserPosts(userId: string | undefined) {
  const { user } = useAuth();

  const query = useInfiniteQuery({
    queryKey: ["posts", "user", userId],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      if (!userId) return { posts: [], nextCursor: null, hasMore: false };
      const headers: HeadersInit = {};
      if (user?.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }

      const url = new URL(`${API}/user/${userId}`);
      if (pageParam) {
        url.searchParams.append("cursor", pageParam);
      }

      const res = await fetch(url.toString(), { headers });
      if (!res.ok) throw new Error("Failed to fetch user posts");
      const data = await res.json();

      return {
        ...data,
        posts: data.posts.map((p: any) => ({
          ...p,
          profiles: p.user || { username: "unknown", display_name: "Unknown", avatar_url: null },
        }))
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : null,
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
        formData.append('image', mediaFile);
        body = formData;
      } else {
        body = JSON.stringify({ content, image_url: null });
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(API, {
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

// ─── Like toggle with optimistic update ─────────────────────────────────────
export function useToggleLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.token) throw new Error("Not authenticated");

      const res = await fetch(`${API}/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error("Failed to toggle like");
      return res.json() as Promise<{ liked: boolean; likesCount: number }>;
    },

    // Optimistic update: instant UI feedback
    onMutate: async (postId: string) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      // We could also cancel specific user queries, but let's keep it simple

      // Snapshot previous state for rollback
      const previousPosts = queryClient.getQueryData(["posts"]);

      // Optimistically toggle in cache
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) => {
              if ((post._id || post.id) === postId) {
                const wasLiked = post.likedByMe;
                return {
                  ...post,
                  likedByMe: !wasLiked,
                  likesCount: Math.max(0, (post.likesCount || 0) + (wasLiked ? -1 : 1)),
                };
              }
              return post;
            }),
          })),
        };
      });

      return { previousPosts };
    },

    // On error: rollback to snapshot
    onError: (_err, _postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },

    // On success: update with server truth
    onSettled: (_data, _error, postId) => {
      // Sync server-side count to be safe
      if (_data && !_error) {
        queryClient.setQueryData(["posts"], (old: any) => {
          if (!old || !old.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((post: any) => {
                if ((post._id || post.id) === postId) {
                  return { ...post, liked: _data.liked, likesCount: _data.likesCount, likedByMe: _data.liked };
                }
                return post;
              }),
            })),
          };
        });
      }
    },
  });
}
