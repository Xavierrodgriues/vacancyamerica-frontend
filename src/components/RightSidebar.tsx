import { UserAvatar } from "@/components/UserAvatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useActivity, useDeleteActivity } from "@/hooks/use-activity";
import { useFriends } from "@/hooks/use-friends";
import { useSuggestedUsers } from "@/hooks/use-suggested-users";
import { formatDistanceToNow } from "date-fns";
import { BASE_URL } from "@/lib/constants";
import { Activity, Sparkles, Heart, MessageCircle, UserPlus, X } from "lucide-react";

export function RightSidebar() {
  const { user } = useAuth();
  const { data: activityList } = useActivity();
  const deleteActivity = useDeleteActivity();
  const { data: friends } = useFriends();
  const { data: suggestedProfiles = [] } = useSuggestedUsers();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "LIKE": return <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />;
      case "COMMENT": return <MessageCircle className="h-3 w-3 text-sky-500" />;
      case "FOLLOW": return <UserPlus className="h-3 w-3 text-emerald-500" />;
      default: return <Activity className="h-3 w-3 text-primary" />;
    }
  };

  const renderActivityText = (act: any) => {
    const isActor = (act.actor._id || act.actor) === user?._id;
    const isRecipient = (act.recipient._id || act.recipient) === user?._id;
    const actorName = isActor ? "You" : act.actor.display_name;
    const ActorLink = isActor
      ? <span className="font-bold text-[13px]">You</span>
      : <Link to={`/profile/${act.actor.username}`} className="font-bold text-[13px] hover:text-primary transition-colors">{actorName}</Link>;
    const TargetLink = isRecipient ? "your" : <Link to={`/profile/${act.recipient.username}`} className="font-semibold hover:text-primary transition-colors">{act.recipient?.display_name || ''}'s</Link>;

    switch (act.type) {
      case "LIKE": return <>{ActorLink} liked {TargetLink} post</>;
      case "COMMENT": return <>{ActorLink} commented on {TargetLink} post</>;
      case "FOLLOW": return isRecipient ? <>{ActorLink} sent you a connection request</> : <>{ActorLink} sent a connection request to <Link to={`/profile/${act.recipient.username}`} className="font-semibold hover:text-primary">{act.recipient?.display_name || ''}</Link></>;
      default: return <>{ActorLink} interacted with {TargetLink}</>;
    }
  };

  const getOtherUser = (act: any) => {
    // If the actor is the current user, the other user means the recipient.
    // Since getActivities only fetches activities where recipient is the current user,
    // if actor === user, then both are the user. We can safely return the `user` object.
    const isActor = (act.actor._id || act.actor) === user?._id;
    return isActor ? user : act.actor;
  };

  const activities = activityList || [];

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[300px] flex-shrink-0 sticky top-[88px] h-fit pb-6">
      {/* Activity */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[13px] text-foreground flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-primary" />
            Activity
          </h3>
          <span className="text-[11px] text-primary font-semibold cursor-pointer hover:text-primary/80 transition-colors">See all</span>
        </div>

        {activities.length > 0 ? (
          <div className="space-y-4 max-h-[320px] overflow-y-auto overflow-x-hidden pr-1">
            {activities.map((act) => {
              const otherUser = getOtherUser(act);
              return (
                <div key={act._id} className="flex items-start gap-2.5 group relative">
                  <div className="relative flex-shrink-0">
                    <Link to={`/profile/${otherUser.username}`} className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 block shadow-sm">
                      <UserAvatar avatarUrl={otherUser.avatar_url} displayName={otherUser.display_name} />
                    </Link>
                    {/* Activity type badge */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      {getActivityIcon(act.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[12.5px] text-foreground leading-snug">
                      {renderActivityText(act)}
                    </p>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">
                      {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true }).replace("about ", "")}
                    </span>
                  </div>
                  {act.post?.image_url && act.type !== "FOLLOW" && (
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100 mr-2">
                       <img 
                        src={act.post.image_url.startsWith('http') ? act.post.image_url : `${BASE_URL}/uploads/${act.post.image_url}`} 
                        alt="Post" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteActivity.mutate(act._id);
                    }}
                    className="absolute top-0.5 right-0 p-1 bg-white/80 backdrop-blur-sm rounded border border-slate-100 shadow-sm text-slate-400 hover:text-rose-500 z-10 hover:bg-slate-50 transition-colors"
                    title="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2">
              <Activity className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-[12px] text-muted-foreground">No recent activity</p>
          </div>
        )}
      </div>

      {/* Suggested For You */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[13px] text-foreground flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Suggested For You
          </h3>
          <Link to="/explore" className="text-[11px] text-primary font-semibold hover:text-primary/80 transition-colors">
            See all
          </Link>
        </div>

        {suggestedProfiles.length > 0 ? (
          <div className="space-y-3 max-h-[280px] overflow-y-auto overflow-x-hidden pr-1">
            {suggestedProfiles.map((p: any) => (
              <div key={p.username} className="flex items-center gap-3 group p-2 rounded-xl hover:bg-slate-50 transition-colors duration-150">
                <Link to={`/profile/${p.username}`} className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border border-slate-100 shadow-sm">
                  <UserAvatar avatarUrl={p.avatar_url} displayName={p.display_name} size="md" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${p.username}`}>
                    <p className="text-[13px] font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors">{p.display_name}</p>
                  </Link>
                  <p className="text-[11px] text-muted-foreground truncate leading-tight">@{p.username}</p>
                </div>
                <Link to={`/profile/${p.username}`}>
                  <button className="text-[12px] font-bold text-primary border border-primary/30 hover:bg-primary hover:text-white rounded-full px-3 py-1 transition-all duration-200 flex-shrink-0">
                    Follow
                  </button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-[12px] text-muted-foreground">No suggestions yet</p>
          </div>
        )}
      </div>

      {/* Footer links */}
      <div className="px-2">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          © 2025 VacancyAmerica · <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link> · <span className="hover:text-primary transition-colors cursor-pointer">Privacy</span> · <span className="hover:text-primary transition-colors cursor-pointer">Terms</span>
        </p>
      </div>
    </aside>
  );
}
