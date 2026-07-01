"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Play,
  Bookmark,
  BookmarkCheck,
  Star,
  Calendar,
  Film,
  RefreshCw,
  X,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import {
  tmdb,
  MediaDetails,
  CastMember,
  Episode,
  getTMDBImageUrl,
} from "@/lib/tmdb";
import { useWatchlist } from "@/hooks/useWatchlist";

interface TVDetailsClientProps {
  id: number;
  slugArray: string[];
  initialDetails: MediaDetails;
  initialCast: CastMember[];
  initialEpisodes: Episode[];
  initialSelectedSeason: number;
  initialActiveEpisode: { season: number; episode: number } | null;
  initialIsPlaying: boolean;
}

export default function TVDetailsClient({
  id,
  slugArray,
  initialDetails,
  initialCast,
  initialEpisodes,
  initialSelectedSeason,
  initialActiveEpisode,
  initialIsPlaying,
}: TVDetailsClientProps) {
  const router = useRouter();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const [details] = useState<MediaDetails>(initialDetails);
  const [cast] = useState<CastMember[]>(initialCast);
  const [selectedSeason, setSelectedSeason] = useState<number>(initialSelectedSeason);
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);

  const [episodesLoading, setEpisodesLoading] = useState(false);

  // Player state
  const [isPlaying, setIsPlaying] = useState(initialIsPlaying);
  const [activeEpisode, setActiveEpisode] = useState<{
    season: number;
    episode: number;
  } | null>(initialActiveEpisode);
  const [activeServer, setActiveServer] = useState<"vidsrc" | "vidsrccc">(
    "vidsrc",
  );
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);
  const playerSectionRef = useRef<HTMLDivElement>(null);

  // Handle browser back/forward buttons (history changes) using native popstate to avoid render-loop triggers
  useEffect(() => {
    if (!id) return;

    const handlePopState = () => {
      if (typeof window === "undefined") return;

      const path = window.location.pathname;
      const segments = path.split("/").filter(Boolean);

      if (segments[0] === "tv" && segments[1]) {
        const rawEpisodeInfo = segments[2] || "";
        const epMatch = rawEpisodeInfo.match(/^s(\d+)e(\d+)/i);
        if (epMatch) {
          const s = Number(epMatch[1]);
          const e = Number(epMatch[2]);
          setActiveEpisode({ season: s, episode: e });
          setIsPlaying(true);
          setSelectedSeason(s);
          fetchSeasonEpisodes(id, s);
        } else {
          setIsPlaying(false);
          setActiveEpisode(null);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [id]);

  // Rewrite initial URL to include series slug if missing (runs only once details are loaded)
  useEffect(() => {
    if (!details || !slugArray) return;
    const rawSeriesId = slugArray[0] || "";
    if (rawSeriesId.includes("-")) return;

    const seriesSlug = details.name
      ? encodeURIComponent(
          details.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
        )
      : "";
    
    if (seriesSlug) {
      const hasEpisode = slugArray[1] ? `/${slugArray[1]}` : "";
      const correctPath = `/tv/${details.id}-${seriesSlug}${hasEpisode}`;
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", correctPath);
      }
    }
  }, [details]);

  // Prevent iframe from redirecting the parent window on mobile/small screens
  useEffect(() => {
    if (!isPlaying) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message =
        "Are you sure you want to leave? Your video playback might be interrupted.";
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPlaying]);

  // Load episodes when season changes manually
  const handleSeasonChange = async (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    await fetchSeasonEpisodes(id, seasonNum);
  };

  const fetchSeasonEpisodes = async (tvId: number, seasonNum: number) => {
    setEpisodesLoading(true);
    try {
      const data = await tmdb.getSeasonEpisodes(tvId, seasonNum);
      const episodesList = data.episodes || [];
      setEpisodes(episodesList);
      return episodesList;
    } catch (err) {
      console.error("Failed to load episodes", err);
      return [];
    } finally {
      setEpisodesLoading(false);
    }
  };

  // Handle server reload
  const handleRefresh = () => {
    setIsPlayerLoading(true);
    const iframe = document.getElementById(
      "movvo-tv-iframe",
    ) as HTMLIFrameElement;
    if (iframe) {
      const src = iframe.src;
      iframe.src = "";
      setTimeout(() => {
        iframe.src = src;
      }, 50);
    }
  };

  const handlePlayEpisode = (seasonNum: number, episodeNum: number) => {
    // Look up the episode name to format its slug in the URL
    const episodeObj = episodes.find((e) => e.episode_number === episodeNum);
    const episodeName = episodeObj?.name || "";

    const episodeNameSlug = episodeName
      ? "-" +
        encodeURIComponent(
          episodeName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        )
      : "";

    const seriesSlug = details?.name
      ? encodeURIComponent(
          details.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        )
      : "";

    const newPath = `/tv/${id}-${seriesSlug}/s${seasonNum}e${episodeNum}${episodeNameSlug}`;

    setActiveEpisode({ season: seasonNum, episode: episodeNum });
    setIsPlaying(true);
    setIsPlayerLoading(true);

    if (typeof window !== "undefined") {
      window.history.pushState(null, "", newPath);
    }

    // Smooth scroll to player area
    setTimeout(() => {
      playerSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setActiveEpisode(null);
    const seriesSlug = details?.name
      ? encodeURIComponent(
          details.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        )
      : "";
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/tv/${id}-${seriesSlug}`);
    }
  };

  const handlePlayMain = () => {
    // Play first episode of selected season
    const episodeNum = episodes.length > 0 ? episodes[0].episode_number : 1;
    handlePlayEpisode(selectedSeason, episodeNum);
  };

  // Check if there is a next episode to show the premium "Next Episode" button
  const getNextEpisodeDetails = () => {
    if (!activeEpisode || !details) return null;
    const currentEpNum = activeEpisode.episode;
    const currentSeasonNum = activeEpisode.season;

    // Check if next episode exists in current season episodes list
    const nextEpInSeason = episodes.find(
      (e) => e.episode_number === currentEpNum + 1,
    );
    if (nextEpInSeason) {
      return {
        season: currentSeasonNum,
        episode: currentEpNum + 1,
        name: nextEpInSeason.name,
      };
    }

    // Check if next season exists
    if (details.seasons) {
      const sortedSeasons = [...details.seasons]
        .filter((s) => s.season_number > 0)
        .sort((a, b) => a.season_number - b.season_number);

      const currentSeasonIndex = sortedSeasons.findIndex(
        (s) => s.season_number === currentSeasonNum,
      );
      if (
        currentSeasonIndex !== -1 &&
        currentSeasonIndex < sortedSeasons.length - 1
      ) {
        const nextSeason = sortedSeasons[currentSeasonIndex + 1];
        return {
          season: nextSeason.season_number,
          episode: 1,
          isNextSeason: true,
          name: `Season ${nextSeason.season_number} Episode 1`,
        };
      }
    }

    return null;
  };

  const handleNextEpisodeClick = async () => {
    const nextEp = getNextEpisodeDetails();
    if (!nextEp) return;

    if (nextEp.season !== activeEpisode?.season) {
      // Transition to next season
      setSelectedSeason(nextEp.season);
      const newEpisodes = await fetchSeasonEpisodes(id, nextEp.season);
      if (newEpisodes && newEpisodes.length > 0) {
        handlePlayEpisode(nextEp.season, newEpisodes[0].episode_number);
      }
    } else {
      // Just play next episode in same season
      handlePlayEpisode(nextEp.season, nextEp.episode);
    }
  };

  const title = details.name || "Untitled Series";
  const releaseYear = details.first_air_date
    ? new Date(details.first_air_date).getFullYear()
    : "N/A";
  const isSaved = isInWatchlist(details.id);

  const toggleWatchlist = () => {
    if (isSaved) {
      removeFromWatchlist(details.id);
    } else {
      addToWatchlist({
        id: details.id,
        name: details.name,
        overview: details.overview,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        media_type: "tv",
        first_air_date: details.first_air_date,
        vote_average: details.vote_average,
        vote_count: details.vote_count,
        genre_ids: details.genres.map((g) => g.id),
      });
    }
  };

  const nextEpInfo = getNextEpisodeDetails();

  const iframeUrl = activeEpisode
    ? activeServer === "vidsrc"
      ? `https://vidsrc.to/embed/tv/${id}/${activeEpisode.season}/${activeEpisode.episode}`
      : `https://vidsrc.cc/v2/embed/tv/${id}/${activeEpisode.season}/${activeEpisode.episode}`
    : "";

  return (
    <div className="flex-1 px-4 sm:px-6 md:px-8 py-6 space-y-8 max-w-6xl mx-auto w-full text-left pb-16 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* Cinematic Media Player Banner Container */}
      <div ref={playerSectionRef} className="space-y-4">
        <div className="relative w-full aspect-video md:h-[65vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800/60 select-none">
          {isPlaying && activeEpisode ? (
            <div className="w-full h-full relative">
              {isPlayerLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/95 z-10">
                  <div className="w-12 h-12 rounded-full border-4 border-rose-600/20 border-t-rose-600 animate-spin" />
                  <p className="text-zinc-400 text-xs tracking-wider animate-pulse">
                    Connecting to streaming server...
                  </p>
                </div>
              )}
              <iframe
                id="movvo-tv-iframe"
                src={iframeUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                onLoad={() => setIsPlayerLoading(false)}
              />
            </div>
          ) : (
            <div className="relative w-full h-full group">
              <Image
                src={getTMDBImageUrl(details.backdrop_path, "original")}
                alt={title}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-102"
              />
              {/* Overlay Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />

              {/* Large Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <button
                  onClick={handlePlayMain}
                  className="w-20 h-20 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-rose-600/40 cursor-pointer"
                >
                  <Play className="w-9 h-9 fill-white text-white translate-x-0.5" />
                </button>
              </div>

              {/* Floating Meta Details on Banner */}
              <div className="absolute bottom-6 left-6 sm:left-10 right-6 z-10 max-w-xl space-y-2 pointer-events-none">
                <p className="text-xs font-semibold text-rose-500 tracking-wider uppercase">
                  {details.number_of_seasons} Seasons •{" "}
                  {details.number_of_episodes} Episodes
                </p>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                  {title}
                </h2>
              </div>
            </div>
          )}
        </div>

        {/* Video Player Action Bar */}
        {isPlaying && activeEpisode && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500 font-semibold uppercase tracking-wider">
                  Playing:
                </span>
                <span className="text-xs font-bold text-zinc-100">
                  S{activeEpisode.season}:E{activeEpisode.episode}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-rose-500 font-semibold uppercase tracking-wider">
                  Server:
                </span>
                <div className="flex bg-zinc-950 border border-zinc-850 p-0.5 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => {
                      setActiveServer("vidsrc");
                      setIsPlayerLoading(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeServer === "vidsrc"
                        ? "bg-rose-600 text-white shadow-md"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Server 1
                  </button>
                  <button
                    onClick={() => {
                      setActiveServer("vidsrccc");
                      setIsPlayerLoading(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeServer === "vidsrccc"
                        ? "bg-rose-600 text-white shadow-md"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Server 2
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {nextEpInfo && (
                <button
                  onClick={handleNextEpisodeClick}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  Next Episode
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="px-3.5 py-2 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-zinc-100 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              <button
                onClick={handleClosePlayer}
                className="px-3.5 py-2 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-zinc-100 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Close Player
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Info Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Poster & Main Specs Card */}
        <div className="lg:col-span-1 flex flex-col items-center lg:items-start gap-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6">
          <div className="relative w-48 sm:w-56 aspect-[2/3] bg-zinc-850 rounded-2xl overflow-hidden shadow-xl border border-zinc-800/80">
            <Image
              src={getTMDBImageUrl(details.poster_path, "w500")}
              alt={title}
              fill
              sizes="(max-width: 640px) 192px, 224px"
              className="object-cover"
            />
          </div>

          <div className="w-full space-y-4">
            {/* Metadata pills */}
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-zinc-400">
              <span className="flex items-center gap-1 px-3 py-1.5 bg-zinc-950/60 border border-zinc-850 rounded-lg text-amber-400">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {details.vote_average.toFixed(1)} IMDb
              </span>
              <span className="flex items-center gap-1 px-3 py-1.5 bg-zinc-950/60 border border-zinc-850 rounded-lg">
                <Calendar className="w-3 h-3 text-rose-500" />
                {releaseYear}
              </span>
              <span className="flex items-center gap-1 px-3 py-1.5 bg-zinc-950/60 border border-zinc-850 rounded-lg">
                <Film className="w-3 h-3 text-rose-500" />
                {details.number_of_seasons} Seasons
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={handlePlayMain}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-purple-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                Watch First Episode
              </button>

              <button
                onClick={toggleWatchlist}
                className={`w-full py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSaved
                    ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
                    : "bg-zinc-950 border-zinc-850 text-zinc-450 hover:text-zinc-100 hover:border-zinc-700"
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
                    Add to Watchlist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Synopsis, Genres & Cast Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-6">
            {/* Overview */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-zinc-100 border-l-2 border-rose-500 pl-3">
                Overview
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                {details.overview || "No overview available for this series."}
              </p>
            </div>

            {/* Genres */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-zinc-100 border-l-2 border-rose-500 pl-3">
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-850 text-zinc-300 hover:text-zinc-200 rounded-xl text-xs font-semibold"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Top Cast */}
            {cast.length > 0 && (
              <div className="space-y-4 border-t border-zinc-800/40 pt-6">
                <h3 className="text-base font-bold text-zinc-100 border-l-2 border-rose-500 pl-3">
                  Top Cast
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {cast.map((actor) => (
                    <div
                      key={actor.id}
                      className="flex-shrink-0 w-24 text-center space-y-2 select-none"
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto bg-zinc-800 border border-zinc-850">
                        {actor.profile_path ? (
                          <Image
                            src={getTMDBImageUrl(actor.profile_path, "w300")}
                            alt={actor.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-550 font-bold bg-zinc-950">
                            {actor.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
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
          </div>
        </div>
      </div>

      {/* Season & Episode Selector Section */}
      {details.seasons && details.seasons.length > 0 && (
        <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-950/80 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Seasons & Episodes
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </h3>
            <span className="text-xs text-zinc-500 font-semibold font-mono">
              Showing {episodes.length} Episodes
            </span>
          </div>

          {/* Season Selector Tabs */}
          <div className="flex gap-2.5 overflow-x-auto pb-3 no-scrollbar select-none">
            {details.seasons
              .filter((s) => s.season_number > 0) // Hide specials/extras
              .map((season) => (
                <button
                  key={season.id}
                  onClick={() => handleSeasonChange(season.season_number)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    selectedSeason === season.season_number
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20 scale-[1.03]"
                      : "bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
                  }`}
                >
                  {season.name}
                </button>
              ))}
          </div>

          {/* Episodes List Grid */}
          {episodesLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-3 border-rose-600/20 border-t-rose-600 rounded-full animate-spin" />
              <p className="text-zinc-500 text-xs">
                Loading season episodes...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {episodes.map((episode) => {
                const isActive =
                  activeEpisode?.season === selectedSeason &&
                  activeEpisode?.episode === episode.episode_number;
                return (
                  <div
                    key={episode.id}
                    onClick={() =>
                      handlePlayEpisode(selectedSeason, episode.episode_number)
                    }
                    className={`group flex gap-4 p-4 rounded-2xl transition-all duration-350 cursor-pointer border select-none ${
                      isActive
                        ? "bg-rose-950/20 border-rose-600/40"
                        : "bg-zinc-950/40 border-zinc-900/60 hover:border-zinc-800/80 hover:bg-zinc-950/80"
                    }`}
                  >
                    {/* Episode Still Image Thumbnail */}
                    <div className="relative w-32 aspect-video rounded-xl bg-zinc-900 border border-zinc-800 flex-shrink-0 overflow-hidden">
                      {episode.still_path ? (
                        <Image
                          src={getTMDBImageUrl(episode.still_path, "w300")}
                          alt={episode.name}
                          fill
                          sizes="128px"
                          className="object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-700 text-[10px]">
                          No Image
                        </div>
                      )}

                      {/* Play overlay hover indicator */}
                      <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play
                          className={`w-5 h-5 fill-white text-white transition-transform duration-300 ${isActive ? "scale-100 animate-pulse" : "scale-75 group-hover:scale-100"}`}
                        />
                      </div>
                    </div>

                    {/* Episode Metadata */}
                    <div className="flex-1 space-y-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">
                          Episode {episode.episode_number}
                        </span>
                        {episode.vote_average > 0 && (
                          <span className="text-[9px] font-semibold text-amber-500 flex items-center gap-0.5">
                            ★ {episode.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h4
                        className={`text-xs font-bold truncate group-hover:text-rose-500 transition-colors ${isActive ? "text-rose-500 font-extrabold" : "text-zinc-200"}`}
                      >
                        {episode.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                        {episode.overview ||
                          "No overview available for this episode."}
                      </p>
                    </div>
                  </div>
                );
              })}

              {episodes.length === 0 && (
                <p className="text-xs text-zinc-500 col-span-2 text-center py-8">
                  No episodes found for this season.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
