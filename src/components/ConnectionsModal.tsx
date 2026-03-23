import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFriends } from "@/hooks/use-friends";
import { UserAvatar } from "@/components/UserAvatar";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { FriendActionButtons } from "@/components/FriendActionButtons";

interface ConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function ConnectionsModal({ isOpen, onClose, title }: ConnectionsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: friendsList, isLoading } = useFriends();

  const filteredConnections = useMemo(() => {
    if (!friendsList) return [];
    if (!debouncedQuery) return friendsList;
    const lowerQ = debouncedQuery.toLowerCase();
    return friendsList.filter((user: any) => 
      user.display_name?.toLowerCase().includes(lowerQ) ||
      user.username?.toLowerCase().includes(lowerQ)
    );
  }, [friendsList, debouncedQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden flex flex-col max-h-[85vh] sm:rounded-2xl border-none shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
        <DialogHeader className="py-3 px-4 border-b border-slate-100 flex-shrink-0 bg-white">
          <DialogTitle className="text-center font-bold text-[16px] text-foreground">{title}</DialogTitle>
        </DialogHeader>

        <div className="p-3 border-b border-slate-100 flex-shrink-0 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-muted-foreground" />
            <Input 
              placeholder="Search" 
              className="pl-9 bg-[#EFEFEF] hover:bg-[#EAEAEA] transition-colors border-none h-9 text-[14px] rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-2 space-y-4 flex-1 min-h-[350px] bg-white">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : filteredConnections.length === 0 ? (
             <div className="text-center py-8">
              <span className="text-sm text-muted-foreground font-medium">No users found.</span>
            </div>
          ) : (
            filteredConnections.map((user: any) => (
              <div key={user._id || user.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <Link to={`/profile/${user.username}`} onClick={onClose} className="flex-shrink-0">
                    <UserAvatar avatarUrl={user.avatar_url} displayName={user.display_name} />
                  </Link>
                  <div className="flex flex-col min-w-0 justify-center">
                    <Link to={`/profile/${user.username}`} onClick={onClose} className="text-[14px] font-bold text-foreground leading-[1.2] hover:underline truncate">
                      {user.username}
                    </Link>
                    <span className="text-[14px] text-muted-foreground leading-[1.3] truncate mt-0.5">{user.display_name}</span>
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-auto">
                    <FriendActionButtons
                       userId={user._id || user.id}
                       username={user.username}
                       variant="compact"
                    />
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
