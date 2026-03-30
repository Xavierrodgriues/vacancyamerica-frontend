import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Home, Compass, MessageCircle, Bell, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { useFriendRequests } from "@/hooks/use-friends";
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

  const pendingRequestsCount = requests?.filter(r => r.receiver._id === profile?._id && r.status === 'pending').length || 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-post-border z-50 px-4 md:px-8 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      {/* Left: Logo & Search */}
      <div className="flex items-center gap-6 flex-1">
        <Link to="/home" className="flex items-center justify-center flex-shrink-0">
          <img src="/VA-logo2-removebg.png" alt="VacancyAmerica" className="h-12 w-auto" />
        </Link>
        <div className="hidden md:flex relative w-full max-w-sm ml-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/70" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-full text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
          />
        </div>
      </div>

      {/* Center: Nav Icons */}
      <nav className="hidden md:flex items-center gap-2 justify-center flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.url) || (item.url === '/home' && location.pathname === '/');
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 w-[60px] h-16 border-b-[3px] transition-all duration-200",
                isActive
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-slate-50"
              )}
            >
              <div className="relative">
                <item.icon className={cn("w-6 h-6", isActive && "fill-current stroke-[1.5]")} strokeWidth={isActive ? 1.5 : 2} />
                {item.title === 'Network' && pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-[15px] flex items-center justify-center rounded-full leading-none shadow-sm border border-white">
                    {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Right: Profile & Switch */}
      <div className="flex items-center gap-4 justify-end flex-1">
        {profile ? (
          <div className="flex items-center gap-3">
            <Link to={`/profile/${profile.username}`} className="flex items-center gap-2.5 hover:bg-slate-50 py-1.5 px-2 rounded-full transition-colors cursor-pointer border border-transparent hover:border-slate-200">
              <UserAvatar avatarUrl={profile.avatar_url} displayName={profile.display_name} size="sm" />
              <div className="hidden lg:block text-left mr-1">
                <p className="text-[13px] font-bold text-foreground leading-[1.2]">{profile.display_name}</p>
                <p className="text-[11px] text-muted-foreground leading-[1.2]">@{profile.username}</p>
              </div>
            </Link>
            <Button variant="ghost" onClick={handleSignOut} className="text-[13px] font-semibold h-8 px-3 rounded-full text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              Switch
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
