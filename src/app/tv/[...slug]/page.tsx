import { Metadata } from "next";
import { tmdb, getTMDBImageUrl } from "@/lib/tmdb";
import TVDetailsClient from "./TVDetailsClient";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rawSeriesId = slug?.[0] || "";
  const id = Number(rawSeriesId.split("-")[0]);

  try {
    const details = await tmdb.getDetails("tv", id);
    const title = details.name || "TV Series";
    let description = details.overview || "Watch TV series online on Movvo.";
    let pageTitle = `${title} - Movvo`;

    const rawEpisodeInfo = slug?.[1] || "";
    const epMatch = rawEpisodeInfo.match(/^s(\d+)e(\d+)/i);
    if (epMatch) {
      const seasonNum = Number(epMatch[1]);
      const episodeNum = Number(epMatch[2]);

      try {
        const seasonData = await tmdb.getSeasonEpisodes(id, seasonNum);
        const episodeData = seasonData.episodes?.find(
          (e) => e.episode_number === episodeNum,
        );
        if (episodeData) {
          pageTitle = `${title} - Season ${seasonNum} Episode ${episodeNum}: ${episodeData.name} - Movvo`;
          description = episodeData.overview || description;
        } else {
          pageTitle = `${title} - Season ${seasonNum} Episode ${episodeNum} - Movvo`;
        }
      } catch {
        pageTitle = `${title} - Season ${seasonNum} Episode ${episodeNum} - Movvo`;
      }
    }

    const imageUrl = details.backdrop_path
      ? getTMDBImageUrl(details.backdrop_path, "original")
      : details.poster_path
        ? getTMDBImageUrl(details.poster_path, "w500")
        : "";

    return {
      title: pageTitle,
      description,
      openGraph: {
        title: pageTitle,
        description,
        type: "video.tv_show",
        images: imageUrl ? [{ url: imageUrl, alt: title }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata for TV show", error);
    return {
      title: "TV Details - Movvo",
      description: "Watch TV series online on Movvo.",
    };
  }
}

export default async function TVShowDetailsPage({ params }: Props) {
  const { slug: slugArray } = await params;
  const rawSeriesId = slugArray?.[0] || "";
  const id = Number(rawSeriesId.split("-")[0]);

  try {
    const [details, credits] = await Promise.all([
      tmdb.getDetails("tv", id),
      tmdb.getCredits("tv", id),
    ]);

    const cast = credits.cast.slice(0, 10);

    // Load initial episodes
    let initialSelectedSeason = 1;
    let initialEpisodes: any[] = [];
    let initialActiveEpisode: { season: number; episode: number } | null = null;
    let initialIsPlaying = false;

    if (details.seasons && details.seasons.length > 0) {
      const firstSeason =
        details.seasons.find((s) => s.season_number > 0) ||
        details.seasons[0];
      initialSelectedSeason = firstSeason.season_number;

      const rawEpisodeInfo = slugArray?.[1] || "";
      const epMatch = rawEpisodeInfo.match(/^s(\d+)e(\d+)/i);
      if (epMatch) {
        initialSelectedSeason = Number(epMatch[1]);
        const activeEpNum = Number(epMatch[2]);
        initialActiveEpisode = {
          season: initialSelectedSeason,
          episode: activeEpNum,
        };
        initialIsPlaying = true;
      }

      // Fetch the episodes for this season on the server side
      const seasonData = await tmdb.getSeasonEpisodes(id, initialSelectedSeason);
      initialEpisodes = seasonData.episodes || [];
    }

    return (
      <TVDetailsClient
        id={id}
        slugArray={slugArray}
        initialDetails={details}
        initialCast={cast}
        initialEpisodes={initialEpisodes}
        initialSelectedSeason={initialSelectedSeason}
        initialActiveEpisode={initialActiveEpisode}
        initialIsPlaying={initialIsPlaying}
      />
    );
  } catch (error: any) {
    console.error("Error loading TV page details", error);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[60vh] space-y-4">
        <p className="text-rose-500 font-semibold">
          {error?.message || "Could not load TV show details."}
        </p>
      </div>
    );
  }
}
