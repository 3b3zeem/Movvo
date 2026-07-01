export function CardSkeleton() {
  return (
    <div className="w-40 sm:w-48 bg-zinc-900/60 border border-zinc-800/40 rounded-2xl p-2 animate-pulse space-y-3 flex-shrink-0">
      <div className="aspect-[2/3] w-full bg-zinc-800 rounded-xl" />
      <div className="space-y-2">
        <div className="h-3 w-3/4 bg-zinc-800 rounded" />
        <div className="flex justify-between">
          <div className="h-2 w-1/4 bg-zinc-800 rounded" />
          <div className="h-2 w-1/4 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="px-6 md:px-8 py-4 space-y-4">
      <div className="h-5 w-40 bg-zinc-800 rounded animate-pulse" />
      <div className="flex gap-4 overflow-x-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SliderSkeleton() {
  return (
    <div className="w-full h-[65vh] sm:h-[80vh] bg-zinc-900/40 animate-pulse relative flex items-end p-12">
      <div className="space-y-4 w-full max-w-xl">
        <div className="h-3 w-20 bg-zinc-800 rounded" />
        <div className="h-10 sm:h-16 w-3/4 bg-zinc-800 rounded" />
        <div className="h-12 w-full bg-zinc-800 rounded" />
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-zinc-800 rounded-xl" />
          <div className="h-10 w-28 bg-zinc-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function HomeSkeleton() {
  return (
    <div className="w-full space-y-6">
      <SliderSkeleton />
      <div className="py-4">
        <RowSkeleton />
        <RowSkeleton />
      </div>
    </div>
  );
}
