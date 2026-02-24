import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/use-posts";
import { AppLayout } from "@/components/AppLayout";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export default function Home() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts();
  const posts = data?.pages.flatMap((page: any) => page.posts) || [];

  const { containerRef, isVisible } = useIntersectionObserver({ rootMargin: "400px" });

  useEffect(() => {
    if (isVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <AppLayout>
      {/* Header */}
      <header className="border-b border-post-border">
        <h1 className="text-xl font-bold p-4 text-foreground">Home</h1>
      </header>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts?.length === 0 ? (
        <div className="text-center py-16 px-4">
          <h3 className="text-xl font-bold text-foreground mb-2">Welcome!</h3>
          <p className="text-muted-foreground">
            No posts yet. Check back later for updates!
          </p>
        </div>
      ) : (
        <div className="pb-8">
          {posts.map((post: any) => (
            <PostCard key={post._id || post.id} post={post} />
          ))}

          {/* Infinite Scroll trigger element */}
          <div ref={containerRef} className="h-10 mt-4 flex justify-center items-center">
            {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
          </div>
        </div>
      )}

      {/* Mobile bottom padding */}
      <div className="h-16 md:hidden" />
    </AppLayout>
  );
}
