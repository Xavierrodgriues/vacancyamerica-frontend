import { Home, Search, LogOut, MessageCircle, Users, Bell } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/use-profile";
import { useFriendRequests } from "@/hooks/use-friends";
import { useActivity } from "@/hooks/use-activity";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MobileActivityPanel } from "@/components/MobileActivityPanel";
import { useConversations } from "@/hooks/use-chat";

const navItems = [
  { title: "Home",     url: "/home",     icon: Home },
  { title: "Explore",  url: "/explore",  icon: Search },
  { title: "Network",  url: "/network",  icon: Users },
  { title: "Messages", url: "/messages", icon: MessageCircle },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: requests } = useFriendRequests();
  const { data: activityList } = useActivity();
  const { data: conversations } = useConversations();
  const [activityOpen, setActivityOpen] = useState(false);

  const pendingRequestsCount =
    requests?.filter((r) => r.receiver._id === profile?._id && r.status === "pending").length || 0;

  const unreadCount = (activityList || []).filter((a) => !a.isRead).length;

  const unreadMessagesCount = 
    conversations?.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0) || 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <>
      {/* Mobile Activity Panel */}
      <MobileActivityPanel isOpen={activityOpen} onClose={() => setActivityOpen(false)} />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around py-1.5">

          {/* Regular nav items */}
          {navItems.map((item) => {
            const isActive = item.url === "/home"
              ? location.pathname === "/home"
              : location.pathname.startsWith(item.url);

            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative",
                  isActive ? "text-primary" : "text-slate-400 hover:text-slate-700"
                )}
              >
                <div className="relative">
                  <item.icon className={cn("h-5.5 w-5.5", isActive && "stroke-[2.5]")} />
                  {/* Network badge */}
                  {item.title === "Network" && pendingRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 border border-white shadow-sm">
                      {pendingRequestsCount > 9 ? "9+" : pendingRequestsCount}
                    </span>
                  )}
                  {/* Messages badge */}
                  {item.title === "Messages" && unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 border border-white shadow-sm">
                      {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                    </span>
                  )}
                </div>
                <span className={cn("text-[10px] font-semibold", isActive ? "text-primary" : "text-slate-400")}>
                  {item.title}
                </span>
              </Link>
            );
          })}

          {/* Bell / Notifications */}
          <button
            onClick={() => setActivityOpen(true)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative",
              activityOpen ? "text-primary" : "text-slate-400 hover:text-slate-700"
            )}
          >
            <div className="relative">
              <Bell className={cn("h-5.5 w-5.5", activityOpen && "stroke-[2.5]")} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 border border-white shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className={cn("text-[10px] font-semibold", activityOpen ? "text-primary" : "text-slate-400")}>
              Activity
            </span>
          </button>

        </div>
      </nav>
    </>
  );
}
