import { useState } from "react";
import { useComments, useCreateComment } from "@/hooks/use-comments";
import { UserAvatar } from "@/components/UserAvatar";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { timeAgo } from "@/lib/time";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface CommentProfile {
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: CommentProfile;
}

export function CommentSection({ postId }: { postId: string }) {
  const [commentText, setCommentText] = useState("");
  const { data: comments, isLoading } = useComments(postId);
  const createComment = useCreateComment();
  const { data: profile } = useProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await createComment.mutateAsync({ postId, content: commentText.trim() });
      setCommentText("");
    } catch {
      toast.error("Failed to post comment");
    }
  };

  return (
    <div className="border-t border-post-border bg-secondary/30">
      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 p-3 border-b border-post-border">
        <UserAvatar
          avatarUrl={profile?.avatar_url}
          displayName={profile?.display_name || ""}
          size="sm"
        />
        <Input
          placeholder="Post your reply..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 rounded-full bg-background border-post-border"
          maxLength={280}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!commentText.trim() || createComment.isPending}
          className="rounded-full h-8 w-8 flex-shrink-0"
        >
          {createComment.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        </div>
      ) : (
        <div>
          {(comments as any[])?.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 border-b border-post-border last:border-b-0">
              <Link to={`/profile/${comment.profiles.username}`}>
                <UserAvatar
                  avatarUrl={comment.profiles.avatar_url}
                  displayName={comment.profiles.display_name}
                  size="sm"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Link
                    to={`/profile/${comment.profiles.username}`}
                    className="font-semibold text-sm text-foreground hover:underline"
                  >
                    {comment.profiles.display_name}
                  </Link>
                  <span className="text-muted-foreground text-sm">
                    @{comment.profiles.username}
                  </span>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-muted-foreground text-xs">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-0.5 break-words">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments?.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No replies yet. Be the first!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
