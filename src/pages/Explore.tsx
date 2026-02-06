import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/use-posts";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

export default function Explore() {
  const { data: posts, isLoading } = usePosts();
  const [search, setSearch] = useState("");

  const filtered = posts?.filter(
    (post: any) =>
      post.content.toLowerCase().includes(search.toLowerCase()) ||
      post.profiles.display_name.toLowerCase().includes(search.toLowerCase()) ||
      post.profiles.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-post-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search posts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-secondary border-0 h-11 focus-visible:ring-primary"
          />
        </div>
      </header>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-16 px-4">
          <h3 className="text-xl font-bold text-foreground mb-2">
            {search ? "No results found" : "Explore"}
          </h3>
          <p className="text-muted-foreground">
            {search
              ? "Try a different search term"
              : "Discover what's happening across the platform"}
          </p>
        </div>
      ) : (
        <div>
          {!search && (
            <div className="p-4 border-b border-post-border">
              <h2 className="text-xl font-extrabold text-foreground">Trending</h2>
              <p className="text-sm text-muted-foreground">Latest posts from the community</p>
            </div>
          )}
          {filtered?.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <div className="h-16 md:hidden" />
    </AppLayout>
  );
}
