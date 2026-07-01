"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { X, Play, Bookmark, BookmarkCheck, Star, Clock, Calendar, Film } from "lucide-react";
import { tmdb, MediaDetails, CastMember, Episode, getTMDBImageUrl } from "@/lib/tmdb";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useApp } from "@/context/AppContext";

interface MediaDetailModalProps {
  type: "movie" | "tv";
  id: number;
  onClose: () => void;
}

export default function MediaDetailModal({ type, id, onClose }: MediaDetailModalProps) {
  const { openPlayer } = useApp();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [error, setError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch Movie/TV Details and Cast
  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true);
      setError("");
      try {
        const [detailsData, creditsData] = await Promise.all([
          tmdb.getDetails(type, id),
          tmdb.getCredits(type, id),
        ]);
        setDetails(detailsData);
        setCast(creditsData.cast.slice(0, 10)); // Limit to top 10 cast members

        // If TV show, fetch episodes for season 1 by default
        if (type === "tv" && detailsData.seasons && detailsData.seasons.length > 0) {
          // Find first valid season (usually 1, sometimes 0 exists as Specials)
          const firstSeason = detailsData.seasons.find(s => s.season_number > 0) || detailsData.seasons[0];
          setSelectedSeason(firstSeason.season_number);
          await fetchSeasonEpisodes(id, firstSeason.season_number);
        }
      } catch (err: any) {
        console.error("Failed to load details", err);
        setError(err.message || "Failed to load details from TMDB.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetails();
  }, [type, id]);

  // Fetch episodes when season changes
  const handleSeasonChange = async (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    await fetchSeasonEpisodes(id, seasonNum);
  };

  const fetchSeasonEpisodes = async (tvId: number, seasonNum: number) => {
    setEpisodesLoading(true);
    try {
      const data = await tmdb.getSeasonEpisodes(tvId, seasonNum);
      setEpisodes(data.episodes || []);
    } catch (err) {
      console.error("Failed to load episodes", err);
    } finally {
      setEpisodesLoading(false);
    }
  };

  // Close modal when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-600/20 border-t-rose-600 rounded-full animate-spin" />
          <p className="text-zinc-400 text-xs tracking-wider">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full text-center">
          <p className="text-rose-500 font-semibold mb-4">{error || "Something went wrong"}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const title = details.title || details.name || "Untitled";
  const releaseYear = details.release_date
    ? new Date(details.release_date).getFullYear()
    : details.first_air_date
    ? new Date(details.first_air_date).getFullYear()
    : "N/A";
  
  const isSaved = isInWatchlist(details.id);

  const toggleWatchlist = () => {
    if (isSaved) {
      removeFromWatchlist(details.id);
    } else {
      // Create a compatible MediaItem object
      addToWatchlist({
        id: details.id,
        title: details.title,
        name: details.name,
        overview: details.overview,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        media_type: type,
        release_date: details.release_date,
        first_air_date: details.first_air_date,
        vote_average: details.vote_average,
        vote_count: details.vote_count,
        genre_ids: details.genres.map((g) => g.id),
      });
    }
  };

  const handlePlayMain = () => {
    if (type === "movie") {
      openPlayer("movie", details.id);
    } else {
      // Play first episode of selected season
      const episodeNum = episodes.length > 0 ? episodes[0].episode_number : 1;
      openPlayer("tv", details.id, selectedSeason, episodeNum);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="relative bg-zinc-900 border border-zinc-800/80 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in delay-0 no-scrollbar"
      >
        {/* Backdrop Image Banner */}
        <div className="relative h-64 sm:h-96 w-full select-none">
          <Image
            src={getTMDBImageUrl(details.backdrop_path, "original")}
            alt={title}
            fill
            priority
            className="object-cover"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/80 via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-zinc-950/60 backdrop-blur-md text-zinc-400 hover:text-zinc-100 border border-zinc-800/50 rounded-full hover:scale-105 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details Block */}
        <div className="px-6 pb-8 sm:px-10 -mt-16 sm:-mt-24 relative z-10 space-y-8">
          {/* Header Info: Poster & Title */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
            <div className="relative w-36 sm:w-44 aspect-[2/3] bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex-shrink-0">
              <Image
                src={getTMDBImageUrl(details.poster_path, "w500")}
                alt={title}
                fill
                sizes="(max-width: 640px) 144px, 176px"
                className="object-cover"
              />
            </div>

            <div className="space-y-4 flex-1 text-left">
              {details.tagline && (
                <p className="text-xs font-semibold text-rose-500 tracking-wider uppercase">
                  {details.tagline}
                </p>
              )}
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {title}
              </h1>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-zinc-400">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {details.vote_average.toFixed(1)} Rating
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {releaseYear}
                </span>
                {type === "movie" && details.runtime ? (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {details.runtime}m
                  </span>
                ) : type === "tv" && details.number_of_seasons ? (
                  <span className="flex items-center gap-1">
                    <Film className="w-3.5 h-3.5" />
                    {details.number_of_seasons} Seasons
                  </span>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handlePlayMain}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-purple-600 hover:brightness-110 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  Play Now
                </button>

                <button
                  onClick={toggleWatchlist}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isSaved
                      ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
                      : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      Add Watchlist
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Synopsis & Genres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-zinc-800/60 pt-6">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-zinc-100">Overview</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                {details.overview || "No overview available for this title."}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-zinc-100 font-sans">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Cast Members Carousel */}
          {cast.length > 0 && (
            <div className="space-y-4 text-left border-t border-zinc-800/60 pt-6">
              <h3 className="text-base font-bold text-zinc-100">Top Cast</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {cast.map((actor) => (
                  <div key={actor.id} className="flex-shrink-0 w-24 text-center space-y-2 select-none">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto bg-zinc-800 border border-zinc-800">
                      {actor.profile_path ? (
                        <Image
                          src={getTMDBImageUrl(actor.profile_path, "w300")}
                          alt={actor.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600 font-bold bg-zinc-950">
                          {actor.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-semibold text-zinc-300 truncate w-full px-1">
                        {actor.name}
                      </p>
                      <p className="text-[9px] text-zinc-500 truncate w-full px-1">
                        {actor.character}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Season & Episode Selector (For TV Shows only) */}
          {type === "tv" && details.seasons && details.seasons.length > 0 && (
            <div className="space-y-6 text-left border-t border-zinc-800/60 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-100">Episodes</h3>
                
                {/* Season Select Dropdown */}
                <select
                  value={selectedSeason}
                  onChange={(e) => handleSeasonChange(Number(e.target.value))}
                  className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500 transition-all cursor-pointer"
                >
                  {details.seasons
                    .filter((s) => s.season_number > 0) // Hide specials/extras by default
                    .map((season) => (
                      <option key={season.id} value={season.season_number}>
                        {season.name} ({season.episode_count} Episodes)
                      </option>
                    ))}
                </select>
              </div>

              {/* Episodes List Grid */}
              {episodesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-rose-600/20 border-t-rose-600 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className="group flex gap-4 p-3 bg-zinc-950/40 border border-zinc-900/60 hover:border-zinc-800/80 rounded-2xl hover:bg-zinc-950/80 transition-all duration-300 items-center select-none"
                    >
                      {/* Episode Thumbnail */}
                      <div className="relative w-28 aspect-video rounded-xl bg-zinc-900 border border-zinc-800 flex-shrink-0 overflow-hidden">
                        {episode.still_path ? (
                          <Image
                            src={getTMDBImageUrl(episode.still_path, "w300")}
                            alt={episode.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700 text-xs">
                            No Image
                          </div>
                        )}
                        {/* Hover Overlay Play Icon */}
                        <div
                          onClick={() => openPlayer("tv", details.id, selectedSeason, episode.episode_number)}
                          className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 cursor-pointer"
                        >
                          <Play className="w-5 h-5 fill-white text-white" />
                        </div>
                      </div>

                      {/* Episode Meta */}
                      <div className="flex-1 space-y-1 text-left min-w-0">
                        <span className="text-[9px] font-bold text-rose-500 uppercase">
                          Episode {episode.episode_number}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-200 truncate">
                          {episode.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                          {episode.overview || "No overview available for this episode."}
                        </p>
                      </div>
                    </div>
                  ))}

                  {episodes.length === 0 && (
                    <p className="text-xs text-zinc-500 col-span-2 text-center py-4">
                      No episodes found for this season.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
