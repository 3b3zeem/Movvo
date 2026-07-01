"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { MediaItem, getTMDBImageUrl } from "@/lib/tmdb";
import { useApp } from "@/context/AppContext";

interface HeroSliderProps {
  items: MediaItem[];
}

export default function HeroSlider({ items }: HeroSliderProps) {
  const { openDetails, openPlayer } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Take top 5 items for the slider
  const sliderItems = items.slice(0, 5);

  useEffect(() => {
    if (sliderItems.length === 0) return;

    if (!isHovered) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % sliderItems.length);
      }, 6000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, sliderItems.length]);

  if (sliderItems.length === 0) return null;

  const currentItem = sliderItems[activeIndex];
  const type = currentItem.media_type || (currentItem.title ? "movie" : "tv");
  const title = currentItem.title || currentItem.name || "Untitled";
  const releaseDate = currentItem.release_date || currentItem.first_air_date || "";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % sliderItems.length);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === "movie") {
      openPlayer("movie", currentItem.id);
    } else {
      openPlayer("tv", currentItem.id, 1, 1);
    }
  };

  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDetails(type, currentItem.id);
  };

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[65vh] sm:h-[80vh] bg-zinc-950 overflow-hidden select-none border-b border-zinc-900/60"
    >
      {/* Slide Image Background */}
      <div className="absolute inset-0 z-0">
        <Image
          key={activeIndex}
          src={getTMDBImageUrl(currentItem.backdrop_path, "original")}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-55 sm:opacity-60 animate-fade-in-backdrop scale-[1.01]"
        />
        {/* Gradients to blend into theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />
      </div>

      {/* Slide Navigation Chevron Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-zinc-950/50 hover:bg-rose-600/80 text-zinc-400 hover:text-white border border-zinc-800/40 hover:border-transparent opacity-0 hover:opacity-100 group-hover:opacity-100 md:opacity-100 transition-all duration-300 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-zinc-950/50 hover:bg-rose-600/80 text-zinc-400 hover:text-white border border-zinc-800/40 hover:border-transparent opacity-0 hover:opacity-100 group-hover:opacity-100 md:opacity-100 transition-all duration-300 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Slide Content Overlay */}
      <div className="absolute bottom-16 sm:bottom-24 left-6 sm:left-12 md:left-16 right-6 sm:right-24 z-10 max-w-2xl text-left space-y-4">
        {/* Rating & Tag */}
        <div className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
          <span className="px-2.5 py-0.75 bg-rose-600 rounded-md text-white tracking-wider uppercase text-[10px]">
            Trending
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {currentItem.vote_average.toFixed(1)}
          </span>
          <span>•</span>
          <span>{currentItem.media_type === "movie" ? "Movie" : "TV Show"}</span>
          <span>•</span>
          <span>{year}</span>
        </div>

        {/* Staggered Entries: Keyed to activeIndex to restart animations */}
        <div key={activeIndex} className="space-y-4">
          {/* Slide Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight uppercase animate-slide-up-fade-in delay-0 select-text">
            {title}
          </h1>

          {/* Slide Description */}
          <p className="text-zinc-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-xl font-normal animate-fade-in delay-200 select-text">
            {currentItem.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 animate-scale-in delay-400">
            <button
              onClick={handlePlay}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-purple-600 text-white font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-rose-600/25 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              Play Now
            </button>
            <button
              onClick={handleInfo}
              className="px-5 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Info className="w-4 h-4" />
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bars / Dots Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {sliderItems.map((_, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className="group relative h-1 rounded-full bg-zinc-700/60 overflow-hidden transition-all duration-300 cursor-pointer w-8 sm:w-12"
            >
              {isActive && (
                <div
                  className={`absolute left-0 top-0 bottom-0 bg-rose-600 rounded-full ${
                    !isHovered ? "animate-progress" : "w-full"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
