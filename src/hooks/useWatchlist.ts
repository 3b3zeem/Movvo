import { useState, useEffect } from "react";
import { MediaItem } from "@/lib/tmdb";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load watchlist on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("movvo_watchlist");
      if (stored) {
        try {
          setWatchlist(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse watchlist", e);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("movvo_watchlist", JSON.stringify(watchlist));
    }
  }, [watchlist, isInitialized]);

  const addToWatchlist = (item: MediaItem) => {
    setWatchlist((prev) => {
      // Avoid duplicates
      if (prev.some((i) => i.id === item.id)) return prev;
      return [item, ...prev];
    });
  };

  const removeFromWatchlist = (id: number) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWatchlist = (id: number): boolean => {
    return watchlist.some((item) => item.id === id);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    isLoaded: isInitialized,
  };
}
