"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTMDBApiKey, saveTMDBApiKey } from "@/lib/tmdb";

interface PlayerState {
  type: "movie" | "tv";
  id: number;
  season?: number;
  episode?: number;
}

interface AppContextType {
  apiKey: string;
  updateApiKey: (key: string) => void;
  hasKey: boolean;
  
  // Media Detail Modal State
  activeMedia: { type: "movie" | "tv"; id: number } | null;
  openDetails: (type: "movie" | "tv", id: number) => void;
  closeDetails: () => void;

  // Video Player Modal State
  activePlayer: PlayerState | null;
  openPlayer: (type: "movie" | "tv", id: number, season?: number, episode?: number) => void;
  closePlayer: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string>("");
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [activeMedia, setActiveMedia] = useState<{ type: "movie" | "tv"; id: number } | null>(null);
  const [activePlayer, setActivePlayer] = useState<PlayerState | null>(null);

  // Initialize API key client-side
  useEffect(() => {
    const key = getTMDBApiKey();
    setApiKey(key);
    setHasKey(key.length > 0);
  }, []);

  const updateApiKey = (key: string) => {
    saveTMDBApiKey(key);
    setApiKey(key);
    setHasKey(key.trim().length > 0);
  };

  const openDetails = (type: "movie" | "tv", id: number) => {
    router.push(`/${type === "movie" ? "movies" : "tv"}/${id}`);
  };

  const closeDetails = () => {
    setActiveMedia(null);
  };

  const openPlayer = (type: "movie" | "tv", id: number, season?: number, episode?: number) => {
    setActivePlayer({ type, id, season, episode });
  };

  const closePlayer = () => {
    setActivePlayer(null);
  };

  return (
    <AppContext.Provider
      value={{
        apiKey,
        updateApiKey,
        hasKey,
        activeMedia,
        openDetails,
        closeDetails,
        activePlayer,
        openPlayer,
        closePlayer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
