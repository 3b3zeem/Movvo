"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { tmdb, MediaItem, getTMDBImageUrl } from "@/lib/tmdb";
import { Settings, AlertCircle, CheckCircle, Search, X } from "lucide-react";

export default function Header() {
  const { hasKey, openDetails } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle Search Submission (Pressing Enter or Clicking Icon)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/movies?q=${encodeURIComponent(query.trim())}`);
  };

  // Debounced API Search Query
  useEffect(() => {
    if (!query.trim() || !hasKey) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const data = await tmdb.search(query, 1);
        const validResults = (data.results || []).filter(
          (item) => item.media_type === "movie" || item.media_type === "tv",
        );
        setResults(validResults.slice(0, 5));
      } catch (err) {
        console.error("Header search failed", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, hasKey]);

  // Close results panel on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResultClick = (item: MediaItem) => {
    const type = item.media_type || (item.title ? "movie" : "tv");
    openDetails(type, item.id);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-900/40 flex items-center justify-between px-6 md:px-8">
      {/* Mobile & Desktop Logo */}
      <div className="flex items-center">
        <Link href="/" className="flex items-center select-none h-8 w-fit">
          <Image
            src="/logo.svg"
            alt="Movvo Logo"
            width={120}
            height={30}
            priority
            className="h-7 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Live Search Bar */}
      {hasKey && (
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-sm mx-4 sm:mx-8"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center"
          >
            <button
              type="submit"
              className="absolute left-3.5 text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setIsOpen(true)}
              className="w-full pl-10 pr-10 py-2 bg-zinc-900/50 border border-zinc-800/80 focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/20 text-zinc-200 placeholder-zinc-500 rounded-full text-xs font-semibold focus:outline-none transition-all duration-300"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                className="absolute right-3.5 p-0.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Results Dropdown Overlay */}
          {isOpen && query.trim().length > 0 && (
            <div className="absolute top-full right-0 w-[290px] xs:w-[320px] sm:w-full mt-2 p-1.5 bg-zinc-950/95 border border-zinc-850 rounded-2xl shadow-xl shadow-black/80 z-50 backdrop-blur-xl animate-scale-in delay-0 max-h-96 overflow-y-auto no-scrollbar">
              {isLoading ? (
                <div className="py-6 text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce delay-0" />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce delay-300" />
                </div>
              ) : results.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-500">
                  No results found
                </div>
              ) : (
                <div className="space-y-0.5">
                  {results.map((item) => {
                    const title = item.title || item.name || "Untitled";
                    const type =
                      item.media_type || (item.title ? "movie" : "tv");
                    const date = item.release_date || item.first_air_date || "";
                    const year = date ? new Date(date).getFullYear() : "N/A";
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleResultClick(item)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/60 transition-colors text-left group cursor-pointer"
                      >
                        <div className="relative w-9 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
                          <Image
                            src={getTMDBImageUrl(item.poster_path, "w300")}
                            alt={title}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-zinc-200 group-hover:text-rose-500 transition-colors truncate">
                            {title}
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">
                            {type === "movie" ? "Movie" : "TV Show"} • {year}
                          </p>
                        </div>
                        {item.vote_average > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-500/10 flex-shrink-0">
                            ★ {item.vote_average.toFixed(1)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Right Side Controls */}
      <div className="flex items-center gap-4 ml-auto">
        {/* TMDB API Key status indicator */}
        <Link
          href="/settings"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-350 ${
            hasKey
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 animate-pulse"
          }`}
        >
          {hasKey ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connected</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>API Key Required</span>
            </>
          )}
        </Link>

        {/* Settings button on mobile header */}
        <Link
          href="/settings"
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition-all duration-300 md:hidden"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
