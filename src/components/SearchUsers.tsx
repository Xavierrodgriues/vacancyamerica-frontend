import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchUsers } from "@/hooks/use-search";
import { UserAvatar } from "@/components/UserAvatar";
import { Link } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FriendActionButtons } from "@/components/FriendActionButtons";

export function SearchUsers() {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500);
    const { data: users, isLoading } = useSearchUsers(debouncedQuery);

    return (
        <div className="w-full space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search people"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 rounded-full bg-secondary border-0 h-12 focus-visible:ring-primary text-lg"
                />
            </div>

            {isLoading && (
                <div className="flex justify-center p-4">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            )}

            {!isLoading && users && users.length > 0 && (
                <div className="bg-card rounded-xl border border-post-border shadow-sm overflow-hidden">
                    {users.map((user: any) => (
                        <div key={user._id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-post-border last:border-0">
                            <Link to={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                                <UserAvatar avatarUrl={user.avatar_url} displayName={user.display_name} />
                                <div className="truncate">
                                    <p className="font-bold text-foreground truncate">{user.display_name}</p>
                                    <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                                </div>
                            </Link>
                            <FriendActionButtons userId={user._id} username={user.username} />
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && query && users && users.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    No people found matching "{query}"
                </div>
            )}
        </div>
    );
}
