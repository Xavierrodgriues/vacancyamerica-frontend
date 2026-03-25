import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Palette, Dribbble, PenTool, Tv } from "lucide-react";
import { ConnectionsModal } from "@/components/ConnectionsModal";
import { formatCompactNumber } from "@/lib/utils";

import { useConversations, ConversationData, Participant } from "@/hooks/use-chat";

// Helper to get the other participant relative to the current user
const getOtherUser = (conv: ConversationData, currentUserId?: string): Participant => {
  return conv.participants.find((p) => p._id !== currentUserId) || conv.participants[0];
};

const formatTimeShort = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

export function LeftSidebar() {
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const { data: conversations, isLoading: convsLoading } = useConversations();
  const [connectionsModal, setConnectionsModal] = useState<{isOpen: boolean, title: string}>({isOpen: false, title: "Followers"});

  if (!profile) return null;

  return (
    <div className="hidden md:flex flex-col gap-6 w-[260px] flex-shrink-0 sticky top-[88px] h-fit pb-6">
      
      {/* Connections Modal Popup */}
      <ConnectionsModal 
        isOpen={connectionsModal.isOpen} 
        onClose={() => setConnectionsModal({ ...connectionsModal, isOpen: false })} 
        title={connectionsModal.title} 
      />

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-post-border overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        {/* Cover */}
        <div className="h-20 bg-slate-200 relative">
          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 p-1 bg-white rounded-full">
            <UserAvatar avatarUrl={profile.avatar_url} displayName={profile.display_name} size="lg" />
          </div>
        </div>
        
        <div className="pt-12 pb-5 px-5 text-center">
          <Link to={`/profile/${profile.username}`} className="hover:underline">
            <h2 className="text-[15px] font-bold text-foreground leading-tight">{profile.display_name}</h2>
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5 mb-5">@{profile.username}</p>
          
          <div className="flex items-center justify-between px-1 mb-5">
            <div className="text-center">
              <p className="text-[13px] font-bold text-foreground">{formatCompactNumber(profile.postCount)}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Post</p>
            </div>
            <div 
              className="text-center cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => setConnectionsModal({ isOpen: true, title: "Followers" })}
            >
              <p className="text-[13px] font-bold text-foreground">{formatCompactNumber(profile.followersCount)}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Followers</p>
            </div>
            <div 
              className="text-center cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => setConnectionsModal({ isOpen: true, title: "Following" })}
            >
              <p className="text-[13px] font-bold text-foreground">{formatCompactNumber(profile.followingCount)}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Following</p>
            </div>
          </div>
          
          <Link to={`/profile/${profile.username}`}>
            <Button className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold h-10 text-[13px] shadow-[0_4px_14px_rgba(59,130,246,0.25)] transition-all">
              My Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Chats */}
      <div className="bg-white rounded-2xl border border-post-border p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[13px] text-foreground">Recent Chats</h3>
          <Link to="/messages" className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">See all</Link>
        </div>
        
        {convsLoading ? (
           <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                 <div key={i} className="flex gap-3 items-center animate-pulse">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                       <div className="w-20 h-3 bg-slate-200 rounded" />
                       <div className="w-full h-2 bg-slate-100 rounded" />
                    </div>
                 </div>
              ))}
           </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.slice(0, 5).map((conv) => {
              const other = getOtherUser(conv, user?._id);
              return (
                <Link to={`/messages?chatId=${conv._id}`} key={conv._id} className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0">
                     <UserAvatar avatarUrl={other.avatar_url} displayName={other.display_name} size="sm" />
                     {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                           <span className="text-[8px] font-bold text-white">{conv.unreadCount}</span>
                        </div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between">
                        <span className={`text-[13px] group-hover:text-blue-500 transition-colors truncate block ${conv.unreadCount > 0 ? 'font-bold text-foreground' : 'font-semibold text-foreground'}`}>
                           {other.display_name}
                        </span>
                        <span className={`text-[10px] flex-shrink-0 ml-1 ${conv.unreadCount > 0 ? "text-blue-500 font-semibold" : "text-muted-foreground"}`}>
                           {formatTimeShort(conv.lastMessage?.createdAt || conv.updatedAt)}
                        </span>
                     </div>
                     <span className={`text-xs block truncate ${conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {conv.lastMessage?.text || "Start a conversation"}
                     </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
           <p className="text-xs text-muted-foreground text-center py-2">No recent chats.</p>
        )}
      </div>
    </div>
  );
}
