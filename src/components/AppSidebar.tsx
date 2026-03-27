import { Home, Search, User, LogOut, MessageCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Explore", url: "/explore", icon: Search },
  { title: "Messages", url: "/messages", icon: MessageCircle, className: "lg:hidden" },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <aside className="hidden md:flex flex-col w-[275px] h-screen sticky top-0 border-r border-post-border p-3 bg-white">
      {/* Logo */}
      <div className="p-3 mb-2">
        <img src="/VA-logo2.png" alt="VacancyAmerica" className="h-[75px] w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.url === "/home"
              ? location.pathname === "/home"
              : location.pathname.startsWith(item.url);

          return (
            <Link
              key={item.title}
              to={item.url === "/profile" && profile ? `/profile/${profile.username}` : item.url}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-full text-lg transition-colors",
                isActive ? "font-bold bg-primary text-primary-foreground shadow-md" : "text-foreground/80 hover:bg-muted",
                (item as any).className
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5]")} />
              <span>{item.title}</span>
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 px-4 py-3 rounded-full text-lg text-foreground/80 transition-colors hover-card w-full text-left"
        >
          <LogOut className="h-6 w-6" />
          <span>Logout</span>
        </button>
      </nav>

      {/* User card */}
      {profile && (
        <Link
          to={`/profile/${profile.username}`}
          className="flex items-center gap-3 p-3 rounded-full hover-card mt-auto"
        >
          <UserAvatar
            avatarUrl={profile.avatar_url}
            displayName={profile.display_name}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate text-foreground">{profile.display_name}</p>
            <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
          </div>
        </Link>
      )}
    </aside>
  );
}
