import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/use-posts";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchUsers } from "@/components/SearchUsers";

export default function Explore() {
  const { data: posts, isLoading } = usePosts();
  const [postSearch, setPostSearch] = useState("");

  const filteredPosts = posts?.filter(
    (post: any) =>
      post.content.toLowerCase().includes(postSearch.toLowerCase()) ||
      post.profiles.display_name.toLowerCase().includes(postSearch.toLowerCase()) ||
      post.profiles.username.toLowerCase().includes(postSearch.toLowerCase())
  );

  return (
    <AppLayout>
      <Tabs defaultValue="posts" className="w-full">
        {/* Header with Tabs */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-post-border">
          <div className="px-4 py-2">
            <h1 className="text-xl font-bold mb-2">Explore</h1>
          </div>
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 rounded-none space-x-6 px-4">
            <TabsTrigger
              value="posts"
              className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-bold text-muted-foreground data-[state=active]:text-foreground"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="people"
              className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-bold text-muted-foreground data-[state=active]:text-foreground"
            >
              People
            </TabsTrigger>
          </TabsList>
        </header>

        {/* Posts Tab Content */}
        <TabsContent value="posts" className="mt-0">
          <div className="p-4 border-b border-post-border bg-background/50 backdrop-blur-sm sticky top-[105px] z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search posts"
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="pl-10 rounded-full bg-secondary border-0 h-11 focus-visible:ring-primary"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts?.length === 0 ? (
            <div className="text-center py-16 px-4">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {postSearch ? "No posts found" : "Explore Posts"}
              </h3>
              <p className="text-muted-foreground">
                {postSearch
                  ? "Try a different search term"
                  : "Discover what's happening across the platform"}
              </p>
            </div>
          ) : (
            <div>
              {!postSearch && (
                <div className="p-4 border-b border-post-border">
                  <h2 className="text-xl font-extrabold text-foreground">Trending Posts</h2>
                </div>
              )}
              {filteredPosts?.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* People Tab Content */}
        <TabsContent value="people" className="mt-0 p-4">
          <SearchUsers />
        </TabsContent>

      </Tabs>
      <div className="h-16 md:hidden" />
    </AppLayout>
  );
}
