"use client";

import { useState, useEffect } from "react";
import { X, Server, RefreshCw } from "lucide-react";

interface VideoPlayerProps {
  type: "movie" | "tv";
  id: number;
  season?: number;
  episode?: number;
  title: string;
  onClose: () => void;
}

type ServerType = "vidsrc" | "vidsrccc";

export default function VideoPlayer({
  type,
  id,
  season = 1,
  episode = 1,
  title,
  onClose,
}: VideoPlayerProps) {
  const [server, setServer] = useState<ServerType>("vidsrc");
  const [isLoading, setIsLoading] = useState(true);

  // Generate Iframe URLs based on active server
  const getIframeUrl = () => {
    if (server === "vidsrc") {
      return type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
    } else {
      return type === "movie"
        ? `https://vidsrc.cc/v2/embed/movie/${id}`
        : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    const iframe = document.getElementById("movvo-player-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.src = getIframeUrl();
    }
  };

  // Prevent iframe from redirecting the parent window on mobile/small screens
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "Are you sure you want to leave? Your video playback might be interrupted.";
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col justify-between animate-fade-in delay-0">
      {/* Top Bar Navigation */}
      <div className="h-16 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between">
        <div className="flex flex-col text-left">
          <span className="text-xs text-rose-500 font-semibold tracking-wider uppercase">
            Currently Playing
          </span>
          <h2 className="text-sm font-bold text-zinc-100 truncate max-w-[200px] sm:max-w-[400px]">
            {title} {type === "tv" && `- S${season}:E${episode}`}
          </h2>
        </div>

        {/* Streaming Toolbar */}
        <div className="flex items-center gap-2">
          {/* Server Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs text-zinc-400">
            <button
              onClick={() => {
                setServer("vidsrc");
                setIsLoading(true);
              }}
              className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                server === "vidsrc"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/10"
                  : "hover:text-zinc-200"
              }`}
            >
              Server 1
            </button>
            <button
              onClick={() => {
                setServer("vidsrccc");
                setIsLoading(true);
              }}
              className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                server === "vidsrccc"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/10"
                  : "hover:text-zinc-200"
              }`}
            >
              Server 2
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Reload Video Stream"
            className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg transition-all ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Embedded Iframe Player Area */}
      <div className="flex-1 bg-black relative flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/90 z-10">
            <div className="w-12 h-12 rounded-full border-4 border-rose-600/20 border-t-rose-600 animate-spin" />
            <p className="text-zinc-400 text-xs tracking-wider animate-pulse">
              Connecting to streaming server...
            </p>
          </div>
        )}

        <iframe
          id="movvo-player-iframe"
          src={getIframeUrl()}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Bottom status/warnings */}
      <div className="h-10 border-t border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between text-[10px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5" />
          Streaming source: {server === "vidsrc" ? "vidsrc.to" : "vidsrc.cc"}
        </span>
        <span>Please use an ad-blocker for the best external playback experience.</span>
      </div>
    </div>
  );
}
