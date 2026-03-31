import { useState, lazy, Suspense, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/UserAvatar";
const CommentSection = lazy(() => import("@/components/CommentSection").then(module => ({ default: module.CommentSection })));
import { CommentSkeleton } from "@/components/Skeletons";
import { timeAgo } from "@/lib/time";
import { MessageCircle, Heart, Share2, UserPlus, MoreHorizontal } from "lucide-react";
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
  const [likeAnimating, setLikeAnimating] = useState(false);
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
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
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
    <article className="post-card group bg-white rounded-2xl border border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 mx-0 my-3 sm:mx-2 overflow-hidden">
      <div className="p-4 pb-0">
        {/* Header */}
        <div className="flex gap-3 items-center justify-between">
          <div className="flex gap-3 items-center min-w-0">
            <Link to={`/profile/${post.profiles.username}`} className="flex-shrink-0 relative">
              <div className="rounded-full ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
                <UserAvatar
                  avatarUrl={post.profiles.avatar_url}
                  displayName={post.profiles.display_name}
                  size="md"
                />
              </div>
              {/* Live dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={`/profile/${post.profiles.username}`}
                  className="font-bold text-[14px] text-foreground hover:text-primary transition-colors duration-150 truncate"
                >
                  {post.profiles.display_name}
                </Link>
                <Link
                  to={`/profile/${post.profiles.username}`}
                  className="text-muted-foreground text-[13px] truncate"
                >
                  @{post.profiles.username}
                </Link>
              </div>
              <span className="text-muted-foreground text-[11px] font-medium">{timeAgo(createdAt)}</span>
            </div>
          </div>
          {/* Follow + More */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {user && post.profiles.username !== user.username && !isFriend && (
              <Link to={`/profile/${post.profiles.username}`}>
                <button className="flex items-center gap-1 text-[12px] font-semibold text-primary border border-primary/30 hover:bg-primary hover:text-white rounded-full px-3 py-1 transition-all duration-200">
                  <UserPlus className="h-3 w-3" />
                  Follow
                </button>
              </Link>
            )}
            <button className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors duration-150 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <p className="mt-3 mb-3 text-[14px] text-foreground whitespace-pre-wrap break-words leading-[1.65] tracking-[0.01em]">
          {post.content}
        </p>
      </div>

      {/* Image — fixed height container like LinkedIn so all posts align */}
      {post.image_url && (
        <div
          className="mx-0 relative bg-[#f2f2f2] select-none cursor-zoom-in flex items-center justify-center overflow-hidden"
          style={{ height: 460 }}
          onDoubleClick={handleDoubleClick}
        >
          {heartAnim && (
            <div
              key={heartAnim.id}
              className="absolute pointer-events-none z-50 animate-heart-float"
              style={{ left: heartAnim.x, top: heartAnim.y }}
            >
              <Heart className="w-20 h-20 fill-rose-500 text-rose-500 drop-shadow-2xl" />
            </div>
          )}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
          )}
          <img
            src={post.image_url}
            alt="Post"
            className={`max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setImageLoaded(true)}
            {...(priority ? { fetchPriority: "high" } : {})}
          />
        </div>
      )}

      {/* Video */}
      {post.video_url && (
        <div
          ref={containerRef}
          className="mx-0 relative overflow-hidden select-none bg-black"
          onDoubleClick={handleDoubleClick}
        >
          {heartAnim && (
            <div
              key={heartAnim.id}
              className="absolute pointer-events-none z-50 animate-heart-float"
              style={{ left: heartAnim.x, top: heartAnim.y }}
            >
              <Heart className="w-20 h-20 fill-rose-500 text-rose-500 drop-shadow-2xl" />
            </div>
          )}
          <video
            ref={videoRef}
            src={post.video_url}
            controls
            loop
            muted
            playsInline
            className="w-full max-h-[560px] object-contain aspect-video"
            preload="metadata"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="px-4 py-2 flex items-center gap-1 border-t border-slate-50">
        {/* Reply */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 hover:bg-sky-50 hover:text-sky-600 ${showComments ? "text-sky-600 bg-sky-50" : "text-muted-foreground"}`}
        >
          <MessageCircle className="h-[17px] w-[17px]" />
          <span>Reply</span>
        </button>

        {/* Like */}
        <button
          onClick={handleLike}
          disabled={toggleLike.isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 ${liked
            ? "text-rose-500 bg-rose-50 hover:bg-rose-100"
            : "text-muted-foreground hover:bg-rose-50 hover:text-rose-500"}`}
        >
          <Heart
            className={`h-[17px] w-[17px] transition-all duration-200 ${liked ? "fill-rose-500" : ""} ${likeAnimating ? "scale-125" : "scale-100"}`}
          />
          {likesCount > 0 && (
            <span className="tabular-nums">{formatCompactNumber(likesCount)}</span>
          )}
        </button>

        {/* Share */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.origin);
            toast.success("Link copied!");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-muted-foreground hover:bg-violet-50 hover:text-violet-600 transition-all duration-150"
        >
          <Share2 className="h-[17px] w-[17px]" />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-slate-100">
          <Suspense fallback={<CommentSkeleton />}>
            <CommentSection postId={postId || ""} />
          </Suspense>
        </div>
      )}
    </article>
  );
}
