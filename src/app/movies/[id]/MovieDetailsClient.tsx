"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Play, Bookmark, BookmarkCheck, Star, Clock, Calendar, RefreshCw, X, ArrowLeft } from "lucide-react";
import { MediaDetails, CastMember, getTMDBImageUrl } from "@/lib/tmdb";
import { useWatchlist } from "@/hooks/useWatchlist";

interface MovieDetailsClientProps {
  id: number;
  rawId: string;
  initialDetails: MediaDetails;
  initialCast: CastMember[];
}

export default function MovieDetailsClient({
  id,
  rawId,
  initialDetails,
  initialCast,
}: MovieDetailsClientProps) {
  const router = useRouter();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const [details] = useState<MediaDetails>(initialDetails);
  const [cast] = useState<CastMember[]>(initialCast);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeServer, setActiveServer] = useState<"vidsrc" | "vidsrccc">("vidsrc");
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);
  const playerSectionRef = useRef<HTMLDivElement>(null);

  // Dynamic URL slug update
  useEffect(() => {
    if (details && rawId) {
      const slug = details.title
        ? encodeURIComponent(
            details.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
          )
        : "";
      const correctPath = `/movies/${details.id}${slug ? "-" + slug : ""}`;
      if (typeof window !== "undefined" && !rawId.includes("-") && slug) {
        window.history.replaceState(null, "", correctPath);
      }
    }
  }, [details, rawId]);

  // Prevent iframe from redirecting the parent window on mobile/small screens
  useEffect(() => {
    if (!isPlaying) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "Are you sure you want to leave? Your video playback might be interrupted.";
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPlaying]);

  // Handle server reload
  const handleRefresh = () => {
    setIsPlayerLoading(true);
    const iframe = document.getElementById("movvo-movie-iframe") as HTMLIFrameElement;
    if (iframe) {
      const src = iframe.src;
      iframe.src = "";
      setTimeout(() => {
        iframe.src = src;
      }, 50);
    }
  };

  const handleStartPlaying = () => {
    setIsPlaying(true);
    setIsPlayerLoading(true);
    // Smooth scroll to player area
    setTimeout(() => {
      playerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const title = details.title || "Untitled Movie";
  const releaseYear = details.release_date ? new Date(details.release_date).getFullYear() : "N/A";
  const isSaved = isInWatchlist(details.id);

  const toggleWatchlist = () => {
    if (isSaved) {
      removeFromWatchlist(details.id);
    } else {
      addToWatchlist({
        id: details.id,
        title: details.title,
        overview: details.overview,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        media_type: "movie",
        release_date: details.release_date,
        vote_average: details.vote_average,
        vote_count: details.vote_count,
        genre_ids: details.genres.map((g) => g.id),
      });
    }
  };

  const iframeUrl = activeServer === "vidsrc"
    ? `https://vidsrc.to/embed/movie/${id}`
    : `https://vidsrc.cc/v2/embed/movie/${id}`;

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
          {isPlaying ? (
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
                id="movvo-movie-iframe"
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
                  onClick={handleStartPlaying}
                  className="w-20 h-20 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-rose-600/40 cursor-pointer"
                >
                  <Play className="w-9 h-9 fill-white text-white translate-x-0.5" />
                </button>
              </div>

              {/* Floating Meta Details on Banner */}
              <div className="absolute bottom-6 left-6 sm:left-10 right-6 z-10 max-w-xl space-y-2 pointer-events-none">
                {details.tagline && (
                  <p className="text-xs font-semibold text-rose-500 tracking-wider uppercase">
                    {details.tagline}
                  </p>
                )}
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                  {title}
                </h2>
              </div>
            </div>
          )}
        </div>

        {/* Video Player Action Bar */}
        {isPlaying && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-xs text-rose-500 font-semibold uppercase tracking-wider">
                Select Server:
              </span>
              <div className="flex bg-zinc-950 border border-zinc-850 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => {
                    setActiveServer("vidsrc");
                    setIsPlayerLoading(true);
                  }}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeServer === "vidsrccc"
                      ? "bg-rose-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Server 2
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefresh}
                className="px-3.5 py-2 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-zinc-100 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              <button
                onClick={() => setIsPlaying(false)}
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
              {details.runtime && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-zinc-950/60 border border-zinc-850 rounded-lg">
                  <Clock className="w-3 h-3 text-rose-500" />
                  {details.runtime}m
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={handleStartPlaying}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-purple-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                Watch Now
              </button>

              <button
                onClick={toggleWatchlist}
                className={`w-full py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSaved
                    ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
                    : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
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
              <h3 className="text-base font-bold text-zinc-100 border-l-2 border-rose-500 pl-3">Overview</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                {details.overview || "No overview available for this movie."}
              </p>
            </div>

            {/* Genres */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-zinc-100 border-l-2 border-rose-500 pl-3">Genres</h3>
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
                <h3 className="text-base font-bold text-zinc-100 border-l-2 border-rose-500 pl-3">Top Cast</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {cast.map((actor) => (
                    <div key={actor.id} className="flex-shrink-0 w-24 text-center space-y-2 select-none">
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
          </div>
        </div>
      </div>
    </div>
  );
}
