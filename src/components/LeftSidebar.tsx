import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Palette, Dribbble, PenTool, Tv } from "lucide-react";
import { ConnectionsModal } from "@/components/ConnectionsModal";
import { formatCompactNumber } from "@/lib/utils";

const SHORTCUTS = [
  { name: "Art and drawing", color: "bg-amber-100 text-amber-700", icon: Palette },
  { name: "Dribbble Pro", color: "bg-pink-100 text-pink-700", icon: Dribbble },
  { name: "Behance Creative", color: "bg-blue-100 text-blue-700", icon: PenTool },
  { name: "One Piece Fan", color: "bg-red-100 text-red-700", icon: Tv },
];

export function LeftSidebar() {
  const { data: profile } = useProfile();
  const { user } = useAuth();
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

      {/* Shortcuts */}
      <div className="bg-white rounded-2xl border border-post-border p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[13px] text-foreground">Your shortcuts</h3>
          <span className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">See all</span>
        </div>
        <div className="space-y-4">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.name} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${shortcut.color} shadow-sm group-hover:scale-105 transition-transform`}>
                <shortcut.icon className="w-5 h-5" />
              </div>
              <span className="text-[13px] font-semibold text-foreground group-hover:text-blue-500 transition-colors">{shortcut.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
