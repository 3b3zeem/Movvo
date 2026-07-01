"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import MediaDetailModal from "./MediaDetailModal";
import VideoPlayer from "./VideoPlayer";
import { tmdb } from "@/lib/tmdb";

export default function GlobalStreamingModals() {
  const { activeMedia, closeDetails, activePlayer, closePlayer, hasKey } = useApp();
  const [playerTitle, setPlayerTitle] = useState("");

  // Fetch title for the player in the background when it is active
  useEffect(() => {
    const isOpen = (activeMedia && hasKey) || (activePlayer && hasKey);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeMedia, activePlayer, hasKey]);

  // Fetch title for the player in the background when it is active
  useEffect(() => {
    if (!activePlayer || !hasKey) {
      setPlayerTitle("");
      return;
    }

    const currentPlayer = activePlayer;

    async function fetchPlayerTitle() {
      try {
        const details = await tmdb.getDetails(currentPlayer.type, currentPlayer.id);
        setPlayerTitle(details.title || details.name || "Streaming Media");
      } catch (err) {
        console.error("Failed to load title for player", err);
        setPlayerTitle("Streaming Media");
      }
    }

    fetchPlayerTitle();
  }, [activePlayer, hasKey]);

  return (
    <>
      {/* Media Details Modal */}
      {activeMedia && hasKey && (
        <MediaDetailModal
          type={activeMedia.type}
          id={activeMedia.id}
          onClose={closeDetails}
        />
      )}

      {/* Video Streaming Player */}
      {activePlayer && hasKey && (
        <VideoPlayer
          type={activePlayer.type}
          id={activePlayer.id}
          season={activePlayer.season}
          episode={activePlayer.episode}
          title={playerTitle || "Loading stream..."}
          onClose={closePlayer}
        />
      )}
    </>
  );
}
