"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { tmdb, MediaItem, MOVIE_GENRES, LANGUAGE_OPTIONS } from "@/lib/tmdb";
import MediaCard from "@/components/streaming/MediaCard";
import ApiKeySetupPrompt from "@/components/ui/ApiKeySetupPrompt";
import { CardSkeleton } from "@/components/ui/SkeletonLoader";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Search as SearchIcon, X } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

function MoviesContent() {
  const { hasKey } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read filter values directly from the URL
  const q = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") || "";
  const sortBy = searchParams.get("sortBy") || "popularity.desc";
  const page = Number(searchParams.get("page")) || 1;
  const language = searchParams.get("language") || "";

  // Local query state for smooth instant typing
  const [searchInput, setSearchInput] = useState(q);
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync search input with browser back/forward URL query parameter
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Debounce search typing and sync with URL query
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) {
        params.set("q", searchInput);
      } else {
        params.delete("q");
      }
      params.delete("page"); // reset page when query changes
      if (params.get("q") !== searchParams.get("q")) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, pathname, searchParams, router]);

  // Build release years (from current year 2026 back to 1990)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => String(currentYear - i));

  // Build option lists for CustomSelect components
  const genreOptions = [
    { value: "", label: "All Genres" },
    ...MOVIE_GENRES.map((g) => ({ value: String(g.id), label: g.name })),
  ];

  const yearOptions = [
    { value: "", label: "All Years" },
    ...years.map((y) => ({ value: y, label: y })),
  ];

  const sortOptions = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "release_date.desc", label: "Release Date" },
    { value: "vote_average.desc", label: "IMDb Rating" },
  ];

  useEffect(() => {
    if (!hasKey) {
      setIsLoading(false);
      return;
    }

    async function fetchMovies() {
      setIsLoading(true);
      setError("");
      try {
        let items: MediaItem[] = [];
        let totalItems = 0;

        if (q.trim()) {
          // If query is present, do a movie search (page size is 40 by calling page 2*p-1 and 2*p)
          const [data1, data2] = await Promise.all([
            tmdb.searchMovies(q, 2 * page - 1),
            tmdb.searchMovies(q, 2 * page),
          ]);

          items = [...(data1.results || []), ...(data2.results || [])];
          totalItems = data1.total_results || 0;

          // Apply client-side filters for search results (since TMDB search doesn't support genres/language/year)
          items = items.filter((item) => {
            // Filter by genre
            const matchesGenre = genre
              ? item.genre_ids?.includes(Number(genre))
              : true;

            // Filter by year
            const releaseDate = item.release_date || "";
            const yearStr = releaseDate ? String(new Date(releaseDate).getFullYear()) : "";
            const matchesYear = year ? yearStr === year : true;

            // Filter by language
            const matchesLanguage = language
              ? language === "foreign"
                ? item.original_language !== "en"
                : item.original_language === language
              : true;

            return matchesGenre && matchesYear && matchesLanguage;
          });
        } else {
          // Discover movies (flexible filtering)
          const [data1, data2] = await Promise.all([
            tmdb.discover("movie", {
              with_genres: genre || undefined,
              primary_release_year: year || undefined,
              sort_by: sortBy,
              page: 2 * page - 1,
              with_original_language: (language && language !== "foreign") ? language : undefined,
              without_original_language: language === "foreign" ? "en" : undefined,
            }),
            tmdb.discover("movie", {
              with_genres: genre || undefined,
              primary_release_year: year || undefined,
              sort_by: sortBy,
              page: 2 * page,
              with_original_language: (language && language !== "foreign") ? language : undefined,
              without_original_language: language === "foreign" ? "en" : undefined,
            }),
          ]);

          items = [...(data1.results || []), ...(data2.results || [])];
          totalItems = data1.total_results || 0;
        }

        // De-duplicate items based on ID to avoid React key collisions
        const seenIds = new Set<number>();
        const uniqueItems = items.filter((item) => {
          if (seenIds.has(item.id)) return false;
          seenIds.add(item.id);
          return true;
        });

        setMovies(uniqueItems);
        setTotalResults(totalItems);
        setTotalPages(Math.min(Math.ceil(totalItems / 40), 250)); // TMDB discover is capped at 500 pages of 20 = 250 pages of 40
      } catch (err: any) {
        console.error("Failed to fetch movies", err);
        setError(err.message || "Failed to load movies from TMDB.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, [hasKey, q, genre, year, sortBy, page, language]);

  // Helper to update filter parameters in URL
  const updateFilter = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === "") {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleGenreChange = (val: string) => {
    updateFilter({ genre: val, page: 1 });
  };

  const handleYearChange = (val: string) => {
    updateFilter({ year: val, page: 1 });
  };

  const handleSortChange = (val: string) => {
    updateFilter({ sortBy: val, page: 1 });
  };

  const handleLanguageChange = (val: string) => {
    updateFilter({ language: val, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateFilter({ page: newPage });
  };

  // Compute page numbers range to display in pagination controls
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const start = Math.max(2, page - 2);
      const end = Math.min(totalPages - 1, page + 2);
      if (start > 2) {
        pages.push("...");
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  if (!hasKey) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] px-4">
        <ApiKeySetupPrompt />
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 md:px-8 py-8 space-y-6 text-left animate-fade-in delay-0">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
          Browse Movies
          <span className="w-2 h-2 rounded-full bg-rose-500" />
        </h1>
        <p className="text-zinc-500 text-xs mt-1">Explore and search all cinematic movies with custom filters</p>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search movies by title, keywords..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all duration-300 text-sm shadow-xl"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
        <div className="flex items-center justify-between gap-2 text-zinc-400 text-xs font-semibold mr-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-rose-500" />
            <span>Filters:</span>
          </div>
          {(q || genre || year || language || sortBy !== "popularity.desc") && (
            <button
              onClick={() => {
                setSearchInput("");
                router.replace(pathname, { scroll: false });
              }}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-wider cursor-pointer ml-auto md:ml-2"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
          {/* Genre Filter */}
          <div className="space-y-1">
            <CustomSelect
              options={genreOptions}
              value={genre}
              onChange={handleGenreChange}
              placeholder="All Genres"
            />
          </div>

          {/* Year Filter */}
          <div className="space-y-1">
            <CustomSelect
              options={yearOptions}
              value={year}
              onChange={handleYearChange}
              placeholder="All Years"
            />
          </div>

          {/* Language Filter */}
          <div className="space-y-1">
            <CustomSelect
              options={LANGUAGE_OPTIONS}
              value={language}
              onChange={handleLanguageChange}
              placeholder="All Languages"
            />
          </div>

          {/* Sort By Filter */}
          <div className="space-y-1">
            <CustomSelect
              options={sortOptions}
              value={sortBy}
              onChange={handleSortChange}
              placeholder="Sort By"
            />
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center text-rose-500 text-sm font-semibold">{error}</div>
      ) : movies.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 text-sm font-semibold">
          No movies found matching these filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
          {movies.map((movie) => (
            <MediaCard key={movie.id} item={movie} type="movie" />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && movies.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 pt-6">
          <div className="text-zinc-500 text-xs font-semibold">
            Showing <span className="text-zinc-300 font-bold">{(page - 1) * 40 + 1}</span>-
            <span className="text-zinc-300 font-bold">{Math.min(page * 40, totalResults)}</span> of{" "}
            <span className="text-zinc-300 font-bold">{totalResults}</span> items
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="p-2.5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white rounded-xl disabled:opacity-30 disabled:hover:bg-zinc-950/80 disabled:hover:text-zinc-400 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1.5">
              {getPageNumbers().map((p, idx) => {
                if (p === "...") {
                  return (
                    <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-zinc-600 text-xs font-bold font-mono">
                      ...
                    </span>
                  );
                }

                const isCurrent = p === page;
                return (
                  <button
                    key={`page-${p}`}
                    onClick={() => handlePageChange(Number(p))}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold font-mono transition-all duration-300 cursor-pointer ${
                      isCurrent
                        ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20"
                        : "bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2.5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white rounded-xl disabled:opacity-30 disabled:hover:bg-zinc-950/80 disabled:hover:text-zinc-400 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 p-8 text-center text-zinc-500 animate-pulse min-h-[50vh] flex items-center justify-center">
        Loading movies library...
      </div>
    }>
      <MoviesContent />
    </Suspense>
  );
}
