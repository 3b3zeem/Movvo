import { Metadata } from "next";
import { tmdb, getTMDBImageUrl } from "@/lib/tmdb";
import MovieDetailsClient from "./MovieDetailsClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = Number(rawId.split("-")[0]);

  try {
    const details = await tmdb.getDetails("movie", id);
    const title = details.title || "Movie";
    const description = details.overview || "Watch movies online on Movvo.";
    const imageUrl = details.backdrop_path
      ? getTMDBImageUrl(details.backdrop_path, "original")
      : details.poster_path
        ? getTMDBImageUrl(details.poster_path, "w500")
        : "";

    return {
      title: `${title} - Movvo`,
      description,
      openGraph: {
        title: `${title} - Movvo`,
        description,
        type: "video.movie",
        images: imageUrl ? [{ url: imageUrl, alt: title }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} - Movvo`,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata for movie", error);
    return {
      title: "Movie Details - Movvo",
      description: "Watch movies online on Movvo.",
    };
  }
}

export default async function MovieDetailsPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = Number(rawId.split("-")[0]);

  try {
    const [details, credits, recommendationsData] = await Promise.all([
      tmdb.getDetails("movie", id),
      tmdb.getCredits("movie", id),
      tmdb.getRecommendations("movie", id),
    ]);

    const cast = credits.cast.slice(0, 10);
    const recommendations = recommendationsData.results || [];

    return (
      <MovieDetailsClient
        id={id}
        rawId={rawId}
        initialDetails={details}
        initialCast={cast}
        initialRecommendations={recommendations}
      />
    );
  } catch (error: any) {
    console.error("Error loading movie page details", error);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[60vh] space-y-4">
        <p className="text-rose-500 font-semibold">
          {error?.message || "Could not load movie details."}
        </p>
      </div>
    );
  }
}
