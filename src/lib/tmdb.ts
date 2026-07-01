// TMDB API Service for Movvo

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface MediaItem {
  id: number;
  title?: string;
  name?: string; // For TV shows
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type?: "movie" | "tv";
  release_date?: string;
  first_air_date?: string; // For TV shows
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime: number | null;
  vote_average: number;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface MediaDetails extends MediaItem {
  tagline?: string;
  genres: { id: number; name: string }[];
  runtime?: number; // For movies
  episode_run_time?: number[]; // For TV shows
  number_of_seasons?: number; // For TV shows
  number_of_episodes?: number; // For TV shows
  seasons?: Season[];
  imdb_id?: string;
}

// Function to retrieve the API key from Env
export function getTMDBApiKey(): string {
  return process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
}

// Check if API key is configured
export function hasApiKey(): boolean {
  return getTMDBApiKey().length > 0;
}

// Save API key (No-op since localStorage is deprecated)
export function saveTMDBApiKey(key: string) {
  // Local storage writing is disabled for production safety
}

// Helper for making TMDB fetch requests
async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const apiKey = getTMDBApiKey();
  if (!apiKey) {
    throw new Error("TMDB API Key is missing. Please set it in Settings.");
  }

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    ...Object.entries(params).reduce(
      (acc, [key, val]) => {
        if (val !== undefined && val !== null) {
          acc[key] = String(val);
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache responses for 1 hour
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid TMDB API Key. Please check your settings.");
    }
    throw new Error(`TMDB fetch failed with status: ${response.status}`);
  }

  return response.json();
}

// TMDB API Endpoints
export const tmdb = {
  // Get Trending Movies & TV Shows (for Hero Slider & Rows)
  getTrending: async (
    type: "all" | "movie" | "tv" = "all",
    timeWindow: "day" | "week" = "day",
  ): Promise<{ results: MediaItem[] }> => {
    return tmdbFetch<{ results: MediaItem[] }>(
      `/trending/${type}/${timeWindow}`,
    );
  },

  // Get Popular Movies
  getPopularMovies: async (
    page = 1,
  ): Promise<{
    results: MediaItem[];
    total_pages: number;
    total_results: number;
  }> => {
    return tmdbFetch<{
      results: MediaItem[];
      total_pages: number;
      total_results: number;
    }>("/movie/popular", { page });
  },

  // Get Popular TV Shows
  getPopularTVShows: async (
    page = 1,
  ): Promise<{
    results: MediaItem[];
    total_pages: number;
    total_results: number;
  }> => {
    return tmdbFetch<{
      results: MediaItem[];
      total_pages: number;
      total_results: number;
    }>("/tv/popular", { page });
  },

  // Search Movies, TV Shows, and People
  search: async (
    query: string,
    page = 1,
  ): Promise<{
    results: MediaItem[];
    total_pages: number;
    total_results: number;
  }> => {
    return tmdbFetch<{
      results: MediaItem[];
      total_pages: number;
      total_results: number;
    }>("/search/multi", { query, page });
  },

  // Get Detailed Info for Movie or TV Show
  getDetails: async (
    type: "movie" | "tv",
    id: number | string,
  ): Promise<MediaDetails> => {
    return tmdbFetch<MediaDetails>(`/${type}/${id}`);
  },

  // Get Cast/Credits for a Title
  getCredits: async (
    type: "movie" | "tv",
    id: number | string,
  ): Promise<{ cast: CastMember[] }> => {
    return tmdbFetch<{ cast: CastMember[] }>(`/${type}/${id}/credits`);
  },

  // Get Episode List for a specific Season of a TV Show
  getSeasonEpisodes: async (
    tvId: number | string,
    seasonNumber: number,
  ): Promise<{ episodes: Episode[] }> => {
    return tmdbFetch<{ episodes: Episode[] }>(
      `/tv/${tvId}/season/${seasonNumber}`,
    );
  },

  // Get recommendations for a media item
  getRecommendations: async (
    type: "movie" | "tv",
    id: number | string,
    page = 1,
  ): Promise<{ results: MediaItem[] }> => {
    return tmdbFetch<{ results: MediaItem[] }>(`/${type}/${id}/recommendations`, { page });
  },

  // Discover Media (flexible filtering)
  discover: async (
    type: "movie" | "tv",
    params: {
      with_genres?: string;
      primary_release_year?: string;
      first_air_date_year?: string;
      sort_by?: string;
      page?: number;
    } = {},
  ): Promise<{
    results: MediaItem[];
    total_pages: number;
    total_results: number;
  }> => {
    const apiParams: Record<string, string | number> = {
      page: params.page || 1,
    };

    if (params.with_genres) apiParams.with_genres = params.with_genres;
    if (params.sort_by) apiParams.sort_by = params.sort_by;

    if (type === "movie" && params.primary_release_year) {
      apiParams.primary_release_year = params.primary_release_year;
    } else if (type === "tv" && params.first_air_date_year) {
      apiParams.first_air_date_year = params.first_air_date_year;
    }

    return tmdbFetch<{
      results: MediaItem[];
      total_pages: number;
      total_results: number;
    }>(`/discover/${type}`, apiParams);
  },

  // Get Genres list
  getGenres: async (
    type: "movie" | "tv",
  ): Promise<{ genres: { id: number; name: string }[] }> => {
    return tmdbFetch<{ genres: { id: number; name: string }[] }>(
      `/genre/${type}/list`,
    );
  },
};

// Common TMDB Image URL Builder
export function getTMDBImageUrl(
  path: string | null,
  size: "w300" | "w500" | "original" = "w500",
): string {
  if (!path) return "/placeholder-image.svg"; // Handle missing images gracefully
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Static fallback genres list just in case API fails or loading state
export const MOVIE_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 10770, name: "TV Movie" },
  { id: 5349, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

export const TV_GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];
