import { useState } from "react";
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/UserAvatar";
import { CommentSection } from "@/components/CommentSection";
import { timeAgo } from "@/lib/time";
import { MessageCircle, Heart, Share, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
// import { supabase } from "@/integrations/supabase/client"; // Removed Supabase import
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PostProfile {
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface Post {
  _id?: string;
  id?: string;
  user_id?: string;
  user?: any; // For flexibility
  content: string;
  image_url: string | null;
  createdAt?: string;
  created_at?: string;
  profiles: PostProfile;
}

export function PostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Handle different ID formats (MongoDB _id vs Supabase id/user_id)
  const postId = post._id || post.id;
  const postUserId = post.user?._id || post.user_id; // Check populated user object first, then user_id (if flattened)

  const isOwner = user && (user._id === postUserId || user.username === post.profiles.username);

  const handleDelete = async () => {
    if (!user || !user.token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!res.ok) throw new Error("Failed to delete post");

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const createdAt = post.createdAt || post.created_at || new Date().toISOString();

  return (
    <article className="border-b border-post-border hover-card">
      <div className="p-4">
        <div className="flex gap-3">
          <Link to={`/profile/${post.profiles.username}`} className="flex-shrink-0">
            <UserAvatar
              avatarUrl={post.profiles.avatar_url}
              displayName={post.profiles.display_name}
              size="md"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <Link
                to={`/profile/${post.profiles.username}`}
                className="font-bold text-foreground hover:underline truncate"
              >
                {post.profiles.display_name}
              </Link>
              <Link
                to={`/profile/${post.profiles.username}`}
                className="text-muted-foreground truncate"
              >
                @{post.profiles.username}
              </Link>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground text-sm">{timeAgo(createdAt)}</span>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <p className="mt-1 text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {post.content}
            </p>

            {post.image_url && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-post-border">
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="max-h-[512px] w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex items-center gap-6 mt-3 -ml-2">
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full gap-1.5 px-2 ${showComments ? "text-primary" : ""}`}
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Reply</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full gap-1.5 px-2 ${liked ? "text-destructive hover:text-destructive/80" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"}`}
                onClick={() => setLiked(!liked)}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                <span className="text-sm">{liked ? 1 : ""}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full gap-1.5 px-2"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  toast.success("Link copied!");
                }}
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {showComments && <CommentSection postId={postId || ""} />}
    </article>
  );
}
