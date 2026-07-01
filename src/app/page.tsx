"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { tmdb, MediaItem } from "@/lib/tmdb";
import HeroSlider from "@/components/streaming/HeroSlider";
import MediaRow from "@/components/streaming/MediaRow";
import ApiKeySetupPrompt from "@/components/ui/ApiKeySetupPrompt";
import HomeSkeleton from "@/components/ui/SkeletonLoader";

export default function Home() {
  const { hasKey } = useApp();
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [actionMovies, setActionMovies] = useState<MediaItem[]>([]);
  const [comedyTV, setComedyTV] = useState<MediaItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasKey) {
      setIsLoading(false);
      return;
    }

    async function loadHomeFeed() {
      setIsLoading(true);
      setError("");
      try {
        const [
          trendingData,
          popularMoviesData,
          popularTVData,
          actionMoviesData,
          comedyTVData,
        ] = await Promise.all([
          tmdb.getTrending("all", "week"),
          tmdb.getPopularMovies(1),
          tmdb.getPopularTVShows(1),
          tmdb.discover("movie", { with_genres: "28", page: 1 }), // Action Genre id = 28
          tmdb.discover("tv", { with_genres: "35", page: 1 }), // Comedy Genre id = 35
        ]);

        setTrending(trendingData.results || []);
        setPopularMovies(popularMoviesData.results || []);
        setPopularTV(popularTVData.results || []);
        setActionMovies(actionMoviesData.results || []);
        setComedyTV(comedyTVData.results || []);
      } catch (err: any) {
        console.error("Failed to load home page content", err);
        setError(err.message || "An error occurred while fetching content from TMDB.");
      } finally {
        setIsLoading(false);
      }
    }

    loadHomeFeed();
  }, [hasKey]);

  // Case 1: API Key not set
  if (!hasKey) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] px-4">
        <ApiKeySetupPrompt />
      </div>
    );
  }

  // Case 2: Loading Feed
  if (isLoading) {
    return <HomeSkeleton />;
  }

  // Case 3: Fetching Error
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[60vh] space-y-4">
        <h2 className="text-xl font-bold text-rose-500">Service Unreachable</h2>
        <p className="text-zinc-400 text-sm max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 rounded-xl text-sm transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-12 animate-fade-in delay-0">
      {/* Dynamic Hero Slider */}
      {trending.length > 0 && <HeroSlider items={trending} />}

      {/* Media Rows */}
      <div className="-mt-8 relative z-10 space-y-4">
        <MediaRow title="Trending Now" items={trending} />
        <MediaRow title="Popular Movies" items={popularMovies} type="movie" />
        <MediaRow title="Popular TV Shows" items={popularTV} type="tv" />
        <MediaRow title="Action Thrillers" items={actionMovies} type="movie" />
        <MediaRow title="Laugh Out Loud TV" items={comedyTV} type="tv" />
      </div>
    </div>
  );
}
