"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { tmdb, MediaItem, MOVIE_GENRES, TV_GENRES } from "@/lib/tmdb";
import MediaCard from "@/components/streaming/MediaCard";
import ApiKeySetupPrompt from "@/components/ui/ApiKeySetupPrompt";
import { CardSkeleton } from "@/components/ui/SkeletonLoader";
import { Search as SearchIcon, SlidersHorizontal, Film, Tv, Calendar } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

function SearchContent() {
  const { hasKey } = useApp();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  
  const [results, setResults] = useState<MediaItem[]>([]);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state query when URL query parameter 'q' changes
  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  // Build years (from current year 2026 back to 1990)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => String(currentYear - i));

  // Load trending media on mount as placeholders if no search is active
  useEffect(() => {
    if (!hasKey) return;
    
    async function loadTrending() {
      try {
        const data = await tmdb.getTrending("all", "day");
        setTrending(data.results || []);
      } catch (err) {
        console.error("Failed to load search trendings", err);
      }
    }
    loadTrending();
  }, [hasKey]);

  // Debounced TMDB Multi-Search and Discovery Filter Execution
  useEffect(() => {
    if (!hasKey) return;

    // Clear any existing timer
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    // If there is no active search query and no filters, display trending
    if (!query.trim() && mediaType === "all" && !selectedGenre && !selectedYear) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        let items: MediaItem[] = [];

        if (query.trim()) {
          // If query is present, do a multi-search
          const searchData = await tmdb.search(query, 1);
          items = searchData.results || [];

          // Client-side filtering for search results
          items = items.filter((item) => {
            // Filter by media type
            const matchesType =
              mediaType === "all"
                ? item.media_type === "movie" || item.media_type === "tv"
                : item.media_type === mediaType;

            // Filter by genre
            const matchesGenre = selectedGenre
              ? item.genre_ids?.includes(Number(selectedGenre))
              : true;

            // Filter by year
            const releaseDate = item.release_date || item.first_air_date || "";
            const yearStr = releaseDate ? String(new Date(releaseDate).getFullYear()) : "";
            const matchesYear = selectedYear ? yearStr === selectedYear : true;

            return matchesType && matchesGenre && matchesYear;
          });
        } else {
          // If no query but filters are active, do a discovery query
          const targetType = mediaType === "all" ? "movie" : mediaType;
          const discoverData = await tmdb.discover(targetType, {
            with_genres: selectedGenre || undefined,
            primary_release_year: targetType === "movie" ? selectedYear || undefined : undefined,
            first_air_date_year: targetType === "tv" ? selectedYear || undefined : undefined,
            page: 1,
          });
          
          items = (discoverData.results || []).map(item => ({
            ...item,
            media_type: targetType
          }));
        }

        setResults(items);
      } catch (err: any) {
        console.error("Search/Filter failed", err);
        setError(err.message || "Failed to fetch search results.");
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms typing debounce

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, mediaType, selectedGenre, selectedYear, hasKey]);

  if (!hasKey) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] px-4">
        <ApiKeySetupPrompt />
      </div>
    );
  }

  // Get active genre list depending on selected media type
  const activeGenres = mediaType === "tv" ? TV_GENRES : MOVIE_GENRES;

  // Build option lists for CustomSelect components
  const genreOptions = [
    { value: "", label: "All Genres" },
    ...activeGenres.map((g) => ({ value: String(g.id), label: g.name })),
  ];

  const yearOptions = [
    { value: "", label: "All Years" },
    ...years.map((y) => ({ value: y, label: y })),
  ];

  return (
    <div className="flex-1 px-6 md:px-8 py-8 space-y-6 text-left animate-fade-in delay-0">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
          Explore Library
          <span className="w-2 h-2 rounded-full bg-rose-500" />
        </h1>
        <p className="text-zinc-500 text-xs mt-1">Instant search and deep content filtering</p>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by movie title, show name, or keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all duration-300 text-sm shadow-xl"
        />
      </div>

      {/* Advanced Filter Interface Panel */}
      <div className="flex flex-col gap-4 p-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
          <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold">
            <SlidersHorizontal className="w-4 h-4 text-rose-500" />
            <span>Search Filters</span>
          </div>
          {(query || mediaType !== "all" || selectedGenre || selectedYear) && (
            <button
              onClick={() => {
                setQuery("");
                setMediaType("all");
                setSelectedGenre("");
                setSelectedYear("");
              }}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Content Type Selector */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Film className="w-3 h-3" />
              Content Type
            </label>
            <div className="flex bg-zinc-950 border border-zinc-850 p-1 rounded-xl text-xs font-semibold text-zinc-400 w-full">
              <button
                onClick={() => {
                  setMediaType("all");
                  setSelectedGenre(""); // reset genre since schemas mismatch
                }}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  mediaType === "all" ? "bg-zinc-800 text-white" : "hover:text-zinc-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setMediaType("movie");
                  setSelectedGenre("");
                }}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  mediaType === "movie" ? "bg-zinc-800 text-white" : "hover:text-zinc-200"
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => {
                  setMediaType("tv");
                  setSelectedGenre("");
                }}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  mediaType === "tv" ? "bg-zinc-800 text-white" : "hover:text-zinc-200"
                }`}
              >
                TV
              </button>
            </div>
          </div>

          {/* Genre Filter */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Film className="w-3 h-3" />
              Genre
            </label>
            <CustomSelect
              options={genreOptions}
              value={selectedGenre}
              onChange={setSelectedGenre}
              placeholder="All Genres"
            />
          </div>

          {/* Release Year Filter */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              Release Year
            </label>
            <CustomSelect
              options={yearOptions}
              value={selectedYear}
              onChange={setSelectedYear}
              placeholder="All Years"
            />
          </div>
        </div>
      </div>

      {/* Results Title */}
      <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-900 pb-2">
        {query.trim() || mediaType !== "all" || selectedGenre || selectedYear
          ? "Search Results"
          : "Trending Suggestions"}
      </h3>

      {/* Grid Display Area */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center text-rose-500 text-sm font-semibold">{error}</div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
          {results.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      ) : query.trim() || mediaType !== "all" || selectedGenre || selectedYear ? (
        <div className="py-16 text-center text-zinc-500 text-sm font-semibold">
          No matches found. Try modifying your search or filters.
        </div>
      ) : (
        // Render Trending if idle
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
          {trending.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 p-8 text-center text-zinc-500 animate-pulse min-h-[50vh] flex items-center justify-center">
        Loading explore library...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
