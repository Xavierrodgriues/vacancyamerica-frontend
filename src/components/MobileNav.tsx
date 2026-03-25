import { Home, Search, User, LogOut, MessageCircle, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/use-profile";
import { useFriendRequests } from "@/hooks/use-friends";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Explore", url: "/explore", icon: Search },
  { title: "Network", url: "/network", icon: Users },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Profile", url: "/profile", icon: User },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: requests } = useFriendRequests();
  const [showChat, setShowChat] = useState(false);

  const pendingRequestsCount = requests?.filter(r => r.receiver._id === profile?._id && r.status === 'pending').length || 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <>
      {/* Mobile Chat Panel (full screen overlay) */}
      {/* Mobile Chat Panel moved to AppLayout */}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-post-border">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isMessages = item.url === "/messages";
            const isActive = isMessages
              ? location.pathname === "/messages"
              : item.url === "/home"
                ? location.pathname === "/home"
                : location.pathname.startsWith(item.url);

            return isMessages ? (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5]")} />
                <span className="text-xs">{item.title}</span>
              </Link>
            ) : (
              <Link
                key={item.title}
                to={item.url === "/profile" && profile ? `/profile/${profile.username}` : item.url}
                onClick={() => setShowChat(false)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5]")} />
                  {item.title === 'Network' && pendingRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-[15px] flex items-center justify-center rounded-full leading-none shadow-sm border border-white">
                      {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                    </span>
                  )}
                </div>
                <span className="text-xs">{item.title}</span>
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-muted-foreground hover:text-primary"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
