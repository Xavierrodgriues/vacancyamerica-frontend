import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/UserAvatar";
import { useProfile } from "@/hooks/use-profile";
import { useCreatePost } from "@/hooks/use-posts";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CreatePost() {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile } = useProfile();
  const createPost = useCreatePost();

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      const limit = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for video, 5MB for image

      if (file.size > limit) {
        toast.error(`${isVideo ? "Video" : "Image"} must be less than ${isVideo ? "50MB" : "5MB"}`);
        return;
      }
      setMediaFile(file);
      setMediaType(isVideo ? "video" : "image");
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) return;
    try {
      await createPost.mutateAsync({ content: content.trim(), mediaFile: mediaFile || undefined });
      setContent("");
      removeMedia();
      toast.success("Post created!");
    } catch {
      toast.error("Failed to create post");
    }
  };

  return (
    <div className="border-b border-post-border p-4">
      <div className="flex gap-3">
        <UserAvatar
          avatarUrl={profile?.avatar_url}
          displayName={profile?.display_name || ""}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <Textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-0 bg-transparent resize-none text-lg placeholder:text-muted-foreground focus-visible:ring-0 p-0 min-h-[60px]"
            maxLength={280}
          />
          {mediaPreview && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-post-border">
              {mediaType === 'video' ? (
                <video src={mediaPreview} controls className="w-full max-h-[600px] object-contain bg-black aspect-video" />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="max-h-80 w-full object-cover"
                />
              )}
              <button
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-foreground/70 text-background rounded-full p-1 hover:bg-foreground/90 transition-colors z-10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-post-border">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleMediaSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 rounded-full h-9 w-9"
                onClick={() => fileInputRef.current?.click()}
                title="Add media"
              >
                <ImagePlus className="h-5 w-5" />
              </Button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={(!content.trim() && !mediaFile) || createPost.isPending}
              className="rounded-full px-5 font-bold"
              size="sm"
            >
              {createPost.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
