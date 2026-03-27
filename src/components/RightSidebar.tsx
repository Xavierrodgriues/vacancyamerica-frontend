import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useActivity } from "@/hooks/use-activity";
import { useFriends } from "@/hooks/use-friends";
import { useSuggestedUsers } from "@/hooks/use-suggested-users";
import { formatDistanceToNow } from "date-fns";

export function RightSidebar() {
  const { user } = useAuth();
  const { data: activityList } = useActivity();
  const { data: friends } = useFriends();
  const { data: suggestedProfiles = [] } = useSuggestedUsers();

  const renderActivityText = (act: any) => {
      const isActor = act.actor._id === user?._id;
      const isRecipient = act.recipient._id === user?._id;
      
      const actorName = isActor ? "You" : act.actor.display_name;
      const targetName = isRecipient ? "your" : `${act.recipient.display_name}'s`;
      
      const ActorLink = isActor ? <span className="font-bold text-[14px] mr-1">You</span> : <Link to={`/profile/${act.actor.username}`} className="font-bold text-[14px] hover:underline mr-1">{actorName}</Link>;
      const TargetLink = isRecipient ? "your" : <Link to={`/profile/${act.recipient.username}`} className="font-semibold hover:underline">{act.recipient.display_name}'s</Link>;

      switch(act.type) {
          case 'LIKE': 
              return <>{ActorLink} liked {TargetLink} post.</>;
          case 'COMMENT': 
              return <>{ActorLink} commented on {TargetLink} post.</>;
          case 'FOLLOW': 
              return <>{ActorLink} started following {isRecipient ? "you" : <Link to={`/profile/${act.recipient.username}`} className="font-semibold hover:underline">{act.recipient.display_name}</Link>}.</>;
          default: 
              return <>{ActorLink} interacted with {TargetLink}.</>;
      }
  };

  const getOtherUser = (act: any) => {
      return act.actor._id === user?._id ? act.recipient : act.actor;
  };

  const activities = activityList || [];

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-[320px] flex-shrink-0 sticky top-[88px] h-fit pb-6">
      {/* Activity */}
      <div className="bg-white rounded-2xl border border-post-border p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[15px] text-foreground">Activity</h3>
          <span className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">See all</span>
        </div>
        
        {activities.length > 0 ? (
          <div className="space-y-6 max-h-[350px] overflow-y-auto overflow-x-hidden pr-2">
            {activities.map((act) => {
              const otherUser = getOtherUser(act);
              return (
              <div key={act._id} className="flex items-start gap-3">
                <Link to={`/profile/${otherUser.username}`} className="w-[38px] h-[38px] rounded-full flex-shrink-0 shadow-sm overflow-hidden border border-slate-100 block">
                  <UserAvatar avatarUrl={otherUser.avatar_url} displayName={otherUser.display_name} />
                </Link>
                <div className="flex-1 min-w-0 pt-0.5 mt-[-2px]">
                  <p className="text-[13px] text-foreground leading-[1.35]">
                    {renderActivityText(act)}
                    <span className="text-muted-foreground whitespace-nowrap ml-1 text-[11px] block mt-0.5">
                      {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true }).replace('about ', '')}
                    </span>
                  </p>
                </div>
                {act.post?.image_url && act.type !== 'FOLLOW' && (
                   <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                     <img src={`http://localhost:5000/uploads/${act.post.image_url}`} alt="Post content" className="w-full h-full object-cover" />
                   </div>
                )}
              </div>
            )})}
          </div>
        ) : (
          <div className="text-center py-4">
             <p className="text-sm text-muted-foreground">No recent activity.</p>
          </div>
        )}
      </div>

      {/* Suggested */}
      <div className="bg-white rounded-2xl border border-post-border p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-[15px] text-foreground">Suggested For you</h3>
          <span className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">See all</span>
        </div>
        
        {suggestedProfiles.length > 0 ? (
          <div className="space-y-5 max-h-[300px] overflow-y-auto overflow-x-hidden pr-2">
            {suggestedProfiles.map((p: any) => (
              <div key={p.username} className="flex items-center gap-3">
                <Link to={`/profile/${p.username}`} className="w-[40px] h-[40px] rounded-full flex-shrink-0 shadow-sm overflow-hidden border border-slate-100">
                  <UserAvatar avatarUrl={p.avatar_url} displayName={p.display_name} size="md" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${p.username}`} className="hover:underline">
                    <p className="text-[14px] font-bold text-foreground truncate leading-tight">{p.display_name}</p>
                  </Link>
                  <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">@{p.username}</p>
                </div>
                <Button variant="ghost" className="font-semibold text-[13px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors h-8 px-3 rounded-full">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
             <p className="text-sm text-muted-foreground">No users to suggest.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
