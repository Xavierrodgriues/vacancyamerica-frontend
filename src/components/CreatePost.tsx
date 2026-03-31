import { useState, useRef } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { useProfile } from "@/hooks/use-profile";
import { useCreatePost } from "@/hooks/use-posts";
import { ImagePlus, X, Loader2, Smile } from "lucide-react";
import { toast } from "sonner";

export function CreatePost() {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile } = useProfile();
  const createPost = useCreatePost();

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      const limit = isVideo ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > limit) {
        toast.error(`${isVideo ? "Video" : "Image"} must be less than ${isVideo ? "25MB" : "10MB"}`);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
      setIsFocused(false);
      toast.success("Post published! ✨");
    } catch {
      toast.error("Failed to create post");
    }
  };

  const canPost = (content.trim() || mediaFile) && !createPost.isPending;

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 mx-0 sm:mx-2 mb-3 overflow-hidden ${isFocused ? "border-primary/40 shadow-[0_4px_24px_rgba(230,57,70,0.12)]" : "border-slate-100 shadow-[0_1px_8px_rgba(0,0,0,0.06)]"}`}>
      <div className="p-4">
        <div className="flex gap-3 items-start">
          <UserAvatar
            avatarUrl={profile?.avatar_url}
            displayName={profile?.display_name || ""}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <textarea
              name="postContent"
              placeholder="Share something with the community…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => !content && !mediaFile && setIsFocused(false)}
              className="w-full bg-transparent resize-none text-[14px] text-foreground placeholder:text-slate-400 focus:outline-none min-h-[52px] leading-relaxed transition-all duration-200"
              maxLength={280}
              rows={isFocused || content ? 3 : 1}
            />

            {/* Character count */}
            {content.length > 200 && (
              <div className="flex justify-end mb-1">
                <span className={`text-[11px] font-medium tabular-nums ${content.length > 260 ? "text-rose-500" : "text-muted-foreground"}`}>
                  {280 - content.length}
                </span>
              </div>
            )}

            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                {mediaType === "video" ? (
                  <video src={mediaPreview} controls className="w-full max-h-[400px] object-contain bg-black" />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="max-h-72 w-full object-cover" />
                )}
                <button
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors backdrop-blur-sm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Toolbar */}
            <div className={`flex items-center justify-between mt-3 pt-3 border-t border-slate-100 transition-all duration-200 ${isFocused || content ? "opacity-100" : "opacity-60"}`}>
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  name="mediaFile"
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  onChange={handleMediaSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Add media"
                  className="p-2 rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-all duration-150"
                >
                  <ImagePlus className="h-[18px] w-[18px]" />
                </button>
                <button
                  title="Add emoji"
                  className="p-2 rounded-full text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all duration-150"
                >
                  <Smile className="h-[18px] w-[18px]" />
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canPost}
                className={`relative px-5 py-1.5 rounded-full text-[13px] font-bold transition-all duration-200 overflow-hidden ${canPost
                  ? "bg-primary text-white shadow-[0_4px_14px_rgba(230,57,70,0.35)] hover:shadow-[0_6px_20px_rgba(230,57,70,0.45)] hover:scale-105 active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
              >
                {createPost.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
