"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { tmdb, MediaItem, MOVIE_GENRES } from "@/lib/tmdb";
import MediaCard from "@/components/streaming/MediaCard";
import ApiKeySetupPrompt from "@/components/ui/ApiKeySetupPrompt";
import { CardSkeleton } from "@/components/ui/SkeletonLoader";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

export default function MoviesPage() {
  const { hasKey } = useApp();
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [genre, setGenre] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
        const data = await tmdb.discover("movie", {
          with_genres: genre || undefined,
          primary_release_year: year || undefined,
          sort_by: sortBy,
          page: page,
        });
        setMovies(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500)); // TMDB caps discover at 500 pages
      } catch (err: any) {
        console.error("Failed to discover movies", err);
        setError(err.message || "Failed to load movies from TMDB.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, [hasKey, genre, year, sortBy, page]);

  // Reset page to 1 when filters change
  const handleGenreChange = (val: string) => {
    setGenre(val);
    setPage(1);
  };

  const handleYearChange = (val: string) => {
    setYear(val);
    setPage(1);
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setPage(1);
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
        <p className="text-zinc-500 text-xs mt-1">Explore all cinematic movies with custom filters</p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold mr-2">
          <SlidersHorizontal className="w-4 h-4 text-rose-500" />
          <span>Filters:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
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
          {Array.from({ length: 12 }).map((_, i) => (
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
        <div className="flex items-center justify-between border-t border-zinc-900 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold disabled:opacity-40 disabled:hover:text-zinc-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-zinc-500 text-xs font-bold font-mono">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold disabled:opacity-40 disabled:hover:text-zinc-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
