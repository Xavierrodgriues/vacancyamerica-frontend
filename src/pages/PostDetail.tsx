import { useParams, useNavigate } from "react-router-dom";
import { usePost } from "@/hooks/use-posts";
import { AppLayout } from "@/components/AppLayout";
import { PostCard } from "@/components/PostCard";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, isError, error } = usePost(id);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto w-full pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 px-1 sticky top-[64px] bg-[#f8f9fc]/80 backdrop-blur-md z-10 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8 rounded-full hover:bg-slate-200/50"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <h2 className="text-lg font-bold text-foreground">Post</h2>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Loading post…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Post not found</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {(error as any)?.message || "This post might have been deleted or never existed."}
            </p>
            <Button onClick={() => navigate("/home")} variant="outline" className="rounded-full">
              Go back home
            </Button>
          </div>
        ) : post ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PostCard post={post} priority={true} />
            {/* The PostCard component already natively renders comments underneath itself via the <Comments /> component when Reply is clicked, 
                and we can leave it as a native behavior or auto-expand comments. For now, matching Home feed behavior exactly. */}
          </div>
        ) : null}
      </div>
      
      {/* Mobile padding */}
      <div className="h-16 md:hidden" />
    </AppLayout>
  );
}
