import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Home, Compass, MessageCircle, Bell, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { useFriendRequests, useFriendRealtimeUpdates } from "@/hooks/use-friends";
import { useConversations } from "@/hooks/use-chat";
import { useActivity } from "@/hooks/use-activity";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Network", url: "/network", icon: Users },
];

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: requests } = useFriendRequests();
  const { data: conversations } = useConversations();
  const { data: activityList } = useActivity();

  useFriendRealtimeUpdates();

  const pendingRequestsCount =
    requests?.filter((r) => r.receiver._id === profile?._id && r.status === "pending").length || 0;
    
  const unreadMessagesCount = 
    conversations?.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0) || 0;

  const unreadActivityCount = (activityList || []).filter((a) => !a.isRead).length;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-100 z-50 px-4 md:px-6 flex items-center justify-between shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
      
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-4 flex-1">
        <Link to="/home" className="flex items-center justify-center flex-shrink-0">
          <img src="/VA-logo2-removebg.png" alt="VacancyAmerica" className="h-11 w-auto" />
        </Link>
        <div className="hidden md:flex relative w-full max-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search…"
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent rounded-full text-[13px] text-foreground placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all duration-200"
          />
        </div>
      </div>

      {/* Center: Nav Icons */}
      <nav className="hidden md:flex items-center justify-center flex-1">
        <div className="flex items-center">
          {navItems.map((item) => {
            const isActive =
              location.pathname.startsWith(item.url) ||
              (item.url === "/home" && location.pathname === "/");
            return (
              <Link
                key={item.title}
                to={item.url}
                title={item.title}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 w-[68px] h-16 transition-all duration-200 group border-b-[2.5px]",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                )}
              >
                <div className="relative">
                  <item.icon
                    className={cn(
                      "w-[22px] h-[22px] transition-transform duration-150 group-hover:scale-110",
                      isActive ? "stroke-[2.5]" : "stroke-[1.8]"
                    )}
                  />
                  {/* Badge */}
                  {item.title === "Network" && pendingRequestsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 border-2 border-white shadow-sm">
                      {pendingRequestsCount > 9 ? "9+" : pendingRequestsCount}
                    </span>
                  )}
                  {item.title === "Messages" && unreadMessagesCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 border-2 border-white shadow-sm">
                      {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                    </span>
                  )}
                  {item.title === "Notifications" && unreadActivityCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 border-2 border-white shadow-sm">
                      {unreadActivityCount > 9 ? "9+" : unreadActivityCount}
                    </span>
                  )}
                </div>
                {/* Label */}
                <span className={cn(
                  "text-[10px] font-semibold leading-none transition-all duration-150",
                  isActive ? "text-primary opacity-100" : "text-slate-400 opacity-0 group-hover:opacity-100"
                )}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Right: Avatar + Sign out */}
      <div className="flex items-center gap-3 justify-end flex-1">
        {profile ? (
          <div className="flex items-center gap-2">
            <Link
              to={`/profile/${profile.username}`}
              className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-2.5 rounded-full transition-all duration-200 border border-transparent hover:border-slate-200 group"
            >
              <div className="relative">
                <UserAvatar avatarUrl={profile.avatar_url} displayName={profile.display_name} size="sm" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[13px] font-bold text-foreground leading-[1.2] group-hover:text-primary transition-colors">{profile.display_name}</p>
                <p className="text-[11px] text-muted-foreground leading-[1.2]">@{profile.username}</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-[12px] font-bold h-8 px-4 rounded-full text-primary border border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
            >
              Switch
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
