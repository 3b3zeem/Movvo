"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import { MediaItem, getTMDBImageUrl, MOVIE_GENRES, TV_GENRES } from "@/lib/tmdb";

interface MediaCardProps {
  item: MediaItem;
  type?: "movie" | "tv";
}

export default function MediaCard({ item, type }: MediaCardProps) {
  // Determine media type (fallback order: prop override -> item field -> default movie)
  const resolvedType = type || item.media_type || (item.title ? "movie" : "tv");
  const title = item.title || item.name || "Untitled";
  const releaseDate = item.release_date || item.first_air_date || "";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const yearDisplay = year || "N/A";
  
  // Get primary genre from static TMDB mapping
  const genresList = resolvedType === "movie" ? MOVIE_GENRES : TV_GENRES;
  const primaryGenre = item.genre_ids && item.genre_ids.length > 0 
    ? genresList.find(g => g.id === item.genre_ids[0])?.name 
    : null;

  // Recent releases get a 4K badge, others HD
  const isRecent = year && year >= 2023;
  
  const href = `/${resolvedType === "movie" ? "movies" : "tv"}/${item.id}`;

  return (
    <Link
      href={href}
      className="group/card relative flex flex-col flex-shrink-0 w-[150px] sm:w-48 bg-zinc-950 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-3xl hover:shadow-rose-500/15 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] border border-zinc-900 hover:border-rose-500/30 select-none"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        <Image
          src={getTMDBImageUrl(item.poster_path, "w500")}
          alt={title}
          fill
          sizes="(max-width: 640px) 150px, 192px"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          loading="lazy"
        />

        {/* Ambient Dark Gradient Overlay (always visible, deepens on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/20 opacity-70 group-hover/card:opacity-90 transition-opacity duration-500" />

        {/* Cinematic Play Button (fades and scales in) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-500 z-10">
          <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-600 text-white shadow-xl shadow-rose-600/50 transform scale-75 group-hover/card:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
            {/* Pulsing halo ring */}
            <span className="absolute inset-0 rounded-full bg-rose-600 opacity-60 animate-ping" style={{ animationDuration: '2s' }}></span>
            <Play className="relative w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5 z-10" />
          </div>
        </div>

        {/* Top Overlay Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          {/* Glass Rating Badge */}
          {item.vote_average > 0 && (
            <div className="px-2 py-0.5 bg-zinc-950/80 backdrop-blur-md rounded-md flex items-center gap-1 text-[10px] font-bold text-amber-400 border border-amber-400/20 shadow-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
          )}

          {/* Glass Quality Badge */}
          <div className="px-1.5 py-0.5 bg-zinc-950/80 backdrop-blur-md rounded-md text-[9px] font-bold text-zinc-300 border border-zinc-800/40 uppercase tracking-wide">
            {isRecent ? "4K" : "HD"}
          </div>
        </div>

        {/* Hover Genre Badge at the bottom of the image */}
        {primaryGenre && (
          <div className="absolute bottom-2.5 left-3 right-3 opacity-0 group-hover/card:opacity-100 transition-all duration-500 transform translate-y-2 group-hover/card:translate-y-0 z-10">
            <span className="inline-block px-2 py-0.5 bg-rose-950/80 backdrop-blur-md text-[9px] text-rose-200 rounded-md font-medium border border-rose-500/20">
              {primaryGenre}
            </span>
          </div>
        )}
      </div>

      {/* Details Box */}
      <div className="p-3 bg-zinc-950 transition-colors duration-300 flex-1 flex flex-col justify-between">
        <h4 className="text-xs sm:text-sm font-bold text-zinc-200 truncate group-hover/card:text-rose-500 transition-colors duration-500 leading-snug">
          {title}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 font-medium">
          <span className="flex items-center gap-1.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${resolvedType === "movie" ? "bg-rose-500" : "bg-blue-500"}`} />
            {resolvedType === "movie" ? "Movie" : "TV Show"}
          </span>
          <span className="text-zinc-500">{yearDisplay}</span>
        </div>
      </div>
    </Link>
  );
}
