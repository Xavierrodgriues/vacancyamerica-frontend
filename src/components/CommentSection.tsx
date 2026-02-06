import { useState, useMemo } from "react";
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/use-comments";
import { UserAvatar } from "@/components/UserAvatar";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, MessageCircle, Trash2, X } from "lucide-react";
import { timeAgo } from "@/lib/time";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  parent_id: string | null;
  deleted: boolean;
  children?: Comment[];
}

// Recursive Comment Item Component
function CommentItem({
  comment,
  postId,
  depth = 0
}: {
  comment: Comment;
  postId: string;
  depth?: number
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const isOwner = user?.username === comment.profiles.username;
  const isDeleted = comment.deleted;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await createComment.mutateAsync({
        postId,
        content: replyText.trim(),
        parentId: comment.id
      });
      setReplyText("");
      setIsReplying(false);
    } catch {
      toast.error("Failed to post reply");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment.mutateAsync(comment.id);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className={cn("flex gap-3", depth > 0 && "mt-4")}>
      <div className="flex flex-col items-center">
        {!isDeleted ? (
          <Link to={`/profile/${comment.profiles.username}`}>
            <UserAvatar
              avatarUrl={comment.profiles.avatar_url}
              displayName={comment.profiles.display_name}
              size="sm"
            />
          </Link>
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        {/* Thread line */}
        {comment.children && comment.children.length > 0 && (
          <div className="w-px h-full bg-border my-2" />
        )}
      </div>

      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-center gap-1">
          {!isDeleted ? (
            <>
              <Link
                to={`/profile/${comment.profiles.username}`}
                className="font-semibold text-sm text-foreground hover:underline"
              >
                {comment.profiles.display_name}
              </Link>
              <span className="text-muted-foreground text-sm">
                @{comment.profiles.username}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground text-sm font-semibold italic">
              [deleted]
            </span>
          )}
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs">
            {timeAgo(comment.created_at)}
          </span>
        </div>

        <p className={cn("text-sm mt-0.5 break-words", isDeleted ? "text-muted-foreground italic" : "text-foreground")}>
          {comment.content}
        </p>

        {/* Actions */}
        {!isDeleted && (
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              Reply
            </button>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                disabled={deleteComment.isPending}
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
          </div>
        )}

        {/* Reply Input */}
        {isReplying && (
          <form onSubmit={handleReply} className="flex items-center gap-3 mt-3">
            <UserAvatar
              avatarUrl={profile?.avatar_url}
              displayName={profile?.display_name || ""}
              size="sm"
            />
            <Input
              placeholder={`Reply to @${comment.profiles.username}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 rounded-full bg-background border-post-border h-8 text-sm"
              maxLength={280}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={!replyText.trim() || createComment.isPending}
              className="rounded-full h-8 w-8 flex-shrink-0"
            >
              {createComment.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </Button>
          </form>
        )}

        {/* Nested Comments */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-4">
            {comment.children.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                postId={postId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({ postId }: { postId: string }) {
  const [commentText, setCommentText] = useState("");
  const { data: comments, isLoading } = useComments(postId);
  const createComment = useCreateComment();
  const { data: profile } = useProfile();

  // Transform flat comments into a tree structure
  const commentTree = useMemo(() => {
    if (!comments) return [];

    const commentMap = new Map<string, Comment>();
    const roots: Comment[] = [];

    // First pass: create all comment objects and map them
    comments.forEach((c: any) => {
      commentMap.set(c._id, {
        id: c._id,
        content: c.content,
        created_at: c.createdAt,
        profiles: c.user || { username: "unknown", display_name: "Unknown", avatar_url: null },
        parent_id: c.parent_id,
        deleted: c.deleted,
        children: []
      });
    });

    // Second pass: link children to parents
    commentMap.forEach((comment) => {
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        commentMap.get(comment.parent_id)!.children!.push(comment);
      } else {
        roots.push(comment);
      }
    });

    // Sort roots by date (newest first? or oldest first for comments? social media usually does oldest first for nested, or best first)
    // Let's stick to existing sort (created_at) which seemed to be oldest first in backend
    return roots;
  }, [comments]);

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
      {/* Root Comment Input */}
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

      {/* Comments Tree */}
      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        </div>
      ) : (
        <div className="p-3">
          {commentTree.map((comment) => (
            <div key={comment.id} className="mb-4 last:mb-0">
              <CommentItem comment={comment} postId={postId} />
            </div>
          ))}
          {commentTree.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No replies yet. Be the first!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
