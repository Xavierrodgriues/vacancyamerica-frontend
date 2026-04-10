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
import { ArrowLeft, Calendar, Loader2, FileText, Users, Pencil, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { FriendActionButtons } from "@/components/FriendActionButtons";
import { FriendsList } from "@/components/FriendsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { BASE_URL } from "@/lib/constants";
import { formatCompactNumber } from "@/lib/utils";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { data: visitedProfile, isLoading } = useProfileByUsername(username || "");
  const { data: myProfile } = useProfile();
  const { data, isLoading: postsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserPosts(visitedProfile?.user_id);
  const posts = data?.pages.flatMap((page: any) => page.posts) || null;
  const { user, login } = useAuth();
  const queryClient = useQueryClient();

  const { containerRef, isVisible } = useIntersectionObserver({ rootMargin: "400px" });

  useEffect(() => {
    if (isVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
      const res = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ display_name: editDisplayName, bio: editBio })
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updatedUser = await res.json();
      login({ ...updatedUser, token: user.token });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
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
          <Link to="/home" className="hover:bg-secondary rounded-full p-2 transition-colors">
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

  const postCount = posts?.length ?? visitedProfile.postCount ?? 0;
  const followersCount = visitedProfile.followersCount ?? 0;
  const followingCount = visitedProfile.followingCount ?? 0;

  return (
    <AppLayout>
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center gap-4 shadow-sm">
        <Link
          to="/home"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-[15px] font-bold leading-tight text-foreground">{visitedProfile.display_name}</h1>
          <p className="text-[12px] text-muted-foreground">{formatCompactNumber(postCount)} post{postCount !== 1 ? "s" : ""}</p>
        </div>
      </header>

      {/* ── Hero Banner + Avatar overlap wrapper ── */}
      <div className="relative">
        {/* Banner */}
        <div
          className="h-44 sm:h-52 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #E63946 0%, #c0392b 30%, #ff6b6b 60%, #ff8e53 100%)",
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-10 -left-10 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-80 h-40 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
          />
          {/* Mesh pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Avatar — absolutely positioned, half-overlapping banner bottom */}
        <div
          className="absolute left-4 sm:left-6 -bottom-[40px]"
          style={{ filter: "drop-shadow(0 4px 16px rgba(230,57,70,0.25))" }}
        >
          <div className="p-[3px] rounded-full bg-gradient-to-br from-[#E63946] via-[#ff6b6b] to-[#ff8e53]">
            <div className="p-[3px] rounded-full bg-white">
              <UserAvatar
                avatarUrl={visitedProfile.avatar_url}
                displayName={visitedProfile.display_name}
                size="xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile Identity Block ── */}
      <div className="px-4 sm:px-6 pt-[48px]">
        {/* Name / Username / Bio */}
        {editing ? (
          <div className="space-y-3 mt-1 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Input
              name="displayName"
              placeholder="Display name"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              maxLength={50}
              className="rounded-xl bg-white border-slate-200 focus-visible:ring-[#E63946]/20 focus-visible:border-[#E63946] h-11"
            />
            <Textarea
              name="bio"
              placeholder="Tell the world a bit about yourself…"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              maxLength={160}
              className="rounded-xl resize-none bg-white border-slate-200 focus-visible:ring-[#E63946]/20 focus-visible:border-[#E63946]"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={saveProfile}
                disabled={saving}
                size="sm"
                className="rounded-full font-bold bg-[#E63946] hover:bg-[#d32f3f] text-white shadow-md shadow-[#E63946]/25 px-5"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <><Check className="w-3.5 h-3.5 mr-1" /> Save</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                size="sm"
                className="rounded-full border-slate-200 hover:border-slate-300"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <h2 className="text-[20px] font-extrabold text-foreground tracking-tight leading-tight">
              {visitedProfile.display_name}
            </h2>
            <p className="text-[14px] text-muted-foreground mt-0.5">@{visitedProfile.username}</p>
            {visitedProfile.bio && (
              <p className="mt-2 text-[14px] text-foreground leading-relaxed">{visitedProfile.bio}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-[13px]">Joined {joinDate}</span>
            </div>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="flex items-center gap-6 py-3 border-t border-b border-slate-100">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[17px] font-extrabold text-foreground leading-none">{formatCompactNumber(postCount)}</span>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Posts</span>
          </div>
          <div className="w-px h-8 bg-slate-200 rounded-full" />
          <div className="flex flex-col items-start gap-0.5 cursor-pointer group">
            <span className="text-[17px] font-extrabold text-foreground leading-none group-hover:text-[#E63946] transition-colors">
              {formatCompactNumber(followersCount)}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Followers</span>
          </div>
          <div className="w-px h-8 bg-slate-200 rounded-full" />
          <div className="flex flex-col items-start gap-0.5 cursor-pointer group">
            <span className="text-[17px] font-extrabold text-foreground leading-none group-hover:text-[#E63946] transition-colors">
              {formatCompactNumber(followingCount)}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Following</span>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center gap-2 pt-4 pb-1 w-full relative z-10">
          {isOwnProfile && !editing && (
            <Button
              onClick={startEdit}
              variant="outline"
              className="flex-1 rounded-xl h-[38px] border-slate-200 text-[14px] font-bold text-slate-700 shadow-sm hover:border-[#E63946] hover:text-[#E63946]"
            >
              <Pencil className="w-4 h-4 mr-1.5" />
              Edit profile
            </Button>
          )}
          {!isOwnProfile && visitedProfile && (
            <FriendActionButtons
              userId={visitedProfile.user_id}
              username={visitedProfile.username}
              fullWidth={true}
            />
          )}
        </div>
      </div>

      {/* ── Content Tabs ── */}
      <div className="mt-1">
        <Tabs key={username} defaultValue="posts" className="w-full">
          <div className="border-b border-slate-100 px-4">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 rounded-none gap-6">
              <TabsTrigger
                value="posts"
                className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-[#E63946] data-[state=active]:text-[#E63946] data-[state=active]:bg-transparent bg-transparent text-muted-foreground font-semibold text-[13px] px-1 py-3 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Posts
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger
                  value="friends"
                  className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-[#E63946] data-[state=active]:text-[#E63946] data-[state=active]:bg-transparent bg-transparent text-muted-foreground font-semibold text-[13px] px-1 py-3 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  Friends &amp; Requests
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="posts" className="mt-0">
            {postsLoading || !posts ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-[#E63946]" />
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-[15px]">No posts yet</p>
                  <p className="text-muted-foreground text-[13px] mt-1">
                    {isOwnProfile ? "Share your first post to get started!" : "When they post, you'll see it here."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="pb-8">
                {posts.map((post: any) => <PostCard key={post._id} post={post} />)}
                <div ref={containerRef} className="h-10 mt-4 flex justify-center items-center">
                  {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-[#E63946]" />}
                </div>
              </div>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="friends" className="p-4">
              <FriendsList />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <div className="h-16 md:hidden" />
    </AppLayout>
  );
}
