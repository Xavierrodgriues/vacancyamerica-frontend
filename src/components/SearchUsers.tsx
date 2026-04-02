import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchUsers } from "@/hooks/use-search";
import { UserAvatar } from "@/components/UserAvatar";
import { Link } from "react-router-dom";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FriendActionButtons } from "@/components/FriendActionButtons";
import { useRecentSearches } from "@/hooks/use-recent-searches";

export function SearchUsers() {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 500);
    const { data: users, isLoading } = useSearchUsers(debouncedQuery);
    const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches();

    return (
        <div className="w-full space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    name="searchUsers"
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

            {!isLoading && query && users && users.length > 0 && (
                <div className="bg-card rounded-xl border border-post-border shadow-sm overflow-hidden">
                    {users.map((user: any) => (
                        <div key={user._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-secondary/50 transition-colors border-b border-post-border last:border-0">
                            <Link 
                                to={`/profile/${user.username}`} 
                                className="flex items-center gap-3 min-w-0"
                                onClick={() => addRecentSearch({
                                    _id: user._id,
                                    username: user.username,
                                    display_name: user.display_name,
                                    avatar_url: user.avatar_url
                                })}
                            >
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

            {!query && recentSearches.length > 0 && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-bold text-[15px] text-foreground">Recent</h3>
                        <button onClick={clearRecentSearches} className="text-[13px] font-semibold text-blue-500 hover:text-blue-600 transition-colors">Clear all</button>
                    </div>
                    <div className="bg-card rounded-xl border border-post-border shadow-sm overflow-hidden">
                        {recentSearches.map((user) => (
                            <div key={user._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-secondary/50 transition-colors border-b border-post-border last:border-0 group">
                                <Link 
                                    to={`/profile/${user.username}`} 
                                    className="flex items-center gap-3 min-w-0"
                                    onClick={() => addRecentSearch(user)}
                                >
                                    <UserAvatar avatarUrl={user.avatar_url} displayName={user.display_name} />
                                    <div className="flex-1 truncate">
                                        <p className="font-bold text-foreground truncate">{user.display_name}</p>
                                        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                                    </div>
                                </Link>
                                <div className="flex sm:justify-end transition-opacity md:opacity-0 group-hover:opacity-100">
                                    <button 
                                        onClick={(e) => { e.preventDefault(); removeRecentSearch(user._id); }}
                                        className="p-2 -ml-2 sm:-mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary"
                                        aria-label="Remove from recent searches"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
