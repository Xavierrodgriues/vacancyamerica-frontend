import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export interface RecentSearchUser {
  _id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export function useRecentSearches() {
  const { user } = useAuth();
  const storageKey = `recent_searches_${user?.username || "guest"}`;
  
  const [recentSearches, setRecentSearches] = useState<RecentSearchUser[]>([]);

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, [user, storageKey]);

  const addRecentSearch = (searchUser: RecentSearchUser) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(u => u._id !== searchUser._id);
      const updated = [searchUser, ...filtered].slice(0, 15);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (userId: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(u => u._id !== userId);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(storageKey);
  };

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches
  };
}
