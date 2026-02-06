import { CreatePost } from "@/components/CreatePost";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/use-posts";
import { AppLayout } from "@/components/AppLayout";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: posts, isLoading } = usePosts();

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-post-border">
        <h1 className="text-xl font-bold p-4">Home</h1>
      </header>

      {/* Create post */}
      <CreatePost />

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts?.length === 0 ? (
        <div className="text-center py-16 px-4">
          <h3 className="text-xl font-bold text-foreground mb-2">Welcome to X!</h3>
          <p className="text-muted-foreground">
            This is your home feed. Create your first post above!
          </p>
        </div>
      ) : (
        <div>
          {posts?.map((post: any) => (
            <PostCard key={post._id || post.id} post={post} />
          ))}
        </div>
      )}

      {/* Mobile bottom padding */}
      <div className="h-16 md:hidden" />
    </AppLayout>
  );
}
