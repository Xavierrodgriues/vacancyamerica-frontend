import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/use-posts";
import { AppLayout } from "@/components/AppLayout";
import { Loader2, LayoutList } from "lucide-react";
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


      {/* Sort bar */}
      <div className="flex items-center gap-3 mb-3 px-1">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1" />
        <button className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-white border border-slate-100 rounded-full px-3 py-1 shadow-sm transition-all">
          <LayoutList className="h-3 w-3" />
          Sort: <span className="text-foreground">Recent</span>
          <span className="text-[9px]">▼</span>
        </button>
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1" />
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading your feed…</p>
        </div>
      ) : posts?.length === 0 ? (
        <div className="text-center py-20 px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LayoutList className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Your feed is empty!</h3>
          <p className="text-muted-foreground text-sm">Follow people and check back for updates.</p>
        </div>
      ) : (
        <div className="pb-8">
          {posts.map((post: any) => (
            <PostCard key={post._id || post.id} post={post} />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={containerRef} className="h-10 mt-4 flex justify-center items-center">
            {isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
        </div>
      )}

      {/* Mobile padding */}
      <div className="h-16 md:hidden" />
    </AppLayout>
  );
}
