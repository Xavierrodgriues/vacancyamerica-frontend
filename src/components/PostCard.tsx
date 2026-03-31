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
import { useFriends } from "@/hooks/use-friends";
import { toast } from "sonner";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { formatCompactNumber } from "@/lib/utils";

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [heartAnim, setHeartAnim] = useState<{ id: number; x: number; y: number } | null>(null);
  const { user } = useAuth();
  const toggleLike = useToggleLike();
  const { data: friends } = useFriends();

  const postId = post._id || post.id || "";
  const createdAt = post.createdAt || post.created_at || new Date().toISOString();
  const liked = post.likedByMe || false;
  const likesCount = post.likesCount || 0;
  
  const isFriend = friends?.some(f => f.username === post.profiles.username);

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

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to like posts");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHeartAnim({ id: Date.now(), x, y });

    if (!liked && !toggleLike.isPending) {
      toggleLike.mutate(postId);
    }

    setTimeout(() => {
      setHeartAnim(null);
    }, 1000);
  };



  return (
    <article className="bg-white rounded-2xl border border-post-border shadow-sm hover:shadow-md transition-all sm:mx-4 sm:my-4 mx-0 my-2 overflow-hidden">
      <div className="p-4">
        {/* Header: avatar + name/time in a flex row */}
        <div className="flex gap-3 items-start">
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
          </div>
        </div>

        {/* Post content — starts from the left edge, below the header row */}
        <p className="mt-2 text-foreground whitespace-pre-wrap break-words leading-relaxed">
          {post.content}
        </p>

        {/* Image — full width (no left indent), like LinkedIn */}
        {post.image_url && (
          <div 
            className="mt-3 rounded-2xl overflow-hidden border border-post-border bg-muted/30 relative flex items-center justify-center min-h-[300px] sm:min-h-[400px] select-none"
            onDoubleClick={handleDoubleClick}
          >
            {heartAnim && (
              <div
                key={heartAnim.id}
                className="absolute pointer-events-none z-50 animate-heart-float"
                style={{ left: heartAnim.x, top: heartAnim.y }}
              >
                <Heart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-2xl opacity-90" />
              </div>
            )}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img
              src={post.image_url}
              alt="Post"
              className={`max-h-[512px] w-full object-contain transition-opacity duration-300 relative ${imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              loading={priority ? "eager" : "lazy"}
              onLoad={() => setImageLoaded(true)}
              {...(priority ? { fetchPriority: "high" } : {})}
            />
          </div>
        )}

        {/* Video — full width, like LinkedIn */}
        {post.video_url && (
          <div 
            ref={containerRef} 
            className="mt-3 rounded-2xl overflow-hidden border border-post-border relative select-none"
            onDoubleClick={handleDoubleClick}
          >
            {heartAnim && (
              <div
                key={heartAnim.id}
                className="absolute pointer-events-none z-50 animate-heart-float"
                style={{ left: heartAnim.x, top: heartAnim.y }}
              >
                <Heart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-2xl opacity-90" />
              </div>
            )}
            <video
              ref={videoRef}
              src={post.video_url}
              controls
              loop
              muted
              playsInline
              className="w-full max-h-[600px] object-contain bg-black aspect-video"
              preload="metadata"
            />
          </div>
        )}

        {/* Action buttons */}
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
              <span className="text-sm tabular-nums">{formatCompactNumber(likesCount)}</span>
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
          {/* Follow button - visible if not own post and not already a friend */}
          {user && post.profiles.username !== user.username && !isFriend && (
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
      {showComments && (
        <Suspense fallback={<CommentSkeleton />}>
          <CommentSection postId={postId || ""} />
        </Suspense>
      )}
    </article>
  );
}
