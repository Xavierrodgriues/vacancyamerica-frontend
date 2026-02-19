import { useState, lazy, Suspense, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/UserAvatar";
const CommentSection = lazy(() => import("@/components/CommentSection").then(module => ({ default: module.CommentSection })));
import { CommentSkeleton } from "@/components/Skeletons";
import { timeAgo } from "@/lib/time";
import { MessageCircle, Heart, Share, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useToggleLike } from "@/hooks/use-posts";
import { toast } from "sonner";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface PostProfile {
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface Post {
  _id?: string;
  id?: string;
  user_id?: string;
  user?: any;
  content: string;
  image_url: string | null;
  video_url?: string | null;
  createdAt?: string;
  created_at?: string;
  profiles: PostProfile;
  likesCount?: number;
  likedByMe?: boolean;
}

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const toggleLike = useToggleLike();

  const postId = post._id || post.id || "";
  const createdAt = post.createdAt || post.created_at || new Date().toISOString();
  const liked = post.likedByMe || false;
  const likesCount = post.likesCount || 0;

  const videoRef = useRef<HTMLVideoElement>(null);
  const { containerRef, isVisible } = useIntersectionObserver({ threshold: 0.5 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, [isVisible]);

  const handleLike = () => {
    if (!user) {
      toast.error("Sign in to like posts");
      return;
    }
    toggleLike.mutate(postId);
  };

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
            </div>

            <p className="mt-1 text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {post.content}
            </p>

            {post.image_url && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-post-border bg-black/5 dark:bg-white/5">
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="max-h-[512px] w-full object-contain"
                  loading={priority ? "eager" : "lazy"}
                  {...(priority ? { fetchPriority: "high" } : {})}
                />
              </div>
            )}

            {post.video_url && (
              <div ref={containerRef} className="mt-3 rounded-2xl overflow-hidden border border-post-border">
                <video
                  ref={videoRef}
                  src={post.video_url}
                  controls
                  /* autoPlay removed, managed by observer */
                  loop
                  muted
                  playsInline
                  className="w-full max-h-[600px] object-contain bg-black aspect-video"
                  preload="metadata"
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
                className={`rounded-full gap-1.5 px-2 transition-all duration-200 ${liked
                  ? "text-destructive hover:text-destructive/80"
                  : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  }`}
                onClick={handleLike}
                disabled={toggleLike.isPending}
              >
                <Heart
                  className={`h-4 w-4 transition-transform duration-200 ${liked ? "fill-current scale-110" : ""
                    }`}
                />
                {likesCount > 0 && (
                  <span className="text-sm tabular-nums">{likesCount}</span>
                )}
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
              {/* Follow button - visible if not own post */}
              {user && post.profiles.username !== user.username && (
                <Link to={`/profile/${post.profiles.username}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full gap-1.5 px-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="text-sm">Follow</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {showComments && (
        <Suspense fallback={<CommentSkeleton />}>
          <CommentSection postId={postId || ""} />
        </Suspense>
      )}
    </article>
  );
}
