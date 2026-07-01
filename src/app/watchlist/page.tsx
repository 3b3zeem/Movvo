"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import MediaCard from "@/components/streaming/MediaCard";
import Link from "next/link";
import { Bookmark, Film } from "lucide-react";

export default function WatchlistPage() {
  const { watchlist, isLoaded } = useWatchlist();

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-rose-600/20 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 md:px-8 py-8 space-y-6 text-left animate-fade-in delay-0">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
          My Watchlist
          <span className="w-2 h-2 rounded-full bg-rose-500" />
        </h1>
        <p className="text-zinc-500 text-xs mt-1">Your curated collection of movies and TV series</p>
      </div>

      {watchlist.length === 0 ? (
        /* Empty watchlist placeholder */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-sm mx-auto bg-zinc-900/30 border border-zinc-900 p-8 rounded-3xl">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Bookmark className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200">Your Watchlist is empty</h3>
            <p className="text-xs text-zinc-500 max-w-xs">
              Explore films and television shows, and save them here to watch them later.
            </p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 bg-gradient-to-r from-red-500 via-rose-500 to-purple-600 text-white rounded-xl text-xs font-semibold hover:brightness-110 transition-all shadow-md shadow-rose-600/10 cursor-pointer"
          >
            Explore Library
          </Link>
        </div>
      ) : (
        /* Watchlist Content Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
          {watchlist.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
