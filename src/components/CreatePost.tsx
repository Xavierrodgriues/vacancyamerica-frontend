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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile } = useProfile();
  const createPost = useCreatePost();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;
    try {
      await createPost.mutateAsync({ content: content.trim(), imageFile: imageFile || undefined });
      setContent("");
      removeImage();
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
          {imagePreview && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-post-border">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-80 w-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-foreground/70 text-background rounded-full p-1 hover:bg-foreground/90 transition-colors"
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
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 rounded-full h-9 w-9"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-5 w-5" />
              </Button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={(!content.trim() && !imageFile) || createPost.isPending}
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
