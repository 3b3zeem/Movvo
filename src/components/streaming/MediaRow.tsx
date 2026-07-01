"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaItem } from "@/lib/tmdb";
import MediaCard from "./MediaCard";

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  type?: "movie" | "tv";
}

export default function MediaRow({ title, items, type }: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      const targetScroll =
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;

      rowRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      // Show left button if we have scrolled
      setShowLeftBtn(scrollLeft > 10);
      // Show right button if there is more to scroll (with 10px buffer)
      setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    // Initial check
    handleScroll();
    
    // Add resize listener just in case
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="relative group space-y-3 px-6 md:px-8 py-4 select-none">
      {/* Row Title */}
      <h2 className="text-lg md:text-xl font-bold text-zinc-100 flex items-center gap-2 text-left">
        {title}
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      </h2>

      {/* Row Container with Scroll Buttons */}
      <div className="relative">
        {/* Left Scroll Button */}
        {showLeftBtn && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Scroll Button */}
        {showRightBtn && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Horizontal Scrolling Area */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        >
          {items.map((item) => (
            <MediaCard key={item.id} item={item} type={type} />
          ))}
        </div>
      </div>
    </div>
  );
}
