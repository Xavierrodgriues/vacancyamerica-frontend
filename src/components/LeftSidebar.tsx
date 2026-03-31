import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { UserAvatar } from "@/components/UserAvatar";
import { ConnectionsModal } from "@/components/ConnectionsModal";
import { formatCompactNumber } from "@/lib/utils";
import { MessageCircle, Users, UserCheck } from "lucide-react";
import { useConversations, ConversationData, Participant } from "@/hooks/use-chat";

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
  const [connectionsModal, setConnectionsModal] = useState<{ isOpen: boolean; title: string }>({ isOpen: false, title: "Followers" });

  if (!profile) return null;

  return (
    <div className="hidden md:flex flex-col gap-4 w-[260px] flex-shrink-0 sticky top-[88px] h-fit pb-6">
      <ConnectionsModal
        isOpen={connectionsModal.isOpen}
        onClose={() => setConnectionsModal({ ...connectionsModal, isOpen: false })}
        title={connectionsModal.title}
      />

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        {/* Cover gradient */}
        <div className="h-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 40%, #f97316 100%)" }}>
          <div className="absolute inset-0 bg-black/10" />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 60%)" }} />
        </div>

        {/* Avatar */}
        <div className="relative px-5 pb-5 pt-0">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="p-[3px] bg-white rounded-full shadow-lg">
              <div className="relative">
                <UserAvatar avatarUrl={profile.avatar_url} displayName={profile.display_name} size="lg" />
                <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
            </div>
          </div>

          <div className="pt-10 text-center">
            <Link to={`/profile/${profile.username}`} className="hover:opacity-80 transition-opacity">
              <h2 className="text-[15px] font-bold text-foreground leading-tight">{profile.display_name}</h2>
            </Link>
            <p className="text-[12px] text-muted-foreground mt-0.5 mb-4">@{profile.username}</p>

            {/* Stats */}
            <div className="flex items-center justify-between px-2 mb-4 py-3 bg-slate-50/80 rounded-xl">
              <div className="text-center flex-1">
                <p className="text-[14px] font-bold text-foreground">{formatCompactNumber(profile.postCount)}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wide">Posts</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <button
                className="text-center flex-1 cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setConnectionsModal({ isOpen: true, title: "Followers" })}
              >
                <p className="text-[14px] font-bold text-foreground">{formatCompactNumber(profile.followersCount)}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wide">Followers</p>
              </button>
              <div className="w-px h-8 bg-slate-200" />
              <button
                className="text-center flex-1 cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setConnectionsModal({ isOpen: true, title: "Following" })}
              >
                <p className="text-[14px] font-bold text-foreground">{formatCompactNumber(profile.followingCount)}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wide">Following</p>
              </button>
            </div>

            <Link to={`/profile/${profile.username}`}
              className="block w-full py-2 rounded-xl bg-primary text-white text-[13px] font-bold shadow-[0_4px_14px_rgba(230,57,70,0.3)] hover:shadow-[0_6px_20px_rgba(230,57,70,0.4)] hover:-translate-y-0.5 transition-all duration-200 text-center">
              My Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Chats */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[13px] text-foreground flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5 text-primary" />
            Recent Chats
          </h3>
          <Link to="/messages" className="text-[11px] text-primary font-semibold hover:text-primary/80 transition-colors">
            See all
          </Link>
        </div>

        {convsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center animate-pulse">
                <div className="w-9 h-9 bg-slate-100 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-24 h-2.5 bg-slate-100 rounded-full" />
                  <div className="w-full h-2 bg-slate-50 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-3 max-h-[280px] overflow-y-auto overflow-x-hidden pr-1">
            {conversations.slice(0, 15).map((conv) => {
              const other = getOtherUser(conv, user?._id);
              const hasUnread = conv.unreadCount > 0;
              return (
                <Link
                  to={`/messages?chatId=${conv._id}`}
                  key={conv._id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors duration-150 group"
                >
                  <div className="relative flex-shrink-0">
                    <UserAvatar avatarUrl={other.avatar_url} displayName={other.display_name} size="sm" />
                    {hasUnread && (
                      <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-[7px] font-bold text-white">{conv.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[13px] truncate ${hasUnread ? "font-bold text-foreground" : "font-medium text-foreground"} group-hover:text-primary transition-colors`}>
                        {other.display_name}
                      </span>
                      <span className={`text-[10px] flex-shrink-0 ${hasUnread ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                        {formatTimeShort(conv.lastMessage?.createdAt || conv.updatedAt)}
                      </span>
                    </div>
                    <span className={`text-[12px] block truncate ${hasUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {conv.lastMessage?.text || "Start a conversation"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <MessageCircle className="h-8 w-8 text-slate-200 mx-auto mb-2" />
            <p className="text-[12px] text-muted-foreground">No recent chats</p>
          </div>
        )}
      </div>
    </div>
  );
}
