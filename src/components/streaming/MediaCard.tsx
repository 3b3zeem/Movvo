"use client";

import Image from "next/image";
import { Play, Star } from "lucide-react";
import { MediaItem, getTMDBImageUrl } from "@/lib/tmdb";
import { useApp } from "@/context/AppContext";

interface MediaCardProps {
  item: MediaItem;
  type?: "movie" | "tv";
}

export default function MediaCard({ item, type }: MediaCardProps) {
  const { openDetails } = useApp();
  
  // Determine media type (fallback order: prop override -> item field -> default movie)
  const resolvedType = type || item.media_type || (item.title ? "movie" : "tv");
  const title = item.title || item.name || "Untitled";
  const releaseDate = item.release_date || item.first_air_date || "";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
  
  const handleCardClick = () => {
    openDetails(resolvedType, item.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group/card relative flex-shrink-0 w-40 sm:w-48 bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-rose-500/10 hover:scale-105 transition-all duration-300 border border-zinc-800/40 select-none "
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={getTMDBImageUrl(item.poster_path, "w500")}
          alt={title}
          fill
          sizes="(max-width: 640px) 160px, 192px"
          className="object-cover transition-transform duration-500 group-hover/card:scale-105"
          loading="lazy"
        />

        {/* Hover Overlay with Play Button */}
        <div className="absolute inset-0 bg-zinc-950/80 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center transform scale-75 group-hover/card:scale-100 transition-transform duration-300 shadow-lg shadow-rose-600/35 mb-3">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
          <span className="text-xs font-semibold text-zinc-100 line-clamp-2 px-1">
            {title}
          </span>
          <span className="text-[10px] text-zinc-400 mt-1">
            {resolvedType === "movie" ? "Movie" : "TV Series"} • {year}
          </span>
        </div>

        {/* Floating Rating Badge */}
        {item.vote_average > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.75 bg-zinc-900/90 backdrop-blur-md rounded-md flex items-center gap-1 text-[10px] font-bold text-amber-400 border border-zinc-800/50">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {item.vote_average.toFixed(1)}
          </div>
        )}
      </div>

      {/* Card Info Details (visible by default on mobile) */}
      <div className="p-3">
        <h4 className="text-xs font-semibold text-zinc-200 truncate group-hover/card:text-rose-500 transition-colors duration-300">
          {title}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
          <span>{resolvedType === "movie" ? "Movie" : "TV Show"}</span>
          <span>{year}</span>
        </div>
      </div>
    </div>
  );
}
