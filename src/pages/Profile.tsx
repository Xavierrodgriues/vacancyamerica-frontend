import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProfileByUsername, useProfile } from "@/hooks/use-profile";
import { useUserPosts } from "@/hooks/use-posts";
import { AppLayout } from "@/components/AppLayout";
import { UserAvatar } from "@/components/UserAvatar";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { FriendActionButtons } from "@/components/FriendActionButtons";
import { FriendsList } from "@/components/FriendsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { data: visitedProfile, isLoading } = useProfileByUsername(username || "");
  const { data: myProfile } = useProfile();
  // Ensure we pass the correct ID form
  const { data: posts, isLoading: postsLoading } = useUserPosts(visitedProfile?.user_id);
  const { user, login } = useAuth(); // login function updates the context state
  const queryClient = useQueryClient();

  const isOwnProfile = user && visitedProfile && (user._id === visitedProfile.user_id || user.username === visitedProfile.username);
  const [editing, setEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setEditDisplayName(visitedProfile?.display_name || "");
    setEditBio(visitedProfile?.bio || "");
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!user || !user.token) return;
    setSaving(true);
    try {
      const res = await fetch("https://vacancyamerica-backend.onrender.com/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ display_name: editDisplayName, bio: editBio })
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updatedUser = await res.json();

      // Update local context
      login({ ...updatedUser, token: user.token }); // Update context with new user data

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Invalidate the username query as well since we are on that page
      queryClient.invalidateQueries({ queryKey: ["profile", "username", user.username] });

      setEditing(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!visitedProfile) {
    return (
      <AppLayout>
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-post-border p-4 flex items-center gap-4">
          <Link to="/" className="hover:bg-secondary rounded-full p-2 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Profile</h1>
        </header>
        <div className="text-center py-16 text-muted-foreground">User not found</div>
      </AppLayout>
    );
  }

  const joinDate = new Date(visitedProfile.createdAt || visitedProfile.created_at || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-post-border p-4 flex items-center gap-4">
        <Link to="/" className="hover:bg-secondary rounded-full p-2 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold leading-tight">{visitedProfile.display_name}</h1>
          <p className="text-sm text-muted-foreground">{posts?.length || 0} posts</p>
        </div>
      </header>

      {/* Banner */}
      <div className="h-48 bg-gradient-to-br from-primary/30 to-primary/10" />

      {/* Profile info */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <div className="border-4 border-background rounded-full">
            <UserAvatar
              avatarUrl={visitedProfile.avatar_url}
              displayName={visitedProfile.display_name}
              size="xl"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {isOwnProfile && !editing && (
            <Button
              variant="outline"
              className="rounded-full font-bold"
              onClick={startEdit}
            >
              Edit profile
            </Button>
          )}
          {!isOwnProfile && visitedProfile && (
            <FriendActionButtons
              userId={visitedProfile.user_id}
              username={visitedProfile.username}
            />
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <Input
              placeholder="Display name"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              maxLength={50}
              className="rounded-lg"
            />
            <Textarea
              placeholder="Bio"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              maxLength={160}
              className="rounded-lg resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={saveProfile} disabled={saving} className="rounded-full font-bold" size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="rounded-full" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-extrabold text-foreground">{visitedProfile.display_name}</h2>
            <p className="text-muted-foreground">@{visitedProfile.username}</p>
            {visitedProfile.bio && (
              <p className="mt-2 text-foreground">{visitedProfile.bio}</p>
            )}
            <div className="flex items-center gap-1.5 mt-3 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Joined {joinDate}</span>
            </div>
          </>
        )}
      </div>

      {/* Content Tabs */}
      <div className="mt-4">
        <Tabs key={username} defaultValue="posts" className="w-full">
          <div className="border-b border-post-border px-4">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 rounded-none space-x-6">
              <TabsTrigger
                value="posts"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
              >
                Posts
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger
                  value="friends"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
                >
                  Friends & Requests
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="posts" className="mt-0">
            <div className="border-t border-post-border">
              {postsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !posts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : posts.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No posts yet</p>
              ) : (
                posts.map((post: any) => <PostCard key={post._id} post={post} />)
              )}
            </div>
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="friends" className="p-4">
              <FriendsList />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <div className="h-16 md:hidden" />
    </AppLayout >
  );
}
